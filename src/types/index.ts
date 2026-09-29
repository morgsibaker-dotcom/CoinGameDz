export interface User {
  id: string
  username: string
  avatar?: string
  points: number
  level: number
  usdEquivalent: number
  joinDate: Date
  referralCode: string
  referralCount: number
  referralEarnings: number
}

export interface Task {
  id: string
  title: string
  description: string
  reward: number
  icon: string
  completed: boolean
  category: 'watch' | 'click' | 'survey' | 'game'
}

export interface Reward {
  id: string
  title: string
  description: string
  icon: string
  claimed: boolean
  claimDate?: Date
  type: 'daily' | 'streak' | 'welcome' | 'gift' | 'achievement'
}

export interface Transaction {
  id: string
  type: 'earn' | 'withdraw' | 'bonus'
  amount: number
  description: string
  date: Date
  status: 'completed' | 'pending' | 'failed'
}

export interface WithdrawalMethod {
  id: string
  name: string
  icon: string
  minAmount: number
  maxAmount: number
  fee: number
}
