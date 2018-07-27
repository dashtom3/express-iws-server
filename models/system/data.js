'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;
const dataSchema = new Schema({
  create_time:String,
  data:String,
  sensor:{ type:Schema.Types.ObjectId, ref: 'Sensor'},
})


const Data = mongoose.model('Data', dataSchema);


export default Data
