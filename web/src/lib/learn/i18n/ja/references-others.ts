import type { ReferenceTranslations } from "../types";
export const TRANSLATIONS: ReferenceTranslations = {
  "python-ref-functions": {
    title: "Pythonの組み込み関数",
    description: "Pythonの組み込み関数 — インポート不要で、いつでも使えます。",
  },
  "ref-func-abs": {
    title: "abs()",
    description: "引数の絶対値を返します。",
  },
  "ref-func-all": {
    title: "all()",
    description: "イテラブルのすべての値xについてbool(x)がTrueであれば、Trueを返します。",
  },
  "ref-func-any": {
    title: "any()",
    description: "イテラブルのいずれかのxについてbool(x)がTrueであれば、Trueを返します。",
  },
  "ref-func-ascii": {
    title: "ascii()",
    description: "オブジェクトのASCIIのみの表現を返します。",
  },
  "ref-func-bin": {
    title: "bin()",
    description: "整数の二進表現を返します。",
  },
  "ref-func-bool": {
    title: "bool()",
    description: "bool(x) -> bool 引数xが真の場合はTrueを返し、そうでなければFalseを返します。",
  },
  "ref-func-bytearray": {
    title: "bytearray()",
    description: "bytearray(iterable_of_ints) -> bytearray bytearray(string, encoding[, errors]) -> bytearray bytearray(bytes_or_buffer) -> bytes_or_bufferの変更可能なコピー bytearray(int) -> パラメータinitiで指定されたサイズのbytes配列",
  },
  "ref-func-bytes": {
    title: "bytes()",
    description: "bytes(iterable_of_ints) -> bytes bytes(string, encoding[, errors]) -> bytes bytes(bytes_or_buffer) -> bytes_or_bufferの変更できないコピー bytes(int) -> パラメータで指定されたサイズのbytesオブジェクト（nullバイトで初期化）",
  },
  "ref-func-callable": {
    title: "callable()",
    description: "オブジェクトが呼び出し可能かどうか（何らかの関数かどうか）を返します。",
  },
  "ref-func-chr": {
    title: "chr()",
    description: "序数iの1文字からなるUnicode文字列を返します。0 <= i <= 0x10ffff。",
  },
  "ref-func-compile": {
    title: "compile()",
    description: "ソースを、exec()やeval()で実行できるコードオブジェクトにコンパイルします。",
  },
  "ref-func-complex": {
    title: "complex()",
    description: "実部と、省略可能な虚部から複素数を作成します。",
  },
  "ref-func-delattr": {
    title: "delattr()",
    description: "指定されたオブジェクトから、名前付きの属性を削除します。",
  },
  "ref-func-dict": {
    title: "dict()",
    description: "dict() -> 新しい空の辞書 dict(mapping) -> マッピングオブジェクトの (key, value) ペアから初期化された新しい辞書 dict(iterable) -> 次のように初期化された新しい辞書: d = {} for k, v in iterable: d[k] = v dict(**k",
  },
  "ref-func-dir": {
    title: "dir()",
    description: "オブジェクトの属性を表示します。",
  },
  "ref-func-divmod": {
    title: "divmod()",
    description: "タプル (x//y, x%y) を返します。",
  },
  "ref-func-enumerate": {
    title: "enumerate()",
    description: "enumerateオブジェクトを返します。",
  },
  "ref-func-eval": {
    title: "eval()",
    description: "指定されたソースを、globalsとlocalsのコンテキストで評価します。",
  },
  "ref-func-exec": {
    title: "exec()",
    description: "指定されたソースを、globalsとlocalsのコンテキストで実行します。",
  },
  "ref-func-filter": {
    title: "filter()",
    description: "filter(function or None, iterable) --> filterオブジェクト function(item)が真になるiterableの要素を生み出すイテレータを返します。",
  },
  "ref-func-float": {
    title: "float()",
    description: "文字列または数値を、可能であれば浮動小数点数に変換します。",
  },
  "ref-func-format": {
    title: "format()",
    description: "type(value).__format__(value, format_spec)を返します。多くの組み込み型は、Format Specification Mini-languageに従ってformat_specを実装しています。",
  },
  "ref-func-frozenset": {
    title: "frozenset()",
    description: "frozenset() -> 空のfrozensetオブジェクト frozenset(iterable) -> frozensetオブジェクト 変更できない、順序なしの重複のない要素のコレクションを構築します。",
  },
  "ref-func-getattr": {
    title: "getattr()",
    description: "オブジェクトから名前付きの属性を取得します。",
  },
  "ref-func-globals": {
    title: "globals()",
    description: "現在のスコープのグローバル変数を含む辞書を返します。",
  },
  "ref-func-hasattr": {
    title: "hasattr()",
    description: "オブジェクトが指定された名前の属性を持っているかどうかを返します。",
  },
  "ref-func-hex": {
    title: "hex()",
    description: "整数の16進表現を返します。",
  },
  "ref-func-id": {
    title: "id()",
    description: "オブジェクトの同一性を返します。",
  },
  "ref-func-input": {
    title: "input()",
    description: "標準入力から文字列を読み取ります。",
  },
  "ref-func-int": {
    title: "int()",
    description: "int([x]) -> 整数 int(x, base=10) -> 整数 数値または文字列を整数に変換します。引数がなければ0を返します。",
  },
  "ref-func-isinstance": {
    title: "isinstance()",
    description: "オブジェクトがクラスまたはそのサブクラスのインスタンスであるかどうかを返します。",
  },
  "ref-func-issubclass": {
    title: "issubclass()",
    description: "'cls'が他のクラスから派生しているか、同じクラスであるかどうかを返します。",
  },
  "ref-func-iter": {
    title: "iter()",
    description: "オブジェクトからイテレータを取得します。",
  },
  "ref-func-len": {
    title: "len()",
    description: "コンテナ内の要素の数を返します。",
  },
  "ref-func-list": {
    title: "list()",
    description: "組み込みの変更可能なシーケンス。",
  },
  "ref-func-locals": {
    title: "locals()",
    description: "現在のスコープのローカル変数を含む辞書を返します。",
  },
  "ref-func-map": {
    title: "map()",
    description: "map(func, *iterables) --> mapオブジェクト 各イテラブルから引数を取って関数を計算するイテレータを作成します。",
  },
  "ref-func-max": {
    title: "max()",
    description: "max(iterable, *[, default=obj, key=func]) -> 値 max(arg1, arg2, *args, *[, key=func]) -> 値 イテラブルを1つだけ渡した場合は、その最大の要素を返します。",
  },
  "ref-func-memoryview": {
    title: "memoryview()",
    description: "指定されたオブジェクトを参照する新しいmemoryviewオブジェクトを作成します。",
  },
  "ref-func-min": {
    title: "min()",
    description: "min(iterable, *[, default=obj, key=func]) -> 値 min(arg1, arg2, *args, *[, key=func]) -> 値 イテラブルを1つだけ渡した場合は、その最小の要素を返します。",
  },
  "ref-func-next": {
    title: "next()",
    description: "イテレータから次の要素を返します。",
  },
  "ref-func-object": {
    title: "object()",
    description: "クラス階層の基底クラス。",
  },
  "ref-func-oct": {
    title: "oct()",
    description: "整数の8進表現を返します。",
  },
  "ref-func-open": {
    title: "open()",
    description: "ファイルを開き、ストリームを返します。",
  },
  "ref-func-ord": {
    title: "ord()",
    description: "1文字の文字列に対するUnicodeコードポイントを返します。",
  },
  "ref-func-pow": {
    title: "pow()",
    description: "2つの引数の場合はbase**exp、3つの引数の場合はbase**exp % modと等価です。intのような一部の型は、3引数形式で呼び出すとより効率的なアルゴリズムを使えます。",
  },
  "ref-func-print": {
    title: "print()",
    description: "値をストリームに出力します。既定ではsys.stdoutに出力します。",
  },
  "ref-func-range": {
    title: "range()",
    description: "range(stop) -> rangeオブジェクト range(start, stop[, step]) -> rangeオブジェクト start（含む）からstop（含まない）まで、stepずつ整数を生み出すオブジェクトを返します。",
  },
  "ref-func-reversed": {
    title: "reversed()",
    description: "指定されたシーケンスの値に対する逆向きのイテレータを返します。",
  },
  "ref-func-round": {
    title: "round()",
    description: "数値を、指定された小数点以下の桁数に丸めます。",
  },
  "ref-func-set": {
    title: "set()",
    description: "set() -> 新しい空のsetオブジェクト set(iterable) -> 新しいsetオブジェクト 順序なしの重複のない要素のコレクションを構築します。",
  },
  "ref-func-setattr": {
    title: "setattr()",
    description: "指定されたオブジェクトの名前付きの属性に、指定された値を設定します。",
  },
  "ref-func-slice": {
    title: "slice()",
    description: "slice(stop) slice(start, stop[, step]) sliceオブジェクトを作成します。",
  },
  "ref-func-sorted": {
    title: "sorted()",
    description: "イテラブルのすべての要素を昇順に並べた新しいリストを返します。",
  },
  "ref-func-str": {
    title: "str()",
    description: "str(object='') -> str str(bytes_or_buffer[, encoding[, errors]]) -> str 指定されたオブジェクトから新しい文字列オブジェクトを作成します。",
  },
  "ref-func-sum": {
    title: "sum()",
    description: "'start'値（既定値：0）と数値のイテラブルの合計を返します。イテラブルが空の場合は、start値を返します。",
  },
  "ref-func-super": {
    title: "super()",
    description: "super() -> super(__class__, <first argument>)と同じ super(type) -> バインドされていないsuperオブジェクト super(type, obj) -> バインドされたsuperオブジェクト。isinstance(obj, type)が必要 super(type, type2) -> バインドされたsuperオブジェクト。issubcla",
  },
  "ref-func-tuple": {
    title: "tuple()",
    description: "組み込みの変更できないシーケンス。",
  },
  "ref-func-type": {
    title: "type()",
    description: "type(object) -> オブジェクトの型 type(name, bases, dict, **kwds) -> 新しい型",
  },
  "ref-func-vars": {
    title: "vars()",
    description: "varsを表示します。",
  },
  "ref-func-zip": {
    title: "zip()",
    description: "zip(*iterables, strict=False) --> 入力が1つ尽きるまでタプルを生み出します。",
  },
  "python-ref-string": {
    title: "Pythonの文字列メソッド",
    description: "文字列メソッド — strで呼び出せるすべてのメソッド。",
  },
  "ref-string-capitalize": {
    title: "capitalize()",
    description: "文字列の先頭を大文字にしたバージョンを返します。",
  },
  "ref-string-casefold": {
    title: "casefold()",
    description: "大文字と小文字を区別しない比較に適したバージョンの文字列を返します。",
  },
  "ref-string-center": {
    title: "center()",
    description: "幅widthの中央揃えの文字列を返します。",
  },
  "ref-string-count": {
    title: "count()",
    description: "S.count(sub[, start[, end]]) -> int 文字列S[start:end]内にある部分文字列subの、重ならない出現回数を返します。",
  },
  "ref-string-encode": {
    title: "encode()",
    description: "エンコーディング用に登録されたコーデックを使って文字列をエンコードします。",
  },
  "ref-string-endswith": {
    title: "endswith()",
    description: "S.endswith(suffix[, start[, end]]) -> bool Sが指定されたsuffixで終わる場合はTrueを返し、そうでなければFalseを返します。",
  },
  "ref-string-expandtabs": {
    title: "expandtabs()",
    description: "すべてのタブ文字をスペースで展開したコピーを返します。",
  },
  "ref-string-find": {
    title: "find()",
    description: "S.find(sub[, start[, end]]) -> int S[start:end]内にsubが含まれるような、S内で部分文字列subが見つかる最小のインデックスを返します。",
  },
  "ref-string-format": {
    title: "format()",
    description: "S.format(*args, **kwargs) -> str argsとkwargsからの置換を使って、Sのフォーマットされたバージョンを返します。",
  },
  "ref-string-format-map": {
    title: "format_map()",
    description: "format_map() — 下の例を参照してください。",
  },
  "ref-string-index": {
    title: "index()",
    description: "S.index(sub[, start[, end]]) -> int S[start:end]内にsubが含まれるような、S内で部分文字列subが見つかる最小のインデックスを返します。",
  },
  "ref-string-isalnum": {
    title: "isalnum()",
    description: "文字列が英数字の文字列であればTrueを返し、そうでなければFalseを返します。",
  },
  "ref-string-isalpha": {
    title: "isalpha()",
    description: "文字列がアルファベットの文字列であればTrueを返し、そうでなければFalseを返します。",
  },
  "ref-string-isascii": {
    title: "isascii()",
    description: "文字列内のすべての文字がASCIIであればTrueを返し、そうでなければFalseを返します。",
  },
  "ref-string-isdecimal": {
    title: "isdecimal()",
    description: "文字列が10進数の文字列であればTrueを返し、そうでなければFalseを返します。",
  },
  "ref-string-isdigit": {
    title: "isdigit()",
    description: "文字列が数字の文字列であればTrueを返し、そうでなければFalseを返します。",
  },
  "ref-string-isidentifier": {
    title: "isidentifier()",
    description: "文字列が有効なPython識別子であればTrueを返し、そうでなければFalseを返します。",
  },
  "ref-string-islower": {
    title: "islower()",
    description: "文字列が小文字の文字列であればTrueを返し、そうでなければFalseを返します。",
  },
  "ref-string-isnumeric": {
    title: "isnumeric()",
    description: "文字列が数値の文字列であればTrueを返し、そうでなければFalseを返します。",
  },
  "ref-string-isprintable": {
    title: "isprintable()",
    description: "文字列が表示可能な文字列であればTrueを返し、そうでなければFalseを返します。",
  },
  "ref-string-isspace": {
    title: "isspace()",
    description: "文字列が空白文字の文字列であればTrueを返し、そうでなければFalseを返します。",
  },
  "ref-string-istitle": {
    title: "istitle()",
    description: "文字列がタイトルケースの文字列であればTrueを返し、そうでなければFalseを返します。",
  },
  "ref-string-isupper": {
    title: "isupper()",
    description: "文字列が大文字の文字列であればTrueを返し、そうでなければFalseを返します。",
  },
  "ref-string-join": {
    title: "join()",
    description: "任意の数の文字列を連結します。",
  },
  "ref-string-ljust": {
    title: "ljust()",
    description: "幅widthの左揃えの文字列を返します。",
  },
  "ref-string-lower": {
    title: "lower()",
    description: "文字列を小文字に変換したコピーを返します。",
  },
  "ref-string-lstrip": {
    title: "lstrip()",
    description: "先頭の空白を除去した文字列のコピーを返します。",
  },
  "ref-string-maketrans": {
    title: "maketrans()",
    description: "str.translate()で使える変換テーブルを返します。",
  },
  "ref-string-partition": {
    title: "partition()",
    description: "指定された区切り文字を使って、文字列を3つの部分に分割します。",
  },
  "ref-string-replace": {
    title: "replace()",
    description: "部分文字列oldのすべての出現をnewで置き換えたコピーを返します。",
  },
  "ref-string-rfind": {
    title: "rfind()",
    description: "S.rfind(sub[, start[, end]]) -> int S[start:end]内にsubが含まれるような、S内で部分文字列subが見つかる最大のインデックスを返します。",
  },
  "ref-string-rindex": {
    title: "rindex()",
    description: "S.rindex(sub[, start[, end]]) -> int S[start:end]内にsubが含まれるような、S内で部分文字列subが見つかる最大のインデックスを返します。",
  },
  "ref-string-rjust": {
    title: "rjust()",
    description: "幅widthの右揃えの文字列を返します。",
  },
  "ref-string-rpartition": {
    title: "rpartition()",
    description: "指定された区切り文字を使って、文字列を3つの部分に分割します。",
  },
  "ref-string-rsplit": {
    title: "rsplit()",
    description: "sepを区切り文字列として使い、文字列内の部分文字列のリストを返します。",
  },
  "ref-string-rstrip": {
    title: "rstrip()",
    description: "末尾の空白を除去した文字列のコピーを返します。",
  },
  "ref-string-split": {
    title: "split()",
    description: "sepを区切り文字列として使い、文字列内の部分文字列のリストを返します。",
  },
  "ref-string-splitlines": {
    title: "splitlines()",
    description: "行境界で区切って、文字列内の行のリストを返します。",
  },
  "ref-string-startswith": {
    title: "startswith()",
    description: "S.startswith(prefix[, start[, end]]) -> bool Sが指定されたprefixで始まる場合はTrueを返し、そうでなければFalseを返します。",
  },
  "ref-string-strip": {
    title: "strip()",
    description: "先頭と末尾の空白を除去した文字列のコピーを返します。",
  },
  "ref-string-swapcase": {
    title: "swapcase()",
    description: "大文字を小文字に、小文字を大文字に変換します。",
  },
  "ref-string-title": {
    title: "title()",
    description: "各単語がタイトルケースになったバージョンの文字列を返します。",
  },
  "ref-string-translate": {
    title: "translate()",
    description: "指定された変換テーブルを使って、文字列内の各文字を置き換えます。",
  },
  "ref-string-upper": {
    title: "upper()",
    description: "文字列を大文字に変換したコピーを返します。",
  },
  "ref-string-zfill": {
    title: "zfill()",
    description: "指定された幅のフィールドを埋めるために、数値文字列の左側をゼロで埋めます。",
  },
  "python-ref-list": {
    title: "Pythonのリストメソッド",
    description: "リストメソッド — リストで呼び出せるすべてのメソッド。",
  },
  "ref-list-append": {
    title: "append()",
    description: "オブジェクトをリストの末尾に追加します。",
  },
  "ref-list-clear": {
    title: "clear()",
    description: "リストからすべての要素を削除します。",
  },
  "ref-list-copy": {
    title: "copy()",
    description: "リストの浅いコピーを返します。",
  },
  "ref-list-count": {
    title: "count()",
    description: "valueの出現回数を返します。",
  },
  "ref-list-extend": {
    title: "extend()",
    description: "イテラブルから要素を追加して、リストを拡張します。",
  },
  "ref-list-index": {
    title: "index()",
    description: "valueの最初のインデックスを返します。",
  },
  "ref-list-insert": {
    title: "insert()",
    description: "indexの前にオブジェクトを挿入します。",
  },
  "ref-list-pop": {
    title: "pop()",
    description: "indexの要素を削除して返します（既定は最後の要素）。",
  },
  "ref-list-remove": {
    title: "remove()",
    description: "valueの最初の出現を削除します。",
  },
  "ref-list-reverse": {
    title: "reverse()",
    description: "その場で反転します。",
  },
  "ref-list-sort": {
    title: "sort()",
    description: "リストを昇順にソートし、Noneを返します。",
  },
  "python-ref-dictionary": {
    title: "Pythonの辞書メソッド",
    description: "辞書メソッド — dictで呼び出せるすべてのメソッド。",
  },
  "ref-dictionary-clear": {
    title: "clear()",
    description: "D.clear() -> None。",
  },
  "ref-dictionary-copy": {
    title: "copy()",
    description: "D.copy() -> Dの浅いコピー",
  },
  "ref-dictionary-fromkeys": {
    title: "fromkeys()",
    description: "イテラブルからのキーをキーとし、値をvalueとした新しい辞書を作成します。",
  },
  "ref-dictionary-get": {
    title: "get()",
    description: "keyが辞書にあればそのkeyの値を返し、なければdefaultを返します。",
  },
  "ref-dictionary-items": {
    title: "items()",
    description: "D.items() -> Dの要素に対するビューを提供する、セットのようなオブジェクト",
  },
  "ref-dictionary-keys": {
    title: "keys()",
    description: "D.keys() -> Dのキーに対するビューを提供する、セットのようなオブジェクト",
  },
  "ref-dictionary-pop": {
    title: "pop()",
    description: "D.pop(k[,d]) -> v。指定されたキーを削除し、対応する値を返します。",
  },
  "ref-dictionary-popitem": {
    title: "popitem()",
    description: "（キー、値）のペアを2要素タプルとして削除して返します。",
  },
  "ref-dictionary-setdefault": {
    title: "setdefault()",
    description: "keyが辞書になければ、keyをdefaultの値で挿入します。",
  },
  "ref-dictionary-update": {
    title: "update()",
    description: "D.update([E, ]**F) -> None。",
  },
  "ref-dictionary-values": {
    title: "values()",
    description: "D.values() -> Dの値に対するビューを提供するオブジェクト",
  },
  "python-ref-tuple": {
    title: "Pythonのタプルメソッド",
    description: "タプルメソッド — タプルで呼び出せるすべてのメソッド。",
  },
  "ref-tuple-count": {
    title: "count()",
    description: "valueの出現回数を返します。",
  },
  "ref-tuple-index": {
    title: "index()",
    description: "valueの最初のインデックスを返します。",
  },
  "python-ref-set": {
    title: "Pythonのセットメソッド",
    description: "セットメソッド — セットで呼び出せるすべてのメソッド。",
  },
  "ref-set-add": {
    title: "add()",
    description: "セットに要素を追加します。",
  },
  "ref-set-clear": {
    title: "clear()",
    description: "このセットからすべての要素を削除します。",
  },
  "ref-set-copy": {
    title: "copy()",
    description: "セットの浅いコピーを返します。",
  },
  "ref-set-difference": {
    title: "difference()",
    description: "2つ以上のセットの差集合を、新しいセットとして返します。",
  },
  "ref-set-difference-update": {
    title: "difference_update()",
    description: "difference_update() — 下の例を参照してください。",
  },
  "ref-set-discard": {
    title: "discard()",
    description: "要素がメンバーであれば、セットからその要素を削除します。",
  },
  "ref-set-intersection": {
    title: "intersection()",
    description: "2つのセットの共通部分を、新しいセットとして返します。",
  },
  "ref-set-intersection-update": {
    title: "intersection_update()",
    description: "intersection_update() — 下の例を参照してください。",
  },
  "ref-set-isdisjoint": {
    title: "isdisjoint()",
    description: "2つのセットの共通部分が空であればTrueを返します。",
  },
  "ref-set-issubset": {
    title: "issubset()",
    description: "セット内のすべての要素がotherにあるかどうかをテストします。",
  },
  "ref-set-lessthan": {
    title: "<",
    description: "<は、あるセットが他のセットの真部分集合であるかどうかを調べます。",
  },
  "ref-set-issuperset": {
    title: "issuperset()",
    description: "other内のすべての要素がセットにあるかどうかをテストします。",
  },
  "ref-set-greaterthan": {
    title: ">",
    description: ">は、あるセットが他のセットの真上位集合であるかどうかを調べます。",
  },
  "ref-set-pop": {
    title: "pop()",
    description: "任意のセット要素を削除して返します。",
  },
  "ref-set-remove": {
    title: "remove()",
    description: "セットから要素を削除します。その要素はメンバーでなければなりません。",
  },
  "ref-set-symmetric-difference": {
    title: "symmetric_difference()",
    description: "symmetric_difference() — 下の例を参照してください。",
  },
  "ref-set-symmetric-difference-update": {
    title: "symmetric_difference_update()",
    description: "symmetric_difference_update() — 下の例を参照してください。",
  },
  "ref-set-union": {
    title: "union()",
    description: "セットの和集合を、新しいセットとして返します。",
  },
  "ref-set-update": {
    title: "update()",
    description: "セットを、それ自身と他のセットの和集合で更新します。",
  },
  "python-reference": {
    title: "Python概要",
    description: "Pythonリファレンス — すべての組み込み関数、メソッド、キーワード、例外を1か所にまとめたものです。",
  },
  "python-ref-file": {
    title: "Pythonのファイルメソッド",
    description: "ファイルメソッド — 開いたファイルオブジェクトで呼び出せるすべてのメソッド。",
  },
  "ref-file-close": {
    title: "close()",
    description: "IOオブジェクトを閉じます。",
  },
  "ref-file-fileno": {
    title: "fileno()",
    description: "存在すれば、基になるファイル記述子を返します。",
  },
  "ref-file-flush": {
    title: "flush()",
    description: "該当する場合は、書き込みバッファをフラッシュします。",
  },
  "ref-file-isatty": {
    title: "isatty()",
    description: "これが「対話型」ストリームであるかどうかを返します。",
  },
  "ref-file-read": {
    title: "read()",
    description: "最大でsize文字を読み取り、文字列として返します。",
  },
  "ref-file-readable": {
    title: "readable()",
    description: "IOオブジェクトが読み取り可能であればTrueを返します。",
  },
  "ref-file-readline": {
    title: "readline()",
    description: "改行またはEOFまで読み取ります。",
  },
  "ref-file-readlines": {
    title: "readlines()",
    description: "ストリームから行のリストを返します。",
  },
  "ref-file-seek": {
    title: "seek()",
    description: "ストリームの位置を変更します。",
  },
  "ref-file-seekable": {
    title: "seekable()",
    description: "IOオブジェクトがシーク可能であればTrueを返します。",
  },
  "ref-file-tell": {
    title: "tell()",
    description: "現在のファイル位置を返します。",
  },
  "ref-file-truncate": {
    title: "truncate()",
    description: "サイズをposに切り詰めます。",
  },
  "ref-file-writable": {
    title: "writable()",
    description: "IOオブジェクトが書き込み可能であればTrueを返します。",
  },
  "ref-file-write": {
    title: "write()",
    description: "文字列をファイルに書き込みます。",
  },
  "ref-file-writelines": {
    title: "writelines()",
    description: "行のリストをストリームに書き込みます。",
  },
  "python-ref-keywords": {
    title: "Pythonのキーワード",
    description: "Pythonのキーワード — 言語を構成する予約語。",
  },
  "ref-keyword-and": {
    title: "and",
    description: "andは論理演算子です — 両辺がともにTrueの場合にのみTrueになります。",
  },
  "ref-keyword-as": {
    title: "as",
    description: "asは、インポートしたモジュールやキャッチした例外に別の名前を付けます。",
  },
  "ref-keyword-assert": {
    title: "assert",
    description: "assertは条件を調べます — Falseの場合、PythonはAssertionErrorを発生させます。",
  },
  "ref-keyword-async": {
    title: "async",
    description: "asyncは関数を非同期としてマークします — awaitで実行するコルーチンを返します。",
  },
  "ref-keyword-await": {
    title: "await",
    description: "awaitは、待っているものが終わるまで非同期関数を一時停止します。",
  },
  "ref-keyword-break": {
    title: "break",
    description: "breakは、最も内側のループをただちに抜けます。",
  },
  "ref-keyword-case": {
    title: "case",
    description: "caseはmatch文の1つの分岐です — パターンに合う場合に実行されます。",
  },
  "ref-keyword-class": {
    title: "class",
    description: "classは新しいクラスを定義します — オブジェクトの設計図です。",
  },
  "ref-keyword-continue": {
    title: "continue",
    description: "continueは、現在のループの残りをスキップして、次の周回を始めます。",
  },
  "ref-keyword-def": {
    title: "def",
    description: "defは関数を定義します。",
  },
  "ref-keyword-del": {
    title: "del",
    description: "delは変数、要素、またはスライスを削除します。",
  },
  "ref-keyword-elif": {
    title: "elif",
    description: "elifは2番目の条件です — 上のifがFalseだった場合にのみ調べられます。",
  },
  "ref-keyword-else": {
    title: "else",
    description: "elseは、上のif（およびelif）がすべてFalseだった場合に実行されます。",
  },
  "ref-keyword-except": {
    title: "except",
    description: "exceptは、対応するtryブロック内で発生したエラーをキャッチします。",
  },
  "ref-keyword-false": {
    title: "False",
    description: "Falseは「いいえ」を表す真偽値です。",
  },
  "ref-keyword-finally": {
    title: "finally",
    description: "finallyは、エラーがあってもなくても、tryブロックの後に必ず実行されます。",
  },
  "ref-keyword-for": {
    title: "for",
    description: "forは、シーケンスの各要素を1つずつループします。",
  },
  "ref-keyword-from": {
    title: "from",
    description: "fromは、モジュールから特定の名前をインポートします。",
  },
  "ref-keyword-global": {
    title: "global",
    description: "globalは、関数内の名前がモジュールレベルの変数を指すことを示します。",
  },
  "ref-keyword-if": {
    title: "if",
    description: "ifは、条件がTrueの場合にのみブロックを実行します。",
  },
  "ref-keyword-import": {
    title: "import",
    description: "importは、モジュールの名前をプログラムに取り込みます。",
  },
  "ref-keyword-in": {
    title: "in",
    description: "inはメンバーシップを調べます — 左辺が右辺の中にある場合にTrueになります。",
  },
  "ref-keyword-is": {
    title: "is",
    description: "isは同一性を調べます — 両方の名前が同じオブジェクトを指す場合にTrueになります。",
  },
  "ref-keyword-lambda": {
    title: "lambda",
    description: "lambdaは、1行の小さな無名関数を作ります。",
  },
  "ref-keyword-match": {
    title: "match",
    description: "matchは、値をパターンと照合し、最初に合ったものを実行します。",
  },
  "ref-keyword-none": {
    title: "None",
    description: "Noneは「ここに値がない」ことを意味します — 値の不在です。",
  },
  "ref-keyword-nonlocal": {
    title: "nonlocal",
    description: "nonlocalは、ネストされた関数内の名前が、外側の関数の変数を指すことを示します。",
  },
  "ref-keyword-not": {
    title: "not",
    description: "notは真偽値を反転します — TrueはFalseに、FalseはTrueになります。",
  },
  "ref-keyword-or": {
    title: "or",
    description: "orは論理演算子です — 少なくとも一方がTrueの場合にTrueになります。",
  },
  "ref-keyword-pass": {
    title: "pass",
    description: "passは何もしません — Pythonが文を必要とする場所のプレースホルダーです。",
  },
  "ref-keyword-raise": {
    title: "raise",
    description: "raiseは、意図的に例外を発生させます。",
  },
  "ref-keyword-return": {
    title: "return",
    description: "returnは値を関数の外へ返し、関数を終了します。",
  },
  "ref-keyword-true": {
    title: "True",
    description: "Trueは「はい」を表す真偽値です。",
  },
  "ref-keyword-try": {
    title: "try",
    description: "tryは、失敗するかもしれないコードを囲み、exceptがエラーをキャッチできるようにします。",
  },
  "ref-keyword-while": {
    title: "while",
    description: "whileは、条件がTrueの間、ブロックを繰り返します。",
  },
  "ref-keyword-with": {
    title: "with",
    description: "withはリソース（ファイルなど）を開き、ブロックが終わると自動的に閉じます。",
  },
  "ref-keyword-yield": {
    title: "yield",
    description: "yieldはジェネレータ関数を一時停止し、呼び出し元に1つの値を渡します。",
  },
  "python-ref-exceptions": {
    title: "Pythonの例外",
    description: "Pythonの例外 — Pythonが発生させるエラーと、それぞれの意味。",
  },
  "ref-exception-arithmeticerror": {
    title: "ArithmeticError",
    description: "ArithmeticErrorは、すべての算術エラーの親です（ZeroDivisionError、OverflowError、FloatingPointError）。",
  },
  "ref-exception-assertionerror": {
    title: "AssertionError",
    description: "AssertionErrorは、assert文が失敗したときに発生します。",
  },
  "ref-exception-attributeerror": {
    title: "AttributeError",
    description: "AttributeErrorは、存在しない属性やメソッドにアクセスしたときに発生します。",
  },
  "ref-exception-exception": {
    title: "Exception",
    description: "Exceptionは、キャッチするほとんどすべてのエラーの親です。",
  },
  "ref-exception-eoferror": {
    title: "EOFError",
    description: "EOFErrorは、input()やreadが、残りが何もないファイルの末尾に達したときに発生します。",
  },
  "ref-exception-floatingpointerror": {
    title: "FloatingPointError",
    description: "FloatingPointErrorは、浮動小数点演算が失敗したときに発生します。",
  },
  "ref-exception-generatorexit": {
    title: "GeneratorExit",
    description: "GeneratorExitは、ジェネレータが途中で閉じられたときに、その内部で発生します。",
  },
  "ref-exception-importerror": {
    title: "ImportError",
    description: "ImportErrorは、インポートがモジュールを見つけられないときに発生します。",
  },
  "ref-exception-indentationerror": {
    title: "IndentationError",
    description: "IndentationErrorは、ブロックのインデントが間違っているときに発生します。",
  },
  "ref-exception-indexerror": {
    title: "IndexError",
    description: "IndexErrorは、リストやタプルのインデックスが範囲外のときに発生します。",
  },
  "ref-exception-keyerror": {
    title: "KeyError",
    description: "KeyErrorは、辞書のキーが存在しないときに発生します。",
  },
  "ref-exception-keyboardinterrupt": {
    title: "KeyboardInterrupt",
    description: "KeyboardInterruptは、ユーザーがCtrl+Cを押したときに発生します。",
  },
  "ref-exception-lookuperror": {
    title: "LookupError",
    description: "LookupErrorは、IndexErrorとKeyErrorの親です。",
  },
  "ref-exception-memoryerror": {
    title: "MemoryError",
    description: "MemoryErrorは、Pythonのメモリが不足したときに発生します。",
  },
  "ref-exception-nameerror": {
    title: "NameError",
    description: "NameErrorは、定義されていない変数を使ったときに発生します。",
  },
  "ref-exception-notimplementederror": {
    title: "NotImplementedError",
    description: "NotImplementedErrorは、「この部分はまだ書かれていません」と示すために発生します。",
  },
  "ref-exception-oserror": {
    title: "OSError",
    description: "OSErrorは、オペレーティングシステムが何かを拒否したときに発生します（ファイルが見つからない、権限がないなど）。",
  },
  "ref-exception-overflowerror": {
    title: "OverflowError",
    description: "OverflowErrorは、数がその型に対して大きすぎるときに発生します。",
  },
  "ref-exception-referenceerror": {
    title: "ReferenceError",
    description: "ReferenceErrorは、弱参照が、すでに存在しないオブジェクトを指しているときに発生します。",
  },
  "ref-exception-runtimeerror": {
    title: "RuntimeError",
    description: "RuntimeErrorは、実行時に何かがうまくいかない場合の一般的なエラーです。",
  },
  "ref-exception-stopiteration": {
    title: "StopIteration",
    description: "StopIterationは、イテレータが終了したときにnext()によって発生します。",
  },
  "ref-exception-syntaxerror": {
    title: "SyntaxError",
    description: "SyntaxErrorは、コード自体が有効なPythonではないときに発生します。",
  },
  "ref-exception-taberror": {
    title: "TabError",
    description: "TabErrorは、インデントでタブとスペースが混ざっているときに発生します。",
  },
  "ref-exception-systemerror": {
    title: "SystemError",
    description: "SystemErrorは、インタープリタ自体が内部の問題に遭遇したときに発生します。",
  },
  "ref-exception-systemexit": {
    title: "SystemExit",
    description: "SystemExitはsys.exit()によって発生します — プログラムを終了します。",
  },
  "ref-exception-typeerror": {
    title: "TypeError",
    description: "TypeErrorは、操作が間違った型に使われたときに発生します。",
  },
  "ref-exception-unboundlocalerror": {
    title: "UnboundLocalError",
    description: "UnboundLocalErrorは、ローカル変数を代入する前に読み取ったときに発生します。",
  },
  "ref-exception-unicodeerror": {
    title: "UnicodeError",
    description: "UnicodeErrorは、UnicodeEncodeError、UnicodeDecodeError、UnicodeTranslateErrorの親です。",
  },
  "ref-exception-unicodeencodeerror": {
    title: "UnicodeEncodeError",
    description: "UnicodeEncodeErrorは、テキストをバイトにエンコードできないときに発生します。",
  },
  "ref-exception-unicodedecodeerror": {
    title: "UnicodeDecodeError",
    description: "UnicodeDecodeErrorは、バイトをテキストにデコードできないときに発生します。",
  },
  "ref-exception-unicodetranslateerror": {
    title: "UnicodeTranslateError",
    description: "UnicodeTranslateErrorは、文字を変換できないときに発生します。",
  },
  "ref-exception-valueerror": {
    title: "ValueError",
    description: "ValueErrorは、値の型は正しいが内容が間違っているときに発生します。",
  },
  "ref-exception-zerodivisionerror": {
    title: "ZeroDivisionError",
    description: "ZeroDivisionErrorは、ゼロで割ったときに発生します。",
  },
  "python-ref-glossary": {
    title: "Python用語集",
    description: "Python用語集 — Python開発者が使う言葉を、1行ずつ説明したものです。",
  },
};
