import type { LessonTutorial } from "./types";

export const TUTORIALS: LessonTutorial[] = [
  {
    day: 40,
    title: "Secret Code Language",
    intro: "In this lesson you build a secret code language that can code and decode messages. It is a fun exercise that pulls together strings, loops, conditions and random letters.",
    blocks: [
      {
        type: "heading",
        text: "What is the secret code?",
      },
      {
        type: "para",
        text: "The idea is simple. You take a normal message and turn each word into a coded word, so only someone who knows the rules can read it. The coding rules depend on the length of the word, and decoding just reverses those rules.",
      },
      {
        type: "list",
        items: [
          "If a word has 3 or more letters, move its first letter to the end, then add one random letter at the start and one random letter at the end.",
          "If a word has fewer than 3 letters, just reverse it.",
          "To decode, remove the two added letters and move the last letter back to the front, or reverse short words again.",
        ],
      },
      {
        type: "heading",
        text: "Coding a message",
      },
      {
        type: "para",
        text: "The encoder handles one word at a time. Short words are reversed with a slice. Longer words are rebuilt from their parts: a random letter, the word without its first letter, the first letter, and another random letter. Setting a seed makes the random letters the same every time you run the code, which is handy while you test.",
      },
      {
        type: "code",
        title: "Encoding a sentence",
        code: `import random
import string

def encode_word(word):
    if len(word) < 3:
        return word[::-1]
    start = random.choice(string.ascii_lowercase)
    end = random.choice(string.ascii_lowercase)
    return start + word[1:] + word[0] + end

def encode(message):
    random.seed(42)
    coded = [encode_word(word) for word in message.split()]
    return " ".join(coded)

print(encode("hello my name is harry"))`,
        output: "uellohd ym aamenx si iarryhh\n",
      },
      {
        type: "heading",
        text: "Decoding a message",
      },
      {
        type: "para",
        text: "Decoding is the mirror image of coding. For a long coded word, drop the first and last letters, then move the last letter of what is left to the front. For a short word, reverse it again, because reversing twice gives back the original word.",
      },
      {
        type: "code",
        title: "Decoding the same sentence",
        code: `def decode_word(word):
    if len(word) < 3:
        return word[::-1]
    core = word[1:-1]
    return core[-1] + core[:-1]

def decode(message):
    return " ".join(decode_word(word) for word in message.split())

print(decode("uellohd ym aamenx si iarryhh"))`,
        output: "hello my name is harry\n",
      },
      {
        type: "note",
        text: "The decoder only works if the coder and the decoder agree on the rules. The two random letters are thrown away during decoding, so they can be any letters at all.",
      },
    ],
    practice: [
      "Code the sentence 'python is fun to learn' with the encoder, then decode it back to check your work.",
      "Change the encoder so it asks the user for a message with input instead of using a fixed sentence.",
      "Add a choice at the start: type 1 to code a message and 2 to decode one.",
    ],
    summary: [
      "Words with 3 or more letters move their first letter to the end and gain two random letters.",
      "Words shorter than 3 letters are simply reversed.",
      "Decoding strips the added letters and moves the last letter back to the front.",
      "random.seed makes the random letters repeatable while you test.",
    ],
  },
  {
    day: 41,
    title: "Shorthand If Else",
    intro: "In this lesson you learn the short form of if else, also called the ternary operator. It lets you write a simple either-or choice in a single line.",
    blocks: [
      {
        type: "heading",
        text: "The one-line if else",
      },
      {
        type: "para",
        text: "A normal if else takes four lines for a simple choice. The shorthand form puts the value, the condition and the other value on one line: value if condition else other value. Python checks the condition and picks the value that matches.",
      },
      {
        type: "code",
        title: "Basic shorthand if else",
        code: `age = 18
print("Adult" if age >= 18 else "Minor")

marks = 85
print("A" if marks >= 90 else "B" if marks >= 80 else "C")

x = 10
print(x * 2 if x > 5 else x)`,
        output: "Adult\nB\n20\n",
      },
      {
        type: "heading",
        text: "Chaining conditions",
      },
      {
        type: "para",
        text: "You can chain two shorthand forms together to handle three outcomes, as the marks example shows. Read it from left to right: if marks are 90 or more, the grade is A, otherwise check whether they are 80 or more, and if not, the grade is C. Chains longer than this get hard to read, so stop at two or three outcomes.",
      },
      {
        type: "note",
        text: "A shorthand if else always needs both parts. Writing value if condition with no else is a syntax error, because Python would not know what to use when the condition is false.",
      },
      {
        type: "heading",
        text: "Shorthand inside other code",
      },
      {
        type: "para",
        text: "The shorthand form is an expression, so it can sit anywhere a value can sit: inside a print, on the right side of an assignment, or inside a list comprehension. This is where it is most useful, because a full if else block would not fit there.",
      },
      {
        type: "code",
        title: "Shorthand in a list and an assignment",
        code: `numbers = [1, 2, 3, 4, 5]
labels = ["even" if n % 2 == 0 else "odd" for n in numbers]
print(labels)

price = 100
discount = 20 if price > 50 else 0
print(price - discount)`,
        output: "['odd', 'even', 'odd', 'even', 'odd']\n80\n",
      },
      {
        type: "tip",
        text: "Use shorthand only when the choice is simple. If either branch needs more than one step, or the line gets long, write a normal if else block instead.",
      },
    ],
    practice: [
      "Ask the user for a number and print 'even' or 'odd' with a single shorthand line.",
      "Give a 10 percent discount with shorthand when a bill is above 500, and no discount otherwise.",
      "Build a list of 'pass' and 'fail' labels from a list of marks, using shorthand inside a list comprehension.",
    ],
    summary: [
      "Shorthand if else has the form value if condition else other value.",
      "It is an expression, so it can be used inside print, assignments and comprehensions.",
      "Conditions can be chained for three outcomes, but longer chains hurt readability.",
      "Every shorthand if else must have an else part.",
    ],
  },
  {
    day: 42,
    title: "Enumerate Function",
    intro: "In this lesson you learn enumerate, a built-in function that gives you both the position and the value while you loop over a list. It replaces manual counters and makes loops cleaner.",
    blocks: [
      {
        type: "heading",
        text: "Why counting by hand is awkward",
      },
      {
        type: "para",
        text: "When you loop over a list, you often also need to know which item you are on: the first, the second, and so on. Without help, you keep a counter variable, remember to start it at zero, and remember to add one each time round the loop. Forgetting any of those steps gives a wrong count.",
      },
      {
        type: "code",
        title: "Looping with enumerate",
        code: `fruits = ["apple", "banana", "cherry"]

for i, fruit in enumerate(fruits):
    print(i, fruit)

for i, fruit in enumerate(fruits, start=1):
    print(i, fruit)`,
        output: "0 apple\n1 banana\n2 cherry\n1 apple\n2 banana\n3 cherry\n",
      },
      {
        type: "heading",
        text: "How enumerate works",
      },
      {
        type: "para",
        text: "Enumerate wraps any sequence and hands you pairs of (index, value) on each round of the loop. Counting starts at 0 by default, which matches how list positions work in Python. Pass start=1 when you want human-style counting that begins at 1, for example when printing a numbered list for a user.",
      },
      {
        type: "list",
        items: [
          "enumerate works on lists, tuples, strings and any other sequence.",
          "The loop needs two variables, one for the index and one for the value.",
          "The start value only changes the counting, never the order of the items.",
        ],
      },
      {
        type: "heading",
        text: "Using the index in a condition",
      },
      {
        type: "para",
        text: "The index is most useful when you need to act on some items and skip others. In this example, only scores of 75 or more are printed, together with their position in the list, so you can see exactly which students passed.",
      },
      {
        type: "code",
        title: "Filtering with the index",
        code: `scores = [45, 78, 92, 61]

for i, s in enumerate(scores):
    if s >= 75:
        print(i, s, "Pass")`,
        output: "1 78 Pass\n2 92 Pass\n",
      },
      {
        type: "tip",
        text: "Reach for enumerate whenever you catch yourself writing i = 0 before a loop and i += 1 inside it. It does the same job with less code and no chance of forgetting the increment.",
      },
    ],
    practice: [
      "Print a shopping list with numbers starting at 1, using enumerate with start=1.",
      "Use enumerate to print only the items at even positions of a list.",
      "Loop over a string with enumerate and print each character with its position.",
    ],
    summary: [
      "enumerate gives (index, value) pairs while looping over a sequence.",
      "Counting starts at 0 by default and can be changed with start.",
      "It replaces manual counter variables in loops.",
      "The index lets you filter or label items by their position.",
    ],
  },
  {
    day: 43,
    title: "Virtual Environments",
    intro: "In this lesson you learn virtual environments, the standard way to keep each Python project and its packages separate. They stop one project from breaking another.",
    blocks: [
      {
        type: "heading",
        text: "Why projects need their own space",
      },
      {
        type: "para",
        text: "Every Python project needs packages, and different projects often need different versions of the same package. If you install everything into one shared Python, the versions clash: upgrading a package for one project can break another. A virtual environment gives each project its own private copy of Python and its own package folder.",
      },
      {
        type: "list",
        items: [
          "Each project gets its own packages, so versions never clash.",
          "You can delete a project and its environment together, leaving nothing behind.",
          "Other people can recreate your exact setup from a list of packages.",
        ],
      },
      {
        type: "heading",
        text: "Creating an environment",
      },
      {
        type: "para",
        text: "Python ships with a built-in module called venv, so you need nothing extra. Run python -m venv myenv in your project folder to create an environment named myenv. Then activate it: on Windows run myenv Scripts activate, and on Mac or Linux run source myenv/bin/activate. Your terminal prompt changes to show the environment name, and from then on pip installs go into that environment only. Run deactivate when you are done.",
      },
      {
        type: "code",
        title: "The venv module is built in",
        code: `import venv

print(venv.__name__)
print(hasattr(venv, "create"))`,
        output: "venv\nTrue\n",
      },
      {
        type: "heading",
        text: "Creating one from Python code",
      },
      {
        type: "para",
        text: "You can also create an environment from inside a Python program with venv.create. The folder it makes holds the Python executable, a lib folder for packages, and a pyvenv.cfg file that records which Python it was built from. The with_pip=False option skips installing pip, which makes creation faster when you only want to check the layout.",
      },
      {
        type: "code",
        title: "Creating an environment in code",
        code: `import os
import venv

venv.create("myenv", with_pip=False)
print(os.path.isdir("myenv"))
print(os.path.isfile("myenv/pyvenv.cfg"))`,
        output: "True\nTrue\n",
      },
      {
        type: "note",
        text: "Never commit the environment folder to git. It is large and machine-specific. Commit a requirements file instead, made with pip freeze, so others can rebuild the same environment.",
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
  {
    day: 44,
    title: "How Import Works",
    intro: "In this lesson you learn how import works in Python: where it looks for modules, what happens the first time a module is imported, and the different ways to bring code in.",
    blocks: [
      {
        type: "heading",
        text: "What import does",
      },
      {
        type: "para",
        text: "When you write import math, Python finds the math module, runs its code once, and stores the result in a cache so later imports reuse it instead of running it again. You then reach its functions through the module name, like math.sqrt. The module is only loaded the first time; importing it again in another file costs almost nothing.",
      },
      {
        type: "code",
        title: "Importing the math module",
        code: `import math

print(math.pi)
print(math.sqrt(16))
print(math.factorial(5))`,
        output: "3.141592653589793\n4.0\n120\n",
      },
      {
        type: "heading",
        text: "Where Python looks",
      },
      {
        type: "para",
        text: "Python searches for a module in a list of places called sys.path: first the folder of the script you are running, then the folders listed in the PYTHONPATH environment variable, then the standard library, then the folders where pip installs packages. A module in your own script folder is found first, which is why your own files can be imported by name.",
      },
      {
        type: "list",
        items: [
          "The script folder is searched first, so your own modules win over same-named ones.",
          "The standard library comes next, then pip-installed packages.",
          "A module is loaded once and cached in sys.modules for the rest of the run.",
        ],
      },
      {
        type: "heading",
        text: "Other ways to import",
      },
      {
        type: "para",
        text: "The from form pulls out just the names you need, so you can call sqrt directly without the math prefix. The as form gives a module a shorter nickname, which is handy for long names. Use plain import for clarity, from for one or two names you use a lot, and avoid importing everything with a star, because it hides where names came from.",
      },
      {
        type: "code",
        title: "From imports and nicknames",
        code: `from math import sqrt, factorial
import math as m

print(sqrt(25))
print(factorial(4))
print(m.ceil(4.2))`,
        output: "5.0\n24\n5\n",
      },
      {
        type: "note",
        text: "Naming your own file math.py is a classic trap. Your file is found first, so import math loads your file instead of the real module, and math.sqrt suddenly does not exist.",
      },
    ],
    practice: [
      "Import the random module and print a random integer between 1 and 10, then check that importing it twice still works.",
      "Write a small module named helper.py with one function, then import and call it from another file in the same folder.",
      "Print sys.path and find the folder where your own script lives in the list.",
    ],
    summary: [
      "import finds a module, runs it once, and caches it in sys.modules.",
      "Python searches the script folder, then the standard library, then pip packages.",
      "from imports single names, and as gives a module a short nickname.",
      "Never name your own file after a standard library module.",
    ],
  },
  {
    day: 45,
    title: "if __name__ == \"__main__\"",
    intro: "In this lesson you learn the most common line in Python programs: the check that runs code only when a file is run directly, and skips it when the file is imported.",
    blocks: [
      {
        type: "heading",
        text: "Every file has a name",
      },
      {
        type: "para",
        text: "Python sets a special variable called __name__ in every file it runs. When you run a file directly, __name__ is the string __main__. When another file imports it, __name__ becomes the module name instead. That one difference lets a file behave differently in the two situations.",
      },
      {
        type: "code",
        title: "Code that only runs directly",
        code: `def greet():
    print("Hello from greet")

if __name__ == "__main__":
    print("Running directly")
    greet()`,
        output: "Running directly\nHello from greet\n",
      },
      {
        type: "heading",
        text: "Why the check matters",
      },
      {
        type: "para",
        text: "A module usually has two jobs: it defines functions for others to use, and it has a small test or demo at the bottom for its own author. Without the check, importing the module would run the demo too, printing output and doing work the importer never asked for. With the check, the demo only runs when you run the file on its own.",
      },
      {
        type: "list",
        items: [
          "Put function and class definitions at the top, outside the check.",
          "Put the runnable demo, the main logic and the input handling inside the check.",
          "A file without the check is still importable, but importing it runs everything in it.",
        ],
      },
      {
        type: "heading",
        text: "Seeing it in action",
      },
      {
        type: "para",
        text: "This example writes a helper file and then imports it. The helper prints a message when it loads, but its direct-run message never appears, because during an import its __name__ is helper, not __main__. Back in the main file, __name__ is __main__, as expected.",
      },
      {
        type: "code",
        title: "Importing skips the guarded code",
        code: `with open("helper.py", "w") as f:
    f.write("print('Helper loaded')\\n")
    f.write("if __name__ == '__main__':\\n")
    f.write("    print('Running helper directly')\\n")

import helper
print("Back in main file")
print(__name__)`,
        output: "Helper loaded\nBack in main file\n__main__\n",
      },
      {
        type: "note",
        text: "The check compares against the exact string __main__, with two underscores on each side. A single underscore, or the word main without underscores, will never match.",
      },
    ],
    practice: [
      "Write a file that defines a function and prints a demo message inside the name check, then run it directly and import it to see the difference.",
      "Add the name check to a script you wrote earlier so importing it runs nothing.",
      "Print __name__ at the top of a module, import the module, and confirm it shows the module name.",
    ],
    summary: [
      "__name__ is __main__ when a file runs directly, and the module name when imported.",
      "The check keeps demo and startup code from running on import.",
      "Definitions go outside the check, runnable code goes inside it.",
      "The string is __main__ with two underscores on each side.",
    ],
  },
  {
    day: 46,
    title: "os Module",
    intro: "In this lesson you learn the os module, the standard library tool for talking to the operating system: working with file paths, checking files, and creating folders.",
    blocks: [
      {
        type: "heading",
        text: "Paths without guessing",
      },
      {
        type: "para",
        text: "File paths look different on each system: Windows uses backslashes and drive letters, while Mac and Linux use forward slashes. Building paths by joining strings by hand breaks when the code moves to another system. The os.path functions build and split paths the right way for whatever system the code runs on.",
      },
      {
        type: "code",
        title: "Splitting and joining paths",
        code: `import os

print(os.path.basename("/home/user/docs/report.txt"))
print(os.path.dirname("/home/user/docs/report.txt"))
print(os.path.splitext("photo.jpg"))
print(os.path.join("folder", "sub", "file.txt"))`,
        output: "report.txt\n/home/user/docs\n('photo', '.jpg')\nfolder/sub/file.txt\n",
      },
      {
        type: "heading",
        text: "What each function does",
      },
      {
        type: "para",
        text: "Basename returns the last part of a path, the file name itself. Dirname returns everything before it, the folder that holds the file. Splitext splits a file name into the name and its extension, which is handy when you want to change an extension or check a file type. Join glues parts together with the correct separator for the system.",
      },
      {
        type: "list",
        items: [
          "os.path.basename gives the file name from a full path.",
          "os.path.dirname gives the folder part of a full path.",
          "os.path.splitext splits a name into the stem and the extension.",
          "os.path.join builds a path that works on the current system.",
        ],
      },
      {
        type: "heading",
        text: "Checking and creating",
      },
      {
        type: "para",
        text: "Before you open a file, you can ask whether it exists with os.path.exists, so your program can give a clear message instead of crashing. The os.makedirs function creates a folder, and exist_ok=True means it will not complain if the folder is already there. Always check before you assume a file or folder is present.",
      },
      {
        type: "code",
        title: "Checking files and making a folder",
        code: `import os

with open("notes.txt", "w") as f:
    f.write("Hello Python\\n")

print(os.path.exists("notes.txt"))
print(os.path.exists("missing.txt"))
os.makedirs("data", exist_ok=True)
print(os.path.isdir("data"))`,
        output: "True\nFalse\nTrue\n",
      },
      {
        type: "note",
        text: "The path join example prints forward slashes on Mac and Linux, but backslashes on Windows. That is the point: the same code produces the right path on each system.",
      },
    ],
    practice: [
      "Use os.path.splitext on five file names and print only the extensions.",
      "Build a path to a file inside a subfolder with os.path.join and check it with os.path.exists.",
      "Create a folder named backup with os.makedirs and confirm it with os.path.isdir.",
    ],
    summary: [
      "os.path handles file paths in a way that works on every system.",
      "basename, dirname and splitext split a path into useful pieces.",
      "os.path.join builds paths with the correct separator.",
      "os.path.exists and os.makedirs check and create files and folders safely.",
    ],
  },
  {
    day: 47,
    title: "Secret Code Solutions",
    intro: "In this lesson you walk through the full solution to the Secret Code Language exercise from Day 40, step by step, and turn it into a small program that codes or decodes any message.",
    blocks: [
      {
        type: "heading",
        text: "The plan, restated",
      },
      {
        type: "para",
        text: "The exercise has two halves. Coding turns a plain message into secret text, and decoding turns secret text back into the plain message. Both halves work word by word, because the rules depend on each word on its own. A sentence is split into words, each word is coded or decoded, and the results are joined back with spaces.",
      },
      {
        type: "heading",
        text: "The complete solution",
      },
      {
        type: "para",
        text: "Here are both halves together, with a seed so the random letters are the same on every run. The encoder adds two random letters to long words and reverses short ones. The decoder strips those letters and moves the last letter home. Coding hello world and then decoding the result gives back exactly hello world, which proves the two halves match.",
      },
      {
        type: "code",
        title: "Encoder and decoder together",
        code: `import random
import string

def encode_word(word):
    if len(word) < 3:
        return word[::-1]
    start = random.choice(string.ascii_lowercase)
    end = random.choice(string.ascii_lowercase)
    return start + word[1:] + word[0] + end

def decode_word(word):
    if len(word) < 3:
        return word[::-1]
    core = word[1:-1]
    return core[-1] + core[:-1]

random.seed(42)
message = "hello world"
coded = " ".join(encode_word(w) for w in message.split())
print(coded)
print(" ".join(decode_word(w) for w in coded.split()))`,
        output: "uellohd aorldwx\nhello world\n",
      },
      {
        type: "heading",
        text: "Letting the user type a word",
      },
      {
        type: "para",
        text: "A real program takes its input from the user instead of a fixed sentence. This short version codes a single word typed at the prompt. The seed is set before the random choices, so typing hello always produces the same coded word while you test.",
      },
      {
        type: "code",
        title: "Coding a word from the user",
        code: `import random
import string

random.seed(42)
word = input("Enter a word to code: ")
if len(word) < 3:
    print(word[::-1])
else:
    start = random.choice(string.ascii_lowercase)
    end = random.choice(string.ascii_lowercase)
    print(start + word[1:] + word[0] + end)`,
        output: "Enter a word to code: hello\nuellohd\n",
      },
      {
        type: "note",
        text: "The most common bug is an off-by-one error in the decoder: removing one letter instead of two, or moving the wrong letter to the front. Always test with a round trip: code, then decode, and compare with the original.",
      },
      {
        type: "tip",
        text: "When a program has two halves that must match, test them as a pair. A coder that works alone can still be wrong if the decoder expects a different rule.",
      },
    ],
    practice: [
      "Turn the solution into a program that asks for 1 to code or 2 to decode, then reads the message and prints the result.",
      "Code a five-word sentence, decode it, and confirm you get the exact original back.",
      "Change the encoder to add two random letters at each end instead of one, and update the decoder to match.",
    ],
    summary: [
      "Coding and decoding both work word by word, then join the results.",
      "The decoder strips the two added letters and moves the last letter to the front.",
      "A round trip test proves the two halves agree with each other.",
      "input lets the user supply the message instead of a fixed sentence.",
    ],
  },
  {
    day: 48,
    title: "Local vs Global Variables",
    intro: "In this lesson you learn the difference between local and global variables: where each one can be used, and how the global keyword lets a function change a variable outside itself.",
    blocks: [
      {
        type: "heading",
        text: "Two kinds of variable",
      },
      {
        type: "para",
        text: "A global variable is created outside any function, at the top level of a file, and every function in that file can read it. A local variable is created inside a function, and it exists only while that function runs. Once the function finishes, the local variable is gone.",
      },
      {
        type: "code",
        title: "Same name, two variables",
        code: `x = 10

def show():
    x = 5
    print("Inside:", x)

show()
print("Outside:", x)`,
        output: "Inside: 5\nOutside: 10\n",
      },
      {
        type: "heading",
        text: "Why the outside value did not change",
      },
      {
        type: "para",
        text: "Inside show, the line x = 5 creates a brand new local variable that happens to share the name x. It hides the global x for the rest of the function, but it never touches it. When the function ends, the local x disappears and the global x is still 10. Same name, two separate variables.",
      },
      {
        type: "note",
        text: "Reading a global variable inside a function is fine and needs no keyword. The problem only starts when you assign to it, because assignment inside a function creates a local variable by default.",
      },
      {
        type: "heading",
        text: "Changing a global from inside a function",
      },
      {
        type: "para",
        text: "When a function really must update a global, say so with the global keyword at the top of the function. After that line, assignments to the name refer to the global variable instead of creating a local one. Here a counter grows by one each time add runs, because both calls update the same global count.",
      },
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
        output: "1\n2\n",
      },
      {
        type: "tip",
        text: "Prefer returning a value from a function over changing a global. Globals shared between functions are easy to break by accident, while a returned value is explicit and easy to test.",
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
    ],
  },
  {
    day: 49,
    title: "File IO",
    intro: "In this lesson you learn file input and output: how to write text to a file and read it back, so your programs can save work and load it again later.",
    blocks: [
      {
        type: "heading",
        text: "Why programs use files",
      },
      {
        type: "para",
        text: "Variables forget everything when a program ends. Files are how programs remember: notes, scores, settings and logs all live in files between runs. Python opens a file, reads or writes through it, and closes it when done. The with statement handles the closing for you, even if something goes wrong in the middle.",
      },
      {
        type: "code",
        title: "Writing and reading a file",
        code: `with open("notes.txt", "w") as f:
    f.write("Hello Python\\n")
    f.write("File handling is easy\\n")

with open("notes.txt") as f:
    print(f.read())`,
        output: "Hello Python\nFile handling is easy\n\n",
      },
      {
        type: "heading",
        text: "The open modes",
      },
      {
        type: "para",
        text: "The second argument to open is the mode. The mode w writes a file and erases anything already in it, so use it only when you mean to start fresh. The mode r reads a file and is the default when you leave the mode out. The mode a appends, adding new text at the end without touching what is already there.",
      },
      {
        type: "list",
        items: [
          "r reads a file. The file must already exist, or open raises an error.",
          "w writes a file. It creates the file if needed and erases old content.",
          "a appends to a file. It creates the file if needed and keeps old content.",
        ],
      },
      {
        type: "heading",
        text: "Appending to a file",
      },
      {
        type: "para",
        text: "This example writes one line, then reopens the same file in append mode to add a second line. Reading it back shows both lines, because append mode kept the first line instead of erasing it. Notice the final blank line in the output: the text already ends with a newline, and print adds one more.",
      },
      {
        type: "code",
        title: "Adding lines without erasing",
        code: `with open("diary.txt", "w") as f:
    f.write("Day 1: Started Python\\n")

with open("diary.txt", "a") as f:
    f.write("Day 2: Learned files\\n")

with open("diary.txt") as f:
    print(f.read())`,
        output: "Day 1: Started Python\nDay 2: Learned files\n\n",
      },
      {
        type: "note",
        text: "Opening a file with w erases it at once, before you write anything. Double-check the file name and the mode before you run code that opens with w.",
      },
    ],
    practice: [
      "Write your name and age to a file named me.txt, then read it back and print it.",
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
    day: 50,
    title: "read, readlines and More",
    intro: "In this lesson you learn the methods for reading a file: read for the whole file at once, readline for one line at a time, and readlines for a list of lines.",
    blocks: [
      {
        type: "heading",
        text: "Three ways to read",
      },
      {
        type: "para",
        text: "Python gives you three reading methods because different jobs need different shapes of data. The read method returns the whole file as one string. The readline method returns a single line each time you call it, and returns an empty string when the file ends. The readlines method returns a list with one string per line.",
      },
      {
        type: "code",
        title: "Reading one line at a time",
        code: `with open("notes.txt", "w") as f:
    f.write("Hello Python\\n")
    f.write("File handling is easy\\n")
    f.write("Third line here\\n")

with open("notes.txt") as f:
    print(f.readline())
    print(f.readline())`,
        output: "Hello Python\n\nFile handling is easy\n\n",
      },
      {
        type: "heading",
        text: "Reading all lines as a list",
      },
      {
        type: "para",
        text: "The readlines method is handy when you want to loop over lines or pick one by position, because a list supports indexing and loops. Each line in the list keeps its newline character at the end, which is why the printed list shows the newline markers. The read method with a number, like read(5), reads only that many characters instead of the whole file.",
      },
      {
        type: "code",
        title: "readlines and reading a few characters",
        code: `with open("notes.txt", "w") as f:
    f.write("Hello Python\\n")
    f.write("File handling is easy\\n")
    f.write("Third line here\\n")

with open("notes.txt") as f:
    print(f.readlines())

with open("notes.txt") as f:
    print(f.read(5))`,
        output: "['Hello Python\\n', 'File handling is easy\\n', 'Third line here\\n']\nHello\n",
      },
      {
        type: "note",
        text: "Every line returned by readline or readlines ends with a newline character, except possibly the last line of the file. Strip it with line.strip when you want the clean text.",
      },
      {
        type: "tip",
        text: "For most jobs, loop over the file object directly instead of readlines: for line in f reads one line at a time and uses far less memory on large files.",
      },
    ],
    practice: [
      "Write five lines to a file, then use readline in a loop to print each line with its line number.",
      "Use readlines to load a file into a list and print only the third line.",
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
    day: 51,
    title: "seek, tell and More",
    intro: "In this lesson you learn seek and tell, the methods that move the reading position inside a file and report where it is. They let you jump back, skip ahead, and measure a file.",
    blocks: [
      {
        type: "heading",
        text: "A file has a position",
      },
      {
        type: "para",
        text: "When you read from a file, Python keeps track of where you are, like a bookmark. Reading moves the bookmark forward. The tell method reports the current position as a number of characters from the start. The seek method moves the bookmark to a position you choose, so you can reread from the start or jump into the middle.",
      },
      {
        type: "code",
        title: "Reading, checking position, rewinding",
        code: `with open("notes.txt", "w") as f:
    f.write("Hello Python\\n")
    f.write("File handling is easy\\n")

with open("notes.txt") as f:
    print(f.read(5))
    print(f.tell())
    f.seek(0)
    print(f.read(5))
    print(f.tell())`,
        output: "Hello\n5\nHello\n5\n",
      },
      {
        type: "heading",
        text: "Jumping to a position",
      },
      {
        type: "para",
        text: "Seek takes a character offset from the start of the file. Seeking to 6 skips the word Hello and the space after it, so reading from there starts at Python. Seeking to 0 goes back to the very start. A second form, seek(0, 2), jumps to the end of the file, and tell then reports the size of the file in characters.",
      },
      {
        type: "code",
        title: "Skipping ahead and measuring the file",
        code: `with open("notes.txt") as f:
    f.seek(6)
    print(f.read())
    f.seek(0, 2)
    print(f.tell())`,
        output: "Python\nFile handling is easy\n\n35\n",
      },
      {
        type: "note",
        text: "Seek positions count characters in text mode, but newlines can count differently on Windows, where one line break is stored as two characters. For exact byte positions, open the file in binary mode instead.",
      },
      {
        type: "tip",
        text: "Use seek(0) to reread a file you already read, instead of closing and reopening it. It is one line and keeps the same open file.",
      },
    ],
    practice: [
      "Write a file with three lines, read the first line, then use seek(0) and read the whole file.",
      "Use seek to skip the first ten characters of a file and print the rest.",
      "Use seek(0, 2) and tell to print the size of a file in characters.",
    ],
    summary: [
      "tell reports the current reading position in a file.",
      "seek moves the position to a chosen offset from the start.",
      "seek(0) rewinds to the start so you can read the file again.",
      "seek(0, 2) jumps to the end, so tell then gives the file size.",
    ],
  },
  {
    day: 52,
    title: "Lambda Functions",
    intro: "In this lesson you learn lambda functions, small one-line functions without a name. They are handy for short jobs that you only need once.",
    blocks: [
      {
        type: "heading",
        text: "A function in one line",
      },
      {
        type: "para",
        text: "A normal function needs a def line, a name and a return statement. A lambda skips all of that: the keyword lambda, then the parameters, then a colon, then a single expression. The result of that expression is returned automatically. Lambdas are best for tiny jobs, like adding two numbers or doubling a value.",
      },
      {
        type: "code",
        title: "A lambda that adds two numbers",
        code: `add = lambda a, b: a + b
print(add(3, 4))

nums = [1, 2, 3, 4]
print(list(map(lambda x: x * x, nums)))`,
        output: "7\n[1, 4, 9, 16]\n",
      },
      {
        type: "heading",
        text: "Where lambdas shine",
      },
      {
        type: "para",
        text: "Lambdas are most useful as arguments to other functions. The sorted function takes a key argument that says how to compare items, and a lambda is the natural way to supply it. Here students are sorted by their marks, not by their names, because the lambda pulls out the second item of each pair.",
      },
      {
        type: "code",
        title: "Sorting with a lambda key",
        code: `students = [("Asha", 88), ("Ravi", 92), ("Meena", 75)]
print(sorted(students, key=lambda s: s[1]))

words = ["banana", "apple", "cherry"]
print(sorted(words, key=lambda w: len(w)))`,
        output: "[('Meena', 75), ('Asha', 88), ('Ravi', 92)]\n['apple', 'banana', 'cherry']\n",
      },
      {
        type: "note",
        text: "A lambda can only hold one expression, so it cannot contain statements like if blocks, loops or assignments. If the job needs more than one step, write a normal def function instead.",
      },
      {
        type: "tip",
        text: "Do not assign a lambda to a name when a def would do the same job better. The one real use of a lambda is passing it straight into another function, like sorted, map or filter.",
      },
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
    day: 53,
    title: "Map, Filter and Reduce",
    intro: "In this lesson you learn map, filter and reduce, three tools for processing a whole list at once: transforming every item, keeping only some items, and combining items into one value.",
    blocks: [
      {
        type: "heading",
        text: "Three jobs, three tools",
      },
      {
        type: "para",
        text: "Many list jobs fall into three shapes. Map applies a function to every item and gives back the changed items. Filter applies a test to every item and keeps only the ones that pass. Reduce applies a function again and again to boil a list down to a single value, like a total. Each takes a function and a list, and each pairs naturally with a lambda.",
      },
      {
        type: "code",
        title: "Doubling numbers and keeping evens",
        code: `nums = [1, 2, 3, 4, 5]

print(list(map(lambda x: x * 2, nums)))
print(list(filter(lambda x: x % 2 == 0, nums)))`,
        output: "[2, 4, 6, 8, 10]\n[2, 4]\n",
      },
      {
        type: "heading",
        text: "How map and filter differ",
      },
      {
        type: "para",
        text: "Map never changes how many items there are: five numbers in, five numbers out, each one transformed. Filter never changes the items themselves: it only drops the ones that fail the test, so the result is shorter but the kept values are untouched. Both return lazy results in Python 3, which is why the examples wrap them in list to see the values.",
      },
      {
        type: "heading",
        text: "Combining with reduce",
      },
      {
        type: "para",
        text: "Reduce is different: it takes two items, combines them into one, then combines that result with the next item, and so on until one value is left. Adding the numbers 1 to 5 step by step gives 15, and multiplying 1 by 2 by 3 by 4 gives 24. Reduce lives in the functools module, so it needs an import first.",
      },
      {
        type: "code",
        title: "Adding and multiplying a list",
        code: `from functools import reduce

nums = [1, 2, 3, 4, 5]
print(reduce(lambda a, b: a + b, nums))
print(reduce(lambda a, b: a * b, [1, 2, 3, 4]))`,
        output: "15\n24\n",
      },
      {
        type: "note",
        text: "Map and filter return lazy objects, not lists. Wrapping them in list shows the values, but if you only need to loop over the result once, you can use the lazy object directly.",
      },
      {
        type: "tip",
        text: "For simple cases a list comprehension is often clearer than map or filter. Use map and filter when the function already exists, and comprehensions when the logic is written inline.",
      },
    ],
    practice: [
      "Use map to convert a list of temperatures in Celsius to Fahrenheit with the formula x * 9 / 5 + 32.",
      "Use filter to keep only the names longer than four letters from a list of names.",
      "Use reduce to find the largest number in a list, then do the same job with the built-in max function.",
    ],
    summary: [
      "map applies a function to every item and returns the changed items.",
      "filter keeps only the items that pass a test.",
      "reduce combines a list into a single value, step by step.",
      "reduce must be imported from functools, and map and filter return lazy results.",
    ],
  },
  {
    day: 54,
    title: "'is' vs '=='",
    intro: "In this lesson you learn the difference between is and ==: one checks whether two names point at the same object, and the other checks whether two objects have equal values.",
    blocks: [
      {
        type: "heading",
        text: "Equal value, different object",
      },
      {
        type: "para",
        text: "Two lists can hold the same values and still be two separate objects in memory. The == operator compares values, so it says True when the contents match. The is operator compares identity, so it says True only when both names point at the very same object. Knowing which one you mean is the whole lesson.",
      },
      {
        type: "code",
        title: "Same values, same object, different answers",
        code: `a = [1, 2, 3]
b = a
c = [1, 2, 3]

print(a == b)
print(a is b)
print(a == c)
print(a is c)`,
        output: "True\nTrue\nTrue\nFalse\n",
      },
      {
        type: "heading",
        text: "Why identity matters",
      },
      {
        type: "para",
        text: "When two names point at the same list, changing the list through one name changes it for the other too, because there is only one list. This is the most common surprise with is: b = a does not copy the list, it makes a second name for the same list. To get a real copy, write b = a.copy or b = list(a).",
      },
      {
        type: "code",
        title: "One list, two names",
        code: `a = [1, 2, 3]
b = a
b.append(4)
print(a)
print(b)
print(a is b)

value = None
print(value is None)`,
        output: "[1, 2, 3, 4]\n[1, 2, 3, 4]\nTrue\nTrue\n",
      },
      {
        type: "note",
        text: "The one place where is is the right choice is comparing with None. Always write x is None, never x == None, because None is a single shared object and identity is exactly what you want to test.",
      },
      {
        type: "tip",
        text: "Default to == for comparisons. Reach for is only when you care about identity: checking for None, or checking whether two names share one object.",
      },
    ],
    practice: [
      "Create two lists with the same values and test them with == and is, then predict the answers before you run the code.",
      "Assign one list to a second name, change it through the second name, and check whether the first name sees the change.",
      "Write a function that returns early when its argument is None, using is None for the check.",
    ],
    summary: [
      "== compares values, is compares identity.",
      "Two lists can be equal in value but different objects.",
      "Assigning a list to a new name shares the object instead of copying it.",
      "Use is None to test for None, and == for everything else.",
    ],
  },
  {
    day: 55,
    title: "Snake Water Gun",
    intro: "In this lesson you build the Snake Water Gun game, a rock-paper-scissors style game where you play against the computer. It brings together random choices, conditions, loops and score tracking.",
    blocks: [
      {
        type: "heading",
        text: "The rules of the game",
      },
      {
        type: "para",
        text: "Snake, water and gun beat each other in a circle: snake drinks the water, water drowns the gun, and gun shoots the snake. You pick one, the computer picks one at random, and the winner is decided by the circle. The same choice is a draw. The game runs for a set number of rounds, and the higher score at the end wins.",
      },
      {
        type: "list",
        items: [
          "Snake beats water, water beats gun, gun beats snake.",
          "The same choice on both sides is a draw.",
          "Win a round to score a point, and the most points after all rounds wins.",
        ],
      },
      {
        type: "heading",
        text: "One round against the computer",
      },
      {
        type: "para",
        text: "A dictionary called beats records what each choice defeats, which keeps the winner logic to a single comparison. The computer choice comes from random.choice, and a seed makes the choice repeatable while you test. In this round the player picks snake and the computer picks gun, and since gun beats snake, the computer wins the round.",
      },
      {
        type: "code",
        title: "Playing a single round",
        code: `import random

random.seed(10)
choices = ["snake", "water", "gun"]
beats = {"snake": "water", "water": "gun", "gun": "snake"}

player = "snake"
computer = random.choice(choices)
print("You:", player)
print("Computer:", computer)

if player == computer:
    print("Draw")
elif beats[player] == computer:
    print("You win")
else:
    print("Computer wins")`,
        output: "You: snake\nComputer: gun\nComputer wins\n",
      },
      {
        type: "heading",
        text: "Playing several rounds with a score",
      },
      {
        type: "para",
        text: "A loop turns one round into a match. Two score variables start at zero and grow by one whenever their side wins a round. Here three rounds are played with fixed player moves so the result is repeatable: the computer wins the first, the player wins the second, and the third is a draw, leaving the match tied at one point each.",
      },
      {
        type: "code",
        title: "Three rounds with score tracking",
        code: `import random

random.seed(10)
choices = ["snake", "water", "gun"]
beats = {"snake": "water", "water": "gun", "gun": "snake"}
player_score = 0
computer_score = 0
player_moves = ["snake", "gun", "water"]

for player in player_moves:
    computer = random.choice(choices)
    print("You:", player, "| Computer:", computer)
    if player == computer:
        print("Draw")
    elif beats[player] == computer:
        print("You win this round")
        player_score += 1
    else:
        print("Computer wins this round")
        computer_score += 1

print("Final score - You:", player_score, "Computer:", computer_score)`,
        output: "You: snake | Computer: gun\nComputer wins this round\nYou: gun | Computer: snake\nYou win this round\nYou: water | Computer: water\nDraw\nFinal score - You: 1 Computer: 1\n",
      },
      {
        type: "note",
        text: "The beats dictionary is the heart of the game. If you write the circle wrong, for example saying snake beats gun, every round will be judged wrong, so check the three pairs against the rules before you trust the scores.",
      },
    ],
    practice: [
      "Change the game to play 10 rounds and print the winner at the end based on the final scores.",
      "Replace the fixed player moves with input so the player types a choice each round.",
      "Add a check that prints 'Invalid choice' and skips the round when the player types something other than snake, water or gun.",
    ],
    summary: [
      "Snake beats water, water beats gun, and gun beats snake.",
      "A beats dictionary makes the winner check a single comparison.",
      "random.choice picks the computer move, and a seed makes it repeatable.",
      "A loop plus two score variables turns one round into a full match.",
    ],
  },
];
