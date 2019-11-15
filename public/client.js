var socket = io();
var createMode;
var queryString = decodeURIComponent(window.location.search);
  queryString = queryString.substring(1);
var queries = queryString.split("&");
queryString=queries[0];
//queryString = queryString.replace("?", "");
if (queryString == "create") {
  createMode = true;
} else if(queryString ==""){
 window.location.replace("/about");

}
else {
  createMode = false;
}
var clickable;
var input = document.getElementById("input");



  $("#hacker").show();
  input.focus();
  input.select();
  clickable = false;
  setUpHackerMode();

var map = [
  [0, "Empty", 0, ""],
  [1, "Password", 11, "12345"],
  [2, "File", 15, "Security Plans"]
];
var currentLevel = 0;
var levelStatus = "";
var rollIsFor = "";
var knownMap;

if (!clickable) {
  input.focus();
  input.select();
}
document.onclick = function() {
  if (!clickable) {
    input.focus();
    input.select();
  }
};
function setUpHackerMode() {
  if (queryString != "") {
    socket.emit("get-net-space", queryString);
  }
}
socket.on("load-map", function(loadedMap, name) {
  map = loadedMap;
  if (queryString != "") $("#title").text("Netrunning: " + name);
   levelStatus = map[0][1];
  onLevel();
});
input.addEventListener("keyup", function(event) {
  // Execute a function when the user releases a key on the keyboard
  if (event.keyCode === 13) {
    // Number 13 is the "Enter" key on the keyboard
    inputEntered(input.value);
    input.value = "";
  }
});

var knownCommands = [
  "Move up",
  "Move down",
  "Backdoor",
  "Pathfinder",
  "Virus",
  "Level",
  "Attack",
  "Eye-Dee",
  "Eye-dee",
  "Eyedee",
  "Eye",
  "Move",
  "Password",
  "Slide",
  "Banhammer",
  "Jack",
  "Cloak",
  "Control",
  "Zap",
  "Map",
  "Copy"
];
var noRollNeeded = ["Level", "Move","Password","Jack","Map","Copy"];

//on input
function inputEntered(inputValue) {
  inputValue = inputValue.charAt(0).toUpperCase() + inputValue.slice(1); //make first letter Uppercase
  addLogText(inputValue, true); //add user's text to log
  var entries = inputValue.split(" ");
  if (entries.length == 1) {
    if (!isNaN(inputValue) && inputValue != "") {
      //if one roll
      inputValue = parseInt(inputValue);
      callCommand(rollIsFor, inputValue);
      rollIsFor = "";
    } else {
      onCommand(inputValue);
    }
  } else { // if multiple words
    var command = entries[0];
    var roll ="";
    var extraInfo = "";
    //extraInfo = entries[1];
    for (var i = 1; i < entries.length - 1; i++) {
      extraInfo = extraInfo + " " + entries[i];
       console.log("extraInfo = "+extraInfo);
    }
    var lastWord = entries[entries.length - 1];
    if (isNaN(lastWord)) {
      //if last word is not number
      if(extraInfo) extraInfo = extraInfo + " " +lastWord; //depending 
      else extraInfo = extraInfo +lastWord;
    } else {
      // if last word is number
       roll = lastWord;
    }
    // console.log("extraInfo = "+extraInfo);
    onCommand(command,roll,extraInfo);
  }
}

function onCommand(command, roll, extraInfo) {
 //  console.log("onCommand called "+command +" roll = "+roll+" info = "+extraInfo);
  var isKnown = knownCommands.indexOf(command) != -1;
  var rollNeeded = noRollNeeded.indexOf(command) == -1;
  if (!isKnown) {
    if (command != "") addLogText("Command Unknown.");
  } else if (!rollNeeded) {
    callCommand(command,roll,extraInfo);
  } else {//roll is needed
    if (!roll) {
      addLogText("Roll <b> 1d10 </b>+ Interface.");
      rollIsFor = command;
    } else {
      callCommand(command, roll, extraInfo);
    }
  }
}


function callCommand(command, roll, extraInfo) {
  switch (command) {
    case "Backdoor":
      onBackdoor(roll);
      break;
    case "Level":
      onLevel();
      break;
    case "Pathfinder":
      onPathFinder(roll);
      break;
    case "Move":
      move(extraInfo);
      break;
    case "Move down":
      move("down");
      break;
    case "Eye-Dee":
      onEyeDee(roll);
      break;
    case "EyeDee":
      onEyeDee(roll);
      break;
    case "Eyedee":
      onEyeDee(roll);
      break;
    case "Eye-dee":
      onEyeDee(roll);
      break;
    case "Eye":
        onEyeDee(roll);
      break;
    case "Password":
      onPassword(extraInfo);
      break;
    case "Slide":
     onSlide(roll);
      break;
    case "Banhammer":
     onBanhammer(roll);
      break;
    case "Jack":
     onJack(extraInfo);
      break;
    case "Control":
    onControl(roll);
      break;
    case "Cloak":
    onCloak(roll);
      break;
    case "Zap":
    onZap(roll);
      break;
    case "Map":
    onMap();
      break;
    case "Copy":
    onCopy();
      break;
  }
}
function onLevel() {
  addLogText("You are on <b>Level " + currentLevel + ": " + map[currentLevel][1] + "</b>");
  //get public info and add
  
  if(levelStatus == "Virus"){
    addLogText("Virus is "+map[currentLevel][3]);
  }else if(levelStatus=="Control Node"){
    addLogText("Control Node controls "+map[currentLevel][3]);
  }
  
  
}
function move(direction) {
  if (direction == "up" || direction == "Up") {
    currentLevel--;
    if(currentLevel<0){
      addLogText("You are already at the top level.");
      currentLevel++;
    }else{
    levelStatus = map[currentLevel][1];
    onLevel();
    }
  } else if (direction == "down" || direction == "Down") {
    if (levelStatus == "Password"||levelStatus=="Hellhound") {
      addLogText("You cannot move down past a "+levelStatus+".");
    } else {
      currentLevel++;
      if (currentLevel >= map.length) {
        currentLevel--;
        addLogText("You are already on the last level.");
      } else {
        levelStatus = map[currentLevel][1];
        onLevel();
      }
    }
  }
}


function addLogText(text, user, damage) {
  var userText = document.createElement("P");
  userText.innerHTML = text;
  if (user) userText.className = "userText";
  else if (damage) userText.className = "damageText";
  var log = document.getElementById("log");
  log.appendChild(userText);
  // window.scrollTo(0,document.body.scrollHeight);
}
function onBackdoor(roll) {
  if (levelStatus != "Password")
    addLogText("Backdoor can only be used on a password.");
  else if (rollPasses(roll)) {
    addLogText("Success");
    nextLevelDown();
  } else {
    addLogText("Backdoor attempt was unsuccessful.");
  }
}


function onSlide(roll){
  if(levelStatus != "Hellhound"){ 
    addLogText("Slide can only be used on a Hellhound or Black Ice.");
  }else{
    if(rollPasses(roll)){
      addLogText("Slide successful.");
      nextLevelDown();
    }else{
      addLogText("Slide attempt failed.");
    }
  }
  
  
}

function onBanhammer(roll){
  addLogText("Banhammer with attempt of <b>"+roll+"</b>.");
}
function onJack(extraInfo){
  if(extraInfo=="Out"||extraInfo=="out"){
  addLogText("You have left the netspace.")
    currentLevel=0;
    knownMap = 0;
  }else{
    addLogText("Command Unknown");
  }
}
function onEyeDee(roll) {
 // console.log("onEyeDee roll = "+roll);
  if (levelStatus != "File") addLogText("Eye-Dee can only be used on a File.");
  else if (rollPasses(roll)) {
    addLogText("Success");
    addLogText("File contents: " + map[currentLevel][3]);
  } else {
    addLogText("Eye-Dee attempt was unsuccessful.");
  }
}


function onPassword(password){
  if(levelStatus != "Password"&& levelStatus!= "Hellhound"){
    addLogText("Password can only be used on Password or Hellhound levels.");
  }else{
  var correctPassword = map[currentLevel][3];
  console.log("password = :"+password+": correctPassword = :"+correctPassword+": is correct ="+(password==correctPassword));
  if(password == correctPassword && password!=""){ 
    addLogText("Password <b>"+password+"</b> is correct.");
    nextLevelDown();
  }else{
    addLogText("Incorrect Password");
  }
}
}

function onControl(roll){
  if(rollPasses(roll)){
     addLogText("You have successfully taken control of this node.");
  }else{
     addLogText("Control attempt failed.");
  }
}

function onCloak(roll){
  var dv = map.length * 2;
  if(rollPasses(roll, dv)){
    addLogText("You have successfully cloaked your actions.")
  }else{
    addLogText("Cloak attempt unsuccessful.")
  }
}

function onZap(roll){
  addLogText("Zap attempt");
}

function onMap(){
  if(!knownMap) {
    addLogText("You must use Pathfinder to discover the netspace map before you can view it.");
  }else{
    console.log("currentLevel = "+currentLevel+" knownMap = "+knownMap);
    if(currentLevel +1 >=knownMap)knownMap = currentLevel +1;
    generateMap(knownMap);
  }
}

function onPathFinder(roll) {
  var levels = 0;
      if(roll <= 5){
      levels = 1;
      }else if(roll > 5 &&roll <= 10){
        levels =2 ;
      }
      else if(roll> 10 &&roll <= 13){
        levels =3 ;
      }
      else if(roll>13&&roll<=15){
        levels =4 ;
      }
      else if(roll>15&&roll<=17){
        levels =5 ;
      }
      else if(roll>17){
        levels =6 ;
      }
  
  var visibleLevels=currentLevel+1+levels;
  
  generateMap(visibleLevels);
  }
 
  

// function generateMap(currentLevel,additionalLevels) {
  function generateMap(visibleLevels) {
    console.log("generate map visibleLevels = "+visibleLevels);
  var visibleMap = "";
//   currentLevel++;
//   var visibleLevels = currentLevel+additionalLevels;
  
  var originalLevels = visibleLevels;
  
  if (map.length<visibleLevels) visibleLevels=map.length;
  knownMap=originalLevels;
  for (var i = 0; i < visibleLevels; i++) {
    if(currentLevel == i )visibleMap += "<b>Level " + map[i][0] + ": " + map[i][1] + "</b><br>";
    else visibleMap += "Level " + map[i][0] + ": " + map[i][1] + "<br>";
  }

  console.log("map length = "+map.length+" originalLevels = "+originalLevels);
  if(map.length > originalLevels-1){
    visibleMap += "Unknown";
  }else{
     visibleMap += "End";
  }
  addLogText(visibleMap);
}

function rollPasses(roll,dv){
  if (!dv)  dv = map[currentLevel][2];
  if(dv==""||dv==undefined|| isNaN(dv)) dv = 0;
  dv=parseInt(dv);
  roll=parseInt(roll);
  
  //console.log("roll passes roll= "+roll+" dv = "+dv);
  return roll >= dv;
}

function nextLevelDown(){
  currentLevel++;
  if (currentLevel >= map.length) {
        //think equal
        currentLevel--;
        addLogText("You are already on the last level.");
      } else {
        levelStatus = map[currentLevel][1];
       onLevel();
      }
}


function onDiceRoll(multiple,dice){
  var total=0;
  for(var i=0;i<multiple;i++){
    total += Math.floor(Math.random() * dice) + 1;
  }
  console.log("onDiceRoll "+total);
  return total;
}

function onCopy(){
  var allText=$("p");
  var string =""
  for(var i= 0; i< allText.length; i++){
    string+=allText[i].innerText +" \n";
  }
  copyText(string);
}

function copyText(text) {
  var p = document.createElement('P');
  p.innerText=text;
  var log = document.getElementById("log");
  log.appendChild(p);
  selectText(p);
  document.execCommand("copy");
  p.remove();
  addLogText("Netspace Log copied to your clipboard.");
}
function selectText(node) {
  if (document.body.createTextRange) {
    const range = document.body.createTextRange();
    range.moveToElementText(node);
    range.select();
  } else if (window.getSelection) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    alert("Could not select text: Unsupported browser.");
  }
}
//------------------------------------------------------------------------------------- Create mode code --------------------------------------
// function addNewLevel() {
//   var lastLevel = document.getElementById("Level 0");
//   var newLevel = lastLevel.cloneNode(true);
//   var children = newLevel.children;
//   children[0].innerHTML = "Level " + makingLevel;
//   children[2].value = "";
//   children[3].value = "";
//   children[3].placeholder = "";
//   newLevel.id = "Level " + makingLevel;
//   makingLevel++;
//   var create = document.getElementById("create");
//   create.appendChild(newLevel);
// }
// function deleteLevel() {
//   var oldLevelNumber = makingLevel - 1;
//   var oldLevel = document.getElementById("Level " + oldLevelNumber);
//   if (oldLevelNumber != 0) {
//     oldLevel.remove();
//     makingLevel--;
//   }
// }
// function onLevelTypeChange(elmt) {
//   var textArea = elmt.parentNode.children[3];
//   if (elmt.value == "File") textArea.placeholder = "File contents when opened";
//   else if (elmt.value == "Empty") textArea.placeholder = "";
//   else if (elmt.value == "Password") textArea.placeholder = "Correct password";
//   else if (elmt.value == "Virus")
//     textArea.placeholder = "What the Virus is doing";
//   else if (elmt.value == "Hellhound") textArea.placeholder = "";
//   else if (elmt.value == "Control Node")
//     textArea.placeholder = "What the Control Node controls";
// }
// function generateNetSpace() {
//   var newNetSpace = [];
//   var newLevelArray = [];
//   for (var j = 0; j < makingLevel; j++) {
//     var level = document.getElementById("Level " + j);
//     newLevelArray.push(j);
//     for (var i = 1; i < 4; i++) {
//       newLevelArray.push(level.children[i].value);
//     }
//     newNetSpace.push(newLevelArray);
//     newLevelArray = [];
//   }
//   console.log(newNetSpace);
//   var name = document.getElementById("netSpaceName").value;
//   if (name == "") {
//     alert("New Netspace name cannot be blank.");
//   } else {
//     socket.emit("new-net-space", name, newNetSpace);
//     $("#newUrl").show();
//     $("#url").text("netrunning.glitch.me/?" + name);
//     var url = $("#url");
//     selectText("url");
//   }
// }
// function selectText(id) {
//   var node = document.getElementById(id);
//   if (document.body.createTextRange) {
//     const range = document.body.createTextRange();
//     range.moveToElementText(node);
//     range.select();
//   } else if (window.getSelection) {
//     const selection = window.getSelection();
//     const range = document.createRange();
//     range.selectNodeContents(node);
//     selection.removeAllRanges();
//     selection.addRange(range);
//   } else {
//     alert("Could not select text: Unsupported browser.");
//   }
// }
// function copyUrl() {
//   var url = $("#url");
//   selectText("url");
//   url.select;
//   document.execCommand("copy");
// }
// function openLink() {
//   var link = $("#url").text();
//   link = "http://" + link;
//   window.open(link);
// }
