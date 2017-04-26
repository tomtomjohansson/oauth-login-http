const { OAuth } = require('oauth')
const url = require('url')

module.exports = oauth1

function oauth1 (options = {}) {
  if (!options.resourceUri) throw new Error('missing options.resourceUri')

  return wrap(options)
}

function wrap (options) {
  return function () {
    const oa = new OAuth(...arguments)

    return { auth: auth(oa), callback: callback(oa) }
  }

  function getRequestToken (oa, cb) {
    oa.getOAuthRequestToken({ scope: 'all' }, cb)
  }

  function auth (oa) {
    return (cb) => getRequestToken(oa, cb)
  }

  function callback (oa) {
    return (requestUri, cb) => {
      const urlParts = url.parse(requestUri, true)
      getRequestToken(oa, (err, token, secret, result) => {
        if (err) return cb(err)
        oa.getOAuthAccessToken(
          urlParts.query.oauth_token,
          secret,
          urlParts.query.oauth_verifier,
          (err, token, secret, result) => {
            if (err) return cb(err)
            oa.get(
              options.resourceUri,
              token,
              secret,
              (err, data) => {
                if (err) return cb(err)
                try {
                  cb(null, JSON.parse(data))
                } catch (e) {
                  cb(e)
                }
              }
            )
          }
        )
      })
    }
  }
}
