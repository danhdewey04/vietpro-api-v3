const { createClient } = require("redis");

const client = createClient({
    username: 'default',
    password: '9IKrfZpKQhDFfMzSmuOKUJSyTZ3RVNVs',
    socket: {
        host: 'redis-11104.crce178.ap-east-1-1.ec2.cloud.redislabs.com',
        port: 11104
    }
});

client
.on("error", (err) => console.log("Redis Client Error", err))
.on("connect", () => console.log("Redis connected!"));
client.connect();
module.exports = client;

//await client.connect();

//await client.set('foo', 'bar');
//const result = await client.get('foo');
//console.log(result)  // >>> bar

