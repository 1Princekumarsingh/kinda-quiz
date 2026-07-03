# STEERING.md

## Project Philosophy

### Core Principles

- **Production-Ready Only**: Every line of code must be production-quality. No prototypes, no placeholders, no TODO comments.
- **Clean Architecture**: Clear separation between layers (presentation, business logic, data access).
- **Modular**: Components and modules should be independent and loosely coupled.
- **Extensible**: Design for future features without major refactoring.
- **Scalable**: Support growth from 100 to 1,000,000+ questions per user.
- **Maintainable**: Code should be self-documenting and easy to understand.
- **No Technical Debt**: Address issues immediately, never defer problems.
- **No Duplicate Logic**: DRY principle strictly enforced.
- **Single Source of Truth**: One place for each piece of data or logic.
- **SOLID Principles**: All code must follow SOLID design principles.
- **KISS**: Keep solutions simple and straightforward.
- **Separation of Concerns**: Each module does one thing well.

---

## Tech Stack

### Frontend
- **React 19**: Latest stable version with concurrent features
- **Vite**: Fast build tool and dev server
- **TypeScript**: Strict mode enabled, full type safety
- **TailwindCSS**: Utility-first styling, custom design system
- **React Router**: Client-side routing with protected routes
- **TanStack Query**: Server state management, caching, optimistic updates
- **Axios**: HTTP client with interceptors

### Backend
- **FastAPI**: Modern async Python framework
- **SQLAlchemy**: ORM with relationship management
- **Alembic**: Database migrations with version control
- **PostgreSQL**: Primary database with ACID compliance
- **Pydantic**: Request/response validation and serialization

### Authentication
- **Username Only**: No email, no password, no OAuth
- **JWT**: Stateless authentication with 7-day expiry
- **Protected Routes**: Backend middleware + frontend guards

---

## Coding Standards

### TypeScript/JavaScript Standards

#### Naming Conventions
- **Components**: PascalCase (`UserDashboard.tsx`)
- **Functions**: camelCase (`getUserData()`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_BATCH_SIZE`)
- **Interfaces/Types**: PascalCase with descriptive names (`UserResponse`, `QuestionStatus`)
- **Files**: kebab-case for utilities (`auth-utils.ts`), PascalCase for components
- **Boolean variables**: Prefix with `is`, `has`, `should` (`isLoading`, `hasError`)

#### Folder Organization - Frontend
```
src/
├── api/              # API call functions
├── assets/           # Images, fonts, static files
├── components/       # Reusable components
│   ├── common/       # Buttons, inputs, cards
│   ├── layout/       # Layout components
│   └── features/     # Feature-specific components
├── contexts/         # React contexts
├── hooks/            # Custom React hooks
├── lib/              # Third-party library configs
├── pages/            # Route pages
├── routes/           # Route definitions
├── types/            # TypeScript types and interfaces
├── utils/            # Helper functions
└── main.tsx          # Entry point
```

#### Component Design Rules
- **One component per file**
- **Props interface defined above component**
- **Default props avoided** (use TypeScript defaults)
- **Max 200 lines per component** (split if larger)
- **Extract hooks for complex logic**
- **Memoize expensive computations** (useMemo, useCallback)

#### React Best Practices
- Use functional components only
- Prefer composition over inheritance
- Keep components pure when possible
- Use custom hooks for shared logic
- Avoid prop drilling (use Context or state management)
- Extract business logic from components
- Use TypeScript strict mode
- Define clear prop interfaces
- Use proper key props in lists

### Python Standards

#### Naming Conventions
- **Modules**: snake_case (`auth_service.py`)
- **Classes**: PascalCase (`UserService`)
- **Functions**: snake_case (`create_user()`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_QUESTION_COUNT`)
- **Private methods**: Prefix with underscore (`_validate_input()`)

#### Folder Organization - Backend
```
app/
├── api/              # Route handlers
│   ├── auth.py
│   ├── subjects.py
│   └── ...
├── core/             # Core functionality
│   ├── config.py     # Settings
│   ├── database.py   # DB connection
│   └── security.py   # Auth utilities
├── models/           # SQLAlchemy models
│   ├── user.py
│   ├── subject.py
│   └── ...
├── schemas/          # Pydantic schemas
│   ├── auth.py
│   ├── subject.py
│   └── ...
├── services/         # Business logic
│   ├── auth_service.py
│   ├── subject_service.py
│   └── ...
├── utils/            # Helper functions
│   ├── parser.py
│   └── validators.py
└── main.py           # Application entry
```

#### Python Best Practices
- Type hints required for all functions
- Use Pydantic for validation
- Keep routes thin (delegate to services)
- Services contain business logic
- Models are pure data structures
- Use async/await for I/O operations
- Handle exceptions explicitly
- Use dependency injection for testability

---

## Database Standards

### Migration Rules
- **Never edit migrations**: Create new ones for changes
- **Descriptive names**: `001_create_users_table.py`
- **Test migrations**: Always test up and down migrations
- **Data migrations**: Separate from schema migrations
- **Backup before migration**: Always in production

### Schema Design Rules
- **Use UUIDs or auto-increment integers for IDs**
- **Add indexes**: On foreign keys and frequently queried columns
- **Use constraints**: NOT NULL, UNIQUE, CHECK constraints
- **Timestamps**: created_at, updated_at on all tables
- **Soft deletes**: Consider is_deleted flag instead of hard deletes
- **Normalize data**: Avoid duplication (questions stored once)

### Query Rules
- **Use ORM relationships**: Avoid manual joins when possible
- **Eager load relationships**: Prevent N+1 queries
- **Use indexes**: For all WHERE, ORDER BY columns
- **Paginate large results**: Never return unbounded lists
- **Use transactions**: For multi-table operations
- **Connection pooling**: Configure appropriate pool size

---

## API Standards

### REST API Design

#### Endpoint Naming
- Use nouns, not verbs: `/users`, not `/getUsers`
- Use plural for collections: `/subjects`
- Use nested resources: `/subjects/{id}/chapters`
- Use query params for filtering: `/questions?status=ERROR`

#### HTTP Methods
- **GET**: Retrieve resource(s), must be idempotent
- **POST**: Create new resource
- **PUT**: Full update of resource
- **PATCH**: Partial update of resource
- **DELETE**: Remove resource

#### Response Format
```json
{
  "data": {...},
  "message": "Success message",
  "errors": null
}
```

#### Error Response Format
```json
{
  "data": null,
  "message": "Error message",
  "errors": [
    {
      "field": "username",
      "message": "Username is required"
    }
  ]
}
```

#### Status Codes
- **200**: Success (GET, PUT, PATCH)
- **201**: Created (POST)
- **204**: No Content (DELETE)
- **400**: Bad Request (validation error)
- **401**: Unauthorized (not authenticated)
- **403**: Forbidden (not authorized)
- **404**: Not Found
- **500**: Internal Server Error

---

## Error Handling

### Frontend Error Handling
- **API errors**: Display user-friendly messages
- **Network errors**: Show retry option
- **Validation errors**: Display field-level errors
- **Unexpected errors**: Log to console, show generic message
- **Loading states**: Always indicate loading
- **Empty states**: Show helpful messages and CTAs

### Backend Error Handling
- **Validation errors**: Return 400 with field details
- **Authentication errors**: Return 401
- **Authorization errors**: Return 403
- **Not found errors**: Return 404
- **Database errors**: Log details, return 500
- **Never expose**: Stack traces or internal details to client

### Error Logging
- **Frontend**: Console errors in development, external service in production
- **Backend**: Structured logging with context (user_id, request_id)
- **Include**: Timestamp, severity, message, context, stack trace

---

## Security Standards

### Authentication Security
- **JWT tokens**: 7-day expiry, stored in localStorage
- **Token validation**: On every protected route
- **HTTPS only**: In production
- **No sensitive data**: In JWT payload

### Input Validation
- **Validate all inputs**: Backend and frontend
- **Sanitize strings**: Prevent XSS attacks
- **Parameterized queries**: Prevent SQL injection
- **File upload validation**: Check file type, size, content
- **Rate limiting**: Prevent abuse (future feature)

### Data Isolation
- **User data separation**: Filter by user_id in all queries
- **Row-level security**: Enforce at database level
- **No cross-user access**: Validate ownership on all operations

### CORS Configuration
- **Whitelist origins**: Only allow frontend domain
- **Credentials**: Allow cookies/headers
- **Methods**: Only required HTTP methods

---

## Performance Standards

### Frontend Performance
- **Code splitting**: Lazy load routes and heavy components
- **Image optimization**: Compress images, use appropriate formats
- **Bundle size**: Keep main bundle < 200KB gzipped
- **Memoization**: Use React.memo, useMemo, useCallback appropriately
- **Virtualization**: For long lists (> 100 items)
- **Debounce/throttle**: User input and scroll events

### Backend Performance
- **Database indexing**: Index all foreign keys and query columns
- **Query optimization**: Use EXPLAIN, avoid N+1 queries
- **Caching**: Cache frequently accessed data
- **Connection pooling**: Reuse database connections
- **Async operations**: Use async/await for I/O
- **Pagination**: Limit query results, use cursor-based pagination

### Loading Time Targets
- **Initial page load**: < 2 seconds
- **API response**: < 500ms for simple queries
- **File parsing**: < 3 seconds for 500 questions
- **Quiz interaction**: < 200ms feedback

---

## Accessibility Standards

### WCAG 2.1 Level AA Compliance
- **Keyboard navigation**: All interactive elements accessible via keyboard
- **Focus indicators**: Visible focus states on all interactive elements
- **Color contrast**: 4.5:1 for normal text, 3:1 for large text
- **Alt text**: Descriptive alt text for all images
- **ARIA labels**: Proper labels for screen readers
- **Form labels**: All inputs have associated labels
- **Error messages**: Announced to screen readers
- **Heading hierarchy**: Proper H1-H6 structure

### Semantic HTML
- Use semantic tags: `<nav>`, `<main>`, `<article>`, `<section>`
- Proper button vs link usage
- Form elements with proper types
- Meaningful page titles

---

## Responsive Design Standards

### Breakpoints
- **Mobile**: 320px - 640px
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px+

### Design Rules
- **Mobile-first**: Design for mobile, enhance for desktop
- **Touch targets**: Minimum 44x44px on mobile
- **Readable text**: Minimum 16px font size
- **No horizontal scroll**: Content fits viewport
- **Flexible layouts**: Use flexbox and grid
- **Responsive images**: Use srcset or CSS

---

## State Management

### Frontend State Categories
- **Server state**: Managed by TanStack Query (API data)
- **UI state**: Local component state (useState)
- **Global state**: React Context (auth, theme)
- **URL state**: React Router (pagination, filters)
- **Form state**: React Hook Form

### State Management Rules
- **Minimize global state**: Use local state when possible
- **Single source of truth**: Don't duplicate state
- **Derived state**: Calculate from existing state
- **Immutable updates**: Never mutate state directly

---

## Testing Guidelines

### Frontend Testing
- **Unit tests**: Utility functions, hooks
- **Component tests**: User interactions, rendering
- **Integration tests**: Multi-component workflows
- **E2E tests**: Critical user journeys

### Backend Testing
- **Unit tests**: Services, utilities, validators
- **Integration tests**: API endpoints, database operations
- **Property-based tests**: Parser, question validation

### Test Coverage Targets
- **Critical paths**: 90%+ coverage
- **Business logic**: 80%+ coverage
- **UI components**: 60%+ coverage

---

## Git Conventions

### Branch Naming
- **Feature**: `feature/user-authentication`
- **Bugfix**: `bugfix/login-validation`
- **Hotfix**: `hotfix/security-patch`
- **Release**: `release/v1.0.0`

### Commit Messages
```
type(scope): subject

body (optional)

footer (optional)
```

**Types**: feat, fix, docs, style, refactor, test, chore

**Examples**:
- `feat(auth): implement username login`
- `fix(parser): handle missing answer validation`
- `refactor(dashboard): extract stats components`

### Pull Request Rules
- **Title**: Clear, descriptive
- **Description**: What, why, how
- **Tests**: Include test results
- **Screenshots**: For UI changes
- **Review required**: Before merge

---

## Documentation Standards

### Code Comments
- **When to comment**: Why, not what
- **Avoid obvious comments**: Code should be self-explanatory
- **Complex logic**: Explain the approach
- **Business rules**: Document the requirement
- **TODOs forbidden**: Fix issues immediately

### Function Documentation
```typescript
/**
 * Parses question text and extracts structured data
 * @param text - Raw question text in standardized format
 * @returns Parsed question object with validation errors
 * @throws ParserError if format is invalid
 */
function parseQuestion(text: string): ParsedQuestion {
  // ...
}
```

### API Documentation
- Use FastAPI automatic OpenAPI generation
- Add descriptions to all endpoints
- Document request/response schemas
- Include example payloads

---

## Environment Variables

### Required Variables
```
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/recallx
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=7

# Frontend
VITE_API_URL=http://localhost:8000
```

### Rules
- **Never commit .env**: Add to .gitignore
- **Provide .env.example**: Template for required variables
- **Validate on startup**: Fail fast if missing
- **Different per environment**: dev, staging, production

---

## File Naming Conventions

### Frontend
- **Components**: PascalCase.tsx (`Dashboard.tsx`)
- **Hooks**: camelCase.ts (`useAuth.ts`)
- **Utils**: kebab-case.ts (`date-utils.ts`)
- **Types**: kebab-case.ts (`auth-types.ts`)
- **Tests**: *.test.ts or *.spec.ts

### Backend
- **Modules**: snake_case.py (`auth_service.py`)
- **Tests**: test_*.py (`test_auth_service.py`)
- **Migrations**: {version}_{description}.py (`001_create_users_table.py`)

---

## Rules for AI Development

### NEVER
- Generate placeholder code or TODO comments
- Use fake data or mock implementations
- Skip error handling
- Ignore edge cases
- Duplicate logic across files
- Mix concerns (UI logic in API calls)
- Create generic names (data, item, thing)
- Skip validation
- Ignore TypeScript errors
- Commit without testing

### ALWAYS
- Write production-ready code
- Follow established patterns
- Include error handling
- Validate inputs
- Use TypeScript strict mode
- Extract reusable logic
- Keep functions small and focused
- Add proper types/interfaces
- Consider performance
- Think about edge cases
- Maintain consistency
- Update related code
- Test before committing

---

## Checklist Before Writing Code

- [ ] Do I understand the requirement?
- [ ] Is there existing code I can reuse?
- [ ] What edge cases exist?
- [ ] What can go wrong?
- [ ] Is this the simplest solution?
- [ ] Does this follow project patterns?
- [ ] Where does this fit in the architecture?
- [ ] What tests are needed?
- [ ] Is this scalable?
- [ ] Is this accessible?

---

## Checklist After Writing Code

- [ ] Code compiles without errors
- [ ] TypeScript strict mode passes
- [ ] All edge cases handled
- [ ] Error handling implemented
- [ ] Validation added
- [ ] Performance considered
- [ ] Accessibility verified
- [ ] Responsive design tested
- [ ] Code is DRY
- [ ] No duplicate logic
- [ ] Naming is clear
- [ ] Functions are focused
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Git commit follows conventions

---

## Dependency Management

### Adding Dependencies
- **Justify**: Explain why the dependency is needed
- **Evaluate**: Check bundle size, maintenance, alternatives
- **Version pinning**: Use exact versions or narrow ranges
- **Security audit**: Check for known vulnerabilities
- **License check**: Ensure compatible license

### Keeping Dependencies Updated
- Regular security updates
- Test after updates
- Document breaking changes
- Update incrementally, not all at once

---

## Deployment Standards

### Pre-Deployment Checklist
- [ ] All tests pass
- [ ] Database migrations prepared
- [ ] Environment variables configured
- [ ] Build process successful
- [ ] Performance tested
- [ ] Security audit completed
- [ ] Backup strategy in place
- [ ] Rollback plan ready

### Production Monitoring
- Error tracking (future)
- Performance monitoring (future)
- Database query analysis (future)
- User analytics (future)

---

## Code Review Standards

### Review Checklist
- [ ] Follows coding standards
- [ ] Tests included and passing
- [ ] No security vulnerabilities
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] Accessible
- [ ] Responsive
- [ ] No console errors
- [ ] Git commits follow conventions
- [ ] No hardcoded values

### Review Attitude
- Constructive feedback
- Focus on code, not person
- Suggest improvements
- Explain reasoning
- Learn from others
