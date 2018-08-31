import fetch from 'node-fetch';
import Ids from '../models/ids'
import formidable from 'formidable'
import path from 'path'
import fs from 'fs'
import qiniu from 'qiniu'
import gm from 'gm'
qiniu.conf.ACCESS_KEY = 'Ep714TDrVhrhZzV2VJJxDYgGHBAX-KmU1xV1SQdS';
qiniu.conf.SECRET_KEY = 'XNIW2dNffPBdaAhvm9dadBlJ-H6yyCTIJLxNM_N6';


export default class BaseComponent {
	constructor(){
		this.idList = ['user_id', 'role_id','system_id','location_id','room_id','device_id','basicDevice_id'];

		this.imgTypeList = ['shop', 'food', 'avatar','default'];
		this.uploadImg = this.uploadImg.bind(this)
		this.qiniu = this.qiniu.bind(this)
		this.analyseData = this.analyseData.bind(this)
		this.HexToSingle = this.HexToSingle.bind(this)
		this.InsertString = this.InsertString.bind(this)
		this.FillString = this.FillString.bind(this)
	}
	 InsertString(t, c, n) {
    var r = new Array();
    for (var i = 0; i * 2 < t.length; i++) {
        r.push(t.substr(i * 2, n));
    }
    return r.join(c);
	}
 FillString(t, c, n, b) {
    if ((t == "") || (c.length != 1) || (n <= t.length)) {
        return t;
    }
    var l = t.length;
    for (var i = 0; i < n - l; i++) {
        if (b == true) {
            t = c + t;
        }
         else {
            t += c;
        }
    }
    return t;
}
 HexToSingle(t) {
    // t = t.replace(/\s+/g, "");
    // if (t == "") {
    //     return "";
    // }
    // if (t == "00000000") {
    //     return "0";
    // }
    // if ((t.length > 8) || (isNaN(parseInt(t, 16)))) {
    //     return "Error";
    // }
    // if (t.length < 8) {
    //     t = FillString(t, "0", 8, true);
    // }
    // t = parseInt(t, 16).toString(2);
    // t = FillString(t, "0", 32, true);
    var s = t.substring(0, 1);
    var e = t.substring(1, 9);
    var m = t.substring(9);
    e = parseInt(e, 2) - 127;
    m = "1" + m;
    if (e >= 0) {
        m = m.substr(0, e + 1) + "." + m.substring(e + 1)
    }
     else {
        m = "0." + this.FillString(m, "0", m.length - e - 1, true)
    }
    if (m.indexOf(".") == -1) {
        m = m + ".0";
    }
    var a = m.split(".");
    var mi = parseInt(a[0], 2);
    var mf = 0;
    for (var i = 0; i < a[1].length; i++) {
        mf += parseFloat(a[1].charAt(i)) * Math.pow(2, -(i + 1));
    }
    m = parseInt(mi) + parseFloat(mf);
    if (s == 1) {
        m = 0 - m;
    }
    return m;
}
	analyseData(data,transfer_type,point){
		var returnData = []
		// console.log(data)
		data.forEach((item,index2)=>{
			var allData = item.data.split(',')
			var itemData = []
			if(transfer_type == 1) { // TCP
				var addressStart = point.pointEnum[0].place
				point.pointEnum.forEach((pointEach,index)=>{
					var tempItem = []
					var num = parseInt(point.pointEnum[index].place)-addressStart

					switch (point.pointEnum[index].type) {
						case 0:		// 0 实际值*倍数
							var temp = ""
							for(var i=0;i<point.pointEnum[index].placeLength;i++){
								temp = temp+(Array(8).join('0') + (parseInt(allData[num+i])).toString(2)).slice(-8);
							}
							//console.log(point.pointEnum[index].name,allData[num-1],allData[num])
							var datatemp = parseInt(temp,2)/point.pointEnum[index].times
							if(point.pointEnum[index].floatNum != 0){
								// console.log("小数位数",point.pointEnum[index].floatNum)
								// console.log(temp)
								// var data_E = parseInt(temp.slice(0,8),2)
								// var data_M = temp.slice(8,64)
								// var data_M_10 = 0.00
								// for(var i=0;i<data_M.length;i++){
								// 	data_M_10 = data_M_10+ data_M[i]*Math.pow(2,(-1)*(i+1))
								// }
								// var value = 2^(E-127)*(1.M)
								// var data_float = Math.pow(2,data_E-127)*(1+data_M_10)
								// console.log(temp,data_E)
								datatemp = this.HexToSingle(temp).toFixed(point.pointEnum[index].floatNum)
								// console.log(datatemp)
							} 
							
							tempItem = [point.pointEnum[index].name,datatemp+point.pointEnum[index].unit]
							break; 
						case 1: // 1 变频9 工频17 休息2 热继故障36 空开跳闸68 变频故障132
							var datatemp = allData[num]
							switch (parseInt(datatemp)) {
								case 2:
									tempItem = [point.pointEnum[index].name,"休息"]
									break;
								case 9:
									tempItem = [point.pointEnum[index].name,"变频"]
									break;
								case 17:
									tempItem = [point.pointEnum[index].name,"工频"]
									break;
								case 36:
									tempItem = [point.pointEnum[index].name,"热继故障"]
									break;
								case 68:
									tempItem = [point.pointEnum[index].name,"空开跳闸"]
									break;
								case 132:
									tempItem = [point.pointEnum[index].name,"变频故障"]
									break;
								default:
									tempItem = [point.pointEnum[index].name,"无法识别"]
									break;
							}
							break;	
						case 2: 	// 2 无水故障 1 高水信号2 地面积水信号4 相序故障8 出口超压16 门禁报警32
							var datatemp = allData[num]
							switch (parseInt(datatemp)) {
								case 1:
									tempItem = [point.pointEnum[index].name,"无水故障"]
									break;
								case 2:
									tempItem = [point.pointEnum[index].name,"高水信号"]
									break;
								case 4:
									tempItem = [point.pointEnum[index].name,"地面积水信号"]
									break;
								case 8:
									tempItem = [point.pointEnum[index].name,"相序故障"]
									break;
								case 16:
									tempItem = [point.pointEnum[index].name,"出口超压"]
									break;
								case 32:
									tempItem = [point.pointEnum[index].name,"门禁报警"]
									break;
								default:
									tempItem = [point.pointEnum[index].name,"无法识别"]
									break;
							}
							break;
						case 3: 	// 3 自动0 手动1 // 4 开启1 关闭0 // 5 是1 否0
							var temp = point.pointEnum[index].place.toString().split('.')
							var datatemp = allData[num]
							datatemp = (Array(8).join('0') + (parseInt(datatemp)).toString(2)).slice(-8);
							var data2 = temp.length>1 ? datatemp.charAt(8-parseInt(temp[1])-1):datatemp.charAt(7) //1800.0 没有.0
							tempItem = [point.pointEnum[index].name,data2 =="1" ? '手动':'自动']
							break;
						case 4:
							var temp = point.pointEnum[index].place.toString().split('.')
							var datatemp = allData[num]
							datatemp = (Array(8).join('0') + (parseInt(datatemp)).toString(2)).slice(-8);
							var data2 = temp.length>1 ? datatemp.charAt(8-parseInt(temp[1])-1):datatemp.charAt(7) //1800.0 没有.0
							tempItem = [point.pointEnum[index].name,data2 =="1" ? '开启':'关闭']
							break;
						case 5:
							var temp = point.pointEnum[index].place.toString().split('.')
							var datatemp = allData[num]
							datatemp = (Array(8).join('0') + (parseInt(datatemp)).toString(2)).slice(-8);
							var data2 = temp.length>1 ? datatemp.charAt(8-parseInt(temp[1])-1):datatemp.charAt(7) //1800.0 没有.0
							tempItem = [point.pointEnum[index].name,data2 =="1" ? '是':'否']
							break;
						default:
							break;
					}
					itemData.push(tempItem[1])						
				})
			}else {
				point.pointEnum.forEach((item2,index)=>{
					var tempItem = []
					switch (point.pointEnum[index].type) {
						case 0:
							var datatemp = parseInt(allData[index])/point.pointEnum[index].times
							tempItem = [point.pointEnum[index].name,datatemp+point.pointEnum[index].unit]
							break;
						case 1:
							var datatemp = allData[index]
							// console.log(datatemp)
							switch (parseInt(datatemp)) {
								case 2:
									tempItem = [point.pointEnum[index].name,"休息"]
									break;
								case 9:
									tempItem = [point.pointEnum[index].name,"变频"]
									break;
								case 17:
									tempItem = [point.pointEnum[index].name,"工频"]
									break;
								case 36:
									tempItem = [point.pointEnum[index].name,"热继故障"]
									break;
								case 68:
									tempItem = [point.pointEnum[index].name,"空开跳闸"]
									break;
								case 132:
									tempItem = [point.pointEnum[index].name,"变频故障"]
									break;
								default:
									tempItem = [point.pointEnum[index].name,"无"]
									break;
							}
							break;	
						case 2:
							var datatemp = allData[index]
							switch (parseInt(datatemp)) {
								case 1:
									tempItem = [point.pointEnum[index].name,"无水故障"]
									break;
								case 2:
									tempItem = [point.pointEnum[index].name,"高水信号"]
									break;
								case 4:
									tempItem = [point.pointEnum[index].name,"地面积水信号"]
									break;
								case 8:
									tempItem = [point.pointEnum[index].name,"相序故障"]
									break;
								case 16:
									tempItem = [point.pointEnum[index].name,"出口超压"]
									break;
								case 32:
									tempItem = [point.pointEnum[index].name,"门禁报警"]
									break;
								default:
									tempItem = [point.pointEnum[index].name,"无"]
									break;
							}
							break;
						case 3:
							var datatemp = allData[index]
							tempItem = [point.pointEnum[index].name,datatemp =="1" ? '手动':'自动']
							break;
						case 4:
							var datatemp = allData[index]
							tempItem = [point.pointEnum[index].name,datatemp =="1" ? '开启':'关闭']
							break;
						case 5:
							var datatemp = allData[index]
							tempItem = [point.pointEnum[index].name,datatemp =="1" ? '是':'否']
							break;
						default:
							break;
						}
					itemData.push(tempItem[1])	
				})
			}
			returnData.push({create_time:item.create_time,data:itemData})
		})
		// console.log(returnData)
		return returnData
	}
	async fetch(url = '', data = {}, type = 'GET', resType = 'JSON'){
		type = type.toUpperCase();
		resType = resType.toUpperCase();
		if (type == 'GET') {
			let dataStr = ''; //数据拼接字符串
			Object.keys(data).forEach(key => {
				dataStr += key + '=' + data[key] + '&';
			})

			if (dataStr !== '') {
				dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
				url = url + '?' + dataStr;
			}
		}

		let requestConfig = {
			method: type,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
		}

		if (type == 'POST') {
			Object.defineProperty(requestConfig, 'body', {
				value: JSON.stringify(data)
			})
		}
		let responseJson;
		try {
			const response = await fetch(url, requestConfig);
			if (resType === 'TEXT') {
				responseJson = await response.text();
			}else{
				responseJson = await response.json();
			}
		} catch (err) {
			console.log('获取http数据失败', err);
			throw new Error(err)
		}
		return responseJson
	}
	//获取id列表
	async getId(type){
		if (!this.idList.includes(type)) {
			console.log('id类型错误');
			throw new Error('id类型错误');
			return
		}
		try{
			const idData = await Ids.findOne();
			idData[type] ++ ;
			await idData.save();
			return idData[type]
		}catch(err){
			console.log('获取ID数据失败');
			throw new Error(err)
		}
	}

	async uploadImg(req, res, next){
		const type = req.params.type;
		try{
			//const image_path = await this.qiniu(req, type);
			const image_path = await this.getPath(req);
			res.send({
				status: 1,
				image_path,
			})
		}catch(err){
			console.log('上传图片失败', err);
			res.send({
				status: 0,
				type: 'ERROR_UPLOAD_IMG',
				message: '上传图片失败'
			})
		}
	}

	async getPath(req){
		return new Promise((resolve, reject) => {
			const form = formidable.IncomingForm();
			form.uploadDir = './public/img';
			form.parse(req, async (err, fields, files) => {
				let img_id;
				try{
					img_id = await this.getId('img_id');
				}catch(err){
					console.log('获取图片id失败');
					fs.unlink(files.file.path);
					reject('获取图片id失败')
				}
				const imgName = (new Date().getTime() + Math.ceil(Math.random()*10000)).toString(16) + img_id;
				const fullName = imgName + path.extname(files.file.name);
				const repath = './public/img/' + fullName;
				try{
					await fs.rename(files.file.path, repath);
					gm(repath)
					.resize(200, 200, "!")
					.write(repath, async (err) => {
						// if(err){
						// 	console.log('裁切图片失败');
						// 	reject('裁切图片失败');
						// 	return
						// }
						resolve(fullName)
					})
				}catch(err){
					console.log('保存图片失败', err);
					fs.unlink(files.file.path)
					reject('保存图片失败')
				}
			});
		})
	}

	async qiniu(req, type = 'default'){
		return new Promise((resolve, reject) => {
			const form = formidable.IncomingForm();
			form.uploadDir = './public/img';
			form.parse(req, async (err, fields, files) => {
				let img_id;
				try{
					img_id = await this.getId('img_id');
				}catch(err){
					console.log('获取图片id失败');
					fs.unlink(files.file.path);
					reject('获取图片id失败')
				}
				const imgName = (new Date().getTime() + Math.ceil(Math.random()*10000)).toString(16) + img_id;
				const extname = path.extname(files.file.name);
				const repath = './public/img/' + imgName + extname;
				try{
					const key = imgName + extname;
					await fs.rename(files.file.path, repath);
					const token = this.uptoken('node-elm', key);
					const qiniuImg = await this.uploadFile(token.toString(), key, repath);
					fs.unlink(repath);
					resolve(qiniuImg)
				}catch(err){
					console.log('保存至七牛失败', err);
					fs.unlink(files.file.path)
					reject('保存至七牛失败')
				}
			});

		})
	}
	uptoken(bucket, key){
		var putPolicy = new qiniu.rs.PutPolicy(bucket+":"+key);
  		return putPolicy.token();
	}
	uploadFile(uptoken, key, localFile){
		return new Promise((resolve, reject) => {
			var extra = new qiniu.io.PutExtra();
		    qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
			    if(!err) {
			    	resolve(ret.key)
			    } else {
			    	console.log('图片上传至七牛失败', err);
			    	reject(err)
			    }
		  	});

		})
	}
}
