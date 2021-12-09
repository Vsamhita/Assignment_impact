const express = require('express');
const bodyparser = require('body-parser')
const fs = require('fs');
const csv = require('fast-csv');
const pool = require("./db.js");
const multer = require('multer')
const path = require('path')
var format = require('pg-format');

const app = express();

app.use(express.static("./public"))
 
// body-parser middleware use
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({
    extended: true
}))

//! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './uploads/')    
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
});


// Upload a CSV file and insert into students table
app.post('/upload', upload.single("file"), async (req, res) =>{
    await UploadCsvDataToTable(__dirname + '/uploads/' + req.file.filename);
    res.status(200).json({"status": "success", "message": "CSV file data has been uploaded in database "})      
});

 
function UploadCsvDataToTable(filePath, res){
    
    let stream = fs.createReadStream(filePath);
    let csvData = [];
    let csvStream = csv
    .parse()
    .on("data", function (data) {
        csvData.push(data);
    })
    .on("end", function () {
        // Remove Header ROW
        csvData.shift();

        // Open the PostgreSQL connection
        pool.connect((error) => {

            if (error) {
                console.error(error);
            } else {
                let query = 'INSERT INTO students (id, name, age, mark1, mark2, mark3) VALUES %L';
                pool.query(format(query, csvData),[], (error, response) => {
                    if(error){
                        console.log("error--->", error);                             
                    }
                });
            }
        });
            
        // delete file after saving to database
        // -> you can comment the statement to see the uploaded CSV file.
        fs.unlinkSync(filePath)
    });
    stream.pipe(csvStream);    
}


// Get the result of the student by passing id
app.get('/students/:id/result', async(req, res)=>{
    try {
        let id = req.params.id;
        console.log("id", typeof id)
        let result = await pool.query(`SELECT mark1+mark2+mark3 AS total FROM students WHERE id = ${id}`);
        if(result.rowCount>0){
            res.status(200).json({"data": result.rows[0].total, "status": "success", "message": "Result of the student viewed successfully"})
        }else{
            res.status(400).json({"status": "fail", "message": "No result found for the given student id"})
        }
        
    } catch (error) {
        console.log("error", error.message);
        res.status(400).json({"status": "fail", "error": error.message});    
    }
   
})

// get all the students who passed/failed 
app.get('/students', async(req, res)=>{
    try {
        let resultStatus = req.query.resultStatus;
        let students = [];
        if(typeof resultStatus != 'undefined'){
            let result = await pool.query(`SELECT mark1+mark2+mark3 AS total, name FROM students`);
            if(result.rowCount>0){
                if(resultStatus == 'passed'){
                    for(let i=0;i<result.rows.length;i++){
                        if(result.rows[i].total>=105){
                            students.push(result.rows[i]);
                        }
                    }
                    res.status(200).json({"data": students, "status": "success", "message": "List of the students who passed has been viewed successfully"});
                }
                else if(resultStatus == "failed"){
                    for(let i=0;i<result.rows.length;i++){
                        if(result.rows[i].total<105){
                            students.push(result.rows[i]);
                        }
                    }
                    res.status(200).json({"data": students, "status": "success", "message": "List of the students who failed has been viewed successfully"});
                }
            }else{
                res.status(200).json({"status": "fail", "message": "No record found"});
            }
        }
        else{
            res.status(400).json({"status": "fail", "message": "resultStatus is required"})
        }
        
    } catch (error) {
        console.log("error", error.message);
        res.status(400).json({"status": "fail", "error": error.message});    
    }
   
})


app.listen(8000,()=> {
    console.log("server is listening on port 8000");
});