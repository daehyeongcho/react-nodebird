const express = require('express')
const app = express()

const routes = require('./routes')

require('dotenv').config()

app.set('port', process.env.PORT || 3065)

app.use('/', routes)

app.listen(app.get('port'), () => {
	console.log(`server listening on ${app.get('port')}`)
})
