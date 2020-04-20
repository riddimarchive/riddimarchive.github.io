function getTrackInfo(db, track_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT * FROM tracks WHERE track_name = ?`, [track_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;

}

function getTracksOfTheWeek(db){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT * FROM tracks WHERE tune_of_week = "1"`, (error, result, fields) => {
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
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, artists.crew, artists.country, artists.artist_name FROM tracks INNER JOIN artists ON tracks.artist_name = artists.artist_name WHERE tracks.artist_name = ?`, [artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function getRandomTrack(db){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT id, artist_name, track_name, drive_url from tracks ORDER BY RAND() LIMIT 1`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}



function addTrack(db, artist_id, artist_name, track_name, collab_artist, drive_url){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`INSERT INTO tracks(artist_id, artist_name, track_name, collab_artist, drive_url) VALUES (?, ?, ?, ?, ?)`, [artist_id, artist_name, track_name, collab_artist, drive_url], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function deleteTrack(db, track_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`DELETE FROM tracks WHERE track_name = ? LIMIT 1`, [track_name], (error, result, fields) => {
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
	getTrackInfo,
	getTracksOfTheWeek,
	getAllTracksFromArtist,
	getRandomTrack,
	addTrack,
	deleteTrack
};