// HASHING FUNCTION FOR MASTERPASS VISUAL AID
const sha256 = require('sha256');

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
