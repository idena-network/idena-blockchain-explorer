function initTransaction(tx){
  $("#TxId")[0].textContent=tx;
  getTxData(tx);
}


function getTxData(tx){

    var u=url+'Transaction/'+tx;
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateTxData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

}


function updateTxData(data){
  if (data.result == null)  { return }

  $("#TxEpoch")[0].textContent=epochFmt(data.result.epoch);
  $("#TxEpoch")[0].href="./epoch?epoch="+data.result.epoch;

  $("#TxBlock")[0].textContent=data.result.blockHeight;
  $("#TxBlock")[0].href="./block?block="+data.result.blockHeight;

  $("#TxTime")[0].textContent= timeFmt(data.result.timestamp);

  $("#TxType")[0].textContent=data.result.type;


}