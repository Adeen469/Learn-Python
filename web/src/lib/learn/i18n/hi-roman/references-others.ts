import type { ReferenceTranslations } from "../types";
export const TRANSLATIONS: ReferenceTranslations = {
  "python-ref-functions": {
    title: "Python ke Built-in Functions",
    description: "Python ke built-in functions — hamesha available, import ki zaroorat nahi.",
  },
  "ref-func-abs": {
    title: "abs()",
    description: "Argument ka absolute value return karo.",
  },
  "ref-func-all": {
    title: "all()",
    description: "True return karo agar iterable ke har value x ke liye bool(x) True ho.",
  },
  "ref-func-any": {
    title: "any()",
    description: "True return karo agar iterable ke kisi x ke liye bool(x) True ho.",
  },
  "ref-func-ascii": {
    title: "ascii()",
    description: "Object ka sirf ASCII wala representation return karo.",
  },
  "ref-func-bin": {
    title: "bin()",
    description: "Integer ka binary representation return karo.",
  },
  "ref-func-bool": {
    title: "bool()",
    description: "bool(x) -> bool True return karta hai jab argument x true ho, warna False.",
  },
  "ref-func-bytearray": {
    title: "bytearray()",
    description: "bytearray(iterable_of_ints) -> bytearray bytearray(string, encoding[, errors]) -> bytearray bytearray(bytes_or_buffer) -> mutable copy of bytes_or_buffer bytearray(int) -> bytes array of size given by the parameter initi",
  },
  "ref-func-bytes": {
    title: "bytes()",
    description: "bytes(iterable_of_ints) -> bytes bytes(string, encoding[, errors]) -> bytes bytes(bytes_or_buffer) -> immutable copy of bytes_or_buffer bytes(int) -> bytes object jiska size parameter se diya gaya hai, null byte se initialized",
  },
  "ref-func-callable": {
    title: "callable()",
    description: "Return karo ki object callable hai ya nahi (matlab, kisi tarah ka function).",
  },
  "ref-func-chr": {
    title: "chr()",
    description: "Ordinal i wala ek character ki Unicode string return karo; 0 <= i <= 0x10ffff.",
  },
  "ref-func-compile": {
    title: "compile()",
    description: "Source ko code object mein compile karo jise exec() ya eval() se execute kiya ja sakta hai.",
  },
  "ref-func-complex": {
    title: "complex()",
    description: "Real part aur optional imaginary part se ek complex number banao.",
  },
  "ref-func-delattr": {
    title: "delattr()",
    description: "Diye gaye object se named attribute delete karo.",
  },
  "ref-func-dict": {
    title: "dict()",
    description: "dict() -> new empty dictionary dict(mapping) -> new dictionary initialized from a mapping object's (key, value) pairs dict(iterable) -> new dictionary initialized as if via: d = {} for k, v in iterable: d[k] = v dict(**k",
  },
  "ref-func-dir": {
    title: "dir()",
    description: "Object ke attributes dikhao.",
  },
  "ref-func-divmod": {
    title: "divmod()",
    description: "Tuple (x//y, x%y) return karo.",
  },
  "ref-func-enumerate": {
    title: "enumerate()",
    description: "Ek enumerate object return karo.",
  },
  "ref-func-eval": {
    title: "eval()",
    description: "Diye gaye source ko globals aur locals ke context mein evaluate karo.",
  },
  "ref-func-exec": {
    title: "exec()",
    description: "Diye gaye source ko globals aur locals ke context mein execute karo.",
  },
  "ref-func-filter": {
    title: "filter()",
    description: "filter(function or None, iterable) --> filter object Ek iterator return karo jo iterable ke un items ko deta hai jinke liye function(item) true ho.",
  },
  "ref-func-float": {
    title: "float()",
    description: "String ya number ko floating point number mein convert karo, agar possible ho.",
  },
  "ref-func-format": {
    title: "format()",
    description: "type(value).__format__(value, format_spec) return karo. Kai built-in types format_spec ko Format Specification Mini-language ke hisaab se implement karte hain.",
  },
  "ref-func-frozenset": {
    title: "frozenset()",
    description: "frozenset() -> empty frozenset object frozenset(iterable) -> frozenset object Unique elements ka immutable unordered collection banao.",
  },
  "ref-func-getattr": {
    title: "getattr()",
    description: "Object se named attribute lo.",
  },
  "ref-func-globals": {
    title: "globals()",
    description: "Dictionary return karo jisme current scope ke global variables hain.",
  },
  "ref-func-hasattr": {
    title: "hasattr()",
    description: "Return karo ki object mein diye gaye naam wala attribute hai ya nahi.",
  },
  "ref-func-hex": {
    title: "hex()",
    description: "Integer ka hexadecimal representation return karo.",
  },
  "ref-func-id": {
    title: "id()",
    description: "Object ki identity return karo.",
  },
  "ref-func-input": {
    title: "input()",
    description: "Standard input se ek string padho.",
  },
  "ref-func-int": {
    title: "int()",
    description: "int([x]) -> integer int(x, base=10) -> integer Number ya string ko integer mein convert karo, ya 0 return karo agar koi argument na diya gaya ho.",
  },
  "ref-func-isinstance": {
    title: "isinstance()",
    description: "Return karo ki object kisi class ka instance hai ya uski subclass ka.",
  },
  "ref-func-issubclass": {
    title: "issubclass()",
    description: "Return karo ki 'cls' kisi aur class se derived hai ya wahi class hai.",
  },
  "ref-func-iter": {
    title: "iter()",
    description: "Object se ek iterator lo.",
  },
  "ref-func-len": {
    title: "len()",
    description: "Container mein items ki ginti return karo.",
  },
  "ref-func-list": {
    title: "list()",
    description: "Built-in mutable sequence.",
  },
  "ref-func-locals": {
    title: "locals()",
    description: "Dictionary return karo jisme current scope ke local variables hain.",
  },
  "ref-func-map": {
    title: "map()",
    description: "map(func, *iterables) --> map object Ek iterator banao jo har iterable se arguments lekar function ko compute karta hai.",
  },
  "ref-func-max": {
    title: "max()",
    description: "max(iterable, *[, default=obj, key=func]) -> value max(arg1, arg2, *args, *[, key=func]) -> value Ek hi iterable argument ke saath, uska sabse bada item return karo.",
  },
  "ref-func-memoryview": {
    title: "memoryview()",
    description: "Ek naya memoryview object banao jo diye gaye object ko reference karta hai.",
  },
  "ref-func-min": {
    title: "min()",
    description: "min(iterable, *[, default=obj, key=func]) -> value min(arg1, arg2, *args, *[, key=func]) -> value Ek hi iterable argument ke saath, uska sabse chhota item return karo.",
  },
  "ref-func-next": {
    title: "next()",
    description: "Iterator se agla item return karo.",
  },
  "ref-func-object": {
    title: "object()",
    description: "Class hierarchy ki base class.",
  },
  "ref-func-oct": {
    title: "oct()",
    description: "Integer ka octal representation return karo.",
  },
  "ref-func-open": {
    title: "open()",
    description: "File kholo aur ek stream return karo.",
  },
  "ref-func-ord": {
    title: "ord()",
    description: "Ek character wali string ke liye Unicode code point return karo.",
  },
  "ref-func-pow": {
    title: "pow()",
    description: "2 arguments ke saath base**exp ke barabar, ya 3 arguments ke saath base**exp % mod ke barabar. Kuch types, jaise ints, teen-argument wale form mein invoke karne par zyada efficient algorithm use kar sakte hain.",
  },
  "ref-func-print": {
    title: "print()",
    description: "Values ko ek stream par print karo, ya default se sys.stdout par.",
  },
  "ref-func-range": {
    title: "range()",
    description: "range(stop) -> range object range(start, stop[, step]) -> range object Ek object return karo jo start (inclusive) se stop (exclusive) tak step se integers ka sequence deta hai.",
  },
  "ref-func-reversed": {
    title: "reversed()",
    description: "Diye gaye sequence ke values par ek reverse iterator return karo.",
  },
  "ref-func-round": {
    title: "round()",
    description: "Number ko diye gaye decimal digits ki precision tak round karo.",
  },
  "ref-func-set": {
    title: "set()",
    description: "set() -> new empty set object set(iterable) -> new set object Unique elements ka unordered collection banao.",
  },
  "ref-func-setattr": {
    title: "setattr()",
    description: "Diye gaye object par named attribute ko specified value par set karo.",
  },
  "ref-func-slice": {
    title: "slice()",
    description: "slice(stop) slice(start, stop[, step]) Ek slice object banao.",
  },
  "ref-func-sorted": {
    title: "sorted()",
    description: "Ek nayi list return karo jisme iterable ke saare items ascending order mein hon.",
  },
  "ref-func-str": {
    title: "str()",
    description: "str(object='') -> str str(bytes_or_buffer[, encoding[, errors]]) -> str Diye gaye object se ek nayi string object banao.",
  },
  "ref-func-sum": {
    title: "sum()",
    description: "Ek 'start' value (default: 0) aur numbers ke iterable ka sum return karo. Jab iterable khaali ho, to start value return karo.",
  },
  "ref-func-super": {
    title: "super()",
    description: "super() -> same as super(__class__, <first argument>) super(type) -> unbound super object super(type, obj) -> bound super object; requires isinstance(obj, type) super(type, type2) -> bound super object; requires issubcla",
  },
  "ref-func-tuple": {
    title: "tuple()",
    description: "Built-in immutable sequence.",
  },
  "ref-func-type": {
    title: "type()",
    description: "type(object) -> the object's type type(name, bases, dict, **kwds) -> a new type",
  },
  "ref-func-vars": {
    title: "vars()",
    description: "Vars dikhao.",
  },
  "ref-func-zip": {
    title: "zip()",
    description: "zip(*iterables, strict=False) --> Jab tak koi input khatam na ho jaye, tuples yield karo.",
  },
  "python-ref-string": {
    title: "Python ke String Methods",
    description: "String methods — har method jo tum str par call kar sakte ho.",
  },
  "ref-string-capitalize": {
    title: "capitalize()",
    description: "String ka capitalized version return karo.",
  },
  "ref-string-casefold": {
    title: "casefold()",
    description: "String ka woh version return karo jo caseless comparisons ke liye suitable ho.",
  },
  "ref-string-center": {
    title: "center()",
    description: "Width length wali centered string return karo.",
  },
  "ref-string-count": {
    title: "count()",
    description: "S.count(sub[, start[, end]]) -> int String S[start:end] mein substring sub ke non-overlapping occurrences ki ginti return karo.",
  },
  "ref-string-encode": {
    title: "encode()",
    description: "String ko us codec se encode karo jo encoding ke liye registered hai.",
  },
  "ref-string-endswith": {
    title: "endswith()",
    description: "S.endswith(suffix[, start[, end]]) -> bool True return karo agar S specified suffix se end hota hai, warna False.",
  },
  "ref-string-expandtabs": {
    title: "expandtabs()",
    description: "Ek copy return karo jisme saare tab characters spaces se expand kiye gaye hon.",
  },
  "ref-string-find": {
    title: "find()",
    description: "S.find(sub[, start[, end]]) -> int S mein woh sabse chhota index return karo jahan substring sub milta hai, aise ki sub S[start:end] ke andar ho.",
  },
  "ref-string-format": {
    title: "format()",
    description: "S.format(*args, **kwargs) -> str Args aur kwargs se substitutions lekar S ka formatted version return karo.",
  },
  "ref-string-format-map": {
    title: "format_map()",
    description: "format_map() — example neeche dekho.",
  },
  "ref-string-index": {
    title: "index()",
    description: "S.index(sub[, start[, end]]) -> int S mein woh sabse chhota index return karo jahan substring sub milta hai, aise ki sub S[start:end] ke andar ho.",
  },
  "ref-string-isalnum": {
    title: "isalnum()",
    description: "True return karo agar string alpha-numeric string hai, warna False.",
  },
  "ref-string-isalpha": {
    title: "isalpha()",
    description: "True return karo agar string alphabetic string hai, warna False.",
  },
  "ref-string-isascii": {
    title: "isascii()",
    description: "True return karo agar string ke saare characters ASCII hain, warna False.",
  },
  "ref-string-isdecimal": {
    title: "isdecimal()",
    description: "True return karo agar string decimal string hai, warna False.",
  },
  "ref-string-isdigit": {
    title: "isdigit()",
    description: "True return karo agar string digit string hai, warna False.",
  },
  "ref-string-isidentifier": {
    title: "isidentifier()",
    description: "True return karo agar string ek valid Python identifier hai, warna False.",
  },
  "ref-string-islower": {
    title: "islower()",
    description: "True return karo agar string lowercase string hai, warna False.",
  },
  "ref-string-isnumeric": {
    title: "isnumeric()",
    description: "True return karo agar string numeric string hai, warna False.",
  },
  "ref-string-isprintable": {
    title: "isprintable()",
    description: "True return karo agar string printable hai, warna False.",
  },
  "ref-string-isspace": {
    title: "isspace()",
    description: "True return karo agar string whitespace string hai, warna False.",
  },
  "ref-string-istitle": {
    title: "istitle()",
    description: "True return karo agar string title-cased string hai, warna False.",
  },
  "ref-string-isupper": {
    title: "isupper()",
    description: "True return karo agar string uppercase string hai, warna False.",
  },
  "ref-string-join": {
    title: "join()",
    description: "Kitni bhi strings ko ek saath jodo.",
  },
  "ref-string-ljust": {
    title: "ljust()",
    description: "Width length wali left-justified string return karo.",
  },
  "ref-string-lower": {
    title: "lower()",
    description: "String ki copy return karo jo lowercase mein convert ki gayi ho.",
  },
  "ref-string-lstrip": {
    title: "lstrip()",
    description: "String ki copy return karo jisme leading whitespace hata diya gaya ho.",
  },
  "ref-string-maketrans": {
    title: "maketrans()",
    description: "Ek translation table return karo jo str.translate() ke liye use ho sakti hai.",
  },
  "ref-string-partition": {
    title: "partition()",
    description: "Diye gaye separator se string ko teen hisson mein baanto.",
  },
  "ref-string-replace": {
    title: "replace()",
    description: "Ek copy return karo jisme substring old ke saare occurrences new se replace kar diye gaye hon.",
  },
  "ref-string-rfind": {
    title: "rfind()",
    description: "S.rfind(sub[, start[, end]]) -> int S mein woh sabse bada index return karo jahan substring sub milta hai, aise ki sub S[start:end] ke andar ho.",
  },
  "ref-string-rindex": {
    title: "rindex()",
    description: "S.rindex(sub[, start[, end]]) -> int S mein woh sabse bada index return karo jahan substring sub milta hai, aise ki sub S[start:end] ke andar ho.",
  },
  "ref-string-rjust": {
    title: "rjust()",
    description: "Width length wali right-justified string return karo.",
  },
  "ref-string-rpartition": {
    title: "rpartition()",
    description: "Diye gaye separator se string ko teen hisson mein baanto.",
  },
  "ref-string-rsplit": {
    title: "rsplit()",
    description: "String ke substrings ki list return karo, jisme sep separator string ke roop mein use ho.",
  },
  "ref-string-rstrip": {
    title: "rstrip()",
    description: "String ki copy return karo jisme trailing whitespace hata diya gaya ho.",
  },
  "ref-string-split": {
    title: "split()",
    description: "String ke substrings ki list return karo, jisme sep separator string ke roop mein use ho.",
  },
  "ref-string-splitlines": {
    title: "splitlines()",
    description: "String ki lines ki list return karo, line boundaries par todkar.",
  },
  "ref-string-startswith": {
    title: "startswith()",
    description: "S.startswith(prefix[, start[, end]]) -> bool True return karo agar S specified prefix se shuru hota hai, warna False.",
  },
  "ref-string-strip": {
    title: "strip()",
    description: "String ki copy return karo jisme leading aur trailing whitespace hata diya gaya ho.",
  },
  "ref-string-swapcase": {
    title: "swapcase()",
    description: "Uppercase characters ko lowercase mein aur lowercase characters ko uppercase mein convert karo.",
  },
  "ref-string-title": {
    title: "title()",
    description: "String ka woh version return karo jisme har word titlecased ho.",
  },
  "ref-string-translate": {
    title: "translate()",
    description: "Diye gaye translation table se string ke har character ko replace karo.",
  },
  "ref-string-upper": {
    title: "upper()",
    description: "String ki copy return karo jo uppercase mein convert ki gayi ho.",
  },
  "ref-string-zfill": {
    title: "zfill()",
    description: "Numeric string ko left side par zeros se pad karo, taaki diye gaye width ka field bhar jaye.",
  },
  "python-ref-list": {
    title: "Python ke List Methods",
    description: "List methods — har method jo tum list par call kar sakte ho.",
  },
  "ref-list-append": {
    title: "append()",
    description: "Object ko list ke end mein append karo.",
  },
  "ref-list-clear": {
    title: "clear()",
    description: "List se saare items hatao.",
  },
  "ref-list-copy": {
    title: "copy()",
    description: "List ki shallow copy return karo.",
  },
  "ref-list-count": {
    title: "count()",
    description: "Value ke occurrences ki ginti return karo.",
  },
  "ref-list-extend": {
    title: "extend()",
    description: "Iterable ke elements ko append karke list ko extend karo.",
  },
  "ref-list-index": {
    title: "index()",
    description: "Value ka pehla index return karo.",
  },
  "ref-list-insert": {
    title: "insert()",
    description: "Index se pehle object insert karo.",
  },
  "ref-list-pop": {
    title: "pop()",
    description: "Index wala item remove karo aur return karo (default aakhri).",
  },
  "ref-list-remove": {
    title: "remove()",
    description: "Value ka pehla occurrence remove karo.",
  },
  "ref-list-reverse": {
    title: "reverse()",
    description: "Reverse *IN PLACE*.",
  },
  "ref-list-sort": {
    title: "sort()",
    description: "List ko ascending order mein sort karo aur None return karo.",
  },
  "python-ref-dictionary": {
    title: "Python ke Dictionary Methods",
    description: "Dictionary methods — har method jo tum dict par call kar sakte ho.",
  },
  "ref-dictionary-clear": {
    title: "clear()",
    description: "D.clear() -> None.",
  },
  "ref-dictionary-copy": {
    title: "copy()",
    description: "D.copy() -> D ki ek shallow copy",
  },
  "ref-dictionary-fromkeys": {
    title: "fromkeys()",
    description: "Iterable ki keys aur values ko value par set karke ek naya dictionary banao.",
  },
  "ref-dictionary-get": {
    title: "get()",
    description: "Key ki value return karo agar key dictionary mein hai, warna default.",
  },
  "ref-dictionary-items": {
    title: "items()",
    description: "D.items() -> ek set-like object jo D ke items par view deta hai",
  },
  "ref-dictionary-keys": {
    title: "keys()",
    description: "D.keys() -> ek set-like object jo D ke keys par view deta hai",
  },
  "ref-dictionary-pop": {
    title: "pop()",
    description: "D.pop(k[,d]) -> v, specified key ko remove karo aur uski corresponding value return karo.",
  },
  "ref-dictionary-popitem": {
    title: "popitem()",
    description: "Ek (key, value) pair ko 2-tuple ke roop mein remove karo aur return karo.",
  },
  "ref-dictionary-setdefault": {
    title: "setdefault()",
    description: "Key ko default value ke saath insert karo agar key dictionary mein nahi hai.",
  },
  "ref-dictionary-update": {
    title: "update()",
    description: "D.update([E, ]**F) -> None.",
  },
  "ref-dictionary-values": {
    title: "values()",
    description: "D.values() -> ek object jo D ke values par view deta hai",
  },
  "python-ref-tuple": {
    title: "Python ke Tuple Methods",
    description: "Tuple methods — har method jo tum tuple par call kar sakte ho.",
  },
  "ref-tuple-count": {
    title: "count()",
    description: "Value ke occurrences ki ginti return karo.",
  },
  "ref-tuple-index": {
    title: "index()",
    description: "Value ka pehla index return karo.",
  },
  "python-ref-set": {
    title: "Python ke Set Methods",
    description: "Set methods — har method jo tum set par call kar sakte ho.",
  },
  "ref-set-add": {
    title: "add()",
    description: "Set mein ek element add karo.",
  },
  "ref-set-clear": {
    title: "clear()",
    description: "Is set se saare elements hatao.",
  },
  "ref-set-copy": {
    title: "copy()",
    description: "Set ki shallow copy return karo.",
  },
  "ref-set-difference": {
    title: "difference()",
    description: "Do ya zyada sets ka difference ek naye set ke roop mein return karo.",
  },
  "ref-set-difference-update": {
    title: "difference_update()",
    description: "difference_update() — example neeche dekho.",
  },
  "ref-set-discard": {
    title: "discard()",
    description: "Set se ek element remove karo agar woh uska member hai.",
  },
  "ref-set-intersection": {
    title: "intersection()",
    description: "Do sets ka intersection ek naye set ke roop mein return karo.",
  },
  "ref-set-intersection-update": {
    title: "intersection_update()",
    description: "intersection_update() — example neeche dekho.",
  },
  "ref-set-isdisjoint": {
    title: "isdisjoint()",
    description: "True return karo agar do sets ka intersection null hai.",
  },
  "ref-set-issubset": {
    title: "issubset()",
    description: "Test karo ki set ka har element other mein hai ya nahi.",
  },
  "ref-set-lessthan": {
    title: "<",
    description: "< check karta hai ki ek set doosre set ka proper subset hai ya nahi.",
  },
  "ref-set-issuperset": {
    title: "issuperset()",
    description: "Test karo ki other ka har element set mein hai ya nahi.",
  },
  "ref-set-greaterthan": {
    title: ">",
    description: "> check karta hai ki ek set doosre set ka proper superset hai ya nahi.",
  },
  "ref-set-pop": {
    title: "pop()",
    description: "Ek arbitrary set element remove karo aur return karo.",
  },
  "ref-set-remove": {
    title: "remove()",
    description: "Set se ek element remove karo; woh uska member hona chahiye.",
  },
  "ref-set-symmetric-difference": {
    title: "symmetric_difference()",
    description: "symmetric_difference() — example neeche dekho.",
  },
  "ref-set-symmetric-difference-update": {
    title: "symmetric_difference_update()",
    description: "symmetric_difference_update() — example neeche dekho.",
  },
  "ref-set-union": {
    title: "union()",
    description: "Sets ka union ek naye set ke roop mein return karo.",
  },
  "ref-set-update": {
    title: "update()",
    description: "Set ko khud aur others ke union se update karo.",
  },
  "python-reference": {
    title: "Python ka Overview",
    description: "Python Reference — har built-in function, method, keyword aur exception ek hi jagah.",
  },
  "python-ref-file": {
    title: "Python ke File Methods",
    description: "File methods — har method jo tum ek khuli hui file object par call kar sakte ho.",
  },
  "ref-file-close": {
    title: "close()",
    description: "IO object ko close karo.",
  },
  "ref-file-fileno": {
    title: "fileno()",
    description: "Underlying file descriptor return karo agar woh exist karta hai.",
  },
  "ref-file-flush": {
    title: "flush()",
    description: "Write buffers ko flush karo, agar applicable ho.",
  },
  "ref-file-isatty": {
    title: "isatty()",
    description: "Return karo ki ye 'interactive' stream hai ya nahi.",
  },
  "ref-file-read": {
    title: "read()",
    description: "Zyada se zyada size characters padho, string ke roop mein returned.",
  },
  "ref-file-readable": {
    title: "readable()",
    description: "True return karta hai agar IO object ko padha ja sakta hai.",
  },
  "ref-file-readline": {
    title: "readline()",
    description: "Newline ya EOF tak padho.",
  },
  "ref-file-readlines": {
    title: "readlines()",
    description: "Stream se lines ki list return karo.",
  },
  "ref-file-seek": {
    title: "seek()",
    description: "Stream ki position badlo.",
  },
  "ref-file-seekable": {
    title: "seekable()",
    description: "True return karta hai agar IO object ko seek kiya ja sakta hai.",
  },
  "ref-file-tell": {
    title: "tell()",
    description: "Current file position batao.",
  },
  "ref-file-truncate": {
    title: "truncate()",
    description: "Size ko pos tak truncate karo.",
  },
  "ref-file-writable": {
    title: "writable()",
    description: "True return karta hai agar IO object ko likha ja sakta hai.",
  },
  "ref-file-write": {
    title: "write()",
    description: "File mein string likho.",
  },
  "ref-file-writelines": {
    title: "writelines()",
    description: "Stream mein lines ki list likho.",
  },
  "python-ref-keywords": {
    title: "Python ke Keywords",
    description: "Python keywords — reserved words jinse language banti hai.",
  },
  "ref-keyword-and": {
    title: "and",
    description: "and ek logical operator hai — True tabhi jab dono sides True hon.",
  },
  "ref-keyword-as": {
    title: "as",
    description: "as imported module ya caught exception ko ek alag naam deta hai.",
  },
  "ref-keyword-assert": {
    title: "assert",
    description: "assert ek condition check karta hai — agar woh False ho, to Python AssertionError raise karta hai.",
  },
  "ref-keyword-async": {
    title: "async",
    description: "async ek function ko asynchronous mark karta hai — woh ek coroutine return karta hai jise tum await se chalate ho.",
  },
  "ref-keyword-await": {
    title: "await",
    description: "await ek async function ko rokta hai jab tak woh cheez jiska woh wait kar raha hai, khatam na ho jaye.",
  },
  "ref-keyword-break": {
    title: "break",
    description: "break sabse nazdeek wale loop se turant bahar nikal jata hai.",
  },
  "ref-keyword-case": {
    title: "case",
    description: "case ek match statement ki ek branch hai — woh tab chalti hai jab uska pattern fit ho.",
  },
  "ref-keyword-class": {
    title: "class",
    description: "class ek nayi class define karta hai — objects ke liye ek blueprint.",
  },
  "ref-keyword-continue": {
    title: "continue",
    description: "continue current loop round ka baaki hissa skip karke agla round shuru karta hai.",
  },
  "ref-keyword-def": {
    title: "def",
    description: "def ek function define karta hai.",
  },
  "ref-keyword-del": {
    title: "del",
    description: "del ek variable, ek item, ya ek slice ko delete karta hai.",
  },
  "ref-keyword-elif": {
    title: "elif",
    description: "elif ek doosri condition hai, jo tabhi check hoti hai jab upar wala if False tha.",
  },
  "ref-keyword-else": {
    title: "else",
    description: "else tab chalta hai jab upar wala if (aur elifs) sab False the.",
  },
  "ref-keyword-except": {
    title: "except",
    description: "except matching try block ke andar raise hui error ko catch karta hai.",
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
    description: "for ek sequence ke har item par ek-ek karke loop karta hai.",
  },
  "ref-keyword-from": {
    title: "from",
    description: "from ek module se specific names import karta hai.",
  },
  "ref-keyword-global": {
    title: "global",
    description: "global kehta hai ki function ke andar wala naam module-level variable ko refer karta hai.",
  },
  "ref-keyword-if": {
    title: "if",
    description: "if apna block tabhi chalata hai jab uski condition True ho.",
  },
  "ref-keyword-import": {
    title: "import",
    description: "import ek module ke names ko tumhare program mein laata hai.",
  },
  "ref-keyword-in": {
    title: "in",
    description: "in membership check karta hai — True jab left side right side ke andar ho.",
  },
  "ref-keyword-is": {
    title: "is",
    description: "is identity check karta hai — True jab dono naam ek hi object ki taraf point karte hon.",
  },
  "ref-keyword-lambda": {
    title: "lambda",
    description: "lambda ek line mein ek chhota anonymous function banata hai.",
  },
  "ref-keyword-match": {
    title: "match",
    description: "match ek value ko patterns se check karta hai aur pehla fit hone wala chalata hai.",
  },
  "ref-keyword-none": {
    title: "None",
    description: "None ka matlab hai 'yahan koi value nahi' — value ki absence.",
  },
  "ref-keyword-nonlocal": {
    title: "nonlocal",
    description: "nonlocal kehta hai ki nested function ke andar wala naam enclosing function ke variable ko refer karta hai.",
  },
  "ref-keyword-not": {
    title: "not",
    description: "not ek boolean ko flip karta hai — True False ban jata hai aur wapas.",
  },
  "ref-keyword-or": {
    title: "or",
    description: "or ek logical operator hai — True jab kam se kam ek side True ho.",
  },
  "ref-keyword-pass": {
    title: "pass",
    description: "pass kuch nahi karta — ek placeholder jahan Python ko ek statement chahiye.",
  },
  "ref-keyword-raise": {
    title: "raise",
    description: "raise jaan-boojhkar ek exception throw karta hai.",
  },
  "ref-keyword-return": {
    title: "return",
    description: "return ek function se value wapas bhejta hai aur use khatam karta hai.",
  },
  "ref-keyword-true": {
    title: "True",
    description: "True 'yes' ke liye boolean value hai.",
  },
  "ref-keyword-try": {
    title: "try",
    description: "try us code ko wrap karta hai jo fail ho sakta hai, taaki except error ko catch kar sake.",
  },
  "ref-keyword-while": {
    title: "while",
    description: "while apna block tab tak repeat karta hai jab tak uski condition True rehti hai.",
  },
  "ref-keyword-with": {
    title: "with",
    description: "with ek resource (jaise file) kholta hai aur block khatam hone par use tumhare liye close kar deta hai.",
  },
  "ref-keyword-yield": {
    title: "yield",
    description: "yield ek generator function ko rokta hai aur caller ko ek value deta hai.",
  },
  "python-ref-exceptions": {
    title: "Python ke Exceptions",
    description: "Python exceptions — woh errors jo Python raise karta hai, aur har ek ka matlab kya hai.",
  },
  "ref-exception-arithmeticerror": {
    title: "ArithmeticError",
    description: "ArithmeticError saare arithmetic errors ka parent hai (ZeroDivisionError, OverflowError, FloatingPointError).",
  },
  "ref-exception-assertionerror": {
    title: "AssertionError",
    description: "AssertionError raise hota hai jab ek assert statement fail ho.",
  },
  "ref-exception-attributeerror": {
    title: "AttributeError",
    description: "AttributeError raise hota hai jab tum ek attribute ya method access karte ho jo exist nahi karta.",
  },
  "ref-exception-exception": {
    title: "Exception",
    description: "Exception lagbhag har error ka parent hai jise tum catch karoge.",
  },
  "ref-exception-eoferror": {
    title: "EOFError",
    description: "EOFError raise hota hai jab input() ya read file ke end par pahunch jaye aur kuch bacha na ho.",
  },
  "ref-exception-floatingpointerror": {
    title: "FloatingPointError",
    description: "FloatingPointError raise hota hai jab ek float operation fail ho.",
  },
  "ref-exception-generatorexit": {
    title: "GeneratorExit",
    description: "GeneratorExit generator ke andar raise hota hai jab use jaldi close kar diya jaye.",
  },
  "ref-exception-importerror": {
    title: "ImportError",
    description: "ImportError raise hota hai jab import module ko dhoondh na paye.",
  },
  "ref-exception-indentationerror": {
    title: "IndentationError",
    description: "IndentationError raise hota hai jab kisi block ki indentation galat ho.",
  },
  "ref-exception-indexerror": {
    title: "IndexError",
    description: "IndexError raise hota hai jab list ya tuple ka index range se bahar ho.",
  },
  "ref-exception-keyerror": {
    title: "KeyError",
    description: "KeyError raise hota hai jab dictionary key exist nahi karti.",
  },
  "ref-exception-keyboardinterrupt": {
    title: "KeyboardInterrupt",
    description: "KeyboardInterrupt raise hota hai jab user Ctrl+C dabata hai.",
  },
  "ref-exception-lookuperror": {
    title: "LookupError",
    description: "LookupError IndexError aur KeyError ka parent hai.",
  },
  "ref-exception-memoryerror": {
    title: "MemoryError",
    description: "MemoryError raise hota hai jab Python ki memory khatam ho jaye.",
  },
  "ref-exception-nameerror": {
    title: "NameError",
    description: "NameError raise hota hai jab tum ek variable use karte ho jo kabhi define hi nahi hua.",
  },
  "ref-exception-notimplementederror": {
    title: "NotImplementedError",
    description: "NotImplementedError ye kehne ke liye raise hota hai ki 'ye hissa abhi likha nahi gaya'.",
  },
  "ref-exception-oserror": {
    title: "OSError",
    description: "OSError raise hota hai jab operating system kuch refuse kare (missing file, no permission).",
  },
  "ref-exception-overflowerror": {
    title: "OverflowError",
    description: "OverflowError raise hota hai jab ek number apne type ke liye bahut bada ho.",
  },
  "ref-exception-referenceerror": {
    title: "ReferenceError",
    description: "ReferenceError raise hota hai jab ek weak reference us object ki taraf point kare jo pehle hi chala gaya ho.",
  },
  "ref-exception-runtimeerror": {
    title: "RuntimeError",
    description: "RuntimeError run time par kuch galat hone ke liye ek general error hai.",
  },
  "ref-exception-stopiteration": {
    title: "StopIteration",
    description: "StopIteration next() se raise hota hai jab iterator khatam ho jaye.",
  },
  "ref-exception-syntaxerror": {
    title: "SyntaxError",
    description: "SyntaxError raise hota hai jab code khud valid Python na ho.",
  },
  "ref-exception-taberror": {
    title: "TabError",
    description: "TabError raise hota hai jab indentation mein tabs aur spaces mix ho jayein.",
  },
  "ref-exception-systemerror": {
    title: "SystemError",
    description: "SystemError raise hota hai jab interpreter khud kisi internal problem mein phas jaye.",
  },
  "ref-exception-systemexit": {
    title: "SystemExit",
    description: "SystemExit sys.exit() se raise hota hai — ye program ko khatam karta hai.",
  },
  "ref-exception-typeerror": {
    title: "TypeError",
    description: "TypeError raise hota hai jab ek operation galat type par use ho.",
  },
  "ref-exception-unboundlocalerror": {
    title: "UnboundLocalError",
    description: "UnboundLocalError raise hota hai jab tum ek local variable ko assign karne se pehle padhte ho.",
  },
  "ref-exception-unicodeerror": {
    title: "UnicodeError",
    description: "UnicodeError UnicodeEncodeError, UnicodeDecodeError aur UnicodeTranslateError ka parent hai.",
  },
  "ref-exception-unicodeencodeerror": {
    title: "UnicodeEncodeError",
    description: "UnicodeEncodeError raise hota hai jab text ko bytes mein encode nahi kiya ja sakta.",
  },
  "ref-exception-unicodedecodeerror": {
    title: "UnicodeDecodeError",
    description: "UnicodeDecodeError raise hota hai jab bytes ko text mein decode nahi kiya ja sakta.",
  },
  "ref-exception-unicodetranslateerror": {
    title: "UnicodeTranslateError",
    description: "UnicodeTranslateError raise hota hai jab ek character ko translate nahi kiya ja sakta.",
  },
  "ref-exception-valueerror": {
    title: "ValueError",
    description: "ValueError raise hota hai jab value ka type sahi ho lekin content galat ho.",
  },
  "ref-exception-zerodivisionerror": {
    title: "ZeroDivisionError",
    description: "ZeroDivisionError raise hota hai jab tum zero se divide karte ho.",
  },
  "python-ref-glossary": {
    title: "Python Glossary",
    description: "Python Glossary — woh words jo Python developers use karte hain, har ek ek line mein samjhaya gaya.",
  },
};
