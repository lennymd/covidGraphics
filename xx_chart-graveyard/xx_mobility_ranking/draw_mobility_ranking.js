async function drawMobilityRanking() {
  // 0. check for language locale
  const lang = d3.select('html').property('lang');
  if (lang == 'es-ES') {
    d3.timeFormatDefaultLocale(es_locale);
  }
  if (lang == 'pt-br') {
    d3.timeFormatDefaultLocale(pt_locale);
  }
  // 1. access data
  const dataset_all = await d3.csv(
    'https://raw.githubusercontent.com/lennymartinez/covid_latam/master/data/data_latest.csv'
  );
  const dataset = dataset_all.filter(d => d.country == 'Mexico');

  // data accessors, shorthand for different columns
  const yAccessor = d => +d.mobility_index;
  const dateParser = d3.timeParse('%Y-%m-%d');
  const xAccessor = d => dateParser(d.date);
  const stateAccessor = d => d.state_name;
  const stateCodeAccessor = d => d.state_short;
  const dayAccessor = d => +d.days;
  const metricAccessor = d => +d.ranking_mobility_daily;

  // sorting and organizing data
  const datasetByState = d3.nest().key(stateCodeAccessor).entries(dataset);
  const country = datasetByState.filter(d => d.key == 'Nacional');
  const states = datasetByState.filter(d => d.key !== 'Nacional');

  // 2. create dimensions

  const width = 350;
  let dimensions = {
    width: width,
    height: width * 0.6,
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

  // 3. create canvas -- this part forward will be modularized
  const data = states[0];

  const drawMultiple = _data => {
    const card = d3
      .select('#chart_container_mobility')
      .append('section')
      .attr('class', 'state_card');

    const card_title = card
      .append('h4')
      .attr('class', 'state_title')
      .html(_data.values[0].state_name);

    const card_wrapper = card.append('div').attr('class', 'state_wrapper');

    const wrapper = card_wrapper
      .append('svg')
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    const bounds = wrapper
      .append('g')
      .style(
        'transform',
        `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
      );
    // create scales
    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(dataset, yAccessor))
      .range([dimensions.boundedHeight, 0])
      .nice();

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(dataset, xAccessor))
      .range([0, dimensions.boundedWidth]);

    const statesData = dataset.filter(d => d.state_short !== 'Nacional');
    const stateCodes = d3.map(statesData, stateCodeAccessor).keys();
    const stateColors = [
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
    const colorScale = d3.scaleOrdinal().domain(stateCodes).range(stateColors);

    // draw peripherals - pt 1
    const yAxisGenerator = d3
      .axisLeft()
      .scale(yScale)
      .tickFormat(d => d + '%')
      .tickSize(-dimensions.boundedWidth);

    const yAxis = bounds
      .append('g')
      .attr('class', 'y_axis')
      .call(yAxisGenerator);

    const xAxisGenerator = d3
      .axisBottom()
      .scale(xScale)
      .tickSize(-dimensions.boundedHeight)
      .tickFormat(d3.timeFormat('%d %b %Y'));

    const xAxis = bounds
      .append('g')
      .attr('class', 'x_axis')
      .call(xAxisGenerator)
      .style('transform', `translateY(${dimensions.boundedHeight}px)`);

    // add comparison lines
    bounds
      .append('line')
      .attr('class', 'line_zero comparison_line')
      .attr('stroke-width', 1.5)
      .attr('stroke', '#000')
      .attr('x1', -5)
      .attr('x2', dimensions.boundedWidth)
      .attr('y1', yScale(0))
      .attr('y2', yScale(0));

    bounds
      .append('line')
      .attr('class', 'line_min comparison_line')
      .attr('stroke-width', 1.5)
      .attr('stroke', '#000')
      .attr('x1', -5)
      .attr('x2', dimensions.boundedWidth)
      .attr('y1', yScale(yScale.domain()[0]))
      .attr('y2', yScale(yScale.domain()[0]));

    bounds
      .append('line')
      .attr('class', 'line_max comparison_line')
      .attr('stroke-width', 1.5)
      .attr('stroke', '#171717')
      .attr('x1', -5)
      .attr('x2', dimensions.boundedWidth)
      .attr('y1', yScale(yScale.domain()[1]))
      .attr('y2', yScale(yScale.domain()[1]));

    bounds
      .append('text')
      .attr('x', -15)
      .attr('y', yScale(-2.5))
      .attr('text-anchor', 'middle')
      .text('0')
      .attr('class', 'small_anchor');
    bounds
      .append('text')
      .attr('x', -25)
      .attr('y', yScale(yScale.domain()[0] - 2.5))
      .attr('text-anchor', 'middle')
      .text('-70%')
      .attr('class', 'small_anchor');

    bounds
      .append('text')
      .attr('x', -27)
      .attr('y', yScale(yScale.domain()[1] - 2.5))
      .attr('text-anchor', 'middle')
      .text('+20%')
      .attr('class', 'small_anchor');

    // draw data
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
      .attr('stroke-width', 1)
      .attr('stroke', '#d2d3d4')
      .attr('d', d => lineGenerator(d.values));

    // add national average
    bounds
      .append('path')
      .attr('class', 'national')
      .attr('fill', 'none')
      .attr('stroke', '#171717')
      .attr('stroke-dasharray', '5px 2px')
      .attr('stroke-width', 2.5)
      .attr('d', () => lineGenerator(country[0].values));

    const addStateLine = _stateCode => {
      const stateData = dataset.filter(d => stateCodeAccessor(d) == _stateCode);
      bounds
        .append('path')
        .attr('class', `${_stateCode}_temp`)
        .attr('fill', 'none')
        .attr('stroke', colorScale(_stateCode))
        .attr('stroke-width', 3)
        .attr('d', () => lineGenerator(stateData));
    };

    addStateLine(_data.key);

    // add peripherals - pt2
    card_title.style('color', colorScale(_data.key));
  };
  states.forEach(drawMultiple);
}

drawMobilityRanking();
