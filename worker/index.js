const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const sub = redisClient.duplicate(); // the reason we use a duplicate is because for redis you cannot have a client that both listens and publishes.  This is our publisher.

function fib(index) {
    if (index < 2) return 1;
    return fib(index-1) + fib(index-2);
}

// implement pub/sub with redis
// anytime we get a message (the index), we run this callback function, which calculated fibonacci and inserts it into a hash of 'values' on redis
sub.on('message', (channel, message)  =>  {
    redisClient.hset('values', message, fib(parseInt(message)));
});
// subscribe to insert - whenever there is an insert into redis will trigger the above 
sub.subscribe('insert');