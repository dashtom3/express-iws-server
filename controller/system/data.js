'use strict';

import PointModel from '../../models/system/point'
import SensorModel from '../../models/system/sensor'
import DataModel from '../../models/system/data'
import UserModel from '../../models/user/user'
import DeviceModel from '../../models/system/device'
import SystemModel from '../../models/system/system'
import RoomModel from '../../models/system/room'
import BaseComponent from '../../prototype/baseComponent'
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
        const {pageSize	= 30, pageNum = 1,interval=1, fromDate = new Date().getTime()-1000*60*60*24,toDate=new Date().getTime()} = req.query;
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
            // SensorModel.findOne({'_id':_id},'-oldAlarmData -data -alarmData').sort({'_id':-1}).skip(Number(pageSize*(pageNum-1))).limit(Number(pageSize))
            // console.log(new Date(fromDate))
            // const sensor = await SensorModel.aggregate(
            //     {$match:{'_id':mongoose.Types.ObjectId(_id)}},
            //     {$unwind:'$oldData'},
            //     {$match:{'oldData.create_time': { $gte : dtime(fromDate).format('YYYY-MM-DD HH:mm:ss'), $lte : dtime(toDate).format('YYYY-MM-DD HH:mm:ss') } }},
            //     {$sort:{'oldData.create_time':-1}},
            //     {$skip:Number(pageSize*(pageNum-1))},
            //     {$limit:Number(pageSize)},
            //     {$group:{_id:"$_id",oldData:{$push:"$oldData"}}})
            // const sensorPoint = await SensorModel.findOne({'_id':_id},'-oldAlarmData -data -alarmData -oldData').populate('point')
            // // console.log(sensor[0].oldData)
            // // console.log(sensorPoint)
            // if(sensor.length > 0){
            //     const total = await SensorModel.aggregate(
            //         {$match:{_id:mongoose.Types.ObjectId(_id)}},
            //         {$unwind:'$oldData'},
            //         {$match:{'oldData.create_time': { $gte : dtime(fromDate).format('YYYY-MM-DD HH:mm:ss'), $lte : dtime(toDate).format('YYYY-MM-DD HH:mm:ss') } }},
            //         {$group:{_id:"$_id",totalNum:{$sum:1}}})
            //     // const sensor = await SensorModel.aggregate({$match:{_id:mongoose.Types.ObjectId(_id)}}).unwind('oldData').sort({'oldData.create_time':-1}).skip(Number(pageSize*(pageNum-1))).limit(Number(pageSize)).group({_id:"$_id",oldData:{$push:"$oldData"}})
            //     // console.log(sensor)
            //     sensor[0].point = sensorPoint.point
            //     const result = this.analyseData(sensor[0].oldData,sensorPoint.transfer_type,sensorPoint.point)
            //     // console.log(result)
            //     res.send({
            //         status: 1,
            //         data: {data:{point:sensorPoint.point,data:result},page:{pageNum:parseInt(pageNum),pageSize:parseInt(pageSize),totalPage:parseInt((total[0].totalNum-1)/pageSize+1)}}
            //     })
            // }else {
            //     // console.log(sensor)
            //     res.send({
            //         status: 1,
            //         data: {data:{point:sensorPoint.point},page:{pageNum:parseInt(pageNum),pageSize:parseInt(pageSize),totalPage:0}}
            //     })
            // }
            console.log(dtime(fromDate).format('YYYY-MM-DD HH:mm:ss'))
            const total = await DataModel.aggregate(
                {$match:{sensor:mongoose.Types.ObjectId(_id)}},
                {$match:{'create_time': { $gte : dtime(fromDate).format('YYYY-MM-DD HH:mm:ss'), $lte : dtime(toDate).format('YYYY-MM-DD HH:mm:ss') } }},
                {$group:{_id:"$sensor",totalNum:{$sum:1}}}
            )
            // console.log(total)
            //interval 1 1min; 2 5min; 3 10min; 4 1hour;5 12hour;6 24hour 
            var tempint = [12,60,120,720,8640,17280]
            const data = await DataModel.aggregate(
                    {$match:{'sensor':mongoose.Types.ObjectId(_id)}},
                    {$match:{'create_time': { $gte : dtime(fromDate).format('YYYY-MM-DD HH:mm:ss'), $lte : dtime(toDate).format('YYYY-MM-DD HH:mm:ss') } }},
                    {$sort:{'create_time':-1}},
                    {$bucketAuto:
                        {groupBy:'$create_time'
                        ,buckets: parseInt((toDate-fromDate)/60000)
                        ,output:{time:{$first:'$create_time'}}}
                        
                    }
                    // {$skip:Number(pageSize*(pageNum-1))},
                    // {$limit:Number(pageSize)}, 
                    // {$range:[0,total,tempint[interval-1]]}

                     )
            console.log(data)
            // const fromDate = parseInt(dtime(toDate).format('x')-1000*60*60*24)
            // var data = await DataModel.find({'sensor':_id,create_time:{ $gte : dtime(fromDate).format('YYYY-MM-DD HH:mm:ss'), $lte : dtime(toDate).format('YYYY-MM-DD HH:mm:ss') }}).skip(Number(pageSize*(pageNum-1))).limit(Number(pageSize)).populate({path:'sensor',select:'-data -oldData -alarmData -oldAlarmData',populate:{path:"point"}})
            //console.log(fromDate,toDate)
            //console.log( dtime(fromDate).format('YYYY-MM-DD HH:mm:ss'),dtime(toDate).format('YYYY-MM-DD HH:mm:ss'))
            var result
            if(data.length>0){
               result = this.analyseData(data,data[0].sensor.transfer_type,data[0].sensor.point)
               const datacount = await DataModel.count({'sensor':_id,create_time:{ $gte : dtime(fromDate).format('YYYY-MM-DD HH:mm:ss'), $lte : dtime(toDate).format('YYYY-MM-DD HH:mm:ss') }}) 
                const totalPage = parseInt((datacount-1)/pageSize+1)
                // console.log(result,totalPage)
                res.send({
                    status: 1,
                    data: {data:{point:data[0].sensor.point,data:result},page:{pageNum:parseInt(pageNum),pageSize:parseInt(pageSize),totalPage:totalPage}}
                })
            }else {
                const sensor = await SensorModel.find({'_id':_id},'-data -oldAlarmData -alarmData').populate('point')
                console.log(sensor)
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
        const {toDate=new Date().getTime()} = req.query;
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
            const fromDate = parseInt(dtime(toDate).format('x')-1000*60*60*24)
            var data = await DataModel.find({'sensor':_id,create_time:{ $gte : dtime(fromDate).format('YYYY-MM-DD HH:mm:ss'), $lte : dtime(toDate).format('YYYY-MM-DD HH:mm:ss') }}).populate({path:'sensor',select:'-data -oldData -alarmData -oldAlarmData',populate:{path:"point"}})
            var result
            if(data.length>0){
               result = this.analyseData(data,data[0].sensor.transfer_type,data[0].sensor.point)
               console.log(result[0])
               var temp = ["时间"]
               data[0].sensor.point.pointEnum.forEach(item=>{
                   temp.push(item.name)
               })
               var temp2 = [temp]
               result.forEach(item=>{
                    var temp3 = [item.create_time].concat(item.data)
                    temp2.push(temp3)
               })
               console.log(temp2[0],temp2[1])
               var buffer = xlsx.build([{name: "mySheetName", data: result}]);
               console.log(buffer)
            }
            //    console.log(result)
                // res.send({
                //     status: 1,
                //     data: {data:{point:data[0].sensor.point,data:result},page:{pageNum:parseInt(pageNum),pageSize:parseInt(pageSize),totalPage:totalPage}}
                // })
            
            
            
        
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
            console.log(room)
            var result = {};
            room.device.forEach(dev=>{
                result[dev.name] = {}
                dev.sensor.forEach(sen=>{
                    var temp = this.analyseData([sen.data],sen.transfer_type,sen.point)
                    // console.log(temp[0].data)
                    temp[0].data.forEach((tempData,index)=>{
                        // console.log(tempData,index)
                        result[dev.name][sen.point.pointEnum[index].name] = tempData
                    })
                })
            })
            console.log(result)
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
            var user;
            if(isMe == 1){
                user = await UserModel.findOne({'token':token})
                if(!user){
                    res.send({
                        status: 0,
                        type: 'ERROR_PARAMS',
                        message: '用户不存在', 
                    })
                    return 
                }
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
			console.log('删除失败', err);
			res.send({
				status: 0,
				type: 'ERROR_GET_LIST',
				message: '删除失败'
			})
		}
    }
    
}

export default new Data()
