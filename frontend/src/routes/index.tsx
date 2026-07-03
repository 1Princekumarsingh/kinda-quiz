import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Subjects from '@/pages/Subjects'
import Chapters from '@/pages/Chapters'
import QuestionImport from '@/pages/QuestionImport'
import Quiz from '@/pages/Quiz'
import QuizResults from '@/pages/QuizResults'
import QuizReview from '@/pages/QuizReview'
import History from '@/pages/History'
import Statistics from '@/pages/Statistics'
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Quiz Route - Full screen, no layout */}
      <Route
        path="/quiz/:chapterId"
        element={
          <ProtectedRoute>
            <Quiz />
          </ProtectedRoute>
        }
      />
      
      {/* Quiz Results Route - Full screen, no layout */}
      <Route
        path="/quiz/results/:chapterId"
        element={
          <ProtectedRoute>
            <QuizResults />
          </ProtectedRoute>
        }
      />
      
      {/* Quiz Review Route - Full screen, no layout */}
      <Route
        path="/quiz/review/:chapterId"
        element={
          <ProtectedRoute>
            <QuizReview />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="subjects/:subjectId/chapters" element={<Chapters />} />
        <Route path="subjects/:subjectId/chapters/:chapterId/import" element={<QuestionImport />} />
        <Route path="history" element={<History />} />
        <Route path="statistics" element={<Statistics />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
