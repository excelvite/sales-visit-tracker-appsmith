
-- Update the handle_new_user function to include search_path for security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'SALES')
  );
  RETURN NEW;
END;
$$;

-- Update the import_store_with_update function to include search_path for security
CREATE OR REPLACE FUNCTION public.import_store_with_update(
  store_name text,
  store_category text,
  store_region text DEFAULT '',
  store_area text DEFAULT '',
  store_state text DEFAULT 'Kuala Lumpur',
  store_address text DEFAULT '',
  store_city text DEFAULT '',
  store_phone text DEFAULT '',
  store_email text DEFAULT '',
  store_pic_info text DEFAULT '',
  store_salesperson text DEFAULT '',
  latest_update text DEFAULT '',
  next_steps text DEFAULT '',
  visit_status text[] DEFAULT ARRAY[]::text[],
  potential_level text DEFAULT 'medium'
) 
RETURNS uuid 
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;
