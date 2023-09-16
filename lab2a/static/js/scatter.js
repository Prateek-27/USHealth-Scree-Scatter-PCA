// Getting the selected attribute
    //var attribute = document.getElementById("list").value;
    // console.log(document.getElementById("list").value);

    //console.log(attribute)


    // Dimension of the whole chart. Only one size since it has to be square
    var marginCanvas = { top: 40, right: 10, bottom: 10, left: 500 },
        canvasSize = 1440 - marginCanvas.left - marginCanvas.right

    // Create the canvas
    var canvas = d3.select("#plot")
        .append("svg")
        .attr("width", canvasSize + marginCanvas.left + marginCanvas.right)
        .attr("height", canvasSize + marginCanvas.top + marginCanvas.bottom)
        .append("g")
        .attr("transform", "translate(" + marginCanvas.left + "," + marginCanvas.top + ")");


    // Get the data 
    d3.json('/mat_data', function (error, data) {


        var names = data.attrinames;
        var attri1name = names[0];
        var attri2name = names[1];
        var attri3name = names[2];
        var attri4name = names[3];
        var corr_labels = data.corr_labels;
        //console.log(corr_labels);

        var attri1val = data.attri1;
        var attri2val = data.attri2;
        var attri3val = data.attri3;
        var attri4val = data.attri4;

        var allAttri = [attri1name, attri2name, attri3name, attri4name];

        data_final = [];
        //console.log(allAttri[0]);

        for (i = 0; i < attri1val.length; i++) {
            data_final.push(
                {
                    [attri1name]: attri1val[i],
                    [attri2name]: attri2val[i],
                    [attri3name]: attri3val[i],
                    [attri4name]: attri4val[i],
                    "labels": corr_labels
                }
            )
        };

        //console.log(data_final);
        //console.log(data_final[1]['labels'][0][0]);

        // No. of attributes
        var numattri = allAttri.length;

        // Compute the size of chart
        mar = 20
        size = canvasSize / numattri;


        // Gives the position of each pair each variable
        var position = d3.scalePoint()
            .domain(allAttri)
            .range([0, canvasSize - size])

        // For getting the right labels
        var counter = 0;

        // Loop to create scatter plots
        for (i in allAttri) {
            for (j in allAttri) {

                // Get current variable name
                var var1 = allAttri[i]
                var var2 = allAttri[j]

                var key1 = allAttri.indexOf(var1)
                var key2 = allAttri.indexOf(var2)

                // Add attribute name if both are same variables
                if (var1 === var2) {
                    var var1 = allAttri[i]
                    var var2 = allAttri[j]
                    canvas
                        .append('g')
                        .attr("transform", "translate(" + position(var1) + "," + position(var2) + ")")
                        .append('text')
                        .attr("x", size / 2)
                        .attr("y", size / 2)
                        .text(var1)
                        .attr("text-anchor", "middle")
                }

                else {
                    // Add Width Scale of each graph
                    x_min_max = d3.extent(data_final, function (d) { return +d[var1] })
                    var widthScale = d3.scaleLinear()
                        .domain(x_min_max).nice()
                        .range([0, size - 2 * mar]);

                    // Add Height Scale of each graph
                    y_min_max = d3.extent(data_final, function (d) { return +d[var2] })
                    var heightScale = d3.scaleLinear()
                        .domain(y_min_max).nice()
                        .range([size - 2 * mar, 0]);

                    // Add a 'g' at the right position
                    var scatter = canvas
                        .append('g')
                        .attr("transform", "translate(" + (position(var1) + mar) + "," + (position(var2) + mar) + ")");

                    // Add X and Y axis in scatter
                    scatter.append("g")
                        .attr("transform", "translate(" + 0 + "," + (size - mar * 2) + ")")
                        .call(d3.axisBottom(widthScale).ticks(3));
                    scatter.append("g")
                        .call(d3.axisLeft(heightScale).ticks(3));

                    // Coloring
                    let uniqueLabels = [...new Set(corr_labels[counter])]
                    //console.log(uniqueLabels);

                    // Range of colors
                    var color = d3.scaleOrdinal()
                        .domain(uniqueLabels)
                        .range(["red", "green", "blue"]);



                    // Add dots and color
                    var dots = scatter.selectAll("myCircles")
                        .data(data_final)
                        .enter()
                        .append("circle")
                        .attr("cx", function (d) { return widthScale(+d[var1]) })
                        .attr("cy", function (d) { return heightScale(+d[var2]) })
                        .attr("r", 3)
                        .attr("fill", function (d, i) {
                            //console.log(d.labels[counter][i]);
                            return color(d.labels[counter][i])
                        })
                    // Plot name
                    canvas.append("text")
                        .attr("x", (canvasSize / 2))
                        .attr("y", 0)
                        .attr("text-anchor", "middle")
                        .style("font-size", "18px")
                        .style("text-decoration", "underline")
                        .text("Scatterplot Matrix");
                }
            }
        }
        // Increment counter as next label to be selected
        counter += 1;

    });


    // Create the table
    d3.json('/mat_data', function (error, data) {

        var names = data.attrinames;
        var loadings = [];
        var top4_loadings = data.top4_loadings;

        //console.log(names);
        //console.log(top4_loadings[0]);


        var final_table_data = [];
        //var x = [];

        for (i = 0; i < names.length; i++) {
            x = top4_loadings[i];
            y = eval('(' + x + ')');
            //console.log(typeof y);
            name = names[i];
            y["attribute"] = name;
            //console.log(y)
            final_table_data.push(y);

        };

        var table = d3.select('#table')
        var thead = table.append('thead')
        var tbody = table.append('tbody');
        var columns = Object.keys(final_table_data[0]);

        // Table Heading
        thead.append("tr")
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("text-decoration", "underline")
            .text("Table of Significance of Variables");

        // Column names
        thead.append("tr")
            .selectAll("th")
            .data(columns)
            .enter()
            .append("th")
            .text(function (d) {
                x = parseInt(d)
                if (isNaN(x)) { return d }
                else { return "PC" + (x + 1); }
            });

        // add rows and cells for each data item
        var rows = tbody.selectAll("tr")
            .data(final_table_data)
            .enter()
            .append("tr");
        var cells = rows.selectAll("td")
            .data(function (row) {
                return columns.map(function (column) {
                    return { column: column, value: row[column] };
                });
            }).enter()
            .append("td")
            .text(function (d) { return d.value; });

    });