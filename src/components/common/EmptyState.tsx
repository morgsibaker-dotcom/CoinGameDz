import React from 'react'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="text-slate-400 mb-4">{icon}</div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      {description && <p className="text-slate-400 text-sm">{description}</p>}
    </div>
  )
}
