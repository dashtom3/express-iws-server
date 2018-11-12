'use strict';

import PointModel from '../../models/system/point'
import SensorModel from '../../models/system/sensor'
import DataModel from '../../models/system/data'
import UserModel from '../../models/user/user'
import DeviceModel from '../../models/system/device'
import SystemModel from '../../models/system/system'
import RoomModel from '../../models/system/room'
import BaseComponent from '../../prototype/baseComponent'
import formidable from 'formidable'
import config from 'config-lite'
import axios from 'axios'
import dtime from 'time-formater'
import xlsx from 'node-xlsx';
import fs from 'fs';
// import Sensor from '../../models/system/sensor';
import { stringify } from 'querystring';
import mongoose from 'mongoose'
// import request from 'request'

class Data extends BaseComponent{
	constructor(){
        super()
        this.getHistoryData = this.getHistoryData.bind(this)
        this.getRealData = this.getRealData.bind(this)
        this.exportHistoryData = this.exportHistoryData.bind(this)
    }

    async getHistoryData(req, res, next){
        const _id = req.params._id    //sensor id
        const {pageSize	= 30, pageNum = 1,interval=60000, fromDate = new Date().getTime()-1000*60*60*24,toDate=new Date().getTime()} = req.query;
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

            var tempBoundary = []
            for(var i=0;i<=(dtime(toDate).format('x')-dtime(fromDate).format('x'))/interval;i++){
                var tempB = parseInt(dtime(fromDate).format('x'))+interval*i
                
                tempBoundary.push(dtime(tempB).format('YYYY-MM-DD HH:mm:ss'))
            }
            // console.log(tempBoundary)
            const data = await DataModel.aggregate(
                    {$match:{'sensor':mongoose.Types.ObjectId(_id)}},
                    {$sort:{'create_time':1}},
                    {$match:{'create_time': { $gte : dtime(fromDate).format('YYYY-MM-DD HH:mm:ss'), $lte : dtime(toDate).format('YYYY-MM-DD HH:mm:ss') } }},
                    {$bucket:
                        {groupBy:'$create_time'
                        ,boundaries: tempBoundary
                        ,output:{create_time:{$first:'$create_time'},data:{$first:"$data"}}}
                         
                    },
                    {$skip:Number(pageSize*(pageNum-1))},
                    {$limit:Number(pageSize)} 
            )
            // console.log(data)
            const sensor = await SensorModel.find({_id:_id},'-data -alarmData -oldAlarmData').populate('point')
            // console.log(sensor)
            var result
            if(data.length>0){
               result = this.analyseData(data,sensor[0].transfer_type,sensor[0].point)
               const datacount = await DataModel.aggregate(
                    {$match:{'sensor':mongoose.Types.ObjectId(_id)}},
                    {$sort:{'create_time':1}},
                    {$match:{'create_time': { $gte : dtime(fromDate).format('YYYY-MM-DD HH:mm:ss'), $lte : dtime(toDate).format('YYYY-MM-DD HH:mm:ss') } }},
                    {$bucket:
                        {groupBy:'$create_time'
                        ,boundaries: tempBoundary
                        ,output:{create_time:{$first:'$create_time'},data:{$first:"$data"}}}
                        
                    }
                )
               const totalPage = parseInt((datacount.length-1)/pageSize+1)
                
                res.send({
                    status: 1,
                    data: {data:{point:sensor[0].point,data:result},page:{pageNum:parseInt(pageNum),pageSize:parseInt(pageSize),totalPage:totalPage}}
                })                          
            }else {
                res.send({
                    status: 1,
                    data: {data:{point:sensor[0].point,data:[]},page:{pageNum:parseInt(pageNum),pageSize:parseInt(pageSize),totalPage:1}}
                })
            }
            
            
        }catch(err){
			console.log('读取失败', err);
			res.send({
				status: 0,
				type: 'ERROR_GET_LIST',
				message: '读取失败'
			})
		}
    }
    async exportHistoryData(req, res, next){
        const _id = req.params._id    //sensor id
        const {interval=60000, fromDate = new Date().getTime()-1000*60*60*24,toDate=new Date().getTime(),token} = req.query;
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

            var tempBoundary = []
            for(var i=0;i<=(dtime(toDate).format('x')-dtime(fromDate).format('x'))/interval;i++){
                var tempB = parseInt(dtime(fromDate).format('x'))+interval*i
                
                tempBoundary.push(dtime(tempB).format('YYYY-MM-DD HH:mm:ss'))
            }
            // console.log(tempBoundary)
            const data = await DataModel.aggregate(
                    {$match:{'sensor':mongoose.Types.ObjectId(_id)}},
                    {$sort:{'create_time':1}},
                    {$match:{'create_time': { $gte : dtime(fromDate).format('YYYY-MM-DD HH:mm:ss'), $lte : dtime(toDate).format('YYYY-MM-DD HH:mm:ss') } }},
                    {$bucket:
                        {groupBy:'$create_time'
                        ,boundaries: tempBoundary
                        ,output:{create_time:{$first:'$create_time'},data:{$first:"$data"}}}
                         
                    }
            )
            // console.log(data)
            const sensor = await SensorModel.find({_id:_id},'-data -alarmData -oldAlarmData').populate('point')
            // console.log(sensor)
            var result
            
            result = this.analyseData(data,sensor[0].transfer_type,sensor[0].point)
            
            var tempData = []
            var tempData2 = ["时间"]
            sensor[0].point.pointEnum.forEach(poi=>{
                tempData2.push(poi.name)
            })
            tempData.push(tempData2)
            result.forEach(res=>{
                tempData2 = []
                tempData2.push(res.create_time)
                res.data.forEach(resdata=>{
                    tempData2.push(resdata)
                })
                tempData.push(tempData2)
            })

            var buffer = xlsx.build([{name:'mySheetname',data:tempData}])
            const fileName  = 'data'+(new Date().getTime())+token+'.xlsx'
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
    async getRealData(req,res,next){
        const _id = req.params._id   // room id
        if (_id == null) {
            console.log('参数错误');
            res.send({
                status: 0,
                type: 'ERROR_PARAMS',
                message: '参数错误', 
            })
            return
        }
        try {
            const room = await RoomModel.findOne({'_id':_id}).populate({path:'device',populate:{path:"sensor",select:'-alarmData -oldAlarmData',populate:[{path:'point'},{path:'alarm'}]}})
            if(!room){
                res.send({
                    status: 0,
                    type: 'ERROR_PARAMS',
                    message: '房间不存在', 
                })
                return 
            }
            // console.log(room)
            var result = {};
            room.device.forEach(dev=>{
                result[dev.name] = [{},[]]
                dev.sensor.forEach(sen=>{
                    if(sen.data  != null){
                        var temp = this.analyseData([sen.data],sen.transfer_type,sen.point)
                        // console.log(temp[0].data)
                        temp[0].data.forEach((tempData,index)=>{
                            // console.log(tempData,index)
                            result[dev.name][0][sen.point.pointEnum[index].name] = tempData
                        })
                        result[dev.name][1].push(sen)
                    }
                    
                })
            })
            
             
            // console.log(sensor)
            res.send({
                status: 1,
                data: result
            })
        }
        catch(err){
            console.log('获取失败', err);
            res.send({
                status: 0,
                type: 'ERROR_GET_LIST',
                message: '获取失败'
            })
        }   
    }
    //isMe 默认 0 全部报警
    async getAlarmRealData(req, res, next){
        const {isMe=0,_id,token} = req.query; //user id
        console.log(req.query)
        if ((isMe == null) || !token  ) {
                console.log('参数错误');
                res.send({
                    status: 0,
                    type: 'ERROR_PARAMS',
                    message: '参数错误', 
                })
                return
            }
        try {
            const user = await UserModel.findOne({'token':token}).populate({path:'role',populate:{path:'location',populate:{path:"room",populate:{path:"device",populate:{path:"sensor"}}}}})
            if(!user){
                res.send({
                    status: 0,
                    type: 'ERROR_PARAMS',
                    message: '用户不存在', 
                })
                return 
            }
            var sensor;
            // console.log(user)
            if(isMe == 1) {
                sensor = await SensorModel.find({'alarmData':{$ne: null},'alarmData.worker':mongoose.Types.ObjectId(user._id)},'-oldData -oldAlarmData').populate('alarmData.worker')
            } else {
                var tempParam = {'alarmData':{$ne: null}}
                if(_id != null && _id != ''){
                    tempParam['alarmData.worker'] =mongoose.Types.ObjectId(_id)
                }
                sensor = await SensorModel.find(tempParam,'-oldData -oldAlarmData').populate('alarmData.worker')
                if(user.role.type == 0){
                    var temp = []
                    sensor.forEach(sen=>{
                        user.role.location.forEach(loc=>{
                            loc.room.forEach(room=>{
                               room.device.forEach(dev=>{
                                   dev.sensor.forEach(sensor=>{
                                        if(sen._id+"" == sensor._id+""){
                                            temp.push(sen)
                                        } 
                                   })
                               })
                            })
                        })
                    })
                    sensor = temp
                }
                
            }
            
            // console.log(sensor)
            res.send({
                status: 1,
                data: sensor
            })
        }
        catch(err){
            console.log('获取失败', err);
            res.send({
                status: 0,
                type: 'ERROR_GET_LIST',
                message: '获取失败'
            })
        }   
    }
    async getAlarmHistoryData(req, res, next){
        // const _id = req.params._id    //sensor id
        const {pageSize	= 30, pageNum = 1,_id,fromDate=new Date().getTime()-1000*60*60*24*60,toDate=new Date().getTime(),isMe=0,token} = req.query;
        try {
            // SensorModel.findOne({'_id':_id},'-oldAlarmData -data -alarmData').sort({'_id':-1}).skip(Number(pageSize*(pageNum-1))).limit(Number(pageSize))
            // console.log(new Date(fromDate))
            var sensor;
            const user = await UserModel.findOne({'token':token}).populate({path:'role',populate:{path:'location',populate:{path:"room",populate:{path:"device",populate:{path:"sensor"}}}}})
            if(!user){
                res.send({
                    status: 0,
                    type: 'ERROR_PARAMS',
                    message: '用户不存在', 
                })
                return 
            }
            if(isMe == 1){
                
                sensor = await SensorModel.aggregate(
                    // {$match:{},
                    {$unwind:'$oldAlarmData'},
                    // {$match:},
                    {$match:{'oldAlarmData.worker':mongoose.Types.ObjectId(user._id),'oldAlarmData.create_time': { $gte : dtime(fromDate).format('YYYY-MM-DD HH:mm:ss'), $lte : dtime(toDate).format('YYYY-MM-DD HH:mm:ss') } }},
                    {$project : { ip : 1 ,zhan : 1 ,oldAlarmData : 1 }},
                    {$sort:{'oldAlarmData.create_time':-1}},
                    {$skip:Number(pageSize*(pageNum-1))},
                    {$limit:Number(pageSize)}
                    // {$group:{_id:"$_id",oldData:{$push:"$oldAlarmData"}}}
                )
                console.log(sensor)
            }else {
                var tempParam = {'oldAlarmData.create_time': { $gte : dtime(fromDate).format('YYYY-MM-DD HH:mm:ss'), $lte : dtime(toDate).format('YYYY-MM-DD HH:mm:ss') } }
                if(_id != null && _id != ''){
                    tempParam['oldAlarmData.worker'] = mongoose.Types.ObjectId(_id)
                }
                if(user.role.type == 0){
                    var temp = []
                    user.role.location.forEach(loc=>{
                        loc.room.forEach(room=>{
                            room.device.forEach(dev=>{
                                dev.sensor.forEach(sensor=>{
                                    temp.push(sensor._id)
                                })
                            })
                        })
                    })
                    tempParam['_id'] = {$in:temp}
                }
                sensor = await SensorModel.aggregate(
                    // {$match:{'_id':mongoose.Types.ObjectId(_id)}},
                    {$unwind:'$oldAlarmData'},
                    {$match:tempParam},
                    {$project : { ip : 1 ,zhan : 1 ,oldAlarmData : 1 }},
                    {$sort:{'oldAlarmData.create_time':-1}},
                    {$skip:Number(pageSize*(pageNum-1))},
                    {$limit:Number(pageSize)}
                    // {$group:{_id:"$_id",oldData:{$push:"$oldAlarmData"}}}
                )
                console.log(sensor)
            } 
            if(sensor.length > 0){
                var total;
                if(isMe == 1){
                    total = await SensorModel.aggregate(
                        {$unwind:'$oldAlarmData'},
                        {$match:{'oldAlarmData.worker':mongoose.Types.ObjectId(user._id),'oldAlarmData.create_time': { $gte : dtime(fromDate).format('YYYY-MM-DD HH:mm:ss'), $lte : dtime(toDate).format('YYYY-MM-DD HH:mm:ss') } }},
                        {$count:"totalNum"})
                } else {
                    var tempParam = {'oldAlarmData.create_time': { $gte : dtime(fromDate).format('YYYY-MM-DD HH:mm:ss'), $lte : dtime(toDate).format('YYYY-MM-DD HH:mm:ss') } }
                    if(_id != null && _id != ''){
                        tempParam['oldAlarmData.worker'] = mongoose.Types.ObjectId(_id)
                    }
                    if(user.role.type == 0){
                        var temp = []
                        user.role.location.forEach(loc=>{
                            loc.room.forEach(room=>{
                                room.device.forEach(dev=>{
                                    dev.sensor.forEach(sensor=>{
                                        temp.push(sensor._id)
                                    })
                                })
                            })
                        })
                        tempParam['_id'] = {$in:temp}
                    }
                    total = await SensorModel.aggregate(
                        {$unwind:'$oldAlarmData'},
                        {$match:tempParam},
                        {$count:"totalNum"})
                }
                console.log(total)
                res.send({
                    status: 1,
                    data: {data:sensor,page:{pageNum:parseInt(pageNum),pageSize:parseInt(pageSize),totalPage:parseInt((total[0].totalNum-1)/pageSize+1)}}
                })
            }else {
                // console.log(sensor)
                res.send({
                    status: 1,
                    data: {data:[],page:{pageNum:parseInt(pageNum),pageSize:parseInt(pageSize),totalPage:0}}
                })
            }
            
        }catch(err){
			console.log('读取失败', err);
			res.send({
				status: 0,
				type: 'ERROR_GET_LIST',
				message: '读取失败'
			})
		}
    }
    async exportAlarmHistoryData(req, res, next){
        // const _id = req.params._id    //sensor id
        const {_id,fromDate=new Date().getTime()-1000*60*60*24*60,toDate=new Date().getTime(),token} = req.query;
        try {
            // SensorModel.findOne({'_id':_id},'-oldAlarmData -data -alarmData').sort({'_id':-1}).skip(Number(pageSize*(pageNum-1))).limit(Number(pageSize))
            // console.log(new Date(fromDate))
            
            var user;
            
            var tempParam = {'oldAlarmData.create_time': { $gte : dtime(fromDate).format('YYYY-MM-DD HH:mm:ss'), $lte : dtime(toDate).format('YYYY-MM-DD HH:mm:ss') } }
            if(_id != null && _id != ''){
                tempParam['oldAlarmData.worker'] = mongoose.Types.ObjectId(_id)
            }
            var sensor = await SensorModel.aggregate(
                // {$match:{'_id':mongoose.Types.ObjectId(_id)}},
                {$unwind:'$oldAlarmData'},
                {$match:tempParam},
                {$project : { ip : 1 ,zhan : 1 ,oldAlarmData : 1 }},
                {$sort:{'oldAlarmData.create_time':-1}}
                // {$group:{_id:"$_id",oldData:{$push:"$oldAlarmData"}}}
            )
            var allSystem = await SystemModel.find({}, '-__v').populate({path:'location',populate:{path:'room',populate:{path:'device',populate:{path:"sensor",select:'-data -oldData -alarmData -oldAlarmData'}}}})
            var allUser = await UserModel.find({},'-video')
            var tempData = [["报警开始时间","报警结束时间","系统","地点信息","设备信息","报警信息","其他信息","负责人员","分配时间","完成时间"]]
            sensor.forEach(sen=>{
                var tempData2 = [sen.oldAlarmData.create_time,sen.oldAlarmData.stop_time]
                var temptt = false
                allSystem.forEach(sys=>{
                    sys.location.forEach(loc=>{
                        loc.room.forEach(room=>{
                            room.device.forEach(dev=>{
                                dev.sensor.forEach(sensor2=>{
                                    if(sen._id+"" == sensor2._id+""){
                                        temptt = true
                                        tempData2.push(sys.name)
                                        tempData2.push(loc.name+":"+room.name)
                                        tempData2.push(dev.name)
                                    }
                                })
                            })
                        })
                    })
                })
                if(temptt == false){
                    tempData2.push("无")
                    tempData2.push("无")
                    tempData2.push("无")
                }
                tempData2.push(sen.oldAlarmData.info)
                tempData2.push("传感器信息:"+sen.ip+":"+sen.zhan)
                if(sen.oldAlarmData.worker != null){
                    var tempUser = false
                    allUser.forEach(user=>{
                        if(user._id+"" == sen.oldAlarmData.worker+""){
                            tempUser = true
                            tempData2.push(user.realName+","+user.phone)
                        }
                    })
                    if(tempUser == false){
                        tempData2.push("无负责")
                    }
                }else {
                    tempData2.push("无负责")
                }
                if(sen.oldAlarmData.worker_time){
                    tempData2.push(sen.oldAlarmData.worker_time)
                }else {
                    tempData2.push("无")
                }
                if(sen.oldAlarmData.finish_time){
                    tempData2.push(sen.oldAlarmData.finish_time)
                }else {
                    tempData2.push("无")
                }
                tempData.push(tempData2)
            })
            //console.log(tempData)
            //console.log(result)  
            var buffer = xlsx.build([{name:'mySheetname',data:tempData}])
            const fileName  = 'alarm'+(new Date().getTime())+token+'.xlsx'
            fs.writeFile('./fileExcel/'+fileName,buffer,(data)=>{
                // console.log(data)
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
    async startRead(req, res, next){
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
            const device = await DeviceModel.findOne({'_id':_id}).populate({path:'sensor',select:'-data -oldData -oldAlarmData',populate:[{path:'point'},{path:'alarm'}]})
            console.log('开关设备',device)
            
            if(device.sensor[0].isStart == false) {
                var p = await axios.post(config.data_ip+config.api.start,device)
                if(p.data.status ==1) {
                    await SensorModel.findOneAndUpdate({'_id':device.sensor[0]._id},{$set:{isStart:true}})
                    res.send({
                        status: 1,
                        message: '开启成功'
                    })
                }else {
                    res.send({
                        status: 0,
                        message: '开启失败'
                    })
                }
                
            }else {
                var p = await axios.post(config.data_ip+config.api.stop,device)
                if(p.data.status ==1) {
                    await SensorModel.findOneAndUpdate({'_id':device.sensor[0]._id},{$set:{isStart:false}})
                    res.send({
                        status: 1,
                        message: '关闭成功'
                    })
                }else {
                    res.send({
                        status: 0,
                        message: '关闭失败'
                    })
                }
            }
        }catch(err){
			console.log('开启失败', err);
			res.send({
				status: 0,
				type: 'ERROR_GET_LIST',
				message: '开启失败'
			})
		}
    }
    async control(req, res, next){
        const {token} = req.query
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
			const {transfer_type,ip,zhan,startAddress,datalength,bitnum,buffer} = fields;   //sensor id
            console.log(fields)
            try{
				if (transfer_type == null ||!ip || !zhan || bitnum == null || startAddress==null || datalength == null || buffer == null) {
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
                let user = await UserModel.findOne({token:token}).populate('role')
                console.log(user) 
                if(user.role.type == 0 && user.role.isWrite == 0){
                    res.send({
                        status: 0,
                        type: 'role_error',
                        message: '权限不足',
                    })
                    return 
                }
                var result = await axios.post(config.data_ip+config.api.control,{bitnum:bitnum,transfer_type:transfer_type,ip:ip,zhan:zhan,startAddress:startAddress,datalength:datalength,buffer:buffer})
                console.log(result)
                res.send(result.data)
			}catch(err){
				console.log('控制失败', err);
				res.send({
					status: 0,
					type: 'INTERFACE_FAILED',
					message: '控制失败',
				})
			}
		})
	}
    
}

export default new Data()
