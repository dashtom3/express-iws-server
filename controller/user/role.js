'use strict';

import RoleModel from '../../models/user/role'
import BaseComponent from '../../prototype/baseComponent'
import crypto from 'crypto'
import formidable from 'formidable'
import dtime from 'time-formater'

class Role extends BaseComponent{
	constructor(){
		super()

	}
	async addRole(req, res, next){
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
			const {name, location_ids,type,isWrite} = fields;
			console.log(fields)
			try{
				if (!name || !location_ids || (type == null) || (isWrite== null)) {
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
        const newRole = {
          name,
		  create_time: dtime().format('YYYY-MM-DD'),
		  isWrite:isWrite,
		  type:type,
		  location:location_ids,
		  video:[],
        }
        await RoleModel.create(newRole)
				res.send({
					status: 1,
					success: '添加成功'
				})
			}catch(err){
				console.log('添加失败', err);
				res.send({
					status: 0,
					type: 'LOGIN_USER_FAILED',
					message: '添加失败',
				})
			}
		})
	}
	async updateRole(req, res, next){
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
			const {_id, name , location_ids,type ,isWrite} = fields;
			try{
				if (!_id || !name || !location_ids || (type == null) || (isWrite == null)) {
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
          await RoleModel.findOneAndUpdate({_id:_id},{$set:{name:name,type:type,isWrite:isWrite,location:location_ids}})
  				res.send({
  					status: 1,
  					message: '更新成功',
  				})
			}catch(err){
				console.log('更新失败', err);
				res.send({
					status: 0,
					type: 'INTERFACE_FAILED',
					message: '更新失败',
				})
			}
		})
	}
  async deleteRole(req, res, next){
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
      await RoleModel.findOneAndRemove({_id:_id})
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
	async getAllRole(req, res, next){
		console.log('获取所有角色')
		try{
			const allRole = await RoleModel.find({}, '-__v')
			res.send({
				status: 1,
				data: {data:allRole}
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

export default new Role()
