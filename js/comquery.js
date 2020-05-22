function getAllCommentsByArtistName(db, artist_name){
	console.log("starting query");

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT comments.comment, comments.track_id, comments.user_id FROM comments INNER JOIN artists ON artists.id = comments.artist_id WHERE artists.artist_name = ?`, [artist_name], (error, result, fields) => {
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
	getAllCommentsByArtistName
};