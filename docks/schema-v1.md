# Asset Intelligence Assistant — Schema v1

This schema supports the demo use cases for:
- asset lifecycle and refresh
- offboarding audits
- maintenance analysis
- license utilization
- data quality checks
- asset distribution reporting

## Tables

- offices
- departments
- employees
- vendors
- asset_categories
- assets
- asset_assignments
- maintenance_records
- software_licenses
- license_assignments


## 1. offices

```sql
id                  BIGSERIAL PRIMARY KEY
name                VARCHAR(100) NOT NULL
city                VARCHAR(100) NOT NULL
country             VARCHAR(100) NOT NULL
region              VARCHAR(100)
is_active           BOOLEAN NOT NULL DEFAULT true
created_at          TIMESTAMP NOT NULL DEFAULT now()
```sql

## 2. departments

```sql
id                  BIGSERIAL PRIMARY KEY
name                VARCHAR(100) NOT NULL UNIQUE
cost_center         VARCHAR(50)
is_active           BOOLEAN NOT NULL DEFAULT true
created_at          TIMESTAMP NOT NULL DEFAULT now()
```sql

## 3. employees

```sql
id                  BIGSERIAL PRIMARY KEY
employee_code       VARCHAR(30) NOT NULL UNIQUE
full_name           VARCHAR(150) NOT NULL
email               VARCHAR(150) NOT NULL UNIQUE
job_title           VARCHAR(120)
department_id       BIGINT NOT NULL REFERENCES departments(id)
office_id           BIGINT NOT NULL REFERENCES offices(id)
employment_status   VARCHAR(30) NOT NULL
hire_date           DATE NOT NULL
termination_date    DATE
manager_name        VARCHAR(150)
created_at          TIMESTAMP NOT NULL DEFAULT now()
```sql

Allowed `employment_status` values:
- `active`
- `leave`
- `terminated`

## 4. vendors

```sql
id                  BIGSERIAL PRIMARY KEY
name                VARCHAR(150) NOT NULL UNIQUE
vendor_type         VARCHAR(50) NOT NULL
country             VARCHAR(100)
support_level       VARCHAR(50)
is_active           BOOLEAN NOT NULL DEFAULT true
created_at          TIMESTAMP NOT NULL DEFAULT now()
```sql

Allowed `vendor_type` values:
- `hardware`
- `software`
- `service`

## 5. asset_categories

```sql
id                  BIGSERIAL PRIMARY KEY
name                VARCHAR(100) NOT NULL UNIQUE
refresh_cycle_months INTEGER NOT NULL
requires_serial     BOOLEAN NOT NULL DEFAULT true
created_at          TIMESTAMP NOT NULL DEFAULT now()
```sql

## 6. assets

```sql
id                  BIGSERIAL PRIMARY KEY
asset_tag           VARCHAR(50) NOT NULL UNIQUE
serial_number       VARCHAR(100)
category_id         BIGINT NOT NULL REFERENCES asset_categories(id)
manufacturer        VARCHAR(100) NOT NULL
model               VARCHAR(150) NOT NULL
purchase_date       DATE
purchase_price      NUMERIC(12,2)
warranty_end_date   DATE
vendor_id           BIGINT REFERENCES vendors(id)
office_id           BIGINT NOT NULL REFERENCES offices(id)
status              VARCHAR(30) NOT NULL
condition           VARCHAR(30) NOT NULL
notes               TEXT
created_at          TIMESTAMP NOT NULL DEFAULT now()
```sql

Allowed `status` values:
- `in_use`
- `in_storage`
- `under_repair`
- `retired`
- `lost`

Allowed `condition` values:
- `excellent`
- `good`
- `fair`
- `poor`

## 7. asset_assignments

```sql
id                  BIGSERIAL PRIMARY KEY
asset_id            BIGINT NOT NULL REFERENCES assets(id)
employee_id         BIGINT NOT NULL REFERENCES employees(id)
assigned_at         DATE NOT NULL
returned_at         DATE
assignment_status   VARCHAR(30) NOT NULL
created_at          TIMESTAMP NOT NULL DEFAULT now()
```sql

Allowed `assignment_status` values:
- `active`
- `returned`
- `overdue_return`

## 8. maintenance_records

```sql
id                  BIGSERIAL PRIMARY KEY
asset_id            BIGINT NOT NULL REFERENCES assets(id)
vendor_id           BIGINT REFERENCES vendors(id)
service_date        DATE NOT NULL
service_type        VARCHAR(50) NOT NULL
issue_type          VARCHAR(100) NOT NULL
cost                NUMERIC(12,2) NOT NULL DEFAULT 0
downtime_days       INTEGER NOT NULL DEFAULT 0
notes               TEXT
created_at          TIMESTAMP NOT NULL DEFAULT now()
```sql

## 9. software_licenses

```sql
id                  BIGSERIAL PRIMARY KEY
product_name        VARCHAR(150) NOT NULL
vendor_id           BIGINT REFERENCES vendors(id)
license_type        VARCHAR(50) NOT NULL
total_seats         INTEGER NOT NULL
annual_cost         NUMERIC(12,2) NOT NULL
renewal_date        DATE
is_active           BOOLEAN NOT NULL DEFAULT true
created_at          TIMESTAMP NOT NULL DEFAULT now()
```sql

Allowed `license_type` values:
- `subscription`
- `perpetual`
- `enterprise`

## 10. license_assignments

```sql
id                  BIGSERIAL PRIMARY KEY
license_id          BIGINT NOT NULL REFERENCES software_licenses(id)
employee_id         BIGINT NOT NULL REFERENCES employees(id)
assigned_at         DATE NOT NULL
revoked_at          DATE
assignment_status   VARCHAR(30) NOT NULL
created_at          TIMESTAMP NOT NULL DEFAULT now()
```sql

Allowed `assignment_status` values:
- `active`
- `revoked`

## Relationships Summary

- `employees.department_id -> departments.id`
- `employees.office_id -> offices.id`
- `assets.category_id -> asset_categories.id`
- `assets.vendor_id -> vendors.id`
- `assets.office_id -> offices.id`
- `asset_assignments.asset_id -> assets.id`
- `asset_assignments.employee_id -> employees.id`
- `maintenance_records.asset_id -> assets.id`
- `maintenance_records.vendor_id -> vendors.id`
- `software_licenses.vendor_id -> vendors.id`
- `license_assignments.license_id -> software_licenses.id`
- `license_assignments.employee_id -> employees.id`