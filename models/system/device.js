'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const deviceSchema = new Schema({
    name: String,
    create_time: String,
    sensor: [{ type: Schema.Types.ObjectId, ref: 'Sensor' }],
})


const Device = mongoose.model('Device', deviceSchema);

export default Device