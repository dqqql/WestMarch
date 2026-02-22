# 西征冒险公会 - 部署指南

本指南将帮助你在服务器上部署西征冒险公会项目。

## 前置要求

服务器需要安装以下软件：
- Docker
- Docker Compose

## 部署步骤

1. 上传 `westmarch.zip` 到服务器
2. 解压文件：
   ```bash
   unzip westmarch.zip -d westmarch
   cd westmarch
   ```

3. 构建并启动 Docker 容器：
   ```bash
   docker-compose up -d --build
   ```

4. 初始化数据库（首次部署时执行）：
   ```bash
   docker-compose exec westmarch npx prisma db push
   ```

5. 访问应用：
   - 本地访问：http://localhost:3000
   - 公网访问：配置服务器防火墙和反向代理后，通过你的域名或服务器IP访问

## 常用命令

查看日志：
```bash
docker-compose logs -f
```

停止服务：
```bash
docker-compose down
```

重启服务：
```bash
docker-compose restart
```

## 公网访问配置

要在公网访问，你需要：

1. 确保服务器防火墙开放 3000 端口（或你配置的其他端口）
2. 可选：配置 Nginx 或其他反向代理
3. 可选：配置 SSL 证书（如使用 Let's Encrypt）

### 简单的 Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
