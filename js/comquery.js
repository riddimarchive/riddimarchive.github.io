function getAllCommentsByArtistName(db, artist_name){
	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT comments.comment, comments.track_id, comments.user_id, comments.username, comments.time FROM comments 
		INNER JOIN artists ON artists.id = comments.artist_id 
		WHERE artists.artist_name = ? 
		ORDER BY comments.time`, [artist_name], (error, result, fields) => {
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
		db.query(`SELECT comments.comment, comments.track_id, comments.user_id, comments.username, comments.time, tracks.id FROM comments 
		INNER JOIN tracks ON tracks.id = comments.track_id 
		WHERE tracks.artist_name = ? 
		ORDER BY comments.time`, [artist_name], (error, result, fields) => {
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
		db.query(`SELECT comments.comment, comments.track_id, comments.user_id, comments.username, comments.time, tracks.id FROM comments 
		INNER JOIN tracks ON tracks.id = comments.track_id 
		WHERE tracks.track_name = ? 
		ORDER BY comments.time DESC`, [track_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function addComment(db, cmt, track_id, user_id, usrname){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`INSERT INTO comments(comment, track_id, user_id, username) 
		VALUES (?, ?, ?, ?)`, [cmt, track_id, user_id, usrname], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function deleteComment(db, username, thecomment, thetime){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`DELETE FROM comments WHERE username = ? AND comment = ? AND time = ? LIMIT 1`, [username, thecomment, thetime], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function getCommentIDandTime(db, cmt, track_id, user_id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT id, time FROM comments WHERE comment = ? AND track_id = ? AND user_id = ?`, [cmt, track_id, user_id], (error, result, fields) => {
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
	getAllCommentsByTrackName,
	addComment,
	deleteComment,
	getCommentIDandTime
};