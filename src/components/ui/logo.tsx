'use client'

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
    lg: 'text-3xl'
  }[size]

  const iconSize = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-8 h-8'
  }[size]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showIcon && (
        <svg
          viewBox='0 0 32 32'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className={iconSize}
        >
          <path
            d='M16 2L4 8v8c0 7.2 5.1 13.9 12 16 6.9-2.1 12-8.8 12-16V8L16 2z'
            className='fill-primary/20 stroke-primary'
            strokeWidth='1.5'
          />
          <path
            d='M11 16l3.5 3.5L21.5 12'
            className='stroke-primary'
            strokeWidth='2.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      )}
      <span
        className={cn(
          textSize,
          'font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent'
        )}
      >
        Verify Dev
      </span>
    </div>
  )
}
