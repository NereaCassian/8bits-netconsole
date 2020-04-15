var socket = io();


var queryString = decodeURIComponent(window.location.search);
queryString = queryString.substring(1);
var queries = queryString.split("&");
queryString = queries[0];



loadReport();


function loadReport(){
  //get record
socket.emit("get-report",queryString);
  
  
}

socket.on("load-report", function(report,name) {
  console.log("report = "+report+"name = "+name);
  
  for(var i=0;i<report.length;i++){
    var user;
    if(report[i][1]=="userText") user = true;
    else user = false;
    addLogText(report[i][0], user);
  }
  
});


function addLogText(text, user, damage) {
  var userText = document.createElement("P");
  userText.innerHTML = text;
  if (user) userText.className = "userText";
  else if (damage) userText.className = "damageText";
  var log = document.getElementById("log");
  log.appendChild(userText);
  // if(!user) window.scrollTo(0,document.body.scrollHeight);
}