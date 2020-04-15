var socket = io();


var queryString = decodeURIComponent(window.location.search);
queryString = queryString.substring(1);
var queries = queryString.split("&");
queryString = queries[0];

console.log("queryString = "+queryString);

loadReport();


function loadReport(){
  //get record
socket.emit("get-report",queryString);
  
  
}

socket.on("load-report", function(report,name) {
  console.log("report = "+report+"name = "+name);
});