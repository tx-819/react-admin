# Edge 反向代理栈

服务器上所有项目共用的"前台"。**一次性部署，永远在跑**，新增/升级业务项目无需改动这里。

底层用 [caddy-docker-proxy](https://github.com/lucaslorentz/caddy-docker-proxy)：监听 docker 事件，按容器的 `caddy.*` labels 自动生成 Caddy 路由与 TLS 配置。

## 首次设置（服务器执行一次）

```bash
# 1. 把本目录拷到服务器
scp -r deploy/edge user@server:~/edge

# 2. SSH 上去，编辑 Caddyfile 把 email 改成你自己的邮箱
ssh user@server
cd ~/edge
vi Caddyfile

# 3. 启动 edge 栈
docker compose up -d

# 4. 验证：edge 网络已创建、容器在运行
docker network ls | grep edge
docker compose ps
```

## 接入新项目

业务项目侧 `docker-compose.yml` 模板（参考本仓库 react-admin 的 compose）：

```yaml
services:
  web:
    image: <your-image>
    container_name: <project-name>
    expose:
      - "<container-port>"
    labels:
      caddy: ${SSL_DOMAIN}                       # 该项目对外的域名
      caddy.reverse_proxy: "{{upstreams <container-port>}}"
      caddy.encode: gzip
    networks:
      - edge
    restart: unless-stopped

networks:
  edge:
    external: true
    name: edge
```

部署该项目后，edge 容器会自动发现它、签发证书、配置路由。**几秒后** `https://${SSL_DOMAIN}` 即可访问，全程不用 SSH 改任何配置文件。

## 排查

```bash
# edge 当前生成的 Caddy 配置（动态合并 labels 之后）
docker compose exec caddy cat /config/caddy/autosave.json | jq

# 实时日志（看证书签发情况）
docker compose logs -f caddy

# 手动重新加载（极少需要，labels 变更会自动触发）
docker compose exec caddy caddy reload --config /config/caddy/Caddyfile
```

## 升级 Caddy

```bash
cd ~/edge
docker compose pull
docker compose up -d
```

证书数据存放在名为 `edge_caddy_data` 的 docker volume 里，重启/升级不会丢。
