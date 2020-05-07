function initSignin(callback_url) {
  // Check if already signed in
  if (getUserAddress() != null) {
    $('#StartingAppBlock').addClass('hidden');
    $('#SuccessBlock').removeClass('hidden');
    return;
  }

  $('#SignInWithIdena img').addClass('hidden');
  $('#SignInWithIdena .spinner').removeClass('hidden');

  const token = getSessionToken();
  //Save token
  Cookies.set('sessionToken', token);

  const host =
    location.protocol +
    '//' +
    location.hostname +
    (location.port ? ':' + location.port : '');

  const callbackUrl =
    // TODO: remove false when client supports callback_url with params
    false && callback_url !== undefined && callback_url != ''
      ? callback_url
      : host;

  const favIconUrl = host + '/favicon.ico';
  const dnaUrl = getDnaUrl(token, callbackUrl, favIconUrl);
  console.log(dnaUrl);
  window.location = dnaUrl;

  setTimeout(function () {
    $('#SignInWithIdena img').removeClass('hidden');
    $('#SignInWithIdena .spinner').addClass('hidden');

    if (getUserAddress() != null) {
      $('#StartingAppBlock').addClass('hidden');
      $('#SuccessBlock').removeClass('hidden');
      return;
    }

    $('#StartingAppBlock').addClass('hidden');
    $('#WelcomeBlock').removeClass('hidden');
  }, 15000);
}

const getSessionToken = () =>
  // Generate random session token
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c, r) =>
    ('x' == c ? (r = (Math.random() * 16) | 0) : (r & 0x3) | 0x8).toString(16)
  );

function getDnaUrl(token, callbackUrl, favIconUrl) {
  //Generate url for Idena app
  const dnaUrl =
    'dna://signin/v1?callback_url=' +
    callbackUrl +
    '&token=' +
    token +
    '&nonce_endpoint=' +
    encodeURIComponent('https://scan.idena.io/auth/v1/start-session') +
    '&authentication_endpoint=' +
    encodeURIComponent('https://scan.idena.io/auth/v1/authenticate') +
    '&favicon_url=' +
    encodeURIComponent(favIconUrl);

  return dnaUrl;
}
