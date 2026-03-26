FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache curl

FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/package.json ./
RUN mkdir -p logs && addgroup -S camaron && adduser -S camaron -G camaron
RUN chown -R camaron:camaron /app
USER camaron
EXPOSE 4000
CMD ["node", "src/server.js"]
