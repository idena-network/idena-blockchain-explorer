function initValidation(currEpoch){
  var nextEpoch=currEpoch*1+1;
  var prevEpoch=currEpoch-1;

  $("#EpochId")[0].textContent='for epoch ' + epochFmt(currEpoch);
  $("#EpochPageLink")[0].href="/epoch?epoch="+currEpoch;

  if(currEpoch>0)
    getValidationData(currEpoch);

};


function getValidationData(epoch){
    var prevEpoch=epoch-1;

    var u=url+'Epoch/'+prevEpoch;

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

    u=url+'Epoch/'+prevEpoch+'/FlipStatesSummary';
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

    u=url+'Epoch/'+prevEpoch+'/FlipAnswersSummary';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateEpochFlipsAnswersSummaryData(data);

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
        updateValidationIdentitiesData(data, prevEpoch);
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
}





function updateValidationIdentitiesData(data, epoch){

    var nextEpoch = epoch*1+1;
    var valid_identities_table=$("#IdentitiesTable");
    var failed_identities_table=$("#FailedIdentities");    
    valid_identities_table.find('td').parent().remove();
    failed_identities_table.find('td').parent().remove();
    if (data.result == null)  { return }

    var FailedValidationCount=0;
    var MissedValidationCount=0;

    for (var i = 0; i < data.result.length; i++) {
        var tr = $('<tr/>');
        var td=$("<td/>");
            td.append('<div class="user-pic"><img src="https://robohash.org/'+data.result[i].address.toLowerCase()+'" alt="pic"width="32"></div>');
            td.append("<div class='text_block text_block--ellipsis'><a href='./identity?identity="+data.result[i].address+"'>" + data.result[i].address.substr(0, 15) + "...</a></div>");
        tr.append(td);


      var longScoreTxt='-', shortScoreTxt='-', totalScoreTxt='-';
      if (data.result[i].longAnswers.flipsCount>0)
        longScoreTxt=data.result[i].longAnswers.point +" out of "+data.result[i].longAnswers.flipsCount +" ("+precise2(data.result[i].longAnswers.point/data.result[i].longAnswers.flipsCount*100) + "%)";
      if (data.result[i].shortAnswers.flipsCount>0)
        shortScoreTxt=data.result[i].shortAnswers.point +" out of "+data.result[i].shortAnswers.flipsCount +" ("+precise2(data.result[i].shortAnswers.point/data.result[i].shortAnswers.flipsCount*100) + "%)";
      if (data.result[i].totalShortAnswers.flipsCount>0)
        totalScoreTxt=data.result[i].totalShortAnswers.point +" out of "+data.result[i].totalShortAnswers.flipsCount +" ("+precise2(data.result[i].totalShortAnswers.point/data.result[i].totalShortAnswers.flipsCount*100) + "%)";

      if((data.result[i].state!="Undefined")&&(data.result[i].state!="Suspended")&&(data.result[i].state!="Zombie")){

        tr.append("<td>" + data.result[i].prevState+ "</td>");
        tr.append("<td>" + data.result[i].state + "</td>");
        tr.append("<td>" + shortScoreTxt + "</td>");

        if (data.result[i].prevState=="Candidate") 
          tr.append("<td>" + longScoreTxt + "</td>");
        else
          tr.append("<td>" + longScoreTxt + "</td>");

        tr.append("<td><a href='./answers?epoch="+nextEpoch+"&identity="+data.result[i].address+"'><i class='icon icon--thin_arrow_right'></a></td>");
        valid_identities_table.append(tr);

      } else {
        tr.append("<td>" + data.result[i].prevState+ "</td>");
        //todo authorScore:        tr.append("<td>" + precise2(data.result[i].authorScore*100) + "%</td>"); 

        if (data.result[i].prevState=="Invite") {
          tr.append("<td>-</td>");
          tr.append("<td>-</td>");
          tr.append("<td>" + "Not activated" + "</td>")
        } else {

          tr.append("<td>" + shortScoreTxt + "</td>");
          tr.append("<td>" + longScoreTxt + "</td>");

          if (data.result[i].missed){

            if (data.result[i].shortAnswers.flipsCount>0) {

                tr.append("<td>Late submission</td>")

            } else {

              if (data.result[i].requiredFlips!=data.result[i].madeFlips)
                tr.append("<td>Not allowed</td>")
              else
                tr.append("<td>Missed validation</td>");
            }
            MissedValidationCount++;

          }else{
            tr.append("<td>Wrong answers</td>");
            FailedValidationCount++;
          }
        }
        tr.append("<td><a href='./answers?epoch="+nextEpoch+"&identity="+data.result[i].address+"'><i class='icon icon--thin_arrow_right'></a></td>");
        failed_identities_table.append(tr);
      }
    }
    $("#FailedValidationIdentities")[0].textContent=FailedValidationCount;
    $("#MissedValidationIdentities")[0].textContent=MissedValidationCount;
}
