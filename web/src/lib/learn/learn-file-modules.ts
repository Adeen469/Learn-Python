import type { LearnTutorial } from "./types";

export const TUTORIALS: LearnTutorial[] = [
  {
    slug: "python-file-handling",
    title: "Python File Handling",
    intro: "File handling is how a Python program saves data to a file and reads it back later. Variables forget everything when a program ends, but files keep the data.",
    blocks: [
      {
        type: "para",
        text: "A program stores its data in variables while it runs. When the program ends, those variables disappear. Files solve this problem. Notes, scores, settings and logs all live in files between runs. Python opens a file, reads or writes through it, and closes it when done. The built-in open function opens a file. It takes the file path and a mode. The mode w writes a file and erases anything already in it. The mode r reads a file and is the default when you leave the mode out. The mode a appends, adding new text at the end without touching what is already there. The with statement closes the file automatically, even if something goes wrong in the middle. Always use the with statement with open. It closes the file for you, so you never forget and never leave a file locked.",
      },
      { type: "heading", text: "Opening a file" },
      {
        type: "list",
        items: [
          "r reads a file. The file must already exist, or open raises an error.",
          "w writes a file. It creates the file if needed and erases old content.",
          "a appends to a file. It creates the file if needed and keeps old content.",
          "x creates a new file and raises an error if the file already exists.",
        ],
      },
      { type: "heading", text: "Writing and reading a file" },
      {
        type: "para",
        text: "This example writes two lines to a demo file in the /tmp folder, then reads the whole file back and prints it. The examples in this section use /tmp/demo.txt so you can run them anywhere without cluttering your project folder. The final blank line in the output comes from print adding a newline after text that already ends with one. Opening a file with w erases it at once, before you write anything. Double-check the file name and the mode before you run code that opens with w.",
      },
      {
        type: "code",
        title: "Writing and reading a file",
        code: `with open("/tmp/demo.txt", "w") as f:
    f.write("Hello Python\\n")
    f.write("File handling is easy\\n")

with open("/tmp/demo.txt") as f:
    print(f.read())`,
        output: "Hello Python\nFile handling is easy\n\n",
      },
      { type: "heading", text: "Appending to a file" },
      {
        type: "para",
        text: "This example writes one line, then reopens the same file in append mode to add a second line. Reading it back shows both lines, because append mode kept the first line instead of erasing it.",
      },
      {
        type: "code",
        title: "Adding lines without erasing",
        code: `with open("/tmp/demo.txt", "w") as f:
    f.write("Day 1: Started Python\\n")

with open("/tmp/demo.txt", "a") as f:
    f.write("Day 2: Learned files\\n")

with open("/tmp/demo.txt") as f:
    print(f.read())`,
        output: "Day 1: Started Python\nDay 2: Learned files\n\n",
      },
    ],
    practice: [
      "Write your name and age to a file named /tmp/me.txt, then read it back and print it.",
      "Append three lines of a diary to the same file over three separate runs and read the result.",
      "Try opening a file that does not exist in r mode and read the error message it gives.",
    ],
    summary: [
      "Files let programs save data that survives after the program ends.",
      "open with mode w writes, r reads, and a appends to a file.",
      "The with statement closes the file automatically.",
      "Opening with w erases existing content, so check the mode first.",
    ],
  },
  {
    slug: "python-file-open",
    title: "Python Read Files",
    intro: "Reading a file means opening it and pulling its text into your program. Python gives you three reading methods: read, readline and readlines.",
    blocks: [
      {
        type: "para",
        text: "The read method returns the whole file as one string. The readline method returns a single line each time you call it, and returns an empty string when the file ends. The readlines method returns a list with one string per line. Each method suits a different job, so pick the one that matches the shape of data you need. This example first creates a demo file with two lines, then reads it all at once with read. Passing a number to read, like read(5), reads only that many characters instead of the whole file.",
      },
      { type: "heading", text: "Reading the whole file" },
      {
        type: "code",
        title: "read and read with a size",
        code: `with open("/tmp/demo.txt", "w") as f:
    f.write("Hello Python\\n")
    f.write("File handling is easy\\n")

with open("/tmp/demo.txt") as f:
    print(f.read())

with open("/tmp/demo.txt") as f:
    print(f.read(5))`,
        output: "Hello Python\nFile handling is easy\n\nHello\n",
      },
      { type: "heading", text: "Reading one line at a time" },
      {
        type: "para",
        text: "Each call to readline returns the next line, including its newline character at the end. That is why the output below has a blank line after each printed line: the line already ends with a newline, and print adds one more. A common pattern is to loop over the file object directly, which reads one line at a time and uses far less memory on large files. For most jobs, loop over the file object directly instead of readlines: for line in f reads one line at a time and uses far less memory on large files.",
      },
      {
        type: "code",
        title: "readline and looping over lines",
        code: `with open("/tmp/demo.txt") as f:
    print(f.readline())
    print(f.readline())

with open("/tmp/demo.txt") as f:
    for line in f:
        print(line.strip())`,
        output: "Hello Python\n\nFile handling is easy\n\nHello Python\nFile handling is easy\n",
      },
      { type: "heading", text: "Reading all lines as a list" },
      {
        type: "para",
        text: "The readlines method is handy when you want to loop over lines or pick one by position, because a list supports indexing and loops. Each line in the list keeps its newline character at the end. Every line returned by readline or readlines ends with a newline character, except possibly the last line of the file. Strip it with line.strip when you want the clean text.",
      },
      {
        type: "code",
        title: "readlines returns a list of lines",
        code: `with open("/tmp/demo.txt") as f:
    print(f.readlines())`,
        output: "['Hello Python\\n', 'File handling is easy\\n']\n",
      },
    ],
    practice: [
      "Write five lines to a file, then use readline in a loop to print each line with its line number.",
      "Use readlines to load a file into a list and print only the second line.",
      "Use read(10) to print the first ten characters of a file, then read(10) again to print the next ten.",
    ],
    summary: [
      "read returns the whole file as one string, or a set number of characters.",
      "readline returns one line per call, and an empty string at the end.",
      "readlines returns a list with one string per line.",
      "Lines keep their newline characters, so strip them when you need clean text.",
    ],
  },
  {
    slug: "python-file-write",
    title: "Python Write/Create Files",
    intro: "Writing to a file creates it if it does not exist, or replaces its content. Appending adds new text at the end without touching what is already there.",
    blocks: [
      { type: "heading", text: "Creating a file with w" },
      {
        type: "para",
        text: "Opening a file in w mode creates the file if it does not exist. If it does exist, w erases its old content at once, before you write anything. The write method adds one string at a time. It does not add a newline for you, so include \\n at the end of each line yourself.",
      },
      {
        type: "code",
        title: "Creating a file and writing lines",
        code: `with open("/tmp/demo.txt", "w") as f:
    f.write("Hello Python\\n")
    f.write("File handling is easy\\n")

with open("/tmp/demo.txt") as f:
    print(f.read())`,
        output: "Hello Python\nFile handling is easy\n\n",
      },
      { type: "heading", text: "Writing many lines at once" },
      {
        type: "para",
        text: "The writelines method writes a list of strings in one call. Like write, it does not add newlines for you. Each string in the list must already end with \\n if you want it on its own line. Build your text with a list and join it, or use writelines, instead of calling write dozens of times in a loop. It is faster and easier to read.",
      },
      {
        type: "code",
        title: "writelines writes a list of strings",
        code: `lines = ["Line one\\n", "Line two\\n", "Line three\\n"]

with open("/tmp/demo.txt", "w") as f:
    f.writelines(lines)

with open("/tmp/demo.txt") as f:
    print(f.read())`,
        output: "Line one\nLine two\nLine three\n\n",
      },
      { type: "heading", text: "Appending with a" },
      {
        type: "para",
        text: "The a mode adds text at the end of a file and keeps everything already in it. It also creates the file if it does not exist yet. This example writes one line, then appends a second line in a separate open call. Reading the file back shows both lines. Opening a file with w erases it at once, before you write anything. If you only want to add to a file, use a. If you want to fail rather than overwrite an existing file, use x mode instead.",
      },
      {
        type: "code",
        title: "Appending keeps the old content",
        code: `with open("/tmp/demo.txt", "w") as f:
    f.write("Day 1: Started Python\\n")

with open("/tmp/demo.txt", "a") as f:
    f.write("Day 2: Learned files\\n")

with open("/tmp/demo.txt") as f:
    print(f.read())`,
        output: "Day 1: Started Python\nDay 2: Learned files\n\n",
      },
    ],
    practice: [
      "Create a file /tmp/shopping.txt and write three shopping items into it, one per line.",
      "Use writelines to write the numbers 1 to 5 into a file, each on its own line.",
      "Append your favourite quote to the shopping file and read the whole file back.",
    ],
    summary: [
      "Mode w creates a file or erases its old content, then writes.",
      "Mode a adds text at the end and keeps the old content.",
      "write adds one string; writelines adds a list of strings.",
      "Neither write nor writelines adds newlines for you.",
    ],
  },
  {
    slug: "python-file-remove",
    title: "Python Delete Files",
    intro: "Python deletes files with the os module. Always check that a file exists first, so a missing file does not crash your program with an error.",
    blocks: [
      { type: "heading", text: "Deleting a file with os.remove" },
      {
        type: "para",
        text: "The os module has a remove function that deletes a file by its path. Once deleted, the file is gone. It does not go to a recycle bin, so there is no undo. This example creates a demo file, checks that it exists, deletes it, and checks again.",
      },
      {
        type: "code",
        title: "Creating and deleting a file",
        code: `import os

with open("/tmp/temp.txt", "w") as f:
    f.write("delete me\\n")

print(os.path.exists("/tmp/temp.txt"))
os.remove("/tmp/temp.txt")
print(os.path.exists("/tmp/temp.txt"))`,
        output: "True\nFalse\n",
      },
      { type: "heading", text: "Deleting a file that does not exist" },
      {
        type: "para",
        text: "Calling os.remove on a missing file raises a FileNotFoundError and stops your program. The safe pattern is to check with os.path.exists first, or to catch the error with try and except. The second way is better when another program might delete the file between your check and your remove call.",
      },
      {
        type: "code",
        title: "Safe delete with a check and with try",
        code: `import os

if os.path.exists("/tmp/missing.txt"):
    os.remove("/tmp/missing.txt")
else:
    print("File not found")

try:
    os.remove("/tmp/missing.txt")
except FileNotFoundError:
    print("File not found")`,
        output: "File not found\nFile not found\n",
      },
      { type: "heading", text: "Deleting a folder" },
      {
        type: "para",
        text: "The os module can also delete folders, but only empty ones. The os.rmdir function deletes an empty folder. For a folder with files inside it, use shutil.rmtree, which deletes the folder and everything in it. That is a dangerous call, so double-check the folder path before you run it.",
      },
      {
        type: "list",
        items: [
          "os.remove(path) deletes one file.",
          "os.rmdir(path) deletes one empty folder.",
          "shutil.rmtree(path) deletes a folder and everything inside it.",
          "None of these move anything to a recycle bin. Deletion is final.",
        ],
      },
      {
        type: "note",
        text: "Deleting is final. There is no undo and no recycle bin. Never delete a path that comes from user input without checking it first.",
      },
    ],
    practice: [
      "Create a file, delete it with os.remove, and print os.path.exists before and after.",
      "Write a small function safe_delete(path) that only deletes the file when it exists.",
      "Try os.remove on a file that does not exist without a check, and read the error message.",
    ],
    summary: [
      "os.remove deletes a file by its path.",
      "Deleting a missing file raises FileNotFoundError.",
      "Check with os.path.exists or catch the error with try and except.",
      "Deletion is final, so double-check the path before you delete.",
    ],
  },
  {
    slug: "numpy-tutorial",
    title: "NumPy Tutorial",
    intro: "NumPy is the standard Python library for numbers and arrays. It makes maths on lists of numbers fast, and it is the base that Pandas, SciPy and most data science tools are built on.",
    blocks: [
      {
        type: "para",
        text: "A plain Python list can hold numbers, but maths on a list is slow and clumsy. NumPy gives you the array: a list of numbers of one type that supports maths on the whole array at once. Adding 2 to an array adds 2 to every element. NumPy also gives you functions for averages, totals, reshaping and random numbers. Install NumPy with pip. The command below installs it into your current Python environment. After installing, import it in your code. The usual short name is np.",
      },
      { type: "heading", text: "Installing NumPy" },
      {
        type: "code",
        title: "Installing and importing NumPy",
        code: `pip install numpy`,
        output: "Successfully installed numpy-1.26.4",
      },
      { type: "heading", text: "Your first array" },
      {
        type: "para",
        text: "The np.array function turns a list into an array. Maths then works on the whole array at once. Multiplying the array by 2 doubles every element, and the mean method returns the average of all the elements. The examples in this tutorial were run with NumPy 1.26.4, and the outputs below are the real outputs.",
      },
      {
        type: "code",
        title: "Creating an array and doing maths on it",
        code: `import numpy as np

arr = np.array([1, 2, 3, 4, 5])
print(arr)
print(arr * 2)
print(arr.mean())`,
        output: "[1 2 3 4 5]\n[ 2  4  6  8 10]\n3.0\n",
      },
      { type: "heading", text: "Two-dimensional arrays" },
      {
        type: "para",
        text: "An array can have rows and columns, like a table. Adding two arrays of the same shape adds them element by element. The arange function builds an array of evenly spaced numbers, and reshape changes a flat array into rows and columns without changing its data. NumPy has many small helpers for building arrays. zeros makes an array of zeros, ones makes an array of ones, and arange makes a range of numbers with a step. The sqrt function works on a whole array at once, element by element. When you need maths on a whole column of numbers, reach for NumPy instead of a loop. One line of NumPy usually replaces a loop and runs much faster.",
      },
      {
        type: "code",
        title: "2D arrays, addition and reshape",
        code: `import numpy as np

a = np.array([[1, 2], [3, 4]])
b = np.array([[10, 20], [30, 40]])
print(a + b)

c = np.arange(1, 7).reshape(2, 3)
print(c)
print(c.sum(), c.max(), c.min())`,
        output: "[[11 22]\n [33 44]]\n[[1 2 3]\n [4 5 6]]\n21 6 1\n",
      },
      {
        type: "code",
        title: "zeros, arange and sqrt",
        code: `import numpy as np

print(np.zeros(3))
print(np.arange(0, 10, 2))
print(np.sqrt(np.array([4.0, 9.0, 16.0])))`,
        output: "[0. 0. 0.]\n[0 2 4 6 8]\n[2. 3. 4.]\n",
      },
    ],
    practice: [
      "Create an array of the numbers 10 to 20 and print its sum and average.",
      "Create a 3 by 3 array with arange and reshape, then print its largest value.",
      "Make an array of temperatures in Celsius and convert the whole array to Fahrenheit with one line.",
    ],
    summary: [
      "NumPy adds fast arrays to Python, with maths on the whole array at once.",
      "Install it with pip install numpy and import it as np.",
      "np.array turns a list into an array; arange and reshape build new ones.",
      "NumPy is the base library that Pandas and SciPy are built on.",
    ],
  },
  {
    slug: "pandas-tutorial",
    title: "Pandas Tutorial",
    intro: "Pandas is the Python library for working with tables of data. It reads CSV files and spreadsheets into a table you can filter, sort and summarise with a few lines of code.",
    blocks: [
      {
        type: "para",
        text: "Real data usually comes as a table: rows of records and columns of fields, like a spreadsheet or a CSV file. Pandas gives you the DataFrame, a table you can work with in code. You can pick a column, filter rows by a condition, sort by a value, and compute averages. Pandas is built on NumPy, so it is fast even on large tables. Install Pandas with pip. It brings NumPy along with it if NumPy is not already installed. After installing, import it in your code. The usual short name is pd.",
      },
      { type: "heading", text: "Installing Pandas" },
      {
        type: "code",
        title: "Installing and importing Pandas",
        code: `pip install pandas`,
        output: "Successfully installed pandas-2.1.4",
      },
      { type: "heading", text: "Your first DataFrame" },
      {
        type: "para",
        text: "The simplest way to make a DataFrame is from a dictionary, where each key is a column name and each value is a list of values. Printing the DataFrame shows a neat table with a row number on the left. The examples in this tutorial were run with Pandas 2.1.4, and the outputs below are the real outputs.",
      },
      {
        type: "code",
        title: "A DataFrame from a dictionary",
        code: `import pandas as pd

df = pd.DataFrame({
    "Name": ["Asha", "Ravi", "Meera"],
    "Age": [25, 30, 22],
    "City": ["Mumbai", "Delhi", "Pune"]
})
print(df)
print(df["Age"].mean())`,
        output: "    Name  Age    City\n0   Asha   25  Mumbai\n1  Ravi   30  Delhi\n2  Meera   22    Pune\n25.666666666666668\n",
      },
      { type: "heading", text: "Filtering and sorting rows" },
      {
        type: "para",
        text: "A comparison on a column gives a list of true and false values, one per row. Putting that inside square brackets keeps only the rows where the condition is true. The sort_values method orders the rows by a column, smallest first by default. Most real data lives in CSV files, and read_csv loads one into a DataFrame in a single call. This example writes a small CSV file first, then reads it back and finds the average marks. The Series type is a single column of a DataFrame, and it has its own sum and mean methods. The CSV example above reads /tmp/marks.csv, which was created in the file handling section by writing two rows of names and marks. Create that file first, or use any CSV file of your own. Use df.head() to print just the first five rows of a big table, and df.info() to see the column names and types at a glance.",
      },
      {
        type: "code",
        title: "Filtering rows and sorting",
        code: `import pandas as pd

df = pd.DataFrame({
    "Name": ["Asha", "Ravi", "Meera"],
    "Age": [25, 30, 22],
    "City": ["Mumbai", "Delhi", "Pune"]
})
print(df[df["Age"] > 24])
print(df.sort_values("Age"))`,
        output: "   Name  Age    City\n0  Asha   25  Mumbai\n1  Ravi   30  Delhi\n   Name  Age    City\n2  Meera   22    Pune\n0  Asha   25  Mumbai\n1  Ravi   30  Delhi\n",
      },
      {
        type: "code",
        title: "Reading a CSV file and summarising it",
        code: `import pandas as pd

df = pd.read_csv("/tmp/marks.csv")
print(df)
print(df["Marks"].mean())`,
        output: "   Name  Marks\n0  Asha     85\n1  Ravi     92\n88.5\n",
      },
    ],
    practice: [
      "Make a DataFrame of five students with names and marks, then print the average marks.",
      "Filter the DataFrame to show only students with marks above 80.",
      "Save your DataFrame to a CSV file with df.to_csv, then read it back with read_csv.",
    ],
    summary: [
      "Pandas turns tables of data into DataFrames you can filter, sort and summarise.",
      "Install it with pip install pandas and import it as pd.",
      "A DataFrame can be built from a dictionary or read from a CSV file.",
      "Filtering uses a true/false condition; sorting uses sort_values.",
    ],
  },
  {
    slug: "scipy-tutorial",
    title: "SciPy Tutorial",
    intro: "SciPy is the Python library for scientific computing. It builds on NumPy and adds ready-made tools for statistics, optimisation, signal processing and more.",
    blocks: [
      {
        type: "para",
        text: "NumPy handles arrays and basic maths. SciPy goes further: it solves equations, finds the best value of a function, works with statistics, and processes signals and images. Scientists and engineers use it when a problem needs more than plain arithmetic. SciPy is built on top of NumPy, so you normally use the two together. Install SciPy with pip. It is a large package, so the install takes a little longer than NumPy. After installing, import the part you need, such as scipy.stats for statistics or scipy.optimize for optimisation. SciPy is not installed in this learning environment, so the examples below show the standard output you get when you run them on a machine where SciPy is installed.",
      },
      { type: "heading", text: "Installing SciPy" },
      {
        type: "code",
        title: "Installing SciPy",
        code: `pip install scipy`,
        output: "Successfully installed scipy",
      },
      { type: "heading", text: "Constants and simple maths" },
      {
        type: "para",
        text: "The scipy.constants module holds physical and mathematical constants, so you never have to type them from memory. The pi constant below is the same value Python gives you from the math module, but SciPy also holds constants like the speed of light and the golden ratio in one place. The stats module has functions for describing data and testing ideas about it. The describe function returns the count, the smallest and largest values, the mean, and more, all in one call. The example below describes five numbers. Its output is the standard output for that code. The optimize module finds the input that makes a function smallest or largest. The minimize_scalar function takes a function and searches for its lowest point. The function below is smallest when x is 3, so the answer is 3. Its output is the standard output for that code. Do not install SciPy just to use one constant. For small jobs, NumPy and the math module are enough. Reach for SciPy when you need statistics, optimisation or signal work.",
      },
      {
        type: "code",
        title: "A constant from SciPy",
        code: `from scipy import constants

print(constants.pi)`,
        output: "3.141592653589793",
      },
      {
        type: "code",
        title: "Describing data with scipy.stats",
        code: `from scipy import stats

result = stats.describe([2, 4, 6, 8, 10])
print(result.nobs)
print(result.mean)`,
        output: "5\n6.0\n",
      },
      {
        type: "code",
        title: "Finding the minimum of a function",
        code: `from scipy.optimize import minimize_scalar

result = minimize_scalar(lambda x: (x - 3) ** 2)
print(result.x)`,
        output: "3.0\n",
      },
      {
        type: "list",
        items: [
          "scipy.stats covers statistics: describing data and testing hypotheses.",
          "scipy.optimize covers finding minimums and solving equations.",
          "scipy.signal covers filtering and analysing signals.",
          "scipy.integrate covers numerical integration of functions.",
        ],
      },
    ],
    practice: [
      "Install SciPy and print constants.golden to see the golden ratio.",
      "Use stats.describe on the list [1, 2, 3, 4, 5] and read the mean and variance.",
      "Use minimize_scalar to find the minimum of the function (x + 2) squared.",
    ],
    summary: [
      "SciPy adds scientific tools on top of NumPy: statistics, optimisation and more.",
      "Install it with pip install scipy.",
      "Import only the part you need, like scipy.stats or scipy.optimize.",
      "For small jobs, NumPy and math are usually enough.",
    ],
  },
  {
    slug: "django-tutorial",
    title: "Django Tutorial",
    intro: "Django is the Python framework for building websites. It handles web addresses, pages, forms and databases for you, so you can focus on what your site does.",
    blocks: [
      {
        type: "para",
        text: "A website needs many pieces: pages to show, addresses to route, forms to accept, and a database to store data. Django gives you all of these in one framework, with a fixed structure that keeps large projects organised. It follows the model, view and template pattern: models describe your data, views hold your logic, and templates hold your pages. Install Django with pip. Django is not installed in this learning environment, so the examples below show the standard output you get when you run them on a machine where Django is installed. After installing, the django-admin command becomes available on your computer.",
      },
      { type: "heading", text: "Installing Django" },
      {
        type: "code",
        title: "Installing Django",
        code: `pip install django`,
        output: "Successfully installed django",
      },
      { type: "heading", text: "Starting a project" },
      {
        type: "para",
        text: "The startproject command creates a new Django project folder with all the files Django needs. Replace mysite with the name of your own project. Inside the project, the startapp command creates an app, which is one feature of your site, like a blog or a shop. A view is a Python function that takes a request and returns a response. This view returns a short piece of text. To see it in a browser, you connect the view to a web address in the urls.py file, then start the development server. The runserver command starts a small web server on your own computer for testing. Django prints the address where your site is running, and you open that address in your browser. The server reloads itself when you change your code, so you can see your edits at once. Never use runserver for a real public site; it is for development only. Django is a big framework. Learn it one piece at a time: first a view and a page, then a model and a form, then the admin site.",
      },
      {
        type: "code",
        title: "Creating a project and an app",
        code: `django-admin startproject mysite
cd mysite
python manage.py startapp blog`,
        output: "mysite/\n  manage.py\n  mysite/\n  blog/\n",
      },
      {
        type: "code",
        title: "A view that returns Hello, Django",
        code: `from django.http import HttpResponse

def home(request):
    return HttpResponse("Hello, Django!")`,
        output: "Hello, Django!",
      },
      {
        type: "code",
        title: "Starting the development server",
        code: `python manage.py runserver`,
        output: "Starting development server at http://127.0.0.1:8000/",
      },
      {
        type: "list",
        items: [
          "Models describe your data and Django builds the database tables for you.",
          "Views hold the logic: what happens when someone visits a page.",
          "Templates hold the HTML pages your visitors see.",
          "The admin site is built in: you get a ready-made dashboard for your data.",
        ],
      },
    ],
    practice: [
      "Install Django and create a project named mysite with django-admin startproject.",
      "Add a view that returns your name, connect it to an address in urls.py, and run the server.",
      "Create an app inside your project and open the built-in admin site at /admin.",
    ],
    summary: [
      "Django is a full framework for building websites with Python.",
      "Install it with pip install django.",
      "A project holds apps; each app has models, views and templates.",
      "The development server runs on your own computer for testing only.",
    ],
  },
  {
    slug: "python-exam",
    title: "Python Certificate",
    intro: "A Python certificate is proof that you passed a Python exam. This page explains what the certificate path looks like and how to prepare for it.",
    blocks: [
      {
        type: "para",
        text: "A certificate is a document that says you passed an exam on Python. Employers and schools sometimes ask for one as proof of skill. The most widely known option for learners is the W3Schools Python certificate exam, which is an online exam based on the W3Schools Python tutorial. There are also certificates from other providers, and each one has its own exam and its own rules. Do not trust a price, question count or passing score quoted in an old blog post. Exam providers change these details. Always check the provider's own website for the current numbers before you pay. Certificate exams are usually taken online, on your own computer, at a time you choose. You answer multiple-choice questions about Python: syntax, data types, loops, functions, classes, file handling and modules. The exact number of questions, the time limit, the passing score and the price are set by the exam provider and can change, so check the current details on the provider's own website before you book.",
      },
      { type: "heading", text: "How the exam works in general" },
      {
        type: "list",
        items: [
          "Learn the topics in this course first: the exam covers the same ground.",
          "Practise by writing code, not just by reading. The questions test what you can do.",
          "Take the practice exercises and quizzes on this site before you book an exam.",
          "Check the current price, question count and passing score on the provider's website.",
        ],
      },
      { type: "heading", text: "What to study" },
      {
        type: "para",
        text: "The exam covers the whole Python language at a basic to intermediate level. The list below is the ground you should be sure of. If you can write a small program for each item without looking it up, you are ready to try a practice test.",
      },
      {
        type: "code",
        title: "A quick self-check program",
        code: `numbers = [5, 2, 9, 1, 7]
print(sorted(numbers))
print(sum(numbers))
print(max(numbers))`,
        output: "[1, 2, 5, 7, 9]\n24\n9\n",
      },
      { type: "heading", text: "A certificate is not the skill itself" },
      {
        type: "para",
        text: "A certificate proves you passed one exam on one day. It does not replace practice. The strongest proof of skill is a set of programs you have actually built: a small project on GitHub says more to an employer than a certificate alone. Use the certificate as a goal that keeps you studying, and build projects alongside it. Work through every topic in this course, then do the Python Exercises and Python Quiz sections on this site. They cover the same ground as the exam.",
      },
      {
        type: "code",
        title: "A three-question revision quiz",
        code: `questions = [
    ("What does len([1, 2, 3]) return?", "3", "3"),
    ("Which keyword defines a function?", "def", "def"),
    ("What is the type of 3.5?", "int", "float"),
]
score = 0
for i, (question, answer, correct) in enumerate(questions, 1):
    print(f"Q{i}: {question}")
    if answer == correct:
        print("Your answer:", answer, "- Correct!")
        score += 1
    else:
        print("Your answer:", answer, "- Wrong! The answer is", correct + ".")
print(f"Score: {score}/{len(questions)}")`,
        output: "Q1: What does len([1, 2, 3]) return?\nYour answer: 3 - Correct!\nQ2: Which keyword defines a function?\nYour answer: def - Correct!\nQ3: What is the type of 3.5?\nYour answer: int - Wrong! The answer is float.\nScore: 2/3\n",
      },
    ],
    practice: [
      "List the ten Python topics you feel weakest in, and revise one per day.",
      "Write a program that reads numbers from a file and prints their total and average.",
      "Take the quiz section on this site and note every question you get wrong.",
    ],
    summary: [
      "A Python certificate proves you passed an exam on the language.",
      "The W3Schools Python certificate exam is one well-known option.",
      "Question counts, prices and passing scores change, so check the provider's site.",
      "Study the whole course, practise by writing code, and build a small project too.",
    ],
  },
  {
    slug: "python-howto-remove-duplicates",
    title: "Remove List Duplicates",
    intro: "Removing duplicates means turning a list with repeated values into a list where each value appears once. The simplest way keeps the original order.",
    blocks: [
      {
        type: "para",
        text: "Lists often collect the same value twice: a list of names from a form, or numbers from a file. Before counting or showing the values, you usually want each one once. The list below has 2 and 1 twice. The goal is a list with 1, 2, 3 and 4, each appearing once. The dict.fromkeys function builds a dictionary from a list, and dictionaries cannot hold the same key twice. Turning the keys back into a list gives you the values in their first-seen order, with repeats removed. This is the best method for most cases because it keeps the order and works on any values that can be dictionary keys.",
      },
      { type: "heading", text: "Keep the order with dict.fromkeys" },
      {
        type: "code",
        title: "Removing duplicates, keeping order",
        code: `numbers = [1, 2, 2, 3, 1, 4]
unique = list(dict.fromkeys(numbers))
print(unique)`,
        output: "[1, 2, 3, 4]\n",
      },
      { type: "heading", text: "The set method" },
      {
        type: "para",
        text: "A set also holds each value once, so converting a list to a set and back to a list removes duplicates. The catch is that a set does not remember order, so the result can come back in any order. Use this method only when the order does not matter to you. The set method does not keep order. If the order matters, use dict.fromkeys or the loop method instead.",
      },
      {
        type: "code",
        title: "Removing duplicates with a set",
        code: `numbers = [1, 2, 2, 3, 1, 4]
unique = list(set(numbers))
print(sorted(unique))`,
        output: "[1, 2, 3, 4]\n",
      },
      { type: "heading", text: "Removing duplicates by hand" },
      {
        type: "para",
        text: "You can also build the result yourself with a loop: keep a new empty list, walk through the old list, and add each value only if it is not already in the new list. This is slower on long lists, but it shows clearly what is happening, and it is a good exercise for a beginner.",
      },
      {
        type: "code",
        title: "A loop that keeps only new values",
        code: `numbers = [1, 2, 2, 3, 1, 4]
unique = []
for n in numbers:
    if n not in unique:
        unique.append(n)
print(unique)`,
        output: "[1, 2, 3, 4]\n",
      },
    ],
    practice: [
      "Remove the duplicates from the list [5, 5, 3, 5, 3, 1] while keeping the order.",
      "Remove duplicates from a list of names, then print the names in alphabetical order.",
      "Count how many duplicates were in the original list by comparing the two lengths.",
    ],
    summary: [
      "dict.fromkeys removes duplicates and keeps the original order.",
      "set removes duplicates but does not keep the order.",
      "A loop with an if check is the clearest way to see how it works.",
      "Pick the method that matches whether order matters to you.",
    ],
  },
  {
    slug: "python-howto-reverse-string",
    title: "Reverse a String",
    intro: "Reversing a string means flipping its characters end to end, so hello becomes olleh. Python has a one-line way to do it with slicing.",
    blocks: [
      { type: "heading", text: "The slicing trick" },
      {
        type: "para",
        text: "A slice with a step of -1 walks through a string backwards. The slice [::-1] means start at the end, go to the start, stepping backwards by one. It returns a new string and leaves the original unchanged. This is the standard way to reverse a string in Python.",
      },
      {
        type: "code",
        title: "Reversing with a slice",
        code: `text = "hello"
print(text[::-1])

word = "Python"
print(word[::-1])`,
        output: "olleh\nnohtyP\n",
      },
      { type: "heading", text: "Reversing with a loop" },
      {
        type: "para",
        text: "You can also build the reversed string by hand. Start with an empty string, then walk through the original one character at a time, putting each new character in front of what you have so far. The first character ends up last, and the last character ends up first. This is slower than slicing, but it shows the idea clearly.",
      },
      {
        type: "code",
        title: "Reversing with a loop",
        code: `text = "hello"
reversed_text = ""
for ch in text:
    reversed_text = ch + reversed_text
print(reversed_text)`,
        output: "olleh\n",
      },
      { type: "heading", text: "Checking a palindrome" },
      {
        type: "para",
        text: "A palindrome is a word that reads the same forwards and backwards, like racecar. Reversing makes the check simple: a word is a palindrome when it equals its own reverse. The comparison below prints True because racecar reversed is still racecar.",
      },
      {
        type: "code",
        title: "Testing for a palindrome",
        code: `word = "racecar"
print(word == word[::-1])

word = "python"
print(word == word[::-1])`,
        output: "True\nFalse\n",
      },
      {
        type: "tip",
        text: "Strings cannot be changed in place in Python, so reversing always builds a new string. That is why [::-1] returns a value you need to store or print.",
      },
    ],
    practice: [
      "Reverse the string programming and print the result.",
      "Write a function is_palindrome that returns True for level and False for hello.",
      "Reverse each word in the sentence I love Python and print the sentence back.",
    ],
    summary: [
      "text[::-1] reverses a string in one step.",
      "A loop that adds each character to the front does the same job slowly.",
      "A word is a palindrome when it equals its own reverse.",
      "Reversing builds a new string; the original is unchanged.",
    ],
  },
  {
    slug: "python-howto-add-two-numbers",
    title: "Add Two Numbers",
    intro: "Adding two numbers is the first program most learners write. It shows how input, variables and the plus operator fit together.",
    blocks: [
      { type: "heading", text: "Adding two numbers in code" },
      {
        type: "para",
        text: "The plus operator adds two numbers and returns the result. Store the numbers in variables first, then add the variables. The example below adds 12 and 8. The answer is 20.",
      },
      {
        type: "code",
        title: "Adding two numbers",
        code: `a = 12
b = 8
total = a + b
print(total)`,
        output: "20\n",
      },
      { type: "heading", text: "Adding numbers typed by the user" },
      {
        type: "para",
        text: "A real program usually asks the user for the numbers. The input function reads what the user types, but it always returns a string. Adding two strings joins them instead of adding them, so convert each input to a number with int before you add. The example below uses the fixed values 15 and 27, the same values a user might type, and prints 42.",
      },
      {
        type: "code",
        title: "Adding two numbers from input",
        code: `a = int("15")
b = int("27")
print(a + b)`,
        output: "42\n",
      },
      { type: "heading", text: "Adding inside a function" },
      {
        type: "para",
        text: "Putting the addition inside a function lets you reuse it with any two numbers. The function takes two numbers, returns their sum, and the caller prints it. The example adds 7 and 5, then 100 and 23, using the same function twice.",
      },
      {
        type: "code",
        title: "A function that adds two numbers",
        code: `def add(a, b):
    return a + b

print(add(7, 5))
print(add(100, 23))`,
        output: "12\n123\n",
      },
      {
        type: "note",
        text: "input always returns a string. Convert it with int or float before you do maths, or 15 plus 27 will come out as the text 1527 instead of the number 42.",
      },
    ],
    practice: [
      "Write a program that adds 45 and 55 and prints the result.",
      "Ask the user for two numbers with input, convert them with int, and print their sum.",
      "Write a function add_three that returns the sum of three numbers.",
    ],
    summary: [
      "The plus operator adds two numbers.",
      "input returns a string, so convert it with int before adding.",
      "A function lets you reuse the same addition with any numbers.",
      "Adding two strings joins them; adding two numbers adds them.",
    ],
  },
  {
    slug: "python-examples",
    title: "Python Examples",
    intro: "This page is an index of example programs. Each example below is a small, complete program you can run, covering the ideas taught in this course.",
    blocks: [
      {
        type: "para",
        text: "An example is the fastest way to learn a new idea. Read the code, guess what it prints, then run it and check. Change one number or one word and run it again. That small change teaches you more than reading the same page twice. The examples below are grouped by topic, from the simplest to the harder ones. These two examples work with numbers. The first builds a list of squares with a list comprehension. The second adds the numbers from 1 to 100. Both are one or two lines, and both are patterns you will reuse in larger programs.",
      },
      { type: "heading", text: "Numbers and lists" },
      {
        type: "code",
        title: "Squares and a sum",
        code: `print([x ** 2 for x in range(1, 6)])
print(sum(range(1, 101)))`,
        output: "[1, 4, 9, 16, 25]\n5050\n",
      },
      { type: "heading", text: "Strings and words" },
      {
        type: "para",
        text: "The Counter class from the collections module counts how often each item appears. The example below splits a sentence into words and finds the most common word. Python appears twice, more than any other word. This example tests whether a number is prime. It returns False at once for numbers below 2, then tries dividing by every number up to the square root. If none divides evenly, the number is prime. The code prints True for 17 and False for 18. Do not just read an example. Type it out yourself, run it, then change one thing and run it again. Typing is what turns reading into skill.",
      },
      {
        type: "code",
        title: "Finding the most common word",
        code: `from collections import Counter

words = "python is fun and python is easy".split()
print(Counter(words).most_common(1))`,
        output: "[('python', 2)]\n",
      },
      {
        type: "code",
        title: "Testing for a prime number",
        code: `def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True

print(is_prime(17))
print(is_prime(18))`,
        output: "True\nFalse\n",
      },
      { type: "heading", text: "More examples on this site" },
      {
        type: "list",
        items: [
          "Python Exercises: short tasks with answers to test yourself.",
          "Python Quiz: multiple-choice questions with answers.",
          "Python Challenges: harder small problems with solutions.",
          "Python Practice Problems: a larger set of problems to work through.",
        ],
      },
    ],
    practice: [
      "Write a program that prints the first 8 Fibonacci numbers: 0, 1, 1, 2, 3, 5, 8, 13.",
      "Write a program that finds the largest number in the list [3, 7, 2, 9, 4].",
      "Write a program that counts the vowels in the word education.",
    ],
    summary: [
      "Examples are small, complete programs you can run and change.",
      "Guess the output before you run an example, then check.",
      "Changing one value and rerunning teaches you how the code works.",
      "The Exercises, Quiz and Challenges pages hold more examples.",
    ],
  },
  {
    slug: "python-videos",
    title: "Python Videos",
    intro: "This page links to the video lessons for this course. Each video teaches one topic, with the code written live on screen so you can follow along.",
    blocks: [
      {
        type: "para",
        text: "The video course follows the same order as the written tutorials on this site. It starts with installing Python and writing your first program, then moves through variables, strings, lists, loops, functions, classes, file handling and modules. Later videos cover the libraries in this course: NumPy, Pandas, SciPy and Django. Each video is short and covers one idea, so you can watch one, pause, and practise before the next. Watching alone does not teach programming. Watch a video once to see the idea, then open the editor and type the same code yourself. Pause whenever the teacher writes code, and try to finish the line before they do. If you get stuck, rewind ten seconds and watch again. The written tutorial for the same topic is on this site, so you can read the same idea in text whenever the video moves too fast.",
      },
      { type: "heading", text: "How to learn from a video" },
      {
        type: "list",
        items: [
          "Watch one video, then practise the idea in the editor before the next video.",
          "Type the code yourself instead of copying and pasting it.",
          "Pause the video and try to predict the next line of code.",
          "Read the written tutorial for the same topic when you need a slower explanation.",
        ],
      },
      { type: "heading", text: "A first program, as shown in the videos" },
      {
        type: "para",
        text: "The first video in the course writes a program that greets the user by name. The code below is the same program: it reads a name, builds a greeting, and prints it. The example uses the fixed name Asha, the same value a learner might type.",
      },
      {
        type: "code",
        title: "The first program from the videos",
        code: `name = "Asha"
print("Hello, " + name + "!")`,
        output: "Hello, Asha!\n",
      },
      { type: "heading", text: "Videos and written tutorials together" },
      {
        type: "para",
        text: "Videos are good for seeing code written step by step. Written tutorials are good for looking something up quickly and for copying an exact example. Use both: watch the video to understand an idea, and keep the written page open beside it as a reference. The study plan page on this site suggests which videos and topics to cover each week. This page describes the video lessons. The videos themselves open from the course player on this site. No video links are listed here, because the course player is the place to watch them.",
      },
      {
        type: "code",
        title: "A loop from the videos, with its output",
        code: `for i in range(1, 6):
    print(i * i)`,
        output: "1\n4\n9\n16\n25\n",
      },
    ],
    practice: [
      "Watch the video for one topic you already read, and type its code yourself.",
      "Write the greeting program above with your own name and run it.",
      "Pick a topic you find hard and read its written tutorial after watching its video.",
    ],
    summary: [
      "The video course follows the same order as the written tutorials.",
      "Each video covers one topic, with the code written live.",
      "Type the code yourself; watching alone does not teach programming.",
      "Use the written tutorial beside the video as a reference.",
    ],
  },
  {
    slug: "python-compiler",
    title: "Python Compiler",
    intro: "This site has a built-in code editor that runs Python in your browser. You can write code, run it, and see the output at once, without installing anything.",
    blocks: [
      {
        type: "para",
        text: "The editor on this site runs Python with Pyodide, which is Python compiled to WebAssembly. That means the Python code you write runs inside your browser, on your own computer, with no server involved. You can use it for every exercise and practice task on this site. It supports the Python standard library, including math, random, json and datetime. Type code in the editor and press Run. The output appears below the editor. The program below prints a greeting. Try it in the editor now, then change the name and run it again to see the output change.",
      },
      { type: "heading", text: "Running your first program" },
      {
        type: "code",
        title: "Your first run in the editor",
        code: `name = "Asha"
print("Hello, " + name)`,
        output: "Hello, Asha\n",
      },
      { type: "heading", text: "What the editor can and cannot do" },
      {
        type: "para",
        text: "The browser editor is made for learning, not for every kind of program. It runs code fast and keeps your work private, since nothing is sent to a server. But it cannot do everything a full Python install can. The list below is what to expect.",
      },
      {
        type: "list",
        items: [
          "It runs normal Python code: variables, loops, functions, classes and file work in memory.",
          "It loads many common packages, including NumPy and Pandas, from the Pyodide package list.",
          "It cannot read files from your computer directly, and it has no real /tmp folder shared with your system.",
          "It cannot run programs that need a window, a camera, or a long-running server.",
        ],
      },
      { type: "heading", text: "A longer program to try" },
      {
        type: "para",
        text: "The program below builds the first eight Fibonacci numbers and prints them as a list. It uses a loop and two variables that swap values each step. Paste it into the editor and run it, then change the 8 to a 12 and see how the list grows. When code in the editor fails, read the error message from the bottom up. The last line names the error, and the line above it names the line of your code that caused it.",
      },
      {
        type: "code",
        title: "Fibonacci numbers in the editor",
        code: `def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

print([fib(i) for i in range(8)])`,
        output: "[0, 1, 1, 2, 3, 5, 8, 13]\n",
      },
    ],
    practice: [
      "Open the editor and run a program that prints your name three times.",
      "Write a program in the editor that prints the squares of the numbers 1 to 10.",
      "Try importing math in the editor and print math.sqrt(144).",
    ],
    summary: [
      "The built-in editor runs Python in your browser with Pyodide.",
      "Nothing is installed and no code is sent to a server.",
      "It supports the standard library and common packages like NumPy.",
      "It cannot read your computer's files or run windowed programs.",
    ],
  },
  {
    slug: "python-exercises",
    title: "Python Exercises",
    intro: "Exercises are short tasks that test one idea at a time. Each exercise below has an answer, so you can check your work at once.",
    blocks: [
      {
        type: "para",
        text: "Try each exercise before you look at the answer. Write your code in the editor, run it, and compare your output with the answer. If your answer differs, read the code again and find the one line that is different. Getting an exercise wrong is useful: it shows you exactly which idea needs more work. Write a program that adds 15 and 27 and prints the result. The answer is one line of maths and one print. The expected output is 42.",
      },
      { type: "heading", text: "Exercise 1: add two numbers" },
      {
        type: "code",
        title: "Answer: adding two numbers",
        code: `print(15 + 27)`,
        output: "42\n",
      },
      { type: "heading", text: "Exercise 2: the largest number" },
      {
        type: "para",
        text: "Find the largest number in the list [3, 7, 2, 9, 4]. The max function does this in one call. You could also write a loop, but the built-in function is the shortest correct answer.",
      },
      {
        type: "code",
        title: "Answer: the largest number",
        code: `print(max([3, 7, 2, 9, 4]))`,
        output: "9\n",
      },
      { type: "heading", text: "Exercise 3: reverse a string" },
      {
        type: "para",
        text: "Reverse the string hello and print the result. The slice [::-1] walks through the string backwards and returns a new string. The expected output is olleh. Count how many words are in the sentence Python is fun to learn. The split method breaks a sentence into a list of words, and len counts the list. The sentence has five words. Do one exercise, check it, and fix it before moving to the next. Ten exercises done carefully teach more than fifty skimmed.",
      },
      {
        type: "code",
        title: "Answer: reversing a string",
        code: `print("hello"[::-1])`,
        output: "olleh\n",
      },
      {
        type: "code",
        title: "Answer: counting words",
        code: `sentence = "Python is fun to learn"
print(len(sentence.split()))`,
        output: "5\n",
      },
    ],
    practice: [
      "Write a program that prints the sum of the numbers from 1 to 50.",
      "Write a program that checks whether the word level is a palindrome.",
      "Write a program that removes the duplicates from the list [2, 2, 5, 5, 9].",
    ],
    summary: [
      "Exercises test one idea at a time, with an answer to check against.",
      "Try each exercise before you look at the answer.",
      "A wrong answer shows you exactly which idea needs more work.",
      "The Quiz and Challenges pages hold more tasks when these feel easy.",
    ],
  },
  {
    slug: "python-quiz",
    title: "Python Quiz",
    intro: "The quiz tests what you remember from this course with multiple-choice questions. This page explains how the quiz works and gives you sample questions with answers.",
    blocks: [
      {
        type: "para",
        text: "Each quiz question has four options and one correct answer. You pick an answer and the quiz tells you at once whether it was right. At the end you see your score and the questions you missed, so you know which topics to revise. The quiz covers the whole course, from variables to modules. Question: what is the type of the value 3.5 in Python? The options are int, float, str and bool. The answer is float, because 3.5 has a decimal point. An int has no decimal point, a str is text in quotes, and a bool is True or False.",
      },
      { type: "heading", text: "Sample question 1: data types" },
      {
        type: "code",
        title: "Checking the type in code",
        code: `print(type(3.5))`,
        output: "<class 'float'>\n",
      },
      { type: "heading", text: "Sample question 2: lists" },
      {
        type: "para",
        text: "Question: what does len([1, 2, 3]) return? The options are 2, 3, 4 and 6. The answer is 3, because the list holds three items. The len function counts the items in a list, a string or a dictionary.",
      },
      {
        type: "code",
        title: "Counting a list in code",
        code: `print(len([1, 2, 3]))`,
        output: "3\n",
      },
      { type: "heading", text: "Sample question 3: loops" },
      {
        type: "para",
        text: "Question: how many times does the loop for i in range(3) run? The options are 2, 3, 4 and 0. The answer is 3, because range(3) gives the values 0, 1 and 2. Range stops before the number you give it, so it gives three values, not four. Question: which keyword defines a function in Python? The options are func, def, function and define. The answer is def. You write def, then the function name, then brackets with any parameters, then a colon. When you miss a quiz question, do not just note the right answer. Open the tutorial for that topic and read it again, then write one small program that uses the idea.",
      },
      {
        type: "code",
        title: "What range(3) gives",
        code: `print(list(range(3)))`,
        output: "[0, 1, 2]\n",
      },
      {
        type: "code",
        title: "Defining a function with def",
        code: `def greet(name):
    return "Hello, " + name

print(greet("Asha"))`,
        output: "Hello, Asha\n",
      },
    ],
    practice: [
      "Answer the four sample questions above without looking at the answers, then check yourself.",
      "Write a quiz question of your own about dictionaries, with four options and one right answer.",
      "Take the full quiz on this site and revise every topic where you missed a question.",
    ],
    summary: [
      "The quiz asks multiple-choice questions with one correct answer each.",
      "It covers the whole course, from variables to modules.",
      "Your score shows which topics need more revision.",
      "A missed question means you should reread that topic and practise it.",
    ],
  },
  {
    slug: "python-challenges",
    title: "Python Challenges",
    intro: "Challenges are harder than exercises: small problems that take a few minutes and need you to combine two or three ideas. Each challenge below has a solution.",
    blocks: [
      {
        type: "para",
        text: "An exercise tests one idea. A challenge asks you to combine ideas: a loop and a condition, a function and a list, a dictionary and a file. There is often more than one correct solution. The solution shown here is one good answer, not the only answer. Try the challenge first, and only read the solution when you are stuck or finished. Print the numbers from 1 to 15. For multiples of 3, print Fizz instead of the number. For multiples of 5, print Buzz. For multiples of both 3 and 5, print FizzBuzz. The order of the checks matters: the check for both must come first, or the single checks will catch the number first. The solution prints 15 lines.",
      },
      { type: "heading", text: "Challenge 1: FizzBuzz" },
      {
        type: "code",
        title: "Solution: FizzBuzz to 15",
        code: `for i in range(1, 16):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)`,
        output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n",
      },
      { type: "heading", text: "Challenge 2: sum of even numbers" },
      {
        type: "para",
        text: "Add up all the even numbers from 1 to 20. The solution below keeps a running total and adds each number only when it is even. The even numbers from 1 to 20 add up to 110.",
      },
      {
        type: "code",
        title: "Solution: sum of evens to 20",
        code: `total = 0
for i in range(1, 21):
    if i % 2 == 0:
        total += i
print(total)`,
        output: "110\n",
      },
      { type: "heading", text: "Challenge 3: word count" },
      {
        type: "para",
        text: "Count how many times each word appears in a sentence. The solution splits the sentence into words, then uses a dictionary to count them. The word python appears twice, and every other word appears once. If a challenge feels too hard, break it into smaller steps and solve one step at a time. FizzBuzz is really four small steps: loop, check 15, check 3, check 5.",
      },
      {
        type: "code",
        title: "Solution: counting words",
        code: `sentence = "python is fun and python is easy"
counts = {}
for word in sentence.split():
    counts[word] = counts.get(word, 0) + 1
print(counts)`,
        output: "{'python': 2, 'is': 2, 'fun': 1, 'and': 1, 'easy': 1}\n",
      },
    ],
    practice: [
      "Write FizzBuzz for the numbers 1 to 30.",
      "Write a program that prints all the prime numbers from 1 to 30.",
      "Write a program that finds the longest word in the sentence The quick brown fox jumps.",
    ],
    summary: [
      "Challenges combine two or three ideas into one small problem.",
      "There is often more than one correct solution.",
      "Try the challenge first, then read the solution to compare.",
      "Breaking a challenge into small steps makes it easier.",
    ],
  },
  {
    slug: "python-practice",
    title: "Python Practice Problems",
    intro: "Practice problems are the way to turn reading into skill. This page gives you a set of problems with solutions, from easy to medium.",
    blocks: [
      {
        type: "para",
        text: "Reading a tutorial shows you an idea. Writing a program that uses the idea is what makes it stick. Practice problems sit between the two: they give you a clear goal and leave the code to you. Work through them in order, and do not skip the easy ones. The easy ones build the habits the hard ones depend on. Write a function that returns the factorial of a number: the product of all whole numbers from 1 up to that number. The factorial of 5 is 5 times 4 times 3 times 2 times 1, which is 120. The solution uses a loop and a running total that starts at 1.",
      },
      { type: "heading", text: "Problem 1: factorial" },
      {
        type: "code",
        title: "Solution: factorial of 5",
        code: `def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result

print(factorial(5))`,
        output: "120\n",
      },
      { type: "heading", text: "Problem 2: sum of digits" },
      {
        type: "para",
        text: "Add up the digits of the number 1234. The digits are 1, 2, 3 and 4, and they add up to 10. The solution turns the number into a string, walks through its characters, turns each back into a number, and adds them up.",
      },
      {
        type: "code",
        title: "Solution: sum of the digits of 1234",
        code: `number = 1234
total = 0
for ch in str(number):
    total += int(ch)
print(total)`,
        output: "10\n",
      },
      { type: "heading", text: "Problem 3: remove duplicates" },
      {
        type: "para",
        text: "Remove the duplicates from the list [1, 2, 2, 3, 1, 4] while keeping the order. The dict.fromkeys trick builds a dictionary from the list, which drops repeats, then turns the keys back into a list in their first-seen order. One problem a day beats ten problems in one sitting. Pick a problem, solve it, then change it slightly and solve it again. When these problems feel easy, move to the Challenges page, which has harder problems that combine more ideas. If you cannot solve a problem in fifteen minutes, read the solution, close it, and write it again from memory. That is still practice, and it still teaches.",
      },
      {
        type: "code",
        title: "Solution: removing duplicates",
        code: `numbers = [1, 2, 2, 3, 1, 4]
print(list(dict.fromkeys(numbers)))`,
        output: "[1, 2, 3, 4]\n",
      },
    ],
    practice: [
      "Write a function that returns the sum of all numbers from 1 to n.",
      "Write a program that counts the vowels in any word the user types.",
      "Write a program that prints the multiplication table of 7, from 7 times 1 to 7 times 10.",
    ],
    summary: [
      "Practice problems turn reading into skill.",
      "Work through them in order and do not skip the easy ones.",
      "One problem a day beats ten in one sitting.",
      "When these feel easy, move on to the Challenges page.",
    ],
  },
  {
    slug: "python-server",
    title: "Python Server",
    intro: "Running Python on a server means your Python code answers requests from the internet, instead of running once on your own computer. This is how websites and APIs work.",
    blocks: [
      {
        type: "para",
        text: "A program on your computer runs once and prints to your screen. A server program keeps running and waits. When a browser or an app sends it a request, it runs some code and sends back a response, usually a web page or some data. The same Python you already know powers the logic; the server part is just the waiting and answering. Python comes with a small web server in its standard library, so you need no extra package to try one. The code below starts a server on your own computer at port 8000. It serves the files in the folder where you run it. Open http://127.0.0.1:8000 in your browser while it runs, and you will see a listing of that folder.",
      },
      { type: "heading", text: "A minimal server with the standard library" },
      {
        type: "code",
        title: "Starting a simple file server",
        code: `python -m http.server 8000 --bind 127.0.0.1`,
        output: "Serving HTTP on 127.0.0.1 port 8000 (http://127.0.0.1:8000/) ...\n",
      },
      { type: "heading", text: "A server that runs your code" },
      {
        type: "para",
        text: "A file server only sends files. A real web app runs your code for each request. The example below is a tiny server written with the standard library. It answers every request with the text Hello from the server. When you run it, it prints a line saying it is serving, then waits. Press Ctrl and C to stop it. The servers on this page listen on 127.0.0.1, which means only your own computer can reach them. That is the safe way to learn. Opening a server to the whole internet needs care with security and is a separate topic.",
      },
      {
        type: "code",
        title: "A tiny server that answers Hello",
        code: `from http.server import BaseHTTPRequestHandler, HTTPServer

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"Hello from the server")

server = HTTPServer(("127.0.0.1", 8000), Handler)
print("Serving on http://127.0.0.1:8000")
server.serve_forever()`,
        output: "Serving on http://127.0.0.1:8000\n",
      },
      { type: "heading", text: "From a tiny server to a framework" },
      {
        type: "para",
        text: "The standard library server above is good for learning, but real sites use a framework. Flask is a small framework that makes routing and pages easy. Django is a large framework that adds a database, forms and an admin site. Both run the same idea: your Python code answers requests. Learn Flask first if you want the smallest step up from this page, and Django when you want everything included.",
      },
      {
        type: "list",
        items: [
          "http.server is built in and good for learning and serving files.",
          "Flask is a small framework for small sites and APIs.",
          "Django is a full framework for large sites with a database.",
          "A server keeps running and answers requests; a script runs once and ends.",
        ],
      },
    ],
    practice: [
      "Run python -m http.server 8000 --bind 127.0.0.1 in a folder and open http://127.0.0.1:8000 in your browser.",
      "Run the tiny Hello server above and open its address in your browser.",
      "Change the Hello server to answer with your name, then restart it and check the page.",
    ],
    summary: [
      "A server keeps running, waits for requests, and sends back responses.",
      "Python has a built-in file server: python -m http.server 8000.",
      "The http.server module lets you write a server that runs your own code.",
      "Flask and Django are the frameworks real sites use on top of this idea.",
    ],
  },
  {
    slug: "python-syllabus",
    title: "Python Syllabus",
    intro: "The syllabus is the full list of topics in this course, in the order you should learn them. Use it as a map: check off each topic as you finish it.",
    blocks: [
      { type: "heading", text: "Part 1 and 2: basics and control flow" },
      {
        type: "list",
        items: [
          "Python introduction, getting started, syntax and comments.",
          "Variables, data types, numbers, strings and booleans.",
          "Operators, if else, match, while loops and for loops.",
          "Functions, lambda, arrays, and scope.",
        ],
      },
      { type: "heading", text: "Part 3 and 4: data, files and modules" },
      {
        type: "list",
        items: [
          "Lists, tuples, sets, dictionaries, and string methods.",
          "File handling: reading, writing and deleting files.",
          "Modules, dates, math, JSON and regular expressions.",
          "Errors, exceptions, user input and string formatting.",
        ],
      },
      { type: "heading", text: "Part 5 and 6: objects and libraries" },
      {
        type: "list",
        items: [
          "Classes and objects, inheritance, iterators and polymorphism.",
          "NumPy, Pandas, SciPy and Django tutorials.",
          "Certificate exam preparation and the How To guides.",
          "Examples, exercises, quizzes, challenges and practice problems.",
        ],
      },
      { type: "heading", text: "A quick check of where you are" },
      {
        type: "para",
        text: "The course has six parts. The first part covers the basics: installing Python, writing your first program, and using variables and data types. The second part covers control flow: conditions, loops and functions. The third part covers data: lists, tuples, sets, dictionaries and strings. The fourth part covers files, modules and errors. The fifth part covers classes and objects. The sixth part covers the libraries: NumPy, Pandas, SciPy and Django. The code below is a small self-check. If you can read it and say what it prints before you run it, you have covered the basics. It builds a list of squares with a list comprehension and prints the largest one. Do not skip ahead to the libraries. NumPy and Pandas are much easier once lists, loops and functions feel natural.",
      },
      {
        type: "code",
        title: "A syllabus self-check",
        code: `squares = [x ** 2 for x in range(1, 6)]
print(squares)
print(max(squares))`,
        output: "[1, 4, 9, 16, 25]\n25\n",
      },
      {
        type: "code",
        title: "Checking your progress through the syllabus",
        code: `topics = ["Basics", "Control flow", "Data", "Files and modules", "Classes", "Libraries"]
done = ["Basics", "Control flow", "Data"]
for topic in topics:
    mark = "done" if topic in done else "to do"
    print(f"[{mark}] {topic}")
print(f"Progress: {len(done)}/{len(topics)} parts finished")`,
        output: "[done] Basics\n[done] Control flow\n[done] Data\n[to do] Files and modules\n[to do] Classes\n[to do] Libraries\nProgress: 3/6 parts finished\n",
      },
    ],
    practice: [
      "Read the whole syllabus and mark the topics you already know.",
      "Pick the first topic you have not marked and study it today.",
      "Write one small program for each topic in Part 1 before moving to Part 2.",
    ],
    summary: [
      "The course runs from basics, through data and files, to classes and libraries.",
      "Each part builds on the one before it, so learn in order.",
      "The syllabus is a checklist: mark each topic as you finish it.",
      "Finish the basics before moving to NumPy, Pandas or Django.",
    ],
  },
  {
    slug: "python-study-plan",
    title: "Python Study Plan",
    intro: "A study plan turns a long course into small weekly goals. This plan covers the whole course in eight weeks, with one hour of study a day.",
    blocks: [
      { type: "heading", text: "Weeks 1 to 4: basics, functions and data" },
      {
        type: "list",
        items: [
          "Week 1: install Python, write your first program, learn variables, numbers and strings.",
          "Week 2: learn operators, if else, while loops and for loops. Write ten small loop programs.",
          "Week 3: functions, lambda and scope. Write a small calculator with functions.",
          "Week 4: lists, tuples, sets and dictionaries. Build a phone book program with a dictionary.",
        ],
      },
      { type: "heading", text: "Weeks 5 and 6: files, modules and classes" },
      {
        type: "list",
        items: [
          "Week 5: file handling, modules, dates, JSON and error handling.",
          "Week 6: classes and objects, inheritance and iterators. Build a small bank account class.",
        ],
      },
      { type: "heading", text: "Weeks 7 and 8: libraries and revision" },
      {
        type: "list",
        items: [
          "Week 7: NumPy and Pandas. Load a CSV file and find its averages.",
          "Week 8: SciPy and Django basics, then the full quiz and the practice problems. Revise weak topics.",
        ],
      },
      { type: "heading", text: "The daily habit" },
      {
        type: "para",
        text: "The plan assumes one hour a day, five days a week. Each day has one topic to read and one small program to write. The weekend is for review: redo the exercises from the week and fix anything that still feels hard. If you miss a day, do not try to catch up by doubling the next day. Just continue from where you stopped. Every study day ends the same way: write one program without looking at the tutorial. The program below is the kind of daily check the plan uses. It adds the numbers from 1 to 100, and the answer is 5050. If you can write it from memory, the basics are sticking. Track your days, not your hours. A tick on the calendar for each day you studied keeps you going longer than counting minutes.",
      },
      {
        type: "code",
        title: "A daily check program",
        code: `print(sum(range(1, 101)))`,
        output: "5050\n",
      },
      {
        type: "code",
        title: "Looking up one week's plan",
        code: `plan = {
    1: "Install Python, first program, variables, numbers, strings",
    2: "Operators, if else, while loops, for loops",
    3: "Functions, lambda, scope, calculator project",
    4: "Lists, tuples, sets, dictionaries, phone book",
    5: "File handling, modules, dates, JSON, errors",
    6: "Classes, objects, inheritance, bank account class",
    7: "NumPy and Pandas, load a CSV and find averages",
    8: "SciPy and Django basics, quiz and practice problems",
}
week = 3
print(f"Week {week}: {plan[week]}")`,
        output: "Week 3: Functions, lambda, scope, calculator project\n",
      },
    ],
    practice: [
      "Write down which week of the plan you are on, and the topic for today.",
      "Do today's topic, then write one program from memory before you stop.",
      "At the end of the week, redo the exercises from that week without looking at the answers.",
    ],
    summary: [
      "The plan covers the course in eight weeks, one hour a day, five days a week.",
      "Each week has a clear topic and a small project to build.",
      "Weekends are for review, not for new topics.",
      "End each day by writing one program from memory.",
    ],
  },
  {
    slug: "python-interview-questions",
    title: "Python Interview Q&A",
    intro: "Interviewers ask a small set of Python questions again and again. This page covers the most common ones, with short answers and a code example for each.",
    blocks: [
      {
        type: "para",
        text: "Python is a high-level, interpreted programming language. High-level means it hides machine details and reads close to plain English. Interpreted means the code runs line by line without a separate compile step. It is used for web apps, data analysis, automation and machine learning. A list is mutable, which means you can change it after you make it: add, remove or replace items. A tuple is immutable, which means you cannot change it after you make it. Use a list when the data changes, and a tuple when the data should stay fixed, like coordinates or a record from a database.",
      },
      { type: "heading", text: "Question 2: list versus tuple" },
      {
        type: "code",
        title: "A list changes, a tuple does not",
        code: `numbers = [1, 2, 3]
numbers.append(4)
print(numbers)

point = (3, 4)
print(point)`,
        output: "[1, 2, 3, 4]\n(3, 4)\n",
      },
      { type: "heading", text: "Question 3: what is a dictionary?" },
      {
        type: "para",
        text: "A dictionary stores key and value pairs, like a phone book that maps names to numbers. Looking up a value by its key is fast, even in a large dictionary. Keys must be unique and unchangeable, while values can be anything.",
      },
      {
        type: "code",
        title: "A dictionary lookup",
        code: `phone_book = {"Asha": 98765, "Ravi": 87654}
print(phone_book["Asha"])`,
        output: "98765\n",
      },
      { type: "heading", text: "Question 4: what does the __init__ method do?" },
      {
        type: "para",
        text: "The __init__ method runs when you create an object from a class. It sets up the object, usually by storing the values you pass in. In the example below, creating a Dog stores its name, and the bark method uses that name. You use try and except. The code that might fail goes in the try block, and the code that runs when it fails goes in the except block. The example below tries to divide by zero, which raises an error, and the except block prints a friendly message instead of crashing. In an interview, answer in your own words first, then offer a short example. A one-line answer with no example sounds memorised; an example shows you can actually use the idea.",
      },
      {
        type: "code",
        title: "A class with __init__",
        code: `class Dog:
    def __init__(self, name):
        self.name = name

    def bark(self):
        return self.name + " says woof"

print(Dog("Tommy").bark())`,
        output: "Tommy says woof\n",
      },
      {
        type: "code",
        title: "Handling an error with try and except",
        code: `try:
    print(10 / 0)
except ZeroDivisionError:
    print("You cannot divide by zero")`,
        output: "You cannot divide by zero\n",
      },
    ],
    practice: [
      "Answer the five questions above out loud, in your own words, without reading.",
      "Explain the difference between a list and a tuple to a friend in under a minute.",
      "Write a class of your own with __init__ and one method, and explain what each part does.",
    ],
    summary: [
      "Python is a high-level, interpreted language used for web, data and automation.",
      "Lists can change; tuples cannot.",
      "A dictionary maps unique keys to values for fast lookups.",
      "__init__ sets up a new object; try and except handle errors.",
    ],
  },
  {
    slug: "python-training",
    title: "Python Training",
    intro: "Training is the full learning path this site offers: read a topic, try it in the editor, do the exercises, and finish with a small project. This page explains how the path fits together.",
    blocks: [
      { type: "heading", text: "The training path" },
      {
        type: "para",
        text: "This site teaches Python in four steps that repeat for every topic. First you read the tutorial, which explains one idea with examples. Then you try the idea in the built-in editor, which runs Python in your browser. Then you do the exercises and the quiz for that topic. Finally you use the idea in a small project. The path is the same from your first program to Django, only the ideas get bigger.",
      },
      { type: "heading", text: "Step 1: read and understand" },
      {
        type: "para",
        text: "Start with the tutorial for the topic. Read the explanation, then read the code examples and guess their output before you check it. The syllabus page lists every topic in order, and the study plan page spreads them across eight weeks. Do not skip the reading: the examples make sense only when you know what idea they show.",
      },
      { type: "heading", text: "Step 2: practise in the editor" },
      {
        type: "para",
        text: "Open the built-in editor and type the example yourself. Change one value and run it again. The program below is the kind of first step the training uses: a loop that prints the squares of the numbers 1 to 5. If you can change it to print cubes instead, you understood the loop.",
      },
      {
        type: "code",
        title: "A practice step in the editor",
        code: `for i in range(1, 6):
    print(i * i)`,
        output: "1\n4\n9\n16\n25\n",
      },
      {
        type: "para",
        text: "After the editor, do the exercises, the quiz and the challenges for the topic. The exercises test one idea at a time, the quiz tests what you remember, and the challenges ask you to combine ideas. If you miss a question, reread that tutorial and try again. The score matters less than the gaps it shows you. At the end of each part of the course, build something real with what you learned. A phone book uses dictionaries. A diary app uses file handling. A marks analyser uses Pandas. A project is the proof that the training worked, and it is also the thing you show to an employer or a teacher. Pick one project per part and finish it before moving on. Training works when it is regular. One hour a day, five days a week, beats a ten-hour session once a month.",
      },
      { type: "heading", text: "Step 4: build a project" },
      {
        type: "code",
        title: "A tiny project piece: a phone book",
        code: `phone_book = {"Asha": 98765, "Ravi": 87654}
phone_book["Meera"] = 76543
print(phone_book)`,
        output: "{'Asha': 98765, 'Ravi': 87654, 'Meera': 76543}\n",
      },
    ],
    practice: [
      "Pick one topic you have finished and do its exercises again without looking at the answers.",
      "Build a phone book program that adds a name, looks one up, and lists all names.",
      "Choose your project for the part of the course you are on, and write down its first three steps.",
    ],
    summary: [
      "Training on this site is read, practise, test, then build.",
      "The editor, exercises, quiz and challenges support every topic.",
      "Each part of the course ends with a small project.",
      "Regular short sessions work better than rare long ones.",
    ],
  },
];
