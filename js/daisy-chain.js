
//Sunburst Graph
var colorscheme = {
        psi: {
          3: ['#91cf60', '#FFF500', '#FF0000'],
          4: ['#91cf60', '#FFF500', '#FF0000', '#BDBDBD']
        }     
      };           

var maxdepth = 5;

var container = document.querySelector("#sunburst");
var width  = 600,  
    height = 500,
    radius = Math.min(width, height) / 2;               

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

var color = d3.scale.ordinal()
  .domain(0,3)
  .range(colorscheme.psi[4]);    


d3.json("/data/sample-tree.json", function(error, root) {

  var arcs = svg.datum(root).selectAll("path")
    .data(partition.nodes)
    .enter().append('svg:g');   

  var path = arcs.append("path")
      .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
      .attr("d", arc)
      .on("click", function(d) { buildBlameGraph(d); })
      .style("stroke", "#fff")
      // .style("fill", function(d) { return color(d.value * d.depth); })
      .style("fill", function(d) { return color(d.psi); })
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
var blamegraphwidth = 800,
    blamegraphheight = 150,
    blamegraphpadding = 100,
    blamegraphrisklist = ["low", "medium", "high"];

var blamedict = new Array();
d3.json("/data/sample-dict.json", function(error, root) {
  blamedict = root; 
});
          

function buildBlameGraph(node) {

  $("#node-details").empty();
  $("#blame-graph").empty();
  displayNodeDetails(node);

  if (node.name in blamedict)
    {
      var chains = blamedict[node.name];
      for (var i = 0; i < chains.length; i++) {
        buildNodesAndLinks(chains[i]);
      }
    }
  else 
    {
      blamegraph = { "nodes":[], "links":[] };
      blamegraph.nodes.push(node);
      while (node.depth > 0)
      {
        link = {"source": node.parent, "target": node, "value": node.size, "depth": node.depth, "risk": "low"};
        blamegraph.links.push(link);

        node = node.parent;
        blamegraph.nodes.push(node);

      }
      drawBlameGraph();      
    }  

  // for (var i = 0; i < chains.length; i++)
  // {
  //   console.log(chains[i]);
  // }

  // blamegraph = { "nodes":[], "links":[] };
  // blamegraph.nodes.push(node);
  // while (node.depth > 0)
  // {
  //   link = {"source": node.parent, "target": node, "value": node.size, "depth": node.depth, "risk": "low"};
  //   blamegraph.links.push(link);

  //   node = node.parent;
  //   blamegraph.nodes.push(node);

  // }
  // drawBlameGraph();
  
}

function buildNodesAndLinks(chain) {
  blamegraph = { "nodes":[], "links":[] };
  for (var i = 0; i < chain.length; i++) {
      
    var node = chain[i];
    node['depth'] = i;
    console.log(node);
    blamegraph.nodes.push(node);

    if (node.parent) {
      link = {"source": node.parent, "target": node, "value": node.size, "depth": node.depth, "risk": "low"};
      blamegraph.links.push(link);      
    }

  }
  console.log(blamegraph);
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
    .attr("id", "svg")
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
    .attr("fill", "#999")
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
    .enter().append("g")
    .attr("class", "node")
    .on("click", function(d) { displayNodeDetails(d); })
    .call(force.drag);

  node.append("svg:circle")
    .attr("r", function(d) { return nodeSize(d.value); })
    .style("fill", function(d) { return color(d.psi); })
    .attr("x", -8)
    .attr("y", -8)

  node.append("svg:title")
    .text(function(d) { return title(d); });

  node.append("text")
    .attr("dx", -1)
    .attr("dy", 25)
    .text(function(d) { return d.name; });   

  force.on("tick", function(e) {

    link.attr("x1", function(d) { return xScale(d.source.depth); })
      .attr("y1", function(d) { return blamegraphheight / 2; })
      .attr("x2", function(d) { return xScale(d.target.depth); })
      .attr("y2", function(d) { return blamegraphheight / 2; })

    node.attr("transform", function(d) { return "translate(" + xScale(d.depth) + "," + blamegraphheight / 2 + ")"; });  
  }); 
}

function nodeSize(value) {
  return 10;
}

function linkWidth(value) {
  return 2;
}

function title(node) {
  return "Name: " + node.name + "\nValue: " + node.value + " \nDepth: " + node.depth + "\nWeight: " + node.weight;
}


//Start of node details
function displayNodeDetails(d) {  
  $("#node-details").empty();
  $("#node-details").append('<h4>' + d.name + '</h4>');
  $("#node-details").append('<hr>');
  $("#node-details").append('<p><b>PSI:</b> ' + d.psi + '</p>');
  $("#node-details").append('<p><b>Size:</b> ' + d.value + '</p>');
  $("#node-details").append('<p><b>Depth:</b> ' + d.depth + '</p>');
  if (d.children) {
    $("#node-details").append('<p><b>Number of children:</b> ' + d.children.length + '</p>');  
  }
  $("#node-details").append('<p><b>Parent:</b> ' + d.parent.name + '</p>');
}






