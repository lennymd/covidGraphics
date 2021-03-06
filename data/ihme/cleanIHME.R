# The point of this script is to clean the Reference_hospitalization_all_loc.csv
# file that comes from IHME website so we visualize only the columns and
# we care about.
# IHME data comes from: http://www.healthdata.org/covid/data-downloads

library(tidyverse)

wantedCols <-
  c(
    "location_name",
    "date",
    "location_id",
    "deaths_mean_smoothed",
    "deaths_lower_smoothed",
    "deaths_upper_smoothed"
  )

wantedCountries <- c(
  'Mexico',
  'Ecuador',
  'Chile',
  'Argentina',
  'Bolivia (Plurinational State of)',
  'Colombia',
  'Brazil',
  'Costa Rica',
  'Panama',
  'Nicaragua',
  'Honduras',
  'Paraguay',
  'Uruguay',
  'Peru',
  'Dominican Republic',
  'Guatemala',
  'El Salvador'
)

df <- read_csv("Reference_hospitalization_all_locs.csv")
df_filtered <- df %>%
  select(all_of(wantedCols)) %>%
  filter(location_name %in% wantedCountries) %>%
  mutate(location_name = str_replace(location_name,
                                     " \\(Plurinational State of\\)", "")) %>%
  mutate(location_name = str_squish(location_name))

write_csv(df_filtered, 'ihmeClean.csv', col_names =
            TRUE)
