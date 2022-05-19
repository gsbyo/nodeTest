const mongoose = require('mongoose');

var autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection(process.env.DB_URL);
autoIncrement.initialize(connection);


const { Schema } = mongoose;

//_id 제목 내용 작성자 날짜 이미지 
const boardSchema = new Schema({
  seq: {
    type: Number,
    unique : true
  },
  title: {
    type: String,     
    required: true,   
  },
  content: {
    type: String, 
    required: true,
  },
  writer: {
    type: String, 
    required: true
  },
  day: {
    type: String, 
    required: true
  },
  views:{
    type: Number,
    default : 0
  }
})


boardSchema.plugin(autoIncrement.plugin,
  { model : 'boardSchema', 
    field : 'seq', 
    startAt : 1, //시작 
    increment : 1 // 증가 
  });


module.exports = mongoose.model('board', boardSchema);
