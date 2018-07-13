'use strict';

import PointModel from '../../models/system/point'
import SensorModel from '../../models/system/sensor'
import DeviceModel from '../../models/system/device'
import BaseComponent from '../../prototype/baseComponent'
import config from 'config-lite'
import formidable from 'formidable'
import axios from 'axios'
import dtime from 'time-formater'
import Sensor from '../../models/system/sensor';
import { stringify } from 'querystring';
// import request from 'request'

class Data extends BaseComponent{
	constructor(){
        super()
        this.tcpCollectData = {}
        this.collectData = this.collectData.bind(this)
    }

    async collectData(req,res,next){
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
            const data = fields.data; //device id
            //console.log(data)
			try{
				if (!data) {
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
// type
// 0 实际值*倍数
// 1 变频9 工频17 休息2 热继故障36 空开跳闸68 变频故障132
// 2 无水故障 1 高水信号2 地面积水信号4 相序故障8 出口超压16 门禁报警32
// 3 自动0 手动1
// 4 开启1 关闭0
// 5 是1 否0
            try {
                var sensor;
                if(this.tcpCollectData[_id]){
                    sensor =  this.tcpCollectData[_id] 
                }else {
                    sensor = await SensorModel.findOne({'_id':_id},'-oldData -oldAlarmData').populate('point').populate('alarm')
                    this.tcpCollectData[_id] = sensor
                    console.log(sensor)
                }
                
                
                if(!sensor){
                    return 
                }
                var newData = {create_time:dtime().format('YYYY-MM-DD HH:mm:ss'),data:data}
                //tcp
                if(sensor.transfer_type == 1) {
                    var addressStart = sensor.point.pointEnum[0].place
                    var alarm = false
                    var alarmContent = ""
                    var allData = data.split(",")
                    sensor.alarm.alarmEnum.forEach((item,index)=>{
                         
                        if(item.isAlarm == true){
                            var num = parseInt(sensor.point.pointEnum[index].place)-addressStart
                            switch (sensor.point.pointEnum[index].type) {
                                case 0:
                                    var temp = ""
                                    for(var i=0;i<sensor.point.pointEnum[index].placeLength;i++){
                                        temp = temp+(Array(8).join('0') + (parseInt(allData[num+i])).toString(2)).slice(-8);
                                    }
                                    //console.log(sensor.point.pointEnum[index].name,allData[num-1],allData[num])
                                    var datatemp = parseInt(temp,2)*sensor.point.pointEnum[index].times
                                    //console.log(datatemp)
                                    if(!(datatemp>=item.low && datatemp<=item.high)){
                                        alarm = true
                                        alarmContent = alarmContent+sensor.point.pointEnum[index].name+",实际值:"+datatemp+"超出上下限("+item.low+","+item.high+");"
                                    }
                                    break;
                                case 1:
                                    var datatemp = allData[num]
                                    switch (datatemp) {
                                        case 36:
                                            alarm = true
                                            alarmContent = alarmContent+sensor.point.pointEnum[index].name+',热继故障;'
                                            break;
                                        case 68:
                                            alarm = true
                                            alarmContent = alarmContent+sensor.point.pointEnum[index].name+',空开跳闸;'
                                            break;
                                        case 132:
                                            alarm = true
                                            alarmContent = alarmContent+sensor.point.pointEnum[index].name+',变频故障;'
                                            break;
                                        default:
                                            break;
                                    }
                                    break;
                                case 2:
                                    var datatemp = allData[num]
                                    switch (datatemp) {
                                        case 1:
                                            alarm = true
                                            alarmContent = alarmContent+sensor.point.pointEnum[index].name+',无水故障;'
                                            break;
                                        case 2:
                                            alarm = true
                                            alarmContent = alarmContent+sensor.point.pointEnum[index].name+',高水信号;'
                                            break;
                                        case 4:
                                            alarm = true
                                            alarmContent = alarmContent+sensor.point.pointEnum[index].name+',地面积水信号;'
                                            break;
                                        case 8:
                                            alarm = true
                                            alarmContent = alarmContent+sensor.point.pointEnum[index].name+',相序故障;'
                                            break;
                                        case 16:
                                            alarm = true
                                            alarmContent = alarmContent+sensor.point.pointEnum[index].name+',出口超压;'
                                            break;
                                        case 32:
                                            alarm = true
                                            alarmContent = alarmContent+sensor.point.pointEnum[index].name+',门禁报警;'
                                            break;
                                        default:
                                            break;
                                    }
                                    break;
                                case 3:
                                case 4:
                                case 5:
                                    var temp = sensor.point.pointEnum[index].place.toString().split('.')
                                    var datatemp = allData[num]
                                    
                                    datatemp = (Array(8).join('0') + (parseInt(datatemp)).toString(2)).slice(-8);
                                    //console.log(datatemp)
                                    var data2 = temp.length>1 ? datatemp.charAt(8-parseInt(temp[1])-1):datatemp.charAt(7) //1800.0 没有.0
                                    //console.log(data2)
                                    if(data2 == '1'){
                                        alarm = true
                                        alarmContent = alarmContent+sensor.point.pointEnum[index].name+',是;'
                                    }
                                    
                                    break;
                                default:
                                    break;
                            }
                        }
                        // console.log(index)
                    })
                    
                    //console.log(alarmContent)
                    //该条报警
                    if(alarm == true) {
                        
                        if(sensor.alarmData != null) {
                            sensor.alarmData.info = alarmContent
                            sensor.alarmData.data = data
                            await SensorModel.findOneAndUpdate({'_id':sensor._id},{$set:{data:newData,alarmData:sensor.alarmData},$push:{oldData:newData}})
                        }else {
                            sensor.alarmData = {
                                info:alarmContent,
                                data:data,
                                create_time:dtime().format('YYYY-MM-DD HH:mm:ss'),
                                stop_time:null,
                                worker:null,
                                worker_time:null,
                                finish_time:null,
                            }
                            await SensorModel.findOneAndUpdate({'_id':sensor._id},{$set:{data:newData,alarmData:sensor.alarmData},$push:{oldData:newData}})
                        }
                    }else {
                    //数据不报警
                   
                        if(sensor.alarmData != null) {
                            sensor.alarmData.stop_time = dtime().format('YYYY-MM-DD HH:mm:ss')
                            var temp = JSON.parse(JSON.stringify(sensor.alarmData))
                            await SensorModel.findOneAndUpdate({'_id':sensor._id},{$set:{data:newData,alarmData:null},$push:{oldData:newData,oldAlarmData:temp}})
                        }else {
                            await SensorModel.findOneAndUpdate({'_id':sensor._id},{$set:{data:newData},$push:{oldData:newData}})
                        
                        }
                    }
                }
                res.send({
                    status: 1,
                    message: '接收成功'
                })
            }catch(err){
                console.log('接收失败', err);
                res.send({
                    status: 0,
                    message: '接收失败'
                })
            }
        })
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
    async getAllSensor(req, res, next){
        try {
            const sensor = await SensorModel.find({'isStart':true}, '-__v -oldAlarmData -oldData -data -alarmData').populate('point')
            console.log(sensor)
            res.send({
                status: 1,
                data:sensor
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

export default new Data()
