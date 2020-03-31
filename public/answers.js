function initIdentityAnswers(identity, epoch) {
  getIdentityAnswersData(identity, epoch - 1);
  $('#IdentityAddress')[0].textContent = identity;
  $('#EpochId')[0].textContent = epochFmt(epoch);

  $('#DetailsEpochId')[0].textContent = epochFmt(epoch);
  $('#DetailsEpochId')[0].href = './validation?epoch=' + epoch;

  $('#DetailsIdentityId')[0].textContent = identity.substr(0, 35) + '...';
  $('#DetailsIdentityId')[0].href = './identity?identity=' + identity;

  $('#IdentityAvatar img')[0].src =
    'https://robohash.org/' + identity.toLowerCase();

  $('#RewardsPaidLink')[0].href =
    './reward?epoch=' + epoch + '&identity=' + identity;
}

function getIdentityAnswersData(identiy, epoch) {
  var u = url + 'Epoch/' + epoch + '/Identity/' + identiy;
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateIdentityAnswersData(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  var u = url + 'Epoch/' + epoch + '/Identity/' + identiy + '/Answers/Long';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateIdentityLongAnswersData(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });

  var u = url + 'Epoch/' + epoch + '/Identity/' + identiy + '/Answers/Short';
  $.ajax({
    url: u,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      updateIdentityShortAnswersData(data);
    },
    error: function(request, error) {
      console.error(u + ', error:' + error);
    }
  });
}

function updateIdentityShortAnswersData(data) {
  if (data.result == null) {
    return;
  }
  var table = $('#ShortAnswersTable');
  updateAnswersData(data, table);
}

function updateIdentityLongAnswersData(data) {
  var table = $('#LongAnswersTable');
  updateAnswersData(data, table);
}

function updateAnswersData(data, table) {
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
      '<div class="user-pic"><img src="./images/flip_icn.png' +
        '" alt="pic"width="44"></div>'
    );
    var cid = data.result[i].cid;
    td.append(
      "<div class='text_block text_block--ellipsis'><a href='./flip?flip=" +
        cid +
        "'>" +
        cid.substr(0, 35) +
        '...</a></div>'
    );
    tr.append(td);
    tr.append(
      '<td>' +
        (data.result[i].flipAnswer == 'None'
          ? '-'
          : data.result[i].flipAnswer) +
        '</td>'
    );

    var score = '0';
    var ico = data.result[i].respAnswer == 'None' ? '' : 'icon--micro_fail';

    if (data.result[i].flipStatus == 'Qualified') {
      if (data.result[i].flipAnswer == data.result[i].respAnswer) {
        score = 1;
        ico = 'icon--micro_success';
      }
    } else {
      if (data.result[i].flipStatus == 'WeaklyQualified') {
        if (data.result[i].flipAnswer == data.result[i].respAnswer) {
          score = 1;
          ico = 'icon--micro_success';
        } else {
          if (data.result[i].respAnswer != 'None') {
            score = '0.5';
            ico = '';
          } else {
            score = '-';
            ico = '';
          }
        }
      } else {
        score = '-';
        ico = '';
      }
    }

    tr.append(
      '<td>' +
        (data.result[i].flipStatus == 'Qualified'
          ? 'Strong'
          : data.result[i].flipStatus == 'WeaklyQualified'
          ? 'Weak'
          : 'No consensus') +
        '</td>'
    );

    var td = $('<td/>');
    td.append("<i class='icon " + ico + "'>");
    td.append(
      '<span>' +
        (data.result[i].respAnswer == 'None'
          ? '-'
          : data.result[i].respAnswer) +
        '</span>'
    );
    tr.append(td);

    tr.append('<td>' + score + '</td>');

    tr.append(
      '<td>' + (data.result[i].respWrongWords ? 'Reported' : '-') + '</td>'
    );

    table.append(tr);
  }
}

function updateIdentityAnswersData(data) {
  if (data.result == null) {
    return;
  }

  if (data.result.state == 'Human') {
    $('#IdentityAvatar div').append('<i class="icon icon--status"></i>');
  }

  if (
    data.result.state == 'Newbie' ||
    data.result.state == 'Verified' ||
    data.result.state == 'Human'
  ) {
    $('#ValidationStatus')[0].textContent = 'Successful validation';
  } else {
    $('#ValidationStatus')[0].textContent = 'Validation failed';
    $('#RewardsPaidLink').addClass('hidden');
  }

  if (data.result.prevState == 'Invite') {
    $('#ValidationAllowed')[0].textContent = 'No (invitation is not activated)';
  } else {
    if (data.result.madeFlips >= data.result.requiredFlips) {
      $('#ValidationAllowed')[0].textContent = 'Yes';
    } else {
      $('#ValidationAllowed')[0].textContent =
        'No (flips are missing: ' +
        data.result.madeFlips +
        ' out of ' +
        data.result.requiredFlips +
        ')';
    }
  }

  $('#AfterValidationStatus')[0].textContent = identityStatusFmt(
    data.result.state
  );
  $('#BeforeValidationStatus')[0].textContent = identityStatusFmt(
    data.result.prevState
  );

  $('#IdentityShortAnswers')[0].textContent =
    data.result.shortAnswers.point +
    ' / ' +
    data.result.shortAnswers.flipsCount;
  if (data.result.shortAnswers.flipsCount > 0)
    $('#IdentityShortScore')[0].textContent =
      precise2(
        (data.result.shortAnswers.point / data.result.shortAnswers.flipsCount) *
          100
      ) + '%';

  $('#IdentityLongAnswers')[0].textContent =
    data.result.longAnswers.point + ' / ' + data.result.longAnswers.flipsCount;
  if (data.result.longAnswers.flipsCount > 0)
    $('#IdentityLongScore')[0].textContent =
      precise2(
        (data.result.longAnswers.point / data.result.longAnswers.flipsCount) *
          100
      ) + '%';

  if (data.result.missed) {
    if (data.result.shortAnswers.flipsCount > 0) {
      $('#ValidationResult')[0].textContent = 'Late submission';
      $('#ShortInTime')[0].textContent = 'Late';
      $('#LongInTime')[0].textContent = 'Late';
    } else {
      $('#ValidationResult')[0].textContent = 'Missed validation';
      if (data.result.approved) {
        $('#ShortInTime')[0].textContent = 'Not accomplished';
        $('#LongInTime')[0].textContent = 'No answers';
      } else {
        $('#ShortInTime')[0].textContent = 'Missing';
        $('#LongInTime')[0].textContent = 'Missing';
      }
    }
  } else {
    if (
      data.result.state == 'Newbie' ||
      data.result.state == 'Verified' ||
      data.result.state == 'Human'
    ) {
      $('#ValidationResult')[0].textContent = 'Successful';
    } else {
      $('#ValidationResult')[0].textContent = 'Wrong answers';
    }
    $('#ShortInTime')[0].textContent = 'In time';
    $('#LongInTime')[0].textContent = 'In time';
  }
}
