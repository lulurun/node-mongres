Fractal("dbStats", Fractal.Components.basicInfo.extend({
  title: "DB Stats",
  getQuery: function(){ return "conn/" + Fractal.env.conn + "/db/" + Fractal.env.db + "/stats"; }
}));

