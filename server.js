const express = require("express");
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const got = require('got');

const fs = require('fs');





app.use(express.static("public"));


app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

// listen for requests :)
// const listener = app.listen(process.env.PORT, function() {
//   console.log("Your app is listening on port " + listener.address().port);
// });


app.set('port', (process.env.PORT || 5000));
http.listen(app.get('port'), function(){
  console.log('listening on port',app.get('port'));
});


const storeData = (data, path) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data))
  } catch (err) {
    console.error(err)
  }
}
  

const loadData = (path) => {
  try {
    return fs.readFileSync(path, 'utf8')
  } catch (err) {
    console.error(err)
    return false
  }
}


io.on('connection', function(socket){
//console.log("connected");
socket.on('new-net-space',function(name,netSpace){ // Listen for new-player event on this client 
  //  socket.broadcast.emit('text-changed',"howdy");
      //get old record.json
  //update with new data
  
  
  //storeData("hi,78","/app/record.json");
 // console.log("new net space = "+netSpace);
 
  
  var retrieved = JSON.parse(loadData("/app/record.json"))["Example"];
  //console.log("2 = "+retrieved[2]);
  
  var oldJson=JSON.parse(loadData("/app/record.json"));
  oldJson["name]=netSpace;
  console.log(oldJson);
  storeData(oldJson,"/app/record.json");
  
  
  
  
  
  
    })

})