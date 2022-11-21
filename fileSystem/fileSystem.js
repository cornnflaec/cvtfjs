 
// const directory = "../sample_pics"
 
 
// const fs = require("fs").promises;
// const path = require("path")


const directory = "/workspaces/cvtfjs/sample_pics"
fs=require('fs')
fs.readdir(directory, (err,filename)=>console.log(filename))

