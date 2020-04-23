var totalInvitationMissedReward = 0;

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
  $('#ValidationResultLink')[0].href =
    './answers?epoch=' + epoch + '&identity=' + identity;
}

function getIdentityRewardData(identity, epoch) {
  getApiData(
    'Epoch/' + epoch + '/Identity/' + identity + '/Authors/Bad',
    (penaltyReasonData) => {
      updatePenaltyReasonData(penaltyReasonData);

      getApiData('Epoch/' + epoch + '/RewardsSummary', (epochRewardData) => {
        //
        getApiData(
          'Epoch/' + epoch + '/Identity/' + identity,
          (identityData) => {
            // Invitations
            getApiData(
              'Epoch/' + epoch + '/Identity/' + identity + '/RewardedInvites',
              (rewardedInvitesData) => {
                //availableInvitesData
                getApiData(
                  'Epoch/' +
                    epoch +
                    '/Identity/' +
                    identity +
                    '/AvailableInvites',
                  (availableInvitesData) => {
                    getApiData(
                      'Epoch/' +
                        epoch +
                        '/Identity/' +
                        identity +
                        '/SavedInviteRewards',
                      (savedInviteData) => {
                        updateIdentityInvitesRewardsData(
                          epoch,
                          rewardedInvitesData,
                          epochRewardData,
                          penaltyReasonData,
                          identityData,
                          availableInvitesData,
                          savedInviteData
                        );

                        getApiData(
                          'Epoch/' +
                            epoch +
                            '/Identity/' +
                            identity +
                            '/Rewards',
                          (identityRewardsData) => {
                            updateIdentityEpochRewardsData(
                              epoch,
                              identityRewardsData,
                              penaltyReasonData,
                              epochRewardData,
                              identityData
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
            // Flips
            getApiData(
              'Epoch/' + epoch + '/Identity/' + identity + '/RewardedFlips',
              (flipData) => {
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
              }
            );
          }
        );
      });
    }
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
      $('#Penalized')[0].textContent = 'Yes (flip was not availalbe)';
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
    //$('#RewardSection').addClass('hidden');
    if (data.result.shortAnswers.flipsCount > 0) {
      $('#ValidationResult')[0].textContent = 'Late submission';
    } else {
      $('#ValidationResult')[0].textContent = 'Missed validation';
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
  epoch,
  data,
  penaltyReasonData,
  epochRewardData,
  identityData
) {
  if (
    identityData.result == null ||
    (identityData.result.state != 'Newbie' &&
      identityData.result.state != 'Verified' &&
      identityData.result.state != 'Human')
  ) {
    return;
  }

  var missedInvitationsReward = 0,
    missedValidationReward = 0,
    missedFlipsReward = 0;

  var InvitationsReward = 0,
    ValidationReward = 0,
    FlipsReward = 0;

  var age = epoch - identityData.result.birthEpoch + 1;

  if (penaltyReasonData.result != null && epochRewardData.result != null) {
    //Penalized

    missedInvitationsReward = totalInvitationMissedReward;
    missedValidationReward =
      Math.pow(age * 1, 1 / 3) * epochRewardData.result.validationShare;
  }

  if (identityData.result != null && epochRewardData.result != null) {
    if (
      identityData.result.state != 'Newbie' &&
      identityData.result.state != 'Verified' &&
      identityData.result.state != 'Human'
    ) {
      missedValidationReward =
        Math.pow(age * 1, 1 / 3) * epochRewardData.result.validationShare;
    }
  }

  if (data.result != null) {
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

  missedFlipsReward =
    epochRewardData.result.flipsShare * identityData.result.availableFlips -
    FlipsReward;
  missedFlipsReward = missedFlipsReward < 0 ? 0 : missedFlipsReward;

  $('#ValidationReward')[0].textContent = dnaFmt(ValidationReward);
  $('#FlipsReward')[0].textContent = dnaFmt(FlipsReward);
  $('#InvitationsReward')[0].textContent = dnaFmt(InvitationsReward);

  const total = InvitationsReward * 1 + FlipsReward * 1 + ValidationReward * 1;
  $('#TotalRewards')[0].textContent = dnaFmt(total);

  $('#MissedValidationReward')[0].textContent = dnaFmt(missedValidationReward);
  $('#MissedFlipsReward')[0].textContent = dnaFmt(missedFlipsReward);
  $('#MissedInvitationsReward')[0].textContent = dnaFmt(
    totalInvitationMissedReward
  );

  const missedTotal =
    totalInvitationMissedReward * 1 +
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
          .map((byte) => parseInt(byte, 16))
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

      if (
        data.result[i].wrongWords ||
        data.result[i].status == 'QualifiedByNone'
      ) {
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

function updateIdentityInvitesRewardsData(
  epoch,
  data,
  epochRewardData,
  penaltyReasonData,
  identityData,
  availableInvitesData,
  savedInviteData
) {
  var table = $('#InvitationsRewardsTable');

  if (data.result == null) {
    return;
  }
  if (epochRewardData.result == null) {
    return;
  }
  if (identityData.result == null) {
    return;
  }
  if (availableInvitesData.result == null) {
    return;
  }

  if (
    identityData.result.state != 'Newbie' &&
    identityData.result.state != 'Verified' &&
    identityData.result.state != 'Human'
  ) {
    return;
  }

  var prev1EpochInviteActivated = 0;
  var prev2EpochInviteActivated = 0;
  var prev3EpochInviteActivated = 0;
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

    var activation = data.result[i].activationHash;
    var killing = data.result[i].killInviteeHash != null;

    if (killing || !activation) {
      continue;
    }

    if (data.result[i].epoch == epoch && activation != '') {
      prev1EpochInviteActivated++;
    }
    if (data.result[i].epoch == epoch - 1 && activation != '') {
      prev2EpochInviteActivated++;
    }
    if (data.result[i].epoch == epoch - 2 && activation != '') {
      prev3EpochInviteActivated++;
    }

    if (activation != '') {
      var td = $('<td/>');

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
    }

    var validationResult = '-';
    var isValidated = false;
    if (data.result[i].state != '') {
      if (
        data.result[i].state == 'Newbie' ||
        data.result[i].state == 'Human' ||
        data.result[i].state == 'Verified'
      ) {
        validationResult = 'Successful';
        isValidated = true;
      } else {
        validationResult = 'Failed';
      }
    }
    tr.append('<td>' + validationResult + '</td>');

    var rewardCoef = 3;
    if (data.result[i].epoch == epoch - 1) {
      rewardCoef = rewardCoef * 3;
    } else if (data.result[i].epoch == epoch - 2) {
      rewardCoef = rewardCoef * 6;
    }

    var invitationReward = epochRewardData.result.invitationsShare * rewardCoef;
    var missingInvitationReward = 0;
    var reason = '-';

    if (isValidated && penaltyReasonData.result != null) {
      reason = 'Validation penalty';
      missingInvitationReward = invitationReward;
      totalInvitationMissedReward =
        totalInvitationMissedReward + missingInvitationReward * 1;
      invitationReward = 0;
    } else if (!isValidated) {
      reason = 'Invitee failed';
      missingInvitationReward = invitationReward;
      totalInvitationMissedReward =
        totalInvitationMissedReward + missingInvitationReward * 1;
      invitationReward = 0;
    }

    tr.append('<td>' + dnaFmt(invitationReward, '') + '</td>');
    tr.append(
      '<td style="color: red">' + dnaFmt(missingInvitationReward, '') + '</td>'
    );
    tr.append('<td>' + reason + '</td>');
    table.append(tr);
  }

  for (var i = 0; i < availableInvitesData.result.length; i++) {
    // Saved invitations in the current epoch
    //Append saved invitations
    if (
      availableInvitesData.result[i].epoch == epoch &&
      savedInviteData.result
    ) {
      for (j = 0; j < savedInviteData.result.length; j++) {
        var tr = $('<tr/>');
        var td = $('<td/>');

        tr.append(
          '<td><a href="./epoch?epoch=' +
            availableInvitesData.result[i].epoch +
            '#invitations">' +
            epochFmt(availableInvitesData.result[i].epoch) +
            '</a></td>'
        );
        tr.append('<td>Saved invititation reward</td>');
        tr.append('<td>-</td>');
        tr.append('<td>-</td>');

        var invitationReward = epochRewardData.result.invitationsShare;
        var missingInvitationReward = invitationReward;

        if (savedInviteData.result[j].value == 'SavedInvite') {
          missingInvitationReward = missingInvitationReward * 2; //not a winner => x2
        }
        if (savedInviteData.result[j].value == 'SavedInviteWin') {
          invitationReward = invitationReward * 2; //winner => x2
        }

        tr.append('<td>' + dnaFmt(invitationReward, '') + '</td>');
        tr.append(
          '<td style="color: red">' +
            dnaFmt(missingInvitationReward, '') +
            '</td>'
        );
        tr.append('<td>Missed invitation</td>');

        for (k = 0; k < savedInviteData.result[j].count; k++) {
          table.append(tr.clone());
          totalInvitationMissedReward =
            totalInvitationMissedReward + missingInvitationReward * 1;
        }
      }
    }

    // Saved invitations in the epoch-1
    if (availableInvitesData.result[i].epoch == epoch - 1) {
      for (
        j = 0;
        j < availableInvitesData.result[i].invites - prev2EpochInviteActivated;
        j++
      ) {
        var tr = $('<tr/>');
        var td = $('<td/>');

        tr.append(
          '<td><a href="./epoch?epoch=' +
            availableInvitesData.result[i].epoch +
            '#invitations">' +
            epochFmt(availableInvitesData.result[i].epoch) +
            '</a></td>'
        );
        tr.append('<td>Saved invititation</td>');
        tr.append('<td>-</td>');
        tr.append('<td>-</td>');

        var invitationReward = 0;
        var missingInvitationReward =
          epochRewardData.result.invitationsShare * 3 * 3;

        totalInvitationMissedReward =
          totalInvitationMissedReward + missingInvitationReward * 1;

        tr.append('<td>' + dnaFmt(invitationReward, '') + '</td>');
        tr.append(
          '<td style="color: red">' +
            dnaFmt(missingInvitationReward, '') +
            '</td>'
        );
        tr.append('<td>Missed invitation</td>');
        table.append(tr);
      }
    }

    // Saved invitations in the epoch - 2
    if (availableInvitesData.result[i].epoch == epoch - 2) {
      for (
        j = 0;
        j < availableInvitesData.result[i].invites - prev3EpochInviteActivated;
        j++
      ) {
        var tr = $('<tr/>');
        var td = $('<td/>');

        tr.append(
          '<td><a href="./epoch?epoch=' +
            availableInvitesData.result[i].epoch +
            '#invitations">' +
            epochFmt(availableInvitesData.result[i].epoch) +
            '</a></td>'
        );
        tr.append('<td>Saved invititation</td>');
        tr.append('<td>-</td>');
        tr.append('<td>-</td>');

        var invitationReward = 0;
        var missingInvitationReward =
          epochRewardData.result.invitationsShare * 3 * 3 * 3;

        totalInvitationMissedReward =
          totalInvitationMissedReward + missingInvitationReward * 1;

        tr.append('<td>' + dnaFmt(invitationReward, '') + '</td>');
        tr.append(
          '<td style="color: red">' +
            dnaFmt(missingInvitationReward, '') +
            '</td>'
        );
        tr.append('<td>Missed invitation</td>');
        table.append(tr);
      }
    }
  }
}
