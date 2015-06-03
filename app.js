var express = require("express");
var path = require("path");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var exphbs  = require("express-handlebars");
var fs = require("fs");

var indico = require("indico.io");
indico.apiKey = process.env.INDICO_API_KEY;

var index = require("./routes/index")(indico, fs);

var app = express();

var PORT = process.env.PORT || 3001;

app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

app.use(logger("dev"));
app.use(bodyParser.json({limit:'5mb'}));
app.use(bodyParser.urlencoded({extended: false, limit: '5mb'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", index.getHome);
app.get("/image", index.getImage);

app.post("/image", index.postImage);

app.listen(PORT, function() {
  console.log("App running on port:", PORT);
});
