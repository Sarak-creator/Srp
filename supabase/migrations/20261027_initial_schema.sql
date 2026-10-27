-- ============================================================================
-- WATER FACTORY ERP & POS SYSTEM - SUPABASE POSTGRESQL DDL MIGRATION
-- Purified Water Factory (សហគ្រាសផលិតទឹកបរិសុទ្ធ)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TYPES & ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'cashier', 'driver');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('paid', 'partial', 'unpaid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('cash_khr', 'cash_usd', 'khqr', 'credit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE container_unit AS ENUM ('container_20l', 'pack_350ml', 'pack_500ml', 'pack_1500ml', 'bottle_custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE expense_category AS ENUM ('electricity', 'fuel', 'salary', 'maintenance', 'raw_supplies', 'misc');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE damage_reason AS ENUM ('delivery_leak', 'factory_defect', 'loading_crack', 'customer_return');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factory_name_kh VARCHAR(255) NOT NULL DEFAULT 'សហគ្រាសផលិតទឹកបរិសុទ្ធ អេស អរ ភី',
    factory_name_en VARCHAR(255) NOT NULL DEFAULT 'SRP Purified Water Factory',
    phone_number VARCHAR(50) NOT NULL DEFAULT '012 333 444',
    address_kh TEXT NOT NULL DEFAULT 'ភ្នំពេញ',
    exchange_rate_khr_per_usd NUMERIC(10, 2) NOT NULL DEFAULT 4100.00,
    receipt_footer_kh TEXT DEFAULT 'សូមអរគុណ! សូមពិនិត្យទំនិញ និងសំបកធុងមុនពេលទទួល',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'cashier',
    phone VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CUSTOMERS (WITH DEBT & 20L EMPTY BOTTLE BALANCE)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    delivery_address TEXT,
    total_debt_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_debt_khr NUMERIC(14, 0) NOT NULL DEFAULT 0,
    empty_containers_held INT NOT NULL DEFAULT 0, -- សំបកធុង ២០លីត្រ ជំពាក់
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. FINISHED PRODUCTS (FINISHED WATER ONLY)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_code VARCHAR(50) UNIQUE NOT NULL,
    name_kh VARCHAR(150) NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    unit container_unit NOT NULL,
    unit_cost_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    sale_price_usd NUMERIC(10, 2) NOT NULL,
    sale_price_khr NUMERIC(12, 0) NOT NULL,
    is_refill_20l BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
    cashier_id UUID REFERENCES users(id) ON DELETE SET NULL,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status order_status NOT NULL DEFAULT 'completed',
    payment_status payment_status NOT NULL DEFAULT 'paid',
    exchange_rate_applied NUMERIC(10, 2) NOT NULL DEFAULT 4100.00,
    subtotal_usd NUMERIC(12, 2) NOT NULL,
    discount_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    grand_total_usd NUMERIC(12, 2) NOT NULL,
    grand_total_khr NUMERIC(14, 0) NOT NULL,
    paid_amount_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount_khr NUMERIC(14, 0) NOT NULL DEFAULT 0,
    remaining_debt_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    containers_delivered_20l INT NOT NULL DEFAULT 0,
    containers_returned_20l INT NOT NULL DEFAULT 0,
    net_containers_difference INT NOT NULL DEFAULT 0,
    payment_method payment_method NOT NULL DEFAULT 'cash_khr',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_cost_usd NUMERIC(10, 2) NOT NULL,
    unit_price_usd NUMERIC(10, 2) NOT NULL,
    unit_price_khr NUMERIC(12, 0) NOT NULL,
    line_total_usd NUMERIC(12, 2) NOT NULL,
    line_total_khr NUMERIC(14, 0) NOT NULL
);

-- 8. CUSTOMER REPAYMENTS
CREATE TABLE IF NOT EXISTS customer_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
    collected_by UUID REFERENCES users(id) ON DELETE SET NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    amount_paid_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    amount_paid_khr NUMERIC(14, 0) NOT NULL DEFAULT 0,
    equivalent_usd NUMERIC(12, 2) NOT NULL,
    payment_method payment_method NOT NULL,
    notes TEXT
);

-- 9. BROKEN PRODUCTS (DIRECT LOSS DEDUCTION)
CREATE TABLE IF NOT EXISTS broken_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_cost_usd NUMERIC(10, 2) NOT NULL,
    total_loss_usd NUMERIC(12, 2) NOT NULL, -- Quantity * Unit Cost
    reason damage_reason NOT NULL,
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT
);

-- 10. OPERATIONAL EXPENSES
CREATE TABLE IF NOT EXISTS operational_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category expense_category NOT NULL,
    title VARCHAR(200) NOT NULL,
    amount_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    amount_khr NUMERIC(14, 0) NOT NULL DEFAULT 0,
    total_equivalent_usd NUMERIC(12, 2) NOT NULL,
    paid_to VARCHAR(150),
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. SUPPLIERS (LIGHTWEIGHT CONTACT DIRECTORY)
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    phone_number VARCHAR(50) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    address TEXT,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true
);
