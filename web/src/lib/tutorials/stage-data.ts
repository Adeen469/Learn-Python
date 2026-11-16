import type { LessonTutorial } from "./types";

export const TUTORIALS: LessonTutorial[] = [
  {
    day: 31,
    title: "Sets in Python",
    intro: "This lesson teaches you what a set is and how to use one. Sets help you store unique items and remove duplicates quickly.",
    blocks: [
      { type: "heading", text: "What is a set?" },
      { type: "para", text: "A set is a collection of unique items. It does not keep items in order, and it does not allow duplicates. You create a set with curly brackets, just like a dictionary, but without keys and values. A set is useful when you only care about which items are present, not about their order or their position. For example, a set of student names tells you who is in a class, and it will never list the same student twice." },
      { type: "code", title: "A set removes duplicates", code: `numbers = {1, 2, 2, 3, 3, 3}
print(len(numbers))
print(sorted(numbers))`, output: "3\n[1, 2, 3]" },
      { type: "heading", text: "Adding and removing items" },
      { type: "para", text: "Use add to put one item into a set, and use discard to remove an item that may or may not be there. The method remove also deletes an item, but it gives an error if the item is missing, so discard is safer when you are not sure. You can also use the word in to check whether an item is in a set. This check is fast, even for a large set, because Python does not need to scan the items one by one." },
      { type: "code", title: "Add and discard items", code: `colors = {"red", "blue"}
colors.add("green")
colors.discard("red")
print(sorted(colors))
print("green" in colors)
print("red" in colors)`, output: "['blue', 'green']\nTrue\nFalse" },
      { type: "heading", text: "Set operations" },
      { type: "para", text: "Sets support useful operations between two sets. Union joins two sets into one set with all the items from both. Intersection keeps only the items that appear in both sets. Difference keeps the items in the first set that are not in the second set. These operations are handy when you compare two groups, such as students who play football and students who play cricket." },
      { type: "code", title: "Union, intersection and difference", code: `a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
print(sorted(a | b))
print(sorted(a & b))
print(sorted(a - b))`, output: "[1, 2, 3, 4, 5, 6]\n[3, 4]\n[1, 2]" },
      { type: "note", text: "When Python prints a set, the order of the items can change from run to run. Use sorted to show the items in a fixed order when you need a predictable result." },
    ],
    practice: ["Create a set of your five favourite foods and print how many items it has.", "Make a list with repeated numbers, turn it into a set, and print the unique numbers in sorted order.", "Create two sets of numbers and print their union, intersection, and difference."],
    summary: ["A set stores unique items and has no order.", "Use curly brackets to create a set.", "Use add and discard to change a set.", "Union, intersection, and difference compare two sets."],
  },
  {
    day: 32,
    title: "Set Methods in Python",
    intro: "This lesson teaches you the main methods of a set. These methods let you add, remove, and compare items without writing extra loops.",
    blocks: [
      { type: "heading", text: "Adding and updating a set" },
      { type: "para", text: "The add method puts one item into a set. If the item is already there, nothing changes, because a set cannot hold duplicates. The update method adds many items at once from a list, a tuple, or another set. It is useful when you have a group of new items and you want to add all of them in one step. After update, the set still holds each item only once, even if some of the new items were already present." },
      { type: "code", title: "Add one item and update with many items", code: `fruits = {"apple", "banana"}
fruits.add("mango")
fruits.update(["orange", "apple"])
print(sorted(fruits))
print(len(fruits))`, output: "['apple', 'banana', 'mango', 'orange']\n4" },
      { type: "heading", text: "Removing items safely" },
      { type: "para", text: "The remove method deletes an item, but it gives a KeyError if the item is not in the set. The discard method deletes an item only if it is there, and it does nothing if the item is missing, so it is the safer choice. The clear method removes every item from a set and leaves an empty set. The pop method removes and returns one item, but you cannot choose which item it removes, so avoid it when the exact item matters." },
      { type: "code", title: "Remove, discard and clear", code: `numbers = {1, 2, 3, 4}
numbers.remove(2)
numbers.discard(9)
print(sorted(numbers))
numbers.clear()
print(numbers)
print(len(numbers))`, output: "[1, 3, 4]\nset()\n0" },
      { type: "heading", text: "Comparing sets" },
      { type: "para", text: "The union, intersection, and difference methods do the same work as the symbols you saw in the last lesson, but in a clearer form. The symmetric difference method keeps the items that are in one set or the other, but not in both. The issubset method checks whether every item of one set is in another set. The isdisjoint method checks whether two sets have no items in common at all." },
      { type: "code", title: "Compare two sets with methods", code: `a = {1, 2, 3}
b = {2, 3, 4}
print(sorted(a.union(b)))
print(sorted(a.intersection(b)))
print(sorted(a.symmetric_difference(b)))
print(a.issubset({1, 2, 3, 4}))
print(a.isdisjoint({5, 6}))`, output: "[1, 2, 3, 4]\n[2, 3]\n[1, 4]\nTrue\nTrue" },
      { type: "note", text: "The remove method raises a KeyError when the item is missing, even though the item is a value in a set and not a dictionary key. Use discard when you are not sure the item is present." },
    ],
    practice: ["Create a set of colours, add two new colours with update, and print the sorted set.", "Create a set of numbers, try to remove a number that is not there with discard, and print the set to confirm nothing broke.", "Create two sets and print their symmetric difference, then check whether one is a subset of the other."],
    summary: ["add adds one item and update adds many items.", "discard is safer than remove for a missing item.", "clear empties a set.", "Set methods can compare two sets and test their relation."],
  },
  {
    day: 33,
    title: "Dictionaries in Python",
    intro: "This lesson teaches you what a dictionary is and how to use one. Dictionaries store data as key and value pairs, so you can find a value by its name instead of its position.",
    blocks: [
      { type: "heading", text: "What is a dictionary?" },
      { type: "para", text: "A dictionary stores pairs of keys and values. The key is a name you choose, such as name or age, and the value is the data that belongs to that key. You create a dictionary with curly brackets, with each pair written as key, colon, value, and pairs separated by commas. Unlike a list, a dictionary does not use positions, so you look up a value by its key. This makes a dictionary a natural way to store information about one thing, such as a student, a book, or a user." },
      { type: "code", title: "Create a dictionary and read values by key", code: `student = {"name": "Asha", "age": 20, "course": "Python"}
print(student["name"])
print(student["age"])
print(len(student))`, output: "Asha\n20\n3" },
      { type: "heading", text: "Adding and changing values" },
      { type: "para", text: "You add a new pair by writing the dictionary name, square brackets with the new key, an equals sign, and the value. You change an existing value in exactly the same way, by assigning a new value to a key that already exists. If you try to read a key that is not in the dictionary, Python gives a KeyError, so make sure the key exists or use the get method you will learn in the next lesson. A dictionary keeps its pairs in the order you added them." },
      { type: "code", title: "Change a value and add a new pair", code: `student = {"name": "Asha", "age": 20}
student["age"] = 21
student["city"] = "Mumbai"
print(student)`, output: "{'name': 'Asha', 'age': 21, 'city': 'Mumbai'}" },
      { type: "heading", text: "Looping through a dictionary" },
      { type: "para", text: "You can loop through a dictionary in three ways. Looping over the dictionary itself gives you each key, one at a time. The items method gives you each key and value together, which is the most useful form when you need both. The values method gives you only the values. In the example below, the loop prints each subject and its marks, and the order matches the order in which the pairs were added to the dictionary." },
      { type: "code", title: "Loop through keys and values with items", code: `marks = {"Maths": 90, "English": 85, "Science": 92}
for subject, score in marks.items():
    print(subject, score)`, output: "Maths 90\nEnglish 85\nScience 92" },
      { type: "note", text: "Keys in a dictionary must be unique. If you add the same key twice, the second value replaces the first one, and the old value is lost." },
    ],
    practice: ["Create a dictionary for a book with title, author, and pages, then print the author.", "Add a new key called year to your book dictionary and change the number of pages.", "Create a dictionary of three subjects and their marks, then loop through it and print each subject and its marks."],
    summary: ["A dictionary stores data as key and value pairs.", "Read a value with its key in square brackets.", "Assigning to a key adds or changes a pair.", "Use items to loop through keys and values together."],
  },
  {
    day: 34,
    title: "Dictionary Methods in Python",
    intro: "This lesson teaches you the main methods of a dictionary. These methods let you read, add, update, and remove pairs safely and in fewer lines.",
    blocks: [
      { type: "heading", text: "Getting values safely" },
      { type: "para", text: "Reading a missing key with square brackets gives a KeyError and stops your program. The get method is safer, because it returns None when the key is missing instead of giving an error. You can also give get a second value, which it returns as a default when the key is not there. This is useful when a piece of data is optional, such as a city or a middle name, and your program should keep running even when it is missing." },
      { type: "code", title: "Use get instead of square brackets", code: `user = {"name": "Rahul", "age": 25}
print(user.get("name"))
print(user.get("city"))
print(user.get("city", "Unknown"))`, output: "Rahul\nNone\nUnknown" },
      { type: "heading", text: "Updating and adding values" },
      { type: "para", text: "The update method adds or changes many pairs at once from another dictionary. If a key already exists, its value is replaced, and if it does not exist, the pair is added. The setdefault method returns the value for a key if the key exists, and if it does not exist, it adds the key with the value you give and then returns that value. This is handy when you want to make sure a key exists before you use it, without overwriting a value that is already there." },
      { type: "code", title: "Update many pairs and use setdefault", code: `scores = {"Maths": 80}
scores.update({"English": 90, "Maths": 85})
scores.setdefault("Science", 75)
scores.setdefault("Maths", 100)
print(scores)`, output: "{'Maths': 85, 'English': 90, 'Science': 75}" },
      { type: "heading", text: "Removing items and reading keys" },
      { type: "para", text: "The pop method removes a pair by its key and returns the value that was removed, so you can use that value before it is gone. The popitem method removes the last pair that was added and returns it as a pair of key and value. The keys method gives you all the keys, and the values method gives you all the values. Both are useful when you need to check what a dictionary holds, and you can turn either one into a list with the list function." },
      { type: "code", title: "Remove pairs and read keys and values", code: `book = {"title": "Python Basics", "pages": 200, "author": "Asha"}
print(book.pop("pages"))
print(book.popitem())
print(list(book.keys()))
print(list(book.values()))`, output: "200\n('author', 'Asha')\n['title']\n['Python Basics']" },
      { type: "note", text: "The pop method gives a KeyError for a missing key unless you pass a default value, for example book.pop('pages', 0). The clear method removes every pair and leaves an empty dictionary." },
    ],
    practice: ["Create a dictionary for a user, then use get to read a key that does not exist, with a default value.", "Create a dictionary of scores, update it with two new subjects, and use setdefault to add a third subject only if it is missing.", "Create a dictionary, remove one pair with pop, print the removed value, and then print the keys that are left."],
    summary: ["get reads a value safely, with an optional default.", "update changes many pairs at once.", "setdefault adds a missing key without overwriting an old one.", "pop and popitem remove pairs, and keys and values list what is left."],
  },
  {
    day: 35,
    title: "for Loop with else in Python",
    intro: "This lesson teaches you how else works with a for loop. The else part runs when the loop finishes normally, which makes it perfect for search tasks.",
    blocks: [
      { type: "heading", text: "How for else works" },
      { type: "para", text: "In Python, you can put an else block after a for loop. The else block runs only when the loop finishes all of its items without hitting a break. If the loop stops early because of a break, the else block is skipped. This is different from the else you use with an if statement, so it can look strange at first. Think of it this way: the else part means the loop ran to the end and found nothing that made it stop early." },
      { type: "code", title: "Else runs when the loop finishes normally", code: `for number in [1, 2, 3]:
    print(number)
else:
    print("Loop finished")`, output: "1\n2\n3\nLoop finished" },
      { type: "heading", text: "Using else with break to search" },
      { type: "para", text: "The most common use of for else is searching a list. You loop through the items and break as soon as you find what you are looking for. If the loop ends without a break, the else block runs, and you know the item was not found. This removes the need for an extra flag variable that you set to True or False and check after the loop. In the example below, every number is even, so no break happens, and the else block reports that no odd number was found." },
      { type: "code", title: "Search a list and report when nothing is found", code: `numbers = [4, 6, 8, 10]
for number in numbers:
    if number % 2 == 1:
        print("Found an odd number:", number)
        break
else:
    print("No odd number found")`, output: "No odd number found" },
      { type: "heading", text: "Checking a prime number" },
      { type: "para", text: "A prime number is a number greater than 1 that has no divisors except 1 and itself. You can test this with a for loop that tries every possible divisor. If any divisor divides the number evenly, the number is not prime, and the loop breaks. If no divisor works, the loop finishes normally and the else block runs, which means the number is prime. In the example below, 7 has no divisor between 2 and 6, so the else block prints that 7 is prime." },
      { type: "code", title: "Test whether a number is prime", code: `number = 7
for divisor in range(2, number):
    if number % divisor == 0:
        print(number, "is not prime")
        break
else:
    print(number, "is prime")`, output: "7 is prime" },
      { type: "tip", text: "Use for else for a search instead of a flag variable. The code is shorter, and the else block clearly shows what happens when nothing is found." },
    ],
    practice: ["Write a for loop over a list of names with an else block that prints a message when the loop finishes.", "Search a list of numbers for a number greater than 100, break when you find one, and use else to print a message when there is none.", "Use for else to test whether 11 is prime, then test 12 and check that the result changes."],
    summary: ["else after a for loop runs when the loop finishes without break.", "break skips the else block.", "for else is best for searching a list.", "It can also test a prime number without a flag variable."],
  },
  {
    day: 36,
    title: "Exception Handling in Python",
    intro: "This lesson teaches you how to handle errors with try and except. Error handling stops a small mistake from crashing your whole program.",
    blocks: [
      { type: "heading", text: "What is an exception?" },
      { type: "para", text: "An exception is an error that happens while a program is running, such as dividing by zero, opening a file that does not exist, or turning text into a number when the text is not a number. Without handling, an exception stops the program at once and prints a long error message. With a try block, you can tell Python to attempt a risky piece of code, and with an except block, you can tell it what to do if that code fails. The program then keeps running instead of crashing." },
      { type: "code", title: "Catch a division by zero", code: `try:
    print(10 / 0)
except ZeroDivisionError:
    print("You cannot divide by zero")`, output: "You cannot divide by zero" },
      { type: "heading", text: "Catching a specific error" },
      { type: "para", text: "Each kind of error has its own name, such as ZeroDivisionError, ValueError, and KeyError. You should catch the specific error you expect, because that makes your code clear and stops you from hiding a different bug by accident. In the example below, turning the text abc into a number raises a ValueError, because abc is not a valid number. The except block catches that error and prints a friendly message asking for a valid number instead." },
      { type: "code", title: "Catch a ValueError from a bad conversion", code: `try:
    age = int("abc")
    print(age)
except ValueError:
    print("Please enter a valid number")`, output: "Please enter a valid number" },
      { type: "heading", text: "Getting the error message" },
      { type: "para", text: "Sometimes you want to see the exact error message, for example when you write it to a log or show it while you are fixing a bug. You can catch the general Exception class and store the error in a variable with the word as. The message then tells you what went wrong in Python's own words. You can also add an else block after except, which runs only when no error happened, and that is a good place for code that should run after a successful try." },
      { type: "code", title: "Catch any error and print its message", code: `try:
    print(10 / 0)
except Exception as e:
    print("Something went wrong:", e)`, output: "Something went wrong: division by zero" },
      { type: "note", text: "Do not use a bare except with no error name in real programs. It catches every error, including ones you did not expect, and that can hide serious bugs." },
    ],
    practice: ["Write a try and except block that divides 10 by 0 and prints a friendly message.", "Try to turn the text hello into a number with int, catch the ValueError, and print a message.", "Write a program that asks the user for a number with input, turns it into an integer inside try, and prints a message if the input is not a number."],
    summary: ["An exception is a runtime error that can stop a program.", "try runs risky code and except handles the error.", "Catch the specific error you expect.", "except Exception as e gives you the exact error message."],
  },
  {
    day: 37,
    title: "Finally Keyword in Python",
    intro: "This lesson teaches you the finally keyword. Code in a finally block always runs, which makes it the right place for cleanup work.",
    blocks: [
      { type: "heading", text: "What does finally do?" },
      { type: "para", text: "A finally block runs after a try block and its except block, no matter what happened. It runs when the code succeeds, when an error is caught, and even when an error is not caught. This makes finally the right place for cleanup work that must happen in every case, such as closing a file or closing a database connection. Without finally, you would need to repeat the cleanup code in several places, and you could easily forget one of them." },
      { type: "code", title: "Finally runs when there is no error", code: `try:
    print(10 / 2)
except ZeroDivisionError:
    print("Error")
finally:
    print("This always runs")`, output: "5.0\nThis always runs" },
      { type: "heading", text: "Finally runs when an error happens" },
      { type: "para", text: "When the code in the try block raises an error, Python first runs the matching except block, and then it runs the finally block. The program does not skip finally just because an error happened. In the example below, dividing by zero raises a ZeroDivisionError, the except block prints a friendly message, and the finally block still prints its line. This is exactly why finally is used for cleanup: the file or connection is closed even when the work itself failed." },
      { type: "code", title: "Finally runs after an error is caught", code: `try:
    print(10 / 0)
except ZeroDivisionError:
    print("Cannot divide by zero")
finally:
    print("This always runs")`, output: "Cannot divide by zero\nThis always runs" },
      { type: "heading", text: "Finally runs even with return" },
      { type: "para", text: "The finally block also runs when a function returns from inside its try block. Python first runs the finally block, and only then does it hand the return value back to the caller. In the example below, the function returns the word Hello, but the finally block prints Cleaning up before that value is printed by the caller. This rule means you can safely put cleanup code in finally, even in a function that returns early, and the cleanup will still happen." },
      { type: "code", title: "Finally runs before a return value is handed back", code: `def greet():
    try:
        return "Hello"
    finally:
        print("Cleaning up")

print(greet())`, output: "Cleaning up\nHello" },
      { type: "tip", text: "For files, the with statement is usually simpler than try and finally, because it closes the file for you. Use finally when the cleanup is something with cannot do, such as releasing a lock." },
    ],
    practice: ["Write a try, except, and finally block where the try code succeeds, and check that finally still runs.", "Write the same structure with a division by zero, and check that both except and finally run.", "Write a function that returns a value from inside try, with a finally block that prints a cleanup message, and call the function."],
    summary: ["finally always runs after try and except.", "It runs on success and on error.", "It runs even when a function returns from try.", "Use finally for cleanup that must always happen."],
  },
  {
    day: 38,
    title: "Raising Custom Errors in Python",
    intro: "This lesson teaches you how to raise errors yourself. Raising an error is how you stop bad data early, before it causes a bigger problem later.",
    blocks: [
      { type: "heading", text: "Why raise an error?" },
      { type: "para", text: "So far you have caught errors that Python raised for you. Sometimes your own code should raise an error instead, when it receives data that makes no sense. For example, an age of minus 5 is not a real age, and a withdrawal larger than the balance is not a real withdrawal. If you let that bad data pass, the program may keep running and produce a wrong result much later. Raising an error stops the program at the exact place where the bad data appeared, with a clear message about what went wrong." },
      { type: "code", title: "Raise a ValueError for bad data", code: `try:
    age = -5
    if age < 0:
        raise ValueError("Age cannot be negative")
except ValueError as e:
    print("Error:", e)`, output: "Error: Age cannot be negative" },
      { type: "heading", text: "Creating a custom error class" },
      { type: "para", text: "Python has built-in errors such as ValueError and TypeError, but sometimes none of them fits your situation. In that case you can create your own error class. A custom error is a small class that inherits from Exception, and its name usually ends with the word Error. In the example below, AgeError is a custom error for an age that is too low. Raising it works just like raising a built-in error, and an except block can catch it by its own name." },
      { type: "code", title: "Define and raise a custom error", code: `class AgeError(Exception):
    pass

try:
    age = 15
    if age < 18:
        raise AgeError("You must be at least 18 years old")
except AgeError as e:
    print("Error:", e)`, output: "Error: You must be at least 18 years old" },
      { type: "heading", text: "Raising errors in a function" },
      { type: "para", text: "Raising errors is most useful inside a function, because the function can check its inputs before it does any work. If an input is wrong, the function raises an error and the caller decides what to do with it, usually by catching it in a try and except block. In the example below, the withdraw function raises a ValueError when the amount is larger than the balance. The first call fails and prints the error, while the second call succeeds and returns the balance that is left." },
      { type: "code", title: "Validate inputs inside a function", code: `def withdraw(balance, amount):
    if amount > balance:
        raise ValueError("Not enough balance")
    return balance - amount

try:
    print(withdraw(100, 150))
except ValueError as e:
    print("Error:", e)

print(withdraw(100, 40))`, output: "Error: Not enough balance\n60" },
      { type: "tip", text: "Write the error message as if you are explaining the problem to the person who will read it. A message such as Age cannot be negative is far more useful than a message such as Bad input." },
    ],
    practice: ["Write a program that raises a ValueError when a mark is greater than 100, and catch it with try and except.", "Create a custom error called MarksError, raise it when a mark is less than 0, and catch it by its own name.", "Write a function that takes a password and raises a ValueError when it is shorter than 8 characters, then test it with a short and a long password."],
    summary: ["raise stops bad data early with a clear message.", "Use raise ValueError for a wrong value.", "A custom error class inherits from Exception.", "Functions should validate inputs by raising errors."],
  },
  {
    day: 39,
    title: "KBC Quiz Game Solution",
    intro: "This lesson builds the complete Kaun Banega Crorepati quiz game. You will use lists, dictionaries, loops, and input to make a game with questions, options, and prize money.",
    blocks: [
      { type: "heading", text: "How the game works" },
      { type: "para", text: "The game stores its questions in a list, and each question is a dictionary with three keys: the question text, a list of four options, and the correct answer as a letter. A second list holds the prize money for each question, in order, so the first question is worth 1000 rupees, the second is worth 5000, and the third is worth 10000. The game loops through the questions one by one, shows the options, and asks the player for an answer. A correct answer adds the prize money, and a wrong answer ends the game at once." },
      { type: "code", title: "Store questions as a list of dictionaries", code: `questions = [
    {"question": "What is 2 + 3?", "options": ["A. 4", "B. 5", "C. 6", "D. 7"], "answer": "B"},
    {"question": "Which planet is known as the Red Planet?", "options": ["A. Venus", "B. Jupiter", "C. Mars", "D. Saturn"], "answer": "C"},
]

print(len(questions))
print(questions[0]["question"])
print(questions[0]["answer"])`, output: "2\nWhat is 2 + 3?\nB" },
      { type: "heading", text: "The full game loop" },
      { type: "para", text: "The full game uses a for loop with enumerate, which gives both the question number and the question itself. For each question, the loop prints the question and its four options, then reads the answer with input. The answer is cleaned with strip and upper, so a small letter b works just like a capital B, and extra spaces do not matter. If the answer matches, the prize for that question is stored in won and the game moves to the next question. If the answer is wrong, the game prints Game over and break stops the loop. After the loop, the program prints the total prize money, which is the prize from the last correct answer." },
      { type: "code", title: "The complete KBC game", code: `questions = [
    {"question": "What is 2 + 3?", "options": ["A. 4", "B. 5", "C. 6", "D. 7"], "answer": "B"},
    {"question": "Which planet is known as the Red Planet?", "options": ["A. Venus", "B. Jupiter", "C. Mars", "D. Saturn"], "answer": "C"},
    {"question": "What is the capital of France?", "options": ["A. Berlin", "B. Madrid", "C. Rome", "D. Paris"], "answer": "D"},
]

money = [1000, 5000, 10000]
won = 0

for i, q in enumerate(questions):
    print(q["question"])
    for option in q["options"]:
        print(option)
    answer = input("Your answer: ").strip().upper()
    if answer == q["answer"]:
        won = money[i]
        print("Correct! You won Rs.", won)
    else:
        print("Wrong answer. Game over.")
        break

print("Total prize money: Rs.", won)`, output: "What is 2 + 3?\nA. 4\nB. 5\nC. 6\nD. 7\nYour answer: B\nCorrect! You won Rs. 1000\nWhich planet is known as the Red Planet?\nA. Venus\nB. Jupiter\nC. Mars\nD. Saturn\nYour answer: C\nCorrect! You won Rs. 5000\nWhat is the capital of France?\nA. Berlin\nB. Madrid\nC. Rome\nD. Paris\nYour answer: A\nWrong answer. Game over.\nTotal prize money: Rs. 5000" },
      { type: "list", items: ["Each question is a dictionary with a question, four options, and the correct answer.", "A list holds the prize money for each question, in order.", "A correct answer stores that question's prize money in won.", "A wrong answer prints Game over and break ends the loop.", "The total prize money is the prize from the last correct answer."] },
      { type: "note", text: "The output above shows one sample run. In that run the player typed B, then C, then A, so the first two answers were correct and the third was wrong, and the game ended with 5000 rupees. Your own run will differ if you type different answers." },
      { type: "tip", text: "To add more questions, append another dictionary to the questions list and add its prize money to the money list in the same position. The loop needs no other change." },
    ],
    practice: ["Add a fourth question to the game with its own prize money of 20000 rupees, then play the game.", "Change the game so that it prints a message when the player answers every question correctly.", "Add a welcome line at the start of the game that explains the rules in one or two sentences."],
    summary: ["Questions are stored as a list of dictionaries.", "Each question has four options and one correct answer.", "Correct answers add prize money, and a wrong answer ends the game.", "break stops the loop, and won holds the total prize money."],
  },
];
