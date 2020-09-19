/**
 * Flower.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
	attributes: {
		id: {
			columnName: 'flowerId',
			type: 'string',
			required: true,
			columnType: 'varchar'
		},
		flowerName: { columnName: 'flowerName', type: 'string', required: true },
		details: { columnName: 'details', type: 'string', columnType: 'varchar' },
		price: { columnName: 'price', type: 'number', columnType: 'int' },
		imageUrl: { columnName: 'imageUrl', type: 'string', columnType: 'varchar' },
		quantityAvailable: { columnName: 'quantityAvailable', type: 'number', columnType: 'int' },
	
	},
	tableName: 'blossom'
};
