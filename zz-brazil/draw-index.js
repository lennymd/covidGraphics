async function indexLineChart({
  country,
  yVariable,
  yRank,
  useBaseline,
  usePercentage,
  chartKeyword,
}) {
  // This function works with country datasets and takes in the following arguments to create a line chart:
  // 'country': name of the country to load the data file
  // 'yVariable': column name of y-axis variable
  // 'yRank': variable used for ranking and highlighting best and worst.
  // 'useBaseline': boolean for drawing the zero baseline.
  // 'usePercentage': boolean for converting y-axis into %
  // 'chartKeyword': keyword for picking the ids from the document.

  // Set the right language for months and days
  setTimeLanguage();
  const formatDate =
    _lang == 'pt-br' || _lang == 'es-ES'
      ? d3.timeFormat('%d %B')
      : d3.timeFormat('%B %d');
  const formatDateShort =
    _lang == 'pt-br' || _lang == 'es-ES'
      ? d3.timeFormat('%d %b')
      : d3.timeFormat('%b %d');

  // Download data
  let dataset = await d3.csv(`brazil_data_latest.csv`);

  // Set up data accessors -- shorthand functions for accessing the different variables.
  const yAccessor = d => +d[`${yVariable}`];
  const dateParser = d3.timeParse('%Y-%m-%d');
  const xAccessor = d => dateParser(d.date);
  const stateNameAccessor = d => d.state_name;
  const stateCodeAccessor = d => d.state_short;
  const dayAccessor = d => +d.days;
  const metricAccessor = d => +d[`${yRank}`];

  // Organize data for visualizing

  // (a) remove values that are greater than 100%.
  // TODO update this when Hector updates testpositivity_rate data to a 0 to 100 scale.
  // if (yVariable == 'testpositivity_rate' && country == 'mexico') {
  //   dataset = dataset.filter(d => yAccessor(d) < 1);
  // }

  // Group states by stateCode and separate into states and national data.
  const datasetByStateCode = d3
    .nest()
    .key(stateCodeAccessor)
    .sortKeys(d3.ascending)
    .entries(dataset);
  const national = datasetByStateCode.filter(d => d.key == 'Nacional');
  const states = datasetByStateCode.filter(d => d.key != 'Nacional');

  // Create chart dimensions
  const wrapperElt = `wrapper_${chartKeyword}`;
  const width = document.getElementById(wrapperElt).parentElement.clientWidth;
  let dimensions = {
    width: width,
    height: 600,
    margin: {top: 20, right: 35, bottom: 40, left: 15},
  };
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // Create chart containers
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

  // Create Scales
  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice();
  // TODO update this when Hector updates testpositivity_rate data to a 0 to 100 scale.
  if (yVariable == 'testpositivity_rate' && country == 'mexico') {
    yScale.domain([0, 1]).clamp(true);
  }
  const xExtent = d3.extent(dataset, xAccessor);
  const xScale = d3
    .scaleTime()
    .domain([xExtent[0], xExtent[1] * 1.0003])
    .range([0, dimensions.boundedWidth]);

  const datasetSansNational = dataset.filter(
    d => stateCodeAccessor(d) != 'Nacional'
  );
  const stateCodes = d3.map(datasetSansNational, stateCodeAccessor).keys();
  const colorScale = d3.scaleOrdinal().domain(stateCodes).range(colorGroup);
  const colorNational = '#333';
  const colorPeripheral = '#111';
  const colorGrey = '#d2d3d4';

  // Draw yAxis
  const yAxisGenerator = d3
    .axisRight()
    .scale(yScale)
    .tickSize(-dimensions.boundedWidth);

  // Add percentage symbol to yAxis ticks when needed
  if (usePercentage) {
    // TODO update this when Hector updates testpositivity_rate data to a 0 to 100 scale.
    if (yVariable == 'testpositivity_rate' && country == 'mexico') {
      yAxisGenerator.tickFormat(d => d3.format('.0p')(d));
    } else {
      yAxisGenerator.tickFormat(d => d + '%');
    }
  }
  const yAxis = bounds
    .append('g')
    .attr('class', 'y_axis')
    .call(yAxisGenerator)
    .style('transform', `translateX(${dimensions.boundedWidth}px)`);

  // Draw xAxis
  const xAxisGenerator = d3
    .axisBottom()
    .scale(xScale)
    .tickSize(-dimensions.boundedHeight)
    .tickFormat(formatDateShort)
    .ticks(7);
  const xAxis = bounds
    .append('g')
    .attr('class', 'x_axis')
    .call(xAxisGenerator)
    .style('transform', `translateY(${dimensions.boundedHeight}px)`);
  xAxis.selectAll('text').attr('dy', 20);
  xAxis.selectAll('.tick line').attr('y1', dimensions.margin.bottom * 0.25);

  // draw zero-baseline if needed
  if (useBaseline) {
    bounds
      .append('line')
      .attr('class', 'baseline')
      .attr('stroke-width', 2)
      .attr('stroke', colorPeripheral)
      .attr('x1', 0)
      .attr('x2', dimensions.boundedWidth)
      .attr('y1', yScale(0))
      .attr('y2', yScale(0));
  }

  // Draw Data

  // line generator function
  const lineGenerator = d3
    .line()
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d)));

  // draw greyed out state lines
  bounds
    .selectAll('.state')
    .data(states)
    .enter()
    .append('path')
    .attr('class', d => `state ${d.key}_${chartKeyword}`)
    .attr('fill', 'none')
    .attr('stroke-width', 1.25)
    .attr('stroke', colorGrey)
    .attr('d', d => lineGenerator(d.values));

  // draw national average data for reference
  bounds
    .selectAll('.national')
    .data(national)
    .enter()
    .append('path')
    .attr('class', 'national')
    .attr('fill', 'none')
    .attr('stroke', colorNational)
    .attr('stroke-dasharray', '9px 2px')
    .attr('stroke-width', 2.5)
    .attr('d', d => lineGenerator(d.values));

  // Highlight the first and last ranked for whatever the yVariable is.
  // Get the latest day. Filter the dataset to include data from latestDay. Nest filtered dataset using the metricAccessor.
  // Rank 1 state will be d.key == 1,
  // Rank Last will be d.key == states.length

  const latestDay = d3.max(dataset.map(dayAccessor));
  const latestData = dataset.filter(d => dayAccessor(d) == latestDay);
  const statesRanked = d3
    .nest()
    .key(metricAccessor)
    .sortKeys(d3.ascending)
    .entries(latestData);

  // highlightStates is an array with the exact observations for the first and last ranked states to highlight
  const highlightStates = [
    statesRanked.filter(d => d.key == 1)[0].values[0],
    statesRanked.filter(d => d.key == states.length)[0].values[0],
  ];

  // This function draws the active version of a state line that the viewer can interact with
  const addStateLine = stateCode => {
    const state = datasetByStateCode.filter(d => d.key == stateCode);
    bounds
      .append('path')
      .attr('id', `${stateCode}_${chartKeyword}`)
      .attr('class', `active_${chartKeyword}`)
      .attr('fill', 'none')
      .attr('stroke', colorScale(stateCode))
      .attr('stroke-width', 3)
      .attr('d', () => lineGenerator(state[0].values));
  };

  // highlightStates.forEach(element => {
  //   const code = stateCodeAccessor(element);
  //   addStateLine(code);
  // });
  mobility_extra = ['SC', 'CE', 'PI', 'AM', 'PA', 'MS'];
  mobility_extra.forEach(element => addStateLine(element));
  // const tooltipLine = bounds
  //   .append('line')
  //   .attr('id', `tooltipLine_${chartKeyword}`)
  //   .attr('y1', 0)
  //   .attr('y2', dimensions.boundedHeight)
  //   .attr('stroke-width', 2)
  //   .attr('stroke-dasharray', '7px 2px')
  //   .attr('stroke', colorPeripheral)
  //   .attr('opacity', 0);

  // // Create Sidebar for toggling states
  // const stateList = d3
  //   .select(`#stateList_${chartKeyword}`)
  //   .selectAll('input')
  //   .data(states)
  //   .enter()
  //   .append('li')
  //   .attr('class', d => `${d.key}_input`);
  // stateList
  //   .append('input')
  //   .attr('class', `checkbox_${chartKeyword}`)
  //   .attr('type', 'checkbox')
  //   .attr('name', d => `${d.key}_${chartKeyword}`);
  // stateList
  //   .append('label')
  //   .attr('class', `checkboxLabel checkboxLabel_${chartKeyword}`)
  //   .attr('for', d => `${d.key}_${chartKeyword}`)
  //   .html(d => stateNameAccessor(d.values[0]));

  // // make sure checkboxes are checked and labels are active for highlighted states
  // highlightStates.forEach(element => {
  //   const code = stateCodeAccessor(element);
  //   const checkbox = stateList.select(`[name=${code}_${chartKeyword}]`);
  //   const checkboxLabel = stateList.select(`[for=${code}_${chartKeyword}]`);
  //   checkbox.property('checked', true);
  //   checkboxLabel.style('color', colorScale(code)).style('font-weight', 'bold');
  // });

  // // toggle State lines and their corresponding labels
  // d3.selectAll(`.checkbox_${chartKeyword}`).on('input', toggleStateLine);
  // function toggleStateLine() {
  //   const code = this.name.split('_')[0];
  //   const selector = `${code}_${chartKeyword}`;
  //   const checkboxLabel = stateList.select(`[for=${selector}]`);

  //   if (this.checked) {
  //     // checkbox just got turned on. Draw the active line and style the checkboxLabel
  //     addStateLine(code);
  //     checkboxLabel
  //       .style('color', colorScale(code))
  //       .style('font-weight', 'bold');
  //   } else {
  //     // checkbox just got turned off. Remove the active line and reset the checkboxLabel
  //     bounds.select(`#${selector}`).remove();
  //     checkboxLabel
  //       .style('color', colorNational)
  //       .style('font-weight', 'normal');
  //   }
  // }
}
