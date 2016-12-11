"use strict";

/**
 * Web Interface IoT Client
 */

(() => {
	
	const canvas = document.getElementById('chart')
	const ctx = canvas.getContext('2d')
	
	const dataReceived = {}
	const yAxis = []
	const xAxis = []
	
	const chart = new Chart(ctx, {
	    type: 'line',
	    data: {
	        labels: xAxis,
	        datasets: [{
	            label: "Temperature (°C)",
	            data: yAxis
	        }]
	    },
	    options: {
	        responsive: true
	    }
	})
	
	function addData(data) {
		
		const date = new Date(data.tdate)
		
	    yAxis.push(data.temp)
	    xAxis.push(`${date.getHours()}h${date.getMinutes()}`)
		
	}
	
	const socket = io()
	
	socket.on('data', (newData) => {
		
	    console.info('Data !', newData)
    	
    	// Empty the arrays
    	yAxis.splice(0, yAxis.length)
    	xAxis.splice(0, xAxis.length)
	    
	    for (let nd in newData) {
	    	
	    	const data = newData[nd]
	    	
		    addData(data)
		    
		    dataReceived[data.tdate] = data
		    
	    }
	    
	    chart.update()
	
	})
	
	socket.on('live data', (data) => {
		
    	
    	if (dataReceived[data.tdate] === undefined) {
    		
	    	console.info('Live data !', data)
		    
		    addData(data)
	    	
	    	chart.update()
		    
		    dataReceived[data.tdate] = data
		    
    	}
    	
    	else {
    		
	    	console.warn('Live data already received.', data)
    		
    	}
	    
	})
	
})()