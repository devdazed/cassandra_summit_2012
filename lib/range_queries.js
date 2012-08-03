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
    pool = new helenus.ConnectionPool(config);

//if you don't listen for error, it will bubble up to `process.uncaughtException`
//pools act just like connection objects, so you dont have to worry about api
//differences when using either the pool or the connection
pool.on('error', function(err){
  console.error(err.name, err.message);
});

/**
 * gets 1000 rows in a single call
 */
function getAll(cf, callback){
  console.time('Single Call');
  var options = {
    consistency:1,
    max:100000
  };

  cf.get('cassandra_summit', options, function(err, row){
    if(err){
      throw(err);
    }

    console.timeEnd('Single Call');
    callback();
  });
}

/**
 * gets 1000 rows split
 */
function getSplit(cf, callback){
  console.time('Split Call');
  var result = [], complete = 0,
      options, calls = 10, n = 100000;

  function onComplete(err, row){
    if(err){
      throw(err);
    }

    result.push(row);
    complete += 1;
    if(complete === calls){
      console.timeEnd('Split Call');
      callback();
    }
  }

  for(var i = 0; i < calls; i += 1){
    options = {
      consistency:1,
      start:i * (n/calls) + 1,
      end:(i * (n/calls)) + (n/calls),
      max:(n/calls)
    };

    cf.get('cassandra_summit', options, onComplete);
  }
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
        getAll(cf, function(){
          getSplit(cf, function(){
            pool.close();
          });
        });
      }
    });
  }
});