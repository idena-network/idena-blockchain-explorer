function initValidation(currEpoch) {
  var nextEpoch = currEpoch * 1 + 1;
  var prevEpoch = currEpoch - 1;

  $('#EpochId')[0].textContent = epochFmt(currEpoch);
  $('#EpochPageLink')[0].href = '/epoch?epoch=' + currEpoch;

  if (currEpoch > 0) getValidationData(currEpoch);
}

function getValidationData(epoch) {
  var prevEpoch = epoch - 1;

  var u = url + 'Epoch/' + prevEpoch;

  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function (data) {
      updateValidationEpochData(data);
    },
    error: function (request, error) {
      console.error(u + ', error:' + error);
    },
  });

  u = url + 'Epoch/' + prevEpoch + '/FlipStatesSummary';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function (data) {
      updateEpochFlipsStatesSummaryData(data);
    },
    error: function (request, error) {
      console.error(u + ', error:' + error);
    },
  });

  u = url + 'Epoch/' + prevEpoch + '/FlipAnswersSummary';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function (data) {
      updateEpochFlipsAnswersSummaryData(data);
    },
    error: function (request, error) {
      console.error(u + ', error:' + error);
    },
  });

  u = url + 'Epoch/' + prevEpoch + '/IdentityStatesSummary';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function (data) {
      updateEpochIdentityStatesSummaryData(data);
    },
    error: function (request, error) {
      console.error(u + ', error:' + error);
    },
  });

  getApiData(
    'Epoch/' +
      prevEpoch +
      '/Identities/Count?states[]=Undefined&prevStates[]=Newbie,Verified,Human,Suspended,Zombie',
    (data) => {
      getFailedValidationIdentitiesData(data.result, 0, {
        prevEpoch,
        tableId: '#FailedIdentities',
        prevStates: 'Newbie,Verified,Human,Suspended,Zombie',
      });
      $('#FailedValidationIdentities')[0].textContent = data.result;
    }
  );

  getApiData(
    'Epoch/' +
      prevEpoch +
      '/Identities/Count?states[]=Undefined&prevStates[]=Candidate',
    (data) => {
      getFailedValidationIdentitiesData(data.result, 0, {
        prevEpoch,
        tableId: '#FailedCandidates',
        prevStates: 'Candidate',
      });
      $('#FailedValidationCandidates')[0].textContent = data.result;
    }
  );

  u =
    url +
    'Epoch/' +
    prevEpoch +
    '/Identities/Count?states[]=Newbie,Verified,Human';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function (data) {
      getValidationIdentitiesData(data.result, 0, { prevEpoch });
    },
    error: function (request, error) {
      console.error(u + ', error:' + error);
    },
  });

  u =
    url + 'Epoch/' + prevEpoch + '/Identities/Count?states[]=Suspended,Zombie';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function (data) {
      getSuspendedValidationIdentitiesData(data.result, 0, { prevEpoch });
      $('#MissedValidationIdentities')[0].textContent = data.result;
    },
    error: function (request, error) {
      console.error(u + ', error:' + error);
    },
  });

  u = url + 'Epoch/' + prevEpoch + '/Flips/Count';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function (data) {
      getEpochFlipsData(data.result, 0, { prevEpoch });
    },
    error: function (request, error) {
      console.error(u + ', error:' + error);
    },
  });

  u = url + 'Epoch/' + prevEpoch + '/FlipWrongWordsSummary';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function (data) {
      updateFlipWrongWordsSummary(data);
    },
    error: function (request, error) {
      console.error(u + ', error:' + error);
    },
  });
}

function updateFlipWrongWordsSummary(data) {
  if (data.result == null) {
    return;
  }

  for (i = 0; i < data.result.length; i++) {
    if (data.result[i].value) {
      $('#AbuseFlips')[0].textContent = data.result[i].count;
    }
  }
}

function updateEpochFlipsAnswersSummaryData(data) {
  if (data.result == null) {
    return;
  }
}

function updateValidationEpochData(data) {
  if (data.result == null) {
    return;
  }
  $('#ValidationDate')[0].textContent = dateFmt(data.result.validationTime);
}

function getValidationIdentitiesData(total, loaded, params) {
  const step = loaded == 0 ? 30 : 100;

  if (loaded > total) {
    return;
  }
  u =
    url +
    'Epoch/' +
    params.prevEpoch +
    '/Identities?skip=' +
    loaded +
    '&limit=' +
    step +
    '&states[]=Newbie,Verified,Human';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function (data) {
      updateValidationIdentitiesData(data, total, loaded + step, params);
    },
    error: function (request, error) {
      console.error(u + ', error:' + error);
    },
  });
}

function updateValidationIdentitiesData(data, total, loaded, params) {
  if (data.result == null) {
    return;
  }

  var valid_identities_table = $('#IdentitiesTable');

  addShowMoreTableButton(
    valid_identities_table,
    getValidationIdentitiesData,
    total,
    loaded,
    params
  );

  var nextEpoch = params.prevEpoch * 1 + 1;

  //var FailedValidationCount = 0;
  //var MissedValidationCount = 0;

  for (var i = 0; i < data.result.length; i++) {
    var tr = $('<tr/>');
    var td = $('<td/>');
    td.append(
      '<div class="user-pic"><img src="https://robohash.org/' +
        data.result[i].address.toLowerCase() +
        '" alt="pic"width="32"></div>'
    );
    td.append(
      "<div class='text_block text_block--ellipsis'><a href='./identity?identity=" +
        data.result[i].address +
        "'>" +
        data.result[i].address.substr(0, 15) +
        '...</a></div>'
    );
    tr.append(td);

    var longScoreTxt = '-',
      shortScoreTxt = '-',
      totalScoreTxt = '-';
    if (data.result[i].longAnswers.flipsCount > 0)
      longScoreTxt =
        data.result[i].longAnswers.point +
        ' out of ' +
        data.result[i].longAnswers.flipsCount +
        ' (' +
        precise2(
          (data.result[i].longAnswers.point /
            data.result[i].longAnswers.flipsCount) *
            100
        ) +
        '%)';
    if (data.result[i].shortAnswers.flipsCount > 0)
      shortScoreTxt =
        data.result[i].shortAnswers.point +
        ' out of ' +
        data.result[i].shortAnswers.flipsCount +
        ' (' +
        precise2(
          (data.result[i].shortAnswers.point /
            data.result[i].shortAnswers.flipsCount) *
            100
        ) +
        '%)';
    if (data.result[i].totalShortAnswers.flipsCount > 0)
      totalScoreTxt =
        data.result[i].totalShortAnswers.point +
        ' out of ' +
        data.result[i].totalShortAnswers.flipsCount +
        ' (' +
        precise2(
          (data.result[i].totalShortAnswers.point /
            data.result[i].totalShortAnswers.flipsCount) *
            100
        ) +
        '%)';

    tr.append('<td>' + data.result[i].prevState + '</td>');
    tr.append('<td>' + data.result[i].state + '</td>');
    tr.append('<td>' + shortScoreTxt + '</td>');

    if (data.result[i].prevState == 'Candidate')
      tr.append('<td>' + longScoreTxt + '</td>');
    else tr.append('<td>' + longScoreTxt + '</td>');

    tr.append(
      "<td><a href='./answers?epoch=" +
        nextEpoch +
        '&identity=' +
        data.result[i].address +
        "'><i class='icon icon--thin_arrow_right'></a></td>"
    );
    valid_identities_table.append(tr);
  }
}

function getFailedValidationIdentitiesData(total, loaded, params) {
  const step = loaded == 0 ? 30 : 100;
  if (loaded > total) {
    return;
  }

  getApiData(
    'Epoch/' +
      params.prevEpoch +
      '/Identities?skip=' +
      loaded +
      '&limit=' +
      step +
      '&states[]=Undefined' +
      '&prevStates[]=' +
      params.prevStates,
    (data) => {
      updateFailedValidationIdentitiesData(data, total, loaded + step, params);
    }
  );
}

function updateFailedValidationIdentitiesData(data, total, loaded, params) {
  if (data.result == null) {
    return;
  }

  var failed_identities_table = $(params.tableId);

  addShowMoreTableButton(
    failed_identities_table,
    getFailedValidationIdentitiesData,
    total,
    loaded,
    params
  );

  var nextEpoch = params.prevEpoch * 1 + 1;

  //var FailedValidationCount = 0;
  //var MissedValidationCount = 0;

  for (var i = 0; i < data.result.length; i++) {
    var tr = $('<tr/>');
    var td = $('<td/>');
    td.append(
      '<div class="user-pic"><img src="https://robohash.org/' +
        data.result[i].address.toLowerCase() +
        '" alt="pic"width="32"></div>'
    );
    td.append(
      "<div class='text_block text_block--ellipsis'><a href='./identity?identity=" +
        data.result[i].address +
        "'>" +
        data.result[i].address.substr(0, 15) +
        '...</a></div>'
    );
    tr.append(td);

    var longScoreTxt = '-',
      shortScoreTxt = '-',
      totalScoreTxt = '-';
    if (data.result[i].longAnswers.flipsCount > 0)
      longScoreTxt =
        data.result[i].longAnswers.point +
        ' out of ' +
        data.result[i].longAnswers.flipsCount +
        ' (' +
        precise2(
          (data.result[i].longAnswers.point /
            data.result[i].longAnswers.flipsCount) *
            100
        ) +
        '%)';
    if (data.result[i].shortAnswers.flipsCount > 0)
      shortScoreTxt =
        data.result[i].shortAnswers.point +
        ' out of ' +
        data.result[i].shortAnswers.flipsCount +
        ' (' +
        precise2(
          (data.result[i].shortAnswers.point /
            data.result[i].shortAnswers.flipsCount) *
            100
        ) +
        '%)';
    if (data.result[i].totalShortAnswers.flipsCount > 0)
      totalScoreTxt =
        data.result[i].totalShortAnswers.point +
        ' out of ' +
        data.result[i].totalShortAnswers.flipsCount +
        ' (' +
        precise2(
          (data.result[i].totalShortAnswers.point /
            data.result[i].totalShortAnswers.flipsCount) *
            100
        ) +
        '%)';

    if (
      data.result[i].state != 'Undefined' &&
      data.result[i].state != 'Suspended' &&
      data.result[i].state != 'Zombie'
    ) {
      tr.append('<td>' + data.result[i].prevState + '</td>');
      tr.append('<td>' + data.result[i].state + '</td>');
      tr.append('<td>' + shortScoreTxt + '</td>');

      if (data.result[i].prevState == 'Candidate')
        tr.append('<td>' + longScoreTxt + '</td>');
      else tr.append('<td>' + longScoreTxt + '</td>');

      tr.append(
        "<td><a href='./answers?epoch=" +
          nextEpoch +
          '&identity=' +
          data.result[i].address +
          "'><i class='icon icon--thin_arrow_right'></a></td>"
      );
      //valid_identities_table.append(tr);
    } else {
      tr.append('<td>' + data.result[i].prevState + '</td>');
      //todo authorScore:        tr.append("<td>" + precise2(data.result[i].authorScore*100) + "%</td>");

      if (data.result[i].prevState == 'Invite') {
        tr.append('<td>-</td>');
        tr.append('<td>-</td>');
        tr.append('<td>' + 'Not activated' + '</td>');
      } else {
        tr.append('<td>' + shortScoreTxt + '</td>');
        tr.append('<td>' + longScoreTxt + '</td>');

        if (data.result[i].missed) {
          if (data.result[i].shortAnswers.flipsCount > 0) {
            tr.append('<td>Late submission</td>');
          } else {
            if (data.result[i].requiredFlips > data.result[i].madeFlips)
              tr.append('<td>Not allowed</td>');
            else tr.append('<td>Missed validation</td>');
          }
          //MissedValidationCount++;
        } else {
          tr.append('<td>Wrong answers</td>');
          //FailedValidationCount++;
        }
      }
      tr.append(
        "<td><a href='./answers?epoch=" +
          nextEpoch +
          '&identity=' +
          data.result[i].address +
          "'><i class='icon icon--thin_arrow_right'></a></td>"
      );
      failed_identities_table.append(tr);
    }
  }
  //$('#FailedValidationIdentities')[0].textContent = FailedValidationCount;
  //$('#MissedValidationIdentities')[0].textContent = MissedValidationCount;
}

function getSuspendedValidationIdentitiesData(total, loaded, params) {
  const step = loaded == 0 ? 30 : 100;
  if (loaded > total) {
    return;
  }
  u =
    url +
    'Epoch/' +
    params.prevEpoch +
    '/Identities?skip=' +
    loaded +
    '&limit=' +
    step +
    '&states[]=Suspended,Zombie';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function (data) {
      updateSuspendedValidationIdentitiesData(
        data,
        total,
        loaded + step,
        params
      );
    },
    error: function (request, error) {
      console.error(u + ', error:' + error);
    },
  });
}

function updateSuspendedValidationIdentitiesData(data, total, loaded, params) {
  if (data.result == null) {
    return;
  }

  var suspended_identities_table = $('#SuspendedIdentities');

  addShowMoreTableButton(
    suspended_identities_table,
    getSuspendedValidationIdentitiesData,
    total,
    loaded,
    params
  );

  var nextEpoch = params.prevEpoch * 1 + 1;

  //var FailedValidationCount = 0;
  //var MissedValidationCount = 0;

  for (var i = 0; i < data.result.length; i++) {
    var tr = $('<tr/>');
    var td = $('<td/>');
    td.append(
      '<div class="user-pic"><img src="https://robohash.org/' +
        data.result[i].address.toLowerCase() +
        '" alt="pic"width="32"></div>'
    );
    td.append(
      "<div class='text_block text_block--ellipsis'><a href='./identity?identity=" +
        data.result[i].address +
        "'>" +
        data.result[i].address.substr(0, 15) +
        '...</a></div>'
    );
    tr.append(td);

    var longScoreTxt = '-',
      shortScoreTxt = '-',
      totalScoreTxt = '-';
    if (data.result[i].longAnswers.flipsCount > 0)
      longScoreTxt =
        data.result[i].longAnswers.point +
        ' out of ' +
        data.result[i].longAnswers.flipsCount +
        ' (' +
        precise2(
          (data.result[i].longAnswers.point /
            data.result[i].longAnswers.flipsCount) *
            100
        ) +
        '%)';
    if (data.result[i].shortAnswers.flipsCount > 0)
      shortScoreTxt =
        data.result[i].shortAnswers.point +
        ' out of ' +
        data.result[i].shortAnswers.flipsCount +
        ' (' +
        precise2(
          (data.result[i].shortAnswers.point /
            data.result[i].shortAnswers.flipsCount) *
            100
        ) +
        '%)';
    if (data.result[i].totalShortAnswers.flipsCount > 0)
      totalScoreTxt =
        data.result[i].totalShortAnswers.point +
        ' out of ' +
        data.result[i].totalShortAnswers.flipsCount +
        ' (' +
        precise2(
          (data.result[i].totalShortAnswers.point /
            data.result[i].totalShortAnswers.flipsCount) *
            100
        ) +
        '%)';

    if (
      data.result[i].state != 'Undefined' &&
      data.result[i].state != 'Suspended' &&
      data.result[i].state != 'Zombie'
    ) {
      tr.append('<td>' + data.result[i].prevState + '</td>');
      tr.append('<td>' + data.result[i].state + '</td>');
      tr.append('<td>' + shortScoreTxt + '</td>');

      if (data.result[i].prevState == 'Candidate')
        tr.append('<td>' + longScoreTxt + '</td>');
      else tr.append('<td>' + longScoreTxt + '</td>');

      tr.append(
        "<td><a href='./answers?epoch=" +
          nextEpoch +
          '&identity=' +
          data.result[i].address +
          "'><i class='icon icon--thin_arrow_right'></a></td>"
      );
      //valid_identities_table.append(tr);
    } else {
      tr.append('<td>' + data.result[i].prevState + '</td>');
      //todo authorScore:        tr.append("<td>" + precise2(data.result[i].authorScore*100) + "%</td>");

      if (data.result[i].prevState == 'Invite') {
        tr.append('<td>-</td>');
        tr.append('<td>-</td>');
        tr.append('<td>' + 'Not activated' + '</td>');
      } else {
        tr.append('<td>' + shortScoreTxt + '</td>');
        tr.append('<td>' + longScoreTxt + '</td>');

        if (data.result[i].missed) {
          if (data.result[i].shortAnswers.flipsCount > 0) {
            tr.append('<td>Late submission</td>');
          } else {
            if (data.result[i].requiredFlips != data.result[i].madeFlips)
              tr.append('<td>Not allowed</td>');
            else tr.append('<td>Missed validation</td>');
          }
          //MissedValidationCount++;
        } else {
          tr.append('<td>Wrong answers</td>');
          //FailedValidationCount++;
        }
      }
      tr.append(
        "<td><a href='./answers?epoch=" +
          nextEpoch +
          '&identity=' +
          data.result[i].address +
          "'><i class='icon icon--thin_arrow_right'></a></td>"
      );
      suspended_identities_table.append(tr);
    }
  }
  //$('#FailedValidationIdentities')[0].textContent = FailedValidationCount;
  //$('#MissedValidationIdentities')[0].textContent = MissedValidationCount;
}

function getEpochFlipsData(total, loaded, params) {
  const step = loaded == 0 ? 30 : 100;

  if (loaded > total) {
    return;
  }

  u =
    url +
    'Epoch/' +
    params.prevEpoch +
    '/Flips?skip=' +
    loaded +
    '&limit=' +
    step;
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function (data) {
      updateEpochFlipsData(data, total, loaded + step, params);
    },
    error: function (request, error) {
      console.error(u + ', error:' + error);
    },
  });
}

function updateEpochFlipsData(data, total, loaded, params) {
  if (data.result == null) {
    return;
  }

  var table = $('#FlipsTable');
  addShowMoreTableButton(table, getEpochFlipsData, total, loaded, params);

  for (var i = 0; i < data.result.length; i++) {
    var tr = $('<tr/>');
    var td = $('<td/>');

    if (data.result[i].icon != null) {
      var buffArray = new Uint8Array(
        data.result[i].icon
          .substring(2)
          .match(/.{1,2}/g)
          .map((byte) => parseInt(byte, 16))
      );
      var src = URL.createObjectURL(
        new Blob([buffArray], { type: 'image/jpeg' })
      );
      td.append(
        '<div class="user-pic"><img src="' +
          src +
          '" alt="pic"width="44" height="44">' +
          (data.result[i].withPrivatePart
            ? '<div class="locked_sign"><i class="icon icon--lock"></i></div>'
            : '') +
          '</img></div>'
      );
      //URL.revokeObjectURL(src);
    } else {
      td.append(
        '<div class="user-pic"><img src="./images/flip_icn.png' +
          '" alt="pic" width="44"></div>'
      );
    }

    var cid = data.result[i].cid;
    td.append(
      "<div class='text_block text_block--ellipsis'><a href='./flip?flip=" +
        cid +
        "'>" +
        cid.substr(0, 10) +
        '...</a></div>'
    );
    tr.append(td);

    var td = $('<td/>');
    var author = data.result[i].author;
    td.append(
      '<div class="user-pic"><img src="https://robohash.org/' +
        author.toLowerCase() +
        '" alt="pic"width="32"></div>'
    );
    td.append(
      "<div class='text_block text_block--ellipsis'><a href='./identity?identity=" +
        author +
        "'>" +
        author.substr(0, 12) +
        '...</a></div>'
    );
    tr.append(td);

    var icon = '';
    var keywords = '-';

    if (data.result[i].words != null) {
      keywords =
        data.result[i].words.word1.name + '/' + data.result[i].words.word2.name;

      if (data.result[i].wrongWords) {
        icon = '<i class="icon icon--micro_fail"></i>';
      } else {
        icon = '<i class="icon icon--micro_success"></i>';
      }
    }

    tr.append('<td>' + icon + '<span>' + keywords + '</span></td>');
    if (data.result[i].status == '') {
      tr.append('<td>Not used</td>');
      tr.append('<td>-</td>');
      tr.append('<td>-</td>');
    } else {
      tr.append(
        '<td>' +
          data.result[i].shortRespCount +
          ' / ' +
          data.result[i].longRespCount +
          '</td>'
      );

      if (
        data.result[i].status == 'Qualified' ||
        data.result[i].status == 'WeaklyQualified'
      )
        tr.append('<td>' + data.result[i].answer + '</td>');
      else tr.append('<td>-</td>');
      tr.append(
        '<td>' +
          (data.result[i].status == 'WeaklyQualified'
            ? 'Weak'
            : data.result[i].status == 'Qualified'
            ? 'Strong'
            : 'No consensus') +
          '</td>'
      );
    }

    wordsScore =
      data.result[i].wrongWordsVotes === 0
        ? '-'
        : data.result[i].wrongWordsVotes;
    tr.append('<td>' + wordsScore + '</td>');

    table.append(tr);
  }
}
