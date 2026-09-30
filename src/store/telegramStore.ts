import { create } from 'zustand'
import { TelegramUser } from '../types/telegram'
import {
  getTelegramUser,
  getTelegramLanguageCode,
  getTelegramWebApp,
  isInsideTelegram,
} from '../services/telegramService'
import { registerTelegramUser } from '../services/telegramUserService'
import { supabase } from '../lib/supabase'

// Mock Telegram user for development/fallback
const createMockTelegramUser = (): TelegramUser => ({
  id: 123456789,
  is_bot: false,
  first_name: 'Player',
  last_name: 'Username',
  username: 'player_username',
  language_code: 'en',
  photo_url:
    'https://api.dicebear.com/7.x/avataaars/svg?seed=user123',
})

interface TelegramStore {
  telegramUser: TelegramUser | null
  isInsideTelegram: boolean
  telegramLanguageCode: string | null
  isRegistering: boolean
  initializeTelegram: () => Promise<void>
}

export const useTelegramStore = create<TelegramStore>((set) => ({
  telegramUser: null,
  isInsideTelegram: false,
  telegramLanguageCode: null,
  isRegistering: false,

  initializeTelegram: async () => {
    const inside = isInsideTelegram()

    set({
      isInsideTelegram: inside,
      isRegistering: true,
    })

    try {
      if (!inside) {
        const mockUser = createMockTelegramUser()

        set({
          telegramUser: mockUser,
          telegramLanguageCode: mockUser.language_code ?? 'en',
        })

        return
      }

      const webApp = getTelegramWebApp()
      const initData = webApp?.initData

      if (!initData) {
        throw new Error(
          'Telegram initData is missing'
        )
      }

      const { data, error } =
        await supabase.functions.invoke(
          'telegram-auth',
          {
            body: {
              initData,
            },
          }
        )

      if (error) {
        throw new Error(error.message)
      }

      if (!data?.success || !data?.user) {
        throw new Error(
          data?.error ?? 'Telegram authentication failed'
        )
      }

      const telegramUser =
        data.user as TelegramUser

      await registerTelegramUser(telegramUser)

      set({
        telegramUser,
        telegramLanguageCode:
          telegramUser.language_code ?? null,
      })

      console.log(
        '[CoinGameDz] Telegram authentication successful',
        {
          telegramId: telegramUser.id,
          username: telegramUser.username,
        }
      )
    } catch (error) {
      console.error(
        '[CoinGameDz] Telegram authentication failed',
        error
      )

      set({
        telegramUser:
          getTelegramUser() ?? null,
        telegramLanguageCode:
          getTelegramLanguageCode(),
      })
    } finally {
      set({
        isRegistering: false,
      })
    }
  },
}))
