-- Create checkout_sessions table for temporary storage during Stripe checkout
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_token text UNIQUE NOT NULL,
  cart_items jsonb NOT NULL,
  shipping_address jsonb,
  billing_address jsonb,
  email text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false
);

-- Create index for session token lookups
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_token ON checkout_sessions(session_token);

-- Create index for cleanup of expired sessions
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_expires ON checkout_sessions(expires_at);

-- Add RLS policies
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert checkout sessions (for guest checkout)
CREATE POLICY "Anyone can create checkout sessions."
  ON checkout_sessions FOR INSERT
  WITH CHECK (true);

-- Allow anyone to select checkout sessions by token
CREATE POLICY "Anyone can view checkout sessions by token."
  ON checkout_sessions FOR SELECT
  USING (true);

-- Allow anyone to delete checkout sessions (for cleanup)
CREATE POLICY "Anyone can delete checkout sessions."
  ON checkout_sessions FOR DELETE
  USING (true); 