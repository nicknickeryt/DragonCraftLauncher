const { Client, Authenticator } = require('minecraft-launcher-core');
const launcher = new Client();
const $ = require( "jquery" );
const fs = require('fs');
const http = require('http');
const https = require('https');
const { ipcRenderer } = require('electron');
const { clipboard } = require('electron');
const os = require('os');
const path = require('path');

var slash = "/";
if (os.platform() == "win32") {
  slash = "\\";
  var root = "C:\\Users\\" + require("os").userInfo().username + "\\AppData\\Roaming\\.minecraft";
} else if (os.platform() == "linux") {
  var root = "/home/" + require("os").userInfo().username + "/.minecraft";
} else if (os.platform() == "darwin") {
  var root = require("os").userInfo().username + "Library/Application Support/minecraft";
}


var nconf = require('nconf');
nconf.argv()
.env()
.file({ file: root + slash + 'dragonlauncher.json' });
nconf.load();


if(nconf.get("javaPath") != "undefined" && nconf.get("javaPath") != undefined){
  document.getElementById('java').value = nconf.get("javaPath");
}

var mem_min = nconf.get("mem_min") ? null : "domyślnie";
var mem_max = nconf.get("mem_max") ? null : "domyślnie";
var javaPath = nconf.get("javaPath") ? null : "wbudowana";

document.getElementById('java').value = javaPath;
document.getElementById('mem_min').value = mem_min;
document.getElementById('mem_max').value = mem_max;


function doWin (action) {
    if (action == 'close') {
      nconf.set("javaPath", document.getElementById('java').value);
      nconf.set("mem_min", document.getElementById('mem_min').value);
      nconf.set("mem_max", document.getElementById('mem_max').value);
      save();
      ipcRenderer.send('close-settings'); }
    else if (action == 'devtools') { ipcRenderer.send('devtools1'); }

}

function save() {
    nconf.save(function (err) {
        fs.readFile(root + slash + 'dragonlauncher.json', function (err, data) {
          console.dir(JSON.parse(data.toString()))
        });
      });
}
