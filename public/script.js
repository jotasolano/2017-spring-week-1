console.log(d3);

//import data
d3.queue()
	.defer(d3.csv,'./data/hubway_trips_reduced.csv',parseTrips)
	.defer(d3.csv,'./data/hubway_stations.csv',parseStations)
	.await(dataLoaded);

function dataLoaded(err,trips,stations){
	console.log(trips);

	//Some basic data discovery
	//number of trips and number of stations?
	console.log('Number of trips: ' + trips.length);
	console.log('Number of stations: ' + stations.length);

	//Time range of the trips?
	//Hint: use d3.max, d3.min, d3.extent
	var timeRange = d3.extent(trips,function(d){return d.startTime});
	console.log('Trips range from ' + timeRange[0] + ' to ' + timeRange[1]);

	//Average duration of the trips?
	console.log('Average trip duration in seconds: ' + d3.mean(trips,function(d){return d.duration}));

	//Split between trips with registered users and casual users?
	var tripsByUserType = d3.nest()
		.key(function(d){return d.userType})
		.entries(trips);
	console.log(tripsByUserType);

	//How many bikes are in the system? How many trips are taken with each one?
	var bikes = d3.nest()
		.key(function(d){return d.bike_nr})
		.rollup(function(t){
			return t.length
		})
		.entries(trips);
	console.log(bikes);

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