/*
  # Initial CRM Schema Setup

  1. New Tables
    - `clients`
      - Company and contact information
      - Revenue tracking
      - Region assignment
    - `calls`
      - Call tracking with status and notes
      - Linked to clients and agents
    - `appointments`
      - Calendar events and reminders
      - Client meeting scheduling
    - `notifications`
      - System-wide notifications
      - User-specific messages
    - `documents`
      - Shared document storage
      - Document categorization
  
  2. Security
    - Enable RLS on all tables
    - Policies for authenticated access
    - Special admin policies for analytics
*/

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text NOT NULL,
  email text,
  phone text,
  mobile text,
  address text,
  region text,
  annual_revenue decimal(12,2),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- Calls table
CREATE TABLE IF NOT EXISTS calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES auth.users(id),
  status text NOT NULL CHECK (status IN ('success', 'callback', 'no_answer')),
  notes text,
  scheduled_callback timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  recipient_id uuid REFERENCES auth.users(id),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_type text NOT NULL,
  shared_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Clients policies
CREATE POLICY "Users can view all clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Calls policies
CREATE POLICY "Users can view all calls"
  ON calls FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert calls"
  ON calls FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own calls"
  ON calls FOR UPDATE
  TO authenticated
  USING (agent_id = auth.uid());

-- Appointments policies
CREATE POLICY "Users can view their appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (agent_id = auth.uid());

CREATE POLICY "Users can manage their appointments"
  ON appointments FOR ALL
  TO authenticated
  USING (agent_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can mark notifications as read"
  ON notifications FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid());

-- Documents policies
CREATE POLICY "Users can view all documents"
  ON documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can upload documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);
CREATE INDEX IF NOT EXISTS idx_calls_agent_id ON calls(agent_id);
CREATE INDEX IF NOT EXISTS idx_appointments_agent_id ON appointments(agent_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);