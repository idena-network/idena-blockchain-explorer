function initIdentity(identity) {
  prepareIdentityData(identity);
  $('#IdentityAddress')[0].textContent = identity;
  $('#IdentityAvatar img')[0].src =
    'https://robohash.org/' + identity.toLowerCase();

  $('#BalanceAddress')[0].href = '/address?address=' + identity;
}

var CurrentEpoch = 0;

function prepareIdentityData(identity) {
  var u = url + 'epoch/last';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      if (data.result == null) {
        return;
      }
      CurrentEpoch = data.result.epoch;
      getIdentityData(identity);
      updateEpochCountFlipsData(CurrentEpoch, identity);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });
}

function getIdentityData(identity) {
  var u = url + 'Identity/' + identity;
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateIdentityData(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  var u = url + 'Identity/' + identity + '/Age';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateIdentityAgeData(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  var u = url + 'Identity/' + identity + '/FlipStates';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateIdentityFlipStatesData(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  var u = url + 'Identity/' + identity + '/FlipQualifiedAnswers';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateIdentityFlipQualifiedAnswersData(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  var u = url + 'Identity/' + identity + '/Epochs?skip=0&limit=100';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateIdentityEpochsData(data, identity);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  var u = url + 'OnlineIdentity/' + identity;
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateOnlineMiningStatus(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  var u = url + '/Address/' + identity + '/Flips?skip=0&limit=100';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateAddressFlipsData(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  var u = url + '/Address/' + identity;
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateIdentityAddressData(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  //  var u = url + '/Identity/' + identity + '/Invites?skip=0&limit=100';
  var u = url + '/Identity/' + identity + '/Invites/Count';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      //updateIdentityInvitesData(data);
      getIdentityInvitesData(data.result, 0, { identity });
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });
}

function updateEpochCountFlipsData(epoch, identity) {
  var table = $('#IdentityFlipsTable');
  table
    .find('td')
    .parent()
    .remove();
}

function updateAddressFlipsData(data) {
  if (data.result == null) {
    return;
  }
  var table = $('#IdentityFlipsTable');

  for (var i = 0; i < data.result.length; i++) {
    var tr = $('<tr/>');

    var epoch = data.result[i].epoch * 1 + 1;
    var td = $('<td/>');
    if (CurrentEpoch + 1 == epoch) {
      td.append("<div class='text_block text_block--ellipsis'>-</div>");
    } else {
      td.append(
        "<div class='text_block text_block--ellipsis'><a href='./validation?epoch=" +
          epoch +
          "'>" +
          epochFmt(epoch) +
          '</a></div>'
      );
    }
    tr.append(td);

    var td = $('<td/>');
    if (data.result[i].icon != null) {
      var buffArray = new Uint8Array(
        data.result[i].icon
          .substring(2)
          .match(/.{1,2}/g)
          .map(byte => parseInt(byte, 16))
      );
      var src = URL.createObjectURL(
        new Blob([buffArray], { type: 'image/jpeg' })
      );
      td.append(
        '<div class="user-pic"><img src="' +
          src +
          '" alt="pic"width="44" height="44"></div>'
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
        cid.substr(0, 15) +
        '...</a></div>'
    );
    tr.append(td);

    var Keywords = '-';
    var icon = '';
    if (data.result[i].words != null) {
      Keywords =
        data.result[i].words.word1.name + '/' + data.result[i].words.word2.name;

      if (data.result[i].wrongWords) {
        icon = '<i class="icon icon--micro_fail"></i>';
      } else {
        icon = '<i class="icon icon--micro_success"></i>';
      }
    }
    tr.append('<td>' + icon + '<span>' + Keywords + '</span></td>');

    var status = data.result[i].status == '' ? '-' : data.result[i].status;
    tr.append('<td>' + flipQualificationStatusFmt(status) + '</td>');
    tr.append('<td>' + timeFmt(data.result[i].timestamp) + '</td>');
    tr.append('<td>' + data.result[i].size + '</td>');

    table.append(tr);
  }
}

function updateIdentityAgeData(data) {
  if (data.result == null) {
    return;
  }
  $('#IdentityAge')[0].textContent = data.result;
}

function updateIdentityEpochsData(data, identity) {
  var table = $('#IdentityEpochsTable');
  table
    .find('td')
    .parent()
    .remove();

  if (data.result == null) {
    return;
  }

  for (var i = 0; i < data.result.length; i++) {
    var epoch = data.result[i].epoch;
    var nextEpoch = epoch * 1 + 1;
    if (nextEpoch == CurrentEpoch + 1) {
      continue;
    }

    var tr = $('<tr/>');
    var td = $('<td/>');
    td.append(
      "<div class='text_block text_block--ellipsis'><a href='./epoch?epoch=" +
        nextEpoch +
        "'>" +
        epochFmt(nextEpoch) +
        '</a></div>'
    );
    tr.append(td);
    tr.append('<td>' + identityStatusFmt(data.result[i].prevState) + '</td>');

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
    //        if (data.result[i].totalShortAnswers.flipsCount>0)
    //         totalScoreTxt=data.result[i].totalShortAnswers.point +" out of "+data.result[i].totalShortAnswers.flipsCount +" ("+precise2(data.result[i].totalShortAnswers.point/data.result[i].totalShortAnswers.flipsCount*100) + "%)";

    var state = data.result[i].state;

    if (state != 'Verified' && state != 'Newbie' && state != 'Human') {
      tr.append('<td>' + identityStatusFmt(state) + '</td>');

      if (data.result[i].missed) {
        if (data.result[i].shortAnswers.flipsCount > 0) {
          tr.append('<td>' + shortScoreTxt + '</td>');
          tr.append('<td>' + longScoreTxt + '</td>');
          tr.append('<td>Late submission</td>');
          tr.append(
            "<td><a href='./answers?epoch=" +
              nextEpoch +
              '&identity=' +
              identity +
              "'><i class='icon icon--thin_arrow_right'></a></td>"
          );
        } else {
          if (data.result[i].requiredFlips > data.result[i].madeFlips) {
            tr.append('<td>-</td>');
            tr.append('<td>-</td>');
            tr.append('<td>Not allowed</td>');
            tr.append(
              "<td><a href='./answers?epoch=" +
                nextEpoch +
                '&identity=' +
                identity +
                "'><i class='icon icon--thin_arrow_right'></a></td>"
            );
          } else {
            tr.append('<td>-</td>');
            tr.append('<td>-</td>');
            tr.append('<td>Missed validation</td>');
            tr.append(
              "<td><a href='./answers?epoch=" +
                nextEpoch +
                '&identity=' +
                identity +
                "'><i class='icon icon--thin_arrow_right'></a></td>"
            );
          }
        }
      } else {
        tr.append('<td>' + shortScoreTxt + '</td>');
        tr.append('<td>' + longScoreTxt + '</td>');
        tr.append('<td>Wrong answers</td>');
        tr.append(
          "<td><a href='./answers?epoch=" +
            nextEpoch +
            '&identity=' +
            identity +
            "'><i class='icon icon--thin_arrow_right'></a></td>"
        );
      }
    } else {
      tr.append('<td>' + data.result[i].state + '</td>');
      tr.append('<td>' + shortScoreTxt + '</td>');
      tr.append('<td>' + longScoreTxt + '</td>');
      tr.append('<td>Successful</td>');
      tr.append(
        "<td><a href='./answers?epoch=" +
          nextEpoch +
          '&identity=' +
          identity +
          "'><i class='icon icon--thin_arrow_right'></a></td>"
      );
    }
    table.append(tr);
  }
}

function updateIdentityFlipStatesData(data) {
  if (data.result == null) {
    return;
  }

  var solvedFlips = 0,
    qualifiedFlips = 0,
    weaklyQualifiedFlips = 0,
    notQualifiedFlips = 0;
  for (var i = 0; i < data.result.length; i++) {
    var state = data.result[i].value;
    if (state == 'Qualified') qualifiedFlips = data.result[i].count;
    if (state == 'WeaklyQualified') weaklyQualifiedFlips = data.result[i].count;
    if (state == 'NotQualified') notQualifiedFlips = data.result[i].count;
  }
  var totalFlips = qualifiedFlips + weaklyQualifiedFlips + notQualifiedFlips;
  $('#IdentityFlipsCreated')[0].textContent = totalFlips;
  $('#IdentityQualifiedFlips')[0].textContent =
    qualifiedFlips + ' / ' + weaklyQualifiedFlips + ' / ' + notQualifiedFlips;
}

function updateIdentityFlipQualifiedAnswersData(data) {
  if (data.result == null) {
    return;
  }
  var inappropriate = 0;
  for (var i = 0; i < data.result.length; i++) {
    if (data.result[i].value == 'Inappropriate')
      inappropriate = data.result[i].count;
  }
  $('#IdentityInappropriateFlips')[0].textContent = inappropriate;
}

function updateIdentityData(data) {
  if (data.result == null) {
    return;
  }
  if (data.result.state == 'Human') {
    $('#IdentityAvatar div').append('<i class="icon icon--status"></i>');
  }
  $('#IdentityStatus')[0].textContent = identityStatusFmt(data.result.state);

  if (
    data.result.state == 'Newbie' ||
    data.result.state == 'Verified' ||
    data.result.state == 'Human'
  )
    $('.onlineMiner').removeClass('hidden');

  $('#IdentitySolvedFlips')[0].textContent =
    data.result.totalShortAnswers.flipsCount; //shortAnswers.flipsCount; without state fork
  $('#IdentityRightAnswers')[0].textContent =
    data.result.totalShortAnswers.point; //shortAnswers.point;
  if (data.result.shortAnswers.flipsCount > 0)
    $('#IdentityScore')[0].textContent =
      precise2(
        (data.result.totalShortAnswers.point /
          data.result.totalShortAnswers.flipsCount) *
          100
      ) + '%';
}

function updateIdentityAddressData(data) {
  if (data.result == null) {
    return;
  }
  $('#AddressStake')[0].textContent = dnaFmt(precise6(data.result.stake));
}

function updateOnlineMiningStatus(data) {
  if (data.result == null) {
    return;
  }

  if (data.result.lastActivity) {
    $('#LastSeen')[0].textContent = timeFmt(data.result.lastActivity);
  } else {
    $('#LastSeen')[0].textContent = '-';
  }

  if (data.result.online) {
    $('#OnlineMinerStatus')[0].textContent = 'On';
  } else {
    $('#OnlineMinerStatus')[0].textContent = 'Off';
  }

  $('#Penalty')[0].textContent =
    data.result.penalty == 0 ? '-' : dnaFmt(precise6(data.result.penalty));
}

const getIdentityInvitesData = function(total, loaded, params) {
  const step = loaded == 0 ? 30 : 100;

  if (loaded > total) {
    return;
  }

  //' + identity + '//Count';

  u =
    url +
    'Identity/' +
    params.identity +
    '/Invites?skip=' +
    loaded +
    '&limit=' +
    step;
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateIdentityInvitesData(data, total, loaded + step, params);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });
};

function updateIdentityInvitesData(data, total, loaded, params) {
  if (data.result == null) {
    return;
  }

  var table = $('#IdentityInvitesTable');
  addShowMoreTableButton(table, getIdentityInvitesData, total, loaded, params);

  for (var i = 0; i < data.result.length; i++) {
    var tr = $('<tr/>');
    var td = $('<td/>');

    tr.append(
      '<td><a href="./epoch?epoch=' +
        data.result[i].epoch +
        '#invitations">' +
        epochFmt(data.result[i].epoch) +
        '</a></td>'
    );

    td.append(
      "<div class='text_block text_block--ellipsis'><a href='./tx?tx=" +
        data.result[i].hash +
        "'>" +
        data.result[i].hash.substr(0, 5) +
        '...</a></div>'
    );
    tr.append(td);

    tr.append('<td>' + timeFmt(data.result[i].timestamp) + '</td>');

    var activation = data.result[i].activationHash;
    if (activation != '') {
      var td = $('<td/>');
      td.append(
        "<div class='text_block text_block--ellipsis'><a href='./tx?tx=" +
          activation +
          "'>" +
          data.result[i].hash.substr(0, 8) +
          '...</a></div>'
      );
      tr.append(td);

      tr.append('<td>' + timeFmt(data.result[i].activationTimestamp) + '</td>');

      var td = $('<td/>');
      td.append(
        '<div class="user-pic"><img src="https://robohash.org/' +
          data.result[i].activationAuthor.toLowerCase() +
          '" alt="pic"width="32"></div>'
      );
      td.append(
        "<div class='text_block text_block--ellipsis'><a href='./identity?identity=" +
          data.result[i].activationAuthor +
          "'>" +
          data.result[i].activationAuthor.substr(0, 7) +
          '...</a></div>'
      );
      tr.append(td);
    } else {
      tr.append('<td>Not activated</td>');
      tr.append('<td>-</td>');
      tr.append('<td>-</td>');
    }

    var validationResult = '-';
    if (data.result[i].state != '') {
      validationResult =
        data.result[i].state == 'Undefined' ? 'Failed' : 'Successful';
    }
    tr.append('<td>' + validationResult + '</td>');

    table.append(tr);
  }
}
