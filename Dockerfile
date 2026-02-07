FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# ----------------------
# Base deps
# ----------------------
RUN apt-get update && apt-get install -y \
    curl gnupg2 software-properties-common \
    python3 python3-pip \
    nodejs npm \
    supervisor redis-server \
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
ENV MSSQL_SA_PASSWORD=[REDACTED]
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
# Supervisor
# ----------------------
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 8080 5000 1433 6379

CMD ["/usr/bin/supervisord", "-n"]

