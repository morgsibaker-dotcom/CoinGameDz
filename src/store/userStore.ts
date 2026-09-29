import { create } from 'zustand'
import { User } from '../types'

interface UserStore {
  user: User | null
  setUser: (user: User) => void
  updatePoints: (points: number) => void
  updateLevel: (level: number) => void
}

const mockUser: User = {
  id: '123456789',
  username: 'Player_Username',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user123',
  points: 15230,
  level: 12,
  usdEquivalent: 45.69,
  joinDate: new Date('2024-01-15'),
  referralCode: 'COIN2024ABC',
  referralCount: 8,
  referralEarnings: 2340,
}

export const useUserStore = create<UserStore>((set) => ({
  user: mockUser,
  setUser: (user) => set({ user }),
  updatePoints: (points) =>
    set((state) => {
      if (!state.user) return state
      const newUser = { ...state.user, points }
      return { user: newUser }
    }),
  updateLevel: (level) =>
    set((state) => {
      if (!state.user) return state
      const newUser = { ...state.user, level }
      return { user: newUser }
    }),
}))
