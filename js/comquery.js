function getAllCommentsByArtistName(db, artist_name){
	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT comments.comment, comments.track_id, comments.user_id, comments.username, comments.time FROM comments INNER JOIN artists ON artists.id = comments.artist_id WHERE artists.artist_name = ?`, [artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function getAllCommentsByTrack(db, artist_name){
	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT comments.comment, comments.track_id, comments.user_id, comments.username, comments.time, tracks.id FROM comments INNER JOIN tracks ON tracks.id = comments.track_id WHERE tracks.artist_name = ?`, [artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function getAllCommentsByTrackName(db, track_name){
	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT comments.comment, comments.track_id, comments.user_id, comments.username, comments.time, tracks.id FROM comments INNER JOIN tracks ON tracks.id = comments.track_id WHERE tracks.track_name = ?`, [track_name], (error, result, fields) => {
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
	getAllCommentsByArtistName,
	getAllCommentsByTrack,
	getAllCommentsByTrackName
};