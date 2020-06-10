const aws = require('aws-sdk');

function uploadToS3(file, artist_name, track_name, artfirstletter) {
	let s3bucket = new aws.S3({
	  accessKeyId: process.env.ACCESS_KEY,
	  secretAccessKey: process.env.SECRET_ACCESS_KEY,
	  Bucket: process.env.BUCKET,
	});
	s3bucket.createBucket(function () {
	  var params = {
	   Bucket: process.env.BUCKET,
	   Tagging: `Artist=${artist_name}&Track Name=${track_name}`,
	   Key: `${artfirstletter}/${artist_name}/${file.name}`,
	   Body: file.data,
	  };
	  s3bucket.upload(params, function (err, data) {
		console.log("in upload function");
	   if (err) {
		console.log('error in callback');
		console.log(err);
	   }
	   console.log('success');
	   //console.log(data);
	  });
	});
  }

module.exports = {
	uploadToS3
};