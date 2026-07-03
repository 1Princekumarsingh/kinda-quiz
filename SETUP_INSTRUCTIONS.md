# RecallX - Setup Instructions

## Prerequisites
- Python 3.14+
- Node.js 18+ and npm
- PostgreSQL database

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Create virtual environment (if not exists)
```bash
python -m venv venv
```

### 3. Activate virtual environment
**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### 4. Install dependencies
```bash
pip install -r requirements.txt
```

### 5. Configure environment variables
Copy `.env.example` to `.env` and update with your database credentials:
```
DATABASE_URL=postgresql://user:password@localhost:5432/recallx
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=7
```

### 6. Run database migrations
```bash
alembic upgrade head
```

This will create all necessary tables including:
- users
- subjects
- chapters
- questions

### 7. Start backend server
```bash
uvicorn app.main:app --reload --port 8000
```

Backend will be available at: http://localhost:8000

## Frontend Setup

### 1. Navigate to frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create `.env` file in frontend directory:
```
VITE_API_URL=http://localhost:8000
```

### 4. Start development server
```bash
npm run dev
```

Frontend will be available at: http://localhost:5173

## Verify Installation

### 1. Check Backend
Visit: http://localhost:8000/docs

You should see the FastAPI Swagger documentation with all API endpoints.

### 2. Check Frontend
Visit: http://localhost:5173

You should see the RecallX login page.

### 3. Create Test Account
1. Enter any username (e.g., "testuser")
2. Account will be created automatically
3. You'll be redirected to the Dashboard

### 4. Test Complete Workflow
1. Create a Subject (e.g., "Data Structures")
2. Create a Chapter (e.g., "Arrays")
3. Click "Import Questions"
4. Paste test questions from TEST_QUESTIONS.txt
5. Click "Parse Questions"
6. Review parsed questions
7. Edit any question if needed
8. Click "Save Valid Questions"
9. Verify redirect to chapter page
10. Questions should now be saved (counts will update)

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Ensure database exists: `createdb recallx`

### Migration Errors
- Reset migrations: `alembic downgrade base` then `alembic upgrade head`
- Check alembic.ini sqlalchemy.url matches your DATABASE_URL

### Backend Won't Start
- Verify virtual environment is activated
- Check all dependencies installed: `pip list`
- Verify port 8000 is not in use

### Frontend Won't Start
- Clear node_modules: `rm -rf node_modules` then `npm install`
- Clear npm cache: `npm cache clean --force`
- Verify port 5173 is not in use

### CORS Errors
- Verify backend is running on port 8000
- Check frontend VITE_API_URL is correct
- Check backend CORS settings in app/main.py

## Development Tips

### Backend Hot Reload
The `--reload` flag enables hot reloading. Changes to Python files will automatically restart the server.

### Frontend Hot Reload
Vite automatically reloads when you save changes to React/TypeScript files.

### Database Migrations
After modifying models, create a new migration:
```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### API Testing
Use the Swagger UI at http://localhost:8000/docs to test API endpoints directly.

### View Database
Use a PostgreSQL client (pgAdmin, DBeaver, or psql) to view/query the database directly.

## Next Steps After Setup

1. ✅ Backend running on port 8000
2. ✅ Frontend running on port 5173
3. ✅ Database migrations applied
4. ✅ Can create subjects and chapters
5. ✅ Can import and save questions
6. 🎯 Next: Build question list/detail pages
7. 🎯 Next: Implement quiz system

## Current Status

**Phase Complete:**
- Authentication ✅
- Subject CRUD ✅
- Chapter CRUD ✅
- Question Import + Preview + Edit + Save ✅

**Next Phase:**
- Question List & Detail Views
- Quiz System (Practice & Exam Modes)
- Statistics & Analytics

Refer to STATUS.md for detailed progress tracking.
