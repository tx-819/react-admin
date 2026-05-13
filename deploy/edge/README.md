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

仓库内默认 **`react-admin.conf` 为仅 80**（无证书也能启动）。证书签发成功后：

1. 将 **`nginx/conf.d/react-admin.conf.https.example`** 复制为 **`nginx/conf.d/react-admin.conf`**（覆盖），并把文件中 **三处** `app.example.com` 全部改为你的 **`certbot -d` 域名**（须与 `live/<域名>/` 目录名一致）。
2. 校验并重载：

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
