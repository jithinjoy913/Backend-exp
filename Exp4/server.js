const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const User = require('./user.model.js')
const Employee = require('./employee.model.js')
const app = express();
const PORT = 3000;


const dataFilePath = path.join(__dirname, 'employees.json'); // Path to employees.json
const usersFilePath = path.join(__dirname, 'users.json'); // Path to users.json

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data
app.use(express.static(__dirname));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));
mongoose.connect("mongodb://localhost:27017/Experiment4")



// Utility functions for loading and saving data
const loadData = (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        return JSON.parse(dataBuffer.toString());
    } catch (error) {
        console.error(`Error loading data from ${filePath}:`, error);
        return [];
    }
};

const saveData = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error saving data to ${filePath}:`, error);
    }
};

// Handle Sign-Up
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existedUser = await User.findOne({ username });
        if (existedUser) {
            return res.status(409).json({ message: "User already exists." });
        }
        // const hashedPassword = await bcrypt.hash(signUpPassword, 8);
        const user = await User.create({
            username,
            password
        });
        return res.status(200).json({ message: "User created successfully" });
    } catch (error) {
        console.log(error);
    }
    // let users = loadData(usersFilePath);
    // const existingUser = users.find(user => user.username === username);

    // if (existingUser) {
    //     return res.status(400).send('Username already exists.');
    // }

    // users.push({ username, password });
    // saveData(usersFilePath, users);
    // res.status(201).send('User registered successfully.');
});

// Handle Login
// app.post('/login', (req, res) => {
//     const { username, password } = req.body;
//     const users = loadData(usersFilePath);
//     const user = users.find(user => user.username === username && user.password === password);

//     if (user) {
//         req.session.user = user;
//         res.status(200).send('Login successful.');
//     } else {
//         res.status(401).send('Invalid credentials.');
//     }
// });


app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(200).json({ message: "User not exists." });
        }
        if(password===user.password){
        //  const hashedPassword = await bcrypt.compare(password, user.password); 
        //  if (!hashedPassword) { 
        //  return res.status(200).json({ message: "Password is incorrect" }); 
        //  } 
        return res.status(200).json({ user, message: "Login successfull." });
    }
    return res.status(400).json({  message: "Login unsuccessfull." });
        
    } catch (error) {
        console.log(error);
    }
});

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login.html');
    }
};

// Protect the employee management routes
// app.use('/employees', authMiddleware);

// Serve the index.html file after authentication
// app.get('/', authMiddleware, (req, res) => {
//     res.sendFile(path.join(__dirname, 'index.html'));
// });

// Employee management routes
app.post('/employees', async (req, res) => {
    // const employees = loadData(dataFilePath);
    // const newEmployee = req.body;
    // employees.push(newEmployee);
    // saveData(dataFilePath, employees);
    // res.status(201).send('Employee added successfully');

    const { empId,
        empName,
        empPhone,
        empJob,
        empSalary } = req.body;
    console.log(req.body);

    try {
        const existedEmployee = await Employee.findOne({ empId });
        if (existedEmployee) {
            return res.status(200).json({ message: "Employee already exists" });
        }
        const employee = await Employee.create({
            empId, empPhone, empSalary, empName, empJob,
        });
        if (!employee) {
            return res.status(200).json({ message: "Something error" });
        }
        return res.status(200).json({ message: "Employee added successfully" });
    } catch (error) {
        console.log(error);
    }

});

app.get('/employees/:emp_id', async (req, res) => {
    const empId = req.params.emp_id;
    // const employees = loadData(dataFilePath);
    // const employee = employees.find(emp => emp.emp_id === empId);

    const employee = await Employee.findOne({ empId });
    if (employee) {
        res.json(employee);
    } else {
        res.status(404).send('Employee not found');
    }

});


app.put('/employees/:emp_id', async (req, res) => {
    const empId = req.params.emp_id;
    const {
        emp_name,
        emp_phone,
        emp_job,
        emp_salary } = req.body;
    console.log(req.body);

    const employee = await Employee.findOneAndUpdate({ empId }, {
        empPhone: emp_phone, empSalary: emp_salary, empName: emp_name, empJob: emp_job
    }, { new: true })
    if (!employee) {
        return res.status(400).json({ message: "UserId not exists" })
    }
    return res.status(200).json({ message: "Updated successfully" })

    // let employees = loadData(dataFilePath);
    // const index = employees.findIndex(emp => emp.emp_id === empId);

    // if (index !== -1) {
    //     employees[index] = req.body;
    //     saveData(dataFilePath, employees);
    //     res.send('Employee updated successfully');
    // } else {
    //     res.status(404).send('Employee not found');
    // }
});

app.delete('/employees/:emp_id', async (req, res) => {
    const empId = req.params.emp_id;
    const employee = await Employee.findOneAndDelete({ empId })
    if (!employee) {
        return res.status(400).json({ message: "UserId not exists" })
    }
    return res.status(200).json({ message: "Deleted successfully" })

    // let employees = loadData(dataFilePath);
    // const newEmployees = employees.filter(emp => emp.emp_id !== empId);

    // if (newEmployees.length < employees.length) {
    //     saveData(dataFilePath, newEmployees);
    //     res.send('Employee deleted successfully');
    // } else {
    //     res.status(404).send('Employee not found');
    // }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
