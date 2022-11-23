 
// const directory = "../sample_pics"

const { stringify } = require('querystring')

 
 
// const fs = require("fs").promises;
// const path = require("path")


const directory = "/workspaces/cvtfjs/sample_pics"
fs=require('fs')

try {
    const fileName = fs.readdir(directory, (err,filename) => {
        return fileName
    }
    )
    console.log(stringify.fileName)
} catch (e) {
    logmyErrors(e)
}



    


