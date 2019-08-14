
function initEpochs(){
  getEpochsData();
}

function getEpochsData(){

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
        lastVerifiedElement=$("<td/>");
        tr.append(lastVerifiedElement);

        table.append(tr);
    }
}


