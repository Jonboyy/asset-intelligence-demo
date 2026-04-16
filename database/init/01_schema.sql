CREATE TABLE IF NOT EXISTS offices (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    cost_center VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendors (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    vendor_type VARCHAR(50) NOT NULL,
    country VARCHAR(100),
    support_level VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_vendors_vendor_type
        CHECK (vendor_type IN ('hardware', 'software', 'service'))
);

CREATE TABLE IF NOT EXISTS asset_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    refresh_cycle_months INTEGER NOT NULL,
    requires_serial BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_asset_categories_refresh_cycle
        CHECK (refresh_cycle_months > 0)
);

CREATE TABLE IF NOT EXISTS employees (
    id BIGSERIAL PRIMARY KEY,
    employee_code VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    job_title VARCHAR(120),
    department_id BIGINT NOT NULL REFERENCES departments(id),
    office_id BIGINT NOT NULL REFERENCES offices(id),
    employment_status VARCHAR(30) NOT NULL,
    hire_date DATE NOT NULL,
    termination_date DATE,
    manager_name VARCHAR(150),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_employees_employment_status
        CHECK (employment_status IN ('active', 'leave', 'terminated')),
    CONSTRAINT chk_employees_termination_date
        CHECK (
            (employment_status = 'terminated' AND termination_date IS NOT NULL)
            OR
            (employment_status IN ('active', 'leave'))
        )
);

CREATE TABLE IF NOT EXISTS assets (
    id BIGSERIAL PRIMARY KEY,
    asset_tag VARCHAR(50) NOT NULL UNIQUE,
    serial_number VARCHAR(100),
    category_id BIGINT NOT NULL REFERENCES asset_categories(id),
    manufacturer VARCHAR(100) NOT NULL,
    model VARCHAR(150) NOT NULL,
    purchase_date DATE,
    purchase_price NUMERIC(12,2),
    warranty_end_date DATE,
    vendor_id BIGINT REFERENCES vendors(id),
    office_id BIGINT NOT NULL REFERENCES offices(id),
    status VARCHAR(30) NOT NULL,
    condition VARCHAR(30) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_assets_status
        CHECK (status IN ('in_use', 'in_storage', 'under_repair', 'retired', 'lost')),
    CONSTRAINT chk_assets_condition
        CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
    CONSTRAINT chk_assets_purchase_price
        CHECK (purchase_price IS NULL OR purchase_price >= 0)
);

CREATE TABLE IF NOT EXISTS asset_assignments (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    assigned_at DATE NOT NULL,
    returned_at DATE,
    assignment_status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_asset_assignments_status
        CHECK (assignment_status IN ('active', 'returned', 'overdue_return')),
    CONSTRAINT chk_asset_assignments_dates
        CHECK (returned_at IS NULL OR returned_at >= assigned_at)
);

CREATE TABLE IF NOT EXISTS maintenance_records (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    vendor_id BIGINT REFERENCES vendors(id),
    service_date DATE NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    issue_type VARCHAR(100) NOT NULL,
    cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    downtime_days INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_maintenance_records_cost
        CHECK (cost >= 0),
    CONSTRAINT chk_maintenance_records_downtime
        CHECK (downtime_days >= 0)
);

CREATE TABLE IF NOT EXISTS software_licenses (
    id BIGSERIAL PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    vendor_id BIGINT REFERENCES vendors(id),
    license_type VARCHAR(50) NOT NULL,
    total_seats INTEGER NOT NULL,
    annual_cost NUMERIC(12,2) NOT NULL,
    renewal_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_software_licenses_type
        CHECK (license_type IN ('subscription', 'perpetual', 'enterprise')),
    CONSTRAINT chk_software_licenses_total_seats
        CHECK (total_seats >= 0),
    CONSTRAINT chk_software_licenses_annual_cost
        CHECK (annual_cost >= 0)
);

CREATE TABLE IF NOT EXISTS license_assignments (
    id BIGSERIAL PRIMARY KEY,
    license_id BIGINT NOT NULL REFERENCES software_licenses(id) ON DELETE CASCADE,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    assigned_at DATE NOT NULL,
    revoked_at DATE,
    assignment_status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_license_assignments_status
        CHECK (assignment_status IN ('active', 'revoked')),
    CONSTRAINT chk_license_assignments_dates
        CHECK (revoked_at IS NULL OR revoked_at >= assigned_at)
);

CREATE INDEX IF NOT EXISTS idx_employees_department_id
    ON employees(department_id);

CREATE INDEX IF NOT EXISTS idx_employees_office_id
    ON employees(office_id);

CREATE INDEX IF NOT EXISTS idx_employees_employment_status
    ON employees(employment_status);

CREATE INDEX IF NOT EXISTS idx_assets_category_id
    ON assets(category_id);

CREATE INDEX IF NOT EXISTS idx_assets_vendor_id
    ON assets(vendor_id);

CREATE INDEX IF NOT EXISTS idx_assets_office_id
    ON assets(office_id);

CREATE INDEX IF NOT EXISTS idx_assets_status
    ON assets(status);

CREATE INDEX IF NOT EXISTS idx_assets_purchase_date
    ON assets(purchase_date);

CREATE INDEX IF NOT EXISTS idx_asset_assignments_asset_id
    ON asset_assignments(asset_id);

CREATE INDEX IF NOT EXISTS idx_asset_assignments_employee_id
    ON asset_assignments(employee_id);

CREATE INDEX IF NOT EXISTS idx_asset_assignments_status
    ON asset_assignments(assignment_status);

CREATE INDEX IF NOT EXISTS idx_maintenance_records_asset_id
    ON maintenance_records(asset_id);

CREATE INDEX IF NOT EXISTS idx_maintenance_records_service_date
    ON maintenance_records(service_date);

CREATE INDEX IF NOT EXISTS idx_software_licenses_vendor_id
    ON software_licenses(vendor_id);

CREATE INDEX IF NOT EXISTS idx_software_licenses_renewal_date
    ON software_licenses(renewal_date);

CREATE INDEX IF NOT EXISTS idx_license_assignments_license_id
    ON license_assignments(license_id);

CREATE INDEX IF NOT EXISTS idx_license_assignments_employee_id
    ON license_assignments(employee_id);

CREATE INDEX IF NOT EXISTS idx_license_assignments_status
    ON license_assignments(assignment_status);

CREATE UNIQUE INDEX IF NOT EXISTS uq_asset_assignments_one_active_per_asset
    ON asset_assignments(asset_id)
    WHERE assignment_status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS uq_license_assignments_one_active_per_employee_license
    ON license_assignments(license_id, employee_id)
    WHERE assignment_status = 'active';