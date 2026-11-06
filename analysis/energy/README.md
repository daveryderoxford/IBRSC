# Club electricity load by activity

Hourly active-energy readings for meter `1900027028631`, February to October 2026, labelled by what the club was expected to be doing. Lives under `analysis/energy` in the IBRSC club administration repository.

Run it again with:

```bash
python3 analysis/energy/classify_load.py
```

The script uses only the Python standard library. It rewrites the CSV files next to itself. Each table starts with a `#` title line that names the table and its units. Column headers also carry the unit (`kWh` for energy, `kWh_per_hour` for rates, and a fraction for shares).

## Readings

Each row is kWh during the hour that **starts** at the timestamp. `16:00` is 16:00–17:00.

February’s first 82 hours are blank in the export and are left out. There is no `29 March 2026 01:00` because the clocks went forward. The October export has no extra hour for the clocks going back.

`data/calendar.json` is the club calendar from April 2026, reduced to the fields used for labelling. Booking links are not included. February and March have meter data and no calendar events, so those months are split only by the clock.

## How an hour is labelled

One label per hour. The first rule that matches is the one used.

| Label | When |
| --- | --- |
| `evening_session` | A Wednesday handicap date, 16:00–22:00, or a TrySail Tuesday, 16:00–22:00 |
| `weekend` | Every Saturday 12:00–18:00, and every Sunday 08:00–18:00 |
| `keep_sailing_no_racing` | A Keep Sailing day with no race and no open meeting, 09:00–17:00 |
| `keep_sailing_on_race_day` | Keep Sailing 09:00–17:00 on a day that also has a race or open meeting, if that hour was not already an evening or a weekend hour |
| `scouts` | Monday 17:00–21:00 in June, July, and August |
| `little_activity` | Everything else, including nights |

Wednesday evenings are only the Wednesday series dates (15 April–19 August). TrySail evenings are the nine Tuesdays from 19 May to 21 July. The TrySail session on Saturday 9 May has no time in the calendar, so that day stays a Saturday.

An open-meeting Saturday is labelled `weekend` from 08:00, same as a Sunday. The regatta morning would otherwise sit in `little_activity` and look like a closed-club spike. Ordinary race Saturdays still start at noon.

`scouts` is not one of the four activity averages. The calendar has a single Scouts booking, so these hours follow the Monday-evening pattern in the meter data and are held out of the quiet average.

Club training that is not Keep Sailing (Topper squad, theory courses, and similar) is not given its own label. Hours of those days that fall in `little_activity` are listed in `training_on_quiet_days.csv`, with the busiest days first, so a training day is visible inside the quiet figures.

`wednesday_evening` and `trysail_evening` in the monthly file are the two parts of `evening_session`. `overnight_00_06` is every reading from 00:00–06:00, which is a slice of `little_activity` rather than a further label. The other six labels cover every reading exactly once.

## Monthly figures

`monthly_load_by_class.csv` has one row per month and label.

- `mean_kwh_per_hour` is the true average rate.
- `median_kwh_per_hour` is the typical hour. Use this when a few hours look as if something was left on.
- `total_kwh` is that mean multiplied by the hours. It is the energy for the period.
- `mean_kwh_per_day` is the average of the daily totals for days that have at least one hour of that label.
- `top5pct_kwh_share` is the share of kWh sitting in the highest 5% of hours. A share near 0.05 means the tail is not pulling the total. Classes with at least five hours drop at least one hour, so a short evening still shows its busiest hour. Shorter classes leave these columns blank.
- `mean_excluding_top5pct` is the mean of the hours that remain, and `mean_minus_top5pct` is how far the raw mean sits above that.

`monthly_total_load.csv` is the same rates scaled up to the bill. `total_kwh` is `mean_kwh_per_hour` times `hours`, and `share_of_month_kwh` is that total as a fraction of the month. The six labels marked `counts_in_month_total` of `yes` add up to the `month_total` row. Wednesday, TrySail, and overnight are parts of hours already in those six, so they are marked `no` and are not added again.

A quiet hour at about 1 kWh, repeated for most of the month, is more energy than a short evening at 3 kWh. The totals are the figures to compare when the question is how much electricity each kind of period used.

## Top 10% of hours

`top10pct_impact.csv` lifts the busiest tenth of hours out of each month and label so their effect on the total is visible on its own.

- `top10_hours` and `top10_total_kwh` are that slice. `top10_share_of_kwh` near 0.10 means those hours carry about the share of time they occupy. A share well above 0.10 means they are pulling the total up.
- `rest_total_kwh` and `rest_mean_kwh_per_hour` are the period with that slice removed.
- `mean_lift_from_top10` is how many kWh per hour the raw mean sits above the mean of the rest.

The same five-hour rule as the 5% columns applies: a class with at least five hours drops at least one hour. Shorter classes leave the top-10 columns blank. Ten percent is wide enough to show the tail’s share of the monthly kWh, and still a small part of the hours. The 5% columns in the monthly file remain the tighter cut.

On quiet nights the mean is about 16–41% above the median. In February and March the little-activity mean stays well above the median even after the top 5% is removed: the high daytime load is spread across many hours, not a handful of spikes. The median is the better figure for a typical closed hour in those months.

## Hours that look left on

High readings during racing, Keep Sailing, or weekend opening are expected and are not flagged. The search is only inside `little_activity`.

The bar for each month is three times that month’s own median for 00:00–06:00, so a winter night is not judged against a summer night. One hour above the bar can be a fridge defrost. Those hours are in `single_high_hours.csv`. A run of two or more hours in a row is in `left_on_runs.csv`.

- `period` `night` means the run touches 22:00–06:00. These are the closed-club runs. There are 12 in this file. The longest starts at 00:00 on 1 April (nine hours, about 27 kWh). The 01:00–04:00 run on 21 July follows a TrySail evening.
- `period` `daytime` is the same bar during hours labelled quiet. February and March account for most of the long ones: weekday and Saturday-morning load with no calendar behind it, in the heating season. From April onward, the daytime runs are the ones to check against the diary. The largest are 3 April (Good Friday, no booking, seven hours from 10:00, about 34 kWh), 8 September from 13:00 (four hours, about 38 kWh, peak 13 kWh), and 21 September from 08:00 (about 26 kWh).

`excess_above_night_median_kwh` is the total kWh minus that month’s night median for each hour of the run.

For `little_activity` and `overnight_00_06`, `mean_excluding_night_left_on` drops the night runs only. Daytime runs stay in the mean, because in winter they are a pattern rather than a few hours left on. The median and the top-5% share are what show that pattern.
