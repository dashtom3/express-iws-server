'use strict';

import SystemModel from '../../models/system/system'
import LocationModel from '../../models/system/location'
import RoomModel from '../../models/system/room'
import DeviceModel from '../../models/system/device'
import SensorModel from '../../models/system/sensor'
import AlarmModel from '../../models/system/alarm'
import BaseComponent from '../../prototype/baseComponent'
import crypto from 'crypto'
import formidable from 'formidable'
import dtime from 'time-formater'
import Sensor from '../../models/system/sensor';

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
					location:[],
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
			const {_id ,name, pic} = fields;
			try{
				if (!_id || !name || !pic) {
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
				await SystemModel.findOneAndUpdate({_id:_id},{$set:{name:name,pic:pic}})
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
      await SystemModel.findOneAndRemove({_id:_id})
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
      const allSystem = await SystemModel.find({}, '-__v').populate({path:'location',populate:{path:'room',populate:{path:'device',populate:{path:"sensor",select:'-data -oldData -alarmData -oldAlarmData',populate:[{path:'point'},{path:'alarm'}]}}}})
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
			const {_id, name, lat , lng , address} = fields; //system id
			try{
				if (!name || !lat || !lng || !address || !_id) {
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
				const system = await SystemModel.findOne({_id: _id})
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
					var result = await LocationModel.create(newLocation)
          system.location = system.location.concat(result._id)
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
			const {_id, name, lat , lng , address} = fields; //location id
			try{
				if (!name || !lat || !lng || !address || !_id) {
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
				await LocationModel.findOneAndUpdate({'_id':_id},{$set:{name:name,lat:lat,lng:lng,address:address}})
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
      await LocationModel.findOneAndRemove({'_id':_id})
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
			const {_id,name}  = fields; // location id
			try{
				if (!name || !_id) {
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
				const location = await LocationModel.findOne({"_id": _id})
				if (!location) {
					console.log('地点不存在');
					res.send({
						status: 0,
						type: 'LOCATION_NOT_EXIST',
						message: '该地点不存在',
					})
				}else{
					const newRoom = {
            name: name,
						create_time: dtime().format('YYYY-MM-DD'),
            device: [],
					}
					var result = await RoomModel.create(newRoom)
          location.room = location.room.concat(result._id)
          await location.save()
					res.send({
						status: 1,
						message: '添加成功',
					})
				}
			}catch(err){
				console.log('添加房间失败', err);
				res.send({
					status: 0,
					type: 'INTERFACE_FAILED',
					message: '添加房间失败',
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
			const {_id, name } = fields; //room id
			try{
				if (!name || !_id) {
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
				await RoomModel.findOneAndUpdate({'_id':_id},{$set:{name:name}})
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
      await RoomModel.findOneAndRemove({'_id':_id})
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
			const {_id,name,sensor,ip,transfer_type}  = fields; // room id
			console.log(_id,name,sensor,ip,transfer_type)
			try{
				if (!name || !_id || !sensor || !ip || (transfer_type== null) ){
					throw new Error('不能为空')
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
				const room = await RoomModel.findOne({"_id": _id})
				if (!room) {
					console.log('房间不存在');
					res.send({
						status: 0,
						type: 'LOCATION_NOT_EXIST',
						message: '该房间不存在',
					})
				}else{
					var sensorArray = []
					for(var i=0;i<sensor.length;i++){
						for(var j=0;j<sensor[i].alarm.alarmEnum.length;j++){
							delete sensor[i].alarm.alarmEnum[j]._id
						}
						var newSensor = {
							transfer_type: transfer_type,
							point:sensor[i].point,
							create_time:dtime().format('YYYY-MM-DD'),
							ip:ip,
							zhan:sensor[i].zhan,
							isStart:false,
							data:null,
							oldData:[],
							alarmData:null,
							oldAlarmData:[],
						}
						if(sensor[i].alarm._id){
							newSensor.alarm = sensor[i].alarm._id
						}else {
							var newAlarm = {
								alarmEnum:sensor[i].alarm.alarmEnum,
								create_time:dtime().format('YYYY-MM-DD'),
							}
							var alarmResult = await AlarmModel.create(newAlarm)
							newSensor.alarm = alarmResult._id
						}
						sensorArray.push(newSensor)
					}
					var sensorResult = await SensorModel.create(sensorArray)
 
					var sensorTemp = []
					sensorResult.forEach(function(item){
						sensorTemp.push(item._id)
					})

					const newDevice = {
            			name: name,
						create_time: dtime().format('YYYY-MM-DD'),
            			sensor: sensorTemp,
					}

					var result = await DeviceModel.create(newDevice)
          			room.device = room.device.concat(result._id)
          			await room.save()
					res.send({
						status: 1,
						message: '添加成功',
					})
				}
			}catch(err){
				console.log('添加房间失败', err);
				res.send({
					status: 0,
					type: 'INTERFACE_FAILED',
					message: '添加房间失败',
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
			const {_id, name,sensor,ip,transfer_type } = fields; //device id
			try{
				if (!name || !_id || !sensor || !ip || (transfer_type == null)) {
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
				var sensorArray = []
				for(var i=0;i<sensor.length;i++){
					var newSensor = {
						transfer_type: transfer_type,
						point:sensor[i].point,
						ip:ip,
						zhan:sensor[i].zhan,
					}
					var p ;
					for(var j=0;j<sensor[i].alarm.alarmEnum.length;j++){
						delete sensor[i].alarm.alarmEnum[j]._id
					}

					if(sensor[i].alarm._id){
						newSensor.alarm = sensor[i].alarm._id
					}else {
						var newAlarm = {
							alarmEnum:sensor[i].alarm.alarmEnum,
							create_time:dtime().format('YYYY-MM-DD'),
						}
						var alarmResult = await AlarmModel.create(newAlarm)
						newSensor.alarm = alarmResult._id
					}
					if(sensor[i]._id){
						newSensor.create_time = sensor[i].create_time,
						p = await SensorModel.findOneAndUpdate({'_id':sensor[i]._id},newSensor)
					} else {
						p = await SensorModel.create(newSensor)
					}
					console.log(p)
					sensorArray.push(p)
				}
				console.log(sensorArray)
				var sensorTemp = []
				sensorArray.forEach(function(item){
						sensorTemp.push(item._id)
				})
				
        		await DeviceModel.findOneAndUpdate({'_id':_id},{$set:{name:name,sensor:sensorTemp}})
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
			var device = await DeviceModel.findOne({'_id':_id})
			for(var i=0;i<device.sensor.length;i++){
				await SensorModel.findOneAndRemove({'_id':device.sensor[i]})
			}
      await DeviceModel.findOneAndRemove({'_id':_id})
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
