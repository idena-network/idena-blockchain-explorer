
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

    for (var i = 0; i < data.result.length; i++) {
        var tr = $('<tr/>');
        tr.append("<td> <a href='./epoch?epoch="+data.result[i].epoch+"'>" + epochFmt(data.result[i].epoch) + "</a></td>");

        tr.append("<td>" + data.result[i].blockCount + "</td>");
        tr.append("<td>" + "" + "</td>");
        tr.append("<td>" + data.result[i].flipCount + "</td>");
        tr.append("<td>" + "" + "</td>");
        tr.append("<td>" + data.result[i].verified + "</td>");

        table.append(tr);
    }
}


