// test connection to database with nodejs


const mysql = require('mysql');

const connecty = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME
});

connecty.connect((err) => {
	if(err){
		console.log('ERROR COULD NOT CONNECT NERD');
		return;
	}
	console.log('Connected');
});

connecty.end((err) =>{
	console.log('cant end connecty');
});
