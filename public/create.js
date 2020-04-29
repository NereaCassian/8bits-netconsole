var socket = io();
var makingLevel = 1;
$("#newUrl").hide();

function addNewLevel() {
  var lastLevel = document.getElementById("Level 0");
  var newLevel = lastLevel.cloneNode(true);
  var children = newLevel.children;
  children[0].innerHTML = "Level " + makingLevel;
  children[2].value = "";
  children[3].value = "";
  children[3].placeholder = "(Optional) Note";
  newLevel.id = "Level " + makingLevel;
  makingLevel++;
  var create = document.getElementById("create");
  create.appendChild(newLevel);
}
function deleteLevel() {
  var oldLevelNumber = makingLevel - 1;
  var oldLevel = document.getElementById("Level " + oldLevelNumber);
  if (oldLevelNumber != 0) {
    oldLevel.remove();
    makingLevel--;
  }
}
function onLevelTypeChange(elmt) {
  var textArea = elmt.parentNode.children[3];
  if (elmt.value == "File") textArea.placeholder = "File contents when opened";
  else if (elmt.value == "Empty") textArea.placeholder = "(Optional) Note";
  else if (elmt.value == "Password") textArea.placeholder = "Correct password";
  else if (elmt.value == "Virus")
    textArea.placeholder = "What the Virus is doing";
  else if (elmt.value == "Hellhound")
    textArea.placeholder = "HP/Attack/Defence/Percept";
  else if (elmt.value == "Control Node")
    textArea.placeholder = "What the Control Node controls";
  
  var dvArea = elmt.parentNode.children[2];
  if(elmt.value =="Hellhound"){
    dvArea     
  }
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
  if (name == "") {
    alert("New Netspace name cannot be blank.");
  } else if (name.includes("&")) {
    alert("New Netspace name cannot contain '&'");
  } else if (name.includes("?")) {
    alert("New Netspace name cannot contain '?'");
  } else if (name == "example") {
    alert(
      "'example' is a protected Netspace name, please choose another name."
    );
  } else {
    socket.emit("new-net-space", name, newNetSpace);
    $("#newUrl").show();
    $("#url").text("netrunning.glitch.me/?" + name);
    var url = $("#url");
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
    alert("Could not select text: Unsupported browser.");
  }
}
function copyUrl() {
  var url = $("#url");
  selectText("url");
  url.select;
  document.execCommand("copy");
}
function openLink() {
  var link = $("#url").text();
  link = "http://" + link;
  window.open(link);
}
