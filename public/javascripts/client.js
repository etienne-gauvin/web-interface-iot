/**
 * Web Interface IoT Client
 */

(() => {
	
	var socket = io()
	
	socket.on('data', (data) => {
		
	    console.info('Data update !', data)
	
	})
	
})()