import type { ReferenceTranslations } from "../types";
export const TRANSLATIONS: ReferenceTranslations = {
  "python-ref-functions": {
    title: "Встроенные функции Python",
    description: "Встроенные функции Python — всегда доступны, импорт не нужен.",
  },
  "ref-func-abs": {
    title: "abs()",
    description: "Возвращает абсолютное значение аргумента.",
  },
  "ref-func-all": {
    title: "all()",
    description: "Возвращает True, если bool(x) равен True для всех значений x в итерируемом объекте.",
  },
  "ref-func-any": {
    title: "any()",
    description: "Возвращает True, если bool(x) равен True хотя бы для одного x в итерируемом объекте.",
  },
  "ref-func-ascii": {
    title: "ascii()",
    description: "Возвращает ASCII-представление объекта.",
  },
  "ref-func-bin": {
    title: "bin()",
    description: "Возвращает двоичное представление целого числа.",
  },
  "ref-func-bool": {
    title: "bool()",
    description: "bool(x) -> bool Возвращает True, когда аргумент x истинен, и False в противном случае.",
  },
  "ref-func-bytearray": {
    title: "bytearray()",
    description: "bytearray(iterable_of_ints) -> bytearray bytearray(string, encoding[, errors]) -> bytearray bytearray(bytes_or_buffer) -> изменяемая копия bytes_or_buffer bytearray(int) -> массив байтов размера, заданного параметром initi",
  },
  "ref-func-bytes": {
    title: "bytes()",
    description: "bytes(iterable_of_ints) -> bytes bytes(string, encoding[, errors]) -> bytes bytes(bytes_or_buffer) -> неизменяемая копия bytes_or_buffer bytes(int) -> объект bytes размера, заданного параметром, заполненный нулевыми байтами",
  },
  "ref-func-callable": {
    title: "callable()",
    description: "Возвращает, является ли объект вызываемым (то есть своего рода функцией).",
  },
  "ref-func-chr": {
    title: "chr()",
    description: "Возвращает строку Unicode из одного символа с порядковым номером i; 0 <= i <= 0x10ffff.",
  },
  "ref-func-compile": {
    title: "compile()",
    description: "Компилирует исходный код в объект кода, который можно выполнить с помощью exec() или eval().",
  },
  "ref-func-complex": {
    title: "complex()",
    description: "Создаёт комплексное число из действительной части и необязательной мнимой части.",
  },
  "ref-func-delattr": {
    title: "delattr()",
    description: "Удаляет именованный атрибут из заданного объекта.",
  },
  "ref-func-dict": {
    title: "dict()",
    description: "dict() -> новый пустой словарь dict(mapping) -> новый словарь, инициализированный из пар (ключ, значение) объекта-отображения dict(iterable) -> новый словарь, инициализированный как будто через: d = {} for k, v in iterable: d[k] = v dict(**k",
  },
  "ref-func-dir": {
    title: "dir()",
    description: "Показывает атрибуты объекта.",
  },
  "ref-func-divmod": {
    title: "divmod()",
    description: "Возвращает кортеж (x//y, x%y).",
  },
  "ref-func-enumerate": {
    title: "enumerate()",
    description: "Возвращает объект enumerate.",
  },
  "ref-func-eval": {
    title: "eval()",
    description: "Вычисляет заданный исходный код в контексте globals и locals.",
  },
  "ref-func-exec": {
    title: "exec()",
    description: "Выполняет заданный исходный код в контексте globals и locals.",
  },
  "ref-func-filter": {
    title: "filter()",
    description: "filter(function or None, iterable) --> объект filter Возвращает итератор, выдающий те элементы iterable, для которых function(item) истинна.",
  },
  "ref-func-float": {
    title: "float()",
    description: "Преобразует строку или число в число с плавающей точкой, если это возможно.",
  },
  "ref-func-format": {
    title: "format()",
    description: "Возвращает type(value).__format__(value, format_spec). Многие встроенные типы реализуют format_spec согласно мини-языку спецификации формата.",
  },
  "ref-func-frozenset": {
    title: "frozenset()",
    description: "frozenset() -> пустой объект frozenset frozenset(iterable) -> объект frozenset Создаёт неизменяемую неупорядоченную коллекцию уникальных элементов.",
  },
  "ref-func-getattr": {
    title: "getattr()",
    description: "Получает именованный атрибут из объекта.",
  },
  "ref-func-globals": {
    title: "globals()",
    description: "Возвращает словарь, содержащий глобальные переменные текущей области видимости.",
  },
  "ref-func-hasattr": {
    title: "hasattr()",
    description: "Возвращает, есть ли у объекта атрибут с заданным именем.",
  },
  "ref-func-hex": {
    title: "hex()",
    description: "Возвращает шестнадцатеричное представление целого числа.",
  },
  "ref-func-id": {
    title: "id()",
    description: "Возвращает идентификатор объекта.",
  },
  "ref-func-input": {
    title: "input()",
    description: "Читает строку из стандартного ввода.",
  },
  "ref-func-int": {
    title: "int()",
    description: "int([x]) -> integer int(x, base=10) -> integer Преобразует число или строку в целое число или возвращает 0, если аргументы не заданы.",
  },
  "ref-func-isinstance": {
    title: "isinstance()",
    description: "Возвращает, является ли объект экземпляром класса или подкласса этого класса.",
  },
  "ref-func-issubclass": {
    title: "issubclass()",
    description: "Возвращает, является ли 'cls' производным от другого класса или тем же классом.",
  },
  "ref-func-iter": {
    title: "iter()",
    description: "Получает итератор из объекта.",
  },
  "ref-func-len": {
    title: "len()",
    description: "Возвращает количество элементов в контейнере.",
  },
  "ref-func-list": {
    title: "list()",
    description: "Встроенная изменяемая последовательность.",
  },
  "ref-func-locals": {
    title: "locals()",
    description: "Возвращает словарь, содержащий локальные переменные текущей области видимости.",
  },
  "ref-func-map": {
    title: "map()",
    description: "map(func, *iterables) --> объект map Создаёт итератор, вычисляющий функцию с аргументами из каждого итерируемого объекта.",
  },
  "ref-func-max": {
    title: "max()",
    description: "max(iterable, *[, default=obj, key=func]) -> value max(arg1, arg2, *args, *[, key=func]) -> value С одним итерируемым аргументом возвращает его наибольший элемент.",
  },
  "ref-func-memoryview": {
    title: "memoryview()",
    description: "Создаёт новый объект memoryview, ссылающийся на заданный объект.",
  },
  "ref-func-min": {
    title: "min()",
    description: "min(iterable, *[, default=obj, key=func]) -> value min(arg1, arg2, *args, *[, key=func]) -> value С одним итерируемым аргументом возвращает его наименьший элемент.",
  },
  "ref-func-next": {
    title: "next()",
    description: "Возвращает следующий элемент из итератора.",
  },
  "ref-func-object": {
    title: "object()",
    description: "Базовый класс иерархии классов.",
  },
  "ref-func-oct": {
    title: "oct()",
    description: "Возвращает восьмеричное представление целого числа.",
  },
  "ref-func-open": {
    title: "open()",
    description: "Открывает файл и возвращает поток.",
  },
  "ref-func-ord": {
    title: "ord()",
    description: "Возвращает кодовую точку Unicode для односимвольной строки.",
  },
  "ref-func-pow": {
    title: "pow()",
    description: "Эквивалентно base**exp с 2 аргументами или base**exp % mod с 3 аргументами. Некоторые типы, например int, могут использовать более эффективный алгоритм при вызове с тремя аргументами.",
  },
  "ref-func-print": {
    title: "print()",
    description: "Печатает значения в поток или в sys.stdout по умолчанию.",
  },
  "ref-func-range": {
    title: "range()",
    description: "range(stop) -> объект range range(start, stop[, step]) -> объект range Возвращает объект, создающий последовательность целых чисел от start (включительно) до stop (не включительно) с шагом step.",
  },
  "ref-func-reversed": {
    title: "reversed()",
    description: "Возвращает обратный итератор по значениям заданной последовательности.",
  },
  "ref-func-round": {
    title: "round()",
    description: "Округляет число до заданной точности в десятичных знаках.",
  },
  "ref-func-set": {
    title: "set()",
    description: "set() -> новый пустой объект set set(iterable) -> новый объект set Создаёт неупорядоченную коллекцию уникальных элементов.",
  },
  "ref-func-setattr": {
    title: "setattr()",
    description: "Устанавливает именованный атрибут заданного объекта в указанное значение.",
  },
  "ref-func-slice": {
    title: "slice()",
    description: "slice(stop) slice(start, stop[, step]) Создаёт объект среза.",
  },
  "ref-func-sorted": {
    title: "sorted()",
    description: "Возвращает новый список, содержащий все элементы итерируемого объекта в порядке возрастания.",
  },
  "ref-func-str": {
    title: "str()",
    description: "str(object='') -> str str(bytes_or_buffer[, encoding[, errors]]) -> str Создаёт новый строковый объект из заданного объекта.",
  },
  "ref-func-sum": {
    title: "sum()",
    description: "Возвращает сумму начального значения 'start' (по умолчанию: 0) и итерируемого объекта чисел. Когда итерируемый объект пуст, возвращает начальное значение.",
  },
  "ref-func-super": {
    title: "super()",
    description: "super() -> то же, что super(__class__, <первый аргумент>) super(type) -> несвязанный объект super super(type, obj) -> связанный объект super; требуется isinstance(obj, type) super(type, type2) -> связанный объект super; требуется issubcla",
  },
  "ref-func-tuple": {
    title: "tuple()",
    description: "Встроенная неизменяемая последовательность.",
  },
  "ref-func-type": {
    title: "type()",
    description: "type(object) -> тип объекта type(name, bases, dict, **kwds) -> новый тип",
  },
  "ref-func-vars": {
    title: "vars()",
    description: "Показывает vars.",
  },
  "ref-func-zip": {
    title: "zip()",
    description: "zip(*iterables, strict=False) --> Выдаёт кортежи, пока один из входных объектов не исчерпан.",
  },
  "python-ref-string": {
    title: "Методы строк Python",
    description: "Методы строк — все методы, которые можно вызывать у str.",
  },
  "ref-string-capitalize": {
    title: "capitalize()",
    description: "Возвращает версию строки с заглавной первой буквой.",
  },
  "ref-string-casefold": {
    title: "casefold()",
    description: "Возвращает версию строки, подходящую для сравнений без учёта регистра.",
  },
  "ref-string-center": {
    title: "center()",
    description: "Возвращает строку, выровненную по центру, длиной width.",
  },
  "ref-string-count": {
    title: "count()",
    description: "S.count(sub[, start[, end]]) -> int Возвращает количество непересекающихся вхождений подстроки sub в строку S[start:end].",
  },
  "ref-string-encode": {
    title: "encode()",
    description: "Кодирует строку с помощью кодека, зарегистрированного для кодирования.",
  },
  "ref-string-endswith": {
    title: "endswith()",
    description: "S.endswith(suffix[, start[, end]]) -> bool Возвращает True, если S заканчивается указанным суффиксом, и False в противном случае.",
  },
  "ref-string-expandtabs": {
    title: "expandtabs()",
    description: "Возвращает копию, в которой все символы табуляции заменены пробелами.",
  },
  "ref-string-find": {
    title: "find()",
    description: "S.find(sub[, start[, end]]) -> int Возвращает наименьший индекс в S, где найдена подстрока sub, при этом sub содержится в S[start:end].",
  },
  "ref-string-format": {
    title: "format()",
    description: "S.format(*args, **kwargs) -> str Возвращает отформатированную версию S с подстановками из args и kwargs.",
  },
  "ref-string-format-map": {
    title: "format_map()",
    description: "format_map() — смотрите пример ниже.",
  },
  "ref-string-index": {
    title: "index()",
    description: "S.index(sub[, start[, end]]) -> int Возвращает наименьший индекс в S, где найдена подстрока sub, при этом sub содержится в S[start:end].",
  },
  "ref-string-isalnum": {
    title: "isalnum()",
    description: "Возвращает True, если строка буквенно-цифровая, и False в противном случае.",
  },
  "ref-string-isalpha": {
    title: "isalpha()",
    description: "Возвращает True, если строка буквенная, и False в противном случае.",
  },
  "ref-string-isascii": {
    title: "isascii()",
    description: "Возвращает True, если все символы строки — ASCII, и False в противном случае.",
  },
  "ref-string-isdecimal": {
    title: "isdecimal()",
    description: "Возвращает True, если строка десятичная, и False в противном случае.",
  },
  "ref-string-isdigit": {
    title: "isdigit()",
    description: "Возвращает True, если строка состоит из цифр, и False в противном случае.",
  },
  "ref-string-isidentifier": {
    title: "isidentifier()",
    description: "Возвращает True, если строка — допустимый идентификатор Python, и False в противном случае.",
  },
  "ref-string-islower": {
    title: "islower()",
    description: "Возвращает True, если строка в нижнем регистре, и False в противном случае.",
  },
  "ref-string-isnumeric": {
    title: "isnumeric()",
    description: "Возвращает True, если строка числовая, и False в противном случае.",
  },
  "ref-string-isprintable": {
    title: "isprintable()",
    description: "Возвращает True, если строка печатная, и False в противном случае.",
  },
  "ref-string-isspace": {
    title: "isspace()",
    description: "Возвращает True, если строка состоит из пробельных символов, и False в противном случае.",
  },
  "ref-string-istitle": {
    title: "istitle()",
    description: "Возвращает True, если строка оформлена как заголовок, и False в противном случае.",
  },
  "ref-string-isupper": {
    title: "isupper()",
    description: "Возвращает True, если строка в верхнем регистре, и False в противном случае.",
  },
  "ref-string-join": {
    title: "join()",
    description: "Соединяет любое количество строк.",
  },
  "ref-string-ljust": {
    title: "ljust()",
    description: "Возвращает строку, выровненную по левому краю, длиной width.",
  },
  "ref-string-lower": {
    title: "lower()",
    description: "Возвращает копию строки, преобразованную в нижний регистр.",
  },
  "ref-string-lstrip": {
    title: "lstrip()",
    description: "Возвращает копию строки с удалёнными начальными пробелами.",
  },
  "ref-string-maketrans": {
    title: "maketrans()",
    description: "Возвращает таблицу перевода, пригодную для str.translate().",
  },
  "ref-string-partition": {
    title: "partition()",
    description: "Разделяет строку на три части с помощью заданного разделителя.",
  },
  "ref-string-replace": {
    title: "replace()",
    description: "Возвращает копию, в которой все вхождения подстроки old заменены на new.",
  },
  "ref-string-rfind": {
    title: "rfind()",
    description: "S.rfind(sub[, start[, end]]) -> int Возвращает наибольший индекс в S, где найдена подстрока sub, при этом sub содержится в S[start:end].",
  },
  "ref-string-rindex": {
    title: "rindex()",
    description: "S.rindex(sub[, start[, end]]) -> int Возвращает наибольший индекс в S, где найдена подстрока sub, при этом sub содержится в S[start:end].",
  },
  "ref-string-rjust": {
    title: "rjust()",
    description: "Возвращает строку, выровненную по правому краю, длиной width.",
  },
  "ref-string-rpartition": {
    title: "rpartition()",
    description: "Разделяет строку на три части с помощью заданного разделителя.",
  },
  "ref-string-rsplit": {
    title: "rsplit()",
    description: "Возвращает список подстрок строки, используя sep как строку-разделитель.",
  },
  "ref-string-rstrip": {
    title: "rstrip()",
    description: "Возвращает копию строки с удалёнными конечными пробелами.",
  },
  "ref-string-split": {
    title: "split()",
    description: "Возвращает список подстрок строки, используя sep как строку-разделитель.",
  },
  "ref-string-splitlines": {
    title: "splitlines()",
    description: "Возвращает список строк, разбивая по границам строк.",
  },
  "ref-string-startswith": {
    title: "startswith()",
    description: "S.startswith(prefix[, start[, end]]) -> bool Возвращает True, если S начинается с указанного префикса, и False в противном случае.",
  },
  "ref-string-strip": {
    title: "strip()",
    description: "Возвращает копию строки с удалёнными начальными и конечными пробелами.",
  },
  "ref-string-swapcase": {
    title: "swapcase()",
    description: "Преобразует прописные символы в строчные, а строчные — в прописные.",
  },
  "ref-string-title": {
    title: "title()",
    description: "Возвращает версию строки, в которой каждое слово начинается с заглавной буквы.",
  },
  "ref-string-translate": {
    title: "translate()",
    description: "Заменяет каждый символ строки с помощью заданной таблицы перевода.",
  },
  "ref-string-upper": {
    title: "upper()",
    description: "Возвращает копию строки, преобразованную в верхний регистр.",
  },
  "ref-string-zfill": {
    title: "zfill()",
    description: "Дополняет числовую строку нулями слева, чтобы заполнить поле заданной ширины.",
  },
  "python-ref-list": {
    title: "Методы списков Python",
    description: "Методы списков — все методы, которые можно вызывать у списка.",
  },
  "ref-list-append": {
    title: "append()",
    description: "Добавляет объект в конец списка.",
  },
  "ref-list-clear": {
    title: "clear()",
    description: "Удаляет все элементы из списка.",
  },
  "ref-list-copy": {
    title: "copy()",
    description: "Возвращает поверхностную копию списка.",
  },
  "ref-list-count": {
    title: "count()",
    description: "Возвращает количество вхождений значения.",
  },
  "ref-list-extend": {
    title: "extend()",
    description: "Расширяет список, добавляя элементы из итерируемого объекта.",
  },
  "ref-list-index": {
    title: "index()",
    description: "Возвращает первый индекс значения.",
  },
  "ref-list-insert": {
    title: "insert()",
    description: "Вставляет объект перед индексом.",
  },
  "ref-list-pop": {
    title: "pop()",
    description: "Удаляет и возвращает элемент по индексу (по умолчанию последний).",
  },
  "ref-list-remove": {
    title: "remove()",
    description: "Удаляет первое вхождение значения.",
  },
  "ref-list-reverse": {
    title: "reverse()",
    description: "Разворачивает *НА МЕСТЕ*.",
  },
  "ref-list-sort": {
    title: "sort()",
    description: "Сортирует список по возрастанию и возвращает None.",
  },
  "python-ref-dictionary": {
    title: "Методы словарей Python",
    description: "Методы словарей — все методы, которые можно вызывать у dict.",
  },
  "ref-dictionary-clear": {
    title: "clear()",
    description: "D.clear() -> None.",
  },
  "ref-dictionary-copy": {
    title: "copy()",
    description: "D.copy() -> поверхностная копия D",
  },
  "ref-dictionary-fromkeys": {
    title: "fromkeys()",
    description: "Создаёт новый словарь с ключами из итерируемого объекта и значениями, установленными в value.",
  },
  "ref-dictionary-get": {
    title: "get()",
    description: "Возвращает значение для ключа key, если key есть в словаре, иначе default.",
  },
  "ref-dictionary-items": {
    title: "items()",
    description: "D.items() -> объект, похожий на множество, предоставляющий представление элементов D",
  },
  "ref-dictionary-keys": {
    title: "keys()",
    description: "D.keys() -> объект, похожий на множество, предоставляющий представление ключей D",
  },
  "ref-dictionary-pop": {
    title: "pop()",
    description: "D.pop(k[,d]) -> v, удаляет указанный ключ и возвращает соответствующее значение.",
  },
  "ref-dictionary-popitem": {
    title: "popitem()",
    description: "Удаляет и возвращает пару (ключ, значение) в виде кортежа из 2 элементов.",
  },
  "ref-dictionary-setdefault": {
    title: "setdefault()",
    description: "Вставляет ключ key со значением default, если ключа нет в словаре.",
  },
  "ref-dictionary-update": {
    title: "update()",
    description: "D.update([E, ]**F) -> None.",
  },
  "ref-dictionary-values": {
    title: "values()",
    description: "D.values() -> объект, предоставляющий представление значений D",
  },
  "python-ref-tuple": {
    title: "Методы кортежей Python",
    description: "Методы кортежей — все методы, которые можно вызывать у кортежа.",
  },
  "ref-tuple-count": {
    title: "count()",
    description: "Возвращает количество вхождений значения.",
  },
  "ref-tuple-index": {
    title: "index()",
    description: "Возвращает первый индекс значения.",
  },
  "python-ref-set": {
    title: "Методы множеств Python",
    description: "Методы множеств — все методы, которые можно вызывать у множества.",
  },
  "ref-set-add": {
    title: "add()",
    description: "Добавляет элемент в множество.",
  },
  "ref-set-clear": {
    title: "clear()",
    description: "Удаляет все элементы из этого множества.",
  },
  "ref-set-copy": {
    title: "copy()",
    description: "Возвращает поверхностную копию множества.",
  },
  "ref-set-difference": {
    title: "difference()",
    description: "Возвращает разность двух или более множеств в виде нового множества.",
  },
  "ref-set-difference-update": {
    title: "difference_update()",
    description: "difference_update() — смотрите пример ниже.",
  },
  "ref-set-discard": {
    title: "discard()",
    description: "Удаляет элемент из множества, если он является его членом.",
  },
  "ref-set-intersection": {
    title: "intersection()",
    description: "Возвращает пересечение двух множеств в виде нового множества.",
  },
  "ref-set-intersection-update": {
    title: "intersection_update()",
    description: "intersection_update() — смотрите пример ниже.",
  },
  "ref-set-isdisjoint": {
    title: "isdisjoint()",
    description: "Возвращает True, если два множества имеют пустое пересечение.",
  },
  "ref-set-issubset": {
    title: "issubset()",
    description: "Проверяет, находится ли каждый элемент множества в other.",
  },
  "ref-set-lessthan": {
    title: "<",
    description: "< проверяет, является ли множество собственным подмножеством другого множества.",
  },
  "ref-set-issuperset": {
    title: "issuperset()",
    description: "Проверяет, находится ли каждый элемент other в множестве.",
  },
  "ref-set-greaterthan": {
    title: ">",
    description: "> проверяет, является ли множество собственным надмножеством другого множества.",
  },
  "ref-set-pop": {
    title: "pop()",
    description: "Удаляет и возвращает произвольный элемент множества.",
  },
  "ref-set-remove": {
    title: "remove()",
    description: "Удаляет элемент из множества; он должен быть его членом.",
  },
  "ref-set-symmetric-difference": {
    title: "symmetric_difference()",
    description: "symmetric_difference() — смотрите пример ниже.",
  },
  "ref-set-symmetric-difference-update": {
    title: "symmetric_difference_update()",
    description: "symmetric_difference_update() — смотрите пример ниже.",
  },
  "ref-set-union": {
    title: "union()",
    description: "Возвращает объединение множеств в виде нового множества.",
  },
  "ref-set-update": {
    title: "update()",
    description: "Обновляет множество объединением его самого и других.",
  },
  "python-reference": {
    title: "Обзор Python",
    description: "Справочник Python — все встроенные функции, методы, ключевые слова и исключения в одном месте.",
  },
  "python-ref-file": {
    title: "Методы файлов Python",
    description: "Методы файлов — все методы, которые можно вызывать у открытого файлового объекта.",
  },
  "ref-file-close": {
    title: "close()",
    description: "Закрывает объект ввода-вывода.",
  },
  "ref-file-fileno": {
    title: "fileno()",
    description: "Возвращает базовый дескриптор файла, если он существует.",
  },
  "ref-file-flush": {
    title: "flush()",
    description: "Сбрасывает буферы записи, если применимо.",
  },
  "ref-file-isatty": {
    title: "isatty()",
    description: "Возвращает, является ли это «интерактивным» потоком.",
  },
  "ref-file-read": {
    title: "read()",
    description: "Читает не более size символов, возвращаемых в виде строки.",
  },
  "ref-file-readable": {
    title: "readable()",
    description: "Возвращает True, если объект ввода-вывода можно читать.",
  },
  "ref-file-readline": {
    title: "readline()",
    description: "Читает до новой строки или конца файла.",
  },
  "ref-file-readlines": {
    title: "readlines()",
    description: "Возвращает список строк из потока.",
  },
  "ref-file-seek": {
    title: "seek()",
    description: "Изменяет позицию в потоке.",
  },
  "ref-file-seekable": {
    title: "seekable()",
    description: "Возвращает True, если в объекте ввода-вывода можно перемещаться.",
  },
  "ref-file-tell": {
    title: "tell()",
    description: "Сообщает текущую позицию в файле.",
  },
  "ref-file-truncate": {
    title: "truncate()",
    description: "Обрезает размер до pos.",
  },
  "ref-file-writable": {
    title: "writable()",
    description: "Возвращает True, если в объект ввода-вывода можно писать.",
  },
  "ref-file-write": {
    title: "write()",
    description: "Записывает строку в файл.",
  },
  "ref-file-writelines": {
    title: "writelines()",
    description: "Записывает список строк в поток.",
  },
  "python-ref-keywords": {
    title: "Ключевые слова Python",
    description: "Ключевые слова Python — зарезервированные слова, из которых состоит язык.",
  },
  "ref-keyword-and": {
    title: "and",
    description: "and — логический оператор: True, только когда обе стороны True.",
  },
  "ref-keyword-as": {
    title: "as",
    description: "as даёт импортированному модулю или перехваченному исключению другое имя.",
  },
  "ref-keyword-assert": {
    title: "assert",
    description: "assert проверяет условие — если оно False, Python вызывает AssertionError.",
  },
  "ref-keyword-async": {
    title: "async",
    description: "async помечает функцию как асинхронную — она возвращает корутину, которую запускают через await.",
  },
  "ref-keyword-await": {
    title: "await",
    description: "await приостанавливает асинхронную функцию, пока то, чего она ждёт, не завершится.",
  },
  "ref-keyword-break": {
    title: "break",
    description: "break немедленно выходит из ближайшего цикла.",
  },
  "ref-keyword-case": {
    title: "case",
    description: "case — одна ветвь оператора match: выполняется, когда её шаблон подходит.",
  },
  "ref-keyword-class": {
    title: "class",
    description: "class определяет новый класс — чертёж объектов.",
  },
  "ref-keyword-continue": {
    title: "continue",
    description: "continue пропускает остаток текущего витка цикла и начинает следующий.",
  },
  "ref-keyword-def": {
    title: "def",
    description: "def определяет функцию.",
  },
  "ref-keyword-del": {
    title: "del",
    description: "del удаляет переменную, элемент или срез.",
  },
  "ref-keyword-elif": {
    title: "elif",
    description: "elif — второе условие, проверяется, только когда if выше был False.",
  },
  "ref-keyword-else": {
    title: "else",
    description: "else выполняется, когда if (и elif) выше были все False.",
  },
  "ref-keyword-except": {
    title: "except",
    description: "except перехватывает ошибку, возникшую внутри соответствующего блока try.",
  },
  "ref-keyword-false": {
    title: "False",
    description: "False — логическое значение «нет».",
  },
  "ref-keyword-finally": {
    title: "finally",
    description: "finally выполняется в любом случае — с ошибкой или без — после блока try.",
  },
  "ref-keyword-for": {
    title: "for",
    description: "for перебирает каждый элемент последовательности, по одному за раз.",
  },
  "ref-keyword-from": {
    title: "from",
    description: "from импортирует конкретные имена из модуля.",
  },
  "ref-keyword-global": {
    title: "global",
    description: "global указывает, что имя внутри функции относится к переменной уровня модуля.",
  },
  "ref-keyword-if": {
    title: "if",
    description: "if выполняет свой блок, только когда его условие True.",
  },
  "ref-keyword-import": {
    title: "import",
    description: "import привносит имена модуля в вашу программу.",
  },
  "ref-keyword-in": {
    title: "in",
    description: "in проверяет принадлежность — True, когда левая сторона находится внутри правой.",
  },
  "ref-keyword-is": {
    title: "is",
    description: "is проверяет тождество — True, когда оба имени указывают на один и тот же объект.",
  },
  "ref-keyword-lambda": {
    title: "lambda",
    description: "lambda создаёт небольшую анонимную функцию в одну строку.",
  },
  "ref-keyword-match": {
    title: "match",
    description: "match проверяет значение по шаблонам и выполняет первый подошедший.",
  },
  "ref-keyword-none": {
    title: "None",
    description: "None означает «здесь нет значения» — отсутствие значения.",
  },
  "ref-keyword-nonlocal": {
    title: "nonlocal",
    description: "nonlocal указывает, что имя внутри вложенной функции относится к переменной объемлющей функции.",
  },
  "ref-keyword-not": {
    title: "not",
    description: "not инвертирует логическое значение — True становится False и наоборот.",
  },
  "ref-keyword-or": {
    title: "or",
    description: "or — логический оператор: True, когда хотя бы одна сторона True.",
  },
  "ref-keyword-pass": {
    title: "pass",
    description: "pass ничего не делает — заглушка там, где Python нужен оператор.",
  },
  "ref-keyword-raise": {
    title: "raise",
    description: "raise намеренно вызывает исключение.",
  },
  "ref-keyword-return": {
    title: "return",
    description: "return возвращает значение из функции и завершает её.",
  },
  "ref-keyword-true": {
    title: "True",
    description: "True — логическое значение «да».",
  },
  "ref-keyword-try": {
    title: "try",
    description: "try оборачивает код, который может завершиться ошибкой, чтобы except мог перехватить ошибку.",
  },
  "ref-keyword-while": {
    title: "while",
    description: "while повторяет свой блок, пока его условие остаётся True.",
  },
  "ref-keyword-with": {
    title: "with",
    description: "with открывает ресурс (например, файл) и закрывает его за вас, когда блок заканчивается.",
  },
  "ref-keyword-yield": {
    title: "yield",
    description: "yield приостанавливает функцию-генератор и передаёт одно значение вызывающему коду.",
  },
  "python-ref-exceptions": {
    title: "Исключения Python",
    description: "Исключения Python — ошибки, которые вызывает Python, и что означает каждая из них.",
  },
  "ref-exception-arithmeticerror": {
    title: "ArithmeticError",
    description: "ArithmeticError — родитель всех арифметических ошибок (ZeroDivisionError, OverflowError, FloatingPointError).",
  },
  "ref-exception-assertionerror": {
    title: "AssertionError",
    description: "AssertionError вызывается, когда оператор assert не выполняется.",
  },
  "ref-exception-attributeerror": {
    title: "AttributeError",
    description: "AttributeError вызывается, когда вы обращаетесь к атрибуту или методу, который не существует.",
  },
  "ref-exception-exception": {
    title: "Exception",
    description: "Exception — родитель почти каждой ошибки, которую вы будете перехватывать.",
  },
  "ref-exception-eoferror": {
    title: "EOFError",
    description: "EOFError вызывается, когда input() или read достигает конца файла и ничего не остаётся.",
  },
  "ref-exception-floatingpointerror": {
    title: "FloatingPointError",
    description: "FloatingPointError вызывается, когда операция с float завершается ошибкой.",
  },
  "ref-exception-generatorexit": {
    title: "GeneratorExit",
    description: "GeneratorExit вызывается внутри генератора, когда он закрывается раньше времени.",
  },
  "ref-exception-importerror": {
    title: "ImportError",
    description: "ImportError вызывается, когда импорт не может найти модуль.",
  },
  "ref-exception-indentationerror": {
    title: "IndentationError",
    description: "IndentationError вызывается, когда отступ блока неверен.",
  },
  "ref-exception-indexerror": {
    title: "IndexError",
    description: "IndexError вызывается, когда индекс списка или кортежа выходит за пределы.",
  },
  "ref-exception-keyerror": {
    title: "KeyError",
    description: "KeyError вызывается, когда ключ словаря не существует.",
  },
  "ref-exception-keyboardinterrupt": {
    title: "KeyboardInterrupt",
    description: "KeyboardInterrupt вызывается, когда пользователь нажимает Ctrl+C.",
  },
  "ref-exception-lookuperror": {
    title: "LookupError",
    description: "LookupError — родитель IndexError и KeyError.",
  },
  "ref-exception-memoryerror": {
    title: "MemoryError",
    description: "MemoryError вызывается, когда у Python заканчивается память.",
  },
  "ref-exception-nameerror": {
    title: "NameError",
    description: "NameError вызывается, когда вы используете переменную, которая никогда не была определена.",
  },
  "ref-exception-notimplementederror": {
    title: "NotImplementedError",
    description: "NotImplementedError вызывается, чтобы сказать «эта часть ещё не написана».",
  },
  "ref-exception-oserror": {
    title: "OSError",
    description: "OSError вызывается, когда операционная система что-то отклоняет (отсутствующий файл, нет разрешения).",
  },
  "ref-exception-overflowerror": {
    title: "OverflowError",
    description: "OverflowError вызывается, когда число слишком велико для своего типа.",
  },
  "ref-exception-referenceerror": {
    title: "ReferenceError",
    description: "ReferenceError вызывается, когда слабая ссылка указывает на объект, которого уже нет.",
  },
  "ref-exception-runtimeerror": {
    title: "RuntimeError",
    description: "RuntimeError — общая ошибка, когда что-то идёт не так во время выполнения.",
  },
  "ref-exception-stopiteration": {
    title: "StopIteration",
    description: "StopIteration вызывается функцией next(), когда итератор завершён.",
  },
  "ref-exception-syntaxerror": {
    title: "SyntaxError",
    description: "SyntaxError вызывается, когда сам код не является допустимым Python.",
  },
  "ref-exception-taberror": {
    title: "TabError",
    description: "TabError вызывается, когда в отступах смешаны табуляции и пробелы.",
  },
  "ref-exception-systemerror": {
    title: "SystemError",
    description: "SystemError вызывается, когда сам интерпретатор сталкивается с внутренней проблемой.",
  },
  "ref-exception-systemexit": {
    title: "SystemExit",
    description: "SystemExit вызывается через sys.exit() — завершает программу.",
  },
  "ref-exception-typeerror": {
    title: "TypeError",
    description: "TypeError вызывается, когда операция применяется к неверному типу.",
  },
  "ref-exception-unboundlocalerror": {
    title: "UnboundLocalError",
    description: "UnboundLocalError вызывается, когда вы читаете локальную переменную до её присваивания.",
  },
  "ref-exception-unicodeerror": {
    title: "UnicodeError",
    description: "UnicodeError — родитель UnicodeEncodeError, UnicodeDecodeError и UnicodeTranslateError.",
  },
  "ref-exception-unicodeencodeerror": {
    title: "UnicodeEncodeError",
    description: "UnicodeEncodeError вызывается, когда текст нельзя закодировать в байты.",
  },
  "ref-exception-unicodedecodeerror": {
    title: "UnicodeDecodeError",
    description: "UnicodeDecodeError вызывается, когда байты нельзя декодировать в текст.",
  },
  "ref-exception-unicodetranslateerror": {
    title: "UnicodeTranslateError",
    description: "UnicodeTranslateError вызывается, когда символ нельзя перевести.",
  },
  "ref-exception-valueerror": {
    title: "ValueError",
    description: "ValueError вызывается, когда значение имеет правильный тип, но неверное содержимое.",
  },
  "ref-exception-zerodivisionerror": {
    title: "ZeroDivisionError",
    description: "ZeroDivisionError вызывается при делении на ноль.",
  },
  "python-ref-glossary": {
    title: "Глоссарий Python",
    description: "Глоссарий Python — слова, которые используют разработчики Python, объяснённые по одной строке каждое.",
  },
};
