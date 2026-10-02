import { create } from 'zustand'
import {
  getTelegramUser,
  getTelegramLanguageCode,
  getTelegramWebApp,
  isInsideTelegram,
} from '../services/telegramService'
import { supabase } from '../lib/supabase'

interface TelegramUser {
  id: number
  is_bot?: boolean
  first_name?: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
  is_premium?: boolean
}

const createMockTelegramUser = (): TelegramUser => ({
  id: 123456789,
  is_bot: false,
  first_name: 'Player',
  last_name: 'Username',
  username: 'player_username',
  language_code: 'en',
  photo_url:
    'https://api.dicebear.com/7.x/avataaars/svg?seed=user123',
  is_premium: false,
})

interface TelegramStore {
  telegramUser: TelegramUser | null
  isInsideTelegram: boolean
  telegramLanguageCode: string | null
  isRegistering: boolean
  initializeTelegram: () => Promise<void>
}

export const useTelegramStore =
  create<TelegramStore>((set) => ({
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
          const mockUser =
            createMockTelegramUser()

          set({
            telegramUser: mockUser,
            telegramLanguageCode:
              mockUser.language_code ?? 'en',
          })

          return
        }

        const webApp =
          getTelegramWebApp()

        const initData =
          webApp?.initData

        if (!initData) {
          throw new Error(
            'Telegram initData is missing',
          )
        }

        const startParam =
          webApp?.initDataUnsafe?.start_param ??
          null

        const {
          data: authData,
          error: authError,
        } =
          await supabase.auth.getSession()

        if (authError) {
          throw new Error(
            authError.message,
          )
        }

        if (!authData.session) {
          const {
            error: anonymousError,
          } =
            await supabase.auth.signInAnonymously()

          if (anonymousError) {
            throw new Error(
              anonymousError.message,
            )
          }
        }

        const {
          data,
          error,
        } =
          await supabase.functions.invoke(
            'telegram-auth',
            {
              body: {
                initData,
                startParam,
              },
            },
          )

        if (error) {
          throw new Error(
            error.message,
          )
        }

        if (
          !data?.success ||
          !data?.user
        ) {
          throw new Error(
            data?.error ??
              'Telegram authentication failed',
          )
        }

        const telegramUser =
          data.user as TelegramUser

        set({
          telegramUser,
          telegramLanguageCode:
            telegramUser.language_code ??
            null,
        })

        console.log(
          '[CoinGameDz] Telegram authentication successful',
          {
            telegramId:
             
