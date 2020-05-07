'use strict';

function getAllUrlParams(url) {
  let queryString = url ? url.split('?')[1] : window.location.search.slice(1);
  let obj = {};

  if (queryString) {
    queryString = queryString.split('#')[0];
    let arr = queryString.split('&');

    for (let i = 0; i < arr.length; i++) {
      let a = arr[i].split('=');
      let paramName = a[0];
      let paramValue = typeof a[1] === 'undefined' ? true : a[1];

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
        } else if (obj[paramName] && typeof obj[paramName] === 'string') {
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

$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip();
  path = window.location.pathname;

  var p = getAllUrlParams();
  var title = '';

  initUser(p);

  var isLocation404 = false;

  if (path == '/signin') {
    title = title + 'Sign-in with Idena app';
    initSignin(p.callback_url);
  } else if (path == '/identity') {
    title = title + 'Identity';
    if (p.identity) {
      initIdentity(p.identity);
      title = title + ' ' + p.identity;
    } else {
      isLocation404 = true;
    }
  } else if (path == '/address') {
    title = title + 'Address';
    if (p.address) {
      initAddress(p.address);
      title = title + ' ' + p.address;
    } else {
      isLocation404 = true;
    }
  } else if (path == '/epoch') {
    title = title + 'Epoch';
    if (p.epoch) {
      initEpoch(p.epoch);
      title = title + ' ' + epochFmt(p.epoch);
    } else {
      isLocation404 = true;
    }
  } else if (path == '/validation') {
    title = title + 'Validation result';
    if (p.epoch) {
      initValidation(p.epoch);
      title = title + ' ' + epochFmt(p.epoch);
    } else {
      isLocation404 = true;
    }
  } else if (path == '/flip') {
    title = title + 'Flip';
    if (p.flip) {
      initFlip(p.flip);
      title = title + ' ' + p.flip;
    } else {
      isLocation404 = true;
    }
  } else if (path == '/block') {
    title = title + 'Block';
    if (p.block) {
      initBlock(p.block);
      title = title + ' ' + p.block;
    } else {
      isLocation404 = true;
    }
  } else if (path == '/answers') {
    title = title + 'Identity validation';
    if (p.identity && p.epoch) {
      initIdentityAnswers(p.identity, p.epoch);
      title = title + ' ' + p.identity + ' for epoch ' + epochFmt(p.epoch);
    } else {
      isLocation404 = true;
    }
  } else if (path == '/tx') {
    title = title + 'Transaction';
    if (!(p.tx === undefined)) {
      initTransaction(p.tx);
      title = title + ' ' + p.tx;
    } else {
      isLocation404 = true;
    }
  } else if (path == '/rewards') {
    title = title + 'Validation session rewards';
    if (p.epoch) {
      initRewards(p.epoch);
      title = title + ' ' + epochFmt(p.epoch);
    } else {
      isLocation404 = true;
    }
  } else if (path == '/reward') {
    title = title + 'Identity validation reward';
    if (p.identity && p.epoch) {
      initIdentityReward(p.identity, p.epoch);
      title = title + ' ' + p.identity + ' for epoch ' + epochFmt(p.epoch);
    } else {
      isLocation404 = true;
    }
  } else if (path == '/circulation') {
    title = title + 'Idena (DNA) circulating supply';
    initCirculation();
  } else if (path == '/') {
    initEpochs();
    title = 'Idena Explorer';
  } else {
    title = title + ' | Idena Explorer';
    isLocation404 = true;
  }

  if (isLocation404) {
    window.location = './404';
  }

  $('title').text(title);

  if (document.location.hash != '') {
    var viewelem = $('a[href="' + document.location.hash + '"]')[0]; //tab click
    if (viewelem) viewelem.click();
  }
});

$('a.nav-link[data-toggle="tab"]').on('click', function (e) {
  history.replaceState(undefined, undefined, $(this)[0].href);
});

$('#SearchInput').keyup(function (e) {
  const Btn = $(this).parent().parent().find('.btn');
  if (e.which === 13) {
    Btn[0].click();
  }
});

$('#SearchBtn').click(function () {
  const input = $('#SearchInput')[0];
  const txt = input.value;
  if (txt == '') {
    return;
  }

  input.setAttribute('disabled', '');

  var u = url + 'Search?value=' + txt;
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function (data) {
      if (data.result == null) {
        alert('Nothing found...');
        input.removeAttribute('disabled');
        input.focus();
        return;
      }
      for (var i = 0; i < data.result.length; i++) {
        if (data.result[i].Name == 'Address')
          location.href = './address?address=' + data.result[i].Value;
        if (data.result[i].Name == 'Block')
          location.href = './block?block=' + data.result[i].Value;
        if (data.result[i].Name == 'Flip')
          location.href = './flip?flip=' + data.result[i].Value;
        if (data.result[i].Name == 'Transaction')
          location.href = './tx?tx=' + data.result[i].Value;
      }
    },
    error: function (request, error) {
      alert('Oops, something went wrong: ' + error);
    },
  });
});
