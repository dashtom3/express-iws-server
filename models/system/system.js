'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const deviceSchema = new Schema({
  id: Number,
  name: String,
  create_time: String,
  baseDevice_id: Number,
})
const roomSchema = new Schema({
  id: Number,
  name: String,
  create_time: String,
  device: [deviceSchema],
})
const locationSchema = new Schema({
  id: Number,
  name: String,
  create_time: String,
  lat: String,
  lng: String,
  address: String,
  room:[roomSchema],
})
const systemSchema = new Schema({
  id: Number,
  name: String,
  pic: Number,
  create_time: String,
  location:[locationSchema],
})




systemSchema.index({id: 1});
locationSchema.index({id: 1});
roomSchema.index({id: 1});
deviceSchema.index({id: 1});

const System = mongoose.model('System', systemSchema);


export default System
