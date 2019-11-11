const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const got = require("got");

const fs = require("fs");

app.use(express.static("public"));

app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

// listen for requests :)
// const listener = app.listen(process.env.PORT, function() {
//   console.log("Your app is listening on port " + listener.address().port);
// });

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
    var oldJson = JSON.parse(loadData("/app/record.json"));
    oldJson[name] = netSpace;
    storeData(oldJson, "/app/record.json");
  });

  socket.on("get-net-space", function(name) {
    var netspace = JSON.parse(loadData("/app/record.json"))[name];
    socket.emit("load-map", netspace,name);
  });
});