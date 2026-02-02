const NodeCache = require('node-cache');
const ProductModel = require('../apps/models/product');
const redisClient = require('../common/init.redis');
const cache = new NodeCache(
    {
        stdTTL:10,
    });

exports.cacheBasic = async (req, res)=> {
    const products = [
        {id: 1, name: "iphone 11"},
        {id: 2, name: "iphone 12"},
        {id: 3, name: "iphone 13"}
    ];
    let message;
    let data;
    const cacheProducts = cache.get("products");
    if(cacheProducts){
        message = "Get data in cache.";
        data = cacheProducts;
    } else {
        message = "Get data in database";
        data = products;
        cache.set("products", data);
    }
    return res.status(200).json({ 
        status: 'success',
        message,
        data,
    });
}
exports.cacheAdvanced = async (req, res)=> {
    let message;
    let data;
    let startTime = performance.now();
    let endTime;
    if(cacheProducts){
        message = "Data in cache"
        data = cacheProducts;
        endTime = performance.now();
    }else{
        message = "Data in database"
        data = await ProductModel.find().limit(100);
        cache.set ("products", data);
        endTime = performance.now();
    }
    return res.status(200).json({ 
        status: 'success',
        message,
        time: endTime - startTime,
        data,
    });
}
exports.cacheRedis = async (req, res)=> {
    let message;
    let data;
    let startTime = performance.now();
    let endTime;
    const cacheProducts = await redisClient.json.get("products");
    if(cacheProducts){
        message = "Data in cache";
        data = JSON.parse(cacheProducts);
        endTime = performance.now();
    } else {
        message = "Data in database";
        data = await ProductModel.find().limit(100);
        await redisClient.json.set("products", "$", data);
        await redisClient.expire("products", 10);
        endTime = performance.now();
    }
    return res.status(200).json({ 
        status: 'success',
        message,
        time: endTime - startTime,
        data,
    });
}

