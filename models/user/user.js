'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const userSchema = new Schema({
	username: String,
	password: String,
	create_time: String,
	realName: String,
	role: { type: Schema.Types.ObjectId, ref: 'Role' },  //1:普通管理、 2:超级管理员
	address: String,
	token: String,
})

const User = mongoose.model('User', userSchema);


export default User
