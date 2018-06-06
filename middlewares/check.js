'use strict';

import UserModel from '../models/user/user'

class Check {
	constructor(){

	}
	async checkAdmin(req, res, next){
		const token = req.query;
		if (!token || !Number(token)) {
			res.send({
				status: 0,
				type: 'HAS_NO_ACCESS',
				message: '无操作权限',
			})
			return
		}else{
			const user = await UserModel.findOne({token: token});
			if (!user) {
				res.send({
					status: 0,
					type: 'HAS_NO_ACCESS',
					message: '无操作权限',
				})
				return
			} else if(user.role_id != 1){
				res.send({
					status: 0,
					type: 'HAS_NO_ACCESS',
					message: '无操作权限',
				})
				return
			}
		}
		next()
	}
}

export default new Check()
