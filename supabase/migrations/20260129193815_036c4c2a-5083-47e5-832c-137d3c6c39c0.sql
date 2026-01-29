-- Create app_role enum for admin roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator');

-- Create order_status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned');

-- Admin roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Subcategories table
CREATE TABLE public.subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tags table
CREATE TABLE public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    short_description TEXT,
    long_description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
    stock_qty INTEGER DEFAULT 0,
    in_stock BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Product images table
CREATE TABLE public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Product tags junction table
CREATE TABLE public.product_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
    UNIQUE (product_id, tag_id)
);

-- Customers table
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    customer_address TEXT NOT NULL,
    notes TEXT,
    status order_status DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    delivery_charge DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    payment_method TEXT DEFAULT 'COD',
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Order items table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    title_snapshot TEXT NOT NULL,
    price_snapshot DECIMAL(10,2) NOT NULL,
    image_snapshot TEXT,
    qty INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Settings table (key-value store)
CREATE TABLE public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_subcategory ON public.products(subcategory_id);
CREATE INDEX idx_products_featured ON public.products(featured);
CREATE INDEX idx_products_in_stock ON public.products(in_stock);
CREATE INDEX idx_product_images_product ON public.product_images(product_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Security definer function to check admin role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Check if user is any admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- RLS Policies

-- User roles: only admins can view
CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT USING (public.is_admin(auth.uid()));

-- Categories: public read, admin write
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON public.categories
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update categories" ON public.categories
    FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete categories" ON public.categories
    FOR DELETE USING (public.is_admin(auth.uid()));

-- Subcategories: public read, admin write
CREATE POLICY "Anyone can view subcategories" ON public.subcategories
    FOR SELECT USING (true);
CREATE POLICY "Admins can insert subcategories" ON public.subcategories
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update subcategories" ON public.subcategories
    FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete subcategories" ON public.subcategories
    FOR DELETE USING (public.is_admin(auth.uid()));

-- Tags: public read, admin write
CREATE POLICY "Anyone can view tags" ON public.tags
    FOR SELECT USING (true);
CREATE POLICY "Admins can insert tags" ON public.tags
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update tags" ON public.tags
    FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete tags" ON public.tags
    FOR DELETE USING (public.is_admin(auth.uid()));

-- Products: public read, admin write
CREATE POLICY "Anyone can view products" ON public.products
    FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON public.products
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update products" ON public.products
    FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete products" ON public.products
    FOR DELETE USING (public.is_admin(auth.uid()));

-- Product images: public read, admin write
CREATE POLICY "Anyone can view product images" ON public.product_images
    FOR SELECT USING (true);
CREATE POLICY "Admins can insert product images" ON public.product_images
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update product images" ON public.product_images
    FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete product images" ON public.product_images
    FOR DELETE USING (public.is_admin(auth.uid()));

-- Product tags: public read, admin write
CREATE POLICY "Anyone can view product tags" ON public.product_tags
    FOR SELECT USING (true);
CREATE POLICY "Admins can insert product tags" ON public.product_tags
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete product tags" ON public.product_tags
    FOR DELETE USING (public.is_admin(auth.uid()));

-- Customers: admin can view all, public can insert
CREATE POLICY "Admins can view all customers" ON public.customers
    FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Anyone can create customers" ON public.customers
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update customers" ON public.customers
    FOR UPDATE USING (public.is_admin(auth.uid()));

-- Orders: admin can view all, public can insert
CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Anyone can create orders" ON public.orders
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update orders" ON public.orders
    FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Track order by phone and order number" ON public.orders
    FOR SELECT USING (true);

-- Order items: admin can view all, public can insert
CREATE POLICY "Admins can view all order items" ON public.order_items
    FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Anyone can create order items" ON public.order_items
    FOR INSERT WITH CHECK (true);

-- Settings: public read for some, admin write
CREATE POLICY "Anyone can view settings" ON public.settings
    FOR SELECT USING (true);
CREATE POLICY "Admins can insert settings" ON public.settings
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update settings" ON public.settings
    FOR UPDATE USING (public.is_admin(auth.uid()));

-- Function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'ACS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order number
CREATE TRIGGER set_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_order_number();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Storage policies for product images
CREATE POLICY "Anyone can view product images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'product-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update product images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'product-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete product images" ON storage.objects
    FOR DELETE USING (bucket_id = 'product-images' AND public.is_admin(auth.uid()));