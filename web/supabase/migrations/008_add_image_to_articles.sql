-- Add image column to articles for storing og:image / featured image URL
ALTER TABLE articles ADD COLUMN image text;
