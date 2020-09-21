## What to check when updating data

1. Columns are named properly
2. Quintana Roo has state_short as `QRoo`, not `Q.Roo`
3. National Average data must not be ranked.
4. Use `Brasil` vs `Brazil` for country.

## Notes about data

### data through 2020-05-21

- some typos in columns that were fixed
- Quintana Roo state_short was changed to QRoo so we can use it for CSS

### data through 2020-05-29

- no column typos but the country column name was missing.
- renamed Brazil to be Brasil to stay consistent with previous data
- changed naming pattern for data files. Current file will always be `data_latest.csv`. When we update the data, we have to rename the old file based on the last date it included and put in the new file as `data_latest.csv`
- renamed Q.Roo to QRoo for CSS purposes. Must be mindful there is already Qro.
- remove Nacional from any rankings. That breaks the code.
- Brazil had no policy index data for the national level. This has been rectified.

## data through 2020-06-03

- `country` column name had an extra space in it
- renamed Q.Roo to QRoo
- National data had no ranking, but state_short had been changed to `0`. This is off and should be `Nacional` for the purposes of keeping the code consistent.
