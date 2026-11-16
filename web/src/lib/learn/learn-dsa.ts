import type { LearnTutorial } from "./types";

export const TUTORIALS: LearnTutorial[] = [
  {
    slug: "python-dsa",
    title: "Python DSA",
    intro: "DSA stands for Data Structures and Algorithms. A data structure is a way to organise data, and an algorithm is a step-by-step method to solve a problem with that data.",
    blocks: [
      { type: "heading", text: "Why DSA matters" },
      { type: "para", text: "Every program stores data and does something with it. A shopping list, a leaderboard, and a map of train routes all need different ways of storing data. Picking the right structure makes a program faster, simpler, and easier to change later. That is the whole point of DSA: match the structure to the job, then use a good method to work with it." },
      { type: "para", text: "Python already gives you powerful built-in structures: lists, dictionaries, sets, and tuples. Many DSA ideas in Python start with these, and you build the rest, like stacks, queues, and trees, on top of them. You do not need a new language to learn DSA. You need clear thinking and practice." },
      { type: "heading", text: "A list is a data structure" },
      { type: "para", text: "A list keeps items in order and lets you add, remove, and find them. The code below stores three scores, adds a fourth, and finds the best one. This is a small example, but it shows the pattern of every DSA topic: store the data, then run a method over it." },
      {
        type: "code",
        title: "A list holding scores",
        code: `scores = [85, 92, 78]
scores.append(95)
print(scores)
print("Best score:", max(scores))`,
        output: `[85, 92, 78, 95]
Best score: 95`,
      },
      { type: "heading", text: "A dictionary is a data structure too" },
      { type: "para", text: "A dictionary stores pairs of keys and values, so you can look a value up by its name instead of its position. Looking up a name in a dictionary is fast, even when the dictionary holds thousands of entries. That speed is why dictionaries are used for phone books, caches, and counting words." },
      {
        type: "code",
        title: "Looking up a value by key",
        code: `marks = {"Asha": 92, "Ravi": 78}
print(marks["Asha"])
print("Ravi" in marks)`,
        output: `92
True`,
      },
      { type: "para", text: "An algorithm is a clear set of steps that always ends with an answer. Searching a list from start to finish is an algorithm. Sorting a list from smallest to largest is an algorithm. A good algorithm is correct first, and fast second. In this section you will meet searching, sorting, stacks, queues, linked lists, hash tables, trees, and graphs, each with working Python code. Learn one structure at a time: read its idea, run its code, then change one thing and run it again." },
    ],
    practice: [
      "Make a list of five of your favourite films, add one more, and print the list and its length.",
      "Make a dictionary of three friends and their ages, then look up one age by name.",
      "Write a loop that adds up all the numbers in [4, 8, 15, 16, 23] and prints the total.",
    ],
    summary: [
      "DSA means data structures plus algorithms.",
      "A data structure organises data; an algorithm is the method that works on it.",
      "Python lists and dictionaries are data structures you already know.",
      "The right structure makes a program faster and easier to change.",
      "This section builds stacks, queues, linked lists, trees, graphs, and sorting step by step.",
    ],
  },
  {
    slug: "python-dsa-lists",
    title: "Lists and Arrays",
    intro: "A list is an ordered collection of items. An array is a similar idea: a fixed group of items of the same type, stored one after another.",
    blocks: [
      { type: "heading", text: "Lists in Python" },
      { type: "para", text: "A Python list can hold numbers, strings, or a mix of both, and it can grow or shrink while a program runs. Items stay in the order you put them in. You reach an item by its index, which starts at 0. A negative index counts from the end, so -1 is the last item. Lists are the most common structure in Python, and most other structures in this section are built on top of them." },
      {
        type: "code",
        title: "Indexing, slicing, and growing a list",
        code: `fruits = ["apple", "banana", "cherry"]
print(fruits[0])
print(fruits[-1])
print(fruits[1:])
fruits.append("mango")
print(len(fruits))`,
        output: `apple
cherry
['banana', 'cherry']
4`,
      },
      { type: "heading", text: "Arrays versus lists" },
      { type: "para", text: "In many languages an array has a fixed size and one type, such as only integers. Python lists are more flexible: they can grow, and they can mix types. Python also has an array module for fixed-type arrays, and the list type is what most Python programs use day to day. When a tutorial says array, it usually means a list used as a simple ordered store." },
      { type: "list", items: ["A list grows with append and shrinks with remove or pop.", "Indexing a list is fast, because Python jumps straight to the position.", "Inserting in the middle is slower, because later items must shift along.", "Searching an unsorted list means checking items one by one."] },
      { type: "heading", text: "Building lists with a loop in one line" },
      { type: "para", text: "A list comprehension builds a new list from an old one in a single line. The example below squares each number from 1 to 5. It is the same as writing a loop with append, but shorter and easier to read once you are used to it. The built-in sum function then adds the original numbers together." },
      {
        type: "code",
        title: "Squares with a list comprehension",
        code: `numbers = [1, 2, 3, 4, 5]
squares = [n * n for n in numbers]
print(squares)
print(sum(numbers))`,
        output: `[1, 4, 9, 16, 25]
15`,
      },
      { type: "note", text: "Accessing a list by index is fast, but inserting or deleting in the middle moves every item after it. That trade-off is why other structures, like linked lists, exist." },
    ],
    practice: [
      "Make a list of the seven days of the week and print the first, the last, and the middle three.",
      "Use a list comprehension to make a list of the cubes of [1, 2, 3, 4].",
      "Start with [10, 20, 30], insert 15 at index 1, remove 20, and print the final list.",
    ],
    summary: [
      "A list keeps items in order and can grow or shrink.",
      "Indexes start at 0, and -1 means the last item.",
      "Slicing takes a part of a list without changing the original.",
      "List comprehensions build a new list in one line.",
      "Indexing is fast, but inserting in the middle shifts later items.",
    ],
  },
  {
    slug: "python-dsa-stacks",
    title: "Stacks",
    intro: "A stack is a collection where you add and remove items from the same end, the top. It follows last in, first out: the last item added is the first one removed.",
    blocks: [
      { type: "heading", text: "Last in, first out" },
      { type: "para", text: "Think of a pile of plates. You put a new plate on top, and you take the top plate off first. You never reach into the middle of the pile. A stack works the same way. Adding an item is called push, removing the top item is called pop, and looking at the top without removing it is called peek. Stacks are used for undo in editors, back buttons in browsers, and checking matching brackets." },
      { type: "para", text: "In Python, a plain list already works as a stack: append pushes, and pop removes from the end. The class below wraps a list so the stack idea is clear, with push, pop, peek, and is_empty methods. The demo pushes three plates, peeks at the top, pops one, and shows what is left." },
      {
        type: "code",
        title: "A Stack class built on a list",
        code: `class Stack:
    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)

    def pop(self):
        return self.items.pop()

    def peek(self):
        return self.items[-1]

    def is_empty(self):
        return len(self.items) == 0


s = Stack()
s.push("plate 1")
s.push("plate 2")
s.push("plate 3")
print(s.peek())
print(s.pop())
print(s.items)`,
        output: `plate 3
plate 3
['plate 1', 'plate 2']`,
      },
      { type: "heading", text: "A real use: matching brackets" },
      { type: "para", text: "A stack is the natural tool for checking brackets. Read the text from left to right. Push every opening bracket onto the stack. When you meet a closing bracket, pop the top of the stack and check that it is the matching opener. If the stack is empty at the end, every bracket was matched. The example below returns True for balanced text and False when a bracket is left open." },
      {
        type: "code",
        title: "Checking balanced brackets with a stack",
        code: `def is_balanced(text):
    stack = []
    pairs = {")": "(", "]": "[", "}": "{"}
    for ch in text:
        if ch in "([{":
            stack.append(ch)
        elif ch in ")]}":
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack


print(is_balanced("(a + b) * [c]"))
print(is_balanced("(a + b"))`,
        output: `True
False`,
      },
      { type: "note", text: "Never pop from an empty stack: Python raises an IndexError. Check is_empty first, or guard the pop as the bracket checker does." },
      { type: "tip", text: "Undo in an editor is a stack of actions: each new action is pushed, and undo pops the latest one." },
    ],
    practice: [
      "Use the Stack class to push the numbers 1 to 5, then pop them all and print each one as it comes off.",
      "Write a function that reverses a string by pushing its characters onto a stack and popping them off.",
      "Test is_balanced on '{[()]}' and on '([)]' and explain why the second one fails.",
    ],
    summary: [
      "A stack adds and removes from the top only: last in, first out.",
      "Push adds, pop removes the top, peek looks at the top.",
      "A Python list works as a stack with append and pop.",
      "Stacks check matching brackets and power undo.",
      "Popping an empty stack raises an IndexError, so check first.",
    ],
  },
  {
    slug: "python-dsa-queues",
    title: "Queues",
    intro: "A queue is a collection where items leave in the same order they arrived. It follows first in, first out: the first item added is the first one removed.",
    blocks: [
      { type: "heading", text: "First in, first out" },
      { type: "para", text: "Think of a line at a ticket counter. The first person in line is served first, and a new person joins at the back. A queue works the same way. Adding an item is called enqueue, and removing the front item is called dequeue. Queues are used for print jobs, messages waiting to be handled, and breadth-first search in graphs." },
      { type: "para", text: "A plain Python list is a poor queue, because removing from the front shifts every other item along. The collections module has deque, which is built for fast adds and removes at both ends. The demo below enqueues three people, serves two of them with popleft, and shows who is still waiting." },
      {
        type: "code",
        title: "A queue with collections.deque",
        code: `from collections import deque

queue = deque()
queue.append("Asha")
queue.append("Ravi")
queue.append("Meera")
print(queue.popleft())
print(queue.popleft())
print(list(queue))`,
        output: `Asha
Ravi
['Meera']`,
      },
      { type: "heading", text: "A deque works at both ends" },
      { type: "para", text: "Deque is short for double-ended queue. It can add and remove at the front with appendleft and popleft, and at the back with append and pop. That makes it useful for more than plain queues, for example for keeping a sliding window of the last few values. The example below adds 0 at the front and 4 at the back, then removes one item from each end." },
      {
        type: "code",
        title: "Adding and removing at both ends",
        code: `from collections import deque

dq = deque([1, 2, 3])
dq.appendleft(0)
dq.append(4)
print(list(dq))
print(dq.pop())
print(dq.popleft())`,
        output: `[0, 1, 2, 3, 4]
4
0`,
      },
      { type: "list", items: ["Enqueue adds at the back; dequeue removes from the front.", "Use deque, not a list, when you remove from the front often.", "A queue with no items is empty: check it before you dequeue.", "Stacks are last in, first out; queues are first in, first out."] },
      { type: "note", text: "A priority queue is a different idea: items leave in order of importance, not arrival order. Python has heapq for that." },
    ],
    practice: [
      "Enqueue the names of four friends, then dequeue them one by one and print each name as it leaves.",
      "Use a deque to keep only the last three numbers you type, dropping the oldest when a new one arrives.",
      "Write a small ticket counter: customers join the queue, one is served, and the queue is printed after each step.",
    ],
    summary: [
      "A queue is first in, first out.",
      "Enqueue adds at the back; dequeue removes from the front.",
      "Use collections.deque for a fast queue in Python.",
      "Queues handle print jobs, messages, and breadth-first search.",
      "A deque can add and remove at both ends.",
    ],
  },
  {
    slug: "python-dsa-linkedlists",
    title: "Linked Lists",
    intro: "A linked list is a chain of nodes. Each node holds one value and a link to the next node, so the list can grow without moving the other items.",
    blocks: [
      { type: "heading", text: "Nodes and links" },
      { type: "para", text: "In a list, items sit next to each other in memory, so inserting in the middle shifts everything after it. In a linked list, each item lives in its own node, and each node points to the next one. To insert a node, you only change two links. To find an item, you walk the chain from the head, one link at a time. The price is that there is no fast jump to the middle: you must walk there." },
      { type: "para", text: "The code below defines a Node with data and a next link, and a LinkedList that keeps the head node. The append method walks to the end of the chain and attaches a new node there. The show method walks the chain and prints each value followed by an arrow, ending with None." },
      {
        type: "code",
        title: "A linked list with append and print",
        code: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None


class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node

    def show(self):
        values = []
        current = self.head
        while current:
            values.append(str(current.data))
            current = current.next
        print(" -> ".join(values) + " -> None")


nums = LinkedList()
nums.append(10)
nums.append(20)
nums.append(30)
nums.show()`,
        output: `10 -> 20 -> 30 -> None`,
      },
      { type: "heading", text: "Adding at the front is cheap" },
      { type: "para", text: "Adding at the front of a linked list is a one-step job: make a new node, point it at the old head, and make it the new head. Nothing else moves. That is the opposite of a Python list, where inserting at index 0 shifts every item. The example below puts 10 in front of 20 by linking the new node to the old head." },
      {
        type: "code",
        title: "Prepending a node",
        code: `class Node2:
    def __init__(self, data):
        self.data = data
        self.next = None


head = Node2(20)
new_head = Node2(10)
new_head.next = head
print(new_head.data, "->", new_head.next.data)`,
        output: `10 -> 20`,
      },
      { type: "list", items: ["Each node holds data and a link to the next node.", "The head is the first node; the last node links to None.", "Inserting and deleting need only a few link changes.", "Finding an item means walking from the head, one node at a time."] },
      { type: "note", text: "A doubly linked list adds a link to the previous node too, so you can walk backwards. Python lists are usually simpler, so use a linked list only when you need cheap inserts in the middle." },
    ],
    practice: [
      "Add a prepend method to the LinkedList class and test it by prepending 5 to the list [10, 20, 30].",
      "Add a find method that returns True if a value is in the list and False if it is not.",
      "Build a linked list of four names and print them with show.",
    ],
    summary: [
      "A linked list is a chain of nodes, each pointing to the next.",
      "The head is the first node; the last node points to None.",
      "Inserting only changes links, so nothing else moves.",
      "Finding an item means walking the chain from the head.",
      "Use a linked list when inserts in the middle matter more than fast indexing.",
    ],
  },
  {
    slug: "python-dsa-hashtables",
    title: "Hash Tables",
    intro: "A hash table stores key-value pairs and finds a value by its key almost instantly, no matter how many pairs it holds. Python dictionaries are hash tables.",
    blocks: [
      { type: "heading", text: "Keys, not positions" },
      { type: "para", text: "In a list you find an item by its position. In a hash table you find it by its key, such as a name. A hash function turns the key into a number, and that number picks a slot where the value is stored. Looking up a key means hashing it again and jumping straight to its slot, instead of checking every item. That is why a dictionary lookup stays fast even with thousands of entries." },
      { type: "para", text: "The code below builds a small phone book. Assigning phonebook['Asha'] stores a number under the name Asha. Reading phonebook['Asha'] finds it again. The get method returns a default value instead of an error when the key is missing, and assigning to an existing key replaces its value." },
      {
        type: "code",
        title: "A dictionary as a hash table",
        code: `phonebook = {}
phonebook["Asha"] = "98765"
phonebook["Ravi"] = "91234"
print(phonebook["Asha"])
print(phonebook.get("Meera", "not found"))
phonebook["Asha"] = "99999"
print(phonebook)`,
        output: `98765
not found
{'Asha': '99999', 'Ravi': '91234'}`,
      },
      { type: "heading", text: "What a hash function does" },
      { type: "para", text: "A real hash function turns any key into a slot number. The simple one below adds up the letter codes of a key and takes the remainder when divided by 10, so the result is always a slot from 0 to 9. Different keys can land in the same slot: that is called a collision, and a real hash table handles it by storing several pairs in one slot. The same code also shows the most common dictionary job: counting how often each word appears." },
      {
        type: "code",
        title: "A tiny hash function and word counting",
        code: `def simple_hash(key):
    return sum(ord(ch) for ch in key) % 10


print(simple_hash("Asha"))
print(simple_hash("Ravi"))
print(simple_hash("Meera"))

words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
counts = {}
for w in words:
    counts[w] = counts.get(w, 0) + 1
print(counts)`,
        output: `1
2
0
{'apple': 3, 'banana': 2, 'cherry': 1}`,
      },
      { type: "list", items: ["A hash function turns a key into a slot number.", "Two keys can share a slot: that is a collision.", "Average lookup, insert, and delete are fast, close to constant time.", "Keys must be hashable: strings, numbers, and tuples work, but lists do not."] },
      { type: "tip", text: "Use get with a default value when a key might be missing, instead of checking with in first." },
    ],
    practice: [
      "Build a dictionary of five countries and their capitals, then look up two of them.",
      "Count the letters in the word 'banana' with a dictionary, so the result shows each letter and its count.",
      "Try using a list as a dictionary key and read the error, then explain in one sentence why it fails.",
    ],
    summary: [
      "A hash table finds a value by its key, not its position.",
      "A hash function turns a key into a slot number.",
      "Python dictionaries are hash tables.",
      "Two keys can share a slot; that is a collision.",
      "Counting with a dictionary is one of the most useful patterns in Python.",
    ],
  },
  {
    slug: "python-dsa-trees",
    title: "Trees",
    intro: "A tree is a structure where each item has one parent and any number of children, like a family tree or the folders on a computer.",
    blocks: [
      { type: "heading", text: "One root, many branches" },
      { type: "para", text: "A tree starts at a single root node at the top. Every other node has exactly one parent, and a node with no children is called a leaf. The path from the root to a node is its depth, and the longest path down to a leaf is the height of the tree. Folders on a computer are a tree: each folder holds files and more folders, and every folder has one parent folder." },
      { type: "para", text: "The code below builds a small tree of animals. Each TreeNode holds a name and a list of children, and the add method attaches a child. The show method prints the tree with indentation, so each level sits further to the right. Run it and you can see the shape of the tree in the output." },
      {
        type: "code",
        title: "A general tree with indented printing",
        code: `class TreeNode:
    def __init__(self, name):
        self.name = name
        self.children = []

    def add(self, child):
        self.children.append(child)

    def show(self, level=0):
        print("  " * level + self.name)
        for child in self.children:
            child.show(level + 1)


root = TreeNode("Animals")
mammals = TreeNode("Mammals")
birds = TreeNode("Birds")
mammals.add(TreeNode("Dog"))
mammals.add(TreeNode("Cat"))
birds.add(TreeNode("Crow"))
root.add(mammals)
root.add(birds)
root.show()`,
        output: `Animals
  Mammals
    Dog
    Cat
  Birds
    Crow`,
      },
      { type: "heading", text: "Walking a tree" },
      { type: "para", text: "Most work on a tree is a walk: visit a node, then visit each of its children in turn. That is recursion in its natural form, because each child is itself the root of a smaller tree. The count function below visits a node, counts it as one, and adds the counts of all its children. For the animal tree the answer is six: the root, two groups, and three animals." },
      {
        type: "code",
        title: "Counting every node in the tree",
        code: `def count_nodes(node):
    total = 1
    for child in node.children:
        total += count_nodes(child)
    return total


print("Nodes:", count_nodes(root))`,
        output: `Nodes: 6`,
      },
      { type: "list", items: ["The root is the top node; a leaf has no children.", "Each node has one parent, except the root, which has none.", "Depth is the distance from the root; height is the longest path down.", "Trees model folders, organisation charts, and family trees."] },
      { type: "note", text: "This example reuses the root built in the code block above. In the editor, run both blocks together so root exists when count_nodes is called." },
    ],
    practice: [
      "Build a tree of your family or your college departments and print it with show.",
      "Write a function that returns a list of all the leaf names in a tree.",
      "Add a method that finds a node by name and returns True if it exists in the tree.",
    ],
    summary: [
      "A tree has one root, and every other node has one parent.",
      "A node with no children is a leaf.",
      "Indentation shows the shape of a tree when you print it.",
      "Walking a tree means visiting a node, then its children.",
      "Trees model folders, charts, and anything with a hierarchy.",
    ],
  },
  {
    slug: "python-dsa-binarytrees",
    title: "Binary Trees",
    intro: "A binary tree is a tree where each node has at most two children: a left child and a right child. That simple limit makes binary trees easy to search and traverse.",
    blocks: [
      { type: "heading", text: "Left and right" },
      { type: "para", text: "In a general tree a node can have any number of children. In a binary tree it has at most two, called left and right. That limit is what makes binary trees useful: you can always say go left or go right, and you can visit every node in a fixed, predictable order. The tree below has 1 at the root, 2 and 3 below it, and 4 and 5 below 2." },
      { type: "para", text: "There are three classic ways to walk a binary tree. Inorder visits the left subtree, then the node, then the right subtree. Preorder visits the node first, then left, then right. Postorder visits left and right first, and the node last. The code below builds the tree and prints all three orders, so you can compare them side by side." },
      {
        type: "code",
        title: "Building a binary tree and walking it three ways",
        code: `class BTNode:
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None


root = BTNode(1)
root.left = BTNode(2)
root.right = BTNode(3)
root.left.left = BTNode(4)
root.left.right = BTNode(5)


def inorder(node):
    if node:
        inorder(node.left)
        print(node.data, end=" ")
        inorder(node.right)


def preorder(node):
    if node:
        print(node.data, end=" ")
        preorder(node.left)
        preorder(node.right)


def postorder(node):
    if node:
        postorder(node.left)
        postorder(node.right)
        print(node.data, end=" ")


inorder(root)
print()
preorder(root)
print()
postorder(root)
print()`,
        output: `4 2 5 1 3
1 2 4 5 3
4 5 2 3 1`,
      },
      { type: "heading", text: "Height of a tree" },
      { type: "para", text: "The height of a tree is the number of nodes on the longest path from the root down to a leaf. An empty tree has height 0, and a single node has height 1. The function below works by asking each side for its height and taking the larger one, plus one for the current node. For the tree above the height is 3: the path 1, 2, 4 has three nodes." },
      {
        type: "code",
        title: "Measuring the height of a binary tree",
        code: `def height(node):
    if not node:
        return 0
    return 1 + max(height(node.left), height(node.right))


print("Height:", height(root))`,
        output: `Height: 3`,
      },
      { type: "list", items: ["Inorder: left, node, right.", "Preorder: node, left, right.", "Postorder: left, right, node.", "A full binary tree has 0 or 2 children at every node; a complete tree fills each level from the left."] },
      { type: "note", text: "This height example reuses the root built in the code block above. Run both blocks together in the editor." },
    ],
    practice: [
      "Build a binary tree with root 10, left 5, right 15, and two children under 5, then print its inorder walk.",
      "Write a function that counts all the nodes in a binary tree.",
      "Write a function that returns True if a value is present anywhere in a binary tree.",
    ],
    summary: [
      "A binary tree gives each node at most a left and a right child.",
      "Inorder visits left, node, right; preorder visits node first; postorder visits node last.",
      "Traversals are recursive: each subtree is a smaller tree.",
      "Height is the longest path from the root to a leaf, counted in nodes.",
      "Binary trees are the base for binary search trees and AVL trees.",
    ],
  },
  {
    slug: "python-dsa-binarysearchtrees",
    title: "Binary Search Trees",
    intro: "A binary search tree is a binary tree with one rule: everything in the left subtree is smaller than the node, and everything in the right subtree is larger.",
    blocks: [
      { type: "heading", text: "The ordering rule" },
      { type: "para", text: "A binary search tree, or BST, adds order to a binary tree. For every node, all values in its left subtree are smaller than the node, and all values in its right subtree are larger. That single rule makes searching fast: at each node you compare the target with the node, then go left or right, and you throw away half the tree at every step. It also means an inorder walk of a BST prints the values in sorted order." },
      { type: "para", text: "Inserting a value means walking down the tree until you find an empty spot. If the new value is smaller than the node, go left; if larger, go right. When you reach an empty link, put the new node there. The code below inserts 50, 30, 70, 20, 40, 60, and 80, then prints the inorder walk, which comes out sorted." },
      {
        type: "code",
        title: "Inserting into a BST and walking it in order",
        code: `class BSTNode:
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None


def insert(node, data):
    if not node:
        return BSTNode(data)
    if data < node.data:
        node.left = insert(node.left, data)
    else:
        node.right = insert(node.right, data)
    return node


def inorder_bst(node):
    if node:
        inorder_bst(node.left)
        print(node.data, end=" ")
        inorder_bst(node.right)


def search(node, target):
    if not node:
        return False
    if target == node.data:
        return True
    if target < node.data:
        return search(node.left, target)
    return search(node.right, target)


root = None
for value in [50, 30, 70, 20, 40, 60, 80]:
    root = insert(root, value)

inorder_bst(root)
print()
print(search(root, 40))
print(search(root, 25))`,
        output: `20 30 40 50 60 70 80
True
False`,
      },
      { type: "heading", text: "Smallest and largest" },
      { type: "para", text: "The ordering rule makes the extremes easy to find. The smallest value is the leftmost node: keep going left until there is no left child. The largest value is the rightmost node: keep going right. No comparisons are needed beyond following the links, so both run in time proportional to the height of the tree." },
      {
        type: "code",
        title: "Finding the minimum and maximum",
        code: `def find_min(node):
    while node.left:
        node = node.left
    return node.data


def find_max(node):
    while node.right:
        node = node.right
    return node.data


print(find_min(root))
print(find_max(root))`,
        output: `20
80`,
      },
      { type: "note", text: "A BST is only fast when it stays balanced. Inserting already-sorted values makes a chain, and searching that chain is no faster than searching a list. AVL trees fix this." },
      { type: "tip", text: "If an inorder walk of your tree does not print sorted values, your insert put a value on the wrong side." },
    ],
    practice: [
      "Insert [15, 10, 20, 8, 12, 25] into a BST and print the inorder walk to check it is sorted.",
      "Write a search that returns the node itself instead of True or False.",
      "Insert the sorted values [1, 2, 3, 4, 5] into a BST and describe the shape you get.",
    ],
    summary: [
      "In a BST, left values are smaller and right values are larger than the node.",
      "An inorder walk of a BST prints values in sorted order.",
      "Search throws away half the tree at each step.",
      "The smallest value is the leftmost node; the largest is the rightmost.",
      "A BST that becomes a chain loses its speed, which AVL trees fix.",
    ],
  },
  {
    slug: "python-dsa-avltrees",
    title: "AVL Trees",
    intro: "An AVL tree is a binary search tree that keeps itself balanced. After every insert, it checks the balance of each node and rotates the tree when one side gets too tall.",
    blocks: [
      { type: "heading", text: "Why balance matters" },
      { type: "para", text: "A plain binary search tree is fast only when it is balanced. Insert the values 10, 20, 30, 40, 50 in order, and you get a chain leaning to the right, where searching is as slow as searching a list. An AVL tree prevents that. It stores a height on every node and defines the balance of a node as the height of its left subtree minus the height of its right subtree. A node is balanced when that number is -1, 0, or 1." },
      { type: "para", text: "When an insert makes a node unbalanced, the tree fixes it with a rotation: a small rearrangement of a few links that shortens the tall side and keeps the ordering rule intact. A right rotation fixes a tree that leans left, and a left rotation fixes one that leans right. Sometimes two rotations are needed, one on the child and one on the parent." },
      { type: "para", text: "The code below is a complete AVL insert. It inserts like a BST, updates heights on the way back up, checks the balance at each node, and applies the right rotation for each of the four cases: left-left, right-right, left-right, and right-left. Inserting 10, 20, 30, 40, 50, and 25 ends with 30 at the root and a height of 3, where a plain BST chain would have height 6." },
      {
        type: "code",
        title: "AVL insert with rotations",
        code: `class AVLNode:
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None
        self.height = 1


def avl_height(node):
    return node.height if node else 0


def balance(node):
    return avl_height(node.left) - avl_height(node.right) if node else 0


def update(node):
    node.height = 1 + max(avl_height(node.left), avl_height(node.right))
    return node


def rotate_right(y):
    x = y.left
    y.left = x.right
    x.right = update(y)
    return update(x)


def rotate_left(x):
    y = x.right
    x.right = y.left
    y.left = update(x)
    return update(y)


def avl_insert(node, data):
    if not node:
        return AVLNode(data)
    if data < node.data:
        node.left = avl_insert(node.left, data)
    else:
        node.right = avl_insert(node.right, data)
    node = update(node)
    b = balance(node)
    if b > 1 and data < node.left.data:
        return rotate_right(node)
    if b < -1 and data > node.right.data:
        return rotate_left(node)
    if b > 1 and data > node.left.data:
        node.left = rotate_left(node.left)
        return rotate_right(node)
    if b < -1 and data < node.right.data:
        node.right = rotate_right(node.right)
        return rotate_left(node)
    return node


def avl_inorder(node, out):
    if node:
        avl_inorder(node.left, out)
        out.append(str(node.data))
        avl_inorder(node.right, out)


root = None
for value in [10, 20, 30, 40, 50, 25]:
    root = avl_insert(root, value)

values = []
avl_inorder(root, values)
print(" ".join(values))
print("Root:", root.data)
print("Height:", root.height)
print("Balance:", balance(root))`,
        output: `10 20 25 30 40 50
Root: 30
Height: 3
Balance: 0`,
      },
      { type: "heading", text: "What the result shows" },
      { type: "para", text: "The inorder walk prints the values in sorted order, exactly as a BST would: the rotations never break the ordering rule. The root is 30, the middle value, and the height is 3 instead of 6. That is the whole win of an AVL tree: the height stays small, so searching, inserting, and deleting stay fast even when values arrive in sorted order." },
      {
        type: "code",
        title: "Height compared with a plain BST chain",
        code: `print("AVL height is 3, a plain BST chain would be 6")`,
        output: `AVL height is 3, a plain BST chain would be 6`,
      },
      { type: "list", items: ["Balance = height of left subtree minus height of right subtree.", "A node is balanced when its balance is -1, 0, or 1.", "A rotation rearranges a few links and keeps the ordering rule.", "Four cases: left-left, right-right, left-right, and right-left."] },
      { type: "note", text: "AVL trees trade a little extra work on insert for guaranteed fast search. Red-black trees make the same trade with looser balance and are used in many libraries." },
    ],
    practice: [
      "Insert [1, 2, 3, 4, 5, 6, 7] into an AVL tree and print the root and the height.",
      "Insert the same values into a plain BST and compare its height with the AVL height.",
      "Write a function that checks every node of a tree and returns True only if all balances are -1, 0, or 1.",
    ],
    summary: [
      "An AVL tree is a BST that rebalances itself after every insert.",
      "Balance is left height minus right height, and it must stay between -1 and 1.",
      "Rotations fix an unbalanced node without breaking the ordering rule.",
      "The height stays small, so search stays fast.",
      "An inorder walk of an AVL tree still prints sorted values.",
    ],
  },
  {
    slug: "python-dsa-graphs",
    title: "Graphs",
    intro: "A graph is a set of nodes connected by edges. It models anything with connections: roads between cities, friendships, or links between web pages.",
    blocks: [
      { type: "heading", text: "Nodes and edges" },
      { type: "para", text: "A graph has nodes, also called vertices, and edges that connect them. An edge can go one way, like a one-way street, or both ways, like a friendship. Edges can also carry a weight, such as the distance between two cities. Trees are a special kind of graph with no cycles, but most graphs allow cycles: you can travel around and come back to where you started." },
      { type: "para", text: "The simplest way to store a graph in Python is an adjacency list: a dictionary where each node maps to a list of its neighbours. The graph below has five nodes. A connects to B and C, B and C both connect to D, and D connects to E. The code prints each node and its neighbours, so you can see the whole structure." },
      {
        type: "code",
        title: "A graph as an adjacency list",
        code: `graph = {
    "A": ["B", "C"],
    "B": ["A", "D"],
    "C": ["A", "D"],
    "D": ["B", "C", "E"],
    "E": ["D"],
}

for node, neighbours in graph.items():
    print(node, "->", neighbours)`,
        output: `A -> ['B', 'C']
B -> ['A', 'D']
C -> ['A', 'D']
D -> ['B', 'C', 'E']
E -> ['D']`,
      },
      { type: "heading", text: "Walking a graph: BFS and DFS" },
      { type: "para", text: "Two walks cover every node in a graph. Breadth-first search, or BFS, uses a queue: it visits all neighbours of the start first, then the neighbours of those neighbours, spreading out level by level. Depth-first search, or DFS, uses a stack: it follows one path as far as it goes, then backtracks and tries another branch. Both keep a visited list, because a cycle could otherwise make them walk forever." },
      { type: "para", text: "The code below runs both walks from A on the graph above. BFS visits A, B, C, D, E in level order. DFS follows A to B to D to E first, then comes back for C. The order differs, but both visit all five nodes. BFS is the right choice for the shortest path in an unweighted graph; DFS is the right choice for exploring paths and detecting cycles." },
      {
        type: "code",
        title: "Breadth-first and depth-first search",
        code: `from collections import deque


def bfs(graph, start):
    visited = [start]
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for neighbour in graph[node]:
            if neighbour not in visited:
                visited.append(neighbour)
                queue.append(neighbour)
    return visited


def dfs(graph, start):
    visited = []
    stack = [start]
    while stack:
        node = stack.pop()
        if node not in visited:
            visited.append(node)
            for neighbour in reversed(graph[node]):
                stack.append(neighbour)
    return visited


print("BFS:", bfs(graph, "A"))
print("DFS:", dfs(graph, "A"))`,
        output: `BFS: ['A', 'B', 'C', 'D', 'E']
DFS: ['A', 'B', 'D', 'C', 'E']`,
      },
      { type: "list", items: ["A graph is nodes plus edges.", "An adjacency list is a dictionary from a node to its neighbours.", "BFS uses a queue and spreads level by level.", "DFS uses a stack and follows one path to the end.", "Keep a visited list so a cycle cannot trap the walk."] },
      { type: "note", text: "This BFS and DFS example reuses the graph built in the code block above. Run both blocks together in the editor." },
    ],
    practice: [
      "Add a node F connected to E, then run BFS and DFS from A again and print both orders.",
      "Write a function that returns True if there is a path from one node to another, using BFS.",
      "Build a graph of five cities you know, with roads as edges, and print its adjacency list.",
    ],
    summary: [
      "A graph is nodes connected by edges.",
      "An adjacency list stores each node with its neighbours.",
      "BFS uses a queue and visits level by level.",
      "DFS uses a stack and follows one path as far as it goes.",
      "A visited list stops cycles from trapping the walk.",
    ],
  },
  {
    slug: "python-dsa-linearsearch",
    title: "Linear Search",
    intro: "Linear search finds a value by checking each item in turn, from the first to the last, until it finds a match or runs out of items.",
    blocks: [
      { type: "heading", text: "The simplest search" },
      { type: "para", text: "Linear search is the most direct way to find something. Start at the first item. If it is the target, stop. If not, move to the next item and repeat. If you reach the end without a match, the target is not there. It works on any list, sorted or not, and on any kind of item, numbers or strings. Its cost is that in the worst case you check every item." },
      { type: "para", text: "The function below returns the index of the target, or -1 when the target is missing. Returning -1 is a common convention: no real index is negative, so -1 clearly means not found. In the list [5, 3, 8, 1, 9], the value 8 sits at index 2, and 7 is nowhere, so the search returns -1." },
      {
        type: "code",
        title: "Linear search returning the index or -1",
        code: `def linear_search(items, target):
    for index, item in enumerate(items):
        if item == target:
            return index
    return -1


nums = [5, 3, 8, 1, 9]
print(linear_search(nums, 8))
print(linear_search(nums, 7))`,
        output: `2
-1`,
      },
      { type: "heading", text: "Searching strings works the same way" },
      { type: "para", text: "Linear search does not care what the items are, as long as they can be compared with ==. The same function searches a list of names. Meera is at index 2, and Zara is not in the list, so the second call returns -1. Python also has the in operator, which does a linear search for you and returns True or False, but writing the loop yourself shows exactly how it works." },
      {
        type: "code",
        title: "Linear search over names",
        code: `names = ["Asha", "Ravi", "Meera", "Kiran"]
print(linear_search(names, "Meera"))
print(linear_search(names, "Zara"))`,
        output: `2
-1`,
      },
      { type: "list", items: ["Works on sorted and unsorted lists alike.", "Best case: the target is first, one check. Worst case: it is last or missing, every item checked.", "Time grows in direct proportion to the size of the list.", "For a sorted list, binary search is much faster."] },
      { type: "note", text: "This second example reuses linear_search from the code block above. Run both blocks together in the editor." },
    ],
    practice: [
      "Write a linear search that returns how many comparisons it made before finding the target.",
      "Search for the largest number in [4, 9, 2, 11, 7] without using max, by checking each item in turn.",
      "Time a linear search on a list of 100,000 numbers and compare it with the in operator.",
    ],
    summary: [
      "Linear search checks items one by one, from first to last.",
      "It returns the index of the target, or -1 when it is missing.",
      "It works on any list, sorted or not.",
      "Worst case it checks every item, so it is slow on large lists.",
      "Use binary search instead when the list is sorted.",
    ],
  },
  {
    slug: "python-dsa-binarysearch",
    title: "Binary Search",
    intro: "Binary search finds a value in a sorted list by cutting the search range in half at every step. It is far faster than linear search on large lists.",
    blocks: [
      { type: "heading", text: "Half the list, every step" },
      { type: "para", text: "Binary search only works on a sorted list. Look at the middle item. If it is the target, you are done. If the target is larger, throw away the left half and search the right half. If it is smaller, throw away the right half. Each step halves what is left, so a list of a million items needs about twenty steps at most. That is why sorted data is worth keeping sorted." },
      { type: "para", text: "The function below keeps two markers, low and high, for the ends of the current range. It computes the middle index, compares the middle value with the target, and moves low or high to shrink the range. When low passes high, the target is not in the list, and the function returns -1. The sorted list [11, 12, 22, 25, 34, 64, 90] gives index 3 for 25, index 5 for 64, and -1 for 100." },
      {
        type: "code",
        title: "Iterative binary search",
        code: `def binary_search(items, target):
    low, high = 0, len(items) - 1
    while low <= high:
        mid = (low + high) // 2
        if items[mid] == target:
            return mid
        if items[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1


nums = [11, 12, 22, 25, 34, 64, 90]
print(binary_search(nums, 25))
print(binary_search(nums, 64))
print(binary_search(nums, 100))`,
        output: `3
5
-1`,
      },
      { type: "heading", text: "How fast it really is" },
      { type: "para", text: "Each step halves the range, so doubling the list adds only one extra step. A list of 8 items needs at most 3 steps, a list of 1,000 needs about 10, and a list of a million needs about 20. The example below searches for 8, the last item in [1, 2, 3, 4, 5, 6, 7, 8], and finds it at index 7. Linear search would check all 8 items for the same answer." },
      {
        type: "code",
        title: "Finding the last item in a small list",
        code: `print(binary_search([1, 2, 3, 4, 5, 6, 7, 8], 8))`,
        output: `7`,
      },
      { type: "list", items: ["The list must be sorted first; binary search on unsorted data gives wrong answers.", "Each step halves the search range.", "A million items need about 20 steps at most.", "Python has bisect in the standard library for the same job."] },
      { type: "note", text: "This second example reuses binary_search from the code block above. Run both blocks together in the editor." },
    ],
    practice: [
      "Sort [34, 7, 23, 32, 5, 62] and use binary search to find 23 and 100.",
      "Add a counter to binary_search and print how many steps it takes to find 1 in a sorted list of 1,000 numbers.",
      "Run binary_search on the unsorted list [3, 1, 2] for target 2 and explain why the answer is wrong.",
    ],
    summary: [
      "Binary search needs a sorted list.",
      "Each step compares the middle item and throws away half the range.",
      "A million items need about 20 steps at most.",
      "It returns the index of the target, or -1 when it is missing.",
      "Sorting first is the price you pay for this speed.",
    ],
  },
  {
    slug: "python-dsa-bubblesort",
    title: "Bubble Sort",
    intro: "Bubble sort sorts a list by repeatedly walking through it and swapping neighbours that are in the wrong order. Large values bubble up to the end, one pass at a time.",
    blocks: [
      { type: "heading", text: "Neighbours swap until sorted" },
      { type: "para", text: "Bubble sort is the easiest sort to understand, and the slowest of the simple ones. Walk along the list and compare each pair of neighbours. If the left one is larger than the right one, swap them. After one full pass, the largest value has bubbled to the end. Repeat the walk, now ignoring the last item, because it is already in place. Keep going until a whole pass makes no swaps, or until every position is settled." },
      { type: "para", text: "The function below copies the list first, so the original is not changed, then runs the passes. The outer loop picks how many items are still unsorted, and the inner loop compares neighbours. On the fixed list [64, 34, 25, 12, 22, 11, 90] it produces the sorted list [11, 12, 22, 25, 34, 64, 90], the same answer every sort in this section produces." },
      {
        type: "code",
        title: "Bubble sort on the fixed list",
        code: `def bubble_sort(items):
    arr = items[:]
    n = len(arr)
    for i in range(n):
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr


print(bubble_sort([64, 34, 25, 12, 22, 11, 90]))`,
        output: `[11, 12, 22, 25, 34, 64, 90]`,
      },
      { type: "heading", text: "Watching one pass at a time" },
      { type: "para", text: "Seeing the passes makes the idea concrete. The demo below sorts [5, 3, 8, 1] and prints the list after each pass. After pass 1 the list is [3, 5, 1, 8], with 8 at the end. After pass 2 it is [3, 1, 5, 8]. After pass 3 it is [1, 3, 5, 8] and sorted. The fourth pass changes nothing, because the list is already in order." },
      {
        type: "code",
        title: "Printing the list after each pass",
        code: `arr = [5, 3, 8, 1]
for i in range(len(arr)):
    for j in range(len(arr) - 1 - i):
        if arr[j] > arr[j + 1]:
            arr[j], arr[j + 1] = arr[j + 1], arr[j]
    print("After pass", i + 1, ":", arr)`,
        output: `After pass 1 : [3, 5, 1, 8]
After pass 2 : [3, 1, 5, 8]
After pass 3 : [1, 3, 5, 8]
After pass 4 : [1, 3, 5, 8]`,
      },
      { type: "list", items: ["Each pass pushes the largest unsorted value to its final place.", "The inner loop shrinks by one each pass, because the end is already sorted.", "It is simple to write and easy to get right, which is why it is taught first.", "It is slow on large lists, so use it for learning, not for real sorting."] },
      { type: "tip", text: "You can stop early: if a whole pass makes no swaps, the list is already sorted." },
    ],
    practice: [
      "Sort [9, 4, 6, 2, 8] with bubble sort and print the list after each pass.",
      "Add a flag that stops the sort early when a pass makes no swaps, and test it on an already sorted list.",
      "Count the swaps bubble sort makes on [5, 4, 3, 2, 1].",
    ],
    summary: [
      "Bubble sort swaps neighbours that are in the wrong order.",
      "Each pass moves the largest unsorted value to the end.",
      "It is the simplest sort to understand.",
      "It is slow on large lists, so it is a teaching sort.",
      "Stopping when a pass makes no swaps saves work on sorted lists.",
    ],
  },
  {
    slug: "python-dsa-selectionsort",
    title: "Selection Sort",
    intro: "Selection sort sorts a list by repeatedly finding the smallest remaining value and swapping it into place at the front.",
    blocks: [
      { type: "heading", text: "Pick the smallest, put it first" },
      { type: "para", text: "Selection sort works in rounds. In round one, scan the whole list, find the smallest value, and swap it into position 0. In round two, scan everything after position 0, find the smallest of those, and swap it into position 1. Keep going until every position holds the smallest value left. Unlike bubble sort, which swaps often, selection sort swaps at most once per round." },
      { type: "para", text: "The function below follows that plan exactly. For each position i, it scans from i + 1 onwards to find the index of the smallest value, then swaps it into place. On the fixed list [64, 34, 25, 12, 22, 11, 90] it returns [11, 12, 22, 25, 34, 64, 90], the same sorted result as the other sorts in this section." },
      {
        type: "code",
        title: "Selection sort on the fixed list",
        code: `def selection_sort(items):
    arr = items[:]
    for i in range(len(arr)):
        min_index = i
        for j in range(i + 1, len(arr)):
            if arr[j] < arr[min_index]:
                min_index = j
        arr[i], arr[min_index] = arr[min_index], arr[i]
    return arr


print(selection_sort([64, 34, 25, 12, 22, 11, 90]))`,
        output: `[11, 12, 22, 25, 34, 64, 90]`,
      },
      { type: "heading", text: "Watching one swap at a time" },
      { type: "para", text: "The demo below sorts [5, 3, 8, 1] and prints the list after each round. In round 1 the smallest value, 1, swaps into the front, giving [1, 3, 8, 5]. Round 2 finds that 3 is already the smallest of the rest, so the swap changes nothing. Round 3 swaps 5 and 8 into place, and round 4 has nothing left to do. Counting the swaps shows why selection sort is cheap on writes: it swaps once per round at most." },
      {
        type: "code",
        title: "Printing the list after each round",
        code: `arr = [5, 3, 8, 1]
for i in range(len(arr)):
    min_index = i
    for j in range(i + 1, len(arr)):
        if arr[j] < arr[min_index]:
            min_index = j
    arr[i], arr[min_index] = arr[min_index], arr[i]
    print("After step", i + 1, ":", arr)`,
        output: `After step 1 : [1, 3, 8, 5]
After step 2 : [1, 3, 8, 5]
After step 3 : [1, 3, 5, 8]
After step 4 : [1, 3, 5, 8]`,
      },
      { type: "list", items: ["Each round finds the smallest remaining value and swaps it into place.", "It swaps at most once per round, fewer swaps than bubble sort.", "It still scans the whole unsorted part each round, so it is slow on large lists.", "It is not stable: equal values can change their relative order."] },
      { type: "note", text: "Selection sort is a good choice when swapping is expensive, for example when moving large records, because it keeps swaps to a minimum." },
    ],
    practice: [
      "Sort [7, 2, 9, 4, 1] with selection sort and print the list after each round.",
      "Count the comparisons selection sort makes on a list of 5 items, then on a list of 10.",
      "Sort a list of names alphabetically with selection sort.",
    ],
    summary: [
      "Selection sort picks the smallest remaining value each round.",
      "It swaps that value into the next free position at the front.",
      "It swaps at most once per round.",
      "It is simple, but slow on large lists.",
      "It is not stable, so equal values may change order.",
    ],
  },
  {
    slug: "python-dsa-insertionsort",
    title: "Insertion Sort",
    intro: "Insertion sort builds the sorted list one item at a time, taking each new value and inserting it into its correct place among the values already sorted.",
    blocks: [
      { type: "heading", text: "Like sorting cards in your hand" },
      { type: "para", text: "Insertion sort works the way people sort playing cards. Take the next card, compare it with the cards already in your hand, and slide it into its correct place. The sorted part grows by one card each step, and the unsorted part shrinks by one. It is the fastest of the simple sorts on small or nearly sorted lists, because each new value only moves as far as it needs to." },
      { type: "para", text: "The function below starts at index 1, since a single item is already sorted. It takes the value at that position as the key, then shifts larger values one step to the right until it finds the key's place, and inserts the key there. On the fixed list [64, 34, 25, 12, 22, 11, 90] it returns [11, 12, 22, 25, 34, 64, 90]." },
      {
        type: "code",
        title: "Insertion sort on the fixed list",
        code: `def insertion_sort(items):
    arr = items[:]
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr


print(insertion_sort([64, 34, 25, 12, 22, 11, 90]))`,
        output: `[11, 12, 22, 25, 34, 64, 90]`,
      },
      { type: "heading", text: "Watching the sorted part grow" },
      { type: "para", text: "The demo below sorts [5, 3, 8, 1] and prints the list after each step. After step 1 the first two values are sorted: [3, 5, 8, 1]. After step 2 the 8 is already in place: [3, 5, 8, 1]. After step 3 the 1 slides all the way to the front: [1, 3, 5, 8]. Notice that a nearly sorted list needs very little shifting, which is why insertion sort is a good choice for small lists and for lists that are almost sorted already." },
      {
        type: "code",
        title: "Printing the list after each insertion",
        code: `arr = [5, 3, 8, 1]
for i in range(1, len(arr)):
    key = arr[i]
    j = i - 1
    while j >= 0 and arr[j] > key:
        arr[j + 1] = arr[j]
        j -= 1
    arr[j + 1] = key
    print("After step", i, ":", arr)`,
        output: `After step 1 : [3, 5, 8, 1]
After step 2 : [3, 5, 8, 1]
After step 3 : [1, 3, 5, 8]`,
      },
      { type: "list", items: ["The sorted part grows by one item per step.", "Each new value shifts larger values right until its place is found.", "It is fast on small lists and on lists that are nearly sorted.", "It is stable: equal values keep their original order.", "It sorts in place and needs no extra list."] },
      { type: "tip", text: "If a list is already sorted, insertion sort does almost no work: each key is already in place." },
    ],
    practice: [
      "Sort [8, 3, 5, 2, 9] with insertion sort and print the list after each step.",
      "Time insertion sort on an already sorted list of 100 numbers and on the same list reversed.",
      "Sort a list of words alphabetically with insertion sort.",
    ],
    summary: [
      "Insertion sort inserts each new value into the sorted part.",
      "It works like sorting cards in your hand.",
      "It is the fastest simple sort for small or nearly sorted lists.",
      "It is stable and sorts in place.",
      "On a large random list it is still slow, so use a faster sort there.",
    ],
  },
  {
    slug: "python-dsa-quicksort",
    title: "Quick Sort",
    intro: "Quick sort picks a pivot value, splits the list into smaller and larger values, and sorts each side the same way. It is one of the fastest general-purpose sorts.",
    blocks: [
      { type: "heading", text: "Divide and conquer" },
      { type: "para", text: "Quick sort is a divide-and-conquer algorithm. Pick one value as the pivot. Put every value smaller than the pivot on the left, and every value larger on the right. The pivot is now in its final place. Then sort the left side and the right side the same way, and keep splitting until each side has one item or none, which is already sorted. The split is the clever part: each split roughly halves the work." },
      { type: "para", text: "The version below picks the middle item as the pivot and builds three new lists with list comprehensions: left, middle, and right. It sorts left and right by calling itself, then joins the three parts. On the fixed list [64, 34, 25, 12, 22, 11, 90] it returns [11, 12, 22, 25, 34, 64, 90]. This version is short and clear, and it uses extra memory for the new lists; the classic in-place version is faster but harder to read." },
      {
        type: "code",
        title: "Quick sort with a middle pivot",
        code: `def quick_sort(items):
    if len(items) <= 1:
        return items
    pivot = items[len(items) // 2]
    left = [x for x in items if x < pivot]
    middle = [x for x in items if x == pivot]
    right = [x for x in items if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)


print(quick_sort([64, 34, 25, 12, 22, 11, 90]))`,
        output: `[11, 12, 22, 25, 34, 64, 90]`,
      },
      { type: "heading", text: "Seeing the first split" },
      { type: "para", text: "The demo below shows the first split of the fixed list. The pivot is the middle item, 12. Only 11 is smaller than 12, and 64, 34, 25, 22, and 90 are larger. Quick sort then sorts the larger side the same way, picking a new pivot there, until every side is tiny. A good pivot splits the list into two roughly equal halves; a bad pivot, like the smallest value, splits it into one empty side and one nearly full side, and the sort slows down." },
      {
        type: "code",
        title: "The first pivot split",
        code: `nums = [64, 34, 25, 12, 22, 11, 90]
pivot = nums[len(nums) // 2]
print("Pivot:", pivot)
print("Smaller:", [x for x in nums if x < pivot])
print("Larger:", [x for x in nums if x > pivot])`,
        output: `Pivot: 12
Smaller: [11]
Larger: [64, 34, 25, 22, 90]`,
      },
      { type: "list", items: ["Pick a pivot, split into smaller and larger, and sort each side.", "The pivot lands in its final place after one split.", "A middle pivot is a simple, decent choice.", "It is fast on average, but slow if the pivot is always the smallest or largest value.", "Python's built-in sort uses a different method, Timsort, which is even faster in practice."] },
      { type: "note", text: "Quick sort is not stable in its usual form: equal values can change order. If stability matters, use merge sort or Python's sorted instead." },
    ],
    practice: [
      "Sort [33, 12, 45, 2, 19, 27] with quick_sort and print the result.",
      "Change the pivot to the first item and sort the already sorted list [1, 2, 3, 4, 5, 6, 7, 8], then think about why it is slower.",
      "Write a version that counts how many times quick_sort is called while sorting [5, 3, 8, 1, 9].",
    ],
    summary: [
      "Quick sort picks a pivot and splits the list into smaller and larger parts.",
      "It sorts each part the same way, by recursion.",
      "The pivot ends up in its final place after one split.",
      "It is fast on average, but a bad pivot slows it down.",
      "It is the fastest sort most programmers write by hand.",
    ],
  },
  {
    slug: "python-dsa-countingsort",
    title: "Counting Sort",
    intro: "Counting sort sorts by counting how many times each value appears, then writing the values out in order. It is very fast, but only works when the values are small integers.",
    blocks: [
      { type: "heading", text: "Count, then write out" },
      { type: "para", text: "Counting sort does not compare values with each other at all. It counts how many times each value appears, then writes the values back out in order, repeating each one as many times as it was counted. That makes it extremely fast when the values are small integers, such as exam marks from 0 to 100. It is the wrong tool when the values are huge, because the counting list would have to cover every value up to the largest one." },
      { type: "para", text: "The function below first finds the largest value, then makes a counting list with one slot per value from 0 up to that largest value. It walks the input once to fill the counts, then walks the counts to build the sorted result. On [4, 2, 2, 8, 3, 3, 1] it returns [1, 2, 2, 3, 3, 4, 8]." },
      {
        type: "code",
        title: "Counting sort on a small list",
        code: `def counting_sort(items):
    top = max(items)
    counts = [0] * (top + 1)
    for value in items:
        counts[value] += 1
    result = []
    for value, count in enumerate(counts):
        result.extend([value] * count)
    return result


print(counting_sort([4, 2, 2, 8, 3, 3, 1]))`,
        output: `[1, 2, 2, 3, 3, 4, 8]`,
      },
      { type: "heading", text: "Seeing the counts" },
      { type: "para", text: "The counts list is the heart of the method. For [4, 2, 2, 8, 3, 3, 1] the counts are [0, 1, 2, 2, 1, 0, 0, 0, 1]: zero appears 0 times, one appears once, two appears twice, three appears twice, four appears once, and eight appears once. Reading that list from left to right gives the sorted order directly. The same function also sorts the fixed list from the other sorting tutorials, [64, 34, 25, 12, 22, 11, 90], but note that it builds a counting list of 91 slots to do it." },
      {
        type: "code",
        title: "The counts list, and the fixed list sorted",
        code: `nums = [4, 2, 2, 8, 3, 3, 1]
counts = [0] * (max(nums) + 1)
for value in nums:
    counts[value] += 1
print(counts)
print(counting_sort([64, 34, 25, 12, 22, 11, 90]))`,
        output: `[0, 1, 2, 2, 1, 0, 0, 0, 1]
[11, 12, 22, 25, 34, 64, 90]`,
      },
      { type: "list", items: ["It counts occurrences instead of comparing values.", "It is fast when the values are small integers in a narrow range.", "It needs a counting list as large as the biggest value, so huge values waste memory.", "It is stable when written with a cumulative count, and handles duplicates naturally."] },
      { type: "note", text: "Counting sort needs non-negative integers. To sort negative numbers, shift every value up by the smallest value first, sort, then shift back." },
    ],
    practice: [
      "Sort [3, 1, 4, 1, 5, 9, 2, 6, 5] with counting sort and print the counts list too.",
      "Sort a list of exam marks from 0 to 100 with counting sort.",
      "Try counting sort on [1000000, 3, 2] and explain why it is a bad fit, even though the answer is correct.",
    ],
    summary: [
      "Counting sort counts how often each value appears.",
      "It writes the values out in order, repeating each one by its count.",
      "It is very fast for small integers in a narrow range.",
      "It needs a counting list as large as the biggest value.",
      "It does not compare values, so it only works on integers.",
    ],
  },
  {
    slug: "python-dsa-radixsort",
    title: "Radix Sort",
    intro: "Radix sort sorts numbers one digit at a time, from the last digit to the first, using a stable counting sort for each digit place.",
    blocks: [
      { type: "heading", text: "Sort by digits, not by values" },
      { type: "para", text: "Radix sort never compares two whole numbers. It sorts by the ones digit, then by the tens digit, then by the hundreds digit, and so on, until every digit has been handled. The trick is that each digit pass must be stable: numbers with the same digit keep the order they had before the pass. That is why each pass uses counting sort, which is stable. After the last pass, the whole list is sorted." },
      { type: "para", text: "The code below has a helper that counting-sorts a list by one digit place, and a main function that calls it for place 1, then 10, then 100, until the largest value has no more digits. It prints the list after each pass, so you can watch the order settle: after the ones pass, [170, 45, 75, 90, 802, 24, 2, 66] becomes [170, 90, 802, 2, 24, 45, 75, 66], and after the hundreds pass it is fully sorted." },
      {
        type: "code",
        title: "Radix sort, printing after each digit pass",
        code: `def counting_by_digit(items, place):
    counts = [0] * 10
    output = [0] * len(items)
    for value in items:
        digit = (value // place) % 10
        counts[digit] += 1
    for i in range(1, 10):
        counts[i] += counts[i - 1]
    for value in reversed(items):
        digit = (value // place) % 10
        counts[digit] -= 1
        output[counts[digit]] = value
    return output


def radix_sort(items):
    arr = items[:]
    place = 1
    while max(arr) // place > 0:
        arr = counting_by_digit(arr, place)
        print("After place", place, ":", arr)
        place *= 10
    return arr


print(radix_sort([170, 45, 75, 90, 802, 24, 2, 66]))`,
        output: `After place 1 : [170, 90, 802, 2, 24, 45, 75, 66]
After place 10 : [802, 2, 24, 45, 66, 170, 75, 90]
After place 100 : [2, 24, 45, 66, 75, 90, 170, 802]
[2, 24, 45, 66, 75, 90, 170, 802]`,
      },
      { type: "heading", text: "The same fixed list" },
      { type: "para", text: "Radix sort also handles the fixed list used by the other sorts in this section. The list [64, 34, 25, 12, 22, 11, 90] has only two digits, so it needs two passes: ones, then tens. After the ones pass the list is [90, 11, 12, 22, 64, 34, 25], and after the tens pass it is [11, 12, 22, 25, 34, 64, 90], the same sorted result as every other sort." },
      {
        type: "code",
        title: "Radix sort on the fixed list",
        code: `print(radix_sort([64, 34, 25, 12, 22, 11, 90]))`,
        output: `After place 1 : [90, 11, 12, 22, 64, 34, 25]
After place 10 : [11, 12, 22, 25, 34, 64, 90]
[11, 12, 22, 25, 34, 64, 90]`,
      },
      { type: "list", items: ["It sorts one digit at a time, from the last digit to the first.", "Each digit pass must be stable, or later passes will undo earlier work.", "It is fast for integers with few digits, such as years or roll numbers.", "It needs extra memory for the counting and output lists."] },
      { type: "note", text: "This second example reuses radix_sort and counting_by_digit from the code block above. Run both blocks together in the editor." },
    ],
    practice: [
      "Sort [329, 457, 657, 839, 436, 720, 355] with radix sort and print the list after each pass.",
      "Sort a list of four-digit years with radix sort.",
      "Explain in one sentence why radix sort must start from the last digit, not the first.",
    ],
    summary: [
      "Radix sort sorts one digit at a time, last digit first.",
      "Each digit pass uses a stable counting sort.",
      "Stability matters: it keeps earlier passes intact.",
      "It is fast for integers with few digits.",
      "It works on integers, not on general values.",
    ],
  },
  {
    slug: "python-dsa-mergesort",
    title: "Merge Sort",
    intro: "Merge sort splits a list in half again and again until each piece has one item, then merges the pieces back together in sorted order. It is fast and stable.",
    blocks: [
      { type: "heading", text: "Split, then merge" },
      { type: "para", text: "Merge sort is another divide-and-conquer algorithm. Split the list in half. Split each half in half again, and keep going until every piece has one item, which is already sorted. Then merge the pieces back together: take the smaller front item from either piece, append it to the result, and repeat until both pieces are used up. Merging two sorted lists is easy, because you only ever need to compare their first items." },
      { type: "para", text: "The function below splits with a middle index, sorts each half by calling itself, and merges the two sorted halves by walking through them with two pointers. When one half runs out, the rest of the other half is appended as it is. On the fixed list [64, 34, 25, 12, 22, 11, 90] it returns [11, 12, 22, 25, 34, 64, 90], the same result as the other sorts." },
      {
        type: "code",
        title: "Merge sort on the fixed list",
        code: `def merge_sort(items):
    if len(items) <= 1:
        return items
    mid = len(items) // 2
    left = merge_sort(items[:mid])
    right = merge_sort(items[mid:])
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result


print(merge_sort([64, 34, 25, 12, 22, 11, 90]))`,
        output: `[11, 12, 22, 25, 34, 64, 90]`,
      },
      { type: "heading", text: "Merging two sorted lists" },
      { type: "para", text: "The merge step is worth seeing on its own. Take two sorted lists, [11, 25, 64] and [12, 22, 34, 90]. Compare the fronts: 11 is smaller than 12, so take 11. Now compare 25 with 12, take 12, then compare 25 with 22, take 22, and so on. The merge function below does exactly that, and the result is the same fully sorted list. Merge sort is stable because it takes from the left list first when the two front values are equal." },
      {
        type: "code",
        title: "Merging two sorted lists",
        code: `def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result


print(merge([11, 25, 64], [12, 22, 34, 90]))`,
        output: `[11, 12, 22, 25, 34, 64, 90]`,
      },
      { type: "list", items: ["Split the list in half until each piece has one item.", "Merge sorted pieces by comparing only their front items.", "It is stable: equal values keep their original order.", "It always takes about the same time, even on sorted or reversed lists.", "It needs extra memory for the merged results."] },
      { type: "tip", text: "Merge sort is the safe default when you need a guaranteed fast, stable sort and can afford the extra memory." },
    ],
    practice: [
      "Sort [38, 27, 43, 3, 9, 82, 10] with merge sort.",
      "Write the merge function on its own and use it to merge [1, 4, 7] and [2, 3, 8].",
      "Add a print to merge_sort that shows each split, and run it on [5, 3, 8, 1].",
    ],
    summary: [
      "Merge sort splits a list in half until each piece has one item.",
      "It merges sorted pieces by comparing their front items.",
      "It is fast and stable.",
      "Its time is predictable, unlike quick sort.",
      "It needs extra memory for the merged lists.",
    ],
  },
];
