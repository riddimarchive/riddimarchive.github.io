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

module.exports = {
	getSecretLink
};