# Edge 反向代理栈（nginx + certbot）

服务器上所有项目共用的「前台」：**在宿主机监听 80/443**，终止 TLS，并将流量反代到接入 **`edge`** 网络的各业务容器（例如 **`react-admin:80`**）。

与旧版 **caddy-docker-proxy** 的差异：路由与证书 **不再** 通过 Docker labels 自动生成，须在 **`nginx/conf.d/`** 内 **显式维护** `server` 配置；每新增一个对外域名，通常新增一份 conf（档 B）并执行一次 **certbot**。

运维脚本集中在 **`scripts/`** 目录（在 edge 根目录执行时需带路径，例如 **`sh ./scripts/setup-https.sh`**）。

## 前置条件

- 域名 **A 记录**（或 AAAA）指向本机公网 IP。
- 本机 **80、443** 未被其他进程占用；若曾运行旧 Caddy edge，需先 **`docker compose down`** 释放端口。
- 业务容器与 **`edge-nginx`** 在同一 Docker 网络 **`edge`** 上，且业务 **`expose`** 了 nginx 要访问的端口（一般为 **80**）。

## 首次部署（顺序重要）

### 1. 拷贝到服务器

将本目录拷到服务器，例如 `/opt/edge`。

```bash
scp -i 你的ssh私钥 -r deploy/edge/ 用户名@服务器IP:/opt
```

### 2. 准备环境变量

```bash
cp .env.example .env
# 编辑 .env：EDGE_DOMAIN、CERTBOT_EMAIL 等
# 后续命令将直接读取这些变量，避免手工替换字符串
```

### 3. 启动 edge 栈（创建 `edge` 网络并启动 nginx）

```bash
cd /opt/edge
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
sh ./scripts/setup-https.sh
```

脚本会自动读取 `.env` 里的 **`EDGE_DOMAIN`** 与 **`CERTBOT_EMAIL`**，并依次执行：

- `certbot certonly` 申请证书
- 复制 `react-admin.conf.https.example` 覆盖 `react-admin.conf`
- 将文件中的 `app.example.com` 替换为 `$EDGE_DOMAIN`
- `nginx -t` 校验并 `nginx -s reload`

如需排查可直接打开脚本：`scripts/setup-https.sh`。

### 6. 启用 HTTPS

仓库内默认 **`react-admin.conf` 为仅 80**（无证书也能启动）。证书签发成功后：

1. `scripts/setup-https.sh` 已自动完成模板覆盖、域名替换、配置校验与重载。
2. 如需手动复核，可再次执行：

```bash
docker compose exec nginx nginx -t
docker compose exec nginx nginx -s reload
```

### 7. 验证

```bash
cd /opt/edge
sh ./scripts/verify-https.sh
```

脚本会读取 `.env` 中的 **`EDGE_DOMAIN`**，对 **HTTP / HTTPS** 各发一次 `HEAD` 请求并打印响应头。

浏览器打开站点，测试 SPA 子路由刷新与 **`/api/`** 接口。

## 手动续期

```bash
cd /opt/edge
sh ./scripts/renew-cert.sh
```

等价于：`certbot renew`（经 compose）成功后 **`nginx -s reload`**（脚本内使用 **`exec -T`**，无终端也可用）。

演练（不修改证书，仅模拟续期流程）：

```bash
cd /opt/edge
sh ./scripts/renew-cert.sh --dry-run
```

## 自动续期（推荐：宿主机定时任务）

**建议把调度放在宿主机**（`cron` 或 **systemd timer**）：定时调用 **`scripts/renew-cert.sh`**，不增加常驻容器，日志与排障都在系统侧完成。

Let’s Encrypt 在证书临近到期时才会真正续签；`certbot renew` 会跳过尚不需要的证书。续签成功后应 **`nginx -s reload`**，否则进程可能仍持有旧文件句柄（视环境而定，reload 最稳妥）。

### 一键写入 cron（推荐）

若你曾用旧路径（例如 **`/opt/edge/renew-cert.sh`**）写过 crontab，升级本目录后请改为 **`/opt/edge/scripts/renew-cert.sh`**，或重新执行一次 **`scripts/install-auto-renew-cron.sh --install`**（会先检测是否已存在同路径条目）。

在 edge 目录执行（**用跑 `docker compose` 的同一 Linux 用户**，且该用户已在 **`docker` 组**内）：

```bash
cd /opt/edge
sh ./scripts/renew-cert.sh --dry-run
sh ./scripts/install-auto-renew-cron.sh --install
```

- 默认 **每天 03:12** 执行一次；默认日志：**`$HOME/logs/edge-certbot-renew.log`**（脚本会创建目录）。
- 自定义时间与日志：

```bash
CRON_SCHEDULE="0 4 * * *" CRON_LOG="/var/log/edge-certbot-renew.log" sh ./scripts/install-auto-renew-cron.sh --install
```

（若日志在 **`/var/log`**，需保证当前用户对该文件可写，或改用 **`$HOME/logs/...`**。）

只查看将写入的内容、不修改 crontab：

```bash
sh ./scripts/install-auto-renew-cron.sh
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
