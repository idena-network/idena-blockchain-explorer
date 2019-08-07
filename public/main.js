"use strict";

window.addEventListener('DOMContentLoaded', function () {
  // START OF: is mobile =====
  function isMobile() {
    return (/Android|iPhone|iPad|iPod|BlackBerry/i).test(navigator.userAgent || navigator.vendor || window.opera);
  }
  // ===== END OF: is mobile

  const BODY = $('body');

  // START OF: mark is mobile =====
  (function() {
    BODY.addClass('loaded');

    if(isMobile()){
      BODY.addClass('body--mobile');
      $('video').remove()
    }else{
      BODY.addClass('body--desktop');
    }
  })();

  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })
});