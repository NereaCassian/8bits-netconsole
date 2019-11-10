const express = require("express");
const app = express();
// const http = require('http').Server(app);
// const io = require('socket.io')(http);


// const fs = require('fs');





app.use(express.static("public"));


app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

// const storeData = (data, path) => {
//   try {
//     fs.writeFileSync(path, JSON.stringify(data))
//   } catch (err) {
//     console.error(err)
//   }
// }
  

// const loadData = (path) => {
//   try {
//     return fs.readFileSync(path, 'utf8')
//   } catch (err) {
//     console.error(err)
//     return false
//   }
// }


// io.on('connection', function(socket){
// console.log("connected");
// socket.on('new-net-space',function(netSpace){ // Listen for new-player event on this client 
//   //  socket.broadcast.emit('text-changed',"howdy");
//       //get old record.json
//   //update with new data
//   //storeData("hi,78","/app/record.json");
//   console.log("new net space = "+netSpace);
//   console.log("hello");
//     })

// })