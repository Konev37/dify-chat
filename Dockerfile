FROM --platform=linux/amd64 node:18-alpine

WORKDIR /app

# 复制 package.json 和 pnpm 配置文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 安装特定版本的 pnpm
RUN npm install -g pnpm

# 复制所有源代码
COPY . .

# 构建项目
RUN pnpm install
RUN pnpm build

# 暴露端口(Rsbuild默认是5173，可能需要根据您的实际配置调整)
EXPOSE 5173

# 运行预览服务
CMD ["pnpm", "preview", "--host", "0.0.0.0"]
