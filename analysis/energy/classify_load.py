#!/usr/bin/env python3
"""Classify club hourly electricity readings and summarise monthly load.

Reads analysis/energy/data/*.csv and analysis/energy/data/calendar.json. Writes:

- analysis/energy/hourly_classified.csv
- analysis/energy/monthly_load_by_class.csv
- analysis/energy/monthly_total_load.csv
- analysis/energy/top10pct_impact.csv
- analysis/energy/left_on_runs.csv
- analysis/energy/single_high_hours.csv
- analysis/energy/training_on_quiet_days.csv

Each meter row is kWh during the hour that starts at the timestamp.
Blank readings are skipped. One label per hour; the first matching rule wins.
"""

from __future__ import annotations

import csv
import json
import statistics
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"

MONTH_FILES = (
    "feb.csv",
    "march.csv",
    "april.csv",
    "may.csv",
    "june.csv",
    "july.csv",
    "august.csv",
    "sept.csv",
    "oct.csv",
)

# Partition of every reading. Breakdown rows are extra and are not part of this.
PARTITION = (
    "little_activity",
    "weekend",
    "keep_sailing_no_racing",
    "evening_session",
    "keep_sailing_on_race_day",
    "scouts",
)

# evening_session split, then the overnight slice (hours 00:00-06:00, any label).
EXTRA_CLASSES = (
    "wednesday_evening",
    "trysail_evening",
    "overnight_00_06",
)

CLASS_ORDER = PARTITION + EXTRA_CLASSES

NIGHT_HOURS = {22, 23, 0, 1, 2, 3, 4, 5}
OVERNIGHT_HOURS = {0, 1, 2, 3, 4, 5}


def parse_ts(text: str) -> datetime:
    return datetime.strptime(text.strip(), "%d.%m.%Y %H:%M")


def load_readings():
    """Return (readings, blank_count). readings are dicts in time order."""
    rows = []
    blanks = 0
    for name in MONTH_FILES:
        with (DATA / name).open(newline="") as handle:
            reader = csv.reader(handle)
            next(reader)
            for row in reader:
                if not row or not row[0].strip():
                    continue
                ts = parse_ts(row[0])
                raw = row[1].strip() if len(row) > 1 else ""
                if raw == "":
                    blanks += 1
                    continue
                rows.append(
                    {
                        "ts": ts,
                        "month": ts.strftime("%Y-%m"),
                        "date": ts.date(),
                        "hour": ts.hour,
                        "weekday": ts.weekday(),
                        "kwh": float(raw),
                    }
                )
    rows.sort(key=lambda item: item["ts"])
    return rows, blanks


def load_calendar():
    events = json.loads((DATA / "calendar.json").read_text())
    by_date = defaultdict(
        lambda: {
            "wednesday_race": False,
            "trysail": False,
            "race_or_open": False,
            "open_meeting": False,
            "keep_sailing": False,
            "training": [],
        }
    )
    for event in events:
        date = datetime.strptime(event["date"], "%Y-%m-%d").date()
        info = by_date[date]
        category = event.get("category") or ""
        description = event.get("description") or ""
        name = event.get("name") or ""
        if category == "Sailing" or category == "Open Meeting":
            info["race_or_open"] = True
        if category == "Open Meeting":
            info["open_meeting"] = True
        if event.get("series") == "Wednesday" or description == "Wednesday Handicap":
            info["wednesday_race"] = True
        text = f"{description} {name}".lower()
        if "trysail" in text or "try sail" in text:
            info["trysail"] = True
        if category == "KeepSailing":
            info["keep_sailing"] = True
        if category == "Training":
            label = description.strip() or name.strip()
            if label and label not in info["training"]:
                info["training"].append(label)
    # TrySail evenings are the Tuesday dates only. The Saturday session stays with that Saturday.
    for date, info in by_date.items():
        info["trysail_tuesday"] = info["trysail"] and date.weekday() == 1
    return by_date


def classify(row, info):
    """Return (label, evening_detail)."""
    hour = row["hour"]
    weekday = row["weekday"]
    if info["wednesday_race"] and 16 <= hour <= 21:
        return "evening_session", "wednesday_evening"
    if info["trysail_tuesday"] and 16 <= hour <= 21:
        return "evening_session", "trysail_evening"
    # Open-meeting Saturdays run through the morning, like a Sunday.
    # A noon start would leave the regatta morning in the quiet bucket.
    if info["open_meeting"] and weekday == 5 and 8 <= hour <= 17:
        return "weekend", ""
    if weekday == 5 and 12 <= hour <= 17:
        return "weekend", ""
    if weekday == 6 and 8 <= hour <= 17:
        return "weekend", ""
    if info["keep_sailing"] and 9 <= hour <= 16:
        if info["race_or_open"]:
            return "keep_sailing_on_race_day", ""
        return "keep_sailing_no_racing", ""
    if weekday == 0 and row["ts"].month in (6, 7, 8) and 17 <= hour <= 20:
        return "scouts", ""
    return "little_activity", ""


def night_medians(rows):
    by_month = defaultdict(list)
    for row in rows:
        if row["hour"] in OVERNIGHT_HOURS:
            by_month[row["month"]].append(row["kwh"])
    return {month: statistics.median(values) for month, values in by_month.items()}


def mark_quiet_highs(rows, medians):
    """Flag little-activity hours above 3x that month's night median.

    Runs of two or more consecutive flagged hours are left-on candidates.
    A run that touches 22:00-06:00 is a night run. Any other run is daytime.
    Isolated flagged hours are singles (often a fridge defrost).
    """
    flagged = []
    for row in rows:
        median = medians[row["month"]]
        threshold = 3 * median
        row["night_median"] = median
        row["threshold"] = threshold
        row["above_quiet_bar"] = (
            row["label"] == "little_activity" and row["kwh"] > threshold
        )
        row["quiet_high"] = ""
        if row["above_quiet_bar"]:
            flagged.append(row)

    runs = []
    singles = []
    index = 0
    while index < len(flagged):
        end = index
        while (
            end + 1 < len(flagged)
            and flagged[end + 1]["ts"] - flagged[end]["ts"] == timedelta(hours=1)
        ):
            end += 1
        group = flagged[index : end + 1]
        if len(group) >= 2:
            period = (
                "night"
                if any(item["hour"] in NIGHT_HOURS for item in group)
                else "daytime"
            )
            for item in group:
                item["quiet_high"] = f"run_{period}"
            runs.append((period, group))
        else:
            item = group[0]
            period = "night" if item["hour"] in NIGHT_HOURS else "daytime"
            item["quiet_high"] = f"single_{period}"
            singles.append((period, item))
        index = end + 1
    return runs, singles


def round_kwh(value):
    if value is None or value == "":
        return ""
    return f"{value:.3f}"


def top_slice(values, fraction):
    """Split off the highest `fraction` of hours.

    Classes with at least five hours drop at least one hour, so a short
    evening still shows its busiest hour. Returns None when there is nothing
    to split off. The caller multiplies means by hours; the totals here are
    the same as mean times duration.
    """
    count = len(values)
    if count == 0:
        return None
    drop = int(round(count * fraction))
    if count >= 5:
        drop = max(1, drop)
    if count > 1:
        drop = min(drop, count - 1)
    else:
        drop = 0
    if drop <= 0:
        return None
    ordered = sorted(values, reverse=True)
    top = ordered[:drop]
    rest = ordered[drop:]
    total = sum(values)
    return {
        "top_hours": drop,
        "top_total": sum(top),
        "top_mean": statistics.mean(top),
        "rest_hours": len(rest),
        "rest_total": sum(rest),
        "rest_mean": statistics.mean(rest),
        "share": (sum(top) / total) if total else 0.0,
    }


def top5_stats(values):
    """Return (hours_removed, kwh_share, mean_of_the_rest)."""
    sliced = top_slice(values, 0.05)
    if sliced is None:
        return 0, "", ""
    return sliced["top_hours"], f"{sliced['share']:.3f}", round_kwh(sliced["rest_mean"])


def class_values(rows, month, class_name):
    chosen = []
    for row in rows:
        if row["month"] != month:
            continue
        if class_name == "overnight_00_06":
            if row["hour"] in OVERNIGHT_HOURS:
                chosen.append(row)
        elif class_name == "wednesday_evening":
            if row["evening_detail"] == "wednesday_evening":
                chosen.append(row)
        elif class_name == "trysail_evening":
            if row["evening_detail"] == "trysail_evening":
                chosen.append(row)
        elif row["label"] == class_name:
            chosen.append(row)
    return chosen


def in_night_run(row):
    return row["quiet_high"] == "run_night"


def summarise(rows, months):
    """One record per month and class that has at least one hour."""
    records = []
    for month in months:
        for class_name in CLASS_ORDER:
            chosen = class_values(rows, month, class_name)
            if not chosen:
                continue
            values = [row["kwh"] for row in chosen]
            by_day = defaultdict(float)
            for row in chosen:
                by_day[row["date"]] += row["kwh"]
            mean = statistics.mean(values)
            drop, share, trimmed = top5_stats(values)
            trimmed_value = float(trimmed) if trimmed != "" else None
            night_run_rows = [row for row in chosen if in_night_run(row)]
            single_night = [
                row for row in chosen if row["quiet_high"] == "single_night"
            ]
            record = {
                "month": month,
                "class": class_name,
                "hours": len(chosen),
                "days": len(by_day),
                "total_kwh": round_kwh(sum(values)),
                "mean_kwh_per_hour": round_kwh(mean),
                "median_kwh_per_hour": round_kwh(statistics.median(values)),
                "mean_kwh_per_day": round_kwh(statistics.mean(by_day.values())),
                "top5pct_hours": drop,
                "top5pct_kwh_share": share,
                "mean_excluding_top5pct": trimmed,
                "mean_minus_top5pct": (
                    round_kwh(mean - trimmed_value) if trimmed_value is not None else ""
                ),
                "night_left_on_hours": "",
                "mean_excluding_night_left_on": "",
                "single_high_night_hours": "",
            }
            # Night left-on hours only sit in little activity, which is also
            # the whole of the 00:00-06:00 slice. Other classes stay blank.
            if class_name in ("little_activity", "overnight_00_06"):
                record["night_left_on_hours"] = len(night_run_rows)
                record["single_high_night_hours"] = len(single_night)
                kept = [row["kwh"] for row in chosen if not in_night_run(row)]
                if kept:
                    record["mean_excluding_night_left_on"] = round_kwh(
                        statistics.mean(kept)
                    )
            records.append(record)
    return records


def total_load(rows, months):
    """Mean multiplied by hours, which is the kWh on the bill for that class.

    Partition classes add up to the month. Evening parts and the overnight
    slice are included so those rates can be scaled too, and are marked so
    they are not added on top of the month.
    """
    records = []
    for month in months:
        month_rows = [row for row in rows if row["month"] == month]
        month_total = sum(row["kwh"] for row in month_rows)
        classes = list(PARTITION) + [
            "month_total",
            "wednesday_evening",
            "trysail_evening",
            "overnight_00_06",
        ]
        for class_name in classes:
            if class_name == "month_total":
                chosen = month_rows
                counts_in_month = "yes"
            else:
                chosen = class_values(rows, month, class_name)
                counts_in_month = "yes" if class_name in PARTITION else "no"
            if not chosen:
                continue
            values = [row["kwh"] for row in chosen]
            total = sum(values)
            records.append(
                {
                    "month": month,
                    "class": class_name,
                    "counts_in_month_total": counts_in_month,
                    "hours": len(values),
                    "mean_kwh_per_hour": round_kwh(statistics.mean(values)),
                    "median_kwh_per_hour": round_kwh(statistics.median(values)),
                    "total_kwh": round_kwh(total),
                    "share_of_month_kwh": (
                        f"{(total / month_total):.3f}" if month_total else ""
                    ),
                }
            )
    return records


def top10_impact(rows, months):
    """Highest 10% of hours, set beside the rest, in kWh rather than rate."""
    records = []
    for month in months:
        for class_name in CLASS_ORDER:
            chosen = class_values(rows, month, class_name)
            if not chosen:
                continue
            values = [row["kwh"] for row in chosen]
            total = sum(values)
            mean = statistics.mean(values)
            sliced = top_slice(values, 0.10)
            record = {
                "month": month,
                "class": class_name,
                "hours": len(values),
                "total_kwh": round_kwh(total),
                "mean_kwh_per_hour": round_kwh(mean),
                "top10_hours": "",
                "top10_total_kwh": "",
                "top10_mean_kwh_per_hour": "",
                "top10_share_of_kwh": "",
                "rest_hours": "",
                "rest_total_kwh": "",
                "rest_mean_kwh_per_hour": "",
                "mean_lift_from_top10": "",
            }
            if sliced is not None:
                record.update(
                    {
                        "top10_hours": sliced["top_hours"],
                        "top10_total_kwh": round_kwh(sliced["top_total"]),
                        "top10_mean_kwh_per_hour": round_kwh(sliced["top_mean"]),
                        "top10_share_of_kwh": f"{sliced['share']:.3f}",
                        "rest_hours": sliced["rest_hours"],
                        "rest_total_kwh": round_kwh(sliced["rest_total"]),
                        "rest_mean_kwh_per_hour": round_kwh(sliced["rest_mean"]),
                        "mean_lift_from_top10": round_kwh(mean - sliced["rest_mean"]),
                    }
                )
            records.append(record)
    return records


def write_csv(path, fieldnames, records, title=None, header_labels=None):
    """Write a titled CSV. The first line is a # title; column names carry units."""
    labels = header_labels or {name: name for name in fieldnames}
    with path.open("w", newline="") as handle:
        if title:
            handle.write(f"# {title}\n")
        writer = csv.writer(handle)
        writer.writerow([labels[name] for name in fieldnames])
        for record in records:
            writer.writerow([record.get(name, "") for name in fieldnames])


def main():
    rows, blanks = load_readings()
    calendar = load_calendar()
    empty_info = {
        "wednesday_race": False,
        "trysail_tuesday": False,
        "race_or_open": False,
        "open_meeting": False,
        "keep_sailing": False,
        "training": [],
    }
    for row in rows:
        info = calendar.get(row["date"], empty_info)
        label, detail = classify(row, info)
        row["label"] = label
        row["evening_detail"] = detail
        row["on_training_day"] = "yes" if info["training"] else ""
        row["training"] = list(info["training"])

    counts = defaultdict(int)
    for row in rows:
        counts[row["label"]] += 1
    if sum(counts[name] for name in PARTITION) != len(rows):
        raise SystemExit(f"labels do not partition the readings: {dict(counts)}")

    medians = night_medians(rows)
    runs, singles = mark_quiet_highs(rows, medians)
    months = sorted({row["month"] for row in rows})

    hourly_fields = [
        "timestamp",
        "month",
        "kwh",
        "label",
        "evening_detail",
        "on_training_day",
        "quiet_high",
    ]
    hourly = [
        {
            "timestamp": row["ts"].strftime("%Y-%m-%d %H:%M"),
            "month": row["month"],
            "kwh": round_kwh(row["kwh"]),
            "label": row["label"],
            "evening_detail": row["evening_detail"],
            "on_training_day": row["on_training_day"],
            "quiet_high": row["quiet_high"],
        }
        for row in rows
    ]
    write_csv(
        ROOT / "hourly_classified.csv",
        hourly_fields,
        hourly,
        title=(
            "Hourly electricity readings by activity label "
            "(energy in kWh for the hour starting at timestamp)"
        ),
        header_labels={
            "timestamp": "timestamp",
            "month": "month",
            "kwh": "energy_kWh",
            "label": "activity_label",
            "evening_detail": "evening_detail",
            "on_training_day": "on_training_day",
            "quiet_high": "quiet_high_flag",
        },
    )

    monthly_fields = [
        "month",
        "class",
        "hours",
        "days",
        "total_kwh",
        "mean_kwh_per_hour",
        "median_kwh_per_hour",
        "mean_kwh_per_day",
        "top5pct_hours",
        "top5pct_kwh_share",
        "mean_excluding_top5pct",
        "mean_minus_top5pct",
        "night_left_on_hours",
        "mean_excluding_night_left_on",
        "single_high_night_hours",
    ]
    monthly = summarise(rows, months)
    write_csv(
        ROOT / "monthly_load_by_class.csv",
        monthly_fields,
        monthly,
        title=(
            "Monthly load by activity "
            "(rates in kWh/h; totals in kWh; shares as fraction of that class)"
        ),
        header_labels={
            "month": "month",
            "class": "activity",
            "hours": "hours",
            "days": "days",
            "total_kwh": "total_kWh",
            "mean_kwh_per_hour": "mean_kWh_per_hour",
            "median_kwh_per_hour": "median_kWh_per_hour",
            "mean_kwh_per_day": "mean_kWh_per_day",
            "top5pct_hours": "top5pct_hours",
            "top5pct_kwh_share": "top5pct_share_of_kWh",
            "mean_excluding_top5pct": "mean_excluding_top5pct_kWh_per_hour",
            "mean_minus_top5pct": "mean_lift_from_top5pct_kWh_per_hour",
            "night_left_on_hours": "night_left_on_hours",
            "mean_excluding_night_left_on": (
                "mean_excluding_night_left_on_kWh_per_hour"
            ),
            "single_high_night_hours": "single_high_night_hours",
        },
    )

    total_fields = [
        "month",
        "class",
        "counts_in_month_total",
        "hours",
        "mean_kwh_per_hour",
        "median_kwh_per_hour",
        "total_kwh",
        "share_of_month_kwh",
    ]
    write_csv(
        ROOT / "monthly_total_load.csv",
        total_fields,
        total_load(rows, months),
        title=(
            "Monthly total electricity by activity "
            "(total_kWh = mean_kWh_per_hour x hours; share is fraction of the month)"
        ),
        header_labels={
            "month": "month",
            "class": "activity",
            "counts_in_month_total": "counts_in_month_total",
            "hours": "hours",
            "mean_kwh_per_hour": "mean_kWh_per_hour",
            "median_kwh_per_hour": "median_kWh_per_hour",
            "total_kwh": "total_kWh",
            "share_of_month_kwh": "share_of_month_kWh",
        },
    )

    top10_fields = [
        "month",
        "class",
        "hours",
        "total_kwh",
        "mean_kwh_per_hour",
        "top10_hours",
        "top10_total_kwh",
        "top10_mean_kwh_per_hour",
        "top10_share_of_kwh",
        "rest_hours",
        "rest_total_kwh",
        "rest_mean_kwh_per_hour",
        "mean_lift_from_top10",
    ]
    write_csv(
        ROOT / "top10pct_impact.csv",
        top10_fields,
        top10_impact(rows, months),
        title=(
            "Impact of the busiest 10 percent of hours "
            "(totals in kWh; rates in kWh/h; share as fraction of that activity)"
        ),
        header_labels={
            "month": "month",
            "class": "activity",
            "hours": "hours",
            "total_kwh": "total_kWh",
            "mean_kwh_per_hour": "mean_kWh_per_hour",
            "top10_hours": "top10pct_hours",
            "top10_total_kwh": "top10pct_total_kWh",
            "top10_mean_kwh_per_hour": "top10pct_mean_kWh_per_hour",
            "top10_share_of_kwh": "top10pct_share_of_kWh",
            "rest_hours": "rest_hours",
            "rest_total_kwh": "rest_total_kWh",
            "rest_mean_kwh_per_hour": "rest_mean_kWh_per_hour",
            "mean_lift_from_top10": "mean_lift_from_top10pct_kWh_per_hour",
        },
    )

    run_fields = [
        "start",
        "end",
        "period",
        "hours",
        "peak_kwh",
        "total_kwh",
        "night_median_kwh",
        "threshold_kwh",
        "excess_above_night_median_kwh",
    ]
    run_records = []
    for period, group in runs:
        total = sum(item["kwh"] for item in group)
        excess = sum(item["kwh"] - item["night_median"] for item in group)
        run_records.append(
            {
                "start": group[0]["ts"].strftime("%Y-%m-%d %H:%M"),
                "end": group[-1]["ts"].strftime("%Y-%m-%d %H:%M"),
                "period": period,
                "hours": len(group),
                "peak_kwh": round_kwh(max(item["kwh"] for item in group)),
                "total_kwh": round_kwh(total),
                "night_median_kwh": round_kwh(group[0]["night_median"]),
                "threshold_kwh": round_kwh(group[0]["threshold"]),
                "excess_above_night_median_kwh": round_kwh(excess),
            }
        )
    run_records.sort(key=lambda record: record["start"])
    write_csv(
        ROOT / "left_on_runs.csv",
        run_fields,
        run_records,
        title=(
            "Quiet multi-hour runs above 3x that month night median "
            "(all energy columns in kWh; threshold is kWh for one hour)"
        ),
        header_labels={
            "start": "start",
            "end": "end",
            "period": "period",
            "hours": "hours",
            "peak_kwh": "peak_kWh",
            "total_kwh": "total_kWh",
            "night_median_kwh": "night_median_kWh",
            "threshold_kwh": "threshold_kWh",
            "excess_above_night_median_kwh": "excess_above_night_median_kWh",
        },
    )

    single_fields = [
        "timestamp",
        "period",
        "kwh",
        "night_median_kwh",
        "threshold_kwh",
        "excess_above_night_median_kwh",
    ]
    single_records = [
        {
            "timestamp": item["ts"].strftime("%Y-%m-%d %H:%M"),
            "period": period,
            "kwh": round_kwh(item["kwh"]),
            "night_median_kwh": round_kwh(item["night_median"]),
            "threshold_kwh": round_kwh(item["threshold"]),
            "excess_above_night_median_kwh": round_kwh(
                item["kwh"] - item["night_median"]
            ),
        }
        for period, item in singles
    ]
    write_csv(
        ROOT / "single_high_hours.csv",
        single_fields,
        single_records,
        title=(
            "Single quiet hours above 3x that month night median "
            "(all energy columns in kWh)"
        ),
        header_labels={
            "timestamp": "timestamp",
            "period": "period",
            "kwh": "energy_kWh",
            "night_median_kwh": "night_median_kWh",
            "threshold_kwh": "threshold_kWh",
            "excess_above_night_median_kwh": "excess_above_night_median_kWh",
        },
    )

    training_by_date = {}
    for row in rows:
        if not row["training"]:
            continue
        bucket = training_by_date.setdefault(
            row["date"],
            {
                "descriptions": row["training"],
                "quiet": [],
            },
        )
        if row["label"] == "little_activity":
            bucket["quiet"].append(row["kwh"])
    training_records = []
    for date, bucket in sorted(training_by_date.items()):
        quiet = bucket["quiet"]
        if not quiet:
            continue
        training_records.append(
            {
                "date": date.isoformat(),
                "weekday": date.strftime("%A"),
                "descriptions": "; ".join(bucket["descriptions"]),
                "little_activity_hours": len(quiet),
                "little_activity_mean_kwh": round_kwh(statistics.mean(quiet)),
                "little_activity_max_kwh": round_kwh(max(quiet)),
                "little_activity_total_kwh": round_kwh(sum(quiet)),
            }
        )
    training_records.sort(
        key=lambda record: float(record["little_activity_mean_kwh"]), reverse=True
    )
    write_csv(
        ROOT / "training_on_quiet_days.csv",
        [
            "date",
            "weekday",
            "descriptions",
            "little_activity_hours",
            "little_activity_mean_kwh",
            "little_activity_max_kwh",
            "little_activity_total_kwh",
        ],
        training_records,
        title=(
            "Club training days with hours labelled little_activity "
            "(rates in kWh/h; totals in kWh)"
        ),
        header_labels={
            "date": "date",
            "weekday": "weekday",
            "descriptions": "descriptions",
            "little_activity_hours": "little_activity_hours",
            "little_activity_mean_kwh": "little_activity_mean_kWh_per_hour",
            "little_activity_max_kwh": "little_activity_max_kWh",
            "little_activity_total_kwh": "little_activity_total_kWh",
        },
    )

    night_runs = [group for period, group in runs if period == "night"]
    day_runs = [group for period, group in runs if period == "daytime"]
    print(f"readings {len(rows)} blank_skipped {blanks}")
    print("labels", {name: counts[name] for name in PARTITION})
    print(
        f"left_on_runs night {len(night_runs)} daytime {len(day_runs)} "
        f"singles {len(singles)}"
    )
    print("night medians", {month: round(medians[month], 3) for month in months})


if __name__ == "__main__":
    main()
