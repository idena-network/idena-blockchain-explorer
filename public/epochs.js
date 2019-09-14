
function initEpochs(){
  getEpochsData();
}

function getEpochsData(){

/*
    var u=url+'Epochs?skip=0&limit=100';
    $.getJSON(u).done(
      function (data) {
        updateEpochsData(data);
      }
    );
    return;
*/
    var u=url+'Epochs?skip=0&limit=100';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateEpochsData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

    u=url+'Epochs/Count';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        //update...(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

    u=url+'Coins';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        undateCoinsData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });


    u=url+'Balances?skip=0&limit=100';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        undateBalancesData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });


    u=url+'OnlineIdentities?skip=0&limit=100';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        undateMinersActivity(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

}



function updateEpochsData(data){
    var table=$("#EpochsTable");
    table.find('td').parent().remove();
    if (data.result == null)  { return }

    var lastVerifiedElement;
    for (var i = 0; i < data.result.length; i++) {
        var tr = $('<tr/>');
        tr.append("<td> <a href='./epoch?epoch="+data.result[i].epoch+"'>" + epochFmt(data.result[i].epoch) + "</a></td>");

        tr.append("<td>" + data.result[i].blockCount + "</td>");
        tr.append("<td>" + data.result[i].txCount + "</td>");
        tr.append("<td>" + data.result[i].flipCount + "</td>");
        tr.append("<td>" + data.result[i].inviteCount + "</td>");  
        if (i>0) {
          lastVerifiedElement[0].textContent=data.result[i].validatedCount;
        } 

        if (i==1) {
          $('#ValidatedTotal')[0].textContent=data.result[i].validatedCount;
        } 


        lastVerifiedElement=$("<td>-</td>");
        tr.append(lastVerifiedElement);

        var minted, burnt, total;
        minted=data.result[i].coins.balance.minted*1+data.result[i].coins.stake.minted*1;
        burnt=data.result[i].coins.balance.burnt*1+data.result[i].coins.stake.burnt*1;
        
        if ( frac(minted)>99) { minted=precise2(minted)+'' } 
        if ( frac(burnt)>99) { burnt=precise2(burnt)+'' } 

        tr.append("<td>" + minted+ "</td>");  
        tr.append("<td>" + burnt + "</td>");  

        table.append(tr);
    }
}





function undateMinersActivity(data){
    var table=$("#MinersTable");
    table.find('td').parent().remove();
    if (data.result == null)  { return }

    var onLineTotal=0
    for (var i = 0; i < data.result.length; i++) {

        var tr = $('<tr/>');
        var td=$("<td/>");
            td.append('<div class="user-pic"><img src="https://robohash.org/'+data.result[i].address.toLowerCase()+'" alt="pic"width="32"></div>');
            td.append("<div class='text_block text_block--ellipsis'><a href='./identity?identity="+data.result[i].address+"'>" + data.result[i].address + "</a></div>");
        tr.append(td);

        tr.append("<td>" + lastSeenFmt(data.result[i].lastActivity) + "</td>");
        tr.append("<td>" + (data.result[i].online?'Mining':'Offline') + "</td>");
        tr.append("<td>" + (data.result[i].penalty==0?'-':precise2(data.result[i].penalty)) + "</td>");

        if (data.result[i].online) onLineTotal++
        table.append(tr);
    }
    $("#OnlineMinersTotal")[0].textContent = onLineTotal;
    
}


function undateBalancesData(data){
    var table=$("#TopAddressTable");
    table.find('td').parent().remove();
    if (data.result == null)  { return }

    for (var i = 0; i < data.result.length; i++) {

        var tr = $('<tr/>');
        var td=$("<td/>");
            td.append('<div class="user-pic"><img src="https://robohash.org/'+data.result[i].address.toLowerCase()+'" alt="pic"width="32"></div>');
            td.append("<div class='text_block text_block--ellipsis'><a href='./address?address="+data.result[i].address+"'>" + data.result[i].address + "</a></div>");
        tr.append(td);

        tr.append("<td>" + precise2(data.result[i].balance) + "</td>");
        tr.append("<td>" + (data.result[i].stake==0?'-':precise2(data.result[i].stake)) + "</td>");

        table.append(tr);
    }
}



function undateCoinsData(data){
    if (data.result == null)  { return }

    $("#TotalSupply")[0].textContent = precise2(data.result.balance.total*1 + data.result.stake.total*1) + ' DNA';
    $("#TotalStaked")[0].textContent = precise2(data.result.stake.total*1) + ' DNA';
    $("#TotalBurnt")[0].textContent = precise2(data.result.balance.burnt*1 + data.result.stake.burnt*1) + ' DNA';

}



