'use strict';

module.exports = {
	port: 8001,
	data_ip:'http://localhost:3000/',
	url: 'mongodb://116.62.228.3:27017/db',
	api:{
		start:'data/start',
		stop:'data/stop',
	},
	session: {
		name: 'SID',
		secret: 'SID',
		cookie: {
			httpOnly: true,
		    secure:   false,
		    maxAge:   365 * 24 * 60 * 60 * 1000,
		}
	}
}
