function initEpochs() {
  getEpochsData();
}

function getEpochsData() {
  var u = url + 'Epochs?skip=0&limit=100';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateEpochsData(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });
  /*
  u = url + 'Epochs/Count';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      //update...(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });
*/

  u = url + 'Coins';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      undateCoinsData(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  getBalancesData(1000, 0);

  u = url + 'OnlineMiners/Count';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      undateMinersCount(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  u = url + 'OnlineIdentities/Count';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      getMinersActivity(data.result, 0);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  u = url + 'TotalLatestMiningRewards/count';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      getMining24Data(data.result, 0);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });
}

function updateEpochsData(data) {
  var table = $('#EpochsTable');
  table
    .find('td')
    .parent()
    .remove();
  if (data.result == null) {
    return;
  }

  var lastVerifiedElement,
    lastValidationDateElement,
    lastRewardsElement,
    lastTotalMinedElement;
  var lastMined = 0;
  for (var i = 0; i < data.result.length - 1; i++) {
    if (i == 1) {
      $('#ValidatedTotal')[0].textContent = data.result[i].validatedCount;
    }

    var tr = $('<tr/>');
    tr.append(
      "<td> <a href='./epoch?epoch=" +
        data.result[i].epoch +
        "'>" +
        epochFmt(data.result[i].epoch) +
        '</a></td>'
    );

    if (i > 0) {
      lastVerifiedElement[0].textContent = data.result[i].validatedCount;
      lastValidationDateElement.find('a')[0].textContent = dateFmt(
        data.result[i].validationTime
      );
      lastRewards = data.result[i].rewards.total;
      lastRewardsElement.find('a')[0].textContent = precise2(lastRewards);

      lastTotalMinedElement[0].textContent = precise2(
        lastRewards * 1 + lastMined * 1
      );
    }

    lastValidationDateElement = $(
      "<td><a href='./validation?epoch=" + data.result[i].epoch + "'></a></td>"
    );
    tr.append(lastValidationDateElement);
    tr.append('<td>' + data.result[i].blockCount + '</td>');
    tr.append('<td>' + data.result[i].txCount + '</td>');
    tr.append('<td>' + data.result[i].flipCount + '</td>');
    tr.append('<td>' + data.result[i].inviteCount + '</td>');
    lastVerifiedElement = $('<td></td>');
    tr.append(lastVerifiedElement);

    var minted, burnt;

    minted = data.result[i].coins.minted - data.result[i].rewards.total;
    lastMined = minted;
    burnt = data.result[i].coins.burnt;

    if (frac(minted) > 99) {
      minted = precise2(minted);
    }
    if (frac(burnt) > 99) {
      burnt = precise2(burnt) + '';
    }

    lastRewardsElement = $(
      "<td><a href='./rewards?epoch=" + data.result[i].epoch + "'></a></td>"
    );
    lastTotalMinedElement = $('<td></td>');
    tr.append(lastRewardsElement);
    tr.append(lastTotalMinedElement);
    //tr.append("<td align='right'>" + dnaFmt(minted, '') + '</td>');
    tr.append("<td align='right'>" + dnaFmt(burnt, '') + '</td>');

    table.append(tr);
  }
}

function getMinersActivity(total, loaded) {
  const step = loaded == 0 ? 30 : 100;

  if (loaded > total) {
    return;
  }

  u = url + 'OnlineIdentities?skip=' + loaded + '&limit=' + step;
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      undateMinersActivity(data, total, loaded + step);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });
}

function undateMinersActivity(data, total, loaded) {
  var table = $('#MinersTable');

  if (data.result == null) {
    return;
  }

  addShowMoreTableButton(table, getMinersActivity, total, loaded);

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
        data.result[i].address +
        '</a></div>'
    );
    tr.append(td);

    tr.append('<td>' + lastSeenFmt(data.result[i].lastActivity) + '</td>');
    tr.append(
      '<td>' + (data.result[i].online ? 'Mining' : 'Offline') + '</td>'
    );
    tr.append(
      '<td>' +
        (data.result[i].penalty == 0 ? '-' : precise2(data.result[i].penalty)) +
        '</td>'
    );
    //if (data.result[i].online) onLineTotal++;
    table.append(tr);
  }
}

function undateMinersCount(data) {
  $('#OnlineMinersTotal')[0].textContent = data.result;
}

function getBalancesData(total, loaded) {
  const step = loaded == 0 ? 30 : 100;

  if (loaded > total) {
    return;
  }

  u = url + 'Balances?skip=0' + loaded + '&limit=' + step;
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      undateBalancesData(data, total, loaded + step);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });
}

function undateBalancesData(data, total, loaded) {
  var table = $('#TopAddressTable');
  addShowMoreTableButton(table, getBalancesData, total, loaded);

  if (data.result == null) {
    return;
  }

  for (var i = 0; i < data.result.length; i++) {
    var tr = $('<tr/>');
    var td = $('<td/>');
    td.append(
      '<div class="user-pic"><img src="https://robohash.org/' +
        data.result[i].address.toLowerCase() +
        '" alt="pic"width="32"></div>'
    );
    td.append(
      "<div class='text_block text_block--ellipsis'><a href='./address?address=" +
        data.result[i].address +
        "'>" +
        data.result[i].address +
        '</a></div>'
    );
    tr.append(td);

    tr.append(
      "<td align='right'>" +
        dnaFmt(precise2(data.result[i].balance), '') +
        '</td>'
    );
    tr.append(
      "<td align='right'>" +
        (data.result[i].stake == 0
          ? '-'
          : dnaFmt(precise2(data.result[i].stake), '')) +
        '</td>'
    );

    table.append(tr);
  }
}

function undateCoinsData(data) {
  if (data.result == null) {
    return;
  }

  $('#TotalSupply')[0].textContent = dnaFmt(
    precise2(data.result.totalBalance * 1 + data.result.totalStake * 1)
  );
  $('#TotalStaked')[0].textContent = dnaFmt(precise2(data.result.totalStake));
  $('#TotalBurnt')[0].textContent = dnaFmt(precise2(data.result.burnt));
}

const getMining24Data = function(total, loaded) {
  const step = loaded == 0 ? 30 : 100;

  if (loaded > total) {
    return;
  }

  u = url + 'TotalLatestMiningRewards?skip=' + loaded + '&limit=' + step;
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateMining24Data(data, total, loaded + step);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });
};

function updateMining24Data(data, total, loaded) {
  if (data.result == null) {
    return;
  }

  var table = $('#Mining24Table');
  addShowMoreTableButton(table, getMining24Data, total, loaded);

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
        data.result[i].address +
        '</a></div>'
    );
    tr.append(td);

    const total = data.result[i].balance * 1 + data.result[i].stake * 1;

    tr.append('<td>' + dnaFmt(total, '') + '</td>');
    tr.append('<td>' + data.result[i].proposer + '</td>');
    tr.append('<td>' + data.result[i].finalCommittee + '</td>');
    table.append(tr);
  }
}
