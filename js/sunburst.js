
//Sunburst Graph
var colorscheme = {
        BuGn: {
          3: ["#e5f5f9","#99d8c9","#2ca25f"],
          4: ["#edf8fb","#b2e2e2","#66c2a4","#238b45"],
          5: ["#edf8fb","#b2e2e2","#66c2a4","#2ca25f","#006d2c"],
          6: ["#edf8fb","#ccece6","#99d8c9","#66c2a4","#2ca25f","#006d2c"],
          7: ["#edf8fb","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#005824"],
          8: ["#f7fcfd","#e5f5f9","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#005824"],
          9: ["#f7fcfd","#e5f5f9","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#006d2c","#00441b"]
        }    
      };

var maxdepth = 5
var container = document.querySelector("#sunburst");
var width  = 600,  
    height = 500,
    radius = Math.min(width, height) / 2, 
    color = d3.scale.ordinal()
      .domain(0,maxdepth)
      .range(colorscheme.BuGn[maxdepth]);   

var svg = d3.select("#sunburst").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height * .52 + ")");


var partition = d3.layout.partition()
    .sort(null)
    .size([2 * Math.PI, radius * radius])
    .value(function(d) { return d.size; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx; })
    .innerRadius(function(d) { return Math.sqrt(d.y); })
    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });


d3.json("/data/sample.json", function(error, root) {

  var arcs = svg.datum(root).selectAll("path")
    .data(partition.nodes)
    .enter().append('svg:g');   

  var path = arcs.append("path")
      .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
      .attr("d", arc)
      .on("click", function(d) { buildBlameGraph(d); })
      .style("stroke", "#fff")
      // .style("fill", function(d) { return color(d.value * d.depth); })
      .style("fill", function(d) { return color(d.depth); })
      .style("fill-rule", "evenodd")
      .each(stash);  

  var label = arcs.append("svg:title")
    .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .attr("class", "label")
    .attr("style", function(d) { return d.depth ? null : "display: none"; }) // hide inner
    .text(function(d) { return title(d); });

  // var text = arcs.append("svg:text")
  //   .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
  //   .attr("dy", ".35em")
  //   .attr("text-anchor", "middle")
  //   .attr("class", "label")
  //   .attr("style", function(d) { return d.depth ? null : "display: none"; }) // hide inner
  //   .text(function(d) { return d.name; });

  d3.selectAll("input").on("change", function change() {
    var value = this.value === "count"
        ? function() { return 1; }
        : function(d) { return d.size; };

    path
        .data(partition.value(value).nodes)
      .transition()
        .duration(1500)
        .attrTween("d", arcTween);

    label
        .data(partition.value(value).nodes)
      .transition()
        .duration(1500)
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; }); 

    // text
    //     .data(partition.value(value).nodes)
    //   .transition()
    //     .duration(1500)
    //     .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; });     


  });
});


// Stash the old values for transition.
function stash(d) {
  d.x0 = d.x;
  d.dx0 = d.dx;
}

// Interpolate the arcs in data space.
function arcTween(a) {
  var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
  return function(t) {
    var b = i(t);
    a.x0 = b.x;
    a.dx0 = b.dx;
    return arc(b);
  };
}

d3.select(self.frameElement).style("height", height + "px");

// Create a title that displays in about the node on hover
function title(node) {
  return "Name: " + node.name + "\nSize: " + node.size + "\nDepth: " + node.depth + "\nValue: " + node.value;
}



//Start of blame graph
var blamegraph = { "nodes":[], "links":[] };
var blamegraphwidth = 500,
    blamegraphheight = 300,
    blamegraphpadding = 30,
    blamegraphcolor = d3.scale.category20(),
    blamegraphrisklist = ["low", "medium", "high"];     

function buildBlameGraph(node) {
  
  blamegraph.nodes.push(node);
  while (node.depth > 0)
  {
    link = {"source": node, "target": node.parent, "value": node.size, "depth": node.depth};
    blamegraph.links.push(link);

    node = node.parent;
    blamegraph.nodes.push(node);

  }
  drawBlameGraph();
  
}

function drawBlameGraph() {
  var force = d3.layout.force()
    .nodes(blamegraph.nodes)
    .links(blamegraph.links)
    .size([blamegraphwidth - blamegraphpadding, blamegraphheight - blamegraphpadding])
    .linkStrength(1)
    .friction(.5)
    .charge(-20)
    .linkDistance(5)
    .gravity(0.8)
    .start();      

  var blamegraphsvg = d3.select("#blame-graph").append("svg")
    .attr("width", blamegraphwidth)
    .attr("height", blamegraphheight);

  blamegraphsvg.append("svg:defs").selectAll("marker")
    .data(blamegraphrisklist)
  .enter().append("svg:marker")
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 18)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
  .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");   

  var xScale = d3.scale.linear()
    .domain([0, d3.max(blamegraph.nodes, function(d) { return d.depth; })])
    .range([blamegraphpadding, blamegraphwidth - blamegraphpadding]);

  var yScale = d3.scale.linear()
    .domain([0, d3.max(blamegraph.nodes, function(d) { return d.index; })])
    .range([blamegraphpadding, blamegraphheight - blamegraphpadding]); 

  var link = blamegraphsvg.selectAll(".link")
  .data(blamegraph.links)
  .enter().append("line")
  .attr("class", "link")
  .attr("marker-end", function(d) { return "url(#" + d.risk + ")"; })
  .style("stroke-width", function(d) { return linkWidth(d.value); });


  var node = blamegraphsvg.selectAll(".node")
    .data(blamegraph.nodes)
    .enter().append("circle")
    .attr("class", "node")
    .attr("r", function(d) { return nodeSize(d.value); })
    .style("fill", function(d) { return blamegraphcolor(d.category); })
    .text(function(d) { return d.name; })
    .call(force.drag);

  node.append("svg:title")
    .text(function(d) { return title(d); });

  node.append("text")
    .attr("x", 12)
    .attr("dy", ".35em") .text(function(d) { return d.name; });   

  force.on("tick", function(e) {

    node.attr("cx", function(d) { return xScale(d.depth); })
      .attr("cy", function(d) { return yScale(d.index); });

    link.attr("x1", function(d) { return xScale(d.source.depth); })
      .attr("y1", function(d) { return yScale(d.source.index); })
      .attr("x2", function(d) { return xScale(d.target.depth); })
      .attr("y2", function(d) { return yScale(d.target.index); })
  }); 
}

function nodeSize(value) {
  return 10;
}

function linkWidth(value) {
  return 2;
}

function title(node) {
  return "Id: " + node.index + "\nName: " + node.name + "\nValue: " + node.value + " \nDepth: " + node.depth + "\nWeight: " + node.weight;
}






