// === ShowChat Plugin pentru Kiwi IRC ===
// Generează automat un nume de utilizator cu prefixul "RomaniaChat"
// și îl salvează local (persistă la următoarele vizite)

function randString(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return 'RomaniaChat' + result;
}

function getUsername() {
  let username = localStorage.getItem('username');

  // Dacă nu există, creează unul nou cu prefixul RomaniaChat
  if (!username) {
    username = randString();
    localStorage.setItem('username', username);
  }

  return username;
}

// Integrare cu Kiwi IRC
kiwi.plugin('ident', function(kiwi) {
  kiwi.state.$on('network.new', function(network) {
    network.username = getUsername();
  });
});
