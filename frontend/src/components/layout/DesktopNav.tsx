import { NavLink } from 'react-router-dom'

interface NavigationItem {
  label: string
  path: string
}

interface DesktopNavProps {
  navigationItems: NavigationItem[]
  currentPath: string
}

export default function DesktopNav({ navigationItems, currentPath }: DesktopNavProps) {
  return (
    <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
      {navigationItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/dashboard'}
          className={({ isActive }) =>
            `rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 lg:px-5 lg:py-2.5 ${
              isActive || currentPath === item.path
                ? 'bg-primary-50 text-primary-700 shadow-sm underline decoration-2 underline-offset-4'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
