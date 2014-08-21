(function(window){
  'use strict';

  window.MONGRES = (function(){
    var client = (function(){
      function ajax(options, path, object, cb) {
        var method = options.method || "POST";
        var contentType = options.contentType || "application/json";

        var xhr = new XMLHttpRequest();
        xhr.open(method, path, true);
        xhr.onreadystatechange = function () {
          if (xhr.readyState == 4) {
            var data = JSON.parse(xhr.responseText);
            cb(data);
          }
        }
        xhr.setRequestHeader('Content-Type', contentType);
        object = object || {};
        var text = (typeof(object) === "object") ? JSON.stringify(object) : object;
        xhr.send(text);
      };

      function _delete(path, object, cb) {
        if (typeof object === "function") {
          cb = object;
          object = null;
        }
        ajax({method: "DELETE"}, path, object, cb);
      };

      function post(path, object, cb) {
        if (typeof object === "function") {
          cb = object;
          object = null;
        }
        ajax({}, path, object, cb);
      };

      function postPlain(path, text, cb) {
        console.log("post plain", text)
        ajax({contentType: "text/plain"}, path, text, cb);
      };

      var client = {};

      client.connect = function(params, cb){
        post("/api/connections", params, cb);
      };

      client.createCollection = function(connId, dbName, colName, cb){
        var path = "/api/connections/";
        path += connId + "/databases/";
        path += dbName + "/collections";
        post(path, {name: colName}, cb);
      };

      client.dropCollection = function(connId, dbName, colName, cb){
        var path = "/api/connections/" + connId;
        path += "/databases/" + dbName + "/collections/" + colName;
        _delete(path, cb);
      };

      client.saveDoc = function(doc, cb) {
        var path = "/api/connections/" + F.env.conn;
        path += "/databases/" + F.env.db;
        path += "/collections/" + F.env.col;
        path += "/documents";
        if (F.env.doc) path += "/" + F.env.doc

        postPlain(path, doc, cb);
      };

      return client;
    })();

    var flatten = function(data) {
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

    var kv = (function(){
      var KV = function(name){ this.name = "KV." + name; };
      var proto = KV.prototype;
      proto.clear = function() { localStorage.removeItem(this.name); };
      proto.getAll = function() {
        var data = localStorage.getItem(this.name);
        if (data) return JSON.parse(data);
        return {};
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

    return {
      client: client,
      flatten: flatten,
      kv: kv
    };
  })();

  var App = Fractal.App.extend({
    init: function(){
      this.DOM_PARSER = "bower_components/jquery/dist/jquery.min.js";
      this.TEMPLATE_ENGINE = "bower_components/hogan/web/builds/2.0.0/hogan-2.0.0.js";
      this.PREFIX = {
        component: "components/",
        template: "templates/",
        ajax: "api/",
      };
      this.REQUIRE_LIST = [
        "bower_components/bootstrap/dist/js/bootstrap.min.js",
        "bower_components/bootstrap/dist/css/bootstrap.min.css",
        "css/app.css",
        "app.components.js",
      ];
    },
    onSetup: function(){}
  });


  var app = new App();
  app.start();
})(window);

