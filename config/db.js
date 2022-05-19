//const MongoClient = require( 'mongodb' ).MongoClient;

/*let db;

module.exports = {
  connect(callback) {
    MongoClient.connect( process.env.DB_URL , { useNewUrlParser: true }, (err, client) => {
      db  = client.db('demo');

      return callback(err);
    });
  },
  
  getDB() {
    return db;
  }
};*/


const mongoose = require("mongoose");
 module.exports = () => {
  mongoose.connect(
    process.env.DB_URL
  ).then(() => console.log("Mongoose Connected"))
    .catch((err) => console.log(err));
 }

//module.exports = connect;

