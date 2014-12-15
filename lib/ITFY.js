"use strict";

// Global Variables
// URL for commit
var eclipseCommitUrl = "http://git.eclipse.org/c/tracecompass/org.eclipse.tracecompass.git/commit/?id="


function createGraph(node, isSummary ) {
	var fileName = 'data/' + node.file + '.json';
	var typechart = "";
	d3.json(fileName, function(data) {
		nv.addGraph(function() {
			var chart;
			if (isSummary == 1) {
				chart = nv.models.cumulativeLineChart()
				.interpolation("basis")
				.x(function(d) { return d.x})
				.y(function(d) { return d.y / 100})
				.showControls(false);
			} else {
				chart = nv.models.lineChart()
				.interpolation("basis")
				.x(function(d) { return d.x })
				.y(function(d) { return d.y })
				.showLegend(false)
			}

			//Color for chart
			chart.color(d3.scale.category10().range());
			chart.showControls = false;

			// Information for each node
			chart.tooltipContent(function(key, x, y, e, graph) {
				var basicInfo = '<h3>' + key + '</h3>' +
					'<p style="text-align:left">'
					+ 'Date: ' + x
					+ '<br>'
					+'Value: ' +  y;
				// generate extra info
				for (var name in e.point.label) {
					basicInfo = basicInfo + "<br>" + name + ": ";
					// Special case for commit
					if (name == "commit") {
						basicInfo = basicInfo
						+ '<a href="' + eclipseCommitUrl + e.point.label[name]+ '">' + e.point.label[name] + '</a>' ;

					} else {
						basicInfo = basicInfo + e.point.label[name];
					}
				};

				basicInfo = basicInfo + '</p>';
				return basicInfo;
			});
			//X axis
			chart.xAxis.tickValues(
				[ 1078030800000, 1122782400000, 1167541200000,
				1251691200000 ]).tickFormat(function(d) {
					return d3.time.format('%x')(new Date(d))
				})
			.axisLabel('Date');

			if (isSummary == 1) {
				chart.yAxis.tickFormat(d3.format(',.1%'));
			}

			// Y axis
			var label = node.dimension;
			if (node.unit.length != 0 ) {
				label = label + " (" + node.unit +")";
			}
			chart.yAxis.axisLabel(label)
			.axisLabelDistance(30);


		d3.select('#chart' + node.file + ' svg').datum(data).call(
				chart);

		nv.utils.windowResize(chart.update);

		return chart;
		});
	});
}

function createCharts() {
	ITFY.startup();

	// Recuperate the summaries
	var summaries_container = d3.select("#summary-graph-container");
	for (var id in MetaData.overviews) {
			var data = MetaData.overviews[id];
			var osjvmid = data.os.replace(/\W/g, '') + data.jvm.replace(/\W/g, '');
			var row = summaries_container.append("div").attr("class", "graph-row");
			var containerElement = row.append("div").attr("class", "osjvm " + osjvmid).append("div");
			containerElement.attr("class", "graph-container");
			//Title
			containerElement.append("div")
				.attr("class", "title" )
				.attr("id", "title" + data.file)
				.html(data.title);
			//Subtitle
			containerElement.append("div")
				.html("OS: " + data.os + " JVM:" +data.jvm );
			var chartElement = containerElement.append("div");
			chartElement.attr("id","chart" + data.file );
			chartElement.attr("class","graph");
			chartElement.append("svg");
			chartElement.append("br");
			createGraph(data, 1);
	};

	//Recup the application component with their test arrays
	var appcomps = [];
	for (var id in MetaData.applicationComponents) {
		appcomps.push([MetaData.applicationComponents[id].name, MetaData.applicationComponents[id]])
	};

	appcomps.sort(function (a, b) {
		return a[1].sort_order - b[1].sort_order;
	});

	//Build the div structure
	var scenarios = d3.select("#scenarios");
	for (var i = 0; i < appcomps.length; i++) {
		var name = appcomps[i][0];
		var appcomp = appcomps[i][1];
		//Create Div container for an appcomp
		var appcompContainer = scenarios.append("div")
			.attr("class", "appCompContainer ")
			.attr("id", "appComp" + name );

		//Append the Title of the section
		appcompContainer.append("div")
			.attr("class", "titlebig")
			.html("Application Component:" + appcomp.name);
		appcompContainer.append("div")
			.attr("class", "notice")
			.html("If no indication: LOWER is better");
		appcompContainer.append("br");

		for (var j = 0; j < appcomp.tests.length; j++) {
			var data = appcomp.tests[j];
			var osjvmid = data.os.replace(/\W/g, '') + data.jvm.replace(/\W/g, '');
			var row = appcompContainer.append("div").attr("class", "graph-row");
			var containerElement = row.append("div").attr("class", "osjvm " + osjvmid).append("div");
			containerElement.attr("class", "graph-container");
			//Title
			containerElement.append("div")
				.attr("class", "title" )
				.attr("id", "title" + data.file)
				.html(data.title);
			//Subtitle
			containerElement.append("div")
				.html("OS: " + data.os + " JVM:" +data.jvm );
			var chartElement = containerElement.append("div");
			chartElement.attr("id","chart" + data.file );
			chartElement.attr("class","graph");
			chartElement.append("svg");
			chartElement.append("br");
			createGraph(data);
		};
	};

	var app = document.getElementsByClassName('appCompContainer');
	for(var i = 0; i < app.length; i++) {
		app[i].style.display = "none";
	}
}

//Namespacing
var ITFY = { };

ITFY.updateOsJvmList = function () {
	var menu = $('#osjvmlist');
	menu.empty();

	//All element
	var li = $('<li></li>');
	var all = $('<a href="#" id="osjvm' + all + '"></a>');
	all.click((function () {
		return (function(event) {
			$('#osjvmlist .clicked').removeClass('clicked');
			$(event.target).addClass('clicked');

			var graphs = $(".osjvm");
			graphs.css("display", "inline");
			jQuery(window).trigger('resize');
			return false;
		}).bind(this);
	}).bind(this)());

	all.html("All");
	all.appendTo(li);
	li.appendTo(menu);

	//Dynamic element
	for (var id in MetaData.osjvm) {
		var os  = MetaData.osjvm[id];
		var li = $('<li></li>');
		var a = $('<a href="#" id="osjvm' + id + '"></a>');
		var osjvmid = os.os.replace(/\W/g, '') + os.jvm.replace(/\W/g, '');
		a.click((function (osjvmid) {
			return (function(event) {
				$('#osjvmlist .clicked').removeClass('clicked');
				$(event.target).addClass('clicked');

				var graph = $(".osjvm");
				for(var i = 0; i < graph.length; i++) {
					if ($(graph[i]).hasClass(osjvmid)) {
						graph[i].style.display = "inline"
					}else{
						graph[i].style.display = "none"
					}
				}
				jQuery(window).trigger('resize');
				//TODO: show good graphic via the test element from appcomp
				//this.showBreakdown(name);
				//this.pushState();
				return false;
			}).bind(this);
		}).bind(this)(osjvmid));
		a.html(os.description);
		a.appendTo(li);
		li.appendTo(menu);
	}



}

ITFY.updateAppCompList = function (machineId) {
	var menu = $('#appcomplist');
	menu.empty();

	var appcomps = [];

	for (var id in MetaData.applicationComponents) {
		appcomps.push([MetaData.applicationComponents[id].name, MetaData.applicationComponents[id]])
	};

	appcomps.sort(function (a, b) {
		return a[1].sort_order - b[1].sort_order;
	});

	for (var i = 0; i < appcomps.length; i++) {
		var name = appcomps[i][0];
		var appcomp = appcomps[i][1];
		var li = $('<li></li>');
		var a = $('<a href="#" id="appcomp-' + name + '"></a>');
		a.click((function (name) {
			return (function(event) {
				$('#appcomplist .clicked').removeClass('clicked');
				$(event.target).addClass('clicked');
				var appcomp = document.getElementsByClassName('appCompContainer');
				for(var i = 0; i < appcomp.length; i++) {
					if (appcomp[i].id != "appComp" + name) {
						appcomp[i].style.display = "none";
					}else{
						appcomp[i].style.display = "inline";
					}
				}
				$(".summary-graph-container").css("display", "none");
				jQuery(window).trigger('resize');
				return false;
			}).bind(this);
		}).bind(this)(name));
		a.html(appcomp.name);
		a.appendTo(li);
		li.appendTo(menu);
	}
}

ITFY.startup = function () {
	// Add machine information to the menu.
	var menu = $('#osjvmlist');
	this.updateOsJvmList();

	// Hide it by default.
	$('#osjvmdrop').click((function (event) {
		if (!menu.is(':visible') && !$('#about').is(':visible')) {
			menu.show();
		} else {
			menu.hide();
		}
		return false;
	}).bind(this));
	menu.hide();

	// Add suite information to menu
	var breakdown = $('#appcomplist');
	this.updateAppCompList();

	// Hide it by default.
	$('#appcompdrop').click((function (event) {
		if (!breakdown.is(':visible') && !$('#about').is(':visible')) {
			breakdown.show();
		} else {
			breakdown.hide();
		}
		return false;
	}).bind(this));
	breakdown.hide();

	// Add summary interaction
	var summaryButton = $("#summarybutton");
	summaryButton.click((function () {
		return (function(event) {
			// Clear clicked list appcomp
			$('#appcomplist .clicked').removeClass('clicked');

			// Show summary and hide appcomp
			$(".summary-graph-container").css("display", "inline-block");
			$(".appCompContainer").css("display", "none");
			jQuery(window).trigger('resize');

			return false;
		}).bind(this);
	}).bind(this)());



}
