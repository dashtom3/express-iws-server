'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const deviceSchema = new Schema({
  name: String,
  create_time: String,
  baseDevice_id: Number,
})
const roomSchema = new Schema({
  name: String,
  create_time: String,
  device: [deviceSchema],
})
const locationSchema = new Schema({

  name: String,
  create_time: String,
  lat: String,
  lng: String,
  address: String,
  room:[roomSchema],
})
const systemSchema = new Schema({
  name: String,
  pic: Number,
  create_time: String,
  location:[locationSchema],
})


const System = mongoose.model('System', systemSchema);


export default System
