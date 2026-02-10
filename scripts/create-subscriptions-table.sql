-- Create subscriptions table to track client payments
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'inactive', -- active, canceled, past_due, unpaid, trialing
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_business_id ON subscriptions(business_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Create payments history table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'eur',
  status TEXT NOT NULL, -- succeeded, failed, pending
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);

-- Add stripe_customer_id to businesses table if not exists
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies for subscriptions
CREATE POLICY "Service role can manage all subscriptions" ON subscriptions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admins can view their business subscriptions" ON subscriptions
  FOR SELECT USING (
    business_id IN (
      SELECT business_id FROM admins WHERE id = auth.uid()
    )
  );

-- Policies for payments
CREATE POLICY "Service role can manage all payments" ON payments
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admins can view their business payments" ON payments
  FOR SELECT USING (
    subscription_id IN (
      SELECT s.id FROM subscriptions s
      JOIN admins a ON s.business_id = a.business_id
      WHERE a.id = auth.uid()
    )
  );
