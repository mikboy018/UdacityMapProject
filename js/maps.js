/* Thanks to https://blog.microdreamit.com/2018/06/01/use-snazzy-style-maps-by-google-api/  for getting this to work with async defer */
/* Neutral Blue map style from: https://snazzymaps.com/style/13/neutral-blue */
//var map;
//var markers = [];
//var placeMarkers = [];
//var polygon = null;
//var area = "";


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
var locns = {
	locnModel: ko.observableArray([])
  } 
}

function locnModel(){
  
  var self = this;

  self.addr = [

  ];
  this.name = ko.observable();
  this.streetNbr = ko.observable();
  this.street = ko.observable();
  this.city = ko.observable();
  this.state = ko.observable();
  this.zip = ko.observable();

  this.address = ko.computed(function (){
    return this.name + " " + this.streetNbr + " " + this.street + " " + this.city + ", " + this.state + " " + this.zip
  }, this);



importSamples();
// Add markers per selected array
}

// Imports sampleLocations.csv, adds them to observable array
function importSamples(){

  var lines = ko.observableArray();
  
  
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

    var allLines = text.split(/\r\n|\n/);
    //var headers = text[0].split(',');
    var entry = allLines.toString().split(',');
    console.log(typeof allLines);
    console.log(" was allLines");
    /*
    for (var i = 1; i < allLines.length; i = i + 6){
      
        name = allLines[i];
        streetNbr = allLines[i+1];
        street = allLines[i+2];
        city = allLines[i+3];
        state = allLines[i+4];
        zip = allLines[i+5];
        console.log(name);
    }*/
    //console.log(lines);
    	//console.log(entry);
    for (var j = 1; j < entry.length; j = j + 6){
    		
    		//console.log(entry[j]);
    		var name = entry[j];
    		var streetNbr = entry[j+1];
    		var street = entry[j+2];
    		var city = entry[j+3];
    		var state = entry[j+4];
    		var zip = entry[j+5];
    		locns.locnModel.push( new locnModel()
    			.name(name)
    			.streetNbr(streetNbr)
    			.street(street)
    			.city(city)
    			.state(state
    			.zip(zip)
    		));

    }

    //console.log(lines);
  }
  
  //return lines;
  ko.applyBindings(locns);
}



