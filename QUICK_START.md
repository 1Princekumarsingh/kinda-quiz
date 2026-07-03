# Quick Start - Subject CRUD Testing

## 🚀 Start the Application

### Terminal 1 - Backend
```bash
cd backend
.\venv\Scripts\activate.ps1  # or activate.bat for CMD
alembic upgrade head
uvicorn app.main:app --reload
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

## 🧪 Test Subject CRUD

1. **Login**: http://localhost:5173 (enter any username)

2. **Go to Subjects page** (sidebar)

3. **Create Subject**
   - Click "Add Subject"
   - Enter: "Data Structures & Algorithms"
   - Click "Create Subject" ✅

4. **Create More Subjects**
   - Operating Systems
   - Database Management Systems
   - Machine Learning

5. **Edit Subject**
   - Click pencil icon on any card
   - Change name
   - Click "Save Changes" ✅

6. **Delete Subject**
   - Click trash icon
   - Read warning about cascade delete
   - Click "Delete Subject" ✅

## ✨ What You'll See

- **Grid Layout**: Subjects displayed in responsive grid
- **Subject Cards**: Name, counts, creation date
- **Loading State**: Skeleton cards while loading
- **Empty State**: Friendly message with CTA when no subjects
- **Modals**: Clean create/edit forms with validation
- **Confirmation**: Delete warning with cascade notice
- **Animations**: Smooth transitions and hover effects

## 🎯 Features to Test

- ✅ Create multiple subjects
- ✅ Edit subject names
- ✅ Delete subjects
- ✅ Validation (empty name)
- ✅ Validation (max 200 chars)
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design (resize browser)
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Data persistence (refresh page)

## 🔍 Data Isolation Test

1. Login as "user1" → Create subjects
2. Logout → Login as "user2" → Create different subjects
3. Verify user2 CANNOT see user1's subjects ✅

## 📊 API Testing (Optional)

### Create Subject
```bash
curl -X POST http://localhost:8000/api/subjects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Subject"}'
```

### List Subjects
```bash
curl http://localhost:8000/api/subjects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Subject
```bash
curl -X PUT http://localhost:8000/api/subjects/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

### Delete Subject
```bash
curl -X DELETE http://localhost:8000/api/subjects/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

**Ready to go! 🚀 All Subject CRUD operations are production-ready.**
