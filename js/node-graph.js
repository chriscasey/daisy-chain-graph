function nodeSize(value) {
  // if (value < 8) {
  //   return 10;
  // }
  // else if (value > 8 && value < 20) {
  //   return 20;
  // }
  // return 30;
  return 10;
}

function linkWidth(value) {
  // if (value < 3) {
  //   return 2;
  // }
  // else if (value > 3 && value < 7) {
  //   return 5;
  // }
  // return 8;
  return 2;
}

function title(node) {
  return "Id: " + node.index + "\nName: " + node.name + "\nValue: " + node.value + " \nDepth: " + node.depth + "\nWeight: " + node.weight;
}

var graph = {
  "nodes":[
    {"name":"A","index":0, "category": 1, "value": 35, "depth": 0},
    {"name":"B","index":1, "category": 2, "value": 30, "depth": 1},
    {"name":"B2","index":2, "category": 2, "value": 20, "depth": 2},
    {"name":"B3","index":3, "category": 2, "value": 10, "depth": 3},
    {"name":"B4","index":4, "category": 2, "value": 5, "depth": 4},
    {"name":"B5","index":5, "category": 2, "value": 2, "depth": 5},
    {"name":"C","index":6, "category": 3, "value": 28, "depth": 1},
    {"name":"C2","index":7, "category": 3, "value": 28, "depth": 2},
    {"name":"C3","index":8, "category": 3, "value": 28, "depth": 3},
    {"name":"C4","index":9, "category": 3, "value": 28, "depth": 4},
    {"name":"D","index":10, "category": 3, "value": 29, "depth": 1},
    {"name":"D2","index":11, "category": 3, "value": 29, "depth": 2},
    {"name":"D3","index":12, "category": 3, "value": 29, "depth": 3},
    {"name":"E","index":13, "category": 2, "value": 15, "depth": 1},
    {"name":"E2","index":14, "category": 2, "value": 15, "depth": 2},
    {"name":"E3","index":15, "category": 2, "value": 15, "depth": 3},
    {"name":"E4","index":16, "category": 2, "value": 15, "depth": 4},
    {"name":"E5","index":17, "category": 2, "value": 15, "depth": 5},
    {"name":"F","index":18, "category": 2, "value": 16, "depth": 1},
    {"name":"F2","index":19, "category": 2, "value": 16, "depth": 2},
    {"name":"F3","index":20, "category": 2, "value": 16, "depth": 3},
    {"name":"F4","index":21, "category": 2, "value": 16, "depth": 4},
    {"name":"F5","index":22, "category": 2, "value": 16, "depth": 5},
    {"name":"F6","index":23, "category": 2, "value": 16, "depth": 6},
    {"name":"G","index":24, "category": 3, "value": 17, "depth": 1},
    {"name":"G2","index":25, "category": 3, "value": 17, "depth": 2},
    {"name":"G3","index":26, "category": 3, "value": 17, "depth": 3},
    {"name":"G4","index":27, "category": 3, "value": 17, "depth": 4},
  ],
  "links":[
    {"source":0,"target":1,"value":8, "risk": "high"},
    {"source":0,"target":6,"value":8, "risk": "high"},
    {"source":0,"target":10,"value":8, "risk": "high"},
    {"source":0,"target":13,"value":8, "risk": "high"},
    {"source":0,"target":18,"value":8, "risk": "high"},
    {"source":0,"target":24,"value":8, "risk": "high"},
    {"source":1,"target":2,"value":1, "risk": "medium"},
    {"source":2,"target":3,"value":1, "risk": "low"},
    {"source":3,"target":4,"value":1, "risk": "low"},
    {"source":4,"target":5,"value":1, "risk": "low"},
    {"source":6,"target":2,"value":1, "risk": "high"},
    {"source":6,"target":3,"value":1, "risk": "high"},
    {"source":6,"target":4,"value":1, "risk": "high"},
    {"source":6,"target":7,"value":1, "risk": "high"},
    {"source":7,"target":8,"value":1, "risk": "low"},
    {"source":8,"target":9,"value":1, "risk": "low"},
    {"source":10,"target":8,"value":1, "risk": "low"},
    {"source":10,"target":11,"value":1, "risk": "low"},
    {"source":11,"target":12,"value":1, "risk": "low"},
    {"source":11,"target":9,"value":1, "risk": "low"},
    {"source":13,"target":14,"value":1, "risk": "low"},
    {"source":14,"target":15,"value":1, "risk": "low"},
    {"source":14,"target":21,"value":1, "risk": "low"},
    {"source":15,"target":16,"value":1, "risk": "low"},
    {"source":16,"target":17,"value":1, "risk": "low"},
    {"source":18,"target":19,"value":1, "risk": "low"},
    {"source":19,"target":16,"value":1, "risk": "low"},
    {"source":19,"target":17,"value":1, "risk": "low"},
    {"source":19,"target":20,"value":1, "risk": "low"},
    {"source":19,"target":25,"value":1, "risk": "low"},
    {"source":19,"target":26,"value":1, "risk": "low"},
    {"source":19,"target":27,"value":1, "risk": "low"},
    {"source":20,"target":21,"value":1, "risk": "low"},
    {"source":21,"target":22,"value":1, "risk": "low"},
    {"source":22,"target":23,"value":1, "risk": "low"},
    {"source":24,"target":25,"value":1, "risk": "low"},
    {"source":25,"target":26,"value":1, "risk": "low"},
    {"source":26,"target":27,"value":1, "risk": "low"}
  ]
}

var width = 960,
    height = 500,
    padding = 30,
    color = d3.scale.category20(),
    riskList = ["low", "medium", "high"];      

var force = d3.layout.force()
  .nodes(graph.nodes)
  .links(graph.links)
  .size([width - padding, height - padding])
  .linkStrength(0)
  .friction(.8)
  .charge(-2000)
  // .charge(function(d) { return (nodeSize(d.value) * 250) * -1; })
  // .linkDistance((d3.max(graph.nodes, function(d) { return d.depth; }) / width))
  .linkDistance(10)
  .gravity(0.8)
  .start();

var svg = d3.select("body").append("svg:svg")
  .attr("width", width)
  .attr("height", height);

svg.append("svg:defs").selectAll("marker")
  .data(riskList)
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
  .domain([0, d3.max(graph.nodes, function(d) { return d.depth; })])
  .range([padding, width - padding]);

var yScale = d3.scale.linear()
  .domain([0, d3.max(graph.nodes, function(d) { return d.index; })])
  .range([padding, height - padding]);   

var link = svg.selectAll(".link")
  .data(graph.links)
  .enter().append("line")
  .attr("class", "link")
  .attr("marker-end", function(d) { return "url(#" + d.risk + ")"; })
  .style("stroke-width", function(d) { return linkWidth(d.value); });


var node = svg.selectAll(".node")
  .data(graph.nodes)
  .enter().append("circle")
  .attr("class", "node")
  .attr("r", function(d) { return nodeSize(d.value); })
  .style("fill", function(d) { return color(d.category); })
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
