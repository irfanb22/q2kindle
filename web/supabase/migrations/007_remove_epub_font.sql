-- Remove epub_font column from settings
-- Kindle ignores CSS font-family declarations in EPUBs — the reader's device font setting always wins.
-- The font picker was effectively cosmetic, so we removed it from the app.
ALTER TABLE settings DROP COLUMN IF EXISTS epub_font;
