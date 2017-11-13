(function(window){
  'use strict';

  window.MONGRES = (function(){
    var client = (function(){
      function ajax(options, path, object, cb) {
	      if (path.indexOf('/dev/mongres') < 0) path = '/dev/mongres' + path;
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
        ajax({contentType: "text/plain"}, path, text, cb);
      };

      var client = {};

      client.connect = function(params, cb){
        post("/api/conn", params, cb);
      };

      client.createCollection = function(connId, dbName, colName, cb){
        var path = "/api/conn/";
        path += connId + "/db/";
        path += dbName + "/col";
        post(path, {name: colName}, cb);
      };

      client.dropCollection = function(connId, dbName, colName, cb){
        var path = "/api/conn/" + connId;
        path += "/db/" + dbName + "/col/" + colName;
        _delete(path, cb);
      };

      client.saveDoc = function(doc, cb) {
        var path = "/api/conn/" + F.env.conn;
        path += "/db/" + F.env.db;
        path += "/col/" + F.env.col;
        path += "/doc";
        if (F.env.doc) path += "/" + F.env.doc
        postPlain(path, doc, cb);
      };

      client.removeDocs = function(docs, cb) {
        var path = "/api/conn/" + F.env.conn;
        path += "/db/" + F.env.db;
        path += "/col/" + F.env.col;
        path += "/doc";
        if (docs.length === 1) {
          path += "/" + docs[0];
          _delete(path, cb);
        } else {
          _delete(path, docs, cb);
        }
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
      proto.exists = function() { return !!localStorage.getItem(this.name); };
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
      kv: kv,
      getColumnConfig: function() {
        return new MONGRES.kv("Fields." + F.env.col);
      },
      col2Class: function(colName) {
        return "col-" + colName.replace(/\./g, "_");
      },
    };
  })();

  F.TOPIC.DATA_TABLE = {};
  F.TOPIC.DATA_TABLE.HEAD_UPDATED = "table.head.updated";
  F.TOPIC.DATA_TABLE.BODY_UPDATED = "table.body.updated";
  F.TOPIC.DATA_TABLE.LOAD_MORE = "table.load_more";
  F.TOPIC.DATA_TABLE.SHOW_COLUMN = "table.show_col";
  F.TOPIC.DATA_TABLE.HIDE_COLUMN = "table.hide_col";
  F.TOPIC.DATA_TABLE.RELOAD = "table.reload";

  var App = Fractal.App.extend({
    init: function(){
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

