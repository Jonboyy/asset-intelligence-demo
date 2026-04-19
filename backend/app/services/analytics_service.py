from sqlalchemy import text
from sqlalchemy.orm import Session


class AnalyticsService:
    def get_refresh_candidates(self, db: Session, days_ahead: int) -> dict:
        query = text(
            """
            SELECT
                o.name AS office_name,
                a.asset_tag,
                a.manufacturer,
                a.model,
                a.purchase_date,
                (a.purchase_date + (ac.refresh_cycle_months || ' months')::interval)::date AS refresh_due_date,
                (
                    (
                        (a.purchase_date + (ac.refresh_cycle_months || ' months')::interval)::date
                        - CURRENT_DATE
                    )
                )::int AS days_until_refresh,
                a.status,
                a.condition
            FROM assets a
            JOIN asset_categories ac ON a.category_id = ac.id
            JOIN offices o ON a.office_id = o.id
            WHERE ac.name = 'Laptop'
              AND a.purchase_date IS NOT NULL
              AND a.status IN ('in_use', 'in_storage', 'under_repair')
              AND (
                    (a.purchase_date + (ac.refresh_cycle_months || ' months')::interval)::date
                    <= CURRENT_DATE + CAST(:days_ahead || ' days' AS interval)
              )
            ORDER BY
                days_until_refresh ASC NULLS LAST,
                o.name ASC,
                a.asset_tag ASC
            """
        )

        rows = db.execute(query, {"days_ahead": str(days_ahead)}).mappings().all()

        results: list[dict] = []
        for row in rows:
            results.append(
                {
                    "office_name": row["office_name"],
                    "asset_tag": row["asset_tag"],
                    "manufacturer": row["manufacturer"],
                    "model": row["model"],
                    "purchase_date": row["purchase_date"].isoformat() if row["purchase_date"] else None,
                    "refresh_due_date": row["refresh_due_date"].isoformat() if row["refresh_due_date"] else None,
                    "days_until_refresh": row["days_until_refresh"],
                    "status": row["status"],
                    "condition": row["condition"],
                }
            )

        return {
            "metric": "refresh_candidates",
            "days_ahead": days_ahead,
            "total_candidates": len(results),
            "results": results,
        }

    def get_offboarding_risk(self, db: Session) -> dict:
        query = text(
            """
            WITH asset_risk AS (
                SELECT
                    aa.employee_id,
                    COUNT(DISTINCT aa.asset_id)::int AS active_assets_count,
                    STRING_AGG(
                        DISTINCT a.asset_tag || ' - ' || a.manufacturer || ' ' || a.model,
                        ', '
                    ) AS active_assets
                FROM asset_assignments aa
                JOIN assets a ON aa.asset_id = a.id
                WHERE aa.assignment_status = 'active'
                GROUP BY aa.employee_id
            ),
            license_risk AS (
                SELECT
                    la.employee_id,
                    COUNT(DISTINCT la.license_id)::int AS active_licenses_count,
                    STRING_AGG(
                        DISTINCT sl.product_name,
                        ', '
                    ) AS active_licenses
                FROM license_assignments la
                JOIN software_licenses sl ON la.license_id = sl.id
                WHERE la.assignment_status = 'active'
                GROUP BY la.employee_id
            )
            SELECT
                e.employee_code,
                e.full_name,
                e.email,
                d.name AS department_name,
                o.name AS office_name,
                e.termination_date,
                COALESCE(ar.active_assets_count, 0)::int AS active_assets_count,
                COALESCE(lr.active_licenses_count, 0)::int AS active_licenses_count,
                COALESCE(ar.active_assets, '') AS active_assets,
                COALESCE(lr.active_licenses, '') AS active_licenses,
                CASE
                    WHEN COALESCE(ar.active_assets_count, 0) > 0
                     AND COALESCE(lr.active_licenses_count, 0) > 0
                        THEN 'high'
                    WHEN COALESCE(ar.active_assets_count, 0)
                       + COALESCE(lr.active_licenses_count, 0) >= 2
                        THEN 'medium'
                    ELSE 'low'
                END AS risk_level
            FROM employees e
            JOIN departments d ON e.department_id = d.id
            JOIN offices o ON e.office_id = o.id
            LEFT JOIN asset_risk ar ON e.id = ar.employee_id
            LEFT JOIN license_risk lr ON e.id = lr.employee_id
            WHERE e.employment_status = 'terminated'
              AND (
                    COALESCE(ar.active_assets_count, 0)
                  + COALESCE(lr.active_licenses_count, 0)
              ) > 0
            ORDER BY
                CASE
                    WHEN COALESCE(ar.active_assets_count, 0) > 0
                     AND COALESCE(lr.active_licenses_count, 0) > 0
                        THEN 1
                    WHEN COALESCE(ar.active_assets_count, 0)
                       + COALESCE(lr.active_licenses_count, 0) >= 2
                        THEN 2
                    ELSE 3
                END,
                e.termination_date ASC,
                e.full_name ASC
            """
        )

        rows = db.execute(query).mappings().all()

        results: list[dict] = []
        for row in rows:
            results.append(
                {
                    "employee_code": row["employee_code"],
                    "full_name": row["full_name"],
                    "email": row["email"],
                    "department_name": row["department_name"],
                    "office_name": row["office_name"],
                    "termination_date": row["termination_date"].isoformat()
                    if row["termination_date"]
                    else None,
                    "active_assets_count": row["active_assets_count"],
                    "active_licenses_count": row["active_licenses_count"],
                    "active_assets": row["active_assets"],
                    "active_licenses": row["active_licenses"],
                    "risk_level": row["risk_level"],
                }
            )

        total_active_assets = sum(row["active_assets_count"] for row in results)
        total_active_licenses = sum(row["active_licenses_count"] for row in results)
        high_risk_count = sum(1 for row in results if row["risk_level"] == "high")

        return {
            "metric": "offboarding_risk",
            "total_risks": len(results),
            "total_active_assets": total_active_assets,
            "total_active_licenses": total_active_licenses,
            "high_risk_count": high_risk_count,
            "results": results,
        }

    def get_data_quality_audit(self, db: Session) -> dict:
        query = text(
            """
            SELECT
                a.asset_tag,
                ac.name AS category_name,
                a.manufacturer,
                a.model,
                o.name AS office_name,
                a.status,
                a.condition,
                CONCAT_WS(
                    ', ',
                    CASE
                        WHEN a.serial_number IS NULL OR TRIM(a.serial_number) = ''
                            THEN 'serial_number'
                    END,
                    CASE
                        WHEN a.purchase_date IS NULL
                            THEN 'purchase_date'
                    END,
                    CASE
                        WHEN a.warranty_end_date IS NULL
                            THEN 'warranty_end_date'
                    END,
                    CASE
                        WHEN a.vendor_id IS NULL
                            THEN 'vendor'
                    END
                ) AS missing_fields,
                (
                    CASE WHEN a.serial_number IS NULL OR TRIM(a.serial_number) = '' THEN 1 ELSE 0 END
                  + CASE WHEN a.purchase_date IS NULL THEN 1 ELSE 0 END
                  + CASE WHEN a.warranty_end_date IS NULL THEN 1 ELSE 0 END
                  + CASE WHEN a.vendor_id IS NULL THEN 1 ELSE 0 END
                )::int AS issue_count
            FROM assets a
            JOIN asset_categories ac ON a.category_id = ac.id
            JOIN offices o ON a.office_id = o.id
            WHERE
                a.serial_number IS NULL
                OR TRIM(a.serial_number) = ''
                OR a.purchase_date IS NULL
                OR a.warranty_end_date IS NULL
                OR a.vendor_id IS NULL
            ORDER BY
                issue_count DESC,
                a.asset_tag ASC
            """
        )

        rows = db.execute(query).mappings().all()

        results: list[dict] = []
        for row in rows:
            results.append(
                {
                    "asset_tag": row["asset_tag"],
                    "category_name": row["category_name"],
                    "manufacturer": row["manufacturer"],
                    "model": row["model"],
                    "office_name": row["office_name"],
                    "status": row["status"],
                    "condition": row["condition"],
                    "missing_fields": row["missing_fields"],
                    "issue_count": row["issue_count"],
                }
            )

        missing_serial_count = sum(
            1 for row in results if "serial_number" in row["missing_fields"]
        )
        missing_purchase_date_count = sum(
            1 for row in results if "purchase_date" in row["missing_fields"]
        )
        missing_warranty_count = sum(
            1 for row in results if "warranty_end_date" in row["missing_fields"]
        )
        missing_vendor_count = sum(
            1 for row in results if "vendor" in row["missing_fields"]
        )
        total_missing_fields = sum(row["issue_count"] for row in results)

        return {
            "metric": "data_quality_audit",
            "total_assets_with_issues": len(results),
            "total_missing_fields": total_missing_fields,
            "missing_serial_count": missing_serial_count,
            "missing_purchase_date_count": missing_purchase_date_count,
            "missing_warranty_count": missing_warranty_count,
            "missing_vendor_count": missing_vendor_count,
            "results": results,
        }