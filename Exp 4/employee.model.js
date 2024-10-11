const mongoose = require('mongoose')

const employeeSchema=new mongoose.Schema(
    {
        empId:{type:String,required:true,unique:true},
        empName:{type:String,required:true},
        empPhone:{type:String,required:true},
        empJob:{type:String,required:true},
        empSalary:{type:String,required:true}

    }
)
 const Employee=mongoose.model("Employee",employeeSchema)

module.exports = Employee;