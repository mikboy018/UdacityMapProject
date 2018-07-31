
var fileLocn = "src/sampleLocn.csv";
var addr = ko.observableArray([]);
var area = ko.observable("");

var markers = ko.observableArray([]);
var styles = [
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#193341"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#2c5a71"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#29768a"
            },
            {
                "lightness": -37
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#406d80"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#406d80"
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#3e606f"
            },
            {
                "weight": 2
            },
            {
                "gamma": 0.84
            }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [
            {
                "weight": 0.6
            },
            {
                "color": "#1a3541"
            }
        ]
    },
    {
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#2c5a71"
            }
        ]
    }
  ];
var map;
var polygon = null;
var dwgMgr;
var dirSvc;
var dirDisp;
var popUpWindow;

var locnOrder = [];

var custom = ko.observable(false);
var optimum = ko.observable(false);

$(document).ready(function() {
  console.log("ready!");

  AddressesViewModel();

  var locnVM = {
    AddressesViewModel: ko.observableArray([]),

    placeMarker : function(){
      //console.log("placeMarker Called - # markers: " + markers.length);
      //console.log("map --- " + map)
      for (var i = 0; i < markers().length; i++) {
        markers()[i].marker.setMap(map);
      }
    },

    hideMarker : function(){
        for (var i = 0; i < markers().length; i++) {
            markers()[i].marker.setMap(null);
        }
    },

    toggleDrawing : function(){
      if (dwgMgr.map){
        dwgMgr.setMap(null);
        if (polygon !== null) {
          polygon.setMap(null);
          area("");
        }
      } else {
        dwgMgr.setMap(map);
      }
    }

  }

  ko.applyBindings(locnVM);
  //initMap();
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 38.2120, lng: -85.2236 },
    zoom: 10,
    styles: styles
  });
  //console.log("map: " + map);

  //map = document.getElementById('map');
   dwgMgr = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_LEFT,
      drawingModes: [google.maps.drawing.OverlayType.POLYGON]
    }
  });
  
  area("");

  dwgMgr.addListener('overlaycomplete', function(event){
      if (polygon !== null) {
        polygon.setMap(null);
        //hideMarker(markers);
      }
      //console.log('listener added');

      dwgMgr.setDrawingMode(null);
      polygon = event.overlay;
      /* TODO - fix below not recalculating properly */
      polygon.setEditable(false);

      searchWithinPolygon(polygon, area);
      polygon.getPath().addListener('set_at', searchWithinPolygon);
      polygon.getPath().addListener('insert_at', searchWithinPolygon);
  });

  dirSvc = new google.maps.DirectionsService;
  dirDisp = new google.maps.DirectionsRenderer;
  dirDisp.setMap(map);

  popUpWindow = new google.maps.InfoWindow();




  
});

// Set up viewmodel for this screen, along with initial state
function AddressesViewModel() {

  loadFile(addr);

}


// Class to represent a row (address)
function address(lname, addr) {
    var self = this;
    self.lname = ko.observable(lname);
    self.strAddr = ko.observable(addr);
}

function mrkr(marker){
    var self = this;
    self.marker = marker;
}

//Place markers 
function geocodeAddress(geocoder, resultsMap, addr) {
  //console.log("called geoCodeAddress, # addresses - " + addr().length);
  for (var k = 1; k < addr().length; k++){
    var currName = addr()[k].lname().toString();
    var currAddr = addr()[k].strAddr().toString();
    addMarker(k, currName, currAddr, geocoder, resultsMap); 
    //console.log("Markers: " + markers().length);
  }      
}

function addMarker(i, currName, currAddr, geocoder, map){
  setTimeout(function(){
  geocoder.geocode({'address' : currAddr}, function(results, status){
    if (status === 'OK'){
      //map.setCenter(results[0].geometry.location);
      //console.log(currName);
      var marker = new google.maps.Marker({
        title: currName,
        id: i,
        animation: google.maps.Animation.DROP,
        position: results[0].geometry.location
      });
      marker.addListener('click', function(){
        populateInfoWindow(this, popUpWindow);
      })
      //console.log("marker title: " + marker.title);
      markers.push(new mrkr(marker));
      //console.log(markers().length);
      } else {
        alert('Geocode failed due to: ' + result);
      }
    });}, 200*i);
}

//Concantenate address values from csv

function concantAddr(streetNbr,street,city,state,zip){
  var conAddr = streetNbr + " " + street + ", " + city + ", " + state + " " + zip;
  return conAddr;
}

// Load file
function loadFile(addr){
  $.ajax({
    type: "GET",
    url: fileLocn,
    dataType: "text",
    success: function(data) { processData(data, addr) }
  });
};

function processData(text, addr){
  // remove all entries (for resetting)
  addr.removeAll();
  custom(false);
  optimum(false);
  //console.log("processing data from csv");
  var allLines = text.split(/\r\n|\n/);
  var entry = allLines.toString().split(',');
  for (var j = 6; j < entry.length-1; j = j + 6){
    //console.log(entry[j]);
    var lname = entry[j];
    //console.log("name: " + lname);
    var streetNbr = entry[j+1];
    var street = entry[j+2];
    var city = entry[j+3];
    var state = entry[j+4];
    var zip = entry[j+5];
    var conAddress = concantAddr(streetNbr,street,city,state,zip);
    //console.log("Name: " + lname);
    //console.log(conAddress);
    addr.push(new address(lname, conAddress));
  }
  /*
  //Making sure address was added   
  for (var k = 0; k < addr().length; k++){
    console.log(addr()[k]);
  }*/
  var geocoder = new google.maps.Geocoder();
    //console.log("next - add markers");
    geocodeAddress(geocoder, map, addr);
}

function searchWithinPolygon(polygon, area){
  //console.log('searching... ' + markers().length);
  for (var i = 0; i < markers().length; i++){
    if(polygon !== null){
      //console.log('looking for area');
      area = retrieveArea(polygon, area);
    }
    //console.log("lat lng : " + markers()[i].marker.position);
    if (google.maps.geometry.poly.containsLocation(markers()[i].marker.position, polygon)){
      markers()[i].marker.setMap(map);
    } else {
      markers()[i].marker.setMap(null);
    }
  }
}

function retrieveArea(polygon, area){
  //console.log('calculating area');
  if(polygon === null){
    area("");
    //console.log('no polygon');
  } else {
    var num = google.maps.geometry.spherical.computeArea(polygon.getPath())

  if (num) {
    num = num.toLocaleString('en-US', {minimumFractionDigits: 2});
    area("search area: " + num + " sq m");
  } else {
    area("hmm...");
  }
  //console.log(area());
  return area
  }
}

function allowCustomize(){
    //console.log("This will allow me to customize entries by enabling edit and sort for locationName and address inputboxes")
    $("#sortable").sortable();
    $("#sortable").sortable({
        update: function(event, ui) {
            locnOrder = $(this).sortable('toArray');
        }
    });
    if (custom() == true){
        //console.log("custom is true");
        $("#sortable").sortable("enable");
        $(".locations").toggleClass("sort");
        $(".locationName").prop("disabled", false);
        $(".address").prop("disabled", false);
    } else {
        //console.log("custom is false");
        $("#sortable").sortable("disable");
        $(".locations").toggleClass("sort");
        $(".locationName").prop("disabled", true);
        $(".address").prop("disabled", true);
    }
    //custom(true);
    return true;
}

function popUpLocations(){
    $("#dialog").dialog({
      width: '45%',
      height: '300'
    });
    $(".locations:before").prop("disabled", true);
    $(".locationName").prop("disabled", true);
    $(".address").prop("disabled", true);
}

function toggleOptimum() {
    //console.log("toggle optimum called");
    return true;
}

function calcDisplayRoute(){
    //make first marker the start point, middle markers waypoints, and final marker endpoint
    var startpt;
    var waypts = [];
    var endpt;
    for (var i = 0; i < locnOrder.length; i++){
        if(i == 0){
            startpt = addr()[locnOrder[i]].strAddr().toString();
        } else if(i == 4){
            endpt = addr()[locnOrder[i]].strAddr().toString();
        } else {
            waypts.push({
                location: addr()[locnOrder[i]].strAddr().toString()
            });
        }
        //console.log("no " + i + " assigned " + addr()[locnOrder[i]].lname().toString() + " | " + addr()[locnOrder[i]].strAddr().toString());
    }

    dirSvc.route({
        origin: startpt,
        destination: endpt,
        waypoints: waypts,
        optimizeWaypoints: optimum(),
        travelMode: 'DRIVING'
    }, function(response, status) {
        if(status === 'OK') {
            dirDisp.setDirections(response);
            var route = response.routes[0];
        } else {
            window.alert('Directions Request Failed, Reason: ' + status);
        }
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