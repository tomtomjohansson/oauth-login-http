const oauth2 = require('../').oauth2({
  resourceUri: 'https://graph.facebook.com/me?fields=picture,id,about,first_name,last_name,email',
  callbackUri: 'http://localhost:3000/callback',
  scope: 'email'
})(
  'id',
  'secret',
  'https://graph.facebook.com'
)

const http = require('http')

http.createServer((q, r) => {
  console.log(q.url)
  if (q.url === '/') {
    oauth2.auth((err, authUrl) => {
      if (err) return console.error(err, err.stack)
      r.writeHead(302, {
        location: authUrl
      })
      r.end()
    })
    return
  }

  if (q.url.match('/callback')) {
    oauth2.callback(q.url, (err, data) => {
      if (err) {
        console.log('401!!!!!!')
        r.writeHead(401, err)
        r.end()
        return
      }
      console.log(data)
      r.end()
    })
    return
  }

  r.end()
})
.listen(3000)
