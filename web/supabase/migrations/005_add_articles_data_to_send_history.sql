-- Migration 005: Add articles_data to send_history
-- Stores snapshot of article titles and URLs per send for the history detail view.

ALTER TABLE send_history ADD COLUMN articles_data jsonb;
