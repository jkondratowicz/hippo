function hideSpinner() {
	$("div.spinner").hide();
}
function showSpinner() {
	$("div.spinner").show();
}
function placeMarkers(results) {
	results.result.filter(function(row) {
		if(row.Status !== "RUNNING") {
			console.log("Discarded non-running", row);
			return false;
		}

		if(moment().diff(moment(row.Time), "minutes") > 5) {
			console.log("Discarded old", row);
			//return false;
		}

		return true;
	}).forEach(function(row) {
		addMarker({ lat: row.Lat, lng: row.Lon }, row.FirstLine);
	});
}
function addMarker(location, label) {
	var marker = new google.maps.Marker({
		position: location,
		map: map,
		label: label
	});
	markers.push(marker);
}
function deleteAllMarkers() {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	markers = [];
}


var map = null;
var markers = [];

$(function() {
	hideSpinner();

	$(".btn-fetch").click(function(e) {
		e.preventDefault();
		showSpinner();
		deleteAllMarkers();

		$.ajax({
			method: 'GET',
			url: 'data.json',
			success: function(data) {
				placeMarkers(data);
			},
			complete: function() {
				hideSpinner();
			}
		});
	});
	
	map = new google.maps.Map($(".content")[0], {
		center: {
			lat: 52.2222655, lng: 21.0135581
		},
		zoom: 13
	});
});