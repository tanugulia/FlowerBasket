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
  console.log('Received request to getAllBasketListView');
		dbPool.getConnection(function(err, basketDb) {
			if (err) {
				console.log('Failed to connect to mysql ' + err);
				context.succeed({ statusCode: 500, message: 'Failed to connect to database' });
				return;
			}
			basketDb.query('select * from baskets', (findErr, findResult) => {
				basketDb.release();
				if (findErr) {
					console.log('Error in fetching values from database ' + findErr);
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
			});
		});
};
