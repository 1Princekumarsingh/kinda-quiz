import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import SkipToContent from './SkipToContent'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SkipToContent />
      <Navbar />
      <div className="flex flex-col md:flex-row">
        <Sidebar />
        <main id="main-content" className="flex-1 px-3 py-3 sm:px-4 md:px-3 lg:px-4 lg:py-5" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
