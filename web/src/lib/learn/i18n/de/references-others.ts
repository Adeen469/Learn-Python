import type { ReferenceTranslations } from "../types";
export const TRANSLATIONS: ReferenceTranslations = {
  "python-ref-functions": {
    title: "Eingebaute Python-Funktionen",
    description: "Pythons eingebaute Funktionen – immer verfügbar, kein Import nötig.",
  },
  "ref-func-abs": {
    title: "abs()",
    description: "Gib den absoluten Wert des Arguments zurück.",
  },
  "ref-func-all": {
    title: "all()",
    description: "Gib True zurück, wenn bool(x) für alle Werte x im Iterable True ist.",
  },
  "ref-func-any": {
    title: "any()",
    description: "Gib True zurück, wenn bool(x) für irgendein x im Iterable True ist.",
  },
  "ref-func-ascii": {
    title: "ascii()",
    description: "Gib eine Darstellung eines Objekts zurück, die nur ASCII enthält.",
  },
  "ref-func-bin": {
    title: "bin()",
    description: "Gib die binäre Darstellung einer ganzen Zahl zurück.",
  },
  "ref-func-bool": {
    title: "bool()",
    description: "bool(x) -> bool Gibt True zurück, wenn das Argument x wahr ist, sonst False.",
  },
  "ref-func-bytearray": {
    title: "bytearray()",
    description: "bytearray(iterable_of_ints) -> bytearray bytearray(string, encoding[, errors]) -> bytearray bytearray(bytes_or_buffer) -> veränderliche Kopie von bytes_or_buffer bytearray(int) -> Bytes-Array der Größe, die durch den Parameter initi",
  },
  "ref-func-bytes": {
    title: "bytes()",
    description: "bytes(iterable_of_ints) -> bytes bytes(string, encoding[, errors]) -> bytes bytes(bytes_or_buffer) -> unveränderliche Kopie von bytes_or_buffer bytes(int) -> Bytes-Objekt der Größe, die durch den Parameter angegeben wird, initialisiert mit Null-Byte",
  },
  "ref-func-callable": {
    title: "callable()",
    description: "Gib zurück, ob das Objekt aufrufbar ist (d. h. eine Art Funktion).",
  },
  "ref-func-chr": {
    title: "chr()",
    description: "Gib einen Unicode-String aus einem Zeichen mit der Ordnungszahl i zurück; 0 <= i <= 0x10ffff.",
  },
  "ref-func-compile": {
    title: "compile()",
    description: "Kompiliere source zu einem Code-Objekt, das von exec() oder eval() ausgeführt werden kann.",
  },
  "ref-func-complex": {
    title: "complex()",
    description: "Erstelle eine komplexe Zahl aus einem Realteil und einem optionalen Imaginärteil.",
  },
  "ref-func-delattr": {
    title: "delattr()",
    description: "Löscht das benannte Attribut aus dem angegebenen Objekt.",
  },
  "ref-func-dict": {
    title: "dict()",
    description: "dict() -> neues leeres Dictionary dict(mapping) -> neues Dictionary, initialisiert aus den (key, value)-Paaren eines Mapping-Objekts dict(iterable) -> neues Dictionary, initialisiert wie über: d = {} for k, v in iterable: d[k] = v dict(**k",
  },
  "ref-func-dir": {
    title: "dir()",
    description: "Zeige die Attribute eines Objekts an.",
  },
  "ref-func-divmod": {
    title: "divmod()",
    description: "Gib das Tupel (x//y, x%y) zurück.",
  },
  "ref-func-enumerate": {
    title: "enumerate()",
    description: "Gib ein enumerate-Objekt zurück.",
  },
  "ref-func-eval": {
    title: "eval()",
    description: "Werte die angegebene source im Kontext von globals und locals aus.",
  },
  "ref-func-exec": {
    title: "exec()",
    description: "Führe die angegebene source im Kontext von globals und locals aus.",
  },
  "ref-func-filter": {
    title: "filter()",
    description: "filter(function or None, iterable) --> filter-Objekt Gib einen Iterator zurück, der die Elemente von iterable liefert, für die function(item) wahr ist.",
  },
  "ref-func-float": {
    title: "float()",
    description: "Wandle einen String oder eine Zahl, wenn möglich, in eine Gleitkommazahl um.",
  },
  "ref-func-format": {
    title: "format()",
    description: "Gib type(value).__format__(value, format_spec) zurück. Viele eingebaute Typen implementieren format_spec gemäß der Format Specification Mini-language.",
  },
  "ref-func-frozenset": {
    title: "frozenset()",
    description: "frozenset() -> leeres frozenset-Objekt frozenset(iterable) -> frozenset-Objekt Erstelle eine unveränderliche, ungeordnete Sammlung eindeutiger Elemente.",
  },
  "ref-func-getattr": {
    title: "getattr()",
    description: "Hole ein benanntes Attribut aus einem Objekt.",
  },
  "ref-func-globals": {
    title: "globals()",
    description: "Gib das Dictionary zurück, das die globalen Variablen des aktuellen Gültigkeitsbereichs enthält.",
  },
  "ref-func-hasattr": {
    title: "hasattr()",
    description: "Gib zurück, ob das Objekt ein Attribut mit dem angegebenen Namen hat.",
  },
  "ref-func-hex": {
    title: "hex()",
    description: "Gib die hexadezimale Darstellung einer ganzen Zahl zurück.",
  },
  "ref-func-id": {
    title: "id()",
    description: "Gib die Identität eines Objekts zurück.",
  },
  "ref-func-input": {
    title: "input()",
    description: "Lies einen String aus der Standardeingabe.",
  },
  "ref-func-int": {
    title: "int()",
    description: "int([x]) -> integer int(x, base=10) -> integer Wandle eine Zahl oder einen String in eine ganze Zahl um, oder gib 0 zurück, wenn keine Argumente angegeben sind.",
  },
  "ref-func-isinstance": {
    title: "isinstance()",
    description: "Gib zurück, ob ein Objekt eine Instanz einer Klasse oder einer Unterklasse davon ist.",
  },
  "ref-func-issubclass": {
    title: "issubclass()",
    description: "Gib zurück, ob 'cls' von einer anderen Klasse abgeleitet ist oder dieselbe Klasse ist.",
  },
  "ref-func-iter": {
    title: "iter()",
    description: "Hole einen Iterator aus einem Objekt.",
  },
  "ref-func-len": {
    title: "len()",
    description: "Gib die Anzahl der Elemente in einem Container zurück.",
  },
  "ref-func-list": {
    title: "list()",
    description: "Eingebaute veränderliche Sequenz.",
  },
  "ref-func-locals": {
    title: "locals()",
    description: "Gib ein Dictionary zurück, das die lokalen Variablen des aktuellen Gültigkeitsbereichs enthält.",
  },
  "ref-func-map": {
    title: "map()",
    description: "map(func, *iterables) --> map-Objekt Erstelle einen Iterator, der die Funktion mit Argumenten aus jedem der Iterables berechnet.",
  },
  "ref-func-max": {
    title: "max()",
    description: "max(iterable, *[, default=obj, key=func]) -> value max(arg1, arg2, *args, *[, key=func]) -> value Gib bei einem einzigen Iterable-Argument dessen größtes Element zurück.",
  },
  "ref-func-memoryview": {
    title: "memoryview()",
    description: "Erstelle ein neues memoryview-Objekt, das auf das angegebene Objekt verweist.",
  },
  "ref-func-min": {
    title: "min()",
    description: "min(iterable, *[, default=obj, key=func]) -> value min(arg1, arg2, *args, *[, key=func]) -> value Gib bei einem einzigen Iterable-Argument dessen kleinstes Element zurück.",
  },
  "ref-func-next": {
    title: "next()",
    description: "Gib das nächste Element aus dem Iterator zurück.",
  },
  "ref-func-object": {
    title: "object()",
    description: "Die Basisklasse der Klassenhierarchie.",
  },
  "ref-func-oct": {
    title: "oct()",
    description: "Gib die oktale Darstellung einer ganzen Zahl zurück.",
  },
  "ref-func-open": {
    title: "open()",
    description: "Öffne eine Datei und gib einen Stream zurück.",
  },
  "ref-func-ord": {
    title: "ord()",
    description: "Gib den Unicode-Codepoint für einen String aus einem Zeichen zurück.",
  },
  "ref-func-pow": {
    title: "pow()",
    description: "Entspricht base**exp bei 2 Argumenten oder base**exp % mod bei 3 Argumenten. Manche Typen, wie z. B. ints, können bei der Drei-Argument-Form einen effizienteren Algorithmus verwenden.",
  },
  "ref-func-print": {
    title: "print()",
    description: "Gibt die Werte in einen Stream aus, oder standardmäßig in sys.stdout.",
  },
  "ref-func-range": {
    title: "range()",
    description: "range(stop) -> range-Objekt range(start, stop[, step]) -> range-Objekt Gib ein Objekt zurück, das eine Folge von ganzen Zahlen von start (einschließlich) bis stop (ausschließlich) in Schritten von step erzeugt.",
  },
  "ref-func-reversed": {
    title: "reversed()",
    description: "Gib einen umgekehrten Iterator über die Werte der angegebenen Sequenz zurück.",
  },
  "ref-func-round": {
    title: "round()",
    description: "Runde eine Zahl auf eine angegebene Genauigkeit in Dezimalstellen.",
  },
  "ref-func-set": {
    title: "set()",
    description: "set() -> neues leeres set-Objekt set(iterable) -> neues set-Objekt Erstelle eine ungeordnete Sammlung eindeutiger Elemente.",
  },
  "ref-func-setattr": {
    title: "setattr()",
    description: "Setzt das benannte Attribut des angegebenen Objekts auf den angegebenen Wert.",
  },
  "ref-func-slice": {
    title: "slice()",
    description: "slice(stop) slice(start, stop[, step]) Erstelle ein slice-Objekt.",
  },
  "ref-func-sorted": {
    title: "sorted()",
    description: "Gib eine neue Liste zurück, die alle Elemente des Iterables in aufsteigender Reihenfolge enthält.",
  },
  "ref-func-str": {
    title: "str()",
    description: "str(object='') -> str str(bytes_or_buffer[, encoding[, errors]]) -> str Erstelle ein neues String-Objekt aus dem angegebenen Objekt.",
  },
  "ref-func-sum": {
    title: "sum()",
    description: "Gib die Summe eines 'start'-Werts (Standard: 0) plus eines Iterables aus Zahlen zurück. Wenn das Iterable leer ist, gib den Startwert zurück.",
  },
  "ref-func-super": {
    title: "super()",
    description: "super() -> dasselbe wie super(__class__, <erstes Argument>) super(type) -> ungebundenes super-Objekt super(type, obj) -> gebundenes super-Objekt; erfordert isinstance(obj, type) super(type, type2) -> gebundenes super-Objekt; erfordert issubcla",
  },
  "ref-func-tuple": {
    title: "tuple()",
    description: "Eingebaute unveränderliche Sequenz.",
  },
  "ref-func-type": {
    title: "type()",
    description: "type(object) -> der Typ des Objekts type(name, bases, dict, **kwds) -> ein neuer Typ",
  },
  "ref-func-vars": {
    title: "vars()",
    description: "Zeige vars an.",
  },
  "ref-func-zip": {
    title: "zip()",
    description: "zip(*iterables, strict=False) --> Liefere Tupel, bis ein Input erschöpft ist.",
  },
  "python-ref-string": {
    title: "Python-Stringmethoden",
    description: "String-Methoden – jede Methode, die du auf einen str aufrufen kannst.",
  },
  "ref-string-capitalize": {
    title: "capitalize()",
    description: "Gib eine großgeschriebene Version des Strings zurück.",
  },
  "ref-string-casefold": {
    title: "casefold()",
    description: "Gib eine Version des Strings zurück, die sich für Vergleiche ohne Groß-/Kleinschreibung eignet.",
  },
  "ref-string-center": {
    title: "center()",
    description: "Gib einen zentrierten String der Länge width zurück.",
  },
  "ref-string-count": {
    title: "count()",
    description: "S.count(sub[, start[, end]]) -> int Gib die Anzahl der nicht überlappenden Vorkommen des Teilstrings sub im String S[start:end] zurück.",
  },
  "ref-string-encode": {
    title: "encode()",
    description: "Kodiere den String mit dem Codec, der für encoding registriert ist.",
  },
  "ref-string-endswith": {
    title: "endswith()",
    description: "S.endswith(suffix[, start[, end]]) -> bool Gib True zurück, wenn S mit dem angegebenen suffix endet, sonst False.",
  },
  "ref-string-expandtabs": {
    title: "expandtabs()",
    description: "Gib eine Kopie zurück, in der alle Tabulatorzeichen mit Leerzeichen expandiert sind.",
  },
  "ref-string-find": {
    title: "find()",
    description: "S.find(sub[, start[, end]]) -> int Gib den niedrigsten Index in S zurück, an dem der Teilstring sub gefunden wird, sodass sub in S[start:end] enthalten ist.",
  },
  "ref-string-format": {
    title: "format()",
    description: "S.format(*args, **kwargs) -> str Gib eine formatierte Version von S zurück, mit Ersetzungen aus args und kwargs.",
  },
  "ref-string-format-map": {
    title: "format_map()",
    description: "format_map() — siehe das Beispiel unten.",
  },
  "ref-string-index": {
    title: "index()",
    description: "S.index(sub[, start[, end]]) -> int Gib den niedrigsten Index in S zurück, an dem der Teilstring sub gefunden wird, sodass sub in S[start:end] enthalten ist.",
  },
  "ref-string-isalnum": {
    title: "isalnum()",
    description: "Gib True zurück, wenn der String ein alphanumerischer String ist, sonst False.",
  },
  "ref-string-isalpha": {
    title: "isalpha()",
    description: "Gib True zurück, wenn der String ein alphabetischer String ist, sonst False.",
  },
  "ref-string-isascii": {
    title: "isascii()",
    description: "Gib True zurück, wenn alle Zeichen im String ASCII sind, sonst False.",
  },
  "ref-string-isdecimal": {
    title: "isdecimal()",
    description: "Gib True zurück, wenn der String ein Dezimalstring ist, sonst False.",
  },
  "ref-string-isdigit": {
    title: "isdigit()",
    description: "Gib True zurück, wenn der String ein Ziffernstring ist, sonst False.",
  },
  "ref-string-isidentifier": {
    title: "isidentifier()",
    description: "Gib True zurück, wenn der String ein gültiger Python-Bezeichner ist, sonst False.",
  },
  "ref-string-islower": {
    title: "islower()",
    description: "Gib True zurück, wenn der String ein Kleinbuchstaben-String ist, sonst False.",
  },
  "ref-string-isnumeric": {
    title: "isnumeric()",
    description: "Gib True zurück, wenn der String ein numerischer String ist, sonst False.",
  },
  "ref-string-isprintable": {
    title: "isprintable()",
    description: "Gib True zurück, wenn der String druckbar ist, sonst False.",
  },
  "ref-string-isspace": {
    title: "isspace()",
    description: "Gib True zurück, wenn der String ein Whitespace-String ist, sonst False.",
  },
  "ref-string-istitle": {
    title: "istitle()",
    description: "Gib True zurück, wenn der String ein String in Titel-Schreibweise ist, sonst False.",
  },
  "ref-string-isupper": {
    title: "isupper()",
    description: "Gib True zurück, wenn der String ein Großbuchstaben-String ist, sonst False.",
  },
  "ref-string-join": {
    title: "join()",
    description: "Verkette eine beliebige Anzahl von Strings.",
  },
  "ref-string-ljust": {
    title: "ljust()",
    description: "Gib einen linksbündigen String der Länge width zurück.",
  },
  "ref-string-lower": {
    title: "lower()",
    description: "Gib eine Kopie des Strings zurück, umgewandelt in Kleinbuchstaben.",
  },
  "ref-string-lstrip": {
    title: "lstrip()",
    description: "Gib eine Kopie des Strings zurück, bei der führende Leerzeichen entfernt sind.",
  },
  "ref-string-maketrans": {
    title: "maketrans()",
    description: "Gib eine Übersetzungstabelle zurück, die für str.translate() verwendet werden kann.",
  },
  "ref-string-partition": {
    title: "partition()",
    description: "Teile den String mit dem angegebenen Trennzeichen in drei Teile.",
  },
  "ref-string-replace": {
    title: "replace()",
    description: "Gib eine Kopie zurück, in der alle Vorkommen des Teilstrings old durch new ersetzt sind.",
  },
  "ref-string-rfind": {
    title: "rfind()",
    description: "S.rfind(sub[, start[, end]]) -> int Gib den höchsten Index in S zurück, an dem der Teilstring sub gefunden wird, sodass sub in S[start:end] enthalten ist.",
  },
  "ref-string-rindex": {
    title: "rindex()",
    description: "S.rindex(sub[, start[, end]]) -> int Gib den höchsten Index in S zurück, an dem der Teilstring sub gefunden wird, sodass sub in S[start:end] enthalten ist.",
  },
  "ref-string-rjust": {
    title: "rjust()",
    description: "Gib einen rechtsbündigen String der Länge width zurück.",
  },
  "ref-string-rpartition": {
    title: "rpartition()",
    description: "Teile den String mit dem angegebenen Trennzeichen in drei Teile.",
  },
  "ref-string-rsplit": {
    title: "rsplit()",
    description: "Gib eine Liste der Teilstrings im String zurück, wobei sep als Trennstring verwendet wird.",
  },
  "ref-string-rstrip": {
    title: "rstrip()",
    description: "Gib eine Kopie des Strings zurück, bei der nachgestellte Leerzeichen entfernt sind.",
  },
  "ref-string-split": {
    title: "split()",
    description: "Gib eine Liste der Teilstrings im String zurück, wobei sep als Trennstring verwendet wird.",
  },
  "ref-string-splitlines": {
    title: "splitlines()",
    description: "Gib eine Liste der Zeilen im String zurück, getrennt an Zeilenumbrüchen.",
  },
  "ref-string-startswith": {
    title: "startswith()",
    description: "S.startswith(prefix[, start[, end]]) -> bool Gib True zurück, wenn S mit dem angegebenen prefix beginnt, sonst False.",
  },
  "ref-string-strip": {
    title: "strip()",
    description: "Gib eine Kopie des Strings zurück, bei der führende und nachgestellte Leerzeichen entfernt sind.",
  },
  "ref-string-swapcase": {
    title: "swapcase()",
    description: "Wandle Großbuchstaben in Kleinbuchstaben um und Kleinbuchstaben in Großbuchstaben.",
  },
  "ref-string-title": {
    title: "title()",
    description: "Gib eine Version des Strings zurück, in der jedes Wort in Titel-Schreibweise steht.",
  },
  "ref-string-translate": {
    title: "translate()",
    description: "Ersetze jedes Zeichen im String mithilfe der angegebenen Übersetzungstabelle.",
  },
  "ref-string-upper": {
    title: "upper()",
    description: "Gib eine Kopie des Strings zurück, umgewandelt in Großbuchstaben.",
  },
  "ref-string-zfill": {
    title: "zfill()",
    description: "Fülle einen numerischen String links mit Nullen auf, um ein Feld der angegebenen Breite zu füllen.",
  },
  "python-ref-list": {
    title: "Python-Listenmethoden",
    description: "Listenmethoden – jede Methode, die du auf eine Liste aufrufen kannst.",
  },
  "ref-list-append": {
    title: "append()",
    description: "Hänge object ans Ende der Liste an.",
  },
  "ref-list-clear": {
    title: "clear()",
    description: "Entferne alle Elemente aus der Liste.",
  },
  "ref-list-copy": {
    title: "copy()",
    description: "Gib eine flache Kopie der Liste zurück.",
  },
  "ref-list-count": {
    title: "count()",
    description: "Gib die Anzahl der Vorkommen von value zurück.",
  },
  "ref-list-extend": {
    title: "extend()",
    description: "Erweitere die Liste, indem du Elemente aus dem Iterable anhängst.",
  },
  "ref-list-index": {
    title: "index()",
    description: "Gib den ersten Index von value zurück.",
  },
  "ref-list-insert": {
    title: "insert()",
    description: "Füge object vor index ein.",
  },
  "ref-list-pop": {
    title: "pop()",
    description: "Entferne das Element an index (Standard: letztes) und gib es zurück.",
  },
  "ref-list-remove": {
    title: "remove()",
    description: "Entferne das erste Vorkommen von value.",
  },
  "ref-list-reverse": {
    title: "reverse()",
    description: "Kehre *IN PLACE* um.",
  },
  "ref-list-sort": {
    title: "sort()",
    description: "Sortiere die Liste in aufsteigender Reihenfolge und gib None zurück.",
  },
  "python-ref-dictionary": {
    title: "Python-Dictionary-Methoden",
    description: "Dictionary-Methoden – jede Methode, die du auf ein dict aufrufen kannst.",
  },
  "ref-dictionary-clear": {
    title: "clear()",
    description: "D.clear() -> None.",
  },
  "ref-dictionary-copy": {
    title: "copy()",
    description: "D.copy() -> eine flache Kopie von D",
  },
  "ref-dictionary-fromkeys": {
    title: "fromkeys()",
    description: "Erstelle ein neues Dictionary mit Schlüsseln aus iterable und Werten, die auf value gesetzt sind.",
  },
  "ref-dictionary-get": {
    title: "get()",
    description: "Gib den Wert für key zurück, wenn key im Dictionary ist, sonst default.",
  },
  "ref-dictionary-items": {
    title: "items()",
    description: "D.items() -> ein set-ähnliches Objekt, das eine Ansicht auf die Elemente von D bietet",
  },
  "ref-dictionary-keys": {
    title: "keys()",
    description: "D.keys() -> ein set-ähnliches Objekt, das eine Ansicht auf die Schlüssel von D bietet",
  },
  "ref-dictionary-pop": {
    title: "pop()",
    description: "D.pop(k[,d]) -> v, entferne den angegebenen Schlüssel und gib den zugehörigen Wert zurück.",
  },
  "ref-dictionary-popitem": {
    title: "popitem()",
    description: "Entferne ein (key, value)-Paar als 2-Tupel und gib es zurück.",
  },
  "ref-dictionary-setdefault": {
    title: "setdefault()",
    description: "Füge key mit einem Wert von default ein, wenn key nicht im Dictionary ist.",
  },
  "ref-dictionary-update": {
    title: "update()",
    description: "D.update([E, ]**F) -> None.",
  },
  "ref-dictionary-values": {
    title: "values()",
    description: "D.values() -> ein Objekt, das eine Ansicht auf die Werte von D bietet",
  },
  "python-ref-tuple": {
    title: "Python-Tupelmethoden",
    description: "Tupelmethoden – jede Methode, die du auf ein Tupel aufrufen kannst.",
  },
  "ref-tuple-count": {
    title: "count()",
    description: "Gib die Anzahl der Vorkommen von value zurück.",
  },
  "ref-tuple-index": {
    title: "index()",
    description: "Gib den ersten Index von value zurück.",
  },
  "python-ref-set": {
    title: "Python-Setmethoden",
    description: "Setmethoden – jede Methode, die du auf ein Set aufrufen kannst.",
  },
  "ref-set-add": {
    title: "add()",
    description: "Füge ein Element zu einem Set hinzu.",
  },
  "ref-set-clear": {
    title: "clear()",
    description: "Entferne alle Elemente aus diesem Set.",
  },
  "ref-set-copy": {
    title: "copy()",
    description: "Gib eine flache Kopie eines Sets zurück.",
  },
  "ref-set-difference": {
    title: "difference()",
    description: "Gib die Differenz von zwei oder mehr Sets als neues Set zurück.",
  },
  "ref-set-difference-update": {
    title: "difference_update()",
    description: "difference_update() — siehe das Beispiel unten.",
  },
  "ref-set-discard": {
    title: "discard()",
    description: "Entferne ein Element aus einem Set, wenn es ein Mitglied ist.",
  },
  "ref-set-intersection": {
    title: "intersection()",
    description: "Gib die Schnittmenge von zwei Sets als neues Set zurück.",
  },
  "ref-set-intersection-update": {
    title: "intersection_update()",
    description: "intersection_update() — siehe das Beispiel unten.",
  },
  "ref-set-isdisjoint": {
    title: "isdisjoint()",
    description: "Gib True zurück, wenn zwei Sets eine leere Schnittmenge haben.",
  },
  "ref-set-issubset": {
    title: "issubset()",
    description: "Prüfe, ob jedes Element im Set in other ist.",
  },
  "ref-set-lessthan": {
    title: "<",
    description: "< prüft, ob ein Set eine echte Teilmenge eines anderen Sets ist.",
  },
  "ref-set-issuperset": {
    title: "issuperset()",
    description: "Prüfe, ob jedes Element in other im Set ist.",
  },
  "ref-set-greaterthan": {
    title: ">",
    description: "> prüft, ob ein Set eine echte Obermenge eines anderen Sets ist.",
  },
  "ref-set-pop": {
    title: "pop()",
    description: "Entferne ein beliebiges Set-Element und gib es zurück.",
  },
  "ref-set-remove": {
    title: "remove()",
    description: "Entferne ein Element aus einem Set; es muss ein Mitglied sein.",
  },
  "ref-set-symmetric-difference": {
    title: "symmetric_difference()",
    description: "symmetric_difference() — siehe das Beispiel unten.",
  },
  "ref-set-symmetric-difference-update": {
    title: "symmetric_difference_update()",
    description: "symmetric_difference_update() — siehe das Beispiel unten.",
  },
  "ref-set-union": {
    title: "union()",
    description: "Gib die Vereinigung von Sets als neues Set zurück.",
  },
  "ref-set-update": {
    title: "update()",
    description: "Aktualisiere ein Set mit der Vereinigung von sich selbst und anderen.",
  },
  "python-reference": {
    title: "Python-Überblick",
    description: "Python-Referenz – jede eingebaute Funktion, Methode, jedes Schlüsselwort und jede Ausnahme an einem Ort.",
  },
  "python-ref-file": {
    title: "Python-Dateimethoden",
    description: "Dateimethoden – jede Methode, die du auf ein geöffnetes Dateiobjekt aufrufen kannst.",
  },
  "ref-file-close": {
    title: "close()",
    description: "Schließe das IO-Objekt.",
  },
  "ref-file-fileno": {
    title: "fileno()",
    description: "Gib den zugrunde liegenden Dateideskriptor zurück, falls einer existiert.",
  },
  "ref-file-flush": {
    title: "flush()",
    description: "Leere die Schreibpuffer, falls zutreffend.",
  },
  "ref-file-isatty": {
    title: "isatty()",
    description: "Gib zurück, ob dies ein 'interaktiver' Stream ist.",
  },
  "ref-file-read": {
    title: "read()",
    description: "Lies höchstens size Zeichen, zurückgegeben als String.",
  },
  "ref-file-readable": {
    title: "readable()",
    description: "Gibt True zurück, wenn das IO-Objekt gelesen werden kann.",
  },
  "ref-file-readline": {
    title: "readline()",
    description: "Lies bis zum Zeilenumbruch oder EOF.",
  },
  "ref-file-readlines": {
    title: "readlines()",
    description: "Gib eine Liste von Zeilen aus dem Stream zurück.",
  },
  "ref-file-seek": {
    title: "seek()",
    description: "Ändere die Stream-Position.",
  },
  "ref-file-seekable": {
    title: "seekable()",
    description: "Gibt True zurück, wenn im IO-Objekt gesucht werden kann.",
  },
  "ref-file-tell": {
    title: "tell()",
    description: "Gib die aktuelle Dateiposition an.",
  },
  "ref-file-truncate": {
    title: "truncate()",
    description: "Kürze die Größe auf pos.",
  },
  "ref-file-writable": {
    title: "writable()",
    description: "Gibt True zurück, wenn in das IO-Objekt geschrieben werden kann.",
  },
  "ref-file-write": {
    title: "write()",
    description: "Schreibe einen String in die Datei.",
  },
  "ref-file-writelines": {
    title: "writelines()",
    description: "Schreibe eine Liste von Zeilen in den Stream.",
  },
  "python-ref-keywords": {
    title: "Python-Schlüsselwörter",
    description: "Python-Schlüsselwörter – die reservierten Wörter, aus denen die Sprache besteht.",
  },
  "ref-keyword-and": {
    title: "and",
    description: "and ist ein logischer Operator – nur True, wenn beide Seiten True sind.",
  },
  "ref-keyword-as": {
    title: "as",
    description: "as gibt einem importierten Modul oder einer abgefangenen Ausnahme einen anderen Namen.",
  },
  "ref-keyword-assert": {
    title: "assert",
    description: "assert prüft eine Bedingung – wenn sie False ist, löst Python AssertionError aus.",
  },
  "ref-keyword-async": {
    title: "async",
    description: "async markiert eine Funktion als asynchron – sie gibt eine Coroutine zurück, die du mit await ausführst.",
  },
  "ref-keyword-await": {
    title: "await",
    description: "await pausiert eine async-Funktion, bis das, worauf sie wartet, fertig ist.",
  },
  "ref-keyword-break": {
    title: "break",
    description: "break beendet die nächstliegende Schleife sofort.",
  },
  "ref-keyword-case": {
    title: "case",
    description: "case ist ein Zweig einer match-Anweisung – er läuft, wenn sein Muster passt.",
  },
  "ref-keyword-class": {
    title: "class",
    description: "class definiert eine neue Klasse – eine Bauanleitung für Objekte.",
  },
  "ref-keyword-continue": {
    title: "continue",
    description: "continue überspringt den Rest der aktuellen Schleifenrunde und startet die nächste.",
  },
  "ref-keyword-def": {
    title: "def",
    description: "def definiert eine Funktion.",
  },
  "ref-keyword-del": {
    title: "del",
    description: "del löscht eine Variable, ein Element oder einen Slice.",
  },
  "ref-keyword-elif": {
    title: "elif",
    description: "elif ist eine zweite Bedingung, die nur geprüft wird, wenn das if darüber False war.",
  },
  "ref-keyword-else": {
    title: "else",
    description: "else läuft, wenn das if (und die elifs) darüber alle False waren.",
  },
  "ref-keyword-except": {
    title: "except",
    description: "except fängt einen Fehler ab, der im passenden try-Block ausgelöst wurde.",
  },
  "ref-keyword-false": {
    title: "False",
    description: "False ist der boolesche Wert für 'nein'.",
  },
  "ref-keyword-finally": {
    title: "finally",
    description: "finally läuft auf jeden Fall – ob mit Fehler oder ohne – nach dem try-Block.",
  },
  "ref-keyword-for": {
    title: "for",
    description: "for durchläuft jedes Element einer Sequenz, eines nach dem anderen.",
  },
  "ref-keyword-from": {
    title: "from",
    description: "from importiert bestimmte Namen aus einem Modul.",
  },
  "ref-keyword-global": {
    title: "global",
    description: "global sagt, dass ein Name innerhalb einer Funktion sich auf die Variable auf Modulebene bezieht.",
  },
  "ref-keyword-if": {
    title: "if",
    description: "if führt seinen Block nur aus, wenn seine Bedingung True ist.",
  },
  "ref-keyword-import": {
    title: "import",
    description: "import bringt die Namen eines Moduls in dein Programm.",
  },
  "ref-keyword-in": {
    title: "in",
    description: "in prüft die Mitgliedschaft – True, wenn die linke Seite in der rechten Seite enthalten ist.",
  },
  "ref-keyword-is": {
    title: "is",
    description: "is prüft die Identität – True, wenn beide Namen auf dasselbe Objekt zeigen.",
  },
  "ref-keyword-lambda": {
    title: "lambda",
    description: "lambda erzeugt eine kleine anonyme Funktion in einer Zeile.",
  },
  "ref-keyword-match": {
    title: "match",
    description: "match prüft einen Wert gegen Muster und führt das erste aus, das passt.",
  },
  "ref-keyword-none": {
    title: "None",
    description: "None bedeutet 'hier kein Wert' – das Fehlen eines Werts.",
  },
  "ref-keyword-nonlocal": {
    title: "nonlocal",
    description: "nonlocal sagt, dass ein Name innerhalb einer verschachtelten Funktion sich auf die Variable der umschließenden Funktion bezieht.",
  },
  "ref-keyword-not": {
    title: "not",
    description: "not kehrt einen booleschen Wert um – True wird zu False und umgekehrt.",
  },
  "ref-keyword-or": {
    title: "or",
    description: "or ist ein logischer Operator – True, wenn mindestens eine Seite True ist.",
  },
  "ref-keyword-pass": {
    title: "pass",
    description: "pass tut nichts – ein Platzhalter, wo Python eine Anweisung braucht.",
  },
  "ref-keyword-raise": {
    title: "raise",
    description: "raise wirft absichtlich eine Ausnahme.",
  },
  "ref-keyword-return": {
    title: "return",
    description: "return schickt einen Wert aus einer Funktion zurück und beendet sie.",
  },
  "ref-keyword-true": {
    title: "True",
    description: "True ist der boolesche Wert für 'ja'.",
  },
  "ref-keyword-try": {
    title: "try",
    description: "try umschließt Code, der fehlschlagen könnte, damit except den Fehler abfangen kann.",
  },
  "ref-keyword-while": {
    title: "while",
    description: "while wiederholt seinen Block, solange seine Bedingung True bleibt.",
  },
  "ref-keyword-with": {
    title: "with",
    description: "with öffnet eine Ressource (wie eine Datei) und schließt sie für dich, wenn der Block endet.",
  },
  "ref-keyword-yield": {
    title: "yield",
    description: "yield pausiert eine Generatorfunktion und übergibt dem Aufrufer einen Wert.",
  },
  "python-ref-exceptions": {
    title: "Python-Ausnahmen",
    description: "Python-Ausnahmen – die Fehler, die Python auslöst, und was jede einzelne bedeutet.",
  },
  "ref-exception-arithmeticerror": {
    title: "ArithmeticError",
    description: "ArithmeticError ist die Oberklasse aller arithmetischen Fehler (ZeroDivisionError, OverflowError, FloatingPointError).",
  },
  "ref-exception-assertionerror": {
    title: "AssertionError",
    description: "AssertionError wird ausgelöst, wenn eine assert-Anweisung fehlschlägt.",
  },
  "ref-exception-attributeerror": {
    title: "AttributeError",
    description: "AttributeError wird ausgelöst, wenn du auf ein Attribut oder eine Methode zugreifst, die nicht existiert.",
  },
  "ref-exception-exception": {
    title: "Exception",
    description: "Exception ist die Oberklasse fast jedes Fehlers, den du abfangen wirst.",
  },
  "ref-exception-eoferror": {
    title: "EOFError",
    description: "EOFError wird ausgelöst, wenn input() oder read das Dateiende erreicht, ohne dass noch etwas übrig ist.",
  },
  "ref-exception-floatingpointerror": {
    title: "FloatingPointError",
    description: "FloatingPointError wird ausgelöst, wenn eine Gleitkommaoperation fehlschlägt.",
  },
  "ref-exception-generatorexit": {
    title: "GeneratorExit",
    description: "GeneratorExit wird innerhalb eines Generators ausgelöst, wenn er vorzeitig geschlossen wird.",
  },
  "ref-exception-importerror": {
    title: "ImportError",
    description: "ImportError wird ausgelöst, wenn ein Import das Modul nicht finden kann.",
  },
  "ref-exception-indentationerror": {
    title: "IndentationError",
    description: "IndentationError wird ausgelöst, wenn die Einrückung eines Blocks falsch ist.",
  },
  "ref-exception-indexerror": {
    title: "IndexError",
    description: "IndexError wird ausgelöst, wenn ein Listen- oder Tupelindex außerhalb des Bereichs liegt.",
  },
  "ref-exception-keyerror": {
    title: "KeyError",
    description: "KeyError wird ausgelöst, wenn ein Dictionary-Schlüssel nicht existiert.",
  },
  "ref-exception-keyboardinterrupt": {
    title: "KeyboardInterrupt",
    description: "KeyboardInterrupt wird ausgelöst, wenn der Nutzer Strg+C drückt.",
  },
  "ref-exception-lookuperror": {
    title: "LookupError",
    description: "LookupError ist die Oberklasse von IndexError und KeyError.",
  },
  "ref-exception-memoryerror": {
    title: "MemoryError",
    description: "MemoryError wird ausgelöst, wenn Python der Speicher ausgeht.",
  },
  "ref-exception-nameerror": {
    title: "NameError",
    description: "NameError wird ausgelöst, wenn du eine Variable verwendest, die nie definiert wurde.",
  },
  "ref-exception-notimplementederror": {
    title: "NotImplementedError",
    description: "NotImplementedError wird ausgelöst, um zu sagen: 'Dieser Teil ist noch nicht geschrieben'.",
  },
  "ref-exception-oserror": {
    title: "OSError",
    description: "OSError wird ausgelöst, wenn das Betriebssystem etwas verweigert (fehlende Datei, keine Berechtigung).",
  },
  "ref-exception-overflowerror": {
    title: "OverflowError",
    description: "OverflowError wird ausgelöst, wenn eine Zahl zu groß für ihren Typ ist.",
  },
  "ref-exception-referenceerror": {
    title: "ReferenceError",
    description: "ReferenceError wird ausgelöst, wenn eine schwache Referenz auf ein Objekt zeigt, das schon weg ist.",
  },
  "ref-exception-runtimeerror": {
    title: "RuntimeError",
    description: "RuntimeError ist ein allgemeiner Fehler dafür, dass zur Laufzeit etwas schiefgeht.",
  },
  "ref-exception-stopiteration": {
    title: "StopIteration",
    description: "StopIteration wird von next() ausgelöst, wenn ein Iterator fertig ist.",
  },
  "ref-exception-syntaxerror": {
    title: "SyntaxError",
    description: "SyntaxError wird ausgelöst, wenn der Code selbst kein gültiges Python ist.",
  },
  "ref-exception-taberror": {
    title: "TabError",
    description: "TabError wird ausgelöst, wenn Tabs und Leerzeichen in der Einrückung gemischt werden.",
  },
  "ref-exception-systemerror": {
    title: "SystemError",
    description: "SystemError wird ausgelöst, wenn der Interpreter selbst auf ein internes Problem stößt.",
  },
  "ref-exception-systemexit": {
    title: "SystemExit",
    description: "SystemExit wird von sys.exit() ausgelöst – es beendet das Programm.",
  },
  "ref-exception-typeerror": {
    title: "TypeError",
    description: "TypeError wird ausgelöst, wenn eine Operation auf den falschen Typ angewendet wird.",
  },
  "ref-exception-unboundlocalerror": {
    title: "UnboundLocalError",
    description: "UnboundLocalError wird ausgelöst, wenn du eine lokale Variable liest, bevor du sie zuweist.",
  },
  "ref-exception-unicodeerror": {
    title: "UnicodeError",
    description: "UnicodeError ist die Oberklasse von UnicodeEncodeError, UnicodeDecodeError und UnicodeTranslateError.",
  },
  "ref-exception-unicodeencodeerror": {
    title: "UnicodeEncodeError",
    description: "UnicodeEncodeError wird ausgelöst, wenn Text nicht in Bytes kodiert werden kann.",
  },
  "ref-exception-unicodedecodeerror": {
    title: "UnicodeDecodeError",
    description: "UnicodeDecodeError wird ausgelöst, wenn Bytes nicht in Text dekodiert werden können.",
  },
  "ref-exception-unicodetranslateerror": {
    title: "UnicodeTranslateError",
    description: "UnicodeTranslateError wird ausgelöst, wenn ein Zeichen nicht übersetzt werden kann.",
  },
  "ref-exception-valueerror": {
    title: "ValueError",
    description: "ValueError wird ausgelöst, wenn ein Wert den richtigen Typ, aber den falschen Inhalt hat.",
  },
  "ref-exception-zerodivisionerror": {
    title: "ZeroDivisionError",
    description: "ZeroDivisionError wird ausgelöst, wenn du durch null teilst.",
  },
  "python-ref-glossary": {
    title: "Python-Glossar",
    description: "Python-Glossar – die Wörter, die Python-Entwickler verwenden, jeweils in einer Zeile erklärt.",
  },
};
