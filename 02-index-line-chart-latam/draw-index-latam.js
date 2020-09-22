async function indexLineChart_LATAM({
  yVariable,
  useRegion,
  useBaseline,
  usePercentage,
  chartKeyword,
}) {
  // This function works with country datasets and takes in the following to create a chart
  // country: name of country to load data file
  // yVariable: y-axis variable
  // useRegion: boolean for drawing latam/region data.
  // useBaseline: boolean for drawing a 0 baseline or not.
  // usePercentage: boolean for using % symbol in y axis.
  // chartKeyword: keyword for picking the ids from the document.

  // 0. set language for dates
  setTimeLanguage();

  // 1. Get data
  const dataset = await d3.csv(
    `https://raw.githubusercontent.com/lennymd/covidGraphics/main/data/latam_latest.csv`
  );

  // set data accessors
  const yAccessor = d => +d[`${yVariable}`];
  const dateParser = d3.timeParse('%Y-%m-%d');
  const xAccessor = d => dateParser(d.date);
  const countryCodeAccessor = d => d.country_short;
  const countryNameAccessor = d => d.country;

  // organize data into country and region
  const datasetByCountryCode = d3
    .nest()
    .key(countryCodeAccessor)
    .entries(dataset);

  // const latam = datasetByCountryCode.filter(d => d.key == 'LATAM');
  const countries = datasetByCountryCode.filter(d => d.key != 'LATAM');

  // 2. create dimensions
  const wrapperElt = `wrapper_${chartKeyword}`;

  let dimensions = {
    width: document.getElementById(wrapperElt).parentElement.clientWidth,
    height: 600,
    margin: {top: 15, right: 15, bottom: 40, left: 60},
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
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice();

  const xExtent = d3.extent(dataset, xAccessor);
  const xScale = d3
    .scaleTime()
    .domain([xExtent[0], xExtent[1] * 1.001])
    .range([0, dimensions.boundedWidth]);

  const countriesOnly = dataset.filter(d => countryCodeAccessor(d) != 'LATAM');
  const countryCodeList = d3.map(countriesOnly, countryCodeAccessor).keys();
  const colorScale = d3
    .scaleOrdinal()
    .domain(countryCodeList)
    .range(colorGroup);

  // 6. draw peripherals -- axes
  const yAxisGenerator = d3
    .axisLeft()
    .scale(yScale)
    .tickSize(-dimensions.boundedWidth);

  // add percentage to tick values if true
  // if (usePercentage) {
  //   yAxisGenerator.tickFormat(d => Math.trunc(d * 100) + '%');
  // }
  if (usePercentage) {
    if (yVariable == 'testpositivity_rate') {
      yAxisGenerator.tickFormat(d => Math.trunc(d * 100) + '%');
    } else {
      yAxisGenerator.tickFormat(d => d + '%');
    }
  }

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

  xAxis.selectAll('text').attr('dy', 20);
  xAxis.selectAll('.tick line').attr('y1', dimensions.margin.bottom * 0.25);

  // draw 0-baseline if true
  if (useBaseline) {
    bounds
      .append('line')
      .attr('class', 'baseline')
      .attr('stroke-width', 2)
      .attr('stroke', '#333333')
      .attr('x1', 0)
      .attr('x2', dimensions.boundedWidth)
      .attr('y1', yScale(0))
      .attr('y2', yScale(0));
  }

  // 5. draw data

  const lineGenerator = d3
    .line()
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d)));

  bounds
    .selectAll('.country')
    .data(countries)
    .enter()
    .append('path')
    .attr('class', d => `country ${d.key}_${chartKeyword}`)
    .attr('fill', 'none')
    .attr('stroke-width', 1.25)
    .attr('stroke', '#d2d3d4')
    .attr('d', d => lineGenerator(d.values));

  // add national data
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

  const addCountryLine = _countryCode => {
    // This function draws the active version of a country line.
    const specificCountry = dataset.filter(
      d => countryCodeAccessor(d) == _countryCode
    );

    bounds
      .append('path')
      .attr('id', `${_countryCode}_${chartKeyword}`)
      .attr('class', `active_${chartKeyword}`)
      .attr('fill', 'none')
      .attr('stroke', colorScale(_countryCode))
      .attr('stroke-width', 3)
      .attr('d', () => lineGenerator(specificCountry));
  };
  const watchedCountries = ['MEX', 'BRA', 'BOL', 'CHL'];

  watchedCountries.forEach(element => {
    addCountryLine(element);
  });

  const tooltipLine = bounds
    .append('line')
    .attr('id', `tooltipLine_${chartKeyword}`);

  // 7. add interactivity

  // Toggle Country Lines, part 1 start -- populate country checklist

  const countryList = d3
    .select(`#countryList_${chartKeyword}`)
    .selectAll('input')
    .data(countries)
    .enter()
    .append('li')
    .attr('class', d => `${d.key}_input`);

  countryList
    .append('input')
    .attr('class', `input_box_${chartKeyword}`)
    .attr('type', 'checkbox')
    .attr('name', d => `${d.key}_${chartKeyword}`);

  countryList
    .append('label')
    .attr('class', `input_label input_label_${chartKeyword}`)
    .attr('for', d => `${d.key}_${chartKeyword}`)
    .html(d => countryNameAccessor(d.values[0]));

  // Toggle State Lines, part 1 end

  // Toggle State Lines, part 2 start -- turn on the boxes for the state we highlighted earlier.
  watchedCountries.forEach(element => {
    const inputBox = countryList.select(`[name=${element}_${chartKeyword}]`);
    const inputLabel = countryList.select(`[for=${element}_${chartKeyword}]`);

    inputBox.property('checked', true);
    inputLabel.style('color', colorScale(element)).style('font-weight', 'bold');
  });
  // Toggle State Lines, part 2 end

  // Toggle State Lines, part 3 start -- toggle on/off any state by checking the corresponding input box.
  d3.selectAll(`.input_box_${chartKeyword}`).on('input', toggleCountryLine);

  function toggleCountryLine() {
    const countryCode = this.name.split('_')[0];
    const inputLabel = countryList.select(`[for=${this.name}]`);

    if (this.checked) {
      // input box has become active. Draw the color line and have the inputLabel match.
      addCountryLine(countryCode);
      inputLabel
        .style('color', colorScale(countryCode))
        .style('font-weight', 'bold');
    } else {
      // input box has become inactive. Remove the color line and the inputLabel styles.
      const line = bounds.select(`#${countryCode}_${chartKeyword}`);
      line.remove();
      inputLabel.style('color', '#000').style('font-weight', 'normal');
    }
  }
  // Toggle State Lines, part 3 end

  // click on labels -- start
  d3.selectAll(`.input_label_${chartKeyword}`).on('click', triggerStateLine);

  function triggerStateLine() {
    const inputLabel = d3.select(this);
    const _name = inputLabel.attr('for');
    const _countryCode = _name.split('_')[0];
    const _inputBox = d3.select(`[name=${_name}]`);
    const isBoxChecked = _inputBox.property('checked');
    if (isBoxChecked) {
      // this click means turns things off
      _inputBox.property('checked', false);
      const line = bounds.select(`#${_countryCode}_${chartKeyword}`);
      line.remove();
      inputLabel.style('color', '#000').style('font-weight', 'normal');
    } else {
      // this click means turns things on
      _inputBox.property('checked', true);
      addCountryLine(_countryCode);
      inputLabel
        .style('color', colorScale(_countryCode))
        .style('font-weight', 'bold');
    }
  }
  // click on labels -- end

  // Tooltip, part 1 start -- create listening rect and tooltip

  const listeningRect = bounds
    .append('rect')
    .attr('class', 'listening_rect')
    .attr('width', dimensions.boundedWidth)
    .attr('height', dimensions.boundedHeight)
    .on('mousemove', onMouseMove)
    .on('mouseleave', onMouseLeave);

  const tooltip = d3
    .select(`#tooltip_${chartKeyword}`)
    .style('top', `${dimensions.margin.top * 2}px`);

  // if we are using baseline & percentage, it's likely mobility so put the tooltip box on the right
  if (useBaseline && usePercentage) {
    tooltip.style('right', `${dimensions.margin.right * 1.25}px`);
  } else {
    tooltip.style('left', `${dimensions.margin.left * 1.25}px`);
  }

  const tooltipHeader = tooltip.select(`#tooltipHeader_${chartKeyword}`);
  const tooltipContent = tooltip.select(`#tooltipContent_${chartKeyword}`);

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

    // 2. Get list of all active states into one array. Make sure national data is first, and then every other thing that follows is alphabetized
    const unsortedCountries = [];
    const activeCountries = [];
    let displayFormat, regionalSpelling;
    if (_lang == 'pt-br' || _lang == 'es-ES') {
      displayFormat = d3.timeFormat('%d %B');
      regionalSpelling = 'América Latina';
    } else {
      displayFormat = d3.timeFormat('%B %d');
      regionalSpelling = 'Latin America';
    }

    const activeElements = document.getElementsByClassName(
      `active_${chartKeyword}`
    );

    Array.from(activeElements).forEach(element => {
      const countryCode = element.getAttribute('id').split('_')[0];
      unsortedCountries.push(countryCode);
    });
    unsortedCountries.sort().forEach(element => {
      activeCountries.push(element);
    });

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
      const point = dataset
        .filter(d => countryCodeAccessor(d) == element)
        .filter(d => d.date == closestDate.date);

      const yValue = yAccessor(point[0]);
      const xValue = xAccessor(point[0]);
      const countryName = countryNameAccessor(point[0]);

      const getColor = _code => {
        if (_code == 'LATAM') {
          return '#171717';
        } else {
          return colorScale(countryCodeAccessor(point[0]));
        }
      };

      // add data to tooltip table
      const pointInfo = tooltipContent
        .append('tr')
        .attr('class', 'tooltip_country');

      pointInfo
        .append('td')
        .attr('class', 'tooltip_country_name')
        .html(() => {
          if (countryName == 'LATAM') {
            return regionalSpelling;
          } else {
            return countryName;
          }
        })
        .style('color', getColor(element));

      pointInfo
        .append('td')
        .attr('class', 'tooltip_value')
        .html(() => {
          const multiplier =
            usePercentage && yVariable == 'testpositivity_rate' ? 100 : 1;
          const suffix = usePercentage ? '%' : '';
          // if (usePercentage) {
          //   if (yVariable == 'testpositivity_rate') {
          //     multiplier = 100;
          //   } else {
          //     multiplier = 1;
          //   }
          // } else {
          //   multiplier = 1;
          // }
          return (yValue * multiplier).toFixed(1) + suffix;
        });

      // create a temporary dot on the line chat for that day
      bounds
        .append('circle')
        .attr('cx', xScale(xValue))
        .attr('cy', yScale(yValue))
        .attr('r', 7)
        .attr('fill', getColor(element))
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
