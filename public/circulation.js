function initCirculation() {
  getCirculationData();
}

function getCirculationData() {
  getApiData('Coins', (coinsCata) => {
    getApiData('CirculatingSupply?format=short', (circulationData) => {
      undateVestingData(coinsCata, circulationData);
    });
  });
}

function undateVestingData(coinsData, circulationData) {
  if (coinsData.result == null) {
    return;
  }

  if (circulationData.result == null) {
    return;
  }

  $('#CirculatingSupply')[0].textContent = dnaFmt(
    precise2(circulationData.result),
    ''
  );

  $('#TotalSupply')[0].textContent = dnaFmt(
    precise2(
      coinsData.result.totalBalance * 1 + coinsData.result.totalStake * 1
    ),
    ''
  );
  $('#TotalStaked')[0].textContent = dnaFmt(
    precise2(coinsData.result.totalStake),
    ''
  );
  $('#VestedCoins')[0].textContent = dnaFmt(
    precise2(
      coinsData.result.totalBalance * 1 +
        coinsData.result.totalStake * 1 -
        circulationData.result
    ),
    ''
  );

  const vestedData = [
    {
      address: '0x5b8896aEd1d98604c00bAcF1643F752949Fe807D',
      name: 'Early investors fund vested for 1 year',
      date: 'August 31, 2020',
      descr: '',
    },
    {
      address: '0x9bf19e7d58B2A95aaBD0cB8bd0Bc7da1c72E696b',
      name: 'Early investors fund vested for 2 years',
      date: 'August 31, 2021',
      descr: '',
    },
    {
      address: '0x3A4fA594b3822649738bE2ab02CDF35Bf13a595A',
      name: 'Core team fund vested for 3 years',
      date: 'August 31, 2022',
      descr: '',
    },
    {
      address: '0x9e64044F2f4719D04FfE1FFBE8D0d5B684ffFbBD',
      name: 'Core team fund vested for 5 years',
      date: 'August 31, 2025',
      descr: '',
    },
    {
      address: '0x0a8B4b113d863c86f64E49a1270F7a4A9B65dAAc',
      name: 'Reserved runway funding 2020',
      date: '-',
      descr: '',
    },
    {
      address: '0x477E32166cd16C1b4909BE783347e705Aef3d5db',
      name: 'Reserved runway funding 2021-2022',
      date: 'January 1, 2021',
      descr: '',
    },
    {
      address: '0xc94D32638D71aBA05F0bDADE498948eF93944428',
      name: 'Ambassadors fund',
      date: '-',
      descr: '',
    },
    {
      address: '0xcbb98843270812eeCE07BFb82d26b4881a33aA91',
      name: 'Foundation wallet address',
      date: '-',
      descr: '',
    },
    {
      address: '0x4d60dC6A2CbA8c3EF1Ba5e1Eba5c12c54cEE6B61',
      name: 'Previous foundation wallet address',
      date: '-',
      descr: '',
    },
    {
      address: '0x0000000000000000000000000000000000000000',
      name: 'Zero wallet',
      date: '-',
      descr: '',
    },
  ];

  var table = $('#VestingTable');
  for (var i = 0; i < vestedData.length; i++) {
    var tr = $('<tr/>');

    var td = $('<td/>');
    td.append(
      '<div class="user-pic"><img src="https://robohash.org/' +
        vestedData[i].address.toLowerCase() +
        '" alt="pic"width="32"></div>'
    );
    td.append(
      "<div class='text_block text_block--ellipsis'><a href='./address?address=" +
        vestedData[i].address +
        "'>" +
        vestedData[i].address.substr(0, 15) +
        '...</a></div>'
    );
    tr.append(td);

    const balanceItem = $('<td/>');
    tr.append(balanceItem);
    setItemBalanceForAddress(vestedData[i].address, balanceItem);
    tr.append('<td>' + vestedData[i].name + '</td>');

    //tr.append('<td>' + vestedData[i].descr + '</td>');
    tr.append('<td>' + vestedData[i].date + '</td>');

    table.append(tr);
  }
}

function setItemBalanceForAddress(address, item) {
  getApiData('Address/' + address, (addressData) => {
    if (addressData.result == null) return;
    item[0].textContent = dnaFmt(precise2(addressData.result.balance), '');
  });
}
