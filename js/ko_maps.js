
var fileLocn = "src/sampleLocn.csv";


$(document).ready(function() {
console.log("ready!");



AddressesViewModel();

var locnVM = {
    AddressesViewModel: ko.observableArray([])
}



/*
var masterVM = {
    vmA : sampleLocationCenter,
    vmB : locnVM
}*/

//ko.applyBindings(masterVM);
//Center the map
//ko.applyBindings(sampleLocationCenter);
initMap();

ko.applyBindings(locnVM);

});

// Overall viewmodel for this screen, along with initial state
function AddressesViewModel() {
    console.log("loading view model");
    var self = this;
    self.addr = ko.observableArray([]);

    // Pull data from csv
    var lines = ko.observableArray([]);

    function concantAddr(streetNbr,street,city,state,zip){
        var conAddr = streetNbr + " " + street + ", " + city + ", " + state + " " + zip;

        return conAddr;
    }


  // Load file
  function loadFile(){
    $.ajax({
      type: "GET",
      url: fileLocn,
      dataType: "text",
      success: function(data) { processData(data) }
    });
  };

  function processData(text){

    var allLines = text.split(/\r\n|\n/);
    //var headers = text[0].split(',');
    var entry = allLines.toString().split(',');
    //console.log(typeof allLines);
    //console.log(" was allLines");
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
    for (var j = 6; j < entry.length-1; j = j + 6){
            
        //console.log(entry[j]);
        var lname = entry[j];
        console.log("name: " + lname);
        var streetNbr = entry[j+1];
        var street = entry[j+2];
        var city = entry[j+3];
        var state = entry[j+4];
        var zip = entry[j+5];
        var conAddress = concantAddr(streetNbr,street,city,state,zip);
        //console.log(name);
        //console.log(conAddress);
        addr.push(new address(lname, conAddress));

    }   
    for (var k = 0; k < addr().length; k++){
        console.log(addr()[k]);
    }

  }
  loadFile();

}

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
/*
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
    locations: [{
        name: "The Bourbon Trail",
        latitude: 38.2120,
        longitude: -85.2236
       }
    ]}
*/
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 38.2120, lng: -85.2236 },
        zoom: 10,
        styles: styles
    });
}

// Class to represent a row (address)
function address(lname, addr) {
    var self = this;
    self.lname = ko.observable(lname);
    self.strAddr = ko.observable(addr);
/*
    self.addLocn = function(name, addr){
        self.name.push(name);
        self.strAddr.push(addr);
    }.bind(self);
  */
  console.log('address called');
}