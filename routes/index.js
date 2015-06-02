module.exports = function(){
  return {
    getHome: function(req, res){
      res.render("home");
    },

    getImage: function(req, res){
      res.json({msg: "hit get image endpoint"});
    },

    postImage: function(req, res){
      res.json({msg: "hit post image endpoint"});
    }
  };
};

