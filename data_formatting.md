# Notes on data formatting

## English

- File format should be `csv` with the text encoded as `utf-8`. This should preserve the accents in the state names.
- Date should ideally be formatted as `YYYY-mm-dd`. If the program takes some date format string, it would be: `%Y-%m-%d`
- In terms of variables for making graphics we need the following:

  - `Date`
  - `Days`
  - `State_Name`
  - `State_Code`: I used 3-letter codes from [this](https://en.wikipedia.org/wiki/Template:Mexico_State-Abbreviation_Codes)
  - Policy Index Column: something consistent
  - Mobility Data Column: something consistent, `google_avg_7d` is fine as long as it doesn't change in the future.
  - `Ranking_Policy`: a daily ranking of states by their policy index value. 1 is for the state with the highest index value, last is for the state with the lowest.
  - `Ranking_Mobility`: a daily ranking of states by their mobility data. 1 is for the state with the most negative mobility, last is for the state with the least negative mobility.

- There should be a row for each day with the national average for the country. This will make charting the national average a lot easier than having that data be repeated in a column.
