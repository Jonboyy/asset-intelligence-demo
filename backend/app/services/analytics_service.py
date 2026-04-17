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