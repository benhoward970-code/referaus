# API Development & Testing Skill

Production-ready toolkit for building, testing, and monitoring REST APIs.

## Quick Start

1. **Read the main skill guide**: `SKILL.md` - comprehensive documentation with templates and examples

2. **Use the helper scripts**:
   ```bash
   # Test your API endpoints
   chmod +x test-api.sh
   API_BASE_URL=http://localhost:3000/api/v1 ./test-api.sh
   
   # Monitor API performance
   npm install
   npm run monitor
   ```

## What's Included

### Documentation (`SKILL.md`)
- REST API best practices
- HTTP methods, status codes, patterns
- Express.js templates with security built-in
- Testing strategies (integration, load, contract)
- OpenAPI/Swagger documentation setup
- Security checklist & authentication examples
- Performance optimization techniques
- Deployment checklist

### Helper Scripts

**`test-api.sh`** - Automated API testing
- Tests health endpoints, CRUD operations, validation
- Colored output with pass/fail stats
- Configurable via environment variables
- Usage: `API_BASE_URL=http://localhost:3000/api/v1 API_TOKEN=your-token ./test-api.sh`

**`monitor.js`** - Real-time performance monitoring
- Tracks response times, success rates, errors
- Alerts on slow requests (configurable threshold)
- Statistics: avg, min, max, P95, P99 response times
- Usage: `API_BASE_URL=http://localhost:3000/api/v1 ALERT_THRESHOLD=1000 npm run monitor`

## Environment Variables

```bash
# For both scripts
export API_BASE_URL=http://localhost:3000/api/v1

# For test-api.sh
export API_TOKEN=your-jwt-token

# For monitor.js
export ALERT_THRESHOLD=1000  # Alert if response > 1000ms
export CHECK_INTERVAL=60     # Check every 60 seconds
```

## Use Cases

- **Building a new API**: Use templates from SKILL.md
- **Testing existing API**: Run `test-api.sh` for quick validation
- **Performance monitoring**: Run `monitor.js` in production/staging
- **Load testing**: Use k6 examples from SKILL.md
- **API documentation**: Swagger/OpenAPI setup included
- **Security hardening**: Follow security checklist

## Integration with OpenClaw

This skill works seamlessly with:
- `security-hardening` skill - for comprehensive security
- `ui-component-library` skill - for building API-connected UIs
- Node automation for deployment
- Cron jobs for periodic API health checks

## Learn More

Read `SKILL.md` for:
- Full code examples
- Database integration patterns
- Authentication/authorization setup
- Caching strategies
- Error handling best practices
- Troubleshooting guide

---

**Version**: 1.0.0  
**Created**: 2026-02-13  
**Maintained by**: CLAWDY
