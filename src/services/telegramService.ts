import type { TelegramUser, TelegramWebApp } from '../types/telegram'

export function getTelegramWebApp(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null
}

export function isInsideTelegram(): boolean {
  return !!getTelegramWebApp()
}

export function initializeTelegramWebApp(): void {
  const webApp = getTelegramWebApp()

  if (!webApp) {
    return
  }

  webApp.ready()
  webApp.expand()
}

export function getTelegramUser(): TelegramUser | null {
  const webApp = getTelegramWebApp()

  return webApp?.initDataUnsafe?.user ?? null
}

export function getTelegramLanguageCode(): string | null {
  return getTelegramUser()?.language_code ?? null
export function getSafeAreaInsets() {
  const webApp = getTelegramWebApp()

  return {
    top: webApp?.safeAreaInset?.top ?? 0,
    bottom: webApp?.safeAreaInset?.bottom ?? 0,
    left: webApp?.safeAreaInset?.left ?? 0,
    right: webApp?.safeAreaInset?.right ?? 0,
}
