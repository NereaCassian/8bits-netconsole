var socket = io();
var createMode;
var queryString = decodeURIComponent(window.location.search);
queryString = queryString.substring(1);
var queries = queryString.split("&");
queryString = queries[0];
//queryString = queryString.replace("?", "");
if (queryString == "create") {
  createMode = true;
} else if (queryString == "") {
  window.location.replace("/about");
} else {
  createMode = false;
}
var clickable;
var input = document.getElementById("input");
var lastEnteredCommand;

// $("#hacker").show();
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
  "ID",
  "Move",
  "Password",
  "Slide",
  "Banhammer",
  "Jack",
  "Cloak",
  "Control",
  "Zap",
  "Map",
  "Copy",
  "Roll",
  "List",
  "Help",
  "Remove",
  "Leave",
  "Share"
];
var noRollNeeded = [
  "Level",
  "Move",
  "Password",
  "Jack",
  "Map",
  "Copy",
  "Roll",
  "List",
  "Help",
  "Share"
];

//on input
function inputEntered(inputValue) {
  inputValue =
    inputValue.charAt(0).toUpperCase() + inputValue.slice(1).toLowerCase(); //make first letter Uppercase
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
  } else if (entries[0] == "") {
    // var newInput="";
    //    for(var i=0;i<entries.length;i<entries){
    //    newInput+=entries[i]+" ";
    //  }
    inputEntered(entries[1]);
  } else {
    // if multiple words
    var command = entries[0];
    var roll = "";
    var extraInfo = "";
    //extraInfo = entries[1];

    // extraInfo = entries[1];

    for (var i = 1; i < entries.length - 1; i++) {
      if (i == 1) extraInfo = extraInfo + entries[i];
      else extraInfo = extraInfo + " " + entries[i];
    }
    var lastWord = entries[entries.length - 1];
    if (isNaN(lastWord)) {
      //if last word is not number
      if (extraInfo) extraInfo = extraInfo + " " + lastWord;
      //depending
      else extraInfo = extraInfo + lastWord;
    } else {
      // if last word is number
      roll = lastWord;
    }
    onCommand(command, roll, extraInfo);
  }
}

function onCommand(command, roll, extraInfo) {
  //  console.log("onCommand called "+command +" roll = "+roll+" info = "+extraInfo);
  var isKnown = knownCommands.indexOf(command) != -1;
  var rollNeeded = noRollNeeded.indexOf(command) == -1;
  if (!isKnown) {
    if (command != "") commandUnknown(command);
  } else if (!rollNeeded) {
    callCommand(command, roll, extraInfo);
  } else {
    //roll is needed
    if (!roll) {
      addLogText("Roll <b> 1d10 </b>+ Interface.");
      rollIsFor = command;
    } else {
      callCommand(command, roll, extraInfo);
    }
  }
}

function commandUnknown(command) {
  var strings = command.split("d");
  if (strings.length > 1) {
    if (!isNaN(strings[0]) && !isNaN(strings[1])) {
      onRoll(command);
    } else {
      addLogText("Command '" + command + "' Unknown.");
    }
  } else {
    addLogText("Command '" + command + "' Unknown.");
  }
}

function callCommand(command, roll, extraInfo) {
  // added
  //input.select();
  // window.scrollTo(0,document.body.scrollHeight);
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
    case "Eye-Dee":
      onEyeDee(roll);
      break;
    case "EyeDee":
      onEyeDee(roll);
      break;
    case "Eyedee":
      onEyeDee(roll);
      break;
    case "ID":
      onEyeDee(roll);
    case "Eye-dee":
      onEyeDee(roll);
      break;
    case "Eye":
      onEyeDee(roll);
      break;
    case "Password":
      onPassword(extraInfo, roll);
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
    case "Roll":
      onRoll(extraInfo);
      break;
    case "List":
      onList();
      break;
    case "Help":
      onHelp(extraInfo);
      break;
    case "Remove":
      onRemove(roll);
      break;
    case "Leave":
      onLeave(roll);
    case "Share":
      onShare();
  }
}
function onLevel() {
  addLogText(
    "You are on <b>Level " + currentLevel + ": " + map[currentLevel][1] + "</b>"
  );
  //get public info and add

  if (levelStatus == "Virus") {
    addLogText("Virus is " + map[currentLevel][3]);
  } else if (levelStatus == "Control Node") {
    addLogText("Control Node controls " + map[currentLevel][3]);
  } else if (levelStatus == "Empty" && map[currentLevel][3]) {
    addLogText("Note: " + map[currentLevel][3]);
  }
}
function move(direction) {
  if (direction == "up" || direction == "Up") {
    currentLevel--;
    if (currentLevel < 0) {
      addLogText("You are already at the top level.");
      currentLevel++;
    } else {
      levelStatus = map[currentLevel][1];
      onLevel();
    }
  } else if (direction == "down" || direction == "Down") {
    if (levelStatus == "Password" || levelStatus == "Hellhound") {
      addLogText("You cannot move down past a " + levelStatus + ".");
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
  } else {
    //direction is not up or down
    addLogText("Move commands must be 'Move up' or 'Move down'");
  }
}

function addLogText(text, user, damage) {
  var userText = document.createElement("P");
  userText.innerHTML = text;
  if (user) userText.className = "userText";
  else if (damage) userText.className = "damageText";
  var log = document.getElementById("log");
  log.appendChild(userText);
  // if(!user) window.scrollTo(0,document.body.scrollHeight);
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

function onSlide(roll) {
  if (levelStatus != "Hellhound") {
    addLogText("Slide can only be used on a Hellhound or Black Ice.");
  } else {
    if (rollPasses(roll)) {
      addLogText("Slide successful.");
      nextLevelDown();
    } else {
      addLogText("Slide attempt failed.");
    }
  }
}

function onBanhammer(roll) {
  addLogText("Banhammer with attempt of <b>" + roll + "</b>.");
}
function onJack(extraInfo) {
  if (extraInfo == "Out" || extraInfo == "out") {
    addLogText("You have left the netspace.");
    currentLevel = 0;
    knownMap = 0;
  } else {
    //  addLogText("Command Unknown");
    commandUnknown("Banhammer");
  }
}
function onEyeDee(roll) {
  // console.log("onEyeDee roll = "+roll);
  if (levelStatus != "File") addLogText("Eye-Dee can only be used on a File.");
  else if (rollPasses(roll)) {
    addLogText("Success");

    var tempFileContents = map[currentLevel][3];
    tempFileContents = tempFileContents.replace(/\n/g, "<br>");
    addLogText("File contents: " + tempFileContents); //changing to br on temp contents
    // addLogText("File contents: " + map[currentLevel][3]);
  } else {
    addLogText("Eye-Dee attempt was unsuccessful.");
  }
}

function onPassword(password, roll) {
  if (levelStatus != "Password") {
    addLogText("Password can only be used on Password levels.");
  } else {
    if (!password && roll) password = roll;

    var correctPassword = map[currentLevel][3];
    console.log(
      "attempted password = '" +
        password +
        "' correct password = '" +
        correctPassword +
        "'"
    );
    if (password == correctPassword && password != "") {
      addLogText("Password <b>" + password + "</b> is correct.");
      nextLevelDown();
    } else {
      addLogText("Incorrect Password");
    }
  }
}

function onRemove(roll) {
  if (levelStatus != "Virus") {
    addLogText("Remove Virus can only be used on a virus.");
  } else {
    if (rollPasses(roll)) {
      addLogText("You have successfully removed this virus");
      map[currentLevel][1] = "Empty";
      map[currentLevel][2] = "";
      map[currentLevel][3] = "";
      levelStatus = "Empty";
      onLevel();
    } else {
      addLogText("Virus removal attempt failed.");
    }
  }
}

function onControl(roll) {
  //check level status
  if (rollPasses(roll)) {
    addLogText("You have successfully taken control of this node.");
  } else {
    addLogText("Control attempt failed.");
  }
}

function onCloak(roll) {
  var dv = map.length * 2;
  if (rollPasses(roll, dv)) {
    addLogText("You have successfully cloaked your actions.");
  } else {
    addLogText("Cloak attempt unsuccessful.");
  }
}

function onZap(roll) {
  addLogText("Zap attempt");
}

function onMap() {
  if (!knownMap) {
    // addLogText(
    //   "You must use Pathfinder to discover the netspace map before you can view it."
    // );
    generateMap(1);
  } else {
    // console.log("currentLevel = " + currentLevel + " knownMap = " + knownMap);
    if (currentLevel + 1 >= knownMap) knownMap = currentLevel + 1;
    generateMap(knownMap);
  }
}

function onPathFinder(roll) {
  var levels = 0;
  if (roll <= 5) {
    levels = 1;
  } else if (roll > 5 && roll <= 10) {
    levels = 2;
  } else if (roll > 10 && roll <= 13) {
    levels = 3;
  } else if (roll > 13 && roll <= 15) {
    levels = 4;
  } else if (roll > 15 && roll <= 17) {
    levels = 5;
  } else if (roll > 17) {
    levels = 6;
  }

  var visibleLevels = currentLevel + 1 + levels;

  generateMap(visibleLevels);
}

function generateMap(visibleLevels) {
  var visibleMap = "";
  var originalLevels = visibleLevels;

  if (map.length < visibleLevels) visibleLevels = map.length;
  knownMap = originalLevels;
  //if virus undiscovered new map replace virus with file
  for (var i = 0; i < visibleLevels; i++) {
    if (currentLevel == i)
      visibleMap += "<b>Level " + map[i][0] + ": " + map[i][1] + "</b><br>";
    else visibleMap += "Level " + map[i][0] + ": " + map[i][1] + "<br>";
  }

  if (map.length > originalLevels - 1) {
    visibleMap += "Unknown";
  } else {
    visibleMap += "End";
  }
  visibleMap = visibleMap.replace(/Virus/g, "File");

  addLogText(visibleMap);
}

function updateKnownMap(knownLevel) {}

function rollPasses(roll, dv) {
  if (!dv) dv = map[currentLevel][2];
  if (dv == "" || dv == undefined || isNaN(dv)) dv = 0;
  dv = parseInt(dv);
  roll = parseInt(roll);
  return roll >= dv;
}

function nextLevelDown() {
  currentLevel++;
  if (currentLevel >= map.length) {
    currentLevel--;
    addLogText("You are already on the last level.");
  } else {
    levelStatus = map[currentLevel][1];
    onLevel();
  }
}

function onRoll(extraInfo) {
  var strings = extraInfo.split("d");
  addLogText(onDiceRoll(strings[0], strings[1]));
}

function onDiceRoll(multiple, dice) {
  var total = 0;
  var string = "";
  for (var i = 0; i < multiple; i++) {
    var thisRoll = Math.floor(Math.random() * dice) + 1;
    string += thisRoll + " ";
    total += thisRoll;
  }
  if (multiple > 1) addLogText(string);
  return total;
}

function onList() {
  var commandsString = "";
  for (var i = 0; i < knownCommands.length; i++) {
    commandsString += knownCommands[i] + "<br>";
  }
  addLogText(commandsString);
}

function onLeave(roll) {
  addLogText("Virus left");
}
function onHelp(topic) {
  var helpArray = [
    ["Navigation", "Level", "Map", "Pathfinder", "Move Down", "Move Up"],
    ["Password", "Password (eg)123", "Backdoor"],
    ["File", "Eyedee", "Move Down"],
    ["Virus", "Remove Virus", "Move Down"],
    ["Control Node", "Control", "Move Down"],
    ["Hellhound", "Attack", "Banhammer", "Flack", "Slide"],
    [
      "Other",
      "(eg)1d10",
      "Roll (eg)3d6",
      "Cloak",
      "Leave Virus",
      "Copy",
      "Help (eg) Virus"
    ]
  ];

  var string = "";
  var legitTopic = false;

  if (topic) {
    topic = topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase();
    if (topic == "Control" || topic == "Control node") topic = "Control Node";
    for (var x = 0; x < helpArray.length; x++) {
      if (topic == helpArray[x][0]) {
        legitTopic = true;
        string += "<b>" + helpArray[x][0] + " commands</b><br>";
        for (var i = 1; i < helpArray[x].length; i++) {
          string += helpArray[x][i] + "<br>";
        }
        addLogText(string);
      }
    }
  }

  if (!topic || !legitTopic) {
    for (var y = 0; y < helpArray.length; y++) {
      string += "<b>" + helpArray[y][0] + " commands</b><br>";
      for (var i = 1; i < helpArray[y].length; i++) {
        string += helpArray[y][i] + "<br>";
      }
      string += "<br>";
    }

    addLogText(string);
  }
}

function onCopy() {
  var allText = $("p");
  var string = "";
  for (var i = 0; i < allText.length; i++) {
    string += allText[i].innerText + " \n";
  }
  copyText(string);
}

function copyText(text) {
  var p = document.createElement("P");
  p.innerText = text;
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


function onShare(){
  
}

function getCurrentKeys() {
  socket.emit("get-current-keys");
}

socket.on("key-names", function(keys) {
  console.log("Keys = " + keys);
});

//hellhound hit points and dv hit points, defence, perception, attack
//defense and attack
//you go first
//options
//attack 1d6
//banhammer 3d6 once per netrun
//slide you roll d10 plus interface hellhound adds d10 plus perception if equal you slide
//flack stops first hit dealing damage no roll just do it

//hellhound rolls 1 d10 and adds attack
//defense 7 attack 8
//you roll interface and d10
//if hellhound is higher you evade
//if hits 3d6 damage
// you role interface
//hellhound d10 and add interface
//you do 1d6 to hellhound
//off hit points
//25 hits points
// have to get hellhounds to 0
// 3 attacks speedy gonalez increases speed
//banhammer 3d6 to hellhound
//flack stops first hit from dealing damage
//flack before hit
//can only use once
// flack is preemptive - next attack no damage
//first successful hit deals no damage
//interface hellhound rolls perception
//is slide roles better than
//banhammer res is attack
//hit 3d6
//once per netrun

//virus
//virus by someone else
//appears as file
// pathfinder
//eyedee shows as virus
//remove it by rolling virus check
//virus remove like password
//1d10 plus interface
//input own virus
//only on last level
//implement own virus
//1d10 plus interface that is the dv of the virus
//virus doesn't stop you moving down
//upload virus
//optional extra homework task update database

//for list new array by situation
//add help
//add level to known map when you're there
//move don says move unknown
//moveup unknown

//map without pathfinder should just show what you know
//unknown not unknown if it's the end or you move down

//space in front of word prints it twice

//space in passwords

// add remove virus

// for copying - copy as is, make a new url save in database to show each p
//check what class it is
//store class name for each p

//eventually not letting you retry eg backdoor
