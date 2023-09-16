// Initializations
var width = 900;
var height = 600;
var left_padding = width / 2;
var top_padding = 75;
var graphName;



d3.json('/biplot_data', function (error, data) {
    var e_vec = data.e_vec;
    var X = data.X;
    var labels = data.labels;
    var scatter_data = [];
    var attri = data.attri;
    //console.log(labels);
    //console.log(attri);
    var pc1_vals = [];
    var pc2_vals = [];

    var x_max_value = 3;
    var x_min_value = -3;
    var y_max_value = 5;
    var y_min_value = -5;

    //console.log(X[0].length)

    for (i = 0; i < X[0].length; i++) {
        pc1_vals.push(X[0][i])
        pc2_vals.push(X[1][i])
        scatter_data.push(
            {
                PC1: X[0][i],
                PC2: X[1][i],
                label: labels[i],
            }
        )
    };
    //console.log(scatter_data);
    x_max_value = d3.max(pc1_vals);
    x_min_value = d3.min(pc1_vals)
    y_max_value = d3.max(pc2_vals)
    y_min_value = d3.min(pc2_vals)

    //console.log(x_max_value, x_min_value, y_max_value, y_min_value);

    var line_data = [];
    //console.log(e_vec[0].length);

    for (i = 0; i < e_vec[0].length; i++) {
        line_data.push(
            {
                x_val: e_vec[0][i],
                y_val: e_vec[1][i],
                attri: attri[i],

            }
        )
    };

    //console.log(scatter_data);
    //console.log(line_data);
    //console.log(e_vec);
    //console.log(X);


    // Preparing the canvas to plot data 
    var canvas = d3.select("#plot")
        .append("svg")
        .attr("width", width + 2 * left_padding)
        .attr("height", height + 2 * top_padding)
        .append("g")
        .attr('transform', 'translate(' + left_padding + ',' + top_padding + ')');

    // Scaling
    // X Axis
    var widthScale = d3.scaleLinear()
        .domain([x_min_value, x_max_value])
        .range([0, width]);
    canvas.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(widthScale));
    canvas.append("g")
        .attr("transform", "translate(0," + 0 + ")")
        .call(d3.axisBottom(widthScale));


    // Add Y axis
    var heightScale = d3.scaleLinear()
        .domain([y_min_value, y_max_value])
        .range([height, 0]);

    canvas.append("g")
        .call(d3.axisLeft(heightScale))
        .attr("transform", "translate(" + width + "," + 0 + ")");
    canvas.append("g")
        .call(d3.axisLeft(heightScale))
        .attr("transform", "translate(" + 0 + "," + 0 + ")");

    // Coloring
    // Define the domain as labels
    let uniqueLabels = [...new Set(labels)]
    //console.log(uniqueLabels);

    // Range of colors
    var color = d3.scaleOrdinal()
        .domain(uniqueLabels)
        .range(["red", "green", "blue"]);

    // Add dots
    canvas.append('g')
        .selectAll("dot")
        .data(scatter_data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return widthScale(d.PC1); })
        .attr("cy", function (d) { return heightScale(d.PC2); })
        .attr("r", 2)
        .style("fill", function (d) { return color(d.label) });

    // Add lines
    canvas.selectAll("lines")
        .data(line_data)
        .enter()
        .append("line")
        .attr("x1", widthScale(0))
        .attr("y1", heightScale(0))
        .attr("x2", function (d) { return widthScale(d.x_val * 4); })
        .attr("y2", function (d) { return heightScale(d.y_val * 4); })
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    //console.log(line_data);

    // Label lines
    canvas.selectAll(".label")
        .data(line_data)
        .enter()
        .append("text")
        .attr('class', 'label')
        .attr("x", function (d) { return widthScale(d.x_val * 4.4); })
        .attr("y", function (d) { return heightScale(d.y_val * 4.4); })
        .text(function (d) { return d.attri; });

    // Labeling the graph and axises
    canvas.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (top_padding / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("text-decoration", "underline")
        .text("Biplot PC1 vs PC2");

    canvas.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 45)
        .text("PC1");

    canvas.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("x", -height / 2)
        .attr("y", -60)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("PC2");

});

