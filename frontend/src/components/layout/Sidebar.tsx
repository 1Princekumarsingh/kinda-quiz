import { NavLink } from 'react-router-dom'

const navigation = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Subjects', path: '/subjects' },
  { name: 'History', path: '/history' },
  { name: 'Statistics', path: '/statistics' },
]

export default function Sidebar() {
  return (
    <aside aria-label="Sidebar navigation" className="hidden md:block w-full bg-white border-b border-gray-200 md:w-48 md:min-h-[calc(100vh-4rem)] md:border-r md:border-b-0">
      <nav aria-label="Primary" className="space-y-1 p-2 md:p-3 md:sticky md:top-16">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-lg px-2 md:px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
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
