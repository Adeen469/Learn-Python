import type { ReferenceTranslations } from "../types";
export const TRANSLATIONS: ReferenceTranslations = {
  "python-ref-functions": {
    title: "Python 내장 함수",
    description: "Python 내장 함수 — 가져오기(import) 없이 항상 사용할 수 있습니다.",
  },
  "ref-func-abs": {
    title: "abs()",
    description: "인수의 절댓값을 반환합니다.",
  },
  "ref-func-all": {
    title: "all()",
    description: "이터러블의 모든 값 x에 대해 bool(x)가 True이면 True를 반환합니다.",
  },
  "ref-func-any": {
    title: "any()",
    description: "이터러블의 어떤 x에 대해서라도 bool(x)가 True이면 True를 반환합니다.",
  },
  "ref-func-ascii": {
    title: "ascii()",
    description: "객체의 ASCII 전용 표현을 반환합니다.",
  },
  "ref-func-bin": {
    title: "bin()",
    description: "정수의 이진 표현을 반환합니다.",
  },
  "ref-func-bool": {
    title: "bool()",
    description: "bool(x) -> bool 인수 x가 true이면 True를, 그렇지 않으면 False를 반환합니다.",
  },
  "ref-func-bytearray": {
    title: "bytearray()",
    description: "bytearray(iterable_of_ints) -> bytearray bytearray(string, encoding[, errors]) -> bytearray bytearray(bytes_or_buffer) -> bytes_or_buffer의 변경 가능한 복사본 bytearray(int) -> bytes array of size given by the parameter initi",
  },
  "ref-func-bytes": {
    title: "bytes()",
    description: "bytes(iterable_of_ints) -> bytes bytes(string, encoding[, errors]) -> bytes bytes(bytes_or_buffer) -> bytes_or_buffer의 변경 불가능한 복사본 bytes(int) -> 매개변수로 주어진 크기의, null 바이트로 초기화된 bytes 객체",
  },
  "ref-func-callable": {
    title: "callable()",
    description: "객체가 호출 가능한지(즉, 어떤 종류의 함수인지) 여부를 반환합니다.",
  },
  "ref-func-chr": {
    title: "chr()",
    description: "서수 i를 가진 한 문자의 유니코드 문자열을 반환합니다. 0 <= i <= 0x10ffff.",
  },
  "ref-func-compile": {
    title: "compile()",
    description: "소스를 exec() 또는 eval()로 실행할 수 있는 코드 객체로 컴파일합니다.",
  },
  "ref-func-complex": {
    title: "complex()",
    description: "실수부와 선택적인 허수부로 복소수를 만듭니다.",
  },
  "ref-func-delattr": {
    title: "delattr()",
    description: "주어진 객체에서 이름이 지정된 속성을 삭제합니다.",
  },
  "ref-func-dict": {
    title: "dict()",
    description: "dict() -> 새 빈 딕셔너리 dict(mapping) -> 매핑 객체의 (key, value) 쌍으로 초기화된 새 딕셔너리 dict(iterable) -> 다음과 같이 초기화된 새 딕셔너리: d = {} for k, v in iterable: d[k] = v dict(**k",
  },
  "ref-func-dir": {
    title: "dir()",
    description: "객체의 속성을 보여줍니다.",
  },
  "ref-func-divmod": {
    title: "divmod()",
    description: "튜플 (x//y, x%y)를 반환합니다.",
  },
  "ref-func-enumerate": {
    title: "enumerate()",
    description: "enumerate 객체를 반환합니다.",
  },
  "ref-func-eval": {
    title: "eval()",
    description: "globals와 locals의 컨텍스트에서 주어진 소스를 평가합니다.",
  },
  "ref-func-exec": {
    title: "exec()",
    description: "globals와 locals의 컨텍스트에서 주어진 소스를 실행합니다.",
  },
  "ref-func-filter": {
    title: "filter()",
    description: "filter(function or None, iterable) --> filter object 이터러블의 항목 중 function(item)이 true인 항목을 산출하는 이터레이터를 반환합니다.",
  },
  "ref-func-float": {
    title: "float()",
    description: "가능하면 문자열이나 숫자를 부동소수점 숫자로 변환합니다.",
  },
  "ref-func-format": {
    title: "format()",
    description: "type(value).__format__(value, format_spec)를 반환합니다. 많은 내장 타입은 Format Specification Mini-language에 따라 format_spec을 구현합니다.",
  },
  "ref-func-frozenset": {
    title: "frozenset()",
    description: "frozenset() -> 빈 frozenset 객체 frozenset(iterable) -> frozenset 객체 변경 불가능한 순서 없는 고유 요소들의 컬렉션을 만듭니다.",
  },
  "ref-func-getattr": {
    title: "getattr()",
    description: "객체에서 이름이 지정된 속성을 가져옵니다.",
  },
  "ref-func-globals": {
    title: "globals()",
    description: "현재 스코프의 전역 변수를 포함하는 딕셔너리를 반환합니다.",
  },
  "ref-func-hasattr": {
    title: "hasattr()",
    description: "객체에 주어진 이름의 속성이 있는지 여부를 반환합니다.",
  },
  "ref-func-hex": {
    title: "hex()",
    description: "정수의 16진수 표현을 반환합니다.",
  },
  "ref-func-id": {
    title: "id()",
    description: "객체의 식별자(identity)를 반환합니다.",
  },
  "ref-func-input": {
    title: "input()",
    description: "표준 입력에서 문자열을 읽습니다.",
  },
  "ref-func-int": {
    title: "int()",
    description: "int([x]) -> 정수 int(x, base=10) -> 정수 숫자나 문자열을 정수로 변환하거나, 인수가 없으면 0을 반환합니다.",
  },
  "ref-func-isinstance": {
    title: "isinstance()",
    description: "객체가 클래스의 인스턴스인지, 또는 그 서브클래스의 인스턴스인지 여부를 반환합니다.",
  },
  "ref-func-issubclass": {
    title: "issubclass()",
    description: "'cls'가 다른 클래스에서 파생되었는지, 또는 같은 클래스인지 여부를 반환합니다.",
  },
  "ref-func-iter": {
    title: "iter()",
    description: "객체에서 이터레이터를 가져옵니다.",
  },
  "ref-func-len": {
    title: "len()",
    description: "컨테이너에 있는 항목의 개수를 반환합니다.",
  },
  "ref-func-list": {
    title: "list()",
    description: "내장 변경 가능 시퀀스입니다.",
  },
  "ref-func-locals": {
    title: "locals()",
    description: "현재 스코프의 지역 변수를 포함하는 딕셔너리를 반환합니다.",
  },
  "ref-func-map": {
    title: "map()",
    description: "map(func, *iterables) --> map object 각 이터러블의 인수를 사용해 함수를 계산하는 이터레이터를 만듭니다.",
  },
  "ref-func-max": {
    title: "max()",
    description: "max(iterable, *[, default=obj, key=func]) -> value max(arg1, arg2, *args, *[, key=func]) -> value 단일 이터러블 인수가 주어지면 가장 큰 항목을 반환합니다.",
  },
  "ref-func-memoryview": {
    title: "memoryview()",
    description: "주어진 객체를 참조하는 새 memoryview 객체를 만듭니다.",
  },
  "ref-func-min": {
    title: "min()",
    description: "min(iterable, *[, default=obj, key=func]) -> value min(arg1, arg2, *args, *[, key=func]) -> value 단일 이터러블 인수가 주어지면 가장 작은 항목을 반환합니다.",
  },
  "ref-func-next": {
    title: "next()",
    description: "이터레이터에서 다음 항목을 반환합니다.",
  },
  "ref-func-object": {
    title: "object()",
    description: "클래스 계층 구조의 기본 클래스입니다.",
  },
  "ref-func-oct": {
    title: "oct()",
    description: "정수의 8진수 표현을 반환합니다.",
  },
  "ref-func-open": {
    title: "open()",
    description: "파일을 열고 스트림을 반환합니다.",
  },
  "ref-func-ord": {
    title: "ord()",
    description: "한 문자 문자열에 대한 유니코드 코드 포인트를 반환합니다.",
  },
  "ref-func-pow": {
    title: "pow()",
    description: "2개의 인수로는 base**exp와, 3개의 인수로는 base**exp % mod와 동일합니다. int와 같은 일부 타입은 세 인수 형태로 호출될 때 더 효율적인 알고리즘을 사용할 수 있습니다.",
  },
  "ref-func-print": {
    title: "print()",
    description: "값을 스트림에 출력합니다. 기본값은 sys.stdout입니다.",
  },
  "ref-func-range": {
    title: "range()",
    description: "range(stop) -> range object range(start, stop[, step]) -> range object start(포함)에서 stop(제외)까지 step만큼씩 증가하는 정수들의 시퀀스를 생성하는 객체를 반환합니다.",
  },
  "ref-func-reversed": {
    title: "reversed()",
    description: "주어진 시퀀스의 값들에 대한 역순 이터레이터를 반환합니다.",
  },
  "ref-func-round": {
    title: "round()",
    description: "숫자를 주어진 소수 자릿수 정밀도로 반올림합니다.",
  },
  "ref-func-set": {
    title: "set()",
    description: "set() -> 새 빈 set 객체 set(iterable) -> 새 set 객체 순서 없는 고유 요소들의 컬렉션을 만듭니다.",
  },
  "ref-func-setattr": {
    title: "setattr()",
    description: "주어진 객체의 이름이 지정된 속성을 지정된 값으로 설정합니다.",
  },
  "ref-func-slice": {
    title: "slice()",
    description: "slice(stop) slice(start, stop[, step]) slice 객체를 만듭니다.",
  },
  "ref-func-sorted": {
    title: "sorted()",
    description: "이터러블의 모든 항목을 오름차순으로 담은 새 리스트를 반환합니다.",
  },
  "ref-func-str": {
    title: "str()",
    description: "str(object='') -> str str(bytes_or_buffer[, encoding[, errors]]) -> str 주어진 객체로 새 문자열 객체를 만듭니다.",
  },
  "ref-func-sum": {
    title: "sum()",
    description: "'start' 값(기본값: 0)에 숫자 이터러블을 더한 합을 반환합니다. 이터러블이 비어 있으면 start 값을 반환합니다.",
  },
  "ref-func-super": {
    title: "super()",
    description: "super() -> same as super(__class__, <first argument>) super(type) -> unbound super object super(type, obj) -> bound super object; requires isinstance(obj, type) super(type, type2) -> bound super object; requires issubcla",
  },
  "ref-func-tuple": {
    title: "tuple()",
    description: "내장 변경 불가능 시퀀스입니다.",
  },
  "ref-func-type": {
    title: "type()",
    description: "type(object) -> 객체의 타입 type(name, bases, dict, **kwds) -> 새 타입",
  },
  "ref-func-vars": {
    title: "vars()",
    description: "vars를 보여줍니다.",
  },
  "ref-func-zip": {
    title: "zip()",
    description: "zip(*iterables, strict=False) --> 입력 중 하나가 소진될 때까지 튜플을 산출합니다.",
  },
  "python-ref-string": {
    title: "Python 문자열 메서드",
    description: "문자열 메서드 — str에 호출할 수 있는 모든 메서드입니다.",
  },
  "ref-string-capitalize": {
    title: "capitalize()",
    description: "문자열의 첫 글자를 대문자로 만든 버전을 반환합니다.",
  },
  "ref-string-casefold": {
    title: "casefold()",
    description: "대소문자를 구분하지 않는 비교에 적합한 문자열 버전을 반환합니다.",
  },
  "ref-string-center": {
    title: "center()",
    description: "길이가 width인 가운데 정렬된 문자열을 반환합니다.",
  },
  "ref-string-count": {
    title: "count()",
    description: "S.count(sub[, start[, end]]) -> int S[start:end]에서 부분 문자열 sub가 겹치지 않게 등장하는 횟수를 반환합니다.",
  },
  "ref-string-encode": {
    title: "encode()",
    description: "encoding에 등록된 코덱을 사용해 문자열을 인코딩합니다.",
  },
  "ref-string-endswith": {
    title: "endswith()",
    description: "S.endswith(suffix[, start[, end]]) -> bool S가 지정된 suffix로 끝나면 True를, 그렇지 않으면 False를 반환합니다.",
  },
  "ref-string-expandtabs": {
    title: "expandtabs()",
    description: "모든 탭 문자를 공백으로 확장한 복사본을 반환합니다.",
  },
  "ref-string-find": {
    title: "find()",
    description: "S.find(sub[, start[, end]]) -> int sub가 S[start:end] 안에 포함되도록 S에서 부분 문자열 sub가 발견되는 가장 낮은 인덱스를 반환합니다.",
  },
  "ref-string-format": {
    title: "format()",
    description: "S.format(*args, **kwargs) -> str args와 kwargs의 치환을 사용해 S의 형식이 지정된 버전을 반환합니다.",
  },
  "ref-string-format-map": {
    title: "format_map()",
    description: "format_map() — 아래 예제를 참조하세요.",
  },
  "ref-string-index": {
    title: "index()",
    description: "S.index(sub[, start[, end]]) -> int sub가 S[start:end] 안에 포함되도록 S에서 부분 문자열 sub가 발견되는 가장 낮은 인덱스를 반환합니다.",
  },
  "ref-string-isalnum": {
    title: "isalnum()",
    description: "문자열이 영숫자 문자열이면 True를, 그렇지 않으면 False를 반환합니다.",
  },
  "ref-string-isalpha": {
    title: "isalpha()",
    description: "문자열이 알파벳 문자열이면 True를, 그렇지 않으면 False를 반환합니다.",
  },
  "ref-string-isascii": {
    title: "isascii()",
    description: "문자열의 모든 문자가 ASCII이면 True를, 그렇지 않으면 False를 반환합니다.",
  },
  "ref-string-isdecimal": {
    title: "isdecimal()",
    description: "문자열이 10진수 문자열이면 True를, 그렇지 않으면 False를 반환합니다.",
  },
  "ref-string-isdigit": {
    title: "isdigit()",
    description: "문자열이 숫자(digit) 문자열이면 True를, 그렇지 않으면 False를 반환합니다.",
  },
  "ref-string-isidentifier": {
    title: "isidentifier()",
    description: "문자열이 유효한 Python 식별자이면 True를, 그렇지 않으면 False를 반환합니다.",
  },
  "ref-string-islower": {
    title: "islower()",
    description: "문자열이 소문자 문자열이면 True를, 그렇지 않으면 False를 반환합니다.",
  },
  "ref-string-isnumeric": {
    title: "isnumeric()",
    description: "문자열이 숫자(numeric) 문자열이면 True를, 그렇지 않으면 False를 반환합니다.",
  },
  "ref-string-isprintable": {
    title: "isprintable()",
    description: "문자열이 출력 가능한 문자열이면 True를, 그렇지 않으면 False를 반환합니다.",
  },
  "ref-string-isspace": {
    title: "isspace()",
    description: "문자열이 공백 문자열이면 True를, 그렇지 않으면 False를 반환합니다.",
  },
  "ref-string-istitle": {
    title: "istitle()",
    description: "문자열이 제목 형식(title-cased) 문자열이면 True를, 그렇지 않으면 False를 반환합니다.",
  },
  "ref-string-isupper": {
    title: "isupper()",
    description: "문자열이 대문자 문자열이면 True를, 그렇지 않으면 False를 반환합니다.",
  },
  "ref-string-join": {
    title: "join()",
    description: "임의의 개수의 문자열을 연결합니다.",
  },
  "ref-string-ljust": {
    title: "ljust()",
    description: "길이가 width인 왼쪽 정렬된 문자열을 반환합니다.",
  },
  "ref-string-lower": {
    title: "lower()",
    description: "문자열을 소문자로 변환한 복사본을 반환합니다.",
  },
  "ref-string-lstrip": {
    title: "lstrip()",
    description: "문자열 앞쪽의 공백을 제거한 복사본을 반환합니다.",
  },
  "ref-string-maketrans": {
    title: "maketrans()",
    description: "str.translate()에 사용할 수 있는 변환 테이블을 반환합니다.",
  },
  "ref-string-partition": {
    title: "partition()",
    description: "주어진 구분자를 사용해 문자열을 세 부분으로 나눕니다.",
  },
  "ref-string-replace": {
    title: "replace()",
    description: "부분 문자열 old가 등장하는 모든 곳을 new로 바꾼 복사본을 반환합니다.",
  },
  "ref-string-rfind": {
    title: "rfind()",
    description: "S.rfind(sub[, start[, end]]) -> int sub가 S[start:end] 안에 포함되도록 S에서 부분 문자열 sub가 발견되는 가장 높은 인덱스를 반환합니다.",
  },
  "ref-string-rindex": {
    title: "rindex()",
    description: "S.rindex(sub[, start[, end]]) -> int sub가 S[start:end] 안에 포함되도록 S에서 부분 문자열 sub가 발견되는 가장 높은 인덱스를 반환합니다.",
  },
  "ref-string-rjust": {
    title: "rjust()",
    description: "길이가 width인 오른쪽 정렬된 문자열을 반환합니다.",
  },
  "ref-string-rpartition": {
    title: "rpartition()",
    description: "주어진 구분자를 사용해 문자열을 세 부분으로 나눕니다.",
  },
  "ref-string-rsplit": {
    title: "rsplit()",
    description: "sep를 구분자 문자열로 사용해 문자열에 있는 부분 문자열들의 리스트를 반환합니다.",
  },
  "ref-string-rstrip": {
    title: "rstrip()",
    description: "문자열 뒤쪽의 공백을 제거한 복사본을 반환합니다.",
  },
  "ref-string-split": {
    title: "split()",
    description: "sep를 구분자 문자열로 사용해 문자열에 있는 부분 문자열들의 리스트를 반환합니다.",
  },
  "ref-string-splitlines": {
    title: "splitlines()",
    description: "줄 경계에서 나누어 문자열에 있는 줄들의 리스트를 반환합니다.",
  },
  "ref-string-startswith": {
    title: "startswith()",
    description: "S.startswith(prefix[, start[, end]]) -> bool S가 지정된 prefix로 시작하면 True를, 그렇지 않으면 False를 반환합니다.",
  },
  "ref-string-strip": {
    title: "strip()",
    description: "문자열 앞뒤의 공백을 제거한 복사본을 반환합니다.",
  },
  "ref-string-swapcase": {
    title: "swapcase()",
    description: "대문자를 소문자로, 소문자를 대문자로 변환합니다.",
  },
  "ref-string-title": {
    title: "title()",
    description: "각 단어가 titlecase인 문자열 버전을 반환합니다.",
  },
  "ref-string-translate": {
    title: "translate()",
    description: "주어진 변환 테이블을 사용해 문자열의 각 문자를 바꿉니다.",
  },
  "ref-string-upper": {
    title: "upper()",
    description: "문자열을 대문자로 변환한 복사본을 반환합니다.",
  },
  "ref-string-zfill": {
    title: "zfill()",
    description: "주어진 너비의 필드를 채우기 위해 숫자 문자열의 왼쪽을 0으로 채웁니다.",
  },
  "python-ref-list": {
    title: "Python 리스트 메서드",
    description: "리스트 메서드 — 리스트에 호출할 수 있는 모든 메서드입니다.",
  },
  "ref-list-append": {
    title: "append()",
    description: "객체를 리스트 끝에 추가합니다.",
  },
  "ref-list-clear": {
    title: "clear()",
    description: "리스트에서 모든 항목을 제거합니다.",
  },
  "ref-list-copy": {
    title: "copy()",
    description: "리스트의 얕은 복사본을 반환합니다.",
  },
  "ref-list-count": {
    title: "count()",
    description: "value가 등장하는 횟수를 반환합니다.",
  },
  "ref-list-extend": {
    title: "extend()",
    description: "이터러블의 요소들을 추가해 리스트를 확장합니다.",
  },
  "ref-list-index": {
    title: "index()",
    description: "value의 첫 번째 인덱스를 반환합니다.",
  },
  "ref-list-insert": {
    title: "insert()",
    description: "index 앞에 객체를 삽입합니다.",
  },
  "ref-list-pop": {
    title: "pop()",
    description: "index에 있는 항목을 제거하고 반환합니다(기본값은 마지막 항목).",
  },
  "ref-list-remove": {
    title: "remove()",
    description: "value의 첫 번째 등장을 제거합니다.",
  },
  "ref-list-reverse": {
    title: "reverse()",
    description: "*IN PLACE*로 뒤집습니다.",
  },
  "ref-list-sort": {
    title: "sort()",
    description: "리스트를 오름차순으로 정렬하고 None을 반환합니다.",
  },
  "python-ref-dictionary": {
    title: "Python 딕셔너리 메서드",
    description: "딕셔너리 메서드 — dict에 호출할 수 있는 모든 메서드입니다.",
  },
  "ref-dictionary-clear": {
    title: "clear()",
    description: "D.clear() -> None.",
  },
  "ref-dictionary-copy": {
    title: "copy()",
    description: "D.copy() -> D의 얕은 복사본",
  },
  "ref-dictionary-fromkeys": {
    title: "fromkeys()",
    description: "이터러블의 키와 value로 설정된 값을 가진 새 딕셔너리를 만듭니다.",
  },
  "ref-dictionary-get": {
    title: "get()",
    description: "key가 딕셔너리에 있으면 key에 대한 값을, 그렇지 않으면 default를 반환합니다.",
  },
  "ref-dictionary-items": {
    title: "items()",
    description: "D.items() -> D의 항목들에 대한 뷰를 제공하는 set-like 객체",
  },
  "ref-dictionary-keys": {
    title: "keys()",
    description: "D.keys() -> D의 키들에 대한 뷰를 제공하는 set-like 객체",
  },
  "ref-dictionary-pop": {
    title: "pop()",
    description: "D.pop(k[,d]) -> v, 지정된 키를 제거하고 해당 값을 반환합니다.",
  },
  "ref-dictionary-popitem": {
    title: "popitem()",
    description: "(key, value) 쌍을 2-튜플로 제거하고 반환합니다.",
  },
  "ref-dictionary-setdefault": {
    title: "setdefault()",
    description: "key가 딕셔너리에 없으면 key를 default 값과 함께 삽입합니다.",
  },
  "ref-dictionary-update": {
    title: "update()",
    description: "D.update([E, ]**F) -> None.",
  },
  "ref-dictionary-values": {
    title: "values()",
    description: "D.values() -> D의 값들에 대한 뷰를 제공하는 객체",
  },
  "python-ref-tuple": {
    title: "Python 튜플 메서드",
    description: "튜플 메서드 — 튜플에 호출할 수 있는 모든 메서드입니다.",
  },
  "ref-tuple-count": {
    title: "count()",
    description: "value가 등장하는 횟수를 반환합니다.",
  },
  "ref-tuple-index": {
    title: "index()",
    description: "value의 첫 번째 인덱스를 반환합니다.",
  },
  "python-ref-set": {
    title: "Python 집합 메서드",
    description: "집합 메서드 — 집합에 호출할 수 있는 모든 메서드입니다.",
  },
  "ref-set-add": {
    title: "add()",
    description: "집합에 요소를 추가합니다.",
  },
  "ref-set-clear": {
    title: "clear()",
    description: "이 집합에서 모든 요소를 제거합니다.",
  },
  "ref-set-copy": {
    title: "copy()",
    description: "집합의 얕은 복사본을 반환합니다.",
  },
  "ref-set-difference": {
    title: "difference()",
    description: "두 개 이상의 집합의 차집합을 새 집합으로 반환합니다.",
  },
  "ref-set-difference-update": {
    title: "difference_update()",
    description: "difference_update() — 아래 예제를 참조하세요.",
  },
  "ref-set-discard": {
    title: "discard()",
    description: "집합의 멤버이면 요소를 제거합니다.",
  },
  "ref-set-intersection": {
    title: "intersection()",
    description: "두 집합의 교집합을 새 집합으로 반환합니다.",
  },
  "ref-set-intersection-update": {
    title: "intersection_update()",
    description: "intersection_update() — 아래 예제를 참조하세요.",
  },
  "ref-set-isdisjoint": {
    title: "isdisjoint()",
    description: "두 집합의 교집합이 비어 있으면 True를 반환합니다.",
  },
  "ref-set-issubset": {
    title: "issubset()",
    description: "집합의 모든 요소가 other에 있는지 테스트합니다.",
  },
  "ref-set-lessthan": {
    title: "<",
    description: "<는 집합이 다른 집합의 진부분집합(proper subset)인지 검사합니다.",
  },
  "ref-set-issuperset": {
    title: "issuperset()",
    description: "other의 모든 요소가 집합에 있는지 테스트합니다.",
  },
  "ref-set-greaterthan": {
    title: ">",
    description: ">는 집합이 다른 집합의 진상위집합(proper superset)인지 검사합니다.",
  },
  "ref-set-pop": {
    title: "pop()",
    description: "임의의 집합 요소를 제거하고 반환합니다.",
  },
  "ref-set-remove": {
    title: "remove()",
    description: "집합에서 요소를 제거합니다. 반드시 멤버여야 합니다.",
  },
  "ref-set-symmetric-difference": {
    title: "symmetric_difference()",
    description: "symmetric_difference() — 아래 예제를 참조하세요.",
  },
  "ref-set-symmetric-difference-update": {
    title: "symmetric_difference_update()",
    description: "symmetric_difference_update() — 아래 예제를 참조하세요.",
  },
  "ref-set-union": {
    title: "union()",
    description: "집합들의 합집합을 새 집합으로 반환합니다.",
  },
  "ref-set-update": {
    title: "update()",
    description: "집합을 자기 자신과 others의 합집합으로 업데이트합니다.",
  },
  "python-reference": {
    title: "Python 개요",
    description: "Python 레퍼런스 — 모든 내장 함수, 메서드, 키워드, 예외를 한곳에 모았습니다.",
  },
  "python-ref-file": {
    title: "Python 파일 메서드",
    description: "파일 메서드 — 열린 파일 객체에 호출할 수 있는 모든 메서드입니다.",
  },
  "ref-file-close": {
    title: "close()",
    description: "IO 객체를 닫습니다.",
  },
  "ref-file-fileno": {
    title: "fileno()",
    description: "존재하면 기본 파일 디스크립터를 반환합니다.",
  },
  "ref-file-flush": {
    title: "flush()",
    description: "해당하는 경우 쓰기 버퍼를 비웁니다.",
  },
  "ref-file-isatty": {
    title: "isatty()",
    description: "이것이 'interactive' 스트림인지 여부를 반환합니다.",
  },
  "ref-file-read": {
    title: "read()",
    description: "최대 size개의 문자를 읽어 문자열로 반환합니다.",
  },
  "ref-file-readable": {
    title: "readable()",
    description: "IO 객체를 읽을 수 있으면 True를 반환합니다.",
  },
  "ref-file-readline": {
    title: "readline()",
    description: "줄바꿈이나 EOF까지 읽습니다.",
  },
  "ref-file-readlines": {
    title: "readlines()",
    description: "스트림에서 줄들의 리스트를 반환합니다.",
  },
  "ref-file-seek": {
    title: "seek()",
    description: "스트림 위치를 변경합니다.",
  },
  "ref-file-seekable": {
    title: "seekable()",
    description: "IO 객체를 seek할 수 있으면 True를 반환합니다.",
  },
  "ref-file-tell": {
    title: "tell()",
    description: "현재 파일 위치를 알려줍니다.",
  },
  "ref-file-truncate": {
    title: "truncate()",
    description: "size를 pos까지 자릅니다.",
  },
  "ref-file-writable": {
    title: "writable()",
    description: "IO 객체에 쓸 수 있으면 True를 반환합니다.",
  },
  "ref-file-write": {
    title: "write()",
    description: "문자열을 파일에 씁니다.",
  },
  "ref-file-writelines": {
    title: "writelines()",
    description: "줄들의 리스트를 스트림에 씁니다.",
  },
  "python-ref-keywords": {
    title: "Python 키워드",
    description: "Python 키워드 — 언어를 이루는 예약어입니다.",
  },
  "ref-keyword-and": {
    title: "and",
    description: "and는 논리 연산자입니다 — 양쪽이 모두 True일 때만 True입니다.",
  },
  "ref-keyword-as": {
    title: "as",
    description: "as는 가져온 모듈이나 잡은 예외에 다른 이름을 붙여줍니다.",
  },
  "ref-keyword-assert": {
    title: "assert",
    description: "assert는 조건을 검사합니다 — False이면 Python이 AssertionError를 발생시킵니다.",
  },
  "ref-keyword-async": {
    title: "async",
    description: "async는 함수를 비동기로 표시합니다 — await와 함께 실행하는 코루틴을 반환합니다.",
  },
  "ref-keyword-await": {
    title: "await",
    description: "await는 기다리는 대상이 끝날 때까지 async 함수를 일시 중지합니다.",
  },
  "ref-keyword-break": {
    title: "break",
    description: "break는 가장 가까운 루프를 즉시 빠져나갑니다.",
  },
  "ref-keyword-case": {
    title: "case",
    description: "case는 match 문의 한 분기입니다 — 패턴이 맞으면 실행됩니다.",
  },
  "ref-keyword-class": {
    title: "class",
    description: "class는 새 클래스를 정의합니다 — 객체의 설계도입니다.",
  },
  "ref-keyword-continue": {
    title: "continue",
    description: "continue는 현재 루프 회차의 나머지를 건너뛰고 다음 회차를 시작합니다.",
  },
  "ref-keyword-def": {
    title: "def",
    description: "def는 함수를 정의합니다.",
  },
  "ref-keyword-del": {
    title: "del",
    description: "del은 변수, 항목 또는 슬라이스를 삭제합니다.",
  },
  "ref-keyword-elif": {
    title: "elif",
    description: "elif는 두 번째 조건입니다 — 위의 if가 False였을 때만 검사됩니다.",
  },
  "ref-keyword-else": {
    title: "else",
    description: "else는 위의 if(와 elif)가 모두 False였을 때 실행됩니다.",
  },
  "ref-keyword-except": {
    title: "except",
    description: "except는 일치하는 try 블록 안에서 발생한 오류를 잡습니다.",
  },
  "ref-keyword-false": {
    title: "False",
    description: "False는 '아니요'에 해당하는 불리언 값입니다.",
  },
  "ref-keyword-finally": {
    title: "finally",
    description: "finally는 무슨 일이 있어도 — 오류가 나든 아니든 — try 블록 뒤에 실행됩니다.",
  },
  "ref-keyword-for": {
    title: "for",
    description: "for는 시퀀스의 각 항목을 한 번에 하나씩 순회합니다.",
  },
  "ref-keyword-from": {
    title: "from",
    description: "from은 모듈에서 특정 이름을 가져옵니다.",
  },
  "ref-keyword-global": {
    title: "global",
    description: "global은 함수 안의 이름이 모듈 수준 변수를 가리킨다고 말합니다.",
  },
  "ref-keyword-if": {
    title: "if",
    description: "if는 조건이 True일 때만 블록을 실행합니다.",
  },
  "ref-keyword-import": {
    title: "import",
    description: "import는 모듈의 이름을 프로그램으로 가져옵니다.",
  },
  "ref-keyword-in": {
    title: "in",
    description: "in은 멤버십을 검사합니다 — 왼쪽이 오른쪽 안에 있으면 True입니다.",
  },
  "ref-keyword-is": {
    title: "is",
    description: "is는 동일성을 검사합니다 — 두 이름이 같은 객체를 가리키면 True입니다.",
  },
  "ref-keyword-lambda": {
    title: "lambda",
    description: "lambda는 한 줄로 작은 익명 함수를 만듭니다.",
  },
  "ref-keyword-match": {
    title: "match",
    description: "match는 값을 패턴과 대조해 검사하고, 처음 맞는 패턴을 실행합니다.",
  },
  "ref-keyword-none": {
    title: "None",
    description: "None은 '여기에 값 없음'을 의미합니다 — 값의 부재입니다.",
  },
  "ref-keyword-nonlocal": {
    title: "nonlocal",
    description: "nonlocal은 중첩 함수 안의 이름이 바깥 함수의 변수를 가리킨다고 말합니다.",
  },
  "ref-keyword-not": {
    title: "not",
    description: "not은 불리언을 뒤집습니다 — True는 False가 되고, 그 반대도 마찬가지입니다.",
  },
  "ref-keyword-or": {
    title: "or",
    description: "or는 논리 연산자입니다 — 적어도 한쪽이 True이면 True입니다.",
  },
  "ref-keyword-pass": {
    title: "pass",
    description: "pass는 아무것도 하지 않습니다 — Python에 문장이 필요한 곳의 자리 표시자입니다.",
  },
  "ref-keyword-raise": {
    title: "raise",
    description: "raise는 의도적으로 예외를 발생시킵니다.",
  },
  "ref-keyword-return": {
    title: "return",
    description: "return은 값을 함수 밖으로 돌려보내고 함수를 끝냅니다.",
  },
  "ref-keyword-true": {
    title: "True",
    description: "True는 '예'에 해당하는 불리언 값입니다.",
  },
  "ref-keyword-try": {
    title: "try",
    description: "try는 실패할 수 있는 코드를 감싸서 except가 오류를 잡을 수 있게 합니다.",
  },
  "ref-keyword-while": {
    title: "while",
    description: "while은 조건이 True로 유지되는 동안 블록을 반복합니다.",
  },
  "ref-keyword-with": {
    title: "with",
    description: "with은 리소스(파일 등)를 열고, 블록이 끝나면 대신 닫아줍니다.",
  },
  "ref-keyword-yield": {
    title: "yield",
    description: "yield는 제너레이터 함수를 일시 중지하고 호출자에게 값 하나를 건네줍니다.",
  },
  "python-ref-exceptions": {
    title: "Python 예외",
    description: "Python 예외 — Python이 발생시키는 오류와 각 오류의 의미입니다.",
  },
  "ref-exception-arithmeticerror": {
    title: "ArithmeticError",
    description: "ArithmeticError는 모든 산술 오류의 부모입니다(ZeroDivisionError, OverflowError, FloatingPointError).",
  },
  "ref-exception-assertionerror": {
    title: "AssertionError",
    description: "AssertionError는 assert 문이 실패할 때 발생합니다.",
  },
  "ref-exception-attributeerror": {
    title: "AttributeError",
    description: "AttributeError는 존재하지 않는 속성이나 메서드에 접근할 때 발생합니다.",
  },
  "ref-exception-exception": {
    title: "Exception",
    description: "Exception은 여러분이 잡게 될 거의 모든 오류의 부모입니다.",
  },
  "ref-exception-eoferror": {
    title: "EOFError",
    description: "EOFError는 input()이나 read가 남은 것 없이 파일 끝에 도달할 때 발생합니다.",
  },
  "ref-exception-floatingpointerror": {
    title: "FloatingPointError",
    description: "FloatingPointError는 부동소수점 연산이 실패할 때 발생합니다.",
  },
  "ref-exception-generatorexit": {
    title: "GeneratorExit",
    description: "GeneratorExit는 제너레이터가 일찍 닫힐 때 그 안에서 발생합니다.",
  },
  "ref-exception-importerror": {
    title: "ImportError",
    description: "ImportError는 import가 모듈을 찾을 수 없을 때 발생합니다.",
  },
  "ref-exception-indentationerror": {
    title: "IndentationError",
    description: "IndentationError는 블록의 들여쓰기가 잘못되었을 때 발생합니다.",
  },
  "ref-exception-indexerror": {
    title: "IndexError",
    description: "IndexError는 리스트나 튜플의 인덱스가 범위를 벗어날 때 발생합니다.",
  },
  "ref-exception-keyerror": {
    title: "KeyError",
    description: "KeyError는 딕셔너리 키가 존재하지 않을 때 발생합니다.",
  },
  "ref-exception-keyboardinterrupt": {
    title: "KeyboardInterrupt",
    description: "KeyboardInterrupt는 사용자가 Ctrl+C를 누를 때 발생합니다.",
  },
  "ref-exception-lookuperror": {
    title: "LookupError",
    description: "LookupError는 IndexError와 KeyError의 부모입니다.",
  },
  "ref-exception-memoryerror": {
    title: "MemoryError",
    description: "MemoryError는 Python의 메모리가 부족할 때 발생합니다.",
  },
  "ref-exception-nameerror": {
    title: "NameError",
    description: "NameError는 정의된 적 없는 변수를 사용할 때 발생합니다.",
  },
  "ref-exception-notimplementederror": {
    title: "NotImplementedError",
    description: "NotImplementedError는 '이 부분은 아직 작성되지 않았습니다'라고 말하기 위해 발생합니다.",
  },
  "ref-exception-oserror": {
    title: "OSError",
    description: "OSError는 운영 체제가 무언가를 거부할 때 발생합니다(파일 없음, 권한 없음).",
  },
  "ref-exception-overflowerror": {
    title: "OverflowError",
    description: "OverflowError는 숫자가 타입에 비해 너무 클 때 발생합니다.",
  },
  "ref-exception-referenceerror": {
    title: "ReferenceError",
    description: "ReferenceError는 약한 참조가 이미 사라진 객체를 가리킬 때 발생합니다.",
  },
  "ref-exception-runtimeerror": {
    title: "RuntimeError",
    description: "RuntimeError는 런타임에 무언가 잘못되었을 때의 일반적인 오류입니다.",
  },
  "ref-exception-stopiteration": {
    title: "StopIteration",
    description: "StopIteration은 이터레이터가 끝났을 때 next()가 발생시킵니다.",
  },
  "ref-exception-syntaxerror": {
    title: "SyntaxError",
    description: "SyntaxError는 코드 자체가 유효한 Python이 아닐 때 발생합니다.",
  },
  "ref-exception-taberror": {
    title: "TabError",
    description: "TabError는 들여쓰기에 탭과 공백이 섞였을 때 발생합니다.",
  },
  "ref-exception-systemerror": {
    title: "SystemError",
    description: "SystemError는 인터프리터 자체에 내부 문제가 생겼을 때 발생합니다.",
  },
  "ref-exception-systemexit": {
    title: "SystemExit",
    description: "SystemExit은 sys.exit()이 발생시킵니다 — 프로그램을 종료합니다.",
  },
  "ref-exception-typeerror": {
    title: "TypeError",
    description: "TypeError는 연산을 잘못된 타입에 사용할 때 발생합니다.",
  },
  "ref-exception-unboundlocalerror": {
    title: "UnboundLocalError",
    description: "UnboundLocalError는 지역 변수에 할당하기 전에 읽을 때 발생합니다.",
  },
  "ref-exception-unicodeerror": {
    title: "UnicodeError",
    description: "UnicodeError는 UnicodeEncodeError, UnicodeDecodeError, UnicodeTranslateError의 부모입니다.",
  },
  "ref-exception-unicodeencodeerror": {
    title: "UnicodeEncodeError",
    description: "UnicodeEncodeError는 텍스트를 바이트로 인코딩할 수 없을 때 발생합니다.",
  },
  "ref-exception-unicodedecodeerror": {
    title: "UnicodeDecodeError",
    description: "UnicodeDecodeError는 바이트를 텍스트로 디코딩할 수 없을 때 발생합니다.",
  },
  "ref-exception-unicodetranslateerror": {
    title: "UnicodeTranslateError",
    description: "UnicodeTranslateError는 문자를 변환할 수 없을 때 발생합니다.",
  },
  "ref-exception-valueerror": {
    title: "ValueError",
    description: "ValueError는 값의 타입은 맞지만 내용이 잘못되었을 때 발생합니다.",
  },
  "ref-exception-zerodivisionerror": {
    title: "ZeroDivisionError",
    description: "ZeroDivisionError는 0으로 나눌 때 발생합니다.",
  },
  "python-ref-glossary": {
    title: "Python 용어집",
    description: "Python 용어집 — Python 개발자들이 사용하는 단어를 한 줄씩 설명합니다.",
  },
};
