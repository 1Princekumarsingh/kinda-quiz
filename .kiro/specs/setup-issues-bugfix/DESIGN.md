# Design: Setup and Configuration Issues Bugfix

## Overview

This bugfix addresses three critical setup issues preventing the RecallX application from starting. The fix involves correcting PostgreSQL credentials, ensuring database initialization, and adding the missing ESLint configuration.

## Technical Approach

### 1. PostgreSQL Credential Resolution

**Current State**:
- `backend\.env` contains: `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/recallx`
- Connection fails with password authentication error
- Postgres is confirmed running on port 5432

**Investigation Strategy**:
1. Attempt to identify the actual PostgreSQL credentials
2. Check if database `recallx` exists
3. Verify PostgreSQL authentication configuration

**Solution Design**:
- **Option A**: Update `.env` with correct credentials if they can be determined
- **Option B**: Provide clear instructions for user to set their own credentials
- **Option C**: Use environment-specific defaults that prompt user configuration

**Chosen Approach**: Option B + C
- Update `.env.example` with clear placeholder and instructions
- Add validation in backend startup to fail fast with helpful error message
- Document database setup process clearly

**Implementation**:
```python
# app/core/database.py
def validate_database_connection():
    """
    Validate database connection on startup.
    Provide helpful error messages if connection fails.
    """
    try:
        # Attempt connection
        engine.connect()
    except OperationalError as e:
        if "password authentication failed" in str(e):
            raise RuntimeError(
                "Database connection failed: Password authentication error.\n"
                "Please check your DATABASE_URL in backend/.env\n"
                "Ensure PostgreSQL user and password are correct.\n"
                f"Error: {e}"
            )
        raise
```

### 2. Database Initialization

**Current State**:
- Database `recallx` may not exist
- Migrations cannot run without valid connection
- No automated database creation

**Solution Design**:
1. **Database Creation**: Check if database exists, create if needed
2. **Migration Execution**: Run migrations after successful connection
3. **Error Handling**: Provide clear error messages for common issues

**Implementation**:

**Approach A - Manual Setup (Recommended for V1)**:
- Document database creation in README
- User runs: `createdb recallx` or creates via pgAdmin
- Clear error messages guide user

**Approach B - Automated Setup**:
- Check database existence on startup
- Create database if missing
- Requires elevated privileges

**Chosen Approach**: Approach A with enhanced documentation
- Keep setup explicit and transparent
- User maintains control over database
- Add setup verification script

**Database Setup Script**:
```python
# backend/scripts/setup_database.py
"""
Database setup and verification script.
Run this before starting the application.
"""
import sys
from sqlalchemy import create_engine, text
from app.core.config import settings

def check_postgres_connection():
    """Check if PostgreSQL is accessible"""
    # Connect to postgres database to check server
    
def check_database_exists():
    """Check if recallx database exists"""
    
def run_migrations():
    """Run Alembic migrations"""
    import subprocess
    result = subprocess.run(["alembic", "upgrade", "head"])
    return result.returncode == 0
    
def main():
    print("RecallX Database Setup")
    print("=" * 50)
    # Step-by-step verification
```

### 3. ESLint Configuration

**Current State**:
- `package.json` includes lint script: `"lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"`
- ESLint dependencies installed: `eslint`, `@typescript-eslint/*`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- No configuration file exists

**Root Cause**: Configuration file missing (likely deleted or never created)

**Solution Design**:
Create `.eslintrc.cjs` following project standards from STEERING.md

**Configuration Requirements**:
- TypeScript support with strict rules
- React and React Hooks rules
- React Refresh plugin for Vite
- Consistent with STEERING.md coding standards
- No warnings in production code

**Implementation**:
```javascript
// frontend/.eslintrc.cjs
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname
  },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_' }
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
}
```

## File Changes

### Files to Create

1. **`frontend/.eslintrc.cjs`**
   - Purpose: ESLint configuration for TypeScript + React
   - Content: Standard Vite + React + TypeScript configuration

2. **`backend/.env.example`** (update existing if present)
   - Purpose: Template for environment variables with clear instructions
   - Content:
     ```
     # Database Configuration
     # Create a PostgreSQL database named 'recallx' first
     # Then update these credentials to match your PostgreSQL setup
     DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/recallx
     
     # JWT Configuration
     SECRET_KEY=your-secret-key-change-this-in-production
     ALGORITHM=HS256
     ACCESS_TOKEN_EXPIRE_DAYS=7
     ```

3. **`SETUP.md`** (new file in root)
   - Purpose: Step-by-step setup instructions
   - Content: Database setup, environment configuration, migration steps

### Files to Modify

1. **`backend/.env`** (user must modify manually)
   - User needs to update with their actual PostgreSQL credentials
   - Cannot be automated without knowing user's setup

2. **`backend/app/main.py`** (optional enhancement)
   - Add startup validation for database connection
   - Provide helpful error messages

3. **`README.md`** (if exists, optional)
   - Add link to SETUP.md
   - Highlight setup requirements

## Database Schema

No schema changes required. This is purely a configuration fix.

## API Changes

No API changes. This fix enables the existing API to function.

## Error Handling

### Database Connection Errors

**Before**: Generic SQLAlchemy error
```
sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) FATAL:  password authentication failed for user "postgres"
```

**After**: Helpful error message
```
Database Connection Error:
--------------------------
Password authentication failed for PostgreSQL user 'postgres'.

Please check your configuration:
1. Verify DATABASE_URL in backend/.env
2. Ensure PostgreSQL is running on port 5432
3. Confirm the username and password are correct
4. Check that database 'recallx' exists

To create the database, run:
  createdb recallx

For detailed setup instructions, see SETUP.md
```

### ESLint Configuration Errors

**Before**:
```
Error: No ESLint configuration found
```

**After**: Lint runs successfully with proper configuration

## Testing Strategy

### Manual Testing Checklist

**PostgreSQL Connection**:
- [ ] Update `.env` with correct credentials
- [ ] Start backend: `cd backend && uvicorn app.main:app --reload`
- [ ] Verify no connection errors in console
- [ ] Check API responds at http://localhost:8000/docs

**Database Migrations**:
- [ ] Run `cd backend && alembic upgrade head`
- [ ] Verify all migrations apply successfully
- [ ] Check database tables exist
- [ ] Verify no foreign key constraint errors

**ESLint Configuration**:
- [ ] Run `cd frontend && npm run lint`
- [ ] Verify ESLint runs without configuration errors
- [ ] Check that code issues are reported (if any exist)
- [ ] Confirm script exits with appropriate code

### Validation Script

Create `backend/scripts/validate_setup.py`:
```python
"""Validate RecallX setup before running application"""

def validate_all():
    checks = [
        ("PostgreSQL Connection", check_postgres),
        ("Database Exists", check_database),
        ("Migrations Applied", check_migrations),
        ("Environment Variables", check_env_vars)
    ]
    
    all_passed = True
    for name, check_fn in checks:
        try:
            check_fn()
            print(f"✓ {name}")
        except Exception as e:
            print(f"✗ {name}: {e}")
            all_passed = False
    
    return all_passed
```

## Security Considerations

1. **Never commit `.env`**: Ensure `.gitignore` includes `.env`
2. **Strong SECRET_KEY**: Generate cryptographically secure key
3. **Database Credentials**: Use strong passwords, not defaults
4. **Connection String Security**: Don't log full connection string with credentials

## Performance Impact

- No performance impact
- Fixes prevent application from starting, enabling all functionality

## Rollback Plan

Not applicable - this is a bugfix for non-functional application. No rollback needed as there's no working state to roll back to.

## Documentation Updates

### SETUP.md (new file)
```markdown
# RecallX Setup Guide

## Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 14+

## Database Setup
1. Create PostgreSQL database:
   \`\`\`bash
   createdb recallx
   \`\`\`

2. Configure credentials in \`backend/.env\`:
   \`\`\`
   DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/recallx
   \`\`\`

3. Run migrations:
   \`\`\`bash
   cd backend
   alembic upgrade head
   \`\`\`

## Backend Setup
1. Install dependencies:
   \`\`\`bash
   cd backend
   pip install -r requirements.txt
   \`\`\`

2. Start server:
   \`\`\`bash
   uvicorn app.main:app --reload
   \`\`\`

## Frontend Setup
1. Install dependencies:
   \`\`\`bash
   cd frontend
   npm install
   \`\`\`

2. Start dev server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Verification
- Backend: http://localhost:8000/docs
- Frontend: http://localhost:5173
```

## Success Criteria

- [ ] Backend starts without database connection errors
- [ ] Migrations run successfully
- [ ] All database tables created
- [ ] Frontend lint script runs without configuration errors
- [ ] Clear setup documentation provided
- [ ] `.env.example` provides helpful guidance
