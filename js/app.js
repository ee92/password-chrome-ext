// USED BY CLIPBOARD.JS
var clipboard = new Clipboard('#copy');

// HASHING FUNCTION
const scrypt = require('scryptsy');
// HASHING FUNCTION FOR MASTERPASS VISUAL AID
const sha256 = require('sha256');


// FILL DROPWDOWN WITH PREVIOUSLY USED DOMAINS
fillDropdown();
// FIND CURRENT DOMAIN AND SELECT IT, SET LOGIN AND SALT
findAlias((res) => {
  // IF THERE IS AN ALIAS DOMAIN
  if (res) {
    $('#select').val(res.domain);
    $('#login').val(res.obj.login);
    $('#salt').val(res.obj.salt.current);
  } else {
    // IF NO ALIAS
    getTab((hostname) => {
      getDomains((domains) => {
        for (domain in domains) {
          if (domain == hostname) {
            $('#select').val(domain);
            $('#login').val(domains[domain].login);
            $('#salt').val(domains[domain].salt.current);
          };
        };
      });
    });
  };
});


// GET CURRENT URL HOSTNAME (DOMAIN)
function getTab(callback) {
  chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  }, (res) => {
    var tab = new URL(res[0].url);
    callback(tab.hostname);
  });
};

// ADD DOMAIN TO DROPDOWN IF NOT ALREADY THERE
function addDomain() {
  getDomains((domains) => {
    var domain = $('#url').val();
    for (d in domains) {
      if (d == domain) {
        return;
      };
    };
    $('#select').append(`<option selected>${domain}</option>`);
    $('#login').val('');
    $('#salt').val('');
  });
};

// REMOVE DOMAIN FROM DROPDOWN AND ALL ITS STORED INFO
function removeDomain(domain) {
  chrome.storage.sync.remove(domain, (res) => {
    fillDropdown();
  });
};

// GET FULL CONTENTS OF STORAGE
function getDomains(callback) {
  chrome.storage.sync.get(null, (res) => {
    callback(res);
  });
};

// DYNAMICLY BUILD DROPDOWN MENU
function fillDropdown() {
  $('#select').empty();
  getDomains((domains) => {
    $('#select').append(`<option hidden>Select Domain</option>`);
    for (domain in domains) {
      $('#select').append(`<option>${domain}</option>`);
    };
  });
};


// USE TO GET LOGIN, SALT, AND ALIASES
function getInfo(domain, callback) {
  chrome.storage.sync.get(domain, (res) => {
    // DEFAULT JSON
    var json = {};
    json[domain] = {
      login: "",
      salt: {current: ""},
      alias: []
    };
    // USE DEFAULT JSON IF NO DOMAIN FOUND
    res[domain] ? callback(res[domain]) : callback(json[domain]);
  });
};

// STORE SALT, LOGIN, AND DOMAIN ALIASES
function storeInfo() {
  var json = {};
  var domains = [];
  var salt = $('#salt').val();
  var login = $('#login').val();
  var domain = $("#select").val();
  // REMOVE ALIAS BEFORE STORING INFO
  removeAlias(() => {
    getInfo(domain, (obj) => {
      $.each(obj.alias, (alias) => {
        domains.push(obj.alias[alias]);
      });
      getTab((hostname) => {
        if (hostname != domain) {
          domains.push(hostname)
        };
        json[domain] = {
          login: login,
          salt: {current: salt},
          alias: domains
        };
        chrome.storage.sync.set(json);
      });
    });
  })
};

// FIND CURRENT DOMAIN ALIAS
function findAlias(callback) {
  getTab((hostname) => {
    getDomains((domains) => {
      for (domain in domains) {
        for (var i=0; i<domains[domain].alias.length; i++) {
          if (hostname == domains[domain].alias[i]) {
            // CALLBACK WITH THE STORED INFO
            callback({
              domain: domain,
              obj: domains[domain],
              hostname: hostname
            });
            return;
          };
        };
      };
      callback(false);
    });
  });
};

// REMOVE DOMAIN ALIAS IF ONE EXISTS
function removeAlias(callback) {
  findAlias((res) => {
    if (res) {
      var hostname = res.hostname;
      var arr = res.obj.alias;
      var index = arr.indexOf(hostname);
      if (index >= 0) {
        arr.splice(index, 1)
      }
      var json = {};
      json[res.domain] = {
        login: res.obj.login,
        salt: {current: res.obj.salt.current},
        alias: arr
      }
      chrome.storage.sync.set(json);
    }
    callback();
  });
};


// GENERATE RANDOM SALT
function newSalt() {
  return words[Math.floor(Math.random() * words.length)] + " " + words[Math.floor(Math.random() * words.length)];
};

// FIND SALT FOR SELECTED DOMAIN AND DISPLAY TO DOM
function showSalt(){
  var domain = $('select').val()
  getInfo(domain, (obj) => {
    var salt = obj.salt.current;
    $('#salt').val(salt);
  });
};



// GET INFO FROM DOM AND GENERATE PASSWORD
function getPassword() {
  var login = $('#login').val();
  var master = $('#master').val();
  var domain = $('#select').val();
  var salt = $('#salt').val();
  var password = generatePassword(domain, login, master, salt);
  $('#pass').val(password);
};

// USE PARAMS TO GENERATE HEX HASH, EXTRACT NUMBERS, USE NUMBERS TO GET INDEX
// OF DICTIONARY WORDS, NUMBER, AND SYMBOL
function generatePassword(domain, login, master, salt) {
  var symbols = ["!","@","#","$","%","?","&","*","^"];
  var str = domain + login + master;
  var hashnum = scrypt(str, salt, 16384, 8, 1, 64).toString('hex').split('').filter((x) => {
    return !isNaN(Number(x));
  });
  var w1 = Number(hashnum.slice(0,7).join('')) % words.length;
  var w2 = Number(hashnum.slice(7,14).join('')) % words.length;
  var w3 = Number(hashnum.slice(14,21).join('')) % words.length;
  var sym = symbols[Number(hashnum.slice(0,2).join('')) % symbols.length];
  var num = hashnum[0];
  return words[w1][0].toUpperCase() + words[w1].slice(1) + words[w2][0].toUpperCase() + words[w2].slice(1) + words[w3][0].toUpperCase() + words[w3].slice(1) + num + sym;
};



// SWITCH BETWEEN SHOWING SALT BUTTON AND CONFIRM/DENY BUTTON
function toggleSalt() {
  $('#newsalt').toggle();
  $('#setsalt').toggle();
};

// SWITCH BETWEEN SHOWING ADD URL BUTTON AND CONFIRM/DENY BUTTON
function toggleURL() {
  $("#select").toggle();
  $("#addurl").toggle();
  $("#url").toggle();
  $("#confirmurl").toggle();
};

// GENERATE AND SHOW SALT
$('#saltbtn').click(() => {
  var salt = newSalt()
  $('#salt').val(salt);
  toggleSalt();
});

// REJECT SALT, SHOW PREVIOUS
$('#saltdeny').click(() => {
  showSalt();
  toggleSalt();
});

// CONFIRM SALT
$('#saltconfirm').click(() => {
  toggleSalt();
});

// ADD DOMAIN TO DROPDOWN, DEFAULT HOSTNAME
$("#addurlbtn").click(() => {
  toggleURL();
  getTab((domain) => {
    $('#url').val(domain);
  });
});

// REMOVE DOMAIN FROM DROPDOWN AND STORAGE
$('#removeurlbtn').click(() => {
  var domain = $('#select').val();
  removeDomain(domain);
  showSalt();
});

// CANCEL ADD DOMAIN
$("#denyurlbtn").click(() => {
  toggleURL();
});

// CONFIRM DOMAIN
$("#confirmurlbtn").click(() => {
  addDomain();
  toggleURL();
});


// DISPLAY INFO FOR SELECTED DOMAIN, ON CHANGE
$('#select').on('change', () => {
  var domain = $('select').val()
  getInfo(domain, (obj) => {
    var salt = obj.salt.current;
    var login = obj.login;
    $('#salt').val(salt);
    $("#login").val(login);
  });
});

// VISUAL AID FOR MASTERPASS: HASH INPUT, EXTRACT NUMBERS, AND USE TO GET
// 3 HTML SYMBOLS BY REFERENCE NUMBER (&#9828 = HEART).
$('#master').keyup(() => {
  var mhash = sha256($('#master').val()).split('').filter((x) => {
    return !isNaN(Number(x));
  });
  var s1 = (9728 + Number(mhash.slice(0,7).join('')) % 255);
  var s2 = (9728 + Number(mhash.slice(7,14).join('')) % 255);
  var s3 = (9728 + Number(mhash.slice(14,21).join('')) % 255);
  $('#symbols').html("&#"+s1 + "&#"+s2 + "&#"+s3);
});

// GET PASSWORD AND STORE ALL INFO (DOMAIN, ALIASES, LOGIN, SALT)
$('#genbtn').click(() => {
  getPassword();
  storeInfo();
});

// KEYBOARD SHORTCUT FOR GENERATE PASSWORD BUTTON AND COPY TO CLIPBOARD
$(document).keypress((e) => {
  if (e.which == 13) {
    $('#genbtn').click();
    $('#copy').click();
  };
});

// KEYBOARD SHORTCUT TO COPY PASSWORD
$(document).keydown((e) => {
  if (e.ctrlKey && e.keyCode == 67) {
    $('#copy').click();
  };
});
