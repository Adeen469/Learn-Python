import type { ReferenceTranslations } from "../types";
export const TRANSLATIONS: ReferenceTranslations = {
  "python-ref-functions": {
    title: "Python 内置函数",
    description: "Python 的内置函数——随时可用，无需导入。",
  },
  "ref-func-abs": {
    title: "abs()",
    description: "返回参数的绝对值。",
  },
  "ref-func-all": {
    title: "all()",
    description: "如果可迭代对象中所有值 x 的 bool(x) 都为 True，则返回 True。",
  },
  "ref-func-any": {
    title: "any()",
    description: "如果可迭代对象中任意 x 的 bool(x) 为 True，则返回 True。",
  },
  "ref-func-ascii": {
    title: "ascii()",
    description: "返回对象的仅含 ASCII 字符的表示形式。",
  },
  "ref-func-bin": {
    title: "bin()",
    description: "返回整数的二进制表示形式。",
  },
  "ref-func-bool": {
    title: "bool()",
    description: "bool(x) -> bool 当参数 x 为真时返回 True，否则返回 False。",
  },
  "ref-func-bytearray": {
    title: "bytearray()",
    description: "bytearray(iterable_of_ints) -> bytearray bytearray(string, encoding[, errors]) -> bytearray bytearray(bytes_or_buffer) -> bytes_or_buffer 的可变副本 bytearray(int) -> 大小由参数 initi 指定的字节数组",
  },
  "ref-func-bytes": {
    title: "bytes()",
    description: "bytes(iterable_of_ints) -> bytes bytes(string, encoding[, errors]) -> bytes bytes(bytes_or_buffer) -> bytes_or_buffer 的不可变副本 bytes(int) -> 大小由参数指定、用空字节初始化的 bytes 对象",
  },
  "ref-func-callable": {
    title: "callable()",
    description: "返回对象是否可调用（即某种函数）。",
  },
  "ref-func-chr": {
    title: "chr()",
    description: "返回一个 Unicode 字符串，包含序号为 i 的单个字符；0 <= i <= 0x10ffff。",
  },
  "ref-func-compile": {
    title: "compile()",
    description: "把源代码编译成可由 exec() 或 eval() 执行的代码对象。",
  },
  "ref-func-complex": {
    title: "complex()",
    description: "由实部和可选的虚部创建一个复数。",
  },
  "ref-func-delattr": {
    title: "delattr()",
    description: "删除给定对象的指定属性。",
  },
  "ref-func-dict": {
    title: "dict()",
    description: "dict() -> 新的空字典 dict(mapping) -> 由映射对象的（键，值）对初始化的新字典 dict(iterable) -> 新字典，初始化方式相当于：d = {} for k, v in iterable: d[k] = v dict(**k",
  },
  "ref-func-dir": {
    title: "dir()",
    description: "显示对象的属性。",
  },
  "ref-func-divmod": {
    title: "divmod()",
    description: "返回元组 (x//y, x%y)。",
  },
  "ref-func-enumerate": {
    title: "enumerate()",
    description: "返回一个 enumerate 对象。",
  },
  "ref-func-eval": {
    title: "eval()",
    description: "在 globals 和 locals 的上下文中求值给定的源代码。",
  },
  "ref-func-exec": {
    title: "exec()",
    description: "在 globals 和 locals 的上下文中执行给定的源代码。",
  },
  "ref-func-filter": {
    title: "filter()",
    description: "filter(function or None, iterable) --> filter 对象 返回一个迭代器，产生可迭代对象中使 function(item) 为真的那些项。",
  },
  "ref-func-float": {
    title: "float()",
    description: "如果可能，把字符串或数字转换为浮点数。",
  },
  "ref-func-format": {
    title: "format()",
    description: "返回 type(value).__format__(value, format_spec)。许多内置类型都按照格式规范迷你语言（Format Specification Mini-language）实现 format_spec。",
  },
  "ref-func-frozenset": {
    title: "frozenset()",
    description: "frozenset() -> 空 frozenset 对象 frozenset(iterable) -> frozenset 对象 构建一个不可变无序的唯一元素集合。",
  },
  "ref-func-getattr": {
    title: "getattr()",
    description: "获取对象的指定属性。",
  },
  "ref-func-globals": {
    title: "globals()",
    description: "返回包含当前作用域全局变量的字典。",
  },
  "ref-func-hasattr": {
    title: "hasattr()",
    description: "返回对象是否具有指定名称的属性。",
  },
  "ref-func-hex": {
    title: "hex()",
    description: "返回整数的十六进制表示形式。",
  },
  "ref-func-id": {
    title: "id()",
    description: "返回对象的标识。",
  },
  "ref-func-input": {
    title: "input()",
    description: "从标准输入读取一个字符串。",
  },
  "ref-func-int": {
    title: "int()",
    description: "int([x]) -> 整数 int(x, base=10) -> 整数 把数字或字符串转换为整数；如果没有给出参数，则返回 0。",
  },
  "ref-func-isinstance": {
    title: "isinstance()",
    description: "返回对象是否为某个类或其子类的实例。",
  },
  "ref-func-issubclass": {
    title: "issubclass()",
    description: "返回 'cls' 是否派生自另一个类，或与之相同。",
  },
  "ref-func-iter": {
    title: "iter()",
    description: "从对象获取一个迭代器。",
  },
  "ref-func-len": {
    title: "len()",
    description: "返回容器中元素的个数。",
  },
  "ref-func-list": {
    title: "list()",
    description: "内置可变序列。",
  },
  "ref-func-locals": {
    title: "locals()",
    description: "返回包含当前作用域局部变量的字典。",
  },
  "ref-func-map": {
    title: "map()",
    description: "map(func, *iterables) --> map 对象 生成一个迭代器，用来自每个可迭代对象的参数计算函数。",
  },
  "ref-func-max": {
    title: "max()",
    description: "max(iterable, *[, default=obj, key=func]) -> value max(arg1, arg2, *args, *[, key=func]) -> value 使用单个可迭代对象参数时，返回其中最大的项。",
  },
  "ref-func-memoryview": {
    title: "memoryview()",
    description: "创建一个新的 memoryview 对象，引用给定的对象。",
  },
  "ref-func-min": {
    title: "min()",
    description: "min(iterable, *[, default=obj, key=func]) -> value min(arg1, arg2, *args, *[, key=func]) -> value 使用单个可迭代对象参数时，返回其中最小的项。",
  },
  "ref-func-next": {
    title: "next()",
    description: "返回迭代器的下一项。",
  },
  "ref-func-object": {
    title: "object()",
    description: "类层次结构的基类。",
  },
  "ref-func-oct": {
    title: "oct()",
    description: "返回整数的八进制表示形式。",
  },
  "ref-func-open": {
    title: "open()",
    description: "打开文件并返回一个流。",
  },
  "ref-func-ord": {
    title: "ord()",
    description: "返回单字符字符串的 Unicode 码位。",
  },
  "ref-func-pow": {
    title: "pow()",
    description: "相当于带 2 个参数的 base**exp，或带 3 个参数的 base**exp % mod。某些类型（例如整数）在使用三参数形式调用时能够使用更高效的算法。",
  },
  "ref-func-print": {
    title: "print()",
    description: "把值打印到流，默认打印到 sys.stdout。",
  },
  "ref-func-range": {
    title: "range()",
    description: "range(stop) -> range 对象 range(start, stop[, step]) -> range 对象 返回一个对象，按步长 step 生成从 start（含）到 stop（不含）的整数序列。",
  },
  "ref-func-reversed": {
    title: "reversed()",
    description: "返回给定序列的值的反向迭代器。",
  },
  "ref-func-round": {
    title: "round()",
    description: "把数字四舍五入到给定的小数位数精度。",
  },
  "ref-func-set": {
    title: "set()",
    description: "set() -> 新的空集合对象 set(iterable) -> 新的集合对象 构建一个无序的唯一元素集合。",
  },
  "ref-func-setattr": {
    title: "setattr()",
    description: "把给定对象的指定属性设置为指定的值。",
  },
  "ref-func-slice": {
    title: "slice()",
    description: "slice(stop) slice(start, stop[, step]) 创建一个 slice 对象。",
  },
  "ref-func-sorted": {
    title: "sorted()",
    description: "返回一个新列表，包含可迭代对象中按升序排列的所有项。",
  },
  "ref-func-str": {
    title: "str()",
    description: "str(object='') -> str str(bytes_or_buffer[, encoding[, errors]]) -> str 由给定的对象创建一个新的字符串对象。",
  },
  "ref-func-sum": {
    title: "sum()",
    description: "返回 'start' 值（默认为 0）加上一串数字之和。当可迭代对象为空时，返回 start 值。",
  },
  "ref-func-super": {
    title: "super()",
    description: "super() -> 等同于 super(__class__, <第一个参数>) super(type) -> 未绑定的 super 对象 super(type, obj) -> 已绑定的 super 对象；要求 isinstance(obj, type) super(type, type2) -> 已绑定的 super 对象；要求 issubcla",
  },
  "ref-func-tuple": {
    title: "tuple()",
    description: "内置不可变序列。",
  },
  "ref-func-type": {
    title: "type()",
    description: "type(object) -> 对象的类型 type(name, bases, dict, **kwds) -> 一个新的类型",
  },
  "ref-func-vars": {
    title: "vars()",
    description: "显示 vars。",
  },
  "ref-func-zip": {
    title: "zip()",
    description: "zip(*iterables, strict=False) --> 产生元组，直到某个输入耗尽。",
  },
  "python-ref-string": {
    title: "Python 字符串方法",
    description: "字符串方法——可以在 str 上调用的所有方法。",
  },
  "ref-string-capitalize": {
    title: "capitalize()",
    description: "返回字符串的首字母大写版本。",
  },
  "ref-string-casefold": {
    title: "casefold()",
    description: "返回适合不区分大小写比较的字符串版本。",
  },
  "ref-string-center": {
    title: "center()",
    description: "返回长度为 width 的居中字符串。",
  },
  "ref-string-count": {
    title: "count()",
    description: "S.count(sub[, start[, end]]) -> int 返回字符串 S[start:end] 中子字符串 sub 的不重叠出现次数。",
  },
  "ref-string-encode": {
    title: "encode()",
    description: "使用为编码注册的编解码器对字符串进行编码。",
  },
  "ref-string-endswith": {
    title: "endswith()",
    description: "S.endswith(suffix[, start[, end]]) -> bool 如果 S 以指定的后缀结尾则返回 True，否则返回 False。",
  },
  "ref-string-expandtabs": {
    title: "expandtabs()",
    description: "返回一个副本，其中所有制表符都已用空格展开。",
  },
  "ref-string-find": {
    title: "find()",
    description: "S.find(sub[, start[, end]]) -> int 返回 S 中子字符串 sub 出现的最小编号索引，且 sub 包含在 S[start:end] 之内。",
  },
  "ref-string-format": {
    title: "format()",
    description: "S.format(*args, **kwargs) -> str 使用来自 args 和 kwargs 的替换值，返回 S 的格式化版本。",
  },
  "ref-string-format-map": {
    title: "format_map()",
    description: "format_map()——见下面的示例。",
  },
  "ref-string-index": {
    title: "index()",
    description: "S.index(sub[, start[, end]]) -> int 返回 S 中子字符串 sub 出现的最小编号索引，且 sub 包含在 S[start:end] 之内。",
  },
  "ref-string-isalnum": {
    title: "isalnum()",
    description: "如果字符串是字母数字字符串则返回 True，否则返回 False。",
  },
  "ref-string-isalpha": {
    title: "isalpha()",
    description: "如果字符串是字母字符串则返回 True，否则返回 False。",
  },
  "ref-string-isascii": {
    title: "isascii()",
    description: "如果字符串中的所有字符都是 ASCII 字符则返回 True，否则返回 False。",
  },
  "ref-string-isdecimal": {
    title: "isdecimal()",
    description: "如果字符串是十进制字符串则返回 True，否则返回 False。",
  },
  "ref-string-isdigit": {
    title: "isdigit()",
    description: "如果字符串是数字字符串则返回 True，否则返回 False。",
  },
  "ref-string-isidentifier": {
    title: "isidentifier()",
    description: "如果字符串是有效的 Python 标识符则返回 True，否则返回 False。",
  },
  "ref-string-islower": {
    title: "islower()",
    description: "如果字符串是小写字符串则返回 True，否则返回 False。",
  },
  "ref-string-isnumeric": {
    title: "isnumeric()",
    description: "如果字符串是数值字符串则返回 True，否则返回 False。",
  },
  "ref-string-isprintable": {
    title: "isprintable()",
    description: "如果字符串是可打印的则返回 True，否则返回 False。",
  },
  "ref-string-isspace": {
    title: "isspace()",
    description: "如果字符串是空白字符串则返回 True，否则返回 False。",
  },
  "ref-string-istitle": {
    title: "istitle()",
    description: "如果字符串是标题格式的字符串则返回 True，否则返回 False。",
  },
  "ref-string-isupper": {
    title: "isupper()",
    description: "如果字符串是大写字符串则返回 True，否则返回 False。",
  },
  "ref-string-join": {
    title: "join()",
    description: "连接任意数量的字符串。",
  },
  "ref-string-ljust": {
    title: "ljust()",
    description: "返回长度为 width 的左对齐字符串。",
  },
  "ref-string-lower": {
    title: "lower()",
    description: "返回字符串转换为小写后的副本。",
  },
  "ref-string-lstrip": {
    title: "lstrip()",
    description: "返回去除前导空白后的字符串副本。",
  },
  "ref-string-maketrans": {
    title: "maketrans()",
    description: "返回一个可用于 str.translate() 的转换表。",
  },
  "ref-string-partition": {
    title: "partition()",
    description: "使用给定的分隔符把字符串分成三部分。",
  },
  "ref-string-replace": {
    title: "replace()",
    description: "返回一个副本，其中子字符串 old 的所有出现都被替换为 new。",
  },
  "ref-string-rfind": {
    title: "rfind()",
    description: "S.rfind(sub[, start[, end]]) -> int 返回 S 中子字符串 sub 出现的最大编号索引，且 sub 包含在 S[start:end] 之内。",
  },
  "ref-string-rindex": {
    title: "rindex()",
    description: "S.rindex(sub[, start[, end]]) -> int 返回 S 中子字符串 sub 出现的最大编号索引，且 sub 包含在 S[start:end] 之内。",
  },
  "ref-string-rjust": {
    title: "rjust()",
    description: "返回长度为 width 的右对齐字符串。",
  },
  "ref-string-rpartition": {
    title: "rpartition()",
    description: "使用给定的分隔符把字符串分成三部分。",
  },
  "ref-string-rsplit": {
    title: "rsplit()",
    description: "返回字符串中的子字符串列表，使用 sep 作为分隔字符串。",
  },
  "ref-string-rstrip": {
    title: "rstrip()",
    description: "返回去除尾随空白后的字符串副本。",
  },
  "ref-string-split": {
    title: "split()",
    description: "返回字符串中的子字符串列表，使用 sep 作为分隔字符串。",
  },
  "ref-string-splitlines": {
    title: "splitlines()",
    description: "返回字符串中的行列表，在行边界处断开。",
  },
  "ref-string-startswith": {
    title: "startswith()",
    description: "S.startswith(prefix[, start[, end]]) -> bool 如果 S 以指定的前缀开头则返回 True，否则返回 False。",
  },
  "ref-string-strip": {
    title: "strip()",
    description: "返回去除前导和尾随空白后的字符串副本。",
  },
  "ref-string-swapcase": {
    title: "swapcase()",
    description: "把大写字符转换为小写，把小写字符转换为大写。",
  },
  "ref-string-title": {
    title: "title()",
    description: "返回字符串的每个单词都转为标题格式的版本。",
  },
  "ref-string-translate": {
    title: "translate()",
    description: "使用给定的转换表替换字符串中的每个字符。",
  },
  "ref-string-upper": {
    title: "upper()",
    description: "返回字符串转换为大写后的副本。",
  },
  "ref-string-zfill": {
    title: "zfill()",
    description: "在数字字符串左侧用零填充，以填满给定宽度的字段。",
  },
  "python-ref-list": {
    title: "Python 列表方法",
    description: "列表方法——可以在列表上调用的所有方法。",
  },
  "ref-list-append": {
    title: "append()",
    description: "把对象追加到列表末尾。",
  },
  "ref-list-clear": {
    title: "clear()",
    description: "删除列表中的所有项。",
  },
  "ref-list-copy": {
    title: "copy()",
    description: "返回列表的浅拷贝。",
  },
  "ref-list-count": {
    title: "count()",
    description: "返回 value 出现的次数。",
  },
  "ref-list-extend": {
    title: "extend()",
    description: "通过追加来自可迭代对象的元素来扩展列表。",
  },
  "ref-list-index": {
    title: "index()",
    description: "返回 value 的第一个索引。",
  },
  "ref-list-insert": {
    title: "insert()",
    description: "在 index 之前插入对象。",
  },
  "ref-list-pop": {
    title: "pop()",
    description: "删除并返回位于 index 处的项（默认为最后一项）。",
  },
  "ref-list-remove": {
    title: "remove()",
    description: "删除 value 的第一次出现。",
  },
  "ref-list-reverse": {
    title: "reverse()",
    description: "原地反转。",
  },
  "ref-list-sort": {
    title: "sort()",
    description: "按升序对列表排序并返回 None。",
  },
  "python-ref-dictionary": {
    title: "Python 字典方法",
    description: "字典方法——可以在字典上调用的所有方法。",
  },
  "ref-dictionary-clear": {
    title: "clear()",
    description: "D.clear() -> None。",
  },
  "ref-dictionary-copy": {
    title: "copy()",
    description: "D.copy() -> D 的一个浅拷贝",
  },
  "ref-dictionary-fromkeys": {
    title: "fromkeys()",
    description: "用来自可迭代对象的键和设置为 value 的值创建一个新字典。",
  },
  "ref-dictionary-get": {
    title: "get()",
    description: "如果 key 在字典中，返回 key 对应的值，否则返回默认值。",
  },
  "ref-dictionary-items": {
    title: "items()",
    description: "D.items() -> 一个提供 D 的项的视图的类集合对象",
  },
  "ref-dictionary-keys": {
    title: "keys()",
    description: "D.keys() -> 一个提供 D 的键的视图的类集合对象",
  },
  "ref-dictionary-pop": {
    title: "pop()",
    description: "D.pop(k[,d]) -> v，删除指定的键并返回对应的值。",
  },
  "ref-dictionary-popitem": {
    title: "popitem()",
    description: "删除并返回一个（键，值）对，作为一个二元组。",
  },
  "ref-dictionary-setdefault": {
    title: "setdefault()",
    description: "如果 key 不在字典中，则插入 key 并将其值设为默认值。",
  },
  "ref-dictionary-update": {
    title: "update()",
    description: "D.update([E, ]**F) -> None。",
  },
  "ref-dictionary-values": {
    title: "values()",
    description: "D.values() -> 一个提供 D 的值的视图的对象",
  },
  "python-ref-tuple": {
    title: "Python 元组方法",
    description: "元组方法——可以在元组上调用的所有方法。",
  },
  "ref-tuple-count": {
    title: "count()",
    description: "返回 value 出现的次数。",
  },
  "ref-tuple-index": {
    title: "index()",
    description: "返回 value 的第一个索引。",
  },
  "python-ref-set": {
    title: "Python 集合方法",
    description: "集合方法——可以在集合上调用的所有方法。",
  },
  "ref-set-add": {
    title: "add()",
    description: "向集合中添加一个元素。",
  },
  "ref-set-clear": {
    title: "clear()",
    description: "删除该集合中的所有元素。",
  },
  "ref-set-copy": {
    title: "copy()",
    description: "返回集合的浅拷贝。",
  },
  "ref-set-difference": {
    title: "difference()",
    description: "返回两个或多个集合的差集，作为一个新集合。",
  },
  "ref-set-difference-update": {
    title: "difference_update()",
    description: "difference_update()——见下面的示例。",
  },
  "ref-set-discard": {
    title: "discard()",
    description: "如果元素是集合的成员，则从集合中删除它。",
  },
  "ref-set-intersection": {
    title: "intersection()",
    description: "返回两个集合的交集，作为一个新集合。",
  },
  "ref-set-intersection-update": {
    title: "intersection_update()",
    description: "intersection_update()——见下面的示例。",
  },
  "ref-set-isdisjoint": {
    title: "isdisjoint()",
    description: "如果两个集合的交集为空，则返回 True。",
  },
  "ref-set-issubset": {
    title: "issubset()",
    description: "测试集合中的每个元素是否都在 other 中。",
  },
  "ref-set-lessthan": {
    title: "<",
    description: "< 检查一个集合是否为另一个集合的真子集。",
  },
  "ref-set-issuperset": {
    title: "issuperset()",
    description: "测试 other 中的每个元素是否都在该集合中。",
  },
  "ref-set-greaterthan": {
    title: ">",
    description: "> 检查一个集合是否为另一个集合的真超集。",
  },
  "ref-set-pop": {
    title: "pop()",
    description: "删除并返回一个任意的集合元素。",
  },
  "ref-set-remove": {
    title: "remove()",
    description: "从集合中删除一个元素；它必须是集合的成员。",
  },
  "ref-set-symmetric-difference": {
    title: "symmetric_difference()",
    description: "symmetric_difference()——见下面的示例。",
  },
  "ref-set-symmetric-difference-update": {
    title: "symmetric_difference_update()",
    description: "symmetric_difference_update()——见下面的示例。",
  },
  "ref-set-union": {
    title: "union()",
    description: "返回多个集合的并集，作为一个新集合。",
  },
  "ref-set-update": {
    title: "update()",
    description: "用该集合自身与其他的并集更新集合。",
  },
  "python-reference": {
    title: "Python 概览",
    description: "Python 参考——所有内置函数、方法、关键字和异常都汇集于此。",
  },
  "python-ref-file": {
    title: "Python 文件方法",
    description: "文件方法——可以在打开的文件对象上调用的所有方法。",
  },
  "ref-file-close": {
    title: "close()",
    description: "关闭 IO 对象。",
  },
  "ref-file-fileno": {
    title: "fileno()",
    description: "如果存在底层文件描述符，则返回它。",
  },
  "ref-file-flush": {
    title: "flush()",
    description: "如果适用，刷新写入缓冲区。",
  },
  "ref-file-isatty": {
    title: "isatty()",
    description: "返回这是否为一个“交互式”流。",
  },
  "ref-file-read": {
    title: "read()",
    description: "最多读取 size 个字符，以字符串形式返回。",
  },
  "ref-file-readable": {
    title: "readable()",
    description: "如果该 IO 对象可读，则返回 True。",
  },
  "ref-file-readline": {
    title: "readline()",
    description: "读取到换行符或文件末尾。",
  },
  "ref-file-readlines": {
    title: "readlines()",
    description: "返回流中的行列表。",
  },
  "ref-file-seek": {
    title: "seek()",
    description: "改变流的位置。",
  },
  "ref-file-seekable": {
    title: "seekable()",
    description: "如果该 IO 对象可以定位，则返回 True。",
  },
  "ref-file-tell": {
    title: "tell()",
    description: "告知当前文件位置。",
  },
  "ref-file-truncate": {
    title: "truncate()",
    description: "把大小截断到 pos。",
  },
  "ref-file-writable": {
    title: "writable()",
    description: "如果该 IO 对象可写，则返回 True。",
  },
  "ref-file-write": {
    title: "write()",
    description: "把字符串写入文件。",
  },
  "ref-file-writelines": {
    title: "writelines()",
    description: "把行列表写入流。",
  },
  "python-ref-keywords": {
    title: "Python 关键字",
    description: "Python 关键字——构成这门语言的保留字。",
  },
  "ref-keyword-and": {
    title: "and",
    description: "and 是一个逻辑运算符——只有当两边都为 True 时才为 True。",
  },
  "ref-keyword-as": {
    title: "as",
    description: "as 给导入的模块或捕获的异常起一个不同的名字。",
  },
  "ref-keyword-assert": {
    title: "assert",
    description: "assert 检查一个条件——如果它为 False，Python 会引发 AssertionError。",
  },
  "ref-keyword-async": {
    title: "async",
    description: "async 把一个函数标记为异步函数——它返回一个用 await 运行的协程。",
  },
  "ref-keyword-await": {
    title: "await",
    description: "await 暂停一个异步函数，直到它等待的事物完成。",
  },
  "ref-keyword-break": {
    title: "break",
    description: "break 立即退出最近的循环。",
  },
  "ref-keyword-case": {
    title: "case",
    description: "case 是 match 语句的一个分支——当它的模式匹配时运行。",
  },
  "ref-keyword-class": {
    title: "class",
    description: "class 定义一个新类——对象的蓝图。",
  },
  "ref-keyword-continue": {
    title: "continue",
    description: "continue 跳过当前循环轮次的剩余部分，开始下一轮。",
  },
  "ref-keyword-def": {
    title: "def",
    description: "def 定义一个函数。",
  },
  "ref-keyword-del": {
    title: "del",
    description: "del 删除一个变量、一个项或一个切片。",
  },
  "ref-keyword-elif": {
    title: "elif",
    description: "elif 是第二个条件，只有当上面的 if 为 False 时才检查它。",
  },
  "ref-keyword-else": {
    title: "else",
    description: "else 在上面的 if（和 elif）都为 False 时运行。",
  },
  "ref-keyword-except": {
    title: "except",
    description: "except 捕获匹配的 try 块内引发的错误。",
  },
  "ref-keyword-false": {
    title: "False",
    description: "False 是表示“否”的布尔值。",
  },
  "ref-keyword-finally": {
    title: "finally",
    description: "finally 无论如何都会运行——无论是否出错——在 try 块之后。",
  },
  "ref-keyword-for": {
    title: "for",
    description: "for 一次一个地循环遍历序列中的每一项。",
  },
  "ref-keyword-from": {
    title: "from",
    description: "from 从模块中导入特定的名称。",
  },
  "ref-keyword-global": {
    title: "global",
    description: "global 表示函数内的一个名称指的是模块级变量。",
  },
  "ref-keyword-if": {
    title: "if",
    description: "if 只有当其条件为 True 时才运行其代码块。",
  },
  "ref-keyword-import": {
    title: "import",
    description: "import 把一个模块的名称引入你的程序。",
  },
  "ref-keyword-in": {
    title: "in",
    description: "in 检查成员关系——当左侧在右侧内部时为 True。",
  },
  "ref-keyword-is": {
    title: "is",
    description: "is 检查同一性——当两个名称指向同一个对象时为 True。",
  },
  "ref-keyword-lambda": {
    title: "lambda",
    description: "lambda 用一行代码创建一个小的匿名函数。",
  },
  "ref-keyword-match": {
    title: "match",
    description: "match 把一个值与模式逐一对照，运行第一个匹配的模式。",
  },
  "ref-keyword-none": {
    title: "None",
    description: "None 表示“这里没有值”——值的缺失。",
  },
  "ref-keyword-nonlocal": {
    title: "nonlocal",
    description: "nonlocal 表示嵌套函数内的一个名称指的是外层函数的变量。",
  },
  "ref-keyword-not": {
    title: "not",
    description: "not 翻转布尔值——True 变成 False，反之亦然。",
  },
  "ref-keyword-or": {
    title: "or",
    description: "or 是一个逻辑运算符——当至少一边为 True 时为 True。",
  },
  "ref-keyword-pass": {
    title: "pass",
    description: "pass 什么也不做——在 Python 需要一条语句的地方作为占位符。",
  },
  "ref-keyword-raise": {
    title: "raise",
    description: "raise 故意抛出一个异常。",
  },
  "ref-keyword-return": {
    title: "return",
    description: "return 把一个值送回函数之外并结束函数。",
  },
  "ref-keyword-true": {
    title: "True",
    description: "True 是表示“是”的布尔值。",
  },
  "ref-keyword-try": {
    title: "try",
    description: "try 包裹可能失败的代码，以便 except 捕获错误。",
  },
  "ref-keyword-while": {
    title: "while",
    description: "while 只要其条件保持为 True，就重复执行其代码块。",
  },
  "ref-keyword-with": {
    title: "with",
    description: "with 打开一个资源（如文件），并在代码块结束时替你关闭它。",
  },
  "ref-keyword-yield": {
    title: "yield",
    description: "yield 暂停一个生成器函数，并把一个值交给调用者。",
  },
  "python-ref-exceptions": {
    title: "Python 异常",
    description: "Python 异常——Python 会引发的错误，以及每个错误的含义。",
  },
  "ref-exception-arithmeticerror": {
    title: "ArithmeticError",
    description: "ArithmeticError 是所有算术错误的父类（ZeroDivisionError、OverflowError、FloatingPointError）。",
  },
  "ref-exception-assertionerror": {
    title: "AssertionError",
    description: "当 assert 语句失败时引发 AssertionError。",
  },
  "ref-exception-attributeerror": {
    title: "AttributeError",
    description: "当你访问一个不存在的属性或方法时引发 AttributeError。",
  },
  "ref-exception-exception": {
    title: "Exception",
    description: "Exception 是几乎所有你会捕获的错误的父类。",
  },
  "ref-exception-eoferror": {
    title: "EOFError",
    description: "当 input() 或读取操作到达文件末尾且无内容可读时引发 EOFError。",
  },
  "ref-exception-floatingpointerror": {
    title: "FloatingPointError",
    description: "当浮点运算失败时引发 FloatingPointError。",
  },
  "ref-exception-generatorexit": {
    title: "GeneratorExit",
    description: "当生成器被提前关闭时，在生成器内部引发 GeneratorExit。",
  },
  "ref-exception-importerror": {
    title: "ImportError",
    description: "当导入找不到模块时引发 ImportError。",
  },
  "ref-exception-indentationerror": {
    title: "IndentationError",
    description: "当代码块的缩进错误时引发 IndentationError。",
  },
  "ref-exception-indexerror": {
    title: "IndexError",
    description: "当列表或元组的索引超出范围时引发 IndexError。",
  },
  "ref-exception-keyerror": {
    title: "KeyError",
    description: "当字典键不存在时引发 KeyError。",
  },
  "ref-exception-keyboardinterrupt": {
    title: "KeyboardInterrupt",
    description: "当用户按下 Ctrl+C 时引发 KeyboardInterrupt。",
  },
  "ref-exception-lookuperror": {
    title: "LookupError",
    description: "LookupError 是 IndexError 和 KeyError 的父类。",
  },
  "ref-exception-memoryerror": {
    title: "MemoryError",
    description: "当 Python 内存耗尽时引发 MemoryError。",
  },
  "ref-exception-nameerror": {
    title: "NameError",
    description: "当你使用一个从未定义过的变量时引发 NameError。",
  },
  "ref-exception-notimplementederror": {
    title: "NotImplementedError",
    description: "引发 NotImplementedError 表示“这部分尚未编写”。",
  },
  "ref-exception-oserror": {
    title: "OSError",
    description: "当操作系统拒绝某项操作时引发 OSError（文件缺失、没有权限）。",
  },
  "ref-exception-overflowerror": {
    title: "OverflowError",
    description: "当数字对于其类型来说太大时引发 OverflowError。",
  },
  "ref-exception-referenceerror": {
    title: "ReferenceError",
    description: "当弱引用指向一个已经不存在的对象时引发 ReferenceError。",
  },
  "ref-exception-runtimeerror": {
    title: "RuntimeError",
    description: "RuntimeError 是运行时出现问题时的通用错误。",
  },
  "ref-exception-stopiteration": {
    title: "StopIteration",
    description: "当迭代器结束时，由 next() 引发 StopIteration。",
  },
  "ref-exception-syntaxerror": {
    title: "SyntaxError",
    description: "当代码本身不是有效的 Python 时引发 SyntaxError。",
  },
  "ref-exception-taberror": {
    title: "TabError",
    description: "当缩进中混用制表符和空格时引发 TabError。",
  },
  "ref-exception-systemerror": {
    title: "SystemError",
    description: "当解释器本身遇到内部问题时引发 SystemError。",
  },
  "ref-exception-systemexit": {
    title: "SystemExit",
    description: "由 sys.exit() 引发 SystemExit——它结束程序。",
  },
  "ref-exception-typeerror": {
    title: "TypeError",
    description: "当对错误的类型使用某个操作时引发 TypeError。",
  },
  "ref-exception-unboundlocalerror": {
    title: "UnboundLocalError",
    description: "当你在赋值之前读取一个局部变量时引发 UnboundLocalError。",
  },
  "ref-exception-unicodeerror": {
    title: "UnicodeError",
    description: "UnicodeError 是 UnicodeEncodeError、UnicodeDecodeError 和 UnicodeTranslateError 的父类。",
  },
  "ref-exception-unicodeencodeerror": {
    title: "UnicodeEncodeError",
    description: "当文本无法编码为字节时引发 UnicodeEncodeError。",
  },
  "ref-exception-unicodedecodeerror": {
    title: "UnicodeDecodeError",
    description: "当字节无法解码为文本时引发 UnicodeDecodeError。",
  },
  "ref-exception-unicodetranslateerror": {
    title: "UnicodeTranslateError",
    description: "当某个字符无法转换时引发 UnicodeTranslateError。",
  },
  "ref-exception-valueerror": {
    title: "ValueError",
    description: "当值的类型正确但内容错误时引发 ValueError。",
  },
  "ref-exception-zerodivisionerror": {
    title: "ZeroDivisionError",
    description: "当你除以零时引发 ZeroDivisionError。",
  },
  "python-ref-glossary": {
    title: "Python 术语表",
    description: "Python 术语表——Python 开发者使用的词汇，每词用一句话解释。",
  },
};
