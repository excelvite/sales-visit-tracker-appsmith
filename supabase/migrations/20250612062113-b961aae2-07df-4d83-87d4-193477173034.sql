
-- Create the store_category enum (without IF NOT EXISTS)
DO $$ BEGIN
    CREATE TYPE store_category AS ENUM ('vet', 'pet_store', 'grooming', 'breeding', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the stores table
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  category store_category NOT NULL,
  other_category_name TEXT,
  region TEXT,
  area TEXT,
  pic_info TEXT,
  salesperson TEXT,
  is_new BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_ex_customer BOOLEAN DEFAULT false
);

-- Enable RLS on stores
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Create policies for stores
CREATE POLICY "Users can view all stores" 
  ON public.stores 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create stores" 
  ON public.stores 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update stores" 
  ON public.stores 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Users can delete stores" 
  ON public.stores 
  FOR DELETE 
  USING (true);

-- Create the store_updates table
CREATE TABLE IF NOT EXISTS public.store_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  latest_update TEXT,
  next_steps TEXT,
  visit_status TEXT[],
  potential_level TEXT,
  products_promoted TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on store_updates
ALTER TABLE public.store_updates ENABLE ROW LEVEL SECURITY;

-- Create policies for store_updates
CREATE POLICY "Users can view all store updates" 
  ON public.store_updates 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create store updates" 
  ON public.store_updates 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update store updates" 
  ON public.store_updates 
  FOR UPDATE 
  USING (true);

-- Create function to find or create store and add update
CREATE OR REPLACE FUNCTION public.import_store_with_update(
  store_name TEXT,
  store_category TEXT,
  store_region TEXT DEFAULT '',
  store_area TEXT DEFAULT '',
  store_state TEXT DEFAULT 'Kuala Lumpur',
  store_address TEXT DEFAULT '',
  store_city TEXT DEFAULT '',
  store_phone TEXT DEFAULT '',
  store_email TEXT DEFAULT '',
  store_pic_info TEXT DEFAULT '',
  store_salesperson TEXT DEFAULT '',
  latest_update TEXT DEFAULT '',
  next_steps TEXT DEFAULT '',
  visit_status TEXT[] DEFAULT ARRAY[]::TEXT[],
  potential_level TEXT DEFAULT 'medium'
) RETURNS UUID AS $$
DECLARE
  existing_store_id UUID;
  new_store_id UUID;
BEGIN
  -- Try to find existing store by name and category
  SELECT id INTO existing_store_id 
  FROM public.stores 
  WHERE LOWER(name) = LOWER(store_name) 
    AND category = store_category::store_category;
  
  IF existing_store_id IS NOT NULL THEN
    -- Update existing store information
    UPDATE public.stores 
    SET 
      region = COALESCE(NULLIF(store_region, ''), region),
      area = COALESCE(NULLIF(store_area, ''), area),
      state = COALESCE(NULLIF(store_state, ''), state),
      address = COALESCE(NULLIF(store_address, ''), address),
      city = COALESCE(NULLIF(store_city, ''), city),
      phone = COALESCE(NULLIF(store_phone, ''), phone),
      email = COALESCE(NULLIF(store_email, ''), email),
      pic_info = COALESCE(NULLIF(store_pic_info, ''), pic_info),
      salesperson = COALESCE(NULLIF(store_salesperson, ''), salesperson)
    WHERE id = existing_store_id;
    
    new_store_id := existing_store_id;
  ELSE
    -- Create new store
    INSERT INTO public.stores (
      name, category, region, area, state, address, city, 
      zip_code, phone, email, pic_info, salesperson, created_at
    ) VALUES (
      store_name, 
      store_category::store_category,
      store_region,
      store_area, 
      store_state,
      store_address,
      store_city,
      '',
      store_phone,
      store_email,
      store_pic_info,
      store_salesperson,
      now()
    ) RETURNING id INTO new_store_id;
  END IF;
  
  -- Add update entry if there's update information
  IF latest_update != '' OR next_steps != '' THEN
    INSERT INTO public.store_updates (
      store_id, latest_update, next_steps, visit_status, potential_level
    ) VALUES (
      new_store_id, latest_update, next_steps, visit_status, potential_level
    );
  END IF;
  
  RETURN new_store_id;
END;
$$ LANGUAGE plpgsql;
