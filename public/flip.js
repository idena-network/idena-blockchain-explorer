var FlipEpoch;


function initFlip(flip){
  $("#FlipId")[0].textContent=flip;
  prepareFlipData(flip);
}


function prepareFlipData(flip){

    var u=url+'Flip/'+flip;
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateFlipData(data);
        getFlipData(flip);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });
}


function getFlipData(flip){

    var u=url+'Flip/'+flip+'/Answers/Short?skip=0&limit=100';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateFlipAnswersShortData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });

    u=url+'Flip/'+flip+'/Answers/Long?skip=0&limit=10';
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateFlipAnswersLongData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });
}


function updateIdentityStatus(identity, element){
    var prevEpoch=FlipEpoch-1;
    var u=url+'Epoch/'+prevEpoch+'/Identity/'+identity;
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        if (data.result == null)  { return }
        element[0].textContent=data.result.state;
        console.log(element[0]+':'+JSON.stringify(data));
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });
}

function updateFlipData(data){
  if (data.result == null)  { return }

  FlipEpoch = data.result.epoch;

  if (data.result.status=="Qualified")
    $("#FlipConsensus")[0].textContent='Strong'
  else
  if (data.result.status=="WeaklyQualified")
    $("#FlipConsensus")[0].textContent='Weak';


  if ((data.result.status!="Qualified")&&(data.result.status!="WeaklyQualified")){
    $("#FlipConsensus")[0].textContent='No consensus';
  }else{
    $("#FlipAnswer")[0].textContent=data.result.answer;
  }

  $("#FlipAuthor")[0].textContent= data.result.author.substr(0,30)+"...";
  $("#FlipAuthor")[0].href= "./identity?identity="+data.result.author;

  $("#FlipTx")[0].textContent= data.result.txHash.substr(0,35)+"...";
  $("#FlipTx")[0].href="./tx?tx="+data.result.txHash;

  $("#FlipCreated")[0].textContent= data.result.timestamp;
  $("#FlipSize")[0].textContent= data.result.size + ' bytes';

  $("#FlipEpoch")[0].textContent= epochFmt(data.result.epoch);
  $("#FlipEpoch")[0].href="./epoch?epoch="+data.result.epoch;

  $("#FlipBlock")[0].textContent= data.result.blockHeight;
  $("#FlipBlock")[0].href="./block?block="+data.result.blockHeight;
}


function updateFlipAnswersShortData(data){
    var table=$("#FlipIdentitiesTable");
    table.find('td').parent().remove();
    if (data.result == null)  { return }


    for (var i = 0; i < data.result.length; i++) {
        var tr = $('<tr/>');
        var td=$("<td/>");
            td.append('<div class="user-pic"><img src="https://robohash.org/'+data.result[i].address.toLowerCase()+'" alt="pic"width="32"></div>');
            td.append("<div class='text_block text_block--ellipsis'><a href='./identity?identity="+data.result[i].address+"'>" + data.result[i].address + "</a></div>");
        tr.append(td);

        td=$("<td/>");
        updateIdentityStatus(data.result[i].address, td);
        tr.append(td);

        tr.append("<td>" + data.result[i].respAnswer + "</td>");
        //tr.append("<td>" + data.result[i].flipAnswer + "</td>");
        table.append(tr);
    }

}


function updateFlipAnswersLongData(data){
    var table=$("#FlipCommitteeTable");
    table.find('td').parent().remove();
    if (data.result == null)  { return }

    var leftAnswer=0, rightAnswer=0, inappropriateAnswer=0, noneAnswer=0;
    for (var i = 0; i < data.result.length; i++) {
        var tr = $('<tr/>');
        var td=$("<td/>");
            td.append('<div class="user-pic"><img src="https://robohash.org/'+data.result[i].address.toLowerCase()+'" alt="pic"width="32"></div>');
            td.append("<div class='text_block text_block--ellipsis'><a href='./identity?identity="+data.result[i].address+"'>" + data.result[i].address + "</a></div>");
        tr.append(td);

        td=$("<td/>");
        updateIdentityStatus(data.result[i].address, td);
        tr.append(td);
    
        var answerText='';
        if (data.result[i].respAnswer=="Left"){
          leftAnswer++; 
          tr.append("<td>" + data.result[i].respAnswer + "</td>");
        }
        if (data.result[i].respAnswer=="Right"){
          rightAnswer++; 
          tr.append("<td>" + data.result[i].respAnswer + "</td>");
        }

        if (data.result[i].respAnswer=="Inappropriate"){
          inappropriateAnswer++; 
          tr.append("<td>" + data.result[i].respAnswer + "</td>");
        }

        if (data.result[i].respAnswer=="None"){
          noneAnswer++;
          tr.append("<td>No answer</td>");
        }           
        //tr.append("<td>" + data.result[i].flipAnswer + "</td>");
        table.append(tr);
    }

    $("#InappropriateAnswers")[0].textContent=inappropriateAnswer;
    $("#LeftAnswers")[0].textContent=leftAnswer;
    $("#RightAnswers")[0].textContent=rightAnswer;

}
