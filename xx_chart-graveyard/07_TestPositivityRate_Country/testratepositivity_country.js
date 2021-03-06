async function TestRatePositivityCountry(_country) {
  // 0. check for language locale
  setLocale();

  // 1. access data
  const dataset = await d3.csv(
    `https://raw.githubusercontent.com/lennymartinez/covid_latam/master/data/${_country}_data_latest.csv`
  );

  // data accessors, shorthand for different columns
  const yAccessor = d => +d.testpositivity_rate;
  const dateParser = d3.timeParse('%Y-%m-%d');
  const xAccessor = d => dateParser(d.date);
  const stateAccessor = d => d.state_name;
  const stateCodeAccessor = d => d.state_short;
  const dayAccessor = d => +d.days;
  const metricAccessor = d => +d.ranking_testpositivity;

  // sorting and organizing data
  const datasetByState = d3.nest().key(stateCodeAccessor).entries(dataset);

  const country_data = datasetByState.filter(d => d.key == 'Nacional');
  const states = datasetByState.filter(d => d.key != 'Nacional');
  // 2. create dimensions

  const width = document.getElementById('wrapper_positivity_main').parentElement
    .clientWidth;
  let dimensions = {
    width: width,
    height: 600,
    margin: {
      top: 15,
      right: 15,
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
    .select('#wrapper_positivity_main')
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

  const statesData = dataset.filter(d => d.state_short != 'Nacional');
  const stateCodes = d3.map(statesData, stateCodeAccessor).keys();
  const colorScale = d3.scaleOrdinal().domain(stateCodes).range(colorGroup);

  // 6. draw peripherals -- part 1
  const yAxisGenerator = d3
    .axisLeft()
    .scale(yScale)
    .tickSize(-dimensions.boundedWidth)
    .tickFormat(d => d + '%');

  const yAxis = bounds.append('g').attr('class', 'y_axis').call(yAxisGenerator);

  const xAxisGenerator = d3
    .axisBottom()
    .scale(xScale)
    .tickSize(-dimensions.boundedHeight)
    .tickFormat(d3.timeFormat('%-d %b'));

  const xAxis = bounds
    .append('g')
    .attr('class', 'x_axis')
    .call(xAxisGenerator)
    .style('transform', `translateY(${dimensions.boundedHeight}px)`);

  const xAxisText = xAxis.selectAll('text').attr('dy', 20);

  const xAxisTicks = xAxis
    .selectAll('.tick line')
    .attr('y1', dimensions.margin.bottom * 0.25);

  // 5. draw data

  // this will generate a line using the x and y Accessor functions
  const lineGenerator = d3
    .line()
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d)));

  bounds
    .selectAll('.states')
    .data(states)
    .enter()
    .append('path')
    .attr('fill', 'none')
    .attr('stroke-width', 1.25)
    .attr('stroke', '#d2d3d4')
    .attr('d', d => lineGenerator(d.values))
    .attr('class', d => `${d.key}_testpositivityrate states`);

  const tooltipLine = bounds
    .append('line')
    .attr('class', '.tooltipLine_positivity');

  // add national average
  bounds
    .append('path')
    .attr('class', 'national')
    .attr('fill', 'none')
    .attr('stroke', '#171717')
    .attr('stroke-dasharray', '9px 2px')
    .attr('stroke-width', 2.5)
    .attr('d', () => lineGenerator(country_data[0].values));

  // Highlight the first and last ranked states for this variable.
  // We do this by first getting the lastest day.
  // Then we filter loaded dataset to keep lines where day == latestDay.
  // Then we nest this filtered dataset using the metricAccessor.
  // Rank 1 state will be d.key == 1 and last-ranked state will be d.key == states.length.
  const latestDay = d3.max(dataset.map(dayAccessor));
  const latestData = dataset.filter(d => dayAccessor(d) == latestDay);
  const rankedStates = d3.nest().key(metricAccessor).entries(latestData);
  const firstRankState = rankedStates.filter(d => d.key == 1);
  const lastRankState = rankedStates.filter(d => d.key == states.length);
  const firstRankCode = firstRankState[0].values[0].state_short;
  const lastRankCode = lastRankState[0].values[0].state_short;
  // This function draws the temporary state line given a state code.
  const addStateLine = _stateCode => {
    const stateData = dataset.filter(d => stateCodeAccessor(d) == _stateCode);

    bounds
      .append('path')
      .attr('class', `${_stateCode}_temp_positivity active_positivity`)
      .attr('fill', 'none')
      .attr('stroke', colorScale(_stateCode))
      .attr('stroke-width', 3)
      .attr('d', () => lineGenerator(stateData));
  };

  addStateLine(firstRankCode);
  addStateLine(lastRankCode);

  // 7. act interactivity

  const state_list = d3
    .select('#state_list_positivity')
    .selectAll('input')
    .data(states)
    .enter()
    .append('li')
    .attr('class', d => `${stateCodeAccessor(d.values[0])}_input`);

  state_list
    .append('input')
    .attr('class', 'input_box_positivity')
    .attr('type', 'checkbox')
    .attr('name', d => `${stateCodeAccessor(d.values[0])}_positivity`);

  state_list
    .append('label')
    .attr('class', 'input_label')
    .attr('for', d => `${stateCodeAccessor(d.values[0])}_positivity`)
    .html(d => stateAccessor(d.values[0]));

  state_list
    .select(`[name=${firstRankCode}_positivity]`)
    .property('checked', true);
  state_list
    .select(`[for=${firstRankCode}_positivity]`)
    .style('color', colorScale(firstRankCode))
    .style('font-weight', 'bold');

  state_list
    .select(`[name=${lastRankCode}_positivity]`)
    .property('checked', true);
  state_list
    .select(`[for=${lastRankCode}_positivity]`)
    .style('color', colorScale(lastRankCode))
    .style('font-weight', 'bold');

  d3.selectAll('.input_box_positivity').on('input', toggleStateLine);

  function toggleStateLine() {
    const code = this.name.split('_')[0];
    const label = state_list.select(`[for=${this.name}]`);
    if (this.checked) {
      // input box has been checked
      // 1 - turn on state line
      addStateLine(code);
      // 2 - turn on label to match color
      label.style('color', colorScale(code)).style('font-weight', 'bold');
    } else {
      // input box has been unchecked
      // 1 - turn off state line
      bounds.select(`.${code}_temp_positivity`).remove();
      label.style('color', '#000').style('font-weight', 'normal');
      // 2 - turn off label to match colors
    }
  }
  const tooltipDate = bounds
    .append('text')
    .attr('class', 'tooltipDate_positivity')
    .style('opacity', 0);
  // tooltip interactivity:

  const listeningRect = bounds
    .append('rect')
    .attr('class', 'listening-rect')
    .attr('width', dimensions.boundedWidth)
    .attr('height', dimensions.boundedHeight)
    .on('mousemove', onMouseMove)
    .on('mouseleave', onMouseLeave);

  const tooltip = d3
    .select('#tooltip_positivity')
    .style('opacity', 0)
    .style('top', `${dimensions.margin.top * 2}px`)
    .style('left', `${dimensions.margin.left * 1.25}px`);
  const tooltipHeader = tooltip.select('#tooltipHeader_positivity');
  const tooltipContent = tooltip.select('#tooltipContent_positivity');
  let activeStates;

  function onMouseMove() {
    tooltip.style('opacity', 1);
    // Translate mouse position into a date and y-value
    const mousePosition = d3.mouse(this);
    const hoveredDate = xScale.invert(mousePosition[0]);

    const getDistanceFromHoveredDate = d =>
      Math.abs(xAccessor(d) - hoveredDate);

    const closestIndex = d3.scan(
      dataset,
      (a, b) => getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b)
    );
    const closestDate = dataset[closestIndex];

    const data = states.filter(d => d.date == closestDate.date);
    const closestXValue = xAccessor(closestDate);
    const closestYValue = yAccessor(closestDate);

    activeStates = ['Nacional'];
    // get a list of all the active states
    const allActive = document
      .getElementById('wrapper_positivity_main')
      .getElementsByClassName('active_positivity');

    Array.from(allActive).forEach(element => {
      code = element.getAttribute('class').split('_')[0];
      activeStates.push(code);
    });

    // clear the tooltip box
    tooltipHeader.selectAll('*').remove();
    tooltipContent.selectAll('*').remove();
    d3.selectAll('.temp_circle_positivity').remove();

    const displayFormat = d3.timeFormat('%d %B');

    // Update tooltipDate with current date:
    tooltipDate
      .attr('x', xScale(closestXValue) + 15)
      .attr('y', mousePosition[1])
      .text(displayFormat(dateParser(closestDate.date)))
      .attr('font-weight', 700)
      .style('opacity', 1);
    // Add date to tooltip
    tooltipHeader
      .append('span')
      .html(displayFormat(dateParser(closestDate.date)));

    tooltipLine
      .attr('x1', xScale(closestXValue))
      .attr('x2', xScale(closestXValue))
      .attr('y1', 0)
      .attr('y2', dimensions.boundedHeight)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '7px 2px')
      .attr('stroke', '#000')
      .style('opacity', 1);

    // add value for each active state to the tooltip
    activeStates.forEach(element => {
      // filter for the state's data on that day.
      const point = dataset
        .filter(d => d.state_short == element)
        .filter(d => d.date == closestDate.date);

      const yValue = yAccessor(point[0]);
      const xValue = xAccessor(point[0]);
      const stateName = stateCodeAccessor(point[0]);
      const getColor = _code => {
        if (_code == 'Nacional') {
          return '#171717';
        } else {
          return colorScale(stateName);
        }
      };
      const pointInfo = tooltipContent
        .append('tr')
        .attr('class', 'tooltip_state');
      pointInfo
        .append('td')
        .attr('class', 'tooltip_state_name')
        .html(point[0].state_name)
        .style('color', getColor(element));
      pointInfo
        .append('td')
        .attr('class', 'tooltip_value')
        .html(yValue.toFixed(1) + '%');

      // add a dot for each state
      bounds
        .append('circle')
        .attr('cx', xScale(xValue))
        .attr('cy', yScale(yValue))
        .attr('r', 7)
        .attr('fill', getColor(element))
        .attr('class', 'temp_circle_positivity');
    });
  }

  function onMouseLeave() {
    activeStates = ['Nacional'];
    tooltip.style('opacity', 0);
    tooltipLine.style('opacity', 0);
    bounds.selectAll('.temp_circle_positivity').remove();
    tooltipDate.style('opacity', 0);
  }
}
