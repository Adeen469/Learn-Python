import type { ReferenceTranslations } from "../types";
export const TRANSLATIONS: ReferenceTranslations = {
  "python-ref-functions": {
    title: "Funciones integradas de Python",
    description: "Las funciones integradas de Python: siempre disponibles, sin necesidad de importar nada.",
  },
  "ref-func-abs": {
    title: "abs()",
    description: "Devuelve el valor absoluto del argumento.",
  },
  "ref-func-all": {
    title: "all()",
    description: "Devuelve True si bool(x) es True para todos los valores x del iterable.",
  },
  "ref-func-any": {
    title: "any()",
    description: "Devuelve True si bool(x) es True para algún x del iterable.",
  },
  "ref-func-ascii": {
    title: "ascii()",
    description: "Devuelve una representación solo ASCII de un objeto.",
  },
  "ref-func-bin": {
    title: "bin()",
    description: "Devuelve la representación binaria de un entero.",
  },
  "ref-func-bool": {
    title: "bool()",
    description: "bool(x) -> bool Devuelve True cuando el argumento x es verdadero, False en caso contrario.",
  },
  "ref-func-bytearray": {
    title: "bytearray()",
    description: "bytearray(iterable_of_ints) -> bytearray bytearray(string, encoding[, errors]) -> bytearray bytearray(bytes_or_buffer) -> copia mutable de bytes_or_buffer bytearray(int) -> matriz de bytes de tamaño dado por el parámetro initi",
  },
  "ref-func-bytes": {
    title: "bytes()",
    description: "bytes(iterable_of_ints) -> bytes bytes(string, encoding[, errors]) -> bytes bytes(bytes_or_buffer) -> copia inmutable de bytes_or_buffer bytes(int) -> objeto bytes de tamaño dado por el parámetro inicializado con byte nulo",
  },
  "ref-func-callable": {
    title: "callable()",
    description: "Devuelve si el objeto es invocable (es decir, algún tipo de función).",
  },
  "ref-func-chr": {
    title: "chr()",
    description: "Devuelve una cadena Unicode de un carácter con ordinal i; 0 <= i <= 0x10ffff.",
  },
  "ref-func-compile": {
    title: "compile()",
    description: "Compila el código fuente en un objeto de código que puede ejecutarse con exec() o eval().",
  },
  "ref-func-complex": {
    title: "complex()",
    description: "Crea un número complejo a partir de una parte real y una parte imaginaria opcional.",
  },
  "ref-func-delattr": {
    title: "delattr()",
    description: "Elimina el atributo nombrado del objeto dado.",
  },
  "ref-func-dict": {
    title: "dict()",
    description: "dict() -> nuevo diccionario vacío dict(mapping) -> nuevo diccionario inicializado a partir de los pares (clave, valor) de un objeto mapping dict(iterable) -> nuevo diccionario inicializado como si fuera mediante: d = {} for k, v in iterable: d[k] = v dict(**k",
  },
  "ref-func-dir": {
    title: "dir()",
    description: "Muestra los atributos de un objeto.",
  },
  "ref-func-divmod": {
    title: "divmod()",
    description: "Devuelve la tupla (x//y, x%y).",
  },
  "ref-func-enumerate": {
    title: "enumerate()",
    description: "Devuelve un objeto enumerate.",
  },
  "ref-func-eval": {
    title: "eval()",
    description: "Evalúa el código fuente dado en el contexto de globals y locals.",
  },
  "ref-func-exec": {
    title: "exec()",
    description: "Ejecuta el código fuente dado en el contexto de globals y locals.",
  },
  "ref-func-filter": {
    title: "filter()",
    description: "filter(function or None, iterable) --> objeto filter Devuelve un iterador que produce los elementos del iterable para los que function(item) es verdadero.",
  },
  "ref-func-float": {
    title: "float()",
    description: "Convierte una cadena o un número en un número de punto flotante, si es posible.",
  },
  "ref-func-format": {
    title: "format()",
    description: "Devuelve type(value).__format__(value, format_spec) Muchos tipos integrados implementan format_spec según el lenguaje en miniatura de especificación de formato.",
  },
  "ref-func-frozenset": {
    title: "frozenset()",
    description: "frozenset() -> objeto frozenset vacío frozenset(iterable) -> objeto frozenset Construye una colección inmutable sin orden de elementos únicos.",
  },
  "ref-func-getattr": {
    title: "getattr()",
    description: "Obtiene un atributo nombrado de un objeto.",
  },
  "ref-func-globals": {
    title: "globals()",
    description: "Devuelve el diccionario que contiene las variables globales del ámbito actual.",
  },
  "ref-func-hasattr": {
    title: "hasattr()",
    description: "Devuelve si el objeto tiene un atributo con el nombre dado.",
  },
  "ref-func-hex": {
    title: "hex()",
    description: "Devuelve la representación hexadecimal de un entero.",
  },
  "ref-func-id": {
    title: "id()",
    description: "Devuelve la identidad de un objeto.",
  },
  "ref-func-input": {
    title: "input()",
    description: "Lee una cadena desde la entrada estándar.",
  },
  "ref-func-int": {
    title: "int()",
    description: "int([x]) -> entero int(x, base=10) -> entero Convierte un número o una cadena en un entero, o devuelve 0 si no se pasan argumentos.",
  },
  "ref-func-isinstance": {
    title: "isinstance()",
    description: "Devuelve si un objeto es una instancia de una clase o de una subclase de esta.",
  },
  "ref-func-issubclass": {
    title: "issubclass()",
    description: "Devuelve si 'cls' deriva de otra clase o es la misma clase.",
  },
  "ref-func-iter": {
    title: "iter()",
    description: "Obtiene un iterador de un objeto.",
  },
  "ref-func-len": {
    title: "len()",
    description: "Devuelve el número de elementos de un contenedor.",
  },
  "ref-func-list": {
    title: "list()",
    description: "Secuencia mutable integrada.",
  },
  "ref-func-locals": {
    title: "locals()",
    description: "Devuelve un diccionario que contiene las variables locales del ámbito actual.",
  },
  "ref-func-map": {
    title: "map()",
    description: "map(func, *iterables) --> objeto map Crea un iterador que calcula la función usando argumentos de cada uno de los iterables.",
  },
  "ref-func-max": {
    title: "max()",
    description: "max(iterable, *[, default=obj, key=func]) -> valor max(arg1, arg2, *args, *[, key=func]) -> valor Con un solo argumento iterable, devuelve su elemento mayor.",
  },
  "ref-func-memoryview": {
    title: "memoryview()",
    description: "Crea un nuevo objeto memoryview que hace referencia al objeto dado.",
  },
  "ref-func-min": {
    title: "min()",
    description: "min(iterable, *[, default=obj, key=func]) -> valor min(arg1, arg2, *args, *[, key=func]) -> valor Con un solo argumento iterable, devuelve su elemento menor.",
  },
  "ref-func-next": {
    title: "next()",
    description: "Devuelve el siguiente elemento del iterador.",
  },
  "ref-func-object": {
    title: "object()",
    description: "La clase base de la jerarquía de clases.",
  },
  "ref-func-oct": {
    title: "oct()",
    description: "Devuelve la representación octal de un entero.",
  },
  "ref-func-open": {
    title: "open()",
    description: "Abre un archivo y devuelve un flujo (stream).",
  },
  "ref-func-ord": {
    title: "ord()",
    description: "Devuelve el punto de código Unicode de una cadena de un carácter.",
  },
  "ref-func-pow": {
    title: "pow()",
    description: "Equivale a base**exp con 2 argumentos o a base**exp % mod con 3 argumentos. Algunos tipos, como los enteros, pueden usar un algoritmo más eficiente cuando se invoca con la forma de tres argumentos.",
  },
  "ref-func-print": {
    title: "print()",
    description: "Imprime los valores en un flujo, o en sys.stdout por defecto.",
  },
  "ref-func-range": {
    title: "range()",
    description: "range(stop) -> objeto range range(start, stop[, step]) -> objeto range Devuelve un objeto que produce una secuencia de enteros desde start (incluido) hasta stop (excluido) en pasos de step.",
  },
  "ref-func-reversed": {
    title: "reversed()",
    description: "Devuelve un iterador inverso sobre los valores de la secuencia dada.",
  },
  "ref-func-round": {
    title: "round()",
    description: "Redondea un número a una precisión dada en dígitos decimales.",
  },
  "ref-func-set": {
    title: "set()",
    description: "set() -> nuevo objeto set vacío set(iterable) -> nuevo objeto set Construye una colección sin orden de elementos únicos.",
  },
  "ref-func-setattr": {
    title: "setattr()",
    description: "Establece el atributo nombrado del objeto dado con el valor especificado.",
  },
  "ref-func-slice": {
    title: "slice()",
    description: "slice(stop) slice(start, stop[, step]) Crea un objeto slice.",
  },
  "ref-func-sorted": {
    title: "sorted()",
    description: "Devuelve una nueva lista con todos los elementos del iterable en orden ascendente.",
  },
  "ref-func-str": {
    title: "str()",
    description: "str(object='') -> str str(bytes_or_buffer[, encoding[, errors]]) -> str Crea un nuevo objeto de cadena a partir del objeto dado.",
  },
  "ref-func-sum": {
    title: "sum()",
    description: "Devuelve la suma de un valor 'start' (por defecto: 0) más un iterable de números. Cuando el iterable está vacío, devuelve el valor start.",
  },
  "ref-func-super": {
    title: "super()",
    description: "super() -> igual que super(__class__, <primer argumento>) super(type) -> objeto super no enlazado super(type, obj) -> objeto super enlazado; requiere isinstance(obj, type) super(type, type2) -> objeto super enlazado; requiere issubcla",
  },
  "ref-func-tuple": {
    title: "tuple()",
    description: "Secuencia inmutable integrada.",
  },
  "ref-func-type": {
    title: "type()",
    description: "type(object) -> el tipo del objeto type(name, bases, dict, **kwds) -> un nuevo tipo",
  },
  "ref-func-vars": {
    title: "vars()",
    description: "Muestra vars.",
  },
  "ref-func-zip": {
    title: "zip()",
    description: "zip(*iterables, strict=False) --> Produce tuplas hasta que se agota una entrada.",
  },
  "python-ref-string": {
    title: "Métodos de cadena de Python",
    description: "Métodos de cadena: todos los métodos que puedes llamar en un str.",
  },
  "ref-string-capitalize": {
    title: "capitalize()",
    description: "Devuelve una versión de la cadena con la primera letra en mayúscula.",
  },
  "ref-string-casefold": {
    title: "casefold()",
    description: "Devuelve una versión de la cadena adecuada para comparaciones sin distinción entre mayúsculas y minúsculas.",
  },
  "ref-string-center": {
    title: "center()",
    description: "Devuelve una cadena centrada de longitud width.",
  },
  "ref-string-count": {
    title: "count()",
    description: "S.count(sub[, start[, end]]) -> int Devuelve el número de ocurrencias no solapadas de la subcadena sub en la cadena S[start:end].",
  },
  "ref-string-encode": {
    title: "encode()",
    description: "Codifica la cadena usando el códec registrado para la codificación.",
  },
  "ref-string-endswith": {
    title: "endswith()",
    description: "S.endswith(suffix[, start[, end]]) -> bool Devuelve True si S termina con el sufijo especificado, False en caso contrario.",
  },
  "ref-string-expandtabs": {
    title: "expandtabs()",
    description: "Devuelve una copia en la que todos los caracteres de tabulación se expanden con espacios.",
  },
  "ref-string-find": {
    title: "find()",
    description: "S.find(sub[, start[, end]]) -> int Devuelve el índice más bajo de S donde se encuentra la subcadena sub, de modo que sub esté contenida en S[start:end].",
  },
  "ref-string-format": {
    title: "format()",
    description: "S.format(*args, **kwargs) -> str Devuelve una versión formateada de S, usando sustituciones de args y kwargs.",
  },
  "ref-string-format-map": {
    title: "format_map()",
    description: "format_map() — consulta el ejemplo siguiente.",
  },
  "ref-string-index": {
    title: "index()",
    description: "S.index(sub[, start[, end]]) -> int Devuelve el índice más bajo de S donde se encuentra la subcadena sub, de modo que sub esté contenida en S[start:end].",
  },
  "ref-string-isalnum": {
    title: "isalnum()",
    description: "Devuelve True si la cadena es alfanumérica, False en caso contrario.",
  },
  "ref-string-isalpha": {
    title: "isalpha()",
    description: "Devuelve True si la cadena es alfabética, False en caso contrario.",
  },
  "ref-string-isascii": {
    title: "isascii()",
    description: "Devuelve True si todos los caracteres de la cadena son ASCII, False en caso contrario.",
  },
  "ref-string-isdecimal": {
    title: "isdecimal()",
    description: "Devuelve True si la cadena es decimal, False en caso contrario.",
  },
  "ref-string-isdigit": {
    title: "isdigit()",
    description: "Devuelve True si la cadena es de dígitos, False en caso contrario.",
  },
  "ref-string-isidentifier": {
    title: "isidentifier()",
    description: "Devuelve True si la cadena es un identificador válido de Python, False en caso contrario.",
  },
  "ref-string-islower": {
    title: "islower()",
    description: "Devuelve True si la cadena está en minúsculas, False en caso contrario.",
  },
  "ref-string-isnumeric": {
    title: "isnumeric()",
    description: "Devuelve True si la cadena es numérica, False en caso contrario.",
  },
  "ref-string-isprintable": {
    title: "isprintable()",
    description: "Devuelve True si la cadena es imprimible, False en caso contrario.",
  },
  "ref-string-isspace": {
    title: "isspace()",
    description: "Devuelve True si la cadena es de espacios en blanco, False en caso contrario.",
  },
  "ref-string-istitle": {
    title: "istitle()",
    description: "Devuelve True si la cadena está en formato de título, False en caso contrario.",
  },
  "ref-string-isupper": {
    title: "isupper()",
    description: "Devuelve True si la cadena está en mayúsculas, False en caso contrario.",
  },
  "ref-string-join": {
    title: "join()",
    description: "Concatena cualquier número de cadenas.",
  },
  "ref-string-ljust": {
    title: "ljust()",
    description: "Devuelve una cadena justificada a la izquierda de longitud width.",
  },
  "ref-string-lower": {
    title: "lower()",
    description: "Devuelve una copia de la cadena convertida a minúsculas.",
  },
  "ref-string-lstrip": {
    title: "lstrip()",
    description: "Devuelve una copia de la cadena sin los espacios en blanco iniciales.",
  },
  "ref-string-maketrans": {
    title: "maketrans()",
    description: "Devuelve una tabla de traducción utilizable para str.translate().",
  },
  "ref-string-partition": {
    title: "partition()",
    description: "Divide la cadena en tres partes usando el separador dado.",
  },
  "ref-string-replace": {
    title: "replace()",
    description: "Devuelve una copia con todas las ocurrencias de la subcadena old reemplazadas por new.",
  },
  "ref-string-rfind": {
    title: "rfind()",
    description: "S.rfind(sub[, start[, end]]) -> int Devuelve el índice más alto de S donde se encuentra la subcadena sub, de modo que sub esté contenida en S[start:end].",
  },
  "ref-string-rindex": {
    title: "rindex()",
    description: "S.rindex(sub[, start[, end]]) -> int Devuelve el índice más alto de S donde se encuentra la subcadena sub, de modo que sub esté contenida en S[start:end].",
  },
  "ref-string-rjust": {
    title: "rjust()",
    description: "Devuelve una cadena justificada a la derecha de longitud width.",
  },
  "ref-string-rpartition": {
    title: "rpartition()",
    description: "Divide la cadena en tres partes usando el separador dado.",
  },
  "ref-string-rsplit": {
    title: "rsplit()",
    description: "Devuelve una lista de las subcadenas de la cadena, usando sep como cadena separadora.",
  },
  "ref-string-rstrip": {
    title: "rstrip()",
    description: "Devuelve una copia de la cadena sin los espacios en blanco finales.",
  },
  "ref-string-split": {
    title: "split()",
    description: "Devuelve una lista de las subcadenas de la cadena, usando sep como cadena separadora.",
  },
  "ref-string-splitlines": {
    title: "splitlines()",
    description: "Devuelve una lista de las líneas de la cadena, separando en los límites de línea.",
  },
  "ref-string-startswith": {
    title: "startswith()",
    description: "S.startswith(prefix[, start[, end]]) -> bool Devuelve True si S empieza con el prefijo especificado, False en caso contrario.",
  },
  "ref-string-strip": {
    title: "strip()",
    description: "Devuelve una copia de la cadena sin los espacios en blanco iniciales ni finales.",
  },
  "ref-string-swapcase": {
    title: "swapcase()",
    description: "Convierte los caracteres en mayúscula a minúscula y los caracteres en minúscula a mayúscula.",
  },
  "ref-string-title": {
    title: "title()",
    description: "Devuelve una versión de la cadena en la que cada palabra está en formato de título.",
  },
  "ref-string-translate": {
    title: "translate()",
    description: "Reemplaza cada carácter de la cadena usando la tabla de traducción dada.",
  },
  "ref-string-upper": {
    title: "upper()",
    description: "Devuelve una copia de la cadena convertida a mayúsculas.",
  },
  "ref-string-zfill": {
    title: "zfill()",
    description: "Rellena una cadena numérica con ceros a la izquierda, para completar un campo de la anchura dada.",
  },
  "python-ref-list": {
    title: "Métodos de lista de Python",
    description: "Métodos de lista: todos los métodos que puedes llamar en una lista.",
  },
  "ref-list-append": {
    title: "append()",
    description: "Añade un objeto al final de la lista.",
  },
  "ref-list-clear": {
    title: "clear()",
    description: "Elimina todos los elementos de la lista.",
  },
  "ref-list-copy": {
    title: "copy()",
    description: "Devuelve una copia superficial de la lista.",
  },
  "ref-list-count": {
    title: "count()",
    description: "Devuelve el número de ocurrencias de value.",
  },
  "ref-list-extend": {
    title: "extend()",
    description: "Extiende la lista añadiendo elementos del iterable.",
  },
  "ref-list-index": {
    title: "index()",
    description: "Devuelve el primer índice de value.",
  },
  "ref-list-insert": {
    title: "insert()",
    description: "Inserta un objeto antes de index.",
  },
  "ref-list-pop": {
    title: "pop()",
    description: "Elimina y devuelve el elemento en index (por defecto, el último).",
  },
  "ref-list-remove": {
    title: "remove()",
    description: "Elimina la primera ocurrencia de value.",
  },
  "ref-list-reverse": {
    title: "reverse()",
    description: "Invierte *IN PLACE*.",
  },
  "ref-list-sort": {
    title: "sort()",
    description: "Ordena la lista en orden ascendente y devuelve None.",
  },
  "python-ref-dictionary": {
    title: "Métodos de diccionario de Python",
    description: "Métodos de diccionario: todos los métodos que puedes llamar en un dict.",
  },
  "ref-dictionary-clear": {
    title: "clear()",
    description: "D.clear() -> None.",
  },
  "ref-dictionary-copy": {
    title: "copy()",
    description: "D.copy() -> una copia superficial de D",
  },
  "ref-dictionary-fromkeys": {
    title: "fromkeys()",
    description: "Crea un nuevo diccionario con claves del iterable y valores establecidos en value.",
  },
  "ref-dictionary-get": {
    title: "get()",
    description: "Devuelve el valor de key si key está en el diccionario; si no, default.",
  },
  "ref-dictionary-items": {
    title: "items()",
    description: "D.items() -> un objeto de tipo conjunto que ofrece una vista de los elementos de D",
  },
  "ref-dictionary-keys": {
    title: "keys()",
    description: "D.keys() -> un objeto de tipo conjunto que ofrece una vista de las claves de D",
  },
  "ref-dictionary-pop": {
    title: "pop()",
    description: "D.pop(k[,d]) -> v, elimina la clave especificada y devuelve el valor correspondiente.",
  },
  "ref-dictionary-popitem": {
    title: "popitem()",
    description: "Elimina y devuelve un par (clave, valor) como una tupla de 2 elementos.",
  },
  "ref-dictionary-setdefault": {
    title: "setdefault()",
    description: "Inserta key con un valor de default si key no está en el diccionario.",
  },
  "ref-dictionary-update": {
    title: "update()",
    description: "D.update([E, ]**F) -> None.",
  },
  "ref-dictionary-values": {
    title: "values()",
    description: "D.values() -> un objeto que ofrece una vista de los valores de D",
  },
  "python-ref-tuple": {
    title: "Métodos de tupla de Python",
    description: "Métodos de tupla: todos los métodos que puedes llamar en una tupla.",
  },
  "ref-tuple-count": {
    title: "count()",
    description: "Devuelve el número de ocurrencias de value.",
  },
  "ref-tuple-index": {
    title: "index()",
    description: "Devuelve el primer índice de value.",
  },
  "python-ref-set": {
    title: "Métodos de conjunto de Python",
    description: "Métodos de conjunto: todos los métodos que puedes llamar en un conjunto.",
  },
  "ref-set-add": {
    title: "add()",
    description: "Añade un elemento a un conjunto.",
  },
  "ref-set-clear": {
    title: "clear()",
    description: "Elimina todos los elementos de este conjunto.",
  },
  "ref-set-copy": {
    title: "copy()",
    description: "Devuelve una copia superficial de un conjunto.",
  },
  "ref-set-difference": {
    title: "difference()",
    description: "Devuelve la diferencia de dos o más conjuntos como un nuevo conjunto.",
  },
  "ref-set-difference-update": {
    title: "difference_update()",
    description: "difference_update() — consulta el ejemplo siguiente.",
  },
  "ref-set-discard": {
    title: "discard()",
    description: "Elimina un elemento de un conjunto si es miembro de él.",
  },
  "ref-set-intersection": {
    title: "intersection()",
    description: "Devuelve la intersección de dos conjuntos como un nuevo conjunto.",
  },
  "ref-set-intersection-update": {
    title: "intersection_update()",
    description: "intersection_update() — consulta el ejemplo siguiente.",
  },
  "ref-set-isdisjoint": {
    title: "isdisjoint()",
    description: "Devuelve True si dos conjuntos tienen una intersección nula.",
  },
  "ref-set-issubset": {
    title: "issubset()",
    description: "Comprueba si todos los elementos del conjunto están en other.",
  },
  "ref-set-lessthan": {
    title: "<",
    description: "< comprueba si un conjunto es un subconjunto propio de otro conjunto.",
  },
  "ref-set-issuperset": {
    title: "issuperset()",
    description: "Comprueba si todos los elementos de other están en el conjunto.",
  },
  "ref-set-greaterthan": {
    title: ">",
    description: "> comprueba si un conjunto es un superconjunto propio de otro conjunto.",
  },
  "ref-set-pop": {
    title: "pop()",
    description: "Elimina y devuelve un elemento arbitrario del conjunto.",
  },
  "ref-set-remove": {
    title: "remove()",
    description: "Elimina un elemento de un conjunto; debe ser miembro de él.",
  },
  "ref-set-symmetric-difference": {
    title: "symmetric_difference()",
    description: "symmetric_difference() — consulta el ejemplo siguiente.",
  },
  "ref-set-symmetric-difference-update": {
    title: "symmetric_difference_update()",
    description: "symmetric_difference_update() — consulta el ejemplo siguiente.",
  },
  "ref-set-union": {
    title: "union()",
    description: "Devuelve la unión de conjuntos como un nuevo conjunto.",
  },
  "ref-set-update": {
    title: "update()",
    description: "Actualiza un conjunto con la unión de sí mismo y otros.",
  },
  "python-reference": {
    title: "Resumen de Python",
    description: "Referencia de Python: todas las funciones integradas, métodos, palabras clave y excepciones en un solo lugar.",
  },
  "python-ref-file": {
    title: "Métodos de archivo de Python",
    description: "Métodos de archivo: todos los métodos que puedes llamar en un objeto de archivo abierto.",
  },
  "ref-file-close": {
    title: "close()",
    description: "Cierra el objeto IO.",
  },
  "ref-file-fileno": {
    title: "fileno()",
    description: "Devuelve el descriptor de archivo subyacente si existe uno.",
  },
  "ref-file-flush": {
    title: "flush()",
    description: "Vacía los búferes de escritura, si corresponde.",
  },
  "ref-file-isatty": {
    title: "isatty()",
    description: "Devuelve si este es un flujo 'interactivo'.",
  },
  "ref-file-read": {
    title: "read()",
    description: "Lee como máximo size caracteres, devueltos como una cadena.",
  },
  "ref-file-readable": {
    title: "readable()",
    description: "Devuelve True si el objeto IO se puede leer.",
  },
  "ref-file-readline": {
    title: "readline()",
    description: "Lee hasta el salto de línea o EOF.",
  },
  "ref-file-readlines": {
    title: "readlines()",
    description: "Devuelve una lista de líneas del flujo.",
  },
  "ref-file-seek": {
    title: "seek()",
    description: "Cambia la posición del flujo.",
  },
  "ref-file-seekable": {
    title: "seekable()",
    description: "Devuelve True si el objeto IO permite seek.",
  },
  "ref-file-tell": {
    title: "tell()",
    description: "Indica la posición actual del archivo.",
  },
  "ref-file-truncate": {
    title: "truncate()",
    description: "Trunca size a pos.",
  },
  "ref-file-writable": {
    title: "writable()",
    description: "Devuelve True si el objeto IO se puede escribir.",
  },
  "ref-file-write": {
    title: "write()",
    description: "Escribe una cadena en el archivo.",
  },
  "ref-file-writelines": {
    title: "writelines()",
    description: "Escribe una lista de líneas en el flujo.",
  },
  "python-ref-keywords": {
    title: "Palabras clave de Python",
    description: "Palabras clave de Python: las palabras reservadas que forman el lenguaje.",
  },
  "ref-keyword-and": {
    title: "and",
    description: "and es un operador lógico: True solo cuando ambos lados son True.",
  },
  "ref-keyword-as": {
    title: "as",
    description: "as da a un módulo importado o a una excepción capturada un nombre diferente.",
  },
  "ref-keyword-assert": {
    title: "assert",
    description: "assert comprueba una condición: si es False, Python lanza AssertionError.",
  },
  "ref-keyword-async": {
    title: "async",
    description: "async marca una función como asíncrona: devuelve una corrutina que ejecutas con await.",
  },
  "ref-keyword-await": {
    title: "await",
    description: "await pausa una función async hasta que termina aquello que espera.",
  },
  "ref-keyword-break": {
    title: "break",
    description: "break sale del bucle más cercano de inmediato.",
  },
  "ref-keyword-case": {
    title: "case",
    description: "case es una rama de una sentencia match: se ejecuta cuando su patrón encaja.",
  },
  "ref-keyword-class": {
    title: "class",
    description: "class define una nueva clase: un plano para objetos.",
  },
  "ref-keyword-continue": {
    title: "continue",
    description: "continue omite el resto de la vuelta actual del bucle y empieza la siguiente.",
  },
  "ref-keyword-def": {
    title: "def",
    description: "def define una función.",
  },
  "ref-keyword-del": {
    title: "del",
    description: "del elimina una variable, un elemento o un segmento (slice).",
  },
  "ref-keyword-elif": {
    title: "elif",
    description: "elif es una segunda condición, comprobada solo cuando el if anterior fue False.",
  },
  "ref-keyword-else": {
    title: "else",
    description: "else se ejecuta cuando el if (y los elif) anteriores fueron todos False.",
  },
  "ref-keyword-except": {
    title: "except",
    description: "except captura un error lanzado dentro del bloque try correspondiente.",
  },
  "ref-keyword-false": {
    title: "False",
    description: "False es el valor booleano para 'no'.",
  },
  "ref-keyword-finally": {
    title: "finally",
    description: "finally se ejecuta pase lo que pase — haya error o no — después del bloque try.",
  },
  "ref-keyword-for": {
    title: "for",
    description: "for recorre cada elemento de una secuencia, uno a la vez.",
  },
  "ref-keyword-from": {
    title: "from",
    description: "from importa nombres específicos de un módulo.",
  },
  "ref-keyword-global": {
    title: "global",
    description: "global indica que un nombre dentro de una función se refiere a la variable de nivel de módulo.",
  },
  "ref-keyword-if": {
    title: "if",
    description: "if ejecuta su bloque solo cuando su condición es True.",
  },
  "ref-keyword-import": {
    title: "import",
    description: "import trae los nombres de un módulo a tu programa.",
  },
  "ref-keyword-in": {
    title: "in",
    description: "in comprueba la pertenencia: True cuando el lado izquierdo está dentro del lado derecho.",
  },
  "ref-keyword-is": {
    title: "is",
    description: "is comprueba la identidad: True cuando ambos nombres apuntan al mismo objeto.",
  },
  "ref-keyword-lambda": {
    title: "lambda",
    description: "lambda crea una pequeña función anónima en una línea.",
  },
  "ref-keyword-match": {
    title: "match",
    description: "match compara un valor con patrones y ejecuta el primero que encaja.",
  },
  "ref-keyword-none": {
    title: "None",
    description: "None significa 'ningún valor aquí': la ausencia de un valor.",
  },
  "ref-keyword-nonlocal": {
    title: "nonlocal",
    description: "nonlocal indica que un nombre dentro de una función anidada se refiere a la variable de la función que la contiene.",
  },
  "ref-keyword-not": {
    title: "not",
    description: "not invierte un booleano: True se convierte en False y viceversa.",
  },
  "ref-keyword-or": {
    title: "or",
    description: "or es un operador lógico: True cuando al menos un lado es True.",
  },
  "ref-keyword-pass": {
    title: "pass",
    description: "pass no hace nada: un marcador donde Python necesita una sentencia.",
  },
  "ref-keyword-raise": {
    title: "raise",
    description: "raise lanza una excepción a propósito.",
  },
  "ref-keyword-return": {
    title: "return",
    description: "return devuelve un valor fuera de una función y la termina.",
  },
  "ref-keyword-true": {
    title: "True",
    description: "True es el valor booleano para 'sí'.",
  },
  "ref-keyword-try": {
    title: "try",
    description: "try envuelve código que podría fallar, para que except pueda capturar el error.",
  },
  "ref-keyword-while": {
    title: "while",
    description: "while repite su bloque mientras su condición siga siendo True.",
  },
  "ref-keyword-with": {
    title: "with",
    description: "with abre un recurso (como un archivo) y lo cierra por ti cuando termina el bloque.",
  },
  "ref-keyword-yield": {
    title: "yield",
    description: "yield pausa una función generadora y entrega un valor a quien la llama.",
  },
  "python-ref-exceptions": {
    title: "Excepciones de Python",
    description: "Excepciones de Python: los errores que lanza Python y lo que significa cada uno.",
  },
  "ref-exception-arithmeticerror": {
    title: "ArithmeticError",
    description: "ArithmeticError es la clase padre de todos los errores aritméticos (ZeroDivisionError, OverflowError, FloatingPointError).",
  },
  "ref-exception-assertionerror": {
    title: "AssertionError",
    description: "AssertionError se lanza cuando falla una sentencia assert.",
  },
  "ref-exception-attributeerror": {
    title: "AttributeError",
    description: "AttributeError se lanza cuando accedes a un atributo o método que no existe.",
  },
  "ref-exception-exception": {
    title: "Exception",
    description: "Exception es la clase padre de casi todos los errores que capturarás.",
  },
  "ref-exception-eoferror": {
    title: "EOFError",
    description: "EOFError se lanza cuando input() o read llega al final del archivo sin que quede nada.",
  },
  "ref-exception-floatingpointerror": {
    title: "FloatingPointError",
    description: "FloatingPointError se lanza cuando falla una operación con float.",
  },
  "ref-exception-generatorexit": {
    title: "GeneratorExit",
    description: "GeneratorExit se lanza dentro de un generador cuando se cierra antes de tiempo.",
  },
  "ref-exception-importerror": {
    title: "ImportError",
    description: "ImportError se lanza cuando un import no encuentra el módulo.",
  },
  "ref-exception-indentationerror": {
    title: "IndentationError",
    description: "IndentationError se lanza cuando la sangría de un bloque es incorrecta.",
  },
  "ref-exception-indexerror": {
    title: "IndexError",
    description: "IndexError se lanza cuando un índice de lista o tupla está fuera de rango.",
  },
  "ref-exception-keyerror": {
    title: "KeyError",
    description: "KeyError se lanza cuando una clave de diccionario no existe.",
  },
  "ref-exception-keyboardinterrupt": {
    title: "KeyboardInterrupt",
    description: "KeyboardInterrupt se lanza cuando el usuario pulsa Ctrl+C.",
  },
  "ref-exception-lookuperror": {
    title: "LookupError",
    description: "LookupError es la clase padre de IndexError y KeyError.",
  },
  "ref-exception-memoryerror": {
    title: "MemoryError",
    description: "MemoryError se lanza cuando Python se queda sin memoria.",
  },
  "ref-exception-nameerror": {
    title: "NameError",
    description: "NameError se lanza cuando usas una variable que nunca se definió.",
  },
  "ref-exception-notimplementederror": {
    title: "NotImplementedError",
    description: "NotImplementedError se lanza para indicar que 'esta parte aún no está escrita'.",
  },
  "ref-exception-oserror": {
    title: "OSError",
    description: "OSError se lanza cuando el sistema operativo rechaza algo (archivo inexistente, sin permiso).",
  },
  "ref-exception-overflowerror": {
    title: "OverflowError",
    description: "OverflowError se lanza cuando un número es demasiado grande para su tipo.",
  },
  "ref-exception-referenceerror": {
    title: "ReferenceError",
    description: "ReferenceError se lanza cuando una referencia débil apunta a un objeto que ya no existe.",
  },
  "ref-exception-runtimeerror": {
    title: "RuntimeError",
    description: "RuntimeError es un error general para algo que sale mal en tiempo de ejecución.",
  },
  "ref-exception-stopiteration": {
    title: "StopIteration",
    description: "StopIteration se lanza con next() cuando un iterador termina.",
  },
  "ref-exception-syntaxerror": {
    title: "SyntaxError",
    description: "SyntaxError se lanza cuando el código en sí no es Python válido.",
  },
  "ref-exception-taberror": {
    title: "TabError",
    description: "TabError se lanza cuando se mezclan tabulaciones y espacios en la sangría.",
  },
  "ref-exception-systemerror": {
    title: "SystemError",
    description: "SystemError se lanza cuando el propio intérprete encuentra un problema interno.",
  },
  "ref-exception-systemexit": {
    title: "SystemExit",
    description: "SystemExit se lanza con sys.exit(): termina el programa.",
  },
  "ref-exception-typeerror": {
    title: "TypeError",
    description: "TypeError se lanza cuando una operación se usa con el tipo incorrecto.",
  },
  "ref-exception-unboundlocalerror": {
    title: "UnboundLocalError",
    description: "UnboundLocalError se lanza cuando lees una variable local antes de asignarla.",
  },
  "ref-exception-unicodeerror": {
    title: "UnicodeError",
    description: "UnicodeError es la clase padre de UnicodeEncodeError, UnicodeDecodeError y UnicodeTranslateError.",
  },
  "ref-exception-unicodeencodeerror": {
    title: "UnicodeEncodeError",
    description: "UnicodeEncodeError se lanza cuando el texto no se puede codificar en bytes.",
  },
  "ref-exception-unicodedecodeerror": {
    title: "UnicodeDecodeError",
    description: "UnicodeDecodeError se lanza cuando los bytes no se pueden decodificar en texto.",
  },
  "ref-exception-unicodetranslateerror": {
    title: "UnicodeTranslateError",
    description: "UnicodeTranslateError se lanza cuando un carácter no se puede traducir.",
  },
  "ref-exception-valueerror": {
    title: "ValueError",
    description: "ValueError se lanza cuando un valor tiene el tipo correcto pero el contenido incorrecto.",
  },
  "ref-exception-zerodivisionerror": {
    title: "ZeroDivisionError",
    description: "ZeroDivisionError se lanza cuando divides entre cero.",
  },
  "python-ref-glossary": {
    title: "Glosario de Python",
    description: "Glosario de Python: las palabras que usan los desarrolladores de Python, explicadas en una línea cada una.",
  },
};
