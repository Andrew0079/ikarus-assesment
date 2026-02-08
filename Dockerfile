FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# ----------------------
# Base deps (Node 20 for frontend build - apt nodejs is too old for ?? / Vite)
# ----------------------
RUN apt-get update && apt-get install -y \
    curl gnupg2 software-properties-common \
    python3 python3-pip \
    supervisor redis-server \
    && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# ----------------------
# Install MSSQL
# ----------------------
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/ubuntu/22.04/mssql-server-2022.list \
    > /etc/apt/sources.list.d/mssql-server.list && \
    apt-get update && \
    apt-get install -y mssql-server && \
    rm -rf /var/lib/apt/lists/*

ENV ACCEPT_EULA=Y
# Set at runtime (e.g. Railway Variables): MSSQL_SA_PASSWORD, and DATABASE_URL with same password
ENV MSSQL_PID=Developer

# create mssql dirs + permissions
RUN mkdir -p /var/opt/mssql && chown -R mssql:mssql /var/opt/mssql

# ----------------------
# Backend
# ----------------------
WORKDIR /app/backend
COPY backend/ .
RUN pip3 install --no-cache-dir -r requirements.txt

# ----------------------
# Frontend build
# ----------------------
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ .
RUN npm run build

# install serve for frontend
RUN npm install -g serve

# ----------------------
# Supervisor + entrypoint (MSSQL must be configured with mssql-conf setup before sqlservr)
# ----------------------
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENV PORT=5000

EXPOSE 8080 5000 1433 6379

ENTRYPOINT ["/docker-entrypoint.sh"]

