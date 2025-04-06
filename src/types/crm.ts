export interface Client {
  id: string;
  company_name: string;
  contact_name: string;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  address: string | null;
  region: string | null;
  annual_revenue: number | null;
  created_at: string;
  created_by: string;
  updated_at: string;
}

export interface Call {
  id: string;
  client_id: string;
  agent_id: string;
  status: 'success' | 'callback' | 'no_answer';
  notes: string | null;
  scheduled_callback: string | null;
  created_at: string;
  clients?: {
    company_name: string;
    contact_name: string;
  };
}

export interface Appointment {
  id: string;
  client_id: string;
  agent_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  created_at: string;
  clients?: {
    company_name: string;
    contact_name: string;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  recipient_id: string;
  is_read: boolean;
  created_at: string;
  created_by: string;
}

export interface Document {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  shared_by: string;
  created_at: string;
}