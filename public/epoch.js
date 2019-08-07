
function initEpoch(currEpoch){
  var nextEpoch=currEpoch*1+1;
  var prevEpoch=currEpoch-1;
  if (path=='/validation')
    $("#EpochId")[0].textContent=currEpoch;


  if (path=='/epoch'){
    getEpochData(currEpoch);
    $("#DetailsEpochId")[0].textContent="#"+ currEpoch;
    $("#EpochId")[0].textContent="Epoch #"+ currEpoch;
    $("#ValidationResult")[0].href="/validation?epoch="+currEpoch;

    (prevEpoch>0)
    ?$("#prev-epoch-btn")[0].href=path+"?epoch="+prevEpoch
    :$("#prev-epoch-btn")[0].href="#";
  }

  if (path=='/validation'){
    getValidationData(currEpoch);
    $("#EpochPageLink")[0].href="/epoch?epoch="+currEpoch;
  }

};

function getEpochData(epoch){
    var prevEpoch=epoch-1;
    var u=url+'Epochs/Count';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateEpochCountData(data, epoch);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

    u=url+'Epoch/'+prevEpoch;
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateEpochData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

    u=url+'Epoch/'+epoch;
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateNextEpochData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

    u=url+'Epoch/'+prevEpoch+'/IdentityStatesSummary';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateEpochIdentityStatesSummaryData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

    u=url+'Epoch/'+prevEpoch+'/Identities?skip=0&limit=100';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateEpochIdentitiesData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

    u=url+'Epoch/'+prevEpoch+'/Flips?skip=0&limit=100';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateEpochFlipsData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

    u=url+'Epoch/'+epoch+'/FlipStatesSummary';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateEpochFlipsStatesSummaryData(data);

      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

    u=url+'Epoch/'+epoch+'/Flips?skip=0&limit=100';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateEpochFlipSubmissionsData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

    u=url+'Epoch/'+epoch+'/InvitesSummary';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateEpochInvitesSummaryData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });


    u=url+'Epoch/'+epoch+'/Invites?skip=0&limit=100';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateEpochInvitationsData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

    u=url+'Epoch/'+epoch+'/Txs/Count';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateEpochTransactionsCountData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

    u=url+'Epoch/'+epoch+'/Blocks/Count';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateEpochBlocksCountData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

    u=url+'Epoch/'+epoch+'/Txs?skip=0&limit=15';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateEpochTxsData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

    u=url+'Epoch/'+epoch+'/Txs?skip=0&limit=10';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateEpochTxsData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

    u=url+'Epoch/'+epoch+'/Blocks?skip=0&limit=10';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateEpochBlocksData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });
}











function updateEpochFlipsData(data){
    var table=$("#FlipsTable");
    table.find('td').parent().remove();

    if (data.result == null)  { return }

    for (var i = 0; i < data.result.length; i++) {
        var tr = $('<tr/>');
        var td=$("<td/>");
            td.append('<div class="user-pic"><img src="./images/flip_icn.png'+'" alt="pic"width="44"></div>');
            var cid=data.result[i].cid;  
            td.append("<div class='text_block text_block--ellipsis'><a href='./flip?flip="+cid+"'>" + cid.substr(0, 15) + "...</a></div>");
        tr.append(td);

        var td=$("<td/>");
            var author=data.result[i].author;
            td.append('<div class="user-pic"><img src="https://robohash.org/'+author.toLowerCase()+'" alt="pic"width="32"></div>');
            td.append("<div class='text_block text_block--ellipsis'><a href='./identity?identity="+author+"'>" + author.substr(0, 15) + "...</a></div>");
        tr.append(td);

        if (data.result[i].status==""){
          tr.append("<td>Not used</td>");
          tr.append("<td>-</td>");
          tr.append("<td>-</td>");
          tr.append("<td>-</td>");
        } else {
          tr.append("<td>" + data.result[i].shortRespCount + "</td>");
          tr.append("<td>" + data.result[i].longRespCount + "</td>");

          if ((data.result[i].status=="Qualified")||(data.result[i].status=="WeaklyQualified"))
            tr.append("<td>" + data.result[i].answer + "</td>");
          else
            tr.append("<td>-</td>");
          tr.append("<td>" + (data.result[i].status=="WeaklyQualified"?"Weak": (data.result[i].status=="Qualified"?"Strong":"No consensus")) + "</td>");
        }
        table.append(tr);
    }
}


function updateEpochFlipSubmissionsData(data){
    var table=$("#FlipSubmissionsTable");
    table.find('td').parent().remove();
    if (data.result == null)  { return }

    for (var i = 0; i < data.result.length; i++) {
        var tr = $('<tr/>');
        var td=$("<td/>");
            td.append('<div class="user-pic"><img src="./images/flip_icn.png" alt="pic"width="44"></div>');
            var cid=data.result[i].cid;  
            td.append("<div class='text_block text_block--ellipsis'><a href='./flip?flip="+cid+"'>" + cid.substr(0, 15) + "...</a></div>");
        tr.append(td);
        var td=$("<td/>");
            var author=data.result[i].author;
            td.append('<div class="user-pic"><img src="https://robohash.org/'+author.toLowerCase()+'" alt="pic"width="32"></div>');
            td.append("<div class='text_block text_block--ellipsis'><a href='./identity?identity="+author+"'>" + author.substr(0, 15) + "...</a></div>");
        tr.append(td);
        tr.append("<td>" + data.result[i].timestamp + "</td>");
        tr.append("<td>" + data.result[i].size + "</td>");
        table.append(tr);
    }
}


function updateEpochInvitesSummaryData(data){
    if (data.result == null)  { return }
    $("#EpochInvitations")[0].textContent=data.result.usedCount + ' / ' + data.result.allCount;
}

function updateEpochCountData(data, epoch){
    if (data.result == null)  { return }
    if (data.result-1<=epoch) {
      $('#next-epoch-btn')[0].setAttribute('disabled', '');
      $('#EpochEndLabel')[0].textContent='Next validation:';
    } else {
      $("#next-epoch-btn")[0].href=path+"?epoch="+(epoch*1+1);
    }
}


function updateEpochInvitationsData(data){
    var table=$("#InvitationsTable");
    table.find('td').parent().remove();
    if (data.result == null)  { return }
   
    for (var i = 0; i < data.result.length; i++) {
        var tr = $('<tr/>');
        var td=$("<td/>");
            td.append("<div class='text_block text_block--ellipsis'><a href='./txs?tx="+data.result[i].hash+"'>" + data.result[i].hash.substr(0, 15) + "...</a></div>");
        tr.append(td);
        var td=$("<td/>");
            td.append('<div class="user-pic"><img src="https://robohash.org/'+data.result[i].author.toLowerCase()+'" alt="pic"width="32"></div>');
            td.append("<div class='text_block text_block--ellipsis'><a href='./identity?identity="+data.result[i].author+"'>" + data.result[i].author.substr(0, 15) + "...</a></div>");
        tr.append(td);
//        tr.append("<td>" + data.result[i].timestamp + "</td>");

        var activation=data.result[i].activationHash;
        if (activation!=""){
          var td=$("<td/>");
              td.append("<div class='text_block text_block--ellipsis'><a href='./txs?tx="+activation+"'>" + data.result[i].hash.substr(0, 15) + "...</a></div>");
          tr.append(td);

          var td=$("<td/>");
              td.append('<div class="user-pic"><img src="https://robohash.org/'+data.result[i].activationAuthor.toLowerCase()+'" alt="pic"width="32"></div>');
              td.append("<div class='text_block text_block--ellipsis'><a href='./identity?identity="+data.result[i].activationAuthor+"'>" + data.result[i].activationAuthor.substr(0, 15) + "...</a></div>");
          tr.append(td);

        }else{
          tr.append("<td>Not activated</td>");
          tr.append("<td>-</td>");
        }
        table.append(tr);
    }
}


function updateEpochIdentityStatesSummaryData(data){
  if (data.result == null)  { return }

  var valid=0;
  for (var i = 0; i < data.result.length; i++) {
    var state=data.result[i].value;
    valid=valid+(((state=="Newbie")||(state=="Verified"))?data.result[i].count:0);
  }

  if (path=='/validation'){
    $("#ValidatedIdentities")[0].textContent=valid;  
  }

  if (path=='/epoch'){
    $("#EpochIdentities")[0].textContent=valid;
  }
}



function updateEpochIdentitiesData(data){
    var valid_identities_table=$("#IdentitiesTable");    
    valid_identities_table.find('td').parent().remove();
    if (data.result == null)  { return }

    for (var i = 0; i < data.result.length; i++) {
        var tr = $('<tr/>');
        var td=$("<td/>");
            td.append('<div class="user-pic"><img src="https://robohash.org/'+data.result[i].address.toLowerCase()+'" alt="pic"width="32"></div>');
            td.append("<div class='text_block text_block--ellipsis'><a href='./identity?identity="+data.result[i].address+"'>" + data.result[i].address + "</a></div>");
        tr.append(td);

      var totalScoreTxt='-';
      if (data.result[i].totalShortAnswers.flipsCount>0)
        totalScoreTxt=data.result[i].totalShortAnswers.point +" out of "+data.result[i].totalShortAnswers.flipsCount +" ("+precise2(data.result[i].totalShortAnswers.point/data.result[i].totalShortAnswers.flipsCount*100) + "%)";

      if(data.result[i].state!="Undefined"){
        tr.append("<td>" + data.result[i].state + "</td>");
        tr.append("<td>" + totalScoreTxt+ "</td>");
        valid_identities_table.append(tr);
      } 
    }
}


         
function updateEpochFlipsAnswersSummaryData(data){
  if (data.result == null)  { return }
  if (path=='/validation'){  
    var inappropriateFlips=0;
    for (var i = 0; i < data.result.length; i++) {
      var state=data.result[i].value;
      if (state=='Inappropriate') inappropriateFlips=data.result[i].count;
    }                                                           	
    $("#AbuseFlips")[0].textContent=inappropriateFlips;  
  }
}

         
function updateEpochFlipsStatesSummaryData(data){
  if (data.result == null)  { return }
  var solvedFlips=0, qualifiedFlips=0, weaklyQualifiedFlips=0, notQualifiedFlips=0;
  for (var i = 0; i < data.result.length; i++) {
    var state=data.result[i].value;
    if (state=='Qualified') qualifiedFlips=data.result[i].count;
    if (state=='WeaklyQualified') weaklyQualifiedFlips=data.result[i].count;
    if (state=='') notQualifiedFlips=data.result[i].count;
  }
  solvedFlips = qualifiedFlips + weaklyQualifiedFlips + notQualifiedFlips;
  if (path=='/validation'){
    $("#FlipsConsensus")[0].textContent=qualifiedFlips +" / "+ weaklyQualifiedFlips + " / " + notQualifiedFlips;
    $("#TotalFlips")[0].textContent=solvedFlips;
  }  
  if (path=='/epoch'){
    $("#EpochFlipsCreated")[0].textContent=notQualifiedFlips;
  }
}



function updateEpochData(data){
  if (data.result == null)  { return }
  if (path=='/epoch'){
    $("#EpochStart")[0].textContent=data.result.validationTime;
    $("#FirstBlock")[0].textContent=data.result.validationFirstBlockHeight;
  }
}


function updateNextEpochData(data){
  if (data.result == null)  { return }
  if (path=='/epoch'){
    $("#EpochEnd")[0].textContent=data.result.validationTime;
  }
}

function updateEpochTransactionsCountData(data){
  if (data.result == null)  { return }
  $("#EpochTransactionsCount")[0].textContent=data.result;  
}


function updateEpochBlocksCountData(data){
  if (data.result == null)  { return }
  $("#EpochBlocksCount")[0].textContent=data.result;
}

function updateEpochTxsData(data){
  if (data.result == null)  { return }

    var table=$("#TransactionsTable");
    table.find('td').parent().remove();
    if (data.result == null)  { return }

    for (var i = 0; i < data.result.length; i++) {
        var tr = $('<tr/>');

        var td=$("<td/>");
            var hash=data.result[i].hash;  
            td.append("<div class='text_block text_block--ellipsis'><a href='./txs/"+hash+"'>" + hash.substr(0, 15) + "...</a></div>");
        tr.append(td);

        var td=$("<td/>");
            var from=data.result[i].from;
            td.append('<div class="user-pic"><img src="https://robohash.org/'+from.toLowerCase()+'" alt="pic"width="32"></div>');
            td.append("<div class='text_block text_block--ellipsis'><a href='./identity?identity="+from+"'>" + from.substr(0, 15) + "...</a></div>");
        tr.append(td);
        tr.append("<td>" + data.result[i].timestamp + "</td>");
        tr.append("<td>" + data.result[i].type + "</td>");
        table.append(tr);
    }
}


function updateEpochBlocksData(data){
    if (data.result == null)  { return }

    var table=$("#BlocksTable");
    table.find('td').parent().remove();
    if (data.result == null)  { return }

    for (var i = 0; i < data.result.length; i++) {
        var tr = $('<tr/>');

        var td=$("<td/>");
            var height=data.result[i].height;  
            td.append("<div class='text_block text_block--ellipsis'><a href='./block/"+height+"'>" + height + "</a></div>");
        tr.append(td);

        tr.append("<td>-</td>");//todo blockissuer

        tr.append("<td>" + data.result[i].timestamp + "</td>");
        tr.append("<td>" + data.result[i].txCount + "</td>");
        table.append(tr);
    }
}


