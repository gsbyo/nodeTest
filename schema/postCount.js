const mongoose = require('mongoose');

const { Schema } = mongoose;

//_id 제목 내용 작성자 날짜 이미지 
const postCountSchema = new Schema({
  count: {
    type: Number
  }
})

module.exports = mongoose.model('post_count', postCountSchema);
