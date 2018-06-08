'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;
const sensorSchema = new Schema({
  transfer_type: Number, // modbus s7
  point_src: String,   //点表
  create_time: String,
})
const basicDeviceSchema = new Schema({
	create_time: String,
	name: String,
  sensor:[sensorSchema],
  // TODO: 所有的点表合集
})

basicDeviceSchema.index({id: 1});

const BasicDevice = mongoose.model('BasicDevice', basicDeviceSchema);


export default BasicDevice
