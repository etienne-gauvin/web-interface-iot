"use strict";

const fs = require('fs')

const configTemplate = {
	"mysql": {
		"host"     : "127.0.0.1",
		"user"     : "root",
		"password" : "",
		"database" : "my_db"
	},
	
	"interval": 300
}

// If config.json does not exists
if (! fs.existsSync('config.json')) {
	
	fs.writeFileSync('config.json', JSON.stringify(configTemplate, null, '\t'))
	
	console.info("config.json has been created (make sure to set your database configuration in it)")
	
}

// If config.json already exists
else {
	
	const config = JSON.parse(fs.readFileSync('config.json'))
	
	// Upgrading the config
	const newConfig = recursiveUpgrade(config, configTemplate)
	
	fs.writeFileSync('config.json', JSON.stringify(newConfig, null, '\t'))
	
	console.info("config.json has been upgraded")
	
}

/**
 * Upgrade the object
 * (adding new keys, but keeping old values if already exists)
 * @param <Object> oldConfig
 * @param <Object> newConfig
 * @return <Object>
 */
function recursiveUpgrade(oldConfig, newConfig) {
	
	for (let key in oldConfig) {
		
		if (newConfig[key] !== undefined) {
			
			if (typeof oldConfig[key] === 'object') {
				
				newConfig[key] = recursiveUpgrade(oldConfig[key], newConfig[key])
				
			}
			
			else {
				
				newConfig[key] = oldConfig[key]
				
			}
			
		}
			
	}
	
	return newConfig

}