FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install base dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gnupg2 \
    software-properties-common \
    python3 \
    python3-pip \
    nodejs \
    npm \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# ----------------------
# Install MSSQL Server
# ----------------------
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/ubuntu/22.04/mssql-server-2022.list \
    > /etc/apt/sources.list.d/mssql-server.list && \
    apt-get update && \
    apt-get install -y mssql-server && \
    rm -rf /var/lib/apt/lists/*

# MSSQL environment variables
ENV ACCEPT_EULA=Y
ENV MSSQL_SA_PASSWORD=[REDACTED]
ENV MSSQL_PID=Developer

# ----------------------
# Install Redis
# ----------------------
RUN apt-get update && apt-get install -y redis-server && rm -rf /var/lib/apt/lists/*

# ----------------------
# Backend setup
# ----------------------
WORKDIR /app/backend
COPY backend/ .
RUN pip3 install --no-cache-dir -r requirements.txt

# ----------------------
# Frontend setup
# ----------------------
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ .
RUN npm run build

# ----------------------
# Supervisor config
# ----------------------
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create directory for MSSQL data
RUN mkdir -p /var/opt/mssql/data

# Expose ports
EXPOSE 8080 5000 1433 6379

WORKDIR /app

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

