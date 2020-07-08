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

function getTrackbyID(db, id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT * FROM tracks WHERE id = ?`, [id], (error, result, fields) => {
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
		db.query(`SELECT * FROM tracks WHERE tune_of_week = "1" AND is_secret = "0"`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function getAllHeartsOnTrack(db, track_id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT hearts.user_id FROM hearts WHERE hearts.track_id = ?`, [track_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

/////////////////////////////
function getAllTracksFromArtist(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab, artists.crew, artists.country, artists.artist_name FROM tracks 
		INNER JOIN artists ON tracks.artist_name = artists.artist_name 
		WHERE tracks.artist_name = ? AND tracks.is_secret = "0"
		ORDER BY tracks.track_name`, [artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function getAllTracksAthroughD(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab, artists.crew, artists.country, artists.artist_name FROM tracks 
		INNER JOIN artists ON tracks.artist_name = artists.artist_name 
		WHERE tracks.artist_name = ? AND tracks.track_name >= "0" AND tracks.track_name < "E" AND tracks.is_secret = "0"
		ORDER BY tracks.track_name`, [artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function getAllTracksEthroughI(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab, artists.crew, artists.country, artists.artist_name FROM tracks 
		INNER JOIN artists ON tracks.artist_name = artists.artist_name 
		WHERE tracks.artist_name = ? AND tracks.track_name >= "E" AND tracks.track_name < "J" AND tracks.is_secret = "0"
		ORDER BY tracks.track_name`, [artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function getAllTracksJthroughO(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab, artists.crew, artists.country, artists.artist_name FROM tracks 
		INNER JOIN artists ON tracks.artist_name = artists.artist_name 
		WHERE tracks.artist_name = ? AND tracks.track_name >= "J" AND tracks.track_name < "P" AND tracks.is_secret = "0"
		ORDER BY tracks.track_name`, [artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function getAllTracksPthroughT(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab, artists.crew, artists.country, artists.artist_name FROM tracks 
		INNER JOIN artists ON tracks.artist_name = artists.artist_name 
		WHERE tracks.artist_name = ? AND tracks.track_name >= "P" AND tracks.track_name < "U" AND tracks.is_secret = "0"
		ORDER BY tracks.track_name`, [artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function getAllTracksUthroughZ(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab, artists.crew, artists.country, artists.artist_name FROM tracks 
		INNER JOIN artists ON tracks.artist_name = artists.artist_name 
		WHERE tracks.artist_name = ? AND tracks.track_name >= "U" AND tracks.is_secret = "0"
		ORDER BY tracks.track_name`, [artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}
//////////////////////////////////////
function getCollabsIncludingArtist(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab, artists.crew, artists.country, artists.artist_name FROM tracks 
		INNER JOIN artists ON tracks.artist_name = artists.artist_name 
		WHERE (tracks.c1 = ? OR tracks.c2 = ? OR tracks.c3 = ? OR tracks.c4 = ?) AND tracks.is_secret = "0" 
		ORDER BY tracks.track_name`, [artist_name, artist_name, artist_name, artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function getCollabsIncludingArtistAthroughD(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab, artists.crew, artists.country, artists.artist_name FROM tracks 
		INNER JOIN artists ON tracks.artist_name = artists.artist_name 
		WHERE (tracks.track_name >= "0" AND tracks.track_name < "E") AND (tracks.c1 = ? OR tracks.c2 = ? OR tracks.c3 = ? OR tracks.c4 = ?) AND tracks.is_secret = "0"
		ORDER BY tracks.track_name`, [artist_name, artist_name, artist_name, artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function getCollabsIncludingArtistEthroughI(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab, artists.crew, artists.country, artists.artist_name FROM tracks 
		INNER JOIN artists ON tracks.artist_name = artists.artist_name 
		WHERE (tracks.track_name >= "E" AND tracks.track_name < "J") AND (tracks.c1 = ? OR tracks.c2 = ? OR tracks.c3 = ? OR tracks.c4 = ?) AND tracks.is_secret = "0"
		ORDER BY tracks.track_name`, [artist_name, artist_name, artist_name, artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function getCollabsIncludingArtistJthroughO(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab, artists.crew, artists.country, artists.artist_name FROM tracks 
		INNER JOIN artists ON tracks.artist_name = artists.artist_name 
		WHERE (tracks.track_name >= "J" AND tracks.track_name < "P") AND (tracks.c1 = ? OR tracks.c2 = ? OR tracks.c3 = ? OR tracks.c4 = ?) AND tracks.is_secret = "0"
		ORDER BY tracks.track_name`, [artist_name, artist_name, artist_name, artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function getCollabsIncludingArtistPthroughT(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab, artists.crew, artists.country, artists.artist_name FROM tracks 
		INNER JOIN artists ON tracks.artist_name = artists.artist_name 
		WHERE (tracks.track_name >= "P" AND tracks.track_name < "U") AND (tracks.c1 = ? OR tracks.c2 = ? OR tracks.c3 = ? OR tracks.c4 = ?) AND tracks.is_secret = "0"
		ORDER BY tracks.track_name`, [artist_name, artist_name, artist_name, artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function getCollabsIncludingArtistUthroughZ(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab, artists.crew, artists.country, artists.artist_name FROM tracks 
		INNER JOIN artists ON tracks.artist_name = artists.artist_name 
		WHERE (tracks.track_name >= "U") AND (tracks.c1 = ? OR tracks.c2 = ? OR tracks.c3 = ? OR tracks.c4 = ?) AND tracks.is_secret = "0"
		ORDER BY tracks.track_name`, [artist_name, artist_name, artist_name, artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

////////////////////////////////////////

function getTracksThatOthersRemixed(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab, artists.crew, artists.country, artists.artist_name FROM tracks 
		INNER JOIN artists ON tracks.artist_name = artists.artist_name 
		WHERE (tracks.o1 = ? OR tracks.o2 = ?) AND tracks.is_secret = "0" 
		ORDER BY tracks.track_name`, [artist_name, artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function getTracksThatOthersRemixedAthroughD(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab, artists.crew, artists.country, artists.artist_name 
		FROM tracks INNER JOIN artists ON tracks.artist_name = artists.artist_name 
		WHERE (tracks.track_name >= "0" AND tracks.track_name < "E") AND (tracks.o1 = ? OR tracks.o2 = ?) AND tracks.is_secret = "0"
		ORDER BY tracks.track_name`, [artist_name, artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function getTracksThatOthersRemixedEthroughI(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab, artists.crew, artists.country, artists.artist_name 
		FROM tracks INNER JOIN artists ON tracks.artist_name = artists.artist_name 
		WHERE (tracks.track_name >= "E" AND tracks.track_name < "J") AND (tracks.o1 = ? OR tracks.o2 = ?) AND tracks.is_secret = "0"
		ORDER BY tracks.track_name`, [artist_name, artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function getTracksThatOthersRemixedJthroughO(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab, artists.crew, artists.country, artists.artist_name 
		FROM tracks INNER JOIN artists ON tracks.artist_name = artists.artist_name 
		WHERE (tracks.track_name >= "J" AND tracks.track_name < "P") AND (tracks.o1 = ? OR tracks.o2 = ?) AND tracks.is_secret = "0"
		ORDER BY tracks.track_name`, [artist_name, artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function getTracksThatOthersRemixedPthroughT(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab, artists.crew, artists.country, artists.artist_name 
		FROM tracks INNER JOIN artists ON tracks.artist_name = artists.artist_name 
		WHERE (tracks.track_name >= "P" AND tracks.track_name < "U") AND (tracks.o1 = ? OR tracks.o2 = ?) AND tracks.is_secret = "0"
		ORDER BY tracks.track_name`, [artist_name, artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function getTracksThatOthersRemixedUthroughZ(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab, artists.crew, artists.country, artists.artist_name 
		FROM tracks INNER JOIN artists ON tracks.artist_name = artists.artist_name 
		WHERE (tracks.track_name >= "U") AND (tracks.o1 = ? OR tracks.o2 = ?) AND tracks.is_secret = "0"
		ORDER BY tracks.track_name`, [artist_name, artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}
/////////////////////////////
function searchTunes(db, search_results, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT track_name, artist_name, drive_url, short_name, is_remix, is_collab, id FROM tracks 
		WHERE short_name LIKE ? AND artist_name = ? AND is_secret = "0"
		ORDER BY short_name`, [search_results, artist_name], (error, result, fields) => {
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
		db.query(`SELECT track_name, artist_name, drive_url, short_name, is_remix, is_collab, id FROM tracks 
		WHERE ((short_name LIKE ? AND c1 = ?) OR (short_name LIKE ? AND c2 = ?) OR (short_name LIKE ? AND c3 = ?) 
		OR (short_name LIKE ? AND c4 = ?) OR (short_name LIKE ? AND o1 = ?) OR (short_name LIKE ? AND o2 = ?)) AND is_secret = "0"
		ORDER BY short_name`, [search_results, artist_name, search_results, artist_name, search_results, artist_name, search_results, artist_name, search_results, artist_name, search_results, artist_name], (error, result, fields) => {
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
		db.query(`SELECT tracks.id, tracks.artist_name, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab FROM tracks 
		INNER JOIN userfavorites ON tracks.id = userfavorites.track_id 
		WHERE userfavorites.user_id = ? AND tracks.short_name LIKE ? AND tracks.is_secret = "0"
		ORDER BY tracks.short_name`, [user_id, search_results], (error, result, fields) => {
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
		db.query(`SELECT tracks.id, tracks.artist_name, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab FROM tracks 
		INNER JOIN userfavorites ON tracks.id = userfavorites.track_id 
		WHERE userfavorites.user_id = ? AND tracks.artist_name LIKE ? AND tracks.is_secret = "0"
		ORDER BY tracks.short_name`, [user_id, search_results], (error, result, fields) => {
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
		db.query(`SELECT tracks.id, tracks.artist_name, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab FROM tracks 
		INNER JOIN userfavorites ON tracks.id = userfavorites.track_id 
		WHERE ((userfavorites.user_id = ? AND c1 LIKE ?) OR (userfavorites.user_id = ? AND c2 LIKE ?) OR (userfavorites.user_id = ? AND c3 LIKE ?) 
		OR (userfavorites.user_id = ? AND c4 LIKE ?) OR (userfavorites.user_id = ? AND o1 LIKE ?) OR (userfavorites.user_id = ? AND o2 LIKE ?)) AND tracks.is_secret = "0"
		ORDER BY short_name`, [user_id, search_results, user_id, search_results, user_id, search_results, user_id, search_results, user_id, search_results, user_id, search_results], (error, result, fields) => {
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
		db.query(`SELECT id, artist_name, track_name, drive_url, is_remix, is_collab FROM tracks WHERE is_secret = "0" ORDER BY RAND() LIMIT 1`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}



function addTrack(db, artist_id, artist_name, track_name, short_name, drive_url, collab1, collab2, collab3, collab4, is_collab, og1, og2, is_remix, is_secret, secret_pass, aws_key, tune_of_week){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`INSERT INTO tracks(artist_id, artist_name, track_name, short_name, drive_url, c1, c2, c3, c4, is_collab, o1, o2, is_remix, is_secret, secret_pass, aws_key, tune_of_week) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [artist_id, artist_name, track_name, short_name, drive_url, collab1, collab2, collab3, collab4, is_collab, og1, og2, is_remix, is_secret, secret_pass, aws_key, tune_of_week], (error, result, fields) => {
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

function getRecentTracksFromFollowedArtist(db, user_id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab, tracks.time FROM tracks 
		INNER JOIN follows ON follows.artist_name = tracks.artist_name 
		WHERE tracks.is_secret = "0" AND follows.user_id = ? AND tracks.time between date_sub(now(),INTERVAL 1 WEEK) and now()
		ORDER BY tracks.time DESC`, [user_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function getRecentCollabsFromFollowedArtist(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab, tracks.time FROM tracks 
		WHERE tracks.is_secret = "0" AND tracks.time between date_sub(now(),INTERVAL 1 WEEK) and now()
		AND (tracks.c1 = ? OR tracks.c2 = ? OR tracks.c3 = ? OR tracks.c4 = ?)
		ORDER BY tracks.time DESC`, [artist_name, artist_name, artist_name, artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});


	});

	return querypromise;
}

function getRecentRemixesFromFollowedArtist(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT tracks.id, tracks.track_name, tracks.drive_url, tracks.short_name, tracks.is_remix, tracks.is_collab, tracks.time FROM tracks 
		WHERE tracks.is_secret = "0" AND tracks.time between date_sub(now(),INTERVAL 1 WEEK) and now()
		AND (tracks.o1 = ? OR tracks.o2 = ?)
		ORDER BY tracks.time DESC`, [artist_name, artist_name], (error, result, fields) => {
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
	getTrackbyID,
	getTracksOfTheWeek,
	getAllHeartsOnTrack,
	getAllTracksFromArtist,
	getAllTracksAthroughD,
	getAllTracksEthroughI,
	getAllTracksJthroughO,
	getAllTracksPthroughT,
	getAllTracksUthroughZ,
	getCollabsIncludingArtist,
	getCollabsIncludingArtistAthroughD,
	getCollabsIncludingArtistEthroughI,
	getCollabsIncludingArtistJthroughO,
	getCollabsIncludingArtistPthroughT,
	getCollabsIncludingArtistUthroughZ,
	getTracksThatOthersRemixed,
	getTracksThatOthersRemixedAthroughD,
	getTracksThatOthersRemixedEthroughI,
	getTracksThatOthersRemixedJthroughO,
	getTracksThatOthersRemixedPthroughT,
	getTracksThatOthersRemixedUthroughZ,
	searchTunes,
	searchTunesCollabRemix,
	searchFavorites,
	searchFavoritesByArtist,
	searchFavoritesByArtistCollabRemix,
	getRandomTrack,
	addTrack,
	deleteTrack,
	getRecentTracksFromFollowedArtist,
	getRecentCollabsFromFollowedArtist,
	getRecentRemixesFromFollowedArtist
};