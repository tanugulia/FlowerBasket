const mysql = require('mysql');

const dbPool = mysql.createPool({
	connectionLimit: 6,
	host: 'cloudproject.cgvh2dl8kyyq.us-east-1.rds.amazonaws.com',
	user: 'admin',
	password: 'aws_data',
	database: 'blossom',
	port: '3306'
});

exports.handler = (event, context) => {
	console.log('Request received to check if flower available');
	let flowerName = event['flowerName'];

	dbPool.getConnection(function(err, flowerDb) {
		if (err) {
			console.log('Failed to connect to mysql ' + err);
			context.succeed({
				statusCode: 500,
				result: false
			});
			return;
		}
		flowerDb.query('select * from flowers where flowerName = ?', [ flowerName ], (findErr, findResult) => {
			flowerDb.release();
			if (findErr) {
				console.log('Error in fetching database ' + findErr);
				context.succeed({ statusCode: 500, result: false });
				return;
			}

			console.log(findResult);
			if (findResult.length <= 0) {
				context.succeed({ statusCode: 200, result: false });
				return;
			}
			let flowerDetails = findResult[0];
			console.log(flowerDetails);
			if (flowerDetails.quantityAvailable > 0) {
				context.succeed({ statusCode: 200, result: true });
				return;
			} else {
				context.succeed({ statusCode: 200, result: false });
				return;
			}
		});
	});
};
