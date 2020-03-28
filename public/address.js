function initAddress(address) {
  $('#Address')[0].textContent = address;
  getAddressData(address);
  //  $("#IdentityAvatar img")[0].src="https://robohash.org/"+identity.toLowerCase();
}

function getAddressData(address) {
  var u = url + 'Identity/' + address + '/Epochs/Count';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      if (data.result == null) {
        return;
      }
      if (data.result > 0) getAddressIdentityData(address);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  u = url + 'Address/' + address;
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateAddressData(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  u = url + 'Address/' + address + '/Txs/Count';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      getAddressTxsData(data.result, 0, { address });
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  u = url + 'Address/' + address + '/penalties?skip=0&limit=100';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updatePenaltyData(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  u = url + 'Identity/' + address + '/EpochRewards?skip=0&limit=100';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateAddressRewardsData(address, data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });
}

function getAddressIdentityData(address) {
  var u = url + 'Identity/' + address;
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateAddressIdentityData(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });
}

function updateAddressIdentityData(data) {
  if (data.result == null) {
    return;
  }
  $('#OwnerSection').removeClass('hidden');
  $('#BalanceSection .col-12')
    .removeClass('col-sm-6')
    .addClass('col-sm-4');
  $('#AddressStake')
    .parent()
    .removeClass('hidden');

  $('#AddressOwner span')[0].textContent =
    data.result.address.substr(0, 30) + '...';
  $('#AddressOwner img')[0].src =
    'https://robohash.org/' + data.result.address.toLowerCase();
  $('#AddressOwner')[0].href = './identity?identity=' + data.result.address;
  $('#OwnerState')[0].textContent = identityStatusFmt(data.result.state);
}

function updateAddressData(data) {
  if (data.result == null) {
    return;
  }
  $('#AddressBalance')[0].textContent = dnaFmt(data.result.balance);
  $('#AddressStake')[0].textContent = dnaFmt(data.result.stake);
  $('#AddressTxs')[0].textContent = data.result.txCount;
}

const getAddressTxsData = function(total, loaded, params) {
  const step = loaded == 0 ? 30 : 100;

  if (loaded > total) {
    return;
  }

  u =
    url +
    'Address/' +
    params.address +
    '/Txs?skip=' +
    loaded +
    '&limit=' +
    step;
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateAddressTxsData(data, total, loaded + step, params);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });
};

function updateAddressTxsData(data, total, loaded, params) {
  if (data.result == null) {
    return;
  }

  var table = $('#TransactionsTable');
  addShowMoreTableButton(table, getAddressTxsData, total, loaded, params);

  if (data.result == null) {
    return;
  }

  for (var i = 0; i < data.result.length; i++) {
    var tr = $('<tr/>');

    var td = $('<td/>');
    var hash = data.result[i].hash;
    td.append(
      "<div class='text_block text_block--ellipsis'><a href='./tx?tx=" +
        hash +
        "'>" +
        hash.substr(0, 8) +
        '...</a></div>'
    );
    tr.append(td);

    var td = $('<td/>');
    var from = data.result[i].from;
    td.append(
      '<div class="user-pic"><img src="https://robohash.org/' +
        from.toLowerCase() +
        '" alt="pic"width="32"></div>'
    );
    td.append(
      "<div class='text_block text_block--ellipsis'><a href='./address?address=" +
        from +
        "'>" +
        from.substr(0, 10) +
        '...</a></div>'
    );
    tr.append(td);

    var td = $('<td/>');
    var to = data.result[i].to;
    if (to) {
      td.append(
        '<div class="user-pic"><img src="https://robohash.org/' +
          to.toLowerCase() +
          '" alt="pic"width="32"></div>'
      );
      td.append(
        "<div class='text_block text_block--ellipsis'><a href='./address?address=" +
          to +
          "'>" +
          to.substr(0, 10) +
          '...</a></div>'
      );
    } else {
      td.append("<div class='text_block text_block--ellipsis'>-</div>");
    }
    tr.append(td);

    var amount = data.result[i].amount;

    if (amount == 0 && typeof data.result[i].transfer != 'undefined') {
      amount = data.result[i].transfer;
    }

    tr.append(
      "<td align='right'>" +
        (amount == 0 ? '-' : dnaFmt(precise6(amount), '')) +
        '</td>'
    );

    tr.append('<td>' + timeFmt(data.result[i].timestamp) + '</td>');
    tr.append('<td>' + data.result[i].type + '</td>');
    table.append(tr);
  }
}

function updateAddressRewardsData(address, data) {
  if (data.result == null) {
    return;
  }

  var table = $('#RewardsTable');
  table
    .find('td')
    .parent()
    .remove();
  if (data.result == null) {
    return;
  }

  for (var i = 0; i < data.result.length; i++) {
    for (var j = 0; j < data.result[i].rewards.length; j++) {
      var tr = $('<tr/>');
      var td = $('<td/>');
      var epoch = data.result[i].epoch + 1;
      td.append(
        "<div class='text_block text_block--ellipsis'><a href='./reward?epoch=" +
          //"<div class='text_block text_block--ellipsis'><a href='./epoch?epoch=" +
          epoch +
          '&identity=' +
          address +
          "'>" +
          epochFmt(epoch) +
          '</a></div>'
      );
      tr.append(td);

      tr.append(
        '<td>' + rewardTypeFmt(data.result[i].rewards[j].type) + '</td>'
      );
      tr.append(
        "<td align='right'>" +
          dnaFmt(data.result[i].rewards[j].balance, '') +
          '</td>'
      );
      tr.append(
        "<td align='right'>" +
          dnaFmt(data.result[i].rewards[j].stake, '') +
          '</td>'
      );
      tr.append(
        "<td align='right'>" +
          dnaFmt(
            precise6(
              data.result[i].rewards[j].stake * 1 +
                data.result[i].rewards[j].balance * 1
            ),
            ''
          ) +
          '</td>'
      );
      table.append(tr);
    }
  }
}

function updatePenaltyData(data) {
  if (data.result == null) {
    return;
  }

  var table = $('#MiningPenaltyTable');
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
    var epoch = data.result[i].epoch;
    td.append(
      "<div class='text_block text_block--ellipsis'><a href='./epoch?epoch=" +
        epoch +
        "'>" +
        epochFmt(epoch) +
        '</a></div>'
    );
    tr.append(td);

    var td = $('<td/>');
    td.append(
      "<div class='text_block text_block--ellipsis'><a href='./block?block=" +
        data.result[i].blockHeight +
        "'>" +
        data.result[i].blockHeight +
        '</a></div>'
    );
    tr.append(td);

    tr.append('<td>' + timeFmt(data.result[i].timestamp) + '</td>');
    tr.append(
      "<td align='right'>" + dnaFmt(data.result[i].penalty, '') + '</td>'
    );
    table.append(tr);
  }
}
