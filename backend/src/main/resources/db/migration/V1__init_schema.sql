-- Smart Shetkari 🌱 (Production Database Schema Migration)
-- V1__init_schema.sql

-- 1. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    mobile_number VARCHAR(15) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'FARMER',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile_number);

-- 2. Farmer Profiles & Multilingual Preferences
CREATE TABLE IF NOT EXISTS farmer_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    village VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100) DEFAULT 'Maharashtra',
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'mr',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_farmer_profiles_user ON farmer_profiles(user_id);

-- 3. Farm Employees / Labourers
CREATE TABLE IF NOT EXISTS employees (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(15),
    address VARCHAR(255),
    wage_type VARCHAR(20) NOT NULL DEFAULT 'DAILY',
    daily_wage_rate NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    joining_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_employees_farmer_status ON employees(farmer_id, status);

-- 4. Daily Attendance
CREATE TABLE IF NOT EXISTS attendance (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PRESENT',
    daily_wage_rate NUMERIC(12, 2) NOT NULL,
    calculated_wage NUMERIC(12, 2) NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    hours_worked DOUBLE PRECISION,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_attendance_employee_date UNIQUE (employee_id, attendance_date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_farmer_date ON attendance(farmer_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, attendance_date);

-- 5. Wage Records (Calculated & Agreed)
CREATE TABLE IF NOT EXISTS wage_records (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_present INTEGER NOT NULL DEFAULT 0,
    days_half_day INTEGER NOT NULL DEFAULT 0,
    days_absent INTEGER NOT NULL DEFAULT 0,
    days_leave INTEGER NOT NULL DEFAULT 0,
    suggested_wage NUMERIC(12, 2) NOT NULL,
    final_agreed_wage NUMERIC(12, 2) NOT NULL,
    is_manually_adjusted BOOLEAN NOT NULL DEFAULT FALSE,
    adjustment_reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wage_records_farmer ON wage_records(farmer_id);
CREATE INDEX IF NOT EXISTS idx_wage_records_employee ON wage_records(employee_id);

-- 6. Actual Wage Payments
CREATE TABLE IF NOT EXISTS wage_payments (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    wage_record_id BIGINT REFERENCES wage_records(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'CASH',
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wage_payments_employee ON wage_payments(employee_id);

-- 7. Tractors and Agricultural Machinery
CREATE TABLE IF NOT EXISTS tractors (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    registration_number VARCHAR(50),
    ownership_type VARCHAR(20) NOT NULL DEFAULT 'OWNED',
    default_hourly_rate NUMERIC(12, 2),
    default_per_acre_rate NUMERIC(12, 2),
    default_per_day_rate NUMERIC(12, 2),
    availability_status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tractors_farmer_status ON tractors(farmer_id, availability_status);

-- 8. Tractor Bookings
CREATE TABLE IF NOT EXISTS tractor_bookings (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tractor_id BIGINT NOT NULL REFERENCES tractors(id) ON DELETE CASCADE,
    customer_name VARCHAR(100) NOT NULL,
    customer_mobile VARCHAR(15),
    work_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    work_location VARCHAR(255),
    work_type VARCHAR(30) NOT NULL DEFAULT 'PLOWING',
    custom_work_type VARCHAR(150),
    estimated_area NUMERIC(8, 2),
    agreed_rate NUMERIC(12, 2),
    final_agreed_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_tractor_date ON tractor_bookings(tractor_id, work_date, status);

-- 9. Completed Tractor Work Logs
CREATE TABLE IF NOT EXISTS tractor_work_logs (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE REFERENCES tractor_bookings(id) ON DELETE CASCADE,
    actual_hours DOUBLE PRECISION,
    actual_area_acres NUMERIC(8, 2),
    work_summary TEXT,
    completed_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Tractor Payments Received
CREATE TABLE IF NOT EXISTS tractor_payments (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES tractor_bookings(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'CASH',
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tractor_payments_booking ON tractor_payments(booking_id);

-- 11. Tractor Operations Expenses (Diesel, Maintenance, Repairs)
CREATE TABLE IF NOT EXISTS tractor_expenses (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tractor_id BIGINT REFERENCES tractors(id) ON DELETE SET NULL,
    category VARCHAR(30) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT,
    receipt_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tractor_expenses_farmer_date ON tractor_expenses(farmer_id, expense_date);

-- 12. In-App Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    farmer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_farmer_unread ON notifications(farmer_id, is_read);
