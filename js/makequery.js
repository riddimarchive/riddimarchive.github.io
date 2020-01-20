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
		db.end((err) =>{
	  		if(err){
	    		console.log('cant end connecty');
	    		reject(err);
	  		}
	  		console.log('Connection ended yo');
	  		resolve();
  		});
	});
	return endpromise;

}


function getArtistInfo(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT * FROM artists WHERE artist_name = "${artist_name}"`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;

}

function getAllTracksFromArtist(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT * FROM tracks WHERE artist_name = "${artist_name}"`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}



module.exports = {
	connect: connect,
	end: end,
	getArtistInfo: getArtistInfo,
	getAllTracksFromArtist
};