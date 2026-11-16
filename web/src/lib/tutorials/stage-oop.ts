import type { LessonTutorial } from "./types";

export const TUTORIALS: LessonTutorial[] = [
  {
    day: 56,
    title: "Introduction to OOP in Python",
    intro:
      "This lesson introduces object-oriented programming, a way of writing code by modelling real things as objects. It matters because most large programs are built this way, and it keeps code organised and reusable.",
    blocks: [
      { type: "heading", text: "What is object-oriented programming?" },
      {
        type: "para",
        text: "Object-oriented programming, or OOP, is a style of writing programs around objects. An object is a single thing that has data and actions of its own. A dog, for example, has a name and a colour, and it can bark and run. In OOP, the name and colour are data, and barking and running are actions.",
      },
      {
        type: "para",
        text: "Python supports OOP fully. A class is a blueprint for making objects. From one class you can make many objects, and each object has its own data. The class describes what every object of that kind can do, and the object is one real example made from that description.",
      },
      { type: "heading", text: "Your first class and object" },
      {
        type: "para",
        text: "The keyword class starts a class. Inside it, functions are called methods, and they describe what objects of the class can do. The special word self refers to the object itself, so a method can read and change that object's own data.",
      },
      {
        type: "code",
        title: "A Dog class with one method",
        code: `class Dog:
    def bark(self):
        print("Woof! Woof!")

my_dog = Dog()
my_dog.bark()`,
        output: "Woof! Woof!",
      },
      {
        type: "para",
        text: "Here Dog is the class and my_dog is an object made from it. Calling my_dog.bark() runs the bark method for that object. You can make a second dog from the same class, and it will bark in exactly the same way.",
      },
      {
        type: "code",
        title: "Two objects from one class",
        code: `class Dog:
    def bark(self):
        print("Woof! Woof!")

dog1 = Dog()
dog2 = Dog()
dog1.bark()
dog2.bark()
print(type(dog1))`,
        output: "Woof! Woof!\nWoof! Woof!\n<class '__main__.Dog'>",
      },
      {
        type: "list",
        items: [
          "A class is a blueprint; an object is one thing built from it.",
          "Methods are functions written inside a class.",
          "self always refers to the object the method was called on.",
          "One class can make as many objects as you need.",
        ],
      },
      {
        type: "note",
        text: "A class name starts with a capital letter by convention, for example Dog or Student. This is called CamelCase, and it helps other programmers see at a glance that the name is a class.",
      },
    ],
    practice: [
      "Create a class called Cat with a method meow that prints Meow! Then make an object and call the method.",
      "Create a class called Book with a method read that prints Reading a book. Make two objects and call read on both.",
      "Create a class called Car with a method start that prints The car has started. Make an object and call start.",
    ],
    summary: [
      "OOP organises code around objects that hold data and actions together.",
      "A class is a blueprint and an object is one thing made from it.",
      "Methods are functions inside a class, and self refers to the object itself.",
      "One class can create many objects, each independent of the others.",
    ],
  },
  {
    day: 57,
    title: "Classes and Objects in Python",
    intro:
      "This lesson goes deeper into classes and objects, showing how objects store their own data. It matters because almost every OOP program is built from classes that carry data and methods together.",
    blocks: [
      { type: "heading", text: "Objects carry their own data" },
      {
        type: "para",
        text: "An object is useful because it remembers things. A student object can remember a name and an age. A bank account object can remember a balance. This data lives inside the object, in variables called attributes. You set an attribute with a dot, like object.name, and read it the same way.",
      },
      {
        type: "para",
        text: "Methods can use the object's attributes through self. When you call a method on an object, Python passes that object in as self automatically, so the method knows exactly which object's data to use.",
      },
      {
        type: "code",
        title: "A Student class with attributes",
        code: `class Student:
    def show(self):
        print("Name:", self.name)
        print("Age:", self.age)

s1 = Student()
s1.name = "Learner One"
s1.age = 20
s1.show()`,
        output: "Name: Learner One\nAge: 20",
      },
      { type: "heading", text: "Each object has its own data" },
      {
        type: "para",
        text: "Two objects made from the same class do not share their data. Changing one object's attribute leaves the other untouched. This independence is one of the main strengths of OOP: each object keeps its own state, so a change in one place cannot quietly break another.",
      },
      {
        type: "code",
        title: "Two students with different data",
        code: `class Student:
    def show(self):
        print(self.name, "is", self.age, "years old")

s1 = Student()
s1.name = "Learner One"
s1.age = 20

s2 = Student()
s2.name = "Learner Two"
s2.age = 22

s1.show()
s2.show()
s1.age = 21
s1.show()
s2.show()`,
        output:
          "Learner One is 20 years old\nLearner Two is 22 years old\nLearner One is 21 years old\nLearner Two is 22 years old",
      },
      {
        type: "list",
        items: [
          "Attributes are variables that belong to one object.",
          "Read or set an attribute with a dot: object.attribute.",
          "Methods use self to reach the object's own attributes.",
          "Objects made from the same class keep separate data.",
        ],
      },
      {
        type: "note",
        text: "Setting attributes one by one after creating the object works, but it is easy to forget one. The next lesson shows constructors, which set the data at the moment the object is created.",
      },
      {
        type: "tip",
        text: "Use type(object) when you are unsure what something is. It prints the class the object was made from, which is handy while debugging.",
      },
    ],
    practice: [
      "Create a class called Book with attributes title and pages, then make an object, set both attributes, and print them.",
      "Create a class called Rectangle with attributes length and width and a method area that prints length times width.",
      "Make two objects of your Rectangle class with different sizes and print the area of each.",
    ],
    summary: [
      "Attributes store data inside an object.",
      "Methods reach that data through self.",
      "Each object keeps its own copy of the data.",
      "The dot is used both to read attributes and to call methods.",
    ],
  },
  {
    day: 58,
    title: "Constructors in Python",
    intro:
      "This lesson teaches constructors, the special method that runs when an object is created. It matters because constructors set up an object's data in one place, so no object is ever left half-built.",
    blocks: [
      { type: "heading", text: "What is a constructor?" },
      {
        type: "para",
        text: "A constructor is a special method named __init__ that Python calls automatically when you create an object. Its job is to set up the object's starting data. Instead of creating an empty object and then setting each attribute by hand, you pass the values in when you create the object, and __init__ stores them.",
      },
      {
        type: "para",
        text: "The __init__ method always takes self as its first parameter, followed by the values the object needs. The double underscores on both sides mark it as a special method, which is why methods like this are also called dunder methods.",
      },
      {
        type: "code",
        title: "A constructor that sets name and age",
        code: `class Student:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def show(self):
        print(self.name, "is", self.age, "years old")

s1 = Student("Learner One", 20)
s2 = Student("Learner Two", 22)
s1.show()
s2.show()`,
        output:
          "Learner One is 20 years old\nLearner Two is 22 years old",
      },
      { type: "heading", text: "Default values in a constructor" },
      {
        type: "para",
        text: "A constructor can give a parameter a default value, just like a normal function. Then the caller may skip that argument, and the default is used. This is handy when most objects share the same starting value but a few need something different.",
      },
      {
        type: "code",
        title: "A default value for one parameter",
        code: `class Employee:
    def __init__(self, name, role="Trainee"):
        self.name = name
        self.role = role

    def show(self):
        print(self.name, "-", self.role)

e1 = Employee("Worker One")
e2 = Employee("Worker Two", "Manager")
e1.show()
e2.show()`,
        output: "Worker One - Trainee\nWorker Two - Manager",
      },
      {
        type: "list",
        items: [
          "__init__ runs automatically when an object is created.",
          "It always takes self first, then the values the object needs.",
          "Pass the values in brackets when creating the object.",
          "Default values let the caller skip arguments that rarely change.",
        ],
      },
      {
        type: "note",
        text: "__init__ should not return a value. Its only job is to set up the object. If you try to return something from it, Python raises a TypeError.",
      },
      {
        type: "tip",
        text: "Put every attribute the object needs inside __init__. Then anyone reading the class can see at a glance what data an object of that class always has.",
      },
    ],
    practice: [
      "Create a class called Book with a constructor that takes title and author, and a method that prints both.",
      "Create a class called Circle with a constructor that takes radius and a method that prints the area using 3.14 times radius squared.",
      "Add a default value to your Circle constructor so the radius is 1 when no value is given, and test it with and without an argument.",
    ],
    summary: [
      "__init__ is the constructor and runs when an object is created.",
      "It stores the starting data in the object's attributes.",
      "Constructor parameters can have default values.",
      "A constructor must not return a value.",
    ],
  },
  {
    day: 59,
    title: "Decorators in Python",
    intro:
      "This lesson teaches decorators, a way to add behaviour to a function without changing its code. It matters because decorators keep common jobs like logging in one place instead of repeating them in every function.",
    blocks: [
      { type: "heading", text: "What is a decorator?" },
      {
        type: "para",
        text: "In Python, functions are objects. You can pass a function to another function, and a function can return a function. A decorator uses this: it is a function that takes another function, wraps it with some extra behaviour, and returns the wrapped version. The original function stays untouched, but every call to it now runs the extra code too.",
      },
      {
        type: "para",
        text: "You apply a decorator with the @ symbol placed just above a function definition. Writing @my_decorator above def greet() is the same as writing greet = my_decorator(greet) after the definition. The @ form is shorter and much easier to read.",
      },
      {
        type: "code",
        title: "A decorator that adds a greeting line",
        code: `def add_stars(func):
    def wrapper():
        print("-----")
        func()
        print("-----")
    return wrapper

@add_stars
def say_hello():
    print("Hello!")

say_hello()`,
        output: "-----\nHello!\n-----",
      },
      { type: "heading", text: "Decorators with arguments" },
      {
        type: "para",
        text: "If the wrapped function takes arguments, the wrapper must accept them too and pass them on. The usual pattern is to give the wrapper flexible parameters that accept any positional and keyword arguments, so it works with any function no matter what arguments it takes. This makes one decorator reusable across many different functions.",
      },
      {
        type: "code",
        title: "A decorator that works with arguments",
        code: `def shout(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        print("Done calling", func.__name__)
        return result
    return wrapper

@shout
def add(a, b):
    return a + b

print(add(3, 4))`,
        output: "Done calling add\n7",
      },
      {
        type: "list",
        items: [
          "A decorator wraps a function with extra behaviour.",
          "Apply it with @ above the function definition.",
          "The wrapper should accept any arguments so it fits any function.",
          "The original function code is not changed.",
        ],
      },
      {
        type: "note",
        text: "The wrapper must return the result of the wrapped function, or the decorated function will return None even when the original function returns a value.",
      },
      {
        type: "tip",
        text: "Decorators are used in real projects for logging, timing, checking permissions, and caching results. If you see @app.route in a web framework, that is a decorator too.",
      },
    ],
    practice: [
      "Write a decorator that prints Starting before a function runs and Finished after it, then apply it to a function that prints Hello.",
      "Write a decorator that prints the result of a function before returning it, and apply it to a function that multiplies two numbers.",
      "Apply your Starting and Finished decorator to two different functions and check that both are wrapped.",
    ],
    summary: [
      "A decorator is a function that wraps another function.",
      "The @ symbol applies a decorator above a function definition.",
      "Use flexible parameters in the wrapper so any function fits.",
      "Decorators add behaviour without changing the original function.",
    ],
  },

  {
    day: 60,
    title: "Getters and Setters in Python",
    intro:
      "This lesson teaches getters and setters, methods that control how an attribute is read and changed. They matter because they let a class check new values and stop bad data from getting in.",
    blocks: [
      { type: "heading", text: "Why control access to an attribute?" },
      {
        type: "para",
        text: "When an attribute is public, anyone can set it to anything, even a value that makes no sense, like a negative age. Getters and setters fix this. A getter is a method that runs when you read an attribute, and a setter is a method that runs when you change it. The setter can check the new value first and refuse it if it is wrong.",
      },
      {
        type: "para",
        text: "Python does this with the @property decorator. You write a method with the name you want the attribute to have, decorate it with @property, and it becomes the getter. Then you write a second method with the same name, decorate it with @name.setter, and it becomes the setter. From outside, the attribute is used like a normal one, but your methods run behind the scenes.",
      },
      {
        type: "code",
        title: "A property that protects the age value",
        code: `class Student:
    def __init__(self, age):
        self._age = age

    @property
    def age(self):
        return self._age

    @age.setter
    def age(self, value):
        if value < 0:
            print("Age cannot be negative. Keeping old value.")
        else:
            self._age = value

s = Student(20)
print(s.age)
s.age = 21
print(s.age)
s.age = -5
print(s.age)`,
        output:
          "20\n21\nAge cannot be negative. Keeping old value.\n21",
      },
      { type: "heading", text: "Read-only properties" },
      {
        type: "para",
        text: "If you write only the getter and no setter, the attribute becomes read-only. Trying to change it raises an AttributeError. This is useful for values that should never change after the object is created, such as an ID number.",
      },
      {
        type: "code",
        title: "A read-only property",
        code: `class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @property
    def area(self):
        return 3.14 * self._radius * self._radius

c = Circle(5)
print(c.radius)
print(c.area)`,
        output: "5\n78.5",
      },
      {
        type: "list",
        items: [
          "@property turns a method into a getter for an attribute.",
          "@name.setter turns a method into a setter for the same attribute.",
          "A setter can check a value before storing it.",
          "A property with no setter is read-only.",
          "The real value is usually stored in an underscore attribute like _age.",
        ],
      },
      {
        type: "note",
        text: "The underscore in _age is a signal that the attribute is meant to be used only inside the class. The property named age is the public way in, and it keeps the check in one place.",
      },
      {
        type: "tip",
        text: "Start with plain attributes and add a property only when you need a check or a computed value. A property lets you add that control later without changing any code that already uses the attribute.",
      },
    ],
    practice: [
      "Create a class with a property called marks that refuses values above 100 or below 0, and test it with a good and a bad value.",
      "Create a class called Rectangle with a read-only property area that returns length times width.",
      "Add a setter to your Rectangle class for length that refuses zero or negative values.",
    ],
    summary: [
      "Getters run when an attribute is read; setters run when it is changed.",
      "@property creates a getter and @name.setter creates a setter.",
      "A setter can reject values that do not make sense.",
      "A property without a setter is read-only.",
    ],
  },
  {
    day: 61,
    title: "Inheritance in Python",
    intro:
      "This lesson teaches inheritance, where one class takes on the attributes and methods of another. It matters because it lets you reuse code instead of writing the same methods again for every similar class.",
    blocks: [
      { type: "heading", text: "What is inheritance?" },
      {
        type: "para",
        text: "Inheritance lets a new class, called the child class, reuse everything from an existing class, called the parent class. The child gets all the parent's methods and attributes for free, and can add its own or change some of them. For example, a Dog class and a Cat class can both inherit from an Animal class, so the shared behaviour is written only once.",
      },
      {
        type: "para",
        text: "To inherit, write the parent class name in brackets after the child class name: class Dog(Animal). The child object can then call the parent's methods as if they were its own. This relationship is often described as is-a: a dog is an animal.",
      },
      {
        type: "code",
        title: "A child class reusing a parent method",
        code: `class Animal:
    def __init__(self, name):
        self.name = name

    def eat(self):
        print(self.name, "is eating.")

class Dog(Animal):
    def bark(self):
        print(self.name, "says woof!")

d = Dog("Buddy")
d.eat()
d.bark()`,
        output: "Buddy is eating.\nBuddy says woof!",
      },
      { type: "heading", text: "The child can add its own constructor" },
      {
        type: "para",
        text: "A child class often needs extra data of its own. It can define its own __init__, and call the parent's __init__ with super() so the parent's setup still happens. The super() function gives access to the parent class, and this is the clean way to reuse the parent's constructor instead of copying its code.",
      },
      {
        type: "code",
        title: "A child constructor that calls super()",
        code: `class Animal:
    def __init__(self, name):
        self.name = name

    def eat(self):
        print(self.name, "is eating.")

class Cat(Animal):
    def __init__(self, name, colour):
        super().__init__(name)
        self.colour = colour

    def show(self):
        print(self.name, "is", self.colour)

c = Cat("Mimi", "white")
c.eat()
c.show()`,
        output: "Mimi is eating.\nMimi is white",
      },
      {
        type: "list",
        items: [
          "The child class inherits the parent's methods and attributes.",
          "Write the parent name in brackets: class Child(Parent).",
          "Use super() to call the parent's methods, including __init__.",
          "The child can add new methods and its own attributes.",
        ],
      },
      {
        type: "note",
        text: "Inheritance models an is-a relationship. A dog is an animal, so Dog inheriting from Animal makes sense. If the relationship is has-a instead, for example a car has an engine, use a separate object stored as an attribute rather than inheritance.",
      },
      {
        type: "tip",
        text: "Use isinstance(object, Class) to check whether an object belongs to a class. An object of a child class is also an instance of its parent class.",
      },
    ],
    practice: [
      "Create a parent class Vehicle with a method start, and a child class Bike that adds a method ring_bell. Test both methods on a Bike object.",
      "Create a parent class Shape with an attribute colour, and a child class Square that adds a side attribute and an area method. Use super() in the child constructor.",
      "Check with isinstance whether your Square object is an instance of Shape and of Square, and print both results.",
    ],
    summary: [
      "Inheritance lets a child class reuse a parent class's code.",
      "The parent name goes in brackets after the child class name.",
      "super() calls the parent's methods, including its constructor.",
      "The child can add new methods and attributes of its own.",
    ],
  },
  {
    day: 62,
    title: "Access Modifiers in Python",
    intro:
      "This lesson teaches access modifiers, the naming rules that mark attributes as public, protected, or private. They matter because they tell other programmers which parts of a class are safe to use and which are internal details.",
    blocks: [
      { type: "heading", text: "Public, protected, and private" },
      {
        type: "para",
        text: "Python does not have strict access keywords like some other languages. Instead, it uses naming conventions. A normal name like name is public, and anyone can read or change it. A name with one leading underscore, like _balance, is protected: it is a signal that the attribute is for internal use and should not be touched from outside the class. A name with two leading underscores, like __pin, is private, and Python renames it behind the scenes so it is harder to reach from outside.",
      },
      {
        type: "para",
        text: "These are conventions, not locks. A protected attribute can still be read from outside, and a private one can still be reached through its renamed form. The point is communication: the underscores tell other programmers that the attribute is an internal detail that may change, so they should use the public methods instead.",
      },
      {
        type: "code",
        title: "Public and protected attributes",
        code: `class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self._balance = balance

    def show_balance(self):
        print(self.owner, "has balance", self._balance)

acc = BankAccount("Account Holder", 5000)
print(acc.owner)
print(acc._balance)
acc.show_balance()`,
        output:
          "Account Holder\n5000\nAccount Holder has balance 5000",
      },
      { type: "heading", text: "Private attributes and name mangling" },
      {
        type: "para",
        text: "When an attribute name starts with two underscores, Python changes its name inside the class to _ClassName__attribute. This is called name mangling. It stops a child class from accidentally overwriting a parent's private attribute with one of the same name. You can still reach the value through the mangled name, but you should not: the whole point is that it is an internal detail.",
      },
      {
        type: "code",
        title: "A private attribute with name mangling",
        code: `class BankAccount:
    def __init__(self, pin):
        self.__pin = pin

    def check_pin(self, entered):
        return entered == self.__pin

acc = BankAccount(1234)
print(acc.check_pin(1234))
print(acc.check_pin(9999))
print(acc._BankAccount__pin)`,
        output: "True\nFalse\n1234",
      },
      {
        type: "list",
        items: [
          "Public names have no leading underscore and are free to use.",
          "One leading underscore means protected: internal use only.",
          "Two leading underscores mean private: Python renames the attribute.",
          "These are conventions and signals, not strict locks.",
        ],
      },
      {
        type: "note",
        text: "Trying to read acc.__pin directly from outside the class raises an AttributeError, because inside the class the name has become _BankAccount__pin. Use a method like check_pin instead.",
      },
      {
        type: "tip",
        text: "Keep most attributes public while you are learning, and use a single underscore for values that only the class itself should change. Reach for double underscores only when a name clash with a child class is a real risk.",
      },
    ],
    practice: [
      "Create a class with a public attribute, a protected attribute, and a private attribute, then print each one from outside and note what happens.",
      "Add a public method to your class that reads the private attribute and returns it, and use the method instead of touching the attribute directly.",
      "Create a child class that defines its own double-underscore attribute with the same name as the parent's, and print both mangled names to see they do not clash.",
    ],
    summary: [
      "Public attributes have no underscore and are open to all.",
      "One underscore marks an attribute as protected, for internal use.",
      "Two underscores make it private through name mangling.",
      "Access modifiers are conventions that guide other programmers.",
    ],
  },
  {
    day: 63,
    title: "Snake Water Gun Game Solution",
    intro:
      "This lesson solves the Snake Water Gun game from Exercise 5, where the player faces the computer. It matters because it brings together random choices, conditions, loops, and score tracking in one complete game.",
    blocks: [
      { type: "heading", text: "The problem" },
      {
        type: "para",
        text: "Snake Water Gun is a game like Rock Paper Scissors. The player and the computer each pick one of three options: snake, water, or gun. Snake drinks water, so snake beats water. Water damages the gun, so water beats gun. Gun kills the snake, so gun beats snake. If both pick the same option, the round is a draw. The program plays three rounds: in each round it asks the player for a choice, picks a random choice for the computer, decides the winner, and updates the score, then prints the final score at the end.",
      },
      { type: "heading", text: "The approach" },
      {
        type: "para",
        text: "The computer's choice comes from random.choice on a list of the three options. A for loop runs the three rounds. Inside the loop, an if first checks for a draw, then an elif checks the three winning combinations for the player, and the else covers the computer winning. Two variables, one for each score, are updated as the rounds are played.",
      },
      {
        type: "code",
        title: "One round: deciding the winner",
        code: `player = "snake"
computer = "water"

if player == computer:
    print("Draw!")
elif (player == "snake" and computer == "water") or \\
        (player == "water" and computer == "gun") or \\
        (player == "gun" and computer == "snake"):
    print("You win this round!")
else:
    print("Computer wins this round!")`,
        output: "You win this round!",
      },
      { type: "heading", text: "The complete solution" },
      {
        type: "para",
        text: "The full program plays three rounds with fixed player choices, so the result is easy to check. The random.seed line makes the computer's choices the same every time the program runs, which is useful while testing. In a real game you would remove the seed and read the player's choice with input() instead.",
      },
      {
        type: "code",
        title: "Full game: three rounds with score tracking",
        code: `import random

random.seed(7)
choices = ["snake", "water", "gun"]
player_choices = ["snake", "water", "gun"]
player_score = 0
computer_score = 0

for player in player_choices:
    computer = random.choice(choices)
    print("You:", player, "| Computer:", computer)
    if player == computer:
        print("Draw!")
    elif (player == "snake" and computer == "water") or \\
            (player == "water" and computer == "gun") or \\
            (player == "gun" and computer == "snake"):
        print("You win this round!")
        player_score += 1
    else:
        print("Computer wins this round!")
        computer_score += 1

print("Final score - You:", player_score,
      "Computer:", computer_score)`,
        output:
          "You: snake | Computer: water\nYou win this round!\nYou: water | Computer: snake\nComputer wins this round!\nYou: gun | Computer: water\nComputer wins this round!\nFinal score - You: 1 Computer: 2",
      },
      {
        type: "list",
        items: [
          "Snake beats water, water beats gun, and gun beats snake.",
          "random.choice picks the computer's move from the list.",
          "The if-elif-else chain decides each round: draw, player win, or computer win.",
          "Score variables are updated inside the loop and printed at the end.",
        ],
      },
      {
        type: "note",
        text: "random.seed sets the starting point of the random choices, so the computer picks water, snake, water in that order every time. Remove the seed line when you want a different game on every run.",
      },
    ],
    practice: [
      "Run the full game, then change the seed to 3 and run it again. Note how the computer's choices change.",
      "Change the game to five rounds by adding two more player choices, and check the final score.",
      "Make the game interactive: ask the player for a choice with input() each round, and end the game early if the player types quit.",
    ],
    summary: [
      "Snake beats water, water beats gun, and gun beats snake.",
      "random.choice gives the computer a fair random move.",
      "A loop plays the rounds and if-elif-else decides each winner.",
      "Scores are kept in variables and shown at the end of the game.",
    ],
  },
  {
    day: 64,
    title: "Exercise 6 - Library Management System",
    intro:
      "This lesson sets the Library Management System exercise: a program that tracks which books a library owns and who has borrowed them. It matters because it is the first exercise that combines classes, lists, and dictionaries into one useful program.",
    blocks: [
      { type: "heading", text: "The problem" },
      {
        type: "para",
        text: "Build a Library class that manages a small library. The library keeps a list of the books it owns. A reader should be able to see all the books, borrow a book, return a book, and donate a new book to the library. The program must remember who borrowed each book, so the same book cannot be lent to two people at once. The class needs four methods. display_books shows every book in the library. lend_book takes a book name and a reader name, and lends the book only if the library owns it and nobody has borrowed it yet. add_book adds a new book to the list. return_book marks a borrowed book as returned.",
      },
      { type: "heading", text: "The approach" },
      {
        type: "para",
        text: "Two pieces of data do the whole job. A list called books holds the books the library owns. A dictionary called lent maps each borrowed book to the name of the person who has it. Checking whether a book is in the list tells you the library owns it, and checking whether it is a key in the dictionary tells you it is already out on loan.",
      },
      {
        type: "code",
        title: "The Library class with its four methods",
        code: `class Library:
    def __init__(self, books):
        self.books = books
        self.lent = {}

    def display_books(self):
        print("Books available:")
        for book in self.books:
            print("-", book)

    def lend_book(self, book, name):
        if book not in self.books:
            print("Sorry, this book is not in the library.")
        elif book in self.lent:
            print("Sorry, this book is already lent to",
                  self.lent[book])
        else:
            self.lent[book] = name
            print("Book lent to", name)

    def add_book(self, book):
        self.books.append(book)
        print("Book added:", book)

    def return_book(self, book):
        if book in self.lent:
            del self.lent[book]
            print("Book returned:", book)
        else:
            print("This book was not lent out.")

lib = Library(["Sample Book"])
print("Library created with", len(lib.books), "book.")`,
        output: "Library created with 1 book.",
      },
      { type: "heading", text: "Trying it out" },
      {
        type: "para",
        text: "The first test creates a library with three books, shows them, and lends one book. Lending the same book a second time must fail, because the dictionary already records that it is out. The second test checks the edge cases: lending a book the library does not own, returning a book that was never lent, and adding a new book.",
      },
      {
        type: "code",
        title: "Displaying books and lending one",
        code: `lib = Library(["Python Basics", "Data Science 101",
               "Web Design"])
lib.display_books()
lib.lend_book("Python Basics", "Reader One")
lib.lend_book("Python Basics", "Reader Two")`,
        output:
          "Books available:\n- Python Basics\n- Data Science 101\n- Web Design\nBook lent to Reader One\nSorry, this book is already lent to Reader One",
      },
      {
        type: "code",
        title: "Edge cases: unknown book, return, and donate",
        code: `lib = Library(["Python Basics", "Data Science 101"])
lib.lend_book("Unknown Book", "Reader One")
lib.return_book("Python Basics")
lib.lend_book("Python Basics", "Reader One")
lib.return_book("Python Basics")
lib.add_book("Machine Learning")
lib.display_books()`,
        output:
          "Sorry, this book is not in the library.\nThis book was not lent out.\nBook lent to Reader One\nBook returned: Python Basics\nBook added: Machine Learning\nBooks available:\n- Python Basics\n- Data Science 101\n- Machine Learning",
      },
      {
        type: "list",
        items: [
          "A list stores the books the library owns.",
          "A dictionary maps each borrowed book to the reader who has it.",
          "lend_book checks both: the book must exist and must not be out already.",
          "return_book removes the book from the dictionary.",
        ],
      },
    ],
    practice: [
      "Create a Library with four books of your own choosing and display them all.",
      "Lend one book to a reader, then try to lend the same book to another reader and check the message.",
      "Add a method called lent_books that prints every borrowed book and who has it, using the lent dictionary.",
    ],
    summary: [
      "The Library class manages books with a list and loans with a dictionary.",
      "display_books, lend_book, add_book, and return_book cover the whole job.",
      "A book can only be lent if the library owns it and it is not already out.",
      "Returning a book removes it from the lent dictionary.",
    ],
  },
  {
    day: 65,
    title: "Static Methods in Python",
    intro:
      "This lesson teaches static methods, methods that belong to a class but do not use any object data. They matter because they group helper functions with the class they relate to, without needing an object at all.",
    blocks: [
      { type: "heading", text: "What is a static method?" },
      {
        type: "para",
        text: "A static method is a method that does not take self and does not touch any object or class data. It is just a normal function that lives inside a class because it logically belongs there. You mark it with the @staticmethod decorator, and you can call it on the class itself or on an object.",
      },
      {
        type: "para",
        text: "Use a static method for a helper job that relates to the class but needs no data from any object. A maths helper that adds numbers, a checker that tests whether a year is a leap year, or a converter that changes units are all good examples. If the method needs object data, it should be a normal method instead.",
      },
      {
        type: "code",
        title: "Static methods called on the class",
        code: `class MathHelper:
    @staticmethod
    def add(a, b):
        return a + b

    @staticmethod
    def square(n):
        return n * n

print(MathHelper.add(4, 5))
print(MathHelper.square(6))
m = MathHelper()
print(m.add(1, 2))`,
        output: "9\n36\n3",
      },
      { type: "heading", text: "Static method or normal method?" },
      {
        type: "para",
        text: "The difference is what the method needs. A normal method uses self to read the object's data. A static method uses neither self nor the class, so it works the same no matter which object calls it, or even when no object exists. Calling a static method on the class, like MathHelper.add(4, 5), is the clearest way to show that no object is involved.",
      },
      {
        type: "code",
        title: "A normal method beside a static method",
        code: `class Greeter:
    def __init__(self, name):
        self.name = name

    def hello(self):
        print("Hello,", self.name)

    @staticmethod
    def welcome():
        print("Welcome to the class!")

g = Greeter("Learner One")
g.hello()
g.welcome()
Greeter.welcome()`,
        output:
          "Hello, Learner One\nWelcome to the class!\nWelcome to the class!",
      },
      {
        type: "list",
        items: [
          "A static method is marked with @staticmethod.",
          "It takes no self and uses no object data.",
          "Call it on the class or on an object; both work.",
          "Use it for helper jobs that belong with the class.",
        ],
      },
      {
        type: "note",
        text: "A static method cannot read or change class variables either. If the method needs data shared by the whole class, use a class method instead, which is covered in the Day 69 lesson.",
      },
      {
        type: "tip",
        text: "If you write a method and realise it never uses self, that is a sign it should probably be a static method. Making it static tells the reader at once that no object data is involved.",
      },
    ],
    practice: [
      "Create a class called Converter with a static method to_celsius that converts Fahrenheit to Celsius, and test it with 212 degrees.",
      "Add a static method is_even to a class called NumberTools that returns True for even numbers, and test it with 7 and 8.",
      "Write a class with one normal method and one static method, and call the static method on the class itself without making an object.",
    ],
    summary: [
      "Static methods are marked with @staticmethod and take no self.",
      "They do not use object data or class data.",
      "They can be called on the class or on an object.",
      "They are best for helper functions that belong with the class.",
    ],
  },
  {
    day: 66,
    title: "Instance Variables vs Class Variables",
    intro:
      "This lesson teaches the difference between instance variables, which belong to one object, and class variables, which are shared by all objects of a class. Mixing them up is a common source of bugs, so knowing the difference matters.",
    blocks: [
      { type: "heading", text: "Two kinds of variables" },
      {
        type: "para",
        text: "An instance variable is set inside a method, usually the constructor, with self, like self.name = name. Each object gets its own copy, so changing one object's name never affects another. A class variable is set directly inside the class body, outside any method, like school = 'City School'. It belongs to the class itself, and every object of that class shares the same value.",
      },
      {
        type: "para",
        text: "You can read a class variable through any object, or through the class itself. If you change it through the class, every object sees the new value at once. This makes class variables right for facts that are true for the whole class, like a school name or a default tax rate, and wrong for facts that differ per object, like a name or an age.",
      },
      {
        type: "code",
        title: "A shared class variable and per-object data",
        code: `class Student:
    school = "City School"

    def __init__(self, name):
        self.name = name

s1 = Student("Learner One")
s2 = Student("Learner Two")
print(s1.school)
print(s2.school)
Student.school = "Green School"
print(s1.school)
print(s2.school)
s1.name = "Learner Three"
print(s1.name)
print(s2.name)`,
        output:
          "City School\nCity School\nGreen School\nGreen School\nLearner Three\nLearner Two",
      },
      { type: "heading", text: "The shadowing trap" },
      {
        type: "para",
        text: "One trap catches many beginners. If you assign a value to a class variable through an object, like s1.school = 'Other School', Python does not change the shared value. It creates a new instance variable on that one object that hides, or shadows, the class variable. The other objects still see the old shared value, and the change looks like it worked only for one object. Always change a class variable through the class name, never through an object.",
      },
      {
        type: "code",
        title: "Changing a class variable the right way",
        code: `class Counter:
    count = 0

    def __init__(self):
        Counter.count += 1

a = Counter()
b = Counter()
print(Counter.count)
print(a.count)
a.count = 99
print(a.count)
print(b.count)
print(Counter.count)`,
        output: "2\n2\n99\n2\n2",
      },
      {
        type: "list",
        items: [
          "Instance variables are set with self and belong to one object.",
          "Class variables are set in the class body and shared by all objects.",
          "Change a class variable through the class name, not an object.",
          "Assigning through an object creates a shadowing instance variable instead.",
        ],
      },
      {
        type: "note",
        text: "A mutable class variable, like a list shared by all objects, is a classic bug: appending through one object changes it for every object. Keep shared lists as instance variables unless sharing is truly what you want.",
      },
      {
        type: "tip",
        text: "Ask one question when you pick: does this value differ for each object? If yes, it is an instance variable. If it is the same for every object, it can be a class variable.",
      },
    ],
    practice: [
      "Create a class with a class variable called pi set to 3.14 and an instance variable radius, then print the area for two different circles.",
      "Change your class variable through the class name and check that both objects see the new value.",
      "Create a class with a class variable count that increases by one in __init__, and print how many objects you have made.",
    ],
    summary: [
      "Instance variables belong to one object and are set with self.",
      "Class variables are set in the class body and shared by all objects.",
      "Change a class variable through the class name.",
      "Assigning through an object shadows the class variable instead of changing it.",
    ],
  },
  {
    day: 67,
    title: "Library Management System Solution",
    intro:
      "This lesson gives the complete solution to the Library Management System from Exercise 6. It matters because it shows how the class, the list, and the dictionary from Day 64 become a full program a user can run.",
    blocks: [
      { type: "heading", text: "The complete solution" },
      {
        type: "para",
        text: "The solution is the Library class from Day 64, plus a small menu that keeps running until the user chooses to quit. The menu prints five options: display the books, lend a book, add a book, return a book, or quit. It reads the choice with input() and calls the matching method. The class itself does not change at all, which shows why separating the logic from the menu is good design. Below is the class again, followed by a short demo run that exercises every method, including the mistakes a user can make. The demo is used instead of the menu here so the exact output can be shown.",
      },
      {
        type: "code",
        title: "The Library class, unchanged from the exercise",
        code: `class Library:
    def __init__(self, books):
        self.books = books
        self.lent = {}

    def display_books(self):
        print("Books available:")
        for book in self.books:
            print("-", book)

    def lend_book(self, book, name):
        if book not in self.books:
            print("Sorry, this book is not in the library.")
        elif book in self.lent:
            print("Sorry, this book is already lent to",
                  self.lent[book])
        else:
            self.lent[book] = name
            print("Book lent to", name)

    def add_book(self, book):
        self.books.append(book)
        print("Book added:", book)

    def return_book(self, book):
        if book in self.lent:
            del self.lent[book]
            print("Book returned:", book)
        else:
            print("This book was not lent out.")

lib = Library(["Python Basics"])
print("Library ready with", len(lib.books), "book.")`,
        output: "Library ready with 1 book.",
      },
      { type: "heading", text: "A full demo run" },
      {
        type: "para",
        text: "This run starts a library with two books, then walks through the whole story: a reader borrows a book, another reader is refused the same book, the first reader returns it, and a new book is donated. Each step prints exactly what the user would see.",
      },
      {
        type: "code",
        title: "Demo: borrow, refuse, return, donate",
        code: `lib = Library(["Python Basics", "Data Science 101"])
lib.display_books()
lib.lend_book("Python Basics", "Reader One")
lib.lend_book("Python Basics", "Reader Two")
lib.return_book("Python Basics")
lib.lend_book("Python Basics", "Reader Two")
lib.add_book("Machine Learning")
lib.display_books()`,
        output:
          "Books available:\n- Python Basics\n- Data Science 101\nBook lent to Reader One\nSorry, this book is already lent to Reader One\nBook returned: Python Basics\nBook lent to Reader Two\nBook added: Machine Learning\nBooks available:\n- Python Basics\n- Data Science 101\n- Machine Learning",
      },
      { type: "heading", text: "How it works, step by step" },
      {
        type: "para",
        text: "The lent dictionary is the memory of the program. Lending a book adds one entry, book to reader name. Returning a book deletes that entry. The two checks in lend_book guard the two ways lending can go wrong: the book is not owned, or it is already out. Because display_books only reads the books list, donating a book shows up in the very next display.",
      },
      {
        type: "list",
        items: [
          "The class holds the logic; a menu loop on top would handle the user.",
          "The lent dictionary is the single source of truth for loans.",
          "Every method prints a clear message, so the user always knows what happened.",
          "No method crashes on bad input: each bad case has its own message.",
        ],
      },
      {
        type: "note",
        text: "A real library program would save the books and loans to a file so they survive after the program ends. That is a natural next step: add save and load methods that write the lists to a file with the json module.",
      },
    ],
    practice: [
      "Run the demo, then add a lend_books method that prints every borrowed book and its reader, and call it after each step.",
      "Add a menu loop with input() offering the five options, and run the program yourself to borrow and return a book.",
      "Add a check so add_book refuses a book that is already in the library, with a clear message.",
    ],
    summary: [
      "The solution pairs the Library class with a menu that calls its methods.",
      "The lent dictionary records who has each borrowed book.",
      "Each method handles its own bad cases with a clear message.",
      "The class works on its own, which makes it easy to test and reuse.",
    ],
  },
  {
    day: 68,
    title: "Exercise 7 - Clear the Clutter",
    intro:
      "This lesson sets the Clear the Clutter exercise: a program that renames all the files in a folder to simple numbered names. It matters because it is a real everyday automation job, done with the os module.",
    blocks: [
      { type: "heading", text: "The problem" },
      {
        type: "para",
        text: "Imagine a folder full of files with messy names, like photo.png, notes.png, and scan.png. The job is to rename them all to clean numbered names: 1.png, 2.png, 3.png, and so on. Each file keeps its own extension, so a .png file stays a .png file, and a .jpg file stays a .jpg file. Only the name part changes. The program needs three tools from the os module. os.listdir gives the list of files in a folder. os.path.join builds a correct file path from a folder and a file name. os.rename changes a file's name. A loop with a counter walks through the files, builds the new name from the counter and the old extension, and renames each one.",
      },
      { type: "heading", text: "The approach" },
      {
        type: "para",
        text: "First, list the files and sort them so the numbering is the same on every run. Then, for each file, split off the extension with split on the dot, and join the counter with the extension to make the new name. Rename the file, print what changed, and add one to the counter. The example below first creates three demo files in a test folder, so you can run it safely without touching your real files.",
      },
      {
        type: "code",
        title: "Renaming every file in a folder to numbers",
        code: `import os

os.makedirs("clutter_demo", exist_ok=True)
for name in ["photo.png", "notes.png", "scan.png"]:
    open(os.path.join("clutter_demo", name), "w").close()

files = sorted(os.listdir("clutter_demo"))
for i, filename in enumerate(files, start=1):
    ext = filename.split(".")[-1]
    new_name = str(i) + "." + ext
    os.rename(os.path.join("clutter_demo", filename),
              os.path.join("clutter_demo", new_name))
    print(filename, "->", new_name)

print(sorted(os.listdir("clutter_demo")))`,
        output:
          "notes.png -> 1.png\nphoto.png -> 2.png\nscan.png -> 3.png\n['1.png', '2.png', '3.png']",
      },
      { type: "heading", text: "Renaming only one type of file" },
      {
        type: "para",
        text: "Often you only want to rename one kind of file, for example only the .png files, and leave everything else alone. An if with endswith checks the extension before renaming. The counter only increases for files that are actually renamed, so the numbers stay in order with no gaps.",
      },
      {
        type: "code",
        title: "Renaming only the .png files",
        code: `import os

os.makedirs("clutter_demo2", exist_ok=True)
for name in ["a.png", "b.jpg", "c.png", "readme.txt"]:
    open(os.path.join("clutter_demo2", name), "w").close()

files = sorted(os.listdir("clutter_demo2"))
count = 0
for filename in files:
    if filename.endswith(".png"):
        count += 1
        new_name = str(count) + ".png"
        os.rename(os.path.join("clutter_demo2", filename),
                  os.path.join("clutter_demo2", new_name))
        print(filename, "->", new_name)

print("Renamed", count, "files.")`,
        output: "a.png -> 1.png\nc.png -> 2.png\nRenamed 2 files.",
      },
      {
        type: "list",
        items: [
          "os.listdir lists the files in a folder.",
          "os.path.join builds safe file paths.",
          "os.rename changes a file's name.",
          "Sorting the list keeps the numbering the same on every run.",
          "endswith lets you rename only one kind of file.",
        ],
      },
      {
        type: "note",
        text: "Always test a renaming program on a copy of the folder first, or on demo files like the ones above. A rename cannot be undone with Ctrl+Z, and renaming the wrong folder can be hard to fix.",
      },
    ],
    practice: [
      "Create a test folder with five .txt files with messy names and rename them to 1.txt through 5.txt.",
      "Change your program to rename only .jpg files in a mixed folder, and print how many files were renamed.",
      "Add a check that skips files that are already numbered, like 1.png, so running the program twice does not break anything.",
    ],
    summary: [
      "Clear the Clutter renames files in a folder to numbered names.",
      "os.listdir, os.path.join, and os.rename do the whole job.",
      "Each file keeps its extension; only the name changes.",
      "Sort the file list so the numbering is stable on every run.",
    ],
  },
  {
    day: 69,
    title: "Class Methods in Python",
    intro:
      "This lesson teaches class methods, methods that work on the class itself instead of on one object. They matter because they can read and change data shared by every object of the class.",
    blocks: [
      { type: "heading", text: "What is a class method?" },
      {
        type: "para",
        text: "A class method is marked with the @classmethod decorator, and instead of self it takes cls as its first parameter. cls refers to the class itself, not to one object. That means a class method can read and change class variables, the data shared by all objects of the class. You can call it on the class or on an object, and either way cls is the class.",
      },
      {
        type: "para",
        text: "Compare the three kinds of methods. A normal method takes self and works on one object's data. A static method takes neither self nor cls and works on nothing but its arguments. A class method takes cls and works on the class and its shared data. Each kind has its own job, and picking the right one makes the code clearer.",
      },
      {
        type: "code",
        title: "A class method that changes shared data",
        code: `class Employee:
    company = "Tech Corp"

    def __init__(self, name):
        self.name = name

    @classmethod
    def change_company(cls, new_name):
        cls.company = new_name

e1 = Employee("Worker One")
e2 = Employee("Worker Two")
print(e1.company)
Employee.change_company("New Tech")
print(e1.company)
print(e2.company)`,
        output: "Tech Corp\nNew Tech\nNew Tech",
      },
      { type: "heading", text: "Reading class data through cls" },
      {
        type: "para",
        text: "A class method can also read class data, for example to count how many objects have been made. Because cls is the class, the method works even when it is called on an object, and it always sees the current shared value. This is safer than changing a class variable through an object, which only creates a shadowing instance variable, as the Day 66 lesson showed.",
      },
      {
        type: "code",
        title: "A class method that reports the object count",
        code: `class Counter:
    count = 0

    def __init__(self):
        Counter.count += 1

    @classmethod
    def show_count(cls):
        print("Total objects:", cls.count)

a = Counter()
b = Counter()
Counter.show_count()
a.show_count()`,
        output: "Total objects: 2\nTotal objects: 2",
      },
      {
        type: "list",
        items: [
          "A class method is marked with @classmethod.",
          "It takes cls, which refers to the class itself.",
          "It can read and change class variables shared by all objects.",
          "It can be called on the class or on an object.",
        ],
      },
      {
        type: "note",
        text: "Changing a class variable inside a class method changes it for every object at once, because cls.company = new_name writes to the class itself. That is the correct way to change shared data.",
      },
      {
        type: "tip",
        text: "The next lesson shows the most common use of class methods: alternative constructors, which create objects from data in a different format, like a string or a dictionary.",
      },
    ],
    practice: [
      "Create a class with a class variable discount set to 10, and a class method that changes the discount. Check that all objects see the new value.",
      "Create a class with a class variable that counts objects, and a class method that prints the count.",
      "Write one class with a normal method, a static method, and a class method, and call each one the right way.",
    ],
    summary: [
      "Class methods are marked with @classmethod and take cls.",
      "cls refers to the class, not to one object.",
      "They can read and change class variables shared by all objects.",
      "They work when called on the class or on an object.",
    ],
  },
  {
    day: 70,
    title: "Class Methods as Alternative Constructors",
    intro:
      "This lesson teaches how class methods act as alternative constructors, creating objects from data in a different format. It matters because real data often arrives as a string or a dictionary, not as neat separate arguments.",
    blocks: [
      { type: "heading", text: "One class, many ways to build an object" },
      {
        type: "para",
        text: "A class has one __init__, but sometimes you want to create an object from data that looks different, for example a string like Worker One-50000, or a dictionary with name and salary keys. An alternative constructor is a class method that takes that data, converts it into the arguments __init__ needs, and returns a new object. Because it uses cls to create the object, it works correctly even for child classes.",
      },
      {
        type: "para",
        text: "The pattern is always the same: the class method takes the raw data, splits or reads it into pieces, and returns cls with those pieces as arguments. The caller writes Employee.from_string(...) instead of Employee(...), which reads clearly and keeps the conversion logic inside the class, where it belongs.",
      },
      {
        type: "code",
        title: "Building an object from a string",
        code: `class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    @classmethod
    def from_string(cls, data):
        name, salary = data.split("-")
        return cls(name, int(salary))

    def show(self):
        print(self.name, "earns", self.salary)

e = Employee.from_string("Worker One-50000")
e.show()`,
        output: "Worker One earns 50000",
      },
      { type: "heading", text: "Building an object from a dictionary" },
      {
        type: "para",
        text: "Data from files and web services often comes as a dictionary, so from_dict is one of the most useful alternative constructors. It reads each value out of the dictionary by key and passes them to cls. If a key is missing, the code fails loudly with a clear error, which is better than silently creating an object with wrong data.",
      },
      {
        type: "code",
        title: "Building an object from a dictionary",
        code: `class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    @classmethod
    def from_dict(cls, data):
        return cls(data["name"], data["salary"])

    def show(self):
        print(self.name, "earns", self.salary)

e = Employee.from_dict({"name": "Worker Two",
                        "salary": 60000})
e.show()
print(type(e).__name__)`,
        output: "Worker Two earns 60000\nEmployee",
      },
      {
        type: "list",
        items: [
          "An alternative constructor is a class method that returns a new object.",
          "It converts data from another format into __init__ arguments.",
          "It uses cls, so it works for child classes too.",
          "Common examples are from_string and from_dict.",
        ],
      },
      {
        type: "note",
        text: "Using cls instead of the class name inside the method matters for inheritance. If a child class calls the same from_string method, cls is the child class, so the new object is of the child type, not the parent type.",
      },
      {
        type: "tip",
        text: "Name alternative constructors with from_ plus the source format: from_string, from_dict, from_list. Other programmers will understand at a glance what kind of data the method expects.",
      },
    ],
    practice: [
      "Create a class called Book with title and author, and a from_string constructor that splits a string like Title|Author on the | character.",
      "Add a from_dict constructor to your Book class and test it with a dictionary.",
      "Create a class called Point with x and y, and a from_list constructor that takes a list of two numbers.",
    ],
    summary: [
      "Alternative constructors are class methods that build objects from other formats.",
      "They convert the data, then return cls with the right arguments.",
      "from_string and from_dict are the most common examples.",
      "Using cls keeps them correct for child classes.",
    ],
  },
  {
    day: 71,
    title: "dir, __dict__ and help in Python",
    intro:
      "This lesson teaches three built-in tools for inspecting objects: dir, __dict__, and help. They matter because they let you look inside any object and find out what it can do, which is the fastest way to learn a new class.",
    blocks: [
      { type: "heading", text: "dir: what can this object do?" },
      {
        type: "para",
        text: "The dir function returns a list of all the attributes and methods an object has, including the ones it inherits. The list is long, because it also includes the special dunder methods that every object has. Filtering out the names that start with underscores leaves the useful ones: the attributes you set and the methods you wrote.",
      },
      {
        type: "code",
        title: "Listing an object's useful attributes",
        code: `class Dog:
    """A simple dog class."""

    def __init__(self, name):
        self.name = name

    def bark(self):
        print("Woof!")

d = Dog("Buddy")
print([item for item in dir(d)
       if not item.startswith("__")])
print(Dog.__doc__)`,
        output: "['bark', 'name']\nA simple dog class.",
      },
      { type: "heading", text: "__dict__: what data does this object hold?" },
      {
        type: "para",
        text: "Every object has a __dict__ attribute, which is a dictionary of the instance variables that object currently holds. It shows exactly what data lives inside the object and nothing else: methods are not stored there, because they belong to the class. A class also has its own __dict__, which holds the class variables and methods defined in that class.",
      },
      {
        type: "code",
        title: "Reading the instance and class dictionaries",
        code: `class Student:
    school = "City School"

    def __init__(self, name):
        self.name = name

s = Student("Learner One")
print(s.__dict__)
print(Student.__dict__["school"])
print([item for item in dir(s)
       if not item.startswith("_")])`,
        output: "{'name': 'Learner One'}\nCity School\n['name', 'school']",
      },
      { type: "heading", text: "help: read the documentation" },
      {
        type: "para",
        text: "The help function prints the documentation for any object, class, or function, including its docstring and the list of its methods. In the editor you can call help on a class to read what it does without opening any other page. Writing a clear docstring at the top of your own classes, like the one on the Dog class above, makes help useful for anyone who reads your code later.",
      },
      {
        type: "list",
        items: [
          "dir(object) lists everything the object can do and hold.",
          "object.__dict__ shows the instance variables and their values.",
          "Class.__dict__ shows the class variables and methods.",
          "help(object) prints the documentation, including docstrings.",
        ],
      },
      {
        type: "note",
        text: "dir returns a sorted list of names as strings, not the values. Use it to discover names, then read the value with a dot, or inspect it with __dict__ when you want the stored data.",
      },
    ],
    practice: [
      "Create a class with two attributes and one method, then print dir on an object with the dunder names filtered out.",
      "Print the __dict__ of your object, then change one attribute and print __dict__ again to see the change.",
      "Write a docstring for your class and print ClassName.__doc__ to check it shows up.",
    ],
    summary: [
      "dir lists the attributes and methods of an object.",
      "__dict__ holds the instance variables and their values.",
      "A class has its own __dict__ with class variables and methods.",
      "help prints documentation, and docstrings make it useful.",
    ],
  },
  {
    day: 72,
    title: "The super Keyword in Python",
    intro:
      "This lesson teaches super, the built-in function that reaches the parent class from inside a child class. It matters because it lets the child reuse the parent's work instead of copying it.",
    blocks: [
      { type: "heading", text: "What does super do?" },
      {
        type: "para",
        text: "When a child class defines a method that the parent also has, the child's version replaces the parent's version. But often the child does not want to replace the parent's work, it wants to add to it. super() gives access to the parent class, so the child can call the parent's method and then do its own extra work. This keeps the shared logic in one place.",
      },
      {
        type: "para",
        text: "The most common use is in the constructor. The child's __init__ calls super().__init__ with the values the parent needs, then sets up its own extra attributes. Without super, the child would have to repeat the parent's setup code, and any change to the parent would have to be made in two places.",
      },
      {
        type: "code",
        title: "Calling the parent constructor with super()",
        code: `class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        print(self.name, "makes a sound.")

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)
        self.breed = breed

    def speak(self):
        super().speak()
        print(self.name, "says woof!")

d = Dog("Buddy", "Labrador")
d.speak()
print(d.breed)`,
        output: "Buddy makes a sound.\nBuddy says woof!\nLabrador",
      },
      { type: "heading", text: "Extending a method instead of replacing it" },
      {
        type: "para",
        text: "The same pattern works for any method. The child calls the parent's version with super().method(), then adds its own lines after it. The result is the parent's behaviour plus the child's extra behaviour, in that order. This is how real programs grow: each level adds a little without rewriting what already works.",
      },
      {
        type: "code",
        title: "Extending the parent's show method",
        code: `class Person:
    def __init__(self, name):
        self.name = name

    def show(self):
        print("Name:", self.name)

class Employee(Person):
    def __init__(self, name, salary):
        super().__init__(name)
        self.salary = salary

    def show(self):
        super().show()
        print("Salary:", self.salary)

e = Employee("Worker One", 50000)
e.show()`,
        output: "Name: Worker One\nSalary: 50000",
      },
      {
        type: "list",
        items: [
          "super() gives access to the parent class from a child class.",
          "Use it in __init__ to run the parent's setup.",
          "Use it in other methods to extend the parent's behaviour.",
          "It keeps shared logic in one place instead of copying it.",
        ],
      },
      {
        type: "note",
        text: "In Python 3, plain super() with no arguments works inside a method and finds the parent automatically. The older form, super(Child, self), does the same job but is longer and is rarely needed now.",
      },
      {
        type: "tip",
        text: "When you write a child constructor, make super().__init__ the first line. That way the parent's attributes exist before the child adds its own, and nothing in the child depends on setup that has not run yet.",
      },
    ],
    practice: [
      "Create a parent class Shape with a colour attribute and a describe method, and a child class Circle that adds a radius and extends describe with super().",
      "Create a three-level chain of classes where each __init__ calls super().__init__, and print an attribute from each level.",
      "Write a child method that calls the parent method with super() first, then adds one more line of its own.",
    ],
    summary: [
      "super() reaches the parent class from inside a child class.",
      "It is most often used to call the parent's constructor.",
      "It lets a child extend a method instead of replacing it.",
      "It keeps shared logic written once, in the parent.",
    ],
  },
  {
    day: 73,
    title: "Magic and Dunder Methods in Python",
    intro:
      "This lesson teaches magic methods, also called dunder methods because of their double underscores. They matter because they let your own classes work with Python's built-in tools like print, len, and the plus sign.",
    blocks: [
      { type: "heading", text: "What is a dunder method?" },
      {
        type: "para",
        text: "A dunder method is a special method whose name starts and ends with two underscores, like __init__, __str__, or __len__. Python calls these methods automatically in response to built-in behaviour. When you write print(object), Python calls the object's __str__ method. When you write len(object), it calls __len__. You have already used __init__; it is simply the dunder method that runs when an object is created.",
      },
      {
        type: "para",
        text: "Defining these methods in your class makes your objects behave like built-in types. A Book object can print nicely, a Team object can report its size with len, and a Point object can be added with +. Without dunder methods, print shows a useless memory address, and len raises an error.",
      },
      {
        type: "code",
        title: "__str__ and __len__ for a Book class",
        code: `class Book:
    def __init__(self, title, pages):
        self.title = title
        self.pages = pages

    def __str__(self):
        return self.title + " (" + str(self.pages) + " pages)"

    def __len__(self):
        return self.pages

b = Book("Python Basics", 250)
print(b)
print(len(b))`,
        output: "Python Basics (250 pages)\n250",
      },
      { type: "heading", text: "Adding objects with __add__" },
      {
        type: "para",
        text: "The __add__ method runs when you use the + sign between two objects. It takes self and the other object, and returns whatever the sum should be. For a Point class, adding means adding the x values together and the y values together, and returning a new Point. The original points are not changed, which matches how adding numbers works.",
      },
      {
        type: "code",
        title: "__add__ for a Point class",
        code: `class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Point(self.x + other.x, self.y + other.y)

    def __str__(self):
        return "(" + str(self.x) + ", " + str(self.y) + ")"

p1 = Point(1, 2)
p2 = Point(3, 4)
print(p1 + p2)`,
        output: "(4, 6)",
      },
      {
        type: "list",
        items: [
          "__str__ controls what print shows for an object.",
          "__len__ controls what len returns for an object.",
          "__add__ controls what the + sign does between two objects.",
          "__eq__ controls what == means, and __init__ runs at creation.",
          "Python calls these methods automatically; you only define them.",
        ],
      },
      {
        type: "note",
        text: "__str__ must return a string, and __len__ must return a whole number that is zero or more. If they return the wrong type, Python raises a TypeError when the built-in function is used.",
      },
      {
        type: "tip",
        text: "Add __str__ to every class you write. It costs three lines and makes debugging far easier, because every print of your object shows useful information instead of a memory address.",
      },
    ],
    practice: [
      "Add a __str__ method to a class of your own and print an object of it.",
      "Create a class called Team with a list of members and a __len__ method that returns how many members there are.",
      "Create a class called Money with an amount attribute and an __add__ method that returns a new Money object with the amounts added.",
    ],
    summary: [
      "Dunder methods have double underscores and Python calls them automatically.",
      "__str__ decides what print shows for an object.",
      "__len__ decides what len returns.",
      "__add__ decides what + does between two objects.",
    ],
  },
  {
    day: 74,
    title: "Method Overriding in Python",
    intro:
      "This lesson teaches method overriding, where a child class gives a new version of a method it inherited. It matters because it lets each child behave in its own way while still sharing the parent's interface.",
    blocks: [
      { type: "heading", text: "What is method overriding?" },
      {
        type: "para",
        text: "When a child class defines a method with the same name as a method in its parent class, the child's version wins. This is called overriding. The parent's method still exists, but any call on a child object runs the child's version. The classic example is animals: the parent Animal has a speak method, and Dog and Cat each override it with their own sound.",
      },
      {
        type: "para",
        text: "Overriding is powerful because code that works with the parent class also works with any child class. A loop can call speak on a list of different animals, and each one answers in its own way. This idea, that one call can behave differently for different objects, is called polymorphism, and overriding is how it is done in Python.",
      },
      {
        type: "code",
        title: "Each animal overrides speak",
        code: `class Animal:
    def speak(self):
        print("The animal makes a sound.")

class Dog(Animal):
    def speak(self):
        print("The dog says woof!")

class Cat(Animal):
    def speak(self):
        print("The cat says meow!")

for animal in [Animal(), Dog(), Cat()]:
    animal.speak()`,
        output:
          "The animal makes a sound.\nThe dog says woof!\nThe cat says meow!",
      },
      { type: "heading", text: "Overriding and extending together" },
      {
        type: "para",
        text: "Overriding does not have to throw the parent's version away. The child can call the parent's method with super() and then add its own behaviour, as the Day 72 lesson showed. This is the best of both: the shared part stays in the parent, and the child only adds what is different. Choose full replacement when the child's behaviour is completely different, and extension when it builds on the parent's.",
      },
      {
        type: "code",
        title: "Overriding while keeping the parent's work",
        code: `class Vehicle:
    def start(self):
        print("Vehicle starting.")

class Bike(Vehicle):
    def start(self):
        super().start()
        print("Bike is ready to ride.")

b = Bike()
b.start()`,
        output: "Vehicle starting.\nBike is ready to ride.",
      },
      {
        type: "list",
        items: [
          "Overriding means a child class redefines a parent's method.",
          "The child's version runs when the method is called on a child object.",
          "The same call can behave differently for different objects.",
          "Use super() inside the override to keep the parent's behaviour too.",
        ],
      },
      {
        type: "note",
        text: "Python does not check that the method you override actually exists in the parent. If you misspell the method name, you silently create a new method instead of overriding, and the parent's version keeps running. Check the spelling carefully.",
      },
      {
        type: "tip",
        text: "Keep the method name and its parameters the same as the parent's when you override. Code that calls the method should not need to know whether the object is a parent or a child.",
      },
    ],
    practice: [
      "Create a parent class Shape with an area method, and child classes Square and Circle that override it with their own formulas.",
      "Make a list of mixed Shape objects and call area on each one in a loop.",
      "Override a method in a child class but call the parent version with super() first, then add an extra line.",
    ],
    summary: [
      "Overriding gives a child class its own version of a parent method.",
      "The child's version runs for child objects.",
      "One method call can behave differently for different objects.",
      "super() lets an override extend the parent instead of replacing it.",
    ],
  },
  {
    day: 75,
    title: "Clear the Clutter Solution and Shoutouts",
    intro:
      "This lesson gives the complete solution to the Clear the Clutter exercise from Day 68, and the video also gives shoutouts to learners who solved it. It matters because it turns the renaming idea into a finished, reusable program.",
    blocks: [
      { type: "heading", text: "The complete solution" },
      {
        type: "para",
        text: "The solution wraps the renaming logic from Day 68 inside a function called clear_clutter that takes a folder and an extension. The function lists the files, sorts them, and renames only the files that end with the given extension. Other files are left exactly as they are. Because the logic lives in a function, the same program can clean any folder and any file type by calling it with different arguments. The demo below creates a test folder with three .png files and one .txt file, then calls clear_clutter for the .png files. The .txt file is untouched, which is exactly what the exercise asks for. In a real run you would call the function with your own folder path instead of the demo folder.",
      },
      {
        type: "code",
        title: "The finished clear_clutter function",
        code: `import os

def clear_clutter(folder, ext):
    files = sorted(os.listdir(folder))
    count = 0
    for filename in files:
        if filename.endswith(ext):
            count += 1
            new_name = str(count) + ext
            os.rename(os.path.join(folder, filename),
                      os.path.join(folder, new_name))
            print(filename, "->", new_name)
    print("Renamed", count, "files.")

os.makedirs("clutter_final", exist_ok=True)
for name in ["img1.png", "img2.png", "notes.txt", "img3.png"]:
    open(os.path.join("clutter_final", name), "w").close()

clear_clutter("clutter_final", ".png")
print(sorted(os.listdir("clutter_final")))`,
        output:
          "img1.png -> 1.png\nimg2.png -> 2.png\nimg3.png -> 3.png\nRenamed 3 files.\n['1.png', '2.png', '3.png', 'notes.txt']",
      },
      { type: "heading", text: "Getting the extension right" },
      {
        type: "para",
        text: "Splitting a file name on the dot works, but it breaks for names that contain dots, like my.photo.png. The os.path.splitext function handles this correctly: it splits off only the last extension and leaves the rest of the name alone. Use it whenever you need the extension of a file, because it is built for exactly this job.",
      },
      {
        type: "code",
        title: "Splitting a name with dots using splitext",
        code: `import os

filename = "my.photo.png"
name, ext = os.path.splitext(filename)
print(name)
print(ext)`,
        output: "my.photo\n.png",
      },
      { type: "heading", text: "How it works, step by step" },
      {
        type: "para",
        text: "Sorting the file list first keeps the numbering stable, so the same folder always gets the same result. The counter only increases for files that match the extension, so the numbers have no gaps. The function prints each rename as it happens, so the user can see exactly what changed, and prints a final count at the end. The shoutouts in the video celebrate learners who finished this exercise and shared their solutions.",
      },
      {
        type: "list",
        items: [
          "The logic lives in a function that takes a folder and an extension.",
          "Only files matching the extension are renamed; the rest are untouched.",
          "Sorting first keeps the numbering the same on every run.",
          "os.path.splitext gets the extension safely, even with dots in the name.",
        ],
      },
      {
        type: "note",
        text: "Renaming is permanent, so always run the program on a copy of the folder the first time. If the folder also contains files with names like 1.png already, the program will rename over them, so check the folder contents before you run it.",
      },
    ],
    practice: [
      "Run the solution on a test folder of your own with mixed file types, and check that only the chosen type is renamed.",
      "Change clear_clutter to use os.path.splitext for the extension instead of endswith, and test it on a file named my.photo.png.",
      "Add an input() prompt so the program asks for the folder path and the extension before it starts renaming.",
    ],
    summary: [
      "The solution is a function that renames files of one type to numbers.",
      "Sorting keeps the numbering stable and the counter skips other files.",
      "os.path.splitext reads the extension safely.",
      "Always test on a copy of the folder before renaming real files.",
    ],
  },
  {
    day: 76,
    title: "Exercise 8 - Merge the PDF",
    intro:
      "This lesson sets the Merge the PDF exercise: a program that joins several PDF files into one. It matters because it is a real document job, and it teaches how to work with files and an outside library.",
    blocks: [
      { type: "heading", text: "The problem" },
      {
        type: "para",
        text: "You have several PDF files, for example chapter one and chapter two of a document, and you want one single PDF that contains all of them in order. The program should take the list of files, read the pages from each one, and write them all into a new file. At the end it should report how many files were merged and how many pages the result has. Python cannot read PDFs on its own, so the exercise uses the pypdf library. Install it with pip install pypdf. The older library PyPDF2 works in a similar way, and the video uses it, but pypdf is the version that is still maintained today. Both give you a PdfReader for reading pages and a PdfWriter for writing them out.",
      },
      { type: "heading", text: "The approach" },
      {
        type: "para",
        text: "Create one PdfWriter to hold the result. Loop through the file names, open each one with PdfReader, and add every page to the writer with add_page. When the loop is done, open the output file in write-binary mode and call writer.write to save it. A final PdfReader on the result confirms the page count, so the user can see the merge worked.",
      },
      {
        type: "code",
        title: "Merging two PDFs into one",
        code: `from pypdf import PdfWriter, PdfReader

def make_pdf(filename):
    writer = PdfWriter()
    writer.add_blank_page(width=200, height=200)
    with open(filename, "wb") as f:
        writer.write(f)

make_pdf("one.pdf")
make_pdf("two.pdf")

merger = PdfWriter()
for filename in ["one.pdf", "two.pdf"]:
    reader = PdfReader(filename)
    for page in reader.pages:
        merger.add_page(page)
with open("merged.pdf", "wb") as f:
    merger.write(f)

result = PdfReader("merged.pdf")
print("Merged 2 files into merged.pdf")
print("Total pages:", len(result.pages))`,
        output: "Merged 2 files into merged.pdf\nTotal pages: 2",
      },
      { type: "heading", text: "Reading pages from a PDF" },
      {
        type: "para",
        text: "A PdfReader turns a file into an object you can inspect. Its pages attribute is a list of the pages, so len(reader.pages) gives the page count. You can also read the text of a page with page.extract_text, which is useful when you want to check what a PDF contains before you merge it.",
      },
      {
        type: "code",
        title: "Checking the page count of each file first",
        code: `from pypdf import PdfReader

for filename in ["one.pdf", "two.pdf"]:
    reader = PdfReader(filename)
    print(filename, "has", len(reader.pages), "page")`,
        output: "one.pdf has 1 page\ntwo.pdf has 1 page",
      },
      {
        type: "list",
        items: [
          "Install the library first: pip install pypdf.",
          "PdfReader reads a PDF; PdfWriter builds a new one.",
          "Add every page from every file to one writer, in order.",
          "Open the output file in wb mode and call writer.write.",
          "Reopen the result to confirm the total page count.",
        ],
      },
      {
        type: "note",
        text: "The demo above creates two small blank PDFs first, so you can run the merge without having real PDF files on your computer. In the real exercise you would skip the make_pdf step and merge your own files instead.",
      },
    ],
    practice: [
      "Install pypdf, create two small PDFs with the make_pdf function, and merge them into one file.",
      "Print the page count of each input file before merging, and the page count of the result after.",
      "Change the order of the files in the list and merge again, then check that the page order follows the list.",
    ],
    summary: [
      "Merge the PDF joins several PDF files into one, in order.",
      "The pypdf library provides PdfReader and PdfWriter.",
      "Pages from each file are added to one writer, then saved.",
      "Always check the result's page count to confirm the merge.",
    ],
  },
  {
    day: 77,
    title: "Operator Overloading in Python",
    intro:
      "This lesson teaches operator overloading, giving your own classes the ability to use operators like +, -, and ==. It matters because it makes objects behave naturally, just like numbers and strings do.",
    blocks: [
      { type: "heading", text: "What is operator overloading?" },
      {
        type: "para",
        text: "Operator overloading means defining what an operator does when it is used with your objects. The + sign normally adds numbers, but for your own class it does nothing unless you tell Python what it means. You do that with dunder methods: __add__ for +, __sub__ for -, __eq__ for ==, and __gt__ for the greater-than sign. Python calls the matching method automatically when the operator is used.",
      },
      {
        type: "para",
        text: "The rule for a good overload is that it should do what the reader expects. Adding two vectors should give a new vector with the parts added. Comparing two boxes should compare their weights. If the operator does something surprising, the code becomes harder to read, not easier.",
      },
      {
        type: "code",
        title: "Adding and subtracting vectors",
        code: `class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __sub__(self, other):
        return Vector(self.x - other.x, self.y - other.y)

    def __str__(self):
        return "(" + str(self.x) + ", " + str(self.y) + ")"

v1 = Vector(5, 3)
v2 = Vector(2, 1)
print(v1 + v2)
print(v1 - v2)`,
        output: "(7, 4)\n(3, 2)",
      },
      { type: "heading", text: "Overloading comparisons" },
      {
        type: "para",
        text: "Comparison operators work the same way. __eq__ decides what == means, and __gt__ decides what the greater-than sign means. Both take self and the other object, and both must return True or False. Once they are defined, your objects can be compared and even sorted with the same code you would use for plain numbers.",
      },
      {
        type: "code",
        title: "Comparing boxes by weight",
        code: `class Box:
    def __init__(self, weight):
        self.weight = weight

    def __eq__(self, other):
        return self.weight == other.weight

    def __gt__(self, other):
        return self.weight > other.weight

b1 = Box(10)
b2 = Box(15)
print(b1 == b2)
print(b1 > b2)
print(b2 > b1)`,
        output: "False\nFalse\nTrue",
      },
      {
        type: "list",
        items: [
          "__add__ defines +, __sub__ defines -, __mul__ defines *.",
          "__eq__ defines == and __gt__ defines the greater-than sign.",
          "These methods take self and the other object.",
          "Return a new object for maths, and True or False for comparisons.",
          "Overload only when the meaning is obvious to the reader.",
        ],
      },
      {
        type: "note",
        text: "When you define __eq__, Python also uses it for checks like object in list. If two objects should count as equal, __eq__ is the method that decides it.",
      },
      {
        type: "tip",
        text: "Pair __str__ with your operator overloads. When print shows a clear result like (7, 4), testing the operators becomes much easier.",
      },
    ],
    practice: [
      "Add a __mul__ method to the Vector class that multiplies both parts by a number, and test it with Vector(2, 3) times 4.",
      "Create a class called Money with an amount, and overload __add__ so two Money objects add their amounts.",
      "Create a class called Student with marks, and overload __gt__ so students can be compared by their marks.",
    ],
    summary: [
      "Operator overloading defines what operators do with your objects.",
      "Dunder methods like __add__ and __eq__ carry the definitions.",
      "Maths operators should return a new object.",
      "Comparison operators should return True or False.",
    ],
  },
  {
    day: 78,
    title: "Single Inheritance in Python",
    intro:
      "This lesson teaches single inheritance, where one child class inherits from one parent class. It matters because it is the most common kind of inheritance, and the foundation for all the other kinds.",
    blocks: [
      { type: "heading", text: "One parent, one child" },
      {
        type: "para",
        text: "Single inheritance means a class has exactly one parent. The child takes everything from that parent and adds its own special features. A Car inherits from Vehicle: it gets the brand and the start method from Vehicle, and adds its own number of seats. Nothing else is involved, which keeps the design simple and easy to follow.",
      },
      {
        type: "para",
        text: "The child constructor calls super().__init__ to run the parent's setup, then stores its own extra data. The child can also override a parent method when its behaviour needs to be different, and it can add brand new methods that only make sense for that child.",
      },
      {
        type: "code",
        title: "A Car inheriting from a Vehicle",
        code: `class Vehicle:
    def __init__(self, brand):
        self.brand = brand

    def start(self):
        print(self.brand, "is starting.")

class Car(Vehicle):
    def __init__(self, brand, seats):
        super().__init__(brand)
        self.seats = seats

    def show(self):
        print(self.brand, "has", self.seats, "seats.")

c = Car("City Motors", 5)
c.start()
c.show()`,
        output: "City Motors is starting.\nCity Motors has 5 seats.",
      },
      { type: "heading", text: "Checking the relationship" },
      {
        type: "para",
        text: "Two built-in functions help you check inheritance. isinstance(object, Class) tells you whether an object belongs to a class, and a child object is an instance of its parent class too. issubclass(Child, Parent) tells you whether one class inherits from another. These are handy in tests and in code that needs to handle different types safely.",
      },
      {
        type: "code",
        title: "isinstance and issubclass with one parent",
        code: `class Animal:
    def eat(self):
        print("Eating.")

class Dog(Animal):
    pass

d = Dog()
d.eat()
print(isinstance(d, Dog))
print(isinstance(d, Animal))
print(issubclass(Dog, Animal))`,
        output: "Eating.\nTrue\nTrue\nTrue",
      },
      {
        type: "list",
        items: [
          "Single inheritance means one child class and one parent class.",
          "The child inherits the parent's methods and attributes.",
          "The child constructor calls super().__init__ for the parent's setup.",
          "isinstance checks an object; issubclass checks a class.",
        ],
      },
      {
        type: "note",
        text: "A child object is an instance of every class above it in the chain. A Dog is an instance of Dog, of Animal, and of object, the class every Python class inherits from.",
      },
      {
        type: "tip",
        text: "Prefer single inheritance when you are learning. It covers most real designs, and the more complex kinds in the next lessons are only needed when one parent genuinely is not enough.",
      },
    ],
    practice: [
      "Create a parent class Person and a child class Teacher that adds a subject attribute and a teach method.",
      "Create a parent class Shape and a child class Rectangle with length and width, and an area method.",
      "Use isinstance to check whether your Rectangle object is an instance of Shape, and issubclass to check the classes.",
    ],
    summary: [
      "Single inheritance is one child class from one parent class.",
      "The child reuses the parent's code and adds its own features.",
      "super().__init__ runs the parent's constructor.",
      "A child object is also an instance of its parent class.",
    ],
  },
  {
    day: 79,
    title: "Multiple Inheritance in Python",
    intro:
      "This lesson teaches multiple inheritance, where one child class inherits from two or more parent classes. It matters because sometimes a class genuinely needs abilities from two different sources at once.",
    blocks: [
      { type: "heading", text: "One child, several parents" },
      {
        type: "para",
        text: "In multiple inheritance, a child class lists more than one parent in its brackets: class Child(Father, Mother). The child gets the methods and attributes of all of them. A child can work like its father and cook like its mother, because both sets of methods are available on the same object. This is useful when the parents describe different abilities rather than the same kind of thing.",
      },
      {
        type: "para",
        text: "When two parents have a method with the same name, Python must choose one. It follows the method resolution order, or MRO, which is the order the parents are listed in, from left to right. The first parent's method wins. You can see the full order with Class.__mro__, which lists every class Python checks, ending with object.",
      },
      {
        type: "code",
        title: "A child with two parents",
        code: `class Father:
    def work(self):
        print("Father works.")

    def skill(self):
        print("Father's skill: gardening.")

class Mother:
    def cook(self):
        print("Mother cooks.")

    def skill(self):
        print("Mother's skill: painting.")

class Child(Father, Mother):
    pass

c = Child()
c.work()
c.cook()
c.skill()
print([cls.__name__ for cls in Child.__mro__])`,
        output:
          "Father works.\nMother cooks.\nFather's skill: gardening.\n['Child', 'Father', 'Mother', 'object']",
      },
      { type: "heading", text: "The order decides the winner" },
      {
        type: "para",
        text: "The MRO is a simple rule: Python checks the child first, then the parents from left to right, then their parents, and so on. In a chain where several classes define the same method, the first one found in that order is the one that runs. Listing the MRO is the fastest way to understand why a particular version of a method was chosen.",
      },
      {
        type: "code",
        title: "MRO with a shared method in several classes",
        code: `class A:
    def show(self):
        print("From A")

class B(A):
    def show(self):
        print("From B")

class C(A):
    def show(self):
        print("From C")

class D(B, C):
    pass

d = D()
d.show()
print([cls.__name__ for cls in D.__mro__])`,
        output: "From B\n['D', 'B', 'C', 'A', 'object']",
      },
      {
        type: "list",
        items: [
          "Multiple inheritance lists two or more parents in the brackets.",
          "The child gets the methods of every parent.",
          "When methods clash, the first parent listed wins.",
          "Class.__mro__ shows the exact order Python searches.",
        ],
      },
      {
        type: "note",
        text: "Multiple inheritance can get confusing when parents share method names or both define __init__. Use it only when the parents describe clearly different abilities, and keep each parent small and focused.",
      },
      {
        type: "tip",
        text: "When a method call behaves unexpectedly in a class with several parents, print the MRO first. It shows the exact search order and usually explains the surprise at once.",
      },
    ],
    practice: [
      "Create two parent classes, one with a read method and one with a write method, and a child that inherits both. Call both methods on the child.",
      "Give both parents a method with the same name, then check which parent's version runs and why, using the MRO.",
      "Swap the order of the parents in the brackets and run the program again to see the result change.",
    ],
    summary: [
      "Multiple inheritance gives a child several parents at once.",
      "The child inherits the methods of every parent.",
      "Clashes are settled by the method resolution order, left to right.",
      "Class.__mro__ shows the exact search order.",
    ],
  },
  {
    day: 80,
    title: "Multilevel Inheritance in Python",
    intro:
      "This lesson teaches multilevel inheritance, where classes form a chain: a child inherits from a parent, and a grandchild inherits from that child. It matters because real designs often grow in layers, each one adding a little more.",
    blocks: [
      { type: "heading", text: "A chain of classes" },
      {
        type: "para",
        text: "In multilevel inheritance, each class builds on the one above it. Animal defines eating, Dog inherits eating and adds barking, and Puppy inherits both and adds playing. The grandchild at the bottom of the chain can use everything from every level above it, while each level only knows about its own additions.",
      },
      {
        type: "para",
        text: "This layering keeps each class small. Animal does not need to know about barking, and Dog does not need to know about playing. New behaviour is added by adding a new level, not by changing the classes that already work.",
      },
      {
        type: "code",
        title: "A three-level chain: Animal, Dog, Puppy",
        code: `class Animal:
    def __init__(self, name):
        self.name = name

    def eat(self):
        print(self.name, "is eating.")

class Dog(Animal):
    def bark(self):
        print(self.name, "says woof!")

class Puppy(Dog):
    def play(self):
        print(self.name, "is playing.")

p = Puppy("Buddy")
p.eat()
p.bark()
p.play()
print(isinstance(p, Animal))`,
        output: "Buddy is eating.\nBuddy says woof!\nBuddy is playing.\nTrue",
      },
      { type: "heading", text: "Constructors down the chain" },
      {
        type: "para",
        text: "When every level has its own constructor, each one calls super().__init__ with the values the level above needs, then adds its own data. The call travels up the chain, so the top-level setup runs first and each level adds its piece in turn. A Manager is an Employee, and an Employee is a Person, so the chain sets up the name, then the salary, then the team.",
      },
      {
        type: "code",
        title: "Constructors calling super() up the chain",
        code: `class Person:
    def __init__(self, name):
        self.name = name

class Employee(Person):
    def __init__(self, name, salary):
        super().__init__(name)
        self.salary = salary

class Manager(Employee):
    def __init__(self, name, salary, team):
        super().__init__(name, salary)
        self.team = team

    def show(self):
        print(self.name, "earns", self.salary,
              "and leads", self.team)

m = Manager("Worker One", 80000, "Team A")
m.show()`,
        output: "Worker One earns 80000 and leads Team A",
      },
      {
        type: "list",
        items: [
          "Multilevel inheritance is a chain: grandchild from child from parent.",
          "Each level inherits everything from the levels above it.",
          "Each level adds only its own new behaviour.",
          "Constructors call super().__init__ to set up each level in turn.",
        ],
      },
      {
        type: "note",
        text: "A long chain can be hard to follow, because a method used at the bottom may be defined several levels up. Keep chains short, usually two or three levels, and give each level a clear job.",
      },
      {
        type: "tip",
        text: "Use isinstance to check the whole chain at once: a Puppy is an instance of Puppy, Dog, Animal, and object, all at the same time.",
      },
    ],
    practice: [
      "Create a three-level chain: Vehicle, Car, SportsCar, where each level adds one method, and call all three methods on a SportsCar object.",
      "Add a constructor to each level of your chain using super().__init__, and print one attribute from each level.",
      "Override one method in the middle level and check that the bottom level uses the overridden version.",
    ],
    summary: [
      "Multilevel inheritance builds a chain of classes, each adding a layer.",
      "The lowest class can use everything from all levels above it.",
      "Each constructor calls super().__init__ to set up its level.",
      "Keep chains short so they stay easy to follow.",
    ],
  },
  {
    day: 81,
    title: "Hybrid and Hierarchical Inheritance",
    intro:
      "This lesson teaches the last two kinds of inheritance: hierarchical, where one parent has many children, and hybrid, which mixes the kinds together. They matter because they complete the picture of how classes can be related.",
    blocks: [
      { type: "heading", text: "Hierarchical inheritance: one parent, many children" },
      {
        type: "para",
        text: "In hierarchical inheritance, several child classes inherit from the same parent. Dog and Cat both inherit from Animal, so both can eat, but each adds its own sound. The shared behaviour is written once in the parent, and each child only adds what makes it different. This is the most common pattern in real programs: one base class with many specialised children.",
      },
      {
        type: "code",
        title: "Two children sharing one parent",
        code: `class Animal:
    def eat(self):
        print("Eating.")

class Dog(Animal):
    def bark(self):
        print("Woof!")

class Cat(Animal):
    def meow(self):
        print("Meow!")

d = Dog()
c = Cat()
d.eat()
d.bark()
c.eat()
c.meow()`,
        output: "Eating.\nWoof!\nEating.\nMeow!",
      },
      { type: "heading", text: "Hybrid inheritance: mixing the kinds" },
      {
        type: "para",
        text: "Hybrid inheritance mixes two or more kinds together. The classic example is a diamond: class A at the top, classes B and C both inheriting from A, and class D inheriting from both B and C. This mixes hierarchical inheritance, one parent with two children, with multiple inheritance, one child with two parents. Python handles the diamond with the method resolution order, which visits D, then B, then C, then A, so each class is checked once and in a sensible order.",
      },
      {
        type: "code",
        title: "A diamond: D inherits from B and C, both from A",
        code: `class A:
    def show(self):
        print("From A")

class B(A):
    pass

class C(A):
    pass

class D(B, C):
    pass

d = D()
d.show()
print([cls.__name__ for cls in D.__mro__])`,
        output: "From A\n['D', 'B', 'C', 'A', 'object']",
      },
      {
        type: "list",
        items: [
          "Hierarchical: several children share one parent.",
          "Hybrid: a mix of two or more kinds, like the diamond shape.",
          "The shared parent holds the behaviour every child needs.",
          "The MRO settles the order when a class has several parents.",
        ],
      },
      {
        type: "note",
        text: "Hybrid inheritance is the hardest kind to follow, because a method can come from several paths. Use it only when the design truly needs it, and print the MRO whenever the behaviour surprises you.",
      },
      {
        type: "tip",
        text: "In most programs you will use single and hierarchical inheritance. Reach for multiple, multilevel, or hybrid only when one parent genuinely cannot describe the relationship.",
      },
    ],
    practice: [
      "Create a parent class Shape with child classes Circle and Square, each with its own area method, and print both areas.",
      "Build the diamond shape with classes A, B, C, and D, and print the MRO of D.",
      "Add a method to A, override it in B only, and check which version a D object uses.",
    ],
    summary: [
      "Hierarchical inheritance is one parent with many children.",
      "Hybrid inheritance mixes two or more kinds together.",
      "The diamond shape combines hierarchical and multiple inheritance.",
      "The MRO decides the search order in every case.",
    ],
  },
  {
    day: 82,
    title: "Merge the PDF Solution",
    intro:
      "This lesson gives the complete solution to the Merge the PDF exercise from Day 76. It matters because it turns the merge steps into a reusable function that works for any number of files.",
    blocks: [
      { type: "heading", text: "The complete solution" },
      {
        type: "para",
        text: "The solution wraps the merge logic in a function called merge_pdfs that takes a list of file names and an output name. It creates one PdfWriter, reads every page of every file in the list, adds the pages to the writer in order, and saves the result. It then prints how many files were merged, so the user gets a clear confirmation. The demo below makes three small PDFs with one, two, and one pages, then merges them. The result has four pages, which proves the pages were combined in order and none were lost. In a real run you would skip the make_pdf step and pass your own file names to merge_pdfs instead.",
      },
      {
        type: "code",
        title: "The merge_pdfs function and a three-file demo",
        code: `from pypdf import PdfWriter, PdfReader

def make_pdf(filename, pages):
    writer = PdfWriter()
    for _ in range(pages):
        writer.add_blank_page(width=200, height=200)
    with open(filename, "wb") as f:
        writer.write(f)

def merge_pdfs(files, output):
    merger = PdfWriter()
    for filename in files:
        reader = PdfReader(filename)
        for page in reader.pages:
            merger.add_page(page)
    with open(output, "wb") as f:
        merger.write(f)
    print("Merged", len(files), "files into", output)

make_pdf("one.pdf", 1)
make_pdf("two.pdf", 2)
make_pdf("three.pdf", 1)
merge_pdfs(["one.pdf", "two.pdf", "three.pdf"],
           "combined.pdf")
result = PdfReader("combined.pdf")
print("Total pages:", len(result.pages))`,
        output: "Merged 3 files into combined.pdf\nTotal pages: 4",
      },
      { type: "heading", text: "Checking the files before merging" },
      {
        type: "para",
        text: "A good habit is to check each input file before merging it. Reading the page count first catches a missing or empty file early, and it lets you show the user what is about to be merged. The loop below prints the page count of each file, using the same PdfReader the merge itself uses.",
      },
      {
        type: "code",
        title: "Printing the page count of each input file",
        code: `from pypdf import PdfWriter, PdfReader

def make_pdf(filename, pages):
    writer = PdfWriter()
    for _ in range(pages):
        writer.add_blank_page(width=200, height=200)
    with open(filename, "wb") as f:
        writer.write(f)

make_pdf("a.pdf", 2)
make_pdf("b.pdf", 3)
for filename in ["a.pdf", "b.pdf"]:
    reader = PdfReader(filename)
    print(filename, "has", len(reader.pages), "pages")`,
        output: "a.pdf has 2 pages\nb.pdf has 3 pages",
      },
      { type: "heading", text: "How it works, step by step" },
      {
        type: "para",
        text: "The writer collects pages in the order they are added, so the order of the file list decides the order of the pages in the result. Opening the output file in wb mode is important, because a PDF is binary data, not text. The function works for any number of files, from two to two hundred, because the loop does not care how long the list is.",
      },
      {
        type: "list",
        items: [
          "merge_pdfs takes a list of files and an output name.",
          "Pages are added in the order the files appear in the list.",
          "The output file is opened in wb mode because PDF data is binary.",
          "Checking page counts first catches missing or empty files early.",
        ],
      },
      {
        type: "note",
        text: "The video uses the older PyPDF2 library, whose merger class works the same way. The pypdf library used here is the maintained successor to PyPDF2, and its PdfReader and PdfWriter cover the same job.",
      },
    ],
    practice: [
      "Run the solution with three files of your own and check that the result has the right number of pages.",
      "Change merge_pdfs to return the total page count, and print the returned value after calling it.",
      "Build the file list from a folder with os.listdir, keeping only names that end with .pdf, and merge them all.",
    ],
    summary: [
      "The solution is a merge_pdfs function that works for any file list.",
      "Pages are added in list order to one PdfWriter, then saved.",
      "The demo merges three files with four pages in total.",
      "Check page counts first to catch problems before merging.",
    ],
  },
  {
    day: 83,
    title: "Exercise 9 - Shoutouts to Everyone",
    intro:
      "This lesson teaches the final exercise: a program that gives a shoutout to everyone in a list. It matters because it brings the whole stage together: functions, loops, lists, and input in one small, friendly program.",
    blocks: [
      { type: "heading", text: "The problem" },
      {
        type: "para",
        text: "Write a program that takes a list of names and prints a personalised shoutout for each one. The names come from the user, typed in one line and separated by commas. The program splits that line into separate names, cleans up any extra spaces, and prints one shoutout per name in a loop. No name is ever written into the code itself: every shoutout is for a name the user typed.",
      },
      {
        type: "code",
        title: "A shoutout for every name the user types",
        code: `print("Enter names separated by commas:")
names = input().split(",")
for name in names:
    print("Shoutout to " + name.strip() +
          "! Thank you for your support!")`,
        output:
          "Enter names separated by commas:\nShoutout to A! Thank you for your support!\nShoutout to B! Thank you for your support!\nShoutout to C! Thank you for your support!",
      },
      { type: "heading", text: "How it works, step by step" },
      {
        type: "para",
        text: "The print tells the user what to type. The input reads one whole line, and split on the comma turns it into a list of names. The strip call on each name removes the space that follows each comma, so the second name prints cleanly instead of starting with a space. The loop then prints one shoutout per name, in the order they were typed. In the run above, the names typed were A, B, and C.",
      },
      { type: "heading", text: "Numbered shoutouts" },
      {
        type: "para",
        text: "A small change gives each shoutout a number. The enumerate function counts the names as the loop runs, starting from one, and the number is printed in front of each shoutout. Numbering is handy when the list is long, because it shows at a glance how many shoutouts were given.",
      },
      {
        type: "code",
        title: "Numbered shoutouts with enumerate",
        code: `print("Enter names separated by commas:")
names = input().split(",")
for i, name in enumerate(names, start=1):
    print(str(i) + ". Shoutout to " + name.strip() + "!")`,
        output:
          "Enter names separated by commas:\n1. Shoutout to A!\n2. Shoutout to B!",
      },
      {
        type: "list",
        items: [
          "input reads the names as one line, separated by commas.",
          "split turns the line into a list of names.",
          "strip removes the space after each comma.",
          "A loop prints one shoutout per name, in order.",
          "enumerate adds a number to each shoutout.",
        ],
      },
      {
        type: "note",
        text: "If the user types a trailing comma, split creates an empty last name, and the program prints a shoutout to nobody. Guard against it by skipping names that are empty after strip.",
      },
    ],
    practice: [
      "Run the program and type three short entries of your own, then check that each one gets its own shoutout.",
      "Add a guard that skips empty names, so a trailing comma does not print a shoutout to nobody.",
      "Change the program to read the names from a file instead of input, one name per line, and print a shoutout for each line.",
    ],
    summary: [
      "The program reads names from the user and prints one shoutout each.",
      "split and strip turn one typed line into clean separate names.",
      "A loop handles any number of names, in order.",
      "enumerate adds numbering when the list is long.",
    ],
  },
];
