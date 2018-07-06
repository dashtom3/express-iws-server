'use strict';

import mongoose from 'mongoose'
import pointData from '../../InitData/point'
import dtime from 'time-formater'

import AlarmModel from './alarm'
import alarmData from '../../InitData/alarm'

const Schema = mongoose.Schema;

const pointEnumSchema = new Schema({
    number: Number,
    name: String,
    place:Number, //位置、地址
    placeLength:Number,  //地址长度
    type: Number, //哪种类型数据
    isWrite:Number, // 0 可读 || 1 可写1,0 || 2 可写数值
    times:Number, //倍数
    unit: String, //单位
    floatNum: String, //小数位数
    // isAlarm: Boolean, //是否报警
    // alarmRange:{ type: Schema.Types.ObjectId, ref: 'AlarmRange' }
  })

const pointSchema = new Schema({
  name: String,
//   point: [{ type: Schema.Types.ObjectId, ref: 'PointEnum' }],   //点表
  pointEnum:[pointEnumSchema],
  create_time: String,
  alarm:{ type:Schema.Types.ObjectId, ref: 'Alarm'}
})



const Point = mongoose.model('Point', pointSchema);

Point.findOne((err, data) => {
	if (!data) {
    var p
    AlarmModel.findOne((err, data) =>{
      if (!data) {
        alarmData.forEach(item=>{
          item.create_time = dtime().format('YYYY-MM-DD')
        })
        AlarmModel.create(alarmData).then(res=>{
          pointData.forEach((item,index) => {
            item.create_time = dtime().format('YYYY-MM-DD')
            item.alarm = res[index]._id
          })
          Point.create(pointData)
        })
      }
    })
		
	}
})

export default Point
