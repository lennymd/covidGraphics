async function drawScatter() {
  // 1. Access data

  const dataset = await d3.csv('./../data/mexico_data_latest.csv');

  const xAccessor = d => +d.policy_index;
  const yAccessor = d => +d.mobility_index;
  const dateParser = d3.timeParse('%d-%b-%y');
  const dateAccessor = d => dateParser(d.date);
  const dayAccessor = d => +d.days;

  const latestDay = d3.max(dataset.map(dayAccessor));
  const firstDay = d3.min(dataset.map(dayAccessor));

  // 2. Create chart dimensions

  const width = d3.min([window.innerWidth * 0.9, window.innerHeight * 0.9]);

  let dimensions = {
    width: width,
    height: width,
    margin: {
      top: 10,
      right: 10,
      bottom: 50,
      left: 50,
    },
  };

  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // 3. Draw canvas

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

  // 4. Create scales

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth])
    .nice();

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice();

  // 5. Draw data

  const drawDots = dataset => {
    const dots = bounds.selectAll('circle').data(dataset, d => d[0]);

    const newDots = dots
      .enter()
      .append('circle')
      .filter(d => +d.days == latestDay);

    const allDots = newDots
      .merge(dots)
      .attr('cx', d => xScale(xAccessor(d)))
      .attr('cy', d => yScale(yAccessor(d)))
      .attr('r', 4);

    const oldDots = dots.exit().remove();
  };

  drawDots(dataset);

  // 6. Draw peripherals

  // 7. Set up interactions
}

drawScatter();
