$(document).ready(function() {
  
  // Random background
  var backgroundList = ['_gialla', '_verde', '_blu', ''];
  var backgroundColor = backgroundList[Math.floor(Math.random() * backgroundList.length)];
  $('#game').css('background', "url('img/base_reversi" + backgroundColor + ".png') 0 0 no-repeat");
  
  return Reversi().runGame();
});

