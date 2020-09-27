var mysql = require("mysql");
var inquirer = require("inquirer");
var connection = mysql.createConnection({
  host: "localhost",

  port: 3306,

  user: "root",

  password: "root",
  database: "employee_tracker_db",
});

var roles = [];
var departments = [];
var managers = [];
var employees = [];

const menuOptions = {
  type: "list",
  name: "option",
  message: "----- What do you want to do? ------",
  choices: ["Select", "Insert", "Update", "Delete", "Exit"],
};

const tableOptions = {
  type: "list",
  name: "table",
  message: "----- Select a Table -----",
  choices: ["Employees", "Roles", "Departments"],
};

const insertEmployee = [
  {
    name: "name",
    message: "Name of the employee?",
  },
  {
    name: "lastname",
    message: "Lastename of the employee?",
  },
  {
    type: "list",
    name: "role",
    message: "Role of the employee?",
    choices: roles,
  },
  {
    type: "list",
    name: "manager",
    message: "Manager of the Employee?",
    choices: managers,
  },
];

const insertRole = [
  {
    name: "title",
    message: "Title of the Role?",
  },
  {
    name: "salary",
    message: "Salary of the Role?",
  },
  {
    type: "list",
    name: "department",
    message: "Department of the Role?",
    choices: departments,
  },
];

const insertDepartment = [
  {
    name: "name",
    message: "Name of the Department?",
  },
];

const deleteEmployee = [
  {
    type: "list",
    name: "name",
    message: "Employee to Delete?",
    choices: employees,
  },
];

const deleteRole = [
  {
    type: "list",
    name: "name",
    message: " Role to Delete?",
    choices: roles,
  },
];

const deleteDepartment = [
  {
    type: "list",
    name: "name",
    message: "Deparment to Delete?",
    choices: departments,
  },
];

(async function () {
  var flag = 0;

  while (flag == 0) {
    setData();

    const menuResponse = await inquirer.prompt(menuOptions);

    switch (menuResponse.option) {
      case "Select":
        var selectquery = await inquirer.prompt(tableOptions);
        SelectTable(selectquery.table);

        break;

      case "Insert":
        var insertTable = await inquirer.prompt(tableOptions);

        if (insertTable.table == "Employees") {
          var data = await inquirer.prompt(insertEmployee);
        } else if (insertTable.table == "Roles") {
          var data = await inquirer.prompt(insertRole);
        } else {
          var data = await inquirer.prompt(insertDepartment);
        }

        InsertTable(insertTable.table, data);
        break;

      case "Update":
        UpdateEmployee();
        break;

      case "Delete":
        var deleteTable = await inquirer.prompt(tableOptions);

        if (deleteTable.table == "Employees") {
          var data = await inquirer.prompt(deleteEmployee);
        } else if (deleteTable.table == "Roles") {
          var data = await inquirer.prompt(deleteRole);
        } else {
          var data = await inquirer.prompt(deleteDepartment);
        }
        DeleteTable(deleteTable.table, data.name);
        break;

      case "Exit":
        console.log("");
        console.log("***** You Exit *****");
        connection.end();
        flag = 1;

        break;

      default:
        break;
    }
  }
})();

function setData() {
  //employees array
  var employeesQuery = "SELECT * FROM employees";
  connection.query(employeesQuery, function (err, res) {
    if (err) throw err;
    res.forEach((element) => {
      employees[element.id] = element.first_name;
    });
  });

  //managers array
  var managersQuery = "SELECT * FROM employees where manager_id is null";
  connection.query(managersQuery, function (err, res) {
    if (err) throw err;
    res.forEach((element) => {
      managers[element.id] = element.first_name;
    });
  });

  //departments array
  var departmentsQuery = "SELECT * FROM departments";

  connection.query(departmentsQuery, function (err, res) {
    if (err) throw err;
    res.forEach((element) => {
      departments[element.id] = element.name;
    });
  });

  //roles array
  var rolesQuery = "SELECT * FROM roles";
  connection.query(rolesQuery, function (err, res) {
    if (err) throw err;
    res.forEach((element) => {
      roles[element.id] = element.title;
    });
  });
}

function SelectTable(selectquery) {
  var slqQuery = "";
  if (selectquery == "Employees") {
    slqQuery = `SELECT e.id,e.first_name,e.last_name,e.role_id,m.first_name as "manager" FROM employees e INNER JOIN employees m ON m.id = e.manager_id UNION SELECT * FROM employees where manager_id is null`;
  } else if (selectquery == "Departments") {
    slqQuery = "SELECT * FROM departments";
  } else if ("Roles") {
    slqQuery = `SELECT roles.id,roles.title,roles.salary,departments.name as "department"  FROM roles JOIN departments ON roles.department_id = departments.id`;
  }

  connection.query(slqQuery, function (err, res) {
    if (err) throw err;

    if (selectquery == "Employees") {
      console.log("");
      console.log("****************************************************");
      console.log(`Id      Name      LastName      Role      Manager`);
      console.log("****************************************************");

      res.forEach((element) => {
        console.log(
          `${element.id}\t${element.first_name}\t   ${element.last_name}\t   ${element.role_id}\t   ${element.manager}`
        );
      });

      console.log("****************************************************");
      console.log("");
    } else if (selectquery == "Departments") {
      console.log("");
      console.log("**************************************");
      console.log(`ID\t Name`);
      console.log("**************************************");

      res.forEach((element) => {
        console.log(`${element.id}\t ${element.name}`);
      });

      console.log("***************************************");
      console.log("");
    } else if (selectquery == "Roles") {
      console.log("");
      console.log("**************************************");
      console.log(`Id\t Title \tSalary \tDepartment`);
      console.log("**************************************");

      res.forEach((element) => {
        console.log(
          `${element.id} \t${element.title} \t${element.salary} \t${element.department}`
        );
      });

      console.log("***************************************");
      console.log("");
    }
  });
}

function InsertTable(table, data) {
  table = table.toLowerCase();

  switch (table) {
    case "employees":
      const queryEmployee = {
        first_name: data.name,
        last_name: data.lastname,
        role_id: roles.indexOf(data.role),
        manager_id: managers.indexOf(data.manager),
      };

      connection.query("INSERT INTO employees SET ?", queryEmployee, function (
        err,
        res
      ) {
        if (err) throw err;

        SelectTable("Employees");
        console.log("");
        console.log("vvvvv Employee Inserted vvvvv");
      });

      break;

    case "roles":
      const queryRole = {
        title: data.title,
        salary: data.salary,
        department_id: roles.indexOf(data.department),
      };

      connection.query("INSERT INTO roles SET ?", queryRole, function (
        err,
        res
      ) {
        if (err) throw err;
        SelectTable("Roles");
        console.log("");
        console.log("vvvvv Role Inserted vvvvv");
      });

      break;

    case "departments":
      const queryDeparment = {
        name: data.name,
      };

      connection.query(
        "INSERT INTO departments SET ?",
        queryDeparment,
        function (err, res) {
          if (err) throw err;
          SelectTable("Departments");
          console.log("");
          console.log("vvvvv Department Inserted vvvvv");
        }
      );

      break;

    default:
      break;
  }
}

function UpdateEmployee() {
  console.log("XXXXXXXX  Not Function Implemented XXXXXXXXXX");
}

function DeleteTable(table, name) {
  table = table.toLowerCase();
  switch (table) {
    case "employees":
      connection.query(
        "DELETE FROM employees WHERE first_name = ?",
        name,
        function (err, res) {
          if (err) throw err;

          SelectTable("Employees");
          console.log("");
          console.log("vvvvv Employee Deleted vvvvv");
        }
      );

      break;

    case "roles":
      connection.query("DELETE FROM roles WHERE title = ?", name, function (
        err,
        res
      ) {
        if (err) throw err;

        SelectTable("roles");
        console.log("");
        console.log("vvvvv Role Deleted vvvvv");
      });

      break;

    case "departments":
      connection.query(
        "DELETE FROM departments WHERE name = ?",
        name,
        function (err, res) {
          if (err) throw err;

          SelectTable("departments");
          console.log("");
          console.log("vvvvv Department Deleted vvvvv");
        }
      );
      break;

    default:
      break;
  }
}
