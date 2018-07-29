'use strict';

import mongoose from 'mongoose'
import roleData from '../../InitData/role'
import userData from '../../InitData/user'
import UserModel from './user'
import dtime from 'time-formater'
import crypto from 'crypto'




const Schema = mongoose.Schema;

const roleSchema = new Schema({
	create_time: String,
  type: {type:Number,default: 0,isRequired: true},      // 0 普通  1 管理员
	name: String,
	isWrite:Number, // 0 读 1 写
  location: [{ type: Schema.Types.ObjectId, ref: 'Location' }]
  // TODO: 所有地点的id
})

const Role = mongoose.model('Role', roleSchema);

Role.findOne((err, data) => {
	if (!data) {
		roleData.forEach(item => {
      item.create_time = dtime().format('YYYY-MM-DD')
			Role.create(item).then(res=>{
				// console.log(res)
				if(item.type == 1){
					userData.forEach(item=>{
						item.create_time = dtime().format('YYYY-MM-DD')
						item.password = Md5(Md5("123456").substr(2, 7) + Md5("123456"));
						item.token = TokenAdd(item.username,"123456")
						item.role = res._id
						UserModel.create(item)
					})
				}
			})
		})
	}
})
function Md5(password){
	const md5 = crypto.createHash('md5');
	return md5.update(password).digest('hex');
}
function TokenAdd(username,password){
	return Md5(username+password);
}

export default Role
