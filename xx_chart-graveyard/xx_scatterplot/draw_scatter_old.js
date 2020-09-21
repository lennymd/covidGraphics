async function drawScatter() {
  // 1. access data
  let dataset = await d3.csv(
    'https://raw.githubusercontent.com/lennymartinez/covid_latam/master/data/mexico-20200519.csv?token=AB4JHMMEPKKOU7VG7PMKPTC62LJ3K'
  );

  const xAccessor = d => +d.Policy_Index_Adjusted_Time;
  const yAccessor = d => +d.avg_google_7d;
  const dateParser = d3.timeParse('%d-%b-%y');
  const dateAccessor = d => dateParser(d.Date);
  const dayAccessor = d => +d.Days;

  const latestDay = d3.max(dataset.map(dayAccessor));
  const firstDay = d3.min(dataset.map(dayAccessor));

  // set slider maximum
  let slider = d3.select('#date_range');
  slider.attr('max', latestDay).attr('value', latestDay);

  const updateTransition = d3.transition().duration(600);

  let nestedDataset = d3.nest().key(dayAccessor).entries(dataset);
  let data = nestedDataset[latestDay - 1];

  // 2. create dimensions
  const width = d3.min([window.innerWidth * 0.9, window.innerHeight * 0.9]);

  let dimensions = {
    width: width,
    height: width,
    margin: {
      top: 10,
      right: 10,
      bottom: 50,
      left: 60,
    },
  };

  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // 3. draw canvas
  const wrapper = d3
    .select('#wrapper')
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);

  const bounds = wrapper
    .append('g')
    .style(
      'transform',
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );

  // initialize static elements
  bounds.append('rect').attr('class', 'upper_left quadrant');
  bounds.append('rect').attr('class', 'upper_right quadrant');
  bounds.append('rect').attr('class', 'lower_left quadrant');
  bounds.append('rect').attr('class', 'lower_right quadrant ');
  bounds.append('line').attr('class', 'mean_x');
  bounds.append('line').attr('class', 'mean_y');
  bounds
    .append('g')
    .attr('class', 'x_axis')
    .style('transform', `translateY(${dimensions.boundedHeight}px)`)
    .append('text')
    .attr('class', 'x_axis_label')
    .attr('x', dimensions.boundedWidth / 2)
    .attr('y', dimensions.margin.bottom - 15)
    .attr('fill', 'black')
    .style('text-anchor', 'middle')
    .style('font-size', '1.4em');
  bounds
    .append('g')
    .attr('class', 'y_axis')
    .append('text')
    .attr('class', 'y_axis_label')
    .attr('x', -dimensions.boundedHeight / 2)
    .attr('y', -dimensions.margin.left + 10)
    .style('transform', 'rotate(-90deg)')
    .attr('fill', 'black')
    .style('text-anchor', 'middle')
    .style('font-size', '1.4em');

  // 4. create scales
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(data.values, xAccessor))
    .range([0, dimensions.boundedWidth])
    .nice();

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data.values, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice();

  // 5. draw data
  const drawDots = _dataset => {
    const dots = bounds.selectAll('circle').data(_dataset);
    const newDots = dots
      .enter()
      .append('circle')
      .attr('r', 0)
      .attr('cx', d => xScale(xAccessor(d)))
      .attr('cy', d => yScale(yAccessor(d)))
      .attr('fill', '#f2f2f2')
      .attr('stroke', '#333333');

    const allDots = newDots.merge(dots);

    allDots
      .attr('cx', d => xScale(xAccessor(d)))
      .attr('cy', d => yScale(yAccessor(d)))
      .attr('r', 7);

    const oldDots = dots
      .exit()
      .attr('fill', 'red')
      .transition(updateTransition)
      .attr('r', 0)
      .remove();
  };
  drawDots(data.values);

  // 6. Draw peripherals
  const meanX = d3.mean(data.values, xAccessor);
  const meanY = d3.mean(data.values, yAccessor);

  const drawMean = _dataset => {
    const meanLineX = bounds
      .selectAll('.mean_x')
      .attr('x1', xScale(meanX))
      .attr('x2', xScale(meanX))
      .attr('y1', 0)
      .attr('y2', dimensions.boundedHeight);

    const meanLineY = bounds
      .selectAll('.mean_y')
      .attr('y1', yScale(meanY))
      .attr('y2', yScale(meanY))
      .attr('x1', 0)
      .attr('x2', dimensions.boundedWidth);
  };

  drawMean(data.values);

  const drawAxes = _dataset => {
    const xAxisGenerator = d3
      .axisBottom()
      .scale(xScale)
      .tickSize(-dimensions.boundedWidth - dimensions.margin.top);

    const xAxis = bounds
      .select('.x_axis')
      .transition(updateTransition)
      .call(xAxisGenerator);

    xAxis.selectAll('g.tick text').attr('dy', '1.25em');
    const xAxisLabel = xAxis
      .select('.x_axis_label')
      .text('Indice de adopcion de politicas');

    const yAxisGenerator = d3
      .axisLeft()
      .scale(yScale)
      .tickFormat(d => d + '%')
      .tickSize(-(dimensions.width + dimensions.margin.left));

    const yAxis = bounds
      .select('.y_axis')
      .transition(updateTransition)
      .call(yAxisGenerator);

    const yAxisLabel = yAxis
      .select('.y_axis_label')
      .text('Porcentaje de caída de la movilidad');
  };

  drawAxes(data.values);

  const drawQuadrants = _dataset => {
    const upper_left = bounds
      .select('.upper_left')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', xScale(meanX))
      .attr('height', yScale(meanY));

    const upper_right = bounds
      .select('.upper_right')
      .attr('x', xScale(meanX))
      .attr('y', 0)
      .attr('width', dimensions.boundedWidth - xScale(meanX))
      .attr('height', yScale(meanY));
    upper_right.transition(updateTransition).attr('fill', '#56AD9E');

    upper_left.transition(updateTransition).attr('fill', '#E97F63');

    const lower_left = bounds
      .select('.lower_left')
      .attr('x', 0)
      .attr('y', yScale(meanY))
      .attr('width', xScale(meanX))
      .attr('height', dimensions.boundedHeight - yScale(meanY));

    lower_left.transition(updateTransition).attr('fill', '#F3B9A2');

    const lower_right = bounds
      .select('.lower_right')
      .attr('x', xScale(meanX))
      .attr('y', yScale(meanY))
      .attr('width', dimensions.boundedWidth - xScale(meanX))
      .attr('height', dimensions.boundedHeight - yScale(meanY));

    lower_right.transition(updateTransition).attr('fill', '#488D81');
  };
  drawQuadrants(data.values);

  // 7. add interactivity
  // slider.on('input', changeDay);
  // function changeDay() {
  //   console.log(this.value);
  //   const newDataset = nestedDataset[this.value - 1];

  //   xScale.domain(d3.extent(newDataset, xAccessor));
  //   yScale.domain(d3.extent(newDataset, yAccessor));
  //   drawAxes(newDataset);
  //   // TODO Update dots
  //   // TODO Update Axes
  //   // TODO Update Mean Lines
  //   // TODO Update quadrants
  // }
}
drawScatter();
