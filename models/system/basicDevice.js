'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const basicDeviceSchema = new Schema({
	id: Number,
	create_time: String,
	name: String,
  // TODO: 所有的点表合集
})

basicDeviceSchema.index({id: 1});

const BasicDevice = mongoose.model('BasicDevice', basicDeviceSchema);


export default BasicDevice
