'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export function Logo ({ className, size = 'md', showIcon = true }: LogoProps) {
  const textSize = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-2xl'
  }[size]

  const iconSize = {
    sm: 32,
    md: 48,
    lg: 64
  }[size]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showIcon && (
        <span className='text-3xl bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent'>
          ✦
        </span>
      )}
      <span
        className={cn(
          textSize,
          'font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent'
        )}
      >
        Screenr
      </span>
    </div>
  )
}
