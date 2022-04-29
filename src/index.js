const {
  Client,
  Authenticator
} = require('minecraft-launcher-core');
const launcher = new Client();
const $ = require("jquery");
const fs = require('fs');
const http = require('http');
const https = require('https');
const {
  ipcRenderer
} = require('electron');
const {
  clipboard
} = require('electron');
const RPC = require("discord-rpc");
const os = require('os');
const path = require('path');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const msmc = require("msmc");
const Downloader = require("nodejs-file-downloader");

var mcprocess;
var spawn = require('child_process').spawn;


let isCracked = true;
let usrCheck = true;
let remMe = false;
let includeSnapshots = false;
let includeBeta = false;
let includeAlpha = false;
let mcVersList;
let releases;
let hideLauncher = true;
let vList = [];
let tvl = false;
let tnl = false;
let mcIsOn = false;
let newsId = 0;
let microsoft = false;

let stillHoverCheck = {
  "value": false,
  "left": "",
  "top": ""
}






//ipcRenderer.send("devtools");

var slash = "/";
if (os.platform() == "win32") {
  slash = "\\";
  var root = "C:\\Users\\" + require("os").userInfo().username + "\\AppData\\Roaming\\.minecraft";
} else if (os.platform() == "linux") {
  var root = "/home/" + require("os").userInfo().username + "/.minecraft";
} else if (os.platform() == "darwin") {
  var root = require("os").userInfo().username + "Library/Application Support/minecraft";
}

if (!fs.existsSync(root)) {
  fs.mkdirSync(root);
}
if (!fs.existsSync(root + slash + "versions")) {
  fs.mkdirSync(root + slash + "versions");
}

var nconf = require('nconf');
nconf.argv()
  .env()
  .file({
    file: root + slash + 'dragonlauncher.json'
  });

nconf.load();



if (!fs.existsSync(root + slash + "launcher_profiles.json")) {
  fs.appendFile(root + slash + 'launcher_profiles.json', '{"profiles": []}', function(err) {
    if (err) throw err;
    console.log('Saved dummy file launcher_profiles.json.');
  });
}



var shell = require('electron').shell;


const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

msmc.setFetch(fetch);
//open links externally by default
$(document).on('click', 'a[href^="http"]', function(event) {
  event.preventDefault();
  shell.openExternal(this.href);
});

const rpc = new RPC.Client({
  transport: "ipc"
});

rpc.on("ready", () => {
  rpc.setActivity({
    startTimestamp: new Date(),
    state: "W menu",
    largeImageKey: "orange",
    largeImageText: "DragonCraft",
  })

  console.log("RPC active");
});

rpc.login({
  clientId: "949374226484314142"
});




let opts = {
  clientPackage: null,
  // For production launchers, I recommend not passing
  // the getAuth function through the authorization field and instead
  // handling authentication outside before you initialize
  // MCLC so you can handle auth based errors and validation!
  root: root,
  version: {
    number: null,
    type: null
  },
  memory: {
    max: null,
    min: null
  },
  javaPath: null
  // overrides: {
  //     meta: "https://launchermeta.mojang.com", // List of versions.
  //     resource: "https://resources.download.minecraft.net", // Minecraft resources.
  //     mavenForge: "http://files.minecraftforge.net/maven/", // Forge resources.
  //     defaultRepoForge: "https://libraries.minecraft.net/", // for Forge only, you need to redefine the library url in the version json.
  //     fallbackMaven: "https://search.maven.org/remotecontent?filepath="
  // }
}
console.log = function(msg) {
  if (msg.toString().includes("this version of the Java Runtime only recognizes class file versions up to")) {
    alert("Nieprawidłowa wersja Javy. Sprawdź swoje ustawienia.");
  }
  console.info(msg);
}

function MsLogin() {
  if (nconf.get("microsoft") != "true") {
    $("#loader").show();


    msmc.fastLaunch("raw",
      (update) => {
        //A hook for catching loading bar events and errors, standard with MSMC
        console.log("CallBack!!!!!")
        console.log(update)
      }).then(result => {
      //Let's check if we logged in?
      if (msmc.errorCheck(result)) {
        $("#loader").hide();
        console.log("We failed to log someone in because : " + reason);
        console.log(result.reason);
        return;
      } else {
        opts.authorization = msmc.getMCLC().getAuth(result);
        $("#username-inp").addClass("inp-disabled");
        $("#l-nick-btn").addClass("inp-disabled");
        nconf.set("microsoft", "true");
        $(".l-checkbox-inp.lci-ms").css("background", "#ff6915");
        nconf.set("mslogin", result);
        $(".head").css("background", "url('https://mc-heads.net/avatar/" + nconf.get("mslogin:profile:id") + "')");
        $(".head").css("background-size", "cover");
        save();
        $("#loader").hide();
      }
    }).catch(reason => {
      //If the login fails
      console.log("We failed to log someone in because : " + reason);
      nconf.set("microsoft", "false");

    });
    save();
  } else {
    $(".l-checkbox-inp.lci-ms").css("background", "url('res/mslogo.webp')");
    $(".l-checkbox-inp.lci-ms").css("background-size", "contain");
    $(".head").css("background", "url('https://mc-heads.net/avatar/dsdasdadwdwajbdjwndjwandnawdknwadnwaoidn')");
    $(".head").css("background-size", "cover");
    $("#username-inp").removeClass("inp-disabled");
    $("#l-nick-btn").removeClass("inp-disabled");
    opts.authorization = Authenticator.getAuth("undefined");
    nconf.set("microsoft", "false");
    save();
  }

}




function news(i) {
  var request = new XMLHttpRequest();
  request.open('GET', 'http://site12079.web1.titanaxe.com/oglapi.php?id=' + i, true);
  request.onload = function() {
    // Begin accessing JSON data here
    var data = JSON.parse(request.responseText);

    if (request.status >= 200 && request.status < 400) {
      console.log("hejj");

    } else {
      console.log('error');
    }
    var desc = data[0];
    let n = 0;
    desc = desc.replace('**', (m, i, og) => {
      return (n++ % 2) ? m : '<b>';
    });
    desc = desc.replaceAll('**', '</b>');
    type = "Ogłoszenie";
    $(".newstypeicon").removeClass("fa-star");
    $(".newstypeicon").addClass("fa-newspaper");
    $(".newstypeiconcolor").css("color", "darkseagreen");
    if (data[3] == "1") {
      type = "Event";
      $(".newstypeicon").removeClass("fa-newspaper");
      $(".newstypeicon").addClass("fa-star");
      $(".newstypeiconcolor").css("color", "yellow");
    }


    $(".newsdesc").html(desc);
    $(".newstype").html(type);
    $(".newsuploader").html(data[1] + ", " + data[2]);
  }
  request.send();
}





window.onload = function() {


  var url = "https://api.minetools.eu/ping/dcrft.pl";

  $.getJSON(url, function(r) {
    //data is the JSON string
    if (r.error) {
      $('#rest').html('offline');
      return false;
    }
    var pl = '';
    if (r.players.sample.length > 0) {
      pl = '<br>OP: ' + r.players.sample[0].name;
    }
    $('#rest').html(r.players.online + '/100');

  });

  if (nconf.get("nickhistory") == null) {
    $("#l-nick-btn").addClass("inp-disabled");
  }

  document.getElementById('ls-nlist-cont').style.display = 'none';
  opts.memory.min = nconf.get("mem_min");
  if (nconf.get("mem_max") == null) {
    opts.memory.max = Math.floor(Math.floor(os.totalmem() / 1000000000) / 2) + 'G';
    nconf.set("mem_max", opts.memory.max);
  }
  if (nconf.get("mem_min") == null) {
    opts.memory.min = '1G';
    nconf.set("mem_min", opts.memory.min);
  }




  news(newsId);
  if (nconf.get("microsoft") == null || nconf.get("microsoft") == "false") {
    nconf.set("microsoft", "false");
    save();
  } else {
    nconf.load();
    $("#username-inp").addClass("inp-disabled");
    $("#l-nick-btn").addClass("inp-disabled");
    $(".l-checkbox-inp.lci-ms").css("background", "#ff6915");

    if (true) { //!msmc.validate(nconf.get("mslogin:profile"))) {
      //TODO refresh



      const profile = nconf.get("mslogin:profile");
      const authToken = nconf.get("mslogin:profile:_msmc");
      console.log("profile: ");
      console.log(profile);
      console.log("authToken: ");
      console.log(authToken);

      console.log("refresh...");
      var test = msmc.refresh(
        profile,
        (_callback) => {
          console.log("aa " + _callback);
          console.log(_callback);
        },
        (_update) => {
          console.log("bb " + _update);
          console.log(_update);
        }
      ).then((value) => {
        console.log("test!!! sukces?");
        console.log(value);
      })
      .catch((error) => {
        console.log(error);
      });

      console.log("heja! tuttaj");
      console.log(test);

      var testsf = fetch('https://login.live.com/oauth20_token.srf?client_id=00000000402b5328&client_secret=eyJhbGciOiJIUzI1NiJ9.eyJ4dWlkIjoiMjUzNTQ2MTYzMDAxMjUxNCIsImFnZyI6IkFkdWx0Iiwic3ViIjoiOTVlMTgxYjEtNGJiOS00YmMyLWEzZTEtZjNjNGUyMmUwMzYwIiwibmJmIjoxNjUxMTcwOTU2LCJhdXRoIjoiWEJPWCIsInJvbGVzIjpbXSwiaXNzIjoiYXV0aGVudGljYXRpb24iLCJleHAiOjE2NTEyNTczNTYsImlhdCI6MTY1MTE3MDk1NiwicGxhdGZvcm0iOiJVTktOT1dOIiwieXVpZCI6ImMxMGMyNzBiNzE2ZDQ3YTY5OTA5MTk5OWZkMDFmNzZlIn0.ebiLfGw7AsgAwEoUWh2AJauAYlPQb-b-EYhAhTydDTY&grant_type=refresh_token&refresh_token=M.R3_BL2.-CcqRq7M8kyAttU*REgd!vE5awnV8RUaDCZ*jQdLCOHQNi0EKCZrboEt6Hc2PNtpeNhOto8h2X98psE5QWOE3yrOh17dRzYh*itdCW1pCS9n1L1mrFzqmhDkM1hs*sTk7LIaEIPRyp6r!Xb*1QzZ4uD0lqZa3Yvd5PR7BJIafFXqV7EojgVnHlp7WFbtV8XjTVQeTgOX4hjISE2K0k8VT9UbDrpP5lfs!9FPEhGoEdzEti3HrmMzhjz8fr4G9a5*UO6s!9*dmjwzq7NaIxXJs5KRT9z!ugCAQ*ZT!JHJd1oDjw4CdJVb0PvHMZV2KysD1rg$$');

      console.log(testsf);


    }


    opts.authorization = msmc.getMCLC().getAuth(nconf.get("mslogin"));
    $(".head").css("background", "url('https://mc-heads.net/avatar/" + nconf.get("mslogin:profile:id") + "')");
    $(".head").css("background-size", "cover");
    microsoft = true;
  }

  document.getElementById('ls-info-cont').style.display = 'none';
  document.getElementById('ls-info-cont').style.left = '0px';
  document.getElementById('ls-versionlist-cont').style.left = '0px';
  document.getElementById('ls-nlist-cont').style.left = '0px';

  $.getJSON('https://launchermeta.mojang.com/mc/game/version_manifest.json', function(data) {
    mcVersList = data;
    console.log(data);
    // opts.version.number = data.latest.release;
    vList = [];
    data.versions.forEach(element => {
      if (element.type == 'release' || element.type == 'snapshot' || element.type == 'old_beta' || element.type == 'old_alpha') {
        vList.push(element);
      }
    });


    const dir = opts.root + slash + "versions";
    const files = fs.readdirSync(dir);
    fs.readdir(dir, (err, files) => {
      if (err) {
        console.log("readdir1: " + err);
      } else {
        files.forEach(file => {
          if (fs.statSync(dir + slash + file).isDirectory) {
            fs.readdir(dir + slash + file, (err, files) => {
              if (err) {
                console.log("readdir2: " + err);
              } else {
                files.forEach(json => {
                  console.log("readdir3: " + json);
                  if (path.extname(json) == ".json") {
                    console.log("readdir4: " + json);
                    $.getJSON(dir + slash + file + slash + json, function(data) {
                      var exists = false;
                      vList.find(element => {
                        if (element.id == data.id) {
                          console.log("!!!");
                          exists = true;
                        }
                      });
                      if (!exists) {
                        console.log("readdir5: " + json);
                        vList.push(data);
                        console.log(vList);
                      }
                    });
                  }
                });
              }
            });
          } else if (path.extname(file) == ".json") {
            $.getJSON(file, function(data) {
              // opts.version.number = data.latest.release;
              data.versions.forEach(element => {
                vList.push(element);
              });
            });
          }
        });
      }
    });


  });







  console.log('RAM: ' + Math.floor(os.totalmem() / 1000000000) + 'G');
  opts.memory.max = nconf.get("mem_max");
  save();

  console.log('MEM: MAX: ' + opts.memory.max + ' MIN: ' + opts.memory.min);

  if (nconf.get("nick") != null) {
    document.getElementById('username-inp').value = nconf.get("nick");
  }

  if (nconf.get("version") != null) {
    var id = nconf.get("version");
    $.getJSON(root + slash + "versions" + slash + id + slash + id + ".json", function(data) {
        var custom = false;
        var inh = id;
        var type = data.type;
        var assets = data.assets;
        if (data.inheritsFrom != null || data.mainClass != "net.minecraft.client.main.Main") {
          custom = true;
          inh = data.inheritsFrom;
        }
        console.log(custom + inh + id + type);
        changeVersion(custom, inh, id, type, assets);
      })
      .fail(function() {
        $.getJSON('https://launchermeta.mojang.com/mc/game/version_manifest.json', function(data) {
          var custom = false;
          var inh = data.latest.release;
          var id = data.latest.release;
          var type = "release";
          var assets = data.assets;
          console.log(data);
          console.log(custom + inh + id + type);
          changeVersion(custom, inh, id, type, assets);
        });
      });
  } else {
    $.getJSON('https://launchermeta.mojang.com/mc/game/version_manifest.json', function(data) {
      var custom = false;
      var inh = data.latest.release;
      var id = data.latest.release;
      var type = "release";
      var assets = data.assets;
      console.log(data);
      console.log(custom + inh + id + type);
      changeVersion(custom, inh, id, type, assets);
    });
  }




  if (nconf.get("jvm") != "true") {
    ipcRenderer.send("devtools");
    const dJre = async () => {
      $(".javaStatus").text("Pierwsze uruchomienie może trochę potrwać");

      await setTimeout(() => $(".javaStatus").text("Pobieram: Java 8..."), 3000);
      console.log(await downloadJre("8"));
      $(".javaStatus").text("Pobieram: Java 17...");
      console.log(await downloadJre("17"));
      $(".javaStatus").text("Gotowe!");
      $(".javaStatus").fadeOut("slow");
      await setTimeout(() => app(), 250);
      nconf.set("jvm", "true");
      save();
    }
    dJre();

  } else {
    app();
    console.log("niet");
  }

  function app() {
    $("#dcrftmain").css("opacity", "0");

    $("#loader").animate({
      backgroundColor: "#ffb800"
    }, 250, 'easeOutCubic');

    $("#splash").animate({
      height: ($(this).height() * 0.8),
      width: ($(this).width() * 0.5)
    }, 250, 'easeOutCubic', function() {


      $("#splash").appendTo("#toappend");

      $("#splash").animate({
        height: "23vw",
        width: "23vw",
        top: "37vh"
      }, 500, 'easeInCubic');


      $("#loader").fadeTo(250, 0, 'easeInCubic', function() {
        $("#loader").hide();

        $("#loader").css("opacity", "0.5");
        $("#loader").css("background", "#000");
        $("#loader").css("z-index", "102");
      });

    });

  }

}

document.addEventListener('click', function(event) {
  var isClickInsideA = document.getElementById('ls-versionlist-cont').contains(event.target);
  var isClickInsideB = document.getElementById('l-dropdown-inp-vers').contains(event.target);

  if (!isClickInsideA && tvl == true && !isClickInsideB) {
    $("#ls-versionlist-cont").slideToggle(150);
    tvl = false;
  } else {

  }
});

document.addEventListener('click', function(event) {
  var isClickInsideA = document.getElementById('ls-nlist-cont').contains(event.target);
  var isClickInsideB = document.getElementById('l-nick-btn').contains(event.target);

  if (!isClickInsideA && tnl == true && !isClickInsideB) {
    $("#ls-nlist-cont").slideToggle(150);
    tnl = false;
  } else {

  }
});

function changeVersion(custom, inh, id, type, assets) {
  opts = {
    clientPackage: null,
    // For production launchers, I recommend not passing
    // the getAuth function through the authorization field and instead
    // handling authentication outside before you initialize
    // MCLC so you can handle auth based errors and validation!
    root: root,
    version: {
      number: null,
      type: null
    },
    memory: {
      max: null,
      min: null
    },
    javaPath: null
    // overrides: {
    //     meta: "https://launchermeta.mojang.com", // List of versions.
    //     resource: "https://resources.download.minecraft.net", // Minecraft resources.
    //     mavenForge: "http://files.minecraftforge.net/maven/", // Forge resources.
    //     defaultRepoForge: "https://libraries.minecraft.net/", // for Forge only, you need to redefine the library url in the version json.
    //     fallbackMaven: "https://search.maven.org/remotecontent?filepath="
    // }
  }
  console.log(id);
  console.log(id.toString().length);




  if (custom) {
    opts.version.custom = id;
    //opts.version.number = inh;
  } else {
    //opts.version.number = id;
  }
  opts.version.number = assets;


  opts.version.type = type;
  if (id.length >= 30) {
    document.getElementById('l-dropdown-inp-vers').innerHTML = id.substring(0, 29);
  } else {
    document.getElementById('l-dropdown-inp-vers').innerHTML = id;
  }
  $("#ls-versionlist-cont").slideToggle(150);
  tvl = false;

  nconf.set("version", id);
  save();

  if (nconf.get("microsoft") == null || nconf.get("microsoft") == "false") {
    nconf.set("microsoft", "false");
    save();
  } else {
    $("#username-inp").addClass("inp-disabled");
    $("#l-nick-btn").addClass("inp-disabled");
    $(".l-checkbox-inp.lci-ms").css("background", "#ff6915");
    opts.authorization = msmc.getMCLC().getAuth(nconf.get("mslogin"));
    $(".head").css("background", "url('https://mc-heads.net/avatar/" + nconf.get("mslogin:profile:id") + "')");
    $(".head").css("background-size", "cover");
    microsoft = true;
  }
}

function changeNick(nick) {
  nconf.set("nick", nick);
  document.getElementById('username-inp').value = nick;
  save();
  $("#ls-nlist-cont").slideToggle(150);
  tnl = false;
}

ipcRenderer.on('close-settings', (event) => {
  $("#loader").hide();
});

function doWin(action) {
  if (action == 'minimize') {
    ipcRenderer.send('minimize-app');
  } else if (action == 'maximize') {
    ipcRenderer.send('maximize-app');
  } else if (action == 'close') {
    ipcRenderer.send('close-app');
  } else if (action == 'devtools') {
    ipcRenderer.send('devtools');
  } else if (action == 'settings') {
    ipcRenderer.send('settings');
    $("#loader").show();
  }
}

function OfflineOrOnline() {
  if (isCracked == true) {
    isCracked = false;
    document.getElementById('password-inp').classList.remove('inp-disabled');
    document.getElementById('l-checkbox-inp-pass').classList.add('l-cb-filled');
  } else {
    isCracked = true;
    document.getElementById('password-inp').classList.add('inp-disabled');
    document.getElementById('l-checkbox-inp-pass').classList.remove('l-cb-filled');
  }
}

function ToggleSnapshots() {
  if (includeSnapshots == false) {
    includeSnapshots = true;
    includeBeta = true;
    includeAlpha = true;
    document.getElementById('l-checkbox-inp-snap').classList.add('l-cb-filled');
  } else {
    includeSnapshots = false;
    includeBeta = false;
    includeAlpha = false;
    document.getElementById('l-checkbox-inp-snap').classList.remove('l-cb-filled');
  }
}

function toggleHideLauncher() {
  if (hideLauncher == false) {
    hideLauncher = true;
    document.getElementById('l-checkbox-inp-hide').classList.add('l-cb-filled');
  } else {
    hideLauncher = false;
    document.getElementById('l-checkbox-inp-hide').classList.remove('l-cb-filled');
  }
}

function checkUsernameInp() {
  let username = document.getElementById('username-inp').value;
  // console.log(username);
  if (!/[^a-zA-Z0-9_]+/.test(username) && !/\s/.test(username) && username != '' && username != undefined) {
    document.getElementById('username-inp').classList.remove('inp-err');
    document.getElementById('l-enter-btn').classList.remove('inp-disabled');
    usrCheck = true;
    // console.log('tru');
  } else {
    document.getElementById('username-inp').classList.add('inp-err');

    document.getElementById('l-enter-btn').classList.add('inp-disabled');
    usrCheck = false;
    // console.log('nope');
  }
}

function toggleVList(element) {
  mouseLeaveCheck()
  if (tvl == true) {
    tvl = false;
    $("#ls-versionlist-cont").slideToggle(150);
  } else {
    tvl = true;
    let a = $(element).css('width').replace('px', '') / 1;
    let b = $(element).css('height').replace('px', '') / 1;
    let c = $(element).position().left + ($(element).css('margin-left').replace('px', '') / 1);
    // let d = $(element).position().top + ($(element).css('margin-top').replace('px', '') / 1);
    let d = $(element).position().top;

    let wh = window.innerHeight / 1;
    let ww = window.innerWidth / 1;

    document.getElementById('ls-versionlist-cont').style.left = c + 'px';
    document.getElementById('ls-versionlist-cont').style.top = (d + b + 10) + 'px';
    document.getElementById('ls-versionlist-cont').style.maxHeight = (wh - (d + b + 10) - 10) + 'px';


    document.getElementById('ls-versionlist-cont').innerHTML = '';
    vList.forEach(y => {
      if (y.type == 'snapshot' && includeSnapshots == false) {} else if (y.type == 'old_beta' && includeBeta == false) {} else if (y.type == 'old_alpha' && includeAlpha == false) {} else {
        var custom = false;
        var inh = null;
        if (y.inheritsFrom != null || y.mainClass != "net.minecraft.client.main.Main") {
          custom = true
          inh = y.inheritsFrom;
        }
        console.log("inh: " + inh + " id: " + y.id + " cust?: " + custom);
        document.getElementById('ls-versionlist-cont').innerHTML += '<div class="ls-vl-child" onclick="changeVersion(\'' + custom + '\', \'' + inh + '\', \'' + y.id + '\', \'' + y.type + '\', \'' + y.assets + '\')">' + y.id + '</div>';
      }

    });

    $("#ls-versionlist-cont").slideToggle(150);
  }
}

function toggleNList(element) {
  mouseLeaveCheck()
  if (tnl == true) {
    tnl = false;
    $("#ls-nlist-cont").slideToggle(150);
  } else {
    tnl = true;
    let a = $(element).css('width').replace('px', '') / 1;
    let b = $(element).css('height').replace('px', '') / 1;
    let c = $(element).position().left + ($(element).css('margin-left').replace('px', '') / 1);
    // let d = $(element).position().top + ($(element).css('margin-top').replace('px', '') / 1);
    let d = $(element).position().top;

    let wh = window.innerHeight / 1;
    let ww = window.innerWidth / 1;

    document.getElementById('ls-nlist-cont').style.left = c + 'px';
    document.getElementById('ls-nlist-cont').style.top = (d + b + 10) + 'px';
    document.getElementById('ls-nlist-cont').style.maxHeight = (wh - (d + b + 10) - 10) + 'px';

    document.getElementById('ls-nlist-cont').innerHTML = '';
    nconf.get("nickhistory").forEach(y => {
      document.getElementById('ls-nlist-cont').innerHTML += '<div class="ls-vl-child" onclick="changeNick(\'' + y + '\')">' + y + '</div>';

    });
    $("#ls-nlist-cont").slideToggle(150);
  }
}

function tryMouseEnterCheck() {
  if (stillHoverCheck.value == true) {
    document.getElementById('ls-info-cont').style.left = stillHoverCheck.left;
    document.getElementById('ls-info-cont').style.top = stillHoverCheck.top;
    document.getElementById('ls-info-cont').style.display = 'flex';
  }
}

function mouseEnterCheck(element, info) {
  stillHoverCheck.value = true;
  let a = $(element).css('width').replace('px', '') / 1;
  let b = $(element).css('height').replace('px', '') / 1;
  let c = $(element).position().left + ($(element).css('margin-left').replace('px', '') / 1);
  // let d = $(element).position().top + ($(element).css('margin-top').replace('px', '') / 1);
  let d = $(element).position().top;
  document.getElementById('ls-info-cont').innerHTML = info;
  let e = $('#ls-info-cont').css('width').replace('px', '') / 1;

  stillHoverCheck.left = (a / 2 + c - e / 2) + 'px';
  stillHoverCheck.top = (b + d + 10) + 'px';

  setTimeout(tryMouseEnterCheck, 500);
}

function save() {
  nconf.save(function(err) {
    fs.readFile(opts.root + slash + 'dragonlauncher.json', function(err, data) {
      console.dir(JSON.parse(data.toString()))
    });
  });
}

function mouseLeaveCheck() {
  stillHoverCheck.value = false;
  document.getElementById('ls-info-cont').style.display = 'none';
}

async function lsEnter() {
  nconf.load();
  javaPath = nconf.get("javaPath");
  if (javaPath == null | javaPath == "") {
    var list = ['1.17', '1.17.1', '1.18', '1.18.1', '1.18.2'];
    if (list.includes(opts.version.number) || opts.version.type == "snapshot") {
      javaPath = root + slash + "jvm" + slash + "jre17" + slash + "jre17" + slash + "bin" + slash + "java";
    } else {
      javaPath = root + slash + "jvm" + slash + "jre8" + slash + "jre8" + slash + "bin" + slash + "java";
    }
  }
  opts.javaPath = javaPath;
  opts.memory.max = nconf.get("mem_max");
  opts.memory.min = nconf.get("mem_min");
  let username = document.getElementById('username-inp').value;
  document.getElementById('l-enter-btn').classList.add('inp-disabled');
  if (username == null || username == '' || usrCheck == false) {
    document.getElementById('username-inp').classList.add('inp-err');
    $("#username-inp").addClass("shake");


    document.getElementById('l-enter-btn').classList.add('inp-disabled');
    usrCheck = false;
    document.getElementById('l-enter-btn').classList.remove('inp-disabled');
  } else {
    if (microsoft == false) {
      opts.authorization = Authenticator.getAuth(username);
      if (nconf.get("nickhistory") == null) {
        var nickhistory = [username];
        nconf.set("nickhistory", nickhistory);
      } else {
        var nickhistory = nconf.get("nickhistory");
        if (!nickhistory.includes(username)) {
          nickhistory.push(username);
        }
      }
      console.log(nickhistory);
      save();
    }
    document.getElementById('ls-loading-bar-cont').style.display = 'inline-block';
    document.getElementById('ls-loading-bar-cont').style.background = 'var(--background-dark-light)';
    document.getElementById('ls-loading-bar').style.display = 'flex';
    document.getElementById('ls-loading-bar').style.width = '20%';
    document.getElementById('ls-loading-bar').style.animation = 'lsLoading 2s infinite';
    document.getElementById('l-enter-btn').classList.add('inp-disabled');

    document.getElementById('l-enter-btn').classList.add('inp-disabled');
    mcIsOn = true;

    console.log(opts)

    nconf.set("nick", document.getElementById('username-inp').value);

    save();

    var ver = opts.version.number;
    if (opts.version.custom != null) {
      ver = opts.version.custom;
    }
    rpc.setActivity({
      startTimestamp: new Date(),
      state: "Minecraft " + ver,
      largeImageKey: "orange",
      largeImageText: "DragonCraft",
    })


    mcprocess = await launcher.launch(opts);
    console.log(mcprocess);


    mcprocess.stdout.setEncoding('utf8');
    mcprocess.stdout.on('data', function(data) {
      //Here is where the output goes

      console.log('stdout: ' + data);

      data = data.toString();
    });

    mcprocess.stderr.setEncoding('utf8');
    mcprocess.stderr.on('data', function(data) {
      //Here is where the error output goes

      console.log('stderr: ' + data);
      mcprocess.stdout.write("/test");
      mcprocess.stdout.end();
      data = data.toString();
      scriptOutput += data;
    });


  }
}

// launcher.launch(opts);

launcher.on('debug', (e) => {
  console.log('Debug >> ' + e);
  if (e.endsWith("java: not found")) {
    alert('Error: Java Not Installed!');
  }
});
launcher.on('data', (e) => console.log('Data >> ' + e));
launcher.on('download', (e) => {
  // console.log('Download >> ' + e);
  document.getElementById('ls-loading-bar-cont').style.display = 'inline-block';
  document.getElementById('ls-loading-bar-cont').style.background = 'var(--background-dark-light)';
  document.getElementById('ls-loading-bar').style.display = 'flex';
  document.getElementById('ls-loading-bar').style.animation = 'none';
  document.getElementById('ls-loading-bar').style.width = '0%';
});

launcher.on('download-status', (e) => {
  // console.log('DS');
  // console.log(e);
  // document.getElementById('sloadbar').style.width = (e.current * 100 / e.total) + '%';
});

launcher.on('progress', (e) => {
  // console.log('Progress ...............');
  // console.log(e);
  document.getElementById('ls-loading-bar').style.width = (e.task * 90 / e.total + 10) + '%';
});

launcher.on('package-extract', () => {
  console.log('Package Extracted!');
})

launcher.on('arguments', (args) => {
  args += " -Dorg.lwjgl.glfw.libname=/usr/lib/libglfw.so";
  console.log('Arguments are set: ' + JSON.stringify(args));

  //animation
  $("#dcrftmain").css("opacity", "0");
  $("#loader").css("opacity", "1");
  $("#loader").css("z-index", "100");
  $("#loader").show();

  $("#loader").animate({
    backgroundColor: "#ffb800"
  }, 250, 'easeOutCubic');

  $("#splash").animate({
    height: ($(this).height() * 0.8),
    width: ($(this).width() * 0.5),
    top: "50%",
    left: "50%"
  }, 250, 'easeOutCubic', function() {
    $("#splash").appendTo("#toappend");


    if (hideLauncher == true) {
      ipcRenderer.send('hideLauncher');
    } else {
      setTimeout(function() {
        $("#splash").animate({
          height: "23vw",
          width: "23vw",
          top: "37vh"
        }, 500, 'easeInCubic');

        $("#loader").fadeTo(250, 0, 'easeInCubic', function() {
          $("#loader").hide();

          $("#loader").css("opacity", "0.5");
          $("#loader").css("background", "#000");
          $("#loader").css("z-index", "102");
        });
      }, 100);
    }


    document.getElementById('ls-loading-bar-cont').style.display = 'none';
    $("#ls-loading-bar-cont").hide();
    document.getElementById('ls-loading-bar').style.animation = 'none';
    mcIsOn = true;
    document.getElementById('l-enter-btn').classList.add('inp-disabled');

  });
})

launcher.on('close', () => {
  nconf.set("nick", document.getElementById('username-inp').value);
  save();
  console.log('Closing...');
  ipcRenderer.send('showLauncher');
  setTimeout(function() {
    $("#splash").animate({
      height: "23vw",
      width: "23vw",
      top: "37vh"
    }, 500, 'easeInCubic');

    $("#loader").fadeTo(250, 0, 'easeInCubic', function() {
      $("#loader").hide();

      $("#loader").css("opacity", "0.5");
      $("#loader").css("background", "#000");
      $("#loader").css("z-index", "102");
    });
  }, 100);


  mcIsOn = false;
  document.getElementById('l-enter-btn').classList.remove('inp-disabled');
});



async function downloadJre(ver) {
  return new Promise(resolve => {
    var sys = null;
    var format = ".tar.gz"
    if (os.platform() == "win32") {
      format = ".zip"
      sys = "windows";
    } else if (os.platform() == "linux") {
      sys = "linux";
    } else if (os.platform() == "darwin") {
      sys = "mac";
    }

    var dir = root + slash + "jvm" + slash + "jre" + ver + slash;

    const decompress = require("decompress");
    const decompressTargz = require("decompress-targz");

    //Wrapping the code with an async function, just for the sake of example.
    (async () => {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
      const downloader = new Downloader({
        url: "https://api.adoptium.net/v3/binary/latest/" + ver + "/ga/" + sys + "/x64/jre/hotspot/normal/eclipse?project=jdk", //If the file name already exists, a new file with the name 200MB1.zip is created.
        directory: dir,
        fileName: "jre" + ver + format,
      });
      try {
        await downloader.download();
        console.log(root + slash + "jvm" + slash + "jre" + ver + slash + "jre" + ver + format + " dir: " + root + slash + "jvm" + slash + "jre" + ver);
        /*await decompress(root + slash + "jvm" + slash + "jre" + ver + slash + "jre" + ver + ".tar.gz", root + slash + "jvm" + slash + "jre" + ver, {
            plugins: [
                decompressTargz()
            ]
        }).then(() => {
            console.log('Files decompressed to ' + dir);
            fs.readdir(dir, (err, files) => {
              files.forEach(file => {
                if(fs.lstatSync(dir + file).isDirectory()){
                  fs.renameSync(dir + file, dir + "jre" + ver);
                }
              });
            });
            setTimeout(() => resolve('downloaded jre' + ver), 1000);
        });*/


        /*var targz = require('tar.gz');
        var compress = new targz().extract(root + slash + "jvm" + slash + "jre" + ver + slash + "jre" + ver + ".tar.gz", root + slash + "jvm" + slash + "jre" + ver, function(err) {
          if (err)
            console.log(err);
          console.log('The extraction has ended!');*/


        var fs = require('fs');
        var tar = require('tar');
        var zlib = require('zlib');
        var path = require('path');
        var mkdirp = require('mkdirp');

        var tarball = root + slash + "jvm" + slash + "jre" + ver + slash + "jre" + ver + format;
        var dest = root + slash + "jvm" + slash + "jre" + ver;

        if (format == ".tar.gz") {
          tar.x({
            file: tarball,
            C: dest
          }).then(() => {
            console.log('Files decompressed to ' + dir);
            fs.readdir(dir, (err, files) => {
              files.forEach(file => {
                if (fs.lstatSync(dir + file).isDirectory()) {
                  fs.renameSync(dir + file, dir + "jre" + ver);
                }
              });
            });

            setTimeout(() => resolve('downloaded jre' + ver), 1000);
          });
        } else {

          var unzipper = require("unzipper");
          fs.createReadStream(tarball)
            .pipe(unzipper.Extract({
              path: dest
            }))
            .promise()
            .then(() => {
              console.log('Files decompressed to ' + dir);
              fs.readdir(dir, (err, files) => {
                files.forEach(file => {
                  if (fs.lstatSync(dir + file).isDirectory()) {
                    fs.renameSync(dir + file, dir + "jre" + ver);
                  }
                });
              });

              setTimeout(() => resolve('downloaded jre' + ver), 1000);
            });
        }



      } catch (error) {
        console.log("Download failed, err: " + error);
      }
    })();
  });
}
