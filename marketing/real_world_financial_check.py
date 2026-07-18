#!/usr/bin/env python3
"""ponytail: one runnable check for real-world financial model assumptions."""

GROWTH_PRICE = 50
FEATURED_PRICE = 99


def year1(
    bookings: int,
    avg_booking_sgd: float,
    growth_hosts_avg: float,
    featured_hosts_avg: float,
    ads_hosts_avg: float,
    *,
    avg_bookings_per_ads_host: float = 12,
    blended_ad_rate: float = 0.12,
    ads_active_months: int = 12,
    months: int = 12,
    opex: float = 12_000,
) -> dict:
    commission = bookings * avg_booking_sgd * 0.05
    growth = growth_hosts_avg * GROWTH_PRICE * months
    featured = featured_hosts_avg * FEATURED_PRICE * months
    perf_ads = (
        ads_hosts_avg
        * avg_bookings_per_ads_host
        * avg_booking_sgd
        * blended_ad_rate
        * ads_active_months
    )
    total = commission + growth + featured + perf_ads
    return {
        "commission": round(commission),
        "growth_tools": round(growth),
        "featured": round(featured),
        "perf_ads": round(perf_ads),
        "total_revenue": round(total),
        "opex": opex,
        "profit": round(total - opex),
    }


def main() -> None:
    base = year1(1025, 120, 10, 2.5, 2.5, ads_active_months=7)
    assert base["total_revenue"] > 12_000, base
    assert base["profit"] > 0, base

    conservative = year1(420, 112, 3, 0.5, 0.5, ads_active_months=4, opex=13_200)
    assert conservative["profit"] < 0, conservative

    optimistic = year1(1600, 125, 18, 6, 6, ads_active_months=10, opex=14_500)
    assert optimistic["profit"] > 5_000, optimistic

    print("real_world_financial_check ok")
    print("base:", base)
    print("conservative:", conservative)
    print("optimistic:", optimistic)


if __name__ == "__main__":
    main()
