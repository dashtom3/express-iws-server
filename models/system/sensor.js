'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;
const dataSchema = new Schema({
  create_time:String,
  data:String,
})
const dataAlarmSchema = new Schema({
  create_time:String,
  stop_time:String,
  data:String,
})
const sensorSchema = new Schema({
  transfer_type: Number, // modbus s7
  point: { type: Schema.Types.ObjectId, ref: 'Point' },   //点表
  create_time: String,
  ip:String,
  zhan:String,
  alarm: { type:Schema.Types.ObjectId, ref: 'Alarm'},
  isStart:Boolean,
  data:dataSchema,
  oldData:[dataSchema],
  alarmData:dataAlarmSchema,
  oldAlarmData:[dataAlarmSchema],
})

const Sensor = mongoose.model('Sensor', sensorSchema);


export default Sensor
