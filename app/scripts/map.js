//This file is no longer used
String.prototype.insert = function (index, string) {
  if (index > 0)
    return this.substring(0, index) + string + this.substring(index, this.length);
  else
    return string + this;
};

(function(){
  "use strict";
  $.getJSON('data/places.geojson', function (data){
    var places = data.features;
    //20140826T220300-0400
    //2014-08-26T22:03:00-04:00
    places = _.forEach(places, function(f){
      var startTime = f.properties.startTime.insert(4, '-')
      .insert(7, '-')
      .insert(13, ':')
      .insert(16, ':')
      .insert(22, ':');
      var endTime = f.properties.startTime.insert(4, '-')
      .insert(7, '-')
      .insert(13, ':')
      .insert(16, ':')
      .insert(22, ':');
      f.properties.startTime = moment.parseZone(startTime);
      f.properties.endTime = moment.parseZone(endTime);
    });
    places = _.sortBy(places, function(f){
      return f.properties.startTime;
    });
    var mapCanvas = document.getElementById('map_canvas');
    var mapOptions = {
      center: new google.maps.LatLng(places[0].geometry.coordinates[1], places[0].geometry.coordinates[0]),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var iconBase = 'https://maps.google.com/mapfiles/';
    var map = new google.maps.Map(mapCanvas, mapOptions);
    var markers = [];
    _.forEach(places, function(p){
      var coords = new google.maps.LatLng(p.geometry.coordinates[1], p.geometry.coordinates[0]);
      markers.push(new google.maps.Marker({
        position: coords,
        map: map,
        icon: iconBase + 'marker.png'
      }));
    });
    var bounds = new google.maps.LatLngBounds();
    for(var i=0;i<markers.length;i++) {
     bounds.extend(markers[i].getPosition());
    }
    map.fitBounds(bounds);

  });
})();

