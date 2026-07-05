import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import SkipToContent from './SkipToContent'
import { Container } from './Container'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SkipToContent />
      <Navbar />
      <div className="flex flex-col md:flex-row">
        <Sidebar />
        <main id="main-content" className="flex-1 px-4 py-3 sm:px-6 lg:px-8 lg:py-5" tabIndex={-1}>
          <Container size="xl" className="py-1">
            <Outlet />
          </Container>
        </main>
      </div>
    </div>
  )
}
