'use strict';

import mongoose from 'mongoose'

const idsSchema = new mongoose.Schema({
	role_id: Number,
	user_id: Number,
	system_id: Number,
	location_id: Number,
	room_id: Number,
	device_id: Number,
	basicDevice_id: Number,
});

const Ids = mongoose.model('Ids', idsSchema);

Ids.findOne((err, data) => {
	if (!data) {
		const newIds = new Ids({
			role_id: 0,
			user_id: 0,
			system_id: 0,
			location_id: 0,
			room_id: 0,
			device_id: 0,
			basicDevice_id: 0,
		});
		newIds.save();
	}
})
export default Ids
