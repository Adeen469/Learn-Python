import type { LearnTutorial } from "./types";

export const TUTORIALS: LearnTutorial[] = [
  {
    slug: "python-functions",
    title: "Python Functions",
    intro: "A function is a named block of code that does one job. You define it once and call it as many times as you like, which keeps your programs short and easy to fix.",
    blocks: [
      { type: "para", text: "What is a function? A function groups a few lines of code under one name. Instead of writing the same lines again and again, you write them once inside a function and then call the function whenever you need that work done. You create a function with the def keyword, followed by the function name and a pair of brackets. The code inside the function is indented, just like the body of an if statement." },
      {
        type: "code",
        title: "Your first function",
        code: `def greet():
    print("Hello, welcome to Python!")

greet()
greet()`,
        output: "Hello, welcome to Python!\nHello, welcome to Python!",
      },
      { type: "para", text: "Calling greet() runs the code inside it. Here we called it twice, so the message printed twice. Nothing happens when you only define a function, it runs only when you call it. A function must be defined before you call it. If you call greet() above the line where def greet() appears, Python stops with a NameError." },
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
      { type: "para", text: "The return keyword sends a value back to the caller. The function add does not print anything itself, it hands the sum back, and the caller decides what to do with it. A function without return sends back the special value None. Give a function a clear verb name, like get_average or send_email. If a function does two unrelated jobs, split it into two functions." },
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
    slug: "python-arguments",
    title: "Python Arguments",
    intro: "Arguments are the values you pass into a function. Python gives you three ways to pass them: by position, by name, and with default values, and each one solves a different everyday problem.",
    blocks: [
      { type: "para", text: "Positional arguments: By default, arguments are matched to parameters by their position. The first value goes to the first parameter, the second value to the second parameter, and so on. The order matters, so read the parameter list carefully." },
      {
        type: "code",
        title: "Order matters",
        code: `def introduce(name, age):
    print("My name is", name)
    print("I am", age, "years old")

introduce("Asha", 20)`,
        output: "My name is Asha\nI am 20 years old",
      },
      { type: "para", text: "If you swap the values and call introduce(20, \"Asha\"), Python will not complain, it will simply print the wrong sentence. Python trusts you to pass the values in the right order." },
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
      { type: "para", text: "You can also pass an argument by writing the parameter name with it. Keyword arguments can come in any order, which makes the call easy to read when a function takes many values. Once you use a keyword argument in a call, every argument after it must also be a keyword argument. So describe(city=\"Paris\", \"France\") is an error. Use keyword arguments when a function takes more than two or three values, or when the values are easy to mix up, like width and height." },
      {
        type: "code",
        title: "Naming the arguments",
        code: `def describe(city, country="India"):
    print(city, "is in", country)

describe(country="France", city="Paris")
describe("Mumbai")`,
        output: "Paris is in France\nMumbai is in India",
      },
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
    slug: "python-args-kwargs",
    title: "Python *args / **kwargs",
    intro: "Sometimes a function needs to accept any number of arguments. The star forms *args and **kwargs let a function take as many positional or named values as the caller wants to give.",
    blocks: [
      { type: "para", text: "Collecting extra values with *args: A parameter written with one star, like *numbers, collects all extra positional arguments into a tuple. The function can then loop over that tuple, so it works with two values, ten values, or none at all." },
      {
        type: "code",
        title: "Adding any number of values",
        code: `def total(*numbers):
    return sum(numbers)

print(total(1, 2, 3))
print(total(10, 20, 30, 40))
print(total())`,
        output: "6\n100\n0",
      },
      { type: "para", text: "Inside the function, numbers is a normal tuple. You can loop over it, check its length with len, or pass it to sum, max, or min. The name args is a convention, you could call it *values, but *args is what other programmers expect to see." },
      { type: "heading", text: "Collecting named values with **kwargs" },
      { type: "para", text: "A parameter written with two stars, like **details, collects all extra keyword arguments into a dictionary. The keys are the argument names and the values are what the caller passed." },
      {
        type: "code",
        title: "Any number of named details",
        code: `def describe_person(name, **details):
    print(name)
    for key, value in details.items():
        print(key, "=", value)

describe_person("Asha", age=20, city="Mumbai")`,
        output: "Asha\nage = 20\ncity = Mumbai",
      },
      { type: "para", text: "This is useful for functions that accept optional settings. Instead of listing every possible setting as a parameter, the function accepts **options and reads only the ones it needs." },
      { type: "heading", text: "Using both together" },
      { type: "para", text: "A function can take normal parameters, then *args, then **kwargs, in that order. Python fills the named parameters first, packs the leftover positional values into *args, and packs the leftover keyword values into **kwargs. You can also unpack when you call a function. If you have a list of values, func(*my_list) spreads the list into separate arguments, and func(**my_dict) spreads a dictionary into keyword arguments. Use *args and **kwargs when the number of inputs is genuinely unknown, like a print-style helper or a wrapper. For a fixed set of inputs, plain named parameters are clearer." },
      {
        type: "code",
        title: "All three kinds in one function",
        code: `def order(item, *extras, **options):
    print(item, extras, options)

order("pizza", "cheese", "olives", size="large")`,
        output: "pizza ('cheese', 'olives') {'size': 'large'}",
      },
    ],
    practice: [
      "Write a function average(*marks) that returns the average of any number of marks, and test it with 3 and with 5 values.",
      "Write a function show_profile(name, **info) that prints the name and then each extra detail on its own line.",
      "Write a function that takes *args and returns the largest value, then call it with the numbers 4, 19, 2, and 11.",
    ],
    summary: [
      "*args collects extra positional arguments into a tuple.",
      "**kwargs collects extra keyword arguments into a dictionary.",
      "The order in a definition is: normal parameters, *args, then **kwargs.",
      "Use * and ** at a call to unpack a list or a dictionary into arguments.",
    ],
  },
  {
    slug: "python-scope",
    title: "Python Scope",
    intro: "Scope is the part of a program where a variable can be used. A variable created inside a function is local to that function, while a variable created outside any function is global and can be read everywhere in the file.",
    blocks: [
      { type: "para", text: "Two kinds of variable: A global variable is created outside any function, at the top level of a file, and every function in that file can read it. A local variable is created inside a function, and it exists only while that function runs. Once the function finishes, the local variable is gone." },
      {
        type: "code",
        title: "Same name, two variables",
        code: `x = 10

def show():
    x = 5
    print("Inside:", x)

show()
print("Outside:", x)`,
        output: "Inside: 5\nOutside: 10",
      },
      { type: "heading", text: "Why the outside value did not change" },
      { type: "para", text: "Inside show, the line x = 5 creates a brand new local variable that happens to share the name x. It hides the global x for the rest of the function, but it never touches it. When the function ends, the local x disappears and the global x is still 10. Same name, two separate variables. Reading a global variable inside a function is fine and needs no keyword. The problem only starts when you assign to it, because assignment inside a function creates a local variable by default." },
      { type: "heading", text: "Changing a global from inside a function" },
      { type: "para", text: "When a function really must update a global, say so with the global keyword at the top of the function. After that line, assignments to the name refer to the global variable instead of creating a local one. Here a counter grows by one each time add runs, because both calls update the same global count." },
      {
        type: "code",
        title: "Updating a global counter",
        code: `count = 0

def add():
    global count
    count = count + 1
    print(count)

add()
add()`,
        output: "1\n2",
      },
      { type: "heading", text: "The nonlocal keyword" },
      { type: "para", text: "A function inside another function can use nonlocal to update a variable of the outer function. It is the same idea as global, but for the enclosing function instead of the whole file. You need it only when functions are nested, which is less common than the local and global case. Prefer returning a value from a function over changing a global. Globals shared between functions are easy to break by accident, while a returned value is explicit and easy to test." },
      {
        type: "code",
        title: "Updating an outer function's variable",
        code: `def outer():
    total = 0
    def add_points(points):
        nonlocal total
        total = total + points
    add_points(5)
    add_points(10)
    return total

print(outer())`,
        output: "15",
      },
    ],
    practice: [
      "Write a function that reads a global named app_name and prints it, without changing it.",
      "Make a global score that a function adds 10 to, using the global keyword, and print it after two calls.",
      "Rewrite the counter example so the function returns the new count instead of using a global.",
    ],
    summary: [
      "Global variables live outside functions and can be read anywhere in the file.",
      "Local variables live inside one function and vanish when it returns.",
      "Assigning a name inside a function creates a local variable by default.",
      "The global keyword lets a function update a global variable.",
      "nonlocal updates a variable of an enclosing function.",
    ],
  },
  {
    slug: "python-decorators",
    title: "Python Decorators",
    intro: "A decorator is a function that wraps another function to add behaviour to it, without changing the original code. It is how Python adds logging, timing, or checks around a function in one place.",
    blocks: [
      { type: "heading", text: "Wrapping a function" },
      { type: "para", text: "A decorator takes a function as input and returns a new function that usually calls the original one, with something extra done before or after it. The wrapper has the same job as the original, plus the extra step." },
      {
        type: "code",
        title: "A decorator that changes the result",
        code: `def shout(func):
    def wrapper(name):
        return func(name).upper()
    return wrapper

@shout
def greet(name):
    return "Hello, " + name

print(greet("Asha"))`,
        output: "HELLO, ASHA",
      },
      { type: "para", text: "The line @shout above greet is shorthand for greet = shout(greet). Python passes greet into shout, and shout returns wrapper, which is what the name greet now refers to. Calling greet(\"Asha\") runs wrapper, which calls the original function and turns its result into capital letters." },
      { type: "heading", text: "A decorator that works with any function" },
      { type: "para", text: "A wrapper that only accepts one argument can only decorate functions with one argument. Using *args and **kwargs in the wrapper makes the decorator work with any function, whatever its parameters are." },
      {
        type: "code",
        title: "A decorator that counts calls",
        code: `def count_calls(func):
    def wrapper(*args, **kwargs):
        wrapper.calls = wrapper.calls + 1
        print("Call number:", wrapper.calls)
        return func(*args, **kwargs)
    wrapper.calls = 0
    return wrapper

@count_calls
def add(a, b):
    return a + b

print(add(2, 3))
print(add(10, 5))`,
        output: "Call number: 1\n5\nCall number: 2\n15",
      },
      { type: "heading", text: "Decorators with their own arguments" },
      { type: "para", text: "Sometimes a decorator needs a setting, like how many times to repeat something. Then the decorator is a function that takes the setting and returns the real decorator, so you get three layers: the outer function takes the setting, the middle one takes the function, and the inner wrapper runs it. A decorated function loses its original name and docstring, because wrapper replaces it. The standard fix is to put @functools.wraps(func) above the wrapper, which copies the name and docstring back. Read a decorator from the inside out: the wrapper runs first, then it decides when to call the original function. A decorator that never calls the original function replaces it entirely." },
      {
        type: "code",
        title: "Repeating a function three times",
        code: `def repeat(n):
    def decorator(func):
        def wrapper(*args, **kwargs):
            result = None
            for _ in range(n):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def say_hi():
    print("Hi!")

say_hi()`,
        output: "Hi!\nHi!\nHi!",
      },
    ],
    practice: [
      "Write a decorator that prints the name of the function before calling it, and use it on a function that adds two numbers.",
      "Write a decorator that times a function with the time module and prints how many seconds it took.",
      "Write a decorator called only_positive that refuses to run the function when any argument is negative.",
    ],
    summary: [
      "A decorator wraps a function to add behaviour without changing its code.",
      "@name above a function is shorthand for func = name(func).",
      "A wrapper with *args and **kwargs works with any function.",
      "A decorator with arguments needs three layers of functions.",
      "Use functools.wraps to keep the original name and docstring.",
    ],
  },
  {
    slug: "python-lambda",
    title: "Python Lambda",
    intro: "A lambda is a small one-line function without a name. It is handy for short jobs that you only need once, especially as an argument to another function.",
    blocks: [
      { type: "heading", text: "A function in one line" },
      { type: "para", text: "A normal function needs a def line, a name and a return statement. A lambda skips all of that: the keyword lambda, then the parameters, then a colon, then a single expression. The result of that expression is returned automatically. Lambdas are best for tiny jobs, like adding two numbers or doubling a value." },
      {
        type: "code",
        title: "A lambda that adds two numbers",
        code: `add = lambda a, b: a + b
print(add(3, 4))

nums = [1, 2, 3, 4]
print(list(map(lambda x: x * x, nums)))`,
        output: "7\n[1, 4, 9, 16]",
      },
      { type: "heading", text: "Where lambdas shine" },
      { type: "para", text: "Lambdas are most useful as arguments to other functions. The sorted function takes a key argument that says how to compare items, and a lambda is the natural way to supply it. Here students are sorted by their marks, not by their names, because the lambda pulls out the second item of each pair." },
      {
        type: "code",
        title: "Sorting with a lambda key",
        code: `students = [("Asha", 88), ("Ravi", 92), ("Meena", 75)]
print(sorted(students, key=lambda s: s[1]))

words = ["banana", "apple", "cherry"]
print(sorted(words, key=lambda w: len(w)))`,
        output: "[('Meena', 75), ('Asha', 88), ('Ravi', 92)]\n['apple', 'banana', 'cherry']",
      },
      { type: "heading", text: "Lambdas with map and filter" },
      { type: "para", text: "The map function applies a function to every item in a list, and filter keeps only the items that pass a test. Both take a function as their first argument, and a lambda is the shortest way to write that function inline. A lambda can only hold one expression, so it cannot contain statements like if blocks, loops or assignments. If the job needs more than one step, write a normal def function instead." },
      {
        type: "code",
        title: "Doubling numbers and keeping evens",
        code: `nums = [1, 2, 3, 4, 5]

print(list(map(lambda x: x * 2, nums)))
print(list(filter(lambda x: x % 2 == 0, nums)))`,
        output: "[2, 4, 6, 8, 10]\n[2, 4]",
      },
      { type: "tip", text: "Do not assign a lambda to a name when a def would do the same job better. The one real use of a lambda is passing it straight into another function, like sorted, map or filter." },
    ],
    practice: [
      "Write a lambda that returns the square of a number and use it with map on a list.",
      "Sort a list of words by their last letter using a lambda as the key.",
      "Write a lambda that returns the larger of two numbers and test it with three pairs.",
    ],
    summary: [
      "A lambda is a small one-line function: lambda parameters: expression.",
      "It returns the value of its expression automatically.",
      "Lambdas are best passed directly into functions like sorted, map and filter.",
      "A lambda holds only one expression, so bigger jobs need a def function.",
    ],
  },
  {
    slug: "python-recursion",
    title: "Python Recursion",
    intro: "Recursion is when a function calls itself to solve a smaller piece of the same problem. It is the natural way to write factorials, countdowns, and tree-like problems.",
    blocks: [
      { type: "heading", text: "What is recursion?" },
      { type: "para", text: "A recursive function solves a problem by calling itself with a smaller input, again and again, until it reaches a case so simple that the answer is obvious. That simple case is called the base case, and without it the function would call itself forever." },
      { type: "para", text: "Factorial, the classic example: The factorial of 5 is 5 times 4 times 3 times 2 times 1. Notice that the factorial of 5 is just 5 times the factorial of 4, the same problem, one step smaller. That pattern is exactly what recursion expresses." },
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
      { type: "para", text: "A countdown that prints as it goes: Recursion is not only for returning values. A function can also do work, like printing, before calling itself with a smaller number." },
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
      { type: "para", text: "Fibonacci numbers: Each Fibonacci number is the sum of the two before it: 0, 1, 1, 2, 3, 5, 8, and so on. This definition is itself recursive, so the code follows it almost word for word." },
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
      { type: "para", text: "Here the base case is n <= 1, where the function returns n directly. For larger n it makes two recursive calls and adds their results. Fibonacci with plain recursion gets slow for large numbers because it repeats the same work many times, a loop or a stored result is faster for big inputs. Every recursive function needs a base case and a step that moves toward it. Miss the base case and you get a RecursionError when Python hits its limit of about 1000 nested calls. If you can say the problem as the same problem but smaller, recursion fits. If the problem is just repeating a simple step, a loop is usually clearer and faster." },
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
  {
    slug: "python-generators",
    title: "Python Generators",
    intro: "A generator is a special function that produces values one at a time instead of building a whole list. Generators use very little memory, so they can handle huge or even endless sequences that would never fit in a list.",
    blocks: [
      { type: "heading", text: "What is a generator?" },
      { type: "para", text: "A normal function runs once and returns one value. A generator function uses the keyword yield instead of return. Each time it reaches yield, it pauses and hands out one value. The next time you ask for a value, it carries on from exactly where it stopped, remembering all its variables. This pause and resume trick is what makes generators so light on memory." },
      {
        type: "code",
        title: "A generator that counts up",
        code: `def count_up(n):
    i = 1
    while i <= n:
        yield i
        i += 1

for number in count_up(3):
    print(number)`,
        output: "1\n2\n3",
      },
      { type: "para", text: "Calling count_up(3) does not run the function. It returns a generator object, which is like a paused machine. The for loop asks it for values one by one. Each yield gives the next number, and when the loop inside the function ends, the generator is finished." },
      {
        type: "code",
        title: "Asking for values one at a time with next",
        code: `def even_numbers():
    n = 0
    while True:
        yield n
        n += 2

evens = even_numbers()
print(next(evens))
print(next(evens))
print(next(evens))`,
        output: "0\n2\n4",
      },
      { type: "para", text: "This generator never ends, because its while loop is always true. That is safe, because it only makes a value when you ask for one with next. A list of all even numbers would be impossible, but a generator of even numbers is just a few lines." },
      {
        type: "code",
        title: "A generator expression, like a list comprehension",
        code: `squares = (x * x for x in range(5))
print(next(squares))
print(next(squares))
print(list(squares))`,
        output: "0\n1\n[4, 9, 16]",
      },
      {
        type: "list",
        items: [
          "yield pauses a function and hands out one value.",
          "next() asks a generator for its next value.",
          "A for loop can use a generator just like a list.",
          "Generator expressions use round brackets instead of square brackets.",
          "Asking a finished generator for more raises StopIteration.",
        ],
      },
      { type: "note", text: "A generator can only be used once. After you have gone through all of its values, it is empty. If you need the values again, call the generator function again to make a fresh one." },
      { type: "tip", text: "When you only need to loop over values once, prefer a generator over a list. Reading a huge file line by line with a generator uses almost no memory." },
    ],
    practice: [
      "Write a generator that yields the first 10 square numbers.",
      "Write a generator that reads a file and yields one line at a time.",
      "Use a generator expression to find the sum of the squares of the numbers from 1 to 100 without making a list.",
    ],
    summary: [
      "A generator produces values one at a time with yield.",
      "Generators remember where they stopped between values.",
      "They use very little memory, even for endless sequences.",
      "next() asks for one value; a for loop asks for all of them.",
    ],
  },
  {
    slug: "python-challenges-functions-basics",
    title: "Code Challenge",
    intro: "Time to use what you learned about functions. This challenge asks you to build a small marksheet program from three small functions, each doing one clear job.",
    blocks: [
      { type: "heading", text: "The challenge" },
      { type: "para", text: "Write a program for a student named Asha with marks [88, 92, 75]. First, write a function average that takes any number of marks with *args and returns their average. Then write a function grade that takes an average and returns A for 90 or more, B for 80 or more, C for 70 or more, and D below that. Finally, write a function report that takes a name and any number of marks, uses the other two functions, and prints the name, the average, and the grade." },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "average can use sum(marks) / len(marks), where marks is the *args tuple.",
          "grade is a chain of if, elif, and else checks, starting from the highest mark.",
          "report should call average and grade instead of repeating their logic.",
          "The average of 88, 92, and 75 is 85.0, which should give grade B.",
        ],
      },
      { type: "heading", text: "Solution" },
      {
        type: "code",
        title: "Marksheet with three small functions",
        code: `def average(*marks):
    return sum(marks) / len(marks)

def grade(score):
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    else:
        return "D"

def report(name, *marks):
    avg = average(*marks)
    print(name, "average:", avg)
    print(name, "grade:", grade(avg))

report("Asha", 88, 92, 75)`,
        output: "Asha average: 85.0\nAsha grade: B",
      },
      { type: "para", text: "Notice how report never works out the average or the grade itself. It asks average and grade to do those jobs, so each function stays short and each one can be tested on its own. If the grading rules change later, you change one function only." },
      {
        type: "code",
        title: "Trying the report with other students",
        code: `report("Ravi", 92, 95, 88, 90)
report("Meena", 65, 70, 75)`,
        output: "Ravi average: 91.25\nRavi grade: A\nMeena average: 70.0\nMeena grade: C",
      },
      { type: "para", text: "The same three functions work for any student and any marks. Ravi averages 91.25, which is an A, and Meena averages 70.0, which is a C. Nothing in the functions changes, only the values passed in." },
      { type: "tip", text: "When a challenge feels big, split it into functions first and write one function at a time. Test each function alone before you join them together." },
    ],
    practice: [
      "Change the report program so it also prints the highest and lowest mark, using max and min inside a new function.",
      "Add a function pass_or_fail that returns Pass when the average is 40 or more and Fail otherwise, and print it in the report.",
      "Call report for a second student with four marks and check the grade is right.",
    ],
    summary: [
      "A challenge is easier when split into small functions with one job each.",
      "*args lets a function take any number of marks.",
      "One function should call another instead of repeating its logic.",
      "Test each small function alone before joining them together.",
    ],
  },
  {
    slug: "python-range",
    title: "Range",
    intro: "The range function makes a sequence of numbers for loops. It is the standard way to repeat something a fixed number of times, or to walk through numbers with a step.",
    blocks: [
      { type: "heading", text: "What range gives you" },
      { type: "para", text: "The range function does not make a list. It makes a lazy sequence that produces numbers one at a time, which is why it uses almost no memory even for a range of a million. You can turn it into a list to see its numbers, or use it straight in a for loop." },
      {
        type: "code",
        title: "The three forms of range",
        code: `print(list(range(5)))
print(list(range(2, 8)))
print(list(range(0, 10, 2)))
print(list(range(5, 0, -1)))`,
        output: "[0, 1, 2, 3, 4]\n[2, 3, 4, 5, 6, 7]\n[0, 2, 4, 6, 8]\n[5, 4, 3, 2, 1]",
      },
      { type: "para", text: "With one number, range stops before that number, so range(5) gives 0 to 4. With two numbers, the first is the start and the second is the stop, which is never included. With three numbers, the third is the step, and a negative step counts downwards." },
      { type: "heading", text: "Using range in a loop" },
      { type: "para", text: "The most common use of range is a for loop that runs a fixed number of times. The loop variable takes each value in the range in turn, so you can use it as a counter or as an index into a list." },
      {
        type: "code",
        title: "Repeating work with range",
        code: `for i in range(3):
    print("Step", i)

names = ["Asha", "Ravi", "Meera"]
for i in range(len(names)):
    print(i, names[i])`,
        output: "Step 0\nStep 1\nStep 2\n0 Asha\n1 Ravi\n2 Meera",
      },
      { type: "para", text: "Using range(len(names)) gives you both the index and the item, which is useful when you need the position as well as the value. If you only need the values, loop over the list directly; if you need both, the enumerate function is often clearer than range(len(...))." },
      { type: "note", text: "range never includes its stop value. range(1, 5) gives 1, 2, 3, 4, never 5. This off-by-one is the most common range mistake, so check your stop value twice." },
      { type: "tip", text: "Use range with a step to take every second or third item, like range(0, 10, 2) for even numbers. A step of -1 with a high start counts down." },
    ],
    practice: [
      "Print the numbers from 1 to 10 using range, then print them again in reverse using a negative step.",
      "Use range to print the squares of the numbers from 1 to 5.",
      "Use range(len(...)) to print each item of a list of four fruits with its index number.",
    ],
    summary: [
      "range makes a lazy sequence of numbers; it is not a list.",
      "range(stop) starts at 0; range(start, stop) sets both ends; range(start, stop, step) sets the step.",
      "The stop value is never included in the sequence.",
      "Use range in a for loop to repeat work a fixed number of times.",
    ],
  },
  {
    slug: "python-challenges-range",
    title: "Code Challenge",
    intro: "Time to practise range. This challenge asks you to add up the even numbers from 2 to 20 and to print a multiplication table, both with range and a step.",
    blocks: [
      { type: "heading", text: "The challenge" },
      { type: "para", text: "First, use range with a step of 2 to add up all the even numbers from 2 to 20, and print the total. Second, use range to print the multiplication table of 7, from 7 x 1 up to 7 x 5. Both parts need only a loop and range, nothing else." },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "range(2, 21, 2) gives the even numbers 2, 4, 6, all the way to 20.",
          "Start the total at 0 and add each number to it inside the loop.",
          "For the table, loop over range(1, 6) and print 7 times the loop number.",
          "An f-string like f\"7 x {n} = {7 * n}\" prints one row of the table.",
        ],
      },
      { type: "heading", text: "Solution" },
      {
        type: "code",
        title: "Even total and the table of 7",
        code: `total = 0
for n in range(2, 21, 2):
    total = total + n
print(total)

for n in range(1, 6):
    print("7 x", n, "=", 7 * n)`,
        output: "110\n7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35",
      },
      { type: "para", text: "The total is 110, which you can check by hand: 2 + 4 + 6 + 8 + 10 + 12 + 14 + 16 + 18 + 20. The step of 2 in range is what makes the loop visit only the even numbers, so no if check is needed inside the loop." },
      {
        type: "code",
        title: "Odd total and the table of 9",
        code: `total = 0
for n in range(1, 20, 2):
    total = total + n
print(total)

for n in range(1, 6):
    print("9 x", n, "=", 9 * n)`,
        output: "100\n9 x 1 = 9\n9 x 2 = 18\n9 x 3 = 27\n9 x 4 = 36\n9 x 5 = 45",
      },
      { type: "para", text: "The odd numbers from 1 to 19 add up to 100, and the same loop shape prints the table of 9. Only the start, the step, and the number in the print changed." },
      { type: "tip", text: "When a loop needs a pattern like every second number, put the pattern in range with a step instead of testing every number inside the loop. It is shorter and faster." },
    ],
    practice: [
      "Use range to add up the odd numbers from 1 to 19 and print the total.",
      "Print the multiplication table of 9 from 9 x 1 to 9 x 10.",
      "Use range with a step of 5 to print 0, 5, 10, 15, 20, and 25.",
    ],
    summary: [
      "range with a step visits only the numbers in the pattern you want.",
      "Adding inside a loop builds a total one step at a time.",
      "range(1, 6) gives 1 to 5, because the stop value is never included.",
      "Put the pattern in range instead of testing inside the loop.",
    ],
  },
  {
    slug: "python-arrays",
    title: "Arrays",
    intro: "An array is a list-like container where every item must be the same type. Python lists allow mixed types, but the array module gives you a compact array of numbers when you need one.",
    blocks: [
      { type: "heading", text: "Lists or arrays?" },
      { type: "para", text: "A Python list can hold numbers, strings, and other values mixed together. An array cannot: every item in an array has the same type, fixed by a typecode letter when you create it. The typecode i means signed integers, f means floating point numbers, and d means double precision floats." },
      { type: "para", text: "Arrays store numbers more compactly than lists, because each item takes only the space its type needs. For everyday programs a list is the right choice. Arrays matter when you work with large amounts of numbers, or when you exchange data with code written in C." },
      {
        type: "code",
        title: "Creating and using an array",
        code: `from array import array

nums = array("i", [10, 20, 30])
nums.append(40)
print(nums)
print(nums[0], nums[-1], len(nums))
print(nums.typecode)`,
        output: "array('i', [10, 20, 30, 40])\n10 40 4\ni",
      },
      { type: "para", text: "Arrays support indexing, negative indexes, len, and append, just like lists. The typecode is stored on the array itself, and you can read it with the typecode attribute." },
      { type: "heading", text: "Changing and reading arrays" },
      { type: "para", text: "You can change an item by its index, insert and remove items, and convert an array to a list with list(). Trying to put a value of the wrong type into an array, like a string into an integer array, raises a TypeError." },
      {
        type: "code",
        title: "Changing items and converting to a list",
        code: `from array import array

scores = array("i", [88, 92, 75])
scores[1] = 95
print(scores)
print(list(scores))
print(sum(scores))`,
        output: "array('i', [88, 95, 75])\n[88, 95, 75]\n258",
      },
      { type: "note", text: "The array module is not the same as the numpy array used in data science. Numpy arrays are far more powerful, but they need numpy installed. The array module is built in and needs no install." },
      { type: "tip", text: "Reach for a list first. Use the array module only when you know you need many numbers of one type stored compactly, or when another library asks for an array." },
    ],
    practice: [
      "Create an integer array of the numbers 5, 10, 15, and 20, then append 25 and print it.",
      "Create a float array with typecode f holding 1.5, 2.5, and 3.5, then print its first and last items.",
      "Convert your integer array to a list and print the sum and the average of its items.",
    ],
    summary: [
      "An array holds items of one type only, fixed by a typecode like i or f.",
      "Arrays support indexing, len, append, and item assignment like lists.",
      "Arrays store numbers more compactly than lists.",
      "For everyday programs, a list is usually the right choice.",
    ],
  },
  {
    slug: "python-challenges-arrays",
    title: "Code Challenge",
    intro: "Time to practise arrays. This challenge asks you to work out the highest, lowest, and average score in an array, and then to reverse the array.",
    blocks: [
      { type: "heading", text: "The challenge" },
      { type: "para", text: "Create an integer array with the scores [88, 92, 75, 92, 90]. Print the highest score, the lowest score, and the average. Then reverse the array in place with its reverse method and print the result as a list." },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "The built-in max and min work on arrays just as they work on lists.",
          "The average is sum(scores) / len(scores).",
          "The reverse method changes the array itself and returns None, so do not assign its result.",
          "Wrap the array in list() to print it as a plain list.",
        ],
      },
      { type: "heading", text: "Solution" },
      {
        type: "code",
        title: "Scores in an array",
        code: `from array import array

scores = array("i", [88, 92, 75, 92, 90])
print(max(scores))
print(min(scores))
print(sum(scores) / len(scores))
scores.reverse()
print(list(scores))`,
        output: "92\n75\n87.4\n[90, 92, 75, 92, 88]",
      },
      { type: "para", text: "The average is 87.4, because the five scores add up to 437 and 437 divided by 5 is 87.4. The reversed list starts with 90, which was the last item, and ends with 88, which was the first." },
      {
        type: "code",
        title: "Temperatures in an array",
        code: `from array import array

temps = array("i", [21, 25, 19, 28, 23])
print(max(temps) - min(temps))
print(sum(temps) / len(temps))
temps.reverse()
print(list(temps))`,
        output: "9\n23.2\n[23, 28, 19, 25, 21]",
      },
      { type: "para", text: "The same max, min, and sum calls work on a second array. The temperatures range over 9 degrees, their average is 23.2, and reversing the array puts 23 first and 21 last." },
      { type: "tip", text: "Built-in functions like max, min, sum, and len work on arrays, because an array behaves like a sequence. You only need array-specific methods for things lists do differently." },
    ],
    practice: [
      "Create an array of five temperatures and print the difference between the highest and the lowest.",
      "Add two more scores to the array, then print the new average.",
      "Sort the scores by converting the array to a list, sorting it, and printing the result.",
    ],
    summary: [
      "max, min, sum, and len work on arrays just like on lists.",
      "The average of numbers is their sum divided by how many there are.",
      "The reverse method changes the array in place and returns None.",
      "Convert an array to a list with list() when you want list behaviour.",
    ],
  },
  {
    slug: "python-iterators",
    title: "Iterators",
    intro: "An iterator is an object that hands out values one at a time. Lists, strings, and ranges are all iterable, which means you can get an iterator from them and pull their values one by one.",
    blocks: [
      { type: "heading", text: "Getting values one at a time" },
      { type: "para", text: "The iter function takes an iterable, like a list, and returns an iterator for it. The next function then asks the iterator for its next value. Each call to next moves one step forward, and when the values run out, next raises a StopIteration error." },
      {
        type: "code",
        title: "iter and next on a list",
        code: `names = ["Asha", "Ravi", "Meera"]
it = iter(names)
print(next(it))
print(next(it))
print(list(it))`,
        output: "Asha\nRavi\n['Meera']",
      },
      { type: "para", text: "The first two next calls took Asha and Ravi out of the iterator. The list call then took whatever was left, which was only Meera. The iterator remembers its position, so nothing is ever given twice." },
      { type: "heading", text: "How a for loop uses iterators" },
      { type: "para", text: "A for loop does exactly this work for you: it calls iter on the thing you loop over, then calls next again and again until StopIteration tells it to stop. That is why a for loop works the same way on lists, strings, dictionaries, files, and generators." },
      {
        type: "code",
        title: "A loop is just iter and next",
        code: `for letter in "abc":
    print(letter)

it = iter("abc")
print(next(it))
print(next(it))
print(next(it))`,
        output: "a\nb\nc\na\nb\nc",
      },
      { type: "heading", text: "Writing your own iterator" },
      { type: "para", text: "A class can be its own iterator if it defines two methods. The __iter__ method returns the iterator itself, and the __next__ method returns the next value, or raises StopIteration when the values are done. Here is a countdown iterator that counts down from its starting number. An iterator is used up as you go. Once you have taken every value, it is empty. Call iter again on the original list to get a fresh iterator. You rarely need to write your own iterator class. A generator function with yield does the same job in far fewer lines, so prefer a generator when you can." },
      {
        type: "code",
        title: "A countdown iterator class",
        code: `class Countdown:
    def __init__(self, start):
        self.current = start
    def __iter__(self):
        return self
    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        value = self.current
        self.current -= 1
        return value

print(list(Countdown(3)))`,
        output: "[3, 2, 1]",
      },
    ],
    practice: [
      "Get an iterator from the string Python and print its first two letters with next.",
      "Use iter and next in a while loop to print every item of a list, stopping when StopIteration is raised.",
      "Write an iterator class that counts up from 1 to 5, then use it in a for loop.",
    ],
    summary: [
      "iter turns an iterable into an iterator; next pulls one value at a time.",
      "When the values run out, next raises StopIteration.",
      "A for loop is iter and next done for you, stopping at StopIteration.",
      "A custom iterator needs __iter__ and __next__ methods.",
      "Generators are usually a shorter way to make an iterator.",
    ],
  },
  {
    slug: "python-challenges-iterators",
    title: "Code Challenge",
    intro: "Time to practise iterators. This challenge asks you to build an iterator class that yields the square numbers 1, 4, 9, 16, and 25, one at a time.",
    blocks: [
      { type: "heading", text: "The challenge" },
      { type: "para", text: "Write a class called Squares that is its own iterator. It takes a number n when you create it, and then yields the squares of 1 up to n, one at a time. Use it to print the squares up to 5 as a list. The class must define __iter__ and __next__, and it must raise StopIteration when the squares are done." },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "Store the target n and a counter i that starts at 1.",
          "__iter__ should simply return self.",
          "In __next__, raise StopIteration when i is greater than n.",
          "The value to return is i * i, and then i grows by one.",
        ],
      },
      { type: "heading", text: "Solution" },
      {
        type: "code",
        title: "An iterator of square numbers",
        code: `class Squares:
    def __init__(self, n):
        self.n = n
        self.i = 1
    def __iter__(self):
        return self
    def __next__(self):
        if self.i > self.n:
            raise StopIteration
        value = self.i * self.i
        self.i += 1
        return value

print(list(Squares(5)))`,
        output: "[1, 4, 9, 16, 25]",
      },
      { type: "para", text: "The list call drives the iterator for you: it calls next again and again until StopIteration, collecting each square into a list. The squares are 1, 4, 9, 16, and 25, which are 1 squared, 2 squared, and so on up to 5 squared." },
      {
        type: "code",
        title: "Taking values one at a time with next",
        code: `squares = Squares(5)
print(next(squares))
print(next(squares))
print(list(squares))`,
        output: "1\n4\n[9, 16, 25]",
      },
      { type: "para", text: "The first two next calls take 1 and 4 out of the iterator, and the list call collects what is left: 9, 16, and 25. The iterator remembers its place, so no square is ever given twice." },
      { type: "tip", text: "When you test an iterator, use list() to drive it and see all its values at once. Then try next() by hand to watch it hand out one value at a time." },
    ],
    practice: [
      "Change the Squares iterator to yield cubes instead of squares, and print the cubes up to 4.",
      "Write an iterator that yields the even numbers from 2 up to 10.",
      "Use next by hand to take the first two values from Squares(5), then print the rest with list.",
    ],
    summary: [
      "An iterator class needs __iter__ returning self and __next__ returning values.",
      "__next__ raises StopIteration when the values are done.",
      "list() drives an iterator to the end and collects its values.",
      "The same class can be reused with a different n for a different run.",
    ],
  },
  {
    slug: "python-modules",
    title: "Modules",
    intro: "A module is a single file of Python code that holds useful functions and values. Instead of writing those functions yourself, you import the module and use what it offers.",
    blocks: [
      { type: "heading", text: "What is a module?" },
      { type: "para", text: "Python ships with many built-in modules, such as math for numbers and random for random values. The import statement loads a module into your program. After that, you use its tools with a dot, like math.pi for the value of pi. You can also import just one tool from a module, which keeps your code shorter." },
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
      { type: "heading", text: "How import works" },
      { type: "para", text: "When you import a module, Python finds the file, runs it once, and stores the result. Importing the same module again later does not run the file again, it reuses the stored copy. That is why a module file should only define functions and values, and not run a whole program when it is imported." },
      { type: "heading", text: "Nicknames and importing everything" },
      { type: "para", text: "You can give a module a shorter name with as, which is common for long module names. You can also import every name from a module with a star, but that is best avoided: it is hard to tell where each name came from, and names can clash. Import at the top of the file, one module per line, so a reader can see what the program depends on before reading any of its logic." },
      {
        type: "code",
        title: "An alias for a module",
        code: `import math as m
print(m.sqrt(81))
print(m.pi)

from math import floor, ceil
print(floor(4.9))
print(ceil(4.1))`,
        output: "9.0\n3.141592653589793\n4\n5",
      },
      { type: "note", text: "A module you write yourself is just a .py file in the same folder as your program. If the file is called mytools.py, you import it with import mytools and call its functions as mytools.add(2, 3)." },
    ],
    practice: [
      "Import the random module and print a random integer between 1 and 10 with random.randint.",
      "Import the math module as m and print m.sqrt(144) and m.factorial(4).",
      "Use from math import pi to print the area of a circle with radius 3.",
    ],
    summary: [
      "A module is a file of reusable Python code, such as math or random.",
      "Use import to load a module, then call its tools with a dot.",
      "from math import sqrt imports one tool by name.",
      "as gives a module a shorter nickname; star imports are best avoided.",
    ],
  },
  {
    slug: "python-challenges-modules",
    title: "Code Challenge",
    intro: "Time to practise modules by writing your own. This challenge asks you to put two helper functions in a module file and use them from a main program.",
    blocks: [
      { type: "heading", text: "The challenge" },
      { type: "para", text: "Create a file called mytools.py with two functions: add(a, b) that returns the sum, and multiply(a, b) that returns the product. Then create a second file called main.py in the same folder that imports mytools and prints add(3, 4) and multiply(3, 4). Run main.py and check the output." },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "Both files must be in the same folder, or Python will not find the module.",
          "In main.py, write import mytools at the top.",
          "Call the functions with a dot: mytools.add(3, 4).",
          "Run the program with python main.py from your terminal, not by running mytools.py.",
        ],
      },
      { type: "heading", text: "Solution" },
      {
        type: "code",
        title: "mytools.py - your own module",
        code: `def add(a, b):
    return a + b

def multiply(a, b):
    return a * b`,
        output: "(no output: mytools.py only defines functions, so running it prints nothing)",
      },
      {
        type: "code",
        title: "main.py - using your module",
        code: `import mytools

print(mytools.add(3, 4))
print(mytools.multiply(3, 4))`,
        output: "7\n12",
      },
      { type: "para", text: "Running main.py prints 7 and 12. The module file itself prints nothing when it is imported, because it only defines functions. If mytools.py also had print calls at the top level, they would run on import too, which is why module files should only define things." },
      { type: "tip", text: "Give your module a clear name that says what it holds, like mytools or geometry. Avoid naming it the same as a built-in module, like math.py, because your file would hide the real one." },
    ],
    practice: [
      "Add a function subtract(a, b) to mytools.py and call it from main.py.",
      "Add a variable called VERSION = 1.0 to mytools.py and print it from main.py.",
      "Create a second module called greetings.py with a function hello(name), and import it in main.py.",
    ],
    summary: [
      "Your own module is just a .py file with functions and values in it.",
      "Import it by its file name without the .py ending.",
      "Call its functions with a dot: mytools.add(3, 4).",
      "Module files should only define things, not run code on import.",
    ],
  },
  {
    slug: "python-datetime",
    title: "Dates",
    intro: "The datetime module works with dates and times. It can tell you today, build a date from numbers, add days to a date, and format a date as readable text.",
    blocks: [
      { type: "heading", text: "Dates and times" },
      { type: "para", text: "The datetime module has three main classes: date for a calendar day, time for a time of day, and datetime for both together. The examples in this lesson use one fixed date, 16 November 2026, so the outputs are exact. With the real clock you would use date.today() or datetime.now(), and the answers would change with the day." },
      {
        type: "code",
        title: "Building a date and reading its parts",
        code: `import datetime

today = datetime.date(2026, 11, 16)
print(today)
print(today.year, today.month, today.day)
print(today.strftime("%A, %d %B %Y"))`,
        output: "2026-11-16\n2026 11 16\nMonday, 16 November 2026",
      },
      { type: "para", text: "A date prints in year-month-day order. Its year, month, and day are plain attributes you can read directly. The strftime method turns a date into text with a format string, where %A is the full weekday name, %d is the day, %B is the full month name, and %Y is the four-digit year." },
      { type: "heading", text: "Adding days with timedelta" },
      { type: "para", text: "A timedelta is a length of time, like 7 days or 3 hours. Adding a timedelta to a date gives a new date that many days later. Subtracting two dates gives a timedelta, and its days attribute tells you how many days lie between them." },
      {
        type: "code",
        title: "A week later and days until Christmas",
        code: `import datetime

today = datetime.date(2026, 11, 16)
print(today + datetime.timedelta(days=7))
christmas = datetime.date(2026, 12, 25)
print((christmas - today).days)`,
        output: "2026-11-23\n39",
      },
      { type: "heading", text: "Times and datetimes" },
      { type: "para", text: "A datetime holds a date and a time together. You build one with the year, month, day, hour, minute, and second, and you can read each part back as an attribute. Its strftime method formats the time part too, with %H for the hour and %M for the minute. Dates from the real clock, like date.today(), change every day, so their outputs cannot be fixed in a lesson. That is why this lesson uses a fixed date. In your own programs, date.today() and datetime.now() are the right calls. Keep dates as date objects for as long as possible, and format them into text only at the end. Maths on dates, like adding days, works on objects, not on strings." },
      {
        type: "code",
        title: "A datetime and its time part",
        code: `import datetime

now = datetime.datetime(2026, 11, 16, 10, 30, 0)
print(now)
print(now.strftime("%H:%M"))
print(now.date())
print(now.time())`,
        output: "2026-11-16 10:30:00\n10:30\n2026-11-16\n10:30:00",
      },
    ],
    practice: [
      "Create a date for your birthday in 2026 and print it in the format Day, DD Month YYYY.",
      "Use a timedelta to find the date 30 days after 2026-11-16 and print it.",
      "Find how many days there are between 2026-11-16 and 2027-01-01.",
    ],
    summary: [
      "The datetime module works with date, time, and datetime objects.",
      "A date prints as year-month-day and has year, month, and day attributes.",
      "strftime formats a date into readable text with codes like %A and %B.",
      "A timedelta adds or subtracts days; subtracting dates gives a timedelta.",
    ],
  },
  {
    slug: "python-challenges-datetime",
    title: "Code Challenge",
    intro: "Time to practise dates. This challenge asks you to work out a person's age on a fixed day and count the days left until the new year.",
    blocks: [
      { type: "heading", text: "The challenge" },
      { type: "para", text: "Asha was born on 20 May 2008. Using the fixed today of 16 November 2026, work out her age in whole years and print it. Then work out how many days there are from 16 November 2026 until 1 January 2027, and print that number too." },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "Build both dates with datetime.date(year, month, day).",
          "A simple year difference is not enough: subtract one if this year's birthday has not happened yet.",
          "Compare (month, day) pairs: (11, 16) is after (5, 20), so the birthday has happened.",
          "Subtracting two dates gives a timedelta; read its days attribute.",
        ],
      },
      { type: "heading", text: "Solution" },
      {
        type: "code",
        title: "Age and days to the new year",
        code: `import datetime

birth = datetime.date(2008, 5, 20)
today = datetime.date(2026, 11, 16)
age = today.year - birth.year
if (today.month, today.day) < (birth.month, birth.day):
    age = age - 1
print(age)

new_year = datetime.date(2027, 1, 1)
print((new_year - today).days)`,
        output: "18\n46",
      },
      { type: "para", text: "Asha is 18, because 2026 minus 2008 is 18 and her birthday on 20 May had already passed by 16 November. There are 46 days from 16 November to 1 January: 14 days left in November plus 31 days in December, plus 1 January itself counted as the target day." },
      {
        type: "code",
        title: "A hundred days later",
        code: `import datetime

today = datetime.date(2026, 11, 16)
later = today + datetime.timedelta(days=100)
print(later)
print(later.strftime("%A"))`,
        output: "2027-02-24\nWednesday",
      },
      { type: "para", text: "Adding 100 days to 16 November 2026 lands on 24 February 2027, which is a Wednesday. The same timedelta trick works for any number of days, forward or back." },
      { type: "tip", text: "Comparing (month, day) pairs is a neat trick for birthdays. A tuple comparison checks the month first, and only looks at the day when the months are equal." },
    ],
    practice: [
      "Work out your own age on 16 November 2026 using your real birthday.",
      "Find the date 100 days after 2026-11-16 and print it as a full weekday name and date.",
      "Find how many days there are between 2026-11-16 and your next birthday.",
    ],
    summary: [
      "Age in years is the year difference, minus one if this year's birthday has not come yet.",
      "Comparing (month, day) pairs tells you whether a birthday has passed.",
      "Subtracting dates gives a timedelta whose days attribute is the gap.",
      "Use fixed dates in tests so the answers never change.",
    ],
  },
  {
    slug: "python-math",
    title: "Math",
    intro: "The math module adds the maths that plain Python does not have built in: square roots, rounding, powers, factorials, and constants like pi. It works on numbers, not on lists or strings.",
    blocks: [
      { type: "heading", text: "Roots, powers, and factorials" },
      { type: "para", text: "The most used math functions take one number and return one number. The sqrt function gives the square root, pow raises a number to a power, and factorial multiplies a number down to 1. These are the tools for geometry and counting problems." },
      {
        type: "code",
        title: "Square roots, powers, and factorials",
        code: `import math

print(math.sqrt(16))
print(math.pow(2, 3))
print(math.factorial(5))
print(math.gcd(12, 18))`,
        output: "4.0\n8.0\n120\n6",
      },
      { type: "para", text: "Notice that sqrt and pow return floats, even when the answer is a whole number. The gcd function finds the greatest common divisor of two numbers, which is 6 for 12 and 18." },
      { type: "heading", text: "Rounding numbers" },
      { type: "para", text: "The floor function rounds down to the nearest whole number, and ceil rounds up. The built-in round function rounds to the nearest whole number, or to a number of decimal places you choose." },
      {
        type: "code",
        title: "Floor, ceiling, and round",
        code: `import math

print(math.floor(3.7), math.ceil(3.2))
print(round(3.567, 2))
print(round(3.567))
print(math.pi)`,
        output: "3 4\n3.57\n4\n3.141592653589793",
      },
      { type: "heading", text: "Constants and trigonometry" },
      { type: "para", text: "The math module holds useful constants: pi is 3.14159, e is 2.71828, and inf is infinity. It also has trigonometry functions like sin, cos, and tan, which take angles in radians, not degrees. The radians function converts degrees to radians for you. The built-in functions abs, min, max, and sum cover the simplest maths and need no import. Reach for the math module when you need roots, powers, factorials, or trigonometry. Watch the return types: math.sqrt and math.pow give floats. If you need a whole number, wrap the result in int, or use the ** operator, which keeps integers as integers." },
      {
        type: "code",
        title: "Constants and a sine value",
        code: `import math

print(math.e)
print(math.radians(90))
print(round(math.sin(math.radians(90)), 2))`,
        output: "2.718281828459045\n1.5707963267948966\n1.0",
      },
    ],
    practice: [
      "Use math.sqrt to find the square root of 144, then use math.pow to find 3 to the power of 4.",
      "Find the factorial of 7 and the greatest common divisor of 24 and 36.",
      "Use math.pi to find the circumference of a circle with radius 10, rounded to two decimal places.",
    ],
    summary: [
      "The math module adds sqrt, pow, factorial, gcd, floor, and ceil.",
      "sqrt and pow return floats, even for whole-number answers.",
      "floor rounds down, ceil rounds up, and round rounds to the nearest.",
      "math.pi, math.e, and the trigonometry functions cover geometry work.",
    ],
  },
  {
    slug: "python-challenges-math",
    title: "Code Challenge",
    intro: "Time to practise the math module. This challenge asks you to find the area of a circle and the distance between two points, both with math functions.",
    blocks: [
      { type: "heading", text: "The challenge" },
      { type: "para", text: "First, find the area of a circle with radius 5, using math.pi, and print it rounded to two decimal places. Second, find the straight-line distance between the points (0, 0) and (3, 4), using math.sqrt, and print it. Both answers come from one formula each." },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "The area of a circle is pi times radius squared.",
          "The distance between two points is the square root of (x2 - x1) squared plus (y2 - y1) squared.",
          "round(answer, 2) keeps two decimal places.",
          "The distance from (0, 0) to (3, 4) is a classic 3-4-5 triangle, so the answer is 5.",
        ],
      },
      { type: "heading", text: "Solution" },
      {
        type: "code",
        title: "Circle area and point distance",
        code: `import math

radius = 5
area = math.pi * radius * radius
print(round(area, 2))

x1, y1 = 0, 0
x2, y2 = 3, 4
distance = math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
print(distance)`,
        output: "78.54\n5.0",
      },
      { type: "para", text: "The area is 78.54, because pi times 25 is about 78.5398, which rounds to 78.54. The distance is 5.0, because 3 squared plus 4 squared is 25, and the square root of 25 is 5." },
      {
        type: "code",
        title: "A bigger circle and a second distance",
        code: `import math

print(round(math.pi * 10 * 10, 2))
print(math.sqrt((4 - 1) ** 2 + (6 - 2) ** 2))`,
        output: "314.16\n5.0",
      },
      { type: "para", text: "A circle with radius 10 has an area of 314.16, and the distance from (1, 2) to (4, 6) is 5.0, another 3-4-5 triangle. The same two formulas give both answers." },
      { type: "tip", text: "When a formula has squares and a square root, write it in the same shape as the maths: (x2 - x1) ** 2 + (y2 - y1) ** 2 inside math.sqrt. The code then reads like the formula." },
    ],
    practice: [
      "Find the area of a circle with radius 10, rounded to two decimal places.",
      "Find the distance between the points (1, 2) and (4, 6).",
      "Use math.factorial to find how many ways 6 books can be arranged on a shelf.",
    ],
    summary: [
      "The area of a circle is pi times radius squared.",
      "The distance between two points uses squares and a square root.",
      "round(answer, 2) keeps two decimal places.",
      "Writing code in the shape of the formula makes it easy to check.",
    ],
  },
  {
    slug: "python-json",
    title: "JSON",
    intro: "JSON is the standard text format for sharing data between programs. Python's json module turns dictionaries and lists into JSON text, and turns JSON text back into dictionaries and lists.",
    blocks: [
      { type: "heading", text: "What JSON looks like" },
      { type: "para", text: "JSON text looks like a Python dictionary, but with double quotes around every key and string, and with true, false, and null instead of True, False, and None. Web services, config files, and saved data all use this format, because almost every language can read it." },
      {
        type: "code",
        title: "Turning a dictionary into JSON text",
        code: `import json

data = {"name": "Asha", "age": 20, "marks": [88, 92, 75]}
text = json.dumps(data)
print(text)
print(type(text))`,
        output: "{\"name\": \"Asha\", \"age\": 20, \"marks\": [88, 92, 75]}\n<class 'str'>",
      },
      { type: "para", text: "The dumps function, with an s for string, turns a Python value into a JSON string. The result is a plain string, so you can print it, send it over the internet, or write it to a file." },
      { type: "heading", text: "Reading JSON back" },
      { type: "para", text: "The loads function, with an s for string, turns JSON text back into Python values. Dictionaries become dicts, lists become lists, JSON true becomes Python True, and JSON null becomes Python None." },
      {
        type: "code",
        title: "Turning JSON text back into Python",
        code: `import json

text = '{"name": "Asha", "age": 20, "marks": [88, 92, 75]}'
back = json.loads(text)
print(back["name"], back["marks"][1])
print(type(back))`,
        output: "Asha 92\n<class 'dict'>",
      },
      { type: "heading", text: "Pretty printing with indent" },
      { type: "para", text: "By default dumps puts everything on one line. The indent argument spreads the JSON over many lines with spaces, which is much easier to read when you are checking data by eye. The json module also has dump and load without the s, which write to and read from a file directly. Use dump to save data to a file, and load to read it back. JSON keys must be strings, and values must be numbers, strings, booleans, None, lists, or dictionaries. A set or a date cannot be dumped, so convert those first." },
      {
        type: "code",
        title: "Readable JSON with indent",
        code: `import json

data = {"name": "Asha", "age": 20, "marks": [88, 92, 75]}
print(json.dumps(data, indent=2))`,
        output: "{\n  \"name\": \"Asha\",\n  \"age\": 20,\n  \"marks\": [\n    88,\n    92,\n    75\n  ]\n}",
      },
    ],
    practice: [
      "Turn the dictionary {\"city\": \"Mumbai\", \"temp\": 32} into JSON text and print it.",
      "Parse the JSON string '{\"score\": 90, \"passed\": true}' and print the value of score.",
      "Dump a dictionary with indent=2 and check that each key sits on its own line.",
    ],
    summary: [
      "JSON is a text format for data, readable by almost every language.",
      "json.dumps turns Python values into a JSON string.",
      "json.loads turns a JSON string back into Python values.",
      "indent=2 makes the JSON easy to read.",
      "dump and load work with files instead of strings.",
    ],
  },
  {
    slug: "python-challenges-json",
    title: "Code Challenge",
    intro: "Time to practise JSON. This challenge asks you to read a JSON list of students, work out their average mark, and find the top scorer.",
    blocks: [
      { type: "heading", text: "The challenge" },
      { type: "para", text: "You are given a JSON string with three students, each having a name and a marks value: Asha with 88, Ravi with 92, and Meena with 75. Parse the JSON into a Python list, print the average mark, and print the name of the student with the highest mark." },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "Use json.loads to turn the JSON string into a list of dictionaries.",
          "The average is the sum of the marks divided by the number of students.",
          "max with a key function finds the top student: max(students, key=lambda s: s[\"marks\"]).",
          "The average of 88, 92, and 75 is 85.0, and the top scorer is Ravi.",
        ],
      },
      { type: "heading", text: "Solution" },
      {
        type: "code",
        title: "Average mark and top scorer from JSON",
        code: `import json

text = '[{"name": "Asha", "marks": 88}, {"name": "Ravi", "marks": 92}, {"name": "Meena", "marks": 75}]'
students = json.loads(text)
total = sum(s["marks"] for s in students)
print(total / len(students))
top = max(students, key=lambda s: s["marks"])
print(top["name"])`,
        output: "85.0\nRavi",
      },
      { type: "para", text: "The three marks add up to 255, and 255 divided by 3 is 85.0. The max call compares each student's marks value and returns the whole dictionary for Ravi, from which we read the name." },
      {
        type: "code",
        title: "Adding a fourth student",
        code: `import json

text = '[{"name": "Asha", "marks": 88}, {"name": "Ravi", "marks": 92}, {"name": "Meena", "marks": 75}, {"name": "Arjun", "marks": 95}]'
students = json.loads(text)
print(sum(s["marks"] for s in students) / len(students))
top = max(students, key=lambda s: s["marks"])
print(top["name"])`,
        output: "87.5\nArjun",
      },
      { type: "para", text: "With Arjun's 95 added, the four marks average 87.5 and the top scorer is Arjun. The code did not change at all, only the JSON text it parses." },
      { type: "tip", text: "When JSON data arrives as text, parse it once with json.loads and then work with plain Python values. Do not search the raw text with string methods, that is fragile and slow." },
    ],
    practice: [
      "Add a fourth student to the JSON string and print the new average.",
      "Print the names of all students who scored 80 or more.",
      "Turn the parsed list back into JSON text with indent=2 and print it.",
    ],
    summary: [
      "json.loads turns a JSON string into Python lists and dictionaries.",
      "Once parsed, the data is plain Python, so sum, max, and loops all work.",
      "max with a key function finds the best item by one of its fields.",
      "Parse JSON once, then work with the Python values.",
    ],
  },
  {
    slug: "python-regex",
    title: "RegEx",
    intro: "A regular expression, often shortened to regex, is a small pattern language for searching and matching text. It can find emails, phone numbers, and dates inside messy text in one line, work that would take many lines of plain string code.",
    blocks: [
      { type: "heading", text: "What is a regular expression?" },
      { type: "para", text: "A regular expression is a pattern that describes what some text looks like. For example, the pattern \\d+ means one or more digits. You write the pattern as a string, and the re module checks your text against it. Patterns can be simple, like a word, or detailed, like the shape of an email address." },
      {
        type: "code",
        title: "Finding all the numbers in a sentence",
        code: `import re

text = "My numbers are 98765 and 43210"
print(re.findall(r"\\d+", text))`,
        output: "['98765', '43210']",
      },
      { type: "para", text: "The function re.findall returns a list of every part of the text that matches the pattern. The pattern \\d+ matches a run of digits, so it finds 98765 and 43210 and skips the words. The r before the string makes it a raw string, so Python passes the backslash to the regex engine unchanged." },
      {
        type: "code",
        title: "Checking whether text matches a pattern",
        code: `import re

pattern = r"^[\\w.]+@[\\w]+\\.[a-z]+$"
print(bool(re.match(pattern, "hello@example.com")))
print(bool(re.match(pattern, "not-an-email")))`,
        output: "True\nFalse",
      },
      { type: "para", text: "This pattern describes an email address: some word characters, then @, then more word characters, then a dot, then lowercase letters. The ^ at the start and the $ at the end force the whole string to match, not just a part of it. The first string is a valid email, so the result is True. The second is not, so the result is False." },
      {
        type: "code",
        title: "Replacing text that matches a pattern",
        code: `import re

text = "Python is fun. Python is easy."
print(re.sub("Python", "Coding", text))`,
        output: "Coding is fun. Coding is easy.",
      },
      {
        type: "list",
        items: [
          "Use \\d to match a digit and \\w to match a word character.",
          "Use + for one or more, * for zero or more, and ? for zero or one.",
          "Use ^ for the start of the text and $ for the end.",
          "Use square brackets like [a-z] to match one character from a set.",
          "re.search finds the first match; re.findall finds every match.",
          "re.sub replaces every match with new text.",
        ],
      },
      { type: "note", text: "Always write regex patterns as raw strings, with r before the quotes. Without the r, Python treats backslashes as escapes first, and your pattern can silently change meaning." },
      { type: "tip", text: "Build a pattern in small steps and test each step with re.findall. A short pattern that works is worth more than a long clever one that almost works." },
    ],
    practice: [
      "Use re.findall to pull all the numbers out of the sentence Order 12 costs 450 and takes 3 days.",
      "Write a pattern that matches a simple phone number of 10 digits.",
      "Use re.sub to replace every number in a sentence with the word NUMBER.",
    ],
    summary: [
      "A regular expression is a pattern that describes what text looks like.",
      "The re module searches, matches, and replaces with patterns.",
      "\\d matches a digit; \\w matches a word character; + means one or more.",
      "Raw strings keep backslashes safe inside patterns.",
    ],
  },
  {
    slug: "python-challenges-regex",
    title: "Code Challenge",
    intro: "Time to practise regular expressions. This challenge asks you to pull phone numbers out of a sentence and to hide every number in a message.",
    blocks: [
      { type: "heading", text: "The challenge" },
      { type: "para", text: "You are given the sentence: Call me at 98765 43210 or 91234 56789. Use re.findall to pull out both phone numbers, where each number is five digits, a space, and five more digits. Then use re.sub to replace every number in the sentence I have 3 cats and 12 books with the word NUMBER." },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "\\d matches one digit, and {5} means exactly five of them.",
          "The phone pattern is \\d{5} \\d{5}, with a space in the middle.",
          "Write patterns as raw strings, like r\"\\d{5} \\d{5}\".",
          "re.sub takes the pattern, the replacement text, and the sentence.",
        ],
      },
      { type: "heading", text: "Solution" },
      {
        type: "code",
        title: "Finding phone numbers and hiding numbers",
        code: `import re

text = "Call me at 98765 43210 or 91234 56789"
print(re.findall(r"\\d{5} \\d{5}", text))
print(re.sub(r"\\d+", "NUMBER", "I have 3 cats and 12 books"))`,
        output: "['98765 43210', '91234 56789']\nI have NUMBER cats and NUMBER books",
      },
      { type: "para", text: "The findall call returns a list with both phone numbers, each kept as one string with its space. The sub call replaces 3 and 12, each a run of digits, with the word NUMBER, and leaves the words untouched." },
      {
        type: "code",
        title: "Numbers in an order and a PIN check",
        code: `import re

print(re.findall(r"\\d+", "Order 12 costs 450 and takes 3 days"))
print(bool(re.match(r"^\\d{6}$", "560001")))
print(bool(re.match(r"^\\d{6}$", "56001")))`,
        output: "['12', '450', '3']\nTrue\nFalse",
      },
      { type: "para", text: "The \\d+ pattern pulls 12, 450, and 3 out of the order sentence, and the ^\\d{6}$ pattern accepts the six-digit PIN 560001 but rejects 56001, which has only five digits." },
      { type: "tip", text: "Test a pattern with re.findall first, because it shows you exactly what matched. Only switch to re.sub or re.match once the pattern finds the right text." },
    ],
    practice: [
      "Use re.findall with the pattern \\d+ to pull all the numbers out of Order 12 costs 450 and takes 3 days.",
      "Write a pattern that matches a 6-digit PIN code and test it on 560001 and on 56001.",
      "Use re.sub to replace every email-like word in a sentence with the word EMAIL.",
    ],
    summary: [
      "\\d{5} matches exactly five digits in a row.",
      "re.findall returns every match as a list.",
      "re.sub replaces every match with new text.",
      "Test a pattern with findall before using it to replace or check.",
    ],
  },
  {
    slug: "python-pip",
    title: "Python PIP",
    intro: "PIP is the tool that installs Python packages written by other people. It downloads a package from the Python Package Index and puts it where your Python can import it.",
    blocks: [
      { type: "heading", text: "What pip does" },
      { type: "para", text: "Python ships with many built-in modules, but programmers around the world have written thousands more, called third-party packages. Pip is the tool that downloads and installs them. Pip comes with Python, and you run it from your terminal, not inside a Python program." },
      {
        type: "code",
        title: "Common pip commands for the terminal",
        code: `pip install requests
pip install pandas
pip list
pip uninstall requests
pip show requests`,
        output: "Collecting requests\n  Using cached requests-2.34.2-py3-none-any.whl.metadata (4.8 kB)\nCollecting charset_normalizer<4,>=2 (from requests)\n  Using cached charset_normalizer-3.5.2-cp312-cp312-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl.metadata (46 kB)\nCollecting idna<4,>=2.5 (from requests)\n  Using cached idna-3.20-py3-none-any.whl.metadata (7.2 kB)\nCollecting urllib3<3,>=1.26 (from requests)\n  Using cached urllib3-2.8.0-py3-none-any.whl.metadata (7.4 kB)\nCollecting certifi>=2023.5.7 (from requests)\n  Using cached certifi-2026.10.23-py3-none-any.whl.metadata (2.5 kB)\nUsing cached requests-2.34.2-py3-none-any.whl (73 kB)\nUsing cached certifi-2026.10.23-py3-none-any.whl (135 kB)\nUsing cached charset_normalizer-3.5.2-cp312-cp312-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl (257 kB)\nUsing cached idna-3.20-py3-none-any.whl (69 kB)\nUsing cached urllib3-2.8.0-py3-none-any.whl (135 kB)\nInstalling collected packages: urllib3, idna, charset_normalizer, certifi, requests\nSuccessfully installed certifi-2026.10.23 charset_normalizer-3.5.2 idna-3.20 requests-2.34.2 urllib3-2.8.0\nCollecting pandas\n  Downloading pandas-3.1.1-cp312-cp312-manylinux_2_24_x86_64.manylinux_2_28_x86_64.whl.metadata (16 kB)\nCollecting numpy>=2.0.2 (from pandas)\n  Downloading numpy-2.5.5-cp312-cp312-manylinux_2_27_x86_64.manylinux_2_28_x86_64.whl.metadata (6.6 kB)\nCollecting python-dateutil>=2.9.0 (from pandas)\n  Using cached python_dateutil-4.0.0-py3-none-any.whl.metadata (7.3 kB)\nCollecting tzdata (from python-dateutil>=2.9.0->pandas)\n  Using cached tzdata-2026.6-py2.py3-none-any.whl.metadata (1.4 kB)\nDownloading pandas-3.1.1-cp312-cp312-manylinux_2_24_x86_64.manylinux_2_28_x86_64.whl (12.0 MB)\nDownloading numpy-2.5.5-cp312-cp312-manylinux_2_27_x86_64.manylinux_2_28_x86_64.whl (15.7 MB)\nUsing cached python_dateutil-4.0.0-py3-none-any.whl (92 kB)\nUsing cached tzdata-2026.6-py2.py3-none-any.whl (348 kB)\nInstalling collected packages: tzdata, numpy, python-dateutil, pandas\nSuccessfully installed numpy-2.5.5 pandas-3.1.1 python-dateutil-4.0.0 tzdata-2026.6\nPackage            Version\n------------------ ----------\ncertifi            2026.10.23\ncharset-normalizer 3.5.2\nidna               3.20\nnumpy              2.5.5\npandas             3.1.1\npip                24.0\npython-dateutil    4.0.0\nrequests           2.34.2\ntzdata             2026.6\nurllib3            2.8.0\nFound existing installation: requests 2.34.2\nUninstalling requests-2.34.2:\n  Would remove:\n    /tmp/pip-demo/lib/python3.12/site-packages/requests-2.34.2.dist-info/*\n    /tmp/pip-demo/lib/python3.12/site-packages/requests/*\nProceed (Y/n)?   Successfully uninstalled requests-2.34.2\nName: requests\nVersion: 2.34.2\nSummary: Python HTTP for Humans.\nHome-page:\nAuthor:\nAuthor-email: Kenneth Reitz <me@kennethreitz.org>\nLicense: Apache-2.0\nLocation: /tmp/pip-demo/lib/python3.12/site-packages\nRequires: certifi, charset_normalizer, idna, urllib3\nRequired-by:",
      },
      { type: "para", text: "The pip install command downloads a package and its dependencies, which are the other packages it needs to work. The pip list command shows every package already installed on your computer, and pip uninstall removes one you no longer need. The pip show command prints details about one installed package, like its version and where it lives. The exact lines you see will differ from machine to machine, because they depend on which packages and versions are already installed on that computer." },
      { type: "heading", text: "Checking pip from Python" },
      { type: "para", text: "You can check the pip version from inside Python with the importlib.metadata module. The exact version number depends on your machine and when you installed Python. On the machine used to write this lesson, the version was 24.0, but yours may be different, and that is fine." },
      {
        type: "code",
        title: "Reading the installed pip version",
        code: `import importlib.metadata

print(importlib.metadata.version("pip"))`,
        output: "24.0",
      },
      { type: "heading", text: "Installing into the right place" },
      { type: "para", text: "Pip installs into the Python environment that is active at the time. If you install a package and Python still cannot import it, you probably installed it into a different Python than the one you are running. The safest command is python -m pip install, which uses pip from the same Python you run, so the package always lands in the right place. pip install commands run in the terminal, not in a Python file. If you type pip install inside your code, Python will report a syntax error. Install packages inside a virtual environment, so each project keeps its own packages and versions. A requirements file made with pip freeze records the exact versions for other people to rebuild." },
      {
        type: "code",
        title: "Installing with the same Python you run",
        code: `python -m pip install requests
python -m pip list`,
        output: "Collecting requests\n  Using cached requests-2.34.2-py3-none-any.whl.metadata (4.8 kB)\nRequirement already satisfied: charset_normalizer<4,>=2 in ./lib/python3.12/site-packages (from requests) (3.5.2)\nRequirement already satisfied: idna<4,>=2.5 in ./lib/python3.12/site-packages (from requests) (3.20)\nRequirement already satisfied: urllib3<3,>=1.26 in ./lib/python3.12/site-packages (from requests) (2.8.0)\nRequirement already satisfied: certifi>=2023.5.7 in ./lib/python3.12/site-packages (from requests) (2026.10.23)\nUsing cached requests-2.34.2-py3-none-any.whl (73 kB)\nInstalling collected packages: requests\nSuccessfully installed requests-2.34.2\nPackage            Version\n------------------ ----------\ncertifi            2026.10.23\ncharset-normalizer 3.5.2\nidna               3.20\nnumpy              2.5.5\npandas             3.1.1\npip                24.0\npython-dateutil    4.0.0\nrequests           2.34.2\ntzdata             2026.6\nurllib3            2.8.0",
      },
    ],
    practice: [
      "Run pip list in your terminal and find three packages you did not know were installed.",
      "Run python -m pip --version in your terminal and note the version number.",
      "Install the requests package with python -m pip install requests, then import it in Python and print requests.__version__.",
    ],
    summary: [
      "PIP installs third-party packages from the Python Package Index.",
      "pip install adds a package, pip list shows installed packages, pip uninstall removes one.",
      "Run pip from the terminal, not inside a Python file.",
      "python -m pip install uses the pip that belongs to the Python you run.",
      "Install packages inside a virtual environment for each project.",
    ],
  },
  {
    slug: "python-try-except",
    title: "Try...Except",
    intro: "Error handling stops a small mistake from crashing your whole program. With try and except, you can tell Python to attempt a risky piece of code and what to do if that code fails.",
    blocks: [
      { type: "para", text: "What is an exception? An exception is an error that happens while a program is running, such as dividing by zero, opening a file that does not exist, or turning text into a number when the text is not a number. Without handling, an exception stops the program at once and prints a long error message. With a try block, you can tell Python to attempt a risky piece of code, and with an except block, you can tell it what to do if that code fails. The program then keeps running instead of crashing." },
      {
        type: "code",
        title: "Catch a division by zero",
        code: `try:
    print(10 / 0)
except ZeroDivisionError:
    print("You cannot divide by zero")`,
        output: "You cannot divide by zero",
      },
      { type: "heading", text: "Catching a specific error" },
      { type: "para", text: "Each kind of error has its own name, such as ZeroDivisionError, ValueError, and KeyError. You should catch the specific error you expect, because that makes your code clear and stops you from hiding a different bug by accident. In the example below, turning the text abc into a number raises a ValueError, because abc is not a valid number. The except block catches that error and prints a friendly message asking for a valid number instead." },
      {
        type: "code",
        title: "Catch a ValueError from a bad conversion",
        code: `try:
    age = int("abc")
    print(age)
except ValueError:
    print("Please enter a valid number")`,
        output: "Please enter a valid number",
      },
      { type: "para", text: "Getting the error message: Sometimes you want to see the exact error message, for example when you write it to a log or show it while you are fixing a bug. You can catch the general Exception class and store the error in a variable with the word as. The message then tells you what went wrong in Python's own words. You can also add an else block after except, which runs only when no error happened, and that is a good place for code that should run after a successful try." },
      {
        type: "code",
        title: "Catch any error and print its message",
        code: `try:
    print(10 / 0)
except Exception as e:
    print("Something went wrong:", e)`,
        output: "Something went wrong: division by zero",
      },
      { type: "heading", text: "The finally block" },
      { type: "para", text: "A finally block runs after try and except, no matter what happened. It runs when the code succeeds, when an error is caught, and even when an error is not caught. This makes finally the right place for cleanup work that must happen in every case, such as closing a file. Do not use a bare except with no error name in real programs. It catches every error, including ones you did not expect, and that can hide serious bugs. For files, the with statement is usually simpler than try and finally, because it closes the file for you. Use finally when the cleanup is something with cannot do, such as releasing a lock." },
      {
        type: "code",
        title: "Finally runs when there is no error",
        code: `try:
    print(10 / 2)
except ZeroDivisionError:
    print("Error")
finally:
    print("This always runs")`,
        output: "5.0\nThis always runs",
      },
    ],
    practice: [
      "Write a try and except block that divides 10 by 0 and prints a friendly message.",
      "Try to turn the text hello into a number with int, catch the ValueError, and print a message.",
      "Write a program that asks the user for a number with input, turns it into an integer inside try, and prints a message if the input is not a number.",
    ],
    summary: [
      "An exception is a runtime error that can stop a program.",
      "try runs risky code and except handles the error.",
      "Catch the specific error you expect.",
      "except Exception as e gives you the exact error message.",
      "finally always runs, so it is the right place for cleanup.",
    ],
  },
  {
    slug: "python-challenges-try-except",
    title: "Code Challenge",
    intro: "Time to practise error handling. This challenge asks you to write a safe division function that never crashes, even when the divisor is zero.",
    blocks: [
      { type: "heading", text: "The challenge" },
      { type: "para", text: "Write a function called safe_divide(a, b) that tries to divide a by b and returns the result. When b is zero, it must catch the ZeroDivisionError and return None instead of crashing. Then call it with (10, 2) and with (10, 0), and print both results." },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "Put the division inside a try block and return the result from there.",
          "The except block should catch ZeroDivisionError and return None.",
          "10 divided by 2 is 5.0, and 10 divided by 0 gives None.",
          "The caller can check the result with is None to know the division failed.",
        ],
      },
      { type: "heading", text: "Solution" },
      {
        type: "code",
        title: "A division function that never crashes",
        code: `def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None

print(safe_divide(10, 2))
print(safe_divide(10, 0))`,
        output: "5.0\nNone",
      },
      { type: "para", text: "The first call returns 5.0, the normal answer. The second call would crash without the try block, but the except block catches the ZeroDivisionError and the function returns None instead. Returning None is a clear signal to the caller that the division could not be done." },
      {
        type: "code",
        title: "Using the result safely",
        code: `result = safe_divide(10, 0)
if result is None:
    print("Cannot divide by zero")
else:
    print("Answer:", result)`,
        output: "Cannot divide by zero",
      },
      { type: "tip", text: "A function that returns None on failure is a common pattern. Always check for None before using the result, or the error will just appear one step later." },
    ],
    practice: [
      "Write a function safe_int(text) that returns int(text) when it works and None when the text is not a number.",
      "Write a function that reads a value from a dictionary with a key, catches KeyError, and returns a default message.",
      "Wrap a file open in try and except FileNotFoundError, and print a friendly message when the file is missing.",
    ],
    summary: [
      "A function can catch an error and return None instead of crashing.",
      "The caller should check for None before using the result.",
      "Catch the specific error you expect, like ZeroDivisionError.",
      "Returning None is a clear signal that the work could not be done.",
    ],
  },
  {
    slug: "python-string-formatting",
    title: "String Formatting",
    intro: "String formatting puts values inside text in a controlled way. F-strings are the modern way to do it, and the format method and the percent operator are two older styles you will still meet in other people's code.",
    blocks: [
      { type: "heading", text: "F-strings, the modern way" },
      { type: "para", text: "An f-string starts with the letter f before the opening quote. Inside the string, curly brackets hold an expression, and Python replaces the brackets with the value of that expression. You can put a variable, a calculation, or a function call inside the brackets." },
      {
        type: "code",
        title: "Your first f-string",
        code: `name = "Asha"
age = 20
print(f"My name is {name} and I am {age} years old")
print(f"Next year I will be {age + 1}")
print(f"{100 / 3:.2f}")`,
        output: "My name is Asha and I am 20 years old\nNext year I will be 21\n33.33",
      },
      { type: "para", text: "The format after the colon controls how the value looks. The spec :.2f means a float with two digits after the decimal point, so 100 divided by 3 prints as 33.33 instead of a long decimal." },
      { type: "heading", text: "Aligning and padding values" },
      { type: "para", text: "A format spec can also set the width of a value and how it lines up. A width of 10 with > lines the text up on the right, and < lines it up on the left. A leading zero, like 03d, pads a number with zeros to three digits." },
      {
        type: "code",
        title: "Width, alignment, and zero padding",
        code: `print(f"{'Python':>10}")
print(f"{'Python':<10}!")
print(f"{7:03d}")
print(f"{'Price:':<10}{19.5:>6.2f}")`,
        output: "    Python\nPython    !\n007\nPrice:     19.50",
      },
      { type: "heading", text: "The format method and percent formatting" },
      { type: "para", text: "Before f-strings, the format method was the standard way. Curly brackets mark the places where values go, and the values are passed to format in order. The percent operator is even older: %s means a string, %d means an integer, and %.2f means a float with two decimal places. F-strings only work in Python 3.6 and later. For new code, use f-strings, because they are shorter and easier to read than format or percent formatting. Keep the expression inside the brackets short. If you need a long calculation, work it out first, store it in a variable, and put the variable in the f-string." },
      {
        type: "code",
        title: "Two older styles that still appear",
        code: `name = "Asha"
age = 20
print("My name is {} and I am {} years old".format(name, age))
print("Price: %.2f" % 19.5)
print("Hello %s, you are %d years old" % (name, age))`,
        output: "My name is Asha and I am 20 years old\nPrice: 19.50\nHello Asha, you are 20 years old",
      },
    ],
    practice: [
      "Use an f-string to print your name and age in one sentence.",
      "Print the value of 22 / 7 with exactly three digits after the decimal point.",
      "Use the format method to print a city and its population in one sentence.",
    ],
    summary: [
      "An f-string puts expressions inside curly brackets in a string.",
      "A format spec after a colon controls decimals, width, and alignment.",
      "The format method and the percent operator are older styles that still appear.",
      "For new code, f-strings are the clearest choice.",
    ],
  },
  {
    slug: "python-challenges-string-formatting",
    title: "Code Challenge",
    intro: "Time to practise string formatting. This challenge asks you to print a neat shop receipt, with every item name lined up on the left and every price lined up on the right.",
    blocks: [
      { type: "heading", text: "The challenge" },
      { type: "para", text: "You have three items with prices: Book for 299, Pen for 25, and Bag for 499. Print one line per item, with the item name in a field 10 characters wide on the left, and the price in a field 5 characters wide on the right, like Rs followed by the price. Then print a Total line in the same layout with the sum of all three prices." },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "Use an f-string like f\"{item:<10} Rs {price:>5}\" for one row.",
          "The <10 makes the name take 10 characters, lined up on the left.",
          "The >5 makes the price take 5 characters, lined up on the right.",
          "Keep a running total with a variable that starts at 0 and grows in the loop.",
        ],
      },
      { type: "heading", text: "Solution" },
      {
        type: "code",
        title: "A neat receipt with f-strings",
        code: `items = [("Book", 299), ("Pen", 25), ("Bag", 499)]
grand = 0
for item, price in items:
    print(f"{item:<10} Rs {price:>5}")
    grand = grand + price
print(f"{'Total':<10} Rs {grand:>5}")`,
        output: "Book       Rs   299\nPen        Rs    25\nBag        Rs   499\nTotal      Rs   823",
      },
      { type: "para", text: "The names line up on the left and the prices line up on the right, so the receipt is easy to read down the column. The total is 823, because 299 plus 25 plus 499 is 823." },
      {
        type: "code",
        title: "The same receipt with a fourth item",
        code: `items = [("Book", 299), ("Pen", 25), ("Bag", 499), ("Pencil", 10)]
grand = 0
for item, price in items:
    print(f"{item:<10} Rs {price:>6.2f}")
    grand = grand + price
print(f"{'Total':<10} Rs {grand:>6.2f}")`,
        output: "Book       Rs 299.00\nPen        Rs  25.00\nBag        Rs 499.00\nPencil     Rs  10.00\nTotal      Rs 833.00",
      },
      { type: "para", text: "With a fourth item and two decimal places, the columns still line up and the total is 833.00. The only changes are the extra item and the .2f in the format spec." },
      { type: "tip", text: "Fixed-width fields are the trick behind neat tables in plain text. Pick a width that fits your longest value, and every row lines up." },
    ],
    practice: [
      "Add a fourth item to the receipt and print the new total.",
      "Print the same receipt with prices shown to two decimal places, like 299.00.",
      "Print a class list with each name left-aligned in 12 characters and each mark right-aligned in 3 characters.",
    ],
    summary: [
      "A width in a format spec makes columns line up.",
      "< lines a value up on the left, > lines it up on the right.",
      "A loop with a running total builds the grand total one row at a time.",
      "Fixed-width fields make plain-text tables easy to read.",
    ],
  },
  {
    slug: "python-none",
    title: "None",
    intro: "None is Python's way of saying nothing is here. It is the value a function returns when it returns nothing, and the value you use when a variable has no real value yet.",
    blocks: [
      { type: "heading", text: "What None means" },
      { type: "para", text: "None is a special value of its own type, NoneType. It is not zero, it is not an empty string, and it is not False. It means the absence of a value, like an empty box. You use it when a variable has no value yet, or when a search finds nothing." },
      {
        type: "code",
        title: "None is not zero or empty",
        code: `x = None
print(x)
print(x is None)
print(x == 0)
print(x == "")
print(type(x))`,
        output: "None\nTrue\nFalse\nFalse\n<class 'NoneType'>",
      },
      { type: "para", text: "Printing None shows the word None. The check x is None is True, while comparing None with 0 or with an empty string is False. None is its own thing, so it is equal to nothing else." },
      { type: "heading", text: "Functions return None by default" },
      { type: "para", text: "A function that only prints, and has no return statement, returns None automatically. That is why print(square(5)) would show 25, but print(greet()) shows None after the greeting: greet returns nothing, so Python fills in None." },
      {
        type: "code",
        title: "A function with no return gives None",
        code: `def greet(name):
    print("Hello,", name)

result = greet("Asha")
print(result)
print(result is None)`,
        output: "Hello, Asha\nNone\nTrue",
      },
      { type: "heading", text: "Using None as a signal" },
      { type: "para", text: "A common pattern is a search function that returns a value when it finds one, and None when it does not. The caller then checks the result with is None before using it. Here find_even returns the first even number in a list, or None when the list has no even number. Always check None with is, not with ==. The is operator checks identity, which is the right test for a single special value like None. Writing x == None works, but is None is the style every Python programmer expects. None is also a good default for an optional argument, like def greet(name=None). Inside the function you can test if name is None and print a generic greeting instead." },
      {
        type: "code",
        title: "Returning None when nothing is found",
        code: `def find_even(numbers):
    for n in numbers:
        if n % 2 == 0:
            return n
    return None

print(find_even([1, 3, 5]))
print(find_even([1, 4, 5]))
print(find_even([1, 3, 5]) is None)`,
        output: "None\n4\nTrue",
      },
    ],
    practice: [
      "Write a function that returns the first number greater than 10 in a list, or None when there is none, and test both cases.",
      "Write a function with a default argument of None that prints a different message when no value is given.",
      "Check whether None is equal to False with == and with is, and print both results.",
    ],
    summary: [
      "None means no value; it is not zero, not an empty string, and not False.",
      "A function without return gives back None.",
      "A search function returns None when it finds nothing.",
      "Check for None with is None, never with ==.",
    ],
  },
  {
    slug: "python-challenges-none",
    title: "Code Challenge",
    intro: "Time to practise None. This challenge asks you to write a search function that returns a value when it finds one and None when it does not, and to use that result safely.",
    blocks: [
      { type: "heading", text: "The challenge" },
      { type: "para", text: "Write a function called find_even(numbers) that returns the first even number in a list, or None when the list has no even number. Then call it with [1, 3, 5] and with [1, 4, 5], print both results, and print whether the first result is None." },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "Loop over the numbers and return n as soon as n % 2 == 0.",
          "Put return None after the loop, so it runs only when no even number was found.",
          "Print the result of each call directly to see the value or None.",
          "Check the first result with is None, not with == None.",
        ],
      },
      { type: "heading", text: "Solution" },
      {
        type: "code",
        title: "Finding the first even number",
        code: `def find_even(numbers):
    for n in numbers:
        if n % 2 == 0:
            return n
    return None

print(find_even([1, 3, 5]))
print(find_even([1, 4, 5]))
print(find_even([1, 3, 5]) is None)`,
        output: "None\n4\nTrue",
      },
      { type: "para", text: "The first list has no even number, so the loop finishes without returning and the function returns None. The second list has 4 as its first even number, so the function returns 4 at once. The check with is None is True for the first result." },
      {
        type: "code",
        title: "Using the result safely",
        code: `result = find_even([1, 3, 5])
if result is None:
    print("No even number found")
else:
    print("Found:", result)`,
        output: "No even number found",
      },
      { type: "tip", text: "When a function can return None, always check the result before doing maths with it. Adding 1 to None raises a TypeError, so the check is not optional." },
    ],
    practice: [
      "Write a function find_long_word(words) that returns the first word longer than 5 letters, or None when there is none.",
      "Write a function that looks up a name in a dictionary and returns None when the name is missing.",
      "Call your function with a list that has no match, and print a friendly message using an is None check.",
    ],
    summary: [
      "A search function returns the value when found and None when not found.",
      "return None after the loop runs only when the loop found nothing.",
      "Check the result with is None before using it.",
      "Doing maths with None raises a TypeError, so the check matters.",
    ],
  },
  {
    slug: "python-user-input",
    title: "Python User Input",
    intro: "The input function reads text typed by the user. With input, your programs stop being fixed scripts and start responding to the person using them.",
    blocks: [
      { type: "heading", text: "Reading text from the user" },
      { type: "para", text: "The input function shows a message, waits for the user to type something, and returns what was typed when the user presses Enter. The message inside the parentheses is called a prompt, and it tells the user what to type. The value you get back is always a string, even if the user typed digits. The program pauses at the input call and waits, so the user can take as long as they need to type an answer." },
      {
        type: "code",
        title: "Asking for a name",
        code: `name = input("What is your name? ")
print("Hello, " + name + "!")`,
        output: "What is your name? Ada\nHello, Ada!",
      },
      { type: "para", text: "The output above shows the prompt, then the typed answer Ada, then the greeting. When you run this yourself, your answer will be different, and the greeting will use your name instead." },
      { type: "heading", text: "Input always returns a string" },
      { type: "para", text: "If the user types 17, Python gives you the text \"17\", not the number 17. Adding 1 to that text would fail, because you cannot add a number to text. You must convert the input to a number first, using int or float, before doing any maths with it." },
      {
        type: "code",
        title: "Converting input to a number",
        code: `age = int(input("Enter your age: "))
print("Next year you will be", age + 1)`,
        output: "Enter your age: 17\nNext year you will be 18",
      },
      { type: "heading", text: "Asking several questions" },
      { type: "para", text: "You can ask for several inputs in one program, one after another. Each input call waits for its own answer, so the program moves through the questions in order. Store each answer in its own variable so you can use them all at the end. Ask the questions in a sensible order, one at a time, and keep each prompt short so the user always knows what to type next. If the user types text where your program expects a number, int will fail with a ValueError and the program will stop. The Try...Except lesson shows how to catch that error and ask again. End your prompt with a space after the question mark or colon, like \"Enter your age: \". The space keeps the user's typing from touching the prompt." },
      {
        type: "code",
        title: "Asking two questions",
        code: `first = input("Enter your first name: ")
last = input("Enter your last name: ")
print("Your full name is " + first + " " + last)`,
        output: "Enter your first name: Ada\nEnter your last name: Lovelace\nYour full name is Ada Lovelace",
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
    slug: "python-virtualenv",
    title: "Python VirtualEnv",
    intro: "A virtual environment is the standard way to keep each Python project and its packages separate. It stops one project from breaking another.",
    blocks: [
      { type: "para", text: "Why projects need their own space: Every Python project needs packages, and different projects often need different versions of the same package. If you install everything into one shared Python, the versions clash: upgrading a package for one project can break another. A virtual environment gives each project its own private copy of Python and its own package folder. Each project gets its own packages, so versions never clash. You can delete a project and its environment together, leaving nothing behind. Other people can recreate your exact setup from a list of packages." },
      { type: "heading", text: "Creating an environment" },
      { type: "para", text: "Python ships with a built-in module called venv, so you need nothing extra. Run python -m venv myenv in your project folder to create an environment named myenv. Then activate it: on Windows run myenv Scripts activate, and on Mac or Linux run source myenv/bin/activate. Your terminal prompt changes to show the environment name, and from then on pip installs go into that environment only. Run deactivate when you are done." },
      {
        type: "code",
        title: "The venv module is built in",
        code: `import venv

print(venv.__name__)
print(hasattr(venv, "create"))`,
        output: "venv\nTrue",
      },
      { type: "heading", text: "Creating one from Python code" },
      { type: "para", text: "You can also create an environment from inside a Python program with venv.create. The folder it makes holds the Python executable, a lib folder for packages, and a pyvenv.cfg file that records which Python it was built from. The with_pip=False option skips installing pip, which makes creation faster when you only want to check the layout." },
      {
        type: "code",
        title: "Creating an environment in code",
        code: `import os
import venv

venv.create("myenv", with_pip=False)
print(os.path.isdir("myenv"))
print(os.path.isfile("myenv/pyvenv.cfg"))`,
        output: "True\nTrue",
      },
      { type: "heading", text: "Sharing an environment" },
      { type: "para", text: "You never share the environment folder itself, because it is large and tied to your machine. Instead, you share a list of packages made with pip freeze, saved into a file called requirements.txt. Another person creates their own environment and runs pip install -r requirements.txt to get the same packages. Never commit the environment folder to git. It is large and machine-specific. Commit a requirements file instead, made with pip freeze, so others can rebuild the same environment. Make the environment before you install anything for a project. Installing first and creating the environment later leaves the packages in the wrong place. The exact list of packages depends on what is installed in that environment, so the freeze output on your machine will look different from the one shown here." },
      {
        type: "code",
        title: "Freezing and rebuilding packages",
        code: `pip freeze > requirements.txt
pip install -r requirements.txt`,
        output: "certifi==2026.10.23\ncharset-normalizer==3.5.2\nidna==3.20\nnumpy==2.5.5\npandas==3.1.1\npython-dateutil==4.0.0\nrequests==2.34.2\ntzdata==2026.6\nurllib3==2.8.0\nRequirement already satisfied: certifi==2026.10.23 in ./lib/python3.12/site-packages (from -r requirements.txt (line 1)) (2026.10.23)\nRequirement already satisfied: charset-normalizer==3.5.2 in ./lib/python3.12/site-packages (from -r requirements.txt (line 2)) (3.5.2)\nRequirement already satisfied: idna==3.20 in ./lib/python3.12/site-packages (from -r requirements.txt (line 3)) (3.20)\nRequirement already satisfied: numpy==2.5.5 in ./lib/python3.12/site-packages (from -r requirements.txt (line 4)) (2.5.5)\nRequirement already satisfied: pandas==3.1.1 in ./lib/python3.12/site-packages (from -r requirements.txt (line 5)) (3.1.1)\nRequirement already satisfied: python-dateutil==4.0.0 in ./lib/python3.12/site-packages (from -r requirements.txt (line 6)) (4.0.0)\nRequirement already satisfied: requests==2.34.2 in ./lib/python3.12/site-packages (from -r requirements.txt (line 7)) (2.34.2)\nRequirement already satisfied: tzdata==2026.6 in ./lib/python3.12/site-packages (from -r requirements.txt (line 8)) (2026.6)\nRequirement already satisfied: urllib3==2.8.0 in ./lib/python3.12/site-packages (from -r requirements.txt (line 9)) (2.8.0)",
      },
    ],
    practice: [
      "Create a virtual environment named myenv in a test folder and activate it from your terminal.",
      "Install a package inside the activated environment, then run pip list to confirm it is there.",
      "Deactivate, then check that the same package is not available in your system Python.",
    ],
    summary: [
      "A virtual environment gives each project its own Python and packages.",
      "Create one with python -m venv myenv, then activate it before installing packages.",
      "Separate environments stop package versions from clashing between projects.",
      "Share a requirements file, not the environment folder itself.",
    ],
  },
];
