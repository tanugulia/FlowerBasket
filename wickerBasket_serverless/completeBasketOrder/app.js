const mysql = require('mysql');

const dbPool = mysql.createPool({
	connectionLimit: 5,
	host: 'baskets.ccaqr39dxhsq.us-east-1.rds.amazonaws.com',
	user: 'admin',
	password: 'aws_data',
	database: 'wickerBasket',
	port: '3306'
});

exports.lambdaHandler = (event, context) => {
	console.log('Received request to complete transaction');
	let orderId = event['orderId'];
	let commitTransaction = event['commitTransaction'];
	console.log(commitTransaction);
	let xaPrepare = `XA prepare "${orderId}";`;
	let xaQuery = `XA rollback "${orderId}";`;
	if (commitTransaction == 'true') {
		xaQuery = `XA commit "${orderId}";`;
	}
	let sqlQuery = xaPrepare + xaQuery;
	console.log(sqlQuery);
	dbPool.getConnection(function(err, flowerDb) {
		if (err) {
			console.log('Failed to connect to mysql ' + err);
			context.succeed({
				statusCode: 500,
				message: 'Failed to connect to database'
			});
			return;
		}

		flowerDb.query(sqlQuery, (findErr, commitTransactionRes) => {
			flowerDb.release();
			if (findErr) {
				console.log('Error in fetching database ' + findErr);
				context.succeed({ statusCode: 500, message: findErr });
			}

			console.log(commitTransactionRes);
			let response = {
				statusCode: 200,
				message: 'Successfull',
				body: commitTransactionRes
			};
			context.succeed(response);
		});
	});
};
