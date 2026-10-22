-- V2__dairy_management.sql
-- Schema for Animal Husbandry & Dairy Management Module

-- 1. Animals Table
CREATE TABLE IF NOT EXISTS animals (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tag_number VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    animal_type VARCHAR(30) NOT NULL DEFAULT 'COW', -- COW, BUFFALO, GOAT, SHEEP, OTHER
    breed VARCHAR(100),
    date_of_birth DATE,
    age_years NUMERIC(4, 1),
    gender VARCHAR(10) NOT NULL DEFAULT 'FEMALE',   -- FEMALE, MALE
    purchase_date DATE,
    purchase_cost NUMERIC(12, 2) DEFAULT 0.00,
    health_status VARCHAR(30) NOT NULL DEFAULT 'HEALTHY', -- HEALTHY, SICK, UNDER_TREATMENT, PREGNANT
    milking_status VARCHAR(30) NOT NULL DEFAULT 'MILKING', -- MILKING, DRY, PREGNANT, NOT_APPLICABLE
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',          -- ACTIVE, SOLD, DECEASED, INACTIVE
    daily_feed_requirement VARCHAR(255),
    photo_url VARCHAR(500),
    vaccination_summary VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_animals_farmer_status ON animals(farmer_id, status);
CREATE INDEX IF NOT EXISTS idx_animals_type ON animals(farmer_id, animal_type);
CREATE INDEX IF NOT EXISTS idx_animals_tag ON animals(farmer_id, tag_number);

-- 2. Daily Milk Production Records
CREATE TABLE IF NOT EXISTS milk_productions (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    animal_id BIGINT NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    production_date DATE NOT NULL,
    morning_liters NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    evening_liters NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    total_liters NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_animal_date UNIQUE (animal_id, production_date)
);

CREATE INDEX IF NOT EXISTS idx_milk_prod_farmer_date ON milk_productions(farmer_id, production_date);
CREATE INDEX IF NOT EXISTS idx_milk_prod_animal ON milk_productions(animal_id, production_date);

-- 3. Milk Sales Records
CREATE TABLE IF NOT EXISTS milk_sales (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sale_date DATE NOT NULL,
    buyer_name VARCHAR(120) NOT NULL,
    buyer_contact VARCHAR(20),
    quantity_liters NUMERIC(8, 2) NOT NULL,
    price_per_liter NUMERIC(8, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID', -- PAID, PARTIALLY_PAID, UNPAID
    payment_method VARCHAR(30) DEFAULT 'CASH',            -- CASH, UPI, BANK_TRANSFER, CHEQUE
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_milk_sales_farmer_date ON milk_sales(farmer_id, sale_date);
CREATE INDEX IF NOT EXISTS idx_milk_sales_payment_status ON milk_sales(farmer_id, payment_status);

-- 4. Milk Internal Usage (Home, Calves, Spoilage)
CREATE TABLE IF NOT EXISTS milk_usages (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL,
    home_consumption_liters NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    calf_feeding_liters NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    wasted_liters NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_farmer_usage_date UNIQUE (farmer_id, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_milk_usages_farmer_date ON milk_usages(farmer_id, usage_date);

-- 5. Dairy & Livestock Expenses
CREATE TABLE IF NOT EXISTS dairy_expenses (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    animal_id BIGINT REFERENCES animals(id) ON DELETE SET NULL, -- NULL means shared herd expense
    category VARCHAR(40) NOT NULL, -- FEED_FODDER, DRY_GRASS, VETERINARY, MEDICINE_VACCINE, BREEDING_INSEMINATION, TRANSPORT, EQUIPMENT_MAINTENANCE, INSURANCE, PURCHASE_COST, OTHER
    amount NUMERIC(12, 2) NOT NULL,
    quantity NUMERIC(8, 2),
    unit VARCHAR(30), -- KG, BAG, LITER, DOSE, VISIT
    expense_date DATE NOT NULL,
    is_capital_expense BOOLEAN NOT NULL DEFAULT FALSE, -- Purchase cost is capital, others are operating
    description TEXT,
    receipt_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dairy_expenses_farmer_date ON dairy_expenses(farmer_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_dairy_expenses_animal ON dairy_expenses(animal_id);
CREATE INDEX IF NOT EXISTS idx_dairy_expenses_category ON dairy_expenses(farmer_id, category);

-- 6. Animal Health & Vaccination Records
CREATE TABLE IF NOT EXISTS animal_health_records (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    animal_id BIGINT NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    record_type VARCHAR(30) NOT NULL, -- VACCINATION, DEWORMING, TREATMENT, CHECKUP, ARTIFICIAL_INSEMINATION
    treatment_name VARCHAR(150) NOT NULL,
    medicine_name VARCHAR(150),
    doctor_name VARCHAR(100),
    cost NUMERIC(10, 2) DEFAULT 0.00,
    next_due_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_health_records_animal ON animal_health_records(animal_id, record_date);
CREATE INDEX IF NOT EXISTS idx_health_records_next_due ON animal_health_records(farmer_id, next_due_date);
