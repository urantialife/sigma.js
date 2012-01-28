function Graph() {
  sigma.classes.EventDispatcher.call(this);

  this.nodes = [];
  this.nodesIndex = {};
  this.edges = [];
  this.edgesIndex = {};
}

Graph.prototype.addNode = function(id, params) {
  if (this.nodesIndex[id]) {
    throw new Error('Node "' + id + '" already exists.');
  }

  params = params || {};
  var n = {
    'x': 0,
    'y': 0,
    'dx': 0,
    'dy': 0,
    'degree': 0,
    'old_dx': 0,
    'old_dy': 0,
    'displayX': 0,
    'displayY': 0,
    'size': 1,
    'displaySize': 1,
    'color': '#fff',
    'label': id,
    'id': id,
    'attr': {}
  };

  for (var k in params) {
    switch (k) {
      case 'x':
      case 'y':
      case 'size':
        n[k] = +params[k];
        break;
      case 'color':
        n[k] = params[k];
        break;
      case 'label':
        n[k] = params[k];
        break;
      default:
        n['attr'][k] = params[k];
    }
  }

  this.nodes.push(n);
  this.nodesIndex[id] = n;

  return this;
};

Graph.prototype.addEdge = function(id, source, target, params) {
  if (this.edgesIndex[id]) {
    throw new Error('Edge "' + id + '" already exists.');
  }

  if (!this.nodesIndex[source]) {
    var s = 'Edge\'s source "' + source + '" does not exist yet.';
    throw new Error(s);
  }

  if (!this.nodesIndex[target]) {
    var s = 'Edge\'s target "' + target + '" does not exist yet.';
    throw new Error(s);
  }

  params = params || {};
  var e = {
    'source': this.nodesIndex[source],
    'target': this.nodesIndex[target],
    'size': 1,
    'weight': 1,
    'displaySize': 0.5,
    'color': this.nodesIndex[source]['color'],
    'label': id,
    'id': id,
    'attr': {}
  };
  e['source']['degree']++;
  e['target']['degree']++;

  for (var k in params) {
    switch (k) {
      case 'size':
        e[k] = +params[k];
        break;
      case 'color':
        e[k] = Color.hex(params[k]);
        break;
      case 'label':
        e[k] = params[k];
        break;
      default:
        e['attr'][k] = params[k];
    }
  }

  this.edges.push(e);
  this.edgesIndex[id] = e;

  return this;
};

Graph.prototype.rescale = function(w, h, sMin, sMax, tMin, tMax) {
  var weightMax = 0, sizeMax = 0;
  var self = this;

  this.nodes.forEach(function(node) {
    sizeMax = Math.max(node['size'], sizeMax);
  });

  this.edges.forEach(function(edge) {
    weightMax = Math.max(edge['size'], weightMax);
  });

  if (sizeMax == 0) {
    return;
  }

  if (weightMax == 0) {
    return;
  }

  // Recenter the nodes:
  var xMin, xMax, yMin, yMax;
  this.nodes.forEach(function(node) {
    xMax = Math.max(node['x'], xMax || node['x']);
    xMin = Math.min(node['x'], xMin || node['x']);
    yMax = Math.max(node['y'], yMax || node['y']);
    yMin = Math.min(node['y'], yMin || node['y']);
  });

  var scale = Math.min(0.9 * w / (xMax - xMin),
                       0.9 * h / (yMax - yMin));

  // Size homothetic parameters:
  var a, b;
  if (!sMax && !sMin) {
    a = 1;
    b = 0;
  }else if (sMax == sMin) {
    a = 0;
    b = sMax;
  }else {
    a = (sMax - sMin) / sizeMax;
    b = sMin;
  }

  var c, d;
  if (!tMax && !tMin) {
    c = 1;
    d = 0;
  }else if (tMax == tMin) {
    c = 0;
    d = tMin;
  }else {
    c = (tMax - tMin) / weightMax;
    d = tMin;
  }

  // Rescale the nodes:
  this.nodes.forEach(function(node) {
    node['displaySize'] = node['size'] * a + b;

    if (!node['isFixed']) {
      node['displayX'] = (node['x'] - (xMax + xMin) / 2) * scale + w / 2;
      node['displayY'] = (node['y'] - (yMax + yMin) / 2) * scale + h / 2;
    }
  });

  this.edges.forEach(function(edge) {
    edge['displaySize'] = edge['size'] * c + d;
  });
};