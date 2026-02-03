'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  User,
  Settings
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/candidate/home',
    icon: LayoutDashboard
  },
  {
    name: 'My Resumes',
    href: '/candidate/resumes',
    icon: FileText
  },
  {
    name: 'Match Checker',
    href: '/candidate',
    icon: Sparkles
  },
  {
    name: 'Profile',
    href: '/candidate/profile',
    icon: User
  },
  {
    name: 'Settings',
    href: '/candidate/settings',
    icon: Settings
  }
]

export function CandidateSidebar () {
  const pathname = usePathname()

  return (
    <div className='flex h-screen w-64 flex-col border-r bg-card'>
      <div className='flex h-16 items-center border-b px-6'>
        <Logo size='lg' />
      </div>
      <nav className='flex-1 space-y-1 px-3 py-4'>
        {navigation.map(item => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/candidate' &&
              pathname?.startsWith(item.href + '/')) ||
            (item.href === '/candidate' && pathname === '/candidate')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
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
