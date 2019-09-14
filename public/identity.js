

function initIdentity(identity){
  prepareIdentityData(identity);
  $("#IdentityAddress")[0].textContent=identity;
  $("#IdentityAvatar img")[0].src="https://robohash.org/"+identity.toLowerCase();

  $("#BalanceAddress")[0].href="/address?address="+identity;
};

var CurrentEpoch=0;
  
function prepareIdentityData(identity){
    var u=url+'Epochs/Count';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        if (data.result == null)  { return }
        CurrentEpoch=data.result;
        getIdentityData(identity);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });
}

function getIdentityData(identity){
    var u=url+'Identity/'+identity;
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateIdentityData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

    var u=url+'Identity/'+identity+'/Age';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateIdentityAgeData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });


    var u=url+'Identity/'+identity+'/FlipStates';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateIdentityFlipStatesData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

    var u=url+'Identity/'+identity+'/FlipQualifiedAnswers';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateIdentityFlipQualifiedAnswersData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

    var u=url+'Identity/'+identity+'/Epochs?skip=0&limit=100';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateIdentityEpochsData(data, identity);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });


    var u=url+'Epochs/Count';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateEpochCountFlipsData(data, identity);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

    var u=url+'OnlineIdentity/'+identity;
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateOnlineMiningStatus(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });


}

function updateEpochCountFlipsData(data, identity){
    var table=$("#IdentityFlipsTable");
    table.find('td').parent().remove();
    if (data.result == null)  { return }
    getFlipsData(data.result-1, identity, data.result-1);
}


function getFlipsData(epoch, identity, currEpoch){

    var u=url+'Epoch/'+epoch+'/Identity/'+identity+'/Flips';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateFlipsData(data, epoch, identity, currEpoch);
        if(epoch>0)
          getFlipsData(epoch-1, identity, currEpoch);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });
}

function updateFlipsData(data, epoch, identity, currEpoch){

    if (data.result == null)  { return }
    var nextEpoch=epoch*1+1;

    var table=$("#IdentityFlipsTable");

    for (var i = 0; i < data.result.length; i++) {
        var tr = $('<tr/>');

        var td=$("<td/>");
            if (data.result[i].icon!=null){
                var buffArray = new Uint8Array(
                    data.result[i].icon.substring(2).match(/.{1,2}/g).map(byte => parseInt(byte, 16))
                )
                var src = URL.createObjectURL(new Blob([buffArray], {type: 'image/jpeg'}))
                td.append('<div class="user-pic"><img src="'+src+'" alt="pic"width="44" height="44"></div>');
                //URL.revokeObjectURL(src);
            } else {
                td.append('<div class="user-pic"><img src="./images/flip_icn.png'+'" alt="pic" width="44"></div>');
            }


            var cid=data.result[i].cid;  
            td.append("<div class='text_block text_block--ellipsis'><a href='./flip?flip="+cid+"'>" + cid.substr(0, 15) + "...</a></div>");
        tr.append(td);

        var td=$("<td/>");
            td.append("<div class='text_block text_block--ellipsis'><a href='./epoch?epoch="+epoch+"'>" + epochFmt(epoch) + "</a></div>");
        tr.append(td);

        var status = (data.result[i].status==''?'-':data.result[i].status);
        tr.append("<td>"+status+"</td>");
        tr.append("<td>"+data.result[i].timestamp+"</td>");
        tr.append("<td>"+data.result[i].size+"</td>");

        table.append(tr);
    }
}


function updateIdentityAgeData(data){
  if (data.result == null)  { return }
  $("#IdentityAge")[0].textContent=data.result;
}


function updateIdentityEpochsData(data, identity){
  var table=$("#IdentityEpochsTable");
  table.find('td').parent().remove();

  if (data.result == null)  { return }

  for (var i = 0; i < data.result.length; i++) {
        var epoch=data.result[i].epoch;
        var nextEpoch = epoch*1+1;
        if (nextEpoch==CurrentEpoch) { continue; }

        var tr = $('<tr/>');
        var td=$("<td/>");
            td.append("<div class='text_block text_block--ellipsis'><a href='./epoch?epoch="+nextEpoch+"'>" + epochFmt(nextEpoch) + "</a></div>");
        tr.append(td);
        tr.append("<td>"+identityStatusFmt(data.result[i].prevState)+"</td>");

        var longScoreTxt='-', shortScoreTxt='-', totalScoreTxt='-';
        if (data.result[i].longAnswers.flipsCount>0)
          longScoreTxt=data.result[i].longAnswers.point +" out of "+data.result[i].longAnswers.flipsCount +" ("+precise2(data.result[i].longAnswers.point/data.result[i].longAnswers.flipsCount*100) + "%)";
        if (data.result[i].shortAnswers.flipsCount>0)
          shortScoreTxt=data.result[i].shortAnswers.point +" out of "+data.result[i].shortAnswers.flipsCount +" ("+precise2(data.result[i].shortAnswers.point/data.result[i].shortAnswers.flipsCount*100) + "%)";
//        if (data.result[i].totalShortAnswers.flipsCount>0)
//         totalScoreTxt=data.result[i].totalShortAnswers.point +" out of "+data.result[i].totalShortAnswers.flipsCount +" ("+precise2(data.result[i].totalShortAnswers.point/data.result[i].totalShortAnswers.flipsCount*100) + "%)";

        var state=data.result[i].state;


        if ((state!="Verified")&&(state!="Newbie")){


          tr.append("<td>"+identityStatusFmt(state)+"</td>");


          if (data.result[i].missed){ 
 
            if (data.result[i].shortAnswers.flipsCount>0){
              tr.append("<td>"+shortScoreTxt+"</td>");
              tr.append("<td>"+longScoreTxt+"</td>");
              tr.append("<td>Late submission</td>") 
              tr.append("<td><a href='./answers?epoch="+nextEpoch+"&identity="+identity+"'><i class='icon icon--thin_arrow_right'></a></td>");
            } else {

              if (data.result[i].requiredFlips!=data.result[i].madeFlips){
                tr.append("<td>-</td>");
                tr.append("<td>-</td>");
                tr.append("<td>Not allowed</td>");
                tr.append("<td><a href='./answers?epoch="+nextEpoch+"&identity="+identity+"'><i class='icon icon--thin_arrow_right'></a></td>");
              } else {
                tr.append("<td>-</td>");
                tr.append("<td>-</td>");
                tr.append("<td>Missed validation</td>");
                tr.append("<td><a href='./answers?epoch="+nextEpoch+"&identity="+identity+"'><i class='icon icon--thin_arrow_right'></a></td>");
              }
            }
          } else {
         
            tr.append("<td>"+shortScoreTxt+"</td>");
            tr.append("<td>"+longScoreTxt+"</td>");
            tr.append("<td>Wrong answers</td>")
            tr.append("<td><a href='./answers?epoch="+nextEpoch+"&identity="+identity+"'><i class='icon icon--thin_arrow_right'></a></td>");
        }
      } else {
        tr.append("<td>"+data.result[i].state+"</td>");
        tr.append("<td>"+shortScoreTxt+"</td>");
        tr.append("<td>"+longScoreTxt+"</td>");
        tr.append("<td>Successful</td>");
        tr.append("<td><a href='./answers?epoch="+nextEpoch+"&identity="+identity+"'><i class='icon icon--thin_arrow_right'></a></td>");
      }
      table.append(tr);
  }
}



function updateIdentityFlipStatesData(data){
  if (data.result == null)  { return }

  var solvedFlips=0, qualifiedFlips=0, weaklyQualifiedFlips=0, notQualifiedFlips=0;
  for (var i = 0; i < data.result.length; i++) {
    var state=data.result[i].value;
    if (state=='Qualified') qualifiedFlips=data.result[i].count;
    if (state=='WeaklyQualified') weaklyQualifiedFlips=data.result[i].count;
    if (state=='NotQualified') notQualifiedFlips=data.result[i].count;
  }
  var totalFlips = qualifiedFlips + weaklyQualifiedFlips + notQualifiedFlips;
  $("#IdentityFlipsCreated")[0].textContent= totalFlips;
  $("#IdentityQualifiedFlips")[0].textContent=qualifiedFlips +" / "+ weaklyQualifiedFlips + " / " + notQualifiedFlips;
}


function updateIdentityFlipQualifiedAnswersData(data){
  if (data.result == null)  { return }
  var inappropriate=0;
  for (var i = 0; i < data.result.length; i++) {
    if (data.result[i].value=='Inappropriate') inappropriate=data.result[i].count;
  }
  $("#IdentityInappropriateFlips")[0].textContent=inappropriate;
}



function updateIdentityData(data){
  if (data.result == null)  { return }
  if (data.result.state=='Verified'){
    $("#IdentityAvatar div").append( '<i class="icon icon--status"></i>');
  }
  $("#IdentityStatus")[0].textContent=identityStatusFmt(data.result.state);

  if ((data.result.state=="Newbie")||(data.result.state=="Verified"))
    $(".onlineMiner").removeClass("hidden")

  $("#IdentitySolvedFlips")[0].textContent=data.result.totalShortAnswers.flipsCount; //shortAnswers.flipsCount; without state fork
  $("#IdentityRightAnswers")[0].textContent=data.result.totalShortAnswers.point; //shortAnswers.point;
  if (data.result.shortAnswers.flipsCount>0)
    $("#IdentityScore")[0].textContent= precise2(data.result.totalShortAnswers.point / data.result.totalShortAnswers.flipsCount * 100)+'%';
//    $("#IdentityScore")[0].textContent= precise2(data.result.shortAnswers.point / data.result.shortAnswers.flipsCount * 100)+'%';

}


function updateOnlineMiningStatus(data){
  if (data.result == null)  { return }

  if (data.result.lastActivity)
    $("#LastSeen")[0].textContent=timeFmt(data.result.lastActivity)
  else
    $("#LastSeen")[0].textContent='-'

  if (data.result.online) {
    $("#OnlineMinerStatus")[0].textContent="On";
  } else {
    $("#OnlineMinerStatus")[0].textContent="Off";
  }

}
