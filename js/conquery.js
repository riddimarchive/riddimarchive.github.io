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
		db.end(function(err) {
			console.log("conn ended")
		});
		//db.destroy();
		//console.log('conn destroyed');
		resolve();
	});
	return endpromise;

}

module.exports = {
	connect,
	end
};