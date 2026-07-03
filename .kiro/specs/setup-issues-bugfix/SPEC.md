# Spec: Setup and Configuration Issues Bugfix

## Metadata
- **Type**: Bugfix
- **Status**: Not Started
- **Priority**: Critical
- **Created**: 2024
- **Estimated Effort**: 2-3 hours

## Problem Summary

The RecallX application is completely non-functional due to three critical configuration issues:

1. **Backend startup failure**: PostgreSQL connection fails with password authentication error
   - Error: `FATAL: password authentication failed for user "postgres"`
   - Database URL: `postgresql://postgres:postgres@localhost:5432/recallx`
   - Impact: Backend cannot start, API unavailable

2. **Migration failure**: Alembic migrations cannot run due to database connection failure
   - Same credential issue blocks schema initialization
   - Impact: Database tables not created, application cannot store data

3. **Lint script failure**: ESLint configuration file missing in frontend
   - Error: `No ESLint configuration found`
   - Lint script defined in package.json but no config file exists
   - Impact: Development workflow broken, cannot run code quality checks

## Impact Assessment

**Severity**: Critical - Application completely non-functional

**Affected Systems**:
- Backend: Cannot start
- Database: Cannot initialize schema
- Frontend: Development workflow broken
- Users: Cannot access application
- Developers: Cannot run quality checks

## Root Causes

1. **Database Credentials**: The `.env` file contains default credentials that don't match the actual PostgreSQL setup
2. **Missing Database**: The `recallx` database may not exist in PostgreSQL
3. **Missing ESLint Config**: The `.eslintrc.cjs` file was never created or was deleted

## Solution Approach

### Phase 1: Investigation
- Identify correct PostgreSQL credentials
- Verify database existence
- Document actual errors

### Phase 2: Configuration Fixes
- Create ESLint configuration (independent fix)
- Update `.env.example` with clear instructions
- Fix database credentials in `.env`

### Phase 3: Database Initialization
- Create database if needed
- Run Alembic migrations
- Verify schema creation

### Phase 4: Documentation
- Create comprehensive SETUP.md
- Document troubleshooting steps
- Provide verification checklist

### Phase 5: Validation
- Test complete setup flow
- Verify all three issues resolved
- Confirm application starts successfully

## Files to Create

1. `frontend/.eslintrc.cjs` - ESLint configuration
2. `backend/.env.example` - Environment variable template with instructions
3. `SETUP.md` - Comprehensive setup guide

## Files to Modify

1. `backend/.env` - Update with correct credentials (user action)
2. Database - Create `recallx` database if missing (user action)

## Testing Strategy

**Manual Testing**:
- Follow SETUP.md from scratch
- Verify backend starts without errors
- Verify migrations complete successfully  
- Verify lint script runs without errors
- Test full application startup

**Validation Script**:
- Create `backend/scripts/validate_setup.py`
- Automated checks for common issues
- Clear error messages for failures

## Success Criteria

- [x] Requirements documented in REQUIREMENTS.md
- [x] Design completed in DESIGN.md
- [x] Tasks broken down in tasks.md
- [ ] Backend connects to PostgreSQL successfully
- [ ] Alembic migrations run without errors
- [ ] Frontend lint script executes without configuration errors
- [ ] SETUP.md provides clear setup instructions
- [ ] Application starts and is accessible

## Related Documents

- [REQUIREMENTS.md](./REQUIREMENTS.md) - Detailed requirements and acceptance criteria
- [DESIGN.md](./DESIGN.md) - Technical design and implementation approach
- [tasks.md](./tasks.md) - Task breakdown with dependencies

## Notes

This is a critical blocking issue. Without these fixes:
- No development can proceed
- Application cannot be tested
- New developers cannot set up the project
- Code quality checks cannot run

Priority should be given to:
1. ESLint config (quickest fix, enables frontend development)
2. Database credentials (unblocks backend)
3. Documentation (prevents future issues)
