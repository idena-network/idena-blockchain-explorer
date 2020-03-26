function initIdentityReward(identity, epoch) {
  getIdentityRewardData(identity, epoch - 1);
  $('#IdentityAddress')[0].textContent = identity;
  $('#EpochId')[0].textContent = epochFmt(epoch);

  $('#DetailsEpochId')[0].textContent = epochFmt(epoch);
  $('#DetailsEpochId')[0].href = './rewards?epoch=' + epoch;
  $('#DetailsIdentityId')[0].textContent = identity.substr(0, 35) + '...';
  $('#DetailsIdentityId')[0].href = './identity?identity=' + identity;

  $('#IdentityAvatar img')[0].src =
    'https://robohash.org/' + identity.toLowerCase();

  $('#BalanceAddress')[0].href = '/address?address=' + identity + '#rewards';
}

function getIdentityRewardData(identity, epoch) {
  var u = url + 'Epoch/' + epoch + '/Identity/' + identity;
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateIdentityRewardData(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  u = url + 'Identity/' + identity + '/EpochRewards?skip=0&limit=100'; //todo epoch fliter
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateIdentityEpochRewardsData(data);
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
      updateIdentityFlipsRewardsData(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  var u = url + '/Identity/' + identity + '/Invites?skip=0&limit=100';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateIdentityInvitesRewardsData(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });
}

function updateIdentityRewardData(data) {
  if (data.result == null) {
    return;
  }

  if (data.result.state == 'Human') {
    $('#IdentityAvatar div').append('<i class="icon icon--status"></i>');
  }

  if (
    data.result.state == 'Newbie' ||
    data.result.state == 'Verified' ||
    data.result.state == 'Human'
  ) {
    $('#ValidationStatus')[0].textContent = 'Successful validation';
  } else {
    $('#ValidationStatus')[0].textContent = 'Validation failed';
  }

  $('#AfterValidationStatus')[0].textContent = identityStatusFmt(
    data.result.state
  );
  $('#BeforeValidationStatus')[0].textContent = identityStatusFmt(
    data.result.prevState
  );

  if (data.result.missed) {
    if (data.result.shortAnswers.flipsCount > 0) {
      $('#ValidationResult')[0].textContent = 'Late submission';
      $('#ShortInTime')[0].textContent = 'Late';
      $('#LongInTime')[0].textContent = 'Late';
    } else {
      $('#ValidationResult')[0].textContent = 'Missed validation';
      if (data.result.approved) {
        $('#ShortInTime')[0].textContent = 'Not accomplished';
        $('#LongInTime')[0].textContent = 'No answers';
      } else {
        $('#ShortInTime')[0].textContent = 'Missing';
        $('#LongInTime')[0].textContent = 'Missing';
      }
    }
  } else {
    if (
      data.result.state == 'Newbie' ||
      data.result.state == 'Verified' ||
      data.result.state == 'Human'
    ) {
      $('#ValidationResult')[0].textContent = 'Successful';
    } else {
      $('#ValidationResult')[0].textContent = 'Wrong answers';
    }
  }
}

function updateIdentityEpochRewardsData(data) {
  if (data.result == null) {
    return;
  }

  var i = 0;
  var InvitationsReward = 0,
    ValidationReward = 0,
    FlipsReward = 0;
  for (var j = 0; j < data.result[i].rewards.length; j++) {
    var tr = $('<tr/>');
    var td = $('<td/>');

    var s = data.result[i].rewards[j].type;
    var v =
      data.result[i].rewards[j].stake * 1 +
      data.result[i].rewards[j].balance * 1;

    if (s == 'Invitations') InvitationsReward = InvitationsReward + v;
    if (s == 'Invitations2') InvitationsReward = InvitationsReward + v;
    if (s == 'Invitations3') InvitationsReward = InvitationsReward + v;
    if (s == 'SavedInvite') InvitationsReward = InvitationsReward + v;
    if (s == 'SavedInviteWin') InvitationsReward = InvitationsReward + v;
    if (s == 'Flips') FlipsReward = FlipsReward + v;
    if (s == 'Validation') ValidationReward = ValidationReward + v;
  }

  $('#ValidationReward')[0].textContent = dnaFmt(ValidationReward);
  $('#FlipsReward')[0].textContent = dnaFmt(FlipsReward);
  $('#InvitationsReward')[0].textContent = dnaFmt(InvitationsReward);

  var total = InvitationsReward * 1 + FlipsReward * 1 + ValidationReward * 1;
  $('#TotalRewards')[0].textContent = dnaFmt(total);
}

function updateIdentityFlipsRewardsData(data) {
  if (data.result == null) {
    return;
  }
  var table = $('#FlipsRewardsTable');

  for (var i = 0; i < data.result.length; i++) {
    var tr = $('<tr/>');

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

function updateIdentityInvitesRewardsData(data) {
  var table = $('#InvitationsRewardsTable');
  table
    .find('td')
    .parent()
    .remove();
  if (data.result == null) {
    return;
  }

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
