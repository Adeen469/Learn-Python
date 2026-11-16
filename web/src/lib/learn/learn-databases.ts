import type { LearnTutorial } from "./types";

export const TUTORIALS: LearnTutorial[] = [
  {
    slug: "python-mysql-getstarted",
    title: "MySQL Get Started",
    intro: "MySQL is a popular database system, and Python can connect to it with the mysql-connector-python package. This tutorial shows you how to install the package and connect to a MySQL server.",
    blocks: [
      { type: "heading", text: "What You Need First" },
      { type: "para", text: "To follow this section you need two things installed on your own computer. First, a MySQL server, which is the database program that stores your data. You can download MySQL Community Server for free from the MySQL website and install it, choosing a root password during setup. Second, the Python package that lets Python talk to MySQL. Without a running MySQL server, none of the code in this section can connect, so install MySQL before you go further." },
      { type: "code", title: "Install the connector", code: `pip install mysql-connector-python`, output: `Successfully installed mysql-connector-python` },
      { type: "para", text: "The package is called mysql-connector-python, and it is the official MySQL driver for Python. Once it is installed, import it in your code as mysql.connector. The next step is to open a connection to your server. You pass the host, your username, and your password. On your own computer the host is usually localhost, which means this computer." },
      { type: "code", title: "Connect to MySQL", code: `import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="yourusername",
  password="yourpassword"
)

print(mydb)`, output: `<mysql.connector.connection_cext.CMySQLConnection object at 0x000001>` },
      { type: "para", text: "If the connection works, print(mydb) shows a connection object, and no error appears. If you see an access denied error, check your username and password. If you see a connection refused error, MySQL is probably not running, so start the MySQL server first. Keep the connection object in a variable such as mydb, because every later example uses it to run SQL statements." },
      { type: "list", items: ["MySQL is the database server that stores tables and rows.", "mysql-connector-python is the Python package that connects to it.", "Install it with pip install mysql-connector-python.", "Connect with mysql.connector.connect and your host, user, and password.", "A connection object means the login worked."] },
      { type: "note", text: "Never share your real MySQL password in code you publish. The examples here use yourusername and yourpassword as placeholders, so replace them with your own login details." },
      { type: "tip", text: "Test the connection on its own first. If this small program works, every example in this section will work too." },
    ],
    practice: [
      "Install mysql-connector-python with pip and check that import mysql.connector runs without an error.",
      "Write a program that connects to your MySQL server with your own username and password and prints the connection object.",
      "Change the password in your program to a wrong one on purpose, run it, and read the error message so you recognise it later.",
    ],
    summary: [
      "MySQL is a database server, and Python reaches it through the mysql-connector-python package.",
      "Install the package with pip install mysql-connector-python.",
      "Connect with mysql.connector.connect, passing host, user, and password.",
      "A printed connection object means the connection worked.",
      "You need a running MySQL server and the right login details before any later example can run.",
    ],
  },
  {
    slug: "python-mysql-create-db",
    title: "MySQL Create Database",
    intro: "A database is a container that holds your tables. Before you can create a table, you need a database to put it in, and you create it with the CREATE DATABASE statement.",
    blocks: [
      { type: "heading", text: "Creating a Database" },
      { type: "para", text: "In MySQL, a database is like a folder for tables. One database can hold many tables, and each table holds rows of data. In this section we will create a database called mydatabase and use it for every MySQL example that follows. You create a database by running a CREATE DATABASE statement through a cursor. A cursor is the object that sends SQL to the server and brings results back." },
      { type: "code", title: "Create a database in SQL", code: `CREATE DATABASE mydatabase;`, output: `Query OK, 1 row affected` },
      { type: "para", text: "The same statement works from Python. Create a cursor from your connection, call execute with the SQL, and the database is created on the server. You do not need a database in the connection itself to create one, so connect without naming a database first." },
      { type: "code", title: "Create a database from Python", code: `import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="yourusername",
  password="yourpassword"
)

mycursor = mydb.cursor()
mycursor.execute("CREATE DATABASE mydatabase")
print("Database created.")`, output: `Database created.` },
      { type: "para", text: "If you run the code twice, MySQL will complain that the database already exists. That is normal. You can avoid the error with CREATE DATABASE IF NOT EXISTS mydatabase, which creates the database only when it is missing. After creating it, check that it exists with SHOW DATABASES, which lists every database on the server." },
      { type: "code", title: "List all databases", code: `import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="yourusername",
  password="yourpassword"
)

mycursor = mydb.cursor()
mycursor.execute("SHOW DATABASES")

for db in mycursor:
  print(db)`, output: `('information_schema',)
('mydatabase',)
('mysql',)
('performance_schema',)
('sys',)` },
      { type: "list", items: ["A database holds tables, and a table holds rows.", "CREATE DATABASE makes a new database.", "Use a cursor and execute to run SQL from Python.", "SHOW DATABASES lists the databases on the server.", "IF NOT EXISTS stops the error when the database already exists."] },
      { type: "tip", text: "Create the database once, then connect with database set to mydatabase in later examples so your tables go into the right place." },
    ],
    practice: [
      "Create a database called mydatabase from Python and confirm it appears in SHOW DATABASES.",
      "Run the create code a second time, read the error, then fix it with IF NOT EXISTS.",
      "Create a second database called testdb, list all databases, and then drop testdb with DROP DATABASE testdb.",
    ],
    summary: [
      "A database is a container for tables.",
      "CREATE DATABASE mydatabase creates a database called mydatabase.",
      "Run SQL from Python with a cursor and its execute method.",
      "SHOW DATABASES lists every database on the server.",
      "Use IF NOT EXISTS to avoid an error when the database already exists.",
    ],
  },
  {
    slug: "python-mysql-create-table",
    title: "MySQL Create Table",
    intro: "A table stores your data in rows and columns. This tutorial creates the customers table that every later MySQL example in this section uses.",
    blocks: [
      { type: "heading", text: "The Customers Table" },
      { type: "para", text: "A table is made of columns, and each column has a name and a data type. Our customers table has three columns. The id column is an integer and the primary key, which means every row has a different id and MySQL can find a row by its id. The name column holds text up to 255 characters, and the address column holds text up to 255 characters. VARCHAR(255) means a text value of up to 255 characters, and INT means a whole number." },
      { type: "code", title: "Create the table in SQL", code: `CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  address VARCHAR(255)
);`, output: `Query OK, 0 rows affected` },
      { type: "para", text: "AUTO_INCREMENT means MySQL fills in the id for you, starting at 1 and going up by one for each new row. PRIMARY KEY means the id is unique for every row. From Python, connect to the mydatabase database this time, because the table must live inside a database. Then run the same CREATE TABLE statement with a cursor." },
      { type: "code", title: "Create the table from Python", code: `import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="yourusername",
  password="yourpassword",
  database="mydatabase"
)

mycursor = mydb.cursor()
mycursor.execute("CREATE TABLE customers (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), address VARCHAR(255))")
print("Table created.")`, output: `Table created.` },
      { type: "para", text: "To check that the table exists, use SHOW TABLES, which lists the tables in the current database. To see the columns, use DESCRIBE customers, which shows each column name, its type, and whether it can be empty. If you try to create the same table twice, MySQL reports that it already exists, so use IF NOT EXISTS when you want the code to be safe to run again." },
      { type: "code", title: "Check the table", code: `mycursor.execute("SHOW TABLES")

for table in mycursor:
  print(table)`, output: `('customers',)` },
      { type: "list", items: ["A table has columns, each with a name and a data type.", "INT stores whole numbers and VARCHAR(255) stores short text.", "PRIMARY KEY means every row has a unique id.", "AUTO_INCREMENT makes MySQL number new rows for you.", "SHOW TABLES lists tables, and DESCRIBE shows the columns."] },
      { type: "note", text: "This customers table is the shared example for the whole MySQL section. Every later tutorial uses the same three columns, so do not change them." },
    ],
    practice: [
      "Create the customers table in the mydatabase database and confirm it with SHOW TABLES.",
      "Run DESCRIBE customers and write down the type of each column.",
      "Create a second table called products with an id and a name column, then list the tables again.",
    ],
    summary: [
      "A table stores rows, and each column has a name and a data type.",
      "CREATE TABLE defines the columns for a new table.",
      "INT is for whole numbers and VARCHAR(255) is for short text.",
      "PRIMARY KEY keeps every row unique, and AUTO_INCREMENT numbers new rows.",
      "Connect to a database first, then create the table inside it.",
    ],
  },
  {
    slug: "python-mysql-insert",
    title: "MySQL Insert",
    intro: "INSERT adds new rows to a table. This tutorial fills the customers table with six customers that every later MySQL example uses.",
    blocks: [
      { type: "heading", text: "Inserting One Row" },
      { type: "para", text: "The INSERT INTO statement adds a row to a table. You name the table and the columns, then give the values in the same order. You do not give an id here, because the id column is AUTO_INCREMENT and MySQL fills it in for you. The first row is John, who lives at Highway 21. Always use placeholders, written as %s, for the values in Python, and pass the real values as a second argument. This keeps your data safe and handles quotes in text correctly." },
      { type: "code", title: "Insert one row", code: `import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="yourusername",
  password="yourpassword",
  database="mydatabase"
)

mycursor = mydb.cursor()
sql = "INSERT INTO customers (name, address) VALUES (%s, %s)"
val = ("John", "Highway 21")
mycursor.execute(sql, val)

mydb.commit()
print(mycursor.rowcount, "record inserted.")`, output: `1 record inserted.` },
      { type: "para", text: "The commit call is important. MySQL waits until you commit before it saves the change for good. If you forget commit, the row is lost when the program ends. The rowcount attribute tells you how many rows were affected, which is 1 for a single insert. The new row gets id 1 automatically." },
      { type: "heading", text: "Inserting Many Rows at Once" },
      { type: "para", text: "To insert many rows, use executemany with a list of value pairs. This is faster than running execute six times. The code below adds the other five customers, so the table ends up with six rows in total. The ids are given by MySQL in order, from 1 to 6." },
      { type: "code", title: "Insert many rows", code: `mycursor = mydb.cursor()
sql = "INSERT INTO customers (name, address) VALUES (%s, %s)"
val = [
  ("Peter", "Lowstreet 4"),
  ("Amy", "Apple st 652"),
  ("Hannah", "Mountain 21"),
  ("Michael", "Valley 345"),
  ("Sandy", "Ocean blvd 2")
]

mycursor.executemany(sql, val)
mydb.commit()
print(mycursor.rowcount, "records inserted.")`, output: `5 records inserted.` },
      { type: "para", text: "After both programs run, the customers table holds six rows. This is the fixed sample data for the whole MySQL section, so every result table in later tutorials comes from these rows. The last inserted id is available as mycursor.lastrowid, which is 6 after the second program." },
      { type: "code", title: "The six customers", code: `SELECT * FROM customers;`, output: `id | name    | address
1  | John    | Highway 21
2  | Peter   | Lowstreet 4
3  | Amy     | Apple st 652
4  | Hannah  | Mountain 21
5  | Michael | Valley 345
6  | Sandy   | Ocean blvd 2` },
      { type: "list", items: ["INSERT INTO adds rows to a table.", "Use %s placeholders and pass values separately.", "Call commit to save the change.", "executemany inserts a list of rows in one go.", "rowcount tells you how many rows were inserted."] },
    ],
    practice: [
      "Insert one more customer, Vicky from Yellow Garden 2, and check that the new id is 7.",
      "Insert three customers at once with executemany and print the rowcount.",
      "Try inserting a row without calling commit, then check whether it is still there in a new program.",
    ],
    summary: [
      "INSERT INTO adds new rows to a table.",
      "Use %s placeholders and pass the values separately.",
      "Call mydb.commit() to save the inserted rows.",
      "executemany inserts many rows from a list of values.",
      "The customers table now holds six rows, used by every later MySQL tutorial.",
    ],
  },
  {
    slug: "python-mysql-select",
    title: "MySQL Select",
    intro: "SELECT reads data from a table. This tutorial shows how to read all columns, pick single columns, and fetch the results in Python.",
    blocks: [
      { type: "heading", text: "Reading All Columns" },
      { type: "para", text: "The SELECT statement reads rows from a table. The star means all columns, so SELECT star FROM customers returns every column of every row. In Python, run the query with a cursor, then call fetchall to get all the rows at once. Each row comes back as a tuple, in the order id, name, address." },
      { type: "code", title: "Select all columns", code: `SELECT * FROM customers;`, output: `id | name    | address
1  | John    | Highway 21
2  | Peter   | Lowstreet 4
3  | Amy     | Apple st 652
4  | Hannah  | Mountain 21
5  | Michael | Valley 345
6  | Sandy   | Ocean blvd 2` },
      { type: "code", title: "Select all from Python", code: `import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="yourusername",
  password="yourpassword",
  database="mydatabase"
)

mycursor = mydb.cursor()
mycursor.execute("SELECT * FROM customers")
result = mycursor.fetchall()

for row in result:
  print(row)`, output: `(1, 'John', 'Highway 21')
(2, 'Peter', 'Lowstreet 4')
(3, 'Amy', 'Apple st 652')
(4, 'Hannah', 'Mountain 21')
(5, 'Michael', 'Valley 345')
(6, 'Sandy', 'Ocean blvd 2')` },
      { type: "heading", text: "Reading Single Columns" },
      { type: "para", text: "You do not always need every column. Name the columns you want, separated by commas, and MySQL returns only those. This is faster and the output is easier to read. The example below asks for name and address only, so the id column is left out." },
      { type: "code", title: "Select two columns", code: `SELECT name, address FROM customers;`, output: `name    | address
John    | Highway 21
Peter   | Lowstreet 4
Amy     | Apple st 652
Hannah  | Mountain 21
Michael | Valley 345
Sandy   | Ocean blvd 2` },
      { type: "para", text: "Use fetchone when you only need the first row, and fetchall when you need every row. If you loop over the cursor directly, you also get one row at a time, which is handy for very large tables. SELECT never changes the table, so it is always safe to run while you are learning." },
      { type: "list", items: ["SELECT reads rows from a table.", "The star means all columns.", "Name columns to read only the ones you need.", "fetchall returns every row, and fetchone returns the first row.", "Each row is a tuple in the order of the columns you asked for."] },
      { type: "tip", text: "Ask for only the columns you need. It keeps the result small and makes your program faster." },
    ],
    practice: [
      "Select all customers from Python and print each row.",
      "Select only the name column and print the six names.",
      "Use fetchone to print just the first customer, then run the same query with fetchall.",
    ],
    summary: [
      "SELECT reads data from a table without changing it.",
      "SELECT star returns every column, and naming columns returns only those.",
      "Run the query with a cursor, then use fetchall or fetchone.",
      "Each row comes back as a tuple in column order.",
      "Asking for fewer columns keeps results small and fast.",
    ],
  },
  {
    slug: "python-mysql-where",
    title: "MySQL Where",
    intro: "WHERE filters rows so you only get the ones that match a condition. This tutorial shows exact matches, patterns, and safe values from Python.",
    blocks: [
      { type: "heading", text: "Filtering with WHERE" },
      { type: "para", text: "SELECT on its own returns every row. WHERE adds a condition, and MySQL returns only the rows where the condition is true. The example below asks for the customer whose address is Mountain 21, and only Hannah matches, so only one row comes back. Text values go in single quotes in SQL." },
      { type: "code", title: "One matching row", code: `SELECT * FROM customers WHERE address = 'Mountain 21';`, output: `id | name   | address
4  | Hannah | Mountain 21` },
      { type: "code", title: "WHERE from Python", code: `import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="yourusername",
  password="yourpassword",
  database="mydatabase"
)

mycursor = mydb.cursor()
sql = "SELECT * FROM customers WHERE address = %s"
val = ("Mountain 21",)
mycursor.execute(sql, val)
result = mycursor.fetchall()

for row in result:
  print(row)`, output: `(4, 'Hannah', 'Mountain 21')` },
      { type: "heading", text: "Matching a Pattern with LIKE" },
      { type: "para", text: "The LIKE operator matches a pattern instead of an exact value. The percent sign means any characters, so S percent matches every name that starts with S, and percent a percent matches every name that contains the letter a. From the six customers, only Sandy starts with S, while Amy, Hannah, Michael, and Sandy all contain the letter a." },
      { type: "code", title: "Names starting with S", code: `SELECT * FROM customers WHERE name LIKE 'S%';`, output: `id | name  | address
6  | Sandy | Ocean blvd 2` },
      { type: "code", title: "Names containing the letter a", code: `SELECT * FROM customers WHERE name LIKE '%a%';`, output: `id | name    | address
3  | Amy     | Apple st 652
4  | Hannah  | Mountain 21
5  | Michael | Valley 345
6  | Sandy   | Ocean blvd 2` },
      { type: "para", text: "Always pass the value through a %s placeholder in Python instead of joining it into the SQL string yourself. That keeps the query safe and avoids errors when a value contains a quote. You can also combine conditions with AND and OR, for example WHERE name LIKE S percent AND address LIKE Ocean percent." },
      { type: "list", items: ["WHERE keeps only the rows where the condition is true.", "Use = for an exact match and LIKE for a pattern.", "The percent sign in LIKE means any characters.", "Pass values with %s placeholders in Python.", "AND and OR combine two or more conditions."] },
    ],
    practice: [
      "Select the customer whose name is Amy and print the row.",
      "Select every customer whose address contains the word street, using LIKE with percent signs.",
      "Select customers whose name starts with P or whose address is Valley 345, using OR.",
    ],
    summary: [
      "WHERE filters rows to only the ones that match a condition.",
      "Use = for exact matches and LIKE for patterns.",
      "In LIKE, the percent sign stands for any characters.",
      "Pass values with %s placeholders instead of building the SQL by hand.",
      "Combine conditions with AND and OR.",
    ],
  },

  {
    slug: "python-mysql-orderby",
    title: "MySQL Order By",
    intro: "ORDER BY sorts the rows that a query returns. This tutorial sorts the customers by name, in both directions.",
    blocks: [
      { type: "heading", text: "Sorting in Ascending Order" },
      { type: "para", text: "Rows in a table have no guaranteed order unless you ask for one. ORDER BY sorts the result by the column you name. By default the order is ascending, from A to Z for text and from small to large for numbers. The example below sorts the six customers by name, so Amy comes first and Sandy comes last." },
      { type: "code", title: "Sort by name, A to Z", code: `SELECT * FROM customers ORDER BY name;`, output: `id | name    | address
3  | Amy     | Apple st 652
4  | Hannah  | Mountain 21
1  | John    | Highway 21
5  | Michael | Valley 345
2  | Peter   | Lowstreet 4
6  | Sandy   | Ocean blvd 2` },
      { type: "code", title: "Sort from Python", code: `import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="yourusername",
  password="yourpassword",
  database="mydatabase"
)

mycursor = mydb.cursor()
mycursor.execute("SELECT * FROM customers ORDER BY name")
result = mycursor.fetchall()

for row in result:
  print(row)`, output: `(3, 'Amy', 'Apple st 652')
(4, 'Hannah', 'Mountain 21')
(1, 'John', 'Highway 21')
(5, 'Michael', 'Valley 345')
(2, 'Peter', 'Lowstreet 4')
(6, 'Sandy', 'Ocean blvd 2')` },
      { type: "heading", text: "Sorting in Descending Order" },
      { type: "para", text: "Add DESC after the column name to sort in the opposite direction, from Z to A for text and from large to small for numbers. ASC means ascending and is the default, so you only need to write it when you want to be clear. You can also sort by more than one column, for example ORDER BY address, name, which sorts by address first and uses name to break ties." },
      { type: "code", title: "Sort by name, Z to A", code: `SELECT * FROM customers ORDER BY name DESC;`, output: `id | name    | address
6  | Sandy   | Ocean blvd 2
2  | Peter   | Lowstreet 4
5  | Michael | Valley 345
1  | John    | Highway 21
4  | Hannah  | Mountain 21
3  | Amy     | Apple st 652` },
      { type: "para", text: "ORDER BY comes after WHERE in a query, so you can filter and sort in the same statement. For example, SELECT star FROM customers WHERE address LIKE percent Street percent ORDER BY name returns the matching rows already sorted. Sorting does not change the table, it only changes the order of the rows you get back." },
      { type: "list", items: ["ORDER BY sorts the rows a query returns.", "The default order is ascending, A to Z or small to large.", "DESC reverses the order to descending.", "You can sort by more than one column.", "ORDER BY comes after WHERE in a query."] },
      { type: "tip", text: "Sort by the column the reader will scan, usually a name or a date, so the result is easy to read." },
    ],
    practice: [
      "Select all customers sorted by address from A to Z and print the rows.",
      "Select all customers sorted by name from Z to A and check that Sandy is first.",
      "Select customers whose name contains the letter a, sorted by name.",
    ],
    summary: [
      "ORDER BY sorts the rows returned by a query.",
      "The default order is ascending, and DESC makes it descending.",
      "Sorting works on text, numbers, and dates.",
      "You can sort by more than one column at a time.",
      "ORDER BY comes after WHERE and never changes the stored table.",
    ],
  },
  {
    slug: "python-mysql-delete",
    title: "MySQL Delete",
    intro: "DELETE removes rows from a table. This tutorial deletes the extra customer Vicky, so the table returns to the six original customers.",
    blocks: [
      { type: "heading", text: "Deleting One Row" },
      { type: "para", text: "The DELETE statement removes rows that match a WHERE condition. In the Insert tutorial you added a seventh customer, Vicky from Yellow Garden 2, as practice. This tutorial removes her, so the table is back to the six original customers. The condition WHERE name equals Vicky matches only her row, so only one row is deleted." },
      { type: "code", title: "Delete Vicky in SQL", code: `DELETE FROM customers WHERE name = 'Vicky';`, output: `Query OK, 1 row affected` },
      { type: "code", title: "Delete from Python", code: `import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="yourusername",
  password="yourpassword",
  database="mydatabase"
)

mycursor = mydb.cursor()
sql = "DELETE FROM customers WHERE name = %s"
val = ("Vicky",)
mycursor.execute(sql, val)

mydb.commit()
print(mycursor.rowcount, "record(s) deleted")`, output: `1 record(s) deleted` },
      { type: "heading", text: "Checking the Result" },
      { type: "para", text: "Like INSERT and UPDATE, DELETE needs a commit before the change is saved for good. The rowcount tells you how many rows were removed, which is 1 here. After the delete, a SELECT shows the six original customers again, with ids 1 to 6. Vicky, who had id 7, is gone, and MySQL will not reuse her id for the next insert." },
      { type: "code", title: "The table after the delete", code: `SELECT * FROM customers;`, output: `id | name    | address
1  | John    | Highway 21
2  | Peter   | Lowstreet 4
3  | Amy     | Apple st 652
4  | Hannah  | Mountain 21
5  | Michael | Valley 345
6  | Sandy   | Ocean blvd 2` },
      { type: "para", text: "You can also delete with a wider condition, for example DELETE FROM customers WHERE address LIKE percent Street percent, which would remove every matching row. That is why the WHERE clause matters so much. Always check your condition with a SELECT first, using the same WHERE, so you can see exactly which rows will be deleted." },
      { type: "list", items: ["DELETE removes rows that match a WHERE condition.", "Pass the value with a %s placeholder in Python.", "Call commit to save the deletion.", "rowcount tells you how many rows were removed.", "Test the WHERE with SELECT first so you delete the right rows."] },
      { type: "note", text: "A DELETE without a WHERE removes every row in the table. The table itself stays, but it will be empty, so never run it by accident." },
    ],
    practice: [
      "Insert Vicky again, then delete her with a WHERE on her name and confirm the rowcount is 1.",
      "Use a SELECT with the same WHERE before you delete, to see which rows would be removed.",
      "Try deleting a customer who does not exist and check that the rowcount is 0.",
    ],
    summary: [
      "DELETE removes the rows that match a WHERE condition.",
      "Use a %s placeholder for the value in Python.",
      "Call mydb.commit() to save the deletion.",
      "rowcount tells you how many rows were removed.",
      "Always test the WHERE with SELECT first, and never run DELETE without a WHERE unless you mean to empty the table.",
    ],
  },
  {
    slug: "python-mysql-drop-table",
    title: "MySQL Drop Table",
    intro: "DROP TABLE deletes a whole table, including all of its rows. This tutorial drops the customers table and shows how to check that it is gone.",
    blocks: [
      { type: "heading", text: "Dropping a Table" },
      { type: "para", text: "DELETE removes rows, but DROP TABLE removes the table itself. The columns, the rows, and the table definition are all gone at once. There is no undo, so only drop a table when you are sure you do not need it. The statement is short: DROP TABLE followed by the table name. The example below drops the customers table from the mydatabase database." },
      { type: "code", title: "Drop the table in SQL", code: `DROP TABLE customers;`, output: `Query OK, 0 rows affected` },
      { type: "code", title: "Drop the table from Python", code: `import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="yourusername",
  password="yourpassword",
  database="mydatabase"
)

mycursor = mydb.cursor()
mycursor.execute("DROP TABLE customers")
print("Table dropped.")`, output: `Table dropped.` },
      { type: "heading", text: "Checking That It Is Gone" },
      { type: "para", text: "After the drop, SHOW TABLES returns an empty set, because mydatabase has no tables left. A SELECT from customers now fails with an error saying the table does not exist. That error is the proof that the drop worked. If you drop a table that does not exist, MySQL reports an error, so use DROP TABLE IF EXISTS customers when you want the code to run safely even if the table is already gone." },
      { type: "code", title: "List tables after the drop", code: `mycursor.execute("SHOW TABLES")

for table in mycursor:
  print(table)`, output: `Empty set` },
      { type: "para", text: "Dropping a table does not delete the database, and it does not delete other tables. Only the named table goes. Because the later tutorials still need the customers table, recreate it with the CREATE TABLE statement from the Create Table tutorial and insert the six customers again before you move on to Update." },
      { type: "list", items: ["DROP TABLE deletes a table and all of its rows.", "There is no undo, so be sure before you drop.", "SHOW TABLES shows an empty set after the drop.", "IF EXISTS avoids an error when the table is already gone.", "Dropping a table does not delete the database or other tables."] },
      { type: "note", text: "The customers table is dropped here on purpose, as the lesson. Recreate it with the six customers before the Update tutorial, or the later examples will have no table to work on." },
    ],
    practice: [
      "Create a table called old_customers, then drop it and confirm SHOW TABLES no longer lists it.",
      "Drop a table that does not exist, read the error, then repeat with IF EXISTS.",
      "Recreate the customers table and insert the six original customers, so later tutorials work.",
    ],
    summary: [
      "DROP TABLE deletes a whole table, rows and all.",
      "There is no undo, so only drop a table you do not need.",
      "SHOW TABLES returns an empty set once the table is gone.",
      "Use IF EXISTS to avoid an error when the table is already missing.",
      "Recreate the customers table with its six rows before the next tutorial.",
    ],
  },
  {
    slug: "python-mysql-update",
    title: "MySQL Update",
    intro: "UPDATE changes the values in rows that already exist. This tutorial changes John's address to Canyon 123, and later tutorials use that new address.",
    blocks: [
      { type: "heading", text: "Updating One Row" },
      { type: "para", text: "The UPDATE statement changes values in rows that match a WHERE condition. First, recreate the customers table with the six original customers, because the previous tutorial dropped it. Then run the update below. It sets the address to Canyon 123 for the row where the name is John. Only one row matches, so only John's address changes and the other five customers stay the same." },
      { type: "code", title: "Update John's address in SQL", code: `UPDATE customers SET address = 'Canyon 123' WHERE name = 'John';`, output: `Query OK, 1 row affected` },
      { type: "code", title: "Update from Python", code: `import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="yourusername",
  password="yourpassword",
  database="mydatabase"
)

mycursor = mydb.cursor()
sql = "UPDATE customers SET address = %s WHERE name = %s"
val = ("Canyon 123", "John")
mycursor.execute(sql, val)

mydb.commit()
print(mycursor.rowcount, "record(s) affected")`, output: `1 record(s) affected` },
      { type: "heading", text: "Checking the Result" },
      { type: "para", text: "As with INSERT and DELETE, you must call commit before the change is saved. The rowcount is 1, because one row was changed. A SELECT now shows John at Canyon 123, while Peter, Amy, Hannah, Michael, and Sandy keep their original addresses. From this tutorial onward, John's address is Canyon 123 in every MySQL result, so remember the change when you read later examples." },
      { type: "code", title: "The table after the update", code: `SELECT * FROM customers;`, output: `id | name    | address
1  | John    | Canyon 123
2  | Peter   | Lowstreet 4
3  | Amy     | Apple st 652
4  | Hannah  | Mountain 21
5  | Michael | Valley 345
6  | Sandy   | Ocean blvd 2` },
      { type: "para", text: "You can set more than one column at a time, for example SET name equals James, address equals Canyon 123. You can also update several rows with one statement by using a wider WHERE, such as WHERE address LIKE percent Street percent. The same warning as DELETE applies: an UPDATE without a WHERE changes every row in the table, so test the WHERE with SELECT first." },
      { type: "list", items: ["UPDATE changes values in rows that match a WHERE condition.", "SET names the columns and their new values.", "Pass the new values with %s placeholders in Python.", "Call commit to save the change.", "An UPDATE without a WHERE changes every row, so test the WHERE first."] },
      { type: "tip", text: "When only one row should change, use a condition that matches one row, such as the name or the id, and check the rowcount afterwards." },
    ],
    practice: [
      "Update Amy's address to Cherry Lane 9 and check the row with a SELECT.",
      "Update two columns at once by changing Sandy's name and address in one statement.",
      "Update a customer who does not exist and check that the rowcount is 0.",
    ],
    summary: [
      "UPDATE changes values in rows that match a WHERE condition.",
      "SET gives the new values for the columns you name.",
      "Use %s placeholders and call commit to save the change.",
      "John's address is now Canyon 123 in every later MySQL example.",
      "Never run UPDATE without a WHERE unless you mean to change every row.",
    ],
  },
  {
    slug: "python-mysql-limit",
    title: "MySQL Limit",
    intro: "LIMIT returns only a set number of rows. This tutorial takes the first three customers, and then skips rows with OFFSET.",
    blocks: [
      { type: "heading", text: "Taking the First Rows" },
      { type: "para", text: "A table can hold thousands of rows, but you often want only a few. LIMIT sets the maximum number of rows a query returns. The example below asks for three rows, so MySQL returns the first three customers in id order: John, Peter, and Amy. Remember that John's address is now Canyon 123, after the change in the Update tutorial." },
      { type: "code", title: "First three customers", code: `SELECT * FROM customers LIMIT 3;`, output: `id | name  | address
1  | John  | Canyon 123
2  | Peter | Lowstreet 4
3  | Amy   | Apple st 652` },
      { type: "code", title: "LIMIT from Python", code: `import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="yourusername",
  password="yourpassword",
  database="mydatabase"
)

mycursor = mydb.cursor()
mycursor.execute("SELECT * FROM customers LIMIT 3")
result = mycursor.fetchall()

for row in result:
  print(row)`, output: `(1, 'John', 'Canyon 123')
(2, 'Peter', 'Lowstreet 4')
(3, 'Amy', 'Apple st 652')` },
      { type: "heading", text: "Skipping Rows with OFFSET" },
      { type: "para", text: "OFFSET skips a number of rows before LIMIT starts counting. LIMIT 2 OFFSET 1 skips the first row and returns the next two, which are Peter and Amy. This is how paging works: page one uses LIMIT 3 OFFSET 0, page two uses LIMIT 3 OFFSET 3, and so on. Combine LIMIT with ORDER BY when the order matters, because without ORDER BY the database may return rows in any order." },
      { type: "code", title: "Skip one row, take two", code: `SELECT * FROM customers LIMIT 2 OFFSET 1;`, output: `id | name  | address
2  | Peter | Lowstreet 4
3  | Amy   | Apple st 652` },
      { type: "para", text: "In Python, fetchmany gives you the same control from the program side. After running a SELECT, mycursor.fetchmany(3) returns the first three rows, and a second call returns the next three. LIMIT is usually better, because the database sends fewer rows over the connection in the first place." },
      { type: "list", items: ["LIMIT sets the maximum number of rows returned.", "OFFSET skips rows before LIMIT starts counting.", "LIMIT and OFFSET together make paging possible.", "Combine LIMIT with ORDER BY when the order matters.", "fetchmany in Python returns a set number of rows from the result."] },
      { type: "tip", text: "Use LIMIT while you are testing a query on a big table, so a mistake returns a few rows instead of a million." },
    ],
    practice: [
      "Select the first two customers with LIMIT 2 and print them.",
      "Select two customers starting from the third row with LIMIT 2 OFFSET 2.",
      "Select the last three customers by sorting by id in descending order with LIMIT 3.",
    ],
    summary: [
      "LIMIT returns only a set number of rows from a query.",
      "OFFSET skips rows before LIMIT starts counting.",
      "LIMIT and OFFSET together let you page through results.",
      "Combine LIMIT with ORDER BY when the order of rows matters.",
      "LIMIT 3 returns John, Peter, and Amy from the customers table.",
    ],
  },
  {
    slug: "python-mysql-join",
    title: "MySQL Join",
    intro: "JOIN combines rows from two tables that are related. This tutorial joins customers with an orders table to show who bought what.",
    blocks: [
      { type: "heading", text: "Two Related Tables" },
      { type: "para", text: "Real databases split data across tables. The customers table holds people, and a second table called orders holds what they bought. Each order has a customerid that matches the id of the customer who placed it. This link is what makes a join possible. The orders table for this tutorial has five rows: John bought a Laptop and a Keyboard, Peter bought a Mouse, Hannah bought a Monitor, and Sandy bought Headphones. Amy and Michael have no orders. John's address is Canyon 123, after the Update tutorial." },
      { type: "code", title: "Create and fill the orders table", code: `CREATE TABLE orders (
  orderid INT AUTO_INCREMENT PRIMARY KEY,
  customerid INT,
  product VARCHAR(255)
);

INSERT INTO orders (customerid, product) VALUES
  (1, 'Laptop'),
  (1, 'Keyboard'),
  (2, 'Mouse'),
  (4, 'Monitor'),
  (6, 'Headphones');`, output: `Query OK, 5 rows affected` },
      { type: "heading", text: "The Inner Join" },
      { type: "para", text: "An INNER JOIN returns only the rows that match in both tables. The ON part says how the tables connect: the customer id equals the order customerid. Because John has two orders, he appears twice, once for each product. Amy and Michael have no orders, so they do not appear at all. The result has five rows, one for each order." },
      { type: "code", title: "Join customers and orders", code: `SELECT customers.name, orders.product
FROM customers
INNER JOIN orders
ON customers.id = orders.customerid;`, output: `name   | product
John   | Laptop
John   | Keyboard
Peter  | Mouse
Hannah | Monitor
Sandy  | Headphones` },
      { type: "code", title: "The join from Python", code: `import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="yourusername",
  password="yourpassword",
  database="mydatabase"
)

mycursor = mydb.cursor()
sql = "SELECT customers.name, orders.product FROM customers INNER JOIN orders ON customers.id = orders.customerid"
mycursor.execute(sql)
result = mycursor.fetchall()

for row in result:
  print(row)`, output: `('John', 'Laptop')
('John', 'Keyboard')
('Peter', 'Mouse')
('Hannah', 'Monitor')
('Sandy', 'Headphones')` },
      { type: "para", text: "Other joins keep more rows. A LEFT JOIN returns every customer, and shows an empty value for the product when a customer has no order, so Amy and Michael would appear with no product. A RIGHT JOIN does the same from the orders side. For most day-to-day questions, the inner join is the one you need: it answers which customers have orders, and what each order was." },
      { type: "list", items: ["JOIN combines rows from two tables through a shared value.", "The ON part says how the tables connect.", "INNER JOIN returns only rows that match in both tables.", "A customer with two orders appears twice, once per order.", "LEFT JOIN keeps every row from the left table, even with no match."] },
      { type: "note", text: "The orders table is only for this tutorial. The customers table stays the same six customers, with John at Canyon 123." },
    ],
    practice: [
      "Join customers and orders to list each customer name with the product they bought.",
      "Add an order for Amy, then run the join again and check that she appears.",
      "Run the same query as a LEFT JOIN and compare the result with the inner join.",
    ],
    summary: [
      "JOIN combines rows from two tables that share a value.",
      "ON says how the tables connect, here customer id to order customerid.",
      "INNER JOIN returns only rows that match in both tables.",
      "John appears twice because he has two orders, and Amy and Michael do not appear.",
      "LEFT JOIN keeps every customer, even those with no order.",
    ],
  },
  {
    slug: "python-mongodb-getstarted",
    title: "MongoDB Get Started",
    intro: "MongoDB is a document database, and Python connects to it with the pymongo package. This tutorial shows you how to install pymongo and connect to a MongoDB server.",
    blocks: [
      { type: "heading", text: "What You Need First" },
      { type: "para", text: "To follow this section you need two things installed on your own computer. First, a MongoDB server, which is the database program that stores your data. You can download MongoDB Community Server for free from the MongoDB website and install it, then start it on your computer. Second, the Python package that lets Python talk to MongoDB. Without a running MongoDB server, none of the code in this section can connect, so install and start MongoDB before you go further." },
      { type: "code", title: "Install the driver", code: `pip install pymongo`, output: `Successfully installed pymongo` },
      { type: "para", text: "The package is called pymongo, and it is the official MongoDB driver for Python. Once it is installed, import MongoClient from pymongo. MongoDB stores data as documents, which look like Python dictionaries, inside collections, which are like tables. A database holds collections, just as in MySQL a database holds tables." },
      { type: "code", title: "Connect to MongoDB", code: `from pymongo import MongoClient

myclient = MongoClient("mongodb://localhost:27017/")
print(myclient)`, output: `MongoClient(host=['localhost:27017'], document_class=dict, tz_aware=False, connect=True)` },
      { type: "para", text: "The address mongodb://localhost:27017/ means a MongoDB server running on your own computer on port 27017, which is the default MongoDB port. If the connection works, printing the client shows a MongoClient object and no error appears. If you see a connection refused error, MongoDB is probably not running, so start the server first." },
      { type: "list", items: ["MongoDB is a document database that stores data as documents.", "pymongo is the Python package that connects to it.", "Install it with pip install pymongo.", "Connect with MongoClient and the server address.", "A printed MongoClient object means the connection worked."] },
      { type: "note", text: "MongoDB and MySQL are different systems. The MySQL tutorials use tables and SQL, while these MongoDB tutorials use collections and documents. The same customers are used in both, so you can compare them." },
      { type: "tip", text: "Test the connection on its own first. If this small program works, every example in this section will work too." },
    ],
    practice: [
      "Install pymongo with pip and check that from pymongo import MongoClient runs without an error.",
      "Write a program that connects to your MongoDB server and prints the client object.",
      "Stop the MongoDB server, run your program, and read the error so you recognise it later.",
    ],
    summary: [
      "MongoDB is a document database, and Python reaches it through pymongo.",
      "Install the package with pip install pymongo.",
      "Connect with MongoClient and the address mongodb://localhost:27017/.",
      "A printed MongoClient object means the connection worked.",
      "You need a running MongoDB server before any later example can run.",
    ],
  },
  {
    slug: "python-mongodb-create-db",
    title: "MongoDB Create DB",
    intro: "In MongoDB a database is created the first time you store data in it. This tutorial shows how to name a database and make it appear by inserting a first document.",
    blocks: [
      { type: "heading", text: "Naming a Database" },
      { type: "para", text: "MongoDB works differently from MySQL here. There is no CREATE DATABASE command. You simply name a database in your code, and MongoDB creates it the moment you store your first document in it. Until then, the database does not appear in the list of databases. The database for this section is called mydatabase, the same name used for MySQL, so the two sections are easy to compare." },
      { type: "code", title: "Name the database", code: `from pymongo import MongoClient

myclient = MongoClient("mongodb://localhost:27017/")
mydb = myclient["mydatabase"]

print(mydb)`, output: `Database(MongoClient(host=['localhost:27017'], document_class=dict, tz_aware=False, connect=True), 'mydatabase')` },
      { type: "para", text: "Naming the database does not create it yet. It only gives you a handle to use. To make the database real, insert a document into a collection inside it, which the next tutorials do. After that first insert, the database appears in the list. You can check the list at any time with list_database_names." },
      { type: "code", title: "List databases after the first insert", code: `print(myclient.list_database_names())`, output: `['admin', 'config', 'local', 'mydatabase']` },
      { type: "para", text: "The list shows three databases that MongoDB creates for itself, called admin, config, and local, plus our mydatabase. If mydatabase is missing from the list, no document has been stored in it yet, so go back and check that your insert ran. A database with no collections is not kept, which is why MongoDB waits for the first document." },
      { type: "list", items: ["There is no CREATE DATABASE command in MongoDB.", "Name a database with myclient and square brackets.", "The database is created when the first document is stored in it.", "list_database_names shows every database on the server.", "admin, config, and local are built-in MongoDB databases."] },
      { type: "tip", text: "Do not be surprised when a new database is missing from the list. Insert one document first, then check again." },
    ],
    practice: [
      "Name a database called mydatabase and list the databases before inserting anything.",
      "Insert one document into a collection in mydatabase, then list the databases again.",
      "Name a second database called testdb, insert a document into it, and confirm it appears in the list.",
    ],
    summary: [
      "MongoDB has no CREATE DATABASE command.",
      "Name a database with myclient and square brackets.",
      "The database is created when the first document is stored in it.",
      "list_database_names lists every database on the server.",
      "The database for this section is called mydatabase.",
    ],
  },
  {
    slug: "python-mongodb-create-collection",
    title: "MongoDB Collection",
    intro: "A collection is MongoDB's version of a table. This tutorial creates the customers collection that every later MongoDB example uses.",
    blocks: [
      { type: "heading", text: "What a Collection Is" },
      { type: "para", text: "A collection holds documents, and a document is a set of fields, like a Python dictionary. Our customers collection holds one document per customer, and each document has three fields: an _id, a name, and an address. The _id field is the unique key for the document, like the primary key id in the MySQL customers table. The same six customers are used here as in the MySQL section, so the results match." },
      { type: "code", title: "Name the collection", code: `from pymongo import MongoClient

myclient = MongoClient("mongodb://localhost:27017/")
mydb = myclient["mydatabase"]
mycol = mydb["customers"]

print(mycol)`, output: `Collection(Database(MongoClient(host=['localhost:27017'], document_class=dict, tz_aware=False, connect=True), 'mydatabase'), 'customers')` },
      { type: "para", text: "As with a database, naming a collection does not create it. MongoDB creates the collection when you insert the first document into it. If you want to create it right away, use create_collection instead, which makes an empty collection at once. Either way, the collection name is customers, and it lives inside mydatabase." },
      { type: "code", title: "Create an empty collection", code: `mydb.create_collection("customers")
print(mydb.list_collection_names())`, output: `['customers']` },
      { type: "para", text: "The list_collection_names method lists every collection in the current database, and after the create call it shows customers. Documents in a collection do not need identical fields, but keeping the same three fields in every customer document makes the data easy to work with. The _id values in this section are the numbers 1 to 6, matching the MySQL ids." },
      { type: "list", items: ["A collection holds documents, like a table holds rows.", "A document is a set of fields, like a Python dictionary.", "The _id field is the unique key for a document.", "Name a collection with mydb and square brackets.", "create_collection makes an empty collection at once."] },
      { type: "note", text: "This customers collection is the shared example for the whole MongoDB section. Every later tutorial uses the same three fields, so do not change them." },
    ],
    practice: [
      "Name a collection called customers in mydatabase and list the collections.",
      "Create an empty collection called products with create_collection and list the collections again.",
      "Check that the customers collection is empty by counting its documents with count_documents and an empty filter.",
    ],
    summary: [
      "A collection is MongoDB's version of a table.",
      "A document is a set of fields, like a Python dictionary.",
      "The _id field is the unique key for each document.",
      "A collection is created when the first document is inserted, or at once with create_collection.",
      "The customers collection holds one document per customer.",
    ],
  },
  {
    slug: "python-mongodb-insert",
    title: "MongoDB Insert",
    intro: "Insert adds documents to a collection. This tutorial inserts one customer, then all six at once, using the same data as the MySQL section.",
    blocks: [
      { type: "heading", text: "Inserting One Document" },
      { type: "para", text: "The insert_one method adds a single document to a collection. A document is written as a Python dictionary. The example below inserts John, with _id 1, name John, and address Highway 21. The method returns a result object, and its inserted_id attribute is the _id of the new document. Giving the _id yourself keeps the numbers matching the MySQL table, where John also has id 1." },
      { type: "code", title: "Insert one document", code: `from pymongo import MongoClient

myclient = MongoClient("mongodb://localhost:27017/")
mydb = myclient["mydatabase"]
mycol = mydb["customers"]

mydoc = {"_id": 1, "name": "John", "address": "Highway 21"}
x = mycol.insert_one(mydoc)
print(x.inserted_id)`, output: `1` },
      { type: "heading", text: "Inserting Many Documents at Once" },
      { type: "para", text: "The insert_many method adds a list of documents in one call. The code below adds the other five customers, so the collection ends up with six documents in total. The inserted_ids attribute is a list of the _id values that were added, in the same order as the list you passed in." },
      { type: "code", title: "Insert many documents", code: `mylist = [
  {"_id": 2, "name": "Peter", "address": "Lowstreet 4"},
  {"_id": 3, "name": "Amy", "address": "Apple st 652"},
  {"_id": 4, "name": "Hannah", "address": "Mountain 21"},
  {"_id": 5, "name": "Michael", "address": "Valley 345"},
  {"_id": 6, "name": "Sandy", "address": "Ocean blvd 2"}
]

x = mycol.insert_many(mylist)
print(x.inserted_ids)`, output: `[2, 3, 4, 5, 6]` },
      { type: "para", text: "The printed list is [2, 3, 4, 5, 6], because John with _id 1 was already inserted by the first call. Together, the two calls put six documents in the collection. The six documents are the fixed sample data for the whole MongoDB section, so every result in later tutorials comes from them." },
      { type: "code", title: "The six customers", code: `for doc in mycol.find():
  print(doc)`, output: `{'_id': 1, 'name': 'John', 'address': 'Highway 21'}
{'_id': 2, 'name': 'Peter', 'address': 'Lowstreet 4'}
{'_id': 3, 'name': 'Amy', 'address': 'Apple st 652'}
{'_id': 4, 'name': 'Hannah', 'address': 'Mountain 21'}
{'_id': 5, 'name': 'Michael', 'address': 'Valley 345'}
{'_id': 6, 'name': 'Sandy', 'address': 'Ocean blvd 2'}` },
      { type: "list", items: ["insert_one adds a single document.", "insert_many adds a list of documents in one call.", "A document is a Python dictionary of fields.", "inserted_id gives the _id of one insert, and inserted_ids gives the list for many.", "If you leave out _id, MongoDB creates one for you."] },
      { type: "tip", text: "Give the _id yourself when you want the numbers to match another system, as this section does with the MySQL ids." },
    ],
    practice: [
      "Insert one more customer, Vicky from Yellow Garden 2, with _id 7, and print the inserted id.",
      "Insert three customers at once with insert_many and print the inserted ids.",
      "Count the documents in the collection with count_documents and an empty filter.",
    ],
    summary: [
      "insert_one adds one document to a collection.",
      "insert_many adds a list of documents in one call.",
      "A document is a Python dictionary, and _id is its unique key.",
      "inserted_id and inserted_ids tell you which ids were added.",
      "The customers collection now holds six documents, used by every later MongoDB tutorial.",
    ],
  },
  {
    slug: "python-mongodb-find",
    title: "MongoDB Find",
    intro: "Find reads documents from a collection. This tutorial shows how to read one document, read them all, and read only chosen fields.",
    blocks: [
      { type: "heading", text: "Finding the First Document" },
      { type: "para", text: "The find_one method returns the first document in the collection. With no filter, that is the first document that was inserted, which is John with _id 1. The result is a Python dictionary, so you can read its fields with square brackets, for example doc and name. find_one returns None when the collection is empty, so check for that before you use the result." },
      { type: "code", title: "Find one document", code: `from pymongo import MongoClient

myclient = MongoClient("mongodb://localhost:27017/")
mydb = myclient["mydatabase"]
mycol = mydb["customers"]

doc = mycol.find_one()
print(doc)`, output: `{'_id': 1, 'name': 'John', 'address': 'Highway 21'}` },
      { type: "heading", text: "Finding All Documents" },
      { type: "para", text: "The find method with no filter returns every document in the collection. It gives you a cursor, which you loop over to get one document at a time. The loop below prints all six customers in _id order, with the same names and addresses as the MySQL table." },
      { type: "code", title: "Find all documents", code: `for doc in mycol.find():
  print(doc)`, output: `{'_id': 1, 'name': 'John', 'address': 'Highway 21'}
{'_id': 2, 'name': 'Peter', 'address': 'Lowstreet 4'}
{'_id': 3, 'name': 'Amy', 'address': 'Apple st 652'}
{'_id': 4, 'name': 'Hannah', 'address': 'Mountain 21'}
{'_id': 5, 'name': 'Michael', 'address': 'Valley 345'}
{'_id': 6, 'name': 'Sandy', 'address': 'Ocean blvd 2'}` },
      { type: "heading", text: "Reading Only Some Fields" },
      { type: "para", text: "The second argument to find is a projection, which says which fields to return. Set a field to 1 to include it and 0 to leave it out. The example below returns only name and address, and leaves out _id, so the printed dictionaries have just two fields. This is the MongoDB version of naming columns in a SQL SELECT." },
      { type: "code", title: "Return only name and address", code: `for doc in mycol.find({}, {"_id": 0, "name": 1, "address": 1}):
  print(doc)`, output: `{'name': 'John', 'address': 'Highway 21'}
{'name': 'Peter', 'address': 'Lowstreet 4'}
{'name': 'Amy', 'address': 'Apple st 652'}
{'name': 'Hannah', 'address': 'Mountain 21'}
{'name': 'Michael', 'address': 'Valley 345'}
{'name': 'Sandy', 'address': 'Ocean blvd 2'}` },
      { type: "list", items: ["find_one returns the first document, or None when the collection is empty.", "find with no filter returns every document.", "Loop over the result of find to read one document at a time.", "A projection picks which fields to return.", "Use 1 to include a field and 0 to leave it out."] },
    ],
    practice: [
      "Use find_one to print the first customer, then print only its name.",
      "Use find to print all six customers.",
      "Use a projection to print only the name of each customer, without the _id.",
    ],
    summary: [
      "find_one returns the first document in a collection.",
      "find with no filter returns every document.",
      "Each document comes back as a Python dictionary.",
      "A projection picks which fields to include or leave out.",
      "Use 1 to include a field and 0 to leave it out.",
    ],
  },
  {
    slug: "python-mongodb-query",
    title: "MongoDB Query",
    intro: "A query filters documents so you only get the ones that match. This tutorial shows exact matches, comparisons, and pattern matches.",
    blocks: [
      { type: "heading", text: "Filtering with a Query" },
      { type: "para", text: "The first argument to find is a filter, which is a dictionary of the fields and values to match. The example below asks for the document whose address is Mountain 21, and only Hannah matches, so only her document comes back. This is the MongoDB version of the SQL WHERE clause." },
      { type: "code", title: "One matching document", code: `from pymongo import MongoClient

myclient = MongoClient("mongodb://localhost:27017/")
mydb = myclient["mydatabase"]
mycol = mydb["customers"]

query = {"address": "Mountain 21"}
for doc in mycol.find(query):
  print(doc)`, output: `{'_id': 4, 'name': 'Hannah', 'address': 'Mountain 21'}` },
      { type: "heading", text: "Comparing Values" },
      { type: "para", text: "Operators let you compare values instead of matching them exactly. The operator $gt means greater than, $lt means less than, and $gte means greater than or equal to. The example below asks for documents with an _id greater than 4, which are Michael with _id 5 and Sandy with _id 6. The operator goes inside a small dictionary as the value of the field." },
      { type: "code", title: "Ids greater than 4", code: `query = {"_id": {"$gt": 4}}
for doc in mycol.find(query):
  print(doc)`, output: `{'_id': 5, 'name': 'Michael', 'address': 'Valley 345'}
{'_id': 6, 'name': 'Sandy', 'address': 'Ocean blvd 2'}` },
      { type: "heading", text: "Matching a Pattern" },
      { type: "para", text: "The $regex operator matches a pattern, like LIKE in SQL. The pattern ^S means a name that starts with the letter S, and only Sandy matches. The pattern a means a name that contains the letter a, which matches Amy, Hannah, Michael, and Sandy. A caret at the start means the start of the value, and a dollar at the end would mean the end." },
      { type: "code", title: "Names starting with S", code: `query = {"name": {"$regex": "^S"}}
for doc in mycol.find(query):
  print(doc)`, output: `{'_id': 6, 'name': 'Sandy', 'address': 'Ocean blvd 2'}` },
      { type: "list", items: ["The filter is the first argument to find.", "An exact value matches that value only.", "$gt, $lt, and $gte compare numbers and other values.", "$regex matches a pattern, like LIKE in SQL.", "Two fields in one filter must both match."] },
    ],
    practice: [
      "Find the customer whose name is Amy and print the document.",
      "Find every customer with an _id less than 3 and print them.",
      "Find every customer whose address contains the word Street, using $regex, and count the matches.",
    ],
    summary: [
      "A query filter is a dictionary passed to find.",
      "An exact value matches only that value.",
      "$gt, $lt, and $gte compare values.",
      "$regex matches a pattern, like LIKE in SQL.",
      "A filter with two fields needs both to match.",
    ],
  },
  {
    slug: "python-mongodb-sort",
    title: "MongoDB Sort",
    intro: "Sort orders the documents that a query returns. This tutorial sorts the customers by name, in both directions.",
    blocks: [
      { type: "heading", text: "Sorting in Ascending Order" },
      { type: "para", text: "Documents in a collection have no guaranteed order unless you ask for one. The sort method sorts the result by the field you name. The direction 1 means ascending, from A to Z for text and from small to large for numbers. The example below sorts the six customers by name, so Amy comes first and Sandy comes last." },
      { type: "code", title: "Sort by name, A to Z", code: `from pymongo import MongoClient

myclient = MongoClient("mongodb://localhost:27017/")
mydb = myclient["mydatabase"]
mycol = mydb["customers"]

for doc in mycol.find().sort("name"):
  print(doc)`, output: `{'_id': 3, 'name': 'Amy', 'address': 'Apple st 652'}
{'_id': 4, 'name': 'Hannah', 'address': 'Mountain 21'}
{'_id': 1, 'name': 'John', 'address': 'Highway 21'}
{'_id': 5, 'name': 'Michael', 'address': 'Valley 345'}
{'_id': 2, 'name': 'Peter', 'address': 'Lowstreet 4'}
{'_id': 6, 'name': 'Sandy', 'address': 'Ocean blvd 2'}` },
      { type: "heading", text: "Sorting in Descending Order" },
      { type: "para", text: "The direction -1 means descending, from Z to A for text and from large to small for numbers. You write it as a second argument to sort, after the field name. The example below sorts the same six customers in the opposite order, so Sandy comes first and Amy comes last." },
      { type: "code", title: "Sort by name, Z to A", code: `for doc in mycol.find().sort("name", -1):
  print(doc)`, output: `{'_id': 6, 'name': 'Sandy', 'address': 'Ocean blvd 2'}
{'_id': 2, 'name': 'Peter', 'address': 'Lowstreet 4'}
{'_id': 5, 'name': 'Michael', 'address': 'Valley 345'}
{'_id': 1, 'name': 'John', 'address': 'Highway 21'}
{'_id': 4, 'name': 'Hannah', 'address': 'Mountain 21'}
{'_id': 3, 'name': 'Amy', 'address': 'Apple st 652'}` },
      { type: "para", text: "Sort works with a filter too. For example, mycol.find with a filter for names containing the letter a, followed by sort on name, returns Amy, Hannah, Michael, and Sandy in that order. You can also sort by more than one field by passing a list of pairs, for example sort with address first and name second, which sorts by address and uses name to break ties." },
      { type: "code", title: "Filter, then sort", code: `query = {"name": {"$regex": "a"}}
for doc in mycol.find(query).sort("name"):
  print(doc)`, output: `{'_id': 3, 'name': 'Amy', 'address': 'Apple st 652'}
{'_id': 4, 'name': 'Hannah', 'address': 'Mountain 21'}
{'_id': 5, 'name': 'Michael', 'address': 'Valley 345'}
{'_id': 6, 'name': 'Sandy', 'address': 'Ocean blvd 2'}` },
      { type: "list", items: ["sort orders the documents a query returns.", "The direction 1 means ascending, and -1 means descending.", "Sort by the field you name, such as name or _id.", "Sort works together with a filter.", "You can sort by more than one field with a list of pairs."] },
      { type: "tip", text: "Sort by the field the reader will scan, usually a name or a date, so the result is easy to read." },
    ],
    practice: [
      "Sort all customers by address from A to Z and print them.",
      "Sort all customers by name from Z to A and check that Sandy is first.",
      "Find customers whose name contains the letter a, sorted by name.",
    ],
    summary: [
      "sort orders the documents returned by find.",
      "The direction 1 is ascending, and -1 is descending.",
      "Sorting works on text, numbers, and dates.",
      "Sort works together with a filter.",
      "You can sort by more than one field at a time.",
    ],
  },
  {
    slug: "python-mongodb-delete",
    title: "MongoDB Delete",
    intro: "Delete removes documents from a collection. This tutorial deletes the extra customer Vicky, so the collection returns to the six original customers.",
    blocks: [
      { type: "heading", text: "Deleting One Document" },
      { type: "para", text: "The delete_one method removes the first document that matches a filter. In the Insert tutorial you added a seventh customer, Vicky from Yellow Garden 2, with _id 7, as practice. This tutorial removes her, so the collection is back to the six original customers. The filter on the name Vicky matches only her document, so only one document is deleted." },
      { type: "code", title: "Delete Vicky", code: `from pymongo import MongoClient

myclient = MongoClient("mongodb://localhost:27017/")
mydb = myclient["mydatabase"]
mycol = mydb["customers"]

result = mycol.delete_one({"name": "Vicky"})
print(result.deleted_count, "document deleted.")`, output: `1 document deleted.` },
      { type: "heading", text: "Checking the Result" },
      { type: "para", text: "The deleted_count attribute tells you how many documents were removed, which is 1 here. After the delete, a find shows the six original customers again, with _id values 1 to 6. Vicky, who had _id 7, is gone. Unlike MySQL, MongoDB does not need a commit call, because the delete is saved at once." },
      { type: "code", title: "The collection after the delete", code: `for doc in mycol.find():
  print(doc)`, output: `{'_id': 1, 'name': 'John', 'address': 'Highway 21'}
{'_id': 2, 'name': 'Peter', 'address': 'Lowstreet 4'}
{'_id': 3, 'name': 'Amy', 'address': 'Apple st 652'}
{'_id': 4, 'name': 'Hannah', 'address': 'Mountain 21'}
{'_id': 5, 'name': 'Michael', 'address': 'Valley 345'}
{'_id': 6, 'name': 'Sandy', 'address': 'Ocean blvd 2'}` },
      { type: "para", text: "The delete_many method removes every document that matches a filter. For example, delete_many with a filter for addresses containing Street would remove every matching document at once, so check the filter with find first. The method delete_many with an empty filter removes every document in the collection, but the collection itself stays." },
      { type: "code", title: "Delete many at once", code: `result = mycol.delete_many({"address": {"$regex": "Street"}})
print(result.deleted_count, "documents deleted.")`, output: `0 documents deleted.` },
      { type: "para", text: "The output is 0 here, because none of the six customers has the word Street in the address. The addresses are Highway, Lowstreet, Apple st, Mountain, Valley, and Ocean blvd, and the pattern Street with a capital S does not match Lowstreet, which is one word with a small s in street. Pattern matching is case sensitive by default." },
      { type: "list", items: ["delete_one removes the first document that matches a filter.", "delete_many removes every document that matches a filter.", "deleted_count tells you how many documents were removed.", "Test the filter with find first so you delete the right documents.", "No commit call is needed in MongoDB."] },
    ],
    practice: [
      "Insert Vicky again, then delete her with a filter on her name and confirm the deleted count is 1.",
      "Use find with the same filter before you delete, to see which documents would be removed.",
      "Try deleting a customer who does not exist and check that the deleted count is 0.",
    ],
    summary: [
      "delete_one removes the first document that matches a filter.",
      "delete_many removes every document that matches a filter.",
      "deleted_count tells you how many documents were removed.",
      "Always test the filter with find first.",
      "Never run delete_many with an empty filter unless you mean to empty the collection.",
    ],
  },
  {
    slug: "python-mongodb-drop-collection",
    title: "MongoDB Drop Collection",
    intro: "Dropping a collection deletes it and all of its documents. This tutorial drops the customers collection and shows how to check that it is gone.",
    blocks: [
      { type: "heading", text: "Dropping a Collection" },
      { type: "para", text: "Delete removes documents, but dropping a collection removes the collection itself. The documents and the collection are all gone at once. There is no undo, so only drop a collection when you are sure you do not need it. The method is drop, called on the collection object. The example below drops the customers collection from the mydatabase database." },
      { type: "code", title: "Drop the collection", code: `from pymongo import MongoClient

myclient = MongoClient("mongodb://localhost:27017/")
mydb = myclient["mydatabase"]
mycol = mydb["customers"]

mycol.drop()
print("Collection dropped.")`, output: `Collection dropped.` },
      { type: "heading", text: "Checking That It Is Gone" },
      { type: "para", text: "After the drop, list_collection_names returns an empty list, because mydatabase has no collections left. A find on the dropped collection returns nothing, and count_documents returns 0. If you drop a collection that does not exist, pymongo does not raise an error, it simply does nothing, which makes drop safe to call twice." },
      { type: "code", title: "List collections after the drop", code: `print(mydb.list_collection_names())`, output: `[]` },
      { type: "para", text: "Dropping a collection does not delete the database, and it does not delete other collections. Only the named collection goes. Because the later tutorials still need the customers collection, recreate it and insert the six customers again before you move on to Update. The Insert tutorial has the full list of six documents." },
      { type: "list", items: ["drop deletes a collection and all of its documents.", "There is no undo, so be sure before you drop.", "list_collection_names returns an empty list after the drop.", "Dropping a missing collection does not raise an error.", "Dropping a collection does not delete the database or other collections."] },
      { type: "note", text: "The customers collection is dropped here on purpose, as the lesson. Recreate it with the six customers before the Update tutorial, or the later examples will have no collection to work on." },
    ],
    practice: [
      "Create a collection called old_customers, then drop it and confirm list_collection_names no longer shows it.",
      "Drop the same collection a second time and check that no error appears.",
      "Recreate the customers collection and insert the six original customers, so later tutorials work.",
    ],
    summary: [
      "drop deletes a whole collection, documents and all.",
      "There is no undo, so only drop a collection you do not need.",
      "list_collection_names returns an empty list once the collection is gone.",
      "Dropping a missing collection does not raise an error.",
      "Recreate the customers collection with its six documents before the next tutorial.",
    ],
  },
  {
    slug: "python-mongodb-update",
    title: "MongoDB Update",
    intro: "Update changes the fields of documents that already exist. This tutorial changes John's address to Canyon 123, and the Limit tutorial uses that new address.",
    blocks: [
      { type: "heading", text: "Updating One Document" },
      { type: "para", text: "The update_one method changes the first document that matches a filter. First, recreate the customers collection with the six original customers, because the previous tutorial dropped it. Then run the update below. The filter matches the document where the name is John, and the $set operator sets the address field to Canyon 123. Only one document matches, so only John's address changes and the other five customers stay the same." },
      { type: "code", title: "Update John's address", code: `from pymongo import MongoClient

myclient = MongoClient("mongodb://localhost:27017/")
mydb = myclient["mydatabase"]
mycol = mydb["customers"]

filter = {"name": "John"}
newvalues = {"$set": {"address": "Canyon 123"}}
result = mycol.update_one(filter, newvalues)
print(result.modified_count, "document modified.")`, output: `1 document modified.` },
      { type: "heading", text: "Checking the Result" },
      { type: "para", text: "The modified_count attribute tells you how many documents were changed, which is 1 here. A find now shows John at Canyon 123, while Peter, Amy, Hannah, Michael, and Sandy keep their original addresses. From this tutorial onward, John's address is Canyon 123 in every MongoDB result, so remember the change when you read the Limit tutorial. Unlike MySQL, MongoDB needs no commit call." },
      { type: "code", title: "The collection after the update", code: `for doc in mycol.find():
  print(doc)`, output: `{'_id': 1, 'name': 'John', 'address': 'Canyon 123'}
{'_id': 2, 'name': 'Peter', 'address': 'Lowstreet 4'}
{'_id': 3, 'name': 'Amy', 'address': 'Apple st 652'}
{'_id': 4, 'name': 'Hannah', 'address': 'Mountain 21'}
{'_id': 5, 'name': 'Michael', 'address': 'Valley 345'}
{'_id': 6, 'name': 'Sandy', 'address': 'Ocean blvd 2'}` },
      { type: "para", text: "The $set operator changes only the fields you name, and leaves the rest of the document alone. Without $set, the update would replace the whole document, which is rarely what you want. The update_many method works the same way but changes every document that matches the filter, so test the filter with find first. You can set more than one field at once by putting two fields inside $set." },
      { type: "list", items: ["update_one changes the first document that matches a filter.", "update_many changes every document that matches a filter.", "$set changes only the fields you name.", "modified_count tells you how many documents were changed.", "An update with an empty filter changes every document, so test the filter first."] },
      { type: "tip", text: "When only one document should change, use a filter that matches one document, such as the name or the _id, and check the modified count afterwards." },
    ],
    practice: [
      "Update Amy's address to Cherry Lane 9 and check the document with a find.",
      "Update two fields at once by changing Sandy's name and address in one $set.",
      "Update a customer who does not exist and check that the modified count is 0.",
    ],
    summary: [
      "update_one changes the first document that matches a filter.",
      "Use $set to change only the fields you name.",
      "modified_count tells you how many documents were changed.",
      "John's address is now Canyon 123 in every later MongoDB example.",
      "Never run update_many with an empty filter unless you mean to change every document.",
    ],
  },
  {
    slug: "python-mongodb-limit",
    title: "MongoDB Limit",
    intro: "Limit returns only a set number of documents. This tutorial takes the first three customers from the collection.",
    blocks: [
      { type: "heading", text: "Taking the First Documents" },
      { type: "para", text: "A collection can hold thousands of documents, but you often want only a few. The limit method sets the maximum number of documents a query returns. The example below asks for three documents, so pymongo returns the first three customers in _id order: John, Peter, and Amy. Remember that John's address is now Canyon 123, after the change in the Update tutorial." },
      { type: "code", title: "First three customers", code: `from pymongo import MongoClient

myclient = MongoClient("mongodb://localhost:27017/")
mydb = myclient["mydatabase"]
mycol = mydb["customers"]

for doc in mycol.find().limit(3):
  print(doc)`, output: `{'_id': 1, 'name': 'John', 'address': 'Canyon 123'}
{'_id': 2, 'name': 'Peter', 'address': 'Lowstreet 4'}
{'_id': 3, 'name': 'Amy', 'address': 'Apple st 652'}` },
      { type: "heading", text: "Skipping Documents" },
      { type: "para", text: "The skip method skips a number of documents before limit starts counting. Skip 1 and limit 2 skips John and returns Peter and Amy. This is how paging works: page one uses limit 3 and skip 0, page two uses limit 3 and skip 3, and so on. Combine limit with sort when the order matters, because without sort the database may return documents in any order." },
      { type: "code", title: "Skip one document, take two", code: `for doc in mycol.find().skip(1).limit(2):
  print(doc)`, output: `{'_id': 2, 'name': 'Peter', 'address': 'Lowstreet 4'}
{'_id': 3, 'name': 'Amy', 'address': 'Apple st 652'}` },
      { type: "para", text: "Limit also works with a filter and a sort in the same chain. For example, find with a filter for names containing the letter a, then sort by name, then limit 2, returns Amy and Hannah. Chaining keeps the code short: the query is built in one line, from find to sort to skip to limit, and the loop prints what comes back." },
      { type: "code", title: "Filter, sort, then limit", code: `query = {"name": {"$regex": "a"}}
for doc in mycol.find(query).sort("name").limit(2):
  print(doc)`, output: `{'_id': 3, 'name': 'Amy', 'address': 'Apple st 652'}
{'_id': 4, 'name': 'Hannah', 'address': 'Mountain 21'}` },
      { type: "list", items: ["limit sets the maximum number of documents returned.", "skip skips documents before limit starts counting.", "limit and skip together make paging possible.", "Combine limit with sort when the order matters.", "Chain find, sort, skip, and limit in one line."] },
      { type: "tip", text: "Use limit while you are testing a query on a big collection, so a mistake returns a few documents instead of a million." },
    ],
    practice: [
      "Print the first two customers with limit 2.",
      "Print two customers starting from the third one with skip 2 and limit 2.",
      "Print the last three customers by sorting on _id in descending order with limit 3.",
    ],
    summary: [
      "limit returns only a set number of documents from a query.",
      "skip skips documents before limit starts counting.",
      "limit and skip together let you page through results.",
      "Combine limit with sort when the order of documents matters.",
      "limit 3 returns John, Peter, and Amy from the customers collection.",
    ],
  },
];
