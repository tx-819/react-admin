# 边缘 nginx 替代 Caddy（HTTPS / 证书 / 反代）实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 用 `deploy/edge` 下的 **nginx** 替代 **caddy-docker-proxy**，在宿主机边界提供 **80/443**、**Let’s Encrypt 证书（HTTP-01 + webroot）**，并将 HTTPS 流量反代到 **`edge` 网络上 `react-admin:80`**；根目录业务 `docker-compose.yml` 去掉 **`caddy.*` labels**。

**架构：** 边缘 **nginx** 与业务容器共用 Docker 网络 **`edge`（name: `edge`）**；nginx 挂载 **证书卷**、`certbot` **webroot 卷** 与 **配置目录**。首次部署仅 **监听 80**（签发 ACME + 反代）；证书签发完成后，将站点配置 **全文替换** 为 **80（ACME + 301 跳 HTTPS）+ 443（TLS + 反代）**。证书申请与续期使用 **`certbot/certbot` 一次性 `docker compose run`**（不常驻 certbot 循环容器，减少噪音）。**`edge` 网络**：由 **`deploy/edge/docker-compose.yml` 创建**（与当前 Caddy 栈一致，`networks.edge` **不设** `external: true`）；根目录业务 compose 继续 **`edge: external: true`**，故 **须先启动 edge 栈** 再 `docker compose up` 业务。

**技术栈：** Docker Compose v2、`nginx:1.27-alpine`、`certbot/certbot`、Let’s Encrypt HTTP-01。

**规格：** `docs/superpowers/specs/2026-05-13-edge-nginx-tls-design.md`

---

## 文件映射

| 文件 | 职责 |
|------|------|
| `deploy/edge/docker-compose.yml` | 定义 **nginx**（端口映射、卷、`edge` 网络）与 **`certbot` 服务**（仅用于 `docker compose run --rm certbot`，无 `ports`、默认不常驻业务逻辑）。 |
| `deploy/edge/nginx/conf.d/react-admin.conf` | 任务 1：仅 **80**（ACME webroot + 反代）。任务 6：**全文替换** 为 **80（ACME + 301）+ 443（TLS + 反代）**。 |
| `deploy/edge/.env.example` | 示例：`EDGE_DOMAIN`、`UPSTREAM_HOST`、`UPSTREAM_PORT`、`CERTBOT_EMAIL`（供 README 与手动 `docker compose run` 引用）。 |
| `deploy/edge/Caddyfile` | **删除**（避免与 Caddy 混淆）。 |
| `deploy/edge/README.md` | 中文：首次部署、`edge` 网络顺序、签发、续期、`nginx -t`、档 B 扩展方式、回滚。 |
| `docker-compose.yml`（仓库根） | 移除 **`caddy.*` labels**；注释改为「由 ~/edge 的 nginx 反代」；**保留** `expose: 80`、`BACKEND_UPSTREAM`、`edge` external。 |

**本计划不修改：** `Dockerfile`、`nginx/default.conf.template`（应用内反代 `/api/` 不变）。

**约定：** 以下配置中 **`app.example.com`** 仅为占位；部署时在服务器 `deploy/edge/.env` 写 `EDGE_DOMAIN=真实域名`，并把配置里 **`server_name`** 与 **`ssl_certificate` 路径中的目录名** 与 `EDGE_DOMAIN` 保持一致（Let’s Encrypt live 目录名等于 `-d` 的主名，单域名时与 `EDGE_DOMAIN` 相同）。

---

### 任务 1：边缘 HTTP-only 站点配置

**文件：**
- 创建：`deploy/edge/nginx/conf.d/react-admin.conf`

- [x] **步骤 1：写入仅 80 的配置（无 SSL）**

将下列内容 **原样** 写入 `deploy/edge/nginx/conf.d/react-admin.conf`（把 `app.example.com` 换成你的 `EDGE_DOMAIN`，或保持占位并在服务器 sed 替换一次）。**`map` 必须在所有 `server` 之前**：

```nginx
# 阶段一：仅 HTTP — 用于首次 certbot webroot 签发。任务 6 再替换为含 443 的最终版。
map $http_upgrade $connection_upgrade {
  default upgrade;
  ''      close;
}

server {
  listen 80;
  server_name app.example.com;

  location /.well-known/acme-challenge/ {
    root /var/www/certbot;
  }

  location / {
    proxy_pass http://react-admin:80;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
  }
}
```

- [x] **步骤 2：本地校验语法（可选，需本机有 nginx 或容器）**

运行：

```bash
docker run --rm -v "$(pwd)/deploy/edge/nginx/conf.d:/etc/nginx/conf.d:ro" nginx:1.27-alpine nginx -t -c /etc/nginx/nginx.conf
```

说明：官方默认主配置会 `include /etc/nginx/conf.d/*.conf`，若报错缺少 `events` 块，可改用：

```bash
docker run --rm nginx:1.27-alpine sh -c 'echo "events{} http{ include /etc/nginx/conf.d/*.conf; }" > /tmp/ng.conf && nginx -t -c /tmp/ng.conf'
```

（将 `deploy/edge/nginx/conf.d` 挂载到容器内对应路径再执行 `nginx -t`。）

预期：`syntax is ok` / `test is successful`。

- [x] **步骤 3：Commit**

```bash
git add deploy/edge/nginx/conf.d/react-admin.conf
git commit -m "feat(edge): add HTTP-only nginx site for ACME and upstream proxy"
```

---

### 任务 2：边缘 `docker-compose.yml`（nginx + 卷 + edge 网络）

**文件：**
- 修改：`deploy/edge/docker-compose.yml`（全文替换）

- [x] **步骤 1：替换 compose 内容**

将 `deploy/edge/docker-compose.yml` **全文替换**为：

```yaml
# Edge 栈：宿主机边界 nginx（TLS 终结 + 反代）。先启动本栈以创建 docker 网络 edge。
# 业务项目 compose 中 edge 应为 external: true，故依赖本目录先 docker compose up -d。
services:
  nginx:
    image: nginx:1.27-alpine
    container_name: edge-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - certbot_www:/var/www/certbot
      - certbot_conf:/etc/letsencrypt:ro
    networks:
      - edge
    restart: unless-stopped

  certbot:
    image: certbot/certbot:v2.11.0
    restart: "no"
    volumes:
      - certbot_www:/var/www/certbot
      - certbot_conf:/etc/letsencrypt

networks:
  edge:
    name: edge

volumes:
  certbot_www:
  certbot_conf:
```

说明：**`certbot` 与 `nginx` 共享同名卷**；`certbot` 容器对 `/etc/letsencrypt` **可写**，`nginx` 对该卷为 **`:ro`** 足够读取已签发证书。证书更新后执行 **`nginx -s reload`**（或 `docker compose restart nginx`）使进程重新打开文件。

- [x] **步骤 2：Compose 配置校验**

在 `deploy/edge` 目录执行：

```bash
cd deploy/edge && docker compose config -q
```

预期：无输出，退出码 **0**。

- [x] **步骤 3：Commit**

```bash
git add deploy/edge/docker-compose.yml
git commit -m "feat(edge): replace caddy-docker-proxy with nginx, certbot service, and volumes"
```

---

### 任务 3：环境变量示例与删除 Caddyfile

**文件：**
- 创建：`deploy/edge/.env.example`
- 删除：`deploy/edge/Caddyfile`

- [x] **步骤 1：写入 `.env.example`**

```dotenv
# 公网域名（与 nginx server_name、certbot -d 一致）
EDGE_DOMAIN=app.example.com

# 业务容器名（在 edge 网络上可解析）
UPSTREAM_HOST=react-admin
UPSTREAM_PORT=80

# Let's Encrypt 账号邮箱（certbot --email）
CERTBOT_EMAIL=admin@example.com
```

- [x] **步骤 2：删除 `deploy/edge/Caddyfile`**

```bash
rm -f deploy/edge/Caddyfile
```

- [x] **步骤 3：Commit**

```bash
git add deploy/edge/.env.example && git add -u deploy/edge/Caddyfile
git commit -m "chore(edge): add .env.example and remove Caddyfile"
```

---

### 任务 4：根目录业务 compose — 移除 Caddy labels

**文件：**
- 修改：`docker-compose.yml`

- [x] **步骤 1：替换为无 labels 版本**

将 `docker-compose.yml` **全文替换**为：

```yaml
# 服务器侧 compose：与 workflow 写入的 .env 配合（DOCKER_IMAGE、BACKEND_UPSTREAM 等）。
# 本服务不绑定宿主机端口；由 ~/edge/ 的 nginx 将 80/443 反代到本容器 expose 的 80。
# 域名与 TLS 在 deploy/edge 中配置；业务侧仅需接入 edge 网络并保持容器名稳定（如 react-admin）。
services:
  web:
    image: ${DOCKER_IMAGE}
    container_name: react-admin
    expose:
      - "80"
    environment:
      # 后端 API 上游地址，由应用内 nginx 反向代理使用。
      # 形如 http://<后端容器名>:<端口>，例如 http://backend:8000
      # 后端容器需要同样加入 edge 网络才能用容器名互通。
      BACKEND_UPSTREAM: ${BACKEND_UPSTREAM}
    networks:
      - edge
    restart: unless-stopped

networks:
  edge:
    external: true
    name: edge
```

- [x] **步骤 2：Compose 校验（在项目根目录，需有 `.env` 或导出 `DOCKER_IMAGE`）**

```bash
export DOCKER_IMAGE=nginx:alpine
docker compose config -q
```

预期：退出码 **0**。

- [x] **步骤 3：Commit**

```bash
git add docker-compose.yml
git commit -m "feat(compose): drop caddy labels; rely on edge nginx for TLS"
```

---

### 任务 5：README（中文）— 签发、续期、验证、档 B 扩展

**文件：**
- 修改：`deploy/edge/README.md`（全文替换为中文）

- [x] **步骤 1：写入 README**

内容须 **至少** 包含以下可操作段落（可直接粘贴为文件正文并润色标题层级）：

1. **目录用途**：`~/edge` 为共享入口；与旧 Caddy 区别为 **手动维护** `nginx/conf.d`。
2. **前置**：域名 **A 记录** 指向本机；本机 **80/443** 未被其他进程占用。
3. **启动顺序**：在 `deploy/edge` 执行 `docker compose up -d` → 确认 `docker network ls | grep '\bedge\b'` → 再启动业务 compose。
4. **首次签发（HTTP-01 + webroot）**（在 `deploy/edge`，`docker-compose.yml` 已含 **`certbot` 服务**；已加载任务 1 的 HTTP-only 配置且 **nginx** 已启动）：

```bash
cd ~/edge
# 将 app.example.com 换成 EDGE_DOMAIN；邮箱换成 CERTBOT_EMAIL
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d app.example.com \
  --email admin@example.com \
  --agree-tos --non-interactive
```

5. **签发后**：执行任务 6 更新 `react-admin.conf` → `docker compose exec nginx nginx -s reload`。
6. **续期**：

```bash
docker compose run --rm certbot renew
docker compose exec nginx nginx -s reload
```

7. **验证**：`curl -I http://app.example.com` → 301 到 https（任务 6 后）；`curl -I https://app.example.com`。
8. **档 B 扩展**：新增 `nginx/conf.d/other-site.conf`，新 `server_name` 与新 `proxy_pass` 上游；**每域名单独** `certbot certonly -d other.example.com`（或同一证书 **SAN** 需在 certbot 与 nginx `server_name` 同步规划）。
9. **回滚**：停 nginx，恢复旧 Caddy compose（若仍保留备份）；业务 compose 可暂时加回 caddy labels（需与规格外流程自行一致）。
10. **`docker compose up -d` 与 certbot 容器**：`certbot` 服务使用 **`restart: "no"`**，`up -d` 后可能处于 **Exited** 状态，**属预期**；日常仅使用 **`docker compose run --rm certbot`** 即可。

- [x] **步骤 2：Commit**

```bash
git add deploy/edge/README.md
git commit -m "docs(edge): Chinese README for nginx TLS, certbot, and operations"
```

---

### 任务 6：启用 HTTPS — 替换站点配置全文

**前置：** 已按 README 完成 **certbot certonly** 且成功，`/etc/letsencrypt/live/app.example.com/` 存在于 **certbot_conf** 卷内（路径名与 **实际域名** 一致）。

**文件：**
- 修改：`deploy/edge/nginx/conf.d/react-admin.conf`

- [x] **步骤 1：将 `react-admin.conf` 全文替换为下列配置**

把文中两处 **`app.example.com`** 全部替换为你的 **`EDGE_DOMAIN`**（须与 `certbot -d` 一致）：

```nginx
map $http_upgrade $connection_upgrade {
  default upgrade;
  ''      close;
}

server {
  listen 80;
  server_name app.example.com;

  location /.well-known/acme-challenge/ {
    root /var/www/certbot;
  }

  location / {
    return 301 https://$host$request_uri;
  }
}

server {
  listen 443 ssl;
  http2 on;
  server_name app.example.com;

  ssl_certificate     /etc/letsencrypt/live/app.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/app.example.com/privkey.pem;
  ssl_protocols       TLSv1.2 TLSv1.3;

  location / {
    proxy_pass http://react-admin:80;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
  }
}
```

- [x] **步骤 2：reload nginx**

```bash
cd deploy/edge
docker compose exec nginx nginx -t
docker compose exec nginx nginx -s reload
```

预期：`nginx -t` **syntax ok**；reload 无报错。

- [x] **步骤 3：Commit**

```bash
git add deploy/edge/nginx/conf.d/react-admin.conf
git commit -m "feat(edge): enable HTTPS redirect and TLS upstream headers"
```

---

### 任务 7：联调验收（规格 §10）

- [ ] **步骤 1：HTTP 挑战路径可达**

```bash
curl -I "http://<EDGE_DOMAIN>/"
```

任务 6 后预期：**301** 至 `https://`。

- [ ] **步骤 2：HTTPS 与证书**

```bash
curl -I "https://<EDGE_DOMAIN>/"
```

预期：**200** 或 **304**；浏览器无证书警告。

- [ ] **步骤 3：SPA 与 `/api/`**

浏览器打开站点，刷新子路由；调用一条 **需登录**、一条 **匿名** `/api/` 接口，确认 **200**（仍经应用内 nginx → `BACKEND_UPSTREAM`）。

- [ ] **步骤 4：续期演练**

```bash
cd deploy/edge
docker compose run --rm certbot renew --dry-run
```

预期：命令退出码 **0**。

- [ ] **步骤 5：记录结果**

全部通过则无需额外 commit；否则修复配置后单开 commit。

---

## 附录：`deploy/edge/README.md` 推荐全文（任务 5 步骤 1 可直接存为文件）

```markdown
# Edge 反向代理栈（nginx + certbot）

服务器上所有项目共用的「前台」：**在宿主机监听 80/443**，终止 TLS，并将流量反代到接入 **`edge`** 网络的各业务容器（例如 **`react-admin:80`**）。

与旧版 **caddy-docker-proxy** 的差异：路由与证书 **不再** 通过 Docker labels 自动生成，须在 **`nginx/conf.d/`** 内 **显式维护** `server` 配置；每新增一个对外域名，通常新增一份 conf（档 B）并执行一次 **certbot**。

## 前置条件

- 域名 **A 记录**（或 AAAA）指向本机公网 IP。
- 本机 **80、443** 未被其他进程占用；若曾运行旧 Caddy edge，需先 **`docker compose down`** 释放端口。
- 业务容器与 **`edge-nginx`** 在同一 Docker 网络 **`edge`** 上，且业务 **`expose`** 了 nginx 要访问的端口（一般为 **80**）。

## 首次部署（顺序重要）

### 1. 拷贝到服务器

将本目录拷到服务器，例如 `~/edge`。

### 2. 准备环境变量（可选）

```bash
cp .env.example .env
# 编辑 .env：EDGE_DOMAIN、CERTBOT_EMAIL 等；nginx 配置中的 server_name 须与 EDGE_DOMAIN 一致
```

### 3. 启动 edge 栈（创建 `edge` 网络并启动 nginx）

```bash
cd ~/edge
docker compose up -d
docker network ls | grep '\bedge\b'
docker compose ps
```

说明：**`certbot` 服务**在 `docker compose up -d` 后可能显示为 **Exited**，且 **`restart: "no"`**，这是预期现象；日常请使用 **`docker compose run --rm certbot`**。

### 4. 启动业务项目

在业务仓库目录（已配置 **`networks.edge.external: true`**）：

```bash
docker compose up -d
```

确认业务容器名（如 **`react-admin`**）与 **`nginx/conf.d/react-admin.conf`** 中的 **`proxy_pass`** 一致。

### 5. 首次申请证书（HTTP-01 + webroot）

确保 **`nginx/conf.d/react-admin.conf`** 仍为 **仅监听 80** 的版本（含 **`/.well-known/acme-challenge/`**）。

```bash
cd ~/edge
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d "你的域名" \
  --email "你的邮箱" \
  --agree-tos --non-interactive
```

成功后，卷 **`certbot_conf`** 内会出现 **`/etc/letsencrypt/live/你的域名/`**。

### 6. 启用 HTTPS

按实现计划 **任务 6**，将 **`nginx/conf.d/react-admin.conf`** 全文替换为 **含 443 与 301** 的最终版本（`ssl_certificate` 路径中的目录名须与上一步 **`-d`** 的主名一致）。

```bash
docker compose exec nginx nginx -t
docker compose exec nginx nginx -s reload
```

### 7. 验证

```bash
curl -I "http://你的域名/"
curl -I "https://你的域名/"
```

浏览器打开站点，测试 SPA 子路由刷新与 **`/api/`** 接口。

## 续期

```bash
cd ~/edge
docker compose run --rm certbot renew
docker compose exec nginx nginx -s reload
```

演练：

```bash
docker compose run --rm certbot renew --dry-run
```

## 档 B：同一宿主机多站点

1. 在 **`nginx/conf.d/`** 新增 **`other-site.conf`**：新的 **`server_name`** 与 **`proxy_pass http://其他容器:端口;`**。
2. 为新域名执行 **`certbot certonly -d 其他域名 ...`**（或规划 **SAN** 证书并在 nginx 中同步 **`server_name`**）。
3. **`nginx -t`** 后 **`nginx -s reload`**。

## 排障

```bash
docker compose logs nginx
docker compose exec nginx nginx -t
```

查看当前加载的配置文件目录：`./nginx/conf.d`（挂载为容器内 **`/etc/nginx/conf.d`**）。

## 回滚

停止本栈、恢复旧 **Caddy / caddy-docker-proxy** 的 compose 与数据卷（若仍保留备份）。业务侧若临时恢复 **`caddy.*` labels** 需自行与旧栈对齐，不在本仓库规格范围内。
```

---

## 计划自检（对照规格）

| 规格章节 | 对应任务 |
|----------|----------|
| §1 目标（nginx 80/443、证书、反代、edge 网络） | 任务 2、6、7 |
| §2 非目标（/api 仍在应用内） | 任务 4 不碰 `nginx/default.conf.template` |
| §3 架构切换 | 任务 2、4、6 |
| §4 档 A/B | README 任务 5（档 B 扩展） |
| §5 TLS / 续期 | 任务 5、6、7 |
| §6 边缘转发头 | 任务 1、6 中 `X-Forwarded-Proto` |
| §7 仓库改动 | 任务 1～6 文件映射 |
| §8 迁移 | README 任务 5 |
| §9 风险 | README 回滚 + 任务 6 证书路径与域名一致 |
| §10 验证 | 任务 7 |

**占位符扫描：** 域名使用 `app.example.com` 为 **可复制模板**，README 要求替换为真实 `EDGE_DOMAIN`；**非**「待定/TODO」类空块。

**一致性：** `UPSTREAM_HOST` 默认 **react-admin** 与根 `docker-compose.yml` 的 `container_name` 一致；若改名须同步 `react-admin.conf` 内 `proxy_pass`。

---

**计划已完成并保存到 `docs/superpowers/plans/2026-05-13-edge-nginx-tls.md`。两种执行方式：**

1. **子代理驱动（推荐）** — 每个任务调度一个新子代理，任务间审查，迭代快  
2. **内联执行** — 在当前会话中使用 executing-plans 执行任务，批量执行并设有检查点  

**选哪种方式？**
