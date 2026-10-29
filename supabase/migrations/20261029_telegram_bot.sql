-- ============================================================
-- Migration: Add Telegram Bot Notifications to system_settings
-- Created at: 2026-10-29
-- ============================================================

ALTER TABLE system_settings 
ADD COLUMN IF NOT EXISTS telegram_bot_token TEXT,
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT,
ADD COLUMN IF NOT EXISTS telegram_notify_order BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS telegram_notify_debt BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS telegram_notify_closing BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS telegram_notify_broken BOOLEAN DEFAULT false;

COMMENT ON COLUMN system_settings.telegram_bot_token IS 'Telegram Bot HTTP API Token from @BotFather';
COMMENT ON COLUMN system_settings.telegram_chat_id IS 'Telegram Target User Chat ID or Group ID';
COMMENT ON COLUMN system_settings.telegram_notify_order IS 'Toggle for instant notification on new POS sale/order';
COMMENT ON COLUMN system_settings.telegram_notify_debt IS 'Toggle for customer debt repayment alerts';
COMMENT ON COLUMN system_settings.telegram_notify_closing IS 'Toggle for daily summary/closing report alerts';
COMMENT ON COLUMN system_settings.telegram_notify_broken IS 'Toggle for broken/damaged goods alerts';

