/* Thanks to https://blog.microdreamit.com/2018/06/01/use-snazzy-style-maps-by-google-api/  for getting this to work with async defer */
/* Vintage Old Golden Brown Style from: https://snazzymaps.com/style/126378/vintage-old-golden-brown */
var map;
var markers = [];
var placeMarkers = [];
var polygon = null;
var area = "";

function initMap() { 
			
	map = new google.maps.Map(document.getElementById('map'), {
		center: { lat: 40.7413549, lng: -73.9980244 },
		zoom: 13,
		mapTypeControl: false,
		styles: [{"featureType":"all","elementType":"all","stylers":[{"color":"#ff7000"},{"lightness":"69"},{"saturation":"100"},{"weight":"1.17"},{"gamma":"2.04"}]},{"featureType":"all","elementType":"geometry","stylers":[{"color":"#cb8536"}]},{"featureType":"all","elementType":"labels","stylers":[{"color":"#ffb471"},{"lightness":"66"},{"saturation":"100"}]},{"featureType":"all","elementType":"labels.text.fill","stylers":[{"gamma":0.01},{"lightness":20}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"saturation":-31},{"lightness":-33},{"weight":2},{"gamma":0.8}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"landscape","elementType":"all","stylers":[{"lightness":"-8"},{"gamma":"0.98"},{"weight":"2.45"},{"saturation":"26"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"lightness":30},{"saturation":30}]},{"featureType":"poi","elementType":"geometry","stylers":[{"saturation":20}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"lightness":20},{"saturation":-20}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":10},{"saturation":-30}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"saturation":25},{"lightness":25}]},{"featureType":"water","elementType":"all","stylers":[{"lightness":-20},{"color":"#ecc080"}]}]
	});

	var timeAutoComplete = new google.maps.places.Autocomplete(document.getElementById('search-within-time-text'));
	
  var zoomAutoComplete = new google.maps.places.Autocomplete(document.getElementById('zoom-to-area-text'));
	
  zoomAutoComplete.bindTo('bounds', map);
	
  var searchBox = new google.maps.places.SearchBox(document.getElementById('places-search'));
	
  searchBox.setBounds(map.getBounds());
	
  var locations = [
    		{title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
    		{title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
    		{title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
    		{title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
    		{title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
    		{title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
   		];

  var popUpWindow = new google.maps.InfoWindow();
  var defaultIcon = makeMarkerIcon('e2d2a3');
  var highlightedIcon = makeMarkerIcon('f4803d');
  var dwgMgr = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_LEFT,
          drawingModes: [google.maps.drawing.OverlayType.POLYGON]
        }
      });

 	for (var i = 0; i < locations.length; i++){
   	var posit = locations[i].location;
    var title = locations[i].title;
    var marker = new google.maps.Marker({
  	  		position: posit,
     			title: title,
     			animation: google.maps.Animation.DROP,
     			id: i,
     			icon: defaultIcon
     		});

    markers.push(marker);
    
    marker.addListener('click', function(){
      populateInfoWindow(this, popUpWindow);
    });

    marker.addListener('mouseover', function(){
      this.setIcon(highlightedIcon);
    });

    marker.addListener('mouseout', function(){
    	this.setIcon(defaultIcon);
    })

		//console.log('listener added for ' + marker.title)
  }
  //console.log(markers)
  
  document.getElementById('show-listings').addEventListener('click', showListings);
  document.getElementById('hide-listings').addEventListener('click', function(){hideListings(markers)});
  document.getElementById('toggle-drawing').addEventListener('click', function(){
    toggleDrawing(dwgMgr);
  });
  document.getElementById('zoom-to-area').addEventListener('click', function(){
   	zoomToArea();
  });
  document.getElementById('search-within-time').addEventListener('click', function(){
   	searchWithinTime();
  });
  searchBox.addListener('places_changed', function(){
   	searchBoxPlaces(this);
  });
  document.getElementById('go-places').addEventListener('click', textSearchPlaces);
    dwgMgr.addListener('overlaycomplete', function(event){
      if (polygon) {
        polygon.setMap(null);
        hideListings(markers);
      }
      dwgMgr.setDrawingMode(null);
      polygon = event.overlay;
      polygon.setEditable(true);
      searchWithinPolygon();
      polygon.getPath().addListener('set_at', searchWithinPolygon);
      polygon.getPath().addListener('insert_at', searchWithinPolygon);
   });
}

function populateInfoWindow(marker, popUpWindow){
	console.log("display infowindow for " + marker.title);
	if (popUpWindow.marker != marker) {
		popUpWindow.setContent('');
		popUpWindow.marker = marker;
		//popUpWindow.setContent('<div>'+marker.title+' - '+ marker.position + '</div>');
		//popUpWindow.open(map, marker);
		popUpWindow.addListener('closeclick', function(){
			popUpWindow.marker = null;
		});

		var streetViewSvc = new google.maps.StreetViewService();
		var radius = 50;

		function getStreetView(data, status) {
			//If status is ok (pano found), compute poisition of image, heading, and set options
      //console.log("DATA: " + data);
      //console.log("STATUS: " + status);
			if (status == google.maps.StreetViewStatus.OK){
				var nearStreetViewLocn = data.location.latLng;
				var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocn, marker.position);
        popUpWindow.setContent('<div id="popUp">' + marker.title + ' / ' + marker.position + '</div><div id="pano"></div>');
     	  var panoramaOptions = {
  		    position: nearStreetViewLocn,
  		    pov: {
  		     	heading: heading,
  		     	pitch: 30
  	     	}
     	  };
    	  var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
  		} else {
  		  popUpWindow.setContent('<div>' + marker.title + '</div>' +'<div>No Street View Found</div>');
  		}
  	}    
  		streetViewSvc.getPanoramaByLocation(marker.position, radius, getStreetView); 
  		popUpWindow.open(map, marker);  			
	}
}

function showListings() {
	var bounds = new google.maps.LatLngBounds();
	
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  	bounds.extend(markers[i].position);
	};

  map.fitBounds(bounds);	
}

function hideMarkers(markers) {
  for (var i = 0; i < markers.length; i++) {
  	markers[i].setMap(null);
  }
}

function clicked(){
	console.log('clicked!');
}

function makeMarkerIcon(markerColor){
	var markerImage = new google.maps.MarkerImage(
		'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor + '|40|_|%E2%80%A2',
		new google.maps.Size(21,34),
		new google.maps.Point(0,0),
		new google.maps.Point(10,34),
		new google.maps.Size(21,34));
		return markerImage;
}	

function toggleDrawing(dwgMgr){
  if (dwgMgr.map){
    dwgMgr.setMap(null);
    if (polygon !== null) {
      polygon.setMap(null);
      updateOptions(null);
    }
  } else {
    dwgMgr.setMap(map);
  }
}

function searchWithinPolygon(){
  for (var i = 0; i < markers.length; i++){
    if(polygon !== null){
      area = retrieveArea(polygon);
      updateOptions(area);
    }
    if (google.maps.geometry.poly.containsLocation(markers[i].position, polygon)){
      markers[i].setMap(map);
    } else {
      markers[i].setMap(null);
    }
  }
}

function retrieveArea(polygon){
  if(polygon === null){
    area = '';
  } else {
    var area = google.maps.geometry.spherical.computeArea(polygon.getPath());
    return area;
  }
}

function updateOptions(area){
	if(area != null){
		document.getElementById('area').innerHTML = area + " M^2";
 	} else {
 		document.getElementById('area').innerHTML = "";
 	}
}

function zoomToArea(){
 	var geocoder = new google.maps.Geocoder();
 	var address = document.getElementById('zoom-to-area-text').value;
 	
  if (address == '') {
 		window.alert('Please enter an area or address!');
 	} else {
 		geocoder.geocode({
   		address: address,
  		componentRestrictions: {locality: 'New York'}
  	}, function(results, status) {
  
        if (status == google.maps.GeocoderStatus.OK){
  	      map.setCenter(results[0].geometry.location);
  	      map.setZoom(15);
        } else {
  	      window.alert('Sorry, we could not find that, try something more specific');
        }
      });
  }
}

function searchWithinTime(){
 	var distMatrixSvc = new google.maps.DistanceMatrixService;
 	var addr = document.getElementById('search-within-time-text').value;
 	
  if (addr == ''){
 		window.alert('Please enter an address');
 	} else {
 		hideListings(markers);
 		var origins = [];
 		
    for (var i = 0; i < markers.length; i++){
 			origins[i] = markers[i].position;
 			//console.log(origins[i]);
 		}

 		var dest = addr;
 		var mode = document.getElementById('mode').value;
 		distMatrixSvc.getDistanceMatrix({
 			origins: origins,
 			destinations: [dest],
 			travelMode: google.maps.TravelMode[mode],
 			unitSystem: google.maps.UnitSystem.IMPERIAL,
 		}, function(response, status){
  			if (status !== google.maps.DistanceMatrixStatus.OK){
    			window.alert('Error: ' + status);
  			} else {
  				displayMarkersWithinTime(response);
  			}
  		});
 	}
}

function displayMarkersWithinTime(response){
 	var maxDur = document.getElementById('max-duration').value;
 	var origins = response.originAddresses;
 	var dests = response.destinationAddresses;
 	var atLeastOne = false;

 	for (var i = 0; i < origins.length; i++){
 		var results = response.rows[i].elements;
 		for (var j = 0; j <results.length; j++){
 			var element = results[j];
 			if(element.status === "OK"){
 				var distanceText = element.distance.text;
 				var dur = element.duration.value / 60;
 				var durText = element.duration.text;
 				if (dur <= maxDur) {
 					markers[i].setMap(map);
 					atLeastOne = true;
 					var popUpWindow = new google.maps.InfoWindow({
 						content: durText + " away, " + distanceText +
 						'<div><input type=\"button\" value=\"View Route\" onclick=\"displayDirections(&quot;' + origins[i] + '&quot;);\"></input></div>'
 					});
 					popUpWindow.open(map, markers[i]);
 					markers[i].infowindow = popUpWindow;
 					google.maps.event.addListener(markers[i], 'click', function(){
 						this.infowindow.close();
 					})
 				}
 			}
 		}
 	}
}

function displayDirections(origin){
 	hideListings(markers);
 	var directionsSvc = new google.maps.DirectionsService;
 	var destinationAddr = document.getElementById('search-within-time-text').value;
 	var mode = document.getElementById('mode').value;
 	directionsSvc.route({
 		origin: origin,
 		destination: destinationAddr,
 		travelMode: google.maps.TravelMode[mode]
 	}, function(response, status) {
  		if (status === google.maps.DirectionsStatus.OK){
  			var directionsDispl = new google.maps.DirectionsRenderer({
  				map: map,
  				directions: response,
  				draggable: true,
  				polylineOptions: {
  					strokeColor: 'yellow'
  				}
  			});
  		} else {
  			window.alert('It is unpossible to get to your destination from here! Actually, the reason this failed is ' + status)
  		}
 	});
}

function searchBoxPlaces(searchBox){
 	hideMarkers(markers);
 	var places = searchBox.getPlaces();
 	createMarkersForPlaces(places);
 	if(places.length == 0){
 		window.alert('We did not find anything matching your search');
 	} else {
 		createMarkersForPlaces(places);
 	}
}

function textSearchPlaces(){
 	var bounds = map.getBounds();
 	hideMarkers(placeMarkers);
 	var placesSvc = new google.maps.places.PlacesService(map);
 	placesSvc.textSearch({
 		query: document.getElementById('places-search').value,
 		bounds: bounds
 	}, function(results, status){
   		if(status === google.maps.places.PlacesServiceStatus.OK){
  			createMarkersForPlaces(results);
  		}
  });
}

function createMarkersForPlaces(places){
 	var bounds = new google.maps.LatLngBounds();

 	for (var i = 0; i < places.length; i ++){
 		var place = places[i];
 		var icon = {
 			url: place.icon,
 			size: new google.maps.Size(35,35),
 			origin: new google.maps.Point(0,0),
 			anchor: new google.maps.Point(15,34),
 			scaledSize: new google.maps.Size(25,25)
 		};
 		var marker = new google.maps.Marker({
 			map: map,
 			icon: icon,
 			title: place.name,
 			position: place.geometry.location,
 			id: place.place_id
 		});
 		var placePopUp = new google.maps.InfoWindow();
 		marker.addListener('click', function(){
 			if (placePopUp.marker == this){
 				console.log('Info Window already on this marker');
 			} else {
 				getPlacesDetails(this, placePopUp);
 			}
 		});
 		placeMarkers.push(marker);
 		if(place.geometry.viewport){
 			bounds.union(place.geometry.viewport);
 		} else {
 			bounds.extend(place.geometry.location);
 		}
 	}
 	map.fitBounds(bounds);
}

function getPlacesDetails(marker, infoWindow){
 	var svc = new google.maps.places.PlacesService(map);
 	svc.getDetails({
 		placeId: marker.id
 	}, function(place, status) {
   		if (status === google.maps.places.PlacesServiceStatus.OK){
  			infoWindow.marker = marker;
  			var innerHTML = '<div>';
  			if (place.name){
  				innerHTML += '<strong>' + place.name + '</strong>'
  			} else {
  				innerHTML += 'No Name!';
  			}
  			if (place.formatted_address){
  				innerHTML += '<br>' + place.formatted_address;
  			}
  			if (place.formatted_phone_number){
  				innerHTML += '<br>' + place.formatted_phone_number;
  			}
  			if (place.opening_hours){
  				innerHTML += '<br><br><strong>Hours: </strong><br>' +
  				place.opening_hours.weekday_text[0] + '<br>' +
  				place.opening_hours.weekday_text[1] + '<br>' +
  				place.opening_hours.weekday_text[2] + '<br>' +
  				place.opening_hours.weekday_text[3] + '<br>' +
  				place.opening_hours.weekday_text[4] + '<br>' +
  				place.opening_hours.weekday_text[5] + '<br>' +
  				place.opening_hours.weekday_text[6];
  			}
  			if (place.photos){
  				innerHTML += '<br><br><img src="' + place.photos[0].getUrl({
  					maxHeight: 100, maxWidth: 200}) + '">';
  			}
  			innerHTML += '</div>';
  			infoWindow.setContent(innerHTML);
  			infoWindow.open(map, marker);
  			infoWindow.addListener('closeclick', function(){
  				infoWindow.marker = null;
  			});
  		}
 	});
}
