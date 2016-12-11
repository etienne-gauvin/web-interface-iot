"use strict";

/**
 * Web Interface IoT Client
 */

(() => {
	
	const tcanvas = document.getElementById('tchart')
	const tctx = tcanvas.getContext('2d')
	
	const pcanvas = document.getElementById('pchart')
	const pctx = pcanvas.getContext('2d')
	
	const acanvas = document.getElementById('achart')
	const actx = acanvas.getContext('2d')
	
	const dataReceived = {}
	const xAxis = []
	const tyAxis = []
	const pyAxis = []
	const ayAxis = []
	
	const tchart = new Chart(tctx, {
	    type: 'line',
	    data: {
	        labels: xAxis,
	        datasets: [{
	            label: "Temperature (°C)",
	            data: tyAxis
	        }]
	    }
	})
	
	const pchart = new Chart(pctx, {
	    type: 'line',
	    data: {
	        labels: xAxis,
	        datasets: [{
	            label: "Pressure (hPa)",
	            data: pyAxis
	        }]
	    }
	})
	
	const achart = new Chart(actx, {
	    type: 'line',
	    data: {
	        labels: xAxis,
	        datasets: [{
	            label: "Altitude (m)",
	            data: ayAxis
	        }]
	    }
	})
	
	function addData(data) {
		
		const date = new Date(data.tdate)
	    xAxis.push(`${date.getHours()}h${date.getMinutes()}`)
		
	    tyAxis.push(data.temp)
	    pyAxis.push(data.press)
	    ayAxis.push(data.alt)
		
	}
	
	const socket = io()
	
	socket.on('data', (newData) => {
		
	    console.info('Data !', newData)
    	
    	// Empty the arrays
    	tyAxis.splice(0, tyAxis.length)
    	pyAxis.splice(0, pyAxis.length)
    	ayAxis.splice(0, ayAxis.length)
    	xAxis.splice(0, xAxis.length)
	    
	    for (let nd in newData) {
	    	
	    	const data = newData[nd]
	    	
		    addData(data)
		    
		    dataReceived[data.tdate] = data
		    
	    }
	    
	    tchart.update()
	    pchart.update()
	    achart.update()
	
	})
	
	socket.on('live data', (data) => {
		
    	
    	if (dataReceived[data.tdate] === undefined) {
    		
	    	console.info('Live data !', data)
		    
		    addData(data)
	    	
	    	tchart.update()
	    	pchart.update()
	    	achart.update()
	    	
	    	document.querySelector('.temperature output').innerHTML = (data.temp || '--') + " °C"
	    	document.querySelector('.pressure output').innerHTML = (data.press || '--') + " hPa"
	    	document.querySelector('.altitude output').innerHTML = (data.alt || '--') + " m"
		    
		    dataReceived[data.tdate] = data
		    
    	}
    	
    	else {
    		
	    	console.warn('Live data already received.', data)
    		
    	}
	    
	})
	
})()