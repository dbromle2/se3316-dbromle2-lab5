//dbromle2
//se3316 lab5

const express = require("express");
const app = express();
const fs = require("fs");
const fsfs = require("fs");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcrypt");

//DSB Edit 28 Dec 2020-> removing problem line to build webapp to allow it to run on AWS per lab5 Submission Instructions(7)
const path = require('path');// Point to directory containing static files
app.use(express.static(path.join(__dirname, 'dist/lab5')));
//catch all other routes to return the index file
app.get('*', (req,res) => {res.sendFile(path.join(__dirname,'dist/lab5/index.html'));});
//DSB Edit 28 Dec 2020-> removing problem line to build webapp to allow it to run on AWS per lab5 Submission Instructions(7)

let rawdata = fs.readFileSync("./database/Lab3-timetable-data.json");
let courses = JSON.parse(rawdata);

let rawScheduleData = fsfs.readFileSync("./database/schedule.json");
let sData = JSON.parse(rawScheduleData);

let rawPolicyData = fs.readFileSync("./database/site-policies.json");
let sitePolicies = JSON.parse(rawPolicyData);

let rawUserData = fs.readFileSync("./database/users.json");
let uData = JSON.parse(rawUserData);

// serve files in static' folder at root URL '/'
app.use('/', express.static('static'));

//allow for parsing json for POSTs
app.use(express.json());

//load the index.html page
router.get("/", (req,res)=>{
    res.sendFile("index.html", {root: __dirname});
});

{/*--------------- SECURE FUNCTIONALITY ---------------*/

    /*--------------- GETs ---------------*/

    //Step 1 Get all subjects and descriptions
    app.get("/secure/courses", (req, res) => {
        let myArr = [];

        for (var i = 0; i < courses.length; i++) {
            myArr[i] = courses[i].subject + " " + courses[i].className;
        }

        res.send(myArr);
    });

    //Step 2 Get all course codes for a given subject code
    app.get("/secure/courses/:subject", (req, res) => {
        let sInvalid = req.params.subject;
        let myArr = [];

        //Input validation (code from lab 1)
        let alpha = /^[a-zA-Z]*$/;
        let validate = alpha.exec(sInvalid); //validate the string
        let isStringValid = Boolean(validate);
        let s = validate;

        if (isStringValid) {
            const course = courses.filter(c => c.subject == s);
            if (course.length == 0) res.status(404).send("This subject code doesn't exist.");

            for (var i = 0; i < course.length; i++) {
                myArr[i] = course[i].catalog_nbr;
            }

            res.send(myArr);
        } else res.status(400).send("Invalid input.");
    });

    //Step 3 Get timetable entry for a given subject code, course code, and optional component
    //No component specified
    //pdated per Requirement 3.b. - Returns subject, catalog_nbr, className, class_section, ssr_component
    app.get("/secure/courses/:subject/:course", (req, res) => {
        let sInvalid = req.params.subject;
        let corInvalid = req.params.course;
        let myArr = [];
        let corLen = corInvalid.length;

        //Input validation (code from lab 1)
        let alpha = /^[0-9a-zA-Z]*$/;
        let validate = alpha.exec(sInvalid); //validate the string
        let validate1 = alpha.exec(corInvalid);
        let isStringValid = Boolean(validate && validate1);
        let s = validate;
        let cor = validate1;
        
        //note: must set toUpperCase() on the front end!

        console.log(s + " " + cor + " "); //testing

        if (isStringValid) {
            //Soft search for catalog_nbr without suffix
            if (corLen == 4){
                const course = courses.filter(c => (c.subject == s) && (c.catalog_nbr.substring(0,4) == cor));
                if (course.length == 0) res.status(404).send("This subject code doesn't exist.2");
                for (var i = 0; i < course.length; i++) {
                    myArr[0] = course[i].subject;
                    myArr[1] = course[i].catalog_nbr;
                    myArr[2] = course[i].className;
                    myArr[3] = course[i].course_info[0].class_section;
                    myArr[4] = course[i].course_info[0].ssr_component;
                }
            } else {
                //Search for catalog_nbr WITH suffix
                const course = courses.filter(c => (c.subject == s) && (c.catalog_nbr == cor));
                if (course.length == 0) res.status(404).send("This subject code doesn't exist.");
                for (var i = 0; i < course.length; i++) {
                    //myArr[i] = course[i].subject + " " + course[i].catalog_nbr + " " + course[i].className + " " + course[i].course_info[0].class_section + " " + course[i].course_info[0].ssr_component;
                    myArr[0] = course[i].subject;
                    myArr[1] = course[i].catalog_nbr;
                    myArr[2] = course[i].className;
                    myArr[3] = course[i].course_info[0].class_section;
                    myArr[4] = course[i].course_info[0].ssr_component;
                }
            }res.send(myArr);
        } else res.status(400).send("Invalid input(s).");
    });

    //Requirement 3.c. - Expand search result to show all remaining info
    app.get("/secure/courses/:subject/:course/more", (req,res)=>{
        let sInvalid = req.params.subject;
        let corInvalid = req.params.course;
        let myArr = [];

        //Input validation (code from lab 1)
        let alpha = /^[0-9a-zA-Z]*$/;
        let validate = alpha.exec(sInvalid); //validate the string
        let validate1 = alpha.exec(corInvalid);
        let isStringValid = Boolean(validate && validate1);
        let s = validate;
        let cor = validate1;

        if (isStringValid){
            const course = courses.filter(c => (c.subject == s) && (c.catalog_nbr == cor));
            if (course.length == 0) res.status(404).send("This subject code doesn't exist.");

            for (var i = 0; i < course.length; i++) {
                myArr[0] = course[i].course_info[0].class_nbr;
                myArr[1] = course[i].course_info[0].start_time;
                myArr[2] = course[i].course_info[0].descrlong;
                myArr[3] = course[i].course_info[0].end_time;
                myArr[4] = course[i].course_info[0].facility_ID;
                myArr[5] = course[i].course_info[0].days;
                myArr[6] = course[i].course_info[0].instructors;
                myArr[7] = course[i].course_info[0].enrl_stat;
                myArr[7] = course[i].course_info[0].descr;
                myArr[7] = course[i].catalog_description;
            }
            res.send(myArr);
        } else res.status(400).send("Invalid input(s).")
    });

    //Step 6 Get list of subject code,course code pairs for schedule
    app.get("/secure/schedule/view/:name", authenticateToken, (req, res) => {
        let nameInvalid = req.params.name;
        let myArr = [];

        //Input validation (code from lab 1)
        let alpha = /^[0-9a-zA-Z\w\s]*$/;
        let validate = alpha.exec(nameInvalid); //validate the string
        let isStringValid = Boolean(validate);
        let name = validate;

        if (isStringValid) {
            const schedule = sData.find(s => s.name == name);

            for (var i = 0; i < schedule.sCourses.length; i++) {
                myArr[i] = schedule.sCourses[i];
            }
            res.send(myArr);
        } else res.status(400).send("Invalid input.");
    });

    //Step 8 Get list of schedule names and number of courses in each
    app.get("/secure/schedule/view", authenticateToken, (req, res) => {
        let myArr = [];

        //Only show schedules made by the current user
        const schedule = sData.filter(s => s.username === req.user.username);

        for (var i = 0; i < schedule.length; i++) {
            myArr[i] = "Name: " + schedule[i].name + " Number of courses: " + schedule[i].sCourses.length;
        }

        res.send(myArr);
    });

    /*--------------- POSTs ---------------*/

    //Step 4 Create a new schedule
    //updated for Requirement 4.a. - Create new schedule
    app.post("/secure/schedule", (req,res)=>{
        let nameInvalid = req.body.name;
        let usernameInvalid = req.body.username;
        let descrInvalid = req.body.descr;
        let visibility = req.body.visibility;
        let sCoursesInvalid = req.body.sCourses;
        //Requirement 4.f. - Enforce required inputs
        if(sCoursesInvalid == undefined) return res.status(400).send("Error: cannot create schedule, missing required fields.");

        //Input validation (code from lab 1)
        let alpha = /^[0-9a-zA-Z\w\s]*$/;
        let validateName = alpha.exec(nameInvalid); //validate the strings
        let validateUsername = alpha.exec(usernameInvalid);
        let validateDescr = alpha.exec(descrInvalid);
        let isStringValid = Boolean(validateName && validateUsername && validateDescr);
        let name = validateName[0];
        let username = validateUsername[0];
        let descr = validateDescr[0];
        if (descr == "undefined") descr = ""; //Requirement 4.a. - descr is optional
        //Input validation for the courses array(code from lab3)
        let myArr = [];
        let sCourses = [];
        for (var i = 0; i < sCoursesInvalid.length; i++) {
            let validate1 = alpha.exec(sCoursesInvalid[i]);
            myArr[i] = validate1;
        }
        for (var i = 0; i < myArr.length; i++) {
            sCourses[i] = myArr[i];
        }
    
        if(isStringValid){
            //Requirement 4.f. - Enforce required inputs
            if(name == "undefined" || sCourses == "undefined") return res.status(400).send("Error: cannot create schedule, missing required fields.");
            //throw error if it already exists
            let exists = sData.filter(s => s.name == name);
            if(exists.length != 0) return res.status(400).send("This name already exists");
            
            let date = new Date;
            const schedule = {
                name: name,
                username: username,
                descr: descr,
                date: date,
                sCourses: sCourses,
                visibility: visibility
            };
    
            console.log(name);
    
            sData.push(schedule);
            let newSchedule = JSON.stringify(sData);
            fs.writeFileSync("./database/schedule.json", newSchedule);
    
            res.send(schedule);
        } else res.status(400).send("Invalid input.");
    });

    /*--------------- PUTs ---------------*/

    //Step 5 Save a list of subject code,course code pairs to the given schedule name
    app.put("/secure/schedule/:name", (req, res) => {
        let nameInvalid = req.params.name;
        let sCoursesInvalid = req.body.sCourses;
        //Requirement 4.f. - Enforce required inputs
        if(sCoursesInvalid == undefined) return res.status(400).send("Error: cannot create schedule, missing required fields.");
        console.log(sCoursesInvalid.length);        

        //Input validation (code from lab 1)
        let alpha = /^[0-9a-zA-Z\w\s\[\]\,\"]*$/;
        let validate = alpha.exec(nameInvalid); //validate the string
        //let validate1 = alpha.exec(sCoursesInvalid);
        let myArr = [];
        let sCourses = [];
        for (var i = 0; i < sCoursesInvalid.length; i++) {
            let validate1 = alpha.exec(sCoursesInvalid[i]);
            myArr[i] = validate1;
        }
        let isStringValid = Boolean(validate);
        let name = validate[0];

        for (var i = 0; i < myArr.length; i++) {
            sCourses[i] = myArr[i];
        }

        if (isStringValid) {
            //Requirement 4.f. - Enforce required inputs
            if(name == "undefined" || sCourses == "undefined") return res.status(400).send("Error: cannot create schedule, missing required fields.");
            //throw error if the schedule name does not exist
            let exists = sData.filter(s => s.name == name);
            if (exists.length == 0) return res.status(400).send("Invalid schedule name");

            let schedule = sData.find(s => s.name == name);
            //schedule.sCourses = sCourses;
            console.log(sCourses.length);
            for (var i = 0; i < sCourses.length; i++) {
                schedule.sCourses[i] = sCourses[i];
            }

            let newSchedule = JSON.stringify(sData);
            fs.writeFileSync("./database/schedule.json", newSchedule);

            res.send(schedule);
        } else res.status(400).send("Invalid input.");
    });

    /*--------------- DELETEs ---------------*/

    //Step 7 Delete a schedule with a given name
    app.delete("/secure/schedule/:name", authenticateToken, (req, res) => {
        let nameInvalid = req.params.name;

        //Input validation (code from lab 1)
        let alpha = /^[0-9a-zA-Z\w\s]*$/;
        let validate = alpha.exec(nameInvalid); //validate the string
        let isStringValid = Boolean(validate);
        let name = validate[0];

        //only verified users can do this
        if (req.user.privileges != "standard") return res.status(403).send("Access forbidden!");
        

        if (isStringValid) {
            //throw error if the schedule name does not exist
            let exists = sData.filter(s => s.name == name);
            if (exists.length == 0) return res.status(400).send("Invalid schedule name");

            //Only allow schedules made by the current user
            let schedule = sData.find(s => (s.name == name) && (s.username === req.user.username));

            sData.splice(sData.indexOf(schedule), 1);

            let newSchedule = JSON.stringify(sData);
            fsfs.writeFileSync("./schedule.json", newSchedule);

            res.send(schedule);
        } else res.status(400).send("Invalid input.");
    });

    //Step 9 Delete all schedules
    app.delete("/secure/schedule", authenticateToken, (req, res) => {
        //Only delete schedules made by the current user
        const schedule = sData.filter(s => s.username === req.user.username);

        let myArr = [];

        let newSchedule = JSON.stringify(myArr);
        fsfs.writeFileSync("./schedule.json", newSchedule);

        res.send(sData);
    });
}

{/*--------------- INSECURE FUNCTIONALITY ---------------*/
    /*--------------- GETs ---------------*/

    //Step 1 Get all subjects and descriptions
    app.get("/courses", (req, res) => {
        let myArr = [];

        for (var i = 0; i < courses.length; i++) {
            myArr[i] = courses[i].subject + " " + courses[i].className;
        }

        res.send(myArr);
    });

    //Step 2 Get all course codes for a given subject code
    app.get("/courses/:subject", (req, res) => {
        let sInvalid = req.params.subject;
        let myArr = [];

        //Input validation (code from lab 1)
        let alpha = /^[a-zA-Z]*$/;
        let validate = alpha.exec(sInvalid); //validate the string
        let isStringValid = Boolean(validate);
        let s = validate;

        if (isStringValid) {
            const course = courses.filter(c => c.subject == s);
            if (course.length == 0) res.status(404).send("This subject code doesn't exist.");

            for (var i = 0; i < course.length; i++) {
                myArr[i] = course[i].catalog_nbr;
            }

            res.send(myArr);
        } else res.status(400).send("Invalid input.");
    });

    //Step 3 Get timetable entry for a given subject code, course code, and optional component
    //No component specified
    //pdated per Requirement 3.b. - Returns subject, catalog_nbr, className, class_section, ssr_component
    app.get("/courses/:subject/:course", (req, res) => {
        let sInvalid = req.params.subject;
        let corInvalid = req.params.course;
        let myArr = [];
        let corLen = corInvalid.length;

        //Input validation (code from lab 1)
        let alpha = /^[0-9a-zA-Z]*$/;
        let validate = alpha.exec(sInvalid); //validate the string
        let validate1 = alpha.exec(corInvalid);
        let isStringValid = Boolean(validate && validate1);
        let s = validate;
        let cor = validate1;
        
        //note: must set toUpperCase() on the front end!

        console.log(s + " " + cor + " "); //testing

        if (isStringValid) {
            //Soft search for catalog_nbr without suffix
            if (corLen == 4){
                const course = courses.filter(c => (c.subject == s) && (c.catalog_nbr.substring(0,4) == cor));
                if (course.length == 0) res.status(404).send("This subject code doesn't exist.2");
                for (var i = 0; i < course.length; i++) {
                    myArr[0] = course[i].subject;
                    myArr[1] = course[i].catalog_nbr;
                    myArr[2] = course[i].className;
                    myArr[3] = course[i].course_info[0].class_section;
                    myArr[4] = course[i].course_info[0].ssr_component;
                }
            } else {
                //Search for catalog_nbr WITH suffix
                const course = courses.filter(c => (c.subject == s) && (c.catalog_nbr == cor));
                if (course.length == 0) res.status(404).send("This subject code doesn't exist.");
                for (var i = 0; i < course.length; i++) {
                    //myArr[i] = course[i].subject + " " + course[i].catalog_nbr + " " + course[i].className + " " + course[i].course_info[0].class_section + " " + course[i].course_info[0].ssr_component;
                    myArr[0] = course[i].subject;
                    myArr[1] = course[i].catalog_nbr;
                    myArr[2] = course[i].className;
                    myArr[3] = course[i].course_info[0].class_section;
                    myArr[4] = course[i].course_info[0].ssr_component;
                }
            }res.send(myArr);
        } else res.status(400).send("Invalid input(s).");
    });

    //Requirement 3.c. - Expand search result to show all remaining info
    app.get("/courses/:subject/:course/more", (req,res)=>{
        let sInvalid = req.params.subject;
        let corInvalid = req.params.course;
        let myArr = [];

        //Input validation (code from lab 1)
        let alpha = /^[0-9a-zA-Z]*$/;
        let validate = alpha.exec(sInvalid); //validate the string
        let validate1 = alpha.exec(corInvalid);
        let isStringValid = Boolean(validate && validate1);
        let s = validate;
        let cor = validate1;

        if (isStringValid){
            const course = courses.filter(c => (c.subject == s) && (c.catalog_nbr == cor));
            if (course.length == 0) res.status(404).send("This subject code doesn't exist.");

            for (var i = 0; i < course.length; i++) {
                myArr[0] = course[i].course_info[0].class_nbr;
                myArr[1] = course[i].course_info[0].start_time;
                myArr[2] = course[i].course_info[0].descrlong;
                myArr[3] = course[i].course_info[0].end_time;
                myArr[4] = course[i].course_info[0].facility_ID;
                myArr[5] = course[i].course_info[0].days;
                myArr[6] = course[i].course_info[0].instructors;
                myArr[7] = course[i].course_info[0].enrl_stat;
                myArr[7] = course[i].course_info[0].descr;
                myArr[7] = course[i].catalog_description;
            }
            res.send(myArr);
        } else res.status(400).send("Invalid input(s).")
    });

    //Step 8 Get list of schedule names and number of courses in each
    app.get("/schedule/view", (req, res) => {
        let myArr = [];

        for (var i = 0; i < 10; i++) {
            myArr[i] = "Name: " + sData[i].name + " Creator: " + sData[i].username + " Number of courses: " + sData[i].sCourses.length;
        }

        res.send(myArr);
    });

    //Requirement 7.a. - Publicly accessible security and privacy policy
    app.get("/security-privacy-policy", (req,res)=>{
        res.send(sitePolicies.securityPrivacy);
    });

    //Requirement 7.b. - Publicly accessible acceptable use policy
    app.get("/acceptable-use-policy", (req,res)=>{
        res.send(sitePolicies.acceptableUse);
    });

    //Requirement 7.c. - Publicly accessible DMCA takedown policy
    app.get("/dmca-copyright-policy", (req,res)=>{
        res.send(sitePolicies.dmcaTakedown);
    });

    /*--------------- POSTs ---------------*/

    //Requirement 2.a. - Create an account
    app.post("/login/create/:username/:password/:email", (req,res)=>{
        let usernameInvalid = req.params.username;
        let password = req.params.password;
        let emailInvalid = req.params.email;

        //Input validation (modified from code from lab 1)
        let alpha = /^[0-9a-zA-Z]*$/;

        //Requirement 2.c. - Input validation for email
        /*regex taken from https://www.w3.org/TR/2012/WD-html-markup-20120329/input.email.html
        (why build my own when I can use the official one?)*/
        let emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/ 

        //password regex: minimum of 8, maximum of 20 of any combination of characters, numbers, and select special characters
        let passwordRegex = /^[a-zA-z0-9!@#$%*&]{8,20}$/;
        let isPasswordValid = Boolean(passwordRegex.exec(passwordInvalid));
        if (isPasswordValid == false) return res.status(400).send("Bad password! Password must be a min length 8, max length 20, of any conbination of characters, numbers, and the special characters !, @, #, $, %, *, or &");

        let isStringValid = alpha.test(usernameInvalid);
        let isEmailValid = emailRegex.test(emailInvalid);

        if(isStringValid && isEmailValid && isPasswordValid){
            //now define the valid inputs
            let username = usernameInvalid;
            let email = emailInvalid;

            //throw error if it already exists
            let usernameExists = uData.filter(u => u.username == username);
            let emailExists = uData.filter(u => u.email == email);
            if ((usernameExists.length != 0) && (emailExists.length != 0)) return res.status(400).send("This account already exists!");
            else if (usernameExists.length != 0) return res.status(400).send("This username is taken!");
            else if (emailExists.length != 0) return res.status(400).send("There is already an account registered to this email address!");

            //Hash the password so it's secure. Using bcrypt
            const hash = bcrypt.hashSync(password, 10)
            const newUser = {
                username: username,
                password: hash,
                email: email,
                privileges: "standard",
                active: "active"
            };

            uData.push(newUser);
            let newUsers = JSON.stringify(uData);
            fs.writeFileSync("./database/users.json", newUsers);
            res.send(newUser);
        } //throw errors for bad inputs
        else if (isStringValid == false && isEmailValid == true) res.status(400).send("Invalid username input.");
        else if (isStringValid == true && isEmailValid == false) res.status(400).send("Invalid email input.");
        else res.status(400).send("Invalid inputs.");
    });

    //Requirement 2.a. - Login mechanism
    app.post("/login", (req,res)=>{
        //validate the inputs
        let emailInvalid = req.body.email;

        //Requirement 2.c. - Input validation for email
        /*regex taken from https://www.w3.org/TR/2012/WD-html-markup-20120329/input.email.html
        (why build my own when I can use the official one?)*/
        let emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/ 
        let isEmailValid = emailRegex.test(emailInvalid);

        // //password regex: minimum of 8, maximum of 20 of any combination of characters, numbers, and select special characters
        // let passwordRegex = /^[a-zA-z0-9!@#$%*&]{8,20}$/;
        // let isPasswordValid = Boolean(passwordRegex.exec(passwordInvalid));



        if (isEmailValid){
            //now define the valid inputs
            let email = emailInvalid;
            let password = req.body.password;

            //throw error if the schedule name does not exist
            let accountExists = uData.filter(u => u.email == email);
            if (accountExists.length == 0) return res.status(400).send("That email is not associated with an account");
            
            let user = uData.find(u => u.email == email);
            if (bcrypt.compareSync(password, user.password)){//bcrypt for hashing password
                //Requirement 2.e. - Display error message on inactive account login attempt
                if (user.active == "inactive") res.status(400).send("Login failed! Your account has been marked inactive, please contact the website admins to rectify this.");
                //Requirement 2.d. - Display error message if account not verified
                else if (user.verified != "verified") res.status(400).send("Login failed! Please verify your account.");
                else {
                    
                    const newUser = {username: user.username, privileges: user.privileges};
                    const accessToken = jwt.sign(newUser, process.env.ACCESS_TOKEN_SECRET);

                    return res.send(accessToken);
                }
            } else res.status(400).send("Login failed! Incorrect password, try again.");
        } else res.status(400).send("Login failed!");
    });

    /*--------------- PUTs ---------------*/

    //Requirement 2.d. - Verification of email
    app.put("/verify/:email", (req,res)=>{
        //just in case, validate it again
        let emailInvalid = req.params.email;

        //Requirement 2.c. - Input validation for email
        /*regex taken from https://www.w3.org/TR/2012/WD-html-markup-20120329/input.email.html
        (why build my own when I can use the official one?)*/
        let emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/ 

        let isEmailValid = emailRegex.test(emailInvalid);

        if (isEmailValid){
            let email = emailInvalid;
            //throw error if the schedule name does not exist
            let exists = uData.filter(u => u.email == email);
            if (exists.length == 0) return res.status(400).send("That email is not associated with an account");

            let user = uData.find(u => u.email == email);
            user.verified = "verified";

            let newUsers = JSON.stringify(uData);
            fs.writeFileSync("./database/users.json", newUsers);

            res.send(user);
        } else res.status(400).send("Invalid input.");
    });

    /*--------------- DELETEs ---------------*/
    //nothing to delete for unverified users
}

{/*--------------- ADMIN FUNCTIONALITY ---------------*/
    /*//Requirement 5.a. - Special admin access
    //These functions will only appear to the "admin" user thanks to the following line of code:
    if (req.user.privileges == "standard") return res.status(403).send("Access forbidden!");*/

    /*--------------- PUTs ---------------*/

    //Requirement 5.b. - Admin can grant admin access
    app.put("/admin/grant/:username", authenticateToken, (req,res)=>{
        //throw error if not an admin
        if (req.user.privileges == "standard") return res.status(403).send("Access forbidden!");
        //throw error if the username does not exist
        let username = req.params.username;
        let exists = uData.filter(u => u.username == username);
        if (exists.length == 0) return res.status(400).send("Invalid account username");

        let user = uData.find(u => u.username == username);
        user.privileges = "admin";

        let newUsers = JSON.stringify(uData);
        fs.writeFileSync("./database/users.json", newUsers);

        res.send(user);
    });

    //Requirement 5.d. - Admin can deactivate/reactivate accounts
    app.put("/admin/active/:username", authenticateToken, (req,res)=>{
        //throw error if not an admin
        if (req.user.privileges == "standard") return res.status(403).send("Access forbidden!");
        //throw error if the username does not exist
        let username = req.params.username;
        let exists = uData.filter(u => u.username == username);
        if (exists.length == 0) return res.status(400).send("Invalid account username");

        let user = uData.find(u => u.username == username);
        if (user.active == "active") user.active = "inactive";
        else user.active = "active";

        let newUsers = JSON.stringify(uData);
        fs.writeFileSync("./database/users.json", newUsers);

        res.send(user);
    });

    //Requirement 7.a. - 7.c. - Edit site policy stuff
    app.put("/admin/updatePolicies", authenticateToken, (req,res)=>{
        //throw error if not an admin
        if (req.user.privileges == "standard") return res.status(403).send("Access forbidden!");

        let policy = req.body.policy;
        let data = req.body.data;

        if (policy == "securityPrivacy"){
            sitePolicies.securityPrivacy = data;
        }
        else if (policy == "acceptableUse"){
            sitePolicies.acceptableUse = data;
        }
        else if (policy == "dmcaTakedown"){
            sitePolicies.dmcaTakedown = data;
        } else return res.status(400).send("Error, could not find that policy!");

        let newPolicies = JSON.stringify(sitePolicies);
        fs.writeFileSync("./database/site-policies.json", newPolicies);

        res.send(policy);

    });
}

app.use('/api', router); // Set the routes at '/api'

function authenticateToken(req,res,next){
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) return res.status(401).send("Invalid token!");
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, newUser)=>{
        //catch an error
        if (err) return res.status(403).send("Access forbidden!");
        req.user = newUser;
        next();
    });
}


//start the server
const port = process.env.port || 4200;
app.listen(port, () => console.log("Listening on port " + port + "."));