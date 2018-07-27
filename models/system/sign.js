'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const signSchema = new Schema({
  teamwork: String,
  problems: String,
  detailMsg: String,
  lng: String,
  lat: String,
  userName: String,
  address: String,
  realAddress: String,
  create_time: String,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
})


const Sign = mongoose.model('Sign', signSchema);


export default Sign
