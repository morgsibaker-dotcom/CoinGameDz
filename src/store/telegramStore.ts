import { create } from 'zustand'
import { TelegramUser } from '../types/telegram'
import {
  getTelegramUser,
  getTelegramLanguageCode,
  isInsideTelegram,
} from '../services/telegramService'
import { registerTelegramUser } from '../services/telegramUserService'

// Mock Telegram user for development/fallback
const createMockTelegramUser = (): TelegramUser => ({
  id: 123456789,
  is_bot: false,
  first_name: 'Player',
  last_name: 'Username',
  username: 'player_username',
  language_code: 'en',
  photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user123',
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
    const user = getTelegramUser() || createMockTelegramUser()
    const languageCode = getTelegramLanguageCode()

    set({
      isInsideTelegram: inside,
      telegramUser: user,
      telegramLanguageCode: languageCode,
      isRegistering: true,
    })

    try {
  if (inside) {
    await registerTelegramUser(user)

    console.log('[CoinGameDz] Telegram user registered in Supabase', {
      telegramId: user.id,
      username: user.username,
    })
    
    } catch (error) {
      console.error(
        '[CoinGameDz] Failed to register Telegram user in Supabase',
        error
      )
    } finally {
      set({
        isRegistering: false,
      })
    }

    console.log('[CoinGameDz] Telegram store initialized', {
      inside,
      user: user.first_name,
      language: languageCode,
    })
  },
}))
