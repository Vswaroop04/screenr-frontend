'use client'

import { useRouter } from 'next/navigation'
import { LogOut, Settings, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/lib/auth-store'
import { authApi } from '@/lib/auth-api'
import { toast } from 'sonner'

export function UserNav () {
  const router = useRouter()
  const { user, token, logout } = useAuthStore()

  if (!user) return null

  const handleLogout = async () => {
    try {
      if (token) {
        await authApi.logout(token)
      }
      logout()
      toast.success('Logged out successfully')
      router.push('/')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  const handleDashboard = () => {
    const dashboardPath =
      user.role === 'recruiter' ? '/recruiter/home' : '/candidate/home'
    router.push(dashboardPath)
  }

  const getInitials = (name?: string) => {
    if (!name) return user.email.charAt(0).toUpperCase()
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-10 w-10 rounded-full'>
          <Avatar className='h-10 w-10'>
            <AvatarImage
              src={user.profilePicture || undefined}
              alt={user.fullName || user.email}
            />
            <AvatarFallback className='bg-gradient-to-br from-primary to-primary-glow text-white'>
              {getInitials(user.fullName || undefined)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>
              {user.fullName || 'User'}
            </p>
            <p className='text-xs leading-none text-muted-foreground'>
              {user.email}
            </p>
            <p className='text-xs leading-none text-muted-foreground capitalize mt-1'>
              {user.role}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDashboard}>
          <LayoutDashboard className='mr-2 h-4 w-4' />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/${user.role}/settings`)}>
          <Settings className='h-4 w-4 mr-2' />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className='text-red-600'>
          <LogOut className='mr-2 h-4 w-4' />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
