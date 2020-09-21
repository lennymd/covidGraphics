async function PolicyIndexLatam() {
  // 0. check for language locale
  setLocale();

  // 1. access data
  const dataset = await d3.csv(
    'https://raw.githubusercontent.com/lennymartinez/covid_latam/master/data/latam_latest.csv'
  );

  // data accessors: shorthand for different columns.
  const yAccessor = d => +d.test_rate;
  // const xAccessor = d => +d.days;
  const dateParser = d3.timeParse('%Y-%m-%d');
  const xAccessor = d => dateParser(d.date);
  const countryCodeAccessor = d => d.country_short;
  const countryAccessor = d => d.country;

  const datasetByCountry = d3.nest().key(countryCodeAccessor).entries(dataset);

  const countries = datasetByCountry.filter(d => d.key !== 'LatAm');

  // 2. create dimensions
  const width = document.getElementById('wrapper_policy_latam_main')
    .parentElement.clientWidth;

  let dimensions = {
    width: width,
    height: 600,
    margin: {
      top: 15,
      right: 20,
      bottom: 40,
      left: 60,
    },
  };
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // 3. draw canvas

  const wrapper = d3
    .select('#wrapper_policy_latam_main')
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

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice();

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth]);

  const countryData = dataset.filter(d => d.country_short !== 'LatAm');
  const countryCodes = d3.map(countryData, countryCodeAccessor).keys();
  const colors = [
    '#4A72B8',
    '#ED7D30',
    '#A5A5A5',
    '#FDC010',
    '#5D9BD3',
    '#71AD46',
    '#264579',
    '#9E4B23',
    '#646464',
    '#98752B',
    '#255F92',
    '#446931',
    '#6C8EC9',
    '#F2975B',
    '#939697',
    '#FFCF34',
    '#7DAFDD',
    '#8DC268',
    '#3A5829',
    '#ED7D30',
    '#848484',
    '#CA9A2C',
    '#347EC1',
    '#C55C28',
    '#91ABD9',
    '#F3B183',
    '#8A8F90',
    '#FFDA68',
    '#9DC3E5',
    '#AAD18D',
    '#213964',
    '#4A72B8',
  ];
  const colorScale = d3.scaleOrdinal().domain(countryCodes).range(colors);

  // 6. draw peripherals -- part 1

  const yAxisGenerator = d3
    .axisLeft()
    .scale(yScale)
    .tickSize(-dimensions.boundedWidth);

  const yAxis = bounds.append('g').attr('class', 'y_axis').call(yAxisGenerator);

  const xAxisGenerator = d3
    .axisBottom()
    .scale(xScale)
    .tickSize(-dimensions.boundedHeight)
    .tickFormat(d3.timeFormat('%d %b'));

  const xAxis = bounds
    .append('g')
    .attr('class', 'x_axis')
    .call(xAxisGenerator)
    .style('transform', `translateY(${dimensions.boundedHeight}px)`);

  const xAxisText = xAxis.selectAll('text').attr('dy', 20);

  // the below code extends ticks down a bit
  // const xAxisTicks = xAxis
  //   .selectAll('.tick line')
  //   .attr('y1', dimensions.margin.bottom * 0.25);

  // 5. draw data

  // this will generate a line using the x and y Accessor functions
  const lineGenerator = d3
    .line()
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d)));

  bounds
    .selectAll('.country')
    .data(countries)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('fill', 'none')
    .attr('stroke-width', 2.5)
    .attr('stroke', '#d2d3d4')
    .attr('d', d => lineGenerator(d.values));

  const tooltipLine = bounds
    .append('line')
    .attr('class', '.tooltipLine_policy_latam');

  // highlight the countries we track
  const addCountryLine = _countryCode => {
    const data = dataset.filter(d => countryCodeAccessor(d) == _countryCode);

    bounds
      .append('path')
      .attr('class', `${_countryCode}_temp_policy_latam active_policy_latam`)
      .attr('fill', 'none')
      .attr('stroke', colorScale(_countryCode))
      .attr('stroke-width', 3)
      .attr('d', () => lineGenerator(data));
  };

  // 7. add interactivity

  const country_list = d3
    .select('#country_list_policy_latam')
    .selectAll('input')
    .data(countries)
    .enter()
    .append('li');

  country_list
    .append('input')
    .attr('class', 'input_box_policy')
    .attr('type', 'checkbox')
    .attr('name', d => `${countryCodeAccessor(d.values[0])}_policy_latam`);

  country_list
    .append('label')
    .attr('class', 'input_label')
    .attr('for', d => `${countryCodeAccessor(d.values[0])}_policy_latam`)
    .html(d => countryAccessor(d.values[0]));

  activeStartCountries = ['MEX', 'BRA'];

  activeStartCountries.forEach(element => {
    addCountryLine(element);
    country_list
      .select(`[name=${element}_policy_latam]`)
      .property('checked', true);

    country_list
      .select(`[for=${element}_policy_latam]`)
      .style('color', colorScale(element))
      .style('font-weight', 'bold');
  });

  d3.selectAll('.input_box_policy').on('input', toggleCountryLine);

  function toggleCountryLine() {
    const code = this.name.split('_')[0];
    const label = country_list.select(`[for=${this.name}]`);
    if (this.checked) {
      // input box has been checked. draw country line & style label
      addCountryLine(code);
      label.style('color', colorScale(code)).style('font-weight', 'bold');
    } else {
      // input box has been unchecked. remove country line and label style
      bounds.select(`.${code}_temp_policy_latam`).remove();
      label.style('color', '#000').style('font-weight', 'normal');
    }
  }

  // set up for tooltip interactivity
  // this is the date that shows up next to the cursor
  const tooltipDate = bounds
    .append('text')
    .attr('class', 'tooltipDate_policy_latam')
    .style('opacity', 0);

  const tooltip = d3
    .select('#tooltip_policy_latam')
    .style('opacity', 0)
    .style('top', `${dimensions.margin.top * 2}px`)
    .style('left', `${dimensions.margin.left * 1.25}px`);

  const tooltipHeader = tooltip.select('#tooltipHeader_policy_latam');
  const tooltipContent = tooltip.select('#tooltipContent_policy_latam');

  let activeCountries;

  // this rect is used to calculate dates.
  const listeningRect = bounds
    .append('rect')
    .attr('class', 'listening_rect')
    .attr('width', dimensions.boundedWidth)
    .attr('height', dimensions.boundedHeight)
    .on('mousemove', onMouseMove)
    .on('mouseleave', onMouseLeave);

  function onMouseMove() {
    tooltip.style('opacity', 1);

    // translate mouse position into a date (and y value)
    const mousePosition = d3.mouse(this);
    const hoveredDate = xScale.invert(mousePosition[0]);

    // find the closest data point
    const getDistanceFromHoveredDated = d =>
      Math.abs(xAccessor(d) - hoveredDate);
    const closestIndex = d3.scan(
      dataset,
      (a, b) => getDistanceFromHoveredDated(a) - getDistanceFromHoveredDated(b)
    );
    const closestDate = dataset[closestIndex];
    const data = countries.filter(d => d.date == closestDate.date);
    const closestXValue = xAccessor(closestDate);
    const closestYValue = yAccessor(closestDate);

    // get all the active countries to include in the tooltip
    activeCountries = [];
    const allActive = document
      .getElementById('wrapper_policy_latam_main')
      .getElementsByClassName('active_policy_latam');
    Array.from(allActive).forEach(element => {
      code = element.getAttribute('class').split('_')[0];
      activeCountries.push(code);
    });

    // clear tooltip content
    tooltipHeader.selectAll('*').remove();
    tooltipContent.selectAll('*').remove();
    d3.selectAll('.temp_circle_policy_latam').remove();

    // set a display format for tooltip's date.
    const displayFormat = d3.timeFormat('%d %B');
    const dateShown = displayFormat(dateParser(closestDate.date));
    // update tooltip date shown near cursor
    tooltipDate
      .attr('x', mousePosition[0] + 15)
      .attr('y', mousePosition[1])
      .text(dateShown)
      .attr('font-weight', 700)
      .style('opacity', 1);

    // draw the line for the date we're on
    tooltipLine
      .attr('x1', xScale(closestXValue))
      .attr('x2', xScale(closestXValue))
      .attr('y1', 0)
      .attr('y2', dimensions.boundedHeight)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '7px 2px')
      .attr('stroke', '#000')
      .style('opacity', 1);

    // update the tooltip box. add the date
    tooltipHeader.append('span').html(dateShown);
    // for each state, add the values to the tooltip box and draw the circle
    activeCountries.forEach(element => {
      // filter data so we only have country on a specific date
      const point = dataset
        .filter(d => countryCodeAccessor(d) == element)
        .filter(d => d.date == closestDate.date);
      // shortcuts we'll use to add values
      const yValue = yAccessor(point[0]);
      const xValue = xAccessor(point[0]);
      const countryCode = countryCodeAccessor(point[0]);
      const getColor = _code => {
        if (_code == 'LatAm') {
          return '#171717';
        } else {
          return colorScale(_code);
        }
      };

      // add data to tooltip box
      const countryInfo = tooltipContent
        .append('tr')
        .attr('class', 'tooltip_country');
      countryInfo
        .append('td')
        .attr('class', 'tooltip_country_name')
        .html(point[0].country)
        .style('color', getColor(element));
      countryInfo
        .append('td')
        .attr('class', 'tooltip_country_value')
        .html(yValue.toFixed(1));

      // draw a circle on the plot
      bounds
        .append('circle')
        .attr('cx', xScale(xValue))
        .attr('cy', yScale(yValue))
        .attr('r', 7)
        .attr('fill', getColor(element))
        .attr('class', 'temp_circle_policy_latam');
    });
  }

  function onMouseLeave() {
    // reset the list of active countries, remove drawn circles and hide all tooltip related visuals.
    activeCountries = [];
    tooltip.style('opacity', 0);
    tooltipLine.style('opacity', 0);
    bounds.selectAll('.temp_circle_policy_latam').remove();
    tooltipDate.style('opacity', 0);
  }
}

PolicyIndexLatam();
