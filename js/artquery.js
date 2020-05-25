function getArtistInfo(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT id, info, fb, sc, bc, beat, insta FROM artists WHERE artist_name = ?`, [artist_name], (error, result, fields) => {
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

function getAllArtistsAthroughD(db){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT artist_name FROM artists 
		WHERE artist_name >= "0" and artist_name < "E" 
		ORDER BY artist_name`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;

}

function getAllArtistsEthroughI(db){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT artist_name FROM artists 
		WHERE artist_name >= "E" and artist_name < "J" 
		ORDER BY artist_name`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;

}

function getAllArtistsJthroughO(db){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT artist_name FROM artists 
		WHERE artist_name >= "J" and artist_name < "P" 
		ORDER BY artist_name`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;

}

function getAllArtistsPthroughT(db){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT artist_name FROM artists 
		WHERE artist_name >= "P" and artist_name < "U" 
		ORDER BY artist_name`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;

}

function getAllArtistsUthroughZ(db){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT artist_name FROM artists 
		WHERE artist_name >= "U" 
		ORDER BY artist_name`, (error, result, fields) => {
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
		db.query(`SELECT artist_name FROM artists 
		WHERE artist_name LIKE ?`, [search_results], (error, result, fields) => {
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
		db.query(`SELECT artist_name FROM artists 
		WHERE crew LIKE ?`, [search_results], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;

}

function addArtist(db, artist_name, crew, country, info, face, sound, band, beat, insta){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`INSERT INTO artists (artist_name, crew, country, info, fb, sc, bc, beat, insta) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [artist_name, crew, country, info, face, sound, band, beat, insta], (error, result, fields) => {
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
		db.query(`DELETE FROM artists WHERE artist_name = ? LIMIT 1`, [artist_name], (error, result, fields) => {
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
	getAllArtistsAthroughD,
	getAllArtistsEthroughI,
	getAllArtistsJthroughO,
	getAllArtistsPthroughT,
	getAllArtistsUthroughZ,
	searchArtists,
	searchArtistsByCrew,
	addArtist,
	deleteArtist
};