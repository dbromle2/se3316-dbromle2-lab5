//dbromle2
//se3316 lab5

const express = require("express");
const app = express();
const fs = require("fs");
const fsfs = require("fs");
const router = express.Router();

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
    app.get("/secure/courses/:subject/:course", (req, res) => {
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

        console.log(s + " " + cor + " "); //testing

        if (isStringValid) {
            const course = courses.filter(c => (c.subject == s) && (c.catalog_nbr == cor));
            if (course.length == 0) res.status(404).send("This subject code doesn't exist.");

            for (var i = 0; i < course.length; i++) {
                myArr[i] = "Start time: " + course[i].course_info[0].start_time + " End time: " + course[i].course_info[0].end_time + " on " + course[i].course_info[0].days;
            }

            res.send(myArr);
        } else res.status(400).send("Invalid input(s).");
    });
    //Component specified
    app.get("/secure/courses/:subject/:course/:component", (req, res) => {
        let sInvalid = req.params.subject.toUpperCase();
        let corInvalid = req.params.course.toUpperCase();
        let comInvalid = req.params.component.toUpperCase();
        let myArr = [];

        //Input validation (code from lab 1)
        let alpha = /^[0-9a-zA-Z]*$/;
        let validate = alpha.exec(sInvalid); //validate the string
        let validate1 = alpha.exec(corInvalid);
        let validate2 = alpha.exec(comInvalid);
        let isStringValid = Boolean(validate && validate1 && validate2);
        let s = validate;
        let cor = validate1;
        let com = validate2;

        console.log(s + " " + cor + " " + com + " "); //testing

        if (isStringValid) {
            const course = courses.filter(c => (c.subject == s) && (c.catalog_nbr == cor) && (c.course_info[0].ssr_component == com));
            if (course.length == 0) res.status(404).send("A course in this configuration does not exist.");

            for (var i = 0; i < course.length; i++) {
                myArr[i] = "Start time: " + course[i].course_info[0].start_time + " End time: " + course[i].course_info[0].end_time + " on " + course[i].course_info[0].days;
            }

            res.send(myArr);
        } else res.status(400).send("Invalid input(s).");
    });

    //Step 6 Get list of subject code,course code pairs for schedule
    app.get("/secure/schedule/view/:name", (req, res) => {
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
    app.get("/secure/schedule/view", (req, res) => {
        let myArr = [];

        for (var i = 0; i < sData.length; i++) {
            myArr[i] = "Name: " + sData[i].name + " Number of courses: " + sData[i].sCourses.length;
        }

        res.send(myArr);
    });

    /*--------------- POSTs ---------------*/

    //Step 4 Create a new schedule
    app.post("/secure/schedule", (req, res) => {
        let nameInvalid = req.body.name;

        //Input validation (code from lab 1)
        let alpha = /^[0-9a-zA-Z\w\s]*$/;
        let validate = alpha.exec(nameInvalid); //validate the string
        let isStringValid = Boolean(validate);
        let name = validate[0];

        if (isStringValid) {
            //throw error if it already exists
            let exists = sData.filter(s => s.name == name);
            if (exists.length != 0) return res.status(400).send("This name already exists");

            const schedule = {
                name: name,
                sCourses: []
            };

            console.log(name);

            sData.push(schedule);
            let newSchedule = JSON.stringify(sData);
            fs.writeFileSync("./schedule.json", newSchedule);

            res.send(schedule);
        } else res.status(400).send("Invalid input.");
    });

    /*--------------- PUTs ---------------*/

    //Step 5 Save a list of subject code,course code pairs to the given schedule name
    app.put("/secure/schedule/:name", (req, res) => {
        let nameInvalid = req.params.name;
        let sCoursesInvalid = req.body.sCourses;
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
            fs.writeFileSync("./schedule.json", newSchedule);

            res.send(schedule);
        } else res.status(400).send("Invalid input.");
    });

    /*--------------- DELETEs ---------------*/

    //Step 7 Delete a schedule with a given name
    app.delete("/secure/schedule/:name", (req, res) => {
        let nameInvalid = req.params.name;

        //Input validation (code from lab 1)
        let alpha = /^[0-9a-zA-Z\w\s]*$/;
        let validate = alpha.exec(nameInvalid); //validate the string
        let isStringValid = Boolean(validate);
        let name = validate[0];

        if (isStringValid) {
            //throw error if the schedule name does not exist
            let exists = sData.filter(s => s.name == name);
            if (exists.length == 0) return res.status(400).send("Invalid schedule name");

            let schedule = sData.find(s => s.name == name);

            sData.splice(sData.indexOf(schedule), 1);

            let newSchedule = JSON.stringify(sData);
            fsfs.writeFileSync("./schedule.json", newSchedule);

            res.send(schedule);
        } else res.status(400).send("Invalid input.");
    });

    //Step 9 Delete all schedules
    app.delete("/secure/schedule", (req, res) => {
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
            //not functional right now
            // if (cor.length == 4){
            //     const course = courses.filter(c => c.subject == s);
            //     console.log(course);
            //     for (var i = 0; i < course.length; i++){
            //         const corNoSuffix = courses.filter(c => c.catalog_nbr == cor);
            //     }
            // }
            const course = courses.filter(c => (c.subject == s) && (c.catalog_nbr == cor));
            if (course.length == 0) res.status(404).send("This subject code doesn't exist.");

            for (var i = 0; i < course.length; i++) {
                //myArr[i] = "Start time: " + course[i].course_info[0].start_time + " End time: " + course[i].course_info[0].end_time + " on " + course[i].course_info[0].days;
                //myArr[i] = course[i].subject + " " + course[i].catalog_nbr + " " + course[i].className + " " + course[i].course_info[0].class_section + " " + course[i].course_info[0].ssr_component;
                myArr[0] = course[i].subject;
                myArr[1] = course[i].catalog_nbr;
                myArr[2] = course[i].className;
                myArr[3] = course[i].course_info[0].class_section;
                myArr[4] = course[i].course_info[0].ssr_component;
            }

            res.send(myArr);
        } else res.status(400).send("Invalid input(s).");
    });
    //Component specified
    app.get("/courses/:subject/:course/:component", (req, res) => {
        let sInvalid = req.params.subject.toUpperCase();
        let corInvalid = req.params.course.toUpperCase();
        let comInvalid = req.params.component.toUpperCase();
        let myArr = [];

        //Input validation (code from lab 1)
        let alpha = /^[0-9a-zA-Z]*$/;
        let validate = alpha.exec(sInvalid); //validate the string
        let validate1 = alpha.exec(corInvalid);
        let validate2 = alpha.exec(comInvalid);
        let isStringValid = Boolean(validate && validate1 && validate2);
        let s = validate;
        let cor = validate1;
        let com = validate2;

        console.log(s + " " + cor + " " + com + " "); //testing

        if (isStringValid) {
            const course = courses.filter(c => (c.subject == s) && (c.catalog_nbr == cor) && (c.course_info[0].ssr_component == com));
            if (course.length == 0) res.status(404).send("A course in this configuration does not exist.");

            for (var i = 0; i < course.length; i++) {
                myArr[i] = "Start time: " + course[i].course_info[0].start_time + " End time: " + course[i].course_info[0].end_time + " on " + course[i].course_info[0].days;
            }

            res.send(myArr);
        } else res.status(400).send("Invalid input(s).");
    });

    //Step 6 Get list of subject code,course code pairs for schedule
    app.get("/schedule/view/:name", (req, res) => {
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
    app.get("/schedule/view", (req, res) => {
        let myArr = [];

        for (var i = 0; i < sData.length; i++) {
            myArr[i] = "Name: " + sData[i].name + " Number of courses: " + sData[i].sCourses.length;
        }

        res.send(myArr);
    });

    //Requirement 2.a. - Login mechanism
    app.get("/login/:email/:password", (req,res)=>{
        //validate the inputs
        let emailInvalid = req.params.email;
        let passwordInvalid = req.params.password;

        //Requirement 2.c. - Input validation for email
        /*regex taken from https://www.w3.org/TR/2012/WD-html-markup-20120329/input.email.html
        (why build my own when I can use the official one?)*/
        let emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/ 
        let isEmailValid = emailRegex.test(emailInvalid);

        //password regex: minimum of 8, maximum of 20 of any combination of characters, numbers, and select special characters
        let passwordRegex = /^[a-zA-z0-9!@#$%*&]{8,20}$/;
        let isPasswordValid = Boolean(passwordRegex.exec(passwordInvalid));

        if (isEmailValid && isPasswordValid){
            //now define the valid inputs
            let email = emailInvalid;
            let password = passwordInvalid;

            //throw error if the schedule name does not exist
            let accountExists = uData.filter(u => u.email == email);
            if (accountExists.length == 0) return res.status(400).send("That email is not associated with an account");
            
            let user = uData.find(u => u.email == email);
            if (user.password == password){
                //Requirement 2.e. - Display error message on inactive account login attempt
                if (user.active == "inactive") res.status(400).send("Login failed! Your account has been marked inactive, please contact the website admins to rectify this.");
                //Requirement 2.d. - Display error message if account not verified
                else if (user.verified != "verified") res.status(400).send("Login failed! Please verify your account.");
                else {
                    let myArr = [];
                    myArr[0] = user.username;
                    myArr[1] = user.privileges;

                    return res.send(myArr);
                }
            } else res.status(400).send("Login failed! Incorrect password, try again.");
        } else res.status(400).send("Login failed!");
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

    //Step 4 Create a new schedule
    app.post("/schedule", (req, res) => {
        let nameInvalid = req.body.name;

        //Input validation (code from lab 1)
        let alpha = /^[0-9a-zA-Z\w\s]*$/;
        let validate = alpha.exec(nameInvalid); //validate the string
        let isStringValid = Boolean(validate);
        let name = validate[0];

        if (isStringValid) {
            //throw error if it already exists
            let exists = sData.filter(s => s.name == name);
            if (exists.length != 0) return res.status(400).send("This name already exists");

            const schedule = {
                name: name,
                sCourses: []
            };

            console.log(name);

            sData.push(schedule);
            let newSchedule = JSON.stringify(sData);
            fs.writeFileSync("./database/schedule.json", newSchedule);

            res.send(schedule);
        } else res.status(400).send("Invalid input.");
    });

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

        let isStringValid = alpha.test(usernameInvalid);
        let isEmailValid = emailRegex.test(emailInvalid);

        if(isStringValid && isEmailValid){
            //now define the valid inputs
            let username = usernameInvalid;
            let email = emailInvalid;

            //throw error if it already exists
            let usernameExists = uData.filter(u => u.username == username);
            let emailExists = uData.filter(u => u.email == email);
            if ((usernameExists.length != 0) && (emailExists.length != 0)) return res.status(400).send("This account already exists!");
            else if (usernameExists.length != 0) return res.status(400).send("This username is taken!");
            else if (emailExists.length != 0) return res.status(400).send("There is already an account registered to this email address!");

            const newUser = {
                username: username,
                password: password,
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

    /*--------------- PUTs ---------------*/

    //Step 5 Save a list of subject code,course code pairs to the given schedule name
    app.put("/schedule/:name", (req, res) => {
        let nameInvalid = req.params.name;
        let sCoursesInvalid = req.body.sCourses;
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
            fs.writeFileSync("./schedule.json", newSchedule);

            res.send(schedule);
        } else res.status(400).send("Invalid input.");
    });

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

    //Step 7 Delete a schedule with a given name
    app.delete("/schedule/:name", (req, res) => {
        let nameInvalid = req.params.name;

        //Input validation (code from lab 1)
        let alpha = /^[0-9a-zA-Z\w\s]*$/;
        let validate = alpha.exec(nameInvalid); //validate the string
        let isStringValid = Boolean(validate);
        let name = validate[0];

        if (isStringValid) {
            //throw error if the schedule name does not exist
            let exists = sData.filter(s => s.name == name);
            if (exists.length == 0) return res.status(400).send("Invalid schedule name");

            let schedule = sData.find(s => s.name == name);

            sData.splice(sData.indexOf(schedule), 1);

            let newSchedule = JSON.stringify(sData);
            fsfs.writeFileSync("./schedule.json", newSchedule);

            res.send(schedule);
        } else res.status(400).send("Invalid input.");
    });

    //Step 9 Delete all schedules
    app.delete("/schedule", (req, res) => {
        let myArr = [];
        let newSchedule = JSON.stringify(myArr);
        fsfs.writeFileSync("./schedule.json", newSchedule);

        res.send(sData);
    });
}

{/*--------------- ADMIN FUNCTIONALITY ---------------*/
    //Requirement 5.a. - Special admin access
    //These functions will only appear to the "admin" user

    /*--------------- PUTs ---------------*/

    //Requirement 5.b. - Admin can grant admin access
    app.put("/admin/grant/:username", (req,res)=>{
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
    app.put("/admin/active/:username", (req,res)=>{
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
}

app.use('/api', router); // Set the routes at '/api'

//start the server
const port = process.env.port || 3000;
app.listen(port, () => console.log("Listening on port " + port + "."));