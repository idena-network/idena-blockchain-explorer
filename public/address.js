function initAddress(address){
  $("#Address")[0].textContent=address;
  getAddressData(address);
//  $("#IdentityAvatar img")[0].src="https://robohash.org/"+identity.toLowerCase();
};



function getAddressData(address){
    var u=url+'Identity/'+address+'/Epochs/Count';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        if (data.result == null)  { return }
        if (data.result>0)
          getAddressIdentityData(address);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

    u=url+'Address/'+address;
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateAddressData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });


    u=url+'Address/'+address+'/Txs?skip=0&limit=100';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateAddressTxsData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });


}


function getAddressIdentityData(address){
    var u=url+'Identity/'+address;
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateAddressIdentityData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });
}

function updateAddressIdentityData(data){
    if (data.result == null)  { return } 
    $("#OwnerSection").removeClass("hidden");
    $("#BalanceSection .col-12").removeClass("col-sm-6").addClass("col-sm-4");
    $("#AddressStake").parent().removeClass("hidden");

    $("#AddressOwner span")[0].textContent= data.result.address.substr(0,30)+"...";
    $("#AddressOwner img")[0].src= 'https://robohash.org/'+data.result.address.toLowerCase();
    $("#AddressOwner")[0].href= "./identity?identity="+data.result.address;
    $("#OwnerState")[0].textContent= data.result.state;
}


function updateAddressData(data){
    if (data.result == null)  { return }
    $("#AddressBalance")[0].textContent=data.result.balance + ' DNA';
    $("#AddressStake")[0].textContent=data.result.stake + ' DNA';
    $("#AddressTxs")[0].textContent=data.result.txCount;

}


function updateAddressTxsData(data){
  if (data.result == null)  { return }

    var table=$("#TransactionsTable");
    table.find('td').parent().remove();
    if (data.result == null)  { return }

    for (var i = 0; i < data.result.length; i++) {
        var tr = $('<tr/>');

        var td=$("<td/>");
            var hash=data.result[i].hash;  
            td.append("<div class='text_block text_block--ellipsis'><a href='./tx?tx="+hash+"'>" + hash.substr(0, 15) + "...</a></div>");
        tr.append(td);

        var td=$("<td/>");
            var from=data.result[i].from;
            td.append('<div class="user-pic"><img src="https://robohash.org/'+from.toLowerCase()+'" alt="pic"width="32"></div>');
            td.append("<div class='text_block text_block--ellipsis'><a href='./identity?identity="+from+"'>" + from.substr(0, 15) + "...</a></div>");
        tr.append(td);
        tr.append("<td>" + timeFmt(data.result[i].timestamp) + "</td>");
        tr.append("<td>" + data.result[i].type + "</td>");
        table.append(tr);
    }
}
