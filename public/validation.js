

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
        updateValidationIdentitiesData(data);
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
