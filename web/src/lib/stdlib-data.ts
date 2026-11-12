export interface StdlibModule {
  name: string;
  category: string;
  summary: string;
  docUrl: string;
}

// Complete official Python 3 Standard Library Module Catalog
export const PYTHON_STDLIB_MODULES: StdlibModule[] = [
  // Text Processing
  { name: "string", category: "Text Processing", summary: "Common string operations and constants", docUrl: "https://docs.python.org/3/library/string.html" },
  { name: "re", category: "Text Processing", summary: "Regular expression operations", docUrl: "https://docs.python.org/3/library/re.html" },
  { name: "difflib", category: "Text Processing", summary: "Helpers for computing deltas between sequences", docUrl: "https://docs.python.org/3/library/difflib.html" },
  { name: "textwrap", category: "Text Processing", summary: "Text wrapping and filling", docUrl: "https://docs.python.org/3/library/textwrap.html" },
  { name: "unicodedata", category: "Text Processing", summary: "Unicode Character Database", docUrl: "https://docs.python.org/3/library/unicodedata.html" },

  // Binary Data
  { name: "struct", category: "Binary Data", summary: "Interpret bytes as packed binary data", docUrl: "https://docs.python.org/3/library/struct.html" },
  { name: "codecs", category: "Binary Data", summary: "Codec registry and base classes", docUrl: "https://docs.python.org/3/library/codecs.html" },

  // Data Types
  { name: "datetime", category: "Data Types", summary: "Basic date and time types", docUrl: "https://docs.python.org/3/library/datetime.html" },
  { name: "zoneinfo", category: "Data Types", summary: "IANA time zone support", docUrl: "https://docs.python.org/3/library/zoneinfo.html" },
  { name: "calendar", category: "Data Types", summary: "General calendar-related functions", docUrl: "https://docs.python.org/3/library/calendar.html" },
  { name: "collections", category: "Data Types", summary: "Container datatypes (namedtuple, deque, Counter, OrderedDict, defaultdict)", docUrl: "https://docs.python.org/3/library/collections.html" },
  { name: "heapq", category: "Data Types", summary: "Heap queue algorithm (priority queue)", docUrl: "https://docs.python.org/3/library/heapq.html" },
  { name: "bisect", category: "Data Types", summary: "Array bisection algorithm", docUrl: "https://docs.python.org/3/library/bisect.html" },
  { name: "array", category: "Data Types", summary: "Space-efficient arrays of basic values", docUrl: "https://docs.python.org/3/library/array.html" },
  { name: "copy", category: "Data Types", summary: "Shallow and deep copy operations", docUrl: "https://docs.python.org/3/library/copy.html" },
  { name: "pprint", category: "Data Types", summary: "Data pretty printer", docUrl: "https://docs.python.org/3/library/pprint.html" },
  { name: "enum", category: "Data Types", summary: "Support for enumerations", docUrl: "https://docs.python.org/3/library/enum.html" },
  { name: "dataclasses", category: "Data Types", summary: "Data classes decorator & boilerplate generator", docUrl: "https://docs.python.org/3/library/dataclasses.html" },

  // Numeric and Mathematical
  { name: "math", category: "Numeric & Math", summary: "Mathematical functions (trig, log, sqrt, ceil, floor)", docUrl: "https://docs.python.org/3/library/math.html" },
  { name: "cmath", category: "Numeric & Math", summary: "Mathematical functions for complex numbers", docUrl: "https://docs.python.org/3/library/cmath.html" },
  { name: "decimal", category: "Numeric & Math", summary: "Decimal fixed point and floating point arithmetic", docUrl: "https://docs.python.org/3/library/decimal.html" },
  { name: "fractions", category: "Numeric & Math", summary: "Rational numbers", docUrl: "https://docs.python.org/3/library/fractions.html" },
  { name: "random", category: "Numeric & Math", summary: "Generate pseudo-random numbers, shuffle, choices", docUrl: "https://docs.python.org/3/library/random.html" },
  { name: "statistics", category: "Numeric & Math", summary: "Mathematical statistics functions (mean, median, variance)", docUrl: "https://docs.python.org/3/library/statistics.html" },

  // Functional Programming
  { name: "itertools", category: "Functional", summary: "Functions creating iterators for efficient looping (combinations, permutations, cycle)", docUrl: "https://docs.python.org/3/library/itertools.html" },
  { name: "functools", category: "Functional", summary: "Higher-order functions and operations on callable objects (lru_cache, partial, reduce)", docUrl: "https://docs.python.org/3/library/functools.html" },
  { name: "operator", category: "Functional", summary: "Standard operators as functions", docUrl: "https://docs.python.org/3/library/operator.html" },

  // File and Directory Access
  { name: "pathlib", category: "File & Directory", summary: "Object-oriented filesystem paths", docUrl: "https://docs.python.org/3/library/pathlib.html" },
  { name: "os.path", category: "File & Directory", summary: "Common pathname manipulations", docUrl: "https://docs.python.org/3/library/os.path.html" },
  { name: "fileinput", category: "File & Directory", summary: "Iterate over lines from multiple input streams", docUrl: "https://docs.python.org/3/library/fileinput.html" },
  { name: "stat", category: "File & Directory", summary: "Interpreting stat() results", docUrl: "https://docs.python.org/3/library/stat.html" },
  { name: "fnmatch", category: "File & Directory", summary: "Unix filename pattern matching", docUrl: "https://docs.python.org/3/library/fnmatch.html" },
  { name: "glob", category: "File & Directory", summary: "Unix style pathname pattern expansion", docUrl: "https://docs.python.org/3/library/glob.html" },
  { name: "shutil", category: "File & Directory", summary: "High-level file operations (copy, move, rmtree)", docUrl: "https://docs.python.org/3/library/shutil.html" },

  // Data Persistence
  { name: "pickle", category: "Persistence", summary: "Python object serialization", docUrl: "https://docs.python.org/3/library/pickle.html" },
  { name: "copyreg", category: "Persistence", summary: "Register pickle support functions", docUrl: "https://docs.python.org/3/library/copyreg.html" },
  { name: "shelve", category: "Persistence", summary: "Python object persistence", docUrl: "https://docs.python.org/3/library/shelve.html" },
  { name: "sqlite3", category: "Persistence", summary: "DB-API 2.0 interface for SQLite databases", docUrl: "https://docs.python.org/3/library/sqlite3.html" },

  // Data Compression and Archiving
  { name: "zlib", category: "Compression", summary: "Compression compatible with gzip", docUrl: "https://docs.python.org/3/library/zlib.html" },
  { name: "gzip", category: "Compression", summary: "Support for gzip files", docUrl: "https://docs.python.org/3/library/gzip.html" },
  { name: "bz2", category: "Compression", summary: "Support for bzip2 compression", docUrl: "https://docs.python.org/3/library/bz2.html" },
  { name: "lzma", category: "Compression", summary: "Compression using the LZMA algorithm", docUrl: "https://docs.python.org/3/library/lzma.html" },
  { name: "zipfile", category: "Compression", summary: "Work with ZIP archives", docUrl: "https://docs.python.org/3/library/zipfile.html" },
  { name: "tarfile", category: "Compression", summary: "Read and write tar archive files", docUrl: "https://docs.python.org/3/library/tarfile.html" },

  // File Formats
  { name: "csv", category: "File Formats", summary: "CSV File Reading and Writing", docUrl: "https://docs.python.org/3/library/csv.html" },
  { name: "configparser", category: "File Formats", summary: "Configuration file parser (INI format)", docUrl: "https://docs.python.org/3/library/configparser.html" },
  { name: "tomllib", category: "File Formats", summary: "Parse TOML files", docUrl: "https://docs.python.org/3/library/tomllib.html" },
  { name: "json", category: "File Formats", summary: "JSON encoder and decoder", docUrl: "https://docs.python.org/3/library/json.html" },

  // Cryptographic Services
  { name: "hashlib", category: "Crypto", summary: "Secure hashes and message digests (sha256, md5)", docUrl: "https://docs.python.org/3/library/hashlib.html" },
  { name: "hmac", category: "Crypto", summary: "Keyed-Hashing for Message Authentication", docUrl: "https://docs.python.org/3/library/hmac.html" },
  { name: "secrets", category: "Crypto", summary: "Generate secure random numbers for secrets", docUrl: "https://docs.python.org/3/library/secrets.html" },

  // Generic Operating System Services
  { name: "os", category: "OS Services", summary: "Miscellaneous operating system interfaces", docUrl: "https://docs.python.org/3/library/os.html" },
  { name: "io", category: "OS Services", summary: "Core tools for working with streams", docUrl: "https://docs.python.org/3/library/io.html" },
  { name: "time", category: "OS Services", summary: "Time access and conversions", docUrl: "https://docs.python.org/3/library/time.html" },
  { name: "argparse", category: "OS Services", summary: "Parser for command-line options, arguments and sub-commands", docUrl: "https://docs.python.org/3/library/argparse.html" },
  { name: "logging", category: "OS Services", summary: "Logging facility for Python", docUrl: "https://docs.python.org/3/library/logging.html" },
  { name: "platform", category: "OS Services", summary: "Access to underlying platform’s identifying data", docUrl: "https://docs.python.org/3/library/platform.html" },

  // Networking and Internet Data
  { name: "urllib.request", category: "Internet", summary: "Extensible library for opening URLs", docUrl: "https://docs.python.org/3/library/urllib.request.html" },
  { name: "urllib.parse", category: "Internet", summary: "Parse URLs into components", docUrl: "https://docs.python.org/3/library/urllib.parse.html" },
  { name: "http.client", category: "Internet", summary: "HTTP protocol client", docUrl: "https://docs.python.org/3/library/http.client.html" },
  { name: "html", category: "Internet", summary: "HyperText Markup Language support & escaping", docUrl: "https://docs.python.org/3/library/html.html" },
  { name: "xml.etree.ElementTree", category: "Internet", summary: "The ElementTree XML API", docUrl: "https://docs.python.org/3/library/xml.etree.elementtree.html" },
  { name: "base64", category: "Internet", summary: "Base16, Base32, Base64, Base85 Data Encodings", docUrl: "https://docs.python.org/3/library/base64.html" },

  // Development and Debugging
  { name: "unittest", category: "Testing & Debug", summary: "Unit testing framework", docUrl: "https://docs.python.org/3/library/unittest.html" },
  { name: "doctest", category: "Testing & Debug", summary: "Test interactive Python examples in docstrings", docUrl: "https://docs.python.org/3/library/doctest.html" },
  { name: "pdb", category: "Testing & Debug", summary: "The Python Debugger", docUrl: "https://docs.python.org/3/library/pdb.html" },
  { name: "timeit", category: "Testing & Debug", summary: "Measure execution time of small code snippets", docUrl: "https://docs.python.org/3/library/timeit.html" },
  { name: "traceback", category: "Testing & Debug", summary: "Print or retrieve a stack traceback", docUrl: "https://docs.python.org/3/library/traceback.html" },
  { name: "dis", category: "Testing & Debug", summary: "Disassembler for Python bytecode", docUrl: "https://docs.python.org/3/library/dis.html" },

  // Python Runtime Services
  { name: "sys", category: "Runtime", summary: "System-specific parameters and functions", docUrl: "https://docs.python.org/3/library/sys.html" },
  { name: "builtins", category: "Runtime", summary: "Built-in objects and functions (len, range, print)", docUrl: "https://docs.python.org/3/library/builtins.html" },
  { name: "typing", category: "Runtime", summary: "Support for type hints", docUrl: "https://docs.python.org/3/library/typing.html" },
  { name: "inspect", category: "Runtime", summary: "Inspect live objects and frames", docUrl: "https://docs.python.org/3/library/inspect.html" },
  { name: "gc", category: "Runtime", summary: "Garbage Collector interface", docUrl: "https://docs.python.org/3/library/gc.html" },
];

