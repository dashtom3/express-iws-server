'use strict';

import SystemModel from '../../models/system/system'
import BaseComponent from '../../prototype/baseComponent'
import crypto from 'crypto'
import formidable from 'formidable'
import dtime from 'time-formater'

class System extends BaseComponent{
	constructor(){
		super()
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
				const newSystem = {
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
				await SystemModel.findOneAndUpdate({_id:id},{$set:{name:name,pic:pic}})
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
    if (!id) {
			console.log('参数错误');
			res.send({
				status: 0,
				type: 'ERROR_PARAMS',
				message: '参数错误',
			})
			return
		}
    try {
      await SystemModel.findOneAndRemove({_id:id})
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
			// const allSystem = await SystemModel.find({}, '-__v -location.room.device')
      const allSystem = await SystemModel.find({}, '-__v')
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
				const system = await SystemModel.findOne({_id: id})
				if (!system) {
					console.log('系统不存在');
					res.send({
						status: 0,
						type: 'SYSTEM_NOT_EXIST',
						message: '该系统不存在',
					})
				}else{
					const newLocation = {
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
          {'location._id':id},
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
    if (!id) {
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
        {'location._id':id},
        {
          '$pull':{
            location:{ _id : id },
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
				const system = await SystemModel.findOne({"location._id": id},'location.$')
				if (!system) {
					console.log('系统不存在');
					res.send({
						status: 0,
						type: 'SYSTEM_NOT_EXIST',
						message: '该系统不存在',
					})
				}else{
					const newRoom = {
            name: name,
						create_time: dtime().format('YYYY-MM-DD'),
            device: [],
					}
          system.location[0].room = system.location[0].room.concat(newRoom)
          await SystemModel.findOneAndUpdate(
            {'location._id':id},
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
        const system = await SystemModel.findOne({'location.room._id':id},'location.room.$')
        system.location[0].room.forEach(function(item){
          if(item._id == id) {
            item.name = name
          }
        })
        await SystemModel.findOneAndUpdate(
          {'location.room._id':id},
          {
            '$set':{
              "location.$.room":system.location[0].room,
            }
          }
        )
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
    if (!id) {
			console.log('参数错误');
			res.send({
				status: 0,
				type: 'ERROR_PARAMS',
				message: '参数错误',
			})
			return
		}
    try {
      const system = await SystemModel.findOne({'location.room._id':id},'location.room.$')
      var temp;
      system.location[0].room.forEach(function(item,index){
        if(item._id == id) {
          temp = index
        }
      })
      system.location[0].room.splice(temp,1)
      await SystemModel.findOneAndUpdate(
        {'location.room._id':id},
        {
          '$set':{
            "location.$.room":system.location[0].room,
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
  async addDevice(req, res, next){
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
			const {id,name}  = fields; // room id
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
				const system = await SystemModel.findOne({"location.room._id": id},'location.$')
				if (!system) {
					console.log('系统不存在');
					res.send({
						status: 0,
						type: 'SYSTEM_NOT_EXIST',
						message: '该系统不存在',
					})
				}else{
          console.log(system.location[0].room)
					const newDevice = {
            name: name,
						create_time: dtime().format('YYYY-MM-DD'),
					}
          system.location[0].room.forEach(function(item){
            if(item._id == id) {
              item.device = item.device.concat(newDevice)
            }
          })
          console.log(system.location[0].room)
          await SystemModel.findOneAndUpdate(
            {'location.room._id':id},
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
  async updateDevice(req, res, next){
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
			const {id, name } = fields; //device id
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
        const system = await SystemModel.findOne({'location.room.device._id':id},'location.room.device.$')
        system.location[0].room.forEach(function(item){
          item.device.forEach(function(item2){
            if(item2._id == id) {
              item2.name = name
            }
          })
        })
        await SystemModel.findOneAndUpdate(
          {'location.room.device._id':id},
          {
            '$set':{
              "location.$.room":system.location[0].room,
            }
          }
        )
				res.send({
					status: 1,
					message: '修改成功',
				})
			}catch(err){
				console.log('修改设备失败', err);
				res.send({
					status: 0,
					type: 'INTERFACE_FAILED',
					message: '修改设备失败',
				})
			}
		})
	}
  async deleteDevice(req, res, next){
    const id = req.params.id
    if (!id) {
			console.log('参数错误');
			res.send({
				status: 0,
				type: 'ERROR_PARAMS',
				message: '参数错误',
			})
			return
		}
    try {
      const system = await SystemModel.findOne({'location.room.device._id':id},'location.room.device.$')
      var temp;
      system.location[0].room.forEach(function(item,index){
        item.device.forEach(function(item2){
          console.log(item2._id,id)
          if(item2._id == id) {
            temp = index
          }
        })
        if(temp){
          item.device.splice(temp,1)
          console.log(temp)
        }
      })
      console.log(system.location[0].room[0].device)
      await SystemModel.findOneAndUpdate(
        {'location.room.device._id':id},
        {
          '$set':{
            "location.$.room":system.location[0].room,
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
