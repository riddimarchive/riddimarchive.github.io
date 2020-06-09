const aws = require('aws-sdk');

function uploadToS3(file) {
	let s3bucket = new aws.S3({
	  accessKeyId: process.env.ACCESS_KEY,
	  secretAccessKey: process.env.SECRET_ACCESS_KEY,
	  Bucket: process.env.BUCKET,
	});
	s3bucket.createBucket(function () {
	  var params = {
	   Bucket: process.env.BUCKET,
	   Tagging: 'Artist=A3&DB ID=10&Track Name=Murder',
	   Key: `A/A3/${file.name}`,
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