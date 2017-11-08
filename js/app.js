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
