const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  id: {
    type: String,  
    required: true,   
    unique: true
  },
  pwd: {
    type: String, 
    required: true,

  },
  role: {
    type: String, 
    required: true
  }
})

module.exports = mongoose.model('user', userSchema);