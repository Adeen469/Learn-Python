import type { ReferenceTranslations } from "../types";
export const TRANSLATIONS: ReferenceTranslations = {
  "python-ref-functions": {
    title: "Fonctions intégrées de Python",
    description: "Les fonctions intégrées de Python — toujours disponibles, sans import nécessaire.",
  },
  "ref-func-abs": {
    title: "abs()",
    description: "Renvoie la valeur absolue de l'argument.",
  },
  "ref-func-all": {
    title: "all()",
    description: "Renvoie True si bool(x) est True pour toutes les valeurs x de l'itérable.",
  },
  "ref-func-any": {
    title: "any()",
    description: "Renvoie True si bool(x) est True pour au moins un x de l'itérable.",
  },
  "ref-func-ascii": {
    title: "ascii()",
    description: "Renvoie une représentation ASCII uniquement d'un objet.",
  },
  "ref-func-bin": {
    title: "bin()",
    description: "Renvoie la représentation binaire d'un entier.",
  },
  "ref-func-bool": {
    title: "bool()",
    description: "bool(x) -> bool Renvoie True lorsque l'argument x est vrai, False sinon.",
  },
  "ref-func-bytearray": {
    title: "bytearray()",
    description: "bytearray(iterable_of_ints) -> bytearray bytearray(string, encoding[, errors]) -> bytearray bytearray(bytes_or_buffer) -> copie modifiable de bytes_or_buffer bytearray(int) -> tableau d'octets de la taille donnée par le paramètre initi",
  },
  "ref-func-bytes": {
    title: "bytes()",
    description: "bytes(iterable_of_ints) -> bytes bytes(string, encoding[, errors]) -> bytes bytes(bytes_or_buffer) -> copie immuable de bytes_or_buffer bytes(int) -> objet bytes de la taille donnée par le paramètre, initialisé avec l'octet nul",
  },
  "ref-func-callable": {
    title: "callable()",
    description: "Renvoie si l'objet est appelable (c'est-à-dire une sorte de fonction).",
  },
  "ref-func-chr": {
    title: "chr()",
    description: "Renvoie une chaîne Unicode d'un seul caractère de valeur ordinale i ; 0 <= i <= 0x10ffff.",
  },
  "ref-func-compile": {
    title: "compile()",
    description: "Compile la source en un objet code qui peut être exécuté par exec() ou eval().",
  },
  "ref-func-complex": {
    title: "complex()",
    description: "Crée un nombre complexe à partir d'une partie réelle et d'une partie imaginaire facultative.",
  },
  "ref-func-delattr": {
    title: "delattr()",
    description: "Supprime l'attribut nommé de l'objet donné.",
  },
  "ref-func-dict": {
    title: "dict()",
    description: "dict() -> nouveau dictionnaire vide dict(mapping) -> nouveau dictionnaire initialisé à partir des paires (clé, valeur) d'un objet mapping dict(iterable) -> nouveau dictionnaire initialisé comme via : d = {} for k, v in iterable: d[k] = v dict(**k",
  },
  "ref-func-dir": {
    title: "dir()",
    description: "Affiche les attributs d'un objet.",
  },
  "ref-func-divmod": {
    title: "divmod()",
    description: "Renvoie le tuple (x//y, x%y).",
  },
  "ref-func-enumerate": {
    title: "enumerate()",
    description: "Renvoie un objet enumerate.",
  },
  "ref-func-eval": {
    title: "eval()",
    description: "Évalue la source donnée dans le contexte des variables globales et locales.",
  },
  "ref-func-exec": {
    title: "exec()",
    description: "Exécute la source donnée dans le contexte des variables globales et locales.",
  },
  "ref-func-filter": {
    title: "filter()",
    description: "filter(function or None, iterable) --> objet filter Renvoie un itérateur qui produit les éléments de iterable pour lesquels function(item) est vrai.",
  },
  "ref-func-float": {
    title: "float()",
    description: "Convertit une chaîne ou un nombre en nombre à virgule flottante, si possible.",
  },
  "ref-func-format": {
    title: "format()",
    description: "Renvoie type(value).__format__(value, format_spec) De nombreux types intégrés implémentent format_spec selon le mini-langage de spécification de format.",
  },
  "ref-func-frozenset": {
    title: "frozenset()",
    description: "frozenset() -> objet frozenset vide frozenset(iterable) -> objet frozenset Construit une collection immuable non ordonnée d'éléments uniques.",
  },
  "ref-func-getattr": {
    title: "getattr()",
    description: "Obtient un attribut nommé à partir d'un objet.",
  },
  "ref-func-globals": {
    title: "globals()",
    description: "Renvoie le dictionnaire contenant les variables globales de la portée actuelle.",
  },
  "ref-func-hasattr": {
    title: "hasattr()",
    description: "Renvoie si l'objet possède un attribut portant le nom donné.",
  },
  "ref-func-hex": {
    title: "hex()",
    description: "Renvoie la représentation hexadécimale d'un entier.",
  },
  "ref-func-id": {
    title: "id()",
    description: "Renvoie l'identité d'un objet.",
  },
  "ref-func-input": {
    title: "input()",
    description: "Lit une chaîne depuis l'entrée standard.",
  },
  "ref-func-int": {
    title: "int()",
    description: "int([x]) -> entier int(x, base=10) -> entier Convertit un nombre ou une chaîne en entier, ou renvoie 0 si aucun argument n'est donné.",
  },
  "ref-func-isinstance": {
    title: "isinstance()",
    description: "Renvoie si un objet est une instance d'une classe ou d'une sous-classe de celle-ci.",
  },
  "ref-func-issubclass": {
    title: "issubclass()",
    description: "Renvoie si 'cls' est dérivée d'une autre classe ou est la même classe.",
  },
  "ref-func-iter": {
    title: "iter()",
    description: "Obtient un itérateur à partir d'un objet.",
  },
  "ref-func-len": {
    title: "len()",
    description: "Renvoie le nombre d'éléments d'un conteneur.",
  },
  "ref-func-list": {
    title: "list()",
    description: "Séquence modifiable intégrée.",
  },
  "ref-func-locals": {
    title: "locals()",
    description: "Renvoie un dictionnaire contenant les variables locales de la portée actuelle.",
  },
  "ref-func-map": {
    title: "map()",
    description: "map(func, *iterables) --> objet map Crée un itérateur qui calcule la fonction en utilisant les arguments de chacun des itérables.",
  },
  "ref-func-max": {
    title: "max()",
    description: "max(iterable, *[, default=obj, key=func]) -> valeur max(arg1, arg2, *args, *[, key=func]) -> valeur Avec un seul argument itérable, renvoie son plus grand élément.",
  },
  "ref-func-memoryview": {
    title: "memoryview()",
    description: "Crée un nouvel objet memoryview qui fait référence à l'objet donné.",
  },
  "ref-func-min": {
    title: "min()",
    description: "min(iterable, *[, default=obj, key=func]) -> valeur min(arg1, arg2, *args, *[, key=func]) -> valeur Avec un seul argument itérable, renvoie son plus petit élément.",
  },
  "ref-func-next": {
    title: "next()",
    description: "Renvoie l'élément suivant de l'itérateur.",
  },
  "ref-func-object": {
    title: "object()",
    description: "La classe de base de la hiérarchie des classes.",
  },
  "ref-func-oct": {
    title: "oct()",
    description: "Renvoie la représentation octale d'un entier.",
  },
  "ref-func-open": {
    title: "open()",
    description: "Ouvre un fichier et renvoie un flux.",
  },
  "ref-func-ord": {
    title: "ord()",
    description: "Renvoie le point de code Unicode d'une chaîne d'un seul caractère.",
  },
  "ref-func-pow": {
    title: "pow()",
    description: "Équivalent à base**exp avec 2 arguments ou base**exp % mod avec 3 arguments Certains types, comme les entiers, peuvent utiliser un algorithme plus efficace lorsqu'ils sont appelés avec la forme à trois arguments.",
  },
  "ref-func-print": {
    title: "print()",
    description: "Affiche les valeurs dans un flux, ou dans sys.stdout par défaut.",
  },
  "ref-func-range": {
    title: "range()",
    description: "range(stop) -> objet range range(start, stop[, step]) -> objet range Renvoie un objet qui produit une séquence d'entiers de start (inclus) à stop (exclu) par pas de step.",
  },
  "ref-func-reversed": {
    title: "reversed()",
    description: "Renvoie un itérateur inversé sur les valeurs de la séquence donnée.",
  },
  "ref-func-round": {
    title: "round()",
    description: "Arrondit un nombre à une précision donnée en chiffres décimaux.",
  },
  "ref-func-set": {
    title: "set()",
    description: "set() -> nouvel objet set vide set(iterable) -> nouvel objet set Construit une collection non ordonnée d'éléments uniques.",
  },
  "ref-func-setattr": {
    title: "setattr()",
    description: "Définit l'attribut nommé de l'objet donné à la valeur spécifiée.",
  },
  "ref-func-slice": {
    title: "slice()",
    description: "slice(stop) slice(start, stop[, step]) Crée un objet slice.",
  },
  "ref-func-sorted": {
    title: "sorted()",
    description: "Renvoie une nouvelle liste contenant tous les éléments de l'itérable dans l'ordre croissant.",
  },
  "ref-func-str": {
    title: "str()",
    description: "str(object='') -> str str(bytes_or_buffer[, encoding[, errors]]) -> str Crée un nouvel objet chaîne à partir de l'objet donné.",
  },
  "ref-func-sum": {
    title: "sum()",
    description: "Renvoie la somme d'une valeur 'start' (par défaut : 0) plus un itérable de nombres Lorsque l'itérable est vide, renvoie la valeur start.",
  },
  "ref-func-super": {
    title: "super()",
    description: "super() -> identique à super(__class__, <premier argument>) super(type) -> objet super non lié super(type, obj) -> objet super lié ; nécessite isinstance(obj, type) super(type, type2) -> objet super lié ; nécessite issubcla",
  },
  "ref-func-tuple": {
    title: "tuple()",
    description: "Séquence immuable intégrée.",
  },
  "ref-func-type": {
    title: "type()",
    description: "type(object) -> le type de l'objet type(name, bases, dict, **kwds) -> un nouveau type",
  },
  "ref-func-vars": {
    title: "vars()",
    description: "Affiche vars.",
  },
  "ref-func-zip": {
    title: "zip()",
    description: "zip(*iterables, strict=False) --> Produit des tuples jusqu'à ce qu'une entrée soit épuisée.",
  },
  "python-ref-string": {
    title: "Méthodes de chaîne de caractères Python",
    description: "Méthodes de chaîne — toutes les méthodes que vous pouvez appeler sur une str.",
  },
  "ref-string-capitalize": {
    title: "capitalize()",
    description: "Renvoie une version de la chaîne avec la première lettre en majuscule.",
  },
  "ref-string-casefold": {
    title: "casefold()",
    description: "Renvoie une version de la chaîne adaptée aux comparaisons sans distinction de casse.",
  },
  "ref-string-center": {
    title: "center()",
    description: "Renvoie une chaîne centrée de longueur width.",
  },
  "ref-string-count": {
    title: "count()",
    description: "S.count(sub[, start[, end]]) -> int Renvoie le nombre d'occurrences non superposées de la sous-chaîne sub dans la chaîne S[start:end].",
  },
  "ref-string-encode": {
    title: "encode()",
    description: "Encode la chaîne en utilisant le codec enregistré pour l'encodage.",
  },
  "ref-string-endswith": {
    title: "endswith()",
    description: "S.endswith(suffix[, start[, end]]) -> bool Renvoie True si S se termine par le suffixe spécifié, False sinon.",
  },
  "ref-string-expandtabs": {
    title: "expandtabs()",
    description: "Renvoie une copie dans laquelle tous les caractères de tabulation sont remplacés par des espaces.",
  },
  "ref-string-find": {
    title: "find()",
    description: "S.find(sub[, start[, end]]) -> int Renvoie l'indice le plus bas dans S où la sous-chaîne sub est trouvée, de sorte que sub soit contenue dans S[start:end].",
  },
  "ref-string-format": {
    title: "format()",
    description: "S.format(*args, **kwargs) -> str Renvoie une version formatée de S, en utilisant les substitutions de args et kwargs.",
  },
  "ref-string-format-map": {
    title: "format_map()",
    description: "format_map() — voir l'exemple ci-dessous.",
  },
  "ref-string-index": {
    title: "index()",
    description: "S.index(sub[, start[, end]]) -> int Renvoie l'indice le plus bas dans S où la sous-chaîne sub est trouvée, de sorte que sub soit contenue dans S[start:end].",
  },
  "ref-string-isalnum": {
    title: "isalnum()",
    description: "Renvoie True si la chaîne est une chaîne alphanumérique, False sinon.",
  },
  "ref-string-isalpha": {
    title: "isalpha()",
    description: "Renvoie True si la chaîne est une chaîne alphabétique, False sinon.",
  },
  "ref-string-isascii": {
    title: "isascii()",
    description: "Renvoie True si tous les caractères de la chaîne sont ASCII, False sinon.",
  },
  "ref-string-isdecimal": {
    title: "isdecimal()",
    description: "Renvoie True si la chaîne est une chaîne décimale, False sinon.",
  },
  "ref-string-isdigit": {
    title: "isdigit()",
    description: "Renvoie True si la chaîne est une chaîne de chiffres, False sinon.",
  },
  "ref-string-isidentifier": {
    title: "isidentifier()",
    description: "Renvoie True si la chaîne est un identifiant Python valide, False sinon.",
  },
  "ref-string-islower": {
    title: "islower()",
    description: "Renvoie True si la chaîne est une chaîne en minuscules, False sinon.",
  },
  "ref-string-isnumeric": {
    title: "isnumeric()",
    description: "Renvoie True si la chaîne est une chaîne numérique, False sinon.",
  },
  "ref-string-isprintable": {
    title: "isprintable()",
    description: "Renvoie True si la chaîne est imprimable, False sinon.",
  },
  "ref-string-isspace": {
    title: "isspace()",
    description: "Renvoie True si la chaîne est une chaîne d'espaces, False sinon.",
  },
  "ref-string-istitle": {
    title: "istitle()",
    description: "Renvoie True si la chaîne est une chaîne en casse de titre, False sinon.",
  },
  "ref-string-isupper": {
    title: "isupper()",
    description: "Renvoie True si la chaîne est une chaîne en majuscules, False sinon.",
  },
  "ref-string-join": {
    title: "join()",
    description: "Concatène un nombre quelconque de chaînes.",
  },
  "ref-string-ljust": {
    title: "ljust()",
    description: "Renvoie une chaîne justifiée à gauche de longueur width.",
  },
  "ref-string-lower": {
    title: "lower()",
    description: "Renvoie une copie de la chaîne convertie en minuscules.",
  },
  "ref-string-lstrip": {
    title: "lstrip()",
    description: "Renvoie une copie de la chaîne sans les espaces de début.",
  },
  "ref-string-maketrans": {
    title: "maketrans()",
    description: "Renvoie une table de traduction utilisable pour str.translate().",
  },
  "ref-string-partition": {
    title: "partition()",
    description: "Divise la chaîne en trois parties en utilisant le séparateur donné.",
  },
  "ref-string-replace": {
    title: "replace()",
    description: "Renvoie une copie avec toutes les occurrences de la sous-chaîne old remplacées par new.",
  },
  "ref-string-rfind": {
    title: "rfind()",
    description: "S.rfind(sub[, start[, end]]) -> int Renvoie l'indice le plus élevé dans S où la sous-chaîne sub est trouvée, de sorte que sub soit contenue dans S[start:end].",
  },
  "ref-string-rindex": {
    title: "rindex()",
    description: "S.rindex(sub[, start[, end]]) -> int Renvoie l'indice le plus élevé dans S où la sous-chaîne sub est trouvée, de sorte que sub soit contenue dans S[start:end].",
  },
  "ref-string-rjust": {
    title: "rjust()",
    description: "Renvoie une chaîne justifiée à droite de longueur width.",
  },
  "ref-string-rpartition": {
    title: "rpartition()",
    description: "Divise la chaîne en trois parties en utilisant le séparateur donné.",
  },
  "ref-string-rsplit": {
    title: "rsplit()",
    description: "Renvoie une liste des sous-chaînes de la chaîne, en utilisant sep comme séparateur.",
  },
  "ref-string-rstrip": {
    title: "rstrip()",
    description: "Renvoie une copie de la chaîne sans les espaces de fin.",
  },
  "ref-string-split": {
    title: "split()",
    description: "Renvoie une liste des sous-chaînes de la chaîne, en utilisant sep comme séparateur.",
  },
  "ref-string-splitlines": {
    title: "splitlines()",
    description: "Renvoie une liste des lignes de la chaîne, en coupant aux limites de ligne.",
  },
  "ref-string-startswith": {
    title: "startswith()",
    description: "S.startswith(prefix[, start[, end]]) -> bool Renvoie True si S commence par le préfixe spécifié, False sinon.",
  },
  "ref-string-strip": {
    title: "strip()",
    description: "Renvoie une copie de la chaîne sans les espaces de début et de fin.",
  },
  "ref-string-swapcase": {
    title: "swapcase()",
    description: "Convertit les majuscules en minuscules et les minuscules en majuscules.",
  },
  "ref-string-title": {
    title: "title()",
    description: "Renvoie une version de la chaîne où chaque mot commence par une majuscule.",
  },
  "ref-string-translate": {
    title: "translate()",
    description: "Remplace chaque caractère de la chaîne en utilisant la table de traduction donnée.",
  },
  "ref-string-upper": {
    title: "upper()",
    description: "Renvoie une copie de la chaîne convertie en majuscules.",
  },
  "ref-string-zfill": {
    title: "zfill()",
    description: "Complète une chaîne numérique avec des zéros à gauche, pour remplir un champ de la largeur donnée.",
  },
  "python-ref-list": {
    title: "Méthodes de liste Python",
    description: "Méthodes de liste — toutes les méthodes que vous pouvez appeler sur une list.",
  },
  "ref-list-append": {
    title: "append()",
    description: "Ajoute un objet à la fin de la liste.",
  },
  "ref-list-clear": {
    title: "clear()",
    description: "Supprime tous les éléments de la liste.",
  },
  "ref-list-copy": {
    title: "copy()",
    description: "Renvoie une copie superficielle de la liste.",
  },
  "ref-list-count": {
    title: "count()",
    description: "Renvoie le nombre d'occurrences de value.",
  },
  "ref-list-extend": {
    title: "extend()",
    description: "Étend la liste en y ajoutant les éléments de l'itérable.",
  },
  "ref-list-index": {
    title: "index()",
    description: "Renvoie le premier indice de value.",
  },
  "ref-list-insert": {
    title: "insert()",
    description: "Insère un objet avant index.",
  },
  "ref-list-pop": {
    title: "pop()",
    description: "Supprime et renvoie l'élément à index (le dernier par défaut).",
  },
  "ref-list-remove": {
    title: "remove()",
    description: "Supprime la première occurrence de value.",
  },
  "ref-list-reverse": {
    title: "reverse()",
    description: "Inverse *SUR PLACE*.",
  },
  "ref-list-sort": {
    title: "sort()",
    description: "Trie la liste par ordre croissant et renvoie None.",
  },
  "python-ref-dictionary": {
    title: "Méthodes de dictionnaire Python",
    description: "Méthodes de dictionnaire — toutes les méthodes que vous pouvez appeler sur un dict.",
  },
  "ref-dictionary-clear": {
    title: "clear()",
    description: "D.clear() -> None.",
  },
  "ref-dictionary-copy": {
    title: "copy()",
    description: "D.copy() -> une copie superficielle de D",
  },
  "ref-dictionary-fromkeys": {
    title: "fromkeys()",
    description: "Crée un nouveau dictionnaire avec les clés de iterable et les valeurs définies à value.",
  },
  "ref-dictionary-get": {
    title: "get()",
    description: "Renvoie la valeur de key si key est dans le dictionnaire, sinon default.",
  },
  "ref-dictionary-items": {
    title: "items()",
    description: "D.items() -> un objet de type ensemble donnant une vue sur les éléments de D",
  },
  "ref-dictionary-keys": {
    title: "keys()",
    description: "D.keys() -> un objet de type ensemble donnant une vue sur les clés de D",
  },
  "ref-dictionary-pop": {
    title: "pop()",
    description: "D.pop(k[,d]) -> v, supprime la clé spécifiée et renvoie la valeur correspondante.",
  },
  "ref-dictionary-popitem": {
    title: "popitem()",
    description: "Supprime et renvoie une paire (clé, valeur) sous forme de tuple à 2 éléments.",
  },
  "ref-dictionary-setdefault": {
    title: "setdefault()",
    description: "Insère key avec une valeur de default si key n'est pas dans le dictionnaire.",
  },
  "ref-dictionary-update": {
    title: "update()",
    description: "D.update([E, ]**F) -> None.",
  },
  "ref-dictionary-values": {
    title: "values()",
    description: "D.values() -> un objet donnant une vue sur les valeurs de D",
  },
  "python-ref-tuple": {
    title: "Méthodes de tuple Python",
    description: "Méthodes de tuple — toutes les méthodes que vous pouvez appeler sur un tuple.",
  },
  "ref-tuple-count": {
    title: "count()",
    description: "Renvoie le nombre d'occurrences de value.",
  },
  "ref-tuple-index": {
    title: "index()",
    description: "Renvoie le premier indice de value.",
  },
  "python-ref-set": {
    title: "Méthodes d'ensemble Python",
    description: "Méthodes d'ensemble — toutes les méthodes que vous pouvez appeler sur un set.",
  },
  "ref-set-add": {
    title: "add()",
    description: "Ajoute un élément à un ensemble.",
  },
  "ref-set-clear": {
    title: "clear()",
    description: "Supprime tous les éléments de cet ensemble.",
  },
  "ref-set-copy": {
    title: "copy()",
    description: "Renvoie une copie superficielle d'un ensemble.",
  },
  "ref-set-difference": {
    title: "difference()",
    description: "Renvoie la différence de deux ensembles ou plus sous forme d'un nouvel ensemble.",
  },
  "ref-set-difference-update": {
    title: "difference_update()",
    description: "difference_update() — voir l'exemple ci-dessous.",
  },
  "ref-set-discard": {
    title: "discard()",
    description: "Supprime un élément d'un ensemble s'il en est membre.",
  },
  "ref-set-intersection": {
    title: "intersection()",
    description: "Renvoie l'intersection de deux ensembles sous forme d'un nouvel ensemble.",
  },
  "ref-set-intersection-update": {
    title: "intersection_update()",
    description: "intersection_update() — voir l'exemple ci-dessous.",
  },
  "ref-set-isdisjoint": {
    title: "isdisjoint()",
    description: "Renvoie True si deux ensembles ont une intersection nulle.",
  },
  "ref-set-issubset": {
    title: "issubset()",
    description: "Teste si chaque élément de l'ensemble est dans other.",
  },
  "ref-set-lessthan": {
    title: "<",
    description: "< vérifie si un ensemble est un sous-ensemble propre d'un autre ensemble.",
  },
  "ref-set-issuperset": {
    title: "issuperset()",
    description: "Teste si chaque élément de other est dans l'ensemble.",
  },
  "ref-set-greaterthan": {
    title: ">",
    description: "> vérifie si un ensemble est un sur-ensemble propre d'un autre ensemble.",
  },
  "ref-set-pop": {
    title: "pop()",
    description: "Supprime et renvoie un élément arbitraire de l'ensemble.",
  },
  "ref-set-remove": {
    title: "remove()",
    description: "Supprime un élément d'un ensemble ; il doit en être membre.",
  },
  "ref-set-symmetric-difference": {
    title: "symmetric_difference()",
    description: "symmetric_difference() — voir l'exemple ci-dessous.",
  },
  "ref-set-symmetric-difference-update": {
    title: "symmetric_difference_update()",
    description: "symmetric_difference_update() — voir l'exemple ci-dessous.",
  },
  "ref-set-union": {
    title: "union()",
    description: "Renvoie l'union des ensembles sous forme d'un nouvel ensemble.",
  },
  "ref-set-update": {
    title: "update()",
    description: "Met à jour un ensemble avec l'union de lui-même et des autres.",
  },
  "python-reference": {
    title: "Aperçu de Python",
    description: "Référence Python — toutes les fonctions intégrées, méthodes, mots-clés et exceptions en un seul endroit.",
  },
  "python-ref-file": {
    title: "Méthodes de fichier Python",
    description: "Méthodes de fichier — toutes les méthodes que vous pouvez appeler sur un objet fichier ouvert.",
  },
  "ref-file-close": {
    title: "close()",
    description: "Ferme l'objet IO.",
  },
  "ref-file-fileno": {
    title: "fileno()",
    description: "Renvoie le descripteur de fichier sous-jacent s'il en existe un.",
  },
  "ref-file-flush": {
    title: "flush()",
    description: "Vide les tampons d'écriture, le cas échéant.",
  },
  "ref-file-isatty": {
    title: "isatty()",
    description: "Renvoie si ce flux est un flux « interactif ».",
  },
  "ref-file-read": {
    title: "read()",
    description: "Lit au plus size caractères, renvoyés sous forme de chaîne.",
  },
  "ref-file-readable": {
    title: "readable()",
    description: "Renvoie True si l'objet IO peut être lu.",
  },
  "ref-file-readline": {
    title: "readline()",
    description: "Lit jusqu'à la nouvelle ligne ou la fin du fichier.",
  },
  "ref-file-readlines": {
    title: "readlines()",
    description: "Renvoie une liste des lignes du flux.",
  },
  "ref-file-seek": {
    title: "seek()",
    description: "Modifie la position dans le flux.",
  },
  "ref-file-seekable": {
    title: "seekable()",
    description: "Renvoie True si la position de l'objet IO peut être modifiée.",
  },
  "ref-file-tell": {
    title: "tell()",
    description: "Indique la position actuelle dans le fichier.",
  },
  "ref-file-truncate": {
    title: "truncate()",
    description: "Tronque size à pos.",
  },
  "ref-file-writable": {
    title: "writable()",
    description: "Renvoie True si l'objet IO peut être écrit.",
  },
  "ref-file-write": {
    title: "write()",
    description: "Écrit une chaîne dans le fichier.",
  },
  "ref-file-writelines": {
    title: "writelines()",
    description: "Écrit une liste de lignes dans le flux.",
  },
  "python-ref-keywords": {
    title: "Mots-clés Python",
    description: "Mots-clés Python — les mots réservés qui constituent le langage.",
  },
  "ref-keyword-and": {
    title: "and",
    description: "and est un opérateur logique — True seulement lorsque les deux côtés sont True.",
  },
  "ref-keyword-as": {
    title: "as",
    description: "as donne un nom différent à un module importé ou à une exception interceptée.",
  },
  "ref-keyword-assert": {
    title: "assert",
    description: "assert vérifie une condition — si elle est False, Python lève AssertionError.",
  },
  "ref-keyword-async": {
    title: "async",
    description: "async marque une fonction comme asynchrone — elle renvoie une coroutine que vous exécutez avec await.",
  },
  "ref-keyword-await": {
    title: "await",
    description: "await met en pause une fonction async jusqu'à ce que ce qu'elle attend soit terminé.",
  },
  "ref-keyword-break": {
    title: "break",
    description: "break quitte la boucle la plus proche immédiatement.",
  },
  "ref-keyword-case": {
    title: "case",
    description: "case est une branche d'une instruction match — elle s'exécute lorsque son motif correspond.",
  },
  "ref-keyword-class": {
    title: "class",
    description: "class définit une nouvelle classe — un modèle pour les objets.",
  },
  "ref-keyword-continue": {
    title: "continue",
    description: "continue ignore le reste du tour de boucle en cours et passe au suivant.",
  },
  "ref-keyword-def": {
    title: "def",
    description: "def définit une fonction.",
  },
  "ref-keyword-del": {
    title: "del",
    description: "del supprime une variable, un élément ou une tranche.",
  },
  "ref-keyword-elif": {
    title: "elif",
    description: "elif est une seconde condition, vérifiée uniquement lorsque le if au-dessus était False.",
  },
  "ref-keyword-else": {
    title: "else",
    description: "else s'exécute lorsque le if (et les elif) au-dessus étaient tous False.",
  },
  "ref-keyword-except": {
    title: "except",
    description: "except intercepte une erreur levée dans le bloc try correspondant.",
  },
  "ref-keyword-false": {
    title: "False",
    description: "False est la valeur booléenne pour « non ».",
  },
  "ref-keyword-finally": {
    title: "finally",
    description: "finally s'exécute quoi qu'il arrive — erreur ou non — après le bloc try.",
  },
  "ref-keyword-for": {
    title: "for",
    description: "for parcourt chaque élément d'une séquence, un à la fois.",
  },
  "ref-keyword-from": {
    title: "from",
    description: "from importe des noms spécifiques depuis un module.",
  },
  "ref-keyword-global": {
    title: "global",
    description: "global indique qu'un nom dans une fonction fait référence à la variable au niveau du module.",
  },
  "ref-keyword-if": {
    title: "if",
    description: "if exécute son bloc uniquement lorsque sa condition est True.",
  },
  "ref-keyword-import": {
    title: "import",
    description: "import apporte les noms d'un module dans votre programme.",
  },
  "ref-keyword-in": {
    title: "in",
    description: "in vérifie l'appartenance — True lorsque le côté gauche est à l'intérieur du côté droit.",
  },
  "ref-keyword-is": {
    title: "is",
    description: "is vérifie l'identité — True lorsque les deux noms pointent vers le même objet.",
  },
  "ref-keyword-lambda": {
    title: "lambda",
    description: "lambda crée une petite fonction anonyme en une ligne.",
  },
  "ref-keyword-match": {
    title: "match",
    description: "match compare une valeur à des motifs et exécute le premier qui correspond.",
  },
  "ref-keyword-none": {
    title: "None",
    description: "None signifie « aucune valeur ici » — l'absence de valeur.",
  },
  "ref-keyword-nonlocal": {
    title: "nonlocal",
    description: "nonlocal indique qu'un nom dans une fonction imbriquée fait référence à la variable de la fonction englobante.",
  },
  "ref-keyword-not": {
    title: "not",
    description: "not inverse un booléen — True devient False et inversement.",
  },
  "ref-keyword-or": {
    title: "or",
    description: "or est un opérateur logique — True lorsqu'au moins un côté est True.",
  },
  "ref-keyword-pass": {
    title: "pass",
    description: "pass ne fait rien — un espace réservé là où Python a besoin d'une instruction.",
  },
  "ref-keyword-raise": {
    title: "raise",
    description: "raise lève une exception volontairement.",
  },
  "ref-keyword-return": {
    title: "return",
    description: "return renvoie une valeur hors de la fonction et la termine.",
  },
  "ref-keyword-true": {
    title: "True",
    description: "True est la valeur booléenne pour « oui ».",
  },
  "ref-keyword-try": {
    title: "try",
    description: "try entoure du code qui pourrait échouer, pour que except puisse intercepter l'erreur.",
  },
  "ref-keyword-while": {
    title: "while",
    description: "while répète son bloc tant que sa condition reste True.",
  },
  "ref-keyword-with": {
    title: "with",
    description: "with ouvre une ressource (comme un fichier) et la ferme pour vous lorsque le bloc se termine.",
  },
  "ref-keyword-yield": {
    title: "yield",
    description: "yield met en pause une fonction génératrice et remet une valeur à l'appelant.",
  },
  "python-ref-exceptions": {
    title: "Exceptions Python",
    description: "Exceptions Python — les erreurs que Python lève, et ce que chacune signifie.",
  },
  "ref-exception-arithmeticerror": {
    title: "ArithmeticError",
    description: "ArithmeticError est le parent de toutes les erreurs arithmétiques (ZeroDivisionError, OverflowError, FloatingPointError).",
  },
  "ref-exception-assertionerror": {
    title: "AssertionError",
    description: "AssertionError est levée lorsqu'une instruction assert échoue.",
  },
  "ref-exception-attributeerror": {
    title: "AttributeError",
    description: "AttributeError est levée lorsque vous accédez à un attribut ou une méthode qui n'existe pas.",
  },
  "ref-exception-exception": {
    title: "Exception",
    description: "Exception est le parent de presque toutes les erreurs que vous intercepterez.",
  },
  "ref-exception-eoferror": {
    title: "EOFError",
    description: "EOFError est levée lorsque input() ou read atteint la fin du fichier sans plus rien à lire.",
  },
  "ref-exception-floatingpointerror": {
    title: "FloatingPointError",
    description: "FloatingPointError est levée lorsqu'une opération sur un flottant échoue.",
  },
  "ref-exception-generatorexit": {
    title: "GeneratorExit",
    description: "GeneratorExit est levée dans un générateur lorsqu'il est fermé prématurément.",
  },
  "ref-exception-importerror": {
    title: "ImportError",
    description: "ImportError est levée lorsqu'un import ne trouve pas le module.",
  },
  "ref-exception-indentationerror": {
    title: "IndentationError",
    description: "IndentationError est levée lorsque l'indentation d'un bloc est incorrecte.",
  },
  "ref-exception-indexerror": {
    title: "IndexError",
    description: "IndexError est levée lorsqu'un indice de liste ou de tuple est hors limites.",
  },
  "ref-exception-keyerror": {
    title: "KeyError",
    description: "KeyError est levée lorsqu'une clé de dictionnaire n'existe pas.",
  },
  "ref-exception-keyboardinterrupt": {
    title: "KeyboardInterrupt",
    description: "KeyboardInterrupt est levée lorsque l'utilisateur appuie sur Ctrl+C.",
  },
  "ref-exception-lookuperror": {
    title: "LookupError",
    description: "LookupError est le parent de IndexError et KeyError.",
  },
  "ref-exception-memoryerror": {
    title: "MemoryError",
    description: "MemoryError est levée lorsque Python manque de mémoire.",
  },
  "ref-exception-nameerror": {
    title: "NameError",
    description: "NameError est levée lorsque vous utilisez une variable qui n'a jamais été définie.",
  },
  "ref-exception-notimplementederror": {
    title: "NotImplementedError",
    description: "NotImplementedError est levée pour dire « cette partie n'est pas encore écrite ».",
  },
  "ref-exception-oserror": {
    title: "OSError",
    description: "OSError est levée lorsque le système d'exploitation refuse quelque chose (fichier manquant, pas d'autorisation).",
  },
  "ref-exception-overflowerror": {
    title: "OverflowError",
    description: "OverflowError est levée lorsqu'un nombre est trop grand pour son type.",
  },
  "ref-exception-referenceerror": {
    title: "ReferenceError",
    description: "ReferenceError est levée lorsqu'une référence faible pointe vers un objet qui n'existe plus.",
  },
  "ref-exception-runtimeerror": {
    title: "RuntimeError",
    description: "RuntimeError est une erreur générale pour quelque chose qui tourne mal à l'exécution.",
  },
  "ref-exception-stopiteration": {
    title: "StopIteration",
    description: "StopIteration est levée par next() lorsqu'un itérateur est terminé.",
  },
  "ref-exception-syntaxerror": {
    title: "SyntaxError",
    description: "SyntaxError est levée lorsque le code lui-même n'est pas du Python valide.",
  },
  "ref-exception-taberror": {
    title: "TabError",
    description: "TabError est levée lorsque des tabulations et des espaces sont mélangés dans l'indentation.",
  },
  "ref-exception-systemerror": {
    title: "SystemError",
    description: "SystemError est levée lorsque l'interpréteur lui-même rencontre un problème interne.",
  },
  "ref-exception-systemexit": {
    title: "SystemExit",
    description: "SystemExit est levée par sys.exit() — elle termine le programme.",
  },
  "ref-exception-typeerror": {
    title: "TypeError",
    description: "TypeError est levée lorsqu'une opération est utilisée sur le mauvais type.",
  },
  "ref-exception-unboundlocalerror": {
    title: "UnboundLocalError",
    description: "UnboundLocalError est levée lorsque vous lisez une variable locale avant de l'avoir assignée.",
  },
  "ref-exception-unicodeerror": {
    title: "UnicodeError",
    description: "UnicodeError est le parent de UnicodeEncodeError, UnicodeDecodeError et UnicodeTranslateError.",
  },
  "ref-exception-unicodeencodeerror": {
    title: "UnicodeEncodeError",
    description: "UnicodeEncodeError est levée lorsque du texte ne peut pas être encodé en octets.",
  },
  "ref-exception-unicodedecodeerror": {
    title: "UnicodeDecodeError",
    description: "UnicodeDecodeError est levée lorsque des octets ne peuvent pas être décodés en texte.",
  },
  "ref-exception-unicodetranslateerror": {
    title: "UnicodeTranslateError",
    description: "UnicodeTranslateError est levée lorsqu'un caractère ne peut pas être traduit.",
  },
  "ref-exception-valueerror": {
    title: "ValueError",
    description: "ValueError est levée lorsqu'une valeur a le bon type mais le mauvais contenu.",
  },
  "ref-exception-zerodivisionerror": {
    title: "ZeroDivisionError",
    description: "ZeroDivisionError est levée lorsque vous divisez par zéro.",
  },
  "python-ref-glossary": {
    title: "Glossaire Python",
    description: "Glossaire Python — les mots que les développeurs Python utilisent, expliqués en une ligne chacun.",
  },
};
