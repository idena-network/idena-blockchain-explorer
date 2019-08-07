"use strict";


function getAllUrlParams(url) {
  let queryString = url ? url.split('?')[1] : window.location.search.slice(1);
  let obj = {};
  
  if (queryString) {
    queryString = queryString.split('#')[0];
    let arr = queryString.split('&');

    for (let i = 0; i < arr.length; i++) {
      let a = arr[i].split('=');
      let paramName = a[0];
      let paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

      if (paramName.match(/\[(\d+)?\]$/)) {

        let key = paramName.replace(/\[(\d+)?\]/, '');
        if (!obj[key]) obj[key] = [];

        if (paramName.match(/\[\d+\]$/)) {
          let index = /\[(\d+)\]/.exec(paramName)[1];
          obj[key][index] = paramValue;
        } else {
          obj[key].push(paramValue);
        }
      } else {
        if (!obj[paramName]) {
          obj[paramName] = paramValue;
        } else if (obj[paramName] && typeof obj[paramName] === 'string'){
          obj[paramName] = [obj[paramName]];
          obj[paramName].push(paramValue);
        } else {
          obj[paramName].push(paramValue);
        }
      }
    }
  }

  return obj;
}



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
  // ===== END OF: mark is mobile

  let $btnAgree = $('.btn_agree');

  $btnAgree.on('click', function() {
    $(this).closest('.badge_fixed').remove()
  });

  function initInputBlur() {
    $('.form_subscribe').each(function () {
      $(this).find('.form-control').on('blur', function(event) {
        let inputValue = this.value;
        if (inputValue) {
          this.classList.add('value-exists');
        } else {
          this.classList.remove('value-exists');
        }
      });
    })
  }

  initInputBlur();

  let token = getAllUrlParams().confirmationToken;

  function postData(data) {
    fetch(`https://api.mc2.com.de/api/EmailConfirmation/Confirm?confirmationToken=${data}`, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: { 'Content-type': 'application/x-www-form-urlencoded' },
      redirect: 'follow',
      referrer: 'no-referrer',
      body: `?confirmationToken=${data}`,
    })
      .then(function (response) {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response;
      })
      .then(function (response) {
        console.log('Request succeeded with OK response');

        window.location.href = '/verified.html'
      })
      .catch(function (error) {
        console.error('Request failed', error);

        window.location.href = '/404.html'
      });
  }

  if (token && token !== "") {
    postData(token)
  } else if (!BODY.is(":visible")) {
    BODY.show();
  }
});


$(document).ready(function() {

  $('[data-toggle="tooltip"]').tooltip();
  path=window.location.pathname;

  var p=getAllUrlParams();

  if(path=="/identity")
    if (! (p.identity===undefined))
     initIdentity(p.identity);

  if(path=="/epoch")
    if (! (p.epoch===undefined))
      initEpoch(p.epoch);

  if(path=="/validation")
    if (! (p.epoch===undefined))
     initEpoch(p.epoch);

  if(path=="/flip")
    if (! (p.flip===undefined))
     initFlip(p.flip);

});










