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
  console.log('Received request to add a new Basket');
  let basketName = event["basketName"];
  let details = event["details"];
  let imageUrl = event["imageUrl"];
  let price = event["price"];
  let quantityAvailable = event["quantityAvailable"];
		
		dbPool.getConnection(function(err, basketDb) {
			if (err) {
				console.log("Failed to connect to mysql " + err);
				context.succeed({ statusCode: 500, message: 'Failed to connect to mySql' });
				return;
			  }
			  basketDb.query(
				"select * from baskets where basketName = ?",
				[basketName],
				(err, result, fields) => {
				if (err) {
					console.log(err);
					let response = {
					  statusCode: 500,
					  message: "Error in fetching data from database!!",
					};
					basketDb.release();
					context.succeed(response);
					return;
				  }
				  if (result.length > 0) {
					let response = {
						statusCode: 500,
						message: "Basket already exists, please try again with another basket."
					}
					basketDb.release();
					context.succeed(response);
					return;
				   } else {
					  if( price > 0 ) {
						  // DB query to insert into database.
						  basketDb.query(					 
							  "INSERT INTO baskets(basketName, details, price, imageUrl, quantityAvailable) VALUES (?, ?, ?, ?, ?)",[basketName, details, price, imageUrl, quantityAvailable],
							  (err, result, fields) => {
							  	basketDb.release();
								if (err) {
								  console.log(err);
								  let response = {
									statusCode: 500,
									message: "Error in inserting new basket!!",
								  };
								  context.succeed(response);
						   		  return;
								}
								let response = {
								  statusCode: 200,
								  message: "Successfully added basket in the database!!",
								};
								context.succeed(response);
								return;
							  }
							);
					  }
					  else{
						  let response = {
							  statusCode: 500,
							  message: "Price cannot be zero!!",
							};
							basketDb.release();
							context.succeed(response);
							return;
					  }					
				  }
				}
			  );		

		});
};
