'use strict';

import PointModel from '../../models/system/point'
import AlarmModel from '../../models/system/alarm'
import BaseComponent from '../../prototype/baseComponent'
import crypto from 'crypto'
import formidable from 'formidable'
import dtime from 'time-formater'

class Sensor extends BaseComponent{
	constructor(){
		super()
	}
	
  async getAllPoint(req, res, next){
    try{
			// const allSystem = await SystemModel.find({}, '-__v -location.room.device')
      const allPoint = await PointModel.find({}, '-__v').populate({path:'alarm'})
			res.send({
				status: 1,
				data: {data:allPoint}
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
    async addPoint(req, res, next){
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
			const { name, pointEnum,alarm} = fields; 
			try{
				if (!name || !pointEnum || !alarm) {
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
				alarm.alarmEnum.forEach(item=>{
					delete item._id
				})
				// console.log(alarm.alarmEnum)
				const newAlarm = {
					alarmEnum:alarm.alarmEnum,
					create_time: dtime().format('YYYY-MM-DD'),
				}
				var result = await AlarmModel.create(newAlarm)
				console.log(result)
				const newPoint = {
                    name: name,
					create_time: dtime().format('YYYY-MM-DD'),
					pointEnum: pointEnum,
					alarm:result._id,
				}
				await PointModel.create(newPoint)
                res.send({
                    status: 1,
                    message: '添加成功',
			    })
			}catch(err){
				console.log('添加点表失败', err);
				res.send({
					status: 0,
					type: 'INTERFACE_FAILED',
					message: '添加点表失败',
				})
			}
		})
	}
  async updatePoint(req, res, next){
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
			const {_id, name, pointEnum,alarm} = fields; //point id
			try{
				if (!_id || !name || !pointEnum || !alarm) {
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
				await AlarmModel.findOneAndUpdate({'_id':alarm._id},alarm)
				await PointModel.findOneAndUpdate({'_id':_id},{$set:{name:name,pointEnum:pointEnum}})
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
  async deletePoint(req, res, next){
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
      await PointModel.findOneAndRemove({'_id':_id})
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
  async getAllAlarm(req, res, next){
    try{
			// const allSystem = await SystemModel.find({}, '-__v -location.room.device')
      const allAlarm = await AlarmModel.find({}, '-__v')
			res.send({
				status: 1,
				data: {data:allAlarm}
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
   

}

export default new Sensor()
