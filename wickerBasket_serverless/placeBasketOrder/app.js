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
	console.log('Placing fower order for basket: ' + event['basketName']);
	let basketName = event['basketName'];
	let orderId = event['orderId'];
	dbPool.getConnection(function(err, basketDb) {
		if (err) {
			console.log('Failed to connect to mysql ' + err);
			context.succeed({
				statusCode: 500,
				message: 'Failed to connect to database'
			});
			context.succeed({ result: false });
		}
		var datetime = new Date().toISOString();

		let dateVal = datetime.slice(0, 10);

		let xa = `XA start "${orderId}";`;
		let updateQuantity = `update baskets set quantityAvailable = quantityAvailable - 1 where basketName = "${basketName}"; `;
		let saveOrder = `insert into orders (basketName, date) values("${basketName}", "${dateVal}");`;
		let endXa = `XA end "${orderId}";`;
		let sqlQueries = xa + updateQuantity + saveOrder + endXa;
		console.log(sqlQueries);
		basketDb.query(sqlQueries, (findErr, transactionResult) => {
			basketDb.release();
			if (findErr) {
				console.log('Error in fetching database ' + findErr);
				context.succeed({ result: false });
			}

			console.log(transactionResult);
			let response = {
				statusCode: 200,
				message: 'Successfull',
				body: transactionResult
			};
			context.succeed({ result: true });
		});
	});
};
