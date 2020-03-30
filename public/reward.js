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

function reward_getRewardsData(epoch, onSuccess) {
  getApiData('Epoch/' + epoch + '/RewardsSummary', data => {
    onSuccess(data);
  });
}

function reward_getIdentityData(epoch, identity, onSuccess) {
  getApiData('Epoch/' + epoch + '/Identity/' + identity, data => {
    onSuccess(data);
  });
}

function reward_IdentityFlipsRewardsData(epoch, identity, onSuccess) {
  getApiData(
    'Epoch/' + epoch + '/Identity/' + identity + '/RewardedFlips',
    data => {
      onSuccess(data);
    }
  );
}

function getIdentityRewardData(identity, epoch) {
  getApiData(
    'Epoch/' + epoch + '/Identity/' + identity + '/Authors/Bad',
    penaltyReasonData => {
      updatePenaltyReasonData(penaltyReasonData);

      reward_getRewardsData(epoch, epochRewardData => {
        reward_getIdentityData(epoch, identity, identityData => {
          reward_IdentityFlipsRewardsData(epoch, identity, flipData => {
            updateIdentityRewardData(identityData);
            updateAppendEmptyFlipsRewardsData(
              identityData,
              epochRewardData,
              penaltyReasonData
            );
            updateIdentityFlipsRewardsData(
              flipData,
              epochRewardData,
              penaltyReasonData
            );

            getApiData('Identity/' + identity + '/Age', identityAgeData => {
              getApiData(
                'Epoch/' + epoch + '/Identity/' + identity + '/Rewards',
                data => {
                  updateIdentityEpochRewardsData(
                    data,
                    penaltyReasonData,
                    epochRewardData,
                    identityAgeData,
                    identityData
                  );
                }
              );
            });
          });
        });
      });
    }
  );

  getApiData(
    'Identity/' + identity + '/Invites',
    data => {
      updateIdentityInvitesRewardsData(data);
    },
    0,
    100
  );
}

function updatePenaltyReasonData(data) {
  var icon = 'icon--micro_fail';

  if (data.result == null) {
    $('#Penalized')[0].textContent = 'No';
    icon = 'icon--micro_success';
  } else {
    const reason = data.result.reason;
    if (reason == 'WrongWords') {
      $('#Penalized')[0].textContent = 'Yes (flip was reported)';
    } else if (reason == 'QualifiedByNone') {
      $('#Penalized')[0].textContent = 'Yes (flip was not available)';
    } else if (reason == 'NoQualifiedFlips') {
      $('#Penalized')[0].textContent = 'Yes (non of the flips are qualified)';
    }
  }
  $('#PenalizedIcon').addClass(icon);
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

function updateIdentityEpochRewardsData(
  data,
  penaltyReasonData,
  epochRewardData,
  identityAgeData,
  identityData
) {
  var missedInvitationsReward = 0,
    missedValidationReward = 0,
    missedFlipsReward = 0;

  var InvitationsReward = 0,
    ValidationReward = 0,
    FlipsReward = 0;

  if (penaltyReasonData.result != null) {
    //Penalized

    missedInvitationsReward = epochRewardData.result.invitationsShare;
    missedFlipsReward =
      epochRewardData.result.flipsShare * identityData.result.availableFlips;
    missedValidationReward =
      Math.pow(epochRewardData.result.validationShare * 1, 0.33) *
      identityAgeData.result;
  } else {
    if (data.result == null) {
      return;
    }

    missedFlipsReward =
      epochRewardData.result.flipsShare *
      (identityData.result.availableFlips - identityData.result.madeFlips);

    for (var i = 0; i < data.result.length; i++) {
      const tr = $('<tr/>');
      const td = $('<td/>');

      const s = data.result[i].type;
      const v = data.result[i].stake * 1 + data.result[i].balance * 1;

      if (s == 'Invitations') InvitationsReward = InvitationsReward + v;
      if (s == 'Invitations2') InvitationsReward = InvitationsReward + v;
      if (s == 'Invitations3') InvitationsReward = InvitationsReward + v;
      if (s == 'SavedInvite') InvitationsReward = InvitationsReward + v;
      if (s == 'SavedInviteWin') InvitationsReward = InvitationsReward + v;
      if (s == 'Flips') FlipsReward = FlipsReward + v;
      if (s == 'Validation') ValidationReward = ValidationReward + v;
    }
  }

  $('#ValidationReward')[0].textContent = dnaFmt(ValidationReward);
  $('#FlipsReward')[0].textContent = dnaFmt(FlipsReward);
  $('#InvitationsReward')[0].textContent = dnaFmt(InvitationsReward);

  const total = InvitationsReward * 1 + FlipsReward * 1 + ValidationReward * 1;
  $('#TotalRewards')[0].textContent = dnaFmt(total);

  $('#MissedValidationReward')[0].textContent = dnaFmt(missedValidationReward);
  $('#MissedFlipsReward')[0].textContent = dnaFmt(missedFlipsReward);
  $('#MissedInvitationsReward')[0].textContent = dnaFmt(
    missedInvitationsReward
  );

  const missedTotal =
    missedInvitationsReward * 1 +
    missedFlipsReward * 1 +
    missedValidationReward * 1;
  $('#MissedTotalRewards')[0].textContent = dnaFmt(missedTotal);
}

function updateIdentityFlipsRewardsData(
  data,
  epochRewardData,
  penaltyReasonData
) {
  if (epochRewardData.result == null || data.result == null) {
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

    var flipReward = data.result[i].rewarded
      ? epochRewardData.result.flipsShare
      : 0;

    var missingFlipReward = data.result[i].rewarded
      ? 0
      : epochRewardData.result.flipsShare;
    tr.append('<td>' + dnaFmt(flipReward, '') + '</td>');
    tr.append(
      '<td style="color: red">' + dnaFmt(missingFlipReward, '') + '</td>'
    );

    const reason =
      penaltyReasonData.result == null ? '-' : 'Validation penalty';
    tr.append('<td>' + reason + '</td>');

    table.append(tr);
  }
}

function updateAppendEmptyFlipsRewardsData(
  data,
  epochRewardData,
  penaltyReasonData
) {
  if (epochRewardData.result == null || data.result == null) {
    return;
  }
  var table = $('#FlipsRewardsTable');

  const cnt = data.result.availableFlips - data.result.madeFlips;

  for (var i = 0; i < cnt; i++) {
    var tr = $('<tr/>');

    var td = $('<td/>');
    td.append(
      '<div class="user-pic"><img src="./images/flip_icn.png' +
        '" alt="pic" width="44"></div>'
    );

    td.append(
      "<div class='text_block text_block--ellipsis'>Flip was not submitted</div>"
    );
    tr.append(td);

    var Keywords = '-';
    var icon = '';
    tr.append('<td>' + icon + '<span>' + Keywords + '</span></td>');

    var status = '-';
    tr.append('<td>' + flipQualificationStatusFmt(status) + '</td>');

    var flipReward = 0;
    var missingFlipReward = epochRewardData.result.flipsShare;
    tr.append('<td>' + dnaFmt(flipReward, '') + '</td>');
    tr.append(
      '<td style="color: red">' + dnaFmt(missingFlipReward, '') + '</td>'
    );

    const reason =
      penaltyReasonData.result != null ? '-' : 'Missing extra flip';
    tr.append('<td>' + reason + '</td>');

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
