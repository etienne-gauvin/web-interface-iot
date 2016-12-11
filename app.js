"use strict";

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
    
    // Get data for the last day
    // and send it to the new client
    const sql = `
        SELECT *
        FROM data
        WHERE tdate > DATE_ADD(CURRENT_TIMESTAMP, INTERVAL '-1' HOUR)
    `
    
    db.query(sql, (err, rows, fields) => {
        
        console.info(`sending ${rows.length} entries to new client`)
        socket.emit('data', rows)
        
    })
    
    socket.on('disconnect', function () {
        
        console.info('client disconnected', socket.id)
            
    })
})

var previousRowCount = 0

// Main loop
const dataSendedLive = {}

setInterval(() => {
    
    db.query('SELECT COUNT(*) AS count FROM data', (err, rows, fields) => {
        
        if (err) {
            
            console.error(err)
            
        }
        
        else {
            
            // New row count
            const rowCount = (rows !== null && rows[0] !== null && rows[0].count !== null) ? rows[0].count : 0
            
            // If there are new value(s) in the list
            if (rowCount > previousRowCount) {
                
                previousRowCount = rowCount
                
                // Get data for the last X minutes
                const sql = `
                    SELECT *
                    FROM data
                    WHERE tdate > DATE_ADD(CURRENT_TIMESTAMP, INTERVAL '-30' MINUTE)
                `
                
                db.query(sql, (err, rows, fields) => {
                                
                    if (err) {
                        
                        console.error(err)
                        
                    }
                    
                    else {
                        
                        // For each row of the last X minutes
                        for (let i = 0; i < rows.length; i++) {
                            
                            
                            if (rows[i]) {
                                
                                let data = rows[i]
                                
                                // If the row hasn't been sent to clients yet
                                if (dataSendedLive[data.tdate] === undefined) {
                                    
                                    // Send it
                                    io.emit('live data', data)
                                    dataSendedLive[data.tdate] = data
                                    
                                    console.info(`sending live data to all clients (${data.tdate})`)
                                    
                                }
                                
                            }
                            
                        }
                        
                    }
                    
                })
                
            }
            
        }
        
    })
    
}, 1000)


module.exports = app
