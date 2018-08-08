'use strict';


import user from './user'
import system from './system'
import sensor from './sensor'
import role from './role'
import data from './data'
import work from './work'
import video from './video'
import file from './file'
export default app => {
	// app.get('/', (req, res, next) => {
	// 	res.redirect('/');
	// });
	app.use('/user', user);
	app.use('/system', system);
	app.use('/sensor', sensor);
	app.use('/role', role);
	app.use('/data', data);
	app.use('/work', work);
	app.use('/video',video);
	app.use('/file',file)
}
