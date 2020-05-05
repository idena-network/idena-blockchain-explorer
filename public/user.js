function getUserAddress() {
  //Check if already signed-in
  const tokenAuthorised = localStorage.getItem('sessionTokenAuthorised');
  const userAddress = localStorage.getItem('userAddress');

  if (tokenAuthorised && userAddress) {
    return userAddress;
  }
  return null;
}

function initUser() {
  //Check if already signed-in
  const userAddress = getUserAddress();

  if (userAddress != null) {
    updateCurrentUser(userAddress);
  } else {
    // Check if new sessionToken is available
    const token = Cookies.get('sessionToken');
    if (token !== undefined) {
      //Get user address
      $.ajax({
        url: 'https://scan.idena.io/auth/v1/get-account?token=' + token,
        type: 'GET',
        dataType: 'json',
        success: function (resp) {
          if (resp.success) {
            const address = resp.data.address;

            localStorage.setItem('sessionTokenAuthorised', token);
            localStorage.setItem('userAddress', address);

            Cookies.remove('sessionToken');
            updateCurrentUser(address);
          } else {
            updateCurrentUser(null);
          }
        },
        error: function (request, error) {
          console.error('/auth/ error:' + error);
          updateCurrentUser(null);
        },
      });
    } else {
      updateCurrentUser(null);
    }
  }
}

function updateCurrentUser(address) {
  if (address == null) {
    //Not logged in
    $('#currentUser').addClass('hidden');

    const callbackURL =
      window.location.pathname != '/signin' ? encodeURIComponent(window.location) : '';
    $('#SignInWithIdena')[0].href = './signin?callback_url=' + callbackURL;

    $('#SignInWithIdena').removeClass('hidden');
  } else {
    //Logged in
    $('#SignInWithIdena').addClass('hidden');

    $('#currentUser').removeClass('hidden');
    $('#currentUser')[0].href = './address?address=' + address;
    $('#currentUser img').attr(
      'src',
      'https://robohash.org/' + address.toLowerCase()
    );

    $('#MyAddressMenu').on('click', () => {
      location.href = './address?address=' + address;
    });
  }
}

$('#LogOutMenu').click(function () {
  const tokenData = JSON.stringify({
    token: localStorage.getItem('sessionTokenAuthorised') || '',
  });

  $.ajax({
    url: 'https://scan.idena.io/auth/v1/logout',
    type: 'POST',
    dataType: 'json',
    contentType: 'application/json',
    data: tokenData,
    success: function (resp) {
      localStorage.removeItem('sessionTokenAuthorised');
      localStorage.removeItem('userAddress');
      updateCurrentUser(null);
    },
    error: function (request, error) {
      console.error('/logout/ error:' + error);
    },
  });
});

$('#currentUser').click(function () {
  $(this).attr('tabindex', 1).focus();
  $(this).find('.dropdown-menu').slideToggle(50);
});

$('#currentUser').focusout(function () {
  setTimeout(function () {
    $('.dropdown-menu').slideUp(50);
  }, 100);
});
