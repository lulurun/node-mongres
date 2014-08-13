F("main", F.Components.Router.extend({
  getComponentName: function(data, cb){
    var name = F.env.conn ? "viewer" : "connect";
    cb(name);
  }
}));
