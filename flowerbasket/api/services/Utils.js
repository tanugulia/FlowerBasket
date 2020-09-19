const request = require('request');

module.exports.checkQuantity = async function(flowerName, basketName) {
	return new Promise((resolve, reject) => {
		request(
			{
				url: sails.config.projectConfig.flowerCompanyUrl + '/checkAvailablityOfFlower?flowerName=' + flowerName,
				method: 'GET'
			},
			function(error, response, result) {
				if (error) {
					console.log('Error occured in checking quantity of flower');
					resolve(false);
				}
				console.log(response);
				let flowerResp = JSON.parse(response.body);
				console.log('Flower response ' + flowerResp.result);
				if (flowerResp.result == false) {
					resolve(false);
				}
				request(
					{
						url:
							sails.config.projectConfig.basketCompanyUrl +
							'/checkAvailablityOfBasket?basketName=' +
							basketName,
						method: 'GET'
					},
					function(err, resp, res) {
						if (err) {
							console.log('Error occured in checking quantity of basket');
							resolve(false);
						}
						let basketResp = JSON.parse(resp.body);
						console.log('Basket response ' + basketResp.result);
						if (basketResp.result == false) {
							resolve(false);
						}
						resolve(true);
					}
				);
			}
		);
	});
};

module.exports.placeBasketOrder = async function(basketName, orderId) {
	console.log(sails.config.projectConfig.flowerCompanyUrl);
	return new Promise((resolve, reject) => {
		request(
			{
				url:
					sails.config.projectConfig.basketCompanyUrl +
					'/placeBasketOrder?basketName=' +
					basketName +
					'&orderId=' +
					orderId,
				method: 'GET'
			},
			function(err, response, body) {
				if (err) {
					resolve(false);
				}
				let transResponse = JSON.parse(response.body);
				console.log('Transaction response ' + transResponse.result);
				resolve(transResponse.result);
			}
		);
	});
};

module.exports.completeBasketOrder = async function(orderId, commitTransaction) {
	return new Promise((resolve, reject) => {
		request(
			{
				url:
					sails.config.projectConfig.basketCompanyUrl +
					'/completeBasketOrder?orderId=' +
					orderId +
					'&commitTransaction=' +
					commitTransaction,
				method: 'GET'
			},
			function(err, response, body) {
				if (err) {
					resolve(false);
				}
				resolve(true);
			}
		);
	});
};

module.exports.placeFlowerOrder = async function(flowerName, orderId) {
	return new Promise((resolve, reject) => {
		request(
			{
				url:
					sails.config.projectConfig.flowerCompanyUrl +
					'/placeFlowerOrder?flowerName=' +
					flowerName +
					'&orderId=' +
					orderId,
				method: 'GET'
			},
			function(err, response, body) {
				if (err) {
					resolve(false);
				}
				let transResponse = JSON.parse(response.body);
				console.log('Transaction response ' + transResponse.result);
				resolve(transResponse.result);
			}
		);
	});
};

module.exports.completeFlowerOrder = async function(orderId, commitTransaction) {
	return new Promise((resolve, reject) => {
		request(
			{
				url:
					sails.config.projectConfig.flowerCompanyUrl +
					'/completeFlowerOrder?orderId=' +
					orderId +
					'&commitTransaction=' +
					commitTransaction,
				method: 'GET'
			},
			function(err, response, body) {
				if (err) {
					resolve(false);
				}
				resolve(true);
			}
		);
	});
};
