export interface BlogPost {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  readMoreLink?: string;
  author?: string;
  authorRole?: string;
  category?: string;
  readTime?: string;
  fullContent?: string[];
  quote?: string;
  keyTakeaways?: string[];
}