Process to run the application

1) git clone
2) run npm i
3) set user, db, host, port in db.js file
4) run commands in database.sql to create tables
5) run the command ------> npm run start


-----------------------------------------

APIs

To upload a CSV file and insert into students table

Method: POST
Path: http://localhost:8000/upload

file -------> students.csv

----------------------------------------------

To get the result of the student by passing id

Method: GET
Path: http://localhost:8000/students/:id/result

req.params -----> {
    id : 1
}


---------------------------------------------

To get the result of the student by passing id


Method: GET
Path: http://localhost:8000/students

req.query---------> {
     result/status : passed/failed
}

------------------------------------------------
