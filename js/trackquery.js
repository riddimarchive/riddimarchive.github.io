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
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.collab_artist, tracks.original_artist, tracks.is_remix, tracks.is_collab, artists.crew, artists.country, artists.artist_name FROM tracks INNER JOIN artists ON tracks.artist_name = artists.artist_name WHERE tracks.artist_name = ? ORDER BY tracks.track_name`, [artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function getCollabsIncludingArtist(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.collab_artist, tracks.original_artist, tracks.is_remix, tracks.is_collab, artists.crew, artists.country, artists.artist_name FROM tracks INNER JOIN artists ON tracks.artist_name = artists.artist_name WHERE tracks.c1 = ? OR tracks.c2 = ? OR tracks.c3 = ? OR tracks.c4 = ? ORDER BY tracks.track_name`, [artist_name, artist_name, artist_name, artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function getTracksThatOthersRemixed(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.collab_artist, tracks.original_artist, tracks.is_remix, tracks.is_collab, artists.crew, artists.country, artists.artist_name FROM tracks INNER JOIN artists ON tracks.artist_name = artists.artist_name WHERE tracks.o1 = ? OR tracks.o2 = ? ORDER BY tracks.track_name`, [artist_name, artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function searchTunes(db, search_results, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT track_name, artist_name, drive_url, collab_artist, original_artist, is_remix, is_collab, id FROM tracks WHERE track_name LIKE ? AND artist_name = ? ORDER BY track_name`, [search_results, artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function searchTunesCollabRemix(db, search_results, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT track_name, artist_name, drive_url, collab_artist, original_artist, is_remix, is_collab, id FROM tracks WHERE (track_name LIKE ? AND c1 = ?) OR (track_name LIKE ? AND c2 = ?) OR (track_name LIKE ? AND c3 = ?) OR (track_name LIKE ? AND c4 = ?) OR (track_name LIKE ? AND o1 = ?) OR (track_name LIKE ? AND o2 = ?) ORDER BY track_name`, [search_results, artist_name, search_results, artist_name, search_results, artist_name, search_results, artist_name, search_results, artist_name, search_results, artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function searchFavorites(db, user_id, search_results){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.artist_name, tracks.track_name, tracks.drive_url, tracks.collab_artist, tracks.original_artist, tracks.is_remix, tracks.is_collab FROM tracks INNER JOIN userfavorites ON tracks.id = userfavorites.track_id WHERE userfavorites.user_id = ? AND tracks.track_name LIKE ? ORDER BY tracks.artist_name`, [user_id, search_results], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;

}

function searchFavoritesByArtist(db, user_id, search_results){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.artist_name, tracks.track_name, tracks.drive_url, tracks.collab_artist, tracks.original_artist, tracks.is_remix, tracks.is_collab FROM tracks INNER JOIN userfavorites ON tracks.id = userfavorites.track_id WHERE userfavorites.user_id = ? AND tracks.artist_name LIKE ? ORDER BY tracks.artist_name`, [user_id, search_results], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;

}

function searchFavoritesByArtistCollabRemix(db, user_id, search_results){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.artist_name, tracks.track_name, tracks.drive_url, tracks.collab_artist, tracks.original_artist, tracks.is_remix, tracks.is_collab FROM tracks INNER JOIN userfavorites ON tracks.id = userfavorites.track_id WHERE (userfavorites.user_id = ? AND c1 LIKE ?) OR (userfavorites.user_id = ? AND c2 LIKE ?) OR (userfavorites.user_id = ? AND c3 LIKE ?) OR (userfavorites.user_id = ? AND c4 LIKE ?) OR (userfavorites.user_id = ? AND o1 LIKE ?) OR (userfavorites.user_id = ? AND o2 LIKE ?) ORDER BY track_name`, [user_id, search_results, user_id, search_results, user_id, search_results, user_id, search_results, user_id, search_results, user_id, search_results], (error, result, fields) => {
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
		db.query(`SELECT id, artist_name, track_name, drive_url, collab_artist, original_artist, is_remix, is_collab from tracks ORDER BY RAND() LIMIT 1`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}



function addTrack(db, artist_id, artist_name, track_name, collab_artist, original_artist, drive_url, collab1, collab2, collab3, collab4, is_collab, og1, og2, is_remix, tune_of_week){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`INSERT INTO tracks(artist_id, artist_name, track_name, collab_artist, original_artist, drive_url, c1, c2, c3, c4, is_collab, o1, o2, is_remix, tune_of_week) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [artist_id, artist_name, track_name, collab_artist, original_artist, drive_url, collab1, collab2, collab3, collab4, is_collab, og1, og2, is_remix, tune_of_week], (error, result, fields) => {
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
	getCollabsIncludingArtist,
	getTracksThatOthersRemixed,
	searchTunes,
	searchTunesCollabRemix,
	searchFavorites,
	searchFavoritesByArtist,
	searchFavoritesByArtistCollabRemix,
	getRandomTrack,
	addTrack,
	deleteTrack
};