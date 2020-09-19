const mysql = require('mysql');

const dbPool = mysql.createPool({
	connectionLimit: 5,
	host: 'cloudproject.cgvh2dl8kyyq.us-east-1.rds.amazonaws.com',
	user: 'admin',
	password: 'aws_data',
	database: 'blossom',
	port: '3306'
});

exports.lambdaHandler = (event, context) => {
	let details = req.body.details;
	let price = event['price'];
	let quantityAvailable = event['quantityAvailable'];
	let flowerId = event['flowerId'];
	dbPool.getConnection(function(err, flowerDb) {
		if (err) {
			console.log('Failed to connect to mysql ' + err);
			context.succeed({ statusCode: 500, message: 'Failed to connect to database' });
			return;
		}
		flowerDb.query(
			'update flowers set  price = ?, details = ?, quantityAvailable = ? where flowerId = ?',
			[ price, details, quantityAvailable, flowerId ],
			(findErr, findResult) => {
				flowerDb.release();
				if (findErr) {
					console.log('Error in fetching database ' + findErr);
					context.succeed({ statusCode: 500, message: findErr });
					return;
				}

				console.log(findResult);
				let response = {
					statusCode: 200,
					message: 'Successfull',
					body: findResult
				};
				context.succeed(response);
			}
		);
	});
};
