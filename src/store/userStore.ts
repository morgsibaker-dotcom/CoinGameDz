import { create } from 'zustand'
import { User } from '../types'
import { getUserByTelegramId } from '../services/userService'
import { useTelegramStore } from './telegramStore'

interface UserStore {
  user: User | null
  isLoading: boolean
  loadUser: () => Promise<void>
  setUser: (user: User) => void
  updatePoints: (points: number) => void
  updateLevel: (level: number) => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: false,

  loadUser: async () => {
    set({ isLoading: true })

    try {
      const telegramUser =
        useTelegramStore.getState().telegramUser

      if (!telegramUser) {
        return
      }

      const dbUser = await getUserByTelegramId(telegramUser.id)

      if (!dbUser) {
        return
      }

      const user: User = {
        id: String(dbUser.telegram_id),
        username: dbUser.username ?? '',
        avatar: '',
        points: dbUser.points ?? 0,
        level: dbUser.level ?? 1,
        usdEquivalent: (dbUser.points ?? 0) / 1000,
        joinDate: new Date(dbUser.created_at),
        referralCode: dbUser.referral_code ?? '',
        referralCount: dbUser.referral_count ?? 0,
        referralEarnings: dbUser.referral_earnings ?? 0,
      }

      set({ user })
    } catch (error) {
      console.error('[CoinGameDz] Failed to load user', error)
    } finally {
      set({ isLoading: false })
    }
  },

  setUser: (user) => set({ user }),

  updatePoints: (points) =>
    set((state) => {
      if (!state.user) return state

      return {
        user: {
          ...state.user,
          points,
          usdEquivalent: points / 1000,
        },
      }
    }),

  updateLevel: (level) =>
    set((state) => {
      if (!state.user) return state

      return {
        user: {
          ...state.user,
          level,
        },
      }
    }),
}))
