const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const got = require("got");

const fs = require("fs");


var record = "/app/.data/secretrecord.json";

app.use(express.static("public"));

app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

app.get('/about', function(request, response) {
  response.sendFile(__dirname + '/views/about.html');
});

app.get('/create', function(request, response) {
  response.sendFile(__dirname + '/views/create.html');
});


app.set("port", process.env.PORT || 5000);
http.listen(app.get("port"), function() {
  console.log("listening on port", app.get("port"));
});

const storeData = (data, path) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
};

const loadData = path => {
  try {
    return fs.readFileSync(path, "utf8");
  } catch (err) {
    console.error(err);
    return false;
  }
};

io.on("connection", function(socket) {
  
  socket.on("new-net-space", function(name, netSpace) {
    var oldJson = JSON.parse(loadData(record));
    oldJson[name] = netSpace;
    storeData(oldJson, record);
  });

  socket.on("get-net-space", function(name) {
    var netspace = JSON.parse(loadData(record))[name];
    if(netspace) socket.emit("load-map", netspace,name);
  });
  
  socket.on("get-current-keys",function(){
    var data = JSON.parse(loadData(record));
    var keys=data.keys();
//     for(var i = 0; i<keys.length;i++){
    socket.emit("key-names", keys);
//     }
   
    
  });
 
  
});