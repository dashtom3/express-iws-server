'use strict';

import SystemModel from '../../models/system/system'
import BaseComponent from '../../prototype/baseComponent'
import crypto from 'crypto'
import formidable from 'formidable'
import dtime from 'time-formater'

class System extends BaseComponent{
	constructor(){
		super()
		this.addSystem = this.addSystem.bind(this)
    this.addLocation = this.addLocation.bind(this)
		// this.register = this.register.bind(this)
		// this.encryption = this.encryption.bind(this)
		// this.TokenAdd = this.TokenAdd.bind(this)
	}
	async addSystem(req, res, next){
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
			const {name, pic} = fields;
			try{
				if (!name || !pic) {
					throw new Error('字段不能为空')
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
				const system_id = await this.getId('system_id');
				const newSystem = {
					id: system_id,
          name: name,
          pic: pic,
					create_time: dtime().format('YYYY-MM-DD'),
				}
				await SystemModel.create(newSystem)
				res.send({
					status: 1,
					message: '添加成功',
				})
			}catch(err){
				console.log('添加系统失败', err);
				res.send({
					status: 0,
					type: 'INTERFACE_FAILED',
					message: '添加系统失败',
				})
			}
		})
	}
  async addLocation(req, res, next){
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
			const {system_id, name, lat , lng , address} = fields;
			try{
				if (!name || !lat || !lng || !address || !system_id) {
					throw new Error('name不能为空')
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
				const system = await SystemModel.findOne({id: system_id})
				if (!system) {
					console.log('系统不存在');
					res.send({
						status: 0,
						type: 'SYSTEM_NOT_EXIST',
						message: '该系统不存在',
					})
				}else{
          console.log(system)
					const location_id = await this.getId('location_id');
					const newLocation = {
						id: location_id,
            name: name,
            lat: lat,
            lng: lng,
						create_time: dtime().format('YYYY-MM-DD'),
						address: address,
            room: [],
					}
          system.location = system.location.concat(newLocation)
					await system.save()
					res.send({
						status: 1,
						message: '添加成功',
					})
				}
			}catch(err){
				console.log('添加地点失败', err);
				res.send({
					status: 0,
					type: 'INTERFACE_FAILED',
					message: '添加地点失败',
				})
			}
		})
	}
  async addRoom(req, res, next){
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
			const {location_id,name}  = fields;
			try{
				if (!name || !location_id) {
					throw new Error('name不能为空')
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
				const system = await SystemModel.findOne({"location.id": location_id},'location')
        console.log(system)
				if (!system) {
					console.log('系统不存在');
					res.send({
						status: 0,
						type: 'SYSTEM_NOT_EXIST',
						message: '该系统不存在',
					})
				}else{
          console.log(system)
					const room_id = await this.getId('room_id');
					const newRoom = {
						id: room_id,
            name: name,
						create_time: dtime().format('YYYY-MM-DD'),
					}
          // system.location = system.location.concat(newLocation)
					// await system.save()
					res.send({
						status: 1,
						message: '添加成功',
					})
				}
			}catch(err){
				console.log('添加地点失败', err);
				res.send({
					status: 0,
					type: 'INTERFACE_FAILED',
					message: '添加地点失败',
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
	async getAllSystem(req, res, next){
		console.log('获取所有系统')
		const {pageSize	= 10, pageNum = 1} = req.query;
		try{
			const allUser = await UserModel.find({}, '-_id -__v -password').sort({id: -1}).skip(Number(pageSize*(pageNum-1))).limit(Number(pageSize))
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

export default new System()
