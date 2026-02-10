-- Businesses table (each bar/restaurant is a business)
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  google_review_url TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users linked to businesses
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews/Ratings table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT,
  redirected_to_google BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies for businesses
CREATE POLICY "Anyone can view businesses" ON public.businesses FOR SELECT USING (true);
CREATE POLICY "Admins can update their own business" ON public.businesses FOR UPDATE USING (
  id IN (SELECT business_id FROM public.admins WHERE id = auth.uid())
);

-- Policies for admins
CREATE POLICY "Admins can view themselves" ON public.admins FOR SELECT USING (id = auth.uid());

-- Policies for reviews
CREATE POLICY "Anyone can insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view their business reviews" ON public.reviews FOR SELECT USING (
  business_id IN (SELECT business_id FROM public.admins WHERE id = auth.uid())
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON public.reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_admins_business_id ON public.admins(business_id);

-- Insert default business (Kelmendi)
INSERT INTO public.businesses (name, slug, logo_url, google_review_url, address)
VALUES (
  'Kelmendi',
  'kelmendi',
  'https://kelmendi-ldcs.de/assets/images/logo-kelmendi-122x138.png',
  'https://g.page/r/CR77ookB_VwvEBM/review',
  'Wittener Str. 129, 44149 Dortmund, Germany'
) ON CONFLICT (slug) DO NOTHING;
