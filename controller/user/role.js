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
			const {name, location_ids} = fields;
			try{
				if (!name || !location_ids) {
					throw new Error('参数错误')
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
          location:location_ids,
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
			const {id, name , location_ids} = fields;
			try{
				if (!id || !name || !location_ids) {
					throw new Error('参数错误')
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
          await SystemModel.findOneAndUpdate({_id:id},{$set:{name:name,location:location_ids}})
  				res.send({
  					status: 1,
  					message: '更新成功',
  				})
				}
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
      await RoleModel.findOneAndRemove({_id:id})
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
		const {pageSize	= 10, pageNum = 1} = req.query;
		try{
			const allRole = await RoleModel.find({}, '-__v').sort({id: -1}).skip(Number(pageSize*(pageNum-1))).limit(Number(pageSize))
			res.send({
				status: 1,
				data: {data:allRole,page:{pageNum:pageNum,pageSize:pageSize}}
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
