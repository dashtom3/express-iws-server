'use strict';


import user from './user'
import system from './system'
import basicDevice from './basicDevice'

export default app => {
	// app.get('/', (req, res, next) => {
	// 	res.redirect('/');
	// });
	app.use('/user', user);
	app.use('/system', system);
	app.use('/basicDevice', basicDevice);
}
