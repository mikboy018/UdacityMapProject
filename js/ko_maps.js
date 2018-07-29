
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
    if (custom() == true){
        console.log("custom is true");
        $("#sortable").sortable("enable");
        $(".locations").toggleClass("sort");
        $(".locationName").prop("disabled", false);
        $(".address").prop("disabled", false);
    } else {
        console.log("custom is false");
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

// update addr obserable array, pass into directionsservice
function searchLocations(){
    var tempLName = [];
    var tempAddress = [];
    // update addr to match the selected order / name of locations
    // add names/addresses in order specified by the sortable
    $(".locations").each( function(idx){
        var newLName = $(this).children('.locationName').val();
        var newAddress = $(this).children('.address').val();
        tempLName.push(newLName);
        tempAddress.push(newAddress);     
    });
    //console.log(tempLName);
    //iterate through
    for (var i = 0; i < addr().length; i ++){
        console.log("observable array: " + addr()[i].lname() +  " | " + addr()[i].strAddr());
        addr()[i].lname(tempLName[i]);
        addr()[i].strAddr(tempAddress[i]);
        //addr.replace(addr()[idx].lname(), newLName);
        //addr.replace(addr()[idx].strAddr(), newAddress);
        console.log("observable array: " + addr()[i].lname() +  " | " + addr()[i].strAddr());
    }
    // close dialog box
    $("#dialog").dialog("close");
    //$("#dialog").dialog("open");
    // access directions service
    // display markers

}