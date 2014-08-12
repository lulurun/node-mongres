Fractal("dbStats", Fractal.Components.basicInfo.extend({
  title: "DB Stats",
  getQuery: function(){
    return "connections/" + Fractal.env.conn + "/databases/" + Fractal.env.db;
  }
}));

