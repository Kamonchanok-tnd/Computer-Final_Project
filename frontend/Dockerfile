FROM node:22-alpine  

WORKDIR /app

COPY package.json package-lock.json ./

COPY . .

EXPOSE 5173

RUN npm install

RUN npm run build

COPY --from=builder /app/dist .