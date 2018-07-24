
var fileLocn = "src/sampleLocn.csv";
var addr = ko.observableArray([]);

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

$(document).ready(function() {
  console.log("ready!");

  AddressesViewModel();

  var locnVM = {
    AddressesViewModel: ko.observableArray([]),

    placeMarker : function(addr){
      console.log("placeMarker Called - # markers: " + markers.length);
      console.log("map --- " + map)
      for (var i = 0; i < markers().length; i++) {
        markers()[i].marker.setMap(map);
      }
    },

    hideMarker : function(addr){
        for (var i = 0; i < markers().length; i++) {
            markers()[i].marker.setMap(null);
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
  console.log("map: " + map);
  //map = document.getElementById('map');

  
});

// Set up viewmodel for this screen, along with initial state
function AddressesViewModel() {
    //console.log("loading view model");
    //var self = this;
    //self.addr = ko.observableArray([]);

    // Pull data from csv
    //var lines = ko.observableArray([]);

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
    console.log("called geoCodeAddress, # addresses - " + addr().length);
   for (var k = 1; k < addr().length; k++){
        
        var currName = addr()[k].lname().toString();
        var currAddr = addr()[k].strAddr().toString();
        addMarker(k, currName, currAddr, geocoder, resultsMap); 
        console.log("Markers: " + markers().length);
    }
        
}

function addMarker(i, currName, currAddr, geocoder, map){
    setTimeout(function(){
    geocoder.geocode({'address' : currAddr}, function(results, status){
        if (status === 'OK'){
            //map.setCenter(results[0].geometry.location);
            console.log(currName);
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
    console.log("processing data from csv");
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
    //Making sure address was added   
    for (var k = 0; k < addr().length; k++){
        console.log(addr()[k]);
    }

      var geocoder = new google.maps.Geocoder();
      console.log("next - add markers");
      geocodeAddress(geocoder, map, addr);


  }
