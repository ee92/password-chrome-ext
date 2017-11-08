// USED BY CLIPBOARD.JS
var clipboard = new Clipboard('#copy');

// HASHING FUNCTION
const scrypt = require('scryptsy');

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
