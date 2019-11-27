function initRewards(currEpoch) {
  var nextEpoch = currEpoch * 1 + 1;
  var prevEpoch = currEpoch - 1;

  $('#EpochId')[0].textContent = epochFmt(currEpoch);
  $('#EpochPageLink')[0].href = '/epoch?epoch=' + currEpoch;

  getRewardsData(currEpoch);
}

function getRewardsData(epoch) {
  var prevEpoch = epoch - 1;

  var u = url + 'Epoch/' + prevEpoch + '/RewardsSummary';

  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateRewardsSummary(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  u = url + 'Epoch/' + prevEpoch + '/IdentityRewards/Count';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      getIdentityRewardsData(data.result, 0, { prevEpoch });
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  u = url + 'Epoch/' + prevEpoch + '/Authors/Bad?skip=0&limit=100';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateBadAuthors(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  u = url + 'Epoch/' + prevEpoch;
  if (prevEpoch >= 0)
    $.ajax({
      url: u,
      type: 'GET',
      dataType: 'json',
      success: function(data) {
        updateRewardsEpochData(data);
      },
      error: function(request, error) {
        console.error(u + ', error:' + error);
      }
    });
}

function updateBadAuthors(data) {
  if (data.result == null) {
    return;
  }

  var penaltyTable = $('#PenaltyTable');

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
        "#flips'>" +
        data.result[i].address.substr(0, 20) +
        '...</a></div>'
    );
    tr.append(td);

    tr.append('<td>' + identityStatusFmt(data.result[i].prevState) + '</td>');
    tr.append('<td>' + identityStatusFmt(data.result[i].state) + '</td>');

    if (data.result[i].wrongWords) {
      tr.append('<td>Flip irrelevant to keywords found</td>');
    } else {
      tr.append('<td>No qualified flips</td>');
    }
    penaltyTable.append(tr);
  }
}

function updateRewardsEpochData(data) {
  if (data.result == null) {
    return;
  }
  $('#RewardDate')[0].textContent = dateFmt(data.result.validationTime);
}

function updateRewardsSummary(data, epoch) {
  if (data.result == null) {
    return;
  }

  $('#TotalRewards')[0].textContent = dnaFmt(data.result.total);

  $('#ValidationReward')[0].textContent = dnaFmt(data.result.validation);
  $('#FlipsReward')[0].textContent = dnaFmt(data.result.flips);
  $('#InvitationsReward')[0].textContent = dnaFmt(data.result.invitations);
}

function getIdentityRewardsData(total, loaded, params) {
  const step = 30;

  if (loaded > total) {
    return;
  }

  u =
    url +
    'Epoch/' +
    params.prevEpoch +
    '/IdentityRewards?skip=' +
    loaded +
    '&limit=' +
    step;
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateRewardsData(data, total, loaded + step, params);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });
}

function updateRewardsData(data, total, loaded, params) {
  if (data.result == null) {
    return;
  }

  var rewardsTable = $('#RewardsTable');
  addShowMoreTableButton(
    rewardsTable,
    getIdentityRewardsData,
    total,
    loaded,
    params
  );

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
        data.result[i].address.substr(0, 12) +
        '...</a></div>'
    );
    tr.append(td);

    tr.append('<td>' + identityStatusFmt(data.result[i].prevState) + '</td>');
    tr.append('<td>' + identityStatusFmt(data.result[i].state) + '</td>');

    var ValidationReward = 0,
      FlipsReward = 0,
      InvitationsReward = 0,
      TotalStake = 0,
      TotalBalance = 0,
      Total = 0;
    for (var j = 0; j < data.result[i].rewards.length; j++) {
      if (data.result[i].rewards[j].type == 'Validation') {
        ValidationReward =
          data.result[i].rewards[j].balance * 1 +
          data.result[i].rewards[j].stake * 1;
      }
      if (data.result[i].rewards[j].type == 'Flips') {
        FlipsReward =
          data.result[i].rewards[j].balance * 1 +
          data.result[i].rewards[j].stake * 1;
      }
      if (data.result[i].rewards[j].type == 'Invitations') {
        InvitationsReward =
          data.result[i].rewards[j].balance * 1 +
          data.result[i].rewards[j].stake * 1;
      }

      TotalStake = TotalStake + data.result[i].rewards[j].stake * 1;
      TotalBalance = TotalBalance + data.result[i].rewards[j].balance * 1;
      Total =
        Total +
        data.result[i].rewards[j].balance * 1 +
        data.result[i].rewards[j].stake * 1;
    }
    var canDoFlips =
      data.result[i].prevState == 'Verified' ||
      data.result[i].prevState == 'Newbie';
    var canDoInvite = data.result[i].prevState == 'Verified';
    tr.append(
      '<td>' +
        (ValidationReward == 0 ? '-' : precise6(ValidationReward)) +
        '</td>'
    );
    tr.append(
      '<td>' +
        (FlipsReward == 0
          ? canDoFlips
            ? '-'
            : 'N/A'
          : precise6(FlipsReward) + '</td>')
    );
    tr.append(
      '<td>' +
        (InvitationsReward == 0
          ? canDoInvite
            ? '-'
            : 'N/A'
          : precise6(InvitationsReward)) +
        '</td>'
    );

    tr.append('<td>' + (TotalBalance == 0 ? '-' : precise6(Total)) + '</td>');
    rewardsTable.append(tr);
  }
}
