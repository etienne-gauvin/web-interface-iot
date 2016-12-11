"use strict";

/**
 * Web Interface IoT Client
 */

(() => {
	
	const VALUES = [
		{
			name: 'temperature',
			dbfield: 'temp',
			label: 'Temperature',
			unit: '°C'
		},{
			name: 'altitude',
			dbfield: 'alt',
			label: 'Altitude',
			unit: 'm'
		},{
			name: 'pressure',
			dbfield: 'press',
			label: 'Pressure',
			unit: 'hPa'
		}
	]
	
	class WeatherStation {
		
		init() {
			
			this.period = +document.getElementById('period').innerHTML
			this.interval = +document.getElementById('interval').innerHTML
			
			this.axes = {
				time: []
			}
			
			// Charts array
			this.charts = {}
			
			for (let value of VALUES) {
				
				this.axes[value.name] = []
				
				const canvas = document.createElement('canvas')
				canvas.width = 500
				canvas.height = 200
				document.getElementsByTagName('body')[0].appendChild(canvas)
				
				const ctx = canvas.getContext('2d')
				
				this.charts[value.name] = new Chart(ctx, {
				    type: 'line',
				    data: {
				        labels: this.axes.time,
				        datasets: [{
				            label: `${value.name} (${value.unit})`,
				            data: this.axes[value.name]
				        }]
				    }
				})
			}
			
			this.dataReceived = []
			
			// IO connection
			this.socket = io()
	
			// Event listeners
			this.socket.on('all data', this.onAllData.bind(this))
			this.socket.on('live data', this.onLiveData.bind(this))

		}
	
		/**
		 * On connection
		 * display all data immediatly
		 * @param <Array> dataList
		 */
		onAllData(dataList) {
		
		    console.info('Setting all data', dataList)
	    	
	    	// Empty the arrays
	    	for (let a in this.axes) {
	    		this.axes[a].splice(0, this.axes[a].length)
	    	}
	    	
	    	// Compute all data from the last day
	    	// including "whites"
	    	const now = (new Date).getTime()
	    	const start = now - this.period * 1000
	    	
	    	console.info(new Date(start), new Date(now), this.interval)
	    	
	    	// For each interval
	    	for (let date = start; date < now; date += this.interval * 1000) {
	    		
	    		// In interval
	    		let dataCount = 0
	    		let dataSums = {}
	    		
	    		// Init sums
	    		for (let value of VALUES)
	    			dataSums[value.dbfield] = 0
	    		
	    		// Searching data in interval
	    		for (let data of dataList) {
	    			
	    			const dataDate = +(new Date(data.tdate))
	    			
	    			if (dataDate < date && dataDate >= date - this.interval * 1000) {
	    				
	    				dataCount++
	    				
			    		for (let value of VALUES)
			    			dataSums[value.dbfield] += data[value.dbfield]
			    		
	    			}
	    			
			    }
			    
			    const computedData = {
			    	tdate: date
			    }
			    
	    		for (let value of VALUES)
	    			computedData[value.dbfield] = null
			    
			    // If there is data for this interval
			    if (dataCount > 0) {
			    	
		    		for (let value of VALUES)
		    			computedData[value.dbfield] = dataSums[value.dbfield] / dataCount
			    	
			    }
			    
			    this.addData(computedData)
		    
	    	}
	    	
    		this.updateCharts()
	    	
		}
		
		/**
		 * 
		 */
		onLiveData (data) {
			
			this.addData(data)
			
    		this.updateCharts()
	   		
		}
		
		/**
		 * 
		 */
		updateCharts() {
			
    		for (let value of VALUES) {
    			
	    		this.charts[value.name].update()
		   		
    		}
	    	
		}
		
		/**
		 * Add data to the charts
		 */
		addData(data) {
			
			const date = new Date(data.tdate)
			
			let hour = date.getHours()
			if (hour < 10) hour = "0" + hour
			
			let minutes = date.getMinutes()
			if (minutes < 10) minutes = "0" + minutes
			
		    this.axes.time.push(`${hour}h${minutes}`)
			
			this.dataReceived[+(new Date(data.tdate))] = data
			
			
    		for (let value of VALUES) {
    			
		   		this.axes[value.name].push(data[value.dbfield])
		   		
    		}
			
		}
		
	}
	
	const station = new WeatherStation
	station.init()
	
})()