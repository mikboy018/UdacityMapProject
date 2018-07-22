/* Thanks to https://blog.microdreamit.com/2018/06/01/use-snazzy-style-maps-by-google-api/  for getting this to work with async defer */
/* Neutral Blue map style from: https://snazzymaps.com/style/13/neutral-blue */
//var map;
//var markers = [];
//var placeMarkers = [];
//var polygon = null;
//var area = "";

var locns = ko.observableArray();
var fileLocn = "src/sampleLocn.csv";

function initMap() { 
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

  ko.bindingHandlers.googlemap = {
  init: function(element, valueAccessor) {
    var
      value = valueAccessor(),
      latLng = new google.maps.LatLng(value.latitude, value.longitude),
      mapOptions = {
        zoom: 10,
        center: latLng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: styles
      },
      map = new google.maps.Map(element, mapOptions);
  }
};

var sampleLocationCenter = {
  locations: ko.observableArray([{
      name: "The Bourbon Trail",
      latitude: 38.2120,
      longitude: -85.2236
    }
  ])
}

//Center the map
ko.applyBindings(sampleLocationCenter);
// Load csv to observablesArray
locns = importSamples();
// Add markers per selected array
}

// Imports sampleLocations.csv, adds them to observable array
function importSamples(){

  var lines = ko.observableArray();
  
  this.name = ko.observable();
  this.streetNbr = ko.observable();
  this.street = ko.observable();
  this.city = ko.observable();
  this.state = ko.observable();
  this.zip = ko.observable();

  this.address = ko.computed(function (){
    return this.name + " " + this.streetNbr + " " + this.street + " " + this.city + ", " + this.state + " " + this.zip
  }, this);
  
  // Load file
  $(document).ready(function(){
    $.ajax({
      type: "GET",
      url: fileLocn,
      dataType: "text",
      success: function(data) { processData(data) }
    });
  });

  function processData(text){
    console.log(typeof text);
    console.log(text);
    var allLines = text.split(/\r\n|\n/);
    var headers = text[0].split(',');
    
    for (var i = 1; i < allLines.length; i++){
      var data = allLines.split(',');
      if (data.length == headers.length) {
        var temp =[];

        for (var j = 0; j < headers.length; j++) {
          temp.push(headers[j] +":" + data[j]);
        }
        lines.push(temp);
      }
    }
    console.log(lines);
  }
  
  return lines;

}



