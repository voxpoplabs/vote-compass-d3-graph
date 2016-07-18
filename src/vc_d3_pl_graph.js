var partyIdeologies = [
  {
    x: -1,
    y: 1,
    name: 'Johnson',
    colour: '#fa7b14'
  },
  {
    x: -0.33,
    y: 0.24,
    name: 'Clinton',
    colour: '#2790d6'
  },
  {
    x: -0.37,
    y: 0.086,
    name: 'Stein',
    colour: '#01953d'
  },
  {
    x: 0.421,
    y: -0.48,
    name: 'Trump',
    colour: '#e0161a'
  }
]

if(typeof(d3) === "undefined") {
  console.log('The Political Landscape Graph requires D3.js be installed');
};

D3VoteCompassGraph = function(options) {
  var
  elSelector = options.elSelector,
  d$svg = d3.select(elSelector).append('svg')
    .style('width', '100%')
    .style('height', '100%'),
  data = options.data || [],
  initialDraw = true,
  that = this;

  d$svg.append('g').attr('class', 'graph')
    .selectAll('ciricle.party.ideology')
    .data(partyIdeologies)
    .enter()
    .append('circle')
    .attr('class', 'party ideology');

  function redraw() {
    this.svgWidth = Number(d$svg.style('width').slice(0, -2)),
    this.marginWidth = Math.round(this.svgWidth / 10),
    this.graphWidth = this.svgWidth - (this.marginWidth * 2),
    this.scale = d3.scaleLinear().domain([-1,1]).range([0, this.graphWidth]);

    d$graph = layoutGraphAndGrid.apply(this);

    d$graph.selectAll('circle.party.ideology').each(function(d, i) {
      var
      cCoord = that.scale(d.x),
      yCoord = that.scale(-d.y);
      d3.select(this)
        .attr('cx', cCoord)
        .attr('cy', yCoord)
        .attr('r', 6)
        .style('fill', d.colour);
    });

    initialDraw = false;
    return this;
  };

  function setData(d) {
    data = d;
    return this;
  };

  function getData() {
    return data;
  }

  function transStr(x, y) {
    return "translate(" + x + "," + y + ")";
  }

  var publicInterface = {
    getData: getData,
    setData: setData
  };

  window.onresize = function(event) {
    redraw.apply(that);
  };
  redraw.apply(this);

  function layoutGraphAndGrid() {
    var
    girdLineTypes = ['horizontal', 'vertical'],
    tickVals = this.scale.ticks(8),
    that = this;

    var d$graph = d$svg.selectAll('g.graph')
      .data([this.graphWidth])
      .attr('width', function(d) {return d;})
      .attr('height', function(d) { return d;})
      .attr('transform', transStr(this.marginWidth, this.marginWidth));

     girdLineTypes.forEach(function(lineType) {
       if (initialDraw) {
         d$graph.selectAll("line.grid." + lineType)
           .data(tickVals).enter().insert('line', 'circle')
           .attr('class', "grid " + lineType);
       }

       d$graph.selectAll("line.grid." + lineType).each(function(d, i) {
         var
         hzntl = lineType === 'horizontal',
         coord = that.scale(d);
         d3.select(this)
           .attr('y1', hzntl ? 0 : coord)
           .attr('y2', hzntl ? that.graphWidth : coord)
           .attr('x1', hzntl ? coord : 0)
           .attr('x2', hzntl ? coord : that.graphWidth);
         });
     });

     if(initialDraw) {
       d$graph.selectAll("line.grid")
         .attr('fill', 'none')
         .attr('shape-rendering', 'crispEdges')
         .attr('stroke', '#cfdae6')
         .attr('stroke-width', function(_, i) {
           var width = (i == 0 || i == tickVals.length - 1) ? '2' : '1';
           return width + 'px';
         });
     }

     return d$graph;
  }

  return publicInterface;
};

// PLGraph.generate = function(options) {
//   var
//   elSelector = options.elSelector,
//   svg = d3.select(elSelector).append('svg');

  // xScale = d3.scaleLinear().domain([-1,1]).range([0,305]);
  // yScale = d3.scaleLinear().domain([-1,1]).range([0,305]);

//   yAxis = d3.axisRight(yScale)
//   .ticks(8);
//   // .tickSize(-470)
//   // .tickSubdivide(true);

//   svg.append("g")
//   // .attr("transform", "translate(470,0)")
//   .attr("id", "yAxisG")
//   .call(yAxis);

//   // xAxis = d3.svg.axis()
//   // .scale(xScale)
//   // .orient("bottom")
//   // .tickSize(-470)
//   // .tickValues([1,2,3,4,5,6,7]);

//   // d3.select("svg").append("g")
//   // .attr("transform", "translate(0,480)")
//   // .attr("id", "xAxisG")
//   // .call(xAxis);

//   // d3.select("svg").selectAll("circle.median")
//   // .data(data)
//   // .enter()
//   // .append("circle")
//   // .attr("class", "tweets")
//   // .attr("r", 5)
//   // .attr("cx", function(d) {return xScale(d.day)})
//   // .attr("cy", function(d) {return yScale(d.median)})
//   // .style("fill", "darkgray");

//   // d3.select(window).on('resize', PLGraph.render({elSelector: elSelector}));
// };

