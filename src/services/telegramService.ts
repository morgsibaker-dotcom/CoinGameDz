import { TelegramWebApp, TelegramUser } from '../types/telegram'

/**
 * Check if the app is running inside Telegram WebApp
 */
export const isInsideTelegram = (): boolean => {
  if (typeof window === 'undefined') return false
  return !!window.Telegram?.WebApp
}

/**
 * Get the Telegram WebApp instance
 * Safe - returns null if not available
 */
export const getTelegramWebApp = (): TelegramWebApp | null => {
  if (typeof window === 'undefined') return null
  return window.Telegram?.WebApp ?? null
}

/**
 * Initialize Telegram WebApp
 * Safe - handles cases where Telegram is not available
 */
export const initializeTelegramWebApp = (): void => {
  if (!isInsideTelegram()) {
    console.log('[CoinGameDz] Running outside Telegram - using mock data')
    return
  }

  const webApp = getTelegramWebApp()
  if (!webApp) return

  try {
    // Mark the app as ready
    webApp.ready()
    console.log('[CoinGameDz] Telegram WebApp ready')

    // Expand to full height on mobile
    webApp.expand()
    console.log('[CoinGameDz] Telegram WebApp expanded')
  } catch (error) {
    console.error('[CoinGameDz] Error initializing Telegram WebApp:', error)
  }
}

/**
 * Get Telegram user information
 * Safe - handles cases where Telegram is not available
 */
export const getTelegramUser = (): TelegramUser | null => {
  if (!isInsideTelegram()) return null

  const webApp = getTelegramWebApp()
  if (!webApp) return null

  try {
    const user = webApp.initDataUnsafe?.user
    if (!user) return null

    return {
      id: user.id,
      is_bot: user.is_bot ?? false,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      language_code: user.language_code,
      photo_url: user.photo_url,
      is_premium: user.is_premium,
    }
  } catch (error) {
    console.error('[CoinGameDz] Error getting Telegram user:', error)
    return null
  }
}

/**
 * Get Telegram language code
 * Safe - handles cases where Telegram is not available
 */
export const getTelegramLanguageCode = (): string | null => {
  const user = getTelegramUser()
  return user?.language_code ?? null
}

/**
 * Get Telegram theme parameters
 * Safe - handles cases where Telegram is not available
 */
export const getTelegramThemeParams = () => {
  if (!isInsideTelegram()) return null

  const webApp = getTelegramWebApp()
  if (!webApp) return null

  try {
    return webApp.themeParams
  } catch (error) {
    console.error('[CoinGameDz] Error getting Telegram theme params:', error)
    return null
  }
}

/**
 * Get safe area insets for Telegram Mini App
 * Useful for positioning fixed elements on mobile
 */
export const getSafeAreaInsets = () => {
  if (!isInsideTelegram()) {
    return { top: 0, bottom: 0, left: 0, right: 0 }
  }

  const webApp = getTelegramWebApp()
  if (!webApp) return { top: 0, bottom: 0, left: 0, right: 0 }

  try {
    return webApp.safeAreaInset
  } catch (error) {
    console.error('[CoinGameDz] Error getting safe area insets:', error)
    return { top: 0, bottom: 0, left: 0, right: 0 }
  }
}

/**
 * Get content safe area insets
 * Accounts for system UI like keyboards
 */
export const getContentSafeAreaInsets = () => {
  if (!isInsideTelegram()) {
    return { top: 0, bottom: 0, left: 0, right: 0 }
  }

  const webApp = getTelegramWebApp()
  if (!webApp) return { top: 0, bottom: 0, left: 0, right: 0 }

  try {
    return webApp.contentSafeAreaInset
  } catch (error) {
    console.error('[CoinGameDz] Error getting content safe area insets:', error)
    return { top: 0, bottom: 0, left: 0, right: 0 }
  }
}

/**
 * Close the Telegram Mini App
 */
export const closeTelegramApp = (): void => {
  if (!isInsideTelegram()) return

  const webApp = getTelegramWebApp()
  if (!webApp) return

  try {
    webApp.close()
  } catch (error) {
    console.error('[CoinGameDz] Error closing Telegram WebApp:', error)
  }
}

/**
 * Send data to Telegram bot
 * Used for bot communication
 */
export const sendDataToTelegram = (data: string): void => {
  if (!isInsideTelegram()) return

  const webApp = getTelegramWebApp()
  if (!webApp) return

  try {
    webApp.sendData(data)
  } catch (error) {
    console.error('[CoinGameDz] Error sending data to Telegram:', error)
  }
}

/**
 * Open a link in Telegram
 * Used for external links
 */
export const openLinkInTelegram = (url: string): void => {
  if (!isInsideTelegram()) {
    window.open(url, '_blank')
    return
  }

  const webApp = getTelegramWebApp()
  if (!webApp) {
    window.open(url, '_blank')
    return
  }

  try {
    webApp.openLink(url)
  } catch (error) {
    console.error('[CoinGameDz] Error opening link in Telegram:', error)
    window.open(url, '_blank')
  }
}

/**
 * Show an alert in Telegram
 */
export const showTelegramAlert = (
  message: string,
  callback?: () => void
): void => {
  if (!isInsideTelegram()) {
    alert(message)
    callback?.()
    return
  }

  const webApp = getTelegramWebApp()
  if (!webApp) {
    alert(message)
    callback?.()
    return
  }

  try {
    webApp.showAlert(message, callback)
  } catch (error) {
    console.error('[CoinGameDz] Error showing Telegram alert:', error)
    alert(message)
    callback?.()
  }
}

/**
 * Show a confirmation dialog in Telegram
 */
export const showTelegramConfirm = (
  message: string,
  callback?: (confirmed: boolean) => void
): void => {
  if (!isInsideTelegram()) {
    const result = confirm(message)
    callback?.(result)
    return
  }

  const webApp = getTelegramWebApp()
  if (!webApp) {
    const result = confirm(message)
    callback?.(result)
    return
  }

  try {
    webApp.showConfirm(message, callback)
  } catch (error) {
    console.error('[CoinGameDz] Error showing Telegram confirm:', error)
    const result = confirm(message)
    callback?.(result)
  }
}
