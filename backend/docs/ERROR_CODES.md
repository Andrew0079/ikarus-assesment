# API Error Codes Reference

All API errors follow a consistent JSON format:

```json
{
  "code": "error_code",
  "message": "Human-readable error message"
}
```

## HTTP Status Codes

| Status | Meaning | When Used |
|--------|---------|-----------|
| 200 | OK | Successful GET, PUT requests |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input, validation errors |
| 401 | Unauthorized | Missing or invalid authentication |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., username taken) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

---

## Error Codes by Category

### Authentication Errors (401)

#### `unauthorized`
**Message**: "Missing Authorization Header"  
**Cause**: No `Authorization` header in request  
**Solution**: Include `Authorization: Bearer <token>` header

**Example**:
```json
{
  "code": "unauthorized",
  "message": "Missing Authorization Header"
}
```

#### `token_expired`
**Message**: "Token has expired"  
**Cause**: JWT token is older than 15 minutes (default)  
**Solution**: Login again to get a new token

#### `invalid_token`
**Message**: "Invalid token"  
**Cause**: Malformed or tampered JWT token  
**Solution**: Login again to get a valid token

---

### Validation Errors (400)

#### `validation_error`
**Message**: Varies based on validation failure  
**Cause**: Input data doesn't meet requirements  
**Solution**: Fix input according to validation rules

**Common validation messages**:
- "Username is required"
- "Username must be at least 3 characters"
- "Username must be at most 80 characters"
- "Username can only contain letters, numbers, underscores, and hyphens"
- "Email is required"
- "Email must be at most 120 characters"
- "Invalid email format"
- "Password must be at least 8 characters"
- "Password must contain at least one letter and one number"

**Example**:
```json
{
  "code": "validation_error",
  "message": "Password must be at least 8 characters"
}
```

#### `bad_request`
**Message**: Varies  
**Cause**: Malformed request body or missing required fields  
**Solution**: Check request format and required fields

**Example**:
```json
{
  "code": "bad_request",
  "message": "Invalid JSON in request body"
}
```

---

### Authentication Business Logic Errors (400)

#### `invalid_credentials`
**Message**: "Invalid username/email or password"  
**Cause**: Login credentials don't match any user  
**Solution**: Check username/email and password

**Example**:
```json
{
  "code": "invalid_credentials",
  "message": "Invalid username/email or password"
}
```

#### `username_taken`
**Message**: "Username already taken"  
**Cause**: Registration with existing username  
**Solution**: Choose a different username

#### `email_taken`
**Message**: "Email already taken"  
**Cause**: Registration with existing email  
**Solution**: Use a different email or login if you already have an account

---

### Resource Errors (404)

#### `not_found`
**Message**: "Zone not found" (or other resource)  
**Cause**: Requested resource doesn't exist or doesn't belong to user  
**Solution**: Check resource ID and ensure you have access

**Example**:
```json
{
  "code": "not_found",
  "message": "Zone not found"
}
```

---

### Conflict Errors (409)

#### `duplicate_zone`
**Message**: "You already have a zone for this city"  
**Cause**: Attempting to create a zone for a city+country combination that already exists for the user  
**Solution**: Update the existing zone instead of creating a new one

**Example**:
```json
{
  "code": "duplicate_zone",
  "message": "You already have a zone for this city"
}
```

---

### Rate Limiting Errors (429)

#### `rate_limit_exceeded`
**Message**: "Too many requests. Please try again later."  
**Cause**: Exceeded rate limit (60 req/min global, 10 req/min for auth)  
**Solution**: Wait before making more requests

**Response Headers**:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

**Example**:
```json
{
  "code": "rate_limit_exceeded",
  "message": "Too many requests. Please try again later."
}
```

---

### Server Errors (500)

#### `internal_error`
**Message**: "An internal error occurred"  
**Cause**: Unexpected server error (database connection, etc.)  
**Solution**: Retry request; contact support if persists

**Example**:
```json
{
  "code": "internal_error",
  "message": "An internal error occurred"
}
```

---

## Error Handling Best Practices

### For Frontend Developers

1. **Always check HTTP status code first**
   ```javascript
   if (!response.ok) {
     const error = await response.json();
     console.error(`Error ${error.code}: ${error.message}`);
   }
   ```

2. **Handle specific error codes**
   ```javascript
   if (error.code === 'token_expired') {
     // Redirect to login
   } else if (error.code === 'validation_error') {
     // Show validation message to user
   }
   ```

3. **Display user-friendly messages**
   - Use `error.message` for user-facing errors
   - Log `error.code` for debugging

4. **Retry logic for 429 errors**
   ```javascript
   if (response.status === 429) {
     const resetTime = response.headers.get('X-RateLimit-Reset');
     // Wait until resetTime before retrying
   }
   ```

### For Backend Developers

1. **Always return consistent error format**
   ```python
   return {"code": "error_code", "message": "User message"}, status_code
   ```

2. **Log errors with context**
   ```python
   current_app.logger.error(f"Error processing request: {error}", extra={
       "user_id": user_id,
       "request_id": request_id
   })
   ```

3. **Never expose sensitive information**
   - Don't include stack traces in production
   - Don't reveal database schema details
   - Use generic messages for security-sensitive errors

---

## Testing Error Handling

### Example: Test Invalid Login

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"wrong","password":"wrong"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected Response** (400):
```json
{
  "code": "invalid_credentials",
  "message": "Invalid username/email or password"
}
```

### Example: Test Missing Auth Token

```bash
curl http://localhost:5001/api/zones \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected Response** (401):
```json
{
  "code": "unauthorized",
  "message": "Missing Authorization Header"
}
```

### Example: Test Rate Limiting

```bash
# Send 11 requests quickly to auth endpoint
for i in {1..11}; do
  curl -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"login":"test","password":"test"}' &
done
wait
```

**Expected**: 11th request returns 429 with `rate_limit_exceeded`

