const mysql = require('mysql');

const dbPool = mysql.createPool({
	connectionLimit: 5,
	host: 'cloudproject.cgvh2dl8kyyq.us-east-1.rds.amazonaws.com',
	user: 'admin',
	password: 'aws_data',
	database: 'wickerBasket',
	port: '3306'
});

exports.lambdaHandler = (event, context) => {
	console.log('Request received to check if basket available');
	let basketName = event['basketName'];

	dbPool.getConnection(function(err, basketDb) {
		if (err) {
			console.log('Failed to connect to mysql ' + err);
			context.succeed({
				statusCode: 500,
				result: false
			});
			return;
		}
		basketDb.query('select * from baskets where basketName = ?', [ basketName ], (findErr, findResult) => {
			basketDb.release();
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
			let basketDetails = findResult[0];
			console.log(basketDetails);
			if (basketDetails.quantityAvailable > 0) {
				context.succeed({ statusCode: 200, result: true });
				return;
			} else {
				context.succeed({ statusCode: 200, result: false });
				return;
			}
		});
	});
};
