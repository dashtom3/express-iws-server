'use strict';


import user from './user'
import system from './system'
import sensor from './sensor'
import role from './role'
import data from './data'

export default app => {
	// app.get('/', (req, res, next) => {
	// 	res.redirect('/');
	// });
	app.use('/user', user);
	app.use('/system', system);
	app.use('/sensor', sensor);
	app.use('/role', role);
	app.use('/data', data);
}
