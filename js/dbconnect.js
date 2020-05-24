const mysql = require('mysql');

function createConnection(){
	const connecty = mysql.createConnection({
		host: process.env.DB_HOST,
		user: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME
	});
	return connecty;
}

module.exports = createConnection;
