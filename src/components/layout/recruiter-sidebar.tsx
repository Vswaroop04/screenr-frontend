'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'
import {
  Briefcase,
  Users,
  Settings,
  UserPlus,
  LayoutDashboard
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/recruiter/home',
    icon: LayoutDashboard
  },
  {
    name: 'Jobs',
    href: '/recruiter',
    icon: Briefcase
  },
  {
    name: 'Candidates',
    href: '/recruiter/candidates',
    icon: Users
  },
  {
    name: 'Team',
    href: '/recruiter/team',
    icon: UserPlus
  },
  {
    name: 'Settings',
    href: '/recruiter/settings',
    icon: Settings
  }
]

export function RecruiterSidebar () {
  const pathname = usePathname()

  return (
    <div className='flex h-screen w-64 flex-col border-r bg-card'>
      <div className='flex h-16 items-center border-b px-6'>
        <Logo size='lg' />
      </div>
      <nav className='flex-1 space-y-1 px-3 py-4'>
        {navigation.map(item => {
          // More specific active detection to avoid multiple highlights
          const isActive =
            pathname === item.href ||
            (item.href !== '/recruiter' &&
              pathname?.startsWith(item.href + '/')) ||
            (item.href === '/recruiter' && pathname === '/recruiter')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className='h-5 w-5' />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
