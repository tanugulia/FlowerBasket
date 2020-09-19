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
		
  let basketName = event["basketName"];
  let basketId = event["basketId"];
  let details = event["details"];
  let price = event["price"];
  let quantityAvailable = event["quantityAvailable"];

  dbPool.getConnection(function (err, basketDb) {
	if (err) {
	  console.log("Failed to connect to mysql " + err);
	  context.succeed(err);
	  return;
	}
	console.log(event);

	if (quantityAvailable < 0 || price < 0) {
		let response = {
		  statusCode: 400,
		  message: "Negative values not allowed",
		};
		context.succeed(response);
		return;
	  }
	  
	basketDb.query(
	  "select * from baskets where basketId = ?",
	  [basketId],
	  (err, result, fields) => {
		if (err) {
		  console.log(err);
		  let response = {
			statusCode: 500,
			message: "Error in fetching data from database!!",
		  };
		  context.succeed(response);
		}
		if (result.length > 0) {
		  basketDb.query(
			"Update baskets set details=?,price=?,quantityAvailable=? where basketId = ?",
			[details, price, quantityAvailable, basketId],
			(err, result, fields) => {
			  if (err) {
				console.log(err);
				let response = {
				  statusCode: 500,
				  message: "Error in updating data!!",
				};
				context.succeed(response);
			  }
			  let response = {
				statusCode: 200,
				message: "Successfully updated basket details !!",
			  };
			  context.succeed(response);
			}
		  );
		} else {
		  let response = {
			statusCode: 203,
			message: "The basket does not exist !!",
		  };
		  context.succeed(response);
		}
	  }
	);
	
  });

};
