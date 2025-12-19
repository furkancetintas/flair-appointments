-- 1. Yeni bir kolon oluştur
ALTER TABLE public.shop_settings ADD COLUMN services_json jsonb DEFAULT '[{"name": "Saç Kesimi", "price": 100}, {"name": "Sakal Tıraşı", "price": 80}, {"name": "Saç + Sakal", "price": 150}, {"name": "Çocuk Tıraşı", "price": 70}]'::jsonb;

-- 2. Mevcut verileri yeni kolona aktar
UPDATE public.shop_settings 
SET services_json = (
  SELECT jsonb_agg(jsonb_build_object('name', s, 'price', 100))
  FROM unnest(services) AS s
)
WHERE services IS NOT NULL;

-- 3. Eski kolonu sil
ALTER TABLE public.shop_settings DROP COLUMN services;

-- 4. Yeni kolonu eski isimle değiştir
ALTER TABLE public.shop_settings RENAME COLUMN services_json TO services;

-- 5. handle_new_user fonksiyonunu güncelle - phone desteği ekle
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, phone, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    'customer'
  );
  RETURN NEW;
END;
$function$;