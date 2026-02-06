# Security Considerations

This document outlines the security measures implemented in the Weather App backend and recommendations for production deployment.

## Authentication & Authorization

### Password Security
- **Hashing**: bcrypt with automatic salt generation (cost factor 12)
- **Password Policy**: Minimum 8 characters, must contain at least one letter and one number
- **Storage**: Only password hashes are stored, never plaintext passwords
- **Validation**: Enforced at service layer before database operations

### JWT Tokens
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiration**: 15 minutes by default (configurable via `JWT_ACCESS_TOKEN_EXPIRES`)
- **Secret Key**: Must be set via `JWT_SECRET_KEY` environment variable
  - **CRITICAL**: Application will fail to start in production if using default value
  - Generate strong secret: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- **Storage**: Client-side (localStorage or httpOnly cookies recommended)
- **Transmission**: Bearer token in Authorization header

### User Isolation
- **Authorization**: All user-scoped resources (weather zones) are filtered by `user_id`
- **IDOR Prevention**: Database queries include user ownership checks
- **Example**: `WeatherZone.query.filter(WeatherZone.id == zone_id, WeatherZone.user_id == user_id)`

## Input Validation

### Username
- **Length**: 3-80 characters
- **Allowed Characters**: Letters, numbers, underscores, hyphens
- **Pattern**: `^[a-zA-Z0-9_-]{3,80}$`
- **Uniqueness**: Enforced at database level with unique index

### Email
- **Format**: RFC 5322 compliant pattern
- **Pattern**: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- **Normalization**: Converted to lowercase before storage
- **Uniqueness**: Enforced at database level with unique index
- **Length**: Maximum 120 characters

### Password
- **Minimum Length**: 8 characters
- **Complexity**: At least one letter and one number
- **Pattern**: `^(?=.*[A-Za-z])(?=.*\d).{8,}$`
- **Future Enhancement**: Consider adding uppercase and special character requirements

## Rate Limiting

### Default Limits
- **Global**: 60 requests per minute per IP (configurable via `RATELIMIT_DEFAULT`)
- **Auth Endpoints**: 10 requests per minute per IP (login, register)
- **Purpose**: Prevent brute-force attacks and API abuse
- **Disable**: Set `RATELIMIT_ENABLED=false` (not recommended for production)

### Implementation
- **Library**: Flask-Limiter
- **Key Function**: Remote IP address (`get_remote_address`)
- **Storage**: In-memory (consider Redis for multi-instance deployments)

## Security Headers

### Implemented Headers
- **X-Content-Type-Options**: `nosniff` - Prevents MIME type sniffing
- **X-Frame-Options**: `DENY` - Prevents clickjacking attacks
- **X-API-Version**: `1` - API version tracking

### Recommended Additional Headers (via Reverse Proxy)
- **Strict-Transport-Security**: `max-age=31536000; includeSubDomains` - Enforce HTTPS
- **Content-Security-Policy**: Restrict resource loading
- **X-XSS-Protection**: `1; mode=block` - Enable XSS filtering

## CORS (Cross-Origin Resource Sharing)

### Configuration
- **Allowed Origins**: Configurable via `CORS_ORIGINS` environment variable
- **Default**: `http://localhost:3000,http://localhost:5173` (development)
- **Production**: Set to specific frontend domain(s)
- **Credentials**: Enabled (`supports_credentials=True`)

### Example Production Config
```bash
CORS_ORIGINS=https://weather-app.example.com,https://www.weather-app.example.com
```

## Database Security

### SQL Injection Prevention
- **ORM**: SQLAlchemy with parameterized queries
- **No Raw SQL**: All queries use ORM methods
- **Input Sanitization**: Type checking and validation before queries

### Connection Security
- **MSSQL**: Supports encrypted connections (configure via connection string)
- **Example**: `mssql+pymssql://user:pass@host:1433/db?encrypt=true`
- **Credentials**: Never commit to version control, use environment variables

### Data Integrity
- **Foreign Keys**: Cascade delete for user → weather_zones relationship
- **Unique Constraints**: Prevent duplicate users, zones
- **Indexes**: Optimized queries on frequently accessed columns

## External API Security

### OpenWeatherMap Integration
- **API Key**: Stored in environment variable, never in code
- **Retry Logic**: Exponential backoff on failures
- **Error Handling**: Graceful degradation (returns cached data on API failure)
- **Rate Limiting**: Respect API provider's rate limits

### Secrets Management
- **Environment Variables**: All secrets via `.env` file (not committed)
- **Production**: Use secret management service (AWS Secrets Manager, Azure Key Vault, etc.)

## Production Deployment Checklist

### Required
- [ ] Set strong `JWT_SECRET_KEY` (32+ random characters)
- [ ] Configure `DATABASE_URL` with production credentials
- [ ] Set `FLASK_ENV=production`
- [ ] Enable HTTPS at reverse proxy (nginx, Cloudflare, etc.)
- [ ] Configure `CORS_ORIGINS` to production domain(s)
- [ ] Set `OPENWEATHERMAP_API_KEY` for weather functionality
- [ ] Review and adjust rate limits for expected traffic

### Recommended
- [ ] Enable database connection encryption
- [ ] Set up monitoring and alerting (Sentry, Datadog, etc.)
- [ ] Configure log aggregation (ELK, CloudWatch, etc.)
- [ ] Implement database backups
- [ ] Set up WAF (Web Application Firewall)
- [ ] Enable DDoS protection
- [ ] Regular security audits and dependency updates

## Known Limitations & Future Enhancements

### Current Limitations
- No email verification on registration
- No password reset functionality
- No account lockout after failed login attempts
- No session management (stateless JWT only)
- No refresh token mechanism
- No multi-factor authentication (MFA)

### Planned Enhancements
1. **Email Verification**: Send confirmation email on registration
2. **Password Reset**: Secure token-based password reset flow
3. **Account Lockout**: Temporary lockout after N failed login attempts
4. **Refresh Tokens**: Long-lived refresh tokens for better UX
5. **MFA**: TOTP-based two-factor authentication
6. **Audit Logging**: Track security-relevant events (login, password changes, etc.)

## Vulnerability Reporting

If you discover a security vulnerability, please report it to:
- **Email**: security@example.com
- **Response Time**: Within 24 hours
- **Disclosure**: Coordinated disclosure after fix is deployed

## Compliance

### Data Protection
- **GDPR**: User data can be deleted (cascade delete on user)
- **Data Minimization**: Only essential data is collected
- **Right to Access**: Users can retrieve their data via API

### Logging
- **PII**: Passwords are never logged
- **Sensitive Data**: JWT tokens are not logged in full
- **Retention**: Configure log retention based on compliance requirements

