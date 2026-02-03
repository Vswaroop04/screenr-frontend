'use client'

import { useAuthStore } from '@/lib/auth-store'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogOut, Mail, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CandidateSettingsPage () {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className='space-y-6 max-w-2xl'>
      <div>
        <h1 className='text-2xl font-bold'>Settings</h1>
        <p className='text-muted-foreground text-sm'>
          Manage your account settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Account Information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label className='flex items-center gap-2'>
              <Mail className='w-4 h-4' />
              Email
            </Label>
            <Input value={user?.email || ''} disabled />
          </div>
          <div className='space-y-2'>
            <Label className='flex items-center gap-2'>
              <User className='w-4 h-4' />
              Role
            </Label>
            <Input value={user?.role || 'candidate'} disabled className='capitalize' />
          </div>
        </CardContent>
      </Card>

      <Card className='border-destructive/30'>
        <CardHeader>
          <CardTitle className='text-lg text-destructive'>
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground mb-4'>
            Sign out of your account on this device.
          </p>
          <Button variant='destructive' onClick={handleLogout}>
            <LogOut className='w-4 h-4 mr-2' />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
