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
  let dataset = await d3.csv(
    `https://raw.githubusercontent.com/lennymd/covidGraphics/main/data/${country}_data_latest.csv`
  );

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
    height: 535,
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
  console.log('latest day', latestDay);
  const latestData = dataset.filter(d => dayAccessor(d) == latestDay);

  // const statesRanked = d3
  //   .nest()
  //   .key(metricAccessor)
  //   .sortKeys(d3.ascending)
  //   .entries(latestData);
  // highlightStates is an array with the exact observations for the first and last ranked states to highlight

  const highlightStates = [
    latestData.filter(d => metricAccessor(d) == 1)[0],
    latestData.filter(d => metricAccessor(d) == states.length)[0].values[0],
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

  highlightStates.forEach(element => {
    const code = stateCodeAccessor(element);
    addStateLine(code);
  });

  const tooltipLine = bounds
    .append('line')
    .attr('id', `tooltipLine_${chartKeyword}`)
    .attr('y1', 0)
    .attr('y2', dimensions.boundedHeight)
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '7px 2px')
    .attr('stroke', colorPeripheral)
    .attr('opacity', 0);

  // Create Sidebar for toggling states
  const stateList = d3
    .select(`#stateList_${chartKeyword}`)
    .selectAll('input')
    .data(states)
    .enter()
    .append('li')
    .attr('class', d => `${d.key}_input`);
  stateList
    .append('input')
    .attr('class', `checkbox_${chartKeyword}`)
    .attr('type', 'checkbox')
    .attr('name', d => `${d.key}_${chartKeyword}`);
  stateList
    .append('label')
    .attr('class', `checkboxLabel checkboxLabel_${chartKeyword}`)
    .attr('for', d => `${d.key}_${chartKeyword}`)
    .html(d => stateNameAccessor(d.values[0]));

  // make sure checkboxes are checked and labels are active for highlighted states
  highlightStates.forEach(element => {
    const code = stateCodeAccessor(element);
    const checkbox = stateList.select(`[name=${code}_${chartKeyword}]`);
    const checkboxLabel = stateList.select(`[for=${code}_${chartKeyword}]`);
    checkbox.property('checked', true);
    checkboxLabel.style('color', colorScale(code)).style('font-weight', 'bold');
  });

  // toggle State lines and their corresponding labels
  d3.selectAll(`.checkbox_${chartKeyword}`).on('input', toggleStateLine);
  function toggleStateLine() {
    const code = this.name.split('_')[0];
    const selector = `${code}_${chartKeyword}`;
    const checkboxLabel = stateList.select(`[for=${selector}]`);

    if (this.checked) {
      // checkbox just got turned on. Draw the active line and style the checkboxLabel
      addStateLine(code);
      checkboxLabel
        .style('color', colorScale(code))
        .style('font-weight', 'bold');
    } else {
      // checkbox just got turned off. Remove the active line and reset the checkboxLabel
      bounds.select(`#${selector}`).remove();
      checkboxLabel
        .style('color', colorNational)
        .style('font-weight', 'normal');
    }
  }

  // prepare tooltip container for tooltip interaction
  const tooltip = d3
    .select(`#tooltip_${chartKeyword}`)
    .style('top', `${dimensions.margin.top}px`);

  // if we are using baseline & percentage, it's likely mobility closer to the middle
  const multiplier = useBaseline && usePercentage ? 10 : 1;
  tooltip.style('left', `${dimensions.margin.left * multiplier}px`);

  const tooltipHeader = tooltip.select(`#tooltipHeader_${chartKeyword}`);
  const tooltipContent = tooltip.select(`#tooltipContent_${chartKeyword}`);

  // create listeningRect for tooltip interaction
  const listeningRect = bounds
    .append('rect')
    .attr('class', 'listening_rect')
    .attr('width', dimensions.boundedWidth)
    .attr('height', dimensions.boundedHeight)
    .on('mousemove', onMouseMove)
    .on('mouseleave', onMouseLeave);

  function onMouseMove() {
    tooltip.style('opacity', 1);

    // Get mouse position and translate it into date and y-value. Use this to find the closest date to your mouse position in the dataset. This is straight from Amelia's book.
    const mousePosition = d3.mouse(this);
    const hoveredDate = xScale.invert(mousePosition[0]);
    const getDistanceFromHoveredDate = d =>
      Math.abs(xAccessor(d) - hoveredDate);
    const closestIndex = d3.scan(
      dataset,
      (a, b) => getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b)
    );
    const closestDate = dataset[closestIndex];
    const closestXValue = xAccessor(closestDate);

    // Create list of all active states.
    const activeStates = [];
    const activeLinesHTML = document.getElementsByClassName(
      `active_${chartKeyword}`
    );
    const activeLines = Array.from(activeLinesHTML);
    activeLines.forEach(element => {
      activeStates.push(element.getAttribute('id').split('_')[0]);
    });

    // Sort active states and prepend National so that national data is always on top.
    const nationalSpelling =
      _lang == 'pt-br' || _lang == 'es-ES' ? 'Nacional' : 'National';
    activeStates.sort().unshift('Nacional');

    // Clear tooltip content and remove any intersection dots
    tooltipHeader.selectAll('*').remove();
    tooltipContent.selectAll('*').remove();
    bounds.selectAll(`.intersection_${chartKeyword}`).remove();

    // position tooltipLine
    tooltipLine
      .style('opacity', 1)
      .attr('x1', xScale(closestXValue))
      .attr('x2', xScale(closestXValue));

    // Add tooltipHeader text
    tooltipHeader.append('span').html(formatDate(dateParser(closestDate.date)));

    // populate tooltip with data
    activeStates.forEach(element => {
      // Get data for the specific state on the specific date
      const state = dataset
        .filter(d => stateCodeAccessor(d) == element)
        .filter(d => d.date == closestDate.date);
      const point = state[0];

      const yValue = yAccessor(point);
      const xValue = xAccessor(point);
      const stateName =
        element == 'Nacional' ? nationalSpelling : stateNameAccessor(point);
      const color = element == 'Nacional' ? colorNational : colorScale(element);

      // add row for state data in table
      const dataRow = tooltipContent
        .append('tr')
        .attr('class', 'tooltip_state');

      // add stateName
      dataRow
        .append('td')
        .attr('class', 'tooltip_stateName')
        .html(() => stateName)
        .style('color', color);

      dataRow
        .append('td')
        .attr('class', 'tooltip_stateValue')
        .html(() => {
          // TODO update this when Hector updates testpositivity_rate data to a 0 to 100 scale.
          const multiplier =
            usePercentage &&
            yVariable == 'testpositivity_rate' &&
            country == 'mexico'
              ? 100
              : 1;
          const suffix = usePercentage ? '%' : '';
          const value = d3.format('.1f')(yValue * multiplier);
          if (value > 100) {
            return 100 + suffix;
          } else {
            return value + suffix;
          }
        });

      // add dots
      bounds
        .append('circle')
        .attr('cx', xScale(xValue))
        .attr('cy', yScale(yValue))
        .attr('r', 7)
        .attr('fill', color)
        .attr('class', `intersection_${chartKeyword}`);
    });
  }

  function onMouseLeave() {
    const activeStates = [];
    tooltip.style('opacity', 0);
    tooltipLine.style('opacity', 0);
    bounds.selectAll(`.intersection_${chartKeyword}`).remove();
  }
}
