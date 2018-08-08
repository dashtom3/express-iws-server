'use strict';

import SensorModel from '../../models/system/sensor'
import SignModel from '../../models/system/sign'
import UserModel from '../../models/user/user'
import BaseComponent from '../../prototype/baseComponent'
import formidable from 'formidable'
import dtime from 'time-formater'
import mongoose from 'mongoose'
import xlsx from 'node-xlsx';
import fs from 'fs';

class Work extends BaseComponent{
	constructor(){
		super() 
    }
    async finishWork(req,res,next){
        const _id = req.params._id
        const {dataId} = req.query; 
        if (!_id || !dataId) {
                console.log('参数错误');
                res.send({
                    status: 0,
                    type: 'ERROR_PARAMS',
                    message: '参数错误', 
                })
                return
        } 
        try {
            var sensor = await SensorModel.findOne({'_id':_id},'-oldData -oldAlarmData -data')
            if(sensor.alarmData._id == dataId) {
                await SensorModel.findOneAndUpdate({'_id':_id},{$set:{'alarmData.finish_time':dtime().format('YYYY-MM-DD HH:mm:ss')}}) 
            }else {
                await SensorModel.findOneAndUpdate({'_id':_id,'oldAlarmData._id':dataId},{$set:{'alarmData.$.finish_time':dtime().format('YYYY-MM-DD HH:mm:ss')}})
            }
            res.send({
				status: 1,
				type: 'ERROR_GET_LIST',
				message: '更新成功'
			})
        }catch(err){
			console.log('读取失败', err);
			res.send({
				status: 0,
				type: 'ERROR_GET_LIST',
				message: '更新失败'
			})
		} 
    }
    async changeWorker(req,res,next){
        const _id = req.params._id
        const {userId,dataId} = req.query;
        if (!_id || !userId || !dataId) {
                console.log('参数错误');
                res.send({
                    status: 0,
                    type: 'ERROR_PARAMS',
                    message: '参数错误', 
                })
                return
        }
        
        // console.log(userId,dataId,_id)
        try {
            var sensor = await SensorModel.findOne({'_id':_id},'-oldData -oldAlarmData -data')
            if(sensor.alarmData._id == dataId) {
                await SensorModel.findOneAndUpdate({'_id':_id},{$set:{'alarmData.worker':mongoose.Types.ObjectId(userId),'alarmData.worker_time':dtime().format('YYYY-MM-DD HH:mm:ss')}}) 
            }else {
                await SensorModel.findOneAndUpdate({'_id':_id,'oldAlarmData._id':dataId},{$set:{'oldAlarmData.$.worker':userId,'alarmData.$.worker_time':dtime().format('YYYY-MM-DD HH:mm:ss')}})
            }
            res.send({
				status: 1,
				type: 'ERROR_GET_LIST',
				message: '更新成功'
			})
        }catch(err){
			console.log('读取失败', err);
			res.send({
				status: 0,
				type: 'ERROR_GET_LIST',
				message: '更新失败'
			})
		}
    }
    async allSign(req,res,next){
        const {isMe=0,pageNum=1,pageSize=30,realnamelike,addresslike,fromDate=new Date().getTime()-1000*60*60*24*60,toDate=new Date().getTime(),token} = req.query;
        console.log(req.query)
        try {
            var totalPage;
            var result;
            if(isMe == 1){
                var user = await UserModel.findOne({'token':token})
                if(!user){
                    res.send({
                        status: 0,
                        type: 'ERROR_PARAMS',
                        message: '用户不存在', 
                    })
                    return 
                }
                result =  await SignModel.find({'user':user._id,'create_time':{$gte : dtime(fromDate).format('YYYY-MM-DD HH:mm:ss'), $lte : dtime(toDate).format('YYYY-MM-DD HH:mm:ss')}}).skip(Number(pageSize*(pageNum-1))).limit(Number(pageSize)).populate('user')
                const datacount = await SignModel.count({'user':user._id,'create_time':{$gte : dtime(fromDate).format('YYYY-MM-DD HH:mm:ss'), $lte : dtime(toDate).format('YYYY-MM-DD HH:mm:ss')}})
                totalPage =  parseInt((datacount-1)/pageSize+1)
            }else {
                const datacount = await SignModel.count({'create_time':{$gte : dtime(fromDate).format('YYYY-MM-DD HH:mm:ss')}})
                totalPage = parseInt((datacount-1)/pageSize+1)
                var tempFind = {'create_time':{$gte : dtime(fromDate).format('YYYY-MM-DD HH:mm:ss'), $lte : dtime(toDate).format('YYYY-MM-DD HH:mm:ss')}}
                if(realnamelike !=null && realnamelike != ''){
                    tempFind.userName = {$regex:realnamelike}
                } 
                if(addresslike != null && addresslike != ''){ 
                    tempFind.realAddress = {$regex:addresslike}
                }
                console.log(tempFind)
                result = await SignModel.find(tempFind).sort({create_time:'-1'}).skip(Number(pageSize*(pageNum-1))).limit(Number(pageSize)).populate('user')
            }
            console.log(result)  
            res.send({
				status: 1,
				data:{data:result,page:{pageNum:pageNum,pageSize:pageSize,totalPage:totalPage}}
			})
        }catch(err){
			console.log('读取失败', err);
			res.send({
				status: 0,
				type: 'ERROR_GET_LIST',
				message: '读取失败'
			})
		}
    }
    async exportSign(req,res,next){
        const {realnamelike,addresslike,fromDate=new Date().getTime()-1000*60*60*24*60,toDate=new Date().getTime(),token} = req.query;
        
        try {
            var totalPage;
            var result;
                // const datacount = await SignModel.count({'create_time':{$gte : dtime(fromDate).format('YYYY-MM-DD HH:mm:ss')}})
                // totalPage = parseInt((datacount-1)/pageSize+1)
                var tempFind = {'create_time':{$gte : dtime(fromDate).format('YYYY-MM-DD HH:mm:ss'), $lte : dtime(toDate).format('YYYY-MM-DD HH:mm:ss')}}
                if(realnamelike !=null && realnamelike != ''){
                    tempFind.userName = {$regex:realnamelike}
                }
                if(addresslike != null && addresslike != ''){
                    tempFind.realAddress = {$regex:addresslike}
                }
                //console.log(tempFind)
                result = await SignModel.find(tempFind).populate('user')
                var tempData = []
                result.forEach(res=>{
                    var tempData2 = [res.create_time,res.userName,res.address,res.lat+","+res.lng,res.realAddress,res.problems,res.teamwork,res.detailMsg]
                    
                    tempData.push(tempData2)
                })
                //console.log(tempData)
                //console.log(result)  
                var buffer = xlsx.build([{name:'mySheetname',data:tempData}])
                const fileName  = 'sign'+(new Date().getTime())+token+'.xlsx'
                fs.writeFile('./fileExcel/'+fileName,buffer,(data)=>{
                    console.log(data)
                    res.send({
                        status: 1,
                        message:'导出成功',
                        src:fileName,
                    })
                })
            
            
        }catch(err){
			console.log('读取失败', err);
			res.send({
				status: 0,
				type: 'ERROR_GET_LIST',
				message: '读取失败'
			})
		}
    }
    async addSign(req,res,next){
        const {token} = req.query;
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
            const {teamwork, problems,detailMsg,lng,lat,userName,address,realAddress} = fields;
            // console.log(teamwork, problems,detailMsg,lng,lat,userName,address,realAddress)
			try{
				if (teamwork==null || problems==null || detailMsg==null|| lng==null|| lat==null|| userName==null || address == null || !token || realAddress == null) {
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
                var user = await UserModel.findOne({'token':token})
                if(!user){
                    res.send({
                        status: 0,
                        type: 'ERROR_PARAMS',
                        message: '用户不存在', 
                    })
                    return 
                }
                var newSign = {
                    teamwork:teamwork,
                    problems:problems,
                    detailMsg:detailMsg,
                    lng:lng,
                    lat:lat,
                    userName:userName,
                    address:address,
                    realAddress:realAddress,
                    create_time:dtime().format('YYYY-MM-DD HH:mm:ss'),
                    user:user._id
                }
                await SignModel.create(newSign)
                res.send({
                    status: 1,
                    type: 'ERROR_GET_LIST',
                    message: '签到成功'
                })
                
            }catch(err){
                console.log('签到失败', err);
                res.send({
                    status: 0,
                    type: 'ERROR_GET_LIST',
                    message: '签到失败'
                })
            }
        })
    }
	
}

export default new Work()
