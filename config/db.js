const MongoClient = require( 'mongodb' ).MongoClient;

let db;

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
};