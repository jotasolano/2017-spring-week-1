// console.log(d3);

//import data
//Hint: use d3.queue()

d3.queue()
    .defer(d3.csv, './data/hubway_stations.csv', parseStations)
    .defer(d3.csv, './data/hubway_trips_reduced.csv', parseTrips)
	.await(dataLoaded);


// d3.csv('./data/hubway_stations.csv', parseStations, function(error, arr){
// 	console.log(arr);
// });





function dataLoaded(err,stations,trips){
	//Some basic data discovery
	//number of trips and number of stations?

	d3.selectAll("p").insert("div");
	console.log('Number of trips', trips.length);
	console.log('Number of stations', stations.length);

	//Time range of the trips?
	//Hint: use d3.max, d3.min, d3.extent
	var t0 = d3.min(trips, function(d) { return d.startTime; }),
		t1 = d3.max(trips, function(d) { return d.endTime; });

	console.log('lenght', t0, t1);


	//Average duration of the trips?
	var minDuration = d3.min(trips, function(d) { return d.duration; }),
		maxDuration = d3.max(trips, function(d) { return d.duration; });

	console.log('durations', minDuration, maxDuration);
	console.log('average', d3.mean(trips, function(d) { return d.duration; }));


	//Split between trips with registered users and casual users?
	var tripsByUserType = d3.nest() //---> function
		.key(function(d) { return d.userType; }) //---> STILL a function!
		.entries(trips);

	var registeredTrips = tripsByUserType[0].values.length,
		casualTrips = tripsByUserType[1].values.length;

	console.log(tripsByUserType);

	console.log('Trips of Registered:', registeredTrips);
	console.log('Trips of Casual:', casualTrips);


	//How many bikes are in the system? How many trips are taken with each one?
	var uniqueBikes = d3.nest()
		.key(function(d) { return d.bike_nr; })
		.rollup(function(sublist) { return {
			originalList: sublist,
			totalDuration: d3.sum(sublist, function(d) { return d.duration; })
			};
		})
		.entries(trips);

	console.log('UniqueBikes', uniqueBikes);
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
	};
}

function parseStations(d){
	return {
		id:d.id,
		lngLat:[+d.lng,+d.lat],
		city:d.municipal,
		name:d.station,
		status:d.status,
		terminal:d.terminal
	};
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