'use strict';

import UserModel from '../../models/user/user'
import RoleModel from '../../models/user/role'
import BaseComponent from '../../prototype/baseComponent'
import crypto from 'crypto'
import formidable from 'formidable'
import dtime from 'time-formater'

class User extends BaseComponent{
	constructor(){
		super()
		this.login = this.login.bind(this)
		this.register = this.register.bind(this)
		this.encryption = this.encryption.bind(this)
		this.TokenAdd = this.TokenAdd.bind(this)
		this.changePassword = this.changePassword.bind(this)
	}
	async login(req, res, next){
		const form = new formidable.IncomingForm();
		form.parse(req, async (err, fields, files) => {
			if (err) {
				res.send({
					status: 0,
					type: 'FORM_DATA_ERROR',
					message: '表单信息错误'
				})
				return
			}
			const {username, password} = fields;
			try{
				if (!username) {
					throw new Error('用户名参数错误')
				}else if(!password){
					throw new Error('密码参数错误')
				}
			}catch(err){
				console.log(err.message, err);
				res.send({
					status: 0,
					type: 'GET_ERROR_PARAM',
					message: err.message,
				})
				return
			}
			const newpassword = this.encryption(password);
			try{
				var user = await UserModel.findOne({username}).populate('role')
				if (!user) {
					res.send({
						status: 0,
						type: 'ERROR_PASSWORD',
						message: '账号或密码错误',
					})
				}else if(newpassword.toString() != user.password.toString()){
					console.log('管理员登录密码错误');
					res.send({
						status: 0,
						type: 'ERROR_PASSWORD',
						message: '账号或密码错误',
					})
				}else{
					// TODO: 删除不需要的变量
					// delete user.password
					// delete user._id
					// delete user.__v
					// console.log(user)
					res.send({
						status: 1,
						data: user,
						success: '登录成功'
					})
				}
			}catch(err){
				console.log('登录失败', err);
				res.send({
					status: 0,
					type: 'LOGIN_USER_FAILED',
					message: '登录失败',
				})
			}
		})
	}
	async register(req, res, next){
		const form = new formidable.IncomingForm();
		form.parse(req, async (err, fields, files) => {
			if (err) {
				res.send({
					status: 0,
					type: 'FORM_DATA_ERROR',
					message: '表单信息错误'
				})
				return
			}
			const {username, password,realName,phone,address} = fields;
			try{
				if (!username || !password || !realName || !phone || !address) {
					throw new Error('注册失败')
				}
			}catch(err){
				console.log(err.message, err);
				res.send({
					status: 0,
					type: 'GET_ERROR_PARAM',
					message: err.message,
				})
				return
			}
			try{
				const user = await UserModel.findOne({username:username})
				if (user) {
					console.log('该用户已经存在');
					res.send({
						status: 0,
						type: 'USER_HAS_EXIST',
						message: '该用户已经存在',
					})
				}else{
					const newpassword = this.encryption(password);
					const role = await RoleModel.findOne({name:"普通用户"})
					const newUser = {
						username,
						password: newpassword,
						create_time: dtime().format('YYYY-MM-DD'),
						role:role._id ,
						realName: realName,
						address: address,
						phone: phone,
						video:[],
						token:this.TokenAdd(username,password)
					}
					await UserModel.create(newUser)
					//TODO 普通角色获取
					res.send({
						status: 1,
						data:newUser,
						message: '注册成功',
					})
				}
			}catch(err){
				console.log('注册失败', err);
				res.send({
					status: 0,
					type: 'REGISTER_FAILED',
					message: '注册失败',
				})
			}
		})
	}
	encryption(password){
		const newpassword = this.Md5(this.Md5(password).substr(2, 7) + this.Md5(password));
		return newpassword
	}
	Md5(password){
		const md5 = crypto.createHash('md5');
		return md5.update(password).digest('hex');
	}
	TokenAdd(username,password){
		return this.Md5(username+password);
	}
	async getAllUser(req, res, next){
		console.log('获取所有用户')
		const {pageSize	= 10, pageNum = 1} = req.query;
		try{
			const datacount = await UserModel.count()
			const totalPage = parseInt((datacount-1)/pageSize+1)
			const allUser = await UserModel.find({}, '-__v -password -video').skip(Number(pageSize*(pageNum-1))).limit(Number(pageSize))
			res.send({
				status: 1,
				data: {data:allUser,page:{pageNum:pageNum,pageSize:pageSize,totalPage:totalPage}}
			})
		}catch(err){
			console.log('获取列表失败', err);
			res.send({
				status: 0,
				type: 'ERROR_GET_LIST',
				message: '获取列表失败'
			})
		}
	}
	async changePassword(req, res, next){
		const form = new formidable.IncomingForm();
		form.parse(req, async (err, fields, files) => {
			if (err) {
				res.send({
					status: 0,
					type: 'FORM_DATA_ERROR',
					message: '表单信息错误'
				})
				return
			}
			const {username, oldpassword , password} = fields;
			try{
				if (!username || !oldpassword || !password) {
					throw new Error('用户名参数错误')
				}
			}catch(err){
				console.log(err.message, err);
				res.send({
					status: 0,
					type: 'GET_ERROR_PARAM',
					message: err.message,
				})
				return
			}
			const oldpasswordSecret = this.encryption(oldpassword);
			try{
				var user = await UserModel.findOne({username})
				if (!user) {
					res.send({
						status: 0,
						type: 'ERROR_PASSWORD',
						success: '账号或密码错误',
					})
				}else if(oldpasswordSecret.toString() != user.password.toString()){
					console.log('登录密码错误');
					res.send({
						status: 0,
						type: 'ERROR_PASSWORD',
						message: '账号或密码错误',
					})
				}else{
					await UserModel.findOneAndUpdate({'username':username},{$set:{password:this.encryption(password)}})

					res.send({
						status: 1,
						data: user,
						success: '登录成功'
					})
				}
			}catch(err){
				console.log('登录失败', err);
				res.send({
					status: 0,
					type: 'LOGIN_USER_FAILED',
					message: '登录失败',
				})
			}
		})
	}
	async deleteUser(req, res, next){
		const _id = req.params._id
		if (!_id) {
				console.log('参数错误');
				res.send({
					status: 0,
					type: 'ERROR_PARAMS',
					message: '参数错误',
				})
				return
			}
		try {
		  await UserModel.findOneAndRemove({'_id':_id})
		  res.send({
					status: 1,
					message: '删除成功'
				})
		}catch(err){
				console.log('删除失败', err);
				res.send({
					status: 0,
					type: 'ERROR_GET_LIST',
					message: '删除失败'
				})
			}
	}
	async updateUserRole(req,res,next){
		const _id = req.params._id
		const roleId = req.query.roleId;
		if (!_id || !roleId) {
			console.log('参数错误');
			res.send({
				status: 0,
				type: 'ERROR_PARAMS',
				message: '参数错误',
			})
			return
		}
		try {
		await UserModel.findOneAndUpdate({_id:_id},{$set:{role:roleId}})
		res.send({
					status: 1,
					message: '修改成功'
				})
		}catch(err){
			console.log('修改失败', err);
			res.send({
				status: 0,
				type: 'ERROR_INTERFACE',
				message: '修改失败'
			})
		}
	}
	async getUserInfo(req, res, next){
		const {token} = req.query;
		if (!token) {
			res.send({
				status: 0,
				type: 'ERROR_PARAMS',
				message: '参数错误',
			})
			return
		}
		try{
			const user = await UserModel.findOne({'token':token})
			res.send({
				status: 1,
				data: user,
			})
			return
		}catch(err){
			console.log('失败', err);
			res.send({
				status: 0,
				type: 'ERROR',
				message: '失败'
			})
			return
		}
	}
	async update(req, res, next){
		const _id = req.params._id;
		if (!_id) {
			res.send({
				status: 0,
				type: 'ERROR_PARAMS',
				message: '参数错误',
			})
			return
		}
		const form = new formidable.IncomingForm();
		form.parse(req, async (err, fields, files) => {
			if (err) {
				res.send({
					status: 0,
					type: 'FORM_DATA_ERROR',
					message: '表单信息错误'
				})
				return
			}
			const {realName,phone,address} = fields;
			try{
				if ( !realName || !phone || !address) {
					throw new Error('注册失败')
				}
			}catch(err){
				console.log(err.message, err);
				res.send({
					status: 0,
					type: 'GET_ERROR_PARAM',
					message: err.message,
				})
				return
			}
		
			try{
				await UserModel.findOneAndUpdate({_id: _id}, {$set: {address: address,phone:phone,realName:realName}});
				res.send({
					status: 1,
					message: '更新成功',
				})
				return
			}catch(err){
				console.log('上传图片失败', err);
				res.send({
					status: 0,
					type: 'ERROR_UPLOAD_IMG',
					message: '上传图片失败'
				})
				return
			}
		})
	}
}

export default new User()
