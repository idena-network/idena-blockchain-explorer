function initBlock(block){
  getBlockData(block);
}


function getBlockData(block){

    var u=url+'Block/'+block;
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateBlockData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

    var u=url+'Block/'+block+'/Txs?skip=0&limit=100';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateBlockTxsData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

}


function updateBlockData(data){
  if (data.result == null)  { return }

  $("#BlockId")[0].textContent=data.result.hash;
  $("#BlockHeight")[0].textContent=data.result.height;
  $("#BlockTxCount")[0].textContent=data.result.txCount;

  $("#BlockProposer span")[0].textContent=data.result.proposer.substr(0,30)+"...";
  $("#BlockProposer img")[0].src='https://robohash.org/'+data.result.proposer.toLowerCase();
  $("#BlockProposer")[0].href="./identity?identity="+data.result.proposer;

  $("#BlockCreated")[0].textContent= timeFmt(data.result.timestamp);

}


function updateBlockTxsData(data){
  if (data.result == null)  { return }

    var table=$("#TransactionsTable");
    table.find('td').parent().remove();
    if (data.result == null)  { return }

    for (var i = 0; i < data.result.length; i++) {
        var tr = $('<tr/>');

        var td=$("<td/>");
            var hash=data.result[i].hash;  
            td.append("<div class='text_block text_block--ellipsis'><a href='./tx?tx="+hash+"'>" + hash.substr(0, 10) + "...</a></div>");
        tr.append(td);

        var td=$("<td/>");
            var from=data.result[i].from;
            td.append('<div class="user-pic"><img src="https://robohash.org/'+from.toLowerCase()+'" alt="pic"width="32"></div>');
            td.append("<div class='text_block text_block--ellipsis'><a href='./identity?identity="+from+"'>" + from.substr(0, 10) + "...</a></div>");
        tr.append(td);

        var td=$("<td/>");
            var to=data.result[i].to;
            if (to){
              td.append('<div class="user-pic"><img src="https://robohash.org/'+to.toLowerCase()+'" alt="pic"width="32"></div>');
              td.append("<div class='text_block text_block--ellipsis'><a href='./identity?identity="+to+"'>" + to.substr(0, 10) + "...</a></div>");
            } else {
              td.append("<div class='text_block text_block--ellipsis'>-</div>");
            }
        tr.append(td);

        tr.append("<td>" + timeFmt(data.result[i].timestamp) + "</td>");
        tr.append("<td>" + data.result[i].type + "</td>");
        table.append(tr);
    }
}
