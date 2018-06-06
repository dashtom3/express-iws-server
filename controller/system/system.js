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
    this.addRoom = this.addRoom.bind(this)
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
  async updateSystem(req, res, next){
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
			const {id ,name, pic} = fields;
			try{
				if (!id || !name || !pic) {
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
				await SystemModel.findOneAndUpdate({id:id},{$set:{name:name,pic:pic}})
				res.send({
					status: 1,
					message: '更新成功',
				})
			}catch(err){
				console.log('更新系统失败', err);
				res.send({
					status: 0,
					type: 'INTERFACE_FAILED',
					message: '更新系统失败',
				})
			}
		})
	}
  async deleteSystem(req, res, next){
    const id = req.params.id
    if (!id || !Number(id)) {
			console.log('参数错误');
			res.send({
				status: 0,
				type: 'ERROR_PARAMS',
				message: '参数错误',
			})
			return
		}
    try {
      await SystemModel.findOneAndRemove({id:id})
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
  async getAllSystem(req, res, next){
    try{
			const allSystem = await SystemModel.find({}, '-_id -__v -location.room.device').sort({id: -1})
			res.send({
				status: 1,
				data: {data:allSystem}
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
			const {id, name, lat , lng , address} = fields; //system id
			try{
				if (!name || !lat || !lng || !address || !id) {
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
        // SystemModel.update({"id":id},{
        //   '$push':{
        //     location:{
        //       id: location_id,
        //       name: name,
        //       lat: lat,
        //       lng: lng,
  			// 			create_time: dtime().format('YYYY-MM-DD'),
  			// 			address: address,
        //       room: [],
        //     }
        //   }
        // })
				const system = await SystemModel.findOne({id: id})
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
  async updateLocation(req, res, next){
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
			const {id, name, lat , lng , address} = fields; //location id
			try{
				if (!name || !lat || !lng || !address || !id) {
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
				await SystemModel.findOneAndUpdate(
          {'location.id':id},
          {
            '$set':{
              "location.$.name":name,
              "location.$.lat":lat,
              "location.$.lng":lng,
              "location.$.address":address,
            }
          }
        )
				res.send({
					status: 1,
					message: '修改成功',
				})
			}catch(err){
				console.log('修改地点失败', err);
				res.send({
					status: 0,
					type: 'INTERFACE_FAILED',
					message: '修改地点失败',
				})
			}
		})
	}
  async deleteLocation(req, res, next){
    const id = req.params.id
    if (!id || !Number(id)) {
			console.log('参数错误');
			res.send({
				status: 0,
				type: 'ERROR_PARAMS',
				message: '参数错误',
			})
			return
		}
    try {
      // await SystemModel.findOneAndRemove({'location.id':id})
      await SystemModel.update(
        {'location.id':id},
        {
          '$pull':{
            location:{ id : id },
          }
        }
      )
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
			const {id,name}  = fields; // location id
			try{
				if (!name || !id) {
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
				const system = await SystemModel.findOne({"location.id": id},'location.$')
				if (!system) {
					console.log('系统不存在');
					res.send({
						status: 0,
						type: 'SYSTEM_NOT_EXIST',
						message: '该系统不存在',
					})
				}else{
					const room_id = await this.getId('room_id');
					const newRoom = {
						id: room_id,
            name: name,
						create_time: dtime().format('YYYY-MM-DD'),
            device: [],
					}
          system.location[0].room = system.location[0].room.concat(newRoom)
          await SystemModel.findOneAndUpdate(
            {'location.id':id},
            {
              '$set':{
                "location.$.room":system.location[0].room,
              }
            }
          )
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
  async updateRoom(req, res, next){
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
			const {id, name } = fields; //room id
			try{
				if (!name || !id) {
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
				// await SystemModel.findOneAndUpdate(
        //   {'location.room.id':id},
        //   {
        //     '$set':{
        //       "location.$.$.name":name,
        //     }
        //   }
        // )
				res.send({
					status: 1,
					message: '修改成功',
				})
			}catch(err){
				console.log('修改房间失败', err);
				res.send({
					status: 0,
					type: 'INTERFACE_FAILED',
					message: '修改房间失败',
				})
			}
		})
	}
  async deleteRoom(req, res, next){
    const id = req.params.id
    if (!id || !Number(id)) {
			console.log('参数错误');
			res.send({
				status: 0,
				type: 'ERROR_PARAMS',
				message: '参数错误',
			})
			return
		}
    try {
      // await SystemModel.findOneAndRemove({'location.id':id})
      await SystemModel.update(
        {'location.id':id},
        {
          '$pull':{
            location:{ id : id },
          }
        }
      )
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

}

export default new System()
