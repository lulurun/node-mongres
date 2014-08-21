F(function(){
  F("document", F.Component.extend({
    afterRender: function(cb){
      var self = this;
      self.$("#btn-save").click(function(){
        var text = self.$("#input-doc").val();
        text = text.replace(
            /: ObjectID\('([a-f0-9]{24})'\)(,?)\n/g,
          function(str, m1, m2){
            return ": \"ObjectID('" + m1 + "')\"" + m2 + "\n";
          }
        );
        var doc = JSON.parse(text);
        MONGRES.client.saveDoc(doc, function(){
          self.load();
        });
      });
      self.$("#btn-reset").click(function(){
        self.$("#input-doc").val(self.data.data);
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
            data: text,
            height: $(window).height() - 200
          };
          cb();
        });
      } else {
        cb();
      }
    }
  }));
});
