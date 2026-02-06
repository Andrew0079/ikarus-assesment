"""Create MSSQL database if it does not exist. Run before alembic when using MSSQL."""
import os
import sys
import time

# Load env before importing config (which may require DATABASE_URL)
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL or "mssql" not in DATABASE_URL:
    sys.exit(0)

# Parse URL: mssql+pymssql://user:password@host:port/database
try:
    from sqlalchemy.engine import make_url

    url = make_url(DATABASE_URL)
except Exception:
    sys.exit(0)

db_name = url.database
if not db_name or not db_name.replace("_", "").replace("-", "").isalnum():
    sys.exit(0)

import pymssql

# Wait for SQL Server to be ready (e.g. in Docker)
for attempt in range(30):
    try:
        conn = pymssql.connect(
            server=url.host,
            user=url.username,
            password=url.password,
            database="master",
            port=url.port or 1433,
            login_timeout=5,
        )
        break
    except pymssql.Error:
        if attempt == 29:
            raise
        time.sleep(2)
else:
    conn = None
if conn is None:
    raise RuntimeError("Could not connect to MSSQL")
conn.autocommit(True)
cur = conn.cursor()
# Identifier safe: alphanumeric/underscore/hyphen; bracket-escape for T-SQL
safe_name = db_name.replace("]", "]]")
sql = (
    "IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = %s) "
    "CREATE DATABASE [%s]" % (safe_name,)
)
cur.execute(sql, (db_name,))
conn.close()
print(f"Database {db_name!r} ready.", file=sys.stderr)
