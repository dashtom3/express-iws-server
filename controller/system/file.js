'use strict';


import BaseComponent from '../../prototype/baseComponent'

// import request from 'request'

class File extends BaseComponent{
	constructor(){
        super()
        
    }
    async downloadExcel(req, res, next){
      const {name} = req.params;
      
      res.download("./fileExcel/"+name);
    }
  }


export default new File()
