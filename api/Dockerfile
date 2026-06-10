FROM node:20-alpine
WORKDIR /app
RUN npm install ws@8 tsx@4 typescript@5
COPY api/ ./
EXPOSE 3001
CMD ["npx", "tsx", "server.ts"]
