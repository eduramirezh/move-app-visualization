String.prototype.insert = function (index, string) {
  'use strict';
  if (index > 0) {
    return this.substring(0, index) + string + this.substring(index, this.length);
  }
  else {
    return string + this;
  }
};

var loadData = function (){
  $.getJSON('data/places.geojson', function (placesData){
    var places = placesData.features;
    //20140826T220300-0400
    //2014-08-26T22:03:00-04:00
    places = _.forEach(places, function(f){
      var startTime = f.properties.startTime.insert(4, '-')
      .insert(7, '-')
      .insert(13, ':')
      .insert(16, ':')
      .insert(22, ':');
      var endTime = f.properties.endTime.insert(4, '-')
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
    var nodesHash = {};
    var fromTo = {};
    var currentPlaceId;
    _.forEach(places, function(p){
      currentPlaceId = p.properties.place.id;
      if (nodesHash[currentPlaceId]) {
        nodesHash[currentPlaceId].duration += p.properties.duration;
      } else {
        nodesHash[currentPlaceId] = {};
        nodesHash[currentPlaceId].duration = p.properties.duration;
        if (p.properties.place.name) {
          nodesHash[currentPlaceId].name = p.properties.place.name;
        }
        fromTo[p.properties.place.id] = {};
      }
    });
    _.forEach(moveOPlaces, function(m){
      if (nodesHash[m.id] && m.properties.name){
        nodesHash[m.id].name = m.properties.name;
      }
    });
    console.log('*');
    var currentPlace;
    var nextPlace;
    var repeated;
    for(var i = 0; i < places.length - 1; i++) {
      currentPlace = places[i].properties.place.id;
      nextPlace = places[i+1].properties.place.id;
      repeated = currentPlace == nextPlace;
      if(!repeated) {
        if(fromTo[currentPlace][nextPlace]) {
          fromTo[currentPlace][nextPlace] += 1;
        } else if(fromTo[nextPlace][currentPlace]) {
          fromTo[nextPlace][currentPlace] += 1;
        } else {
          fromTo[currentPlace][nextPlace] = 1;
        }
      }
    }
    var nodes = [];
    var edges = [];
    for (var type in nodesHash) {
      nodes.push({
        id: type,
        label: nodesHash[type].name ? nodesHash[type].name : type,
        shape: 'dot',
        radius: Math.sqrt(nodesHash[type].duration/10000)/5
      });
    }
    for (var from in fromTo) {
      for (var to in fromTo[from]){
        edges.push({
          from: from,
          to: to,
          width: fromTo[from][to]
        });
      }
    }
    console.log(edges);
    var container = document.getElementById('graph');
    var data = {
      nodes: nodes,
      edges: edges,
    };
    var options = {
      //width: '800px',
      //height: '800px'
    };
    var graph = new vis.Network(container, data, options);
  });
};

loadData();


