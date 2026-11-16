// Stage 2: Functions & Collections (Days 20-30).
// Written companion to the video lessons — plain English, short
// runnable examples, exact outputs.

import type { LessonTutorial } from "./types";

export const TUTORIALS: LessonTutorial[] = [
  {
    day: 20,
    title: "Functions in Python",
    intro: "A function is a named block of code that does one job. You define it once and call it as many times as you like, which keeps your programs short and easy to fix.",
    blocks: [
      { type: "heading", text: "What is a function?" },
      { type: "para", text: "A function groups a few lines of code under one name. Instead of writing the same lines again and again, you write them once inside a function and then call the function whenever you need that work done." },
      { type: "para", text: "You create a function with the def keyword, followed by the function name and a pair of brackets. The code inside the function is indented, just like the body of an if statement." },
      {
        type: "code",
        title: "Your first function",
        code: `def greet():
    print("Hello, welcome to Python!")

greet()
greet()`,
        output: "Hello, welcome to Python!\nHello, welcome to Python!",
      },
      { type: "para", text: "Calling greet() runs the code inside it. Here we called it twice, so the message printed twice. Nothing happens when you only define a function — it runs only when you call it." },
      { type: "heading", text: "Functions that take values" },
      { type: "para", text: "Most functions need some input to work with. You pass values into a function through parameters, which are names listed inside the brackets. When you call the function, you give it the actual values, called arguments." },
      {
        type: "code",
        title: "A function with parameters",
        code: `def add(a, b):
    return a + b

result = add(3, 4)
print(result)
print(add(10, 20))`,
        output: "7\n30",
      },
      { type: "para", text: "The return keyword sends a value back to the caller. The function add does not print anything itself — it hands the sum back, and the caller decides what to do with it. A function without return sends back the special value None." },
      { type: "heading", text: "Why functions matter" },
      {
        type: "list",
        items: [
          "Reuse: write once, use many times, so you fix a bug in one place only.",
          "Readability: a good name like calculate_total tells the reader what the code does.",
          "Testing: you can check one small function at a time instead of the whole program.",
          "Teamwork: different people can build different functions and join them together.",
        ],
      },
      {
        type: "code",
        title: "Reusing a function",
        code: `def square(number):
    return number * number

print(square(5))
print(square(9))
print(square(12))`,
        output: "25\n81\n144",
      },
      { type: "note", text: "A function must be defined before you call it. If you call greet() above the line where def greet() appears, Python stops with a NameError." },
      { type: "tip", text: "Give a function a clear verb name, like get_average or send_email. If a function does two unrelated jobs, split it into two functions." },
    ],
    practice: [
      "Write a function multiply that takes two numbers and returns their product, then call it with 6 and 7.",
      "Write a function is_even that takes a number and returns True if it is even and False if it is odd.",
      "Write a function shout that takes a word and prints it in capital letters three times.",
    ],
    summary: [
      "A function is a named, reusable block of code created with def.",
      "Parameters receive values when the function is called; arguments are the values you pass.",
      "return sends a value back to the caller; a function without return gives None.",
      "Functions make code shorter, clearer, and easier to test and fix.",
    ],
  },
  {
    day: 21,
    title: "Function Arguments",
    intro: "Arguments are the values you pass into a function. Python gives you three ways to pass them: by position, by name, and with default values — and each one solves a different everyday problem.",
    blocks: [
      { type: "heading", text: "Positional arguments" },
      { type: "para", text: "By default, arguments are matched to parameters by their position. The first value goes to the first parameter, the second value to the second parameter, and so on. The order matters, so read the parameter list carefully." },
      {
        type: "code",
        title: "Order matters",
        code: `def introduce(name, age):
    print("My name is", name)
    print("I am", age, "years old")

introduce("Asha", 20)`,
        output: "My name is Asha\nI am 20 years old",
      },
      { type: "para", text: "If you swap the values and call introduce(20, \"Asha\"), Python will not complain — it will simply print the wrong sentence. Python trusts you to pass the values in the right order." },
      { type: "heading", text: "Default arguments" },
      { type: "para", text: "Sometimes a parameter almost always gets the same value. You can give it a default in the definition, so the caller may skip it. If the caller passes a value, the default is ignored; if not, the default is used." },
      {
        type: "code",
        title: "A default value",
        code: `def greet(name="friend"):
    print("Hello,", name)

greet("Ravi")
greet()`,
        output: "Hello, Ravi\nHello, friend",
      },
      { type: "para", text: "Default parameters must come after the parameters without defaults. Writing def greet(name=\"friend\", age) is a syntax error, because Python would not know which value belongs to which parameter." },
      { type: "heading", text: "Keyword arguments" },
      { type: "para", text: "You can also pass an argument by writing the parameter name with it. Keyword arguments can come in any order, which makes the call easy to read when a function takes many values." },
      {
        type: "code",
        title: "Naming the arguments",
        code: `def describe(city, country="India"):
    print(city, "is in", country)

describe(country="France", city="Paris")
describe("Mumbai")`,
        output: "Paris is in France\nMumbai is in India",
      },
      { type: "note", text: "Once you use a keyword argument in a call, every argument after it must also be a keyword argument. So describe(city=\"Paris\", \"France\") is an error." },
      { type: "tip", text: "Use keyword arguments when a function takes more than two or three values, or when the values are easy to mix up, like width and height." },
    ],
    practice: [
      "Write a function power(base, exponent=2) that returns base raised to exponent, and call it with one argument and with two.",
      "Write a function order(item, quantity=1, price=100) and call it using keyword arguments in a different order.",
      "Call introduce from the first example with the arguments swapped and note what goes wrong.",
    ],
    summary: [
      "Positional arguments are matched by order; swapping them changes the result.",
      "A default value lets the caller skip an argument; defaults come last.",
      "Keyword arguments are passed by name and can be given in any order.",
      "Keyword arguments make calls with many values much easier to read.",
    ],
  },
  {
    day: 22,
    title: "Lists in Python",
    intro: "A list stores many values in one place, in order. Lists hold the items of a shopping cart, the scores of a class, or the names in a team — and you can change them as the program runs.",
    blocks: [
      { type: "heading", text: "What is a list?" },
      { type: "para", text: "A list is written with square brackets and commas between the items. A list can hold numbers, strings, or even a mix of both, although keeping one type in a list is usually cleaner." },
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
      { type: "para", text: "Items are numbered from zero, so fruits[0] is the first item. A negative index counts from the end, so fruits[-1] is the last item. len() tells you how many items the list holds." },
      { type: "heading", text: "Changing a list" },
      { type: "para", text: "Lists are mutable, which means you can change them after you create them. You can replace an item by its index, add new items to the end, and remove items you no longer need." },
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
      { type: "para", text: "A slice like numbers[1:4] takes items from index 1 up to, but not including, index 4. The append method adds one item to the end of the list." },
      { type: "heading", text: "Looping over a list" },
      { type: "para", text: "A for loop is the natural partner of a list. It visits each item once, in order, so you can print, check, or process every item without writing the index by hand." },
      {
        type: "code",
        title: "A loop over a list",
        code: `names = ["Asha", "Ravi", "Meera"]
for name in names:
    print("Hello,", name)`,
        output: "Hello, Asha\nHello, Ravi\nHello, Meera",
      },
      { type: "note", text: "Reading past the end of a list, like fruits[3] when the list has three items, raises an IndexError. The last valid index is always len(list) - 1." },
      { type: "tip", text: "Use the in operator to check membership: \"banana\" in fruits is True. It is clearer and safer than checking every index by hand." },
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
    day: 23,
    title: "List Methods",
    intro: "Methods are built-in tools that belong to a list. They let you add, remove, sort, and search items with one short call, instead of writing the same loops by hand every time.",
    blocks: [
      { type: "heading", text: "Adding and removing items" },
      { type: "para", text: "append adds one item to the end of a list, and insert puts an item at a chosen position. To take items out, remove deletes the first item with a given value, and pop removes an item by index and hands it back to you." },
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
      { type: "para", text: "Notice that pop returns the removed value, so you can store it in a variable. Without an index, pop removes the last item; with an index, like pop(0), it removes that exact position." },
      { type: "heading", text: "Sorting and searching" },
      { type: "para", text: "sort arranges a list in place, from smallest to largest, or alphabetically for strings. count tells you how many times a value appears, and index tells you where a value first appears." },
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
      { type: "para", text: "sort and reverse change the list itself and return None, so do not write scores = scores.sort() — that would replace your list with None. If you need a sorted copy, use the sorted() function instead." },
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
      { type: "note", text: "remove and index raise a ValueError if the value is not in the list. Check with in first, for example if \"blue\" in colors, when you are not sure the value is there." },
      { type: "tip", text: "When you only need to know how many times something appears, count is faster to write and easier to read than a loop with a counter variable." },
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
    day: 24,
    title: "Tuples in Python",
    intro: "A tuple is like a list, but it cannot be changed after it is created. Tuples are perfect for data that should stay fixed, like a point on a map or a date on a calendar.",
    blocks: [
      { type: "heading", text: "What is a tuple?" },
      { type: "para", text: "A tuple is written with round brackets and commas. Like a list, it keeps its items in order and lets you read them by index. Unlike a list, you cannot add, remove, or replace items once the tuple exists." },
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
      { type: "para", text: "Indexing works exactly like a list: the first item is at index 0 and the last item is at index -1. You can also slice a tuple, and the result is a new tuple." },
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
      { type: "para", text: "You can pull the items of a tuple into separate variables in one line. This is called unpacking, and it makes code that returns several values very clean to read." },
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
      { type: "para", text: "A tuple with one item needs a trailing comma, as in (5,). Without the comma, Python reads (5) as just the number 5 in brackets, not a tuple at all." },
      {
        type: "code",
        title: "Looping over a tuple",
        code: `days = ("Mon", "Tue", "Wed", "Thu", "Fri")
for day in days:
    print(day)`,
        output: "Mon\nTue\nWed\nThu\nFri",
      },
      { type: "note", text: "Trying to change a tuple item, like point[0] = 9, raises a TypeError. If you need to change the values, convert the tuple to a list with list(point), change the list, and convert it back with tuple()." },
      { type: "tip", text: "Use a tuple when the data is a fixed record, like coordinates or a name and age pair. Use a list when the collection will grow or change." },
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
    day: 25,
    title: "Operations on Tuples",
    intro: "Even though you cannot change a tuple, you can still combine tuples, repeat them, search them, and measure them. These operations let you work with fixed data without ever breaking it.",
    blocks: [
      { type: "heading", text: "Joining and repeating tuples" },
      { type: "para", text: "The plus operator joins two tuples into a new, longer tuple, and the star operator repeats a tuple. Neither one changes the original tuples — both operations build a fresh tuple and leave the old ones alone." },
      {
        type: "code",
        title: "Concatenation, repetition, membership",
        code: `a = (1, 2, 3)
b = (4, 5)
print(a + b)
print(a * 2)
print(2 in a)
print(9 in a)`,
        output: "(1, 2, 3, 4, 5)\n(1, 2, 3, 1, 2, 3)\nTrue\nFalse",
      },
      { type: "para", text: "The in operator works on tuples just like on lists. It checks whether a value appears anywhere in the tuple and gives back True or False." },
      { type: "heading", text: "Counting and finding" },
      { type: "para", text: "Tuples have only two methods of their own: count and index. count tells you how many times a value appears, and index tells you the position of its first appearance." },
      {
        type: "code",
        title: "count, index, min, max, sorted",
        code: `marks = (85, 90, 78, 90, 92)
print(marks.count(90))
print(marks.index(78))
print(max(marks))
print(min(marks))
print(sorted(marks))`,
        output: "2\n2\n92\n78\n[78, 85, 90, 90, 92]",
      },
      { type: "para", text: "The built-in functions max, min, and len also work on tuples. Note that sorted() returns a list, not a tuple — if you need a tuple back, wrap the result in tuple(), like tuple(sorted(marks))." },
      { type: "heading", text: "Comparing tuples" },
      { type: "para", text: "You can compare two tuples with == to check if they hold the same items in the same order. You can also compare them with less-than and greater-than, which compare item by item from the left until one differs." },
      {
        type: "code",
        title: "Comparing tuples",
        code: `print((1, 2, 3) == (1, 2, 3))
print((1, 2, 3) == (1, 2, 4))
print((1, 3) > (1, 2))`,
        output: "True\nFalse\nTrue",
      },
      { type: "note", text: "There is no sort or append method on a tuple. That is the whole point of a tuple: the data stays exactly as it was created." },
      { type: "tip", text: "When a function returns two or three related values, return them as one tuple and unpack the result at the call site. It keeps the code short and the values together." },
    ],
    practice: [
      "Join (\"red\", \"green\") and (\"blue\",) into one tuple and print it, then repeat the result two times.",
      "For the tuple (4, 7, 4, 9, 4), print how many times 4 appears and the index of 9.",
      "Write a function that returns the smallest and largest number from a list as a tuple, then unpack the result.",
    ],
    summary: [
      "Plus joins tuples and star repeats them; both create new tuples.",
      "count and index are the only methods a tuple has.",
      "max, min, and len work on tuples; sorted() returns a list.",
      "Tuples compare item by item, starting from the left.",
    ],
  },
  {
    day: 26,
    title: "Exercise 2: Good Morning Greeting",
    intro: "This exercise turns a simple if-else chain into a program that greets you correctly at any hour of the day. It is the classic first exercise that combines the datetime module with conditions.",
    blocks: [
      { type: "heading", text: "The problem" },
      { type: "para", text: "Write a program that greets the user based on the current time. If it is before noon, say Good morning. From noon until 5 in the evening, say Good afternoon. After that, say Good evening." },
      { type: "para", text: "The program must read the real time from the computer, not a fixed hour written in the code. Python's datetime module gives you the current date and time, and the hour attribute gives you just the hour as a number from 0 to 23." },
      { type: "heading", text: "The plan" },
      {
        type: "list",
        items: [
          "Import the datetime module and read the current hour.",
          "Check the hour with an if-elif-else chain.",
          "Pick the right greeting for each time range and print it.",
        ],
      },
      {
        type: "code",
        title: "The greeting logic with a fixed hour",
        code: `hour = 9

if hour < 12:
    greeting = "Good morning"
elif hour < 17:
    greeting = "Good afternoon"
else:
    greeting = "Good evening"

print(greeting + ", welcome to Python!")`,
        output: "Good morning, welcome to Python!",
      },
      { type: "para", text: "Here the hour is 9, which is less than 12, so the first branch runs. If you change hour to 15, the second branch runs and prints Good afternoon. The chain checks the conditions in order and runs only the first one that is true." },
      { type: "heading", text: "The complete solution" },
      { type: "para", text: "The real program replaces the fixed hour with datetime.datetime.now().hour. The now() call returns the current date and time, and .hour pulls out just the hour." },
      {
        type: "code",
        title: "Full program using the real time",
        code: `import datetime

now = datetime.datetime(2026, 11, 16, 15, 30)
hour = now.hour
print("Current hour:", hour)

if hour < 12:
    print("Good morning!")
elif hour < 17:
    print("Good afternoon!")
else:
    print("Good evening!")`,
        output: "Current hour: 15\nGood afternoon!",
      },
      { type: "para", text: "In this run the time is 3:30 in the afternoon, so the hour is 15 and the program prints Good afternoon. When you run the same code with datetime.datetime.now() instead of the fixed date, it will greet you according to the actual time on your computer." },
      { type: "heading", text: "The same logic as a function" },
      { type: "para", text: "Wrapping the logic in a function makes it reusable and easy to test with any hour you like." },
      {
        type: "code",
        title: "Greeting function",
        code: `def greet_by_time(hour):
    if hour < 12:
        return "Good morning"
    elif hour < 17:
        return "Good afternoon"
    else:
        return "Good evening"

print(greet_by_time(8))
print(greet_by_time(14))
print(greet_by_time(20))`,
        output: "Good morning\nGood afternoon\nGood evening",
      },
      { type: "note", text: "The hour from datetime uses the 24-hour clock: midnight is 0, noon is 12, and 11 at night is 23. There is no AM or PM to worry about, which keeps the comparisons simple." },
      { type: "tip", text: "When you test time-based code, pass the hour in as a value first, like the function above. Once the logic works, connect it to the real clock." },
    ],
    practice: [
      "Change the hour ranges so the program also says Good night after 9 in the evening.",
      "Rewrite the program so it asks the user to type the hour, then prints the right greeting.",
      "Add a Good afternoon message that also prints the current time, like Good afternoon, it is 3 PM.",
    ],
    summary: [
      "datetime.datetime.now().hour gives the current hour as a number from 0 to 23.",
      "An if-elif-else chain picks one greeting for each time range.",
      "Only the first true condition runs; the rest are skipped.",
      "Test time logic with fixed hours first, then connect the real clock.",
    ],
  },
  {
    day: 27,
    title: "Exercise 3: Kaun Banega Crorepati",
    intro: "In this exercise you build a small quiz game like the TV show Kaun Banega Crorepati. The player answers questions to win prize money, and one wrong answer ends the game.",
    blocks: [
      { type: "heading", text: "The game" },
      { type: "para", text: "The game shows a question with four options and a prize amount. The player types the number of their answer. A correct answer adds the prize money to their total and moves to the next question. A wrong answer ends the game, and the player takes home whatever they have won so far." },
      { type: "heading", text: "Storing the questions" },
      { type: "para", text: "Each question is one list: the question text, four options, and the number of the correct option. All the questions live in one big list, and a second list holds the prize money for each round." },
      {
        type: "code",
        title: "The questions data",
        code: `questions = [
    ["Capital of India?", "Mumbai", "Delhi", "Kolkata", "Chennai", 2],
    ["Red Planet?", "Venus", "Jupiter", "Mars", "Saturn", 3],
]

for q in questions:
    print(q[0], "- correct option:", q[5])`,
        output: "Capital of India? - correct option: 2\nRed Planet? - correct option: 3",
      },
      { type: "para", text: "Each inner list has six items. The first is the question, the next four are the options, and the last is the number of the correct option. q[5] reads that last item." },
      { type: "heading", text: "The complete game" },
      { type: "para", text: "The game loops over the questions. For each one it prints the question and the four options, reads the player's answer, and compares it with the stored correct option. A correct answer updates the money; a wrong answer breaks out of the loop." },
      {
        type: "code",
        title: "Full KBC game (answers typed: 2, then 1)",
        code: `questions = [
    ["What is the capital of India?", "Mumbai", "Delhi", "Kolkata", "Chennai", 2],
    ["Which planet is known as the Red Planet?", "Venus", "Jupiter", "Mars", "Saturn", 3],
    ["How many days are there in a leap year?", "365", "366", "364", "360", 2],
]
prizes = [1000, 2000, 5000]

money = 0
for i in range(len(questions)):
    q = questions[i]
    print("Question for Rs.", prizes[i])
    print(q[0])
    print("1.", q[1])
    print("2.", q[2])
    print("3.", q[3])
    print("4.", q[4])
    answer = int(input("Enter your answer (1-4): "))
    if answer == q[5]:
        money = prizes[i]
        print("Correct! You won Rs.", money)
    else:
        print("Wrong answer. Game over!")
        break
print("You take home Rs.", money)`,
        output: "Question for Rs. 1000\nWhat is the capital of India?\n1. Mumbai\n2. Delhi\n3. Kolkata\n4. Chennai\nEnter your answer (1-4): 2\nCorrect! You won Rs. 1000\nQuestion for Rs. 2000\nWhich planet is known as the Red Planet?\n1. Venus\n2. Jupiter\n3. Mars\n4. Saturn\nEnter your answer (1-4): 1\nWrong answer. Game over!\nYou take home Rs. 1000",
      },
      { type: "para", text: "In this run the player answers the first question correctly and wins Rs. 1000, then answers the second question wrongly. The break statement stops the loop at once, so the third question is never shown, and the player takes home Rs. 1000." },
      { type: "heading", text: "How the pieces fit together" },
      {
        type: "list",
        items: [
          "A list of lists holds all the questions, options, and correct answers.",
          "range(len(questions)) gives the index of each question, so the matching prize is easy to find.",
          "int(input(...)) turns the typed answer into a number for comparison.",
          "break ends the loop early on a wrong answer; the final print runs either way.",
        ],
      },
      { type: "note", text: "The answer from input() is always a string, so comparing it directly with q[5] would always be False. Converting it with int() first is the step most beginners forget." },
      { type: "tip", text: "Add more questions by appending one more list to questions and one more amount to prizes. The loop and the rest of the code do not need any change." },
    ],
    practice: [
      "Add two more questions of your own to the questions list, with matching prize amounts.",
      "Change the game so the player must answer all questions correctly to win, and a wrong answer takes them home with Rs. 0.",
      "Add a welcome message that prints the rules before the first question appears.",
    ],
    summary: [
      "A list of lists stores each question, its four options, and the correct answer.",
      "The loop shows one question at a time and checks the answer against the stored option.",
      "A correct answer updates the prize money; a wrong answer breaks the loop.",
      "input() returns a string, so convert it with int() before comparing.",
    ],
  },
  {
    day: 28,
    title: "f-strings in Python",
    intro: "An f-string lets you place variables and even small calculations directly inside a string. It is the clearest way to build messages, reports, and labels in Python.",
    blocks: [
      { type: "heading", text: "What is an f-string?" },
      { type: "para", text: "Put the letter f just before the opening quote of a string, and anything inside curly braces is evaluated and placed into the string. The variable is replaced by its value, so you no longer need to join pieces with plus signs or commas." },
      {
        type: "code",
        title: "Your first f-string",
        code: `name = "Asha"
age = 20
print(f"My name is {name} and I am {age} years old.")`,
        output: "My name is Asha and I am 20 years old.",
      },
      { type: "para", text: "Compare that with the old way: print(\"My name is \" + name + \" and I am \" + str(age) + \" years old.\"). The f-string version is shorter, easier to read, and has no fiddly type conversions." },
      { type: "heading", text: "Calculations inside f-strings" },
      { type: "para", text: "The braces can hold more than a variable name. You can put any expression inside them: arithmetic, a method call, or a value formatted to a fixed number of decimal places." },
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
      { type: "para", text: "The :.2f inside the braces formats pi to two decimal places. The original value of pi is not changed — only the text that is printed is rounded." },
      { type: "heading", text: "f-strings with conditions" },
      { type: "para", text: "You can even put a short if-else expression inside the braces. This is handy for messages that change based on a value, like showing a different word for a pass or a fail." },
      {
        type: "code",
        title: "A conditional inside an f-string",
        code: `marks = 82
print(f"Result: {'Pass' if marks >= 40 else 'Fail'}")
print(f"Marks: {marks} out of 100")`,
        output: "Result: Pass\nMarks: 82 out of 100",
      },
      { type: "note", text: "Inside an f-string you cannot use the same kind of quote as the one that opens the string. So f\"{'Pass'}\" works, but f\"{\"Pass\"}\" is a syntax error. Use single quotes inside a double-quoted f-string, or the other way round." },
      { type: "tip", text: "For debugging, put an equals sign after the variable name, like f\"{marks=}\". Python prints both the name and the value: marks=82." },
    ],
    practice: [
      "Create variables for your name, city, and age, then print one sentence about yourself with a single f-string.",
      "Use an f-string to print the total price of 4 notebooks at Rs. 45 each, with the calculation inside the braces.",
      "Format the number 1234.5678 to two decimal places inside an f-string.",
    ],
    summary: [
      "An f-string starts with f before the quote and evaluates expressions in curly braces.",
      "Braces can hold variables, arithmetic, method calls, and conditions.",
      ":.2f formats a number to two decimal places in the printed text.",
      "f-strings replace string joining with plus and str() in most everyday code.",
    ],
  },
  {
    day: 29,
    title: "Docstrings in Python",
    intro: "A docstring is a short description written right under a function's definition. It tells the next reader what the function does, without them having to read the code.",
    blocks: [
      { type: "heading", text: "What is a docstring?" },
      { type: "para", text: "A docstring is a string literal placed as the very first statement inside a function, class, or module. It is written with triple quotes and describes what the code does, what it takes in, and what it returns." },
      {
        type: "code",
        title: "A function with a docstring",
        code: `def add(a, b):
    """Add two numbers and return the result."""
    return a + b

print(add(2, 3))
print(add.__doc__)`,
        output: "5\nAdd two numbers and return the result.",
      },
      { type: "para", text: "Python stores the docstring in a special attribute called __doc__. Reading add.__doc__ gives you the text back, which is how tools like help() display documentation for a function." },
      { type: "heading", text: "What a good docstring says" },
      {
        type: "list",
        items: [
          "What the function does, in one plain sentence.",
          "What each parameter means, when it is not obvious from the name.",
          "What the function returns, and what type it is.",
          "Anything surprising, like an error it may raise.",
        ],
      },
      {
        type: "code",
        title: "A docstring that describes the result",
        code: `def is_even(number):
    """Check if a number is even. Returns True or False."""
    return number % 2 == 0

print(is_even(10))
print(is_even(7))
print(is_even.__doc__)`,
        output: "True\nFalse\nCheck if a number is even. Returns True or False.",
      },
      { type: "para", text: "A docstring is not a comment. A comment explains why a tricky line exists; a docstring explains what the whole function is for. Both are useful, and they do different jobs." },
      { type: "heading", text: "Multi-line docstrings" },
      { type: "para", text: "When a function needs more than one line of explanation, the docstring grows. The first line is a short summary, then a blank line, then the detail. This is the style used across Python's own standard library." },
      {
        type: "code",
        title: "A longer docstring",
        code: `def area_of_circle(radius):
    """Return the area of a circle.

    The radius must be a positive number.
    """
    return 3.14159 * radius * radius

print(area_of_circle(5))
print(area_of_circle.__doc__)`,
        output: "78.53975\nReturn the area of a circle.\n\n    The radius must be a positive number.\n    ",
      },
      { type: "note", text: "The docstring text is stored exactly as written, including the line breaks and the spaces at the start of the later lines. That is why the printed output shows a blank line and indented text." },
      { type: "tip", text: "Write the docstring before you write the function body. Saying in words what the function should do often makes the code itself easier to write." },
    ],
    practice: [
      "Add a one-line docstring to the square function from Day 20 and print its __doc__.",
      "Write a function average that takes a list of numbers, give it a two-line docstring, and check the output of __doc__.",
      "Open a Python shell, type help(len), and read how the built-in documentation is written.",
    ],
    summary: [
      "A docstring is a triple-quoted string as the first statement in a function.",
      "It describes what the function does, its inputs, and its return value.",
      "Python stores it in the __doc__ attribute, which help() reads.",
      "Docstrings describe the whole function; comments explain tricky lines.",
    ],
  },
  {
    day: 30,
    title: "Recursion in Python",
    intro: "Recursion is when a function calls itself to solve a smaller piece of the same problem. It is the natural way to write factorials, countdowns, and tree-like problems.",
    blocks: [
      { type: "heading", text: "What is recursion?" },
      { type: "para", text: "A recursive function solves a problem by calling itself with a smaller input, again and again, until it reaches a case so simple that the answer is obvious. That simple case is called the base case, and without it the function would call itself forever." },
      { type: "heading", text: "Factorial, the classic example" },
      { type: "para", text: "The factorial of 5 is 5 times 4 times 3 times 2 times 1. Notice that the factorial of 5 is just 5 times the factorial of 4 — the same problem, one step smaller. That pattern is exactly what recursion expresses." },
      {
        type: "code",
        title: "Factorial with recursion",
        code: `def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))
print(factorial(0))`,
        output: "120\n1",
      },
      { type: "para", text: "When you call factorial(5), it calls factorial(4), which calls factorial(3), and so on down to factorial(1), which returns 1 at once. Then each waiting call multiplies its number and returns, unwinding back up to 120." },
      { type: "heading", text: "A countdown that prints as it goes" },
      { type: "para", text: "Recursion is not only for returning values. A function can also do work, like printing, before calling itself with a smaller number." },
      {
        type: "code",
        title: "Recursive countdown",
        code: `def countdown(n):
    if n == 0:
        print("Blast off!")
    else:
        print(n)
        countdown(n - 1)

countdown(3)`,
        output: "3\n2\n1\nBlast off!",
      },
      { type: "heading", text: "Fibonacci numbers" },
      { type: "para", text: "Each Fibonacci number is the sum of the two before it: 0, 1, 1, 2, 3, 5, 8, and so on. This definition is itself recursive, so the code follows it almost word for word." },
      {
        type: "code",
        title: "Fibonacci with recursion",
        code: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(6))
print(fibonacci(10))`,
        output: "8\n55",
      },
      { type: "para", text: "Here the base case is n <= 1, where the function returns n directly. For larger n it makes two recursive calls and adds their results. Fibonacci with plain recursion gets slow for large numbers because it repeats the same work many times — a loop or a stored result is faster for big inputs." },
      { type: "note", text: "Every recursive function needs a base case and a step that moves toward it. Miss the base case and you get a RecursionError when Python hits its limit of about 1000 nested calls." },
      { type: "tip", text: "If you can say the problem as the same problem but smaller, recursion fits. If the problem is just repeating a simple step, a loop is usually clearer and faster." },
    ],
    practice: [
      "Write a recursive function sum_upto(n) that returns 1 + 2 + ... + n, and test it with 5.",
      "Write a recursive function that prints the numbers from n down to 1 without using a loop.",
      "Write a recursive function power(base, exp) that returns base raised to exp.",
    ],
    summary: [
      "A recursive function calls itself with a smaller input.",
      "The base case is the simple input with a direct answer; it stops the recursion.",
      "Factorial, countdown, and Fibonacci are all natural recursive problems.",
      "Missing a base case causes infinite recursion and a RecursionError.",
      "Use recursion when the problem is the same problem but smaller; use a loop otherwise.",
    ],
  },
];
