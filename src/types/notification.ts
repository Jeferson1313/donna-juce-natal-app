export interface AppNotification {
  id: string;
  customer_id: string;
  title: string;
  body: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

