cassandra_summit_2012
=====================

Examples for Cassandra Summit 2012

### Running

 * Add a `config.json` to `lib/`
 * From the cli

	```
	create keyspace cassandra_summit;
	create column family cassandra_summit
	  with column_type = 'Standard'
	  and comparator = 'LongType'
	  and default_validation_class = 'UTF8Type'
	  and key_validation_class = 'UTF8Type';
	```

 * npm install
 * npm start
 * npm test
