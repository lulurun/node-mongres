var db_info = Fractal.Component.extend({ loadOnce: true });

var dbStats = Fractal.Components.basicInfo.extend({
  title: "stats",
  query: "conn/" + Fractal.env.conn + "/db/" + Fractal.env.db + "/stats"
});

