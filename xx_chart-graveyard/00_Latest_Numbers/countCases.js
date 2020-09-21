async function countCases() {
  // 1. get data
  const datasetCases = await d3.csv(
    'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv'
  );
  const datasetDeaths = await d3.csv(
    'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv'
  );
  const countryList = [
    'Argentina',
    'Belize',
    'Bolivia',
    'Brazil',
    'Chile',
    'Colombia',
    'Costa Rica',
    'Cuba',
    'Dominican Republic',
    'Ecuador',
    'El Salvador',
    'Guatemala',
    'Honduras',
    'Mexico',
    'Nicaragua',
    'Panama',
    'Paraguay',
    'Peru',
    'Uruguay',
    'Venezuela',
  ];
  const countryAccessor = d => d['Country/Region'];

  const getLatestColumn = (_dataset, _country) => {
    const data = _dataset.filter(d => countryAccessor(d) == _country);
    const columns = Object.getOwnPropertyNames(data[0]);
    const latest = columns[columns.length - 1];
    return data[0][latest];
  };

  const getPreviousColumn = (_dataset, _country) => {
    const data = _dataset.filter(d => countryAccessor(d) == _country);
    const columns = Object.getOwnPropertyNames(data[0]);
    const previous = columns[columns.length - 2];
    return data[0][previous];
  };
  const computeDelta = (_dataset, _country) => {
    const a = +getLatestColumn(_dataset, _country);
    const b = +getPreviousColumn(_dataset, _country);
    const value = Math.abs(a - b);
    let output;
    if (value > 0) {
      // add a + sign in front
      output = '+' + value;
    } else if (value < 0) {
      // add a - sign in front
      output = '-' + value;
    } else {
      // add no sign bc value is 0
      output = '0';
    }
    return output;
  };
  console.log(computeDelta(datasetCases, 'Venezuela'));
  countryList.forEach(element => {
    d3.select(`#${element.toLowerCase().replace(/\s+/g, '')}_cases`).html(
      getLatestColumn(datasetCases, element)
    );
    d3.select(`#${element.toLowerCase().replace(/\s+/g, '')}_deaths`).html(
      getLatestColumn(datasetDeaths, element)
    );
    d3.select(`#${element.toLowerCase().replace(/\s+/g, '')}_deltaCases`).html(
      computeDelta(datasetCases, element)
    );
    d3.select(`#${element.toLowerCase().replace(/\s+/g, '')}_deltaDeaths`).html(
      computeDelta(datasetDeaths, element)
    );
  });

  // Modify last updated section
  const cases_columns = Object.getOwnPropertyNames(datasetCases[0]);
  const latest_date_cases = cases_columns[cases_columns.length - 1];
  const dateParser = d3.timeParse('%-m/%-d/%y');
  const dateFormat = d3.timeFormat('%d %B %Y');

  d3.select('#last_updated').html(dateFormat(dateParser(latest_date_cases)));
}
countCases();
