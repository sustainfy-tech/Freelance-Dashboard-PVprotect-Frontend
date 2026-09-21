# ============================================================
# BUILD STAGE
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .

# ------------------------------------------------------------
# Vite environment variable
# IMPORTANT:
# Vite variables must exist during `npm run build`
# ------------------------------------------------------------
ARG VITE_APP_SERVER_BASE_URL

ENV VITE_APP_SERVER_BASE_URL=$VITE_APP_SERVER_BASE_URL

# Fail the build if the API URL was not provided
RUN if [ -z "$VITE_APP_SERVER_BASE_URL" ]; then \
    echo "ERROR: VITE_APP_SERVER_BASE_URL is not set"; \
    exit 1; \
    fi

RUN echo "VITE_APP_SERVER_BASE_URL is configured"

# Build Vite application
RUN npm run build


# ============================================================
# PRODUCTION STAGE
# ============================================================
FROM node:22-alpine

WORKDIR /app

# Install static file server
RUN npm install -g serve

# Copy built frontend
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]