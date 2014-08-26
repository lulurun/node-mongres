F(function(){
  F("document", F.Component.extend({
    init: function(name, $container){
      var self = this;
      self._super(name, $container);
      self.subscribe(F.TOPIC.ENV_CHANGED, function(topic, data){
        console.log(data);
        if (data.doc) self.load();
      });
    },
    afterRender: function(cb){
      var self = this;
      F.require("bower_components/jquery-autosize/jquery.autosize.min.js", function(){
        self.$("#input-doc").autosize();
        self.$("#btn-save").click(function(){
          var text = self.$("#input-doc").val();
          text = text.replace(
              /: ObjectID\('([a-f0-9]{24})'\)(,?)\n/g,
            function(str, m1, m2){
              return ": \"ObjectID('" + m1 + "')\"" + m2 + "\n";
            }
          );
          var doc = JSON.parse(text);
          MONGRES.client.saveDoc(doc, function(res){
            if (res.length === 1 && res[0]._id) {
              F.navigate("document", {
                conn: F.env.conn,
                db: F.env.db,
                col: F.env.col,
                doc: res[0]._id.substr(10, 24)
              });
            } else {
              self.load();
            }
          });
        });
        self.$("#btn-reset").click(function(){
          self.$("#input-doc").val(self.data.data);
        });
        cb();
      });
    },
    getData: function(cb){
      var self = this;
      if (F.env.doc) {
        var path = "connections/" + F.env.conn;
        path += "/databases/" + F.env.db;
        path += "/collections/" + F.env.col;
        path += "/documents/" + F.env.doc;

        F.require(path, function(data){
          var text = JSON.stringify(data, null, "  ");
          var rows = text.split("\n").length;

          text = text.replace(
              /: "ObjectID\('([a-f0-9]{24})'\)"(,?\n)/g,
            function(str, m1, m2){
              return ": ObjectID('" + m1 + "')" + m2;
            }
          );

          self.data = {
            data: text
          };
          cb();
        });
      } else {
          self.data = {
            data: "{\n\n}"
          };
        cb();
      }
    }
  }));
});
