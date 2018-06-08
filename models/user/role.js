'use strict';

import mongoose from 'mongoose'
import roleData from '../../InitData/role'
import dtime from 'time-formater'

const Schema = mongoose.Schema;

const roleSchema = new Schema({
	create_time: String,
  type: {type:Number,default: 0,isRequired: true},      // 0 普通  1 管理员
	name: String,
  location: [{ type: Schema.Types.ObjectId, ref: 'Location' }]
  // TODO: 所有地点的id
})

const Role = mongoose.model('Role', roleSchema);

Role.findOne((err, data) => {
	if (!data) {
		roleData.forEach(item => {
      item.create_time = dtime().format('YYYY-MM-DD')
			Role.create(item)
		})
	}
})

export default Role
