"use strict";


function getAllUrlParams(url) {
  let queryString = url ? url.split('?')[1] : window.location.search.slice(1);
  let obj = {};
  
  if (queryString) {
    queryString = queryString.split('#')[0];
    let arr = queryString.split('&');

    for (let i = 0; i < arr.length; i++) {
      let a = arr[i].split('=');
      let paramName = a[0];
      let paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

      if (paramName.match(/\[(\d+)?\]$/)) {

        let key = paramName.replace(/\[(\d+)?\]/, '');
        if (!obj[key]) obj[key] = [];

        if (paramName.match(/\[\d+\]$/)) {
          let index = /\[(\d+)\]/.exec(paramName)[1];
          obj[key][index] = paramValue;
        } else {
          obj[key].push(paramValue);
        }
      } else {
        if (!obj[paramName]) {
          obj[paramName] = paramValue;
        } else if (obj[paramName] && typeof obj[paramName] === 'string'){
          obj[paramName] = [obj[paramName]];
          obj[paramName].push(paramValue);
        } else {
          obj[paramName].push(paramValue);
        }
      }
    }
  }

  return obj;
}


window.addEventListener('DOMContentLoaded', function () {
  // START OF: is mobile =====
  function isMobile() {
    return (/Android|iPhone|iPad|iPod|BlackBerry/i).test(navigator.userAgent || navigator.vendor || window.opera);
  }
  // ===== END OF: is mobile

  const BODY = $('body');

  // START OF: mark is mobile =====
  (function() {
    BODY.addClass('loaded');

    if(isMobile()){
      BODY.addClass('body--mobile');
      $('video').remove()
    }else{
      BODY.addClass('body--desktop');
    }
  })();
  // ===== END OF: mark is mobile

  let $btnAgree = $('.btn_agree');

  $btnAgree.on('click', function() {
    $(this).closest('.badge_fixed').remove()
  });

  function initInputBlur() {
    $('.form_subscribe').each(function () {
      $(this).find('.form-control').on('blur', function(event) {
        let inputValue = this.value;
        if (inputValue) {
          this.classList.add('value-exists');
        } else {
          this.classList.remove('value-exists');
        }
      });
    })
  }

  initInputBlur();

  let token = getAllUrlParams().confirmationToken;

  function postData(data) {
    fetch(`https://api.mc2.com.de/api/EmailConfirmation/Confirm?confirmationToken=${data}`, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: { 'Content-type': 'application/x-www-form-urlencoded' },
      redirect: 'follow',
      referrer: 'no-referrer',
      body: `?confirmationToken=${data}`,
    })
      .then(function (response) {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response;
      })
      .then(function (response) {
        console.log('Request succeeded with OK response');

        window.location.href = '/verified.html'
      })
      .catch(function (error) {
        console.error('Request failed', error);

        window.location.href = '/404.html'
      });
  }

  if (token && token !== "") {
    postData(token)
  } else if (!BODY.is(":visible")) {
    BODY.show();
  }
});


var url='https://scan.idena.io/api/';

var path='';

$(document).ready(function() {
  $('[data-toggle="tooltip"]').tooltip();
  path=window.location.pathname;

  var p=getAllUrlParams();

  if(path=="/identity")
    if (! (p.identity===undefined))
     initIdentity(p.identity);

  if(path=="/epoch")
    if (! (p.epoch===undefined))
      initEpoch(p.epoch);

  if(path=="/validation")
    if (! (p.epoch===undefined))
     initEpoch(p.epoch);

});

function precise2(x) {
  return Math.round(x*100)/100;
}


function initIdentity(identity){
  getIdentityData(identity);
  $("#IdentityAddress")[0].textContent=identity;
  $("#IdentityAvatar img")[0].src="https://robohash.org/"+identity.toLowerCase();
};
  

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

        var tr = $('<tr/>');
        var td=$("<td/>");
            td.append("<div class='text_block text_block--ellipsis'><a href='./epoch?epoch="+epoch+"'>" + epoch + "</a></div>");
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
              tr.append("<td><a href='./identity?epoch="+epoch+"&identity="+identity+"'><i class='icon icon--info'></a></td>");
            }else{
              tr.append("<td>-</td>");
              tr.append("<td>-</td>");
              tr.append("<td>Missed validation</td>");
              tr.append("<td>-</td>");
            }
          }

        }else {
          tr.append("<td>"+data.result[i].state+"</td>");
          tr.append("<td>"+shortScoreTxt+"</td>");
          tr.append("<td>"+longScoreTxt+"</td>");
          tr.append("<td>Successful</td>");
          tr.append("<td><a href='./identity?epoch="+data.result[i].epoch+"&identity="+identity+"'><i class='icon icon--info'></a></td>");
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
    if (state=='') notQualifiedFlips=data.result[i].count;
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
  if ((data.result.state=='Newbie')||(data.result.state=='Verified')){
    $("#IdentityAvatar div").append( '<i class="icon icon--status"></i>');
  }
  if (data.result.state=="Undefined"){
    $("#IdentityStatus")[0].textContent='Not validated';
  } else
    $("#IdentityStatus")[0].textContent=data.result.state;
  $("#IdentitySolvedFlips")[0].textContent=data.result.shortAnswers.point;
  $("#IdentityRightAnswers")[0].textContent=data.result.shortAnswers.flipsCount;
  $("#IdentityScore")[0].textContent= precise2(data.result.shortAnswers.point / data.result.shortAnswers.flipsCount * 100)+'%';
  $("#IdentityId")[0].textContent=data.result.address;
}





var epochData = null;
var epochIdentities = null;


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
    u=url+'Epochs/Count';
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




function updateEpochFlipsData(data){
    var table=$("#FlipsTable");
    table.find('td').parent().remove();

    if (data.result == null)  { return }

    for (var i = 0; i < data.result.length; i++) {
        var tr = $('<tr/>');
        var td=$("<td/>");
            td.append('<div class="user-pic"><img src="./images/flip_icn.png'+'" alt="pic"width="44"></div>');
            var cid=data.result[i].cid;  
            td.append("<div class='text_block text_block--ellipsis'><a href='./flip/flip="+cid+"'>" + cid.substr(0, 15) + "...</a></div>");
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
            td.append("<div class='text_block text_block--ellipsis'><a href='./flip/"+cid+"'>" + cid.substr(0, 15) + "...</a></div>");
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
    $("#EpochInvitations")[0].textContent=data.result.allCount + ' / '+data.result.usedCount;
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
            td.append('<div class="user-pic"><img src="https://robohash.org/'+data.result[i].id.toLowerCase()+'" alt="pic"width="32"></div>');
            td.append("<div class='text_block text_block--ellipsis'><a href='./identity?identity="+data.result[i].id+"'>" + data.result[i].id.substr(0, 15) + "...</a></div>");
        tr.append(td);
        var td=$("<td/>");
            td.append('<div class="user-pic"><img src="https://robohash.org/'+data.result[i].author.toLowerCase()+'" alt="pic"width="32"></div>');
            td.append("<div class='text_block text_block--ellipsis'><a href='./identity?identity="+data.result[i].author+"'>" + data.result[i].author.substr(0, 15) + "...</a></div>");
        tr.append(td);
        tr.append("<td>" + data.result[i].createTimestamp + "</td>");
        tr.append("<td>" + data.result[i].status + "</td>");
        tr.append("<td>" + (data.result[i].status==''?'':data.result[i].activateTimestamp) + "</td>");
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

function updateValidationIdentitiesData(data){

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

      if(data.result[i].state!="Undefined"){

        tr.append("<td>" + data.result[i].prevState+ "</td>");
        tr.append("<td>" + data.result[i].state + "</td>");
        tr.append("<td>" + shortScoreTxt + "</td>");

        if (data.result[i].prevState=="Candidate") 
          tr.append("<td>" + longScoreTxt + "</td>");
        else
          tr.append("<td>" + longScoreTxt + "</td>");
        tr.append("<td></td>");//Age
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

            if (data.result[i].shortAnswers.flipsCount>0) 
              tr.append("<td>Late submission</td>");
            else
              tr.append("<td>Missed validation</td>");
            MissedValidationCount++;
          }else{
            tr.append("<td>Wrong answers</td>");
            FailedValidationCount++;
          }
        }
      }

      if(data.result[i].state!="Undefined"){
        valid_identities_table.append(tr);
      } else {
        failed_identities_table.append(tr);
      }
    }
    $("#FailedValidationIdentities")[0].textContent=FailedValidationCount;
    $("#MissedValidationIdentities")[0].textContent=MissedValidationCount;
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

