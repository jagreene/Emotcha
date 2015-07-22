var regex = /^data:.+\/(.+);base64,(.*)$/;

module.exports = function(indico, fs){
  return {
    //render home page
    getHome: function(req, res){
      res.render("home");
    },

    //send example image to client
    getImage: function(req, res){
      fs.readdir('public/images', function (err, imageNames){
        var currentFile = req.query.image;
        console.log(currentFile)
        var index = imageNames.indexOf(currentFile);
        imageNames.splice(index, 1);
        image = imageNames[Math.floor(Math.random()*imageNames.length)];
        fs.readFile('public/example_emotions.json', 'utf8', function (err, data) {
          var emotions = JSON.parse(data)[image]
          res.json({file: image, emotions: emotions});
        })
     })
    },

    //Recieve image from client and send response
    postImage: function(req, res){
      var string = String(req.body.data);
      string=string.split(",")[1];
      indico.fer(string, {detect:true})
      .then(function(data) {
        console.log(data)
        if (data.length === 1 && 'location' in data[0]){
          data = data[0]['emotions'];
          status = "found"
          console.log("Face!");
          res.json({data:data, status:status});
        } else {
          console.log("No Face!");
          res.json({data:NaN, status:"not_found"})
        }
      }).catch(function(err) {
        console.warn(err);
      });
    }
  };
};

