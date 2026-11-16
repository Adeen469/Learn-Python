import type { LessonTutorial } from "./types";

export const TUTORIALS: LessonTutorial[] = [
  {
    day: 1,
    title: "Introduction to Programming and Python",
    intro:
      "This lesson explains what programming is and why Python is a great first language. You will also write and run your first lines of Python.",
    blocks: [
      { type: "heading", text: "What is programming?" },
      {
        type: "para",
        text: "Programming means giving clear instructions to a computer so it can do a job for you. A computer follows instructions exactly, step by step, without guessing what you meant. A set of such instructions is called a program, and the language you use to write it is called a programming language. You already use programs every day. A music app plays songs, a calculator adds numbers, and a game reacts to your keys. Behind each of them is code written by a programmer. Learning to program means learning to break a job into small, clear steps that a computer can follow.",
      },
      { type: "heading", text: "Why start with Python?" },
      {
        type: "para",
        text: "Python is one of the easiest languages to read because its code looks close to plain English. It is also very powerful. People use Python to build websites, analyse data, automate boring tasks, and train artificial intelligence models. One language can take you from your first program to real, professional work.",
      },
      {
        type: "list",
        items: [
          "Python code is short and easy to read, so beginners can focus on ideas instead of symbols.",
          "Python is free and runs on Windows, Mac, and Linux.",
          "A huge community shares free libraries, answers, and tutorials.",
          "Python is used in web development, data science, automation, and artificial intelligence.",
        ],
      },
      { type: "heading", text: "Your first Python program" },
      {
        type: "para",
        text: "The print function shows text on the screen. Type the line below and run it. It is the traditional first program in almost every language, and it proves your setup works. Python can also do maths for you. The plus sign adds, the minus sign subtracts, and the star multiplies. Python prints the answer for each line, in order, from top to bottom.",
      },
      {
        type: "code",
        title: "Printing a greeting",
        code: `print("Hello, World!")`,
        output: "Hello, World!",
      },
      {
        type: "code",
        title: "Python as a calculator",
        code: `print(2 + 3)
print(10 - 4)
print(3 * 4)`,
        output: "5\n6\n12",
      },
      {
        type: "note",
        text: "Python runs your code from the top line to the bottom line. If a line has an error, the lines after it do not run, so always fix the first error shown.",
      },
    ],
    practice: [
      "Print your name and your favourite food on two separate lines.",
      "Use print to work out 7 times 8, 100 minus 37, and 25 divided by 5.",
      "Print a short sentence about why you want to learn Python.",
    ],
    summary: [
      "Programming means writing clear, step-by-step instructions for a computer.",
      "Python is easy to read and powerful enough for real professional work.",
      "The print function shows text or numbers on the screen.",
      "Python runs code from top to bottom, one line at a time.",
    ],
  },
  {
    day: 2,
    title: "The Power of Python",
    intro:
      "This lesson shows what Python can do with only a few lines of code. You will see how built-in tools and libraries let small programs solve big jobs.",
    blocks: [
      { type: "heading", text: "A few lines can do a lot" },
      {
        type: "para",
        text: "In some languages, adding up a list of numbers takes many lines of code. In Python, one built-in function does it. Python comes with many such ready-made tools, so you spend your time solving the problem instead of writing the same basic steps again and again. For example, sum adds a whole list, max finds the largest value, and sorted returns the list in order. You did not have to write a loop or compare the numbers yourself. Python already knows how, and you just ask for the result.",
      },
      {
        type: "code",
        title: "One line, big result",
        code: `numbers = [3, 1, 4, 1, 5]
print(sum(numbers))
print(max(numbers))
print(sorted(numbers))`,
        output: "14\n5\n[1, 1, 3, 4, 5]",
      },
      { type: "heading", text: "Where Python is used" },
      {
        type: "para",
        text: "Python is not a toy language for practice only. Large companies use it in production every day. The same language you are learning now powers parts of YouTube, Instagram, and Netflix, and it is the most common language in data science and artificial intelligence.",
      },
      {
        type: "list",
        items: [
          "Web development: sites and web apps, using frameworks like Django and Flask.",
          "Data science: analysing numbers and drawing charts with pandas and matplotlib.",
          "Artificial intelligence: building models with libraries like TensorFlow and PyTorch.",
          "Automation: renaming files, sending emails, and scraping web pages automatically.",
          "Games and apps: small games with pygame, and desktop apps with Tkinter.",
        ],
      },
      { type: "heading", text: "Libraries do the heavy work" },
      {
        type: "para",
        text: "A library is a collection of ready-made code written by other programmers. Instead of working out a square root or a factorial yourself, you import the math library and use its functions. Importing a library is like borrowing a toolbox instead of building every tool from scratch.",
      },
      {
        type: "code",
        title: "Borrowing the math library",
        code: `import math
print(math.sqrt(144))
print(math.factorial(6))
print(math.pi)`,
        output: "12.0\n720\n3.141592653589793",
      },
      {
        type: "note",
        text: "A library only helps if you know it exists. When you face a new job, search for a Python library for it first. There is usually one, and it will save you hours.",
      },
    ],
    practice: [
      "Make a list of your five favourite numbers and print its sum, smallest value, and sorted order.",
      "Import the math library and print the square root of 81 and the factorial of 4.",
      "Print a row of ten star characters using string multiplication.",
    ],
    summary: [
      "Python has built-in functions like sum, max, and sorted that do common jobs in one line.",
      "Libraries are ready-made collections of code you can import and reuse.",
      "Python is used for websites, data science, AI, automation, and games.",
      "When you face a new job, check for an existing library before writing everything yourself.",
    ],
  },
  {
    day: 3,
    title: "Modules and Pip",
    intro:
      "This lesson explains modules, the reusable files of Python code, and pip, the tool that installs new ones. You will import built-in modules and learn how to add modules written by other people.",
    blocks: [
      { type: "heading", text: "What is a module?" },
      {
        type: "para",
        text: "A module is a single file of Python code that holds useful functions and values. Python ships with many built-in modules, such as math for numbers and random for random values. Instead of writing those functions yourself, you import the module and use what it offers. The import statement loads a module into your program. After that, you use its tools with a dot, like math.pi for the value of pi. You can also import just one tool from a module, which keeps your code shorter.",
      },
      {
        type: "code",
        title: "Using the math module",
        code: `import math
print(math.pi)
print(math.floor(3.7))
print(math.ceil(3.2))`,
        output: "3.141592653589793\n3\n4",
      },
      {
        type: "code",
        title: "Importing one tool by name",
        code: `from math import sqrt
print(sqrt(25))
print(sqrt(2))`,
        output: "5.0\n1.4142135623730951",
      },
      { type: "heading", text: "Installing new modules with pip" },
      {
        type: "para",
        text: "Built-in modules cover a lot, but programmers around the world have written thousands more. These are called third-party packages, and pip is the tool that downloads and installs them. Pip comes with Python, and you run it from your terminal, not inside a Python program.",
      },
      {
        type: "list",
        items: [
          "pip install requests installs the requests package for fetching web pages.",
          "pip install pandas installs the pandas package for working with data tables.",
          "pip list shows every package already installed on your computer.",
          "pip uninstall requests removes a package you no longer need.",
        ],
      },
      {
        type: "para",
        text: "After pip installs a package, you import it in your code exactly like a built-in module. The calendar module is built in, so it needs no install. Here it checks whether a year is a leap year and finds how many days a month has.",
      },
      {
        type: "code",
        title: "Another built-in module: calendar",
        code: `import calendar
print(calendar.isleap(2024))
print(calendar.isleap(2025))
print(calendar.monthrange(2026, 11)[1])`,
        output: "True\nFalse\n30",
      },
      {
        type: "note",
        text: "pip install commands run in the terminal, not in a Python file. If you type pip install inside your code, Python will report a syntax error.",
      },
    ],
    practice: [
      "Import the math module and print the value of math.e and the cube root of 27 using math.pow(27, 1/3).",
      "Use the calendar module to check whether 2000 and 2100 are leap years.",
      "Run pip list in your terminal and find three packages you did not know were installed.",
    ],
    summary: [
      "A module is a file of reusable Python code, such as math or calendar.",
      "Use import to load a module, then call its tools with a dot.",
      "from math import sqrt imports one tool by name.",
      "pip installs third-party packages from the terminal.",
    ],
  },
  {
    day: 4,
    title: "Our First Python Program",
    intro:
      "This lesson walks through writing, saving, and running a real Python program from a file. You will learn how a program is put together and how to run it yourself.",
    blocks: [
      { type: "heading", text: "From one line to a program" },
      {
        type: "para",
        text: "So far you have run single lines of code. A real program is a file full of lines that run in order. You save the file with a .py ending, for example hello.py, and then ask Python to run it. Every line runs from top to bottom, and the output appears in the terminal.",
      },
      {
        type: "para",
        text: "Let us write a small program that introduces itself. It prints three lines: a greeting, a name, and a goal. There is nothing hidden here. Each print statement shows one line on the screen.",
      },
      {
        type: "code",
        title: "hello.py - a first program",
        code: `print("Hello, everyone!")
print("My name is Ada.")
print("I am learning Python.")`,
        output: "Hello, everyone!\nMy name is Ada.\nI am learning Python.",
      },
      { type: "heading", text: "How to run it" },
      {
        type: "para",
        text: "Open a terminal in the folder where you saved the file and type python hello.py, then press Enter. On some computers the command is python3 hello.py. Python reads the file, runs each line, and prints the output. If the file name is wrong, Python says it cannot open the file, so check the spelling and the folder.",
      },
      {
        type: "para",
        text: "The print function can also show more than one value at a time. When you pass several values separated by commas, print puts a space between them. You can mix text and numbers in the same line this way.",
      },
      {
        type: "code",
        title: "Printing several values at once",
        code: `print("2 + 3 =", 2 + 3)
print("Python", "is", "fun")
print("My age is", 17)`,
        output: "2 + 3 = 5\nPython is fun\nMy age is 17",
      },
      {
        type: "note",
        text: "Python 3 needs parentheses around print. Writing print \"Hello\" without them is old Python 2 style and gives a syntax error in Python 3.",
      },
      {
        type: "tip",
        text: "Save your practice programs with clear names like calculator.py or greeting.py. You will build on these files in later lessons, and a good name saves you from opening every file to find one.",
      },
    ],
    practice: [
      "Create a file called aboutme.py that prints your name, your city, and one hobby on three lines, then run it.",
      "Add a line that prints your age using a number, like print(\"My age is\", 17).",
      "Change one line in your file, save it, and run it again to see the new output.",
    ],
    summary: [
      "A Python program is a .py file whose lines run from top to bottom.",
      "Run a program from the terminal with python file.py.",
      "print can show several values at once, separated by spaces.",
      "Python 3 needs parentheses around print.",
    ],
  },
  {
    day: 5,
    title: "Comments, Escape Sequences and Print",
    intro:
      "This lesson teaches comments, which explain code to humans, and escape sequences, which put special characters inside strings. You will also learn the finer details of the print statement.",
    blocks: [
      { type: "heading", text: "Comments explain your code" },
      {
        type: "para",
        text: "A comment is a note for humans that Python ignores completely. Anything after a hash sign on a line is a comment. Comments do not change what the program does, but they help you and other people understand why the code is written that way. Good comments explain the reason behind a line, not just what it does. When you return to a program after a week, a good comment reminds you what you were thinking, and that saves you from reading every line again to work it out.",
      },
      {
        type: "code",
        title: "Comments are ignored by Python",
        code: `# This program greets the user
print("Hello!")  # print a greeting
# print("This line never runs")`,
        output: "Hello!",
      },
      { type: "heading", text: "Escape sequences inside strings" },
      {
        type: "para",
        text: "Some characters are hard to type inside a string. A new line, a tab, or a quote mark inside quotes all need a special trick. An escape sequence is a backslash followed by a letter, and Python turns it into the special character you want. A backslash tells Python that the next character is special, not ordinary text, so the string can hold characters that would otherwise end it or break it.",
      },
      {
        type: "list",
        items: [
          "Backslash n makes a new line inside a string.",
          "Backslash t makes a tab, a wider gap of spaces.",
          "Backslash backslash prints one real backslash.",
          "Backslash quote prints a quote mark inside a quoted string.",
        ],
      },
      {
        type: "code",
        title: "New line and tab",
        code: `print("Hello\\nWorld")
print("Name:\\tAda")`,
        output: "Hello\nWorld\nName:\tAda",
      },
      {
        type: "code",
        title: "Quotes inside a string",
        code: `print('She said, "Hello!"')
print("It's a nice day")`,
        output: "She said, \"Hello!\"\nIt's a nice day",
      },
      {
        type: "note",
        text: "A single backslash before a normal letter, like backslash q, is not a valid escape sequence. Python keeps the backslash and may warn you, so only use the escape sequences you actually need.",
      },
      {
        type: "tip",
        text: "When a string contains double quotes, wrap it in single quotes, and when it contains single quotes, wrap it in double quotes. That trick avoids most escaping problems.",
      },
    ],
    practice: [
      "Write a program with a comment at the top saying what it does, then print your name.",
      "Print two lines of a poem using one print statement and a new line escape sequence.",
      "Print the sentence: She said, \"Python is fun!\" using single quotes around the string.",
    ],
    summary: [
      "A comment starts with a hash sign and is ignored by Python.",
      "Escape sequences start with a backslash and create special characters.",
      "Backslash n makes a new line and backslash t makes a tab.",
      "Choose single or double quotes to avoid escaping quotes inside a string.",
    ],
  },
  {
    day: 6,
    title: "Variables and Data Types",
    intro:
      "This lesson introduces variables, named boxes that store values, and data types, the kinds of values Python understands. Almost every program you write will use both.",
    blocks: [
      { type: "heading", text: "What is a variable?" },
      {
        type: "para",
        text: "A variable is a name that stores a value so you can use it later. You create one with an equals sign, like age = 17. The name goes on the left and the value on the right. After that, writing age anywhere in the program means the value 17. If you assign a new value to the same name, the old value is replaced.",
      },
      {
        type: "code",
        title: "Creating and using variables",
        code: `name = "Ada"
age = 17
height = 5.6
is_student = True
print(name)
print(age)
print(height)
print(is_student)`,
        output: "Ada\n17\n5.6\nTrue",
      },
      { type: "heading", text: "The main data types" },
      {
        type: "para",
        text: "Every value in Python has a type, which tells Python what you can do with it. Numbers, text, and true-or-false values are different types, and Python treats them differently. The type function shows the type of any value.",
      },
      {
        type: "list",
        items: [
          "int is a whole number, like 17 or -4.",
          "float is a number with a decimal point, like 5.6 or 3.14.",
          "str is text inside quotes, like \"Ada\" or \"Hello\".",
          "bool is either True or False, used for yes-or-no facts.",
        ],
      },
      {
        type: "para",
        text: "Python figures out the type from the value itself, so you never declare a type when you create a variable. The same name can even hold a different type later, although good programs usually keep one name for one kind of value.",
      },
      {
        type: "code",
        title: "Checking types with type()",
        code: `print(type(10))
print(type(3.5))
print(type("Ada"))
print(type(True))`,
        output: "<class 'int'>\n<class 'float'>\n<class 'str'>\n<class 'bool'>",
      },
      {
        type: "note",
        text: "Variable names must start with a letter or an underscore, and they cannot contain spaces. Use clear names that say what the value is, such as total price, instead of a single letter, so your code reads like a sentence.",
      },
      {
        type: "tip",
        text: "Python is case sensitive, so age and Age are two different variables. Pick one style, usually lowercase with underscores, and use it everywhere.",
      },
    ],
    practice: [
      "Create variables for your name, your age, your height, and whether you like Python, then print all four.",
      "Use type() to print the type of 100, 9.99, \"hello\", and False.",
      "Change the value of one of your variables and print it again to see the new value.",
    ],
    summary: [
      "A variable is a name that stores a value for later use.",
      "The main types are int, float, str, and bool.",
      "type() shows the type of any value.",
      "Variable names start with a letter or underscore and contain no spaces.",
    ],
  },
  {
    day: 7,
    title: "Exercise 1: Calculator",
    intro:
      "This exercise asks you to build a simple calculator that adds, subtracts, multiplies, and divides two numbers. It uses everything you learned in the first six lessons.",
    blocks: [
      { type: "heading", text: "The problem" },
      {
        type: "para",
        text: "Write a program that works like a simple calculator. It should ask the user for two numbers and an operation, then show the answer. The user should be able to add, subtract, multiply, and divide. The program must show the result clearly, with a short message that says what the answer is.",
      },
      {
        type: "list",
        items: [
          "Ask the user to enter the first number.",
          "Ask the user to enter the second number.",
          "Ask the user to choose an operation: plus, minus, multiply, or divide.",
          "Work out the answer and print it, for example: Result: 15.",
          "If the user enters an operation you do not know, print a message saying it is invalid.",
        ],
      },
      { type: "heading", text: "How to approach it" },
      {
        type: "para",
        text: "Do not write the whole program in your head at once. Split it into small steps and solve one step at a time. First, get the two numbers from the user. Then get the operation. Then use if and elif statements to pick the right maths for the operation. Finally, print the result. Test each step before moving to the next one. Your program should also start by showing the user what it can do. A short menu makes the program friendly and tells the user which operations are available. Here is what that menu could look like when the program runs.",
      },
      {
        type: "code",
        title: "The menu your program should show",
        code: `print("Simple Calculator")
print("1. Add (+)")
print("2. Subtract (-)")
print("3. Multiply (*)")
print("4. Divide (/)")`,
        output: "Simple Calculator\n1. Add (+)\n2. Subtract (-)\n3. Multiply (*)\n4. Divide (/)",
      },
      {
        type: "para",
        text: "The maths itself is simple. Python already knows all four operations, so your job is to connect the right operation to the user's choice. As a quick check, here is what each operation gives for the numbers 12 and 4.",
      },
      {
        type: "code",
        title: "The four operations on 12 and 4",
        code: `print(12 + 4)
print(12 - 4)
print(12 * 4)
print(12 / 4)`,
        output: "16\n8\n48\n3.0",
      },
      {
        type: "note",
        text: "Remember that input always gives you a string, so convert the numbers with float or int before doing maths. Without that step, 10 plus 5 would join the text and give 105 instead of 15.",
      },
      {
        type: "tip",
        text: "Try the exercise yourself before reading the solution in the next lesson. Even a half-working attempt teaches more than reading a finished answer.",
      },
    ],
    practice: [
      "Write the calculator program yourself, using input, float, and if and elif statements.",
      "Test your calculator with 10 and 5 for all four operations and check the answers.",
      "Add a message for division by zero, so the program says it cannot divide instead of crashing.",
    ],
    summary: [
      "The calculator asks for two numbers and an operation, then prints the result.",
      "Split a big program into small steps and solve one step at a time.",
      "Use if and elif to pick the operation the user chose.",
      "Convert input to a number with float or int before doing maths.",
    ],
  },
  {
    day: 8,
    title: "Exercise 1: Calculator Solution",
    intro:
      "This lesson walks through the complete solution to the calculator exercise. You will see the full program, understand how each part works, and learn how to handle division by zero.",
    blocks: [
      { type: "heading", text: "The full solution" },
      {
        type: "para",
        text: "Here is the whole calculator program. It asks for two numbers, asks for an operation, and uses if and elif statements to choose the right calculation. The user typed 10, then 5, then the plus sign, and the program printed the result. Notice that the program asks its questions in a friendly order and labels the answer, so the user always knows what happened and why.",
      },
      {
        type: "code",
        title: "The complete calculator program",
        code: `num1 = float(input("Enter first number: "))
num2 = float(input("Enter second number: "))
op = input("Enter operation (+, -, *, /): ")
if op == "+":
    print("Result:", num1 + num2)
elif op == "-":
    print("Result:", num1 - num2)
elif op == "*":
    print("Result:", num1 * num2)
elif op == "/":
    print("Result:", num1 / num2)
else:
    print("Invalid operation")`,
        output: "Enter first number: 10\nEnter second number: 5\nEnter operation (+, -, *, /): +\nResult: 15.0",
      },
      { type: "heading", text: "How it works, step by step" },
      {
        type: "list",
        items: [
          "float(input(...)) reads the user's text and converts it to a decimal number.",
          "The op variable stores the operation the user typed, such as plus or star.",
          "Each if and elif checks one operation and runs only the matching calculation.",
          "The else at the end catches any operation the program does not know.",
          "print(\"Result:\", ...) shows the answer with a clear label.",
        ],
      },
      { type: "heading", text: "Handling division by zero" },
      {
        type: "para",
        text: "There is one problem with the first version. If the user divides by zero, Python stops with an error, because division by zero has no answer. A good program checks for that case before dividing and prints a friendly message instead of crashing. Checking before dividing is a habit worth building early, because a crash in the middle of a program loses everything the program had done so far.",
      },
      {
        type: "code",
        title: "Safe division with a zero check",
        code: `num1 = float(input("Enter first number: "))
num2 = float(input("Enter second number: "))
op = input("Enter operation (+, -, *, /): ")
if op == "/":
    if num2 == 0:
        print("Cannot divide by zero")
    else:
        print("Result:", num1 / num2)
elif op == "+":
    print("Result:", num1 + num2)
elif op == "-":
    print("Result:", num1 - num2)
elif op == "*":
    print("Result:", num1 * num2)
else:
    print("Invalid operation")`,
        output: "Enter first number: 10\nEnter second number: 0\nEnter operation (+, -, *, /): /\nCannot divide by zero",
      },
      {
        type: "note",
        text: "The result is 15.0, not 15, because float turns the inputs into decimal numbers. If you want whole-number answers, use int instead of float, but then the user cannot enter decimal numbers like 2.5.",
      },
      {
        type: "tip",
        text: "Test a program with strange inputs, not just easy ones. Try zero, negative numbers, and a wrong operation, and fix every crash you find.",
      },
    ],
    practice: [
      "Type the solution into a file called calculator.py and run it with 20 and 4 for each operation.",
      "Add the zero check to your own version if you have not already, and test dividing by zero.",
      "Add a fifth operation, the remainder operator %, so the calculator can also show 10 % 3.",
    ],
    summary: [
      "float(input(...)) reads a number from the user as a decimal value.",
      "if and elif choose one calculation based on the operation typed.",
      "The else branch handles operations the program does not know.",
      "Always check for division by zero before dividing.",
    ],
  },
  {
    day: 9,
    title: "Typecasting in Python",
    intro:
      "This lesson explains typecasting, which means converting a value from one type to another. You will learn the int, float, str, and bool functions and when each one is useful.",
    blocks: [
      { type: "heading", text: "What is typecasting?" },
      {
        type: "para",
        text: "Typecasting means changing a value from one type to another. For example, the text \"42\" and the number 42 look similar, but Python treats them very differently. You cannot add 8 to the text \"42\", but after converting it to a number with int, the addition works and gives 50.",
      },
      {
        type: "para",
        text: "Python gives you one function for each type. The int function makes a whole number, float makes a decimal number, str makes text, and bool makes a true-or-false value. You wrap the value you want to convert inside the function, like int(\"42\").",
      },
      {
        type: "code",
        title: "Converting between types",
        code: `print(int("42") + 8)
print(float("3.5") + 1)
print(str(100) + " points")
print(int(3.9))`,
        output: "50\n4.5\n100 points\n3",
      },
      { type: "heading", text: "What each conversion does" },
      {
        type: "para",
        text: "Converting a decimal number to int cuts off the part after the decimal point. It does not round the number. So int(3.9) gives 3, not 4. Converting a whole number to float adds .0, so float(7) gives 7.0. Converting a number to str makes text, which you can join with other text using plus.",
      },
      {
        type: "code",
        title: "More conversions, including bool",
        code: `print(float(7))
print(int(7.9))
print(bool(1))
print(bool(0))
print(bool(""))`,
        output: "7.0\n7\nTrue\nFalse\nFalse",
      },
      {
        type: "para",
        text: "The bool function follows a simple rule. Zero, empty text, and empty lists are False, and almost everything else is True. This rule is handy when you test whether a user typed anything at all, or whether a number is zero.",
      },
      {
        type: "note",
        text: "Not every conversion works. int(\"3.5\") fails with an error, because the text 3.5 is not a whole number. Convert it to float first, then to int, like int(float(\"3.5\")), which gives 3.",
      },
      {
        type: "tip",
        text: "The most common use of typecasting is with input. Since input always returns text, wrap it in int or float right away when you need a number.",
      },
    ],
    practice: [
      "Convert the string \"25\" to a number, add 5 to it, and print the answer.",
      "Ask the user for a decimal number, convert it to float, and print its double.",
      "Try int(\"hello\") and read the error message, then explain in your own words why it failed.",
    ],
    summary: [
      "Typecasting converts a value from one type to another.",
      "int makes whole numbers, float makes decimal numbers, and str makes text.",
      "Converting a float to int cuts off the decimal part without rounding.",
      "Zero and empty text become False, and almost everything else becomes True.",
    ],
  },
  {
    day: 10,
    title: "Taking User Input in Python",
    intro:
      "This lesson teaches the input function, which reads text typed by the user. With input, your programs stop being fixed scripts and start responding to the person using them.",
    blocks: [
      { type: "heading", text: "Reading text from the user" },
      {
        type: "para",
        text: "The input function shows a message, waits for the user to type something, and returns what was typed when the user presses Enter. The message inside the parentheses is called a prompt, and it tells the user what to type. The value you get back is always a string, even if the user typed digits. The program pauses at the input call and waits, so the user can take as long as they need to type an answer.",
      },
      {
        type: "code",
        title: "Asking for a name",
        code: `name = input("What is your name? ")
print("Hello, " + name + "!")`,
        output: "What is your name? Ada\nHello, Ada!",
      },
      { type: "heading", text: "Input always returns a string" },
      {
        type: "para",
        text: "If the user types 17, Python gives you the text \"17\", not the number 17. Adding 1 to that text would fail, because you cannot add a number to text. You must convert the input to a number first, using int or float, before doing any maths with it.",
      },
      {
        type: "code",
        title: "Converting input to a number",
        code: `age = int(input("Enter your age: "))
print("Next year you will be", age + 1)`,
        output: "Enter your age: 17\nNext year you will be 18",
      },
      {
        type: "para",
        text: "You can ask for several inputs in one program, one after another. Each input call waits for its own answer, so the program moves through the questions in order. Store each answer in its own variable so you can use them all at the end. Ask the questions in a sensible order, one at a time, and keep each prompt short so the user always knows what to type next.",
      },
      {
        type: "code",
        title: "Asking two questions",
        code: `first = input("Enter your first name: ")
last = input("Enter your last name: ")
print("Your full name is " + first + " " + last)`,
        output: "Enter your first name: Ada\nEnter your last name: Lovelace\nYour full name is Ada Lovelace",
      },
      {
        type: "note",
        text: "If the user types text where your program expects a number, int will fail with a ValueError and the program will stop. Later lessons show how to catch that error and ask again.",
      },
      {
        type: "tip",
        text: "End your prompt with a space after the question mark or colon, like \"Enter your age: \". The space keeps the user's typing from touching the prompt.",
      },
    ],
    practice: [
      "Ask the user for their favourite colour and print a sentence using it.",
      "Ask the user for two numbers, add them, and print the total.",
      "Ask the user for their birth year and print their age in the year 2030.",
    ],
    summary: [
      "input shows a prompt, waits for typing, and returns a string.",
      "Convert input to int or float before doing maths with it.",
      "You can call input several times to ask several questions.",
      "A prompt should end with a space so the typed answer looks neat.",
    ],
  },
  {
    day: 11,
    title: "Strings in Python",
    intro:
      "This lesson explains strings, the text values of Python. You will learn how to create them, measure them, join them, and pick out single characters.",
    blocks: [
      { type: "heading", text: "What is a string?" },
      {
        type: "para",
        text: "A string is a sequence of characters, such as letters, digits, spaces, and symbols. You create a string by writing text inside single or double quotes. Both kinds of quotes work the same way, so pick one style and use it most of the time. An empty pair of quotes makes an empty string with no characters at all. The len function counts how many characters a string has, including spaces. You can also join two strings with the plus sign, which glues the second string onto the end of the first. This is called concatenation, and it is how programs build sentences from pieces.",
      },
      {
        type: "code",
        title: "Length and joining",
        code: `name = "Python"
print(len(name))
print(name + " is fun")
print("Hello, " + "World!")`,
        output: "6\nPython is fun\nHello, World!",
      },
      { type: "heading", text: "Picking out single characters" },
      {
        type: "para",
        text: "Every character in a string has a position number, called an index. Counting starts at zero, so the first character is at index 0 and the second is at index 1. You can also count from the end with negative numbers, so index -1 is the last character and index -2 is the second last.",
      },
      {
        type: "code",
        title: "Indexing a string",
        code: `name = "Python"
print(name[0])
print(name[1])
print(name[-1])
print(name[-2])`,
        output: "P\ny\nn\no",
      },
      {
        type: "para",
        text: "The star operator repeats a string, so repeating the text ha three times gives hahaha, which is useful for drawing lines or patterns. You can also test whether one string contains another with the in keyword, which gives True or False.",
      },
      {
        type: "code",
        title: "Repeating and searching",
        code: `print("ha" * 3)
print("a" in "banana")
print("z" in "banana")
print("Python" == "Python")`,
        output: "hahaha\nTrue\nFalse\nTrue",
      },
      {
        type: "note",
        text: "Strings are immutable, which means you cannot change one character in place. Writing name[0] = \"J\" gives an error. To change a string, build a new one from pieces instead.",
      },
      {
        type: "tip",
        text: "Use f-strings to build sentences with values inside them, like f\"Hello, {name}\". They are easier to read than joining many pieces with plus.",
      },
    ],
    practice: [
      "Store your name in a variable and print its length and its first and last letters.",
      "Join your first and last name with a space and print the result.",
      "Check whether the letter e appears in your favourite food, using the in keyword.",
    ],
    summary: [
      "A string is text inside single or double quotes.",
      "len counts the characters in a string, including spaces.",
      "Indexes start at 0, and negative indexes count from the end.",
      "Plus joins strings, star repeats them, and in tests for a piece inside a string.",
    ],
  },
  {
    day: 12,
    title: "String Slicing and Operations",
    intro:
      "This lesson teaches slicing, which cuts out part of a string, and the common operations on strings. Slicing is how you take the first word, the last letters, or a reversed copy of any text.",
    blocks: [
      { type: "heading", text: "What is slicing?" },
      {
        type: "para",
        text: "Slicing takes a piece of a string using square brackets with a start and a stop, written as text[start:stop]. The slice starts at the start index and stops just before the stop index, so the character at the stop index is not included. This rule takes a little practice, but it makes slices easy to measure: the length of text[2:5] is always 3. You can leave out the start or the stop. Leaving out the start means from the beginning, and leaving out the stop means to the end. Leaving out both gives a copy of the whole string. These shortcuts keep slices short and readable.",
      },
      {
        type: "code",
        title: "Basic slices",
        code: `text = "Python Programming"
print(text[0:6])
print(text[7:])
print(text[:6])
print(text[-11:])`,
        output: "Python\nProgramming\nPython\nProgramming",
      },
      { type: "heading", text: "Steps and reversing" },
      {
        type: "para",
        text: "A slice can also take a third number, the step, written as text[start:stop:step]. A step of 2 takes every second character, and a step of -1 walks backwards through the string. The slice text[::-1] is a famous Python trick that reverses a whole string in one short expression.",
      },
      {
        type: "code",
        title: "Steps and a reversed string",
        code: `word = "Hello"
print(word[1:4])
print(word[::2])
print(word[::-1])
print(word[0] + word[-1])`,
        output: "ell\nHlo\nolleH\nHo",
      },
      {
        type: "para",
        text: "Strings support a few more useful operations. You can compare two strings with equals, check membership with in, and join or repeat them as you learned before. Combining these small tools lets you check, cut, and rebuild text in almost any way you need.",
      },
      {
        type: "code",
        title: "Comparing and searching strings",
        code: `print("apple" < "banana")
print("cat" == "Cat")
print("gram" in "Programming")
print(len("Python Programming"))`,
        output: "True\nFalse\nTrue\n18",
      },
      {
        type: "note",
        text: "String comparison follows alphabetical order, and capital letters come before small letters. That is why \"cat\" == \"Cat\" is False, and \"Zebra\" is smaller than \"apple\" in Python.",
      },
      {
        type: "tip",
        text: "When you are unsure about a slice, sketch the indexes on paper first. Write each character with its index number underneath, then read off the slice.",
      },
    ],
    practice: [
      "Take the string \"Hello, World!\" and slice out just the word \"World\".",
      "Reverse your name with a slice and print the result.",
      "Slice the first three and last three characters of \"Programming\" and print both pieces.",
    ],
    summary: [
      "A slice text[start:stop] starts at start and stops just before stop.",
      "Leaving out start or stop means from the beginning or to the end.",
      "A third number is the step, and [::-1] reverses a string.",
      "String comparison is alphabetical, with capital letters sorting first.",
    ],
  },
  {
    day: 13,
    title: "String Methods in Python",
    intro:
      "This lesson covers string methods, built-in tools that change, search, and split text. Methods are called with a dot after the string, and they are the fastest way to clean up real-world text.",
    blocks: [
      { type: "heading", text: "What is a method?" },
      {
        type: "para",
        text: "A method is a function that belongs to a value. You call it by writing the value, a dot, and the method name, like text.upper(). String methods cover the everyday jobs of text: changing case, removing spaces, replacing words, and splitting sentences into lists. The most used case methods are upper, lower, and title. Upper makes every letter capital, lower makes every letter small, and title capitalises the first letter of every word. These are handy when user input arrives in mixed case and you need one clean form to compare or store.",
      },
      {
        type: "code",
        title: "Changing case and cleaning spaces",
        code: `text = "  hello world  "
print(text.strip())
print(text.strip().upper())
print("hello world".title())
print("hello".replace("l", "L"))`,
        output: "hello world\nHELLO WORLD\nHello World\nheLLo",
      },
      { type: "heading", text: "Searching inside a string" },
      {
        type: "para",
        text: "The count method tells you how many times a piece appears in a string. The find method tells you where a piece first appears, giving its index, or -1 when the piece is not there. The startswith and endswith methods answer yes-or-no questions about how a string begins or ends.",
      },
      {
        type: "code",
        title: "Counting, finding, and testing",
        code: `print("banana".count("a"))
print("hello".find("l"))
print("hello".find("z"))
print("Python".startswith("Py"))
print("Python".endswith("on"))`,
        output: "3\n2\n-1\nTrue\nTrue",
      },
      { type: "heading", text: "Splitting and joining" },
      {
        type: "para",
        text: "The split method breaks a string into a list of pieces at a separator you choose, such as a comma or a space. The join method does the opposite: it glues a list of strings together with a separator between them. Together they are the standard way to move between one long string and a list of words.",
      },
      {
        type: "code",
        title: "Split a string, join a list",
        code: `print("apple,banana,cherry".split(","))
print("hello world".split())
print("-".join(["2026", "11", "16"]))
print(" ".join(["Python", "is", "fun"]))`,
        output: "['apple', 'banana', 'cherry']\n['hello', 'world']\n2026-11-16\nPython is fun",
      },
      {
        type: "note",
        text: "String methods return a new string and never change the original, because strings are immutable. You must store the result, like name = name.strip(), or the cleaned text is lost.",
      },
    ],
    practice: [
      "Take the string \"  PYTHON is FUN  \", strip it, and print it in lowercase.",
      "Split the sentence \"I love Python\" into words and print how many words it has.",
      "Replace every space in your name with a dash using replace, and print the result.",
    ],
    summary: [
      "A method is called with a dot after the string, like text.upper().",
      "strip removes spaces from both ends, and replace swaps one piece for another.",
      "count and find search inside a string, and startswith and endswith test its edges.",
      "split breaks a string into a list, and join glues a list into a string.",
    ],
  },
  {
    day: 14,
    title: "If Else Conditional Statements",
    intro:
      "This lesson teaches if and else statements, which let a program make decisions. With conditions, your code can take one path when something is true and a different path when it is false.",
    blocks: [
      { type: "heading", text: "Making decisions in code" },
      {
        type: "para",
        text: "A program often needs to choose between two actions. If a user is old enough, they can vote. If not, they cannot. The if statement tests a condition, which is an expression that is either True or False. When the condition is True, Python runs the indented lines under the if. When it is False, Python skips them.",
      },
      {
        type: "code",
        title: "A simple if else choice",
        code: `age = 18
if age >= 18:
    print("You can vote")
else:
    print("You cannot vote")`,
        output: "You can vote",
      },
      { type: "heading", text: "Comparison operators" },
      {
        type: "para",
        text: "Conditions are built with comparison operators. Two equals signs test whether values are equal, and a single equals sign is only for giving a value to a variable. Mixing them up is one of the most common beginner mistakes, so check your equals signs whenever a condition behaves strangely.",
      },
      {
        type: "list",
        items: [
          "Double equals (==) tests whether two values are equal.",
          "Not equals (!=) tests whether two values are different.",
          "Greater than (>) and less than (<) compare numbers.",
          "Greater than or equal (>=) and less than or equal (<=) include the boundary value.",
        ],
      },
      { type: "heading", text: "More than two choices with elif" },
      {
        type: "para",
        text: "When there are more than two possible outcomes, use elif, short for else if. Python checks each condition from top to bottom and runs the first block whose condition is True. Once one block runs, the rest are skipped, so the order of your conditions matters. In the grade example below, the conditions are checked from highest to lowest. Marks of 72 fail the first test, since 72 is not 90 or more, and pass the second test, since 72 is 60 or more. If the order were reversed, every mark above 40 would stop at the first test and always get Grade C.",
      },
      {
        type: "code",
        title: "Grading marks with elif",
        code: `marks = 72
if marks >= 90:
    print("Grade A")
elif marks >= 60:
    print("Grade B")
elif marks >= 40:
    print("Grade C")
else:
    print("Grade D")`,
        output: "Grade B",
      },
      {
        type: "note",
        text: "Indentation is not decoration in Python. The lines under an if must be indented by the same amount, usually four spaces. A line with the wrong indentation either fails or belongs to the wrong block.",
      },
    ],
    practice: [
      "Ask the user for their age and print whether they can vote.",
      "Ask the user for a number and print whether it is positive, negative, or zero.",
      "Write a program that prints \"Pass\" when marks are 40 or more and \"Fail\" otherwise.",
    ],
    summary: [
      "if runs a block only when its condition is True, and else runs when it is False.",
      "Use double equals (==) to compare values, not a single equals sign.",
      "elif adds extra choices, checked from top to bottom.",
      "Indentation groups the lines that belong to each if, elif, or else.",
    ],
  },
  {
    day: 15,
    title: "Exercise 2: Good Morning Sir",
    intro:
      "This exercise asks you to greet the user based on the time of day. You will use the datetime module to read the current hour and pick the right greeting with if and elif.",
    blocks: [
      { type: "heading", text: "The problem" },
      {
        type: "para",
        text: "Write a program that greets the user according to the time of day. In the morning it should say Good Morning, Sir. In the afternoon it should say Good Afternoon, Sir. In the evening it should say Good Evening, Sir. The program must look at the real time on the computer, not a fixed value you typed in.",
      },
      {
        type: "list",
        items: [
          "Get the current time from the computer using the datetime module.",
          "Read the hour from the current time, as a number from 0 to 23.",
          "If the hour is before 12, print Good Morning, Sir.",
          "If the hour is from 12 to 16, print Good Afternoon, Sir.",
          "If the hour is 17 or later, print Good Evening, Sir.",
        ],
      },
      { type: "heading", text: "Reading the current hour" },
      {
        type: "para",
        text: "The datetime module gives you the current date and time. The now function returns the current moment, and its hour attribute is the hour in 24-hour form, from 0 at midnight to 23 at 11 at night. That one number is all you need to choose the greeting. The example below uses a fixed date and time, the 16th of November 2026 at half past nine in the morning, so the output is always Good Morning, Sir. A fixed time is useful for testing, because you can change the hour and check every greeting without waiting for the real time of day to change.",
      },
      {
        type: "code",
        title: "The solution with a fixed time for testing",
        code: `import datetime
hour = datetime.datetime(2026, 11, 16, 9, 30).hour
if hour < 12:
    print("Good Morning, Sir")
elif hour < 17:
    print("Good Afternoon, Sir")
else:
    print("Good Evening, Sir")`,
        output: "Good Morning, Sir",
      },
      { type: "heading", text: "The real program with the live time" },
      {
        type: "para",
        text: "For the real program, replace the fixed time with datetime.datetime.now(). Everything else stays the same. The program reads the hour from the live clock, so it greets you correctly whenever you run it. The sample output below shows a morning run.",
      },
      {
        type: "code",
        title: "The complete solution with the live clock",
        code: `import datetime
now = datetime.datetime.now()
hour = now.hour
if hour < 12:
    print("Good Morning, Sir")
elif hour < 17:
    print("Good Afternoon, Sir")
else:
    print("Good Evening, Sir")`,
        output: "Good Morning, Sir",
      },
      {
        type: "note",
        text: "The hour uses the 24-hour clock, so 3 in the afternoon is hour 15 and 9 at night is hour 21. The greeting ranges are 0 to 11 for morning, 12 to 16 for afternoon, and 17 to 23 for evening.",
      },
    ],
    practice: [
      "Run the live-time version of the program and check that its greeting matches the time on your clock.",
      "Change the ranges so the evening greeting starts at 18 instead of 17.",
      "Add a fourth greeting, Good Night, Sir, for hours from 22 onwards.",
    ],
    summary: [
      "datetime.datetime.now() gives the current date and time.",
      "The hour attribute is a number from 0 to 23 on the 24-hour clock.",
      "if and elif choose the greeting from the hour.",
      "Use a fixed time while testing so you can check every branch.",
    ],
  },
  {
    day: 16,
    title: "Match Case Statements",
    intro:
      "This lesson teaches the match case statement, a clean way to choose between many values. It works like a row of if and elif checks, but it is shorter and easier to read when one value has many possible outcomes.",
    blocks: [
      { type: "heading", text: "What is match case?" },
      {
        type: "para",
        text: "The match statement compares one value against several patterns, called cases. Python runs the block of the first case that matches the value. It is like a switch in other languages. Match case was added in Python 3.10, so it needs a modern version of Python to run. The last case uses an underscore, which matches anything. It works like the else in an if statement and catches every value that did not match an earlier case. Without it, a value with no matching case would simply do nothing, which is usually a mistake.",
      },
      {
        type: "code",
        title: "Matching a day number to a name",
        code: `day = 3
match day:
    case 1:
        print("Monday")
    case 2:
        print("Tuesday")
    case 3:
        print("Wednesday")
    case _:
        print("Invalid day")`,
        output: "Wednesday",
      },
      { type: "heading", text: "Match case in a calculator" },
      {
        type: "para",
        text: "Match case is a natural fit for the calculator from Days 7 and 8. Each operation is one case, and the underscore case handles unknown operations. Compare this version with the if and elif version and notice how much shorter and clearer it is.",
      },
      {
        type: "code",
        title: "Calculator with match case",
        code: `op = "*"
a = 6
b = 7
match op:
    case "+":
        print(a + b)
    case "-":
        print(a - b)
    case "*":
        print(a * b)
    case "/":
        print(a / b)
    case _:
        print("Unknown operation")`,
        output: "42",
      },
      {
        type: "para",
        text: "A case can also match more than one value with a vertical bar, which means or. Writing case 1 | 2 means the case matches when the value is 1 or 2. This is useful for grouping values that should do the same thing, such as weekend days or vowels.",
      },
      {
        type: "code",
        title: "One case matching several values",
        code: `letter = "a"
match letter:
    case "a" | "e" | "i" | "o" | "u":
        print("Vowel")
    case _:
        print("Consonant")`,
        output: "Vowel",
      },
      {
        type: "note",
        text: "Match case needs Python 3.10 or newer. On an older version, the same code fails with a syntax error, so use if and elif when you are not sure which version will run your program.",
      },
      {
        type: "tip",
        text: "Use match case when one value has many possible outcomes, and if and elif when the conditions are ranges or different kinds of tests. Pick the form that reads more clearly.",
      },
    ],
    practice: [
      "Write a match case program that prints the name of a month from its number, 1 to 12.",
      "Rewrite the calculator exercise using match case instead of if and elif.",
      "Write a match case that prints \"Weekend\" for Saturday and Sunday and \"Weekday\" for other days.",
    ],
    summary: [
      "match compares one value against several cases and runs the first match.",
      "The underscore case matches anything, like else in an if statement.",
      "A vertical bar in a case means or, so one case can match several values.",
      "Match case needs Python 3.10 or newer.",
    ],
  },
  {
    day: 17,
    title: "For Loops in Python",
    intro:
      "This lesson teaches for loops, which repeat a block of code once for each item in a sequence. Loops turn boring repetition into a few lines, and they are the heart of almost every program.",
    blocks: [
      { type: "heading", text: "What is a for loop?" },
      {
        type: "para",
        text: "A for loop walks through a sequence, such as a list, a string, or a range of numbers, and runs its block once for each item. The loop variable takes each item in turn, so inside the block you can use the current item. When the items run out, the loop ends and the program moves on. The range function makes a sequence of numbers. Range(1, 6) gives the numbers 1 to 5, because the stop value is not included. This is the same stop rule as slicing. Range can also take a step, so range(0, 10, 2) gives 0, 2, 4, 6, and 8.",
      },
      {
        type: "code",
        title: "Looping over numbers and letters",
        code: `for i in range(1, 6):
    print(i)
for ch in "Hi":
    print(ch)`,
        output: "1\n2\n3\n4\n5\nH\ni",
      },
      { type: "heading", text: "Looping over a list" },
      {
        type: "para",
        text: "Loops are most useful with lists. Instead of writing one print line per fruit, you write one loop that prints each fruit in turn. If the list grows to a hundred items, the loop still needs only two lines of code, while the manual version would need a hundred.",
      },
      {
        type: "code",
        title: "Printing every item in a list",
        code: `fruits = ["apple", "banana", "mango"]
for fruit in fruits:
    print(fruit)`,
        output: "apple\nbanana\nmango",
      },
      {
        type: "para",
        text: "A loop can also build up a result, such as a total. Start a variable at zero before the loop, add each item to it inside the loop, and print the result after the loop ends. The print must be outside the loop, at the same indentation as the for line, or it will print after every step instead of once at the end.",
      },
      {
        type: "code",
        title: "Adding numbers with a loop",
        code: `total = 0
for n in range(1, 6):
    total = total + n
print("Total:", total)`,
        output: "Total: 15",
      },
      {
        type: "note",
        text: "The loop variable keeps its last value after the loop ends. After for fruit in fruits, the name fruit still holds \"mango\", so do not reuse that name for something else right after the loop.",
      },
      {
        type: "tip",
        text: "Give the loop variable a name that says what one item is, like fruit for a list of fruits or number for a range of numbers. Clear names make loops much easier to read.",
      },
    ],
    practice: [
      "Use a for loop to print the numbers from 1 to 10, one per line.",
      "Make a list of five animals and print each one with a loop.",
      "Use a loop to add the numbers from 1 to 100 and print the total.",
    ],
    summary: [
      "A for loop runs its block once for each item in a sequence.",
      "range(1, 6) gives the numbers 1 to 5, because the stop is excluded.",
      "Loops over lists keep code short no matter how long the list grows.",
      "Build up results like totals by updating a variable inside the loop.",
    ],
  },
  {
    day: 18,
    title: "While Loops in Python",
    intro:
      "This lesson teaches while loops, which repeat a block as long as a condition stays true. Use them when you do not know in advance how many times the loop must run.",
    blocks: [
      { type: "heading", text: "What is a while loop?" },
      {
        type: "para",
        text: "A while loop checks a condition before each round. If the condition is True, it runs the block, then checks again. If the condition is False, it stops and the program moves on. Unlike a for loop, a while loop does not walk through a list. It simply repeats until something changes.",
      },
      {
        type: "code",
        title: "Counting with a while loop",
        code: `count = 1
while count <= 5:
    print(count)
    count = count + 1`,
        output: "1\n2\n3\n4\n5",
      },
      {
        type: "para",
        text: "The counter line inside the loop is the most important part. It changes the value the condition tests, so the loop can eventually stop. Without it, count would stay 1 forever, the condition would always be True, and the program would print 1 forever. That is called an infinite loop.",
      },
      { type: "heading", text: "When to use while instead of for" },
      {
        type: "para",
        text: "Use a for loop when you know the items in advance, like the numbers 1 to 10 or the fruits in a list. Use a while loop when the number of rounds depends on something that happens during the loop, like a user typing the right password or a total reaching a target. The example below adds numbers until the total passes a limit, and nobody knows in advance how many rounds that takes.",
      },
      {
        type: "code",
        title: "Adding until a target is reached",
        code: `total = 0
num = 1
while total < 20:
    total = total + num
    num = num + 1
print("Total:", total)`,
        output: "Total: 21",
      },
      {
        type: "para",
        text: "Walk through the second example slowly. The loop adds 1, then 2, then 3, and so on. After adding 6, the total is 21, which is no longer less than 20, so the loop stops. The final total is 21, not 20, because the loop only checks the condition before each round, not during it.",
      },
      {
        type: "note",
        text: "Every while loop needs a way to stop. Before you run one, ask yourself what changes inside the loop that will make the condition False. If nothing changes, the loop will never end.",
      },
      {
        type: "tip",
        text: "If a while loop seems stuck, press Ctrl and C together in the terminal to stop it. Then read the loop and find the line that should change the condition.",
      },
    ],
    practice: [
      "Use a while loop to print the numbers from 10 down to 1.",
      "Use a while loop to add the numbers 1, 2, 3, and so on until the total is more than 50, then print the total.",
      "Write a loop that keeps asking the user for a number until they type 0.",
    ],
    summary: [
      "A while loop repeats its block as long as its condition is True.",
      "Something inside the loop must change the condition, or it never stops.",
      "Use for when you know the items, and while when the rounds depend on what happens.",
      "Press Ctrl and C to stop a loop that runs forever.",
    ],
  },
  {
    day: 19,
    title: "break and continue in Python",
    intro:
      "This lesson teaches break and continue, two statements that control a loop from inside. Break stops a loop early, and continue skips the rest of the current round and moves to the next one.",
    blocks: [
      { type: "heading", text: "Stopping a loop with break" },
      {
        type: "para",
        text: "The break statement ends a loop at once, even if the loop still has items left. It is used when you have found what you were looking for and there is no reason to keep going. For example, when searching a list for a number, you can stop the moment you find it instead of checking the rest. The loop below was set to print the numbers 1 to 10, but it stops at 6. When i becomes 6, the break runs before the print, so 6 itself is never printed. The program then continues with whatever comes after the loop.",
      },
      {
        type: "code",
        title: "Breaking out of a loop",
        code: `for i in range(1, 11):
    if i == 6:
        break
    print(i)`,
        output: "1\n2\n3\n4\n5",
      },
      { type: "heading", text: "Skipping a round with continue" },
      {
        type: "para",
        text: "The continue statement skips the rest of the current round and jumps back to the top of the loop for the next item. The loop itself keeps running. It is useful when some items need no work, such as even numbers in a list where you only care about the odd ones. The percent sign is the remainder operator, so i % 2 is 0 for even numbers and 1 for odd numbers. When the number is even, continue skips the print and moves to the next number. When it is odd, the print runs as normal.",
      },
      {
        type: "code",
        title: "Skipping even numbers",
        code: `for i in range(1, 11):
    if i % 2 == 0:
        continue
    print(i)`,
        output: "1\n3\n5\n7\n9",
      },
      { type: "heading", text: "Break and continue in while loops" },
      {
        type: "para",
        text: "Both statements work in while loops too, but continue needs extra care there. In a while loop, the line that changes the counter usually sits at the bottom of the block. If continue skips that line, the counter never changes and the loop runs forever. Always update the counter before the continue, or place it at the top of the block.",
      },
      {
        type: "code",
        title: "Break in a while loop search",
        code: `num = 1
while True:
    if num * num == 36:
        break
    num = num + 1
print("Square root of 36 is", num)`,
        output: "Square root of 36 is 6",
      },
      {
        type: "note",
        text: "A while True loop runs forever unless a break stops it. That pattern is normal when the stopping rule is checked inside the loop, but make sure every path through the loop can reach a break.",
      },
    ],
    practice: [
      "Write a loop from 1 to 20 that stops with break when it reaches 13.",
      "Write a loop from 1 to 20 that prints only the numbers that are not divisible by 3, using continue.",
      "Write a while True loop that asks for a password and breaks only when the user types the right one.",
    ],
    summary: [
      "break ends a loop at once, even when items remain.",
      "continue skips the rest of the current round and moves to the next item.",
      "The percent operator gives the remainder and is handy for testing even and odd numbers.",
      "In a while loop, update the counter before continue, or the loop never ends.",
    ],
  },
];
