const request = require('request');
const mysql = require('mysql');
const { checkAvailablityOfFlower } = require('../../../blossom/api/controllers/FlowerController');

const dbPool = mysql.createPool({
	connectionLimit: 5,
	host: 'baskets.ccaqr39dxhsq.us-east-1.rds.amazonaws.com',
	user: 'admin',
	password: 'aws_data',
	database: 'wickerBasket',
	port: '3306',
	multipleStatements: true
});

module.exports = {
	getAllBasketListView: (req, res) => {
		console.log('Received request to getAllBasketListView');
		request.get(
			{
				url: 'https://azs5932w5f.execute-api.us-east-1.amazonaws.com/prod/getallbasketlist'
			},
			async function(error, response, body) {
				if (error) {
					console.log(error);
					return res.error('Failed to get basket details. Try again');
				}
				console.log(response.body);

				let basketList = JSON.parse(response.body);
				let flag = true;
				return res.view('pages/homepage', { basketList: basketList.result });
			}
		);
	},

	getAllBasketList: (req, res) => {
		request.get(
			{
				url: 'https://azs5932w5f.execute-api.us-east-1.amazonaws.com/prod/getallbasketlist'
			},
			async function(error, response, body) {
				if (error) {
					console.log(error);
					return res.error('Failed to get basket details. Try again');
				}
				console.log(response.body);

				let basketList = JSON.parse(response.body);

				if (basketList.statusCode != 200) {
					return res.status(200).json({ result: [] });
				}
				if (basketList.statusCode == 200) {
					let flag = true;
					return res.status(200).json(basketList.result);
				}
			}
		);
	},

	addNewBasket: (req, res) => {
		return res.view('pages/addNewBasket');
	},

	addNewBasketToDB: (req, res) => {
		let bodyData = {
			basketName: req.body.basketName,
			imageUrl: req.body.imageUrl,
			details: req.body.details,
			price: req.body.price,
			quantityAvailable: req.body.quantityAvailable
		};

		console.log('Received request to add a new Basket');
		request(
			{
				url: 'https://ke9n5fdnj7.execute-api.us-east-1.amazonaws.com/prod/addnewbaskettodb',
				method: 'POST',
				body: JSON.stringify(bodyData)
			},
			async function(error, response, body) {
				if (error) {
					console.log(error);
					return res.error('Failed to delete basket. Try again!');
				}
				let result = JSON.parse(response.body);
				if (result.statusCode != 200) {
					return res.view('pages/errorPage', {
						message: result.message
					});
				}
				if (result.statusCode == 200) {
					return res.redirect('/');
				}
			}
		);
	},

	updateBasketView: (req, res) => {
		console.log('Received request to updateBasketView');

		request(
			{
				url:
					'https://t9w66xc78k.execute-api.us-east-1.amazonaws.com/prod/getbasketdetails?basketId=' +
					req.param('basketId'),
				method: 'GET'
			},
			async function(error, response, body) {
				if (error) {
					console.log(error);
					return res.error('Failed to get basket details. Try again');
				}
				console.log(response.body);

				let basket = JSON.parse(response.body);
				if (basket.statusCode != 200) {
					return res.view('pages/errorPage', {
						message: result.message
					});
				}
				if (basket.statusCode == 200) {
					return res.view('pages/updatepage', { basket: basket.result[0] });
				}
			}
		);
	},

	updateBasketDetails: (req, res) => {
		let bodyData = {
			basketName: req.body.basketName,
			basketId: req.body.basketId,
			details: req.body.details,
			price: req.body.price,
			quantityAvailable: req.body.quantityAvailable
		};

		request(
			{
				url: 'https://d3s7qty54m.execute-api.us-east-1.amazonaws.com/prod/updatebasketdetails',
				method: 'POST',
				body: JSON.stringify(bodyData)
			},
			async function(error, response, body) {
				if (error) {
					console.log(error);
					return res.error('Failed to update basket details. Try again');
				}
				console.log(response.body);
				let result = JSON.parse(response.body);
				if (result.statusCode != 200) {
					return res.view('pages/errorPage', {
						message: result.message
					});
				}
				if (result.statusCode == 200) {
					return res.redirect('/');
				}
			}
		);
	},

	deleteBasketDetails: (req, res) => {
		console.log('Received request to delete Basket');

		let basketId = req.param('basketId');

		request(
			{
				url:
					'https://0ws3jahlt7.execute-api.us-east-1.amazonaws.com/prod/deletebasketdetails?basketId=' +
					req.param('basketId'),
				method: 'GET'
			},
			async function(error, response, body) {
				if (error) {
					console.log(error);
					return res.error('Failed to delete basket. Try again!');
				}
				console.log(response.body);

				return res.redirect('/');
			}
		);
	},

	placeBasketOrder: (req, res) => {
		console.log('Placing fower order for basket: ' + req.param('basketName'));
		let basketName = req.param('basketName');
		let orderId = req.param('orderId');
		dbPool.getConnection(function(err, basketDb) {
			if (err) {
				console.log('Failed to connect to mysql ' + err);
				context.succeed({
					statusCode: 500,
					message: 'Failed to connect to database'
				});
				return res.json({ result: false });
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
					return res.json({ result: false });
				}

				console.log(transactionResult);
				let response = {
					statusCode: 200,
					message: 'Successfull',
					body: transactionResult
				};
				return res.json({ result: true });
			});
		});
	},

	completeBasketOrder: (req, res) => {
		console.log('Completing transaction for orderId ' + req.param('orderId'));
		let orderId = req.param('orderId');
		let commitTransaction = req.param('commitTransaction');
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
				return res.json({
					statusCode: 500,
					message: 'Failed to connect to database'
				});
			}

			flowerDb.query(sqlQuery, (findErr, commitTransactionRes) => {
				flowerDb.release();
				if (findErr) {
					console.log('Error in fetching database ' + findErr);
					return res.json({ statusCode: 500, message: findErr });
				}

				console.log(commitTransactionRes);
				let response = {
					statusCode: 200,
					message: 'Successfull',
					body: commitTransactionRes
				};
				return res.json(response);
			});
		});
	},

	checkAvailablityOfBasket: (req, res) => {
		console.log('Request received to check if basket available');
		let basketName = req.param('basketName');

		request(
			{
				url:
					'https://80aam1d009.execute-api.us-east-1.amazonaws.com/prod/checkavailabilityofbasket?basketName=' +
					basketName,
				method: 'GET'
			},
			function(error, response, body) {
				if (error) {
					console.log('Error occured');
					return res.json({ result: false });
				}
				return res.json(JSON.parse(response.body));
			}
		);
	}
};
