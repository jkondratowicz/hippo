var palette = ["#ff5252","#d50000","#ff4081","#c51162","#e040fb","#aa00ff","#7c4dff","#6200ea","#536dfe","#304ffe","#448aff","#2962ff","#0091ea","#388e3c","#1b5e20","#689f38","#33691e","#827717","#ef6c00","#e65100","#ff3d00","#dd2c00","#5d4037","#616161","#607d8b","#455a64","#263238"];
var markerTemplate = "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2238%22%20height%3D%2238%22%20viewBox%3D%220%200%2038%2038%22%3E%3Cpath%20fill%3D%22{{FILL}}%22%20stroke%3D%22%23ccc%22%20stroke-width%3D%22.5%22%20d%3D%22M34.305%2016.234c0%208.83-15.148%2019.158-15.148%2019.158S3.507%2025.065%203.507%2016.1c0-8.505%206.894-14.304%2015.4-14.304%208.504%200%2015.398%205.933%2015.398%2014.438z%22%2F%3E%3Ctext%20transform%3D%22translate%2819%2018.5%29%22%20fill%3D%22%23fff%22%20style%3D%22font-family%3A%20Arial%2C%20sans-serif%3Bfont-weight%3Abold%3Btext-align%3Acenter%3B%22%20font-size%3D%2212%22%20text-anchor%3D%22middle%22%3E{{LABEL}}%3C%2Ftext%3E%3C%2Fsvg%3E";

var labelColors = [];
function getMarkerColor(label) {
	var idx = labelColors.indexOf(label);
	if(idx < 0) {
		labelColors.push(label);
		return palette[(labelColors.length - 1)%palette.length];
	} else {
		return palette[idx%palette.length];
	}
}
function getIcon(label) {
	return markerTemplate.replace("{{FILL}}", getMarkerColor(label)).replace("{{LABEL}}",label);
}

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
		icon: getIcon(label),
		title: label
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
		zoom: 13,
		disableDefaultUI: true
	});

	$(".btn-fetch").click();
});