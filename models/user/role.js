'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const roleSchema = new Schema({
	id: Number,
	create_time: String,
	name: String,
  // TODO: 所有地点的id
})

roleSchema.index({id: 1});

const Role = mongoose.model('Role', roleSchema);


export default Role
