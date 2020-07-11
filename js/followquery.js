function isFollowingArtist(db, user_id, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT * FROM follows WHERE user_id = ? AND artist_name = ?`, [user_id, artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function followArtist(db, art_name, user_id, artid){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`INSERT INTO follows(artist_name, user_id, artist_id) 
		VALUES (?, ?, ?)`, [art_name, user_id, artid], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function unfollowArtist(db, art_name, user_id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`DELETE FROM follows WHERE artist_name = ? AND user_id = ? LIMIT 1`, [art_name, user_id], (error, result, fields) => {
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
	isFollowingArtist,
	followArtist,
	unfollowArtist
};