"""Debug script to see what routes are registered."""
from app import create_app

cnx = create_app()
flask_app = cnx.app

print("\n=== Registered Routes ===")
for rule in flask_app.url_map.iter_rules():
    print(f"{rule.methods} {rule.rule} -> {rule.endpoint}")
print("=========================\n")

