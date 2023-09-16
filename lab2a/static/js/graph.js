// Function to Update Graph / Plot 
function UpdateGraph(){

    // Remove Exisiting Plot on Canvas
    d3.select('#plot').selectAll("*").remove();

    // List of all available attributes
    const cols = ['state','county','total_population',
    'percent_homeowners','percent_below_poverty',
    'percent_fair_or_poor_health','percent_frequent_physical_distress',
    'percent_adults_with_obesity','percent_frequent_mental_distress',
    'percent_minorities','percent_insufficient_sleep','per_capita_income',
    'percent_below_poverty','percent_unemployed_CDC',
    'percent_excessive_drinking_cat','population_density_per_sqmi_cat'];

    // List of all categorical attributes
    const cat = ['state', 'percent_excessive_drinking_cat',
     'population_density_per_sqmi_cat'];

    // List of all numerical attributes
    const num = ['total_population',
    'percent_homeowners','percent_below_poverty',
    'percent_fair_or_poor_health','percent_frequent_physical_distress',
    'percent_adults_with_obesity','percent_frequent_mental_distress',
    'percent_minorities','percent_insufficient_sleep','per_capita_income',
    'percent_below_poverty','percent_unemployed_CDC'];

    // Labels corresponding to attributies in csv
    var lables = {
        'state': 'State','county':'County','total_population':'Total Population',
    'percent_homeowners':'Percent Homeowners',
    'percent_below_poverty':'Percent Below Poverty',
    'percent_fair_or_poor_health':'Percent Poor Health',
    'percent_frequent_physical_distress':'Percent Frequent Physical Distress',
    'percent_adults_with_obesity':'Percent Adults With Obesity',
    'percent_frequent_mental_distress':'Percent Frequent Mental Distress',
    'percent_minorities':'Percent Minorities',
    'percent_insufficient_sleep':'Percent Insufficient Sleep',
    'per_capita_income':'Per Capita Income',
    'percent_below_poverty':'Percent Below Poverty Line',
    'percent_unemployed_CDC':'Percent Unemployed',
    'percent_excessive_drinking_cat':'Excessive Drinking in Adults',
    'population_density_per_sqmi_cat':'Population Density'
    }

    
    // Initializations
    var width = 1000;
    var height = 700;
    var left_padding = 250;
    var top_padding = 75;
    var graphName; 

    // Getting the selected attribute
    var attribute = document.getElementById("list").value;
    // console.log(document.getElementById("list").value);

    // Select the selected orientation
    var toggle_value = document.getElementsByName("toggle");
    var selected_toggle;
    for(let i=0; i<toggle_value.length; i++) {
        if(toggle_value[i].checked){
            selected_toggle = toggle_value[i].value;
        }
    }
    // console.log(selected_toggle);

    // Conditions to select graph
    if(cat.includes(attribute) && selected_toggle == 'side'){

        graphName = 'Bar_side';
        
    }else if(cat.includes(attribute) && selected_toggle == 'up'){
        //We can make histogram upright and sideways 
        graphName = 'Bar'; 
        
    }else if(num.includes(attribute) && selected_toggle == 'side'){
        //We can make histogram upright and sideways 
        graphName = 'Histogram_side'; 
        
    }else if(num.includes(attribute) && selected_toggle == 'up'){
        //We can make histogram upright and sideways 
        graphName = 'Histogram'; 
        
    }




if (graphName == 'Bar_side'){

    // BAR GRAPH  (Sideways Oriented)  
    d3.csv('../final.csv', function(data){

    //console.log(data);
    var attri = attribute
    var data = data.map(function(d) { return d[attri] });

    var counts = {};
    //console.log(data);

    //Counting Frequency
    data.forEach(function(d) {
        if (!counts[d]) {
            counts[d] = 0;
        }
        counts[d]++;
        });

    var keys = Object.keys(counts);
    var values = Object.values(counts);
    
    data_list = [];

    for (var i = 0; i < keys.length; i++) {
        data_list.push(
            {'key': keys[i],
            'value': values[i]}
        );

    };


    //console.log(counts);
    //console.log(data_list);
    //console.log(keys); 
    //console.log(values);

    
    max_val = Math.max.apply(Math, values);

    
    //d3.select("dot").remove();
   
    // Scaling values
    var widthScale = d3.scaleLinear()
                    .domain([0, max_val+1])
                    .range([0, width-left_padding]);

    var heightScale = d3.scaleBand()
                    .domain(keys)
                    .range([0, height-top_padding]);

    var color = d3.scaleLinear()
                   .domain([0, max_val+1])
                   .range(['red', 'blue']);
                

    var x_axis = d3.axisBottom().scale(widthScale);
    var y_axis = d3.axisLeft().scale(heightScale);

    //console.log(data.map(function(d) { return d.state; }));

    // Canvas to display graph
    var canvas = d3.select("#plot")
                    .append("svg")
                    .attr("width", width + left_padding)
                    .attr("height", height + top_padding)
                    .append('g')
                    .attr('transform', 'translate('+left_padding+','+50+')');

    var t = lables[attri];
    canvas.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (top_padding / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "18px") 
        .style("text-decoration", "underline")  
        .text(t + " "+" v/s Frequency Sidewards Bar Graph");

    // Plotting the bars
    var bars = canvas.selectAll("rect")
                .data(data_list)
                .enter()
                .append("rect")
                .attr("x", 0)
                .attr("y", function(d){return heightScale(d.key);}) 

                .attr("height",heightScale.bandwidth()*0.8) 
                .attr("width", function(d){return widthScale(d.value);}) //length of bars
                .attr("fill", function(d){return color(d.value);})
    // X axis added
    canvas.append('g')
        .attr('transform', 'translate(0,' +  (height - top_padding) + ')')
        .call(x_axis); 
    canvas.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", width/2)
    .attr("y", height - 20)
    .text("Frequency");

    // Y axis added
    canvas.append('g')
        .call(y_axis); 

    canvas.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("x", -height/2)
    .attr("y", -120)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text(lables[attri]);
});
    
}
    
else if (graphName == 'Bar')
{

// BAR GRAPH  (Upwards Oriented)  
d3.csv('../final.csv', function(data){

var attri = attribute  
var data = data.map(function(d) { return d[attri] });
var counts = {};
//console.log(data);

//Counting Frequency
data.forEach(function(d) {
    if (!counts[d]) {
        counts[d] = 0;
    }
    counts[d]++;
    });
var keys = Object.keys(counts);
var values = Object.values(counts);

data_list = [];

for (var i = 0; i < keys.length; i++) {
    data_list.push(
        {'key': keys[i],
        'value': values[i]}
    );


};


//console.log(counts);
//console.log(data_list);
//console.log(keys); 
//console.log(values);


max_val = Math.max.apply(Math, values);

// Scaling values
var widthScale = d3.scaleBand()
                .domain(keys)
                .range([0, width-left_padding]);

var heightScale = d3.scaleLinear()
                .domain([0, max_val+1])
                .range([height-top_padding, 0]);

var color = d3.scaleLinear()
               .domain([0, max_val+1])
               .range(['red', 'blue']);
            
// x and y axis
var x_axis = d3.axisBottom().scale(widthScale);
var y_axis = d3.axisLeft().scale(heightScale);

// Canvas to display graph
var canvas = d3.select("#plot")
                .append("svg")
                .attr("width",  width + left_padding)
                .attr("height", height +  top_padding)
                .append('g')
                .attr('transform', 'translate('+left_padding+','+50+')');

 // Plotting the bars
var bars = canvas.selectAll("rect")
            .data(data_list)
            .enter()
            .append("rect")
            .attr("x", function(d){return widthScale(d.key);}) //function(d, i) { return i*5;}
            .attr("y", function(d){return heightScale(d.value);})
            .attr("width", widthScale.bandwidth()*0.8) //(height-0.3*height)/values.length
            .attr("height", function(d){return  height- top_padding - heightScale(d.value);}) //length of bars
            .attr("fill", function(d){return color(d.value);})

// Labeling the graph and axis
var t = lables[attri];
canvas.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (top_padding / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "18px") 
        .style("text-decoration", "underline")  
        .text(t + " "+" v/s Frequency Bar Graph");

canvas.append('g')
    .attr('transform', 'translate(0,' +  (height - top_padding  ) + ')')
    .call(x_axis)
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end"); 

canvas.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", width/2)
    .attr("y", height + 15 )
    .text(lables[attri]);

canvas.append('g')
    .call(y_axis); 

canvas.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("x", -height/2)
    .attr("y", -60)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Frequency");
    });

} 

else if (graphName == 'Histogram') {
// Histogram  (Upwards Oriented)  
d3.csv('../final.csv', function(data){

var attri = attribute 
var pop_arr = data.map(function(d) { return d[attri] });

const max_val = Math.max.apply(Math, pop_arr);
const min_val = Math.min.apply(Math, pop_arr);

//console.log(max_val); 
//console.log(min_val);

// Scaling values
var widthScale = d3.scaleLinear()
                .domain([0, max_val+10])
                .range([0, width]);


var x_axis = d3.axisBottom().scale(widthScale);

var color = d3.scaleLinear()
               .domain([0, max_val+20])
               .range(['red', 'green']);
            
// Canvas for plotting
var canvas = d3.select("#plot")
                .append("svg")
                .attr("width", width+left_padding)
                .attr("height", height+top_padding)
                .append('g')
                .attr('transform', 'translate('+left_padding+','+20+')');

var t = lables[attri];
canvas.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0)
        .attr("text-anchor", "middle")  
        .style("font-size", "18px") 
        .style("text-decoration", "underline")  
        .text(t + " "+" v/s Frequency Histogram");
    
var histogram = d3.histogram()
  .value(function(d) { return d[attri]; }) 
  .domain(widthScale.domain()) 
  .thresholds(widthScale.ticks(10)); // 10 bins (527 records)


//console.log(histogram(data));

// Getting the bins
var bins = histogram(data);
var max_bin = d3.max(bins, function(d) { return d.length; })

//console.log(max_bins);
//console.log(bins);

var heightScale = d3.scaleLinear()
                    .range([height, 0])
                    .domain([0, max_bin+5]); 


var y_axis = d3.axisLeft().scale(heightScale);

// x0 -> lower bound 
// x1 -> upper bound 
// x1 - x0 --> bin size
// length -> frequency of each bin

// Plotting bars
var bars = canvas.selectAll("rect")
            .data(bins)
            .enter()
                .append("rect")
                .attr("height", function(d) {return height -  heightScale(d.length) ;})
                .attr("width", function(d) { return widthScale(d.x1) - widthScale(d.x0) ;})
                .attr("x", function(d, i) { return i * (widthScale(d.x1) - widthScale(d.x0))})
                .attr("y", function(d, i) { return  (heightScale(d.length))})
                .attr("fill", function(d){return color(d.length);})

canvas.append('g')
      .attr('transform', 'translate(0,' +  (height  ) + ')')
      .call(x_axis);
canvas.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", width/2)
    .attr("y", height +40 )
    .text(t+" "+ "Range");

canvas.append('g')
      .call(y_axis);
canvas.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("x", -height/2)
    .attr("y", -80)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Frequency");                
    });


}  

else if (graphName == 'Histogram_side') {

// Histogram  (Sideways Oriented) 
d3.csv('../final.csv', function(data){

var attri = attribute// "percent_frequent_physical_distress" //percent_homeowners
var pop_arr = data.map(function(d) { return d[attri] });

var max_val = Math.max.apply(Math, pop_arr);
var min_val = Math.min.apply(Math, pop_arr);

//console.log(max_val); 
//console.log(min_val);

// Sacling 
var heightScale = d3.scaleLinear()
                .domain([0, max_val+10])
                .range([height, 0]);

var y_axis = d3.axisLeft().scale(heightScale);

var color = d3.scaleLinear()
               .domain([0, max_val+20])
               .range(['green', 'orange']);

// Canvas for plotting
var canvas = d3.select("#plot")
                .append("svg")
                .attr("width", width+left_padding)
                .attr("height", height+top_padding)
                .append('g')
                .attr('transform', 'translate('+left_padding+','+20+')');

var t = lables[attri];
canvas.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0)
        .attr("text-anchor", "middle")  
        .style("font-size", "18px") 
        .style("text-decoration", "underline")  
        .text(t + " "+" v/s Frequency Side Histogram");

     
var histogram = d3.histogram()
  .value(function(d) { return d[attri]; })   
  .domain(heightScale.domain())  
  .thresholds(heightScale.ticks(10)); 


// Getting Bins
var bins = histogram(data);
var max_val = d3.max(bins, function(d) { return d.length; })

//console.log(bins);
//console.log( d3.max(bins, function(d) { return d.length; }));


var widthScale = d3.scaleLinear()
                    .range([0, width])
                    .domain([0, max_val+10]); 
var x_axis = d3.axisBottom().scale(widthScale);


// x0 -> lower bound 
// x1 -> upper bound 
// x1 - x0 --> bin size
// length -> frequency of each bin

// Plotting bars
var bars = canvas.selectAll("rect")
            .data(bins)
            .enter()
                .append("rect")
                .attr("width", function(d) {return widthScale(d.length) ;})
                .attr("height", function(d) { return heightScale(d.x0) - heightScale(d.x1) ;})
                .attr("x", 0)
                .attr("y", function(d, i) { return height - i * (heightScale(d.x0) - heightScale(d.x1));})
                .attr("transform", function(d) { return "translate(" + 0 + "," + - (heightScale(d.x0) - heightScale(d.x1)) + ")"; })
                .attr("fill", function(d){return color(d.length);})

canvas.append('g')
      .attr('transform', 'translate(0,' +  (height) + ')')
      .call(x_axis);
canvas.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", width/2)
        .attr("y", height +50 )
        .text("Frequency");

canvas.append('g')
      .call(y_axis);
canvas.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("x", -height/2)
        .attr("y", -80)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text(t+" "+ "Range");  
                 
    });
}

}