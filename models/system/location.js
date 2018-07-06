'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const locationSchema = new Schema({

  name: String,
  create_time: String,
  lat: String,
  lng: String,
  address: String,
  room:[{ type: Schema.Types.ObjectId, ref: 'Room' }],
})


const Location = mongoose.model('Location', locationSchema);

export default Location