# TypeScript Web App Security Checklist

> A comprehensive, prioritized checklist covering everything from bot-automated attacks to subtle logic flaws like IDORs. Ordered by criticality.

---

## 🔴 CRITICAL — Bots Exploit These Automatically

These are the vulnerabilities that automated scanners and bots find and exploit **within minutes** of your app going live.

### Authentication & Session Management
- [ ] Passwords hashed with **bcrypt/argon2** (never MD5/SHA1)
- [ ] Enforce minimum password length (12+ chars recommended)
- [ ] Implement account lockout or exponential backoff after failed login attempts
- [ ] Session tokens are **cryptographically random** and long (128+ bits entropy)
- [ ] Sessions expire after inactivity (15–30 min for sensitive apps)
- [ ] Regenerate session ID after login (prevent session fixation)
- [ ] JWTs: short expiry (15 min access / 7 day refresh), signed with RS256 not HS256 with a weak secret
- [ ] JWTs: validate `iss`, `aud`, `exp` claims on every request
- [ ] JWTs: store refresh tokens in **httpOnly secure cookies**, never localStorage
- [ ] Invalidate sessions server-side on logout (don't just delete the client cookie)
- [ ] Never expose session tokens or JWTs in URLs or logs

### SQL / NoSQL Injection
- [ ] **Never** concatenate user input into queries — use parameterized queries or ORM
- [ ] If using raw SQL with Prisma/TypeORM/Knex, always use `.query()` with parameters
- [ ] Validate and type-check all query parameters with Zod/Joi/class-validator
- [ ] If using MongoDB, sanitize against NoSQL injection (`$gt`, `$ne` operator injection)
- [ ] Escape special characters in any dynamic database identifiers

### Exposed Secrets & Misconfiguration
- [ ] `.env` file is in `.gitignore` — never committed to repo
- [ ] No hardcoded API keys, DB passwords, or secrets anywhere in source code
- [ ] Scan repo history for leaked secrets (use `trufflehog` or `gitleaks`)
- [ ] Remove or protect all debug/dev endpoints in production
- [ ] Disable stack traces and verbose errors in production (`NODE_ENV=production`)
- [ ] Remove default credentials from all services (DB, admin panels, message queues)
- [ ] Disable directory listing on your web server
- [ ] Remove `X-Powered-By` header (`app.disable('x-powered-by')` in Express)

### Brute Force & Credential Stuffing (Bot Favorite)
- [ ] Rate limit login endpoint aggressively (e.g., 5 attempts per minute per IP)
- [ ] Rate limit password reset and OTP endpoints
- [ ] Implement CAPTCHA (hCaptcha/Turnstile) on login after N failures
- [ ] Monitor for distributed brute force (same password tried across many accounts)
- [ ] Block or flag login from known bot/proxy IP lists

### Open Admin Panels & Endpoints
- [ ] Admin routes require authentication + role check (not just a hidden URL)
- [ ] `/admin`, `/api/debug`, `/graphql playground` are disabled or IP-restricted in production
- [ ] Health check endpoints (`/health`, `/status`) don't leak sensitive info
- [ ] API documentation (Swagger/OpenAPI) is not publicly accessible in production

---

## 🟠 HIGH — Common Attack Vectors

### Broken Access Control & IDOR
> This is the **#1 vulnerability** on the OWASP Top 10 and bots increasingly automate it.

- [ ] **Every** endpoint that returns/modifies data checks that the **authenticated user owns that resource**
- [ ] Never trust client-sent IDs alone — always verify ownership server-side
  ```typescript
  // ❌ BAD — anyone can pass any userId
  app.get('/api/orders/:orderId', async (req, res) => {
    const order = await db.order.findUnique({ where: { id: req.params.orderId } });
    return res.json(order);
  });

  // ✅ GOOD — scoped to authenticated user
  app.get('/api/orders/:orderId', async (req, res) => {
    const order = await db.order.findFirst({
      where: { id: req.params.orderId, userId: req.user.id }
    });
    if (!order) return res.status(404).json({ error: 'Not found' });
    return res.json(order);
  });
  ```
- [ ] Use UUIDs instead of sequential/guessable integer IDs for resources
- [ ] Implement authorization middleware that runs **before** the route handler
- [ ] Test every endpoint: can User A access/modify User B's data by changing an ID?
- [ ] Check horizontal privilege escalation (same role, different user's data)
- [ ] Check vertical privilege escalation (regular user accessing admin functions)
- [ ] Bulk endpoints (list/export) only return data belonging to the requester
- [ ] File upload/download endpoints verify the user owns the file
- [ ] GraphQL: ensure nested resolvers enforce authorization (not just the top-level query)

### Cross-Site Scripting (XSS)
- [ ] Sanitize and escape all user-generated content before rendering
- [ ] Use a templating engine with auto-escaping (React JSX does this by default)
- [ ] **Never** use `dangerouslySetInnerHTML` with unsanitized input
- [ ] Sanitize rich text with `DOMPurify` before rendering
- [ ] Validate and sanitize URL inputs (prevent `javascript:` protocol injection)
- [ ] Set `Content-Type: application/json` on API responses (prevent browser HTML interpretation)
- [ ] CSP header blocks inline scripts and unauthorized script sources (see Headers section)

### Cross-Site Request Forgery (CSRF)
- [ ] Use CSRF tokens for all state-changing requests (POST/PUT/DELETE)
- [ ] If using cookies for auth, set `SameSite=Strict` or `SameSite=Lax`
- [ ] Verify `Origin` and `Referer` headers on sensitive endpoints
- [ ] Double-submit cookie pattern as additional layer
- [ ] For SPAs with JWT in headers: CSRF is partially mitigated, but still protect cookie-based flows

### Server-Side Request Forgery (SSRF)
- [ ] Never let user input directly control URLs your server fetches
- [ ] If you must fetch user-provided URLs, validate against an allowlist of domains
- [ ] Block requests to internal/private IP ranges (`127.0.0.1`, `10.x.x.x`, `169.254.169.254`, `192.168.x.x`)
- [ ] Block requests to cloud metadata endpoints (`169.254.169.254` — AWS/GCP credential theft)
- [ ] Disable HTTP redirects or validate each redirect target

---

## 🟡 MEDIUM — Important Hardening

### Security Headers
```typescript
// Recommended middleware (Express example)
app.use((req, res, next) => {
  // Prevent XSS via browser heuristics
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Control referrer leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Enforce HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://your-api.com");
  // Prevent browser features you don't use
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
```
- [ ] All headers above are set and tested
- [ ] CSP is as restrictive as possible (avoid `unsafe-eval`)
- [ ] Test headers at [securityheaders.com](https://securityheaders.com)

### CORS Configuration
- [ ] **Never** set `Access-Control-Allow-Origin: *` on authenticated endpoints
- [ ] Allowlist specific trusted origins
- [ ] Don't reflect the `Origin` header back blindly
  ```typescript
  // ❌ BAD
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin);

  // ✅ GOOD
  const ALLOWED_ORIGINS = ['https://myapp.com', 'https://admin.myapp.com'];
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  ```
- [ ] Set `Access-Control-Allow-Credentials: true` only when needed and with specific origins
- [ ] Restrict `Access-Control-Allow-Methods` to only methods your API uses

### Input Validation (Global)
- [ ] Validate **every** input on the server side (never trust the client)
- [ ] Use Zod schemas for all request bodies, query params, and path params
  ```typescript
  import { z } from 'zod';

  const CreateUserSchema = z.object({
    email: z.string().email().max(255),
    name: z.string().min(1).max(100).trim(),
    age: z.number().int().min(13).max(150).optional(),
  });

  // In your handler
  const parsed = CreateUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });
  ```
- [ ] Limit string lengths to prevent memory abuse
- [ ] Reject unexpected fields (use `.strict()` in Zod)
- [ ] Validate file upload MIME types, extensions, and sizes server-side
- [ ] Limit request body size (`express.json({ limit: '1mb' })`)
- [ ] Validate and sanitize path parameters to prevent path traversal (`../../etc/passwd`)

### Rate Limiting & Abuse Prevention
- [ ] Global rate limit on all endpoints (e.g., 100 req/min per IP)
- [ ] Stricter limits on expensive operations (search, export, file upload)
- [ ] Rate limit by authenticated user ID (not just IP) to catch distributed attacks
- [ ] Implement request size limits and request timeout
- [ ] Use `express-rate-limit` + `rate-limit-redis` for distributed setups
  ```typescript
  import rateLimit from 'express-rate-limit';

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { error: 'Too many login attempts, try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip,
  });

  app.post('/api/auth/login', loginLimiter, loginHandler);
  ```
- [ ] Protect against API enumeration (consistent response times and messages for valid/invalid resources)

### File Upload Security
- [ ] Validate file type server-side by checking **magic bytes**, not just extension
- [ ] Rename uploaded files (never use the original filename)
- [ ] Store uploads outside the web root or in cloud storage (S3/GCS)
- [ ] Set file size limits
- [ ] Scan uploads for malware if possible
- [ ] Serve user-uploaded files from a separate domain/CDN (prevents XSS via uploaded HTML/SVG)
- [ ] Strip EXIF/metadata from uploaded images

---

## 🔵 IMPORTANT — Defense in Depth

### HTTPS & Transport
- [ ] TLS 1.2+ everywhere (disable TLS 1.0/1.1)
- [ ] HSTS header with long max-age and includeSubDomains
- [ ] Redirect all HTTP to HTTPS at the infrastructure level
- [ ] Valid, auto-renewing certificates (Let's Encrypt or managed certs)
- [ ] Pin your domain to a CA via CAA DNS records

### Cookie Security
- [ ] All auth cookies set `Secure` flag (HTTPS only)
- [ ] All auth cookies set `HttpOnly` flag (no JS access)
- [ ] `SameSite=Strict` or `Lax` on auth cookies
- [ ] Cookie `Path` scoped as narrowly as possible
- [ ] Cookie `Domain` does not include unnecessary subdomains

### Database Security
- [ ] Database not exposed to the public internet (bind to localhost or private network)
- [ ] Application uses a DB user with **minimum required privileges** (not root/admin)
- [ ] Separate read/write DB users if possible
- [ ] Enable query logging for auditing
- [ ] Enable encryption at rest
- [ ] Regular automated backups with tested restore process

### Dependency Management
- [ ] Run `npm audit` regularly and fix critical/high vulnerabilities
- [ ] Use `npm audit --production` to focus on runtime dependencies
- [ ] Enable Dependabot or Snyk for automated vulnerability alerts
- [ ] Lock dependency versions with `package-lock.json` (committed to repo)
- [ ] Review new dependencies before adding (check download count, maintainers, last update)
- [ ] Remove unused dependencies

### Logging & Monitoring
- [ ] Log all authentication events (login, logout, failed attempts, password resets)
- [ ] Log all authorization failures (403s, access denied)
- [ ] Log all input validation failures (potential scanning/probing)
- [ ] **Never** log passwords, tokens, credit cards, or PII
- [ ] Include request ID, user ID, IP, timestamp, and endpoint in logs
- [ ] Set up alerts for unusual patterns (spike in 401s, 403s, 500s)
- [ ] Centralize logs (ELK, Datadog, or similar)
- [ ] Retain logs for at least 90 days

### Error Handling
- [ ] Global error handler that returns generic messages to clients
  ```typescript
  // Global error handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // Log the full error internally
    logger.error({ err, requestId: req.id, path: req.path });

    // Return generic message to client
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.publicMessage });
    }
    return res.status(500).json({ error: 'Internal server error' });
  });
  ```
- [ ] Never expose stack traces, file paths, or DB errors to clients
- [ ] Return consistent error shapes across all endpoints
- [ ] Use different error messages for dev vs production

---

## 🟣 OFTEN OVERLOOKED — But Exploited in Real Breaches

### Mass Assignment / Over-Posting
- [ ] Never pass `req.body` directly to database create/update
  ```typescript
  // ❌ BAD — user can set isAdmin: true in the body
  await db.user.update({ where: { id }, data: req.body });

  // ✅ GOOD — explicit allowlist
  await db.user.update({
    where: { id },
    data: { name: parsed.name, email: parsed.email }
  });
  ```
- [ ] Use Zod `.pick()` or `.omit()` to define exactly which fields are accepted per endpoint

### API Response Data Leakage
- [ ] Never return full database objects — use explicit response DTOs
- [ ] Strip sensitive fields before responding (password hash, internal IDs, tokens, PII of other users)
- [ ] Audit every endpoint: does the response contain more data than the client needs?
- [ ] GraphQL: disable introspection in production
- [ ] GraphQL: implement query depth and complexity limits

### Race Conditions
- [ ] Use database transactions for multi-step operations (transfer money, claim coupon)
- [ ] Use optimistic locking or `SELECT ... FOR UPDATE` for critical resources
- [ ] Test concurrent requests to payment, inventory, and redemption endpoints

### Denial of Service at the Application Level
- [ ] Limit GraphQL query depth and complexity
- [ ] Paginate all list endpoints (enforce max page size)
- [ ] Timeout long-running operations
- [ ] Limit CSV/JSON export sizes
- [ ] Reject deeply nested JSON bodies
- [ ] Set `express.json({ limit: '1mb' })` or appropriate size

### Email & Notification Abuse
- [ ] Rate limit password reset emails (1 per minute per email)
- [ ] Rate limit invite/share features
- [ ] Don't reveal whether an email exists in the system
  ```typescript
  // ❌ BAD
  "No account found for this email"

  // ✅ GOOD
  "If an account exists, a reset link has been sent"
  ```

### Secrets & Environment Management
- [ ] Use a secrets manager (AWS Secrets Manager, Vault, Doppler) in production
- [ ] Rotate all secrets and API keys on a schedule
- [ ] Different secrets per environment (dev/staging/prod)
- [ ] CI/CD pipelines use ephemeral secrets, not hardcoded
- [ ] Revoke any key that was ever exposed in a commit, log, or error message

---

## ✅ Pre-Deploy Quick Scan

Run these before every production deployment:

```bash
# Check for known vulnerabilities in dependencies
npm audit --production

# Scan for hardcoded secrets in your codebase
npx gitleaks detect --source .

# TypeScript strict mode catches many bugs
# Ensure tsconfig.json has:
#   "strict": true
#   "noImplicitAny": true

# Lint for security anti-patterns
npx eslint . --rule 'no-eval: error' --rule 'no-implied-eval: error'
```

---

## 📚 Testing Checklist

- [ ] Test every endpoint with no auth token → expect 401
- [ ] Test every endpoint with a valid token for a **different user** → expect 403 or 404
- [ ] Test every endpoint with malformed input → expect 400 (not 500)
- [ ] Test with SQL injection payloads in every input field
- [ ] Test with XSS payloads in every text field
- [ ] Test with oversized payloads
- [ ] Test concurrent duplicate requests to payment/critical endpoints
- [ ] Test file uploads with wrong extensions, oversized files, and HTML files
- [ ] Run OWASP ZAP or Burp Suite scan against staging environment

---

*Last updated: March 2026. Based on OWASP Top 10 (2021), OWASP API Security Top 10, and real-world TypeScript/Node.js breach patterns.*
