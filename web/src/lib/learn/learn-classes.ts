import type { LearnTutorial } from "./types";

export const TUTORIALS: LearnTutorial[] = [
  {
    slug: "python-oop",
    title: "Python OOP",
    intro:
      "Object-oriented programming, or OOP, is a way of writing code by modelling real things as objects. It matters because most large programs are built this way, and it keeps code organised and reusable.",
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
    slug: "python-classes",
    title: "Classes/Objects",
    intro:
      "A class is a blueprint and an object is one thing built from it. This tutorial goes deeper into classes and objects, showing how objects store their own data.",
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
        text: "Setting attributes one by one after creating the object works, but it is easy to forget one. The next tutorial shows constructors, which set the data at the moment the object is created.",
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
    slug: "python-challenges-classes",
    title: "Code Challenge",
    intro:
      "Time to practise classes and objects. Build a Book class that stores a book's details and can describe itself, then make two books and print their descriptions.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Create a class called Book. It should store three pieces of data for each book: title, author, and pages. Give it a method called describe that prints one line like this: Python Basics by A. Writer, 320 pages. Then create two Book objects with different details and call describe on both of them.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "Use __init__ with self, title, author, and pages to store the data when the object is created.",
          "Inside describe, use self.title, self.author, and self.pages to reach the object's own data.",
          "An f-string like f\"{self.title} by {self.author}, {self.pages} pages\" builds the line in one step.",
        ],
      },
      { type: "heading", text: "Solution" },
      {
        type: "para",
        text: "The constructor stores the three values, and describe prints them in one neat line. Each book object keeps its own title, author, and page count, so the two calls print two different lines.",
      },
      {
        type: "code",
        title: "Solution: the Book class",
        code: `class Book:
    def __init__(self, title, author, pages):
        self.title = title
        self.author = author
        self.pages = pages

    def describe(self):
        print(f"{self.title} by {self.author}, {self.pages} pages")

b1 = Book("Python Basics", "A. Writer", 320)
b2 = Book("Data Science 101", "B. Writer", 210)
b1.describe()
b2.describe()`,
        output:
          "Python Basics by A. Writer, 320 pages\nData Science 101 by B. Writer, 210 pages",
      },
      {
        type: "para",
        text: "The same class works for any number of books. Put the objects in a list and loop over it to describe them all, and len tells you how many books you have.",
      },
      {
        type: "code",
        title: "Describing a list of books",
        code: `class Book:
    def __init__(self, title, author, pages):
        self.title = title
        self.author = author
        self.pages = pages

    def describe(self):
        print(f"{self.title} by {self.author}, {self.pages} pages")

books = [Book("Python Basics", "A. Writer", 320),
         Book("Web Design", "C. Writer", 150)]
for book in books:
    book.describe()
print("Total books:", len(books))`,
        output:
          "Python Basics by A. Writer, 320 pages\nWeb Design by C. Writer, 150 pages\nTotal books: 2",
      },
      {
        type: "note",
        text: "If describe prints the wrong book's details, check that every attribute is set with self inside __init__. Forgetting self stores the value in a plain local variable that disappears when the constructor ends.",
      },
    ],
    practice: [
      "Add a method called is_long to the Book class that returns True when the book has more than 300 pages, and test it on both books.",
      "Create a third Book object and add all three books to a list, then print the title of the book with the most pages.",
      "Create a class called Movie with title, director, and year, plus a describe method, and make two movie objects.",
    ],
    summary: [
      "A class groups the data of one thing with the methods that use it.",
      "__init__ stores the data when the object is created.",
      "Methods use self to reach the object's own attributes.",
      "One class can make many objects, each with its own data.",
    ],
  },
  {
    slug: "python-class-init",
    title: "__init__ Method",
    intro:
      "The __init__ method is the constructor: the special method that runs when an object is created. It sets up the object's data in one place, so no object is ever left half-built.",
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
    slug: "python-challenges-classes-basics",
    title: "Code Challenge",
    intro:
      "Time to practise the __init__ method. Build a BankAccount class whose constructor sets up the owner and an opening balance, with a deposit method that updates it.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Create a class called BankAccount. Its constructor should take the owner's name and a balance that defaults to 0, so an account can be opened with or without money. Add a method called deposit that adds an amount to the balance and prints a line like this: Sam balance: 500. Then create one account without an opening balance and deposit 500, and create a second account with 100 and deposit 50.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "Give the balance parameter a default value of 0 in the __init__ signature.",
          "Store both values with self inside __init__, so they belong to the object.",
          "Inside deposit, change self.balance first, then print the new balance.",
        ],
      },
      { type: "heading", text: "Solution" },
      {
        type: "para",
        text: "The default value of 0 means BankAccount(\"Sam\") opens an empty account, while BankAccount(\"Alex\", 100) opens one with 100 already in it. The deposit method updates the balance through self, so each account keeps its own money.",
      },
      {
        type: "code",
        title: "Solution: the BankAccount class",
        code: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount
        print(self.owner, "balance:", self.balance)

a = BankAccount("Sam")
a.deposit(500)
b = BankAccount("Alex", 100)
b.deposit(50)`,
        output: "Sam balance: 500\nAlex balance: 150",
      },
      {
        type: "para",
        text: "The same class handles repeated deposits too. Each call to deposit adds to the same balance, and an account created with money keeps its opening balance until a deposit changes it.",
      },
      {
        type: "code",
        title: "Repeated deposits on one account",
        code: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

a = BankAccount("Mia")
a.deposit(200)
a.deposit(300)
print(a.owner, "has", a.balance)
b = BankAccount("Raj", 1000)
print(b.owner, "has", b.balance)`,
        output: "Mia has 500\nRaj has 1000",
      },
      {
        type: "note",
        text: "A default value is used only when the caller skips that argument. Passing a value always replaces the default, so BankAccount(\"Raj\", 1000) starts at 1000, not 0.",
      },
    ],
    practice: [
      "Add a withdraw method to BankAccount that subtracts an amount only if there is enough balance, and prints a message when there is not.",
      "Create a class called Product with a constructor that takes name and a price that defaults to 0, and a method that prints both.",
      "Create three BankAccount objects, deposit a different amount into each, and print the owner and balance of each one.",
    ],
    summary: [
      "__init__ runs when the object is created and stores its starting data.",
      "A constructor parameter with a default value can be skipped by the caller.",
      "Methods change the object's data through self.",
      "Each object keeps its own balance, separate from every other account.",
    ],
  },
  {
    slug: "python-class-self",
    title: "self Parameter",
    intro:
      "Every method in a class takes self as its first parameter. This tutorial explains what self is, why Python passes it automatically, and what happens when you forget it.",
    blocks: [
      { type: "heading", text: "What is self?" },
      {
        type: "para",
        text: "self is a reference to the object the method was called on. When you write c1.show(), Python calls show with c1 as the first argument, so self becomes c1 inside the method. That is how a method knows which object's data to read or change. The name self is only a convention, but every Python programmer uses it, so always use that name.",
      },
      {
        type: "para",
        text: "Because each method receives its own object as self, two objects of the same class keep their data separate. A method that changes self.count changes the count of the object it was called on, and no other object is affected.",
      },
      {
        type: "code",
        title: "self keeps each object's data separate",
        code: `class Counter:
    def __init__(self):
        self.count = 0

    def add(self):
        self.count += 1

    def show(self):
        print("Count is", self.count)

c1 = Counter()
c2 = Counter()
c1.add()
c1.add()
c2.add()
c1.show()
c2.show()`,
        output: "Count is 2\nCount is 1",
      },
      { type: "heading", text: "self is passed automatically" },
      {
        type: "para",
        text: "You never pass self yourself when you call a method on an object. Writing g.greet(\"Alex\") passes g as self and \"Alex\" as the other argument. You can also call the method on the class itself and pass the object by hand, which shows what Python does for you behind the scenes. Both calls below print the same line.",
      },
      {
        type: "code",
        title: "Calling a method on the object and on the class",
        code: `class Greeter:
    def __init__(self, name):
        self.name = name

    def greet(self, other):
        print("Hello", other, "I am", self.name)

g = Greeter("Sam")
g.greet("Alex")
Greeter.greet(g, "Alex")`,
        output: "Hello Alex I am Sam\nHello Alex I am Sam",
      },
      {
        type: "list",
        items: [
          "self is the object the method was called on.",
          "Python passes it automatically; you do not pass it yourself.",
          "Methods read and change the object's data through self.",
          "A method without self in its definition will fail when called on an object.",
        ],
      },
      {
        type: "note",
        text: "Forgetting self in a method definition is a common error. If you write def show(): instead of def show(self):, calling object.show() gives a TypeError, because Python still passes the object and the method has nowhere to put it.",
      },
    ],
    practice: [
      "Create a class called Light with a method turn_on that sets self.is_on to True and prints The light is on. Test it on two objects.",
      "Add a method called turn_off to your Light class, and check that turning one light off does not affect the other.",
      "Create a class with a method that takes self plus two numbers and prints their sum, then call it on an object without passing self.",
    ],
    summary: [
      "self refers to the object the method was called on.",
      "Python passes self automatically when you call a method on an object.",
      "Through self, a method reads and changes that object's own data.",
      "Every method definition must list self as its first parameter.",
    ],
  },
  {
    slug: "python-challenges-class-self",
    title: "Code Challenge",
    intro:
      "Time to practise self. Build a Rectangle class whose methods use self to reach the rectangle's own length and width, and use them to work out the area and the perimeter.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Create a class called Rectangle. Its constructor should store length and width. Add a method called area that returns length times width, and a method called perimeter that returns 2 times (length plus width). Then create a rectangle of 5 by 3 and print both results, which should be Area: 15 and Perimeter: 16.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "Store the values as self.length and self.width inside __init__.",
          "Inside area and perimeter, read the values back through self, not as plain variables.",
          "area and perimeter should return the numbers, so the caller prints them.",
        ],
      },
      { type: "heading", text: "Solution" },
      {
        type: "para",
        text: "Both methods read the rectangle's own data through self. Because the values live on the object, the same methods give the right answer for any rectangle, no matter its size.",
      },
      {
        type: "code",
        title: "Solution: the Rectangle class",
        code: `class Rectangle:
    def __init__(self, length, width):
        self.length = length
        self.width = width

    def area(self):
        return self.length * self.width

    def perimeter(self):
        return 2 * (self.length + self.width)

r = Rectangle(5, 3)
print("Area:", r.area())
print("Perimeter:", r.perimeter())`,
        output: "Area: 15\nPerimeter: 16",
      },
      {
        type: "para",
        text: "The same two methods work for a square and for a long thin rectangle. The object remembers its own size, so each call uses the right numbers.",
      },
      {
        type: "code",
        title: "Two more rectangles, same methods",
        code: `class Rectangle:
    def __init__(self, length, width):
        self.length = length
        self.width = width

    def area(self):
        return self.length * self.width

    def perimeter(self):
        return 2 * (self.length + self.width)

for size in [(4, 4), (10, 2)]:
    r = Rectangle(size[0], size[1])
    print(r.area(), r.perimeter())`,
        output: "16 16\n20 24",
      },
      {
        type: "note",
        text: "If a method prints the wrong numbers, check that it reads self.length and self.width. Reading plain length inside a method looks for a local variable that does not exist, and Python raises a NameError.",
      },
    ],
    practice: [
      "Add a method called is_square to the Rectangle class that returns True when length and width are equal.",
      "Create a class called Circle with a radius attribute and methods that return the area and the circumference using 3.14.",
      "Create two Rectangle objects, change the length of one of them, and check that the other's area is unchanged.",
    ],
    summary: [
      "self gives a method access to the object's own data.",
      "Store values as self.length and self.width in the constructor.",
      "Methods read those values back through self.",
      "Each object keeps its own data, so the same method works for every rectangle.",
    ],
  },
  {
    slug: "python-class-properties",
    title: "Class Properties",
    intro:
      "A property lets a class control how an attribute is read and changed. It matters because it lets a class check new values and stop bad data from getting in, while the attribute still looks like a normal one from outside.",
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
        text: "If you write only the getter and no setter, the attribute becomes read-only. Trying to change it raises an AttributeError. This is useful for values that should never change after the object is created, such as an ID number. A property can also compute a value on the fly: the area property below is worked out from the radius each time it is read.",
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
    slug: "python-challenges-class-properties",
    title: "Code Challenge",
    intro:
      "Time to practise properties. Build a Temperature class with a celsius property that refuses impossible values, and a fahrenheit property that is worked out from the celsius value.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Create a class called Temperature that stores a temperature in Celsius. Give it a celsius property with a setter that refuses any value below -273.15, the coldest possible temperature, and prints Too cold. Keeping old value. Then add a read-only fahrenheit property that returns the temperature in Fahrenheit, using the formula Celsius times 9 divided by 5 plus 32. Test it with 25 degrees, then set it to 0, then try -300.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "Store the real value in self._celsius and expose it through a property named celsius.",
          "The fahrenheit property needs only a getter, because it is computed from celsius.",
          "In the setter, only change self._celsius when the new value is allowed.",
        ],
      },
      { type: "heading", text: "Solution" },
      {
        type: "para",
        text: "The celsius setter guards the value, and the fahrenheit getter computes its answer from the stored Celsius value every time it is read. Setting celsius to 0 changes the Fahrenheit reading automatically, because it is worked out fresh on each read.",
      },
      {
        type: "code",
        title: "Solution: the Temperature class",
        code: `class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius

    @property
    def celsius(self):
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            print("Too cold. Keeping old value.")
        else:
            self._celsius = value

    @property
    def fahrenheit(self):
        return self._celsius * 9 / 5 + 32

t = Temperature(25)
print(t.celsius)
print(t.fahrenheit)
t.celsius = 0
print(t.fahrenheit)
t.celsius = -300
print(t.celsius)`,
        output: "25\n77.0\n32.0\nToo cold. Keeping old value.\n0",
      },
      {
        type: "para",
        text: "The conversion works both ways in size: 100 degrees Celsius is the boiling point of water, and the property reports it as 212 degrees Fahrenheit.",
      },
      {
        type: "code",
        title: "Boiling point in Fahrenheit",
        code: `class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius

    @property
    def celsius(self):
        return self._celsius

    @property
    def fahrenheit(self):
        return self._celsius * 9 / 5 + 32

t = Temperature(100)
print(t.celsius, "C is", t.fahrenheit, "F")`,
        output: "100 C is 212.0 F",
      },
      {
        type: "note",
        text: "The fahrenheit property has no setter, so writing t.fahrenheit = 100 raises an AttributeError. That is the point: Fahrenheit is worked out from Celsius, so it must never be set on its own.",
      },
    ],
    practice: [
      "Add a kelvin property to the Temperature class that returns celsius plus 273.15, as a read-only property.",
      "Create a class called BankAccount with a balance property whose setter refuses negative values.",
      "Create a class called Rectangle with a read-only area property and a width setter that refuses zero or negative values.",
    ],
    summary: [
      "@property turns a method into a getter that runs on every read.",
      "A setter can check a new value and refuse it when it is wrong.",
      "A computed property works out its value from other data each time it is read.",
      "A property with no setter is read-only.",
    ],
  },
  {
    slug: "python-class-methods",
    title: "Class Methods",
    intro:
      "A class method works on the class itself instead of on one object. It matters because it can read and change data shared by every object of the class, and it can build objects in new ways.",
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
      { type: "heading", text: "Class methods as alternative constructors" },
      {
        type: "para",
        text: "The most common use of class methods is the alternative constructor: a class method that creates an object from data in a different format. A class has one __init__, but data often arrives as a string like Worker One-50000. The from_string method splits the string, converts the pieces, and returns cls with those pieces as arguments. Because it uses cls, it works correctly even for child classes.",
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
      {
        type: "list",
        items: [
          "A class method is marked with @classmethod.",
          "It takes cls, which refers to the class itself.",
          "It can read and change class variables shared by all objects.",
          "It can be called on the class or on an object.",
          "An alternative constructor is a class method that returns a new object.",
        ],
      },
      {
        type: "note",
        text: "Changing a class variable inside a class method changes it for every object at once, because cls.company = new_name writes to the class itself. That is the correct way to change shared data.",
      },
      {
        type: "tip",
        text: "Name alternative constructors with from_ plus the source format: from_string, from_dict, from_list. Other programmers will understand at a glance what kind of data the method expects.",
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
      "Alternative constructors like from_string build objects from other formats.",
    ],
  },
  {
    slug: "python-challenges-class-methods",
    title: "Code Challenge",
    intro:
      "Time to practise class methods. Build a Student class that counts how many students have been made, and add an alternative constructor that builds a student from a single string.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Create a class called Student with a class variable called count that starts at 0. Every time a student is created, the constructor should add 1 to the count. Add a class method called from_string that takes a string like Sam-20, splits it into a name and an age, and returns a new Student. Add another class method called total that prints Total students: followed by the count. Then create one student with from_string and one with the normal constructor, and call total.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "Increase the count inside __init__ with Student.count += 1.",
          "Mark both helper methods with @classmethod and take cls as the first parameter.",
          "In from_string, split the string on the hyphen and convert the age to an integer before passing it to cls.",
        ],
      },
      { type: "heading", text: "Solution" },
      {
        type: "para",
        text: "The count is a class variable, so it is shared by every student. The constructor adds one to it for each new object, and the total method reads it through cls. The from_string method builds a student from a string and still goes through the normal constructor, so the count stays correct.",
      },
      {
        type: "code",
        title: "Solution: the Student class",
        code: `class Student:
    count = 0

    def __init__(self, name, age):
        self.name = name
        self.age = age
        Student.count += 1

    @classmethod
    def from_string(cls, data):
        name, age = data.split("-")
        return cls(name, int(age))

    @classmethod
    def total(cls):
        print("Total students:", cls.count)

s1 = Student.from_string("Sam-20")
s2 = Student("Alex", 22)
Student.total()
print(s1.name, s1.age)
print(s2.name, s2.age)`,
        output: "Total students: 2\nSam 20\nAlex 22",
      },
      {
        type: "para",
        text: "Building two more students from strings raises the count to two again in a fresh run. The count always matches the number of objects created, however they were built.",
      },
      {
        type: "code",
        title: "Counting students built from strings",
        code: `class Student:
    count = 0

    def __init__(self, name, age):
        self.name = name
        self.age = age
        Student.count += 1

    @classmethod
    def from_string(cls, data):
        name, age = data.split("-")
        return cls(name, int(age))

    @classmethod
    def total(cls):
        print("Total students:", cls.count)

Student.from_string("Mia-19")
Student.from_string("Raj-21")
Student.total()`,
        output: "Total students: 2",
      },
      {
        type: "note",
        text: "Change the class variable through the class name or through cls, never through an object. Writing s1.count = 99 would only create a separate attribute on that one student and leave the shared count unchanged.",
      },
    ],
    practice: [
      "Add a from_dict class method to the Student class that builds a student from a dictionary with name and age keys.",
      "Create a class called Book with a class variable that counts books, and a class method that prints the count.",
      "Add a class method to Book called from_string that splits a string like Title|Author on the | character.",
    ],
    summary: [
      "A class variable is shared by every object of the class.",
      "A class method takes cls and works on the class itself.",
      "An alternative constructor converts data into __init__ arguments and returns a new object.",
      "Using cls keeps the method correct for child classes too.",
    ],
  },
  {
    slug: "python-magic-methods",
    title: "Magic Methods",
    intro:
      "Magic methods, also called dunder methods because of their double underscores, let your own classes work with Python's built-in tools like print, len, and the plus sign.",
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
    slug: "python-magic-str",
    title: "__str__",
    intro:
      "The __str__ method decides what print shows for your object. Without it, printing an object shows a memory address that tells the reader nothing.",
    blocks: [
      { type: "heading", text: "What does __str__ do?" },
      {
        type: "para",
        text: "When you write print(object), Python calls the object's __str__ method and prints the string it returns. The method takes only self and must return a string. Its job is to give a clear, human-readable description of the object, like a book's title and author, or a student's name and grade.",
      },
      {
        type: "para",
        text: "The str function does the same thing: str(object) calls __str__ and returns the string without printing it. That is useful when you want to build a longer message that includes the object, for example inside a print with other text.",
      },
      {
        type: "code",
        title: "__str__ for a Book class",
        code: `class Book:
    def __init__(self, title, author):
        self.title = title
        self.author = author

    def __str__(self):
        return self.title + " by " + self.author

b = Book("Python Basics", "A. Writer")
print(b)
print(str(b))`,
        output: "Python Basics by A. Writer\nPython Basics by A. Writer",
      },
      { type: "heading", text: "A readable one-line summary" },
      {
        type: "para",
        text: "A good __str__ picks the two or three details a reader needs most and leaves the rest out. The Student class below shows the name and the grade in one short line, which is enough to tell students apart when a list of them is printed.",
      },
      {
        type: "code",
        title: "__str__ for a Student class",
        code: `class Student:
    def __init__(self, name, grade):
        self.name = name
        self.grade = grade

    def __str__(self):
        return f"{self.name} - Grade {self.grade}"

print(Student("Sam", "A"))
print(Student("Alex", "B"))`,
        output: "Sam - Grade A\nAlex - Grade B",
      },
      {
        type: "list",
        items: [
          "Python calls __str__ when you print an object or call str on it.",
          "__str__ takes only self and must return a string.",
          "It should give a short, human-readable description.",
          "Without __str__, print shows a memory address instead.",
        ],
      },
      {
        type: "note",
        text: "__str__ is only for display. It should never change the object or print anything itself; it just returns the string, and the caller decides what to do with it.",
      },
    ],
    practice: [
      "Add a __str__ method to a class of your own that shows its two most useful attributes, and print an object of it.",
      "Create a class called Car with brand and year, and a __str__ that returns a line like City Motors, 2024.",
      "Create two Car objects, put them in a list, and print each one in a loop.",
    ],
    summary: [
      "__str__ controls what print shows for an object.",
      "It must return a string and take only self.",
      "A good __str__ shows the most useful details in one short line.",
      "str(object) calls __str__ and returns the string without printing it.",
    ],
  },
  {
    slug: "python-magic-repr",
    title: "__repr__",
    intro:
      "The __repr__ method gives the official, unambiguous representation of an object. It is what you see when an object appears inside a list or a dictionary, and it is the fallback when __str__ is not defined.",
    blocks: [
      { type: "heading", text: "What does __repr__ do?" },
      {
        type: "para",
        text: "When Python needs to show an object inside another object, like a list, it calls __repr__ instead of __str__. The repr function does the same: repr(object) returns the string that __repr__ builds. By convention, __repr__ should look like the code that would recreate the object, for example Point(3, 4). That makes debugging much easier, because you can see exactly what the object holds.",
      },
      {
        type: "para",
        text: "If a class defines __repr__ but not __str__, print falls back to __repr__. That is why the first example below prints Point(3, 4) even though the class has no __str__ method at all.",
      },
      {
        type: "code",
        title: "__repr__ for a Point class",
        code: `class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Point({self.x}, {self.y})"

p = Point(3, 4)
print(p)
print(repr(p))
print([p, Point(1, 2)])`,
        output: "Point(3, 4)\nPoint(3, 4)\n[Point(3, 4), Point(1, 2)]",
      },
      { type: "heading", text: "The difference between __str__ and __repr__" },
      {
        type: "para",
        text: "The two methods have different jobs. __str__ is for the reader: a friendly line like Book: Python Basics. __repr__ is for the programmer: a precise form like Book('Python Basics') that shows the exact data. When both are defined, print uses __str__, while a list of objects uses __repr__ for each item.",
      },
      {
        type: "code",
        title: "__str__ and __repr__ side by side",
        code: `class Book:
    def __init__(self, title):
        self.title = title

    def __str__(self):
        return "Book: " + self.title

    def __repr__(self):
        return f"Book({self.title!r})"

b = Book("Python Basics")
print(b)
print([b])`,
        output: "Book: Python Basics\n[Book('Python Basics')]",
      },
      {
        type: "list",
        items: [
          "__repr__ gives the official representation of an object.",
          "Lists and dictionaries show objects using __repr__.",
          "By convention, __repr__ should look like code that recreates the object.",
          "print falls back to __repr__ when __str__ is not defined.",
        ],
      },
      {
        type: "note",
        text: "The !r inside the f-string means format the value with repr, so the title appears with quotes around it. That is what makes Book('Python Basics') look like real code.",
      },
    ],
    practice: [
      "Add a __repr__ method to a class of your own that looks like the code to recreate the object, and print a list of two objects.",
      "Create a class called Student with name and age, define both __str__ and __repr__, and compare print(student) with print([student]).",
      "Create a class with only __repr__ defined, and check that print still shows the __repr__ output.",
    ],
    summary: [
      "__repr__ gives the official, unambiguous representation of an object.",
      "Lists and dictionaries display objects using __repr__.",
      "It should look like the code that would recreate the object.",
      "__str__ is the friendly display; __repr__ is the precise one.",
    ],
  },
  {
    slug: "python-magic-eq",
    title: "__eq__",
    intro:
      "The __eq__ method decides what == means for your objects. Without it, two objects are equal only when they are the very same object in memory, even if they hold identical data.",
    blocks: [
      { type: "heading", text: "What does __eq__ do?" },
      {
        type: "para",
        text: "When you write a == b, Python calls a.__eq__(b). The method takes self and the other object, compares the attributes that matter, and returns True or False. For a Box class, the weight is what matters, so two boxes with the same weight count as equal.",
      },
      {
        type: "para",
        text: "Once __eq__ is defined, Python also uses it for !=, which is the opposite of the __eq__ result, and for membership tests like object in list. That means a list can find an object that is equal to one it holds, even if it is a different object.",
      },
      {
        type: "code",
        title: "__eq__ for a Box class",
        code: `class Box:
    def __init__(self, weight):
        self.weight = weight

    def __eq__(self, other):
        return self.weight == other.weight

b1 = Box(10)
b2 = Box(10)
b3 = Box(15)
print(b1 == b2)
print(b1 == b3)
print(b1 != b3)`,
        output: "True\nFalse\nTrue",
      },
      { type: "heading", text: "Comparing on more than one attribute" },
      {
        type: "para",
        text: "Often one attribute is not enough. Two students are the same student only when both the name and the age match, so __eq__ checks both with and. If either one differs, the objects are not equal.",
      },
      {
        type: "code",
        title: "__eq__ that checks name and age",
        code: `class Student:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __eq__(self, other):
        return self.name == other.name and self.age == other.age

s1 = Student("Sam", 20)
s2 = Student("Sam", 20)
s3 = Student("Alex", 20)
print(s1 == s2)
print(s1 == s3)
print(s2 in [s1, s3])`,
        output: "True\nFalse\nTrue",
      },
      {
        type: "list",
        items: [
          "__eq__ decides what == means for objects of your class.",
          "It takes self and the other object, and returns True or False.",
          "Python also uses it for != and for checks like object in list.",
          "Compare only the attributes that make two objects truly the same.",
        ],
      },
      {
        type: "note",
        text: "Compare the attributes, not the objects themselves. Writing return self == other inside __eq__ calls __eq__ again, which calls itself forever and ends in a RecursionError.",
      },
    ],
    practice: [
      "Create a class called Book with title and author, and an __eq__ that returns True only when both match.",
      "Make two equal Book objects and one different one, and test == and != on all three pairs.",
      "Create a list of Book objects and use in to check whether a new book with the same title and author is already in the list.",
    ],
    summary: [
      "__eq__ controls what == means for your objects.",
      "It compares the attributes that matter and returns True or False.",
      "Python reuses it for != and for membership tests.",
      "Without __eq__, == only matches the very same object.",
    ],
  },
  {
    slug: "python-magic-add",
    title: "__add__",
    intro:
      "The __add__ method decides what the + sign does between two of your objects. It lets points, money, and other values add up naturally, just like numbers do.",
    blocks: [
      { type: "heading", text: "What does __add__ do?" },
      {
        type: "para",
        text: "When you write p1 + p2, Python calls p1.__add__(p2). The method takes self and the other object, and returns whatever the sum should be. For a Point, adding means adding the x values together and the y values together, and returning a new Point with those sums.",
      },
      {
        type: "para",
        text: "The new object is the key point: __add__ should return a fresh object and leave both originals unchanged. That matches how adding numbers works, where 1 + 2 gives 3 without changing 1 or 2.",
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
print(p1 + p2)
print(p1)`,
        output: "(4, 6)\n(1, 2)",
      },
      { type: "heading", text: "Adding money" },
      {
        type: "para",
        text: "The same pattern works for money. Two Money objects add their amounts and return a new Money object. Printing the first object afterwards shows it was not changed by the addition.",
      },
      {
        type: "code",
        title: "__add__ for a Money class",
        code: `class Money:
    def __init__(self, amount):
        self.amount = amount

    def __add__(self, other):
        return Money(self.amount + other.amount)

    def __str__(self):
        return str(self.amount) + " rupees"

m1 = Money(100)
m2 = Money(50)
print(m1 + m2)
print(m1)`,
        output: "150 rupees\n100 rupees",
      },
      {
        type: "list",
        items: [
          "__add__ decides what + does between two objects.",
          "It takes self and the other object, and returns a new object.",
          "The original objects must not be changed by the addition.",
          "Pair it with __str__ so the result prints clearly.",
        ],
      },
      {
        type: "note",
        text: "Only overload + when the meaning is obvious to the reader. Adding two points or two amounts of money is clear; adding two unrelated things is confusing, and a plain method would be better.",
      },
    ],
    practice: [
      "Add a __sub__ method to the Point class that returns a new Point with the x and y values subtracted.",
      "Create a class called Time with hours and minutes, and an __add__ that returns a new Time with the hours and minutes added.",
      "Create a class called Vector with x and y, and overload __add__ so two vectors add part by part.",
    ],
    summary: [
      "__add__ controls what + does between two objects.",
      "It returns a new object built from the two originals.",
      "The original objects stay unchanged, like numbers in an addition.",
      "Only overload an operator when its meaning is obvious.",
    ],
  },
  {
    slug: "python-magic-len",
    title: "__len__",
    intro:
      "The __len__ method decides what len returns for your object. It lets a team, a playlist, or a book report its size the same way a list or a string does.",
    blocks: [
      { type: "heading", text: "What does __len__ do?" },
      {
        type: "para",
        text: "When you write len(object), Python calls the object's __len__ method. The method takes only self and must return a whole number that is zero or more. For a Team class, the natural size is the number of members, so __len__ returns the length of the members list.",
      },
      {
        type: "para",
        text: "The value can change over time. An empty team starts at 0, and each member added makes len grow by one. The method simply counts what is there right now, so it is always up to date.",
      },
      {
        type: "code",
        title: "__len__ for a Team class",
        code: `class Team:
    def __init__(self, name):
        self.name = name
        self.members = []

    def add(self, member):
        self.members.append(member)

    def __len__(self):
        return len(self.members)

t = Team("Error 404")
print(len(t))
t.add("Sam")
t.add("Alex")
print(len(t))`,
        output: "0\n2",
      },
      { type: "heading", text: "len for a playlist" },
      {
        type: "para",
        text: "The same idea works for any object that holds a collection. A Playlist holds songs, so len of a playlist is the number of songs it holds. The reader of the code does not need to know that the songs live in a list; len just gives the answer.",
      },
      {
        type: "code",
        title: "__len__ for a Playlist class",
        code: `class Playlist:
    def __init__(self):
        self.songs = []

    def add(self, song):
        self.songs.append(song)

    def __len__(self):
        return len(self.songs)

p = Playlist()
p.add("Song A")
p.add("Song B")
p.add("Song C")
print(len(p))
print("Songs:", len(p))`,
        output: "3\nSongs: 3",
      },
      {
        type: "list",
        items: [
          "__len__ decides what len returns for an object.",
          "It takes only self and must return a whole number, zero or more.",
          "It usually returns the length of a list the object holds.",
          "The result updates automatically as the object changes.",
        ],
      },
      {
        type: "note",
        text: "Without __len__, calling len on your object raises a TypeError. If an object naturally has a size, give it a __len__ method so it works with the built-in function.",
      },
    ],
    practice: [
      "Create a class called Library with a list of books and a __len__ method that returns how many books it holds.",
      "Create a class called ShoppingCart with an add method and a __len__ method, and test len before and after adding items.",
      "Add a remove method to your ShoppingCart and check that len goes down after removing an item.",
    ],
    summary: [
      "__len__ controls what len returns for an object.",
      "It must return a whole number that is zero or more.",
      "It usually counts a collection stored inside the object.",
      "The count stays correct as items are added or removed.",
    ],
  },
  {
    slug: "python-magic-lt",
    title: "__lt__",
    intro:
      "The __lt__ method decides what the less-than sign means for your objects. It lets objects be compared and sorted, just like numbers and strings.",
    blocks: [
      { type: "heading", text: "What does __lt__ do?" },
      {
        type: "para",
        text: "When you write a < b, Python calls a.__lt__(b). The method takes self and the other object, and returns True or False. For a Student, the natural order is by marks: a student with fewer marks is less than a student with more marks. The method only needs to compare the one attribute that defines the order.",
      },
      {
        type: "para",
        text: "The big win is sorting. The sort method and the sorted function use __lt__ to order the items. Once a class defines it, a list of its objects can be sorted with a single call, and each object falls into its right place.",
      },
      {
        type: "code",
        title: "__lt__ lets students be sorted by marks",
        code: `class Student:
    def __init__(self, name, marks):
        self.name = name
        self.marks = marks

    def __lt__(self, other):
        return self.marks < other.marks

    def __str__(self):
        return self.name + " (" + str(self.marks) + ")"

students = [Student("Sam", 85), Student("Alex", 92), Student("Mia", 78)]
students.sort()
for s in students:
    print(s)`,
        output: "Mia (78)\nSam (85)\nAlex (92)",
      },
      { type: "heading", text: "Comparing directly" },
      {
        type: "para",
        text: "The same method works for a direct comparison. A lighter box is less than a heavier box, so b1 < b2 is True and b2 < b1 is False. And sorted uses the same rule to put the lightest box first.",
      },
      {
        type: "code",
        title: "__lt__ for a Box class",
        code: `class Box:
    def __init__(self, weight):
        self.weight = weight

    def __lt__(self, other):
        return self.weight < other.weight

b1 = Box(10)
b2 = Box(15)
print(b1 < b2)
print(b2 < b1)
print(sorted([b2, b1])[0].weight)`,
        output: "True\nFalse\n10",
      },
      {
        type: "list",
        items: [
          "__lt__ decides what the less-than sign means for your objects.",
          "It takes self and the other object, and returns True or False.",
          "sort and sorted use __lt__ to order a list of objects.",
          "Pick one attribute that defines the natural order.",
        ],
      },
      {
        type: "note",
        text: "__lt__ only defines less-than. If you also want greater-than or less-than-or-equal, define __gt__ and __le__ the same way, or use functools.total_ordering to build them from __lt__ and __eq__.",
      },
    ],
    practice: [
      "Create a class called Book with title and pages, and a __lt__ that compares books by pages. Sort a list of three books.",
      "Create a class called Player with a score, define __lt__ by score, and print the player with the lowest score using sorted.",
      "Add an __eq__ method to your Player class and test both < and == on two players.",
    ],
    summary: [
      "__lt__ controls what the less-than sign means for your objects.",
      "It compares one attribute and returns True or False.",
      "sort and sorted use it to order a list of objects.",
      "Choose the attribute that gives the natural order for the class.",
    ],
  },
  {
    slug: "python-magic-contains",
    title: "__contains__",
    intro:
      "The __contains__ method decides what the in keyword means for your object. It lets you write member in team or book in library, just like item in list.",
    blocks: [
      { type: "heading", text: "What does __contains__ do?" },
      {
        type: "para",
        text: "When you write item in object, Python calls object.__contains__(item). The method takes self and the item to look for, and returns True or False. For a Team, the natural test is whether the name is in the members list, so __contains__ simply checks that list.",
      },
      {
        type: "para",
        text: "The not in form works for free: Python calls __contains__ and flips the answer. So \"Alex\" not in t is True exactly when \"Alex\" in t is False, with no extra code needed.",
      },
      {
        type: "code",
        title: "__contains__ for a Team class",
        code: `class Team:
    def __init__(self, name):
        self.name = name
        self.members = []

    def add(self, member):
        self.members.append(member)

    def __contains__(self, member):
        return member in self.members

t = Team("Error 404")
t.add("Sam")
t.add("Alex")
print("Sam" in t)
print("Mia" in t)
print("Alex" not in t)`,
        output: "True\nFalse\nFalse",
      },
      { type: "heading", text: "Checking a library" },
      {
        type: "para",
        text: "The same pattern works for a library. The __contains__ method checks the books list, so the reader can ask whether a book is in the library without knowing how the books are stored. The class hides the list and offers a clean question instead.",
      },
      {
        type: "code",
        title: "__contains__ for a Library class",
        code: `class Library:
    def __init__(self):
        self.books = []

    def add(self, book):
        self.books.append(book)

    def __contains__(self, book):
        return book in self.books

lib = Library()
lib.add("Python Basics")
lib.add("Data Science 101")
print("Python Basics" in lib)
print("Unknown Book" in lib)`,
        output: "True\nFalse",
      },
      {
        type: "list",
        items: [
          "__contains__ decides what in means for your object.",
          "It takes self and the item, and returns True or False.",
          "not in works automatically by flipping the answer.",
          "It hides how the items are stored inside the object.",
        ],
      },
      {
        type: "note",
        text: "If a class holds a list and has no __contains__, Python can still try to use the list by iterating, but only when the class is iterable. Defining __contains__ is the direct and reliable way to make in work.",
      },
    ],
    practice: [
      "Create a class called Classroom with a list of students and a __contains__ method, then test a student who is in the class and one who is not.",
      "Add a __len__ method to your Classroom and print both the size and a membership test.",
      "Create a class called Playlist with songs and a __contains__ method, and use not in to check for a song that is missing.",
    ],
    summary: [
      "__contains__ controls what the in keyword means for an object.",
      "It returns True or False for the item being tested.",
      "not in works automatically from the same method.",
      "It gives a clean membership test that hides the internal storage.",
    ],
  },
  {
    slug: "python-magic-call",
    title: "__call__",
    intro:
      "The __call__ method lets an object be called like a function. Once it is defined, you can write object() with brackets, and Python runs your method.",
    blocks: [
      { type: "heading", text: "What does __call__ do?" },
      {
        type: "para",
        text: "When you write object() with brackets, Python calls the object's __call__ method. The method can take extra arguments, just like a function, and it can return a value. This turns an object into something that behaves like a function, while still remembering its own state between calls.",
      },
      {
        type: "para",
        text: "A counter is the clearest example. Each call adds one to the stored count and returns the new total. The object remembers where it left off, which a plain function cannot do without a global variable.",
      },
      {
        type: "code",
        title: "__call__ for a Counter class",
        code: `class Counter:
    def __init__(self):
        self.count = 0

    def __call__(self):
        self.count += 1
        return self.count

c = Counter()
print(c())
print(c())
print(c())`,
        output: "1\n2\n3",
      },
      { type: "heading", text: "Calling with an argument" },
      {
        type: "para",
        text: "The __call__ method can also take arguments. The Adder below starts from a total and adds each value it is called with. Each call updates the stored total and returns the new one, so the object acts like a running total that you can call again and again.",
      },
      {
        type: "code",
        title: "__call__ that takes a value",
        code: `class Adder:
    def __init__(self, start):
        self.total = start

    def __call__(self, value):
        self.total += value
        return self.total

add = Adder(10)
print(add(5))
print(add(3))
print(add(2))`,
        output: "15\n18\n20",
      },
      {
        type: "list",
        items: [
          "__call__ lets an object be called like a function.",
          "It can take arguments and return a value, like any method.",
          "The object keeps its state between calls.",
          "Use it when an object is really a small piece of behaviour with memory.",
        ],
      },
      {
        type: "note",
        text: "An object is callable only when its class defines __call__. You can check with the built-in callable function: callable(object) returns True when the method exists and False when it does not.",
      },
    ],
    practice: [
      "Create a class called Greeter with a name, and a __call__ that prints Hello followed by the name each time it is called.",
      "Create a class called Multiplier that stores a factor and a __call__ that returns the argument times the factor.",
      "Create a class called Logger whose __call__ appends each message to a list, and print the list after three calls.",
    ],
    summary: [
      "__call__ makes an object callable like a function.",
      "It can take arguments and return a value.",
      "The object remembers its state between calls.",
      "callable(object) tells you whether an object can be called.",
    ],
  },
  {
    slug: "python-challenges-magic-methods",
    title: "Code Challenge",
    intro:
      "Time to practise magic methods. Build a Playlist class that uses __len__, __contains__, __str__, and __add__ together, so playlists can be counted, searched, printed, and combined.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Create a class called Playlist that stores a name and a list of songs. Give it an add method, a __len__ method that returns the number of songs, a __contains__ method that checks whether a song is in the playlist, and a __str__ method that returns a line like Morning: 2 songs. Then add an __add__ method that combines two playlists into a new one whose name joins both names with a plus sign. Test it with a Morning playlist of two songs and an Evening playlist of one song.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "__len__ and __contains__ can both use the songs list directly.",
          "__str__ must return a string, so convert the count with str.",
          "In __add__, make a new Playlist, set its songs to the two lists joined together, and return it.",
        ],
      },
      { type: "heading", text: "Solution" },
      {
        type: "para",
        text: "Each magic method gives the playlist one built-in behaviour: len counts the songs, in searches them, print shows a summary, and + merges two playlists. The original playlists are not changed by the addition, because __add__ builds a new one.",
      },
      {
        type: "code",
        title: "Solution: the Playlist class",
        code: `class Playlist:
    def __init__(self, name):
        self.name = name
        self.songs = []

    def add(self, song):
        self.songs.append(song)

    def __len__(self):
        return len(self.songs)

    def __contains__(self, song):
        return song in self.songs

    def __str__(self):
        return self.name + ": " + str(len(self.songs)) + " songs"

    def __add__(self, other):
        new = Playlist(self.name + " + " + other.name)
        new.songs = self.songs + other.songs
        return new

p1 = Playlist("Morning")
p1.add("Song A")
p1.add("Song B")
p2 = Playlist("Evening")
p2.add("Song C")
p3 = p1 + p2
print(p3)
print(len(p3))
print("Song A" in p3)`,
        output: "Morning + Evening: 3 songs\n3\nTrue",
      },
      {
        type: "para",
        text: "The same methods work on an empty playlist too. It prints 0 songs, len is 0, and a song that was never added is not in it, until add changes that.",
      },
      {
        type: "code",
        title: "An empty playlist, then one song",
        code: `class Playlist:
    def __init__(self, name):
        self.name = name
        self.songs = []

    def add(self, song):
        self.songs.append(song)

    def __len__(self):
        return len(self.songs)

    def __contains__(self, song):
        return song in self.songs

    def __str__(self):
        return self.name + ": " + str(len(self.songs)) + " songs"

p = Playlist("Favourites")
print(p)
print(len(p))
print("Song A" in p)
p.add("Song A")
print(p)
print("Song A" in p)`,
        output: "Favourites: 0 songs\n0\nFalse\nFavourites: 1 songs\nTrue",
      },
      {
        type: "note",
        text: "The __add__ method sets new.songs to the two lists joined with +, which makes a new list. The two original playlists keep their own lists, so adding a song to the combined playlist does not change them.",
      },
    ],
    practice: [
      "Add an __eq__ method to the Playlist class that returns True when two playlists have the same songs in the same order.",
      "Add a __lt__ method that compares playlists by the number of songs, and sort a list of three playlists.",
      "Create a class called Team with __len__, __contains__, and __str__, and test all three on one team.",
    ],
    summary: [
      "Magic methods give a class built-in behaviour like len, in, print, and +.",
      "Each dunder method handles one built-in operation.",
      "__add__ should return a new object and leave the originals unchanged.",
      "Combining several dunder methods makes a class feel like a built-in type.",
    ],
  },
  {
    slug: "python-inheritance",
    title: "Inheritance",
    intro:
      "Inheritance lets one class take on the attributes and methods of another. It matters because it lets you reuse code instead of writing the same methods again for every similar class.",
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
    slug: "python-challenges-inheritance",
    title: "Code Challenge",
    intro:
      "Time to practise inheritance. Build a Vehicle parent class with two children, Car and Bike, that share the parent's start method and each add something of their own.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Create a parent class called Vehicle with a brand attribute and a start method that prints a line like City Motors is starting. Then create a child class called Car that adds a seats attribute and a show method that prints a line like City Motors has 5 seats. Create a second child class called Bike with a ring_bell method that prints a line like Speed Star bike rings its bell! Make one Car and one Bike, and call start on both of them.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "Write the parent name in brackets: class Car(Vehicle).",
          "In the Car constructor, call super().__init__(brand) before storing the seats.",
          "Bike needs no constructor of its own, because the parent's constructor already sets the brand.",
        ],
      },
      { type: "heading", text: "Solution" },
      {
        type: "para",
        text: "Both children inherit the brand attribute and the start method from Vehicle, so that code is written only once. Car adds its own seats and show method, and Bike adds ring_bell. Each child uses what it inherited plus what is special to it.",
      },
      {
        type: "code",
        title: "Solution: Vehicle, Car, and Bike",
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

class Bike(Vehicle):
    def ring_bell(self):
        print(self.brand, "bike rings its bell!")

c = Car("City Motors", 5)
c.start()
c.show()
b = Bike("Speed Star")
b.start()
b.ring_bell()`,
        output:
          "City Motors is starting.\nCity Motors has 5 seats.\nSpeed Star is starting.\nSpeed Star bike rings its bell!",
      },
      {
        type: "para",
        text: "The isinstance checks confirm the family tree. A Car is a Vehicle, and a Bike is a Vehicle, but a Bike is not a Car, because the two children are separate branches under the same parent.",
      },
      {
        type: "code",
        title: "Checking the family tree with isinstance",
        code: `class Vehicle:
    def __init__(self, brand):
        self.brand = brand

    def start(self):
        print(self.brand, "is starting.")

class Car(Vehicle):
    def __init__(self, brand, seats):
        super().__init__(brand)
        self.seats = seats

class Bike(Vehicle):
    pass

c = Car("City Motors", 5)
b = Bike("Speed Star")
print(isinstance(c, Car))
print(isinstance(c, Vehicle))
print(isinstance(b, Vehicle))
print(isinstance(b, Car))`,
        output: "True\nTrue\nTrue\nFalse",
      },
      {
        type: "note",
        text: "If the Car object has no brand, the super().__init__ call is probably missing. A child constructor replaces the parent's constructor entirely, so it must call super().__init__ to run the parent's setup.",
      },
    ],
    practice: [
      "Add a child class called Truck to the Vehicle family, with a load capacity attribute and a method that prints it.",
      "Create a parent class called Person with a name attribute, and child classes called Teacher and Student that each add one method of their own.",
      "Override the start method in the Car class so it prints the parent's line plus one extra line, using super().start() first.",
    ],
    summary: [
      "A child class inherits the parent's methods and attributes.",
      "The parent name goes in brackets after the child class name.",
      "super().__init__ runs the parent's constructor from the child's.",
      "A child object is also an instance of its parent class.",
    ],
  },
  {
    slug: "python-polymorphism",
    title: "Polymorphism",
    intro:
      "Polymorphism means one method call can behave differently for different objects. It matters because code written for a parent class works with any child class, each in its own way.",
    blocks: [
      { type: "heading", text: "What is polymorphism?" },
      {
        type: "para",
        text: "Polymorphism means many forms. In Python it usually works through method overriding: a child class gives a new version of a method it inherited, and the child's version runs when the method is called on a child object. The parent's method still exists, but each child answers in its own way.",
      },
      {
        type: "para",
        text: "The power is in the loop. Code that calls speak on a list of animals does not need to know which animal each one is. Each object decides for itself what speak means, and the same single call produces a different sound for each animal.",
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
      { type: "heading", text: "The same method, different answers" },
      {
        type: "para",
        text: "The same idea works for calculations. Every shape has an area method, but a square and a circle work it out with different formulas. A loop over mixed shapes calls area on each one, and each shape returns its own answer, with no if statements needed to tell them apart.",
      },
      {
        type: "code",
        title: "Shapes with their own area formulas",
        code: `class Shape:
    def area(self):
        return 0

class Square(Shape):
    def __init__(self, side):
        self.side = side

    def area(self):
        return self.side * self.side

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return 3.14 * self.radius * self.radius

for shape in [Square(4), Circle(5), Square(2)]:
    print(shape.area())`,
        output: "16\n78.5\n4",
      },
      {
        type: "list",
        items: [
          "Polymorphism means one call can behave differently for different objects.",
          "It is done in Python by overriding a method in a child class.",
          "The child's version runs when the method is called on a child object.",
          "A loop over mixed objects needs no checks to tell them apart.",
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
      "Polymorphism means one method call behaves differently for different objects.",
      "It works through method overriding in child classes.",
      "Code written for the parent works with every child.",
      "The method name and parameters should stay the same in the override.",
    ],
  },
  {
    slug: "python-challenges-polymorphism",
    title: "Code Challenge",
    intro:
      "Time to practise polymorphism. Build an Animal family where each animal makes its own sound, and write one function that makes any animal sound without knowing which animal it is.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Create a parent class called Animal with a sound method that prints Some sound. Then create three child classes, Dog, Cat, and Cow, each overriding sound with its own noise: Woof!, Meow!, and Moo! Then write a function called make_sound that takes one animal and calls its sound method. Finally, put one of each animal in a list and call make_sound on each one in a loop.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "Each child class overrides sound with the same method name and no extra parameters.",
          "The make_sound function does not need to check what kind of animal it got; it just calls animal.sound().",
          "The loop passes each animal to the same function, and each one answers differently.",
        ],
      },
      { type: "heading", text: "Solution" },
      {
        type: "para",
        text: "The make_sound function is written once and works for every animal, because it only relies on the sound method that all of them share. The list holds three different kinds of objects, and the same call in the loop gives three different sounds.",
      },
      {
        type: "code",
        title: "Solution: animals and one shared function",
        code: `class Animal:
    def sound(self):
        print("Some sound")

class Dog(Animal):
    def sound(self):
        print("Woof!")

class Cat(Animal):
    def sound(self):
        print("Meow!")

class Cow(Animal):
    def sound(self):
        print("Moo!")

def make_sound(animal):
    animal.sound()

for pet in [Dog(), Cat(), Cow()]:
    make_sound(pet)`,
        output: "Woof!\nMeow!\nMoo!",
      },
      {
        type: "para",
        text: "The same pattern works for shapes. One loop calls area on a square, a circle, and another square, and each shape uses its own formula, with no checks to tell them apart.",
      },
      {
        type: "code",
        title: "The same pattern with shapes",
        code: `class Shape:
    def area(self):
        return 0

class Square(Shape):
    def __init__(self, side):
        self.side = side

    def area(self):
        return self.side * self.side

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return 3.14 * self.radius * self.radius

shapes = [Square(5), Circle(2), Square(3)]
for shape in shapes:
    print(shape.area())`,
        output: "25\n12.56\n9",
      },
      {
        type: "note",
        text: "If every animal prints Some sound, the child methods probably have a different name from the parent's, so they are new methods instead of overrides. The names must match exactly, including spelling.",
      },
    ],
    practice: [
      "Add a Bird child class that overrides sound with Chirp!, and add it to the list in the loop.",
      "Create a parent class called Vehicle with a move method, and child classes Car, Bike, and Boat that override it with their own lines.",
      "Write a function called show_area that takes one shape and prints its area, and call it on a square and a circle.",
    ],
    summary: [
      "Polymorphism means one call behaves differently for different objects.",
      "Each child overrides the same method with its own version.",
      "A function written for the parent works for every child.",
      "A loop over mixed objects needs no checks to tell them apart.",
    ],
  },
  {
    slug: "python-encapsulation",
    title: "Encapsulation",
    intro:
      "Encapsulation means bundling data and the methods that use it inside a class, and hiding the internal details from the outside. It matters because it stops other code from breaking an object by changing its data in the wrong way.",
    blocks: [
      { type: "heading", text: "What is encapsulation?" },
      {
        type: "para",
        text: "Encapsulation has two parts. First, the data and the methods that work on it live together inside the class, so an object is one self-contained unit. Second, the internal details are hidden, and other code reaches the data only through the public methods the class offers. A bank account is a good example: the balance lives inside the object, and deposit and withdraw are the controlled ways to change it.",
      },
      {
        type: "para",
        text: "Python marks internal data with naming conventions. A normal name like owner is public, and anyone can use it. A name with one leading underscore, like _balance, is protected: a signal that it is for internal use and should not be touched from outside. A name with two leading underscores, like __pin, is private, and Python renames it behind the scenes so it is harder to reach from outside.",
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
      { type: "heading", text: "Controlling access with a property" },
      {
        type: "para",
        text: "The strongest form of encapsulation in Python is a property. The real value sits in an underscore attribute, and the property is the public way in. Its setter can check every new value and refuse one that does not make sense, so the object can never hold bad data, no matter who tries to set it.",
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
      {
        type: "list",
        items: [
          "Encapsulation bundles data and methods together inside a class.",
          "Public names have no underscore and are open to all.",
          "One leading underscore means protected: internal use only.",
          "Two leading underscores mean private: Python renames the attribute.",
          "A property controls access and can check every new value.",
        ],
      },
      {
        type: "note",
        text: "These are conventions, not locks. A protected attribute can still be read from outside, and a private one can still be reached through its renamed form. The point is communication: the underscores tell other programmers to use the public methods instead.",
      },
      {
        type: "tip",
        text: "Keep most attributes public while you are learning, and use a single underscore for values that only the class itself should change. Reach for a property when a value needs a check, and for double underscores only when a name clash with a child class is a real risk.",
      },
    ],
    practice: [
      "Create a class with a public attribute, a protected attribute, and a private attribute, then print each one from outside and note what happens.",
      "Add a public method to your class that reads the private attribute and returns it, and use the method instead of touching the attribute directly.",
      "Create a class with a property that refuses a bad value, and test it with a good value and a bad value.",
    ],
    summary: [
      "Encapsulation bundles data and its methods inside a class.",
      "Internal data is marked with underscores to signal it should not be touched directly.",
      "Public methods are the controlled way to read and change the data.",
      "A property can check every new value before it is stored.",
    ],
  },
  {
    slug: "python-challenges-encapsulation",
    title: "Code Challenge",
    intro:
      "Time to practise encapsulation. Build a BankAccount class that hides its balance behind a private attribute, and only allows deposits and withdrawals through methods that check the amounts.",
    blocks: [
      { type: "heading", text: "The challenge" },
      {
        type: "para",
        text: "Create a class called BankAccount with an owner and a private balance stored as __balance. Add a deposit method that adds money only when the amount is more than 0, a withdraw method that subtracts money only when there is enough balance and prints Withdrew followed by the amount, or prints Not enough balance. when there is not, and a get_balance method that returns the balance. Then open an account for Sam with 1000, deposit 500, withdraw 200, print the balance, try to withdraw 2000, and print the balance again.",
      },
      { type: "heading", text: "Hints" },
      {
        type: "list",
        items: [
          "Store the balance as self.__balance inside __init__, so it is private.",
          "The withdraw method must check the balance before it subtracts anything.",
          "Outside code should only use deposit, withdraw, and get_balance, never the attribute directly.",
        ],
      },
      { type: "heading", text: "Solution" },
      {
        type: "para",
        text: "The balance is private, so the only way to change it is through the methods, and each method checks the amount first. The failed withdrawal of 2000 leaves the balance untouched at 1300, which is exactly what a bank account should do.",
      },
      {
        type: "code",
        title: "Solution: the BankAccount class",
        code: `class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self.__balance = balance

    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount

    def withdraw(self, amount):
        if amount <= self.__balance:
            self.__balance -= amount
            print("Withdrew", amount)
        else:
            print("Not enough balance.")

    def get_balance(self):
        return self.__balance

acc = BankAccount("Sam", 1000)
acc.deposit(500)
acc.withdraw(200)
print(acc.get_balance())
acc.withdraw(2000)
print(acc.get_balance())`,
        output: "Withdrew 200\n1300\nNot enough balance.\n1300",
      },
      {
        type: "para",
        text: "The deposit check matters too. A negative deposit is not money coming in, so the method ignores it and the balance stays the same.",
      },
      {
        type: "code",
        title: "A negative deposit is ignored",
        code: `class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self.__balance = balance

    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount

    def get_balance(self):
        return self.__balance

acc = BankAccount("Mia", 100)
acc.deposit(50)
acc.deposit(-500)
print(acc.get_balance())`,
        output: "150",
      },
      {
        type: "note",
        text: "Trying to read acc.__balance directly from outside the class raises an AttributeError, because inside the class the name has become _BankAccount__balance. Use get_balance instead, which is the public way in.",
      },
    ],
    practice: [
      "Add a transfer method to BankAccount that withdraws from one account and deposits into another, using only the public methods.",
      "Create a class called Student with a private marks attribute and a property that refuses values above 100 or below 0.",
      "Create a class called Safe with a private code and a method that returns True only when the entered code matches.",
    ],
    summary: [
      "Encapsulation hides data inside the object and exposes it through methods.",
      "A double underscore makes an attribute private through name mangling.",
      "Methods check values before changing the hidden data.",
      "Outside code should use the public methods, not the private attributes.",
    ],
  },
  {
    slug: "python-class-inner",
    title: "Python Inner Classes",
    intro:
      "An inner class is a class defined inside another class. It is used when one class only makes sense as part of another, like a department inside a university or an engine inside a car.",
    blocks: [
      { type: "heading", text: "What is an inner class?" },
      {
        type: "para",
        text: "An inner class is written in the body of an outer class, indented one level inside it. It belongs to the outer class, so you reach it through the outer class name: Outer.Inner. The inner class is a normal class in every other way: it has its own __init__, its own attributes, and its own methods.",
      },
      {
        type: "para",
        text: "Inner classes are for grouping. A university has departments, and a department is hard to imagine on its own outside a university. Putting Department inside University says that clearly in the code, and keeps the two names together instead of having two separate top-level classes.",
      },
      {
        type: "code",
        title: "A Department class inside a University class",
        code: `class University:
    def __init__(self, name):
        self.name = name

    class Department:
        def __init__(self, name):
            self.name = name

        def show(self):
            print("Department:", self.name)

u = University("City University")
dept = University.Department("Computer Science")
dept.show()
print(u.name)`,
        output: "Department: Computer Science\nCity University",
      },
      { type: "heading", text: "Creating the inner object from a method" },
      {
        type: "para",
        text: "The outer class can also build inner objects for you. A method on the outer class can create and return an inner object, so the caller never writes the long Outer.Inner name. The Car below has a build_engine method that returns an Engine, and the engine works on its own once it is built.",
      },
      {
        type: "code",
        title: "A method that builds an inner Engine",
        code: `class Car:
    def __init__(self, brand):
        self.brand = brand

    class Engine:
        def __init__(self, power):
            self.power = power

        def start(self):
            print("Engine with", self.power, "hp started.")

    def build_engine(self, power):
        return Car.Engine(power)

car = Car("City Motors")
engine = car.build_engine(120)
engine.start()
print(car.brand)`,
        output: "Engine with 120 hp started.\nCity Motors",
      },
      {
        type: "list",
        items: [
          "An inner class is defined inside the body of an outer class.",
          "Reach it through the outer class: Outer.Inner.",
          "It is a normal class with its own attributes and methods.",
          "An outer method can build and return an inner object.",
          "Use inner classes only when the inner class belongs to the outer one.",
        ],
      },
      {
        type: "note",
        text: "An inner class does not automatically see the outer object's data. A Department object has no access to the University object's name unless you pass it in. If the inner class needs the outer data, pass it as an argument when you create it.",
      },
    ],
    practice: [
      "Create a class called School with an inner class called Classroom that stores a room number and prints it.",
      "Add a method to School that creates a Classroom and returns it, then call the method and print the room number.",
      "Create a class called Computer with an inner class called CPU that stores a speed and has a method that prints it.",
    ],
    summary: [
      "An inner class is a class defined inside another class.",
      "It is reached through the outer class name: Outer.Inner.",
      "It groups a helper class with the class it belongs to.",
      "The inner class does not automatically see the outer object's data.",
    ],
  },
];
