# --- Build Stage ---
FROM node:18 AS builder
WORKDIR /app

ARG REACT_APP_API_BASE
ENV REACT_APP_API_BASE=$REACT_APP_API_BASE

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Production Stage ---
FROM node:18-slim
WORKDIR /app

# Install only production deps
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy build output from builder stage
COPY --from=builder /app/build ./build
COPY server.js .

# Fly sets PORT dynamically
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]