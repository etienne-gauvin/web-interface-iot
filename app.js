const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
const path = require('path')
const mysql = require('mysql')
const config = require('./config')

// Database
const db = mysql.createConnection(config.mysql)
db.connect()

// Routes
const index = require('./routes/index')

// Data
var data = {}

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
    
    console.info('listening on *:3000')
        
})

// socket.io handler
const io = socketIO(httpServer)
io.on('connection', function (socket) {
    
    console.info('a client connected', socket.id)
    
    socket.emit('data', data)
    
    socket.on('disconnect', function () {
        
        console.info('client disconnected', socket.id)
            
    })
})

// Main loop
var previousRowCount = 0

setInterval(() => {
    
    db.query('SELECT COUNT(*) AS count FROM data', (err, rows, fields) => {
        
        if (err) {
            
            console.error(err)
            
        }
        
        else {
            
            // New row count
            const rowCount = (rows !== null && rows[0] !== null && rows[0].count !== null) ? rows[0].count : 0
            
            // If there is new value(s) in the list
            if (rowCount > previousRowCount) {
                
                console.log("data update")
                
                previousRowCount = rowCount
                
                db.query('SELECT * FROM data', (err, rows, fields) => {
                    
                    data = rows
                    io.emit('data', rows)
                    
                })
                
            }
            
        }
        
    })
    
}, config.interval || 300)


module.exports = app
