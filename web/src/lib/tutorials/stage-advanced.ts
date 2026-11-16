import type { LessonTutorial } from "./types";

export const TUTORIALS: LessonTutorial[] = [
  {
    day: 84,
    title: "Time Module",
    intro:
      "This lesson teaches the time module, which lets your programs work with clocks, dates, and pauses. It matters because almost every real program needs to wait, measure how long something takes, or show a date and time.",
    blocks: [
      {
        type: "heading",
        text: "What is the time module?",
      },
      {
        type: "para",
        text: "Python has a built-in module called time. You import it like any other module, and it gives you functions for reading the current time, pausing your program, and formatting dates. Computers count time as the number of seconds since 1 January 1970, which is called the epoch. That sounds strange, but it makes time easy to compare and store as a plain number.",
      },
      {
        type: "code",
        title: "The start of computer time",
        code: `import time

moment = time.gmtime(0)
print(moment)
print(time.strftime("%Y-%m-%d %H:%M:%S", moment))`,
        output: `time.struct_time(tm_year=1970, tm_mon=1, tm_mday=1, tm_hour=0, tm_min=0, tm_sec=0, tm_wday=3, tm_yday=1, tm_isdst=0)
1970-01-01 00:00:00`,
      },
      {
        type: "para",
        text: "The function time.gmtime(0) turns zero seconds into a readable date: midnight on 1 January 1970. The function time.strftime turns that date into a string in the format you choose. The letters %Y, %m, %d, %H, %M and %S stand for year, month, day, hour, minute and second. You can rearrange them to build any date format you like.",
      },
      {
        type: "heading",
        text: "Pausing your program",
      },
      {
        type: "para",
        text: "The function time.sleep pauses your program for a number of seconds. It is useful for countdowns, reminders, and programs that check something again and again. The program simply waits and then carries on from the next line.",
      },
      {
        type: "code",
        title: "A two second pause",
        code: `import time

print("Starting a 2 second pause")
time.sleep(2)
print("Pause finished")`,
        output: `Starting a 2 second pause
Pause finished`,
      },
      {
        type: "list",
        items: [
          "time.time() gives the current time as seconds since the epoch.",
          "time.sleep(seconds) pauses the program for that many seconds.",
          "time.gmtime() turns seconds into a date in UTC time.",
          "time.localtime() turns seconds into a date in your local time zone.",
          "time.strftime(format, moment) formats a date as a string.",
          "time.ctime(seconds) turns seconds into a short readable date string.",
        ],
      },
      {
        type: "note",
        text: "time.localtime() uses your computer clock and time zone, so its output changes from one computer to another. For examples that must give the same output everywhere, use time.gmtime() with a fixed number of seconds.",
      },
      {
        type: "tip",
        text: "To measure how long a piece of code takes, save time.time() before it and after it, then subtract the first value from the second. The result is the time in seconds.",
      },
    ],
    practice: [
      "Use time.gmtime(86400) to find the date exactly one day after the epoch.",
      "Format the date from time.gmtime(0) as day-month-year, for example 01-01-1970.",
      "Write a countdown that prints 3, 2, 1 with a one second pause between each number, then prints Go.",
    ],
    summary: [
      "The time module works with clocks, pauses, and dates.",
      "Computers count time in seconds since 1 January 1970.",
      "time.sleep pauses a program for a set number of seconds.",
      "time.strftime formats a date into a string you design.",
    ],
  },
  {
    day: 85,
    title: "Command Line Utility",
    intro:
      "This lesson teaches you to build a command line utility, a small program that takes instructions typed after its name. It matters because many real tools work this way, and it is the first step from scripts you run to tools other people can use.",
    blocks: [
      {
        type: "heading",
        text: "What is a command line utility?",
      },
      {
        type: "para",
        text: "A command line utility is a program you run from the terminal by typing its name followed by extra words, called arguments. For example, you might type python calc.py 4 5 --add and get 9. The program reads those words and behaves differently based on them. Python has a built-in module called argparse that does the hard work of reading arguments for you.",
      },
      {
        type: "code",
        title: "A small calculator tool",
        code: `import argparse

parser = argparse.ArgumentParser(description="A simple calculator")
parser.add_argument("a", type=int, help="first number")
parser.add_argument("b", type=int, help="second number")
parser.add_argument("--add", action="store_true", help="add the numbers")
args = parser.parse_args(["4", "5", "--add"])

if args.add:
    print(args.a + args.b)`,
        output: `9`,
      },
      {
        type: "para",
        text: "The parser has two kinds of arguments. Positional arguments, like a and b, must be given in order. Optional arguments, like --add, start with two dashes and act like switches. The type=int part tells argparse to turn the text into a number, so a mistake like typing a word gives a clear error instead of a crash later.",
      },
      {
        type: "code",
        title: "An optional flag that changes the result",
        code: `import argparse

parser = argparse.ArgumentParser(description="Greet someone")
parser.add_argument("name", help="name to greet")
parser.add_argument("--shout", action="store_true", help="use capital letters")
args = parser.parse_args(["Asha", "--shout"])

message = f"Hello, {args.name}!"
if args.shout:
    message = message.upper()
print(message)`,
        output: `HELLO, ASHA!`,
      },
      {
        type: "list",
        items: [
          "add_argument defines one argument the program accepts.",
          "type=int or type=float converts the text into a number.",
          "action=store_true makes a switch that is False unless given.",
          "help= adds a short description shown in the help text.",
          "parse_args() reads the real command line arguments.",
          "Running the program with --help prints a usage guide for free.",
        ],
      },
      {
        type: "note",
        text: "In the examples above, a list is passed to parse_args so you can run the code in the editor. In a real utility you call parse_args() with no list, and it reads the words typed in the terminal after the program name.",
      },
      {
        type: "tip",
        text: "Always add a description and a help text for every argument. Your future self, and anyone else who uses the tool, will thank you when they run it with --help.",
      },
    ],
    practice: [
      "Extend the calculator so it also supports --subtract and --divide.",
      "Build a tool that takes a file name and a --lines flag, then prints that many lines from the file.",
      "Add a --name argument with a default value, so the program greets a default name when none is given.",
    ],
    summary: [
      "A command line utility takes arguments typed after its name.",
      "The argparse module reads and checks those arguments for you.",
      "Positional arguments are given in order; optional ones start with dashes.",
      "type= converts text arguments into numbers automatically.",
    ],
  },

  {
    day: 86,
    title: "Walrus Operator",
    intro:
      "This lesson teaches the walrus operator, written as :=, which assigns a value to a variable and returns it in the same step. It matters because it lets you write shorter, cleaner code when you need a value and also need to test it right away.",
    blocks: [
      {
        type: "heading",
        text: "What is the walrus operator?",
      },
      {
        type: "para",
        text: "The walrus operator was added in Python 3.8. It looks like a walrus face turned sideways, which is how it got its name. Normal assignment, with a single =, stores a value but gives back nothing. The walrus operator stores a value and also hands it back, so you can use it inside an if test or a while test in the same line.",
      },
      {
        type: "code",
        title: "Assign and test in one line",
        code: `numbers = [3, 7, 2, 9, 4]
if (n := len(numbers)) > 3:
    print(f"We have {n} numbers")`,
        output: `We have 5 numbers`,
      },
      {
        type: "para",
        text: "Here (n := len(numbers)) stores 5 in n and then compares 5 with 3. Without the walrus operator you would need two lines: one to store the length and one to test it. The brackets are required when you use the walrus operator inside an if or while test, so always include them.",
      },
      {
        type: "code",
        title: "A while loop that updates its own test",
        code: `total = 0
data = [10, 20, 30]
while (x := len(data)) > 0:
    total += data.pop()
print(total)
print(x)`,
        output: `60
0`,
      },
      {
        type: "para",
        text: "Each time the loop repeats, x is set to the current length of the list. The loop takes the last item off the list and adds it to the total. When the list is empty, x becomes 0, the test fails, and the loop stops. After the loop, x is still 0 and the total is 60.",
      },
      {
        type: "code",
        title: "Walrus inside a list comprehension",
        code: `values = [4, -2, 7, -5, 9]
positives = [y for x in values if (y := abs(x)) > 5]
print(positives)`,
        output: `[7, 9]`,
      },
      {
        type: "note",
        text: "The walrus operator only works in Python 3.8 and newer. Older versions will show a syntax error, so check your Python version before using it.",
      },
      {
        type: "tip",
        text: "Use the walrus operator when it makes code shorter and still easy to read. If a line starts to look clever instead of clear, split it back into two normal lines.",
      },
    ],
    practice: [
      "Ask the user for a word with input, and use the walrus operator to print its length only if it is longer than 5 letters.",
      "Rewrite a while loop that reads numbers until the user types 0, using the walrus operator in the loop test.",
      "Use the walrus operator in a list comprehension to keep only the squares of numbers that are greater than 10.",
    ],
    summary: [
      "The walrus operator := assigns a value and returns it at the same time.",
      "It is most useful inside if and while tests.",
      "Brackets are required around it in a test.",
      "Use it to shorten code, but never at the cost of readability.",
    ],
  },
  {
    day: 87,
    title: "Shutil Module",
    intro:
      "This lesson teaches the shutil module, which handles high level file jobs like copying, moving, and deleting whole folders. It matters because real programs often manage files, and shutil does in one line what would take many lines by hand.",
    blocks: [
      {
        type: "heading",
        text: "What is shutil?",
      },
      {
        type: "para",
        text: "The name shutil is short for shell utilities. It is a built-in module for file operations that go beyond reading and writing text. With it you can copy a file, copy a whole folder tree, move a file to a new location, delete a folder and everything inside it, and even ask how much disk space is free.",
      },
      {
        type: "code",
        title: "Copy a file",
        code: `import shutil

with open("hello.txt", "w") as f:
    f.write("Hello, Python!")

shutil.copy("hello.txt", "hello_copy.txt")
print("Copy done")

with open("hello_copy.txt") as f:
    print(f.read())`,
        output: `Copy done
Hello, Python!`,
      },
      {
        type: "para",
        text: "The function shutil.copy takes a source file and a destination file and makes an exact copy of the contents. It does not need the file to be opened first. If the destination already exists, it is overwritten, so be careful when the destination file holds something important.",
      },
      {
        type: "code",
        title: "Move a file",
        code: `import shutil

with open("temp.txt", "w") as f:
    f.write("Move me")

shutil.move("temp.txt", "moved.txt")
print("Moved")

with open("moved.txt") as f:
    print(f.read())`,
        output: `Moved
Move me`,
      },
      {
        type: "list",
        items: [
          "shutil.copy copies one file to a new location.",
          "shutil.copy2 copies a file and keeps its timestamps.",
          "shutil.copytree copies a whole folder with everything inside it.",
          "shutil.move moves or renames a file or folder.",
          "shutil.rmtree deletes a folder and everything inside it.",
          "shutil.disk_usage gives the total, used, and free space of a disk.",
        ],
      },
      {
        type: "note",
        text: "shutil.rmtree deletes a folder and all of its contents with no undo. Double check the folder path before you run it, and never call it on a path you have not printed and checked first.",
      },
      {
        type: "tip",
        text: "Use shutil.copy2 instead of shutil.copy when the file timestamps matter, for example in a backup tool. It copies the contents and the original date and time of the file.",
      },
    ],
    practice: [
      "Write a script that copies every .txt file in a folder into a new backup folder.",
      "Use shutil.disk_usage to print how much free space your disk has in gigabytes.",
      "Write a small backup script that copies a folder with shutil.copytree and prints Done when it finishes.",
    ],
    summary: [
      "shutil handles big file jobs like copying and moving.",
      "shutil.copy copies one file; shutil.copytree copies a whole folder.",
      "shutil.move moves or renames a file or folder.",
      "shutil.rmtree deletes a folder completely, so use it with care.",
    ],
  },
  {
    day: 88,
    title: "Exercise 9 Solution: Shoutouts",
    intro:
      "This lesson is the solution to Exercise 9: a program that gives a shoutout to everyone in a list. It matters because it brings together loops, lists, functions, and input, the core skills from the whole course, in one small working program.",
    blocks: [
      {
        type: "heading",
        text: "The problem",
      },
      {
        type: "para",
        text: "The exercise asks for a program that takes a list of names and prints a personalised shoutout for each one. A shoutout is a short message that mentions someone by name, like Shoutout to Friend 1! You are doing a great job. The program should work for any names the user types in, not just the ones written in the code.",
      },
      {
        type: "code",
        title: "The solution: read names, then shout them out",
        code: `names = []

for i in range(3):
    name = input("Enter a name for a shoutout: ")
    names.append(name)

print("Here are your shoutouts:")
for name in names:
    print(f"Shoutout to {name}! You are doing a great job.")`,
        output: `Enter a name for a shoutout: Friend 1
Enter a name for a shoutout: Friend 2
Enter a name for a shoutout: Friend 3
Here are your shoutouts:
Shoutout to Friend 1! You are doing a great job.
Shoutout to Friend 2! You are doing a great job.
Shoutout to Friend 3! You are doing a great job.`,
      },
      {
        type: "para",
        text: "The program works in two loops. The first loop asks for three names and adds each one to a list. The second loop goes through the list and prints a shoutout for each name. The f-string puts the name inside the message, so every line is personal to that person. The words Friend 1, Friend 2 and Friend 3 in the output are the sample values typed in for this example.",
      },
      {
        type: "heading",
        text: "A cleaner version with a function",
      },
      {
        type: "para",
        text: "The same idea is easier to reuse when the shoutout is a function. The function takes one name and prints one message. The main code only has to loop over the names and call the function, and it can also count how many shoutouts were printed.",
      },
      {
        type: "code",
        title: "The same program with a function",
        code: `def shoutout(name):
    print(f"Shoutout to {name}! Keep learning Python.")

names = ["Friend 1", "Friend 2", "Friend 3"]
for name in names:
    shoutout(name)

print(f"Total shoutouts: {len(names)}")`,
        output: `Shoutout to Friend 1! Keep learning Python.
Shoutout to Friend 2! Keep learning Python.
Shoutout to Friend 3! Keep learning Python.
Total shoutouts: 3`,
      },
      {
        type: "list",
        items: [
          "Ask the user for names and store them in a list.",
          "Loop over the list and print one shoutout per name.",
          "Use an f-string to put the name inside the message.",
          "Put the message in a function so it can be reused.",
          "Use len() to count how many shoutouts were printed.",
        ],
      },
      {
        type: "note",
        text: "The exercise is about the pattern, not the names. Use your own names, or names typed by the user, when you run it. Never hardcode real people's names into a program you share.",
      },
      {
        type: "tip",
        text: "Try changing the range in the first loop to ask for a different number of names, or ask the user how many shoutouts they want before the loop starts.",
      },
    ],
    practice: [
      "Change the program so it asks the user how many names to enter before the loop starts.",
      "Add a different message for each shoutout by picking a message at random from a list of three messages.",
      "Save all the shoutouts to a file called shoutouts.txt instead of only printing them.",
    ],
    summary: [
      "Exercise 9 asks for a shoutout printed for each name in a list.",
      "One loop collects the names; a second loop prints the messages.",
      "F-strings put each name inside its own message.",
      "A function makes the shoutout easy to reuse and test.",
    ],
  },
  {
    day: 89,
    title: "Requests Module",
    intro:
      "This lesson teaches the requests module, which lets your programs talk to the internet and fetch data from websites and APIs. It matters because most modern programs get their data from the web, from weather reports to news headlines.",
    blocks: [
      {
        type: "heading",
        text: "What is the requests module?",
      },
      {
        type: "para",
        text: "The requests module is the standard way to make web requests in Python. You give it a web address, and it sends a request and brings back a response. The response has a status code, which tells you whether the request worked, and the data itself, which is often in JSON format. JSON looks like a Python dictionary, so it is easy to work with.",
      },
      {
        type: "code",
        title: "Sample output: checking a website is up",
        code: `import requests

response = requests.get("https://api.github.com")
print(response.status_code)`,
        output: `200`,
      },
      {
        type: "para",
        text: "The function requests.get sends a GET request, which means ask for data. A status code of 200 means the request worked. A code of 404 means the page was not found, and a code of 500 means the server had a problem. Checking the status code is the first step before you trust the data that came back.",
      },
      {
        type: "code",
        title: "Sample output: reading JSON data",
        code: `import requests

response = requests.get("https://jsonplaceholder.typicode.com/todos/1")
data = response.json()
print(data["title"])
print(data["completed"])`,
        output: `delectus aut autem
False`,
      },
      {
        type: "list",
        items: [
          "requests.get(url) fetches data from a web address.",
          "response.status_code tells you if the request worked; 200 means success.",
          "response.text gives the raw text of the response.",
          "response.json() turns a JSON response into a Python dictionary.",
          "You can pass a timeout so a slow server does not freeze your program.",
          "You can pass params to add values to the web address, like a search word.",
        ],
      },
      {
        type: "note",
        text: "requests is not part of the standard library, so you must install it first with pip install requests. The two examples above need an internet connection, and the outputs shown are sample outputs from the live services.",
      },
      {
        type: "tip",
        text: "Always wrap a web request in a try block. The internet can fail, a server can be down, or an address can be wrong, and your program should handle that with a friendly message instead of crashing.",
      },
    ],
    practice: [
      "Fetch the same todo item with id 2 and print its title and whether it is completed.",
      "Check the status code of https://example.com and print Up if it is 200.",
      "Fetch a random joke from a public jokes API and print only the joke text.",
    ],
    summary: [
      "The requests module fetches data from websites and APIs.",
      "requests.get sends a request and returns a response.",
      "A status code of 200 means the request worked.",
      "response.json() turns JSON data into a Python dictionary.",
    ],
  },
  {
    day: 90,
    title: "Exercise 10: News App",
    intro:
      "This lesson is Exercise 10: build a News App that fetches the latest headlines from a news API and prints them. It matters because it is your first full app that combines the requests module with real data from the internet.",
    blocks: [
      {
        type: "heading",
        text: "The problem",
      },
      {
        type: "para",
        text: "The exercise asks you to build a program that shows the top news headlines. The program must ask a news API for the latest headlines and print them in a clean numbered list. A news API is a service that gives you news data in JSON format when you send it a request with your API key.",
      },
      {
        type: "list",
        items: [
          "Sign up for a free key at a news API service such as NewsAPI.",
          "Send a request to the top headlines address with your key.",
          "Read the list of articles from the JSON response.",
          "Print each headline on its own line with a number.",
          "Handle the case where the request fails with a friendly message.",
        ],
      },
      {
        type: "code",
        title: "Sample output: the news app with a real API",
        code: `import requests

API_KEY = "YOUR_API_KEY"
url = "https://newsapi.org/v2/top-headlines"
params = {"country": "in", "apiKey": API_KEY}

response = requests.get(url, params=params)
data = response.json()

print("Top Headlines")
for article in data["articles"][:5]:
    print("-", article["title"])`,
        output: `Top Headlines
- Local team wins the final match
- New metro line opens in the city
- Scientists announce a clean energy breakthrough
- Rain expected over the weekend
- Students build a robot that sorts waste`,
      },
      {
        type: "para",
        text: "The code sends one request with two parameters: the country code in and your API key. The response is JSON, and the articles key holds a list of news stories. Each story is a dictionary, and the title key holds the headline. The slice [:5] takes only the first five stories, so the output stays short.",
      },
      {
        type: "code",
        title: "The printing part, runnable without the internet",
        code: `articles = [
    {"title": "Local team wins the final match"},
    {"title": "New library opens in the city"},
    {"title": "Rain expected over the weekend"},
]

print("Top Headlines")
for i, article in enumerate(articles, start=1):
    print(f"{i}. {article['title']}")`,
        output: `Top Headlines
1. Local team wins the final match
2. New library opens in the city
3. Rain expected over the weekend`,
      },
      {
        type: "note",
        text: "Replace YOUR_API_KEY with your own free key from the news API service. Never share your key in public or put it in code you upload, because anyone with the key can use your quota.",
      },
      {
        type: "tip",
        text: "Try changing the country code to us or gb to see headlines from another country, or add a category like technology to the parameters to get news on one topic.",
      },
    ],
    practice: [
      "Build the full news app with your own free API key and print the top 5 headlines.",
      "Let the user type a topic, then fetch headlines about that topic instead of the top headlines.",
      "Save the headlines to a file called news.txt with the date at the top.",
    ],
    summary: [
      "The News App fetches headlines from a news API with requests.",
      "The API needs a key, passed as a parameter in the request.",
      "The JSON response holds a list of articles with a title each.",
      "Printing only the first five keeps the output short and readable.",
    ],
  },
  {
    day: 91,
    title: "Generators",
    intro:
      "This lesson teaches generators, special functions that produce values one at a time instead of building a whole list. They matter because they use very little memory, so they can handle huge or even endless sequences that would never fit in a list.",
    blocks: [
      {
        type: "heading",
        text: "What is a generator?",
      },
      {
        type: "para",
        text: "A normal function runs once and returns one value. A generator function uses the keyword yield instead of return. Each time it reaches yield, it pauses and hands out one value. The next time you ask for a value, it carries on from exactly where it stopped, remembering all its variables. This pause and resume trick is what makes generators so light on memory.",
      },
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
        output: `1
2
3`,
      },
      {
        type: "para",
        text: "Calling count_up(3) does not run the function. It returns a generator object, which is like a paused machine. The for loop asks it for values one by one. Each yield gives the next number, and when the loop inside the function ends, the generator is finished.",
      },
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
        output: `0
2
4`,
      },
      {
        type: "para",
        text: "This generator never ends, because its while loop is always true. That is safe, because it only makes a value when you ask for one with next. A list of all even numbers would be impossible, but a generator of even numbers is just a few lines.",
      },
      {
        type: "code",
        title: "A generator expression, like a list comprehension",
        code: `squares = (x * x for x in range(5))
print(next(squares))
print(next(squares))
print(list(squares))`,
        output: `0
1
[4, 9, 16]`,
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
      {
        type: "note",
        text: "A generator can only be used once. After you have gone through all of its values, it is empty. If you need the values again, call the generator function again to make a fresh one.",
      },
      {
        type: "tip",
        text: "When you only need to loop over values once, prefer a generator over a list. Reading a huge file line by line with a generator uses almost no memory.",
      },
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
    day: 92,
    title: "Function Caching",
    intro:
      "This lesson teaches function caching, a way to remember the result of a function so it is not computed twice. It matters because some functions are slow, and caching can turn a program that takes minutes into one that takes seconds.",
    blocks: [
      {
        type: "heading",
        text: "What is function caching?",
      },
      {
        type: "para",
        text: "Caching means storing a result so you can reuse it later. When a function is called with the same inputs, the answer is always the same, so there is no reason to compute it again. Python has a built-in decorator called lru_cache in the functools module that does this for you. It remembers the result of each call, and the next time the same inputs appear, it returns the saved answer at once.",
      },
      {
        type: "code",
        title: "The second call is free",
        code: `from functools import lru_cache

@lru_cache(maxsize=None)
def slow_square(n):
    print(f"Computing square of {n}")
    return n * n

print(slow_square(4))
print(slow_square(4))
print(slow_square(5))`,
        output: `Computing square of 4
16
16
Computing square of 5
25`,
      },
      {
        type: "para",
        text: "The first call to slow_square(4) prints the message and computes 16. The second call with the same input prints nothing, because the answer came straight from the cache. The call with 5 is a new input, so it computes again. The setting maxsize=None means the cache has no size limit.",
      },
      {
        type: "heading",
        text: "Caching makes recursion fast",
      },
      {
        type: "para",
        text: "Caching is most powerful with recursive functions. The Fibonacci function calls itself twice for every number, so without caching it repeats the same work thousands of times. With caching, each number is computed only once, and the rest are instant lookups.",
      },
      {
        type: "code",
        title: "Fibonacci with a cache",
        code: `from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(10))
print(fib(20))`,
        output: `55
6765`,
      },
      {
        type: "list",
        items: [
          "lru_cache is a decorator from the functools module.",
          "It stores the result of each call, keyed by the inputs.",
          "A repeat call with the same inputs returns the saved result.",
          "maxsize sets how many results to keep; None means unlimited.",
          "cache_info() shows how many calls hit the cache and how many missed.",
          "cache_clear() empties the cache when you need fresh results.",
        ],
      },
      {
        type: "note",
        text: "Caching only works when the function always returns the same result for the same inputs. Never cache a function that reads the current time, a random number, or a changing file, because the saved answer would be stale.",
      },
      {
        type: "tip",
        text: "Only cache functions with hashable inputs, like numbers and strings. A function that takes a list cannot be cached, because lists cannot be used as cache keys.",
      },
    ],
    practice: [
      "Add lru_cache to a slow function that waits one second, and time two calls with the same input.",
      "Write a cached recursive function that counts the ways to climb a staircase taking 1 or 2 steps at a time.",
      "Use cache_info() to print how many hits and misses your cached function had.",
    ],
    summary: [
      "Function caching remembers results so they are not computed twice.",
      "lru_cache from functools adds caching with one decorator.",
      "Repeat calls with the same inputs return the saved answer.",
      "Caching turns slow recursive functions into fast ones.",
    ],
  },
  {
    day: 93,
    title: "Exercise 10 Solution: News App",
    intro:
      "This lesson is the full solution to Exercise 10, the News App, plus a shoutout to everyone who finished it. It matters because it shows how the separate pieces, requests, JSON, loops, and error handling, fit together into one complete program.",
    blocks: [
      {
        type: "heading",
        text: "The complete solution",
      },
      {
        type: "para",
        text: "The solution fetches the top headlines from a news API, prints the first five, and handles failure with a friendly message instead of a crash. It also prints a thank you line at the end, a shoutout to everyone who completed the exercise. The whole program is short, but it uses everything from the last few lessons.",
      },
      {
        type: "code",
        title: "Sample output: the full news app solution",
        code: `import requests

API_KEY = "YOUR_API_KEY"
url = "https://newsapi.org/v2/top-headlines"
params = {"country": "in", "apiKey": API_KEY}

try:
    response = requests.get(url, params=params, timeout=10)
    data = response.json()
    print("Top Headlines")
    for article in data["articles"][:5]:
        print("-", article["title"])
except requests.exceptions.RequestException:
    print("Could not fetch the news. Please check your internet connection.")

print("Thank you to everyone who completed this exercise!")`,
        output: `Top Headlines
- Local team wins the final match
- New metro line opens in the city
- Scientists announce a clean energy breakthrough
- Rain expected over the weekend
- Students build a robot that sorts waste
Thank you to everyone who completed this exercise!`,
      },
      {
        type: "para",
        text: "The try block covers the request and the reading of the data. If the internet fails or the server does not answer, requests raises an exception, and the except block prints a clear message. The timeout of 10 seconds stops the program from waiting forever on a slow server. The thank you line sits outside the try block, so it prints whether the news loaded or not.",
      },
      {
        type: "heading",
        text: "A small helper for printing headlines",
      },
      {
        type: "para",
        text: "The printing part works better as its own function. The function takes a list of articles and prints them numbered. Keeping it separate means you can test the printing without the internet, and you can reuse the function for any list of headlines.",
      },
      {
        type: "code",
        title: "The printing helper, runnable without the internet",
        code: `def show_headlines(articles):
    print("Top Headlines")
    for i, article in enumerate(articles, start=1):
        print(f"{i}. {article['title']}")

sample = [
    {"title": "Local team wins the final match"},
    {"title": "New metro line opens in the city"},
]

show_headlines(sample)`,
        output: `Top Headlines
1. Local team wins the final match
2. New metro line opens in the city`,
      },
      {
        type: "list",
        items: [
          "Build the request with the API key and the country code.",
          "Use a timeout so a slow server cannot freeze the program.",
          "Wrap the request in try and except to handle a failed connection.",
          "Print only the first five headlines to keep the output short.",
          "Move the printing into a helper function so it can be tested alone.",
        ],
      },
      {
        type: "note",
        text: "If the API key is wrong or missing, the service returns an error instead of articles. Check the status code and print the message from the response when you debug a failed request.",
      },
      {
        type: "tip",
        text: "Save the headlines to a file at the end of the program, so you can look back at what the news was on any day.",
      },
    ],
    practice: [
      "Run the full solution with your own free API key and check that five headlines print.",
      "Add a category parameter so the app can show technology headlines only.",
      "Change the program so it prints the headline and the source name for each article.",
    ],
    summary: [
      "The News App solution fetches headlines, prints five, and handles errors.",
      "A timeout stops the program waiting forever on a slow server.",
      "The thank you line prints whether the news loaded or not.",
      "A helper function makes the printing easy to test and reuse.",
    ],
  },
  {
    day: 94,
    title: "Exercise 11: Drink Water Reminder",
    intro:
      "This lesson is Exercise 11: build a program that reminds you to drink water at regular intervals. It matters because it turns the time module into a genuinely useful daily tool, and it is the base for the desktop notification system in the next lessons.",
    blocks: [
      {
        type: "heading",
        text: "The problem",
      },
      {
        type: "para",
        text: "The exercise asks for a program that reminds the user to drink water every so often. The program should wait for a fixed time, show a reminder, and then repeat. The waiting is done with time.sleep, and the reminder can be a printed message or a desktop notification that pops up on the screen.",
      },
      {
        type: "code",
        title: "The reminder loop",
        code: `import time

for i in range(3):
    time.sleep(1)
    print("Time to drink a glass of water!")`,
        output: `Time to drink a glass of water!
Time to drink a glass of water!
Time to drink a glass of water!`,
      },
      {
        type: "para",
        text: "This is the heart of the program: a loop that pauses and then prints a reminder. In a real version the pause would be much longer, for example 3600 seconds for one hour, and the loop would run all day. For testing, short pauses of one second let you see the whole program work in seconds instead of hours.",
      },
      {
        type: "heading",
        text: "A real desktop notification",
      },
      {
        type: "para",
        text: "A printed message only works while you are looking at the terminal. A desktop notification pops up on the screen even when the terminal is hidden. The plyer package provides one simple function for this that works on Windows, Mac, and Linux. You install it with pip install plyer.",
      },
      {
        type: "code",
        title: "Expected output when plyer is installed",
        code: `import time
from plyer import notification

for i in range(2):
    time.sleep(1)
    notification.notify(
        title="Drink Water Reminder",
        message="Time to drink a glass of water",
        timeout=5,
    )
    print("Reminder sent")`,
        output: `Reminder sent
Reminder sent`,
      },
      {
        type: "list",
        items: [
          "time.sleep sets the gap between reminders in seconds.",
          "A loop repeats the reminder for as long as the program runs.",
          "notification.notify shows a desktop popup with a title and message.",
          "The timeout value sets how many seconds the popup stays on screen.",
          "Use a short sleep while testing, then change it to an hour for real use.",
        ],
      },
      {
        type: "note",
        text: "A program with time.sleep does nothing while it waits, which is exactly what you want for a reminder. Do not use a busy loop that checks the clock thousands of times a second, because it wastes battery and CPU.",
      },
      {
        type: "tip",
        text: "Test with a 5 second gap first. Once the notifications look right, change the gap to 3600 seconds for a real hourly reminder and let it run in the background.",
      },
    ],
    practice: [
      "Change the reminder loop so it prints the reminder number, like Reminder 1, Reminder 2.",
      "Make the gap between reminders a variable at the top of the program so it is easy to change.",
      "Add a second reminder that tells the user to stretch, alternating with the water reminder.",
    ],
    summary: [
      "The Drink Water Reminder waits with time.sleep, then reminds the user.",
      "A loop repeats the reminder at regular intervals.",
      "Short gaps are for testing; an hour is the real gap.",
      "The plyer package turns a printed message into a desktop notification.",
    ],
  },
  {
    day: 95,
    title: "Regular Expressions",
    intro:
      "This lesson teaches regular expressions, a small pattern language for searching and matching text. They matter because they can find emails, phone numbers, and dates inside messy text in one line, work that would take many lines of plain string code.",
    blocks: [
      {
        type: "heading",
        text: "What is a regular expression?",
      },
      {
        type: "para",
        text: "A regular expression, often shortened to regex, is a pattern that describes what some text looks like. For example, the pattern \\d+ means one or more digits. You write the pattern as a string, and the re module checks your text against it. Patterns can be simple, like a word, or detailed, like the shape of an email address.",
      },
      {
        type: "code",
        title: "Finding all the numbers in a sentence",
        code: `import re

text = "My numbers are 98765 and 43210"
print(re.findall(r"\\d+", text))`,
        output: `['98765', '43210']`,
      },
      {
        type: "para",
        text: "The function re.findall returns a list of every part of the text that matches the pattern. The pattern \\d+ matches a run of digits, so it finds 98765 and 43210 and skips the words. The r before the string makes it a raw string, so Python passes the backslash to the regex engine unchanged.",
      },
      {
        type: "code",
        title: "Checking whether text matches a pattern",
        code: `import re

pattern = r"^[\\w.]+@[\\w]+\\.[a-z]+$"
print(bool(re.match(pattern, "hello@example.com")))
print(bool(re.match(pattern, "not-an-email")))`,
        output: `True
False`,
      },
      {
        type: "para",
        text: "This pattern describes an email address: some word characters, then @, then more word characters, then a dot, then lowercase letters. The ^ at the start and the $ at the end force the whole string to match, not just a part of it. The first string is a valid email, so the result is True. The second is not, so the result is False.",
      },
      {
        type: "code",
        title: "Replacing text that matches a pattern",
        code: `import re

text = "Python is fun. Python is easy."
print(re.sub("Python", "Coding", text))`,
        output: `Coding is fun. Coding is easy.`,
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
      {
        type: "note",
        text: "Always write regex patterns as raw strings, with r before the quotes. Without the r, Python treats backslashes as escapes first, and your pattern can silently change meaning.",
      },
      {
        type: "tip",
        text: "Build a pattern in small steps and test each step with re.findall. A short pattern that works is worth more than a long clever one that almost works.",
      },
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
    day: 96,
    title: "AsyncIO",
    intro:
      "This lesson teaches asyncio, Python's way of writing programs that wait for many things at once without blocking. It matters because waiting for the internet or a file is slow, and asyncio lets your program do other work while it waits.",
    blocks: [
      {
        type: "heading",
        text: "What is asyncio?",
      },
      {
        type: "para",
        text: "A normal program runs one step at a time. When it waits for something, like a web page loading, it just sits there doing nothing. Asyncio lets you mark a function as async, which means it can pause at a wait and let other work run in the meantime. The keyword await marks the exact point where the function pauses.",
      },
      {
        type: "code",
        title: "Your first async program",
        code: `import asyncio

async def task(name):
    await asyncio.sleep(0)
    print(f"{name} finished")

async def main():
    await task("Task A")
    await task("Task B")

asyncio.run(main())`,
        output: `Task A finished
Task B finished`,
      },
      {
        type: "para",
        text: "The def line starts with async, which makes task an async function. Calling it does not run it; it returns a coroutine, a paused piece of work. The await keyword runs the coroutine and waits for it to finish. The function asyncio.run starts the main coroutine and keeps the program alive until it is done.",
      },
      {
        type: "code",
        title: "Running several tasks together with gather",
        code: `import asyncio

async def work(name):
    await asyncio.sleep(0)
    return f"{name} done"

async def main():
    results = await asyncio.gather(work("One"), work("Two"), work("Three"))
    print(results)

asyncio.run(main())`,
        output: `['One done', 'Two done', 'Three done']`,
      },
      {
        type: "para",
        text: "The function asyncio.gather takes several coroutines and runs them together. While one is waiting, another can run, so the total time is the longest single wait instead of the sum of all waits. The results come back in the same order as the tasks were given, which makes gather easy to reason about.",
      },
      {
        type: "list",
        items: [
          "async def defines a function that can pause and resume.",
          "await pauses the function until the waited work finishes.",
          "asyncio.run starts an async program from normal code.",
          "asyncio.sleep pauses without blocking other tasks.",
          "asyncio.gather runs several coroutines at the same time.",
          "A coroutine must be awaited or passed to gather, or it never runs.",
        ],
      },
      {
        type: "note",
        text: "You cannot call await in a normal function, and you cannot call an async function like a normal one. Async code must be started with asyncio.run or awaited from another async function.",
      },
      {
        type: "tip",
        text: "Use asyncio for programs that wait a lot, like fetching many web pages. For heavy number crunching, asyncio does not help, because the work is not waiting, it is computing.",
      },
    ],
    practice: [
      "Write an async function that waits one second and prints Done, then run it with asyncio.run.",
      "Use asyncio.gather to run three waits of one second each and time how long the whole program takes.",
      "Write an async function that fetches the titles of two web pages and prints them.",
    ],
    summary: [
      "Asyncio lets a program wait for many things without blocking.",
      "async def marks a function that can pause; await marks the pause.",
      "asyncio.run starts an async program.",
      "asyncio.gather runs several coroutines together and returns their results in order.",
    ],
  },
  {
    day: 97,
    title: "Multithreading",
    intro:
      "This lesson teaches multithreading, running more than one part of a program at the same time. It matters because programs that wait, like downloading files or reading sensors, can do several waits at once instead of one after another.",
    blocks: [
      {
        type: "heading",
        text: "What is a thread?",
      },
      {
        type: "para",
        text: "A thread is a separate path of execution inside one program. A normal program has one thread, called the main thread, and runs one step at a time. A program with extra threads can run several steps at once. Each thread has its own job, but all threads share the same memory, so they can work on the same data.",
      },
      {
        type: "code",
        title: "Starting a worker thread",
        code: `import threading

def say_hello():
    print("Hello from the worker thread")

thread = threading.Thread(target=say_hello)
thread.start()
thread.join()
print("Hello from the main thread")`,
        output: `Hello from the worker thread
Hello from the main thread`,
      },
      {
        type: "para",
        text: "You create a thread with threading.Thread and tell it which function to run. The start method begins the thread, and it runs at the same time as the main thread. The join method waits until the thread finishes, so the last print only runs after the worker is done. Without join, the main thread could finish and the program could end before the worker printed anything.",
      },
      {
        type: "heading",
        text: "Threads that share data need a lock",
      },
      {
        type: "para",
        text: "Because threads share memory, two threads can try to change the same variable at the same moment and corrupt it. A lock is a simple guard: only one thread can hold it at a time. The code inside a with lock block runs alone, so the shared value stays correct.",
      },
      {
        type: "code",
        title: "Three threads counting safely with a lock",
        code: `import threading

counter = 0
lock = threading.Lock()

def add_one():
    global counter
    for _ in range(1000):
        with lock:
            counter += 1

threads = [threading.Thread(target=add_one) for _ in range(3)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print(counter)`,
        output: `3000`,
      },
      {
        type: "list",
        items: [
          "threading.Thread creates a thread that runs a function.",
          "start begins the thread; join waits for it to finish.",
          "Threads share the same memory, so they can work on the same data.",
          "A Lock makes sure only one thread changes shared data at a time.",
          "Threads are best for work that waits, like network requests.",
          "Threads are not faster for heavy maths, because of the Global Interpreter Lock.",
        ],
      },
      {
        type: "note",
        text: "Python has a Global Interpreter Lock, often called the GIL, which means only one thread runs Python code at a time. Threads still help when the work is waiting, because a waiting thread releases the lock for others.",
      },
      {
        type: "tip",
        text: "Always join your threads before the program ends. A thread that is still running when the main thread finishes can be cut off halfway through its work.",
      },
    ],
    practice: [
      "Start two threads that each print the numbers 1 to 5, and join both before printing Done.",
      "Write a program where three threads add to a shared total without a lock, run it several times, and see if the total is ever wrong.",
      "Use a lock to fix the program above so the total is always correct.",
    ],
    summary: [
      "A thread is a separate path of execution inside one program.",
      "start begins a thread; join waits for it to finish.",
      "Threads share memory, so shared data needs a lock.",
      "Threads help most when the work is waiting, not computing.",
    ],
  },
  {
    day: 98,
    title: "Multiprocessing",
    intro:
      "This lesson teaches multiprocessing, running work in separate processes instead of threads. It matters because processes do not share the Global Interpreter Lock, so they can truly use several CPU cores at once for heavy computing.",
    blocks: [
      {
        type: "heading",
        text: "What is a process?",
      },
      {
        type: "para",
        text: "A process is a running program with its own memory. Threads live inside one process and share its memory, but processes are separate and each has its own memory space. That separation is the key difference: a process can run Python code on its own CPU core without waiting for the Global Interpreter Lock, so several processes can genuinely work in parallel.",
      },
      {
        type: "code",
        title: "Starting a worker process",
        code: `from multiprocessing import Process

def worker(name):
    print(f"Hello from {name}")

if __name__ == "__main__":
    p = Process(target=worker, args=("Process 1",))
    p.start()
    p.join()
    print("Main process finished")`,
        output: `Hello from Process 1
Main process finished`,
      },
      {
        type: "para",
        text: "The code looks like threading, but Process creates a whole new process. The start method begins it, and join waits for it to finish, just like a thread. The if __name__ == \"__main__\" guard is important: on some systems a new process re-imports the program, and without the guard it would start new processes forever.",
      },
      {
        type: "heading",
        text: "Sharing work with a pool",
      },
      {
        type: "para",
        text: "A pool is a group of worker processes that share a list of jobs. You hand the pool a function and a list of inputs, and it splits the work between the processes. The map method works like the built-in map, but the work happens in parallel, and the results come back in the same order as the inputs.",
      },
      {
        type: "code",
        title: "Squaring numbers with a pool of two processes",
        code: `from multiprocessing import Pool

def square(n):
    return n * n

if __name__ == "__main__":
    with Pool(2) as pool:
        print(pool.map(square, [1, 2, 3, 4]))`,
        output: `[1, 4, 9, 16]`,
      },
      {
        type: "list",
        items: [
          "A process has its own memory; threads share one process memory.",
          "Processes can use several CPU cores at the same time.",
          "Use multiprocessing for heavy computing, like maths on big data.",
          "Use threading for work that waits, like network requests.",
          "Always guard process code with if __name__ == \"__main__\".",
          "A Pool splits a list of jobs across several worker processes.",
        ],
      },
      {
        type: "note",
        text: "Starting a process is slower and heavier than starting a thread, because the system must set up a whole new memory space. Do not use processes for tiny jobs; use them when each job is big enough to be worth the cost.",
      },
      {
        type: "tip",
        text: "A good rule of thumb: if the job is waiting, use threads or asyncio. If the job is computing, use processes. If you are not sure, measure both and pick the faster one.",
      },
    ],
    practice: [
      "Write a program that uses two processes to print a message each, and join both before printing Done.",
      "Use a Pool to square the numbers from 1 to 10 in parallel and print the list.",
      "Time a slow function with a loop, then with a Pool, and compare the two times.",
    ],
    summary: [
      "A process is a running program with its own memory.",
      "Processes can use several CPU cores at once, unlike threads.",
      "Use processes for heavy computing and threads for waiting.",
      "Always guard process code with if __name__ == \"__main__\".",
    ],
  },
  {
    day: 99,
    title: "Exercise 11 Solution: Desktop Notifications",
    intro:
      "This lesson is the full solution to Exercise 11, the Drink Water Reminder as a complete desktop notification system. It matters because it turns the simple reminder loop into a real program you can run every day, with notifications and a log of every reminder.",
    blocks: [
      {
        type: "heading",
        text: "The complete solution",
      },
      {
        type: "para",
        text: "The solution combines everything from the exercise: a loop, a pause with time.sleep, and a desktop notification from the plyer package. It also prints a thank you line at the end, a shoutout to everyone who completed the exercise. For testing, the pause is one second; in real use you would change it to 3600 seconds for an hourly reminder.",
      },
      {
        type: "code",
        title: "Expected output: the full notification system",
        code: `import time
from plyer import notification

for i in range(2):
    time.sleep(1)
    notification.notify(
        title="Drink Water Reminder",
        message="Time to drink a glass of water",
        timeout=5,
    )
    print("Reminder sent")

print("Thank you to everyone who completed this exercise!")`,
        output: `Reminder sent
Reminder sent
Thank you to everyone who completed this exercise!`,
      },
      {
        type: "para",
        text: "Each time the loop runs, the program waits one second, shows a notification with a title and a message, and prints Reminder sent so you can see it worked. The timeout of 5 means the popup stays on screen for five seconds. The thank you line prints after the loop, so it only appears when the program has finished all its reminders.",
      },
      {
        type: "heading",
        text: "Keeping a log of every reminder",
      },
      {
        type: "para",
        text: "A useful addition is a log file. Every time a reminder is sent, the program writes one line to a file called water_log.txt. Over a day, the file becomes a record of how many reminders you got. Reading the file back at the end proves the log worked.",
      },
      {
        type: "code",
        title: "Reminders with a log file",
        code: `import time

with open("water_log.txt", "w") as log:
    for i in range(2):
        time.sleep(1)
        log.write("Drank a glass of water\\n")
        print("Reminder sent and logged")

with open("water_log.txt") as log:
    print(log.read(), end="")`,
        output: `Reminder sent and logged
Reminder sent and logged
Drank a glass of water
Drank a glass of water`,
      },
      {
        type: "list",
        items: [
          "time.sleep sets the gap between reminders in seconds.",
          "notification.notify shows a desktop popup with a title and message.",
          "The loop repeats the reminder for as long as the program runs.",
          "Writing each reminder to a log file keeps a record of the day.",
          "Test with a one second gap, then change it to 3600 for real use.",
        ],
      },
      {
        type: "note",
        text: "Install plyer first with pip install plyer. If the package is missing, the import line fails, so test the notification part on its own before you leave the program running all day.",
      },
      {
        type: "tip",
        text: "Run the finished program in the background when you start work, and let it remind you all day. Small tools like this are the best way to turn a lesson into a daily habit.",
      },
    ],
    practice: [
      "Run the full solution with a one second gap and check that two notifications appear.",
      "Add the current time to each line in the log file, using the time module from Day 84.",
      "Change the program so it stops after 8 reminders, which is a full working day of hourly reminders.",
    ],
    summary: [
      "Exercise 11 is a reminder loop with time.sleep and desktop notifications.",
      "The plyer package shows the notification on screen.",
      "A log file records every reminder the program sent.",
      "Test with short gaps, then switch to an hourly gap for real use.",
    ],
  },
  {
    day: 100,
    title: "Conclusion and Next Steps",
    intro:
      "This is the last lesson of the 100 day course. It looks back at everything you have learned, from your first print to threads and processes, and it shows you where to go next so the learning does not stop here.",
    blocks: [
      {
        type: "heading",
        text: "What you have learned",
      },
      {
        type: "para",
        text: "Over 100 days you went from writing your first line of Python to building real programs. You learned variables, strings, lists, and dictionaries, then loops, functions, and file handling. You learned object oriented programming, error handling, and modules, and you finished with the advanced tools: generators, caching, regular expressions, asyncio, threads, and processes. You also built real projects along the way, like the News App and the Drink Water Reminder.",
      },
      {
        type: "code",
        title: "A checklist of your new skills",
        code: `skills = ["Variables", "Loops", "Functions", "OOP", "File handling", "Modules"]
print("You have learned:")
for i, skill in enumerate(skills, start=1):
    print(f"{i}. {skill}")`,
        output: `You have learned:
1. Variables
2. Loops
3. Functions
4. OOP
5. File handling
6. Modules`,
      },
      {
        type: "heading",
        text: "Where to go from here",
      },
      {
        type: "para",
        text: "Finishing a course is not the end of learning; it is the start of building. The best next step is to build projects of your own, because projects force you to combine everything you learned and to solve problems no lesson can predict. Pick something small, finish it, and then pick something bigger.",
      },
      {
        type: "list",
        items: [
          "Build a personal project, like a budget tracker, a quiz game, or a to-do app.",
          "Learn a web framework such as Flask or Django and put a project on the internet.",
          "Learn data skills with pandas and matplotlib, and analyse a real dataset.",
          "Try automation: write scripts that rename files, send emails, or scrape a website.",
          "Practise on coding challenge sites for 20 minutes a day to keep your skills sharp.",
          "Read other people's code on GitHub and contribute a small fix to an open source project.",
        ],
      },
      {
        type: "code",
        title: "A tiny quiz to test yourself",
        code: `score = 0
answer = input("What is 2 + 2? ")
if answer == "4":
    score += 1
    print("Correct!")
else:
    print("Not quite. The answer is 4.")
print(f"Your score is {score}/1")`,
        output: `What is 2 + 2? 4
Correct!
Your score is 1/1`,
      },
      {
        type: "para",
        text: "In the output above, 4 is the value typed by the user at the input prompt. A program like this tiny quiz is a good seed for a bigger project: add more questions, keep score in a file, and you have a quiz app. That is how real projects grow, one small working version at a time.",
      },
      {
        type: "note",
        text: "Do not try to learn everything at once. Pick one direction, web development, data, or automation, and go deep on it for a few months before adding another.",
      },
      {
        type: "tip",
        text: "Keep coding every day, even if it is only for fifteen minutes. A short daily habit beats a long session once a month, and it is how you keep what these 100 days taught you.",
      },
    ],
    practice: [
      "Write down three project ideas you would enjoy building, and pick the smallest one to start this week.",
      "Rebuild the News App from memory, without looking at the Day 93 solution, and compare the two versions.",
      "Teach one Python concept from this course to a friend. Explaining it will show you what you truly understand.",
    ],
    summary: [
      "You have covered Python from print to threads, processes, and async code.",
      "The next step is building your own projects, not watching more lessons.",
      "Pick one direction, web, data, or automation, and go deep on it.",
      "Keep coding a little every day to keep your skills sharp.",
    ],
  },
];
