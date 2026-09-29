import { supabase } from "../lib/supabase";
import type { TelegramUser } from "../types/telegram";

export async function registerTelegramUser(
  telegramUser: TelegramUser
) {
  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        telegram_id: telegramUser.id,
        username: telegramUser.username ?? null,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name ?? null,
        language_code: telegramUser.language_code ?? "en",
      },
      {
        onConflict: "telegram_id",
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
