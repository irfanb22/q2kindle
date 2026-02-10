export type Article = {
  id: string;
  url: string;
  title: string | null;
  author: string | null;
  description: string | null;
  content: string | null;
  read_time_minutes: number | null;
  status: string;
  created_at: string;
  sent_at: string | null;
};
