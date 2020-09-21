async function drawMap({metric, chartKeyword}) {
  // 1. load data
  // load country shapes
  // TODO change to latam geojson
  const countryShapes = await d3.json('./../data/map.geojson');

  // load JHU dataset
  let urlData;
  if (metric == 'deaths') {
    // load deaths time series
    urlData =
      'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv';
  } else {
    // load cases time series
    urlData =
      'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';
  }
  const dataset = await d3.csv(urlData);
  // TODO update to permalink
  const populationData = await d3.csv('./../data/population.csv');

  //  create data accessors
  const countryNameAccessor = d => d['Country/Region'];
  const countryNameAccessorJson = d => d.properties['admin'];
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastDay = `${d3.timeFormat('%-m/%-d/%y')(yesterday)}`;
  const latestMetricAccessor = d => d[lastDay];

  const getPopulation = _country => {
    const country = populationData.filter(d => d['Country'] == _country);
    const population = country[0]['2019'];
    return +population;
  };

  const getMetric = _country => {
    const country = countryData.filter(d => countryNameAccessor(d) == _country);
    return latestMetricAccessor(country[0]);
  };

  const computeNormalizedRate = _country => {
    const rate = getMetric(_country) / parseFloat(getPopulation(_country));
    return rate * 100000;
  };

  // filter dataset to only keep rows of countries we care about
  // TODO move this watchlist to the pais.js level since we use it often

  const countryData = dataset.filter(d =>
    countryWatchList.some(i => countryNameAccessor(d) == i)
  );

  // 2. create dimensions
  const wrapperElt = `wrapper_${chartKeyword}`;

  let dimensions = {
    width: document.getElementById(wrapperElt).parentElement.clientWidth,
    margin: {
      top: 10,
      right: 40,
      bottom: 40,
      left: 40,
    },
  };
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;

  const sphere = {type: 'Sphere'};
  const projection = d3
    .geoMercator()
    .fitWidth(dimensions.boundedWidth, countryShapes);

  const pathGenerator = d3.geoPath(projection);
  const [[x0, y0], [x1, y1]] = pathGenerator.bounds(countryShapes);

  dimensions.boundedHeight = y1;
  dimensions.height =
    dimensions.boundedHeight + dimensions.margin.top + dimensions.margin.bottom;
  // 3. draw canvas

  const wrapper = d3
    .select(`#${wrapperElt}`)
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);

  const bounds = wrapper
    .append('g')
    .style(
      'transform',
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );

  // 4. create scales
  // do the metric calculation.
  const normalizedRates = [];
  countryWatchList.forEach(_element => {
    const rateNormalized = computeNormalizedRate(_element);
    normalizedRates.push(rateNormalized);
  });
  const metricValueExtent = d3.extent(normalizedRates);
  const maxChange = d3.max([-metricValueExtent[0], metricValueExtent[1]]);
  const colorScale = d3
    .scaleLinear()
    .domain([metricValueExtent[0], 0, metricValueExtent[1]])
    .range(['darkgreen', 'white', 'indigo']);

  // 5. draw data

  const earth = bounds
    .append('path')
    .attr('class', 'earth')
    .attr('d', pathGenerator(sphere));

  // const graticuleJson = d3.geoGraticule10();
  // const graticule = bounds
  //   .append('path')
  //   .attr('class', 'graticule')
  //   .attr('d', pathGenerator(graticuleJson));

  const countries = bounds
    .selectAll('.country')
    .data(countryShapes.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', pathGenerator)
    .attr('fill', d => {
      const countryName = countryNameAccessorJson(d);
      return colorScale(computeNormalizedRate(countryName));
    });
}
