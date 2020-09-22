# The point of this script is to clean the Reference_hospitalization_all_loc.csv
# file that comes from IHME website so we visualize only the columns and
# we care about.
# IHME data comes from: http://www.healthdata.org/covid/data-downloads

library(tidyverse)

df <- read_csv("Reference_hospitalization_all_locs.csv")

wantedCols <- c("location_name","date","location_id","deaths_mean_smoothed",
                "deaths_lower_smoothed","deaths_upper_smoothed")

df %>% select(any_of(wantedCols))
