String.prototype.insert = function (index, string) {
  'use strict';
  if (index > 0) {
    return this.substring(0, index) + string + this.substring(index, this.length);
  }
  else {
    return string + this;
  }
};
var moment = moment;
var moveOPlaces = moveOPlaces;
var _ = _;
function timeDifference(startTime, endTime){
  'use strict';
  var parsedStartTime = startTime.insert(4, '-')
  .insert(7, '-')
  .insert(13, ':')
  .insert(16, ':')
  .insert(22, ':');
  var parsedEndTime = endTime.insert(4, '-')
  .insert(7, '-')
  .insert(13, ':')
  .insert(16, ':')
  .insert(22, ':');
  return moment.parseZone(parsedEndTime) - moment.parseZone(parsedStartTime);
}

var nodes = [];
var edges = [];
var bidirectional = {};
var duration;

_.forEach(moveOPlaces, function(p){
  'use strict';
  duration = 0;
  _.forEach(p.properties.intervals, function(i){
    duration += timeDifference(i[0], i[1]);
  });
  nodes.push({
    id: p.id,
    title: p.properties.name || p.id.toString(),
    shape: 'dot',
    label:'',
    radius: Math.sqrt(duration/100000),
    mass: Object.keys(p.properties.next).length,
    fontSize: Math.log(duration*0.01)*2
  });
  bidirectional[p.id] = {};
  for(var node in p.properties.next){
    if ( node != p.id && bidirectional[node] && bidirectional[node][p.id]){
      bidirectional[node][p.id] += p.properties.next[node].length;
    } else if (node != p.id && !bidirectional[p.id][node]) {
      bidirectional[p.id][node] = p.properties.next[node].length;
    } else if (node != p.id) {
      bidirectional[p.id][node] += p.properties.next[node].length;
    }
  }
});
for(var from in bidirectional){
  for (var to in bidirectional[from]){
    edges.push({
      from: from,
      to: to,
      width: Math.pow(1.7, bidirectional[from][to]) - 0.7
    });
  }
}
var container = document.getElementById('graph');

var data = {
  nodes: nodes,
  edges: edges,
};
var options = {
  width: '800px',
  height: '500px',
  nodes: {
    borderWidth: 0.01
  },
  tooltip: {
    delay: 0,
    color: {
      background: '#fff',
      border: 'ddd'
    }
  }
};
var graph = new vis.Network(container, data, options);

