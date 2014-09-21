String.prototype.insert = function (index, string) {
  'use strict';
  if (index > 0) {
    return this.substring(0, index) + string + this.substring(index, this.length);
  }
  else {
    return string + this;
  }
};

function loadData(){
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
      f.properties.duration = f.properties.endTime - f.properties.startTime;
    });
    places = _.sortBy(places, function(f){
      return f.properties.startTime;
    });
    return places;
  });
}

(function(){
  'use strict';
  var places = loadData();
  var nodesHash = {};
  _.forEach(places, function(p){
    if (nodesHash[p.properties.id]) {
      nodesHash[p.properties.id].duration += p.properties.duration;
    } else {
     nodesHash[p.properties.id] = {};
     nodesHash[p.properties.id].duration = p.properties.duration;
     nodesHash[p.properties.id].destinations = {};
    }
  });
  for(var i = 0; i < places.length - 1; i++) {
   if(nodesHash[places[i].properties.id].destinations[places[i+1].properties.id]) {
      nodesHash[places[i].properties.id].destinations[places[i+1].properties.id] += 1;
   } else {
      nodesHash[places[i].properties.id].destinations[places[i+1].properties.id] = 1;
   }
  }
})();

