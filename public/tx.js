function initTransaction(tx) {
  $('#TxId')[0].textContent = tx;
  getTxData(tx);
}

function getTxData(tx) {
  var u = url + 'Transaction/' + tx;
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateTxData(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });
}

function updateTxData(data) {
  if (data.result == null) {
    return;
  }

  $('#TxEpoch')[0].textContent = epochFmt(data.result.epoch);
  $('#TxEpoch')[0].href = './epoch?epoch=' + data.result.epoch;

  $('#TxBlock')[0].textContent = data.result.blockHeight;
  $('#TxBlock')[0].href = './block?block=' + data.result.blockHeight;

  $('#TxTime')[0].textContent = timeFmt(data.result.timestamp);

  $('#TxType')[0].textContent = data.result.type;

  //  $("#TxTo")[0].textContent=data.result.to;
  //  $("#TxTo")[0].href="./address?address="+data.result.to;

  //  $("#TxFrom")[0].textContent=data.result.from;
  //  $("#TxFrom")[0].href="./address?address="+data.result.from;

  if (data.result.from) {
    $('#TxFrom span')[0].textContent = data.result.from.substr(0, 30) + '...';
    $('#TxFrom img')[0].src =
      'https://robohash.org/' + data.result.from.toLowerCase();
    $('#TxFrom')[0].href = './address?address=' + data.result.from;
  }

  if (data.result.to) {
    $('#TxTo span')[0].textContent = data.result.to.substr(0, 30) + '...';
    $('#TxTo img')[0].src =
      'https://robohash.org/' + data.result.to.toLowerCase();
    $('#TxTo')[0].href = './address?address=' + data.result.to;
  }

  $('#TxAmount')[0].textContent = data.result.amount;
  $('#TxSize')[0].textContent = data.result.size;
  $('#TxFee')[0].textContent = data.result.fee;
  $('#TxFeeLimit')[0].textContent = data.result.maxFee;
}
