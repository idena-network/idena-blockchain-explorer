

function initIdentity(identity){
  prepareIdentityData(identity);
  $("#IdentityAddress")[0].textContent=identity;
  $("#IdentityAvatar img")[0].src="https://robohash.org/"+identity.toLowerCase();

  $("#BalanceAddress")[0].href="/address?address="+identity;
};

var CurrentEpoch=0;
  
function prepareIdentityData(identiy){
    var u=url+'Epochs/Count';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        if (data.result == null)  { return }
        CurrentEpoch=data.result;
        getIdentityData(identiy);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });
}

function getIdentityData(identiy){
    var u=url+'Identity/'+identiy;
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

    var u=url+'Identity/'+identiy+'/Age';
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


    var u=url+'Identity/'+identiy+'/FlipStates';
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

    var u=url+'Identity/'+identiy+'/FlipQualifiedAnswers';
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

    var u=url+'Identity/'+identiy+'/Epochs?skip=0&limit=100';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateIdentityEpochsData(data, identiy);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });
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
        tr.append("<td>"+data.result[i].prevState+"</td>");

        var longScoreTxt='-', shortScoreTxt='-', totalScoreTxt='-';
        if (data.result[i].longAnswers.flipsCount>0)
          longScoreTxt=data.result[i].longAnswers.point +" out of "+data.result[i].longAnswers.flipsCount +" ("+precise2(data.result[i].longAnswers.point/data.result[i].longAnswers.flipsCount*100) + "%)";
        if (data.result[i].shortAnswers.flipsCount>0)
          shortScoreTxt=data.result[i].shortAnswers.point +" out of "+data.result[i].shortAnswers.flipsCount +" ("+precise2(data.result[i].shortAnswers.point/data.result[i].shortAnswers.flipsCount*100) + "%)";
        if (data.result[i].totalShortAnswers.flipsCount>0)
          totalScoreTxt=data.result[i].totalShortAnswers.point +" out of "+data.result[i].totalShortAnswers.flipsCount +" ("+precise2(data.result[i].totalShortAnswers.point/data.result[i].totalShortAnswers.flipsCount*100) + "%)";

        var state=data.result[i].state;
        if (state=="Undefined"){
          tr.append("<td>Not validated</td>");
          if (data.result[i].missed="true"){
            if (data.result[i].respScore>0){
              tr.append("<td>"+shortScoreTxt+"</td>");
              tr.append("<td>"+longScoreTxt+"</td>");
              tr.append("<td>Late submission</td>") 
              tr.append("<td><a href='./identity?epoch="+nextEpoch+"&identity="+identity+"'><i class='icon icon--thin_arrow_right'></a></td>");
            } else {
              tr.append("<td>-</td>");
              tr.append("<td>-</td>");
              tr.append("<td>Missed validation</td>");
              tr.append("<td>-</td>");
            }
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
  if (data.result.state=="Undefined"){
    $("#IdentityStatus")[0].textContent='Not validated';
  } else
    $("#IdentityStatus")[0].textContent=data.result.state;
  $("#IdentitySolvedFlips")[0].textContent=data.result.shortAnswers.flipsCount;
  $("#IdentityRightAnswers")[0].textContent=data.result.shortAnswers.point;
  if (data.result.shortAnswers.flipsCount>0)
    $("#IdentityScore")[0].textContent= precise2(data.result.shortAnswers.point / data.result.shortAnswers.flipsCount * 100)+'%';
  $("#IdentityId")[0].textContent=data.result.address;
}
