var candidatesData = [
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
];

var youData = [{
  x: -0.32,
  y: 0.24,
  name: 'You',
  colour: '#818181'
}];

var candidateClustersData = [
  [
    {
      x: 0.423,
      y: 0.48,
      name: 'Stein',
      colour: '#01953d'
    },
    {
      x: 0.43,
      y: 0.499,
      name: 'Trump',
      colour: '#e0161a'
    },
    {
      x: 0.44,
      y: 0.51,
      name: 'Johnson',
      colour: '#fa7b14'
    }
  ],
  [
    {
      x: -0.99,
      y: -0.99,
      name: 'Johnson',
      colour: '#fa7b14'
    },
    {
      x: -1,
      y: -1,
      name: 'Clinton',
      colour: '#2790d6'
    }
  ]
];

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

  d$svg.append('g').attr('class', 'graph');

  function redraw() {
    this.svgWidth = Number(d$svg.style('width').slice(0, -2)),
    this.marginWidth = Math.round(this.svgWidth / 10),
    this.graphWidth = this.svgWidth - (this.marginWidth * 2),
    this.scale = d3.scaleLinear().domain([-1,1]).range([0, this.graphWidth]);

    var
    d$graph = layoutGraphAndGrid.apply(this);
    candidates = d$graph.selectAll('g.candidate').data(candidatesData);
    candidateClusters = d$graph.selectAll('g.candidates').data(candidateClustersData);

    // candidates.exit().remove('g.candidate');
    // candidates.enter().append('g').attr('class', 'candidate').each(function(_) {
    //   var d$this = d3.select(this);

    //   d$this.append('circle').attr('class', 'nub');
    //   d$this.append('text').attr('class', 'label');
    // });
    // d$graph.selectAll('g.candidate').each(function(d, i) {
    //   var
    //   xCoord = that.scale(d.x),
    //   yCoord = that.scale(-d.y),
    //   d$this = d3.select(this).attr('transform', transStr(xCoord, yCoord)),
    //   labelDeltaX = (d.x >= 0) ? -8 : 8,
    //   labelDeltaY = (d.y >= 0) ? 12 : -2,
    //   labelAlignment = (d.x >= 0) ? 'end' : 'start';

    //   d$this.select('circle.nub')
    //     .attr('r', 4)
    //     .style('fill', d.colour)
    //     .style('stroke', 'none')
    //     .style('opacity', 1);

    //   d$this.select('text.label')
    //     .attr('y', labelDeltaY)
    //     .attr('x', labelDeltaX)
    //     .style('text-anchor', labelAlignment)
    //     .style('font-size', 11)
    //     .style('font-family', 'Libre Franklin')
    //     .style('font-weight', 800)
    //     .style('fill', d.colour)
    //     .text(d.name.toUpperCase());
    // });

    candidateClusters.exit().remove('g.candidates');
    candidateClusters.enter().append('g').attr('class', 'candidates').each(function(_) {
      var d$this = d3.select(this);

      d$this.append('text').attr('class', 'labels');
    });
    d$graph.selectAll('g.candidates').each(function(d, i) {
      var
      d$this = d3.select(this),
      candidateDots = d$this.selectAll('circle.nub').data(d), // todo: d.map(x & y only)
      referenceDataIndex = 0, // figure out which dot is the reference point for the cluster
      xCoord = that.scale(d[referenceDataIndex].x),
      yCoord = that.scale(-d[referenceDataIndex].y),
      allData = d,
      opacityStartVal = 0.3;

      d$this.attr('transform', transStr(xCoord, yCoord));

      candidateDots.exit().remove('circle.nub');
      candidateDots.enter().append('circle').attr('class', 'nub');
      candidateDots = d$this.selectAll('circle.nub');

      candidateDots.each(function(d, i) {
        var
        d$this = d3.select(this),
        xCoord = (i === referenceDataIndex) ? 0 : that.scale(d.x) - that.scale(allData[referenceDataIndex].x),
        yCoord = (i === referenceDataIndex) ? 0 : that.scale(allData[referenceDataIndex].y) - that.scale(d.y);

        d$this.attr('cx', xCoord)
        .attr('cy', yCoord)
        .attr('r', 6)
        .style('fill', d.colour)
        .style('stroke', 'none')
        .style('opacity', opacityStartVal);
      });

      (function repeat(d) {
        var lastIndex, nextIndex;

        if(typeof(d) === "undefined") {
          nextIndex = 0;
        } else {
          lastIndex = allData.findIndex(function(datum) { return datum.name === d.name; });
          nextIndex = (lastIndex === allData.length - 1) ? 0 : lastIndex + 1;
        }

        var nextDot = candidateDots.filter(function(d, i) { return i === nextIndex; });

        nextDot.transition()
          .duration(800)
          .attr('r', 6)
          .style('opacity', 1)
          .transition()
          .attr('r', 6)
          .style('opacity', opacityStartVal)
          .on('end', repeat);
      })();

      var
      d$labels = d$this.select('text.labels'),
      candidateLabels = d$labels.selectAll('tspan').data(d), // todo: d.map(label & colour only)
      positiveY = d[referenceDataIndex].y >= 0,
      positiveX = d[referenceDataIndex].x >= 0,
      labelDeltaX = (positiveX) ? -8 : 8,
      labelDeltaY = (positiveY) ? 8 : 0,
      labelAlignment = (positiveX) ? 'end' : 'start',
      lastDataIndex = d.length - 1;

      d$labels.attr('transform', transStr(labelDeltaX, labelDeltaY))
        .style('text-anchor', labelAlignment)
        .style('font-size', 11)
        .style('font-family', 'Libre Franklin')
        .style('font-weight', 800);

      candidateLabels.exit().remove('tspan');
      candidateLabels.enter().append('tspan').attr('class', 'label');
      d$labels.selectAll('tspan').each(function(d, i) {
        var
        d$this = d3.select(this),
        offsetX = i * (positiveX ? -5 : -5),
        offsetY = i * (positiveY ? 11 : -11);

        d$this
        .attr('y', offsetY)
        .attr('x', offsetX)
        .style('fill', d.colour)
        .text(d.name.toUpperCase());
      });
    });

    // this.d$graph.selectAll('g.you.ideology')
    //   .data(youIdeology)
    //   .enter()
    //   .append('g')
    //   .attr('class', 'you ideology').each(function(_) {
    //     var
    //     point = d3.select(this),
    //     cross = point.append('g').attr('class', 'cross');

    //     point.append('circle').attr('class', 'halo');
    //     point.append('circle').attr('class', 'nub');
    //     point.append('text').attr('class', 'label');
    //     cross.append('line').attr('class', 'first');
    //     cross.append('line').attr('class', 'second');
    //   });

    // this.d$graph.selectAll('g.you.ideology').each(function(d, i) {
    //     var
    //     cCoord = that.scale(d.x),
    //     yCoord = that.scale(-d.y),
    //     point = d3.select(this).attr('transform', transStr(cCoord, yCoord)),
    //     cross = point.select('g.cross'),
    //     crossArmLength = 7,
    //     labelDeltaY = (d.y >= 0) ? -15 : 15,
    //     labelAlignment = 'middle';

    //     cross.select('line.first')
    //       .attr('x1', -crossArmLength)
    //       .attr('y1', -crossArmLength)
    //       .attr('x2', crossArmLength)
    //       .attr('y2', crossArmLength)
    //       .style('fill', 'none')
    //       .style('stroke-width', 1.5)
    //       .style('stroke', d.colour);

    //     cross.select('line.second')
    //       .attr('x1', -crossArmLength)
    //       .attr('y1', crossArmLength)
    //       .attr('x2', crossArmLength)
    //       .attr('y2', -crossArmLength)
    //       .style('fill', 'none')
    //       .style('stroke-width', 1.5)
    //       .style('stroke', d.colour);


    //     point.select('circle.halo')
    //       .attr('r', 12)
    //       .style('fill', 'none')
    //       .style('stroke-width', 2)
    //       .style('stroke-opacity', 1)
    //       .style('stroke-dasharray', "2, 1")
    //       .style('stroke', d.colour);

    //     // point.select('circle.nub')
    //     //   .attr('r', 4)
    //     //   .style('fill', d.colour)
    //     //   .style('stroke', 'none')
    //     //   .style('opacity', 1);

    //     point.select('text.label')
    //       .attr('y', labelDeltaY)
    //       .style('text-anchor', labelAlignment)
    //       .style('font-size', 12)
    //       .style('font-family', 'Libre Franklin')
    //       .style('font-weight', 800)
    //       .style('fill', d.colour)
    //       .text(d.name.toUpperCase());

    // });

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
           .data(tickVals).enter().append('line')
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

