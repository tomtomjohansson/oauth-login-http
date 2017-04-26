const { OAuth2 } = require('oauth')
const url = require('url')

module.exports = oauth2

function oauth2 (options = {}) {
  if (!options.resourceUri) throw new Error('missing options.resourceUri')
  if (!options.callbackUri) throw new Error('missing options.callbackUri')
  options.scope = options.scope || ''
  options.responseType = options.responseType || 'code'
  options.grantType = options.grantType || 'authorization_code'
  return wrap(options)
}

function wrap (options) {
  return function () {
    const oa = new OAuth2(...arguments)

    return { auth: auth(oa), callback: callback(oa) }
  }

  function auth (oa) {
    return (cb) => {
      try {
        const authUrl = oa.getAuthorizeUrl({
          redirect_uri: options.callbackUri,
          scope: options.scope,
          response_type: options.responseType
        })
        cb(null, authUrl)
      } catch (e) {
        cb(e)
      }
    }
  }

  function callback (oa) {
    return (requestUri, cb) => {
      const urlParts = url.parse(requestUri, true)
      oa.getOAuthAccessToken(urlParts.query.code, { redirect_uri: options.callbackUri, grant_type: options.grantType },
        (err, token) => {
          if (err) return cb(err)
          oa.getProtectedResource(
            options.resourceUri,
            token,
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
    }
  }
}
