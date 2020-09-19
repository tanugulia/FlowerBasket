module.exports = {
	attributes: {
		id: {
			columnName: 'orderId',
			type: 'Number',
			autoIncrement: true,

			columnType: 'int'
		},
		comboId: {
			columnName: 'flowerBasketId',
			type: 'Number',
			columnType: 'int'
		},
		flowerName: {
			columnName: 'flowerName',
			type: 'string',
			columnType: 'varchar'
		},
		basketName: {
			columnName: 'basketName',
			type: 'string',
			columnType: 'varchar'
		},
		orderDate: {
			columnName: 'orderDate',
			type: 'string',
			columnType: 'varchar'
		},
		price: {
			columnName: 'price',
			type: 'Number',
			columnType: 'int'
		},
		username: {
			columnName: 'username',
			type: 'string',
			columnType: 'varchar'
		},
		status: {
			columnName: 'status',
			type: 'string',
			columnType: 'varchar'
		}
	},
	tableName: 'orderHistory'
};
