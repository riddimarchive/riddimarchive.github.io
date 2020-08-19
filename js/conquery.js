const mysql = require('mysql');
function connect(db){

	let connectpromise = new Promise(function(resolve, reject){
		db.connect((err) => {
	  		if(err){
		    	console.log('ERROR COULD NOT CONNECT NERD');
		    	reject(err);
		  	}
			console.log('Connected to the DB!!!');
		  	resolve();
		});
	});
	return connectpromise;
}

function end(db){

	let endpromise = new Promise(function(resolve, reject){
		db.destroy();
		console.log('disconnected from the DB!!!');
		resolve();
	});
	return endpromise;

}

module.exports = {
	connect,
	end
};