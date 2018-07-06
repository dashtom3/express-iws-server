'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const roomSchema = new Schema({
    name: String,
    create_time: String,
    device: [{ type: Schema.Types.ObjectId, ref: 'Device' }],
})


const Room = mongoose.model('Room', roomSchema);

export default Room