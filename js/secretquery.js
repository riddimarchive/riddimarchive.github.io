function getSecretLink(db, track_id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT * FROM secretlinks WHERE track_id = ?`, [track_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});
	return querypromise;
}

function getArtistsSecretLinks(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT * FROM secretlinks WHERE artist_name = ?`, [artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});
	return querypromise;
}

function getArtistsSecretTunes(db, artist_name){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT * FROM tracks WHERE artist_name = ? AND is_secret = '1'`, [artist_name], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});
	return querypromise;
}

function addSecretLink(db, track_id, artist_name, url, exp_time){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`INSERT INTO secretlinks (track_id, artist_name, url, exp_time) 
		VALUES (?, ?, ?, ?)`, [track_id, artist_name, url, exp_time], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});
	return querypromise;
}

function deletePreviousLink(db, track_id){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`DELETE FROM secretlinks WHERE track_id = ?`, [track_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}
	    	resolve(result);

		});

	});
	return querypromise;
}

function changeSecretPass(db, track_id, new_pass){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`UPDATE tracks SET secret_pass = ? WHERE id = ?`, [new_pass, track_id], (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});
	return querypromise;
}

function getCurrentTimestamp(db){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT CURRENT_TIMESTAMP()curr`, (error, result, fields) => {
	    	if (error) {
	      		console.error('An error occurred while executing the query');
	      		reject(error);
	    	}

	    	resolve(result);

		});

	});
	return querypromise;
}

function returnTimeDiff(db, new_time, old_time){

	let querypromise = new Promise(function(resolve, reject){
		db.query(`SELECT TIME_TO_SEC(TIMEDIFF(?, ?))diff`, [new_time, old_time], (error, result, fields) => {
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
	getSecretLink,
	getArtistsSecretLinks,
	getArtistsSecretTunes,
	addSecretLink,
	deletePreviousLink,
	changeSecretPass,
	getCurrentTimestamp,
	returnTimeDiff
};