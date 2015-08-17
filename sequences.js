// Dimensions of sunburst.
var width = 750;
var height = 600;
var radius = Math.min(width, height) / 2;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
  w: 75, h: 30, s: 3, t: 10
};

// Mapping of step names to colors.
var colors = {
/*  "home": "#5687d1",
  "product": "#7b615c",
  "search": "#de783b",
  "account": "#6ab975",
  "other": "#a173d1",
  "end": "#bbbbbb" */
  
/*  "Monday": "rgb(86, 135, 209)",//"#5687d1",
  "Tuesday": "rgb(26, 161, 141)", //"#de783b",
  "Wednesday": "rgb(119, 216, 213)", //"#6ab975",
  "Thursday": "rgb(255, 192, 203)", //"#a173d1",
  "Friday": "rgb(224, 40, 103)", //"#bbbbbb", 
  "Saturday": "rgb(152, 32, 73)", //"#7b615c",
  "Sunday": "rgb(101, 79, 124)", //"pink",
  "Carbs": "rgb(43, 59, 137)", //"red",
  "Fat": "rgb(255, 203, 0)", //"yellow",
  "Protein": "rgb(110, 218, 112)" //"blue" */

  "default": "rgb(159, 187, 238)",

  "Public Safety": "rgb(137, 86, 209)",
  "Police": "rgb(162, 131, 207)",
  "Police Services": "rgb(195, 175, 223)",
  "Support Services": "rgb(207, 175, 223)",
  "Investigative Services": "rgb(223, 175, 217)",
  "Fire Rescue": "rgb(207, 131, 200)",
  "Suppression and Rescue": "rgb(205, 159, 201)",
  "Corrections and Rehabilitation": "rgb(207, 131, 162)",
  "Custody Services": "rgb(207, 162, 180)",
  "Management Services and Training": "rgb(207, 162, 162)",

  "Transportation": "rgb(213, 73, 73)",
  "Transit": "rgb(250, 104, 104)",
  "Metrobus": "rgb(252, 182, 182)",
  "Aviation": "rgb(250, 150, 104)",
  "Operational Support": "rgb(252, 197, 182)",
  "Metrorail": "rgb(252, 206, 182)",
  "Paratransit": "rgb(252, 222, 182)",
  "Facilities Management": "rgb(244, 184, 156)",
  "Non-Departmental": "rgb(244, 204, 156)",
  "Public Safety and Security": "rgb(244, 227, 156)",
  "Commercial Operations": "rgb(237, 244, 156)",
  "Administration": "rgb(221, 244, 156)",
  "Port of Miami": "rgb(250, 182, 104)",

  "Neighborhood and Infrastructure": "rgb(237, 148, 21)",
  "Water and Sewer": "rgb(234, 172, 83)",
  "Water and Wastewater Systems Operations": "rgb(236, 191, 127)",
  "Public Works and Waste Management": "rgb(234, 205, 83)",
  "Finance and Administration": "rgb(229, 214, 150)",
  "Collection Operations": "rgb(242, 226, 140)",
  "Environmental and Technical Services": "rgb(242, 238, 140)",
  "Regulatory and Economic Resources": "rgb(234, 227, 83)",
  "Disposal Operations": "rgb(235, 242, 140)",
  "Highway Engineering": "rgb(211, 242, 140)",
  "Construction and Maintenance": "rgb(180, 242, 140)",
  "Program Management, Regulatory and Compliance": "rgb(226, 234, 128)",
  "Construction, Permitting, and Building Code": "rgb(219, 242, 140)",

  "Health and Human Services": "rgb(235, 229, 44)",
  "Jackson Health System": "rgb(232, 228, 101)",
  "Community Action and Human Services": "rgb(203, 232, 101)",
  "Public Housing and Community Development": "rgb(158, 232, 101)",
  "Homeless Trust": "rgb(117, 232, 101)",
  "Head Start": "rgb(236, 233, 148)",
  "Asset Management": "rgb(199, 240, 168)",
  "Environmental Resources Management": "rgb(242, 237, 140)",

  "General Government": "rgb(109, 235, 44)",
  "Internal Services": "rgb(146, 234, 101)",
  "Fleet Management": "rgb(181, 236, 152)",
  "Facilities and Utilities Management": "rgb(152, 236, 157)",
  "Information Technology": "rgb(101, 234, 110)",

  "Recreation and Culture": "rgb(44, 235, 191)",
  "Parks, Recreation and Open Spaces": "rgb(137, 237, 214)",
  "Park Operations": "rgb(176, 252, 234)",
  "Library": "rgb(137, 231, 237)",
  "Public Service": "rgb(180, 237, 240)",

  "Economic Development": "rgb(44, 206, 235)",

  "Policy Formulation": "rgb(44, 111, 235)"
};

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0; 

var vis = d3.select("#chart").append("svg:svg")
    .attr("width", '100%')//width)
    .attr("height", '100%')//height)
    .attr('viewBox','0 0 '+Math.min(width,height)+' '+Math.min(width,height))
    .attr('preserveAspectRatio','xMinYMin')
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + Math.min(width,height) / 2 + "," + Math.min(width,height) / 2 + ")");
//.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var partition = d3.layout.partition()
    .size([2 * Math.PI, radius * radius])
    .value(function(d) { return d.size; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx; })
    .innerRadius(function(d) { return Math.sqrt(d.y); })
    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

// Use d3.text and d3.csv.parseRows so that we do not need to have a header
// row, and can receive the csv as an array of arrays.
//var d3_data =  encodeURI($('#data').val());
d3.text( 'operating_budget.csv', //'data://'+d3_data,  //"mfp1.csv", // "visit-sequences.csv",
function(text) {
  var csv = d3.csv.parseRows(text);
  var json = buildHierarchy(csv);
  createVisualization(json);
});

// Main function to draw and set up the visualization, once we have the data.
function createVisualization(json) {

  // Basic setup of page elements.
  initializeBreadcrumbTrail();
  //drawLegend();
  //toggleLegend();

  // Bounding circle underneath the sunburst, to make it easier to detect
  // when the mouse leaves the parent g.
  vis.append("svg:circle")
      .attr("r", radius)
      .style("opacity", 0);

  // No sort comparator
  function nosort(a,b) {
    return a;
  }

  // For efficiency, filter nodes to keep only those large enough to see.
  var nodes = partition.nodes(json)
      .filter(function(d) {
      return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
      });

  var path = vis.data([json]).selectAll("path")
      .data(nodes)
      .enter().append("svg:path")
      .attr("display", function(d) { return d.depth ? null : "none"; })
      .attr("d", arc)
      .attr("fill-rule", "evenodd")
      .style("fill", function(d) {
        if (colors.hasOwnProperty(d.name)) {
          return colors[d.name];
        } else {
          return colors.default;
        }
      })
      .style("opacity", 1)
      .on("mouseover", mouseover);

  // Add the mouseleave handler to the bounding circle.
  d3.select("#container").on("mouseleave", mouseleave);

  // Get total size of the tree = value of root node from partition.
  totalSize = path.node().__data__.value;
 };

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {

  var percentage = (100 * d.value / totalSize).toPrecision(3);
  var percentageString = percentage + "%";
  if (percentage < 0.1) {
    percentageString = "< 0.1%";
  }

  d3.select('#value')
      .text("$"+numeral(d.value).format('0,0'));

  d3.select("#percentage")
      .text(percentageString);

  d3.select("#explanation")
    .style("visibility", "")
    .attr('viewBox','0 0 '+Math.min(width,height)+' '+Math.min(width,height))
    .attr('preserveAspectRatio','xMinYMin')
    .attr("id", "explanation")
    .attr("transform", "translate(" + Math.min(width,height) / 2 + "," + Math.min(width,height) / 2 + ")");

  var sequenceArray = getAncestors(d);
  updateBreadcrumbs(sequenceArray, percentageString);

  // Fade all the segments.
  d3.selectAll("path")
      .style("opacity", 0.3);

  // Then highlight only those that are an ancestor of the current segment.
  vis.selectAll("path")
      .filter(function(node) {
                return (sequenceArray.indexOf(node) >= 0);
              })
      .style("opacity", 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {

  // Hide the breadcrumb trail
  d3.select("#trail")
      .style("visibility", "hidden");

  // Deactivate all segments during transition.
  d3.selectAll("path").on("mouseover", null);

  // Transition each segment to full opacity and then reactivate it.
  d3.selectAll("path")
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .each("end", function() {
              d3.select(this).on("mouseover", mouseover);
            });

  d3.select("#explanation")
      .style("visibility", "hidden");
}

// Given a node in a partition layout, return an array of all of its ancestor
// nodes, highest first, but excluding the root.
function getAncestors(node) {
  var path = [];
  var current = node;
  while (current.parent) {
    path.unshift(current);
    current = current.parent;
  }
  return path;
}

function initializeBreadcrumbTrail() {
  // Add the svg area.
  var trail = d3.select("#sequence").append("svg:svg")
    .attr("width", 300)
    .attr("height", 150)
    //.attr('viewBox','0 0 '+Math.min(width,height)+' '+Math.min(width,height))
    //.attr('preserveAspectRatio','xMinYMin')
    .attr("id", "trail")
    .attr("transform", "translate(" + Math.min(width,height) / 2 + "," + Math.min(width,height) / 2 + ")");
  // Add the label at the end, for the percentage.
  trail.append("svg:text")
    .attr("id", "endlabel")
    .style("fill", "#000");
}

// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumbPoints(d, i) {
  var points = [];
  points.push("0,0");
  points.push(b.w + ",0");
  points.push(b.w + b.t + "," + (b.h / 2));
  points.push(b.w + "," + b.h);
  points.push("0," + b.h);
  if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
    points.push(b.t + "," + (b.h / 2));
  }
  return points.join(" ");
}

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, percentageString) {

  // Data join; key function combines name and depth (= position in sequence).
  var g = d3.select("#trail")
      .selectAll("g")
      .data(nodeArray, function(d) { return d.name + d.depth; });

  // Add breadcrumb and label for entering nodes.
  var entering = g.enter().append("svg:g");

  entering.append("svg:polygon")
      .attr("points", breadcrumbPoints)
      .style("fill", 'transparent');//function(d) { return colors[d.name]; });

  entering.append("svg:text")
      .attr("x", 10)//(b.w + b.t) / 2)
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "left")
      .text(function(d) { return d.name; });

  // Set position for entering and updating nodes.
  g.attr("transform", function(d, i) {
    return "translate(-10, " + i*20 + ")";// * (b.w + b.s) + ", 0)";
  });

  // Remove exiting nodes.
  g.exit().remove();

  // Now move and update the percentage at the end.
 /* d3.select("#trail").select("#endlabel")
      .attr("x", 0)//(nodeArray.length + 0.5) * (b.w + b.s))
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      //.attr("text-anchor", "middle")
      .text(percentageString);
  */

  // Make the breadcrumb trail visible, if it's hidden.
  d3.select("#trail")
      .style("visibility", "");

}

function drawLegend() {

  // Dimensions of legend item: width, height, spacing, radius of rounded rect.
  var li = {
    w: 75, h: 30, s: 3, r: 3
  };

  var legend = d3.select("#legend").append("svg:svg")
      .attr("width", li.w)
      .attr("height", d3.keys(colors).length * (li.h + li.s));

  var g = legend.selectAll("g")
      .data(d3.entries(colors))
      .enter().append("svg:g")
      .attr("transform", function(d, i) {
              return "translate(0," + i * (li.h + li.s) + ")";
           });

  g.append("svg:rect")
      .attr("rx", li.r)
      .attr("ry", li.r)
      .attr("width", li.w)
      .attr("height", li.h)
      .style("fill", function(d) { return d.value; });

  g.append("svg:text")
      .attr("x", li.w / 2)
      .attr("y", li.h / 2)
      .attr("dy", "0.35em")
 //     .attr("text-anchor", "middle")
      .text(function(d) { return d.key; });
}

function toggleLegend() {
  var legend = d3.select("#legend");
  if (legend.style("visibility") == "hidden") {
    legend.style("visibility", "");
  } else {
    legend.style("visibility", "hidden");
  }
}

// Take a 2-column CSV and transform it into a hierarchical structure suitable
// for a partition layout. The first column is a sequence of step names, from
// root to leaf, separated by hyphens. The second column is a count of how 
// often that sequence occurred.
function buildHierarchy(csv) {
  var root = {"name": "root", "children": []};
  for (var i = 0; i < csv.length; i++) {
    //var sequence = csv[i][0];
    var size = +csv[i][3];
    if (isNaN(size)) { // e.g. if this is a header row
      continue;
    }
    var parts = [csv[i][1], csv[i][2], csv[i][0]];//sequence.split("-");
    var currentNode = root;
    for (var j = 0; j < parts.length; j++) {
      var children = currentNode["children"];
      var nodeName = parts[j];
      var childNode;
      if (j + 1 < parts.length) {
   // Not yet at the end of the sequence; move down the tree.
 	var foundChild = false;
 	for (var k = 0; k < children.length; k++) {
 	  if (children[k]["name"] == nodeName) {
 	    childNode = children[k];
 	    foundChild = true;
 	    break;
 	  }
 	}
  // If we don't already have a child node for this branch, create it.
 	if (!foundChild) {
 	  childNode = {"name": nodeName, "children": []};
 	  children.push(childNode);
 	}
 	currentNode = childNode;
      } else {
 	// Reached the end of the sequence; create a leaf node.
 	childNode = {"name": nodeName, "size": size};
 	children.push(childNode);
      }
    }
  }
  return root;
};
