const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
const path = require('path')

// Routes
const index = require('./routes/index')

// App
const app = express()
app.set('port', 3000)

// View engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

// Static files
app.use(express.static(path.join(__dirname, 'public')))

// Main page
app.use('/', index)

// Starting server
const httpServer = http.Server(app)

httpServer.listen(3000, function() {
	
  	console.log('listening on *:3000')
  	
})

// socket.io handler
const io = socketIO(httpServer)
io.on('connection', function(socket) {
	
	console.log('a user connected')

	socket.on('disconnect', function() {
		
	  	console.log('user disconnected')
	  	
	})
})

module.exports = app
