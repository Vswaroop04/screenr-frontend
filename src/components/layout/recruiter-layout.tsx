'use client'

import { RecruiterSidebar } from './recruiter-sidebar'
import { UserNav } from './user-nav'

interface RecruiterLayoutProps {
  children: React.ReactNode
}

export function RecruiterLayout ({ children }: RecruiterLayoutProps) {
  return (
    <div className='flex h-screen overflow-hidden'>
      <RecruiterSidebar />
      <div className='flex flex-1 flex-col overflow-hidden'>
        <header className='flex h-16 items-center justify-end border-b px-6'>
          <UserNav />
        </header>
        <main className='flex-1 overflow-y-auto p-6'>{children}</main>
      </div>
    </div>
  )
}
