const mysql = require('mysql');

const dbPool = mysql.createPool({
	connectionLimit: 6,
	host: 'cloudproject.cgvh2dl8kyyq.us-east-1.rds.amazonaws.com',
	user: 'admin',
	password: 'aws_data',
	database: 'blossom',
	port: '3306',
	multipleStatements: true
});

exports.handler = (event, context) => {
	console.log('Search request');
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
