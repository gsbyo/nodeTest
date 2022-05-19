const mongoose = require('mongoose');

var autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection(process.env.DB_URL);
autoIncrement.initialize(connection);

const { Schema } = mongoose;


const commentSchema = new Schema({
  seq: {
    type : Number,  
    required : true,
    unique : true
  },
  post_id: {
    type : Number,
    required : true
  },
  content: {
    type: String, 
    required: true
  },
  user: {
      type : String,
      required: true
  },
  day: {
    type : String,
    required: true
}
})

commentSchema.plugin(autoIncrement.plugin,
    { model : 'commentSchema', 
      field : 'seq', 
      startAt : 0, //시작 
      increment : 1 // 증가 
    });

module.exports = mongoose.model('comment', commentSchema);