import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  gradient?: boolean
}

export default function Card({
  children,
  className = '',
  onClick,
  gradient = false,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-800 border border-slate-700 rounded-xl p-4 transition-all hover:border-slate-600 ${
        gradient ? 'bg-gradient-to-br from-slate-800 to-slate-900' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
