import { create } from 'zustand'

interface UserStore {
  user: any | null
  isLoading: boolean
  loadUser: () => Promise<void>
  setUser: (user: any) => void
  updatePoints: (points: number) => void
  updateLevel: (level: number) => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: false,

  loadUser: async () => {
    set({ isLoading: true })

    try {
      const { useTelegramStore } =
        await import('./telegramStore')

      const { getUserByTelegramId } =
        await import('../services/userService')

      const telegramUser =
        useTelegramStore.getState().telegramUser

      if (!telegramUser) {
        return
      }

      const dbUser =
        await getUserByTelegramId(telegramUser.id)

      if (!dbUser) {
        return
      }

      const points =
        Number(dbUser.points_balance ?? 0)

      const user = {
        id: String(dbUser.id),

        username:
          dbUser.username ??
          dbUser.first_name ??
          '',

        avatar:
          dbUser.avatar_url ?? '',

        points,

        level:
          Number(dbUser.level ?? 1),

        usdEquivalent:
          Number(
            dbUser.usd_equivalent ??
            points / 1000
          ),

        joinDate:
          new Date(dbUser.created_at),

        referralCode:
          dbUser.referral_code ?? '',

        referralCount:
          Number(dbUser.referral_count ?? 0),

        referralEarnings:
          Math.floor(
            Number(dbUser.referral_count ?? 0) / 10
          ) * 100,
      }

      set({ user })
    } catch (error) {
      console.error(
        '[CoinGameDz] Failed to load user:',
        error
      )
    } finally {
      set({ isLoading: false })
    }
  },

  setUser: (user) => {
    set({ user })
  },

  updatePoints: (points) => {
    set((state) => {
      if (!state.user) return state

      return {
        user: {
          ...state.user,
          points,
          usdEquivalent: points / 1000,
        },
      }
    })
  },

  updateLevel: (level) => {
    set((state) => {
      if (!state.user) return state

      return {
        user: {
          ...state.user,
          level,
        },
      }
    })
  },
}))
