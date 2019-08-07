function initFlip(flip){
  $("#FlipId")[0].textContent=flip;
  getFlipData(flip);
}


function getFlipData(flip){

    var u=url+'Flip/'+flip;
    $.ajax({
      url: u,
      type: 'GET',
      dataType:'json',
      success: function (data) {
        updateFlipData(data);
      },
      error: function (request, error) {
        console.error(u +', error:'+error);
      }
    });


    u=url+'Flip/'+flip+'/Answers/Short?skip=0&limit=100';
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


function updateFlipData(data){
  if (data.result == null)  { return }

  if (data.result.status=="Qualified")
    $("#FlipConsensus")[0].textContent='Strong';
  if (data.result.status=="WeaklyQualified")
    $("#FlipConsensus")[0].textContent='Weak';

  if ((data.result.status!="Qualified")&&(data.result.status!="WeaklyQualified")){
    $("#FlipConsensus")[0].textContent='No consensus';
  }else{
    $("#FlipAnswer")[0].textContent=data.result.answer;
  }

    $("#FlipTx")[0].textContent= data.result.txHash.substr(0,45)+"...";
//    $("#FlipTx")[0].textContent= "<a href='./txs?tx="+data.result.txHash+"'>" + data.result.txHash.substr(0,25) + "...</a>";

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

        tr.append("<td>-</td>");
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

        tr.append("<td>-</td>");
    
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
