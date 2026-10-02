import { create } from 'zustand'
import { TelegramUser } from '../types/telegram'
import {
  getTelegramUser,
  getTelegramLanguageCode,
  getTelegramWebApp,
  isInsideTelegram,
} from '../services/telegramService'
import { supabase } from '../lib/supabase'

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
        /*
         * Development / browser fallback.
         */
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

        /*
         * Telegram start parameter.
         *
         * Example:
         * ?startapp=ref_CGD12345678
         *
         * Telegram puts this value inside
         * initData as start_param.
         *
         * We do not trust or process the value
         * on the client. The Edge Function
         * validates Telegram's signed initData
         * and processes the referral.
         */
        const startParam =
          webApp?.initDataUnsafe?.start_param ??
          null

        /*
         * Create / reuse anonymous Supabase Auth
         * session.
         *
         * The Edge Function links this Auth
         * identity with the validated Telegram user.
         */
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

        /*
         * Authenticate Telegram user through
         * the Supabase Edge Function.
         *
         * initData remains the trusted source.
         * startParam is included only for logging /
         * compatibility; the Edge Function reads the
         * signed start_param from initData itself.
         */
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
              telegramUser.id,
            username:
              telegramUser.username,
            startParam,
          },
        )
      } catch (error) {
        console.error(
          '[CoinGameDz] Telegram authentication failed',
          error,
        )

        /*
         * Keep the Telegram user available in
         * the interface even if the backend request
         * temporarily fails.
         */
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
