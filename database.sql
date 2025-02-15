-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON orders;
DROP POLICY IF EXISTS "Enable viewing orders for authenticated users only" ON orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON order_attachments;
DROP POLICY IF EXISTS "Enable viewing attachments for authenticated users only" ON order_attachments;
DROP POLICY IF EXISTS "Give public access to order-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to order-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to order-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from order-attachments" ON storage.objects;

-- Add user_id column to orders table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'orders' AND column_name = 'user_id') THEN
        ALTER TABLE orders ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    company_name TEXT,
    plan_name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    project_description TEXT NOT NULL,
    additional_notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    user_id UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS order_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);
CREATE INDEX IF NOT EXISTS idx_order_attachments_order_id ON order_attachments(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
CREATE POLICY "Enable insert for verified users" ON orders
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' OR 
        (auth.role() = 'anon' AND user_email IS NOT NULL)
    );

CREATE POLICY "Enable viewing own orders" ON orders
    FOR SELECT USING (
        auth.role() = 'authenticated' AND user_id = auth.uid()
    );

CREATE POLICY "Enable admin view all orders" ON orders
    FOR SELECT USING (
        auth.role() = 'service_role'
    );

-- Create policies for order_attachments
CREATE POLICY "Enable insert attachments for order owners" ON order_attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_id
            AND (orders.user_id = auth.uid() OR auth.role() = 'anon')
        )
    );

CREATE POLICY "Enable viewing own attachments" ON order_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_id
            AND (orders.user_id = auth.uid() OR auth.role() = 'service_role')
        )
    );

-- Create or update storage bucket
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('order-attachments', 'order-attachments', true)
    ON CONFLICT (id) DO UPDATE
    SET public = true;
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'storage.buckets table does not exist. Skipping bucket creation.';
END $$;

-- Create storage policies
CREATE POLICY "Give public access to order-attachments" ON storage.objects
    FOR SELECT USING (bucket_id = 'order-attachments');

CREATE POLICY "Allow public uploads to order-attachments" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'order-attachments');

CREATE POLICY "Allow public updates to order-attachments" ON storage.objects
    FOR UPDATE USING (bucket_id = 'order-attachments');

CREATE POLICY "Allow public deletes from order-attachments" ON storage.objects
    FOR DELETE USING (bucket_id = 'order-attachments'); 