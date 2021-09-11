var express = require('express');
var path=require('path');
var app = express();

app.use(express.static(__dirname));
/*app.get("/bears",function(req,res){
    res.send({id:'bears'});
});*/

app.get("/home",function(req,res){
    res.sendFile(path.join(__dirname,"home.html"));
});

app.get("/*",function(req,res){
    res.sendFile(path.join(__dirname,"user.html"));
});

app.listen('3300');
console.log('Running at\nhttp://localhost:3300');