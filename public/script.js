console.log(d3);

//Set up a drawing environment
var m = {t:100,r:50,b:100,l:50},
	w = document.getElementById('plot').clientWidth - m.l - m.r,
	h = 2500 - m.t - m.b;
var plot = d3.select(document.getElementById('plot'))
	.append('svg')
	.attr('width', w + m.l + m.r)
	.attr('height', h + m.t + m.b)
	.append('g')
	.attr('class','canvas')
	.attr('transform','translate('+m.l+','+m.t+')');

//Scales etc.
var scaleSize = d3.scaleSqrt().range([0,60]);

//import data
d3.queue()
	.defer(d3.csv,'./data/hubway_trips_reduced.csv',parseTrips)
	.defer(d3.csv,'./data/hubway_stations.csv',parseStations)
	.await(dataLoaded);

function dataLoaded(err,trips,stations){

	//convert stations into a map object
	var stationsMap = d3.map(stations,function(d){return d.id});
	console.log(stationsMap);
	console.log(stationsMap.keys());
	console.log(stationsMap.values());
	console.log(stationsMap.entries());

	//How many trips started from each station?
	var tripsByStart = d3.nest()
		.key(function(d){return d.startStn})
		.rollup(function(trips){return trips.length})
		.entries(trips);

	//How many trips ended at each stations?
	var tripsByEnd = d3.nest()
		.key(function(d){return d.endStn})
		.rollup(function(trips){return trips.length})
		.entries(trips);

	console.log(tripsByStart);
	console.log(tripsByEnd);


	tripsByStart.forEach(function(stn){
		if(stationsMap.get(stn.key)){
			stationsMap.get(stn.key).tripStarts = stn.value;
		}
	});

	tripsByEnd.forEach(function(stn){
		if(stationsMap.get(stn.key)){
			stationsMap.get(stn.key).tripEnds = stn.value;
		}
	});

	//Data discovery
	//Highest number of trips from any stations?
	var tripsMax = d3.max(stationsMap.values(), function(d){return Math.max(d.tripStarts, d.tripEnds)});
	console.log(tripsMax);

	scaleSize.domain([0,tripsMax]);

	draw(stationsMap.values());
}

function draw(stations){
	console.log('draw:start');
	console.log(stations);

	//Sort stations by trip volume
	stations.sort(function(a,b){
		return Math.max(b.tripStarts,b.tripEnds) - Math.max(a.tripStarts,a.tripEnds);
	});

	var nodes = plot.selectAll('.stn')
		.data(stations,function(d){return d.id})
		.enter()
		.append('g').attr('class','stn');

	nodes.append('circle').attr('class','start')
		.attr('r',function(d){return scaleSize(d.tripStarts)})
		.datum(function(d){return d.tripStarts});
	nodes.append('circle').attr('class','end')
		.attr('r',function(d){return scaleSize(d.tripEnds)})
		.datum(function(d){return d.tripEnds});
	nodes.append('text').text(function(d){return d.name})
		.attr('text-anchor','middle')
		.attr('y',function(d){return scaleSize(Math.max(d.tripStarts,d.tripEnds)) + 20});

	//The next part is  to figure out where to position these nodes
	//and for each node, make sure the smaller of the two circles is in front
	var x = 0, y = 80, yPadding = 120, xPadding = 40;

	nodes.each(function(d){
		var r = scaleSize(Math.max(d.tripStarts,d.tripEnds));
		x += r;

		d3.select(this)
			.attr('transform','translate('+x+','+y+')')
			//find the smaller of the two elements
			.selectAll('circle')
			.sort(function(a,b){
				return b-a;
			})

		x += (r + xPadding);
		if(x + 60 > w){
			x=0;
			y+=yPadding;
		}
	});

}

function parseTrips(d){
	return {
		bike_nr:d.bike_nr,
		duration:+d.duration,
		startStn:d.strt_statn,
		startTime:parseTime(d.start_date),
		endStn:d.end_statn,
		endTime:parseTime(d.end_date),
		userType:d.subsc_type,
		userGender:d.gender?d.gender:undefined,
		userBirthdate:d.birth_date?+d.birth_date:undefined
	}
}

function parseStations(d){
	return {
		id:d.id,
		lngLat:[+d.lng,+d.lat],
		city:d.municipal,
		name:d.station,
		status:d.status,
		terminal:d.terminal
	}
}

function parseTime(timeStr){
	var time = timeStr.split(' ')[1].split(':'),
		hour = +time[0],
		min = +time[1],
		sec = +time[2];

	var	date = timeStr.split(' ')[0].split('/'),
		year = date[2],
		month = date[0],
		day = date[1];

	return new Date(year,month-1,day,hour,min,sec);
}