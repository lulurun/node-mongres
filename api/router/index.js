['connect', 'mongodb', 'collection', 'document'].forEach(function(v){
  exports[v] = require(__dirname + '/' + v);
});

