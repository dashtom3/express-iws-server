'use strict';


import user from './user'
import system from './system'

export default app => {
	// app.get('/', (req, res, next) => {
	// 	res.redirect('/');
	// });
	app.use('/user', user);
	app.use('/system', system);
}
