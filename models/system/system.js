'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const systemSchema = new Schema({
  name: String,
  pic: Number,
  create_time: String,
  location: [{ type: Schema.Types.ObjectId, ref: 'Location' }],
})


const System = mongoose.model('System', systemSchema);


export default System
