  var map;
  var geocoder;
  var locationArray;
  var directionsService;
  var directionsRenderer;
  var markers;
  var marker;
  var popup;
  var weatherMarkers;

  // function reset(){
  //    for (var i = 0; i < markers.length ; i++){
  //      markers[i].setMapOnAll(null);
  //      weatherMarkers[i].setMapOnAll(null);
  //    }
  // }

  $(".js-reset").on('click',initMap);

  function initMap(){
      var mapOptions = {
        center : new google.maps.LatLng(39.73, -104.99),
        zoom : 10
        //mayTypeId : google.maps.mapTypeId.ROADMAP
      };
      var myMapDivElement = document.getElementById('mymap');
      map = new google.maps.Map(myMapDivElement, mapOptions);
      geocoder = new google.maps.Geocoder();

      markers = [];
      weatherMarkers = [];
      directionsService = new google.maps.DirectionsService();
      directionsRenderer = new google.maps.DirectionsRenderer();
  }
  $(".js-directions-form").on('submit',function(event){
  event.preventDefault();
  });
  $(".js-directions").on('click',findDirections);
  //traffic toggle button
  $(".js-trafficToggle").on('click',findTraffic);
  //weather toggle button
  $(".js-weatherToggle").on('click',findWeather);

  function findDirections(){
    var start = document.getElementById("startAddress").value;
    var destination = document.getElementById("destinationAddress").value;
    Promise.all([getGeoCode(start),getGeoCode(destination)])
      .then(getDirection);
  }

  // function captureLocations(locations){
  //   locationArray = locations;
  // }

  function getDirection(locations){
    locationArray = locations;

    directionsRenderer.setMap(map);
    directionsService.route({'origin':locations[0],'destination':locations[1],'travelMode':google.maps.TravelMode.DRIVING},
    function(result,status){
      if(status == google.maps.DirectionsStatus.OK){
        directionsRenderer.setDirections(result);
      } else{
        console.log("error");
      }
    });
  }


function getGeoCode(addr){
  return new Promise(function(resolve,reject){
    geocoder.geocode({'address':addr},function(results,status){
        if(status == google.maps.GeocoderStatus.OK){
          var location = results[0].geometry.location;
          placeMarkerOnMap(location);
          resolve(location);
        }
        else{
          reject(status);
        }
    });
  });

}

function placeMarkerOnMap(location){
  var marker = new google.maps.Marker({'map':map,'position':location});
  map.setCenter(location);
  map.setZoom(12);
  markers.push(marker);
}
//Something to do with traffic toggle button
function findTraffic(){
  var trafficLayer = new google.maps.TrafficLayer();
  trafficLayer.setMap(map);
}


 function findWeather(){
// //trying to get the previous markers to hide.
//    for(var i = 0; i < markers.length; i++){
//      markers[i].setMap(null);
//      markers = [];
//    }
  for(i = 0; i < locationArray.length ; i++){
    var URL = 'http://api.openweathermap.org/data/2.5/weather?'+
    'lat='+locationArray[i].lat()+'&lon='+locationArray[i].lng() +
    '&units=metric&APPID=32ba66921dd068c08810dbf7575a9488';
    console.log("URL is " + URL);
    map.data.loadGeoJson($.getJSON(URL, gotData));

  }
}

function gotData(data){
  var iconImgUrl = "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
  var marker = new google.maps.Marker({
     map:map,
     origin: new google.maps.Point(0, 0),
     clickable: true,
     anchor: new google.maps.Point(-17, 0),
     position: new google.maps.LatLng(data.coord.lat, data.coord.lon),
     icon: iconImgUrl, // null = default icon
     zIndex:99999999 //to get the icon on the forefront
  });
  marker.setAnimation(google.maps.Animation.DROP);
  weatherMarkers.push(marker);
  var infoWindowOptions = {
    content: data.weather[0].description + ' Temp: ' + data.main.temp + ' deg C',
    position: new google.maps.LatLng(data.coord.lat, data.coord.lon)
  }
  var infoWindow = new google.maps.InfoWindow(infoWindowOptions);
  //infoWindow.open(map);
  google.maps.event.addListener(marker, 'click', function(){
    infoWindow.open(map, marker);
  })
}
