// Python learning roadmap — the 29 topics from Maalik's LP-RM repo
// (Adeen469/LP-RM), in the same order and categories. The 3D street
// UI from that repo was NOT ported: this app uses its muted timeline
// rail instead (no 3D canvas, no quiz/planner/stats extras). Each
// topic links to its /learn tutorial page; the one topic with no
// tutorial yet (Machine Learning) links to Video Courses instead.

export type RoadmapDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface RoadmapTopic {
  id: string;
  title: string;
  /** /learn slug; null when no tutorial page exists yet. */
  learnSlug: string | null;
  difficulty: RoadmapDifficulty;
  estimatedMinutes: number;
  blurb: string;
}

export interface RoadmapStage {
  id: string;
  title: string;
  topics: RoadmapTopic[];
}

export const ROADMAP_SEEN_KEY = "lp_roadmap_seen";

export const ROADMAP_STAGES: RoadmapStage[] = [
  {
    id: "basics",
    title: "Basics",
    topics: [
      { id: "home", title: "Python HOME", learnSlug: "python-home", difficulty: "Beginner", estimatedMinutes: 5, blurb: "Python is a widely used high-level programming language for general-purpose programming." },
      { id: "intro", title: "Python Intro", learnSlug: "python-intro", difficulty: "Beginner", estimatedMinutes: 5, blurb: "A popular programming language created by Guido van Rossum, released in 1991." },
      { id: "getstarted", title: "Python Get Started", learnSlug: "python-getstarted", difficulty: "Beginner", estimatedMinutes: 10, blurb: "Run Python on Windows, Mac, Linux, and in the browser." },
      { id: "syntax", title: "Python Syntax", learnSlug: "python-syntax", difficulty: "Beginner", estimatedMinutes: 10, blurb: "Clean, readable syntax that uses indentation instead of curly braces." },
      { id: "output", title: "Python Output", learnSlug: "python-output", difficulty: "Beginner", estimatedMinutes: 5, blurb: "The print() function outputs text or variables to the screen." },
      { id: "comments", title: "Python Comments", learnSlug: "python-comments", difficulty: "Beginner", estimatedMinutes: 5, blurb: "Comments start with a # and Python ignores them." },
      { id: "variables", title: "Python Variables", learnSlug: "python-variables", difficulty: "Beginner", estimatedMinutes: 15, blurb: "Variables are containers for storing data values, created upon assignment." },
    ],
  },
  {
    id: "structures",
    title: "Data Structures",
    topics: [
      { id: "datatypes", title: "Python Data Types", learnSlug: "python-datatypes", difficulty: "Beginner", estimatedMinutes: 15, blurb: "Built-in types: str, int, float, complex, list, tuple, range, dict, set, bool." },
      { id: "numbers", title: "Python Numbers", learnSlug: "python-numbers", difficulty: "Beginner", estimatedMinutes: 10, blurb: "Numeric types in Python: int, float, complex." },
      { id: "strings", title: "Python Strings", learnSlug: "python-strings", difficulty: "Beginner", estimatedMinutes: 20, blurb: "Strings are surrounded by quotes. Supports slicing and formatting." },
      { id: "booleans", title: "Python Booleans", learnSlug: "python-booleans", difficulty: "Beginner", estimatedMinutes: 10, blurb: "Booleans represent True or False values." },
      { id: "operators", title: "Python Operators", learnSlug: "python-operators", difficulty: "Beginner", estimatedMinutes: 15, blurb: "Arithmetic, assignment, comparison, logical, identity, and membership operators." },
      { id: "lists", title: "Python Lists", learnSlug: "python-lists", difficulty: "Intermediate", estimatedMinutes: 25, blurb: "Lists store multiple items in a single variable. Ordered, mutable, allow duplicates." },
      { id: "tuples", title: "Python Tuples", learnSlug: "python-tuples", difficulty: "Intermediate", estimatedMinutes: 15, blurb: "Tuples store multiple items. Ordered and immutable." },
      { id: "sets", title: "Python Sets", learnSlug: "python-sets", difficulty: "Intermediate", estimatedMinutes: 15, blurb: "Sets store multiple items. Unordered, unindexed, no duplicates." },
      { id: "dictionaries", title: "Python Dictionaries", learnSlug: "python-dictionaries", difficulty: "Intermediate", estimatedMinutes: 25, blurb: "Dictionaries store key:value pairs. Ordered, changeable, no duplicates." },
    ],
  },
  {
    id: "control",
    title: "Control Flow",
    topics: [
      { id: "conditions", title: "Python If...Else", learnSlug: "python-conditions", difficulty: "Beginner", estimatedMinutes: 15, blurb: "Conditional statements: if, elif, else." },
      { id: "match", title: "Python Match", learnSlug: "python-match", difficulty: "Intermediate", estimatedMinutes: 15, blurb: "Structural pattern matching with match and case (Python 3.10+)." },
      { id: "while-loops", title: "Python While Loops", learnSlug: "python-while-loops", difficulty: "Intermediate", estimatedMinutes: 15, blurb: "Executes a block of code as long as a condition is true." },
      { id: "for-loops", title: "Python For Loops", learnSlug: "python-for-loops", difficulty: "Intermediate", estimatedMinutes: 20, blurb: "Iterates over sequences such as lists, tuples, dictionaries, sets, or strings." },
      { id: "functions", title: "Python Functions", learnSlug: "python-functions", difficulty: "Intermediate", estimatedMinutes: 25, blurb: "Blocks of reusable code that run when called." },
    ],
  },
  {
    id: "oop",
    title: "Object-Oriented",
    topics: [
      { id: "classes", title: "Python Classes/Objects", learnSlug: "python-classes", difficulty: "Advanced", estimatedMinutes: 30, blurb: "Python is an object-oriented language with classes, objects, and methods." },
    ],
  },
  {
    id: "libraries",
    title: "Libraries",
    topics: [
      { id: "file-handling", title: "Python File Handling", learnSlug: "python-file-handling", difficulty: "Advanced", estimatedMinutes: 25, blurb: "Functions for creating, reading, updating, and deleting files." },
      { id: "numpy", title: "NumPy Tutorial", learnSlug: "numpy-tutorial", difficulty: "Advanced", estimatedMinutes: 35, blurb: "Library for working with multidimensional arrays and matrices." },
      { id: "pandas", title: "Pandas Tutorial", learnSlug: "pandas-tutorial", difficulty: "Advanced", estimatedMinutes: 40, blurb: "Library for data analysis, cleaning, and DataFrame manipulations." },
      { id: "matplotlib", title: "Matplotlib Tutorial", learnSlug: "matplotlib-intro", difficulty: "Advanced", estimatedMinutes: 30, blurb: "Library for creating static, animated, and interactive visualizations." },
    ],
  },
  {
    id: "advanced",
    title: "Advanced",
    topics: [
      // No /learn tutorial for this one yet — it lives in Video
      // Courses until a tutorial page exists.
      { id: "machine-learning", title: "Machine Learning", learnSlug: null, difficulty: "Advanced", estimatedMinutes: 45, blurb: "Predictive modeling and machine learning with Scikit-Learn." },
      { id: "dsa", title: "Python DSA", learnSlug: "python-dsa", difficulty: "Advanced", estimatedMinutes: 50, blurb: "Data Structures & Algorithms: stacks, queues, trees, graphs, sorting." },
      { id: "mysql", title: "Python MySQL", learnSlug: "python-mysql-getstarted", difficulty: "Advanced", estimatedMinutes: 30, blurb: "Connect Python to MySQL databases to run queries and manage tables." },
    ],
  },
];

export function roadmapTopicHref(topic: RoadmapTopic): string {
  return topic.learnSlug ? `/learn/${topic.learnSlug}` : "/courses";
}
