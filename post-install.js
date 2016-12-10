const fs = require('fs')

const configTemplate = {
	"mysql": {
		"host"     : "127.0.0.1",
		"user"     : "root",
		"password" : "",
		"database" : "my_db"
	}	
}

if (! fs.existsSync('config.json')) {
	
	fs.writeFileSync('config.json', JSON.stringify(configTemplate, null, '\t'))
	
	console.info("Make sure to set your database configuration in config.json")
	
}