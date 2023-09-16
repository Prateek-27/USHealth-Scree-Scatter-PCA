UpdateGraph();
// Function to Update Graph / Plot 
function UpdateGraph() {

    var selectedval = 0;
    var attribute = 12;
    // Remove Exisiting Plot on Canvas
    d3.select('#plot').selectAll("*").remove();

    // Initializations
    var width = 1000;
    var height = 700;
    var left_padding = 250;
    var top_padding = 75;
    var graphName;

    // Getting the selected attribute (PCs limit)
    attribute = document.getElementById("list").value;
    //console.log(attribute)

    // SCREE PLOT 

    d3.json('/data', function (error, data) {
        var attri = parseInt(attribute);

        data_list = [];

        for (var i = 1; i < (attri + 1); i++) {
            data_list.push('PC' + i);

        };
        var final_data = [];
        var data1 = data.var;
        var data2 = data.var_sum;
        //console.log(data.var);
        //console.log(data.var_sum);

        // Data for bar plot and line plot
        for (var i = 0; i < data_list.length; i++) {
            final_data.push(
                {
                    'key': data_list[i],
                    'value': data1[i]
                }
            );

        };
        final_data2 = [];
        for (var i = 0; i < data_list.length; i++) {
            final_data2.push(
                {
                    'key': data_list[i],
                    'value': data2[i]
                }
            );

        };

        //console.log(final_data);
        //console.log(final_data2);

        max_data = Math.max.apply(Math, data.var);
        //console.log(max_data);


        //var final_data = [data, data_list];
        max_val = 100;

        // Scaling values
        var widthScale = d3.scaleBand()
            .domain(data_list)
            .range([0, width - left_padding])
            .padding(0.2);

        var heightScale = d3.scaleLinear()
            .domain([0, max_val])
            .range([height - top_padding, 0]);

        var color = d3.scaleLinear()
            .domain([0, max_data])
            .range(['red', 'blue']);

        // x and y axis
        var x_axis = d3.axisBottom().scale(widthScale).ticks(data_list.length);
        var y_axis = d3.axisLeft().scale(heightScale);

        // Canvas to display graph
        var canvas = d3.select("#plot")
            .append("svg")
            .attr("width", width + left_padding)
            .attr("height", height + top_padding)
            .append('g')
            .attr('transform', 'translate(' + width / 2 + ',' + top_padding + ')');

        // Plotting the bars
        var bars = canvas.selectAll("rect")
            .data(final_data)
            .enter()
            .append("rect")
            .attr("x", function (d) { return widthScale(d.key); }) //function(d, i) { return i*5;}
            .attr("y", function (d) { return heightScale(d.value); })
            .attr("width", widthScale.bandwidth())
            .attr("height", function (d) { return height - top_padding - heightScale(d.value); }) //length of bars
            .attr("fill", function (d) { return color(d.value); })
            .on("click", function (d, i) {
                // When a bar is clicked send the pi value (last clicked bar)
                selectedval = i + 1
                fetch('/diGet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ selectedval: selectedval })
                });
                // remove the highlight class from all bars
                bars.classed("highlight", false);
                // add the highlight class to the selected bar
                d3.select(this).classed("highlight", true);
            });


        // Plotting line 
        var line = canvas.append("path")
            .datum(final_data2)
            .attr("fill", "none")
            .attr("stroke", "yellow")
            .attr("stroke-width", 2.5)
            .attr("d", d3.line()
                .x(function (d) { return widthScale(d.key) })
                .y(function (d) { return heightScale(d.value) })
            )
            .attr('transform', 'translate(' + widthScale.bandwidth() / 2 + ',' + 0 + ')');

        // Labeling the graph and axis
        var t = 'Principal Component';
        canvas.append("text")
            .attr("x", (width / 2))
            .attr("y", 0 - (top_padding / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("text-decoration", "underline")
            .text(t + " " + " v/s Variance Explained (%)");

        canvas.append('g')
            .attr('transform', 'translate(0,' + (height - top_padding) + ')')
            .call(x_axis)
            .selectAll("text")
            //.attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "middle");

        canvas.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height - (top_padding / 2))
            .text('Principal Component');

        canvas.append('g')
            .call(y_axis);

        canvas.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("x", -height / 2)
            .attr("y", -60)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Variance Explained (%)");

    });

}
