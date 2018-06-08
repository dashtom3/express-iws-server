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
				var user = await UserModel.findOne({username})
				if (!user) {
					res.send({
						status: 0,
						type: 'ERROR_PASSWORD',
						success: '账号或密码错误',
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
			const {username, password} = fields;
			try{
				if (!username) {
					throw new Error('用户名错误')
				}else if(!password){
					throw new Error('密码错误')
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
						realName: '',
						address: '',
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
		return md5.update(password).digest('base64');
	}
	TokenAdd(username,password){
		return this.Md5(username+password);
	}
	async getAllUser(req, res, next){
		console.log('获取所有用户')
		const {pageSize	= 10, pageNum = 1} = req.query;
		try{
			const allUser = await UserModel.find({}, '-__v -password').skip(Number(pageSize*(pageNum-1))).limit(Number(pageSize)).populate('role')
			res.send({
				status: 1,
				data: {data:allUser,page:{pageNum:pageNum,pageSize:pageSize}}
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
	async getUserInfo(req, res, next){

		// if (!admin_id || !Number(admin_id)) {
		// 	// console.log('获取管理员信息的session失效');
		// 	res.send({
		// 		status: 0,
		// 		type: 'ERROR_SESSION',
		// 		message: '获取管理员信息失败'
		// 	})
		// 	return
		// }
		// try{
		// 	const info = await AdminModel.findOne({id: admin_id}, '-_id -__v -password');
		// 	if (!info) {
		// 		throw new Error('未找到当前管理员')
		// 	}else{
		// 		res.send({
		// 			status: 1,
		// 			data: info
		// 		})
		// 	}
		// }catch(err){
		// 	console.log('获取管理员信息失败');
		// 	res.send({
		// 		status: 0,
		// 		type: 'GET_ADMIN_INFO_FAILED',
		// 		message: '获取管理员信息失败'
		// 	})
		// }
	}
	async update(req, res, next){
		// const user_id = req.params.user_id;
		// if (!user_id || !Number(user_id)) {
		// 	console.log('user_id参数错误', user_id)
		// 	res.send({
		// 		status: 0,
		// 		type: 'ERROR_USERID',
		// 		message: 'user_id参数错误',
		// 	})
		// 	return
		// }
		//
		// try{
		// 	const image_path = await this.getPath(req);
		// 	await AdminModel.findOneAndUpdate({id: admin_id}, {$set: {avatar: image_path}});
		// 	res.send({
		// 		status: 1,
		// 		image_path,
		// 	})
		// 	return
		// }catch(err){
		// 	console.log('上传图片失败', err);
		// 	res.send({
		// 		status: 0,
		// 		type: 'ERROR_UPLOAD_IMG',
		// 		message: '上传图片失败'
		// 	})
		// 	return
		// }
	}
}

export default new User()
