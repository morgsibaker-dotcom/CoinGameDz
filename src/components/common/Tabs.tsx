import React, { useState } from 'react'

interface TabsProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
}

interface TabsListProps {
  children: React.ReactNode
}

interface TabsTriggerProps {
  children: React.ReactNode
  value: string
}

interface TabsContentProps {
  children: React.ReactNode
  value: string
  className?: string
}

const TabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
}>({
  value: '',
  onValueChange: () => {},
})

export function Tabs({ children, value = '', onValueChange = () => {} }: TabsProps) {
  const [activeTab, setActiveTab] = useState(value)

  const handleValueChange = (newValue: string) => {
    setActiveTab(newValue)
    onValueChange(newValue)
  }

  return (
    <TabsContext.Provider value={{ value: activeTab, onValueChange: handleValueChange }}>
      {children}
    </TabsContext.Provider>
  )
}

export function TabsList({ children }: TabsListProps) {
  return (
    <div className="flex gap-2 border-b border-slate-700">
      {children}
    </div>
  )
}

export function TabsTrigger({ children, value }: TabsTriggerProps) {
  const { value: activeValue, onValueChange } = React.useContext(TabsContext)
  const isActive = activeValue === value

  return (
    <button
      onClick={() => onValueChange(value)}
      className={`px-4 py-2 font-semibold text-sm transition-colors border-b-2 ${
        isActive
          ? 'text-blue-400 border-blue-400'
          : 'text-slate-400 border-transparent hover:text-slate-300'
      }`}
    >
      {children}
    </button>
  )
}

export function TabsContent({ children, value, className = '' }: TabsContentProps) {
  const { value: activeValue } = React.useContext(TabsContext)

  if (activeValue !== value) return null

  return <div className={className}>{children}</div>
}
