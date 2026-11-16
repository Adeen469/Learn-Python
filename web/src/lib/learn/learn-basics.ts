import type { LearnTutorial } from "./types";

export const TUTORIALS: LearnTutorial[] = [
  {
    slug: "python-home",
    title: "Python HOME",
    intro:
      "Welcome to the Python tutorial. This page is the starting point for learning Python from the very beginning, one small topic at a time.",
    blocks: [
      { type: "heading", text: "What you will learn here" },
      {
        type: "para",
        text: "This tutorial takes you from your first line of Python to real programs. You will learn variables, numbers, text, lists, dictionaries, conditions, and loops. Each topic is short, with examples you can run and small tasks you can try yourself.",
      },
      {
        type: "list",
        items: [
          "Start with the basics: printing text, variables, and data types.",
          "Learn to work with strings, lists, tuples, sets, and dictionaries.",
          "Make decisions with if statements and repeat work with loops.",
          "Practise every topic with short exercises and code challenges.",
        ],
      },
      { type: "heading", text: "How to use this tutorial" },
      {
        type: "para",
        text: "Follow the topics in order using the sidebar. Read the short explanation, run the example code, and then try the practice tasks at the end of each page. Typing the code yourself teaches far more than only reading it.",
      },
      {
        type: "code",
        title: "Your first taste of Python",
        code: `print("Hello, World!")
print(2 + 3)`,
        output: "Hello, World!\n5",
      },
      {
        type: "para",
        text: "The two lines above are a complete Python program. The first line prints a greeting, and the second line adds two numbers and prints the answer. You do not need to install anything special to try Python: the editor on this site can run the examples.",
      },
      {
        type: "code",
        title: "Python reads like plain English",
        code: `name = "Ada"
print("Hello,", name)`,
        output: "Hello, Ada",
      },
      {
        type: "note",
        text: "You do not need any earlier programming experience. Every topic starts from zero and builds on the ones before it.",
      },
      {
        type: "tip",
        text: "Keep a folder of your own practice files as you go. When you finish a topic, save one small program that uses what you just learned.",
      },
    ],
    practice: [
      "Run the two example programs above and check that your output matches.",
      "Change the greeting to print your own name.",
      "Use print to work out 7 times 8 and 100 minus 37.",
    ],
    summary: [
      "This tutorial teaches Python from the very beginning, one topic at a time.",
      "Follow the sidebar in order, run the examples, and try the practice tasks.",
      "print shows text and numbers on the screen.",
      "Typing the code yourself is the fastest way to learn.",
    ],
  },
  {
    slug: "python-intro",
    title: "Python Intro",
    intro:
      "Python is a programming language that is easy to read and powerful enough for real work. This page explains what Python is and where it is used.",
    blocks: [
      { type: "heading", text: "What is Python?" },
      {
        type: "para",
        text: "Python is a programming language created by Guido van Rossum and first released in 1991. It is designed to be easy to read, so its code looks close to plain English. Python is free to use, and it runs on Windows, Mac, and Linux.",
      },
      { type: "heading", text: "What can you build with Python?" },
      {
        type: "para",
        text: "Python is used for websites, data analysis, automation, games, and artificial intelligence. Large companies use Python in production every day, and it is the most common language in data science.",
      },
      {
        type: "list",
        items: [
          "Web development: sites and web apps with frameworks like Django and Flask.",
          "Data science: analysing numbers and drawing charts with pandas and matplotlib.",
          "Artificial intelligence: building models with libraries like TensorFlow and PyTorch.",
          "Automation: renaming files, sending emails, and doing repetitive jobs automatically.",
        ],
      },
      {
        type: "code",
        title: "Python is short and clear",
        code: `numbers = [3, 1, 4, 1, 5]
print(sum(numbers))
print(max(numbers))
print(sorted(numbers))`,
        output: "14\n5\n[1, 1, 3, 4, 5]",
      },
      { type: "heading", text: "Why Python is a good first language" },
      {
        type: "para",
        text: "In some languages, adding up a list of numbers takes many lines of code. In Python, one built-in function does it. Python comes with many ready-made tools, so you spend your time solving the problem instead of writing the same basic steps again and again.",
      },
      {
        type: "code",
        title: "Borrowing the math library",
        code: `import math
print(math.sqrt(144))
print(math.pi)`,
        output: "12.0\n3.141592653589793",
      },
      {
        type: "note",
        text: "A library is a collection of ready-made code written by other programmers. Importing a library is like borrowing a toolbox instead of building every tool from scratch.",
      },
    ],
    practice: [
      "Make a list of your five favourite numbers and print its sum and its largest value.",
      "Import the math module and print the square root of 81.",
      "Write one sentence about what you would like to build with Python.",
    ],
    summary: [
      "Python is a free, easy-to-read programming language first released in 1991.",
      "It is used for websites, data science, AI, automation, and games.",
      "Built-in functions like sum and max do common jobs in one line.",
      "Libraries give you ready-made tools you can import and reuse.",
    ],
  },
  {
    slug: "python-getstarted",
    title: "Python Get Started",
    intro:
      "This page shows you how to get Python running and how to write and run your first program. You only need a computer and a few minutes.",
    blocks: [
      { type: "heading", text: "Installing Python" },
      {
        type: "para",
        text: "Many computers already have Python installed. To check, open a terminal and type python3 --version. If you see a version number like Python 3.12.3, Python is ready. If not, download it from python.org and run the installer. During installation on Windows, tick the box that says Add Python to PATH.",
      },
      { type: "heading", text: "Running Python line by line" },
      {
        type: "para",
        text: "Type python3 in the terminal to open the interactive prompt. You can type one line at a time and see the answer at once. Type exit() to leave. This is handy for quick tests.",
      },
      {
        type: "code",
        title: "Trying lines in the prompt",
        code: `print("Hello, World!")
print(2 + 3)`,
        output: "Hello, World!\n5",
      },
      { type: "heading", text: "Running a Python file" },
      {
        type: "para",
        text: "Real programs live in files ending in .py. Write your code in a file called hello.py, then run it from the terminal with python3 hello.py. Python reads the file from top to bottom and runs each line in order.",
      },
      {
        type: "code",
        title: "hello.py",
        code: `print("Hello, everyone!")
print("My name is Ada.")
print("I am learning Python.")`,
        output: "Hello, everyone!\nMy name is Ada.\nI am learning Python.",
      },
      {
        type: "note",
        text: "On some computers the command is python instead of python3. Both run the same language, so use whichever one prints a version number on your machine.",
      },
      {
        type: "tip",
        text: "Save practice programs with clear names like greeting.py or calculator.py. A good name saves you from opening every file to find one.",
      },
    ],
    practice: [
      "Check which Python version is installed on your computer.",
      "Create a file called aboutme.py that prints your name and your city, then run it.",
      "Change one line in your file, save it, and run it again to see the new output.",
    ],
    summary: [
      "Check Python with python3 --version, or install it from python.org.",
      "Type python3 to test single lines in the interactive prompt.",
      "Save programs in .py files and run them with python3 file.py.",
      "print can show several values at once, separated by spaces.",
    ],
  },
  {
    slug: "python-syntax",
    title: "Syntax",
    intro:
      "Syntax is the set of rules for writing correct Python code. This page covers the most important rules: indentation, line endings, and comments.",
    blocks: [
      { type: "heading", text: "Python runs top to bottom" },
      {
        type: "para",
        text: "Python reads your file from the first line to the last line, and runs each line in order. If a line has an error, the lines after it do not run, so always fix the first error shown.",
      },
      {
        type: "code",
        title: "Lines run in order",
        code: `print("First")
print("Second")
print("Third")`,
        output: "First\nSecond\nThird",
      },
      { type: "heading", text: "Indentation groups lines together" },
      {
        type: "para",
        text: "Indentation is not decoration in Python. The lines under an if statement or a loop must be indented by the same amount, usually four spaces. A line with the wrong indentation either fails or belongs to the wrong block.",
      },
      {
        type: "code",
        title: "Indented lines belong to the if",
        code: `age = 18
if age >= 18:
    print("You can vote")
    print("Welcome")`,
        output: "You can vote\nWelcome",
      },
      { type: "heading", text: "No semicolons needed" },
      {
        type: "para",
        text: "Unlike some languages, Python does not need a semicolon at the end of each line. One statement per line is the normal style. You can put two short statements on one line with a semicolon, but it is rarely a good idea because it is harder to read.",
      },
      {
        type: "code",
        title: "One statement per line",
        code: `x = 5
y = 10
print(x + y)`,
        output: "15",
      },
      {
        type: "note",
        text: "Python is case sensitive, so Print and print are different names. The function is print with a small p, and writing Print gives a NameError.",
      },
    ],
    practice: [
      "Write three print lines and run them, then swap two lines and run again.",
      "Write an if statement with two indented print lines inside it.",
      "Deliberately remove the indentation from one line and read the error Python gives you.",
    ],
    summary: [
      "Python runs code from top to bottom, one line at a time.",
      "Indentation groups lines into blocks, usually four spaces per level.",
      "Statements do not need semicolons at the end.",
      "Python is case sensitive: print and Print are different names.",
    ],
  },
  {
    slug: "python-statements",
    title: "Statements",
    intro:
      "A statement is one instruction that Python carries out. This page explains the kinds of statements you will write and how they fit together in a program.",
    blocks: [
      { type: "heading", text: "What is a statement?" },
      {
        type: "para",
        text: "A statement is a single instruction, like assigning a value to a variable or printing a result. A program is a list of statements that run in order. Each statement does one small job, and together they do something useful.",
      },
      {
        type: "code",
        title: "Three statements, one program",
        code: `name = "Ada"
age = 17
print(name, "is", age, "years old")`,
        output: "Ada is 17 years old",
      },
      { type: "heading", text: "Simple and compound statements" },
      {
        type: "para",
        text: "A simple statement fits on one line, such as an assignment or a print. A compound statement, such as if or for, has a header line ending in a colon and then an indented block of statements underneath it. The block runs only when the header says so.",
      },
      {
        type: "code",
        title: "A compound statement with a block",
        code: `score = 85
if score >= 50:
    print("Pass")
    print("Well done")`,
        output: "Pass\nWell done",
      },
      { type: "heading", text: "Long statements over several lines" },
      {
        type: "para",
        text: "A statement can be split over several lines if it sits inside brackets. This is common for long lists or function calls. Python knows the statement is not finished until the brackets close.",
      },
      {
        type: "code",
        title: "One statement across two lines",
        code: `total = (10 + 20
         + 30)
print(total)`,
        output: "60",
      },
      {
        type: "note",
        text: "An empty line between statements is fine and makes code easier to read. Python ignores blank lines.",
      },
    ],
    practice: [
      "Write a program with five statements: two assignments, two prints, and one calculation.",
      "Write an if statement with three indented lines inside it.",
      "Split a long addition over two lines inside brackets and print the result.",
    ],
    summary: [
      "A statement is one instruction, and a program is a list of statements.",
      "Simple statements fit on one line; compound statements have an indented block.",
      "A statement inside brackets can span several lines.",
      "Blank lines are ignored and help make code readable.",
    ],
  },
  {
    slug: "python-challenges-statements",
    title: "Code Challenge",
    intro:
      "A small challenge to test what you learned about Python syntax and statements. Try it yourself before reading the solution.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Write a program that stores your name, your age, and your favourite number in three variables. Then print three lines: a greeting with your name, a line saying your age next year, and a line showing your favourite number doubled. Use one statement per line, and use a compound if statement to print a bonus line when your age is 18 or more.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "Assign values with the equals sign, like name = \"Ada\".",
          "Age next year is age + 1, and doubling a number is number * 2.",
          "An if statement needs a colon at the end of its first line and an indented block under it.",
          "print can show several values at once, separated by commas.",
        ],
      },
      { type: "heading", text: "The solution" },
      {
        type: "para",
        text: "Here is one correct solution. The values are the sample values used for the output below; your own program will print your own name, age, and number.",
      },
      {
        type: "code",
        title: "Solution",
        code: `name = "Ada"
age = 20
favourite = 7
print("Hello,", name)
print("Next year you will be", age + 1)
print("Your favourite number doubled is", favourite * 2)
if age >= 18:
    print("You are an adult")`,
        output: "Hello, Ada\nNext year you will be 21\nYour favourite number doubled is 14\nYou are an adult",
      },
      {
        type: "para",
        text: "Notice how each statement does one job: three assignments, three prints, and one if block. If your program prints the same four lines with your own values, you have solved the challenge.",
      },
      {
        type: "code",
        title: "Check: the same program with different values",
        code: `name = "Ravi"
age = 15
favourite = 3
print("Hello,", name)
print("Next year you will be", age + 1)
print("Your favourite number doubled is", favourite * 2)
if age >= 18:
    print("You are an adult")`,
        output: "Hello, Ravi\nNext year you will be 16\nYour favourite number doubled is 6",
      },
      {
        type: "note",
        text: "In the second run the bonus line does not print, because 15 is less than 18. That is the if statement working correctly, not a mistake.",
      },
    ],
    practice: [
      "Solve the challenge with your own name, age, and favourite number.",
      "Add a fourth variable for your city and print a line about it.",
      "Change the if condition so the bonus line prints when your age is under 18 instead.",
    ],
    summary: [
      "A program is built from simple statements that run in order.",
      "Assignments store values, and print shows results.",
      "An if statement runs its indented block only when its condition is true.",
      "Test your program with different values to check every branch.",
    ],
  },
  {
    slug: "python-output",
    title: "Print Text",
    intro:
      "The print function is how a Python program shows text on the screen. This page covers printing text, joining words, and controlling how print ends a line.",
    blocks: [
      { type: "heading", text: "Printing text" },
      {
        type: "para",
        text: "The print function shows whatever you put inside its brackets. To print text, put it inside quotes. Single quotes and double quotes work the same way, so pick one style and use it most of the time.",
      },
      {
        type: "code",
        title: "Printing lines of text",
        code: `print("Hello, World!")
print('Python is fun')
print("I am learning to code")`,
        output: "Hello, World!\nPython is fun\nI am learning to code",
      },
      { type: "heading", text: "Printing several values at once" },
      {
        type: "para",
        text: "When you pass several values separated by commas, print puts a space between them. You can mix text and numbers in the same line this way, without converting anything yourself.",
      },
      {
        type: "code",
        title: "Several values in one print",
        code: `print("My age is", 17)
print("Python", "is", "fun")
print("2 + 3 =", 2 + 3)`,
        output: "My age is 17\nPython is fun\n2 + 3 = 5",
      },
      { type: "heading", text: "Changing the separator and the ending" },
      {
        type: "para",
        text: "Print has two useful settings. The sep setting controls what goes between the values, and the end setting controls what comes after the last value. By default, sep is a space and end is a new line. Changing end to a space keeps the next print on the same line.",
      },
      {
        type: "code",
        title: "sep and end in action",
        code: `print(1, 2, 3, sep="-")
print("Hello", end=" ")
print("World")`,
        output: "1-2-3\nHello World",
      },
      {
        type: "note",
        text: "Python 3 needs parentheses around print. Writing print \"Hello\" without them is old Python 2 style and gives a syntax error in Python 3.",
      },
    ],
    practice: [
      "Print your name, your city, and your favourite food on three separate lines.",
      "Print one line that mixes text and a number, like My age is 17.",
      "Use sep to print the numbers 1, 2, and 3 joined with a slash, like 1/2/3.",
    ],
    summary: [
      "print shows text or numbers on the screen.",
      "Text goes inside single or double quotes.",
      "Several values in one print are joined with a space by default.",
      "sep changes the joiner and end changes what comes after the line.",
    ],
  },
  {
    slug: "python-output-numbers",
    title: "Print Numbers",
    intro:
      "Print can show numbers, answers to calculations, and numbers stored in variables. This page shows how Python prints numbers and how to control their format.",
    blocks: [
      { type: "heading", text: "Printing numbers directly" },
      {
        type: "para",
        text: "You can print a number on its own, or print the result of a calculation. Python works out the calculation first and then prints the answer. Whole numbers print as they are, and division always gives a decimal result.",
      },
      {
        type: "code",
        title: "Numbers and calculations",
        code: `print(42)
print(2 + 3)
print(10 - 4)
print(3 * 4)
print(7 / 2)`,
        output: "42\n5\n6\n12\n3.5",
      },
      { type: "heading", text: "Printing numbers from variables" },
      {
        type: "para",
        text: "When a number is stored in a variable, printing the variable shows its value. If you change the variable and print it again, the new value is shown. This is how programs show results that change while they run.",
      },
      {
        type: "code",
        title: "Variables and their values",
        code: `price = 199
quantity = 3
print(price)
print(price * quantity)
print("Total:", price * quantity)`,
        output: "199\n597\nTotal: 597",
      },
      { type: "heading", text: "Controlling decimal places" },
      {
        type: "para",
        text: "Some calculations give long decimals. The round function limits a number to a chosen number of decimal places, and an f-string can format a number while it is printed. Formatting only changes the printed text, not the stored value.",
      },
      {
        type: "code",
        title: "Rounding and formatting numbers",
        code: `print(10 / 3)
print(round(10 / 3, 2))
print(f"Pi is about {3.14159:.2f}")`,
        output: "3.3333333333333335\n3.33\nPi is about 3.14",
      },
      {
        type: "note",
        text: "Division with a single slash always gives a float, even when the answer is whole. 8 / 2 prints 4.0, not 4. Use double slash for whole-number division.",
      },
    ],
    practice: [
      "Print the answers to 7 times 8, 100 minus 37, and 25 divided by 5.",
      "Store a price and a quantity in variables, then print their total.",
      "Print 10 divided by 3 rounded to two decimal places.",
    ],
    summary: [
      "print shows numbers and the answers to calculations.",
      "Division with a single slash always gives a decimal result.",
      "Printing a variable shows its current value.",
      "round and f-strings control how many decimal places are shown.",
    ],
  },
  {
    slug: "python-challenges-output",
    title: "Code Challenge",
    intro:
      "A small challenge to test what you learned about printing text and numbers. Try it yourself before reading the solution.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Write a program that prints a simple receipt. Store the name of an item, its price, and how many were bought. Then print three lines: the item name, the quantity and price, and the total cost. Use sep to print the date as 16-11-2026 on one line, and use end to print two words on the same line at the end.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "The total cost is price times quantity.",
          "print with commas puts a space between values.",
          "sep changes what goes between the values, for example sep=\"-\".",
          "end=\" \" keeps the next print on the same line.",
        ],
      },
      { type: "heading", text: "The solution" },
      {
        type: "para",
        text: "Here is one correct solution, using the sample values shown in the output.",
      },
      {
        type: "code",
        title: "Solution",
        code: `item = "Notebook"
price = 45
quantity = 4
print("Item:", item)
print("Quantity:", quantity, "Price:", price)
print("Total:", price * quantity)
print(16, 11, 2026, sep="-")
print("Thank", end=" ")
print("you!")`,
        output: "Item: Notebook\nQuantity: 4 Price: 45\nTotal: 180\n16-11-2026\nThank you!",
      },
      {
        type: "para",
        text: "The receipt prints five lines. The date uses sep to join the day, month, and year with dashes, and the last two words join into one line because end was set to a space.",
      },
      {
        type: "code",
        title: "Check: formatting a decimal total",
        code: `price = 19.99
quantity = 3
print("Total:", round(price * quantity, 2))`,
        output: "Total: 59.97",
      },
      {
        type: "tip",
        text: "When money is involved, always round the total to two decimal places, or the printed total can show a long string of decimal digits.",
      },
    ],
    practice: [
      "Solve the challenge with your own item, price, and quantity.",
      "Add a line that prints the price of one item rounded to two decimal places.",
      "Print the date 1-1-2027 using sep, then print Good bye on one line using end.",
    ],
    summary: [
      "print can mix text, numbers, and variables in one line.",
      "sep controls what goes between values, and end controls what follows the line.",
      "The total cost is price times quantity.",
      "Round money totals to two decimal places before printing them.",
    ],
  },
  {
    slug: "python-comments",
    title: "Comments",
    intro:
      "A comment is a note for humans that Python ignores completely. Comments explain why code is written the way it is, so you and others can understand it later.",
    blocks: [
      { type: "heading", text: "Single-line comments" },
      {
        type: "para",
        text: "Anything after a hash sign on a line is a comment. Python ignores it and runs only the code before it. A comment can sit on its own line or at the end of a line of code.",
      },
      {
        type: "code",
        title: "Comments are ignored by Python",
        code: `# This program greets the user
print("Hello!")  # print a greeting
# print("This line never runs")`,
        output: "Hello!",
      },
      { type: "heading", text: "What makes a good comment" },
      {
        type: "para",
        text: "Good comments explain the reason behind a line, not just what it does. When you return to a program after a week, a good comment reminds you what you were thinking, and that saves you from reading every line again to work it out.",
      },
      {
        type: "code",
        title: "A comment that explains the why",
        code: `# Prices are in rupees, so divide by 83 to show dollars
price_in_dollars = 830 / 83
print(price_in_dollars)`,
        output: "10.0",
      },
      { type: "heading", text: "Multi-line comments" },
      {
        type: "para",
        text: "Python has no special multi-line comment syntax. For a longer note, write several lines that each start with a hash sign. You can also use a triple-quoted string on its own as a note, but it is really a string that Python creates and throws away, so hash lines are the clearer choice.",
      },
      {
        type: "code",
        title: "Several hash lines for a long note",
        code: `# This program works out a bill.
# It adds the price of each item
# and then prints the total.
print(10 + 20 + 30)`,
        output: "60",
      },
      {
        type: "note",
        text: "You can use comments to turn off a line of code while testing. Put a hash in front of it, run the program, and remove the hash when you want the line back.",
      },
    ],
    practice: [
      "Write a program with a comment at the top saying what it does, then print your name.",
      "Add a comment at the end of a line of code explaining what that line does.",
      "Comment out one print line, run the program, then remove the hash and run it again.",
    ],
    summary: [
      "A comment starts with a hash sign and is ignored by Python.",
      "Good comments explain why code is written a certain way.",
      "Use one hash line per line for longer notes.",
      "Comments can temporarily switch off a line while you test.",
    ],
  },
  {
    slug: "python-challenges-comments",
    title: "Code Challenge",
    intro:
      "A small challenge to test what you learned about comments. Try it yourself before reading the solution.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Write a program that works out the total cost of three items and prints it. Add a comment at the top saying what the program does, a comment next to each price explaining what the item is, and a comment above the total explaining how it is worked out. Then comment out the most expensive item, run the program, and check the new total.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "Store each price in its own variable, like pen = 10.",
          "A comment starts with a hash sign and can sit at the end of a line.",
          "The total is the sum of the three prices.",
          "Putting a hash in front of a line stops Python from running it.",
        ],
      },
      { type: "heading", text: "The solution" },
      {
        type: "para",
        text: "Here is one correct solution with the sample prices shown in the output.",
      },
      {
        type: "code",
        title: "Solution",
        code: `# This program works out the total cost of three items
pen = 10      # a blue pen
notebook = 45  # a ruled notebook
bag = 350     # a school bag
# Add the three prices together to get the total
total = pen + notebook + bag
print("Total:", total)`,
        output: "Total: 405",
      },
      {
        type: "para",
        text: "Each comment says something useful: what the program does, what each price is for, and how the total is worked out. Comments like these help a reader understand the program without guessing.",
      },
      {
        type: "code",
        title: "The same program with the bag commented out",
        code: `# This program works out the total cost of three items
pen = 10      # a blue pen
notebook = 45  # a ruled notebook
# bag = 350     # a school bag
# Add the three prices together to get the total
total = pen + notebook
print("Total:", total)`,
        output: "Total: 55",
      },
      {
        type: "note",
        text: "Commenting out the bag also meant removing it from the total, because the name bag no longer exists. A commented-out variable cannot be used anywhere else in the program.",
      },
    ],
    practice: [
      "Solve the challenge with three items of your own.",
      "Write a program with a three-line comment at the top explaining what it does.",
      "Comment out a line in one of your earlier programs and check what changes.",
    ],
    summary: [
      "Comments explain a program to humans and are ignored by Python.",
      "Put a useful comment at the top of a program and next to tricky lines.",
      "A hash at the start of a line switches that line off.",
      "A commented-out variable cannot be used anywhere else.",
    ],
  },
  {
    slug: "python-variables",
    title: "Python Variables",
    intro:
      "A variable is a named box that stores a value so you can use it later. Almost every program you write will use variables.",
    blocks: [
      { type: "heading", text: "What is a variable?" },
      {
        type: "para",
        text: "A variable is a name that stores a value. You create one with an equals sign, like age = 17. The name goes on the left and the value on the right. After that, writing age anywhere in the program means the value 17. If you assign a new value to the same name, the old value is replaced.",
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
      { type: "heading", text: "Variables can change" },
      {
        type: "para",
        text: "A variable is not fixed. You can give it a new value at any time, and the next time you use it, you get the new value. This is how programs keep track of things that change, like a score or a total.",
      },
      {
        type: "code",
        title: "Changing a variable",
        code: `score = 0
print(score)
score = 10
print(score)
score = score + 5
print(score)`,
        output: "0\n10\n15",
      },
      { type: "heading", text: "Variables in calculations" },
      {
        type: "para",
        text: "You can use variables in calculations just like numbers. Python looks up each value, works out the answer, and you can store the answer in a new variable or print it directly.",
      },
      {
        type: "code",
        title: "Maths with variables",
        code: `length = 5
width = 4
area = length * width
print("Area:", area)`,
        output: "Area: 20",
      },
      {
        type: "note",
        text: "Python figures out the type of a value from the value itself, so you never declare a type when you create a variable. The same name can even hold a different type later, although good programs usually keep one name for one kind of value.",
      },
    ],
    practice: [
      "Create variables for your name, your age, your height, and whether you like Python, then print all four.",
      "Create a variable called score, set it to 0, add 10 to it, and print it.",
      "Store the length and width of a rectangle and print its area.",
    ],
    summary: [
      "A variable is a name that stores a value for later use.",
      "Create one with an equals sign: name = \"Ada\".",
      "Assigning a new value replaces the old one.",
      "Variables can be used in calculations like numbers.",
    ],
  },
  {
    slug: "python-variables-names",
    title: "Variable Names",
    intro:
      "Variable names must follow a few rules, and good names make your code easy to read. This page covers the rules and the naming style most Python programmers use.",
    blocks: [
      { type: "heading", text: "The rules for names" },
      {
        type: "para",
        text: "A variable name must start with a letter or an underscore, and it can only contain letters, digits, and underscores. It cannot contain spaces, and it cannot start with a digit. It also cannot be a Python keyword like if, for, or class.",
      },
      {
        type: "code",
        title: "Valid names",
        code: `name = "Ada"
age2 = 17
_my_score = 90
total_price = 250
print(name, age2, _my_score, total_price)`,
        output: "Ada 17 90 250",
      },
      { type: "heading", text: "Names that do not work" },
      {
        type: "para",
        text: "A name with a space in it, like my age, is a syntax error, because Python reads it as two separate names. A name that starts with a digit, like 2age, is also an error. A name that is a keyword, like class, cannot be used as a variable either.",
      },
      {
        type: "code",
        title: "Case matters",
        code: `age = 17
Age = 18
print(age)
print(Age)`,
        output: "17\n18",
      },
      { type: "heading", text: "Good naming style" },
      {
        type: "para",
        text: "Python programmers use lowercase letters with underscores between words, a style called snake_case. Names should say what the value is, such as total_price instead of tp, so your code reads like a sentence.",
      },
      {
        type: "list",
        items: [
          "Use short but clear names: age, price, first_name.",
          "Use snake_case: total_price, not totalPrice or TotalPrice.",
          "Avoid single letters except for very short loops, like i in a loop.",
          "Do not use Python keywords as names: if, for, while, class, import.",
        ],
      },
      {
        type: "note",
        text: "Python is case sensitive, so age and Age are two different variables. Pick one style, usually lowercase with underscores, and use it everywhere.",
      },
    ],
    practice: [
      "Create three variables with good snake_case names and print them.",
      "Try using a name with a space in it and read the error Python gives you.",
      "Rename a variable called x in one of your programs to a clear name like total_marks.",
    ],
    summary: [
      "Names must start with a letter or underscore and contain only letters, digits, and underscores.",
      "Names cannot contain spaces or be Python keywords.",
      "Python is case sensitive: age and Age are different variables.",
      "Use lowercase snake_case names that say what the value is.",
    ],
  },
  {
    slug: "python-variables-multiple",
    title: "Assign Multiple Values",
    intro:
      "Python lets you assign values to several variables in one line. This page shows the shortcuts for setting up many variables at once.",
    blocks: [
      { type: "heading", text: "Several variables in one line" },
      {
        type: "para",
        text: "You can assign a different value to each of several variables in a single line. Write the names on the left separated by commas, and the values on the right separated by commas. Python matches them in order: the first name gets the first value, and so on.",
      },
      {
        type: "code",
        title: "One line, three variables",
        code: `name, age, city = "Ada", 17, "Mumbai"
print(name)
print(age)
print(city)`,
        output: "Ada\n17\nMumbai",
      },
      { type: "heading", text: "The same value for several variables" },
      {
        type: "para",
        text: "You can also give the same value to several variables at once by chaining the assignments with equals signs. This is handy when several counters or flags all start at the same value.",
      },
      {
        type: "code",
        title: "One value, three names",
        code: `x = y = z = 0
print(x, y, z)
x = 5
print(x, y, z)`,
        output: "0 0 0\n5 0 0",
      },
      {
        type: "para",
        text: "Swapping two variables is a famous use of this trick. Writing a, b = b, a swaps their values in one line, with no temporary variable needed.",
      },
      {
        type: "code",
        title: "Swapping two values",
        code: `a = 10
b = 20
a, b = b, a
print(a)
print(b)`,
        output: "20\n10",
      },
      {
        type: "note",
        text: "For numbers and strings, chained assignment like x = y = z = 0 gives each name its own copy, so changing one does not change the others. For lists it is different, because all three names would point to the same list.",
      },
    ],
    practice: [
      "Assign your name, age, and city to three variables in one line and print them.",
      "Set three counters to 0 in one line, then change one and print all three.",
      "Swap the values of two variables in one line and print the result.",
    ],
    summary: [
      "Assign several variables in one line with commas on both sides.",
      "Chained assignment gives the same value to several names at once.",
      "A list or tuple can be unpacked into separate variables.",
      "a, b = b, a swaps two values in one line.",
    ],
  },
  {
    slug: "python-variables-output",
    title: "Output Variables",
    intro:
      "Once a value is stored in a variable, you often need to show it. This page covers the ways to print variables, alone and mixed with text and other values.",
    blocks: [
      { type: "heading", text: "Printing a variable" },
      {
        type: "para",
        text: "Printing a variable shows its current value. If the value changes later, printing the variable again shows the new value. This is the simplest way to see what your program is doing while it runs.",
      },
      {
        type: "code",
        title: "Printing variables",
        code: `name = "Ada"
age = 17
print(name)
print(age)`,
        output: "Ada\n17",
      },
      { type: "heading", text: "Mixing text and variables" },
      {
        type: "para",
        text: "The print function can take several values separated by commas, and it puts a space between them. This lets you build a sentence from text and variables without converting anything yourself.",
      },
      {
        type: "code",
        title: "Text and variables together",
        code: `name = "Ada"
age = 17
print("My name is", name)
print("I am", age, "years old")`,
        output: "My name is Ada\nI am 17 years old",
      },
      { type: "heading", text: "The clearest way: f-strings" },
      {
        type: "para",
        text: "An f-string places variables directly inside a string, inside curly braces. It is shorter and easier to read than joining pieces with plus, and it handles numbers automatically.",
      },
      {
        type: "code",
        title: "Building sentences with f-strings",
        code: `name = "Ada"
age = 17
print(f"My name is {name} and I am {age} years old.")`,
        output: "My name is Ada and I am 17 years old.",
      },
      {
        type: "note",
        text: "print with commas adds spaces between values automatically. With plus, you control every space yourself, which is why f-strings are usually the easiest choice.",
      },
    ],
    practice: [
      "Store your name and age in variables and print a sentence about yourself three ways: with commas, with plus, and with an f-string.",
      "Print two variables on one line separated by a dash using sep.",
      "Store a price in a variable and print it inside a sentence like The price is 199 rupees.",
    ],
    summary: [
      "print(variable) shows the current value of a variable.",
      "print with commas joins text and values with spaces.",
      "Plus joins strings, but numbers must be converted with str first.",
      "f-strings place variables inside curly braces and are the clearest way to build sentences.",
    ],
  },
  {
    slug: "python-variables-global",
    title: "Global Variables",
    intro:
      "A variable created outside a function is called a global variable. This page explains how global and local variables differ, and how to change a global variable from inside a function.",
    blocks: [
      { type: "heading", text: "What is a global variable?" },
      {
        type: "para",
        text: "A variable created at the top level of a file, outside any function, is a global variable. Every function in the file can read it. A variable created inside a function is a local variable, and it only exists while that function is running.",
      },
      {
        type: "code",
        title: "A global variable read inside a function",
        code: `city = "Mumbai"

def show_city():
    print("City:", city)

show_city()
print(city)`,
        output: "City: Mumbai\nMumbai",
      },
      { type: "heading", text: "Local variables stay inside their function" },
      {
        type: "para",
        text: "A local variable is created when the function runs and disappears when the function ends. Trying to use it outside the function gives a NameError, because the name does not exist there.",
      },
      {
        type: "code",
        title: "A local variable cannot be used outside",
        code: `def make_message():
    text = "Hello from inside"
    print(text)

make_message()`,
        output: "Hello from inside",
      },
      { type: "heading", text: "Changing a global variable inside a function" },
      {
        type: "para",
        text: "Reading a global variable inside a function is easy, but changing it needs the global keyword. Without it, Python treats the assignment as creating a new local variable with the same name, and the global value stays unchanged.",
      },
      {
        type: "code",
        title: "The global keyword",
        code: `score = 0

def add_points(points):
    global score
    score = score + points

add_points(10)
add_points(5)
print(score)`,
        output: "15",
      },
      {
        type: "note",
        text: "Use global variables sparingly. A function that reads and changes globals is harder to test and reuse than one that takes values as parameters and returns a result.",
      },
    ],
    practice: [
      "Create a global variable and read it inside a function, then print it outside.",
      "Write a function that changes a global counter using the global keyword.",
      "Write a function with a local variable and try to print that variable outside the function to see the error.",
    ],
    summary: [
      "A global variable is created outside a function and can be read anywhere.",
      "A local variable exists only while its function is running.",
      "Use the global keyword to change a global variable from inside a function.",
      "Without global, an assignment inside a function creates a local variable instead.",
    ],
  },
  {
    slug: "python-variables-exercises",
    title: "Variable Exercises",
    intro:
      "A set of practice exercises on variables. Try each one yourself, then check your answer against the solution below it.",
    blocks: [
      { type: "heading", text: "Exercise 1: Your details" },
      {
        type: "para",
        text: "Create variables for your name, your age, and your city. Then print a sentence that uses all three, like My name is Ada, I am 17 years old, and I live in Mumbai.",
      },
      {
        type: "code",
        title: "Exercise 1: answer",
        code: `name = "Ada"
age = 17
city = "Mumbai"
print(f"My name is {name}, I am {age} years old, and I live in {city}.")`,
        output: "My name is Ada, I am 17 years old, and I live in Mumbai.",
      },
      { type: "heading", text: "Exercise 2: Swap two numbers" },
      {
        type: "para",
        text: "Store 10 in a and 20 in b. Then swap their values so that a becomes 20 and b becomes 10, using only one line for the swap. Print both values before and after the swap.",
      },
      {
        type: "code",
        title: "Exercise 2: answer",
        code: `a = 10
b = 20
print("Before:", a, b)
a, b = b, a
print("After:", a, b)`,
        output: "Before: 10 20\nAfter: 20 10",
      },
      { type: "heading", text: "Exercise 3: A simple bill" },
      {
        type: "para",
        text: "A pen costs 10 rupees and a notebook costs 45 rupees. Store the two prices and the quantities bought (3 pens and 2 notebooks) in variables. Then work out and print the total cost.",
      },
      {
        type: "code",
        title: "Exercise 3: answer",
        code: `pen_price = 10
notebook_price = 45
pens = 3
notebooks = 2
total = pen_price * pens + notebook_price * notebooks
print("Total:", total)`,
        output: "Total: 120",
      },
      {
        type: "note",
        text: "If an exercise feels hard, break it into smaller steps. Write one variable, print it, and check it before moving on to the next step.",
      },
    ],
    practice: [
      "Do Exercise 1 with your own name, age, and city.",
      "Write a program that stores the length and width of a room and prints its area.",
      "Store your marks in three subjects and print the total and the average.",
    ],
    summary: [
      "Variables store values under names you choose.",
      "f-strings build sentences from text and variables.",
      "a, b = b, a swaps two values in one line.",
      "Break a big exercise into small steps and check each one.",
    ],
  },
  {
    slug: "python-challenges-variables",
    title: "Code Challenge",
    intro:
      "A small challenge to test what you learned about variables. Try it yourself before reading the solution.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Write a program for a small shop. Store the name of a product, its price, and how many are in stock. Then sell 3 items: reduce the stock by 3 and add the money earned to a total_sales variable that starts at 0. Print the product name, the items left in stock, and the total money earned.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "Start total_sales at 0 before the sale.",
          "Selling 3 items means stock = stock - 3.",
          "Money earned is price times 3.",
          "Use an f-string to print a clear sentence for each result.",
        ],
      },
      { type: "heading", text: "The solution" },
      {
        type: "para",
        text: "Here is one correct solution, using the sample values shown in the output.",
      },
      {
        type: "code",
        title: "Solution",
        code: `product = "Notebook"
price = 45
stock = 10
total_sales = 0
stock = stock - 3
total_sales = total_sales + price * 3
print(f"Product: {product}")
print(f"Items left in stock: {stock}")
print(f"Total money earned: {total_sales}")`,
        output: "Product: Notebook\nItems left in stock: 7\nTotal money earned: 135",
      },
      {
        type: "para",
        text: "The stock drops from 10 to 7, and the money earned is 45 times 3, which is 135. The variables stock and total_sales change during the program, which is exactly what variables are for.",
      },
      {
        type: "code",
        title: "Check: selling 3 more items",
        code: `product = "Notebook"
price = 45
stock = 7
total_sales = 135
stock = stock - 3
total_sales = total_sales + price * 3
print(f"Items left in stock: {stock}")
print(f"Total money earned: {total_sales}")`,
        output: "Items left in stock: 4\nTotal money earned: 270",
      },
      {
        type: "tip",
        text: "When a value changes over time, like stock or total sales, print it after each change while you are learning, so you can see the change happen.",
      },
    ],
    practice: [
      "Solve the challenge with your own product, price, and stock.",
      "Sell 5 more items in the same program and print the new stock and total.",
      "Add a variable for the shop name and print it at the top of the output.",
    ],
    summary: [
      "Variables hold values that change as the program runs.",
      "Update a variable by assigning a new value based on the old one.",
      "Money earned is price times the number of items sold.",
      "Print values after each change to check your program step by step.",
    ],
  },
  {
    slug: "python-datatypes",
    title: "Data Types",
    intro:
      "Every value in Python has a type, which tells Python what you can do with it. This page introduces the main types and how to check them.",
    blocks: [
      { type: "heading", text: "What is a data type?" },
      {
        type: "para",
        text: "A data type is the kind of a value. Numbers, text, and true-or-false values are different types, and Python treats them differently. You cannot add a number to text, but you can add two numbers. The type decides which operations make sense.",
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
      { type: "heading", text: "The main types" },
      {
        type: "list",
        items: [
          "int is a whole number, like 17 or -4.",
          "float is a number with a decimal point, like 5.6 or 3.14.",
          "str is text inside quotes, like \"Ada\" or \"Hello\".",
          "bool is either True or False, used for yes-or-no facts.",
          "list is an ordered collection of values, like [1, 2, 3].",
          "tuple is an ordered collection that cannot change, like (1, 2).",
          "set is an unordered collection of unique values, like {1, 2}.",
          "dict is a collection of key and value pairs, like {\"name\": \"Ada\"}.",
        ],
      },
      { type: "heading", text: "Python finds the type for you" },
      {
        type: "para",
        text: "Python figures out the type from the value itself, so you never declare a type when you create a variable. The same name can even hold a different type later, although good programs usually keep one name for one kind of value.",
      },
      {
        type: "code",
        title: "Types of collections",
        code: `print(type([1, 2, 3]))
print(type((1, 2)))
print(type({1, 2}))
print(type({"name": "Ada"}))`,
        output: "<class 'list'>\n<class 'tuple'>\n<class 'set'>\n<class 'dict'>",
      },
      {
        type: "note",
        text: "The type of a value decides what you can do with it. Adding two ints gives a number, adding two strings joins them, but adding an int and a string gives a TypeError.",
      },
    ],
    practice: [
      "Use type() to print the type of 100, 9.99, \"hello\", and False.",
      "Create one variable of each main type and print its type.",
      "Try adding a number and a string and read the error message.",
    ],
    summary: [
      "Every value has a type, and the type decides what you can do with it.",
      "The main types are int, float, str, bool, list, tuple, set, and dict.",
      "type() shows the type of any value.",
      "Python finds the type from the value, so you never declare it.",
    ],
  },
  {
    slug: "python-challenges-datatypes",
    title: "Code Challenge",
    intro:
      "A small challenge to test what you learned about data types. Try it yourself before reading the solution.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Write a program that creates one variable of each type: an int, a float, a str, a bool, a list, and a dict. Print each variable together with its type, using type(). Then change the int variable to hold a string and print its type again, to prove that a variable can change type.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "type(value) gives the type, and print can show a value and its type together.",
          "A list uses square brackets and a dict uses curly brackets with key and value pairs.",
          "Assigning a new value to a name replaces the old value and its type.",
        ],
      },
      { type: "heading", text: "The solution" },
      {
        type: "para",
        text: "Here is one correct solution, using the sample values shown in the output.",
      },
      {
        type: "code",
        title: "Solution",
        code: `age = 17
height = 5.6
name = "Ada"
is_student = True
scores = [85, 90, 78]
student = {"name": "Ada", "age": 17}
print(age, type(age))
print(height, type(height))
print(name, type(name))
print(is_student, type(is_student))
print(scores, type(scores))
print(student, type(student))`,
        output: "17 <class 'int'>\n5.6 <class 'float'>\nAda <class 'str'>\nTrue <class 'bool'>\n[85, 90, 78] <class 'list'>\n{'name': 'Ada', 'age': 17} <class 'dict'>",
      },
      {
        type: "para",
        text: "A variable in Python is only a name pointing at a value. When you assign a new value of a different type, the name simply points at the new value.",
      },
      {
        type: "code",
        title: "A variable can change its type",
        code: `age = 17
print(age, type(age))
age = "seventeen"
print(age, type(age))`,
        output: "17 <class 'int'>\nseventeen <class 'str'>",
      },
      {
        type: "note",
        text: "Changing a variable's type is allowed, but it is usually a bad habit in real programs, because the reader expects one name to hold one kind of value.",
      },
    ],
    practice: [
      "Solve the challenge with your own values for each type.",
      "Create a tuple and a set, then print each with its type.",
      "Change a string variable to hold a number and print its type before and after.",
    ],
    summary: [
      "type() shows the type of any value.",
      "The main types are int, float, str, bool, list, tuple, set, and dict.",
      "A variable can hold a different type after a new assignment.",
      "In real programs, keep one name for one kind of value.",
    ],
  },
  {
    slug: "python-numbers",
    title: "Numbers",
    intro:
      "Python has three kinds of numbers: integers, floats, and complex numbers. This page covers the first two, which you will use every day, and the arithmetic you can do with them.",
    blocks: [
      { type: "heading", text: "Integers and floats" },
      {
        type: "para",
        text: "An int is a whole number, like 17 or -4, with no limit on its size. A float is a number with a decimal point, like 5.6 or 3.14. Any number with a decimal point in it is a float, even if the decimal part is zero, so 7.0 is a float and 7 is an int.",
      },
      {
        type: "code",
        title: "Ints and floats",
        code: `print(type(17))
print(type(5.6))
print(type(7.0))
print(2 + 3)
print(2.5 + 1.5)`,
        output: "<class 'int'>\n<class 'float'>\n<class 'float'>\n5\n4.0",
      },
      { type: "heading", text: "Arithmetic with numbers" },
      {
        type: "para",
        text: "Python supports the usual arithmetic: plus, minus, multiply, divide, and power. Division with a single slash always gives a float. Double slash gives whole-number division, and the percent sign gives the remainder.",
      },
      {
        type: "code",
        title: "The arithmetic operators",
        code: `print(10 + 3)
print(10 - 3)
print(10 * 3)
print(10 / 3)
print(10 // 3)
print(10 % 3)
print(2 ** 3)`,
        output: "13\n7\n30\n3.3333333333333335\n3\n1\n8",
      },
      { type: "heading", text: "Floats are not always exact" },
      {
        type: "para",
        text: "Computers store decimal numbers in binary, so some decimals cannot be stored exactly. Adding 0.1 and 0.2 gives 0.30000000000000004, not 0.3. For money, round the result to two decimal places, or work in the smallest unit, like paise instead of rupees.",
      },
      {
        type: "code",
        title: "A float surprise, and the fix",
        code: `print(0.1 + 0.2)
print(round(0.1 + 0.2, 2))`,
        output: "0.30000000000000004\n0.3",
      },
      {
        type: "note",
        text: "Complex numbers, like 3 + 4j, are the third kind of number in Python. They are used in maths and engineering, but you will rarely need them in everyday programs.",
      },
    ],
    practice: [
      "Print the answers to 15 divided by 4 using both / and //, and the remainder using %.",
      "Work out 2 to the power of 10 with ** and print the answer.",
      "Print 0.1 + 0.2, then print it rounded to one decimal place.",
    ],
    summary: [
      "int is a whole number and float is a number with a decimal point.",
      "Division with / always gives a float; // gives whole-number division.",
      "% gives the remainder and ** gives the power.",
      "Floats can be slightly inexact, so round money to two decimals.",
    ],
  },
  {
    slug: "python-challenges-numbers",
    title: "Code Challenge",
    intro:
      "A small challenge to test what you learned about numbers. Try it yourself before reading the solution.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Write a program that takes a total bill of 1000 rupees and splits it equally between 3 friends. Print how much each friend pays as a whole number of rupees using whole-number division, how many rupees are left over, and the exact share rounded to two decimal places. Then print the square of 12.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "// gives whole-number division and % gives the remainder.",
          "/ gives the exact division as a float.",
          "round(value, 2) limits a number to two decimal places.",
          "** is the power operator, so 12 ** 2 is 12 squared.",
        ],
      },
      { type: "heading", text: "The solution" },
      {
        type: "para",
        text: "Here is one correct solution, using the sample values shown in the output.",
      },
      {
        type: "code",
        title: "Solution",
        code: `bill = 1000
friends = 3
print("Each friend pays:", bill // friends)
print("Left over:", bill % friends)
print("Exact share:", round(bill / friends, 2))
print("Square of 12:", 12 ** 2)`,
        output: "Each friend pays: 333\nLeft over: 1\nExact share: 333.33\nSquare of 12: 144",
      },
      {
        type: "para",
        text: "The bill does not split evenly: 3 times 333 is 999, so 1 rupee is left over. The exact share is 333.33 rupees when rounded to two decimal places.",
      },
      {
        type: "code",
        title: "Check: a bill that splits evenly",
        code: `bill = 900
friends = 3
print("Each friend pays:", bill // friends)
print("Left over:", bill % friends)
print("Exact share:", round(bill / friends, 2))`,
        output: "Each friend pays: 300\nLeft over: 0\nExact share: 300.0",
      },
      {
        type: "tip",
        text: "When you split money, decide what happens to the leftover rupees first. In real programs, one person often pays the extra rupee.",
      },
    ],
    practice: [
      "Solve the challenge with a bill of 500 rupees split between 4 friends.",
      "Print the cube of 5 and the remainder of 100 divided by 7.",
      "Work out the average of 85, 90, and 78 and print it rounded to one decimal place.",
    ],
    summary: [
      "// gives the whole-number share and % gives the leftover.",
      "/ gives the exact share as a float.",
      "round(value, 2) shows money to two decimal places.",
      "** raises a number to a power.",
    ],
  },
  {
    slug: "python-casting",
    title: "Casting",
    intro:
      "Casting means converting a value from one type to another. You will learn the int, float, str, and bool functions and when each one is useful.",
    blocks: [
      { type: "heading", text: "What is casting?" },
      {
        type: "para",
        text: "Casting means changing a value from one type to another. The text \"42\" and the number 42 look similar, but Python treats them very differently. You cannot add 8 to the text \"42\", but after converting it to a number with int, the addition works and gives 50.",
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
        type: "code",
        title: "Casting input to a number",
        code: `age_text = "17"
age = int(age_text)
print("Next year you will be", age + 1)`,
        output: "Next year you will be 18",
      },
      {
        type: "note",
        text: "Not every conversion works. int(\"3.5\") fails with an error, because the text 3.5 is not a whole number. Convert it to float first, then to int, like int(float(\"3.5\")), which gives 3.",
      },
      {
        type: "tip",
        text: "The most common use of casting is with input. Since input always returns text, wrap it in int or float right away when you need a number.",
      },
    ],
    practice: [
      "Convert the string \"25\" to a number, add 5 to it, and print the answer.",
      "Convert 9.99 to an int and print the result, then explain why it is 9 and not 10.",
      "Try int(\"hello\") and read the error message, then explain in your own words why it failed.",
    ],
    summary: [
      "Casting converts a value from one type to another.",
      "int makes whole numbers, float makes decimal numbers, and str makes text.",
      "Converting a float to int cuts off the decimal part without rounding.",
      "Zero and empty text become False, and almost everything else becomes True.",
    ],
  },
  {
    slug: "python-challenges-casting",
    title: "Code Challenge",
    intro:
      "A small challenge to test what you learned about casting. Try it yourself before reading the solution.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Write a program that starts with the text values \"25\" and \"3.5\". Convert the first one to an int and the second one to a float, add them together, and print the result. Then convert the sum to a string and print a sentence like The total is 28.5. Finally, print what happens when you convert the float 28.5 to an int.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "int(\"25\") gives the number 25 and float(\"3.5\") gives 3.5.",
          "Adding an int and a float gives a float.",
          "str(number) turns a number into text you can join with plus.",
          "int(28.5) cuts off the decimal part and gives 28.",
        ],
      },
      { type: "heading", text: "The solution" },
      {
        type: "para",
        text: "Here is one correct solution, using the sample values shown in the output.",
      },
      {
        type: "code",
        title: "Solution",
        code: `first = int("25")
second = float("3.5")
total = first + second
print(total)
print("The total is " + str(total))
print(int(total))`,
        output: "28.5\nThe total is 28.5\n28",
      },
      {
        type: "para",
        text: "The sum is 28.5, a float, because one of the two numbers was a float. Converting 28.5 to an int cuts off the .5 and leaves 28, without rounding up.",
      },
      {
        type: "code",
        title: "Check: the same idea with different values",
        code: `first = int("100")
second = float("0.99")
total = first + second
print(total)
print("The total is " + str(total))
print(int(total))`,
        output: "100.99\nThe total is 100.99\n100",
      },
      {
        type: "note",
        text: "If the text cannot become a number, like int(\"hello\"), Python stops with a ValueError. In real programs, that conversion should sit inside a try block.",
      },
    ],
    practice: [
      "Solve the challenge with the text values \"40\" and \"2.5\".",
      "Convert the string \"99\" to a float and print its type.",
      "Convert the float 7.9 to an int and to a string, and print both results.",
    ],
    summary: [
      "int and float turn text into numbers; str turns numbers into text.",
      "Adding an int and a float gives a float.",
      "int cuts off the decimal part without rounding.",
      "A conversion that cannot work raises a ValueError.",
    ],
  },
  {
    slug: "python-strings",
    title: "Python Strings",
    intro:
      "A string is text in Python. This page explains how to create strings, measure them, join them, and pick out single characters.",
    blocks: [
      { type: "heading", text: "What is a string?" },
      {
        type: "para",
        text: "A string is a sequence of characters, such as letters, digits, spaces, and symbols. You create a string by writing text inside single or double quotes. Both kinds of quotes work the same way, so pick one style and use it most of the time. An empty pair of quotes makes an empty string with no characters at all.",
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
      { type: "heading", text: "Repeating and searching" },
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
    slug: "python-strings-slicing",
    title: "Slicing Strings",
    intro:
      "Slicing cuts out part of a string. It is how you take the first word, the last letters, or a reversed copy of any text.",
    blocks: [
      { type: "heading", text: "What is slicing?" },
      {
        type: "para",
        text: "Slicing takes a piece of a string using square brackets with a start and a stop, written as text[start:stop]. The slice starts at the start index and stops just before the stop index, so the character at the stop index is not included. This rule takes a little practice, but it makes slices easy to measure: the length of text[2:5] is always 3.",
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
      { type: "heading", text: "Leaving out the start or the stop" },
      {
        type: "para",
        text: "You can leave out the start or the stop. Leaving out the start means from the beginning, and leaving out the stop means to the end. Leaving out both gives a copy of the whole string. These shortcuts keep slices short and readable.",
      },
      {
        type: "code",
        title: "Shortcuts for slices",
        code: `word = "Hello"
print(word[:3])
print(word[2:])
print(word[:])
print(word[-2:])`,
        output: "Hel\nllo\nHello\nlo",
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
        type: "note",
        text: "Slicing never gives an error when the indexes are too big. text[0:100] on a short string simply gives the whole string, while text[100] on its own gives an IndexError.",
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
      "Slicing past the end never errors; it just gives what is there.",
    ],
  },
  {
    slug: "python-strings-modify",
    title: "Modify Strings",
    intro:
      "Strings cannot be changed in place, but Python gives you many ways to build a new, changed string from an old one. This page covers the most useful ones.",
    blocks: [
      { type: "heading", text: "Strings are immutable" },
      {
        type: "para",
        text: "A string in Python cannot be changed after it is created. Writing name[0] = \"J\" gives a TypeError. To change a string, you build a new string from pieces of the old one and store it in a variable, often the same variable.",
      },
      {
        type: "code",
        title: "Building a new string from pieces",
        code: `name = "Python"
name = "J" + name[1:]
print(name)
name = name.replace("J", "P")
print(name)`,
        output: "Jython\nPython",
      },
      { type: "heading", text: "Changing case" },
      {
        type: "para",
        text: "The upper, lower, and title methods return a new string with the case changed. Upper makes every letter capital, lower makes every letter small, and title capitalises the first letter of every word. These are handy when user input arrives in mixed case and you need one clean form to compare or store.",
      },
      {
        type: "code",
        title: "Changing case",
        code: `text = "hello world"
print(text.upper())
print(text.title())
print("HELLO".lower())`,
        output: "HELLO WORLD\nHello World\nhello",
      },
      { type: "heading", text: "Cleaning spaces and replacing text" },
      {
        type: "para",
        text: "The strip method removes spaces from both ends of a string, which is useful for cleaning up user input. The replace method swaps one piece of text for another, everywhere it appears.",
      },
      {
        type: "code",
        title: "Strip and replace",
        code: `text = "  hello world  "
print(text.strip())
print("hello".replace("l", "L"))
print("banana".replace("a", "o"))`,
        output: "hello world\nheLLo\nbonono",
      },
      {
        type: "note",
        text: "String methods return a new string and never change the original, because strings are immutable. You must store the result, like name = name.strip(), or the cleaned text is lost.",
      },
    ],
    practice: [
      "Take the string \"  PYTHON is FUN  \", strip it, and print it in lowercase.",
      "Replace every space in your name with a dash using replace, and print the result.",
      "Change the first letter of \"python\" to a capital by building a new string from pieces.",
    ],
    summary: [
      "Strings are immutable: you cannot change one character in place.",
      "Build a new string from pieces, or use a method that returns a new string.",
      "upper, lower, and title change the case of a string.",
      "strip removes spaces from the ends, and replace swaps one piece for another.",
    ],
  },
  {
    slug: "python-strings-concatenate",
    title: "Concatenate Strings",
    intro:
      "Concatenation means joining strings together into one longer string. This page shows the ways to join strings and which one to use when.",
    blocks: [
      { type: "heading", text: "Joining with plus" },
      {
        type: "para",
        text: "The plus sign joins two strings, gluing the second string onto the end of the first. This is called concatenation. You can join as many strings as you like in one expression, but remember to add spaces yourself where you need them.",
      },
      {
        type: "code",
        title: "Joining strings with plus",
        code: `first = "Ada"
last = "Lovelace"
full = first + " " + last
print(full)
print("Hello, " + full + "!")`,
        output: "Ada Lovelace\nHello, Ada Lovelace!",
      },
      { type: "heading", text: "Joining a list with join" },
      {
        type: "para",
        text: "When you have a list of strings, the join method is the cleanest way to glue them together. You call it on the separator string, and pass the list. Join is faster than adding strings in a loop, and it puts the separator between every pair of items.",
      },
      {
        type: "code",
        title: "Joining a list of words",
        code: `words = ["Python", "is", "fun"]
print(" ".join(words))
print("-".join(["2026", "11", "16"]))
print(", ".join(["apple", "banana", "mango"]))`,
        output: "Python is fun\n2026-11-16\napple, banana, mango",
      },
      { type: "heading", text: "Joining numbers and text" },
      {
        type: "para",
        text: "Plus can only join text with text. Trying to join a string and a number with plus gives a TypeError, so you must convert the number to text first with str. An f-string avoids this problem entirely, because it converts values for you.",
      },
      {
        type: "code",
        title: "Numbers need converting, or use an f-string",
        code: `age = 17
print("Age: " + str(age))
print(f"Age: {age}")
print("Score: " + str(95) + " out of 100")`,
        output: "Age: 17\nAge: 17\nScore: 95 out of 100",
      },
      {
        type: "note",
        text: "For joining many strings in a loop, build a list and join it once at the end. Adding strings with plus inside a loop is slow, because each plus makes a whole new string.",
      },
    ],
    practice: [
      "Join your first and last name with a space and print the result.",
      "Join the list [\"red\", \"green\", \"blue\"] with a comma and a space.",
      "Print a sentence with your age in it using an f-string and then using plus with str.",
    ],
    summary: [
      "Plus joins two strings; remember to add spaces yourself.",
      "join glues a list of strings together with a separator.",
      "Plus cannot join a string and a number; convert the number with str first.",
      "f-strings are the clearest way to build sentences with values inside them.",
    ],
  },
  {
    slug: "python-strings-format",
    title: "Format Strings",
    intro:
      "Formatting means putting values into a string in a controlled way. This page covers f-strings and the format method, including how to control numbers.",
    blocks: [
      { type: "heading", text: "F-strings: the modern way" },
      {
        type: "para",
        text: "Put the letter f just before the opening quote of a string, and anything inside curly braces is evaluated and placed into the string. The variable is replaced by its value, so you no longer need to join pieces with plus signs or commas.",
      },
      {
        type: "code",
        title: "Your first f-string",
        code: `name = "Asha"
age = 20
print(f"My name is {name} and I am {age} years old.")`,
        output: "My name is Asha and I am 20 years old.",
      },
      { type: "heading", text: "Calculations inside f-strings" },
      {
        type: "para",
        text: "The braces can hold more than a variable name. You can put any expression inside them: arithmetic, a method call, or a value formatted to a fixed number of decimal places.",
      },
      {
        type: "code",
        title: "Expressions and number formatting",
        code: `price = 199
quantity = 3
print(f"Total: Rs. {price * quantity}")
pi = 3.14159
print(f"Pi rounded: {pi:.2f}")`,
        output: "Total: Rs. 597\nPi rounded: 3.14",
      },
      { type: "heading", text: "Formatting numbers" },
      {
        type: "para",
        text: "The format inside the braces controls how a number looks. A colon followed by .2f shows two decimal places, a comma adds thousands separators, and a percent sign shows the value as a percentage.",
      },
      {
        type: "code",
        title: "Number formats in f-strings",
        code: `print(f"{1000:,}")
print(f"{0.85:.0%}")
print(f"{7 / 3:.3f}")
print(f"{42:05d}")`,
        output: "1,000\n85%\n2.333\n00042",
      },
      {
        type: "note",
        text: "Inside an f-string you cannot use the same kind of quote as the one that opens the string. Use single quotes inside a double-quoted f-string, or the other way round.",
      },
    ],
    practice: [
      "Create variables for your name, city, and age, then print one sentence about yourself with a single f-string.",
      "Use an f-string to print the total price of 4 notebooks at Rs. 45 each, with the calculation inside the braces.",
      "Format the number 1234.5678 to two decimal places inside an f-string.",
    ],
    summary: [
      "An f-string starts with f before the quote and evaluates expressions in curly braces.",
      "Braces can hold variables, arithmetic, method calls, and conditions.",
      ":.2f formats a number to two decimal places, and a comma adds thousands separators.",
      "The format method does the same job with placeholders, but f-strings are clearer.",
    ],
  },
  {
    slug: "python-strings-escape",
    title: "Escape Characters",
    intro:
      "Some characters are hard to type inside a string. Escape characters let you put new lines, tabs, and quotes inside a string.",
    blocks: [
      { type: "heading", text: "What is an escape character?" },
      {
        type: "para",
        text: "An escape sequence is a backslash followed by a letter, and Python turns it into a special character. A backslash tells Python that the next character is special, not ordinary text, so the string can hold characters that would otherwise end it or break it.",
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
      { type: "heading", text: "Quotes inside a string" },
      {
        type: "para",
        text: "A string in double quotes cannot contain a plain double quote, because Python would think the string ends there. A backslash before the quote solves it. The simpler trick is to wrap the string in the other kind of quote: use single quotes around text that contains double quotes, and double quotes around text that contains single quotes.",
      },
      {
        type: "code",
        title: "Quotes inside a string",
        code: `print('She said, "Hello!"')
print("It's a nice day")
print("She said, \\"Hi\\"")`,
        output: "She said, \"Hello!\"\nIt's a nice day\nShe said, \"Hi\"",
      },
      { type: "heading", text: "Backslashes and file paths" },
      {
        type: "para",
        text: "A Windows file path contains backslashes, and each one must be doubled in a normal string, or Python will read it as an escape sequence. A raw string, written with the letter r before the quote, treats backslashes as plain characters, which is much easier for paths.",
      },
      {
        type: "code",
        title: "Raw strings for paths",
        code: `print("C:\\\\Users\\\\Ada")
print(r"C:\\Users\\Ada")`,
        output: "C:\\Users\\Ada\nC:\\Users\\Ada",
      },
    ],
    practice: [
      "Print two lines of a poem using one print statement and a new line escape sequence.",
      "Print the sentence: She said, \"Python is fun!\" using single quotes around the string.",
      "Print a Windows-style path with a raw string, then print the same path with doubled backslashes.",
    ],
    summary: [
      "An escape sequence is a backslash followed by a letter.",
      "Backslash n makes a new line and backslash t makes a tab.",
      "Use the other kind of quote to avoid escaping quotes inside a string.",
      "A raw string with r before the quote keeps backslashes as plain characters.",
    ],
  },
  {
    slug: "python-strings-methods",
    title: "String Methods",
    intro:
      "String methods are built-in tools that change, search, and split text. They are the fastest way to clean up real-world text.",
    blocks: [
      { type: "heading", text: "What is a method?" },
      {
        type: "para",
        text: "A method is a function that belongs to a value. You call it by writing the value, a dot, and the method name, like text.upper(). String methods cover the everyday jobs of text: changing case, removing spaces, replacing words, and splitting sentences into lists.",
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
      "Check whether \"42\" is a digit string and whether \"hello\" is an alphabetic string.",
    ],
    summary: [
      "A method is called with a dot after the string, like text.upper().",
      "strip removes spaces from both ends, and replace swaps one piece for another.",
      "count and find search inside a string, and startswith and endswith test its edges.",
      "split breaks a string into a list, and join glues a list into a string.",
    ],
  },
  {
    slug: "python-strings-exercises",
    title: "String Exercises",
    intro:
      "A set of practice exercises on strings. Try each one yourself, then check your answer against the solution below it.",
    blocks: [
      { type: "heading", text: "Exercise 1: First and last letters" },
      {
        type: "para",
        text: "Store your name in a variable. Print its length, its first letter, and its last letter, each on its own line.",
      },
      {
        type: "code",
        title: "Exercise 1: answer",
        code: `name = "Ada"
print(len(name))
print(name[0])
print(name[-1])`,
        output: "3\nA\na",
      },
      { type: "heading", text: "Exercise 2: Reverse a word" },
      {
        type: "para",
        text: "Take the word \"Python\" and print it backwards using a slice with a step of -1.",
      },
      {
        type: "code",
        title: "Exercise 2: answer",
        code: `word = "Python"
print(word[::-1])`,
        output: "nohtyP",
      },
      { type: "heading", text: "Exercise 3: Clean up messy input" },
      {
        type: "para",
        text: "A user typed \"  HELLO WORLD  \" with extra spaces and capital letters. Strip the spaces, make it lowercase, and then title case, and print each result.",
      },
      {
        type: "code",
        title: "Exercise 3: answer",
        code: `text = "  HELLO WORLD  "
clean = text.strip()
print(clean.lower())
print(clean.title())`,
        output: "hello world\nHello World",
      },
      {
        type: "note",
        text: "If an exercise feels hard, break it into smaller steps. Work out one piece, print it, and check it before moving on to the next piece.",
      },
    ],
    practice: [
      "Do Exercise 1 with your own name.",
      "Slice the word \"Programming\" to get just \"gram\".",
      "Count how many times the letter a appears in the word \"banana\" using count.",
    ],
    summary: [
      "Indexes start at 0, and negative indexes count from the end.",
      "A slice with a step of -1 reverses a string.",
      "strip, lower, and title clean up messy text.",
      "split turns a sentence into a list of words.",
    ],
  },
  {
    slug: "python-challenges-strings-basics",
    title: "Code Challenge",
    intro:
      "A small challenge to test what you learned about strings. Try it yourself before reading the solution.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Write a program that takes a full name like \"ada lovelace\" and prints it in title case. Then print the first name only, the last name only, and the full name backwards. Finally, print whether the name contains the letter a, and how many times the letter a appears.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "title() capitalises the first letter of every word.",
          "split() breaks the name into a list of words.",
          "A slice with a step of -1 reverses a string.",
          "in tests whether a piece is inside a string, and count tells you how many times it appears.",
        ],
      },
      { type: "heading", text: "The solution" },
      {
        type: "para",
        text: "Here is one correct solution, using the sample name shown in the output.",
      },
      {
        type: "code",
        title: "Solution",
        code: `name = "ada lovelace"
name = name.title()
print(name)
parts = name.split()
print(parts[0])
print(parts[1])
print(name[::-1])
print("a" in name.lower())
print(name.lower().count("a"))`,
        output: "Ada Lovelace\nAda\nLovelace\necalevoL adA\nTrue\n3",
      },
      {
        type: "para",
        text: "The name is cleaned to title case first, then split into two words. The reversed string is built with a slice, and the letter count uses the lowercase version so that the capital A at the start is counted too.",
      },
      {
        type: "code",
        title: "Check: the same program with another name",
        code: `name = "alan turing"
name = name.title()
print(name)
parts = name.split()
print(parts[0], parts[1])
print(name[::-1])`,
        output: "Alan Turing\nAlan Turing\ngniruT nalA",
      },
      {
        type: "tip",
        text: "When you count or search for a letter, convert the string to lowercase first, so that capital and small versions of the letter are treated the same.",
      },
    ],
    practice: [
      "Solve the challenge with your own full name.",
      "Print your name in uppercase, then slice out the first three letters.",
      "Count how many times the letter e appears in your favourite food.",
    ],
    summary: [
      "title() fixes the case of a name, and split() breaks it into words.",
      "A slice with a step of -1 reverses a string.",
      "in tests for a piece inside a string, and count tells you how many times it appears.",
      "Convert to lowercase before counting a letter, so capitals are counted too.",
    ],
  },
  {
    slug: "python-booleans",
    title: "Booleans",
    intro:
      "A boolean is a value that is either True or False. Booleans are the result of every comparison, and they are what if statements test.",
    blocks: [
      { type: "heading", text: "What is a boolean?" },
      {
        type: "para",
        text: "A boolean has only two possible values: True and False. They are written with a capital first letter in Python. Booleans answer yes-or-no questions, such as whether a user is old enough or whether a list is empty.",
      },
      {
        type: "code",
        title: "Booleans from comparisons",
        code: `print(10 > 9)
print(10 == 9)
print(10 < 9)
print(5 == 5)`,
        output: "True\nFalse\nFalse\nTrue",
      },
      { type: "heading", text: "Booleans from the bool function" },
      {
        type: "para",
        text: "The bool function turns any value into True or False. Zero, empty text, and empty collections are False, and almost everything else is True. This rule is handy when you test whether a user typed anything at all, or whether a number is zero.",
      },
      {
        type: "code",
        title: "What is True and what is False",
        code: `print(bool(1))
print(bool(0))
print(bool("hello"))
print(bool(""))
print(bool([]))
print(bool([0]))`,
        output: "True\nFalse\nTrue\nFalse\nFalse\nTrue",
      },
      { type: "heading", text: "Booleans in if statements" },
      {
        type: "para",
        text: "An if statement runs its block when its condition is True and skips it when the condition is False. You can store a boolean in a variable first, which makes the condition easy to read.",
      },
      {
        type: "code",
        title: "A boolean variable in an if",
        code: `age = 20
can_vote = age >= 18
print(can_vote)
if can_vote:
    print("You can vote")`,
        output: "True\nYou can vote",
      },
      {
        type: "note",
        text: "True and False are also numbers in Python: True is 1 and False is 0. So True + True gives 2. This is a useful fact, but do not rely on it in normal code.",
      },
    ],
    practice: [
      "Print the results of 5 > 3, 5 == 3, and 5 != 3.",
      "Use bool() on 0, 1, \"\", \"hi\", and [] and print the results.",
      "Store a boolean called is_raining and print a different message depending on its value.",
    ],
    summary: [
      "A boolean is either True or False, written with a capital first letter.",
      "Comparisons give booleans, and if statements test them.",
      "Zero, empty text, and empty collections are False; almost everything else is True.",
      "Storing a condition in a named boolean makes code easier to read.",
    ],
  },
  {
    slug: "python-challenges-booleans",
    title: "Code Challenge",
    intro:
      "A small challenge to test what you learned about booleans. Try it yourself before reading the solution.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Write a program that stores a user's age and whether they have a ticket. Print whether they can enter a show, which needs an age of 18 or more AND a ticket. Then print whether they can enter a different show, which needs an age of 18 or more OR a ticket. Test the program with two different sets of values.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "age >= 18 gives a boolean that is True when the user is old enough.",
          "and gives True only when both sides are True.",
          "or gives True when at least one side is True.",
          "Store each result in a variable with a clear name before printing it.",
        ],
      },
      { type: "heading", text: "The solution" },
      {
        type: "para",
        text: "Here is one correct solution, using the sample values shown in the output.",
      },
      {
        type: "code",
        title: "Solution",
        code: `age = 20
has_ticket = True
old_enough = age >= 18
strict_show = old_enough and has_ticket
easy_show = old_enough or has_ticket
print("Strict show:", strict_show)
print("Easy show:", easy_show)`,
        output: "Strict show: True\nEasy show: True",
      },
      {
        type: "para",
        text: "With an age of 20 and a ticket, both shows allow entry. The second set of values shows the difference between and and or: a 15-year-old with a ticket fails the strict show but passes the easy one.",
      },
      {
        type: "code",
        title: "Check: a younger user with a ticket",
        code: `age = 15
has_ticket = True
old_enough = age >= 18
strict_show = old_enough and has_ticket
easy_show = old_enough or has_ticket
print("Strict show:", strict_show)
print("Easy show:", easy_show)`,
        output: "Strict show: False\nEasy show: True",
      },
      {
        type: "tip",
        text: "When a condition gets long, store its parts in named booleans first. old_enough and has_ticket reads far better than age >= 18 and has_ticket == True.",
      },
    ],
    practice: [
      "Solve the challenge with an age of 17 and no ticket, and work out both answers by hand first.",
      "Write a program that prints whether a number is between 10 and 20 using and.",
      "Use bool() to test whether an empty string and a non-empty string are True or False.",
    ],
    summary: [
      "Comparisons give booleans: True or False.",
      "and needs both sides True; or needs at least one side True.",
      "Storing conditions in named booleans makes code easy to read.",
      "Test every combination of values when a rule has more than one condition.",
    ],
  },
  {
    slug: "python-operators",
    title: "Python Operators",
    intro:
      "Operators are symbols that do something with values, like adding numbers or comparing them. This page gives you the map of all the operator groups in Python.",
    blocks: [
      { type: "heading", text: "What is an operator?" },
      {
        type: "para",
        text: "An operator is a symbol that works on one or more values, called operands, and produces a result. For example, in 2 + 3, the plus sign is the operator and 2 and 3 are the operands. Python has groups of operators for maths, assignment, comparison, logic, identity, membership, and bit-level work.",
      },
      {
        type: "code",
        title: "One operator from each group",
        code: `print(10 + 5)
print(10 == 10)
print(True and False)
print("a" in "apple")
print(2 ** 3)`,
        output: "15\nTrue\nFalse\nTrue\n8",
      },
      { type: "heading", text: "The operator groups" },
      {
        type: "list",
        items: [
          "Arithmetic: +, -, *, /, %, //, and ** for maths.",
          "Assignment: =, +=, -=, *=, and more, for storing values.",
          "Comparison: ==, !=, >, <, >=, and <=, which give True or False.",
          "Logical: and, or, and not, for combining booleans.",
          "Identity: is and is not, for checking whether two names point to the same object.",
          "Membership: in and not in, for checking whether a value is inside a collection.",
          "Bitwise: &, |, ^, ~, <<, and >>, for working with single bits.",
        ],
      },
      { type: "heading", text: "Operators have an order" },
      {
        type: "para",
        text: "When an expression has more than one operator, Python follows a fixed order called precedence. Brackets come first, then powers, then multiplication and division, then addition and subtraction, and comparisons come last. When in doubt, use brackets to make the order clear.",
      },
      {
        type: "code",
        title: "Order matters",
        code: `print(10 + 2 * 3)
print((10 + 2) * 3)
print(2 ** 3 ** 2)`,
        output: "16\n36\n512",
      },
      {
        type: "note",
        text: "The next pages in this section cover each operator group in detail, with examples for every operator in the group.",
      },
    ],
    practice: [
      "Write one expression using each of these operators: +, -, *, /, %, and **.",
      "Print the results of 5 == 5, 5 != 5, and 5 > 3.",
      "Work out 2 + 3 * 4 by hand, then check your answer in Python.",
    ],
    summary: [
      "An operator works on values called operands and produces a result.",
      "Python has arithmetic, assignment, comparison, logical, identity, membership, and bitwise operators.",
      "Comparison operators give True or False.",
      "Operators follow a fixed order, and brackets make the order clear.",
    ],
  },
  {
    slug: "python-operators-arithmetic",
    title: "Arithmetic Operators",
    intro:
      "Arithmetic operators do maths with numbers. This page covers all seven of them, with examples for each one.",
    blocks: [
      { type: "heading", text: "The seven arithmetic operators" },
      {
        type: "list",
        items: [
          "Plus (+) adds two numbers.",
          "Minus (-) subtracts one number from another.",
          "Star (*) multiplies two numbers.",
          "Slash (/) divides and always gives a float.",
          "Double slash (//) divides and gives the whole-number part.",
          "Percent (%) gives the remainder after division.",
          "Double star (**) raises a number to a power.",
        ],
      },
      {
        type: "code",
        title: "All seven operators on 10 and 3",
        code: `print(10 + 3)
print(10 - 3)
print(10 * 3)
print(10 / 3)
print(10 // 3)
print(10 % 3)
print(2 ** 3)`,
        output: "13\n7\n30\n3.3333333333333335\n3\n1\n8",
      },
      { type: "heading", text: "Remainder and whole-number division" },
      {
        type: "para",
        text: "The remainder operator is useful for testing whether a number is even or odd, and for splitting things into groups. A number is even when number % 2 is 0. Whole-number division tells you how many full groups fit, and the remainder tells you what is left over.",
      },
      {
        type: "code",
        title: "Even or odd, and sharing sweets",
        code: `print(7 % 2)
print(8 % 2)
print(17 // 5)
print(17 % 5)`,
        output: "1\n0\n3\n2",
      },
      { type: "heading", text: "Powers" },
      {
        type: "para",
        text: "The double star raises a number to a power. 2 ** 10 is 1024, and a fractional power works as a root: 9 ** 0.5 is 3.0, the square root of 9.",
      },
      {
        type: "code",
        title: "Powers and roots",
        code: `print(2 ** 10)
print(3 ** 2)
print(9 ** 0.5)`,
        output: "1024\n9\n3.0",
      },
      {
        type: "note",
        text: "Division with a single slash always gives a float, even when the answer is whole. 8 / 2 prints 4.0, not 4.",
      },
    ],
    practice: [
      "Print the answers to 15 divided by 4 using both / and //, and the remainder using %.",
      "Use % to test whether 21 and 30 are even or odd.",
      "Work out 2 to the power of 10 and the square root of 144 using **.",
    ],
    summary: [
      "The seven arithmetic operators are +, -, *, /, //, %, and **.",
      "/ always gives a float; // gives the whole-number part.",
      "% gives the remainder, which tests even and odd numbers.",
      "** raises a number to a power, and a fractional power gives a root.",
    ],
  },
  {
    slug: "python-operators-assign",
    title: "Assignment Operators",
    intro:
      "Assignment operators store a value in a variable, and the short forms combine a calculation with the assignment in one step.",
    blocks: [
      { type: "heading", text: "The plain assignment" },
      {
        type: "para",
        text: "The single equals sign assigns a value to a variable. It does not test whether two values are equal; that is the job of the double equals sign. Mixing them up is one of the most common beginner mistakes.",
      },
      {
        type: "code",
        title: "Assigning a value",
        code: `x = 5
print(x)
x = 10
print(x)`,
        output: "5\n10",
      },
      { type: "heading", text: "Short forms that combine maths and assignment" },
      {
        type: "para",
        text: "Writing x = x + 3 is so common that Python gives you a shorter form: x += 3. It means exactly the same thing: add 3 to x and store the result back in x. There is a short form for every arithmetic operator.",
      },
      {
        type: "code",
        title: "The short forms in action",
        code: `x = 10
x += 3
print(x)
x -= 3
print(x)
x *= 2
print(x)
x /= 2
print(x)`,
        output: "13\n10\n20\n10.0",
      },
      { type: "heading", text: "The rest of the short forms" },
      {
        type: "para",
        text: "The same pattern works for whole-number division, remainder, and powers. Each one does the calculation and stores the result back in the same variable.",
      },
      {
        type: "code",
        title: "More short forms",
        code: `x = 10
x //= 3
print(x)
x %= 2
print(x)
x = 2
x **= 3
print(x)`,
        output: "3\n1\n8",
      },
      {
        type: "note",
        text: "A single equals sign assigns a value, and a double equals sign compares two values. If a condition behaves strangely, check your equals signs first.",
      },
    ],
    practice: [
      "Start with x = 5, then use +=, -=, and *= to change it, printing after each step.",
      "Use //= and %= on a number and print the results.",
      "Write a program that starts a total at 0 and adds 10, 20, and 30 to it with +=.",
    ],
    summary: [
      "A single equals sign assigns a value; a double equals sign compares values.",
      "x += 3 means the same as x = x + 3.",
      "There is a short form for every arithmetic operator: +=, -=, *=, /=, //=, %=, and **=.",
      "Short forms make counters and totals much easier to read.",
    ],
  },
  {
    slug: "python-ternary-operator",
    title: "Ternary Operator",
    intro:
      "The ternary operator is a short if-else that fits on one line. It picks one of two values based on a condition.",
    blocks: [
      { type: "heading", text: "What is a ternary operator?" },
      {
        type: "para",
        text: "Python's ternary operator, also called a conditional expression, has the form value_if_true if condition else value_if_false. It tests the condition and gives back the first value when it is True and the second value when it is False. It is a short way to write an if-else that only picks a value.",
      },
      {
        type: "code",
        title: "Picking a value in one line",
        code: `age = 20
status = "adult" if age >= 18 else "minor"
print(status)
age = 15
status = "adult" if age >= 18 else "minor"
print(status)`,
        output: "adult\nminor",
      },
      { type: "heading", text: "Ternary versus if-else" },
      {
        type: "para",
        text: "A ternary expression is an expression, which means it produces a value you can store, print, or pass to a function. A normal if statement is a statement, which runs a block of code. Use a ternary when you only need to pick between two values, and use if-else when you need to run several lines.",
      },
      {
        type: "code",
        title: "The same choice as an if-else",
        code: `age = 20
if age >= 18:
    status = "adult"
else:
    status = "minor"
print(status)
print("adult" if age >= 18 else "minor")`,
        output: "adult\nadult",
      },
      { type: "heading", text: "Ternary inside print and f-strings" },
      {
        type: "para",
        text: "Because a ternary is an expression, it fits neatly inside a print or an f-string. This is handy for messages that change based on a value, like showing a different word for a pass or a fail.",
      },
      {
        type: "code",
        title: "A conditional inside a message",
        code: `marks = 82
print(f"Result: {'Pass' if marks >= 40 else 'Fail'}")
print("Even" if 7 % 2 == 0 else "Odd")`,
        output: "Result: Pass\nOdd",
      },
      {
        type: "note",
        text: "Do not nest ternaries inside each other. A nested ternary is hard to read, and a normal if-elif-else chain is clearer.",
      },
    ],
    practice: [
      "Use a ternary to store \"Pass\" or \"Fail\" from a marks value of 35, then print it.",
      "Use a ternary inside a print to say whether 9 is even or odd.",
      "Rewrite an if-else that picks a greeting into a single ternary expression.",
    ],
    summary: [
      "A ternary has the form value_if_true if condition else value_if_false.",
      "It picks one of two values based on a condition.",
      "Use it when you only need to pick a value, not run several lines.",
      "Do not nest ternaries; use if-elif-else for longer chains.",
    ],
  },
  {
    slug: "python-operators-comparison",
    title: "Comparison Operators",
    intro:
      "Comparison operators compare two values and give back True or False. They are the building blocks of every condition in a program.",
    blocks: [
      { type: "heading", text: "The six comparison operators" },
      {
        type: "list",
        items: [
          "Double equals (==) tests whether two values are equal.",
          "Not equals (!=) tests whether two values are different.",
          "Greater than (>) tests whether the left value is larger.",
          "Less than (<) tests whether the left value is smaller.",
          "Greater than or equal (>=) includes the boundary value.",
          "Less than or equal (<=) includes the boundary value.",
        ],
      },
      {
        type: "code",
        title: "Comparing numbers",
        code: `print(5 == 5)
print(5 != 6)
print(5 > 3)
print(5 < 3)
print(5 >= 5)
print(5 <= 4)`,
        output: "True\nTrue\nTrue\nFalse\nTrue\nFalse",
      },
      { type: "heading", text: "Comparing strings" },
      {
        type: "para",
        text: "Strings compare in alphabetical order, using the order of their characters. Capital letters come before small letters, so \"Zebra\" is smaller than \"apple\" in Python. The equals sign tests whether two strings hold exactly the same characters.",
      },
      {
        type: "code",
        title: "Comparing strings",
        code: `print("apple" < "banana")
print("cat" == "Cat")
print("Zebra" < "apple")`,
        output: "True\nFalse\nTrue",
      },
      { type: "heading", text: "Chained comparisons" },
      {
        type: "para",
        text: "Python lets you chain comparisons, so you can write 10 <= age < 20 instead of age >= 10 and age < 20. Both forms mean the same thing, but the chained form reads more like plain English.",
      },
      {
        type: "code",
        title: "Chained comparisons",
        code: `age = 15
print(10 <= age < 20)
print(18 <= age < 30)
print(1 < 2 < 3)`,
        output: "True\nFalse\nTrue",
      },
      {
        type: "note",
        text: "A single equals sign assigns a value, and a double equals sign compares values. Writing if age = 18 is a syntax error in Python, which is a helpful safety net.",
      },
    ],
    practice: [
      "Print the results of 10 == 10, 10 != 10, 10 > 5, and 10 <= 10.",
      "Compare the strings \"apple\" and \"Apple\" with == and explain the result.",
      "Use a chained comparison to test whether a number is between 10 and 20.",
    ],
    summary: [
      "Comparison operators give True or False.",
      "== tests equality and != tests difference; a single = assigns a value.",
      "Strings compare in alphabetical order, with capitals sorting first.",
      "Comparisons can be chained, like 10 <= age < 20.",
    ],
  },
  {
    slug: "python-operators-logical",
    title: "Logical Operators",
    intro:
      "Logical operators combine booleans into bigger conditions. They are how you say both of these must be true, or at least one of them must be true.",
    blocks: [
      { type: "heading", text: "The three logical operators" },
      {
        type: "list",
        items: [
          "and gives True only when both sides are True.",
          "or gives True when at least one side is True.",
          "not flips a boolean: not True is False, and not False is True.",
        ],
      },
      {
        type: "code",
        title: "and, or, and not",
        code: `print(True and True)
print(True and False)
print(True or False)
print(False or False)
print(not True)
print(not False)`,
        output: "True\nFalse\nTrue\nFalse\nFalse\nTrue",
      },
      { type: "heading", text: "Combining comparisons" },
      {
        type: "para",
        text: "Logical operators are most useful when combined with comparisons. For example, a person can vote when they are 18 or older and they are a citizen. Both parts must be true, so the two comparisons are joined with and.",
      },
      {
        type: "code",
        title: "Real conditions with and and or",
        code: `age = 20
is_citizen = True
print(age >= 18 and is_citizen)
print(age >= 18 or is_citizen)
age = 15
print(age >= 18 and is_citizen)
print(age >= 18 or is_citizen)`,
        output: "True\nTrue\nFalse\nTrue",
      },
      { type: "heading", text: "Short-circuit behaviour" },
      {
        type: "para",
        text: "Python stops as soon as it knows the answer. With and, if the left side is False, the answer must be False, so Python does not check the right side. With or, if the left side is True, the answer must be True, so Python skips the right side. This is called short-circuiting, and it matters when the right side has a side effect or could cause an error.",
      },
      {
        type: "code",
        title: "Not flips a condition",
        code: `is_raining = False
print(not is_raining)
age = 15
print(not (age >= 18))`,
        output: "True\nTrue",
      },
      {
        type: "note",
        text: "and has higher precedence than or, so a and b or c means (a and b) or c. Use brackets when the grouping is not obvious.",
      },
    ],
    practice: [
      "Print the results of True and False, True or False, and not True.",
      "Write a condition that is True only when a number is between 10 and 20.",
      "Write a condition using not that is True when a user is under 18.",
    ],
    summary: [
      "and needs both sides True; or needs at least one side True.",
      "not flips a boolean.",
      "Logical operators combine comparisons into bigger conditions.",
      "Python short-circuits: it stops as soon as the answer is known.",
    ],
  },
  {
    slug: "python-operators-identity",
    title: "Identity Operators",
    intro:
      "Identity operators test whether two names point to the same object in memory. They answer a different question from the equals sign.",
    blocks: [
      { type: "heading", text: "is and is not" },
      {
        type: "para",
        text: "The is operator gives True when two names refer to the very same object, not just to two objects with equal values. The is not operator gives the opposite result. Equality, with ==, tests whether two values are the same; identity, with is, tests whether two names point to the same object.",
      },
      {
        type: "code",
        title: "Equal values, different objects",
        code: `a = [1, 2, 3]
b = a
c = [1, 2, 3]
print(a is b)
print(a is c)
print(a == c)`,
        output: "True\nFalse\nTrue",
      },
      { type: "heading", text: "Why the difference matters" },
      {
        type: "para",
        text: "When b = a, both names point to the same list, so changing the list through b also changes what a sees. When c is a separate list with the same values, changing c does not affect a. The is operator tells you which case you have.",
      },
      {
        type: "code",
        title: "One list, two names",
        code: `a = [1, 2, 3]
b = a
b.append(4)
print(a)
print(a is b)`,
        output: "[1, 2, 3, 4]\nTrue",
      },
      { type: "heading", text: "The correct use: None" },
      {
        type: "para",
        text: "The most common correct use of is is testing for None, the special value that means no value. There is only one None object in Python, so x is None is the right test. Using == None works too, but is is the accepted style.",
      },
      {
        type: "code",
        title: "Testing for None with is",
        code: `value = None
print(value is None)
print(value is not None)
value = 5
print(value is None)`,
        output: "True\nFalse\nFalse",
      },
      {
        type: "note",
        text: "Do not use is to compare numbers or strings. Python sometimes reuses small numbers and short strings, so 1000 is 1000 can be True or False depending on how the values were made. Always use == for value comparisons.",
      },
    ],
    practice: [
      "Create two lists with the same values and print a == b and a is b.",
      "Assign b = a for a list, change the list through b, and print a.",
      "Set a variable to None and test it with is None and is not None.",
    ],
    summary: [
      "is tests whether two names point to the same object.",
      "== tests whether two values are equal.",
      "Two lists with the same values are equal but not identical.",
      "Use is mainly to test for None.",
    ],
  },
  {
    slug: "python-operators-membership",
    title: "Membership Operators",
    intro:
      "Membership operators test whether a value is inside a collection. They give a clean True or False answer without writing a loop.",
    blocks: [
      { type: "heading", text: "in and not in" },
      {
        type: "para",
        text: "The in operator gives True when a value appears in a collection, and False when it does not. The not in operator gives the opposite result. Both work with lists, tuples, sets, dictionaries, and strings.",
      },
      {
        type: "code",
        title: "Membership in lists and strings",
        code: `print(2 in [1, 2, 3])
print(5 in [1, 2, 3])
print(5 not in [1, 2, 3])
print("a" in "banana")
print("z" not in "banana")`,
        output: "True\nFalse\nTrue\nTrue\nTrue",
      },
      { type: "heading", text: "Membership in dictionaries" },
      {
        type: "para",
        text: "For a dictionary, in tests the keys, not the values. The test \"name\" in student is True when the dictionary has a key called name, even if you do not care what its value is. This is the safe way to check for a key before reading it, so you avoid a KeyError.",
      },
      {
        type: "code",
        title: "Checking dictionary keys",
        code: `student = {"name": "Ada", "age": 17}
print("name" in student)
print("city" in student)
print("Ada" in student)`,
        output: "True\nFalse\nFalse",
      },
      { type: "heading", text: "Membership in sets" },
      {
        type: "para",
        text: "Membership tests on sets are very fast, even for large sets, because Python does not need to scan the items one by one. If you only need to test whether an item is present, a set is the best collection for the job.",
      },
      {
        type: "code",
        title: "Membership in a set",
        code: `colors = {"red", "green", "blue"}
print("red" in colors)
print("yellow" in colors)
print("yellow" not in colors)`,
        output: "True\nFalse\nTrue",
      },
      {
        type: "note",
        text: "For a string, in tests whether one string appears inside another. \"gram\" in \"Programming\" is True, because the letters g-r-a-m appear together in that order.",
      },
    ],
    practice: [
      "Check whether 7 is in the list [1, 3, 5, 7, 9] and whether 8 is not in it.",
      "Check whether the letter e is in your name, using in.",
      "Create a dictionary and test whether a key exists before reading it.",
    ],
    summary: [
      "in gives True when a value appears in a collection.",
      "not in gives the opposite result.",
      "For a dictionary, in tests the keys, not the values.",
      "Membership tests on sets are fast, even for large sets.",
    ],
  },
  {
    slug: "python-operators-bitwise",
    title: "Bitwise Operators",
    intro:
      "Bitwise operators work on the single bits of a number. They are used in low-level code, flags, and puzzles, and this page shows what each one does.",
    blocks: [
      { type: "heading", text: "Numbers are bits underneath" },
      {
        type: "para",
        text: "Every integer is stored as a sequence of bits, which are zeros and ones. The number 5 is 101 in binary, and 3 is 011. Bitwise operators compare or move these bits one by one, and the result is a new number.",
      },
      {
        type: "code",
        title: "AND, OR, and XOR on bits",
        code: `print(5 & 3)
print(5 | 3)
print(5 ^ 3)
print(~5)`,
        output: "1\n7\n6\n-6",
      },
      { type: "heading", text: "What each operator does" },
      {
        type: "list",
        items: [
          "AND (&) gives 1 only where both bits are 1: 5 & 3 is 1, because only the last bit is 1 in both.",
          "OR (|) gives 1 where at least one bit is 1: 5 | 3 is 7.",
          "XOR (^) gives 1 where the bits are different: 5 ^ 3 is 6.",
          "NOT (~) flips every bit, and because Python numbers are signed, ~5 is -6.",
        ],
      },
      { type: "heading", text: "Shifting bits" },
      {
        type: "para",
        text: "The left shift operator moves all bits to the left, which doubles the number for each step. The right shift moves them to the right, which halves the number for each step, dropping any remainder.",
      },
      {
        type: "code",
        title: "Shifting left and right",
        code: `print(5 << 1)
print(5 << 2)
print(5 >> 1)
print(20 >> 2)`,
        output: "10\n20\n2\n5",
      },
      {
        type: "para",
        text: "Shifting is also used to set and test flags, where each bit stands for one yes-or-no option. A single number can then hold many flags at once, which is common in settings and permissions.",
      },
      {
        type: "code",
        title: "Testing a single bit",
        code: `flags = 5
print(flags & 1)
print(flags & 2)
print(flags & 4)`,
        output: "1\n0\n4",
      },
    ],
    practice: [
      "Work out 6 & 3, 6 | 3, and 6 ^ 3 by hand, then check in Python.",
      "Print 3 << 3 and 16 >> 2 and explain each result.",
      "Use & to test whether the number 12 has the bit for 4 set.",
    ],
    summary: [
      "&, |, and ^ compare bits one by one: AND, OR, and XOR.",
      "~ flips every bit, so ~5 is -6.",
      "<< doubles a number per step and >> halves it per step.",
      "Bitwise operators are mainly used for flags and low-level work.",
    ],
  },
  {
    slug: "python-operators-precedence",
    title: "Operator Precedence",
    intro:
      "Precedence is the order in which Python works out the parts of an expression. This page shows the order and how brackets change it.",
    blocks: [
      { type: "heading", text: "What is precedence?" },
      {
        type: "para",
        text: "When an expression has more than one operator, Python follows a fixed order called precedence. Brackets come first, then powers, then multiplication and division, then addition and subtraction, and comparisons come last. Without this order, an expression like 2 + 3 * 4 would have two possible answers.",
      },
      {
        type: "code",
        title: "Multiplication before addition",
        code: `print(2 + 3 * 4)
print((2 + 3) * 4)
print(10 - 2 * 3)`,
        output: "14\n20\n4",
      },
      { type: "heading", text: "The order, highest first" },
      {
        type: "list",
        items: [
          "Brackets: ( ) group parts of an expression first.",
          "Powers: ** come next, and they group from right to left.",
          "Unary plus and minus: -x and +x.",
          "Multiplication, division, whole division, and remainder: *, /, //, %.",
          "Addition and subtraction: +, -.",
          "Comparisons: ==, !=, >, <, >=, <=, in, is.",
          "not, then and, then or come last.",
        ],
      },
      {
        type: "code",
        title: "Powers group from the right",
        code: `print(2 ** 3 ** 2)
print((2 ** 3) ** 2)
print(-2 ** 2)`,
        output: "512\n64\n-4",
      },
      { type: "heading", text: "When in doubt, use brackets" },
      {
        type: "para",
        text: "Nobody remembers the whole precedence table by heart. When an expression mixes operators, add brackets to make the order obvious. Brackets cost nothing and stop a whole class of mistakes.",
      },
      {
        type: "code",
        title: "Brackets make the order clear",
        code: `print(10 + 2 * 3)
print((10 + 2) * 3)
print(True or False and False)`,
        output: "16\n36\nTrue",
      },
      {
        type: "note",
        text: "The expression -2 ** 2 is -4, not 4, because the power is worked out before the minus sign. Write (-2) ** 2 when you mean the square of negative two.",
      },
    ],
    practice: [
      "Work out 2 + 3 * 4, (2 + 3) * 4, and 10 - 2 * 3 by hand, then check in Python.",
      "Print 2 ** 3 ** 2 and explain why the answer is 512.",
      "Add brackets to the expression 5 + 2 * 3 - 1 to make the order obvious.",
    ],
    summary: [
      "Precedence is the fixed order in which Python works out an expression.",
      "Brackets come first, then powers, then multiplication and division, then addition and subtraction.",
      "Powers group from right to left, so 2 ** 3 ** 2 is 512.",
      "When in doubt, add brackets to make the order clear.",
    ],
  },
  {
    slug: "python-challenges-operators-basics",
    title: "Code Challenge",
    intro:
      "A small challenge to test what you learned about operators. Try it yourself before reading the solution.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Write a program that works out whether a student passes an exam. Store the marks out of 100. A student passes when the marks are 40 or more. Print whether they passed using a comparison, print whether the marks are between 40 and 100 using a chained comparison, and print the grade using a ternary: \"Distinction\" when marks are 75 or more, otherwise \"Pass\" or \"Fail\".",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "marks >= 40 gives True when the student passes.",
          "A chained comparison like 40 <= marks <= 100 tests a range in one step.",
          "A ternary has the form value_if_true if condition else value_if_false.",
          "Two ternaries can be nested, but keep it simple: one for Distinction or not, then one for Pass or Fail.",
        ],
      },
      { type: "heading", text: "The solution" },
      {
        type: "para",
        text: "Here is one correct solution, using the sample marks shown in the output.",
      },
      {
        type: "code",
        title: "Solution",
        code: `marks = 82
passed = marks >= 40
in_range = 40 <= marks <= 100
grade = "Distinction" if marks >= 75 else ("Pass" if marks >= 40 else "Fail")
print("Passed:", passed)
print("In range:", in_range)
print("Grade:", grade)`,
        output: "Passed: True\nIn range: True\nGrade: Distinction",
      },
      {
        type: "para",
        text: "With 82 marks, the student passes, the marks are in range, and the grade is Distinction. The nested ternary is kept short and readable by putting the second ternary in brackets.",
      },
      {
        type: "code",
        title: "Check: a failing student",
        code: `marks = 35
passed = marks >= 40
in_range = 40 <= marks <= 100
grade = "Distinction" if marks >= 75 else ("Pass" if marks >= 40 else "Fail")
print("Passed:", passed)
print("In range:", in_range)
print("Grade:", grade)`,
        output: "Passed: False\nIn range: False\nGrade: Fail",
      },
      {
        type: "tip",
        text: "When a rule has more than one condition, test it with values on both sides of every boundary: 39, 40, 74, 75, and 100.",
      },
    ],
    practice: [
      "Solve the challenge with marks of 55 and check that the grade is Pass.",
      "Write a program that tests whether a number is even and greater than 10, using % and and.",
      "Use a ternary to print \"Adult\" or \"Minor\" from an age of 16.",
    ],
    summary: [
      "Comparison operators give True or False.",
      "Chained comparisons test a range in one step.",
      "A ternary picks one of two values based on a condition.",
      "Test boundary values like 39, 40, 74, and 75 when a rule has limits.",
    ],
  },
  {
    slug: "python-lists",
    title: "Python Lists",
    intro:
      "A list stores many values in one place, in order. Lists hold the items of a shopping cart, the scores of a class, or the names in a team, and you can change them as the program runs.",
    blocks: [
      { type: "heading", text: "What is a list?" },
      {
        type: "para",
        text: "A list is written with square brackets and commas between the items. A list can hold numbers, strings, or even a mix of both, although keeping one type in a list is usually cleaner.",
      },
      {
        type: "code",
        title: "Creating and reading a list",
        code: `fruits = ["apple", "banana", "mango"]
print(fruits)
print(fruits[0])
print(fruits[-1])
print(len(fruits))`,
        output: "['apple', 'banana', 'mango']\napple\nmango\n3",
      },
      { type: "heading", text: "Changing a list" },
      {
        type: "para",
        text: "Lists are mutable, which means you can change them after you create them. You can replace an item by its index, add new items to the end, and remove items you no longer need.",
      },
      {
        type: "code",
        title: "Changing, adding, and slicing",
        code: `numbers = [10, 20, 30, 40, 50]
print(numbers[1:4])
numbers[0] = 99
print(numbers)
numbers.append(60)
print(numbers)`,
        output: "[20, 30, 40]\n[99, 20, 30, 40, 50]\n[99, 20, 30, 40, 50, 60]",
      },
      { type: "heading", text: "Looping over a list" },
      {
        type: "para",
        text: "A for loop is the natural partner of a list. It visits each item once, in order, so you can print, check, or process every item without writing the index by hand.",
      },
      {
        type: "code",
        title: "A loop over a list",
        code: `names = ["Asha", "Ravi", "Meera"]
for name in names:
    print("Hello,", name)`,
        output: "Hello, Asha\nHello, Ravi\nHello, Meera",
      },
      {
        type: "note",
        text: "Reading past the end of a list, like fruits[3] when the list has three items, raises an IndexError. The last valid index is always len(list) - 1.",
      },
    ],
    practice: [
      "Create a list of your five favourite movies and print the first and the last one.",
      "Replace the middle movie with a new one, add one more at the end, and print the whole list.",
      "Write a loop that prints each number in [2, 4, 6, 8] multiplied by 10.",
    ],
    summary: [
      "A list holds ordered values in square brackets and can mix types.",
      "Indexing starts at 0; negative indexes count from the end.",
      "Lists are mutable: you can replace, append, and remove items.",
      "Slices take a range of items, and for loops visit every item in order.",
    ],
  },
  {
    slug: "python-lists-access",
    title: "Access List Items",
    intro:
      "Reading items out of a list is the most basic list skill. This page covers indexes, negative indexes, ranges, and checking whether an item exists.",
    blocks: [
      { type: "heading", text: "Reading by index" },
      {
        type: "para",
        text: "Items are numbered from zero, so the first item is at index 0 and the second is at index 1. You read an item by writing the list name, then the index in square brackets.",
      },
      {
        type: "code",
        title: "Indexes from the start and the end",
        code: `fruits = ["apple", "banana", "cherry", "mango"]
print(fruits[0])
print(fruits[1])
print(fruits[-1])
print(fruits[-2])`,
        output: "apple\nbanana\nmango\ncherry",
      },
      { type: "heading", text: "Reading a range with slices" },
      {
        type: "para",
        text: "A slice takes several items at once, using list[start:stop]. The slice starts at the start index and stops just before the stop index. Leaving out the start means from the beginning, and leaving out the stop means to the end.",
      },
      {
        type: "code",
        title: "Slices of a list",
        code: `numbers = [10, 20, 30, 40, 50]
print(numbers[1:4])
print(numbers[:3])
print(numbers[2:])
print(numbers[::2])`,
        output: "[20, 30, 40]\n[10, 20, 30]\n[30, 40, 50]\n[10, 30, 50]",
      },
      { type: "heading", text: "Checking whether an item exists" },
      {
        type: "para",
        text: "The in operator tests whether a value appears in a list. It gives True or False, and it is the safe way to check before you use index or remove, both of which fail when the value is missing.",
      },
      {
        type: "code",
        title: "Membership and position",
        code: `fruits = ["apple", "banana", "cherry"]
print("banana" in fruits)
print("mango" in fruits)
print(fruits.index("cherry"))`,
        output: "True\nFalse\n2",
      },
      {
        type: "note",
        text: "Reading past the end of a list raises an IndexError. The last valid index is len(list) - 1, so check the length or use in before you read an index you are not sure about.",
      },
    ],
    practice: [
      "Create a list of five colours and print the first, the third, and the last one.",
      "Slice the middle three items out of a list of seven numbers.",
      "Check whether \"mango\" is in a list of fruits, then find the index of \"banana\".",
    ],
    summary: [
      "Indexing starts at 0, and negative indexes count from the end.",
      "A slice list[start:stop] stops just before the stop index.",
      "in tests whether a value is in the list; index finds its position.",
      "Reading past the end raises an IndexError.",
    ],
  },
  {
    slug: "python-lists-change",
    title: "Change List Items",
    intro:
      "Lists are mutable, which means you can change them after you create them. This page covers replacing one item, replacing a slice, and changing values in place.",
    blocks: [
      { type: "heading", text: "Replacing one item" },
      {
        type: "para",
        text: "You replace an item by writing the list name, the index in square brackets, an equals sign, and the new value. The old value is gone, and the list keeps the same length.",
      },
      {
        type: "code",
        title: "Replacing items by index",
        code: `fruits = ["apple", "banana", "cherry"]
fruits[1] = "mango"
print(fruits)
fruits[-1] = "orange"
print(fruits)`,
        output: "['apple', 'mango', 'cherry']\n['apple', 'mango', 'orange']",
      },
      { type: "heading", text: "Replacing a slice" },
      {
        type: "para",
        text: "You can replace a whole slice with a new list. The new list can be longer or shorter than the slice it replaces, so the list can grow or shrink. This is a handy way to change several items at once.",
      },
      {
        type: "code",
        title: "Replacing a slice",
        code: `numbers = [1, 2, 3, 4, 5]
numbers[1:3] = [20, 30, 40]
print(numbers)
numbers[0:1] = []
print(numbers)`,
        output: "[1, 20, 30, 40, 4, 5]\n[20, 30, 40, 4, 5]",
      },
      { type: "heading", text: "Changing items in a loop" },
      {
        type: "para",
        text: "To change every item, loop over the indexes with range and len, and assign a new value at each index. Looping over the items directly gives you copies, so assigning to the loop variable does not change the list.",
      },
      {
        type: "code",
        title: "Doubling every number in place",
        code: `numbers = [1, 2, 3, 4]
for i in range(len(numbers)):
    numbers[i] = numbers[i] * 2
print(numbers)`,
        output: "[2, 4, 6, 8]",
      },
      {
        type: "note",
        text: "Assigning to an index that does not exist, like fruits[5] = \"kiwi\" on a list of three items, raises an IndexError. Use append to add a new item at the end instead.",
      },
    ],
    practice: [
      "Create a list of four fruits and replace the second one with a new fruit.",
      "Replace the first two items of a list of numbers with three new numbers.",
      "Use a loop to add 10 to every number in a list of five numbers.",
    ],
    summary: [
      "Replace an item with list[index] = new_value.",
      "Replacing a slice can grow or shrink the list.",
      "Loop over indexes with range and len to change every item.",
      "Assigning to an index past the end raises an IndexError; use append instead.",
    ],
  },
  {
    slug: "python-lists-add",
    title: "Add List Items",
    intro:
      "Lists grow as your program runs. This page covers the three ways to add items: append, insert, and extend.",
    blocks: [
      { type: "heading", text: "Adding to the end with append" },
      {
        type: "para",
        text: "The append method adds one item to the end of a list. It is the most common way to grow a list, and it is how programs collect results one by one, for example by appending each answer inside a loop.",
      },
      {
        type: "code",
        title: "Appending items",
        code: `fruits = ["apple", "banana"]
fruits.append("mango")
print(fruits)
fruits.append("orange")
print(fruits)`,
        output: "['apple', 'banana', 'mango']\n['apple', 'banana', 'mango', 'orange']",
      },
      { type: "heading", text: "Adding at a position with insert" },
      {
        type: "para",
        text: "The insert method adds an item at a chosen position. You pass the index and the value, and the items after that position shift one place to the right. Inserting at index 0 puts the new item first.",
      },
      {
        type: "code",
        title: "Inserting at a position",
        code: `fruits = ["apple", "banana", "mango"]
fruits.insert(1, "cherry")
print(fruits)
fruits.insert(0, "kiwi")
print(fruits)`,
        output: "['apple', 'cherry', 'banana', 'mango']\n['kiwi', 'apple', 'cherry', 'banana', 'mango']",
      },
      { type: "heading", text: "Adding many items with extend" },
      {
        type: "para",
        text: "The extend method adds every item from another list to the end. It is different from append: appending a list adds the whole list as one item, while extending adds each of its items separately.",
      },
      {
        type: "code",
        title: "extend versus append with a list",
        code: `a = [1, 2]
b = [3, 4]
a.extend(b)
print(a)
c = [1, 2]
c.append(b)
print(c)`,
        output: "[1, 2, 3, 4]\n[1, 2, [3, 4]]",
      },
      {
        type: "note",
        text: "The plus sign also joins two lists into a new list, like [1, 2] + [3, 4]. Extend changes the list in place, while plus makes a new one and leaves the originals alone.",
      },
    ],
    practice: [
      "Start with a list of two fruits, append a third, and insert a new fruit at position 1.",
      "Use extend to join two lists of your friends' names.",
      "Build a list of squares by appending x * x inside a loop over range(1, 6).",
    ],
    summary: [
      "append adds one item to the end of a list.",
      "insert adds an item at a chosen position.",
      "extend adds every item from another list to the end.",
      "Appending a list adds it as one item; extending adds its items separately.",
    ],
  },
  {
    slug: "python-lists-remove",
    title: "Remove List Items",
    intro:
      "Lists shrink as well as grow. This page covers the ways to remove items: remove, pop, del, and clear.",
    blocks: [
      { type: "heading", text: "Removing by value with remove" },
      {
        type: "para",
        text: "The remove method deletes the first item with a given value. If the value appears more than once, only the first one is removed. If the value is not in the list, remove raises a ValueError, so check with in first when you are not sure.",
      },
      {
        type: "code",
        title: "Removing by value",
        code: `fruits = ["apple", "banana", "cherry", "banana"]
fruits.remove("banana")
print(fruits)
print("banana" in fruits)`,
        output: "['apple', 'cherry', 'banana']\nTrue",
      },
      { type: "heading", text: "Removing by position with pop" },
      {
        type: "para",
        text: "The pop method removes an item by its index and hands it back to you, so you can store it in a variable. Without an index, pop removes the last item. This is handy when you need to use the removed value, for example when taking the next task off a list.",
      },
      {
        type: "code",
        title: "Popping items",
        code: `tasks = ["wash", "cook", "clean"]
done = tasks.pop()
print(done)
print(tasks)
first = tasks.pop(0)
print(first)
print(tasks)`,
        output: "clean\n['wash', 'cook']\nwash\n['cook']",
      },
      { type: "heading", text: "Deleting with del and clearing with clear" },
      {
        type: "para",
        text: "The del statement removes an item by index, or a whole slice, and it does not return the removed value. The clear method removes every item and leaves an empty list.",
      },
      {
        type: "code",
        title: "del and clear",
        code: `numbers = [1, 2, 3, 4, 5]
del numbers[1]
print(numbers)
del numbers[0:2]
print(numbers)
numbers.clear()
print(numbers)`,
        output: "[1, 3, 4, 5]\n[4, 5]\n[]",
      },
      {
        type: "note",
        text: "remove and pop raise an error when the value or index is missing. Check with in first for remove, and check the length first for pop.",
      },
    ],
    practice: [
      "Create a list of five fruits, remove one by value, and pop the last one.",
      "Use del to remove the second item from a list of numbers.",
      "Clear a list and print its length to confirm it is empty.",
    ],
    summary: [
      "remove deletes the first item with a given value.",
      "pop removes an item by index and returns it.",
      "del removes an item or a slice without returning it.",
      "clear removes every item and leaves an empty list.",
    ],
  },

  {
    slug: "python-lists-loop",
    title: "Loop Lists",
    intro:
      "A loop visits every item in a list, one at a time. This page shows the ways to loop over a list, with and without the index.",
    blocks: [
      { type: "heading", text: "The basic for loop" },
      {
        type: "para",
        text: "A for loop is the natural partner of a list. It visits each item once, in order, so you can print, check, or process every item without writing the index by hand.",
      },
      {
        type: "code",
        title: "A loop over a list",
        code: `names = ["Asha", "Ravi", "Meera"]
for name in names:
    print("Hello,", name)`,
        output: "Hello, Asha\nHello, Ravi\nHello, Meera",
      },
      { type: "heading", text: "Looping with the index" },
      {
        type: "para",
        text: "Sometimes you need the position of each item as well as the item itself. The enumerate function gives you both: it hands you the index and the item together in each round of the loop.",
      },
      {
        type: "code",
        title: "Looping with enumerate",
        code: `fruits = ["apple", "banana", "mango"]
for i, fruit in enumerate(fruits):
    print(i, fruit)`,
        output: "0 apple\n1 banana\n2 mango",
      },
      { type: "heading", text: "Looping to build a result" },
      {
        type: "para",
        text: "A loop can also build up a result, such as a total. Start a variable at zero before the loop, add each item to it inside the loop, and print the result after the loop ends. The print must be outside the loop, at the same indentation as the for line, or it will print after every step instead of once at the end.",
      },
      {
        type: "code",
        title: "Adding numbers with a loop",
        code: `numbers = [10, 20, 30, 40]
total = 0
for n in numbers:
    total = total + n
print("Total:", total)`,
        output: "Total: 100",
      },
      {
        type: "note",
        text: "Do not change a list while you loop over it. Removing items during a loop skips items, because the indexes shift under the loop. Build a new list instead, or loop over a copy.",
      },
    ],
    practice: [
      "Make a list of five animals and print each one with a loop.",
      "Use enumerate to print each fruit with its position number.",
      "Use a loop to add the numbers in [5, 10, 15, 20] and print the total.",
    ],
    summary: [
      "A for loop visits each item in a list once, in order.",
      "enumerate gives you both the index and the item.",
      "Build up results like totals by updating a variable inside the loop.",
      "Do not change a list while you loop over it.",
    ],
  },
  {
    slug: "python-lists-comprehension",
    title: "List Comprehension",
    intro:
      "List comprehension builds a new list from an old one in a single short line. It replaces a loop and an append with one clear expression.",
    blocks: [
      { type: "heading", text: "What is a list comprehension?" },
      {
        type: "para",
        text: "A list comprehension has the form [expression for item in list]. It runs the expression once for each item and collects the results into a new list. The loop version needs three lines; the comprehension needs one.",
      },
      {
        type: "code",
        title: "The loop version and the comprehension",
        code: `squares = []
for x in range(5):
    squares.append(x * x)
print(squares)
squares = [x * x for x in range(5)]
print(squares)`,
        output: "[0, 1, 4, 9, 16]\n[0, 1, 4, 9, 16]",
      },
      { type: "heading", text: "Adding a condition" },
      {
        type: "para",
        text: "You can add an if at the end of a comprehension to keep only the items that pass a test. Only those items are used to build the new list, and the rest are skipped.",
      },
      {
        type: "code",
        title: "Filtering with if",
        code: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = [x for x in numbers if x % 2 == 0]
print(evens)
long_words = [w for w in ["cat", "elephant", "dog", "giraffe"] if len(w) > 3]
print(long_words)`,
        output: "[2, 4, 6, 8, 10]\n['elephant', 'giraffe']",
      },
      { type: "heading", text: "Changing each item" },
      {
        type: "para",
        text: "The expression at the start can change each item as it goes. You can turn strings to uppercase, convert numbers to strings, or apply any function to every item in the list.",
      },
      {
        type: "code",
        title: "Transforming items",
        code: `names = ["asha", "ravi", "meera"]
print([name.title() for name in names])
print([x * 10 for x in [2, 4, 6, 8]])`,
        output: "['Asha', 'Ravi', 'Meera']\n[20, 40, 60, 80]",
      },
      {
        type: "note",
        text: "A comprehension is best for one simple transformation or filter. If the logic needs several steps or nested conditions, a normal loop is clearer.",
      },
    ],
    practice: [
      "Build a list of the cubes of the numbers 1 to 5 using a comprehension.",
      "Use a comprehension to keep only the numbers greater than 10 from [5, 12, 8, 20, 3].",
      "Turn a list of lowercase names into uppercase with a comprehension.",
    ],
    summary: [
      "A list comprehension has the form [expression for item in list].",
      "It replaces a loop and an append with one line.",
      "An if at the end keeps only the items that pass a test.",
      "Keep comprehensions simple; use a loop for complicated logic.",
    ],
  },
  {
    slug: "python-lists-sort",
    title: "Sort Lists",
    intro:
      "Sorting puts a list in order, from smallest to largest or alphabetically. This page covers sort, sorted, and sorting in reverse.",
    blocks: [
      { type: "heading", text: "Sorting in place with sort" },
      {
        type: "para",
        text: "The sort method arranges a list in place, from smallest to largest, or alphabetically for strings. It changes the list itself and returns None, so do not write scores = scores.sort(), because that would replace your list with None.",
      },
      {
        type: "code",
        title: "Sorting numbers and strings",
        code: `scores = [85, 92, 78, 90]
scores.sort()
print(scores)
words = ["banana", "apple", "cherry"]
words.sort()
print(words)`,
        output: "[78, 85, 90, 92]\n['apple', 'banana', 'cherry']",
      },
      { type: "heading", text: "Sorting in reverse" },
      {
        type: "para",
        text: "Pass reverse=True to sort from largest to smallest. The reverse method, on the other hand, simply flips the order of the list without sorting it, so a list that was not sorted stays unsorted, just backwards.",
      },
      {
        type: "code",
        title: "Reverse sorting and reversing",
        code: `numbers = [3, 1, 4, 1, 5]
numbers.sort(reverse=True)
print(numbers)
numbers.reverse()
print(numbers)`,
        output: "[5, 4, 3, 1, 1]\n[1, 1, 3, 4, 5]",
      },
      { type: "heading", text: "Getting a sorted copy with sorted" },
      {
        type: "para",
        text: "The sorted function returns a new sorted list and leaves the original alone. Use it when you need the items in order but you do not want to change the original list.",
      },
      {
        type: "code",
        title: "sorted keeps the original",
        code: `marks = [88, 70, 95]
print(sorted(marks))
print(marks)
print(sorted(marks, reverse=True))`,
        output: "[70, 88, 95]\n[88, 70, 95]\n[95, 88, 70]",
      },
      {
        type: "note",
        text: "You cannot sort a list that mixes numbers and strings, because Python cannot compare a number with a string. Convert the items to one type first.",
      },
    ],
    practice: [
      "Sort the list [5, 3, 8, 3, 9] and print it, then sort it in reverse.",
      "Use sorted to print a list of names in alphabetical order without changing the original list.",
      "Sort a list of words by their length using the key argument with len.",
    ],
    summary: [
      "sort arranges a list in place and returns None.",
      "reverse=True sorts from largest to smallest.",
      "reverse flips the order without sorting.",
      "sorted returns a new sorted list and keeps the original.",
    ],
  },
  {
    slug: "python-lists-copy",
    title: "Copy Lists",
    intro:
      "Copying a list is trickier than it looks, because assigning a list to a new name does not copy it. This page shows how to make a real copy.",
    blocks: [
      { type: "heading", text: "Assignment does not copy" },
      {
        type: "para",
        text: "When you write b = a for a list, both names point to the same list. Changing the list through b also changes what a sees, because there is only one list. This is the most common list surprise for beginners.",
      },
      {
        type: "code",
        title: "Two names, one list",
        code: `a = [1, 2, 3]
b = a
b.append(4)
print(a)
print(b)`,
        output: "[1, 2, 3, 4]\n[1, 2, 3, 4]",
      },
      { type: "heading", text: "Making a real copy" },
      {
        type: "para",
        text: "The copy method makes a separate list with the same items. A slice of the whole list, a[:], and the list function, list(a), do the same thing. After a real copy, changing one list does not affect the other.",
      },
      {
        type: "code",
        title: "Three ways to copy a list",
        code: `a = [1, 2, 3]
b = a.copy()
c = a[:]
d = list(a)
b.append(4)
print(a)
print(b)
print(c)
print(d)`,
        output: "[1, 2, 3]\n[1, 2, 3, 4]\n[1, 2, 3]\n[1, 2, 3]",
      },
      { type: "heading", text: "Shallow copies and nested lists" },
      {
        type: "para",
        text: "The copy method makes a shallow copy: it copies the outer list, but the items inside are still shared. If the list holds other lists, changing an inner list through the copy also changes the original. For a full independent copy of nested lists, use copy.deepcopy.",
      },
      {
        type: "code",
        title: "A shallow copy shares inner lists",
        code: `a = [[1, 2], [3, 4]]
b = a.copy()
b[0].append(99)
print(a)
print(b)`,
        output: "[[1, 2, 99], [3, 4]]\n[[1, 2, 99], [3, 4]]",
      },
      {
        type: "note",
        text: "For a list of plain numbers or strings, copy, a[:], and list(a) are all safe. Only nested lists need deepcopy, because only they share inner objects.",
      },
    ],
    practice: [
      "Create a list, assign it to a second name, change the second list, and print both.",
      "Copy a list with the copy method, change the copy, and print both to confirm they are separate.",
      "Use list() to copy a list of your favourite movies, then add a new movie to the copy.",
    ],
    summary: [
      "Assigning a list to a new name does not copy it; both names point to one list.",
      "copy, a[:], and list(a) make a separate list with the same items.",
      "A shallow copy shares inner lists, so nested lists need deepcopy.",
      "For flat lists of numbers or strings, any of the three copy methods is safe.",
    ],
  },
  {
    slug: "python-lists-join",
    title: "Join Lists",
    intro:
      "Joining lists means combining two or more lists into one. This page covers plus, extend, and the ways to join without changing the originals.",
    blocks: [
      { type: "heading", text: "Joining with plus" },
      {
        type: "para",
        text: "The plus sign joins two lists into a new list, leaving the originals unchanged. You can join as many lists as you like in one expression.",
      },
      {
        type: "code",
        title: "Joining lists with plus",
        code: `a = [1, 2]
b = [3, 4]
print(a + b)
print(a)
print(b)
print([1, 2] + [3, 4] + [5, 6])`,
        output: "[1, 2, 3, 4]\n[1, 2]\n[3, 4]\n[1, 2, 3, 4, 5, 6]",
      },
      { type: "heading", text: "Joining in place with extend" },
      {
        type: "para",
        text: "The extend method adds every item from another list to the end of the first list. It changes the first list and returns None. Use extend when you want to grow a list you already have, and plus when you want a new list.",
      },
      {
        type: "code",
        title: "Extending a list",
        code: `a = [1, 2]
b = [3, 4]
a.extend(b)
print(a)
print(b)`,
        output: "[1, 2, 3, 4]\n[3, 4]",
      },
      { type: "heading", text: "Repeating a list" },
      {
        type: "para",
        text: "The star operator repeats a list, making a longer list with the same items again and again. This is useful for building a list of default values, like a row of zeros.",
      },
      {
        type: "code",
        title: "Repeating a list with star",
        code: `print([0] * 5)
print([1, 2] * 3)
zeros = [0] * 4
print(zeros)`,
        output: "[0, 0, 0, 0, 0]\n[1, 2, 1, 2, 1, 2]\n[0, 0, 0, 0]",
      },
      {
        type: "note",
        text: "Repeating a list of lists with star shares the inner lists, so [[0]] * 3 gives three names for the same inner list. Build nested lists with a comprehension instead, like [[0] for _ in range(3)].",
      },
    ],
    practice: [
      "Join the lists [1, 2] and [3, 4] with plus and print the result.",
      "Use extend to join two lists of your friends' names, then print the combined list.",
      "Make a list of five zeros using the star operator.",
    ],
    summary: [
      "Plus joins two lists into a new list and leaves the originals unchanged.",
      "extend adds every item from another list to the end, changing the first list.",
      "Star repeats a list, which is handy for default values.",
      "Do not repeat a list of lists with star; the inner lists are shared.",
    ],
  },
  {
    slug: "python-lists-methods",
    title: "List Methods",
    intro:
      "List methods are built-in tools that add, remove, sort, and search items with one short call. This page is the reference for the methods you will use most.",
    blocks: [
      { type: "heading", text: "Adding and removing items" },
      {
        type: "para",
        text: "Append adds one item to the end of a list, and insert puts an item at a chosen position. To take items out, remove deletes the first item with a given value, and pop removes an item by index and hands it back to you.",
      },
      {
        type: "code",
        title: "append, insert, remove, pop",
        code: `colors = ["red", "blue"]
colors.append("green")
colors.insert(1, "yellow")
print(colors)
colors.remove("blue")
print(colors)
last = colors.pop()
print(last)
print(colors)`,
        output: "['red', 'yellow', 'blue', 'green']\n['red', 'yellow', 'green']\ngreen\n['red', 'yellow']",
      },
      { type: "heading", text: "Sorting and searching" },
      {
        type: "para",
        text: "Sort arranges a list in place, from smallest to largest, or alphabetically for strings. Count tells you how many times a value appears, and index tells you where a value first appears.",
      },
      {
        type: "code",
        title: "sort, count, index, reverse",
        code: `scores = [85, 92, 78, 92, 90]
scores.sort()
print(scores)
print(scores.count(92))
print(scores.index(78))
scores.reverse()
print(scores)`,
        output: "[78, 85, 90, 92, 92]\n2\n0\n[92, 92, 90, 85, 78]",
      },
      { type: "heading", text: "Methods that build new lists" },
      {
        type: "list",
        items: [
          "extend adds every item from another list to the end.",
          "copy makes a separate list with the same items.",
          "clear removes every item, leaving an empty list.",
          "sorted() returns a new sorted list and leaves the original alone.",
        ],
      },
      {
        type: "code",
        title: "extend and sorted",
        code: `a = [1, 2]
b = [3, 4]
a.extend(b)
print(a)
marks = [88, 70, 95]
print(sorted(marks))
print(marks)`,
        output: "[1, 2, 3, 4]\n[70, 88, 95]\n[88, 70, 95]",
      },
      {
        type: "note",
        text: "Remove and index raise a ValueError if the value is not in the list. Check with in first, for example if \"blue\" in colors, when you are not sure the value is there.",
      },
    ],
    practice: [
      "Start with [5, 3, 8, 3, 9], sort it, then count how many times 3 appears.",
      "Make a list of three tasks, insert a new task at position 1, then pop the last task and print it.",
      "Use extend to join two lists of your friends' names, then print the combined list in reverse order.",
    ],
    summary: [
      "append and insert add items; remove deletes by value and pop by index.",
      "sort and reverse change the list in place and return None.",
      "count and index search a list without writing a loop.",
      "extend joins lists; sorted() returns a new sorted list and keeps the original.",
    ],
  },
  {
    slug: "python-lists-exercises",
    title: "List Exercises",
    intro:
      "A set of practice exercises on lists. Try each one yourself, then check your answer against the solution below it.",
    blocks: [
      { type: "heading", text: "Exercise 1: First and last" },
      {
        type: "para",
        text: "Create a list of your five favourite movies. Print the first movie, the last movie, and the number of movies in the list.",
      },
      {
        type: "code",
        title: "Exercise 1: answer",
        code: `movies = ["Inception", "Dune", "Interstellar", "Avatar", "Jaws"]
print(movies[0])
print(movies[-1])
print(len(movies))`,
        output: "Inception\nJaws\n5",
      },
      { type: "heading", text: "Exercise 2: Change and add" },
      {
        type: "para",
        text: "Start with the list [5, 3, 8, 3, 9]. Replace the first item with 7, append 11 at the end, and remove the first 3. Print the list after each step.",
      },
      {
        type: "code",
        title: "Exercise 2: answer",
        code: `numbers = [5, 3, 8, 3, 9]
numbers[0] = 7
print(numbers)
numbers.append(11)
print(numbers)
numbers.remove(3)
print(numbers)`,
        output: "[7, 3, 8, 3, 9]\n[7, 3, 8, 3, 9, 11]\n[7, 8, 3, 9, 11]",
      },
      { type: "heading", text: "Exercise 3: Sum with a loop" },
      {
        type: "para",
        text: "Use a loop to add up the numbers in [10, 20, 30, 40] and print the total. Then do the same job with the built-in sum function.",
      },
      {
        type: "code",
        title: "Exercise 3: answer",
        code: `numbers = [10, 20, 30, 40]
total = 0
for n in numbers:
    total = total + n
print(total)
print(sum(numbers))`,
        output: "100\n100",
      },
      {
        type: "note",
        text: "If an exercise feels hard, break it into smaller steps. Write one line, print the list, and check it before moving on to the next step.",
      },
    ],
    practice: [
      "Do Exercise 1 with your own list of five favourite foods.",
      "Sort a list of five numbers, then print the smallest and largest values.",
      "Use a comprehension to build a list of the squares of the numbers 1 to 6.",
    ],
    summary: [
      "Indexes start at 0, and negative indexes count from the end.",
      "Replace items by index, add with append, and remove with remove.",
      "A loop can build up a total; sum does the same job in one call.",
      "A list comprehension builds a filtered or changed list in one line.",
    ],
  },
  {
    slug: "python-challenges-lists-basics",
    title: "Code Challenge",
    intro:
      "A small challenge to test what you learned about lists. Try it yourself before reading the solution.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Write a program that keeps a shopping list. Start with an empty list. Add three items with append, insert one item at the start, remove one item by value, and then print the final list, the number of items, and the items sorted alphabetically. Use a loop to print each item on its own line.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "append adds one item to the end; insert(0, item) puts one at the start.",
          "remove deletes the first item with a given value.",
          "len gives the number of items, and sorted gives a new sorted list.",
          "A for loop prints each item on its own line.",
        ],
      },
      { type: "heading", text: "The solution" },
      {
        type: "para",
        text: "Here is one correct solution, using the sample items shown in the output.",
      },
      {
        type: "code",
        title: "Solution",
        code: `shopping = []
shopping.append("milk")
shopping.append("bread")
shopping.append("eggs")
shopping.insert(0, "butter")
shopping.remove("bread")
print(shopping)
print("Items:", len(shopping))
print(sorted(shopping))
for item in shopping:
    print(item)`,
        output: "['butter', 'milk', 'eggs']\nItems: 3\n['butter', 'eggs', 'milk']\nbutter\nmilk\neggs",
      },
      {
        type: "para",
        text: "The list ends with three items: butter, milk, and eggs. The sorted copy shows them in alphabetical order, while the original list keeps its own order.",
      },
      {
        type: "code",
        title: "Check: the same program with different items",
        code: `shopping = []
shopping.append("rice")
shopping.append("dal")
shopping.insert(0, "oil")
print(shopping)
print("Items:", len(shopping))`,
        output: "['oil', 'rice', 'dal']\nItems: 3",
      },
      {
        type: "tip",
        text: "When you build a list step by step, print it after each step while you are learning, so you can see exactly what each method did.",
      },
    ],
    practice: [
      "Solve the challenge with three items of your own.",
      "Add a fourth item, sort the list in place, and print it.",
      "Use a loop to print each item with its position number using enumerate.",
    ],
    summary: [
      "append adds to the end and insert adds at a position.",
      "remove deletes the first item with a given value.",
      "len counts the items and sorted gives a new sorted list.",
      "A for loop prints each item on its own line.",
    ],
  },
  {
    slug: "python-tuples",
    title: "Python Tuples",
    intro:
      "A tuple is like a list, but it cannot be changed after it is created. Tuples are perfect for data that should stay fixed, like a point on a map or a date on a calendar.",
    blocks: [
      { type: "heading", text: "What is a tuple?" },
      {
        type: "para",
        text: "A tuple is written with round brackets and commas. Like a list, it keeps its items in order and lets you read them by index. Unlike a list, you cannot add, remove, or replace items once the tuple exists.",
      },
      {
        type: "code",
        title: "Creating and reading a tuple",
        code: `point = (3, 4)
print(point)
print(point[0])
print(point[1])
print(len(point))`,
        output: "(3, 4)\n3\n4\n2",
      },
      { type: "heading", text: "Why use a tuple instead of a list?" },
      {
        type: "list",
        items: [
          "Safety: nothing in your program can change the values by accident.",
          "Speed: tuples are a little faster and use a little less memory than lists.",
          "Meaning: a tuple says these values belong together and are fixed, like a date (16, 11, 2026).",
          "Keys: tuples can be used as dictionary keys, but lists cannot.",
        ],
      },
      { type: "heading", text: "Unpacking a tuple" },
      {
        type: "para",
        text: "You can pull the items of a tuple into separate variables in one line. This is called unpacking, and it makes code that returns several values very clean to read.",
      },
      {
        type: "code",
        title: "Unpacking and a one-item tuple",
        code: `name, age = ("Asha", 20)
print(name)
print(age)
single = (5,)
print(single)
print(type(single))`,
        output: "Asha\n20\n(5,)\n<class 'tuple'>",
      },
      {
        type: "note",
        text: "Trying to change a tuple item, like point[0] = 9, raises a TypeError. If you need to change the values, convert the tuple to a list with list(point), change the list, and convert it back with tuple().",
      },
      {
        type: "tip",
        text: "Use a tuple when the data is a fixed record, like coordinates or a name and age pair. Use a list when the collection will grow or change.",
      },
    ],
    practice: [
      "Create a tuple of your birth date (day, month, year) and print each part on its own line.",
      "Unpack a tuple (\"Delhi\", 28, 110001) into city, temperature, and pincode, then print them.",
      "Try changing one item of a tuple and read the error message Python gives you.",
    ],
    summary: [
      "A tuple is an ordered, unchangeable collection written with round brackets.",
      "You read tuple items by index, just like a list.",
      "Unpacking pulls tuple items into separate variables in one line.",
      "A one-item tuple needs a trailing comma: (5,).",
      "Choose tuples for fixed records and lists for collections that change.",
    ],
  },
  {
    slug: "python-tuples-access",
    title: "Access Tuples",
    intro:
      "Reading items out of a tuple works exactly like reading items out of a list. This page covers indexes, negative indexes, and slices.",
    blocks: [
      { type: "heading", text: "Reading by index" },
      {
        type: "para",
        text: "Items are numbered from zero, so the first item is at index 0 and the second is at index 1. A negative index counts from the end, so index -1 is the last item.",
      },
      {
        type: "code",
        title: "Indexes from the start and the end",
        code: `fruits = ("apple", "banana", "cherry", "mango")
print(fruits[0])
print(fruits[2])
print(fruits[-1])
print(fruits[-2])`,
        output: "apple\ncherry\nmango\ncherry",
      },
      { type: "heading", text: "Reading a range with slices" },
      {
        type: "para",
        text: "A slice takes several items at once, using tuple[start:stop]. The slice starts at the start index and stops just before the stop index. The result of slicing a tuple is a new tuple.",
      },
      {
        type: "code",
        title: "Slices of a tuple",
        code: `numbers = (10, 20, 30, 40, 50)
print(numbers[1:4])
print(numbers[:3])
print(numbers[2:])
print(numbers[::-1])`,
        output: "(20, 30, 40)\n(10, 20, 30)\n(30, 40, 50)\n(50, 40, 30, 20, 10)",
      },
      { type: "heading", text: "Checking whether an item exists" },
      {
        type: "para",
        text: "The in operator tests whether a value appears in a tuple, and len tells you how many items it holds. The index method tells you where a value first appears.",
      },
      {
        type: "code",
        title: "Membership, length, and position",
        code: `fruits = ("apple", "banana", "cherry")
print("banana" in fruits)
print("mango" in fruits)
print(len(fruits))
print(fruits.index("cherry"))`,
        output: "True\nFalse\n3\n2",
      },
      {
        type: "note",
        text: "Reading past the end of a tuple raises an IndexError, just like a list. The last valid index is len(tuple) - 1.",
      },
    ],
    practice: [
      "Create a tuple of five colours and print the first, the third, and the last one.",
      "Slice the middle three items out of a tuple of seven numbers.",
      "Check whether \"mango\" is in a tuple of fruits, then find the index of \"banana\".",
    ],
    summary: [
      "Indexing starts at 0, and negative indexes count from the end.",
      "A slice tuple[start:stop] stops just before the stop index.",
      "Slicing a tuple gives a new tuple.",
      "in tests membership, len counts items, and index finds a position.",
    ],
  },
  {
    slug: "python-tuples-update",
    title: "Update Tuples",
    intro:
      "Tuples cannot be changed, but there are three ways to get an updated tuple: convert it to a list, build a new tuple, or add to it with plus.",
    blocks: [
      { type: "heading", text: "Tuples cannot change in place" },
      {
        type: "para",
        text: "A tuple is immutable, which means you cannot add, remove, or replace its items. Writing point[0] = 9 raises a TypeError. That is the whole point of a tuple: the data stays exactly as it was created.",
      },
      {
        type: "code",
        title: "Trying to change a tuple fails",
        code: `point = (3, 4)
try:
    point[0] = 9
except TypeError as e:
    print("Error:", e)
print(point)`,
        output: "Error: 'tuple' object does not support item assignment\n(3, 4)",
      },
      { type: "heading", text: "Changing through a list" },
      {
        type: "para",
        text: "The usual way to update a tuple is to convert it to a list, change the list, and convert it back to a tuple. This gives you a new tuple with the change you wanted, and the original tuple is untouched.",
      },
      {
        type: "code",
        title: "Convert, change, convert back",
        code: `fruits = ("apple", "banana", "cherry")
temp = list(fruits)
temp[1] = "mango"
fruits = tuple(temp)
print(fruits)`,
        output: "('apple', 'mango', 'cherry')",
      },
      { type: "heading", text: "Adding items with plus" },
      {
        type: "para",
        text: "The plus operator joins two tuples into a new, longer tuple. The original tuples are not changed; a fresh tuple is built and you can store it in the same variable.",
      },
      {
        type: "code",
        title: "Joining tuples with plus",
        code: `fruits = ("apple", "banana")
fruits = fruits + ("mango",)
print(fruits)
numbers = (1, 2, 3)
numbers = numbers + (4, 5)
print(numbers)`,
        output: "('apple', 'banana', 'mango')\n(1, 2, 3, 4, 5)",
      },
      {
        type: "note",
        text: "A one-item tuple needs a trailing comma, as in (\"mango\",). Without the comma, Python reads (\"mango\") as just the string \"mango\" in brackets, not a tuple at all.",
      },
    ],
    practice: [
      "Create a tuple of three fruits, change the second one using the list trick, and print the result.",
      "Add a new item to a tuple using plus and print the new tuple.",
      "Try changing a tuple item directly and read the error message.",
    ],
    summary: [
      "Tuples are immutable: you cannot change an item in place.",
      "Convert to a list, change the list, and convert back to update a tuple.",
      "Plus joins two tuples into a new tuple.",
      "A one-item tuple needs a trailing comma.",
    ],
  },
  {
    slug: "python-tuples-unpack",
    title: "Unpack Tuples",
    intro:
      "Unpacking pulls the items of a tuple into separate variables in one line. It makes code that returns several values very clean to read.",
    blocks: [
      { type: "heading", text: "What is unpacking?" },
      {
        type: "para",
        text: "Unpacking assigns each item of a tuple to its own variable in a single line. The number of variables must match the number of items, or Python gives an error.",
      },
      {
        type: "code",
        title: "Unpacking a tuple",
        code: `name, age = ("Asha", 20)
print(name)
print(age)
point = (3, 4)
x, y = point
print("x =", x, "y =", y)`,
        output: "Asha\n20\nx = 3 y = 4",
      },
      { type: "heading", text: "Unpacking with a star" },
      {
        type: "para",
        text: "When a tuple has more items than you need, put a star in front of one variable. That variable collects all the leftover items into a list. The starred variable can sit anywhere in the list of names.",
      },
      {
        type: "code",
        title: "Collecting the rest with a star",
        code: `first, *rest = (1, 2, 3, 4, 5)
print(first)
print(rest)
a, *middle, z = (1, 2, 3, 4, 5)
print(a, middle, z)`,
        output: "1\n[2, 3, 4, 5]\n1 [2, 3, 4] 5",
      },
      { type: "heading", text: "Unpacking function results" },
      {
        type: "para",
        text: "Unpacking is most useful when a function returns several values. The function returns them as one tuple, and the caller unpacks the result into separate variables in one line.",
      },
      {
        type: "code",
        title: "A function that returns two values",
        code: `def min_max(numbers):
    return min(numbers), max(numbers)

small, large = min_max([4, 1, 9, 2])
print(small)
print(large)`,
        output: "1\n9",
      },
      {
        type: "note",
        text: "Only one starred variable is allowed in an unpacking, because two starred variables would leave Python unable to decide where one group ends and the other begins.",
      },
    ],
    practice: [
      "Unpack a tuple (\"Delhi\", 28, 110001) into city, temperature, and pincode, then print them.",
      "Unpack the tuple (1, 2, 3, 4, 5) into first, *rest and print both.",
      "Write a function that returns the sum and the average of a list, then unpack the result.",
    ],
    summary: [
      "Unpacking assigns each tuple item to its own variable in one line.",
      "The number of variables must match the number of items.",
      "A starred variable collects the leftover items into a list.",
      "Functions often return a tuple that the caller unpacks.",
    ],
  },
  {
    slug: "python-tuples-loop",
    title: "Loop Tuples",
    intro:
      "A loop works on a tuple exactly like it works on a list. This page shows the ways to loop over a tuple, with and without the index.",
    blocks: [
      { type: "heading", text: "The basic for loop" },
      {
        type: "para",
        text: "A for loop visits each item in a tuple once, in order. It is the same loop you use for lists, and it works because a tuple is a sequence, just like a list or a string.",
      },
      {
        type: "code",
        title: "Looping over a tuple",
        code: `days = ("Mon", "Tue", "Wed", "Thu", "Fri")
for day in days:
    print(day)`,
        output: "Mon\nTue\nWed\nThu\nFri",
      },
      { type: "heading", text: "Looping with the index" },
      {
        type: "para",
        text: "The enumerate function gives you both the index and the item in each round of the loop. This is handy when you need to number the items as you print them.",
      },
      {
        type: "code",
        title: "Looping with enumerate",
        code: `fruits = ("apple", "banana", "mango")
for i, fruit in enumerate(fruits):
    print(i, fruit)`,
        output: "0 apple\n1 banana\n2 mango",
      },
      { type: "heading", text: "Looping over pairs" },
      {
        type: "para",
        text: "A tuple often holds pairs, like a name and a score. When you loop over a tuple of tuples, you can unpack each pair directly in the loop line, which makes the code very readable.",
      },
      {
        type: "code",
        title: "Unpacking pairs in a loop",
        code: `scores = (("Asha", 90), ("Ravi", 85), ("Meera", 92))
for name, score in scores:
    print(name, "scored", score)`,
        output: "Asha scored 90\nRavi scored 85\nMeera scored 92",
      },
      {
        type: "note",
        text: "A loop cannot change the tuple it is looping over, because tuples are immutable. Build a new list or tuple from the results instead.",
      },
    ],
    practice: [
      "Make a tuple of five animals and print each one with a loop.",
      "Use enumerate to print each day of the week with its position number.",
      "Loop over a tuple of (name, marks) pairs and print each one in a sentence.",
    ],
    summary: [
      "A for loop visits each tuple item once, in order.",
      "enumerate gives you both the index and the item.",
      "Unpack pairs directly in the loop line for a tuple of tuples.",
      "A loop cannot change a tuple; build a new collection from the results.",
    ],
  },
  {
    slug: "python-tuples-join",
    title: "Join Tuples",
    intro:
      "Joining tuples means combining two or more tuples into one. This page covers plus, star, and the ways to join without changing the originals.",
    blocks: [
      { type: "heading", text: "Joining with plus" },
      {
        type: "para",
        text: "The plus operator joins two tuples into a new, longer tuple. Neither original tuple changes; a fresh tuple is built, and you can store it in a new variable or the same one.",
      },
      {
        type: "code",
        title: "Joining tuples with plus",
        code: `a = (1, 2, 3)
b = (4, 5)
print(a + b)
print(a)
print(b)`,
        output: "(1, 2, 3, 4, 5)\n(1, 2, 3)\n(4, 5)",
      },
      { type: "heading", text: "Repeating with star" },
      {
        type: "para",
        text: "The star operator repeats a tuple, making a longer tuple with the same items again and again. This is useful for building a tuple of default values.",
      },
      {
        type: "code",
        title: "Repeating a tuple",
        code: `print((1, 2) * 3)
print(("a",) * 4)
print((0,) * 5)`,
        output: "(1, 2, 1, 2, 1, 2)\n('a', 'a', 'a', 'a')\n(0, 0, 0, 0, 0)",
      },
      { type: "heading", text: "Joining many tuples" },
      {
        type: "para",
        text: "You can join more than two tuples in one expression. The plus operator works from left to right, building a new tuple at each step, so a + b + c is the same as (a + b) + c.",
      },
      {
        type: "code",
        title: "Joining three tuples",
        code: `a = ("red", "green")
b = ("blue",)
c = ("yellow", "orange")
print(a + b + c)`,
        output: "('red', 'green', 'blue', 'yellow', 'orange')",
      },
      {
        type: "note",
        text: "Because tuples are immutable, joining never changes the originals. That is different from lists, where extend changes the first list in place.",
      },
    ],
    practice: [
      "Join (\"red\", \"green\") and (\"blue\",) into one tuple and print it.",
      "Repeat the tuple (1, 2) three times and print the result.",
      "Join three tuples of your own into one tuple and print it.",
    ],
    summary: [
      "Plus joins tuples into a new tuple and leaves the originals unchanged.",
      "Star repeats a tuple.",
      "You can join more than two tuples in one expression.",
      "Joining never changes the original tuples, because they are immutable.",
    ],
  },
  {
    slug: "python-tuples-methods",
    title: "Tuple Methods",
    intro:
      "Tuples have only two methods of their own: count and index. This page covers them, along with the built-in functions that work on tuples.",
    blocks: [
      { type: "heading", text: "count and index" },
      {
        type: "para",
        text: "Tuples have only two methods: count and index. Count tells you how many times a value appears, and index tells you the position of its first appearance. There is no sort or append method on a tuple, because the data stays exactly as it was created.",
      },
      {
        type: "code",
        title: "count and index",
        code: `marks = (85, 90, 78, 90, 92)
print(marks.count(90))
print(marks.index(78))
print(marks.index(90))`,
        output: "2\n2\n1",
      },
      { type: "heading", text: "Built-in functions that work on tuples" },
      {
        type: "para",
        text: "The built-in functions len, min, max, and sum work on tuples, just like they work on lists. The sorted function also works, but it returns a list, not a tuple, so wrap the result in tuple if you need a tuple back.",
      },
      {
        type: "code",
        title: "len, min, max, sum, sorted",
        code: `marks = (85, 90, 78, 90, 92)
print(len(marks))
print(max(marks))
print(min(marks))
print(sum(marks))
print(sorted(marks))`,
        output: "5\n92\n78\n435\n[78, 85, 90, 90, 92]",
      },
      { type: "heading", text: "Membership and comparison" },
      {
        type: "para",
        text: "The in operator works on tuples just like on lists. You can also compare two tuples with ==, which checks whether they hold the same items in the same order, and with less-than and greater-than, which compare item by item from the left until one differs.",
      },
      {
        type: "code",
        title: "Membership and comparison",
        code: `print(2 in (1, 2, 3))
print(9 in (1, 2, 3))
print((1, 2, 3) == (1, 2, 3))
print((1, 3) > (1, 2))`,
        output: "True\nFalse\nTrue\nTrue",
      },
      {
        type: "note",
        text: "Index raises a ValueError when the value is not in the tuple. Check with in first when you are not sure the value is there.",
      },
    ],
    practice: [
      "For the tuple (4, 7, 4, 9, 4), print how many times 4 appears and the index of 9.",
      "Print the smallest, largest, and total of the tuple (10, 20, 30, 40).",
      "Use sorted on a tuple and print the result, then check its type.",
    ],
    summary: [
      "count and index are the only methods a tuple has.",
      "len, min, max, and sum work on tuples.",
      "sorted returns a list, not a tuple.",
      "Tuples compare item by item, starting from the left.",
    ],
  },
  {
    slug: "python-tuples-exercises",
    title: "Tuple Exercises",
    intro:
      "A set of practice exercises on tuples. Try each one yourself, then check your answer against the solution below it.",
    blocks: [
      { type: "heading", text: "Exercise 1: A birth date" },
      {
        type: "para",
        text: "Create a tuple of your birth date (day, month, year). Print each part on its own line, then print the whole tuple.",
      },
      {
        type: "code",
        title: "Exercise 1: answer",
        code: `birth = (16, 11, 2008)
print(birth[0])
print(birth[1])
print(birth[2])
print(birth)`,
        output: "16\n11\n2008\n(16, 11, 2008)",
      },
      { type: "heading", text: "Exercise 2: Unpack and swap" },
      {
        type: "para",
        text: "Store the values 10 and 20 in a tuple, unpack them into a and b, then swap them with a, b = b, a. Print a and b before and after the swap.",
      },
      {
        type: "code",
        title: "Exercise 2: answer",
        code: `a, b = (10, 20)
print("Before:", a, b)
a, b = b, a
print("After:", a, b)`,
        output: "Before: 10 20\nAfter: 20 10",
      },
      { type: "heading", text: "Exercise 3: Count and find" },
      {
        type: "para",
        text: "For the tuple (4, 7, 4, 9, 4), print how many times 4 appears, the index of 9, and the sum of all the items.",
      },
      {
        type: "code",
        title: "Exercise 3: answer",
        code: `numbers = (4, 7, 4, 9, 4)
print(numbers.count(4))
print(numbers.index(9))
print(sum(numbers))`,
        output: "3\n3\n28",
      },
      {
        type: "note",
        text: "If an exercise feels hard, break it into smaller steps. Write one line, print the tuple, and check it before moving on to the next step.",
      },
    ],
    practice: [
      "Do Exercise 1 with your own birth date.",
      "Create a tuple of three cities, unpack it, and print each city.",
      "Join two tuples of your own and print the result.",
    ],
    summary: [
      "Tuple items are read by index, just like a list.",
      "Unpacking pulls tuple items into separate variables.",
      "count and index are the only methods a tuple has.",
      "Convert to a list, change it, and convert back to update a tuple.",
    ],
  },
  {
    slug: "python-challenges-tuples-basics",
    title: "Code Challenge",
    intro:
      "A small challenge to test what you learned about tuples. Try it yourself before reading the solution.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Write a program that stores three students as tuples of (name, marks). Print each student's name and marks using a loop that unpacks the pairs. Then print the name of the student with the highest marks, and the average marks of all three, rounded to one decimal place.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "A tuple of tuples holds the three students: ((\"Asha\", 90), (\"Ravi\", 85), (\"Meera\", 92)).",
          "Unpack each pair directly in the loop line: for name, marks in students.",
          "max with a key finds the highest marks; a loop can also track the best student.",
          "The average is the total divided by 3, rounded with round(value, 1).",
        ],
      },
      { type: "heading", text: "The solution" },
      {
        type: "para",
        text: "Here is one correct solution, using the sample students shown in the output.",
      },
      {
        type: "code",
        title: "Solution",
        code: `students = (("Asha", 90), ("Ravi", 85), ("Meera", 92))
total = 0
for name, marks in students:
    print(name, "scored", marks)
    total = total + marks
print("Average:", round(total / 3, 1))`,
        output: "Asha scored 90\nRavi scored 85\nMeera scored 92\nAverage: 89.0",
      },
      {
        type: "para",
        text: "The average is 267 divided by 3, which is exactly 89.0. To find the top student, compare the marks as you loop, or use max with a key function.",
      },
      {
        type: "code",
        title: "Finding the top student",
        code: `students = (("Asha", 90), ("Ravi", 85), ("Meera", 92))
top = max(students, key=lambda s: s[1])
print("Top student:", top[0], "with", top[1], "marks")`,
        output: "Top student: Meera with 92 marks",
      },
      {
        type: "tip",
        text: "Tuples are a natural fit for records like (name, marks), because the two values belong together and should not change on their own.",
      },
    ],
    practice: [
      "Solve the challenge with three students of your own.",
      "Add a fourth student to the tuple and print the new average.",
      "Print the students sorted by marks using sorted with a key.",
    ],
    summary: [
      "A tuple of tuples stores records like (name, marks).",
      "Unpack pairs directly in the loop line.",
      "A loop can build up a total while it prints each item.",
      "max with a key finds the record with the highest value.",
    ],
  },
  {
    slug: "python-sets",
    title: "Python Sets",
    intro:
      "A set is a collection of unique items with no order. Sets are the right tool when you only care about which items are present, not their order or position.",
    blocks: [
      { type: "heading", text: "What is a set?" },
      {
        type: "para",
        text: "A set is a collection of unique items. It does not keep items in order, and it does not allow duplicates. You create a set with curly brackets, just like a dictionary, but without keys and values. A set is useful when you only care about which items are present, not about their order or their position.",
      },
      {
        type: "code",
        title: "A set removes duplicates",
        code: `numbers = {1, 2, 2, 3, 3, 3}
print(len(numbers))
print(sorted(numbers))`,
        output: "3\n[1, 2, 3]",
      },
      { type: "heading", text: "Adding and removing items" },
      {
        type: "para",
        text: "Use add to put one item into a set, and use discard to remove an item that may or may not be there. The method remove also deletes an item, but it gives an error if the item is missing, so discard is safer when you are not sure. You can also use the word in to check whether an item is in a set.",
      },
      {
        type: "code",
        title: "Add and discard items",
        code: `colors = {"red", "blue"}
colors.add("green")
colors.discard("red")
print(sorted(colors))
print("green" in colors)
print("red" in colors)`,
        output: "['blue', 'green']\nTrue\nFalse",
      },
      { type: "heading", text: "Set operations" },
      {
        type: "para",
        text: "Sets support useful operations between two sets. Union joins two sets into one set with all the items from both. Intersection keeps only the items that appear in both sets. Difference keeps the items in the first set that are not in the second set.",
      },
      {
        type: "code",
        title: "Union, intersection and difference",
        code: `a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
print(sorted(a | b))
print(sorted(a & b))
print(sorted(a - b))`,
        output: "[1, 2, 3, 4, 5, 6]\n[3, 4]\n[1, 2]",
      },
      {
        type: "note",
        text: "When Python prints a set, the order of the items can change from run to run. Use sorted to show the items in a fixed order when you need a predictable result.",
      },
    ],
    practice: [
      "Create a set of your five favourite foods and print how many items it has.",
      "Make a list with repeated numbers, turn it into a set, and print the unique numbers in sorted order.",
      "Create two sets of numbers and print their union, intersection, and difference.",
    ],
    summary: [
      "A set stores unique items and has no order.",
      "Use curly brackets to create a set.",
      "Use add and discard to change a set.",
      "Union, intersection, and difference compare two sets.",
    ],
  },
  {
    slug: "python-sets-access",
    title: "Access Set Items",
    intro:
      "Sets have no indexes, so you cannot read an item by position. This page shows how to reach the items in a set: looping, membership tests, and converting to a list.",
    blocks: [
      { type: "heading", text: "No indexes in a set" },
      {
        type: "para",
        text: "A set has no order, so it has no indexes. Writing colors[0] on a set gives a TypeError, because there is no first item in a set. The items are simply present or not present, and that is all a set promises.",
      },
      {
        type: "code",
        title: "Trying to index a set fails",
        code: `colors = {"red", "green", "blue"}
try:
    print(colors[0])
except TypeError as e:
    print("Error:", e)`,
        output: "Error: 'set' object is not subscriptable",
      },
      { type: "heading", text: "Checking membership" },
      {
        type: "para",
        text: "The main way to use a set is the in operator. It tests whether an item is in the set, and it is fast even for a large set, because Python does not need to scan the items one by one.",
      },
      {
        type: "code",
        title: "Membership tests",
        code: `colors = {"red", "green", "blue"}
print("red" in colors)
print("yellow" in colors)
print("yellow" not in colors)`,
        output: "True\nFalse\nTrue",
      },
      { type: "heading", text: "Looping over a set" },
      {
        type: "para",
        text: "A for loop visits every item in a set once, but the order is not guaranteed. If you need the items in a fixed order, sort them first with sorted, which gives you a list in order.",
      },
      {
        type: "code",
        title: "Looping and sorting a set",
        code: `numbers = {3, 1, 2}
for n in sorted(numbers):
    print(n)
print(len(numbers))`,
        output: "1\n2\n3\n3",
      },
    ],
    practice: [
      "Create a set of three colours and test whether \"red\" is in it.",
      "Loop over a set of numbers and print each one in sorted order.",
      "Convert a set of five numbers to a sorted list and print the first item.",
    ],
    summary: [
      "Sets have no indexes, so colors[0] gives a TypeError.",
      "Use in to test whether an item is in a set.",
      "A for loop visits every item, but the order is not guaranteed.",
      "sorted turns a set into a list in a fixed order.",
    ],
  },
  {
    slug: "python-sets-add",
    title: "Add Set Items",
    intro:
      "Sets grow with add and update. This page covers adding one item, adding many items, and the difference between the two methods.",
    blocks: [
      { type: "heading", text: "Adding one item with add" },
      {
        type: "para",
        text: "The add method puts one item into a set. If the item is already there, nothing changes, because a set cannot hold duplicates. Adding the same item twice is harmless, which makes add safe to call without checking first.",
      },
      {
        type: "code",
        title: "Adding items with add",
        code: `fruits = {"apple", "banana"}
fruits.add("mango")
print(sorted(fruits))
fruits.add("apple")
print(sorted(fruits))
print(len(fruits))`,
        output: "['apple', 'banana', 'mango']\n['apple', 'banana', 'mango']\n3",
      },
      { type: "heading", text: "Adding many items with update" },
      {
        type: "para",
        text: "The update method adds many items at once from a list, a tuple, or another set. It is useful when you have a group of new items and you want to add all of them in one step. After update, the set still holds each item only once, even if some of the new items were already present.",
      },
      {
        type: "code",
        title: "Adding many items with update",
        code: `fruits = {"apple", "banana"}
fruits.update(["orange", "apple", "kiwi"])
print(sorted(fruits))
print(len(fruits))`,
        output: "['apple', 'banana', 'kiwi', 'orange']\n4",
      },
      { type: "heading", text: "Updating from another set" },
      {
        type: "para",
        text: "Update also works with another set, which is a quick way to merge two sets. The result is the same as a union, but update changes the first set in place instead of making a new one.",
      },
      {
        type: "code",
        title: "Merging two sets with update",
        code: `a = {1, 2, 3}
b = {3, 4, 5}
a.update(b)
print(sorted(a))
print(sorted(b))`,
        output: "[1, 2, 3, 4, 5]\n[3, 4, 5]",
      },
      {
        type: "note",
        text: "Only hashable values can go into a set. Numbers, strings, and tuples are fine, but lists and dictionaries are not, because they can change. Trying to add a list gives a TypeError.",
      },
    ],
    practice: [
      "Create a set of colours, add two new colours with add, and print the sorted set.",
      "Use update to add three new items from a list, including one duplicate, and print the set.",
      "Try adding a list to a set and read the error message.",
    ],
    summary: [
      "add puts one item into a set; adding a duplicate changes nothing.",
      "update adds many items at once from a list, tuple, or set.",
      "update changes the set in place, like a union that keeps the first set.",
      "Only hashable values like numbers, strings, and tuples can go into a set.",
    ],
  },
  {
    slug: "python-sets-remove",
    title: "Remove Set Items",
    intro:
      "Sets shrink with remove, discard, pop, and clear. This page covers each one and explains which is safe when the item might not be there.",
    blocks: [
      { type: "heading", text: "Removing with remove and discard" },
      {
        type: "para",
        text: "The remove method deletes an item, but it gives a KeyError if the item is not in the set. The discard method deletes an item only if it is there, and it does nothing if the item is missing, so it is the safer choice when you are not sure.",
      },
      {
        type: "code",
        title: "remove and discard",
        code: `numbers = {1, 2, 3, 4}
numbers.remove(2)
numbers.discard(9)
print(sorted(numbers))
try:
    numbers.remove(9)
except KeyError as e:
    print("Error:", e)`,
        output: "[1, 3, 4]\nError: 9",
      },
      { type: "heading", text: "Removing with pop" },
      {
        type: "para",
        text: "The pop method removes and returns one item, but you cannot choose which item it removes, because a set has no order. Use pop when you need to take items out one by one until the set is empty, and avoid it when the exact item matters.",
      },
      {
        type: "code",
        title: "Popping items one by one",
        code: `numbers = {1, 2, 3}
taken = numbers.pop()
print("Took:", taken)
print("Left:", sorted(numbers))`,
        output: "Took: 1\nLeft: [2, 3]",
      },
      { type: "heading", text: "Clearing a set" },
      {
        type: "para",
        text: "The clear method removes every item from a set and leaves an empty set. The set itself still exists, so you can add new items to it afterwards.",
      },
      {
        type: "code",
        title: "Clearing a set",
        code: `numbers = {1, 2, 3, 4}
numbers.clear()
print(numbers)
print(len(numbers))
numbers.add(10)
print(sorted(numbers))`,
        output: "set()\n0\n[10]",
      },
      {
        type: "note",
        text: "The output of pop depends on the set's internal order, which can change between runs. The example above shows 1 being taken, but your run may take a different item. That is normal for sets.",
      },
    ],
    practice: [
      "Create a set of numbers, remove one with remove, and discard a number that is not there.",
      "Try to remove a missing item with remove and catch the KeyError.",
      "Clear a set, print its length, then add one item and print it.",
    ],
    summary: [
      "remove deletes an item but raises a KeyError when it is missing.",
      "discard deletes an item only if it is there, and is the safer choice.",
      "pop removes and returns one item, but you cannot choose which one.",
      "clear removes every item and leaves an empty set.",
    ],
  },
  {
    slug: "python-sets-loop",
    title: "Loop Sets",
    intro:
      "A loop visits every item in a set once. This page shows how to loop over a set, how to sort the items first, and how to use a loop to build a new set.",
    blocks: [
      { type: "heading", text: "The basic for loop" },
      {
        type: "para",
        text: "A for loop visits each item in a set once. The order is not guaranteed, so do not rely on it. If the order matters, sort the items first with sorted, which gives you a list in order.",
      },
      {
        type: "code",
        title: "Looping over a set in sorted order",
        code: `colors = {"red", "green", "blue"}
for color in sorted(colors):
    print(color)`,
        output: "blue\ngreen\nred",
      },
      { type: "heading", text: "Looping to build a new set" },
      {
        type: "para",
        text: "You can build a new set from an old one by looping and adding items that pass a test. A set comprehension does the same job in one line, with curly brackets instead of square brackets.",
      },
      {
        type: "code",
        title: "A loop and a set comprehension",
        code: `numbers = {1, 2, 3, 4, 5, 6}
evens = set()
for n in numbers:
    if n % 2 == 0:
        evens.add(n)
print(sorted(evens))
evens = {n for n in numbers if n % 2 == 0}
print(sorted(evens))`,
        output: "[2, 4, 6]\n[2, 4, 6]",
      },
      { type: "heading", text: "Looping over two sets" },
      {
        type: "para",
        text: "When you need to compare two sets, loop over one and test membership in the other with in. This is how you find the items that appear in both sets, or the items that appear in only one of them.",
      },
      {
        type: "code",
        title: "Finding common items with a loop",
        code: `a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
common = []
for n in sorted(a):
    if n in b:
        common.append(n)
print(common)`,
        output: "[3, 4]",
      },
      {
        type: "note",
        text: "Do not change a set while you loop over it. Adding or removing items during a loop can skip items or raise an error. Build a new set instead, or loop over a copy.",
      },
    ],
    practice: [
      "Make a set of five animals and print each one with a loop.",
      "Use a set comprehension to build a set of the squares of the numbers 1 to 5.",
      "Loop over a set of numbers and print only the ones greater than 10.",
    ],
    summary: [
      "A for loop visits each set item once, in no guaranteed order.",
      "sorted gives the items in a fixed order for printing.",
      "A set comprehension builds a new set in one line.",
      "Do not change a set while you loop over it.",
    ],
  },
  {
    slug: "python-sets-join",
    title: "Join Sets",
    intro:
      "Joining sets means combining two sets into one. This page covers union, intersection, difference, and symmetric difference, with both operators and methods.",
    blocks: [
      { type: "heading", text: "Union: everything from both sets" },
      {
        type: "para",
        text: "Union joins two sets into one set with all the items from both. The pipe symbol does it, and so does the union method. Duplicates appear only once, because a set cannot hold the same item twice.",
      },
      {
        type: "code",
        title: "Union with an operator and a method",
        code: `a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
print(sorted(a | b))
print(sorted(a.union(b)))`,
        output: "[1, 2, 3, 4, 5, 6]\n[1, 2, 3, 4, 5, 6]",
      },
      { type: "heading", text: "Intersection and difference" },
      {
        type: "para",
        text: "Intersection keeps only the items that appear in both sets. Difference keeps the items in the first set that are not in the second set. These are handy when you compare two groups, such as students who play football and students who play cricket.",
      },
      {
        type: "code",
        title: "Intersection and difference",
        code: `a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
print(sorted(a & b))
print(sorted(a - b))
print(sorted(b - a))`,
        output: "[3, 4]\n[1, 2]\n[5, 6]",
      },
      { type: "heading", text: "Symmetric difference" },
      {
        type: "para",
        text: "Symmetric difference keeps the items that are in one set or the other, but not in both. It is the items that are unique to one side. The caret symbol does it, and so does the symmetric_difference method.",
      },
      {
        type: "code",
        title: "Symmetric difference",
        code: `a = {1, 2, 3}
b = {2, 3, 4}
print(sorted(a ^ b))
print(sorted(a.symmetric_difference(b)))`,
        output: "[1, 4]\n[1, 4]",
      },
      {
        type: "note",
        text: "The operators |, &, -, and ^ make new sets and leave the originals unchanged. The update, intersection_update, and difference_update methods change the first set in place instead.",
      },
    ],
    practice: [
      "Create two sets of numbers and print their union, intersection, and difference.",
      "Use symmetric difference to find the items that are in only one of two sets.",
      "Use the union method to join two sets of your favourite foods.",
    ],
    summary: [
      "Union joins two sets; intersection keeps only the shared items.",
      "Difference keeps the items in the first set that are not in the second.",
      "Symmetric difference keeps the items that are in only one set.",
      "Operators make new sets; the _update methods change the first set in place.",
    ],
  },
  {
    slug: "python-frozenset",
    title: "Frozenset",
    intro:
      "A frozenset is a set that cannot be changed after it is created. It is useful when you need a set that stays fixed, or when you need to use a set as a dictionary key.",
    blocks: [
      { type: "heading", text: "What is a frozenset?" },
      {
        type: "para",
        text: "A frozenset is an immutable version of a set. It holds unique items with no order, just like a set, but once it is created you cannot add or remove items. You create one with the frozenset function, passing it a list, tuple, or set.",
      },
      {
        type: "code",
        title: "Creating a frozenset",
        code: `colors = frozenset(["red", "green", "blue"])
print(sorted(colors))
print(type(colors))
print(len(colors))
print("red" in colors)`,
        output: "['blue', 'green', 'red']\n<class 'frozenset'>\n3\nTrue",
      },
      { type: "heading", text: "A frozenset cannot change" },
      {
        type: "para",
        text: "A frozenset has no add, remove, or discard method. Trying to call one gives an AttributeError, because the method does not exist. If you need a changed version, build a new frozenset from the old one plus the new items.",
      },
      {
        type: "code",
        title: "Trying to change a frozenset fails",
        code: `colors = frozenset(["red", "green"])
try:
    colors.add("blue")
except AttributeError as e:
    print("Error:", e)
new_colors = colors | {"blue"}
print(sorted(new_colors))`,
        output: "Error: 'frozenset' object has no attribute 'add'\n['blue', 'green', 'red']",
      },
      { type: "heading", text: "A frozenset can be a dictionary key" },
      {
        type: "para",
        text: "Because a frozenset never changes, it is hashable, which means it can be used as a dictionary key or as an item in another set. A normal set cannot do this, because it can change. This is the main reason frozensets exist.",
      },
      {
        type: "code",
        title: "A frozenset as a dictionary key",
        code: `scores = {frozenset(["Asha", "Ravi"]): 95}
print(scores[frozenset(["Asha", "Ravi"])])`,
        output: "95",
      },
      {
        type: "note",
        text: "The printed order of a frozenset can change between runs, just like a set. Use sorted when you need a predictable order for display.",
      },
    ],
    practice: [
      "Create a frozenset of your five favourite foods and print how many items it has.",
      "Try to add an item to a frozenset and read the error message.",
      "Create two frozensets and print their union and intersection.",
    ],
    summary: [
      "A frozenset is an immutable set: it cannot be changed after creation.",
      "Create one with frozenset(), passing a list, tuple, or set.",
      "Set operations work on frozensets and return new frozensets.",
      "A frozenset can be a dictionary key, because it never changes.",
    ],
  },

  {
    slug: "python-sets-methods",
    title: "Set Methods",
    intro:
      "Set methods let you add, remove, and compare items without writing extra loops. This page is the reference for the methods you will use most.",
    blocks: [
      { type: "heading", text: "Adding and updating a set" },
      {
        type: "para",
        text: "The add method puts one item into a set. If the item is already there, nothing changes, because a set cannot hold duplicates. The update method adds many items at once from a list, a tuple, or another set.",
      },
      {
        type: "code",
        title: "Add one item and update with many items",
        code: `fruits = {"apple", "banana"}
fruits.add("mango")
fruits.update(["orange", "apple"])
print(sorted(fruits))
print(len(fruits))`,
        output: "['apple', 'banana', 'mango', 'orange']\n4",
      },
      { type: "heading", text: "Removing items safely" },
      {
        type: "para",
        text: "The remove method deletes an item, but it gives a KeyError if the item is not in the set. The discard method deletes an item only if it is there, and it does nothing if the item is missing, so it is the safer choice. The clear method removes every item from a set and leaves an empty set.",
      },
      {
        type: "code",
        title: "Remove, discard and clear",
        code: `numbers = {1, 2, 3, 4}
numbers.remove(2)
numbers.discard(9)
print(sorted(numbers))
numbers.clear()
print(numbers)
print(len(numbers))`,
        output: "[1, 3, 4]\nset()\n0",
      },
      { type: "heading", text: "Comparing sets" },
      {
        type: "para",
        text: "The union, intersection, and difference methods do the same work as the symbols you saw in the last lesson, but in a clearer form. The symmetric difference method keeps the items that are in one set or the other, but not in both. The issubset method checks whether every item of one set is in another set. The isdisjoint method checks whether two sets have no items in common at all.",
      },
      {
        type: "code",
        title: "Compare two sets with methods",
        code: `a = {1, 2, 3}
b = {2, 3, 4}
print(sorted(a.union(b)))
print(sorted(a.intersection(b)))
print(sorted(a.symmetric_difference(b)))
print(a.issubset({1, 2, 3, 4}))
print(a.isdisjoint({5, 6}))`,
        output: "[1, 2, 3, 4]\n[2, 3]\n[1, 4]\nTrue\nTrue",
      },
      {
        type: "note",
        text: "The remove method raises a KeyError when the item is missing, even though the item is a value in a set and not a dictionary key. Use discard when you are not sure the item is present.",
      },
    ],
    practice: [
      "Create a set of colours, add two new colours with update, and print the sorted set.",
      "Create a set of numbers, try to remove a number that is not there with discard, and print the set to confirm nothing broke.",
      "Create two sets and print their symmetric difference, then check whether one is a subset of the other.",
    ],
    summary: [
      "add adds one item and update adds many items.",
      "discard is safer than remove for a missing item.",
      "clear empties a set.",
      "Set methods can compare two sets and test their relation.",
    ],
  },
  {
    slug: "python-sets-exercises",
    title: "Set Exercises",
    intro:
      "A set of practice exercises on sets. Try each one yourself, then check your answer against the solution below it.",
    blocks: [
      { type: "heading", text: "Exercise 1: Unique numbers" },
      {
        type: "para",
        text: "A list has repeated numbers: [1, 2, 2, 3, 4, 4, 5]. Turn it into a set to remove the duplicates, then print the unique numbers in sorted order and how many there are.",
      },
      {
        type: "code",
        title: "Exercise 1: answer",
        code: `numbers = [1, 2, 2, 3, 4, 4, 5]
unique = set(numbers)
print(sorted(unique))
print(len(unique))`,
        output: "[1, 2, 3, 4, 5]\n5",
      },
      { type: "heading", text: "Exercise 2: Two groups of students" },
      {
        type: "para",
        text: "Football players are {\"Asha\", \"Ravi\", \"Meera\"} and cricket players are {\"Ravi\", \"Meera\", \"Arjun\"}. Print the students who play both games, the students who play only football, and all the students who play at least one game.",
      },
      {
        type: "code",
        title: "Exercise 2: answer",
        code: `football = {"Asha", "Ravi", "Meera"}
cricket = {"Ravi", "Meera", "Arjun"}
print(sorted(football & cricket))
print(sorted(football - cricket))
print(sorted(football | cricket))`,
        output: "['Meera', 'Ravi']\n['Asha']\n['Arjun', 'Asha', 'Meera', 'Ravi']",
      },
      { type: "heading", text: "Exercise 3: Add and remove" },
      {
        type: "para",
        text: "Start with the set {\"red\", \"blue\"}. Add \"green\" with add, add \"yellow\" and \"red\" with update, then discard \"blue\" and remove \"red\". Print the sorted set after each step.",
      },
      {
        type: "code",
        title: "Exercise 3: answer",
        code: `colors = {"red", "blue"}
colors.add("green")
print(sorted(colors))
colors.update(["yellow", "red"])
print(sorted(colors))
colors.discard("blue")
colors.remove("red")
print(sorted(colors))`,
        output: "['blue', 'green', 'red']\n['blue', 'green', 'red', 'yellow']\n['green', 'yellow']",
      },
      {
        type: "note",
        text: "If an exercise feels hard, break it into smaller steps. Write one line, print the set, and check it before moving on to the next step.",
      },
    ],
    practice: [
      "Do Exercise 1 with a list of your own repeated numbers.",
      "Create two sets of your favourite foods and print their intersection.",
      "Check whether one set of numbers is a subset of another.",
    ],
    summary: [
      "Turning a list into a set removes duplicates.",
      "Intersection finds shared items; difference finds items in only one set.",
      "add adds one item and update adds many items.",
      "issubset and isdisjoint test the relation between two sets.",
    ],
  },
  {
    slug: "python-challenges-sets-basics",
    title: "Code Challenge",
    intro:
      "A small challenge to test what you learned about sets. Try it yourself before reading the solution.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Write a program that finds the unique words in a sentence. Take the sentence \"the cat sat on the mat and the dog sat on the rug\", split it into words, and turn the words into a set. Print the number of unique words and the unique words in alphabetical order. Then print the words that appear in both this sentence and the sentence \"the dog chased the cat\".",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "split() breaks a sentence into a list of words.",
          "set(words) removes the duplicates.",
          "sorted gives the unique words in alphabetical order.",
          "The intersection of two sets gives the words that appear in both sentences.",
        ],
      },
      { type: "heading", text: "The solution" },
      {
        type: "para",
        text: "Here is one correct solution, using the sample sentences shown in the output.",
      },
      {
        type: "code",
        title: "Solution",
        code: `sentence = "the cat sat on the mat and the dog sat on the rug"
words = set(sentence.split())
print("Unique words:", len(words))
print(sorted(words))
other = set("the dog chased the cat".split())
print("Common words:", sorted(words & other))`,
        output: "Unique words: 8\n['and', 'cat', 'dog', 'mat', 'on', 'rug', 'sat', 'the']\nCommon words: ['cat', 'dog', 'the']",
      },
      {
        type: "para",
        text: "The sentence has 13 words, but only 8 are unique, because the, sat, and on repeat. The two sentences share three words: cat, dog, and the.",
      },
      {
        type: "code",
        title: "Check: the same idea with a shorter sentence",
        code: `sentence = "apple banana apple cherry banana"
words = set(sentence.split())
print("Unique words:", len(words))
print(sorted(words))`,
        output: "Unique words: 3\n['apple', 'banana', 'cherry']",
      },
      {
        type: "tip",
        text: "Sets are the fastest way to remove duplicates from a list or a sentence. Convert, then sort for display.",
      },
    ],
    practice: [
      "Solve the challenge with a sentence of your own.",
      "Count the unique letters in your name using a set.",
      "Find the words that appear in one sentence but not in another, using difference.",
    ],
    summary: [
      "set() turns a list of words into unique words.",
      "len counts the unique words and sorted shows them in order.",
      "Intersection finds the words that appear in both sentences.",
      "Sets are the fastest way to remove duplicates.",
    ],
  },
  {
    slug: "python-dictionaries",
    title: "Python Dictionaries",
    intro:
      "A dictionary stores data as key and value pairs, so you can find a value by its name instead of its position. It is the natural way to store information about one thing.",
    blocks: [
      { type: "heading", text: "What is a dictionary?" },
      {
        type: "para",
        text: "A dictionary stores pairs of keys and values. The key is a name you choose, such as name or age, and the value is the data that belongs to that key. You create a dictionary with curly brackets, with each pair written as key, colon, value, and pairs separated by commas. Unlike a list, a dictionary does not use positions, so you look up a value by its key.",
      },
      {
        type: "code",
        title: "Create a dictionary and read values by key",
        code: `student = {"name": "Asha", "age": 20, "course": "Python"}
print(student["name"])
print(student["age"])
print(len(student))`,
        output: "Asha\n20\n3",
      },
      { type: "heading", text: "Adding and changing values" },
      {
        type: "para",
        text: "You add a new pair by writing the dictionary name, square brackets with the new key, an equals sign, and the value. You change an existing value in exactly the same way, by assigning a new value to a key that already exists. A dictionary keeps its pairs in the order you added them.",
      },
      {
        type: "code",
        title: "Change a value and add a new pair",
        code: `student = {"name": "Asha", "age": 20}
student["age"] = 21
student["city"] = "Mumbai"
print(student)`,
        output: "{'name': 'Asha', 'age': 21, 'city': 'Mumbai'}",
      },
      { type: "heading", text: "Looping through a dictionary" },
      {
        type: "para",
        text: "You can loop through a dictionary in three ways. Looping over the dictionary itself gives you each key, one at a time. The items method gives you each key and value together, which is the most useful form when you need both. The values method gives you only the values.",
      },
      {
        type: "code",
        title: "Loop through keys and values with items",
        code: `marks = {"Maths": 90, "English": 85, "Science": 92}
for subject, score in marks.items():
    print(subject, score)`,
        output: "Maths 90\nEnglish 85\nScience 92",
      },
      {
        type: "note",
        text: "Keys in a dictionary must be unique. If you add the same key twice, the second value replaces the first one, and the old value is lost.",
      },
    ],
    practice: [
      "Create a dictionary for a book with title, author, and pages, then print the author.",
      "Add a new key called year to your book dictionary and change the number of pages.",
      "Create a dictionary of three subjects and their marks, then loop through it and print each subject and its marks.",
    ],
    summary: [
      "A dictionary stores data as key and value pairs.",
      "Read a value with its key in square brackets.",
      "Assigning to a key adds or changes a pair.",
      "Use items to loop through keys and values together.",
    ],
  },
  {
    slug: "python-dictionaries-access",
    title: "Access Items",
    intro:
      "Reading a value from a dictionary means looking it up by its key. This page covers square brackets, the get method, and listing keys and values.",
    blocks: [
      { type: "heading", text: "Reading with square brackets" },
      {
        type: "para",
        text: "The simplest way to read a value is to write the dictionary name and the key in square brackets. If the key is not in the dictionary, Python gives a KeyError and stops your program, so make sure the key exists first.",
      },
      {
        type: "code",
        title: "Reading values by key",
        code: `student = {"name": "Asha", "age": 20, "course": "Python"}
print(student["name"])
print(student["course"])
print(student["age"])`,
        output: "Asha\nPython\n20",
      },
      { type: "heading", text: "Reading safely with get" },
      {
        type: "para",
        text: "The get method is safer, because it returns None when the key is missing instead of giving an error. You can also give get a second value, which it returns as a default when the key is not there. This is useful when a piece of data is optional, such as a city or a middle name.",
      },
      {
        type: "code",
        title: "Use get instead of square brackets",
        code: `user = {"name": "Rahul", "age": 25}
print(user.get("name"))
print(user.get("city"))
print(user.get("city", "Unknown"))`,
        output: "Rahul\nNone\nUnknown",
      },
      { type: "heading", text: "Listing keys, values, and pairs" },
      {
        type: "para",
        text: "The keys method gives you all the keys, the values method gives you all the values, and the items method gives you all the pairs. You can turn any of them into a list with the list function, and you can loop over them directly.",
      },
      {
        type: "code",
        title: "Keys, values, and items",
        code: `marks = {"Maths": 90, "English": 85, "Science": 92}
print(list(marks.keys()))
print(list(marks.values()))
print(list(marks.items()))`,
        output: "['Maths', 'English', 'Science']\n[90, 85, 92]\n[('Maths', 90), ('English', 85), ('Science', 92)]",
      },
      {
        type: "note",
        text: "Reading a missing key with square brackets gives a KeyError. Use get, or check with in first, when you are not sure the key exists.",
      },
    ],
    practice: [
      "Create a dictionary for a user, then use get to read a key that does not exist, with a default value.",
      "Print the keys and the values of a dictionary of three subjects and their marks.",
      "Check whether the key \"city\" is in a dictionary before reading it.",
    ],
    summary: [
      "Square brackets read a value by key, but give a KeyError for a missing key.",
      "get returns None, or a default you choose, when the key is missing.",
      "keys, values, and items list what a dictionary holds.",
      "Check with in before reading a key you are not sure about.",
    ],
  },
  {
    slug: "python-dictionaries-change",
    title: "Change Items",
    intro:
      "Changing a value in a dictionary means assigning a new value to a key that already exists. This page covers changing one value, changing many at once, and the difference between change and add.",
    blocks: [
      { type: "heading", text: "Changing one value" },
      {
        type: "para",
        text: "You change a value by assigning a new value to a key that already exists. The dictionary keeps the same keys, in the same order, and only the value changes.",
      },
      {
        type: "code",
        title: "Changing a value",
        code: `student = {"name": "Asha", "age": 20}
student["age"] = 21
print(student)
student["name"] = "Asha Sharma"
print(student)`,
        output: "{'name': 'Asha', 'age': 21}\n{'name': 'Asha Sharma', 'age': 21}",
      },
      { type: "heading", text: "Changing many values with update" },
      {
        type: "para",
        text: "The update method changes many pairs at once from another dictionary. If a key already exists, its value is replaced, and if it does not exist, the pair is added. This is the quickest way to apply a batch of changes.",
      },
      {
        type: "code",
        title: "Updating many pairs at once",
        code: `scores = {"Maths": 80, "English": 90}
scores.update({"English": 95, "Science": 75})
print(scores)`,
        output: "{'Maths': 80, 'English': 95, 'Science': 75}",
      },
      { type: "heading", text: "Changing values in a loop" },
      {
        type: "para",
        text: "To change every value, loop over the keys and assign a new value at each key. This is how you apply the same change to a whole dictionary, for example adding 5 bonus marks to every subject.",
      },
      {
        type: "code",
        title: "Adding bonus marks to every subject",
        code: `marks = {"Maths": 90, "English": 85, "Science": 92}
for subject in marks:
    marks[subject] = marks[subject] + 5
print(marks)`,
        output: "{'Maths': 95, 'English': 90, 'Science': 97}",
      },
      {
        type: "note",
        text: "Assigning to a key that does not exist adds a new pair instead of changing one. If you meant to change an existing value, check the spelling of the key, or you will silently add a new pair and leave the old one unchanged.",
      },
    ],
    practice: [
      "Create a dictionary of three subjects and their marks, then change one mark.",
      "Use update to change two marks and add a new subject at the same time.",
      "Add 5 bonus marks to every subject in a dictionary using a loop.",
    ],
    summary: [
      "Assigning to an existing key changes its value.",
      "update changes many pairs at once from another dictionary.",
      "Loop over the keys to change every value in the same way.",
      "A misspelled key adds a new pair instead of changing the old one.",
    ],
  },
  {
    slug: "python-dictionaries-add",
    title: "Add Items",
    intro:
      "Adding a pair to a dictionary means assigning a value to a new key. This page covers adding one pair, adding many pairs, and adding a key only when it is missing.",
    blocks: [
      { type: "heading", text: "Adding one pair" },
      {
        type: "para",
        text: "You add a new pair by writing the dictionary name, square brackets with the new key, an equals sign, and the value. The pair is added at the end, because a dictionary keeps its pairs in the order you added them.",
      },
      {
        type: "code",
        title: "Adding new pairs",
        code: `student = {"name": "Asha", "age": 20}
student["city"] = "Mumbai"
print(student)
student["course"] = "Python"
print(student)`,
        output: "{'name': 'Asha', 'age': 20, 'city': 'Mumbai'}\n{'name': 'Asha', 'age': 20, 'city': 'Mumbai', 'course': 'Python'}",
      },
      { type: "heading", text: "Adding many pairs with update" },
      {
        type: "para",
        text: "The update method adds or changes many pairs at once from another dictionary. If a key already exists, its value is replaced, and if it does not exist, the pair is added.",
      },
      {
        type: "code",
        title: "Adding many pairs with update",
        code: `scores = {"Maths": 80}
scores.update({"English": 90, "Science": 75})
print(scores)`,
        output: "{'Maths': 80, 'English': 90, 'Science': 75}",
      },
      { type: "heading", text: "Adding only when the key is missing" },
      {
        type: "para",
        text: "The setdefault method returns the value for a key if the key exists, and if it does not exist, it adds the key with the value you give and then returns that value. This is handy when you want to make sure a key exists before you use it, without overwriting a value that is already there.",
      },
      {
        type: "code",
        title: "setdefault adds only a missing key",
        code: `scores = {"Maths": 80}
scores.setdefault("Science", 75)
scores.setdefault("Maths", 100)
print(scores)`,
        output: "{'Maths': 80, 'Science': 75}",
      },
      {
        type: "note",
        text: "Keys in a dictionary must be unique. If you add the same key twice, the second value replaces the first one, and the old value is lost.",
      },
    ],
    practice: [
      "Create a dictionary for a book, then add a key for the year and one for the publisher.",
      "Use update to add two new subjects and their marks to a dictionary of scores.",
      "Use setdefault to add a missing key, then try it on a key that already exists.",
    ],
    summary: [
      "Assigning to a new key adds a pair at the end.",
      "update adds or changes many pairs at once.",
      "setdefault adds a missing key without overwriting an old one.",
      "Adding the same key twice replaces the old value.",
    ],
  },
  {
    slug: "python-dictionaries-remove",
    title: "Remove Items",
    intro:
      "Removing a pair from a dictionary means deleting a key and its value. This page covers pop, popitem, del, and clear.",
    blocks: [
      { type: "heading", text: "Removing with pop" },
      {
        type: "para",
        text: "The pop method removes a pair by its key and returns the value that was removed, so you can use that value before it is gone. If the key is missing, pop gives a KeyError unless you pass a default value.",
      },
      {
        type: "code",
        title: "Removing with pop",
        code: `book = {"title": "Python Basics", "pages": 200, "author": "Asha"}
print(book.pop("pages"))
print(book)
print(book.pop("year", "Not given"))`,
        output: "200\n{'title': 'Python Basics', 'author': 'Asha'}\nNot given",
      },
      { type: "heading", text: "Removing the last pair with popitem" },
      {
        type: "para",
        text: "The popitem method removes the last pair that was added and returns it as a pair of key and value. It is useful when a dictionary is used like a stack, where the last item added is the first one to be taken out.",
      },
      {
        type: "code",
        title: "Removing the last pair",
        code: `book = {"title": "Python Basics", "pages": 200, "author": "Asha"}
print(book.popitem())
print(book)`,
        output: "('author', 'Asha')\n{'title': 'Python Basics', 'pages': 200}",
      },
      { type: "heading", text: "Deleting with del and clearing with clear" },
      {
        type: "para",
        text: "The del statement removes a pair by its key, and it does not return the removed value. The clear method removes every pair and leaves an empty dictionary.",
      },
      {
        type: "code",
        title: "del and clear",
        code: `student = {"name": "Asha", "age": 20, "city": "Mumbai"}
del student["city"]
print(student)
student.clear()
print(student)`,
        output: "{'name': 'Asha', 'age': 20}\n{}",
      },
      {
        type: "note",
        text: "Deleting a key that does not exist with del gives a KeyError. Use pop with a default value, or check with in first, when you are not sure the key exists.",
      },
    ],
    practice: [
      "Create a dictionary, remove one pair with pop, and print the removed value.",
      "Use popitem to remove the last pair from a dictionary and print what was removed.",
      "Delete a key with del, then clear the dictionary and print its length.",
    ],
    summary: [
      "pop removes a pair by key and returns its value.",
      "popitem removes the last pair added and returns it as a pair.",
      "del removes a pair by key without returning it.",
      "clear removes every pair and leaves an empty dictionary.",
    ],
  },
  {
    slug: "python-dictionaries-loop",
    title: "Loop Dictionaries",
    intro:
      "Looping over a dictionary lets you visit every key and value. This page covers looping over keys, values, and pairs.",
    blocks: [
      { type: "heading", text: "Looping over keys" },
      {
        type: "para",
        text: "Looping over a dictionary itself gives you each key, one at a time, in the order the pairs were added. You can then read the value for each key with square brackets.",
      },
      {
        type: "code",
        title: "Looping over keys",
        code: `marks = {"Maths": 90, "English": 85, "Science": 92}
for subject in marks:
    print(subject, marks[subject])`,
        output: "Maths 90\nEnglish 85\nScience 92",
      },
      { type: "heading", text: "Looping over keys and values with items" },
      {
        type: "para",
        text: "The items method gives you each key and value together, which is the most useful form when you need both. You unpack the pair directly in the loop line, so the code reads like plain English.",
      },
      {
        type: "code",
        title: "Looping with items",
        code: `marks = {"Maths": 90, "English": 85, "Science": 92}
for subject, score in marks.items():
    print(subject, score)`,
        output: "Maths 90\nEnglish 85\nScience 92",
      },
      { type: "heading", text: "Looping over values only" },
      {
        type: "para",
        text: "The values method gives you only the values, without the keys. This is handy when you need to add up all the values or find the largest one, and the keys do not matter.",
      },
      {
        type: "code",
        title: "Looping over values",
        code: `marks = {"Maths": 90, "English": 85, "Science": 92}
total = 0
for score in marks.values():
    total = total + score
print("Total:", total)
print("Average:", total / len(marks))`,
        output: "Total: 267\nAverage: 89.0",
      },
      {
        type: "note",
        text: "Do not add or remove keys while you loop over a dictionary. Changing the size of a dictionary during a loop raises a RuntimeError. Build a new dictionary instead, or loop over a copy of the keys with list(marks.keys()).",
      },
    ],
    practice: [
      "Create a dictionary of three subjects and their marks, then loop through it and print each subject and its marks.",
      "Use values to add up all the marks in a dictionary and print the total.",
      "Loop over the keys of a dictionary and print each key in uppercase.",
    ],
    summary: [
      "Looping over a dictionary gives you each key, in the order added.",
      "items gives you each key and value together.",
      "values gives you only the values, which is handy for totals.",
      "Do not add or remove keys while you loop over a dictionary.",
    ],
  },
  {
    slug: "python-dictionaries-copy",
    title: "Copy Dictionaries",
    intro:
      "Copying a dictionary is trickier than it looks, because assigning a dictionary to a new name does not copy it. This page shows how to make a real copy.",
    blocks: [
      { type: "heading", text: "Assignment does not copy" },
      {
        type: "para",
        text: "When you write b = a for a dictionary, both names point to the same dictionary. Changing the dictionary through b also changes what a sees, because there is only one dictionary. This is the same surprise as with lists.",
      },
      {
        type: "code",
        title: "Two names, one dictionary",
        code: `a = {"name": "Asha", "age": 20}
b = a
b["age"] = 21
print(a)
print(b)`,
        output: "{'name': 'Asha', 'age': 21}\n{'name': 'Asha', 'age': 21}",
      },
      { type: "heading", text: "Making a real copy" },
      {
        type: "para",
        text: "The copy method makes a separate dictionary with the same pairs. The dict function, dict(a), does the same thing. After a real copy, changing one dictionary does not affect the other.",
      },
      {
        type: "code",
        title: "Two ways to copy a dictionary",
        code: `a = {"name": "Asha", "age": 20}
b = a.copy()
c = dict(a)
b["age"] = 21
print(a)
print(b)
print(c)`,
        output: "{'name': 'Asha', 'age': 20}\n{'name': 'Asha', 'age': 21}\n{'name': 'Asha', 'age': 20}",
      },
      { type: "heading", text: "Shallow copies and nested dictionaries" },
      {
        type: "para",
        text: "The copy method makes a shallow copy: it copies the outer dictionary, but the values inside are still shared. If a value is itself a dictionary or a list, changing it through the copy also changes the original. For a full independent copy of nested data, use copy.deepcopy.",
      },
      {
        type: "code",
        title: "A shallow copy shares nested values",
        code: `a = {"name": "Asha", "marks": {"Maths": 90}}
b = a.copy()
b["marks"]["Maths"] = 95
print(a)
print(b)`,
        output: "{'name': 'Asha', 'marks': {'Maths': 95}}\n{'name': 'Asha', 'marks': {'Maths': 95}}",
      },
      {
        type: "note",
        text: "For a dictionary of plain numbers or strings, copy and dict(a) are both safe. Only nested dictionaries and lists need deepcopy, because only they share inner objects.",
      },
    ],
    practice: [
      "Create a dictionary, assign it to a second name, change the second dictionary, and print both.",
      "Copy a dictionary with the copy method, change the copy, and print both to confirm they are separate.",
      "Use dict() to copy a dictionary of your favourite foods and their prices.",
    ],
    summary: [
      "Assigning a dictionary to a new name does not copy it; both names point to one dictionary.",
      "copy and dict(a) make a separate dictionary with the same pairs.",
      "A shallow copy shares nested dictionaries and lists.",
      "For nested data, use copy.deepcopy for a full independent copy.",
    ],
  },
  {
    slug: "python-dictionaries-nested",
    title: "Nested Dictionaries",
    intro:
      "A nested dictionary is a dictionary inside a dictionary. It is how you store structured data, like a student with an address, or a class full of students.",
    blocks: [
      { type: "heading", text: "What is a nested dictionary?" },
      {
        type: "para",
        text: "A nested dictionary is a dictionary whose values are themselves dictionaries. The outer keys name the groups, and the inner keys name the details. This is a natural way to store data that has layers, like a school with classes, or a student with an address.",
      },
      {
        type: "code",
        title: "A dictionary of students",
        code: `students = {
    "Asha": {"age": 20, "course": "Python"},
    "Ravi": {"age": 22, "course": "Java"},
}
print(students["Asha"])
print(students["Ravi"]["course"])`,
        output: "{'age': 20, 'course': 'Python'}\nJava",
      },
      { type: "heading", text: "Reading nested values" },
      {
        type: "para",
        text: "You read a nested value by chaining the keys, one pair of square brackets for each level. The first key finds the inner dictionary, and the second key finds the value inside it.",
      },
      {
        type: "code",
        title: "Reading values at each level",
        code: `student = {
    "name": "Asha",
    "address": {"city": "Mumbai", "pincode": 400001},
}
print(student["address"]["city"])
print(student["address"]["pincode"])`,
        output: "Mumbai\n400001",
      },
      { type: "heading", text: "Looping over nested dictionaries" },
      {
        type: "para",
        text: "To visit every value in a nested dictionary, loop over the outer items and then loop over the inner items. The outer loop gives you each group, and the inner loop gives you the details inside that group.",
      },
      {
        type: "code",
        title: "Looping through two levels",
        code: `students = {
    "Asha": {"age": 20, "course": "Python"},
    "Ravi": {"age": 22, "course": "Java"},
}
for name, details in students.items():
    print(name, details["age"], details["course"])`,
        output: "Asha 20 Python\nRavi 22 Java",
      },
      {
        type: "note",
        text: "Reading a missing key at any level gives a KeyError. Use get at each level, like students.get(\"Asha\", {}).get(\"age\"), when you are not sure the keys exist.",
      },
    ],
    practice: [
      "Create a nested dictionary of two students with age and course, and print one student's course.",
      "Add a third student to the nested dictionary and print the whole thing.",
      "Loop over a nested dictionary and print each student's name and age.",
    ],
    summary: [
      "A nested dictionary is a dictionary whose values are dictionaries.",
      "Chain the keys to read a nested value: d[\"a\"][\"b\"].",
      "Loop over the outer items, then the inner items, to visit everything.",
      "Use get at each level when a key might be missing.",
    ],
  },
  {
    slug: "python-dictionaries-methods",
    title: "Dictionary Methods",
    intro:
      "Dictionary methods let you read, add, update, and remove pairs safely and in fewer lines. This page is the reference for the methods you will use most.",
    blocks: [
      { type: "heading", text: "Getting values safely" },
      {
        type: "para",
        text: "Reading a missing key with square brackets gives a KeyError and stops your program. The get method is safer, because it returns None when the key is missing instead of giving an error. You can also give get a second value, which it returns as a default when the key is not there.",
      },
      {
        type: "code",
        title: "Use get instead of square brackets",
        code: `user = {"name": "Rahul", "age": 25}
print(user.get("name"))
print(user.get("city"))
print(user.get("city", "Unknown"))`,
        output: "Rahul\nNone\nUnknown",
      },
      { type: "heading", text: "Updating and adding values" },
      {
        type: "para",
        text: "The update method adds or changes many pairs at once from another dictionary. If a key already exists, its value is replaced, and if it does not exist, the pair is added. The setdefault method returns the value for a key if the key exists, and if it does not exist, it adds the key with the value you give and then returns that value.",
      },
      {
        type: "code",
        title: "Update many pairs and use setdefault",
        code: `scores = {"Maths": 80}
scores.update({"English": 90, "Maths": 85})
scores.setdefault("Science", 75)
scores.setdefault("Maths", 100)
print(scores)`,
        output: "{'Maths': 85, 'English': 90, 'Science': 75}",
      },
      { type: "heading", text: "Removing items and reading keys" },
      {
        type: "para",
        text: "The pop method removes a pair by its key and returns the value that was removed, so you can use that value before it is gone. The popitem method removes the last pair that was added and returns it as a pair of key and value. The keys method gives you all the keys, and the values method gives you all the values.",
      },
      {
        type: "code",
        title: "Remove pairs and read keys and values",
        code: `book = {"title": "Python Basics", "pages": 200, "author": "Asha"}
print(book.pop("pages"))
print(book.popitem())
print(list(book.keys()))
print(list(book.values()))`,
        output: "200\n('author', 'Asha')\n['title']\n['Python Basics']",
      },
      {
        type: "note",
        text: "The pop method gives a KeyError for a missing key unless you pass a default value, for example book.pop('pages', 0). The clear method removes every pair and leaves an empty dictionary.",
      },
    ],
    practice: [
      "Create a dictionary for a user, then use get to read a key that does not exist, with a default value.",
      "Create a dictionary of scores, update it with two new subjects, and use setdefault to add a third subject only if it is missing.",
      "Create a dictionary, remove one pair with pop, print the removed value, and then print the keys that are left.",
    ],
    summary: [
      "get reads a value safely, with an optional default.",
      "update changes many pairs at once.",
      "setdefault adds a missing key without overwriting an old one.",
      "pop and popitem remove pairs, and keys and values list what is left.",
    ],
  },
  {
    slug: "python-dictionaries-exercises",
    title: "Dictionary Exercises",
    intro:
      "A set of practice exercises on dictionaries. Try each one yourself, then check your answer against the solution below it.",
    blocks: [
      { type: "heading", text: "Exercise 1: A book" },
      {
        type: "para",
        text: "Create a dictionary for a book with title, author, and pages. Print the author, then add a key for the year, and change the number of pages to 250.",
      },
      {
        type: "code",
        title: "Exercise 1: answer",
        code: `book = {"title": "Python Basics", "author": "Asha", "pages": 200}
print(book["author"])
book["year"] = 2026
book["pages"] = 250
print(book)`,
        output: "Asha\n{'title': 'Python Basics', 'author': 'Asha', 'pages': 250, 'year': 2026}",
      },
      { type: "heading", text: "Exercise 2: Total marks" },
      {
        type: "para",
        text: "Create a dictionary of three subjects and their marks. Loop through it, print each subject and its marks, and print the total marks at the end.",
      },
      {
        type: "code",
        title: "Exercise 2: answer",
        code: `marks = {"Maths": 90, "English": 85, "Science": 92}
total = 0
for subject, score in marks.items():
    print(subject, score)
    total = total + score
print("Total:", total)`,
        output: "Maths 90\nEnglish 85\nScience 92\nTotal: 267",
      },
      { type: "heading", text: "Exercise 4: Counting words" },
      {
        type: "para",
        text: "Count how many times each word appears in the sentence \"the cat sat on the mat\" using a dictionary. Start with an empty dictionary and add one to the count for each word as you loop over the words.",
      },
      {
        type: "code",
        title: "Exercise 4: answer",
        code: `sentence = "the cat sat on the mat"
counts = {}
for word in sentence.split():
    counts[word] = counts.get(word, 0) + 1
print(counts)`,
        output: "{'the': 2, 'cat': 1, 'sat': 1, 'on': 1, 'mat': 1}",
      },
    ],
    practice: [
      "Do Exercise 1 with a book of your own.",
      "Create a dictionary of your marks in four subjects and print the average.",
      "Count the letters in the word \"banana\" using a dictionary.",
    ],
    summary: [
      "Assigning to a key adds or changes a pair.",
      "items loops through keys and values together.",
      "get reads a value safely, with a default when the key is missing.",
      "A dictionary with get is the standard way to count things.",
    ],
  },
  {
    slug: "python-challenges-dictionaries-basics",
    title: "Code Challenge",
    intro:
      "A small challenge to test what you learned about dictionaries. Try it yourself before reading the solution.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Write a program that stores a small phone book as a dictionary of names and numbers. Add two contacts, change one number, remove one contact with pop, and then print the phone book, the number of contacts, and the number for a name that is not in the book, using get with a default message. Finally, loop over the phone book and print each contact.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "Assigning to a new key adds a contact; assigning to an old key changes its number.",
          "pop removes a contact and returns its number.",
          "get with a second argument returns that value when the name is missing.",
          "items loops through names and numbers together.",
        ],
      },
      { type: "heading", text: "The solution" },
      {
        type: "para",
        text: "Here is one correct solution, using the sample contacts shown in the output.",
      },
      {
        type: "code",
        title: "Solution",
        code: `phonebook = {}
phonebook["Asha"] = 9876543210
phonebook["Ravi"] = 9123456780
phonebook["Asha"] = 9999999999
removed = phonebook.pop("Ravi")
print("Removed:", removed)
print(phonebook)
print("Contacts:", len(phonebook))
print("Meera:", phonebook.get("Meera", "Not found"))
for name, number in phonebook.items():
    print(name, number)`,
        output: "Removed: 9123456780\n{'Asha': 9999999999}\nContacts: 1\nMeera: Not found\nAsha 9999999999",
      },
      {
        type: "para",
        text: "Asha's number was changed from 9876543210 to 9999999999, and Ravi was removed. Only one contact is left, and looking up Meera gives the default message instead of an error.",
      },
      {
        type: "code",
        title: "Check: adding the contact back",
        code: `phonebook = {"Asha": 9999999999}
phonebook["Meera"] = 8888888888
print(phonebook)
print("Contacts:", len(phonebook))`,
        output: "{'Asha': 9999999999, 'Meera': 8888888888}\nContacts: 2",
      },
      {
        type: "tip",
        text: "A dictionary is the right tool whenever you look things up by name. If you find yourself searching a list for a matching name, a dictionary will do it faster and with less code.",
      },
    ],
    practice: [
      "Solve the challenge with three contacts of your own.",
      "Change one contact's number and print the phone book before and after.",
      "Count the words in a sentence of your own using a dictionary.",
    ],
    summary: [
      "A dictionary stores names and values as key and value pairs.",
      "Assigning to a key adds or changes a pair.",
      "pop removes a pair and returns its value.",
      "get with a default avoids errors for missing keys.",
    ],
  },
  {
    slug: "python-conditions",
    title: "Python If",
    intro:
      "An if statement lets a program make decisions. With conditions, your code can take one path when something is true and a different path when it is false.",
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
        text: "When there are more than two possible outcomes, use elif, short for else if. Python checks each condition from top to bottom and runs the first block whose condition is True. Once one block runs, the rest are skipped, so the order of your conditions matters.",
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
    slug: "python-if-elif",
    title: "Python Elif",
    intro:
      "Elif adds extra choices to an if statement. It lets a program pick one outcome out of many, checking the conditions in order.",
    blocks: [
      { type: "heading", text: "What is elif?" },
      {
        type: "para",
        text: "Elif is short for else if. It sits between an if and an optional else, and it adds another condition to test. Python checks the conditions from top to bottom and runs the first block whose condition is True. Once one block runs, the rest are skipped.",
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
      { type: "heading", text: "Order matters" },
      {
        type: "para",
        text: "In the grade example, the conditions are checked from highest to lowest. Marks of 72 fail the first test, since 72 is not 90 or more, and pass the second test, since 72 is 60 or more. If the order were reversed, every mark above 40 would stop at the first test and always get Grade C.",
      },
      {
        type: "code",
        title: "The wrong order gives the wrong answer",
        code: `marks = 95
if marks >= 40:
    print("Grade C")
elif marks >= 60:
    print("Grade B")
elif marks >= 90:
    print("Grade A")`,
        output: "Grade C",
      },
      { type: "heading", text: "Elif with different kinds of tests" },
      {
        type: "para",
        text: "The conditions in an elif chain do not have to test the same variable. Each one can test something different, as long as only one of them should run. The chain still stops at the first True condition.",
      },
      {
        type: "code",
        title: "A greeting based on the hour",
        code: `hour = 15
if hour < 12:
    print("Good morning")
elif hour < 17:
    print("Good afternoon")
else:
    print("Good evening")`,
        output: "Good afternoon",
      },
      {
        type: "note",
        text: "You can have as many elif blocks as you need, but a very long chain is a sign that a dictionary or a match statement might be clearer.",
      },
    ],
    practice: [
      "Write a program that prints a grade from marks using four elif branches.",
      "Write a program that prints a greeting based on the hour, using elif.",
      "Change the order of the conditions in a grade program and see what goes wrong.",
    ],
    summary: [
      "elif adds another condition to an if statement.",
      "Python checks conditions from top to bottom and runs only the first True one.",
      "Order matters: check the most specific or highest values first.",
      "The final else catches every value that matched nothing.",
    ],
  },
  {
    slug: "python-if-else",
    title: "Python Else",
    intro:
      "Else is the fallback of an if statement. It runs when every condition above it is False, so it catches everything the earlier tests missed.",
    blocks: [
      { type: "heading", text: "What is else?" },
      {
        type: "para",
        text: "The else block runs when the if condition is False. It has no condition of its own, so it catches every case the if did not handle. Together, if and else cover every possibility: one of the two blocks always runs.",
      },
      {
        type: "code",
        title: "A simple if else choice",
        code: `age = 15
if age >= 18:
    print("You can vote")
else:
    print("You cannot vote")`,
        output: "You cannot vote",
      },
      { type: "heading", text: "Else at the end of an elif chain" },
      {
        type: "para",
        text: "At the end of an if-elif chain, else catches every value that matched no condition. In a grade program, else is the natural place for the lowest grade, because it covers every mark below the lowest elif.",
      },
      {
        type: "code",
        title: "Else as the final fallback",
        code: `marks = 25
if marks >= 90:
    print("Grade A")
elif marks >= 60:
    print("Grade B")
elif marks >= 40:
    print("Grade C")
else:
    print("Grade D")`,
        output: "Grade D",
      },
      { type: "heading", text: "Else is optional" },
      {
        type: "para",
        text: "An if statement does not need an else. When there is no else, a False condition simply means nothing happens and the program moves on. Add an else only when there is something to do in the False case.",
      },
      {
        type: "code",
        title: "An if without an else",
        code: `temperature = 28
if temperature > 30:
    print("It is hot")
print("Done")`,
        output: "Done",
      },
      {
        type: "note",
        text: "An else must belong to an if or an elif. Writing else on its own, without an if above it, is a syntax error.",
      },
    ],
    practice: [
      "Write a program that prints \"Even\" or \"Odd\" for a number, using if and else.",
      "Write a grade program with an else for the lowest grade.",
      "Write an if statement with no else, and check that nothing prints when the condition is False.",
    ],
    summary: [
      "else runs when the if condition is False.",
      "At the end of an elif chain, else catches every value that matched nothing.",
      "else is optional: an if can stand alone.",
      "An else must follow an if or an elif.",
    ],
  },
  {
    slug: "python-if-shorthand",
    title: "Shorthand If",
    intro:
      "Python lets you write short if statements on a single line. This page covers the one-line if, the one-line if-else, and when to use them.",
    blocks: [
      { type: "heading", text: "A one-line if" },
      {
        type: "para",
        text: "When an if block has only one statement, you can put it on the same line as the if. This is called a shorthand if. It is handy for short, simple actions, but it should not be used for anything longer.",
      },
      {
        type: "code",
        title: "A one-line if",
        code: `age = 20
if age >= 18: print("You can vote")
temperature = 28
if temperature > 30: print("It is hot")
print("Done")`,
        output: "You can vote\nDone",
      },
      { type: "heading", text: "A one-line if-else" },
      {
        type: "para",
        text: "An if-else that only picks a value can be written as a ternary expression: value_if_true if condition else value_if_false. It is an expression, which means you can store its result, print it, or pass it to a function.",
      },
      {
        type: "code",
        title: "A ternary if-else",
        code: `age = 20
status = "adult" if age >= 18 else "minor"
print(status)
print("Pass" if 82 >= 40 else "Fail")`,
        output: "adult\nPass",
      },
      { type: "heading", text: "Short if-elif-else chains" },
      {
        type: "para",
        text: "You can also write a whole if-elif-else chain on one line, but it is rarely a good idea. The line gets long and hard to read, and a normal chain with indented blocks is clearer.",
      },
      {
        type: "code",
        title: "A short chain, kept readable",
        code: `marks = 72
grade = "A" if marks >= 90 else ("B" if marks >= 60 else ("C" if marks >= 40 else "D"))
print(grade)`,
        output: "B",
      },
      {
        type: "note",
        text: "Shorthand if is for short, simple actions only. If the block has more than one statement, or the condition is long, use the normal indented form.",
      },
    ],
    practice: [
      "Write a one-line if that prints a message when a number is greater than 10.",
      "Use a ternary to store \"Pass\" or \"Fail\" from a marks value of 35.",
      "Rewrite a one-line if-else as a normal if-else with indented blocks.",
    ],
    summary: [
      "A one-line if fits a single short statement on the same line as the if.",
      "A ternary picks one of two values: value_if_true if condition else value_if_false.",
      "Shorthand forms are for short, simple cases only.",
      "Use normal indented blocks when the logic is longer or has several statements.",
    ],
  },
  {
    slug: "python-if-logical",
    title: "Logical Operators",
    intro:
      "Logical operators combine conditions inside an if statement. They are how you say both of these must be true, or at least one of them must be true.",
    blocks: [
      { type: "heading", text: "And, or, and not in conditions" },
      {
        type: "para",
        text: "The and operator gives True only when both sides are True. The or operator gives True when at least one side is True. The not operator flips a boolean. Together, they let you build conditions with more than one part.",
      },
      {
        type: "code",
        title: "Combining two conditions",
        code: `age = 20
is_citizen = True
if age >= 18 and is_citizen:
    print("You can vote")
else:
    print("You cannot vote")`,
        output: "You can vote",
      },
      { type: "heading", text: "Using or for either condition" },
      {
        type: "para",
        text: "Sometimes either condition is enough. A shop gives a discount to students or to senior citizens, so either one qualifies. The or operator covers that case.",
      },
      {
        type: "code",
        title: "Either condition is enough",
        code: `is_student = False
is_senior = True
if is_student or is_senior:
    print("Discount applies")
else:
    print("No discount")`,
        output: "Discount applies",
      },
      { type: "heading", text: "Using not to flip a condition" },
      {
        type: "para",
        text: "The not operator flips a condition. It is useful when you want to test the opposite of something, like whether a list is empty or whether a user is not logged in.",
      },
      {
        type: "code",
        title: "Flipping a condition with not",
        code: `is_logged_in = False
if not is_logged_in:
    print("Please log in")
tasks = []
if not tasks:
    print("No tasks left")`,
        output: "Please log in\nNo tasks left",
      },
      {
        type: "note",
        text: "And has higher precedence than or, so a and b or c means (a and b) or c. Use brackets when the grouping is not obvious.",
      },
    ],
    practice: [
      "Write a program that prints a message only when a number is between 10 and 20, using and.",
      "Write a program that gives a discount to students or senior citizens, using or.",
      "Write a program that prints a message when a list is empty, using not.",
    ],
    summary: [
      "and needs both sides True; or needs at least one side True.",
      "not flips a condition.",
      "Logical operators combine comparisons into bigger conditions.",
      "Use brackets when the grouping of and and or is not obvious.",
    ],
  },
  {
    slug: "python-if-nested-if",
    title: "Nested If",
    intro:
      "A nested if is an if statement inside another if statement. It lets you test a second condition only after the first one is true.",
    blocks: [
      { type: "heading", text: "What is a nested if?" },
      {
        type: "para",
        text: "A nested if is an if statement placed inside the block of another if statement. The inner if is only tested when the outer condition is True. This is useful when a decision has two layers, like checking whether a user is old enough and then checking whether they have a ticket.",
      },
      {
        type: "code",
        title: "Two layers of checks",
        code: `age = 20
has_ticket = True
if age >= 18:
    if has_ticket:
        print("Welcome to the show")
    else:
        print("You need a ticket")
else:
    print("You are too young")`,
        output: "Welcome to the show",
      },
      { type: "heading", text: "Nested if versus and" },
      {
        type: "para",
        text: "The same two checks can often be written as one condition with and. Use a nested if when the inner check needs its own message, and use and when both checks lead to the same outcome. The nested form is clearer when each layer has a different message.",
      },
      {
        type: "code",
        title: "The same checks with and",
        code: `age = 20
has_ticket = True
if age >= 18 and has_ticket:
    print("Welcome to the show")
else:
    print("Cannot enter")`,
        output: "Welcome to the show",
      },
      { type: "heading", text: "Three levels of nesting" },
      {
        type: "para",
        text: "Nesting can go deeper, but each level adds indentation and makes the code harder to follow. Three levels is usually the most you should use; deeper than that, it is better to use and, or a function that returns early.",
      },
      {
        type: "code",
        title: "Three levels, kept short",
        code: `age = 20
has_ticket = True
is_member = True
if age >= 18:
    if has_ticket:
        if is_member:
            print("Welcome, member")
        else:
            print("Welcome, guest")`,
        output: "Welcome, member",
      },
      {
        type: "note",
        text: "Every level of nesting adds four spaces of indentation. Keep nesting shallow, and combine simple conditions with and instead of nesting them.",
      },
    ],
    practice: [
      "Write a nested if that checks age and then checks for a ticket, with a different message for each case.",
      "Rewrite your nested if using and, and compare the two versions.",
      "Write a nested if that checks whether a number is positive, and then whether it is even.",
    ],
    summary: [
      "A nested if is an if statement inside another if statement.",
      "The inner if is only tested when the outer condition is True.",
      "Use nesting when each layer needs its own message; use and otherwise.",
      "Keep nesting shallow: three levels is usually the most you should use.",
    ],
  },
  {
    slug: "python-if-pass",
    title: "Pass Statement",
    intro:
      "The pass statement does nothing. It is a placeholder for code you have not written yet, so that a block that must exist can stay empty.",
    blocks: [
      { type: "heading", text: "What is pass?" },
      {
        type: "para",
        text: "Python needs at least one statement inside every block. An if, a loop, or a function with an empty block is a syntax error. The pass statement fills that gap: it does nothing, but it counts as a statement, so the block is valid.",
      },
      {
        type: "code",
        title: "Pass as a placeholder",
        code: `age = 20
if age >= 18:
    pass
else:
    print("Too young")
print("Done")`,
        output: "Done",
      },
      { type: "heading", text: "Pass in a function you have not written yet" },
      {
        type: "para",
        text: "When you plan a program, you often know the names of the functions before you know how they work. Writing pass inside each one lets the program run while you fill them in one by one.",
      },
      {
        type: "code",
        title: "A function with pass inside",
        code: `def greet():
    pass

def farewell():
    print("Goodbye")

greet()
farewell()`,
        output: "Goodbye",
      },
      { type: "heading", text: "Pass in a loop" },
      {
        type: "para",
        text: "Pass is also useful in a loop when you want to skip a case for now. The loop still runs for every item, but the pass branch does nothing, which is clearer than leaving the branch empty.",
      },
      {
        type: "code",
        title: "Pass inside a loop",
        code: `for n in range(1, 6):
    if n % 2 == 0:
        pass
    else:
        print(n, "is odd")`,
        output: "1 is odd\n3 is odd\n5 is odd",
      },
      {
        type: "note",
        text: "Pass is not the same as continue. Continue skips the rest of the current round of a loop, while pass does nothing and the loop carries on normally.",
      },
    ],
    practice: [
      "Write an if statement with pass in its block and print a line after it.",
      "Write a function with pass inside it, then call it and check that nothing happens.",
      "Write a loop that uses pass for even numbers and prints odd numbers.",
    ],
    summary: [
      "pass does nothing; it is a placeholder for code not written yet.",
      "Every block needs at least one statement, and pass fills that gap.",
      "Use pass in functions and branches you plan to fill in later.",
      "pass is not continue: it does nothing and the loop carries on normally.",
    ],
  },
  {
    slug: "python-challenges-if-basics",
    title: "Code Challenge",
    intro:
      "A small challenge to test what you learned about if statements. Try it yourself before reading the solution.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Write a program that works out the ticket price for a visitor. Children under 5 enter free. Children from 5 to 12 pay 50 rupees. Adults from 13 to 59 pay 100 rupees. Seniors aged 60 or more pay 60 rupees. Print the price for a given age, and add a message saying whether the visitor is a child, an adult, or a senior.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "Use an if-elif-else chain, checking the ages from youngest to oldest.",
          "Each branch should set the price and the category, then print them.",
          "Test with ages on both sides of every boundary: 4, 5, 12, 13, 59, and 60.",
        ],
      },
      { type: "heading", text: "The solution" },
      {
        type: "para",
        text: "Here is one correct solution, using the sample age shown in the output.",
      },
      {
        type: "code",
        title: "Solution",
        code: `age = 10
if age < 5:
    price = 0
    category = "child"
elif age <= 12:
    price = 50
    category = "child"
elif age < 60:
    price = 100
    category = "adult"
else:
    price = 60
    category = "senior"
print(f"Age {age}: {category}, Rs. {price}")`,
        output: "Age 10: child, Rs. 50",
      },
      {
        type: "para",
        text: "An age of 10 falls into the second branch, so the price is 50 rupees. The chain checks the conditions in order and runs only the first one that is true.",
      },
      {
        type: "code",
        title: "Check: a senior and a baby",
        code: `for age in [3, 65]:
    if age < 5:
        price = 0
        category = "child"
    elif age <= 12:
        price = 50
        category = "child"
    elif age < 60:
        price = 100
        category = "adult"
    else:
        price = 60
        category = "senior"
    print(f"Age {age}: {category}, Rs. {price}")`,
        output: "Age 3: child, Rs. 0\nAge 65: senior, Rs. 60",
      },
      {
        type: "tip",
        text: "When a rule has boundaries, test the values on both sides of every boundary. A single wrong comparison, like < instead of <=, shows up at once.",
      },
    ],
    practice: [
      "Solve the challenge with an age of 45 and check the price.",
      "Add a branch for students aged 13 to 25 who pay 70 rupees.",
      "Write a program that prints the grade for marks of 88 using an elif chain.",
    ],
    summary: [
      "An if-elif-else chain picks one outcome out of many.",
      "Check conditions in order and run only the first True one.",
      "Each branch can set several values before printing.",
      "Test boundary values on both sides of every limit.",
    ],
  },
  {
    slug: "python-match",
    title: "Match",
    intro:
      "The match statement compares one value against several patterns, called cases. It is a clean way to choose between many values.",
    blocks: [
      { type: "heading", text: "What is match case?" },
      {
        type: "para",
        text: "The match statement compares one value against several patterns, called cases. Python runs the block of the first case that matches the value. It is like a switch in other languages. Match case was added in Python 3.10, so it needs a modern version of Python to run.",
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
      { type: "heading", text: "The default case" },
      {
        type: "para",
        text: "The last case uses an underscore, which matches anything. It works like the else in an if statement and catches every value that did not match an earlier case. Without it, a value with no matching case would simply do nothing, which is usually a mistake.",
      },
      {
        type: "code",
        title: "The underscore case catches everything else",
        code: `day = 9
match day:
    case 1:
        print("Monday")
    case 2:
        print("Tuesday")
    case _:
        print("Invalid day")`,
        output: "Invalid day",
      },
      { type: "heading", text: "Match case in a calculator" },
      {
        type: "para",
        text: "Match case is a natural fit for the calculator from earlier lessons. Each operation is one case, and the underscore case handles unknown operations. Compare this version with the if and elif version and notice how much shorter and clearer it is.",
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
        type: "note",
        text: "Match case needs Python 3.10 or newer. On an older version, the same code fails with a syntax error, so use if and elif when you are not sure which version will run your program.",
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
    slug: "python-challenges-match",
    title: "Code Challenge",
    intro:
      "A small challenge to test what you learned about match case. Try it yourself before reading the solution.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Write a program that takes a month number from 1 to 12 and prints the season: Winter for December, January, and February; Spring for March, April, and May; Summer for June, July, and August; and Autumn for September, October, and November. Use a match statement with one case per season, and an underscore case for an invalid month number.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "A case can match several values with a vertical bar: case 12 | 1 | 2.",
          "The underscore case catches every month number that is not 1 to 12.",
          "Write one case per season, so the program has four cases plus the default.",
        ],
      },
      { type: "heading", text: "The solution" },
      {
        type: "para",
        text: "Here is one correct solution, using the sample month shown in the output.",
      },
      {
        type: "code",
        title: "Solution",
        code: `month = 11
match month:
    case 12 | 1 | 2:
        print("Winter")
    case 3 | 4 | 5:
        print("Spring")
    case 6 | 7 | 8:
        print("Summer")
    case 9 | 10 | 11:
        print("Autumn")
    case _:
        print("Invalid month")`,
        output: "Autumn",
      },
      {
        type: "para",
        text: "Month 11 matches the last season case, so the program prints Autumn. Each case groups three months with vertical bars, which is much shorter than writing three separate cases per season.",
      },
      {
        type: "code",
        title: "Check: a winter month and an invalid month",
        code: `for month in [1, 15]:
    match month:
        case 12 | 1 | 2:
            print("Winter")
        case 3 | 4 | 5:
            print("Spring")
        case 6 | 7 | 8:
            print("Summer")
        case 9 | 10 | 11:
            print("Autumn")
        case _:
            print("Invalid month")`,
        output: "Winter\nInvalid month",
      },
      {
        type: "tip",
        text: "When several values should do the same thing, group them in one case with vertical bars instead of writing the same block three times.",
      },
    ],
    practice: [
      "Solve the challenge with a month of 7 and check the season.",
      "Write a match case that prints the number of days in a month from its number.",
      "Write a match case that prints \"Weekend\" for 6 and 7 and \"Weekday\" for 1 to 5.",
    ],
    summary: [
      "match compares one value against several cases and runs the first match.",
      "A vertical bar groups several values into one case.",
      "The underscore case catches every value that matched nothing.",
      "Group values that share an outcome instead of repeating the same block.",
    ],
  },
  {
    slug: "python-while-loops",
    title: "While Loops",
    intro:
      "A while loop repeats a block as long as a condition stays true. Use it when you do not know in advance how many times the loop must run.",
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
      { type: "heading", text: "The counter must change" },
      {
        type: "para",
        text: "The counter line inside the loop is the most important part. It changes the value the condition tests, so the loop can eventually stop. Without it, count would stay 1 forever, the condition would always be True, and the program would print 1 forever. That is called an infinite loop.",
      },
      {
        type: "code",
        title: "Counting down",
        code: `count = 5
while count >= 1:
    print(count)
    count = count - 1
print("Blast off!")`,
        output: "5\n4\n3\n2\n1\nBlast off!",
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
    slug: "python-challenges-while-loops",
    title: "Code Challenge",
    intro:
      "A small challenge to test what you learned about while loops. Try it yourself before reading the solution.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Write a program that plays a guessing game. The secret number is 7. Keep asking the player for a guess until they guess correctly. After each wrong guess, print whether the secret number is higher or lower than the guess. When they guess correctly, print how many guesses it took.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "A while True loop keeps asking until a break stops it.",
          "Count each guess with a counter that starts at 0 and adds 1 each round.",
          "Compare the guess with the secret number to print Higher or Lower.",
          "Break out of the loop when the guess is correct.",
        ],
      },
      { type: "heading", text: "The solution" },
      {
        type: "para",
        text: "Here is one correct solution. The sample run below uses a fixed list of guesses instead of real input, so the output is the same every time: the player guesses 3, then 9, then 7.",
      },
      {
        type: "code",
        title: "Solution",
        code: `secret = 7
guesses = [3, 9, 7]
tries = 0
i = 0
while True:
    guess = guesses[i]
    i = i + 1
    tries = tries + 1
    print("Guess:", guess)
    if guess < secret:
        print("Higher")
    elif guess > secret:
        print("Lower")
    else:
        print("Correct! You guessed it in", tries, "tries")
        break`,
        output: "Guess: 3\nHigher\nGuess: 9\nLower\nGuess: 7\nCorrect! You guessed it in 3 tries",
      },
      {
        type: "para",
        text: "The loop runs three times. The first guess is too low, the second is too high, and the third is correct, so the break ends the loop. In the real game, replace the fixed list with input, like guess = int(input(\"Guess a number: \")).",
      },
      {
        type: "code",
        title: "The same game with real input",
        code: `secret = 7
tries = 0
while True:
    guess = int(input("Guess a number: "))
    tries = tries + 1
    if guess < secret:
        print("Higher")
    elif guess > secret:
        print("Lower")
    else:
        print("Correct! You guessed it in", tries, "tries")
        break`,
        output: "Guess a number: 3\nHigher\nGuess a number: 9\nLower\nGuess a number: 7\nCorrect! You guessed it in 3 tries",
      },
      {
        type: "tip",
        text: "A while True loop with a break is the standard pattern for a game that keeps going until the player wins. Make sure every path through the loop can reach a break.",
      },
    ],
    practice: [
      "Solve the challenge with real input and a secret number of your own.",
      "Change the game so it gives the player only 5 guesses, using a counter in the while condition.",
      "Write a while loop that keeps doubling a number until it is greater than 1000.",
    ],
    summary: [
      "A while True loop repeats until a break stops it.",
      "Compare each guess with the secret number to give a hint.",
      "Count the guesses with a counter that adds 1 each round.",
      "Every path through a while True loop must be able to reach a break.",
    ],
  },
  {
    slug: "python-for-loops",
    title: "For Loops",
    intro:
      "A for loop repeats a block of code once for each item in a sequence. Loops turn boring repetition into a few lines, and they are the heart of almost every program.",
    blocks: [
      { type: "heading", text: "What is a for loop?" },
      {
        type: "para",
        text: "A for loop walks through a sequence, such as a list, a string, or a range of numbers, and runs its block once for each item. The loop variable takes each item in turn, so inside the block you can use the current item. When the items run out, the loop ends and the program moves on.",
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
      { type: "heading", text: "The range function" },
      {
        type: "para",
        text: "The range function makes a sequence of numbers. Range(1, 6) gives the numbers 1 to 5, because the stop value is not included. This is the same stop rule as slicing. Range can also take a step, so range(0, 10, 2) gives 0, 2, 4, 6, and 8.",
      },
      {
        type: "code",
        title: "Range with a step",
        code: `for n in range(0, 10, 2):
    print(n)
for n in range(5, 0, -1):
    print(n)`,
        output: "0\n2\n4\n6\n8\n5\n4\n3\n2\n1",
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
    slug: "python-challenges-for-loops",
    title: "Code Challenge",
    intro:
      "A small challenge to test what you learned about for loops. Try it yourself before reading the solution.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Write a program that prints the multiplication table of 7, from 7 times 1 to 7 times 10. Each line should look like 7 x 3 = 21. Then print the sum of all ten answers. Use a single for loop over range(1, 11) for the table, and build up the total inside the same loop.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "range(1, 11) gives the numbers 1 to 10.",
          "The answer for each line is 7 times the loop variable.",
          "Use an f-string to print each line, like f\"7 x {i} = {7 * i}\".",
          "Start a total at 0 before the loop and add each answer to it inside the loop.",
        ],
      },
      { type: "heading", text: "The solution" },
      {
        type: "para",
        text: "Here is one correct solution, using the number 7 as in the challenge.",
      },
      {
        type: "code",
        title: "Solution",
        code: `total = 0
for i in range(1, 11):
    answer = 7 * i
    print(f"7 x {i} = {answer}")
    total = total + answer
print("Sum of all answers:", total)`,
        output: "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70\nSum of all answers: 385",
      },
      {
        type: "para",
        text: "The loop runs ten times, once for each multiplier from 1 to 10. The total builds up inside the loop and is printed once, after the loop ends, at the same indentation as the for line.",
      },
      {
        type: "code",
        title: "Check: the table of 5",
        code: `total = 0
for i in range(1, 11):
    answer = 5 * i
    print(f"5 x {i} = {answer}")
    total = total + answer
print("Sum of all answers:", total)`,
        output: "5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25\n5 x 6 = 30\n5 x 7 = 35\n5 x 8 = 40\n5 x 9 = 45\n5 x 10 = 50\nSum of all answers: 275",
      },
      {
        type: "tip",
        text: "When a loop builds up a result, print the result after the loop, not inside it. A print inside the loop shows the running total after every step.",
      },
    ],
    practice: [
      "Solve the challenge with the table of 9 instead of 7.",
      "Use a loop to print the squares of the numbers 1 to 10.",
      "Use a loop to add the even numbers from 2 to 20 and print the total.",
    ],
    summary: [
      "A for loop runs its block once for each item in a sequence.",
      "range(1, 11) gives the numbers 1 to 10.",
      "An f-string prints each line of the table in a clear format.",
      "Build up a total inside the loop and print it once, after the loop ends.",
    ],
  },
];
