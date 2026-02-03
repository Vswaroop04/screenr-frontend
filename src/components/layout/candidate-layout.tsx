'use client'

import { CandidateSidebar } from './candidate-sidebar'
import { UserNav } from './user-nav'

interface CandidateLayoutProps {
  children: React.ReactNode
}

export function CandidateLayout ({ children }: CandidateLayoutProps) {
  return (
    <div className='flex h-screen overflow-hidden'>
      <CandidateSidebar />
      <div className='flex flex-1 flex-col overflow-hidden'>
        <header className='flex h-16 items-center justify-end border-b px-6'>
          <UserNav />
        </header>
        <main className='flex-1 overflow-y-auto p-6'>{children}</main>
      </div>
    </div>
  )
}
