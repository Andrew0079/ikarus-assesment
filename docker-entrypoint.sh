#!/bin/bash
set -e

# Configure MSSQL with SA password on first run (required before sqlservr accepts connections).
# See: https://learn.microsoft.com/en-us/sql/linux/sample-unattended-install-ubuntu
if [ -n "${MSSQL_SA_PASSWORD}" ]; then
  echo "Configuring MSSQL instance..."
  ACCEPT_EULA=Y MSSQL_SA_PASSWORD="${MSSQL_SA_PASSWORD}" MSSQL_PID="${MSSQL_PID:-Developer}" \
    /opt/mssql/bin/mssql-conf -n setup accept-eula || true
  echo "MSSQL configuration done."
fi

exec /usr/bin/supervisord -n
