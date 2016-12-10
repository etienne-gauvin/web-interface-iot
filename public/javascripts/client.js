"use strict";

/**
 * Web Interface IoT Client
 */

(() => {
	
	const canvas = document.getElementById('chart')
	const ctx = canvas.getContext('2d')
	
	const allData = []
	const allLabels = []
	
	const chart = new Chart(ctx, {
	    type: 'line',
	    data: {
	        labels: allLabels,
	        datasets: [{
	            label: "Temperature (°C)",
	            data: allData
	        }]
	    },
	    options: {
	        responsive: true
	    }
	})
	
	const socket = io()
	
	socket.on('data', (newData) => {
		
	    console.info('Data update !', newData)
    	
    	// Empty the arrays
    	allData.splice(0, allData.length)
    	allLabels.splice(0, allLabels.length)
	    
	    for (let nd in newData) {
	    	
		    allData.push(newData[nd].temp)
		    allLabels.push(newData[nd].tdate)
		    
	    }
	    
	    chart.update()
	
	})
	
})()