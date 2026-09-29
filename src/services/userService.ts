import { supabase } from "../lib/supabase";

export async function getUserByTelegramId(telegramId: number) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
