async function indexLineChart_LATAM({
  yVariable,
  useBaseline,
  usePercentage,
  chartKeyword,
}) {
  // This function works with country datasets and takes in the following arguments to create a line chart:
  // 'yVariable': column name of y-axis variable
  // 'useRegion': boolean for drawing latam/region data.
  // TODO revise this explanation if we're not using LATAM data.
  // 'useBaseline': boolean for drawing the zero baseline **Deprecated I think**
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

  // 1. Get data
  let dataset = await d3.csv(
    `https://raw.githubusercontent.com/lennymd/covidGraphics/main/data/latam_latest.csv`
  );

  // Set up data accessors -- shorthand functions for accessing the different variables.
  const yAccessor = d => +d[`${yVariable}`];
  const dateParser = d3.timeParse('%Y-%m-%d');
  const xAccessor = d => dateParser(d.date);
  const countryCodeAccessor = d => d.country_short;
  const countryNameAccessor = d => d.country;

  // Organize data for visualizing

  // remove values that are greater than 100%
  // TODO update this when Hector updates testpositivity_rate data to a 0 to 100 scale.
  // if (yVariable == 'testpositivity_rate') {
  //   dataset = dataset.filter(d => yAccessor(d) < 1);
  // }

  // Group states by countryCode and separate into nested groups.
  const datasetByCountryCode = d3
    .nest()
    .key(countryCodeAccessor)
    .sortKeys(d3.ascending)
    .entries(dataset);
  const countries = datasetByCountryCode.filter(d => d.key != 'LATAM');

  // 2. create dimensions
  const wrapperElt = `wrapper_${chartKeyword}`;
  let dimensions = {
    width: document.getElementById(wrapperElt).parentElement.clientWidth,
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
  if (yVariable == 'testpositivity_rate') {
    yScale.domain([0, 1]).clamp(true);
  }
  const xExtent = d3.extent(dataset, xAccessor);
  const xScale = d3
    .scaleTime()
    .domain([xExtent[0], xExtent[1] * 1.0003])
    .range([0, dimensions.boundedWidth]);

  const datasetSansRegional = dataset.filter(
    d => countryCodeAccessor(d) != 'LATAM'
  );
  const countryCodes = d3.map(datasetSansRegional, countryCodeAccessor).keys();
  const colorScale = d3.scaleOrdinal().domain(countryCodes).range(colorGroup);
  const colorNational = '#333';
  const colorPeripheral = '#111';
  const colorGrey = '#d2d3d4';

  // Draw yAxis
  const yAxisGenerator = d3
    .axisRight()
    .scale(yScale)
    .tickSize(-dimensions.boundedWidth);

  // add percentage symbol to yAxis ticks when needed.
  if (usePercentage) {
    // TODO update this when Hector updates testpositivity_rate data to a 0 to 100 scale.
    if (yVariable == 'testpositivity_rate') {
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

  // draw zero-baseline if true
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

  // draw greyed out country lines
  bounds
    .selectAll('.country')
    .data(countries)
    .enter()
    .append('path')
    .attr('class', d => `country ${d.key}_${chartKeyword}`)
    .attr('fill', 'none')
    .attr('stroke-width', 1.25)
    .attr('stroke', colorGrey)
    .attr('d', d => lineGenerator(d.values));

  // draw regional average data for reference.
  // if (useRegion) {
  //   bounds
  //     .selectAll('.region')
  //     .data(latam)
  //     .enter()
  //     .append('path')
  //     .attr('class', 'region')
  //     .attr('fill', 'none')
  //     .attr('stroke', '#333333')
  //     .attr('stroke-dasharray', '9px 2px')
  //     .attr('stroke-width', 2.5)
  //     .attr('d', d => lineGenerator(d.values));
  // }

  // This function draws the active version of a country line that the viewer can interact with
  const addCountryLine = countryCode => {
    const country = dataset.filter(d => countryCodeAccessor(d) == countryCode);

    bounds
      .append('path')
      .attr('id', `${countryCode}_${chartKeyword}`)
      .attr('class', `active_${chartKeyword}`)
      .attr('fill', 'none')
      .attr('stroke', colorScale(countryCode))
      .attr('stroke-width', 3)
      .attr('d', () => lineGenerator(country));
  };

  // add active lines for the countries we're watching at the sub-national level
  const watchedCountries = ['MEX', 'BRA', 'BOL', 'CHL'];
  watchedCountries.forEach(element => {
    addCountryLine(element);
  });

  const tooltipLine = bounds
    .append('line')
    .attr('id', `tooltipLine_${chartKeyword}`)
    .attr('y1', 0)
    .attr('y2', dimensions.boundedHeight)
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '7px 2px')
    .attr('stroke', colorPeripheral)
    .style('opacity', 0);

  // Create Sidebar for toggling countries
  const countryList = d3
    .select(`#countryList_${chartKeyword}`)
    .selectAll('input')
    .data(countries)
    .enter()
    .append('li')
    .attr('class', d => `${d.key}_input`);
  countryList
    .append('input')
    .attr('class', `checkbox_${chartKeyword}`)
    .attr('type', 'checkbox')
    .attr('name', d => `${d.key}_${chartKeyword}`);
  countryList
    .append('label')
    .attr('class', `checkboxLabel checkboxLabel_${chartKeyword}`)
    .attr('for', d => `${d.key}_${chartKeyword}`)
    .html(d => countryNameAccessor(d.values[0]));

  // make sure checkboxes are checked and labels are active for watched countries
  watchedCountries.forEach(element => {
    const checkbox = countryList.select(`[name=${element}_${chartKeyword}]`);
    const checkboxLabel = countryList.select(
      `[for=${element}_${chartKeyword}]`
    );

    checkbox.property('checked', true);
    checkboxLabel
      .style('color', colorScale(element))
      .style('font-weight', 'bold');
  });

  // toggle country lines and their corresponding labels using checkbox inputs.
  d3.selectAll(`.checkbox_${chartKeyword}`).on('input', toggleCountryLine);
  function toggleCountryLine() {
    const code = this.name.split('_')[0];
    const selector = `${code}_${chartKeyword}`;
    const checkboxLabel = countryList.select(`[for=${selector}]`);

    if (this.checked) {
      // checkbox just got turned on. Draw the active line and style the checkboxLabel
      addCountryLine(code);
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

  // prepare tooltip container for interaction
  const tooltip = d3
    .select(`#tooltip_${chartKeyword}`)
    .style('top', `${dimensions.margin.top}px`);

  // if we are using baseline & percentage, it's likely mobility so put the tooltip box on the right
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

    // Create list of all active countries
    const activeCountries = [];
    const activeLinesHTML = document.getElementsByClassName(
      `active_${chartKeyword}`
    );
    const activeLines = Array.from(activeLinesHTML);
    activeLines.forEach(element => {
      activeCountries.push(element.getAttribute('id').split('_')[0]);
    });

    // Sort active countries.
    activeCountries.sort();

    // Clear tooltip content and remove any intersection dots.
    tooltipHeader.selectAll('*').remove();
    tooltipContent.selectAll('*').remove();
    bounds.selectAll(`.intersection_${chartKeyword}`).remove();

    // position tooltipLine
    tooltipLine
      .attr('x1', xScale(closestXValue))
      .attr('x2', xScale(closestXValue))
      .style('opacity', 1);

    // add tooltipHeader text
    tooltipHeader.append('span').html(formatDate(dateParser(closestDate.date)));

    // populate tooltip with data
    activeCountries.forEach(element => {
      // Get data for the specific country on the specific date
      const country = dataset
        .filter(d => countryCodeAccessor(d) == element)
        .filter(d => d.date == closestDate.date);
      const point = country[0];

      const yValue = yAccessor(point);
      const xValue = xAccessor(point);
      const countryName = countryNameAccessor(point);
      const color = element == 'LATAM' ? colorNational : colorScale(element);

      // add row for country data in table
      const dataRow = tooltipContent
        .append('tr')
        .attr('class', 'tooltip_country');

      dataRow
        .append('td')
        .attr('class', 'tooltip_countryName')
        .html(() => countryName)
        .style('color', color);

      dataRow
        .append('td')
        .attr('class', 'tooltip_countryValue')
        .html(() => {
          // TODO update this when Hector updates testpositivity_rate data to a 0 to 100 scale.
          const multiplier = yVariable == 'testpositivity_rate' ? 100 : 1;
          const suffix = usePercentage ? '%' : '';
          let value = d3.format('.1f')(yValue * multiplier);
          if (value > 100) {
            return 100 + suffix;
          } else {
            return value + suffix;
          }
        });

      // create a temporary dot on the line chat for that day
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
    const activeCountries = [];
    tooltip.style('opacity', 0);
    tooltipLine.style('opacity', 0);
    bounds.selectAll(`.intersection_${chartKeyword}`).remove();
  }
}
