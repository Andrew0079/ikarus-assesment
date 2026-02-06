"""Security handlers for Connexion OpenAPI security schemes.

Connexion validates security schemes defined in openapi.yaml.
These handlers are called by Connexion BEFORE the request reaches Flask.
Actual JWT validation is done by Flask-JWT-Extended @jwt_required() decorators.
"""


def bearer_auth(token):
    """
    Dummy bearer token validator for Connexion.
    
    Connexion calls this function when a request has `security: [{ bearerAuth: [] }]`.
    We return a dummy dict to pass Connexion's validation.
    The actual JWT validation happens in Flask-JWT-Extended @jwt_required() decorators.
    
    Args:
        token: The bearer token from the Authorization header
        
    Returns:
        dict: Dummy user info (Connexion requires a return value)
    """
    # Just pass through - Flask-JWT-Extended will do the real validation
    return {"sub": "user"}

