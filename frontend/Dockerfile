# --- Build Stage ---
FROM node:18 AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# --- Production Stage ---
FROM node:18-slim
WORKDIR /app

# Install only production deps
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy build output
COPY --from=build /app/build ./build
COPY server.js .

# Fly will pass PORT env
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]