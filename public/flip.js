var FlipEpoch;

function initFlip(flip) {
  $('#FlipId')[0].textContent = flip;
  prepareFlipData(flip);
}

function prepareFlipData(flip) {
  var u = url + 'Flip/' + flip;
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateFlipData(data);
      getFlipData(flip);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });
}

function getFlipData(flip) {
  var u = url + 'Flip/' + flip + '/Answers/Short?skip=0&limit=100';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateFlipAnswersShortData(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  u = url + 'Flip/' + flip + '/Answers/Long?skip=0&limit=100';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateFlipAnswersLongData(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  u = url + 'Flip/' + flip + '/Content';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateFlipContent(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  u = url + 'Flip/' + flip + '/Epoch/AdjacentFlips';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateAdjacentFlips(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });
}

function updateAdjacentFlips(data) {
  if (data.result == null) return;

  const prevFlip = data.result.prev && data.result.prev.value;
  const nextFlip = data.result.next && data.result.next.value;

  if (prevFlip) {
    $('#prev-flip-btn')[0].href = path + '?flip=' + prevFlip;
  } else {
    $('#prev-flip-btn')[0].setAttribute('disabled', '');
  }
  if (nextFlip) {
    $('#next-flip-btn')[0].href = path + '?flip=' + nextFlip;
  } else {
    $('#next-flip-btn')[0].setAttribute('disabled', '');
  }
}

function updateIdentityStatus(identity, element) {
  var u = url + 'Epoch/' + FlipEpoch + '/Identity/' + identity;
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      if (data.result == null) {
        return;
      }
      element[0].textContent = data.result.prevState;
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });
}

function updateFlipData(data) {
  if (data.result == null) {
    return;
  }

  FlipEpoch = data.result.epoch;

  if (data.result.status == 'Qualified')
    $('#FlipConsensus')[0].textContent = 'Strong';
  else if (data.result.status == 'WeaklyQualified')
    $('#FlipConsensus')[0].textContent = 'Weak';

  if (
    data.result.status != 'Qualified' &&
    data.result.status != 'WeaklyQualified'
  ) {
    $('#FlipConsensus')[0].textContent = 'No consensus';
  } else {
    $('#FlipAnswer')[0].textContent = data.result.answer;
  }

  /*
  if (data.result.answer == 'Left') {
    $('#FlipImgLeft').addClass('active');
  } else if (data.result.answer == 'Right') {
    $('#FlipImgRight').addClass('active');
  }
*/

  $('#FlipAuthor span')[0].textContent =
    data.result.author.substr(0, 30) + '...';
  $('#FlipAuthor img')[0].src =
    'https://robohash.org/' + data.result.author.toLowerCase();
  $('#FlipAuthor')[0].href = './identity?identity=' + data.result.author;

  $('#FlipTx')[0].textContent = data.result.txHash.substr(0, 35) + '...';
  $('#FlipTx')[0].href = './tx?tx=' + data.result.txHash;

  $('#FlipCreated')[0].textContent = timeFmt(data.result.timestamp);
  $('#FlipSize')[0].textContent = data.result.size + ' bytes';

  $('#FlipEpoch')[0].textContent = epochFmt(data.result.epoch);
  $('#FlipEpoch')[0].href = './epoch?epoch=' + data.result.epoch;

  $('#FlipBlock')[0].textContent = data.result.blockHeight;
  $('#FlipBlock')[0].href = './block?block=' + data.result.blockHeight;

  if (data.result.words != null) {
    $('#Keyword1')[0].textContent = data.result.words.word1.name;
    $('#Keyword1Descr')[0].textContent = data.result.words.word1.desc;
    $('#Keyword2')[0].textContent = data.result.words.word2.name;
    $('#Keyword2Descr')[0].textContent = data.result.words.word2.desc;

    if (data.result.wrongWords) {
      $('#KeywordRelevance span')[0].textContent =
        'The flip was reported as irrelevant to keywords or having inappropriate content, labels on top of the images showing the right order or text needed to solve the flip';

      $('#KeywordRelevance i').addClass('icon--micro_fail');
    } else {
      $('#KeywordRelevance span')[0].textContent =
        'Flip is relevant to the keywords';
      $('#KeywordRelevance i').addClass('icon--micro_success');
    }
  } else {
    $('#Keyword1Descr')[0].textContent = 'No keywords available';
    $('#Keyword2Descr')[0].textContent = 'No keywords available';
  }

  $('#IrrelevantKeywordsScore')[0].textContent = data.result.wrongWordsVotes;
}

function updateFlipAnswersShortData(data) {
  var table = $('#FlipIdentitiesTable');
  table
    .find('td')
    .parent()
    .remove();
  if (data.result == null) {
    return;
  }

  for (var i = 0; i < data.result.length; i++) {
    var tr = $('<tr/>');
    var td = $('<td/>');
    td.append(
      '<div class="user-pic"><img src="https://robohash.org/' +
        data.result[i].address.toLowerCase() +
        '" alt="pic"width="32"></div>'
    );
    td.append(
      "<div class='text_block text_block--ellipsis'><a href='./identity?identity=" +
        data.result[i].address +
        "'>" +
        data.result[i].address +
        '</a></div>'
    );
    tr.append(td);

    td = $('<td/>');
    updateIdentityStatus(data.result[i].address, td);
    tr.append(td);

    var icon = '';
    if (data.result[i].flipAnswer != 'None') {
      if (data.result[i].respAnswer == data.result[i].flipAnswer) {
        icon = '<i class="icon icon--micro_success"></i>';
      } else {
        icon = '<i class="icon icon--micro_fail"></i>';
      }
    }

    tr.append(
      '<td>' + icon + '<span>' + data.result[i].respAnswer + '<span></td>'
    );
    table.append(tr);
  }
}

function updateFlipAnswersLongData(data) {
  var table = $('#FlipCommitteeTable');
  table
    .find('td')
    .parent()
    .remove();
  if (data.result == null) {
    return;
  }

  var leftAnswer = 0,
    rightAnswer = 0,
    //inappropriateAnswer = 0,
    noneAnswer = 0;
  epoch = FlipEpoch * 1 + 1;
  for (var i = 0; i < data.result.length; i++) {
    var tr = $('<tr/>');
    var td = $('<td/>');
    td.append(
      '<div class="user-pic"><img src="https://robohash.org/' +
        data.result[i].address.toLowerCase() +
        '" alt="pic"width="32"></div>'
    );
    td.append(
      "<div class='text_block text_block--ellipsis'><a href='./answers?epoch=" +
        epoch +
        '&identity=' +
        data.result[i].address +
        "#long-session'>" +
        data.result[i].address +
        '</a></div>'
    );
    tr.append(td);

    td = $('<td/>');
    updateIdentityStatus(data.result[i].address, td);
    tr.append(td);

    var icon = '';
    if (data.result[i].flipAnswer != 'None') {
      if (data.result[i].respAnswer == data.result[i].flipAnswer) {
        icon = '<i class="icon icon--micro_success"></i>';
      } else {
        icon = '<i class="icon icon--micro_fail"></i>';
      }
    }

    if (data.result[i].respAnswer == 'Left') {
      leftAnswer++;
    }
    if (data.result[i].respAnswer == 'Right') {
      rightAnswer++;
    }
    if (data.result[i].respAnswer == 'None') {
      noneAnswer++;
    }

    var answerText =
      data.result[i].respAnswer == 'None'
        ? 'No answer'
        : data.result[i].respAnswer;
    tr.append('<td>' + icon + '<span>' + answerText + '<span></td>');

    if (data.result[i].respAnswer == 'None') {
      tr.append('<td>-</td>');
    } else {
      if (data.result[i].respWrongWords) {
        tr.append('<td>Reported</td>');
      } else {
        tr.append('<td>-</td>');
      }
    }
    table.append(tr);
  }

  //$('#InappropriateAnswers')[0].textContent = inappropriateAnswer;
  $('#LeftAnswers')[0].textContent = leftAnswer;
  $('#RightAnswers')[0].textContent = rightAnswer;
}

function updateFlipContent(data) {
  if (data.result == null) {
    return;
  }

  if (data.result.LeftOrder==null){
    $('#FlipTitle')[0].textContent = "Flip (encrypted content)"
  }

  //      $(".section_flips").removeClass('hidden');
  for (var i = 0; i < data.result.Pics.length; i++) {
    var buffArray = new Uint8Array(
      data.result.Pics[i]
        .substring(2)
        .match(/.{1,2}/g)
        .map(byte => parseInt(byte, 16))
    );
    var lposition = -1,
      rposition = -1;

    if (data.result.LeftOrder==null){
      lposition = (i==0?0:-1)
      rposition = (i==1?0:-1);
    } else {
      for (var j = 0; j < data.result.Pics.length; j++) {
        if (data.result.LeftOrder[j] == i) lposition = j;
        if (data.result.RightOrder[j] == i) rposition = j;
      }
    }

    var src = URL.createObjectURL(
      new Blob([buffArray], { type: 'image/jpeg' })
    );


    if (lposition >= 0) $('#FlipImageL' + lposition)[0].src = src;
    if (rposition >= 0) $('#FlipImageR' + rposition)[0].src = src;
  }
}
