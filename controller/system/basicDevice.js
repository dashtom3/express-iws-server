'use strict';

import BasicDeviceModel from '../../models/system/basicDevice'
import BaseComponent from '../../prototype/baseComponent'
import crypto from 'crypto'
import formidable from 'formidable'
import dtime from 'time-formater'

class BasicDevice extends BaseComponent{
	constructor(){
		super()

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
        const {name ,sensor} = fields
  			try{
  				if (!name || !sensor) {
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
  				const basicDevice_id = await this.getId('basicDevice_id');
  				const newDevice = {
  					id: basicDevice_id,
            name: name,
            sensor: sensor,
  					create_time: dtime().format('YYYY-MM-DD'),
  				}
  				await BasicDeviceModel.create(newDevice)
  				res.send({
  					status: 1,
  					message: '添加成功',
  				})
  			}catch(err){
  				console.log('添加基本设备失败', err);
  				res.send({
  					status: 0,
  					type: 'INTERFACE_FAILED',
  					message: '添加基本设备失败',
  				})
  			}
        res.send({
					status: 0,
					type: 'INTERFACE_FAILED',
					message: '添加基本设备失败',
				})
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
    async deleteDevice(req, res, next){
      const id = req.params.id
      if (!id ) {
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
    async getAllDevice(req, res, next){
      try{
  			// const allSystem = await SystemModel.find({}, '-_id -__v -location.room.device').sort({id: -1})
        const allSystem = await SystemModel.find({}, '-_id -__v').sort({id: -1})
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

}

export default new BasicDevice()
