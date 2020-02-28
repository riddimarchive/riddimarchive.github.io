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

function getAllArtists(db){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT artist_name FROM artists`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;

}

function searchArtists(db, search_results){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT artist_name FROM artists WHERE artist_name LIKE '${search_results}%`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;

}

function searchArtistsByCrew(db, search_results){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT artist_name FROM artists WHERE crew LIKE '${search_results}%`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;

}

function addArtist(db, artist_name, crew, country, info){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`INSERT INTO artists (artist_name, crew, country, info) VALUES ("${artist_name}", "${crew}", "${country}", "${info}")`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function deleteArtist(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`DELETE FROM artists WHERE artist_name = "${artist_name}" LIMIT 1`, (error, result, fields) => {
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
	getArtistInfo,
	getAllArtists,
	searchArtists,
	searchArtistsByCrew,
	addArtist,
	deleteArtist
};