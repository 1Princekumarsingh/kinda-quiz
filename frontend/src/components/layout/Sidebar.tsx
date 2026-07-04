import { NavLink } from 'react-router-dom'

const navigation = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Subjects', path: '/subjects' },
  { name: 'History', path: '/history' },
  { name: 'Statistics', path: '/statistics' },
]

export default function Sidebar() {
  return (
    <aside className="w-full md:w-64 bg-white border-b border-gray-200 md:border-r md:border-b-0 md:min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-1 md:sticky md:top-16">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
