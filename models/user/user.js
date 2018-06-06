'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const userSchema = new Schema({
	username: String,
	password: String,
	id: Number,
	create_time: String,
	realName: String,
	role_id: Number,  //1:普通管理、 2:超级管理员
	address: String,
	token: String,
})

userSchema.index({id: 1});

const User = mongoose.model('User', userSchema);


export default User
