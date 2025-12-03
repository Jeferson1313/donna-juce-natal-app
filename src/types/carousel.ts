export interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  button_text: string | null;
  button_link: string | null;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
