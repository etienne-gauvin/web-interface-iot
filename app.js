var express = require('express')
var http = require('http')
var socketIO = require('socket.io')
var path = require('path')

// Routes
var index = require('./routes/index')

// App
var app = express()
app.set('port', 3000)

// View engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

// Static files
app.use(express.static(path.join(__dirname, 'public')))

// Main page
app.use('/', index)

// Starting server
var httpServer = http.Server(app)

httpServer.listen(3000, function() {
	
  	console.log('listening on *:3000')
  	
})

// socket.io handler
var io = socketIO(httpServer)
io.on('connection', function(socket) {
	
	console.log('a user connected')

	socket.on('disconnect', function() {
		
	  	console.log('user disconnected')
	  	
	})
})

module.exports = app
