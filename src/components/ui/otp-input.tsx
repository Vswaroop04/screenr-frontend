'use client'

import { useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
}

export function OtpInput ({
  value,
  onChange,
  length = 6,
  disabled = false
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const digits = value.split('').concat(Array(length).fill('')).slice(0, length)

  const focusInput = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, length - 1))
      inputRefs.current[clamped]?.focus()
    },
    [length]
  )

  const handleChange = useCallback(
    (index: number, char: string) => {
      if (!/^\d*$/.test(char)) return

      const newDigits = [...digits]
      newDigits[index] = char.slice(-1)
      const newValue = newDigits.join('')
      onChange(newValue.replace(/\s/g, ''))

      if (char && index < length - 1) {
        focusInput(index + 1)
      }
    },
    [digits, onChange, length, focusInput]
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault()
        const newDigits = [...digits]
        if (digits[index]) {
          newDigits[index] = ''
          onChange(newDigits.join('').replace(/\s/g, ''))
        } else if (index > 0) {
          newDigits[index - 1] = ''
          onChange(newDigits.join('').replace(/\s/g, ''))
          focusInput(index - 1)
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        focusInput(index - 1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        focusInput(index + 1)
      }
    },
    [digits, onChange, focusInput]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
      if (pasted) {
        onChange(pasted)
        focusInput(Math.min(pasted.length, length - 1))
      }
    },
    [onChange, length, focusInput]
  )

  return (
    <div className='flex gap-2 justify-center' onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={el => {
            inputRefs.current[index] = el
          }}
          type='text'
          inputMode='numeric'
          autoComplete='one-time-code'
          maxLength={1}
          value={digit}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          onFocus={e => e.target.select()}
          disabled={disabled}
          className={cn(
            'w-12 h-14 text-center text-2xl font-semibold rounded-lg border border-input bg-background',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'transition-all duration-150',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            digit && 'border-primary'
          )}
        />
      ))}
    </div>
  )
}
