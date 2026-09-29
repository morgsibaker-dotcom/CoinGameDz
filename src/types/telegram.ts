/**
 * Telegram WebApp type declarations
 * Reference: https://core.telegram.org/bots/webapps
 */

export interface TelegramUser {
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
  is_premium?: boolean
}

export interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    query_id?: string
    user?: TelegramUser
    auth_date?: number
    hash?: string
    [key: string]: any
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
    header_bg_color?: string
    accent_text_color?: string
    section_bg_color?: string
    section_header_text_color?: string
    subtitle_text_color?: string
    destructive_text_color?: string
    keyboard_bg_color?: string
    keyboard_button_color?: string
    keyboard_button_text_color?: string
    input_border_color?: string
    botStartParam?: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  isClosingConfirmationEnabled: boolean
  headerColor: string
  backgroundColor: string
  botId: number
  isVerticalSwipesEnabled: boolean
  isOrientationLocked: boolean
  safeAreaInset: {
    top: number
    bottom: number
    left: number
    right: number
  }
  contentSafeAreaInset: {
    top: number
    bottom: number
    left: number
    right: number
  }

  ready(): void
  expand(): void
  close(): void
  onEvent(
    eventType: string,
    callback: (data?: any) => void
  ): void
  offEvent(
    eventType: string,
    callback: (data?: any) => void
  ): void
  sendData(data: string): void
  openLink(url: string, options?: { try_instant_view?: boolean }): void
  openTelegramLink(url: string): void
  showPopup(
    params: {
      title?: string
      message: string
      buttons?: Array<{
        id: string
        type: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
        text?: string
      }>
    },
    callback?: (buttonId?: string) => void
  ): void
  showAlert(message: string, callback?: () => void): void
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void
  showScanQrPopup(
    params: { text?: string },
    callback?: (data?: string) => void
  ): void
  closeScanQrPopup(): void
  readTextFromClipboard(callback?: (text?: string) => void): void
  requestWriteAccess(callback?: (allowed: boolean) => void): void
  requestContactAccess(callback?: (allowed: boolean) => void): void
  invokeCustomMethod(
    method: string,
    params?: Record<string, any>,
    callback?: (error?: string, result?: any) => void
  ): void
  setEventListener(eventType: string, callback: (data?: any) => void): void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}
