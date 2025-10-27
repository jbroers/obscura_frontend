FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG BACKEND_URL
RUN npm run build

RUN mkdir -p public && echo "{\"backendUrl\": \"${BACKEND_URL}\"}" > public/config.json

EXPOSE 3000
CMD ["npm", "run", "start"]
