var MongresUI = Fractal.App.extend({
  init: function(){
    this.PREFIX = {
      component: "components/",
      template: "templates/",
      json: "api/",
    };
    this.REQUIRE_LIST = [
      "//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css",
      "//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js",
      "css/app.css",
      "app.components.js",
    ];
  },
  onSetup: function(){}
});


var MONGRES = (function(){
  function post(path, object, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", path, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        var data = JSON.parse(xhr.responseText);
        callback(data);
      }
    }
    xhr.setRequestHeader('Content-Type', 'application/json');
    console.log("post", object);
    xhr.send(JSON.stringify(object));
  };


  var MONGRES = {};
  MONGRES.currentConn = "";

  MONGRES.flatten = function(data) {
    var result = {};
    function recurse (cur, prop) {
      if (Object(cur) !== cur) {
        result[prop] = cur;
      } else if (Array.isArray(cur)) {
        result[prop] = cur;
        // for(var i=0, l=cur.length; i<l; i++)
        //      recurse(cur[i], prop + "[" + i + "]");
        // if (l == 0)
        //     result[prop] = [];
      } else {
        var isEmpty = true;
        for (var p in cur) {
          isEmpty = false;
          recurse(cur[p], prop ? (prop + "." + p) : p);
        }
        if (isEmpty && prop)
          result[prop] = "{}";
      }
    }
    recurse(data, "");
    return result;
  };

  MONGRES.connect = function(params, callback){
    post("/api/conn", params, function(data){
      callback(data);
    });
  };

  MONGRES.KV = (function(){
    var KV = function(name){ this.name = "KV." + name; };
    var proto = KV.prototype;
    proto.clear = function() { localStorage.removeItem(this.name); };
    proto.getAll = function() {
      var data = localStorage.getItem(this.name);
      if (data) return JSON.parse(data);
      return null;
    };
    proto.setAll = function(data) { localStorage.setItem(this.name, JSON.stringify(data)); };
    proto.get = function(key) { return this.getAll()[key]; };
    proto.set = function(key, value) {
      var data = this.getAll() || {};
      data[key] = value;
      this.setAll(data);
    };
    return KV;
  })();

  return MONGRES;
})();
