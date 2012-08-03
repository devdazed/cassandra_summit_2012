//default configuration
var config = {
  hosts : ['localhost'],
  keyspace : ['cassandra_summit']
};

try {
  //load my config (12 C* nodes)
  config = require('./config');
} catch(e){}

var helenus = require('helenus'),
    pool = new helenus.ConnectionPool(config),
    columns = 100000;

//if you don't listen for error, it will bubble up to `process.uncaughtException`
//pools act just like connection objects, so you dont have to worry about api
//differences when using either the pool or the connection
pool.on('error', function(err){
  console.error(err.name, err.message);
});

//Column Family has alread been created using the following CLI command:
//Tested on DSC 1.0.10
/**
create column family cassandra_summit
  with column_type = 'Standard'
  and comparator = 'LongType'
  and default_validation_class = 'UTF8Type'
  and key_validation_class = 'UTF8Type'
*/

/**
 * Loads our test dataset
 */
function load(cf, callback){
  console.time('Load Columns');
  var row = [];
  for(var i = 0; i < columns; i += 1){
    row.push(new helenus.Column(i, i.toString()));
  }

  cf.insert('cassandra_summit', row, { consistency:6 }, function(err){
    if(err){
      throw(err);
    }
    console.timeEnd('Load Columns');
    callback();
  });
}

//makes a connection to the pool, this will return once there is at least one
//valid connection, other connections may still be pending
pool.connect(function(err, keyspace){
  if(err){
    throw(err);
  } else {
    keyspace.get('cassandra_summit', function(err, cf){
      if(err){
        throw(err);
      } else {
        load(cf, function(){
          pool.close();
        });
      }
    });
  }
});