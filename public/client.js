var socket=io();
var createMode;

var queryString = decodeURIComponent(window.location.search);
//  queryString = queryString.substring(1);
queryString = queryString.replace("?", "");
if (queryString == "create") {
  createMode = true;
} else {
  createMode = false;
}

var clickable;
var input = document.getElementById("input");
  $("#newUrl").hide();
if (createMode) {
  $("#hacker").hide();
  $("#createMode").show();
  clickable = true;
} else {
  $("#hacker").show();
  $("#createMode").hide();
  input.focus();
  input.select();
  clickable = false;
  setUpHackerMode();
}

var map = [
  ["Level 0", "Empty", 0, ""],
  ["Level 1", "Password", 11, "12345"],
  ["Level 2", "File", 15, "Security Plans"]
];
var currentLevel = 0;
var levelStatus = "";

var rollIsFor = "";

var makingLevel = 1;

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

function setUpHackerMode(){
  if(queryString !=""){
    $("#title").text("Netrunning: "+queryString);
    socket.emit("get-net-space",queryString);
    
  }
}

socket.on("load-map", function(loadedMap) {
  map=loadedMap;
  console.log("new map added");
});




input.addEventListener("keyup", function(event) {
  // Execute a function when the user releases a key on the keyboard

  if (event.keyCode === 13) {
    // Number 13 is the "Enter" key on the keyboard
    inputEntered(input.value);
    input.value = "";
  }
});

function inputEntered(inputValue) {
  inputValue = inputValue.charAt(0).toUpperCase() + inputValue.slice(1);
  addLogText(inputValue, true);

  //split
  //if last part is a number
  //backdoor (roll)

  if (inputValue == "Backdoor") {
     console.log("Backdoor dv = "+map[currentLevel][2]);
    rollIsFor = "Backdoor";
    addLogText("Roll <b> 1d10 </b>+ Interface.");
  } else if (inputValue == "Pathfinder") {
    rollIsFor = "Pathfinder";
    addLogText("Roll <b> 1d10 </b>+ Interface.");
    //addLogText(map[currentLevel][0], false);
  } else if (inputValue == "Move down") {
    if (levelStatus == "Password") {
      addLogText("You cannot move down past a password.");
    } else {
      currentLevel++;
      if (currentLevel > map.length) {
        currentLevel--;
        addLogText("You are already on the last level.");
      } else {
        levelStatus = map[currentLevel][1];
        addLogText(
          "You are on <b>Level " +
            currentLevel +
            ": " +
            map[currentLevel][1] +
            "</b>"
        );
      }
    }
  } else if (inputValue == "Move up") {
    currentLevel--;
    levelStatus = map[currentLevel][1];
    addLogText(
      "You are on <b>Level " +
        currentLevel +
        ": " +
        map[currentLevel][1] +
        "</b>",
      false
    );
  } else if (inputValue == "Attack") {
    currentLevel--;
    addLogText("Roll 3d6.");
    addLogText("Take <b> 5 </b>damage.", false, true);
  } else if (inputValue == "Jack out" || inputValue == "Jack Out") {
    addLogText("You have left the netspace.", false);
    currentLevel = 0;
  } else if (inputValue == "Level") {
    addLogText(
      "You are on <b>Level " +
        currentLevel +
        ": " +
        map[currentLevel][1] +
        "</b>",
      false
    );
  } else if (
    inputValue == "Eye-Dee" ||
    inputValue == "Eye-dee" ||
    inputValue == "Eyedee" ||
    inputValue == "EyeDee"
  ) {
    rollIsFor = "Eye-Dee";
    addLogText("Roll <b> 1d10 </b>+ Interface.");
  } else if (!isNaN(inputValue) && inputValue != "") {
    //if is a number and not blank
    //check what roll is for
    if (rollIsFor == "Backdoor") onBackdoor(inputValue);
    // addLogText(rollIsFor);
    else if (rollIsFor == "Eye-Dee") {
      onEyeDee(inputValue);
    } else if (rollIsFor == "Pathfinder") {
      onPathFinder(inputValue);
    }
    rollIsFor = "";
  } else if (inputValue != "") {
    addLogText("Command Unknown");
  }
}

function addLogText(text, user, damage) {
  var userText = document.createElement("P");
  userText.innerHTML = text;
  if (user) userText.className = "userText";
  else if (damage) userText.className = "damageText";
  var log = document.getElementById("log");
  log.appendChild(userText);
}

function onBackdoor(roll) {
  console.log("Backdoor Roll = "+roll+" dv = "+map[currentLevel][2]);
  console.log(roll+" is bigger than "+map[currentLevel][2]+" = "+(roll>=map[currentLevel][2]));
  if (levelStatus != "Password")
    addLogText("Backdoor can only be used on a password.");
  else if (roll >= map[currentLevel][2]) {
    addLogText("Success");
    currentLevel++;
    levelStatus = map[currentLevel][1];
    addLogText(
      "You are on <b>Level " +
        currentLevel +
        ": " +
        map[currentLevel][1] +
        "</b>",
      false
    );
  } else {
    addLogText("Backdoor attempt was unsuccessful.");
  }
}

function onEyeDee(roll) {
  if (levelStatus != "File") addLogText("Eye-Dee can only be used on a File.");
  else if (roll >= map[currentLevel][2]) {
    addLogText("Success");

    addLogText("File contents: " + map[currentLevel][3]);
  } else {
    addLogText("Eye-Dee attempt was unsuccessful.");
  }
}

function onPathFinder(roll) {
  generateMap();
}

function generateMap() {
  var visibleMap = "";
  for (var i = 0; i < map.length; i++) {
    visibleMap += map[i][0] + ": " + map[i][1] + "<br>";
  }
  addLogText(visibleMap);
}

function addNewLevel() {
  var lastLevel = document.getElementById("Level 0");
  var newLevel = lastLevel.cloneNode(true);
  var children = newLevel.children;

  children[0].innerHTML = "Level " + makingLevel;

  children[2].value = "";
  children[3].value = "";
  children[3].placeholder = "";

  newLevel.id = "Level " + makingLevel;
  //newLevel.children
  makingLevel++;

  var create = document.getElementById("create");
  create.appendChild(newLevel);
}

function deleteLevel() {
  var oldLevelNumber = makingLevel - 1;
  var oldLevel = document.getElementById("Level " + oldLevelNumber);
  if(oldLevelNumber!=0){
  oldLevel.remove();
  makingLevel--;
  }
}

function onLevelTypeChange(elmt) {
  var textArea = elmt.parentNode.children[3];

  if (elmt.value == "File") textArea.placeholder = "File contents when opened";
  else if (elmt.value == "Empty") textArea.placeholder = "";
  else if (elmt.value == "Password") textArea.placeholder = "Correct password";
  else if (elmt.value == "Virus")
    textArea.placeholder = "What the Virus is doing";
  else if (elmt.value == "Hellhound") textArea.placeholder = "";
  else if (elmt.value == "Control Node")
    textArea.placeholder = "What the Control Node controls";
}

function generateNetSpace() {
  var newNetSpace = [];
  var newLevelArray = [];

  for (var j = 0; j < makingLevel; j++) {
    var level = document.getElementById("Level " + j);
    newLevelArray.push(j);
    for (var i = 1; i < 4; i++) {
      newLevelArray.push(level.children[i].value);
    }
    newNetSpace.push(newLevelArray);
    newLevelArray = [];
  }
  console.log(newNetSpace);
  
  var name = document.getElementById("netSpaceName").value;
  
  if(name==""){
    alert("New Netspace name cannot be blank.");
  }else{
    socket.emit("new-net-space",name,newNetSpace);
  
    $("#newUrl").show();
    $("#url").text("netrunning.glitch.me/?"+name);
  var url=$("#url");
    selectText("url");
  }
  
 
}

function selectText(id) {
   var node = document.getElementById(id);

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
        console.warn("Could not select text in node: Unsupported browser.");
    }
}


function copyUrl(){
  var url=$("#url");
 selectText("url");
  url.select;
  document.execCommand('copy');
}