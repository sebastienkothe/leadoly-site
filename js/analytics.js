/*
 * Mesure d'audience Leadoly : GoatCounter, anonyme et sans cookies.
 * Seul endroit à modifier si le code du compte GoatCounter change :
 */
var LEADOLY_GOATCOUNTER = 'https://leadoly.goatcounter.com/count';

(function () {
  if (document.documentElement.getAttribute('data-page') === '404') {
    // Les pages introuvables sont comptées à part, sous « 404/chemin ».
    window.goatcounter = { path: function (p) { return '404' + p; } };
  }
  // Chargé après l'affichage de la page pour ne pas ralentir le premier rendu.
  function charger() {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://gc.zgo.at/count.js';
    s.setAttribute('data-goatcounter', LEADOLY_GOATCOUNTER);
    document.head.appendChild(s);
  }
  if (document.readyState === 'complete') { charger(); }
  else { window.addEventListener('load', charger); }
})();
