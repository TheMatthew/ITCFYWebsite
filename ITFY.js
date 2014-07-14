"use strict";
function createGraph(chartName) {
	var fileName = chartName + '.json';
		d3.json(fileName, function(error, data) {
			nv.addGraph(function() {
				var chart = nv.models.cumulativeLineChart().x(function(d) {
					return d[0]
				}).y(function(d) {
					return d[1] / 100
				}) //adjusting, 100% is 1.00, not 100 as it is in the data
				.color(d3.scale.category10().range()).useInteractiveGuideline(
					true).showLegend(false);

				chart.xAxis.tickValues(
					[ 1078030800000, 1122782400000, 1167541200000,
					1251691200000 ]).tickFormat(function(d) {
						return d3.time.format('%x')(new Date(d))
					});

				chart.yAxis.tickFormat(d3.format(',.1%'));

				d3.select('#chart' + chartName + ' svg').datum(data).call(
					chart);

				//TODO: Figure out a good way to do this automatically
				nv.utils.windowResize(chart.update);

				return chart;
			});
		});
}

function createCharts() {
	ITFY.startup();

	createGraph("chart_overview");

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
			.attr("class", "appCompContainer")
			.attr("id", "appComp" + name );

		//Append the Title of the section
		appcompContainer.append("div")
			.attr("class", "title" )
			.html(appcomp.name);

		for (var j = 0; j < appcomp.tests.length; j++) {
			var data = appcomp.tests[j];
			var row = appcompContainer.append("div").attr("class", "graph-row");
			var containerElement = row.append("div");
			containerElement.attr("class", "graph-container");
			containerElement.append("div")
				.attr("class", "title" )
				.attr("id", "title" +data)
				.html(data);
			var chartElement = containerElement.append("div");
			chartElement.attr("id","chart" + data );
			chartElement.attr("class","graph");
			chartElement.append("svg");
			createGraph(data);
			console.log(data);
		};
	};

	var app = document.getElementsByClassName('appCompContainer');
	for(var i = 0; i < app.length; i++) {
		app[i].style.display = "none";
	}

	//for (var i = 0; i < 15; i++) {
	//	var row = scenarios.append("div").attr("class", "graph-row");
	//	var containerElement = row.append("div");
	//	containerElement.attr("class", "graph-container");
	//	containerElement.append("div")
	//		.attr("class", "title" )
	//		.attr("id", "title" + i);
	//	var chartElement = containerElement.append("div");
	//	chartElement.attr("id","chart" + i);
	//	chartElement.attr("class","graph");
	//	chartElement.append("svg");
	//	createGraph(i, "chart");
	//}

}

//Namespacing
var ITFY = { };

ITFY.updateOsJvmList = function () {
	var menu = $('#osjvmlist');
	menu.empty();
	for (var id in MetaData.osjvm) {
		var os  = MetaData.osjvm[id];
		var li = $('<li></li>');
		var a = $('<a href="#" id="osjvm' + id + '"></a>');
		//There is no binding yet on Os/jvm but this execute on click
		//a.click((function (id) {
		//	return (function (event) {
		//	}).bind(this);
		//}).bind(this)(id));
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
	console.log(appcomps);

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
				jQuery(window).trigger('resize');
				//TODO: show good graphic via the test element from appcomp
				//this.showBreakdown(name);
				//this.pushState();
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

}
