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
	console.log('Placing fower order for flower: ' + event['flowerName']);
	let flowerName = event['flowerName'];
	let orderId = event['orderId'];
	dbPool.getConnection(function(err, flowerDb) {
		if (err) {
			console.log('Failed to connect to mysql ' + err);
			context.succeed({
				statusCode: 500,
				message: 'Failed to connect to database'
			});
			return;
		}
		var datetime = new Date().toISOString();

		let dateVal = datetime.slice(0, 10);

		let xa = `XA start "${orderId}";`;
		let updateQuantity = `update flowers set quantityAvailable = quantityAvailable - 1 where flowerName = "${flowerName}"; `;
		let saveOrder = `insert into orders (flowerName, date) values("${flowerName}", "${dateVal}");`;
		let endXa = `XA end "${orderId}";`;
		let sqlQueries = xa + updateQuantity + saveOrder + endXa;
		console.log(sqlQueries);
		flowerDb.query(sqlQueries, (findErr, transactionResult) => {
			flowerDb.release();
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
			return;
		});
	});
};
