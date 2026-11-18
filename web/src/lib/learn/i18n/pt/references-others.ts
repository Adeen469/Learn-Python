import type { ReferenceTranslations } from "../types";
export const TRANSLATIONS: ReferenceTranslations = {
  "python-ref-functions": {
    title: "Funções embutidas do Python",
    description: "As funções embutidas do Python — sempre disponíveis, sem precisar importar.",
  },
  "ref-func-abs": {
    title: "abs()",
    description: "Retorna o valor absoluto do argumento.",
  },
  "ref-func-all": {
    title: "all()",
    description: "Retorna True se bool(x) for True para todos os valores x no iterável.",
  },
  "ref-func-any": {
    title: "any()",
    description: "Retorna True se bool(x) for True para qualquer x no iterável.",
  },
  "ref-func-ascii": {
    title: "ascii()",
    description: "Retorna uma representação contendo apenas ASCII de um objeto.",
  },
  "ref-func-bin": {
    title: "bin()",
    description: "Retorna a representação binária de um inteiro.",
  },
  "ref-func-bool": {
    title: "bool()",
    description: "bool(x) -> bool Retorna True quando o argumento x for verdadeiro, False caso contrário.",
  },
  "ref-func-bytearray": {
    title: "bytearray()",
    description: "bytearray(iterable_of_ints) -> bytearray bytearray(string, encoding[, errors]) -> bytearray bytearray(bytes_or_buffer) -> cópia mutável de bytes_or_buffer bytearray(int) -> array de bytes de tamanho dado pelo parâmetro initi",
  },
  "ref-func-bytes": {
    title: "bytes()",
    description: "bytes(iterable_of_ints) -> bytes bytes(string, encoding[, errors]) -> bytes bytes(bytes_or_buffer) -> cópia imutável de bytes_or_buffer bytes(int) -> objeto bytes de tamanho dado pelo parâmetro inicializado com byte nulo",
  },
  "ref-func-callable": {
    title: "callable()",
    description: "Retorna se o objeto pode ser chamado (ou seja, algum tipo de função).",
  },
  "ref-func-chr": {
    title: "chr()",
    description: "Retorna uma string Unicode de um caractere com ordinal i; 0 <= i <= 0x10ffff.",
  },
  "ref-func-compile": {
    title: "compile()",
    description: "Compila o código-fonte em um objeto de código que pode ser executado por exec() ou eval().",
  },
  "ref-func-complex": {
    title: "complex()",
    description: "Cria um número complexo a partir de uma parte real e de uma parte imaginária opcional.",
  },
  "ref-func-delattr": {
    title: "delattr()",
    description: "Exclui o atributo nomeado do objeto dado.",
  },
  "ref-func-dict": {
    title: "dict()",
    description: "dict() -> novo dicionário vazio dict(mapping) -> novo dicionário inicializado a partir dos pares (key, value) de um objeto mapping dict(iterable) -> novo dicionário inicializado como se fosse via: d = {} for k, v in iterable: d[k] = v dict(**k",
  },
  "ref-func-dir": {
    title: "dir()",
    description: "Mostra os atributos de um objeto.",
  },
  "ref-func-divmod": {
    title: "divmod()",
    description: "Retorna a tupla (x//y, x%y).",
  },
  "ref-func-enumerate": {
    title: "enumerate()",
    description: "Retorna um objeto enumerate.",
  },
  "ref-func-eval": {
    title: "eval()",
    description: "Avalia o código-fonte dado no contexto de globals e locals.",
  },
  "ref-func-exec": {
    title: "exec()",
    description: "Executa o código-fonte dado no contexto de globals e locals.",
  },
  "ref-func-filter": {
    title: "filter()",
    description: "filter(function or None, iterable) --> filter object Retorna um iterador que produz os itens de iterable para os quais function(item) é verdadeira.",
  },
  "ref-func-float": {
    title: "float()",
    description: "Converte uma string ou um número em um número de ponto flutuante, se possível.",
  },
  "ref-func-format": {
    title: "format()",
    description: "Retorna type(value).__format__(value, format_spec) Muitos tipos embutidos implementam format_spec de acordo com a Mini-linguagem de Especificação de Formato.",
  },
  "ref-func-frozenset": {
    title: "frozenset()",
    description: "frozenset() -> objeto frozenset vazio frozenset(iterable) -> objeto frozenset Constrói uma coleção imutável e não ordenada de elementos únicos.",
  },
  "ref-func-getattr": {
    title: "getattr()",
    description: "Obtém um atributo nomeado de um objeto.",
  },
  "ref-func-globals": {
    title: "globals()",
    description: "Retorna o dicionário que contém as variáveis globais do escopo atual.",
  },
  "ref-func-hasattr": {
    title: "hasattr()",
    description: "Retorna se o objeto tem um atributo com o nome dado.",
  },
  "ref-func-hex": {
    title: "hex()",
    description: "Retorna a representação hexadecimal de um inteiro.",
  },
  "ref-func-id": {
    title: "id()",
    description: "Retorna a identidade de um objeto.",
  },
  "ref-func-input": {
    title: "input()",
    description: "Lê uma string da entrada padrão.",
  },
  "ref-func-int": {
    title: "int()",
    description: "int([x]) -> integer int(x, base=10) -> integer Converte um número ou uma string em um inteiro, ou retorna 0 se nenhum argumento for dado.",
  },
  "ref-func-isinstance": {
    title: "isinstance()",
    description: "Retorna se um objeto é uma instância de uma classe ou de uma subclasse dela.",
  },
  "ref-func-issubclass": {
    title: "issubclass()",
    description: "Retorna se 'cls' é derivada de outra classe ou é a mesma classe.",
  },
  "ref-func-iter": {
    title: "iter()",
    description: "Obtém um iterador de um objeto.",
  },
  "ref-func-len": {
    title: "len()",
    description: "Retorna o número de itens em um contêiner.",
  },
  "ref-func-list": {
    title: "list()",
    description: "Sequência mutável embutida.",
  },
  "ref-func-locals": {
    title: "locals()",
    description: "Retorna um dicionário que contém as variáveis locais do escopo atual.",
  },
  "ref-func-map": {
    title: "map()",
    description: "map(func, *iterables) --> map object Cria um iterador que calcula a função usando argumentos de cada um dos iteráveis.",
  },
  "ref-func-max": {
    title: "max()",
    description: "max(iterable, *[, default=obj, key=func]) -> value max(arg1, arg2, *args, *[, key=func]) -> value Com um único argumento iterável, retorna seu maior item.",
  },
  "ref-func-memoryview": {
    title: "memoryview()",
    description: "Cria um novo objeto memoryview que referencia o objeto dado.",
  },
  "ref-func-min": {
    title: "min()",
    description: "min(iterable, *[, default=obj, key=func]) -> value min(arg1, arg2, *args, *[, key=func]) -> value Com um único argumento iterável, retorna seu menor item.",
  },
  "ref-func-next": {
    title: "next()",
    description: "Retorna o próximo item do iterador.",
  },
  "ref-func-object": {
    title: "object()",
    description: "A classe base da hierarquia de classes.",
  },
  "ref-func-oct": {
    title: "oct()",
    description: "Retorna a representação octal de um inteiro.",
  },
  "ref-func-open": {
    title: "open()",
    description: "Abre um arquivo e retorna um fluxo.",
  },
  "ref-func-ord": {
    title: "ord()",
    description: "Retorna o ponto de código Unicode de uma string de um caractere.",
  },
  "ref-func-pow": {
    title: "pow()",
    description: "Equivalente a base**exp com 2 argumentos ou base**exp % mod com 3 argumentos Alguns tipos, como ints, conseguem usar um algoritmo mais eficiente quando invocados com a forma de três argumentos.",
  },
  "ref-func-print": {
    title: "print()",
    description: "Imprime os valores em um fluxo, ou em sys.stdout por padrão.",
  },
  "ref-func-range": {
    title: "range()",
    description: "range(stop) -> range object range(start, stop[, step]) -> range object Retorna um objeto que produz uma sequência de inteiros de start (inclusivo) até stop (exclusivo) por step.",
  },
  "ref-func-reversed": {
    title: "reversed()",
    description: "Retorna um iterador reverso sobre os valores da sequência dada.",
  },
  "ref-func-round": {
    title: "round()",
    description: "Arredonda um número para uma dada precisão em casas decimais.",
  },
  "ref-func-set": {
    title: "set()",
    description: "set() -> novo objeto set vazio set(iterable) -> novo objeto set Constrói uma coleção não ordenada de elementos únicos.",
  },
  "ref-func-setattr": {
    title: "setattr()",
    description: "Define o atributo nomeado no objeto dado com o valor especificado.",
  },
  "ref-func-slice": {
    title: "slice()",
    description: "slice(stop) slice(start, stop[, step]) Cria um objeto slice.",
  },
  "ref-func-sorted": {
    title: "sorted()",
    description: "Retorna uma nova lista contendo todos os itens do iterável em ordem crescente.",
  },
  "ref-func-str": {
    title: "str()",
    description: "str(object='') -> str str(bytes_or_buffer[, encoding[, errors]]) -> str Cria um novo objeto string a partir do objeto dado.",
  },
  "ref-func-sum": {
    title: "sum()",
    description: "Retorna a soma de um valor 'start' (padrão: 0) mais um iterável de números Quando o iterável está vazio, retorna o valor start.",
  },
  "ref-func-super": {
    title: "super()",
    description: "super() -> o mesmo que super(__class__, <first argument>) super(type) -> objeto super não vinculado super(type, obj) -> objeto super vinculado; requer isinstance(obj, type) super(type, type2) -> objeto super vinculado; requer issubcla",
  },
  "ref-func-tuple": {
    title: "tuple()",
    description: "Sequência imutável embutida.",
  },
  "ref-func-type": {
    title: "type()",
    description: "type(object) -> o tipo do objeto type(name, bases, dict, **kwds) -> um novo tipo",
  },
  "ref-func-vars": {
    title: "vars()",
    description: "Mostra vars.",
  },
  "ref-func-zip": {
    title: "zip()",
    description: "zip(*iterables, strict=False) --> Produz tuplas até que uma entrada se esgote.",
  },
  "python-ref-string": {
    title: "Métodos de string do Python",
    description: "Métodos de string — todos os métodos que você pode chamar em uma str.",
  },
  "ref-string-capitalize": {
    title: "capitalize()",
    description: "Retorna uma versão capitalizada da string.",
  },
  "ref-string-casefold": {
    title: "casefold()",
    description: "Retorna uma versão da string adequada para comparações sem distinção de maiúsculas e minúsculas.",
  },
  "ref-string-center": {
    title: "center()",
    description: "Retorna uma string centralizada de comprimento width.",
  },
  "ref-string-count": {
    title: "count()",
    description: "S.count(sub[, start[, end]]) -> int Retorna o número de ocorrências não sobrepostas da substring sub na string S[start:end].",
  },
  "ref-string-encode": {
    title: "encode()",
    description: "Codifica a string usando o codec registrado para codificação.",
  },
  "ref-string-endswith": {
    title: "endswith()",
    description: "S.endswith(suffix[, start[, end]]) -> bool Retorna True se S terminar com o sufixo especificado, False caso contrário.",
  },
  "ref-string-expandtabs": {
    title: "expandtabs()",
    description: "Retorna uma cópia na qual todos os caracteres de tabulação são expandidos usando espaços.",
  },
  "ref-string-find": {
    title: "find()",
    description: "S.find(sub[, start[, end]]) -> int Retorna o menor índice em S onde a substring sub é encontrada, de modo que sub esteja contida em S[start:end].",
  },
  "ref-string-format": {
    title: "format()",
    description: "S.format(*args, **kwargs) -> str Retorna uma versão formatada de S, usando substituições de args e kwargs.",
  },
  "ref-string-format-map": {
    title: "format_map()",
    description: "format_map() — veja o exemplo abaixo.",
  },
  "ref-string-index": {
    title: "index()",
    description: "S.index(sub[, start[, end]]) -> int Retorna o menor índice em S onde a substring sub é encontrada, de modo que sub esteja contida em S[start:end].",
  },
  "ref-string-isalnum": {
    title: "isalnum()",
    description: "Retorna True se a string for uma string alfanumérica, False caso contrário.",
  },
  "ref-string-isalpha": {
    title: "isalpha()",
    description: "Retorna True se a string for uma string alfabética, False caso contrário.",
  },
  "ref-string-isascii": {
    title: "isascii()",
    description: "Retorna True se todos os caracteres da string forem ASCII, False caso contrário.",
  },
  "ref-string-isdecimal": {
    title: "isdecimal()",
    description: "Retorna True se a string for uma string decimal, False caso contrário.",
  },
  "ref-string-isdigit": {
    title: "isdigit()",
    description: "Retorna True se a string for uma string de dígitos, False caso contrário.",
  },
  "ref-string-isidentifier": {
    title: "isidentifier()",
    description: "Retorna True se a string for um identificador Python válido, False caso contrário.",
  },
  "ref-string-islower": {
    title: "islower()",
    description: "Retorna True se a string for uma string em minúsculas, False caso contrário.",
  },
  "ref-string-isnumeric": {
    title: "isnumeric()",
    description: "Retorna True se a string for uma string numérica, False caso contrário.",
  },
  "ref-string-isprintable": {
    title: "isprintable()",
    description: "Retorna True se a string for imprimível, False caso contrário.",
  },
  "ref-string-isspace": {
    title: "isspace()",
    description: "Retorna True se a string for uma string de espaços em branco, False caso contrário.",
  },
  "ref-string-istitle": {
    title: "istitle()",
    description: "Retorna True se a string for uma string em formato de título, False caso contrário.",
  },
  "ref-string-isupper": {
    title: "isupper()",
    description: "Retorna True se a string for uma string em maiúsculas, False caso contrário.",
  },
  "ref-string-join": {
    title: "join()",
    description: "Concatena qualquer número de strings.",
  },
  "ref-string-ljust": {
    title: "ljust()",
    description: "Retorna uma string justificada à esquerda de comprimento width.",
  },
  "ref-string-lower": {
    title: "lower()",
    description: "Retorna uma cópia da string convertida para minúsculas.",
  },
  "ref-string-lstrip": {
    title: "lstrip()",
    description: "Retorna uma cópia da string com os espaços em branco iniciais removidos.",
  },
  "ref-string-maketrans": {
    title: "maketrans()",
    description: "Retorna uma tabela de tradução utilizável para str.translate().",
  },
  "ref-string-partition": {
    title: "partition()",
    description: "Divide a string em três partes usando o separador dado.",
  },
  "ref-string-replace": {
    title: "replace()",
    description: "Retorna uma cópia com todas as ocorrências da substring old substituídas por new.",
  },
  "ref-string-rfind": {
    title: "rfind()",
    description: "S.rfind(sub[, start[, end]]) -> int Retorna o maior índice em S onde a substring sub é encontrada, de modo que sub esteja contida em S[start:end].",
  },
  "ref-string-rindex": {
    title: "rindex()",
    description: "S.rindex(sub[, start[, end]]) -> int Retorna o maior índice em S onde a substring sub é encontrada, de modo que sub esteja contida em S[start:end].",
  },
  "ref-string-rjust": {
    title: "rjust()",
    description: "Retorna uma string justificada à direita de comprimento width.",
  },
  "ref-string-rpartition": {
    title: "rpartition()",
    description: "Divide a string em três partes usando o separador dado.",
  },
  "ref-string-rsplit": {
    title: "rsplit()",
    description: "Retorna uma lista das substrings da string, usando sep como string separadora.",
  },
  "ref-string-rstrip": {
    title: "rstrip()",
    description: "Retorna uma cópia da string com os espaços em branco finais removidos.",
  },
  "ref-string-split": {
    title: "split()",
    description: "Retorna uma lista das substrings da string, usando sep como string separadora.",
  },
  "ref-string-splitlines": {
    title: "splitlines()",
    description: "Retorna uma lista das linhas da string, separando nas quebras de linha.",
  },
  "ref-string-startswith": {
    title: "startswith()",
    description: "S.startswith(prefix[, start[, end]]) -> bool Retorna True se S começar com o prefixo especificado, False caso contrário.",
  },
  "ref-string-strip": {
    title: "strip()",
    description: "Retorna uma cópia da string com os espaços em branco iniciais e finais removidos.",
  },
  "ref-string-swapcase": {
    title: "swapcase()",
    description: "Converte caracteres maiúsculos em minúsculos e caracteres minúsculos em maiúsculos.",
  },
  "ref-string-title": {
    title: "title()",
    description: "Retorna uma versão da string em que cada palavra está em formato de título.",
  },
  "ref-string-translate": {
    title: "translate()",
    description: "Substitui cada caractere da string usando a tabela de tradução dada.",
  },
  "ref-string-upper": {
    title: "upper()",
    description: "Retorna uma cópia da string convertida para maiúsculas.",
  },
  "ref-string-zfill": {
    title: "zfill()",
    description: "Preenche uma string numérica com zeros à esquerda, para preencher um campo da largura dada.",
  },
  "python-ref-list": {
    title: "Métodos de lista do Python",
    description: "Métodos de lista — todos os métodos que você pode chamar em uma list.",
  },
  "ref-list-append": {
    title: "append()",
    description: "Acrescenta object ao final da lista.",
  },
  "ref-list-clear": {
    title: "clear()",
    description: "Remove todos os itens da lista.",
  },
  "ref-list-copy": {
    title: "copy()",
    description: "Retorna uma cópia rasa da lista.",
  },
  "ref-list-count": {
    title: "count()",
    description: "Retorna o número de ocorrências de value.",
  },
  "ref-list-extend": {
    title: "extend()",
    description: "Estende a lista acrescentando elementos do iterável.",
  },
  "ref-list-index": {
    title: "index()",
    description: "Retorna o primeiro índice de value.",
  },
  "ref-list-insert": {
    title: "insert()",
    description: "Insere object antes de index.",
  },
  "ref-list-pop": {
    title: "pop()",
    description: "Remove e retorna o item em index (padrão: o último).",
  },
  "ref-list-remove": {
    title: "remove()",
    description: "Remove a primeira ocorrência de value.",
  },
  "ref-list-reverse": {
    title: "reverse()",
    description: "Inverte *NO LUGAR*.",
  },
  "ref-list-sort": {
    title: "sort()",
    description: "Ordena a lista em ordem crescente e retorna None.",
  },
  "python-ref-dictionary": {
    title: "Métodos de dicionário do Python",
    description: "Métodos de dicionário — todos os métodos que você pode chamar em um dict.",
  },
  "ref-dictionary-clear": {
    title: "clear()",
    description: "D.clear() -> None.",
  },
  "ref-dictionary-copy": {
    title: "copy()",
    description: "D.copy() -> uma cópia rasa de D",
  },
  "ref-dictionary-fromkeys": {
    title: "fromkeys()",
    description: "Cria um novo dicionário com chaves de iterable e valores definidos como value.",
  },
  "ref-dictionary-get": {
    title: "get()",
    description: "Retorna o valor de key se key estiver no dicionário, senão default.",
  },
  "ref-dictionary-items": {
    title: "items()",
    description: "D.items() -> um objeto semelhante a um conjunto que fornece uma visão dos itens de D",
  },
  "ref-dictionary-keys": {
    title: "keys()",
    description: "D.keys() -> um objeto semelhante a um conjunto que fornece uma visão das chaves de D",
  },
  "ref-dictionary-pop": {
    title: "pop()",
    description: "D.pop(k[,d]) -> v, remove a chave especificada e retorna o valor correspondente.",
  },
  "ref-dictionary-popitem": {
    title: "popitem()",
    description: "Remove e retorna um par (key, value) como uma 2-tupla.",
  },
  "ref-dictionary-setdefault": {
    title: "setdefault()",
    description: "Insere key com um valor de default se key não estiver no dicionário.",
  },
  "ref-dictionary-update": {
    title: "update()",
    description: "D.update([E, ]**F) -> None.",
  },
  "ref-dictionary-values": {
    title: "values()",
    description: "D.values() -> um objeto que fornece uma visão dos valores de D",
  },
  "python-ref-tuple": {
    title: "Métodos de tupla do Python",
    description: "Métodos de tupla — todos os métodos que você pode chamar em uma tuple.",
  },
  "ref-tuple-count": {
    title: "count()",
    description: "Retorna o número de ocorrências de value.",
  },
  "ref-tuple-index": {
    title: "index()",
    description: "Retorna o primeiro índice de value.",
  },
  "python-ref-set": {
    title: "Métodos de conjunto do Python",
    description: "Métodos de conjunto — todos os métodos que você pode chamar em um set.",
  },
  "ref-set-add": {
    title: "add()",
    description: "Adiciona um elemento a um set.",
  },
  "ref-set-clear": {
    title: "clear()",
    description: "Remove todos os elementos deste set.",
  },
  "ref-set-copy": {
    title: "copy()",
    description: "Retorna uma cópia rasa de um set.",
  },
  "ref-set-difference": {
    title: "difference()",
    description: "Retorna a diferença de dois ou mais conjuntos como um novo conjunto.",
  },
  "ref-set-difference-update": {
    title: "difference_update()",
    description: "difference_update() — veja o exemplo abaixo.",
  },
  "ref-set-discard": {
    title: "discard()",
    description: "Remove um elemento de um set se ele for um membro.",
  },
  "ref-set-intersection": {
    title: "intersection()",
    description: "Retorna a interseção de dois conjuntos como um novo conjunto.",
  },
  "ref-set-intersection-update": {
    title: "intersection_update()",
    description: "intersection_update() — veja o exemplo abaixo.",
  },
  "ref-set-isdisjoint": {
    title: "isdisjoint()",
    description: "Retorna True se dois conjuntos tiverem uma interseção nula.",
  },
  "ref-set-issubset": {
    title: "issubset()",
    description: "Testa se cada elemento do conjunto está em other.",
  },
  "ref-set-lessthan": {
    title: "<",
    description: "< verifica se um conjunto é um subconjunto próprio de outro conjunto.",
  },
  "ref-set-issuperset": {
    title: "issuperset()",
    description: "Testa se cada elemento de other está no conjunto.",
  },
  "ref-set-greaterthan": {
    title: ">",
    description: "> verifica se um conjunto é um superconjunto próprio de outro conjunto.",
  },
  "ref-set-pop": {
    title: "pop()",
    description: "Remove e retorna um elemento arbitrário do conjunto.",
  },
  "ref-set-remove": {
    title: "remove()",
    description: "Remove um elemento de um conjunto; ele precisa ser um membro.",
  },
  "ref-set-symmetric-difference": {
    title: "symmetric_difference()",
    description: "symmetric_difference() — veja o exemplo abaixo.",
  },
  "ref-set-symmetric-difference-update": {
    title: "symmetric_difference_update()",
    description: "symmetric_difference_update() — veja o exemplo abaixo.",
  },
  "ref-set-union": {
    title: "union()",
    description: "Retorna a união de conjuntos como um novo conjunto.",
  },
  "ref-set-update": {
    title: "update()",
    description: "Atualiza um conjunto com a união dele mesmo com outros.",
  },
  "python-reference": {
    title: "Visão geral do Python",
    description: "Referência do Python — todas as funções embutidas, métodos, palavras-chave e exceções em um só lugar.",
  },
  "python-ref-file": {
    title: "Métodos de arquivo do Python",
    description: "Métodos de arquivo — todos os métodos que você pode chamar em um objeto de arquivo aberto.",
  },
  "ref-file-close": {
    title: "close()",
    description: "Fecha o objeto IO.",
  },
  "ref-file-fileno": {
    title: "fileno()",
    description: "Retorna o descritor de arquivo subjacente, se existir.",
  },
  "ref-file-flush": {
    title: "flush()",
    description: "Esvazia os buffers de escrita, se aplicável.",
  },
  "ref-file-isatty": {
    title: "isatty()",
    description: "Retorna se este é um fluxo 'interativo'.",
  },
  "ref-file-read": {
    title: "read()",
    description: "Lê no máximo size caracteres, retornados como uma string.",
  },
  "ref-file-readable": {
    title: "readable()",
    description: "Retorna True se o objeto IO puder ser lido.",
  },
  "ref-file-readline": {
    title: "readline()",
    description: "Lê até a quebra de linha ou o EOF.",
  },
  "ref-file-readlines": {
    title: "readlines()",
    description: "Retorna uma lista de linhas do fluxo.",
  },
  "ref-file-seek": {
    title: "seek()",
    description: "Muda a posição do fluxo.",
  },
  "ref-file-seekable": {
    title: "seekable()",
    description: "Retorna True se o objeto IO puder ter sua posição alterada.",
  },
  "ref-file-tell": {
    title: "tell()",
    description: "Informa a posição atual do arquivo.",
  },
  "ref-file-truncate": {
    title: "truncate()",
    description: "Trunca size para pos.",
  },
  "ref-file-writable": {
    title: "writable()",
    description: "Retorna True se o objeto IO puder ser escrito.",
  },
  "ref-file-write": {
    title: "write()",
    description: "Escreve string no arquivo.",
  },
  "ref-file-writelines": {
    title: "writelines()",
    description: "Escreve uma lista de linhas no fluxo.",
  },
  "python-ref-keywords": {
    title: "Palavras-chave do Python",
    description: "Palavras-chave do Python — as palavras reservadas que formam a linguagem.",
  },
  "ref-keyword-and": {
    title: "and",
    description: "and é um operador lógico — True somente quando ambos os lados são True.",
  },
  "ref-keyword-as": {
    title: "as",
    description: "as dá a um módulo importado ou a uma exceção capturada um nome diferente.",
  },
  "ref-keyword-assert": {
    title: "assert",
    description: "assert verifica uma condição — se ela for False, o Python gera AssertionError.",
  },
  "ref-keyword-async": {
    title: "async",
    description: "async marca uma função como assíncrona — ela retorna uma coroutine que você executa com await.",
  },
  "ref-keyword-await": {
    title: "await",
    description: "await pausa uma função async até que aquilo que ela espera termine.",
  },
  "ref-keyword-break": {
    title: "break",
    description: "break sai do loop mais próximo imediatamente.",
  },
  "ref-keyword-case": {
    title: "case",
    description: "case é um ramo de uma instrução match — ele executa quando seu padrão se encaixa.",
  },
  "ref-keyword-class": {
    title: "class",
    description: "class define uma nova classe — um modelo para objetos.",
  },
  "ref-keyword-continue": {
    title: "continue",
    description: "continue pula o restante da volta atual do loop e começa a próxima.",
  },
  "ref-keyword-def": {
    title: "def",
    description: "def define uma função.",
  },
  "ref-keyword-del": {
    title: "del",
    description: "del exclui uma variável, um item ou uma fatia.",
  },
  "ref-keyword-elif": {
    title: "elif",
    description: "elif é uma segunda condição, verificada somente quando o if acima dela foi False.",
  },
  "ref-keyword-else": {
    title: "else",
    description: "else executa quando o if (e os elifs) acima dele foram todos False.",
  },
  "ref-keyword-except": {
    title: "except",
    description: "except captura um erro gerado dentro do bloco try correspondente.",
  },
  "ref-keyword-false": {
    title: "False",
    description: "False é o valor booleano para 'não'.",
  },
  "ref-keyword-finally": {
    title: "finally",
    description: "finally executa de qualquer forma — com erro ou sem — após o bloco try.",
  },
  "ref-keyword-for": {
    title: "for",
    description: "for percorre cada item de uma sequência, um de cada vez.",
  },
  "ref-keyword-from": {
    title: "from",
    description: "from importa nomes específicos de um módulo.",
  },
  "ref-keyword-global": {
    title: "global",
    description: "global diz que um nome dentro de uma função se refere à variável de nível de módulo.",
  },
  "ref-keyword-if": {
    title: "if",
    description: "if executa seu bloco somente quando sua condição é True.",
  },
  "ref-keyword-import": {
    title: "import",
    description: "import traz os nomes de um módulo para o seu programa.",
  },
  "ref-keyword-in": {
    title: "in",
    description: "in verifica pertinência — True quando o lado esquerdo está dentro do lado direito.",
  },
  "ref-keyword-is": {
    title: "is",
    description: "is verifica identidade — True quando ambos os nomes apontam para o mesmo objeto.",
  },
  "ref-keyword-lambda": {
    title: "lambda",
    description: "lambda cria uma pequena função anônima em uma linha.",
  },
  "ref-keyword-match": {
    title: "match",
    description: "match verifica um valor em relação a padrões e executa o primeiro que se encaixa.",
  },
  "ref-keyword-none": {
    title: "None",
    description: "None significa 'nenhum valor aqui' — a ausência de um valor.",
  },
  "ref-keyword-nonlocal": {
    title: "nonlocal",
    description: "nonlocal diz que um nome dentro de uma função aninhada se refere à variável da função que a envolve.",
  },
  "ref-keyword-not": {
    title: "not",
    description: "not inverte um booleano — True vira False e vice-versa.",
  },
  "ref-keyword-or": {
    title: "or",
    description: "or é um operador lógico — True quando pelo menos um lado é True.",
  },
  "ref-keyword-pass": {
    title: "pass",
    description: "pass não faz nada — um espaço reservado onde o Python precisa de uma instrução.",
  },
  "ref-keyword-raise": {
    title: "raise",
    description: "raise lança uma exceção de propósito.",
  },
  "ref-keyword-return": {
    title: "return",
    description: "return envia um valor de volta para fora de uma função e a encerra.",
  },
  "ref-keyword-true": {
    title: "True",
    description: "True é o valor booleano para 'sim'.",
  },
  "ref-keyword-try": {
    title: "try",
    description: "try envolve código que pode falhar, para que except possa capturar o erro.",
  },
  "ref-keyword-while": {
    title: "while",
    description: "while repete seu bloco enquanto sua condição permanecer True.",
  },
  "ref-keyword-with": {
    title: "with",
    description: "with abre um recurso (como um arquivo) e o fecha para você quando o bloco termina.",
  },
  "ref-keyword-yield": {
    title: "yield",
    description: "yield pausa uma função geradora e entrega um valor ao chamador.",
  },
  "python-ref-exceptions": {
    title: "Exceções do Python",
    description: "Exceções do Python — os erros que o Python gera, e o que cada um significa.",
  },
  "ref-exception-arithmeticerror": {
    title: "ArithmeticError",
    description: "ArithmeticError é o pai de todos os erros aritméticos (ZeroDivisionError, OverflowError, FloatingPointError).",
  },
  "ref-exception-assertionerror": {
    title: "AssertionError",
    description: "AssertionError é gerado quando uma instrução assert falha.",
  },
  "ref-exception-attributeerror": {
    title: "AttributeError",
    description: "AttributeError é gerado quando você acessa um atributo ou método que não existe.",
  },
  "ref-exception-exception": {
    title: "Exception",
    description: "Exception é o pai de quase todos os erros que você vai capturar.",
  },
  "ref-exception-eoferror": {
    title: "EOFError",
    description: "EOFError é gerado quando input() ou read atinge o fim do arquivo sem restar nada.",
  },
  "ref-exception-floatingpointerror": {
    title: "FloatingPointError",
    description: "FloatingPointError é gerado quando uma operação de ponto flutuante falha.",
  },
  "ref-exception-generatorexit": {
    title: "GeneratorExit",
    description: "GeneratorExit é gerado dentro de um gerador quando ele é fechado antes da hora.",
  },
  "ref-exception-importerror": {
    title: "ImportError",
    description: "ImportError é gerado quando um import não consegue encontrar o módulo.",
  },
  "ref-exception-indentationerror": {
    title: "IndentationError",
    description: "IndentationError é gerado quando a indentação de um bloco está errada.",
  },
  "ref-exception-indexerror": {
    title: "IndexError",
    description: "IndexError é gerado quando um índice de lista ou tupla está fora do intervalo.",
  },
  "ref-exception-keyerror": {
    title: "KeyError",
    description: "KeyError é gerado quando uma chave de dicionário não existe.",
  },
  "ref-exception-keyboardinterrupt": {
    title: "KeyboardInterrupt",
    description: "KeyboardInterrupt é gerado quando o usuário pressiona Ctrl+C.",
  },
  "ref-exception-lookuperror": {
    title: "LookupError",
    description: "LookupError é o pai de IndexError e KeyError.",
  },
  "ref-exception-memoryerror": {
    title: "MemoryError",
    description: "MemoryError é gerado quando o Python fica sem memória.",
  },
  "ref-exception-nameerror": {
    title: "NameError",
    description: "NameError é gerado quando você usa uma variável que nunca foi definida.",
  },
  "ref-exception-notimplementederror": {
    title: "NotImplementedError",
    description: "NotImplementedError é gerado para dizer 'esta parte ainda não foi escrita'.",
  },
  "ref-exception-oserror": {
    title: "OSError",
    description: "OSError é gerado quando o sistema operacional recusa algo (arquivo ausente, sem permissão).",
  },
  "ref-exception-overflowerror": {
    title: "OverflowError",
    description: "OverflowError é gerado quando um número é grande demais para o seu tipo.",
  },
  "ref-exception-referenceerror": {
    title: "ReferenceError",
    description: "ReferenceError é gerado quando uma referência fraca aponta para um objeto que já não existe.",
  },
  "ref-exception-runtimeerror": {
    title: "RuntimeError",
    description: "RuntimeError é um erro geral para algo que dá errado em tempo de execução.",
  },
  "ref-exception-stopiteration": {
    title: "StopIteration",
    description: "StopIteration é gerado por next() quando um iterador termina.",
  },
  "ref-exception-syntaxerror": {
    title: "SyntaxError",
    description: "SyntaxError é gerado quando o código em si não é Python válido.",
  },
  "ref-exception-taberror": {
    title: "TabError",
    description: "TabError é gerado quando tabulações e espaços são misturados na indentação.",
  },
  "ref-exception-systemerror": {
    title: "SystemError",
    description: "SystemError é gerado quando o próprio interpretador encontra um problema interno.",
  },
  "ref-exception-systemexit": {
    title: "SystemExit",
    description: "SystemExit é gerado por sys.exit() — ele encerra o programa.",
  },
  "ref-exception-typeerror": {
    title: "TypeError",
    description: "TypeError é gerado quando uma operação é usada no tipo errado.",
  },
  "ref-exception-unboundlocalerror": {
    title: "UnboundLocalError",
    description: "UnboundLocalError é gerado quando você lê uma variável local antes de atribuí-la.",
  },
  "ref-exception-unicodeerror": {
    title: "UnicodeError",
    description: "UnicodeError é o pai de UnicodeEncodeError, UnicodeDecodeError e UnicodeTranslateError.",
  },
  "ref-exception-unicodeencodeerror": {
    title: "UnicodeEncodeError",
    description: "UnicodeEncodeError é gerado quando um texto não pode ser codificado em bytes.",
  },
  "ref-exception-unicodedecodeerror": {
    title: "UnicodeDecodeError",
    description: "UnicodeDecodeError é gerado quando bytes não podem ser decodificados em texto.",
  },
  "ref-exception-unicodetranslateerror": {
    title: "UnicodeTranslateError",
    description: "UnicodeTranslateError é gerado quando um caractere não pode ser traduzido.",
  },
  "ref-exception-valueerror": {
    title: "ValueError",
    description: "ValueError é gerado quando um valor tem o tipo certo, mas o conteúdo errado.",
  },
  "ref-exception-zerodivisionerror": {
    title: "ZeroDivisionError",
    description: "ZeroDivisionError é gerado quando você divide por zero.",
  },
  "python-ref-glossary": {
    title: "Glossário do Python",
    description: "Glossário do Python — as palavras que desenvolvedores Python usam, explicadas em uma linha cada.",
  },
};
