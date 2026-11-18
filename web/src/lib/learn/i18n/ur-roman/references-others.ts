import type { ReferenceTranslations } from "../types";
export const TRANSLATIONS: ReferenceTranslations = {
  "python-ref-functions": {
    title: "Python ke Built-in Functions",
    description: "Python ke built-in functions — hamesha available hote hain, import ki zaroorat nahi.",
  },
  "ref-func-abs": {
    title: "abs()",
    description: "Argument ki absolute value return karein.",
  },
  "ref-func-all": {
    title: "all()",
    description: "True return karein agar iterable ki har value x ke liye bool(x) True ho.",
  },
  "ref-func-any": {
    title: "any()",
    description: "True return karein agar iterable ki kisi bhi x ke liye bool(x) True ho.",
  },
  "ref-func-ascii": {
    title: "ascii()",
    description: "Kisi object ki ASCII-only representation return karein.",
  },
  "ref-func-bin": {
    title: "bin()",
    description: "Kisi integer ki binary representation return karein.",
  },
  "ref-func-bool": {
    title: "bool()",
    description: "bool(x) -> bool Argument x true ho to True return karein, warna False.",
  },
  "ref-func-bytearray": {
    title: "bytearray()",
    description: "bytearray(iterable_of_ints) -> bytearray bytearray(string, encoding[, errors]) -> bytearray bytearray(bytes_or_buffer) -> bytes_or_buffer ki mutable copy bytearray(int) -> diye gaye parameter ke size ki bytes array, initi",
  },
  "ref-func-bytes": {
    title: "bytes()",
    description: "bytes(iterable_of_ints) -> bytes bytes(string, encoding[, errors]) -> bytes bytes(bytes_or_buffer) -> bytes_or_buffer ki immutable copy bytes(int) -> diye gaye parameter ke size ka bytes object, null byte se initialized",
  },
  "ref-func-callable": {
    title: "callable()",
    description: "Batayein ke object callable hai ya nahi (yaani, kisi qisam ka function).",
  },
  "ref-func-chr": {
    title: "chr()",
    description: "Ordinal i wala ek character ki Unicode string return karein; 0 <= i <= 0x10ffff.",
  },
  "ref-func-compile": {
    title: "compile()",
    description: "Source ko code object mein compile karein jise exec() ya eval() se execute kiya ja sake.",
  },
  "ref-func-complex": {
    title: "complex()",
    description: "Real part aur optional imaginary part se complex number banayein.",
  },
  "ref-func-delattr": {
    title: "delattr()",
    description: "Diye gaye object se named attribute delete karein.",
  },
  "ref-func-dict": {
    title: "dict()",
    description: "dict() -> nayi khaali dictionary dict(mapping) -> mapping object ke (key, value) pairs se initialized nayi dictionary dict(iterable) -> nayi dictionary, jaise is tarah initialize ki gayi ho: d = {} for k, v in iterable: d[k] = v dict(**k",
  },
  "ref-func-dir": {
    title: "dir()",
    description: "Kisi object ke attributes dikhayein.",
  },
  "ref-func-divmod": {
    title: "divmod()",
    description: "Tuple (x//y, x%y) return karein.",
  },
  "ref-func-enumerate": {
    title: "enumerate()",
    description: "Enumerate object return karein.",
  },
  "ref-func-eval": {
    title: "eval()",
    description: "Diye gaye source ko globals aur locals ke context mein evaluate karein.",
  },
  "ref-func-exec": {
    title: "exec()",
    description: "Diye gaye source ko globals aur locals ke context mein execute karein.",
  },
  "ref-func-filter": {
    title: "filter()",
    description: "filter(function or None, iterable) --> filter object Un items ka iterator return karein jin ke liye function(item) true ho.",
  },
  "ref-func-float": {
    title: "float()",
    description: "Kisi string ya number ko floating point number mein convert karein, agar mumkin ho.",
  },
  "ref-func-format": {
    title: "format()",
    description: "type(value).__format__(value, format_spec) return karein. Bohat se built-in types Format Specification Mini-language ke mutabiq format_spec implement karte hain.",
  },
  "ref-func-frozenset": {
    title: "frozenset()",
    description: "frozenset() -> khaali frozenset object frozenset(iterable) -> frozenset object Unique elements ka immutable unordered collection banayein.",
  },
  "ref-func-getattr": {
    title: "getattr()",
    description: "Kisi object se named attribute hasil karein.",
  },
  "ref-func-globals": {
    title: "globals()",
    description: "Current scope ke global variables wali dictionary return karein.",
  },
  "ref-func-hasattr": {
    title: "hasattr()",
    description: "Batayein ke object mein diye gaye naam ka attribute hai ya nahi.",
  },
  "ref-func-hex": {
    title: "hex()",
    description: "Kisi integer ki hexadecimal representation return karein.",
  },
  "ref-func-id": {
    title: "id()",
    description: "Kisi object ki identity return karein.",
  },
  "ref-func-input": {
    title: "input()",
    description: "Standard input se string parhein.",
  },
  "ref-func-int": {
    title: "int()",
    description: "int([x]) -> integer int(x, base=10) -> integer Kisi number ya string ko integer mein convert karein, ya agar koi argument na diya gaya ho to 0 return karein.",
  },
  "ref-func-isinstance": {
    title: "isinstance()",
    description: "Batayein ke koi object kisi class ya us ki subclass ka instance hai ya nahi.",
  },
  "ref-func-issubclass": {
    title: "issubclass()",
    description: "Batayein ke 'cls' kisi doosri class se derived hai ya wohi class hai.",
  },
  "ref-func-iter": {
    title: "iter()",
    description: "Kisi object se iterator hasil karein.",
  },
  "ref-func-len": {
    title: "len()",
    description: "Container mein items ki tadad return karein.",
  },
  "ref-func-list": {
    title: "list()",
    description: "Built-in mutable sequence.",
  },
  "ref-func-locals": {
    title: "locals()",
    description: "Current scope ke local variables wali dictionary return karein.",
  },
  "ref-func-map": {
    title: "map()",
    description: "map(func, *iterables) --> map object Aisa iterator banayein jo function ko har iterable ke arguments se compute kare.",
  },
  "ref-func-max": {
    title: "max()",
    description: "max(iterable, *[, default=obj, key=func]) -> value max(arg1, arg2, *args, *[, key=func]) -> value Ek iterable argument ke saath, us ka sab se bara item return karein.",
  },
  "ref-func-memoryview": {
    title: "memoryview()",
    description: "Naya memoryview object banayein jo diye gaye object ko reference kare.",
  },
  "ref-func-min": {
    title: "min()",
    description: "min(iterable, *[, default=obj, key=func]) -> value min(arg1, arg2, *args, *[, key=func]) -> value Ek iterable argument ke saath, us ka sab se chhota item return karein.",
  },
  "ref-func-next": {
    title: "next()",
    description: "Iterator se agla item return karein.",
  },
  "ref-func-object": {
    title: "object()",
    description: "Class hierarchy ki base class.",
  },
  "ref-func-oct": {
    title: "oct()",
    description: "Kisi integer ki octal representation return karein.",
  },
  "ref-func-open": {
    title: "open()",
    description: "File kholein aur stream return karein.",
  },
  "ref-func-ord": {
    title: "ord()",
    description: "Ek character wali string ke liye Unicode code point return karein.",
  },
  "ref-func-pow": {
    title: "pow()",
    description: "2 arguments ke saath base**exp ke barabar, ya 3 arguments ke saath base**exp % mod ke barabar. Kuch types, jaise ints, teen argument wali form se call karne par zyada efficient algorithm istemal kar sakti hain.",
  },
  "ref-func-print": {
    title: "print()",
    description: "Values ko stream par print karein, ya by default sys.stdout par.",
  },
  "ref-func-range": {
    title: "range()",
    description: "range(stop) -> range object range(start, stop[, step]) -> range object Aisa object return karein jo start (inclusive) se stop (exclusive) tak integers ki sequence step ke hisab se produce kare.",
  },
  "ref-func-reversed": {
    title: "reversed()",
    description: "Diye gaye sequence ki values par reverse iterator return karein.",
  },
  "ref-func-round": {
    title: "round()",
    description: "Kisi number ko decimal digits mein di gayi precision tak round karein.",
  },
  "ref-func-set": {
    title: "set()",
    description: "set() -> naya khaali set object set(iterable) -> naya set object Unique elements ka unordered collection banayein.",
  },
  "ref-func-setattr": {
    title: "setattr()",
    description: "Diye gaye object par named attribute ko specified value par set karein.",
  },
  "ref-func-slice": {
    title: "slice()",
    description: "slice(stop) slice(start, stop[, step]) Slice object banayein.",
  },
  "ref-func-sorted": {
    title: "sorted()",
    description: "Iterable ke tamam items ascending order mein wali nayi list return karein.",
  },
  "ref-func-str": {
    title: "str()",
    description: "str(object='') -> str str(bytes_or_buffer[, encoding[, errors]]) -> str Diye gaye object se naya string object banayein.",
  },
  "ref-func-sum": {
    title: "sum()",
    description: "'start' value (default: 0) plus numbers ke iterable ka sum return karein. Jab iterable khaali ho, to start value return karein.",
  },
  "ref-func-super": {
    title: "super()",
    description: "super() -> super(__class__, <first argument>) jaisa hi super(type) -> unbound super object super(type, obj) -> bound super object; zaroori hai ke isinstance(obj, type) ho super(type, type2) -> bound super object; issubcla",
  },
  "ref-func-tuple": {
    title: "tuple()",
    description: "Built-in immutable sequence.",
  },
  "ref-func-type": {
    title: "type()",
    description: "type(object) -> object ka type type(name, bases, dict, **kwds) -> naya type",
  },
  "ref-func-vars": {
    title: "vars()",
    description: "Vars dikhayein.",
  },
  "ref-func-zip": {
    title: "zip()",
    description: "zip(*iterables, strict=False) --> Jab tak koi input khatam na ho jaye, tuples yield karein.",
  },
  "python-ref-string": {
    title: "Python ke String Methods",
    description: "String methods — har method jo aap str par call kar sakte hain.",
  },
  "ref-string-capitalize": {
    title: "capitalize()",
    description: "String ka capitalized version return karein.",
  },
  "ref-string-casefold": {
    title: "casefold()",
    description: "String ka aisa version return karein jo caseless comparisons ke liye munasib ho.",
  },
  "ref-string-center": {
    title: "center()",
    description: "Length width wali centered string return karein.",
  },
  "ref-string-count": {
    title: "count()",
    description: "S.count(sub[, start[, end]]) -> int String S[start:end] mein substring sub ke non-overlapping occurrences ki tadad return karein.",
  },
  "ref-string-encode": {
    title: "encode()",
    description: "String ko encoding ke liye registered codec se encode karein.",
  },
  "ref-string-endswith": {
    title: "endswith()",
    description: "S.endswith(suffix[, start[, end]]) -> bool True return karein agar S specified suffix se khatam ho, warna False.",
  },
  "ref-string-expandtabs": {
    title: "expandtabs()",
    description: "Aisi copy return karein jis mein tamam tab characters spaces se expand kar diye gaye hon.",
  },
  "ref-string-find": {
    title: "find()",
    description: "S.find(sub[, start[, end]]) -> int S mein sab se chhota index return karein jahan substring sub mile, is tarah ke sub S[start:end] ke andar ho.",
  },
  "ref-string-format": {
    title: "format()",
    description: "S.format(*args, **kwargs) -> str Args aur kwargs ki substitutions se S ka formatted version return karein.",
  },
  "ref-string-format-map": {
    title: "format_map()",
    description: "format_map() — neeche di gayi misaal dekhein.",
  },
  "ref-string-index": {
    title: "index()",
    description: "S.index(sub[, start[, end]]) -> int S mein sab se chhota index return karein jahan substring sub mile, is tarah ke sub S[start:end] ke andar ho.",
  },
  "ref-string-isalnum": {
    title: "isalnum()",
    description: "True return karein agar string alpha-numeric string ho, warna False.",
  },
  "ref-string-isalpha": {
    title: "isalpha()",
    description: "True return karein agar string alphabetic string ho, warna False.",
  },
  "ref-string-isascii": {
    title: "isascii()",
    description: "True return karein agar string ke tamam characters ASCII hon, warna False.",
  },
  "ref-string-isdecimal": {
    title: "isdecimal()",
    description: "True return karein agar string decimal string ho, warna False.",
  },
  "ref-string-isdigit": {
    title: "isdigit()",
    description: "True return karein agar string digit string ho, warna False.",
  },
  "ref-string-isidentifier": {
    title: "isidentifier()",
    description: "True return karein agar string valid Python identifier ho, warna False.",
  },
  "ref-string-islower": {
    title: "islower()",
    description: "True return karein agar string lowercase string ho, warna False.",
  },
  "ref-string-isnumeric": {
    title: "isnumeric()",
    description: "True return karein agar string numeric string ho, warna False.",
  },
  "ref-string-isprintable": {
    title: "isprintable()",
    description: "True return karein agar string printable ho, warna False.",
  },
  "ref-string-isspace": {
    title: "isspace()",
    description: "True return karein agar string whitespace string ho, warna False.",
  },
  "ref-string-istitle": {
    title: "istitle()",
    description: "True return karein agar string title-cased string ho, warna False.",
  },
  "ref-string-isupper": {
    title: "isupper()",
    description: "True return karein agar string uppercase string ho, warna False.",
  },
  "ref-string-join": {
    title: "join()",
    description: "Kisi bhi tadad ki strings ko jorein.",
  },
  "ref-string-ljust": {
    title: "ljust()",
    description: "Length width wali left-justified string return karein.",
  },
  "ref-string-lower": {
    title: "lower()",
    description: "String ki copy return karein jo lowercase mein convert kar di gayi ho.",
  },
  "ref-string-lstrip": {
    title: "lstrip()",
    description: "String ki copy return karein jis se leading whitespace hata diya gaya ho.",
  },
  "ref-string-maketrans": {
    title: "maketrans()",
    description: "Translation table return karein jo str.translate() ke liye istemal ho sake.",
  },
  "ref-string-partition": {
    title: "partition()",
    description: "Diye gaye separator se string ko teen hisson mein partition karein.",
  },
  "ref-string-replace": {
    title: "replace()",
    description: "Aisi copy return karein jis mein substring old ke tamam occurrences new se replace kar diye gaye hon.",
  },
  "ref-string-rfind": {
    title: "rfind()",
    description: "S.rfind(sub[, start[, end]]) -> int S mein sab se bara index return karein jahan substring sub mile, is tarah ke sub S[start:end] ke andar ho.",
  },
  "ref-string-rindex": {
    title: "rindex()",
    description: "S.rindex(sub[, start[, end]]) -> int S mein sab se bara index return karein jahan substring sub mile, is tarah ke sub S[start:end] ke andar ho.",
  },
  "ref-string-rjust": {
    title: "rjust()",
    description: "Length width wali right-justified string return karein.",
  },
  "ref-string-rpartition": {
    title: "rpartition()",
    description: "Diye gaye separator se string ko teen hisson mein partition karein.",
  },
  "ref-string-rsplit": {
    title: "rsplit()",
    description: "String ke substrings ki list return karein, sep ko separator string ke tor par istemal kar ke.",
  },
  "ref-string-rstrip": {
    title: "rstrip()",
    description: "String ki copy return karein jis se trailing whitespace hata diya gaya ho.",
  },
  "ref-string-split": {
    title: "split()",
    description: "String ke substrings ki list return karein, sep ko separator string ke tor par istemal kar ke.",
  },
  "ref-string-splitlines": {
    title: "splitlines()",
    description: "String ki lines ki list return karein, line boundaries par tor kar.",
  },
  "ref-string-startswith": {
    title: "startswith()",
    description: "S.startswith(prefix[, start[, end]]) -> bool True return karein agar S specified prefix se shuru ho, warna False.",
  },
  "ref-string-strip": {
    title: "strip()",
    description: "String ki copy return karein jis se leading aur trailing whitespace hata diya gaya ho.",
  },
  "ref-string-swapcase": {
    title: "swapcase()",
    description: "Uppercase characters ko lowercase mein aur lowercase characters ko uppercase mein convert karein.",
  },
  "ref-string-title": {
    title: "title()",
    description: "String ka aisa version return karein jis mein har word titlecased ho.",
  },
  "ref-string-translate": {
    title: "translate()",
    description: "Diye gaye translation table se string ke har character ko replace karein.",
  },
  "ref-string-upper": {
    title: "upper()",
    description: "String ki copy return karein jo uppercase mein convert kar di gayi ho.",
  },
  "ref-string-zfill": {
    title: "zfill()",
    description: "Numeric string ko left par zeros se pad karein, taake diye gaye width ka field bhar jaye.",
  },
  "python-ref-list": {
    title: "Python ke List Methods",
    description: "List methods — har method jo aap list par call kar sakte hain.",
  },
  "ref-list-append": {
    title: "append()",
    description: "Object ko list ke end mein append karein.",
  },
  "ref-list-clear": {
    title: "clear()",
    description: "List se tamam items hata dein.",
  },
  "ref-list-copy": {
    title: "copy()",
    description: "List ki shallow copy return karein.",
  },
  "ref-list-count": {
    title: "count()",
    description: "Value ke occurrences ki tadad return karein.",
  },
  "ref-list-extend": {
    title: "extend()",
    description: "Iterable ke elements append kar ke list ko extend karein.",
  },
  "ref-list-index": {
    title: "index()",
    description: "Value ka pehla index return karein.",
  },
  "ref-list-insert": {
    title: "insert()",
    description: "Index se pehle object insert karein.",
  },
  "ref-list-pop": {
    title: "pop()",
    description: "Index par item hata kar return karein (default last).",
  },
  "ref-list-remove": {
    title: "remove()",
    description: "Value ka pehla occurrence hata dein.",
  },
  "ref-list-reverse": {
    title: "reverse()",
    description: "Jagah par hi reverse karein (*IN PLACE*).",
  },
  "ref-list-sort": {
    title: "sort()",
    description: "List ko ascending order mein sort karein aur None return karein.",
  },
  "python-ref-dictionary": {
    title: "Python ke Dictionary Methods",
    description: "Dictionary methods — har method jo aap dict par call kar sakte hain.",
  },
  "ref-dictionary-clear": {
    title: "clear()",
    description: "D.clear() -> None.",
  },
  "ref-dictionary-copy": {
    title: "copy()",
    description: "D.copy() -> D ki shallow copy",
  },
  "ref-dictionary-fromkeys": {
    title: "fromkeys()",
    description: "Iterable ki keys aur values ko value par set kar ke nayi dictionary banayein.",
  },
  "ref-dictionary-get": {
    title: "get()",
    description: "Key ki value return karein agar key dictionary mein ho, warna default.",
  },
  "ref-dictionary-items": {
    title: "items()",
    description: "D.items() -> D ke items par view dene wala set-like object",
  },
  "ref-dictionary-keys": {
    title: "keys()",
    description: "D.keys() -> D ki keys par view dene wala set-like object",
  },
  "ref-dictionary-pop": {
    title: "pop()",
    description: "D.pop(k[,d]) -> v, specified key hata dein aur corresponding value return karein.",
  },
  "ref-dictionary-popitem": {
    title: "popitem()",
    description: "2-tuple ke tor par (key, value) pair hata kar return karein.",
  },
  "ref-dictionary-setdefault": {
    title: "setdefault()",
    description: "Agar key dictionary mein na ho to usay default ki value ke saath insert karein.",
  },
  "ref-dictionary-update": {
    title: "update()",
    description: "D.update([E, ]**F) -> None.",
  },
  "ref-dictionary-values": {
    title: "values()",
    description: "D.values() -> D ki values par view dene wala object",
  },
  "python-ref-tuple": {
    title: "Python ke Tuple Methods",
    description: "Tuple methods — har method jo aap tuple par call kar sakte hain.",
  },
  "ref-tuple-count": {
    title: "count()",
    description: "Value ke occurrences ki tadad return karein.",
  },
  "ref-tuple-index": {
    title: "index()",
    description: "Value ka pehla index return karein.",
  },
  "python-ref-set": {
    title: "Python ke Set Methods",
    description: "Set methods — har method jo aap set par call kar sakte hain.",
  },
  "ref-set-add": {
    title: "add()",
    description: "Set mein element add karein.",
  },
  "ref-set-clear": {
    title: "clear()",
    description: "Is set se tamam elements hata dein.",
  },
  "ref-set-copy": {
    title: "copy()",
    description: "Set ki shallow copy return karein.",
  },
  "ref-set-difference": {
    title: "difference()",
    description: "Do ya zyada sets ka difference naye set ke tor par return karein.",
  },
  "ref-set-difference-update": {
    title: "difference_update()",
    description: "difference_update() — neeche di gayi misaal dekhein.",
  },
  "ref-set-discard": {
    title: "discard()",
    description: "Set se element hata dein agar woh member ho.",
  },
  "ref-set-intersection": {
    title: "intersection()",
    description: "Do sets ka intersection naye set ke tor par return karein.",
  },
  "ref-set-intersection-update": {
    title: "intersection_update()",
    description: "intersection_update() — neeche di gayi misaal dekhein.",
  },
  "ref-set-isdisjoint": {
    title: "isdisjoint()",
    description: "True return karein agar do sets ka intersection null ho.",
  },
  "ref-set-issubset": {
    title: "issubset()",
    description: "Test karein ke set ka har element other mein ho ya nahi.",
  },
  "ref-set-lessthan": {
    title: "<",
    description: "< check karta hai ke kya set doosre set ka proper subset hai.",
  },
  "ref-set-issuperset": {
    title: "issuperset()",
    description: "Test karein ke other ka har element set mein ho ya nahi.",
  },
  "ref-set-greaterthan": {
    title: ">",
    description: "> check karta hai ke kya set doosre set ka proper superset hai.",
  },
  "ref-set-pop": {
    title: "pop()",
    description: "Koi arbitrary set element hata kar return karein.",
  },
  "ref-set-remove": {
    title: "remove()",
    description: "Set se element hata dein; us ka member hona zaroori hai.",
  },
  "ref-set-symmetric-difference": {
    title: "symmetric_difference()",
    description: "symmetric_difference() — neeche di gayi misaal dekhein.",
  },
  "ref-set-symmetric-difference-update": {
    title: "symmetric_difference_update()",
    description: "symmetric_difference_update() — neeche di gayi misaal dekhein.",
  },
  "ref-set-union": {
    title: "union()",
    description: "Sets ka union naye set ke tor par return karein.",
  },
  "ref-set-update": {
    title: "update()",
    description: "Set ko khud aur others ke union se update karein.",
  },
  "python-reference": {
    title: "Python ka Khulasa",
    description: "Python Reference — har built-in function, method, keyword aur exception ek hi jagah par.",
  },
  "python-ref-file": {
    title: "Python ke File Methods",
    description: "File methods — har method jo aap khuli hui file object par call kar sakte hain.",
  },
  "ref-file-close": {
    title: "close()",
    description: "IO object band karein.",
  },
  "ref-file-fileno": {
    title: "fileno()",
    description: "Underlying file descriptor return karein agar woh maujood ho.",
  },
  "ref-file-flush": {
    title: "flush()",
    description: "Write buffers flush karein, agar applicable ho.",
  },
  "ref-file-isatty": {
    title: "isatty()",
    description: "Batayein ke ye 'interactive' stream hai ya nahi.",
  },
  "ref-file-read": {
    title: "read()",
    description: "Zyada se zyada size characters parhein, string ke tor par return karein.",
  },
  "ref-file-readable": {
    title: "readable()",
    description: "True return karein agar IO object ko parha ja sake.",
  },
  "ref-file-readline": {
    title: "readline()",
    description: "Newline ya EOF tak parhein.",
  },
  "ref-file-readlines": {
    title: "readlines()",
    description: "Stream se lines ki list return karein.",
  },
  "ref-file-seek": {
    title: "seek()",
    description: "Stream position badlein.",
  },
  "ref-file-seekable": {
    title: "seekable()",
    description: "True return karein agar IO object ko seek kiya ja sake.",
  },
  "ref-file-tell": {
    title: "tell()",
    description: "Current file position batayein.",
  },
  "ref-file-truncate": {
    title: "truncate()",
    description: "Size ko pos tak truncate karein.",
  },
  "ref-file-writable": {
    title: "writable()",
    description: "True return karein agar IO object par likha ja sake.",
  },
  "ref-file-write": {
    title: "write()",
    description: "File mein string likhein.",
  },
  "ref-file-writelines": {
    title: "writelines()",
    description: "Stream mein lines ki list likhein.",
  },
  "python-ref-keywords": {
    title: "Python ke Keywords",
    description: "Python keywords — reserved words jo language banate hain.",
  },
  "ref-keyword-and": {
    title: "and",
    description: "and ek logical operator hai — True sirf tab jab dono sides True hon.",
  },
  "ref-keyword-as": {
    title: "as",
    description: "as kisi imported module ya caught exception ko doosra naam deta hai.",
  },
  "ref-keyword-assert": {
    title: "assert",
    description: "assert condition check karta hai — agar woh False ho to Python AssertionError raise karta hai.",
  },
  "ref-keyword-async": {
    title: "async",
    description: "async kisi function ko asynchronous mark karta hai — woh coroutine return karta hai jise aap await se chalate hain.",
  },
  "ref-keyword-await": {
    title: "await",
    description: "await async function ko rok deta hai jab tak woh cheez khatam na ho jaye jis ka woh intezar kar raha ho.",
  },
  "ref-keyword-break": {
    title: "break",
    description: "break qareebi loop se foran bahar nikal jata hai.",
  },
  "ref-keyword-case": {
    title: "case",
    description: "case match statement ki ek branch hai — woh tab chalti hai jab us ka pattern fit ho jaye.",
  },
  "ref-keyword-class": {
    title: "class",
    description: "class nayi class define karta hai — objects ka blueprint.",
  },
  "ref-keyword-continue": {
    title: "continue",
    description: "continue current loop round ka baqi hissa skip kar ke agla round shuru karta hai.",
  },
  "ref-keyword-def": {
    title: "def",
    description: "def function define karta hai.",
  },
  "ref-keyword-del": {
    title: "del",
    description: "del kisi variable, item, ya slice ko delete karta hai.",
  },
  "ref-keyword-elif": {
    title: "elif",
    description: "elif doosri condition hai, jo sirf tab check hoti hai jab us ke upar wala if False tha.",
  },
  "ref-keyword-else": {
    title: "else",
    description: "else tab chalta hai jab us ke upar wala if (aur elifs) sab False hon.",
  },
  "ref-keyword-except": {
    title: "except",
    description: "except matching try block ke andar raise hone wali error ko catch karta hai.",
  },
  "ref-keyword-false": {
    title: "False",
    description: "False 'no' ke liye boolean value hai.",
  },
  "ref-keyword-finally": {
    title: "finally",
    description: "finally chahe kuch bhi ho — error ho ya na ho — try block ke baad chalta hai.",
  },
  "ref-keyword-for": {
    title: "for",
    description: "for sequence ke har item par ek ek kar ke loop karta hai.",
  },
  "ref-keyword-from": {
    title: "from",
    description: "from kisi module se specific names import karta hai.",
  },
  "ref-keyword-global": {
    title: "global",
    description: "global kehta hai ke function ke andar ka naam module-level variable ki taraf ishara karta hai.",
  },
  "ref-keyword-if": {
    title: "if",
    description: "if apna block sirf tab chalata hai jab us ki condition True ho.",
  },
  "ref-keyword-import": {
    title: "import",
    description: "import kisi module ke names ko aapke program mein le aata hai.",
  },
  "ref-keyword-in": {
    title: "in",
    description: "in membership check karta hai — True jab left side right side ke andar ho.",
  },
  "ref-keyword-is": {
    title: "is",
    description: "is identity check karta hai — True jab dono names aik hi object ki taraf ishara karte hon.",
  },
  "ref-keyword-lambda": {
    title: "lambda",
    description: "lambda ek line mein chhota anonymous function banata hai.",
  },
  "ref-keyword-match": {
    title: "match",
    description: "match kisi value ko patterns se check karta hai aur pehla fit hone wala chalata hai.",
  },
  "ref-keyword-none": {
    title: "None",
    description: "None ka matlab hai 'yahan koi value nahi' — value ki ghair-maujoodgi.",
  },
  "ref-keyword-nonlocal": {
    title: "nonlocal",
    description: "nonlocal kehta hai ke nested function ke andar ka naam enclosing function ke variable ki taraf ishara karta hai.",
  },
  "ref-keyword-not": {
    title: "not",
    description: "not boolean ko ulta kar deta hai — True False ban jata hai aur wapas.",
  },
  "ref-keyword-or": {
    title: "or",
    description: "or ek logical operator hai — True jab kam se kam ek side True ho.",
  },
  "ref-keyword-pass": {
    title: "pass",
    description: "pass kuch nahi karta — placeholder jahan Python ko statement chahiye.",
  },
  "ref-keyword-raise": {
    title: "raise",
    description: "raise jaan boojh kar exception throw karta hai.",
  },
  "ref-keyword-return": {
    title: "return",
    description: "return function se value wapas bhejta hai aur use khatam kar deta hai.",
  },
  "ref-keyword-true": {
    title: "True",
    description: "True 'yes' ke liye boolean value hai.",
  },
  "ref-keyword-try": {
    title: "try",
    description: "try aise code ko wrap karta hai jo fail ho sakta hai, taake except error catch kar sake.",
  },
  "ref-keyword-while": {
    title: "while",
    description: "while apna block tab tak doharta hai jab tak us ki condition True rahe.",
  },
  "ref-keyword-with": {
    title: "with",
    description: "with resource (jaise file) kholta hai aur block khatam hone par use aapke liye band kar deta hai.",
  },
  "ref-keyword-yield": {
    title: "yield",
    description: "yield generator function ko rokta hai aur caller ko ek value deta hai.",
  },
  "python-ref-exceptions": {
    title: "Python ke Exceptions",
    description: "Python exceptions — woh errors jo Python raise karta hai, aur har ek ka matlab kya hai.",
  },
  "ref-exception-arithmeticerror": {
    title: "ArithmeticError",
    description: "ArithmeticError tamam arithmetic errors ka parent hai (ZeroDivisionError, OverflowError, FloatingPointError).",
  },
  "ref-exception-assertionerror": {
    title: "AssertionError",
    description: "AssertionError tab raise hoti hai jab assert statement fail ho jaye.",
  },
  "ref-exception-attributeerror": {
    title: "AttributeError",
    description: "AttributeError tab raise hoti hai jab aap aisa attribute ya method access karein jo maujood hi na ho.",
  },
  "ref-exception-exception": {
    title: "Exception",
    description: "Exception taqreeban har error ka parent hai jo aap catch karein ge.",
  },
  "ref-exception-eoferror": {
    title: "EOFError",
    description: "EOFError tab raise hoti hai jab input() ya read file ke end par pahunche aur kuch bacha na ho.",
  },
  "ref-exception-floatingpointerror": {
    title: "FloatingPointError",
    description: "FloatingPointError tab raise hoti hai jab float operation fail ho jaye.",
  },
  "ref-exception-generatorexit": {
    title: "GeneratorExit",
    description: "GeneratorExit generator ke andar tab raise hoti hai jab use jaldi band kar diya jaye.",
  },
  "ref-exception-importerror": {
    title: "ImportError",
    description: "ImportError tab raise hoti hai jab import module na dhoondh sake.",
  },
  "ref-exception-indentationerror": {
    title: "IndentationError",
    description: "IndentationError tab raise hoti hai jab block ki indentation ghalat ho.",
  },
  "ref-exception-indexerror": {
    title: "IndexError",
    description: "IndexError tab raise hoti hai jab list ya tuple ka index range se bahar ho.",
  },
  "ref-exception-keyerror": {
    title: "KeyError",
    description: "KeyError tab raise hoti hai jab dictionary ki key maujood na ho.",
  },
  "ref-exception-keyboardinterrupt": {
    title: "KeyboardInterrupt",
    description: "KeyboardInterrupt tab raise hoti hai jab user Ctrl+C dabaye.",
  },
  "ref-exception-lookuperror": {
    title: "LookupError",
    description: "LookupError IndexError aur KeyError ka parent hai.",
  },
  "ref-exception-memoryerror": {
    title: "MemoryError",
    description: "MemoryError tab raise hoti hai jab Python ki memory khatam ho jaye.",
  },
  "ref-exception-nameerror": {
    title: "NameError",
    description: "NameError tab raise hoti hai jab aap aisa variable istemal karein jo kabhi define hi na hua ho.",
  },
  "ref-exception-notimplementederror": {
    title: "NotImplementedError",
    description: "NotImplementedError ye kehne ke liye raise hoti hai ke 'ye hissa abhi likha nahi gaya'.",
  },
  "ref-exception-oserror": {
    title: "OSError",
    description: "OSError tab raise hoti hai jab operating system kisi cheez se inkar kar de (missing file, permission nahi).",
  },
  "ref-exception-overflowerror": {
    title: "OverflowError",
    description: "OverflowError tab raise hoti hai jab number apne type ke liye bohat bara ho jaye.",
  },
  "ref-exception-referenceerror": {
    title: "ReferenceError",
    description: "ReferenceError tab raise hoti hai jab weak reference aise object ki taraf ishara kare jo pehle hi khatam ho chuka ho.",
  },
  "ref-exception-runtimeerror": {
    title: "RuntimeError",
    description: "RuntimeError run time par kuch ghalat hone par general error hai.",
  },
  "ref-exception-stopiteration": {
    title: "StopIteration",
    description: "StopIteration next() se tab raise hoti hai jab iterator khatam ho jaye.",
  },
  "ref-exception-syntaxerror": {
    title: "SyntaxError",
    description: "SyntaxError tab raise hoti hai jab code khud valid Python na ho.",
  },
  "ref-exception-taberror": {
    title: "TabError",
    description: "TabError tab raise hoti hai jab indentation mein tabs aur spaces mix kar diye jayein.",
  },
  "ref-exception-systemerror": {
    title: "SystemError",
    description: "SystemError tab raise hoti hai jab interpreter khud kisi internal problem ka samna kare.",
  },
  "ref-exception-systemexit": {
    title: "SystemExit",
    description: "SystemExit sys.exit() se raise hoti hai — ye program khatam kar deti hai.",
  },
  "ref-exception-typeerror": {
    title: "TypeError",
    description: "TypeError tab raise hoti hai jab operation ghalat type par istemal ki jaye.",
  },
  "ref-exception-unboundlocalerror": {
    title: "UnboundLocalError",
    description: "UnboundLocalError tab raise hoti hai jab aap local variable ko assign karne se pehle parhein.",
  },
  "ref-exception-unicodeerror": {
    title: "UnicodeError",
    description: "UnicodeError UnicodeEncodeError, UnicodeDecodeError aur UnicodeTranslateError ka parent hai.",
  },
  "ref-exception-unicodeencodeerror": {
    title: "UnicodeEncodeError",
    description: "UnicodeEncodeError tab raise hoti hai jab text ko bytes mein encode na kiya ja sake.",
  },
  "ref-exception-unicodedecodeerror": {
    title: "UnicodeDecodeError",
    description: "UnicodeDecodeError tab raise hoti hai jab bytes ko text mein decode na kiya ja sake.",
  },
  "ref-exception-unicodetranslateerror": {
    title: "UnicodeTranslateError",
    description: "UnicodeTranslateError tab raise hoti hai jab character ko translate na kiya ja sake.",
  },
  "ref-exception-valueerror": {
    title: "ValueError",
    description: "ValueError tab raise hoti hai jab value ka type sahi ho lekin content ghalat ho.",
  },
  "ref-exception-zerodivisionerror": {
    title: "ZeroDivisionError",
    description: "ZeroDivisionError tab raise hoti hai jab aap zero se divide karein.",
  },
  "python-ref-glossary": {
    title: "Python ki Glossary",
    description: "Python Glossary — woh lafz jo Python developers istemal karte hain, har ek ek line mein samjhaya gaya.",
  },
};
