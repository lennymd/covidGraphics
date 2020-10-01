async function ihmeChart({chartKeyword, cutoffDate}) {
  // 0. check for language locale
  setTimeLanguage();

  // 1. access data
  // TODO use absolute url from github
  const dataset = await d3.csv(
    `https://raw.githubusercontent.com/lennymd/covidGraphics/main//data/ihme/ihmeClean.csv`
  );

  // data accessors, shorthand for different columns
  const yAccessor = d => +d.deaths_mean_smoothed;
  const dateParser = d3.timeParse('%Y-%m-%d');
  const xAccessor = d => dateParser(d['date']);
  const countryNameAccessor = d => d.location_name;
  const locationIDAccessor = d => d.location_id;
  const upperProjectionAccessor = d => +d.deaths_upper_smoothed;
  const lowerProjectionAccessor = d => +d.deaths_lower_smoothed;

  // here's the list of countries we care about. we use this one because ihme doesn't have data for all the countries in pais.
  const ihmeCountryList = [
    'Mexico',
    'Ecuador',
    'Chile',
    'Argentina',
    'Bolivia',
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
    'El Salvador',
  ].sort();

  // nest filtered dataset so we draw 1 line per country
  const datasetByCountry = d3
    .nest()
    .key(countryNameAccessor)
    .sortKeys(d3.ascending)
    .entries(dataset);
  const cutoffDate_converted = dateParser(cutoffDate);

  // 2. create dimensions
  const wrapperElt = `wrapper_${chartKeyword}`;

  let dimensions = {
    width: document.getElementById(wrapperElt).parentElement.clientWidth,
    height: 650,
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

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(dataset, upperProjectionAccessor)])
    .range([dimensions.boundedHeight, 0])
    .nice();

  const xExtent = d3.extent(dataset, xAccessor);
  const xScale = d3
    .scaleTime()
    .domain([xExtent[0], xExtent[1] * 1.001])
    .range([0, dimensions.boundedWidth]);

  const colorScale = d3
    .scaleOrdinal()
    .domain(ihmeCountryList)
    .range(colorGroup);

  // 5. draw peripherals -- part 1
  // TODO make a right axis
  const yAxisGenerator = d3
    .axisLeft()
    .scale(yScale)
    .tickSize(-dimensions.boundedWidth);

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

  // 6. draw data

  // this will generate a line using the x and y Accessor functions
  const lineGenerator = d3
    .line()
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d)));

  // this will generate area for uncertainty in projections
  const areaGenerator = d3
    .area()
    .x(d => xScale(xAccessor(d)))
    .y0(d => yScale(lowerProjectionAccessor(d)))
    .y1(d => yScale(upperProjectionAccessor(d)));

  // This forEach draws the grey dashed & solid lines for projected and confirmed data, respectively. This is the stuff we can use to compare with the active countries.
  ihmeCountryList.forEach(element => {
    // keep only data for 1 country
    const country = datasetByCountry.filter(d => d.key == element);
    const countryValues = country[0].values;

    // locationID will be used for classes and ids to select the country since names are messier to work with
    const locationID = locationIDAccessor(country[0]);

    // segment data into confirmed and projection
    const confirmedData = countryValues.filter(
      d => xAccessor(d) <= cutoffDate_converted
    );
    const projectionData = countryValues.filter(
      d => xAccessor(d) > cutoffDate_converted
    );

    // draw path for confirmed data
    bounds
      .append('path')
      .attr('fill', 'none')
      .attr('class', `confirmedData`)
      .attr('id', `country_${locationID}_confirmed_inactive`)
      .attr('stroke-width', 1.25)
      .attr('stroke', '#d2d3d4')
      .attr('d', d => lineGenerator(confirmedData));

    // draw path for projection
    bounds
      .append('path')
      .attr('fill', 'none')
      .attr('class', `projectionData`)
      .attr('id', `country_${locationID}_projection_inactive`)
      .attr('stroke-width', 1.25)
      .attr('stroke', '#d2d3d4')
      .attr('stroke-dasharray', '7px 2px')
      .attr('d', d => lineGenerator(projectionData));
  }); //

  const tooltipLine = bounds
    .append('line')
    .attr('id', `tooltipLine_${chartKeyword}`);

  // function for adding active Countries
  const activateCountry = locationID => {
    // select data from all the rows we already filtered
    const country = dataset.filter(
      d => locationIDAccessor(d) == locationID
    );

    // segment data into real and projection
    const confirmedData = country.filter(
      d => xAccessor(d) <= cutoffDate_converted
    );
    const projectionData = country.filter(
      d => xAccessor(d) > cutoffDate_converted
    );

    // draw area
    bounds
      .append('path')
      .attr('fill', colorScale(countryNameAccessor(country[0])))
      .attr('fill-opacity', 0.15)
      .attr('class', `country_${locationID}_temp country_${locationID}_temp`)
      .attr('id', `country_${locationID}_area`)
      .attr('stroke', 'none')
      .attr('d', areaGenerator(country));

    // draw confirmed line
    // TODO check that we can add the id to the class list without problems.
    bounds
      .append('path')
      .attr('fill', 'none')
      .attr('class', `country_${locationID}_temp active_${chartKeyword}`)
      .attr('id', `country_${locationID}_confirmed`)
      .attr('stroke-width', 1.25)
      .attr('stroke', colorScale(countryNameAccessor(country[0])))
      .attr('d', d => lineGenerator(confirmedData));
    // draw projection line
    bounds
      .append('path')
      .attr('fill', 'none')
      .attr('class', `country_${locationID}_temp`)
      .attr('id', `country_${locationID}_projection`)
      .attr('stroke-width', 1.25)
      .attr('stroke', colorScale(countryNameAccessor(country[0])))
      .attr('stroke-dasharray', '7px 2px')
      .attr('d', d => lineGenerator(projectionData));
  };

  // this section gets the location ids for each of the countries we're watching.
  const idList = [];
  // REMINDER add countries we're officialy watching to this array.
  ['Mexico', 'Brazil', 'Bolivia', 'Chile'].forEach(element => {
    // TWEAK get all the comments first and then code.
    // filter data for each country
    const country = dataset.filter(d => countryNameAccessor(d) == element);
    // get the locationID for the first row
    const countryId = locationIDAccessor(country[0]);
    // push locationIDs to a new array
    idList.push(countryId);
  });

  // 7. add interactivity

  // Toggle Country Lines, part 1 start -- populate country checklist
  const countryList = d3
    .select(`#countryList_${chartKeyword}`)
    .selectAll('input')
    .data(datasetByCountry)
    .enter()
    .append('li')
    .attr('class', d => `country_${locationIDAccessor(d.values[0])}_input`);

  countryList
    .append('input')
    .attr('class', `checkbox_${chartKeyword}`)
    .attr('type', 'checkbox')
    .attr(
      'name',
      d => `country_${locationIDAccessor(d.values[0])}_${chartKeyword}`
    );

  countryList
    .append('label')
    .attr('class', `checkboxLabel checkboxLabel_${chartKeyword}`)
    .attr(
      'for',
      d => `country_${locationIDAccessor(d.values[0])}_${chartKeyword}`
    )
    .html(d => countryNameAccessor(d.values[0]));

  // for all the countries we're watching, this forEach loop draws the active state of the line and also makes sure the checkbox is turned on and the country name is in color & bold
  idList.sort().forEach(element => {
    // activate country based on its locationID
    activateCountry(element);

    const countrySelector = `country_${element}_${chartKeyword}`;

    // find countryName based on location
    const country = dataset.filter(d => element == d.location_id);
    // TWEAK use countryNameAccessor();
    const countryName = country[0].location_name;

    // Check the checkbox
    d3.select(`[name=${countrySelector}]`).property('checked', true);
    // Make label active
    d3.select(`[for=${countrySelector}]`)
      .style('color', colorScale(countryName))
      .style('font-weight', 'bold');
  }); //end of idList.forEach()

  // actually add toggling interactivity
  d3.selectAll(`.checkbox_${chartKeyword}`).on('input', toggleCountry);

  function toggleCountry() {
    const locationID = this.name.split('_')[1];
    const inputLabel = countryList.select(`[for=${this.name}]`);

    // get country name from locationID
    const country = dataset.filter(d => locationID == d.location_id);
    const countryName = country[0].location_name;

    // when you click a country's input box
    if (this.checked) {
      // just got turned on, so draw active line and style label
      activateCountry(locationID);
      inputLabel
        .style('color', colorScale(countryName))
        .style('font-weight', 'bold');
    } else {
      // clicked off
      // select the lines & area and remove them
      const linesPlusArea = d3.selectAll(`.country_${locationID}_temp`);
      linesPlusArea.remove();

      // remove style of label
      inputLabel.style('color', '#000').style('font-weight', 'normal');
    }
  }

  // TODO use labels to toggle country data

  // Tooltip, part 1 start

  // make sure tooltip box is in the right place
  const tooltip = d3
    .select(`#tooltip_${chartKeyword}`)
    .style('top', `${dimensions.margin.top * 2}px`)
    .style('left', `${dimensions.margin.left * 1.25}px`);

  const tooltipHeader = tooltip.select(`#tooltipHeader_${chartKeyword}`);
  const tooltipContent = tooltip.select(`#tooltipContent_${chartKeyword}`);

  // add listeningRect and start working on interactivity
  const listeningRect = bounds
    .append('rect')
    .attr('class', 'listening_rect')
    .attr('width', dimensions.boundedWidth)
    .attr('height', dimensions.boundedHeight)
    .on('mousemove', onMouseMove)
    .on('mouseleave', onMouseLeave);

  function onMouseMove() {
    tooltip.style('opacity', 1);

    // 1. get mouse position and translate it into date and y-value. Use this to find the closest date to your mouse position in the dataset.
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
    const closestYValue = yAccessor(closestDate);

    // TODO find a better place for this code. LMD
    let displayFormat =
      _lang == 'pt-br' || _lang == 'es-ES'
        ? d3.timeFormat('%d %B')
        : d3.timeFormat('%B %d');

    // 2. Get list of all active countries into one array. Make sure it's sorted.
    const unsortedCountries = [];
    Array.from(
      document.getElementsByClassName(`active_${chartKeyword}`)
    ).forEach(element => {
      // for each active countries add their countryName to unsortedCountries array.
      const locationID = element.getAttribute('id').split('_')[1];
      const country = dataset.filter(
        d => locationIDAccessor(d) == locationID
      );
      const countryName = countryNameAccessor(country[0]);
      unsortedCountries.push(countryName);
    });
    const activeCountries = unsortedCountries.sort();
    // 3. clear any tooltip information
    tooltipHeader.selectAll('*').remove();
    tooltipContent.selectAll('*').remove();
    bounds.selectAll(`.intersection_${chartKeyword}`).remove();

    // 4. add display date to tooltip box.
    tooltipHeader
      .append('span')
      .html(displayFormat(dateParser(closestDate.date)));

    // 5. position tooltipLine
    tooltipLine
      .attr('x1', xScale(closestXValue))
      .attr('x2', xScale(closestXValue))
      .attr('y1', 0)
      .attr('y2', dimensions.boundedHeight)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '7px 2px')
      .attr('stroke', '#000')
      .style('opacity', 1);

    // 6. add value for each active country to the tooltip
    activeCountries.forEach(element => {
      // a) get the data for the specific country filtered on that specific day
      const country = dataset
        .filter(d => countryNameAccessor(d) == element)
        .filter(d => d.date == closestDate.date);
      const point = country[0];
      const yValue = yAccessor(point);
      const xValue = xAccessor(point);
      const countryName = countryNameAccessor(point);
      const upperBound = upperProjectionAccessor(point);
      const lowerBound = lowerProjectionAccessor(point);
      const range = upperBound - lowerBound;
      const color = colorScale(countryNameAccessor(point));

      // b) add row for data values to tooltip table
      const dataRow = tooltipContent
        .append('tr')
        .attr('class', 'tooltip_country');

      // add countryName to row
      dataRow
        .append('td')
        .attr('class', 'tooltip_country_name')
        .html(countryName)
        .style('color', color);

      // add value to row
      dataRow
        .append('td')
        .attr('class', 'tooltip_country_value')
        .html(() => yValue.toFixed(2));

      // add uncertainty range
      dataRow
        .append('td')
        .attr('class', 'tooltip_country_value')
        .html(() =>
          range > 0
            ? `${lowerBound.toFixed(2)} – ${upperBound.toFixed(2)}`
            : '0'
        );
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
    // clear the list of activeCountries and remove all the dots and hide the tooltip box and the tooltip line
    const activeCountries = [];
    tooltip.style('opacity', 1);
    tooltipLine.style('opacity', 0);
    bounds.selectAll(`.intersection_${chartKeyword}`).remove();
  }
}
