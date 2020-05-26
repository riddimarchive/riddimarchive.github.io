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

function addHeart(db, track_id, user_id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`INSERT INTO hearts(track_id, user_id) 
		VALUES (?, ?)`, [track_id, user_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});

	return querypromise;
}

function deleteHeart(db, track_id, user_id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`DELETE FROM hearts WHERE track_id = ? AND user_id = ? LIMIT 1`, [track_id, user_id], (error, result, fields) => {
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
	getAllHeartsOnTrack,
	addHeart,
	deleteHeart
};