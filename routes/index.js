var regex = /^data:.+\/(.+);base64,(.*)$/;

module.exports = function(indico, fs){
  return {
    getHome: function(req, res){
      res.render("home");
    },

    getImage: function(req, res){
      fs.readdir('public/images', function (err, imageNames){
        image = imageNames[Math.floor(Math.random()*imageNames.length)];
        fs.readFile('public/images/'+image, function(err, data) {
          string = new Buffer(data).toString('base64');
          indico.fer(string)
          .then(function(data) {
            res.json({file: image, emotions: data});
          }).catch(function(err) {
            console.warn("Error:", err);
          });
        });
      });
    },

    postImage: function(req, res){
      var string = String(req.body.data);
      string=string.split(",")[1];
      indico.fer(string)
      .then(function(data) {
        res.json(data);
      }).catch(function(err) {
        console.warn(err);
      });
    }
  };
};

