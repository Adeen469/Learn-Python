import type { ReferenceTranslations } from "../types";

export const TRANSLATIONS: ReferenceTranslations = {
  "python-ref-functions": {
    title: "دوال بايثون المدمجة",
    description: "دوال بايثون المدمجة — متوفرة دائماً، دون الحاجة إلى استيراد.",
  },
  "ref-func-abs": {
    title: "abs()",
    description: "تُرجع القيمة المطلقة للوسيط.",
  },
  "ref-func-all": {
    title: "all()",
    description: "تُرجع True إذا كان bool(x) يساوي True لكل قيمة x في القابل للتكرار.",
  },
  "ref-func-any": {
    title: "any()",
    description: "تُرجع True إذا كان bool(x) يساوي True لأي x في القابل للتكرار.",
  },
  "ref-func-ascii": {
    title: "ascii()",
    description: "تُرجع تمثيلاً يحتوي على أحرف ASCII فقط للكائن.",
  },
  "ref-func-bin": {
    title: "bin()",
    description: "تُرجع التمثيل الثنائي لعدد صحيح.",
  },
  "ref-func-bool": {
    title: "bool()",
    description: "bool(x) -> bool تُرجع True عندما يكون الوسيط x صحيحاً، وFalse في غير ذلك.",
  },
  "ref-func-bytearray": {
    title: "bytearray()",
    description: "bytearray(iterable_of_ints) -> bytearray bytearray(string, encoding[, errors]) -> bytearray bytearray(bytes_or_buffer) -> نسخة قابلة للتغيير من bytes_or_buffer bytearray(int) -> مصفوفة بايتات بحجم يحدده الوسيط initi",
  },
  "ref-func-bytes": {
    title: "bytes()",
    description: "bytes(iterable_of_ints) -> bytes bytes(string, encoding[, errors]) -> bytes bytes(bytes_or_buffer) -> نسخة غير قابلة للتغيير من bytes_or_buffer bytes(int) -> كائن بايتات بحجم يحدده الوسيط، مهيأ ببايت فارغ",
  },
  "ref-func-callable": {
    title: "callable()",
    description: "تُرجع ما إذا كان الكائن قابلاً للاستدعاء (أي نوعاً من أنواع الدوال).",
  },
  "ref-func-chr": {
    title: "chr()",
    description: "تُرجع سلسلة Unicode من حرف واحد ترتيبه i؛ 0 <= i <= 0x10ffff.",
  },
  "ref-func-compile": {
    title: "compile()",
    description: "تُترجم المصدر إلى كائن كود يمكن تنفيذه بواسطة exec() أو eval().",
  },
  "ref-func-complex": {
    title: "complex()",
    description: "تُنشئ عدداً مركباً من جزء حقيقي وجزء تخيلي اختياري.",
  },
  "ref-func-delattr": {
    title: "delattr()",
    description: "تحذف الخاصية المسماة من الكائن المعطى.",
  },
  "ref-func-dict": {
    title: "dict()",
    description: "dict() -> قاموس فارغ جديد dict(mapping) -> قاموس جديد مهيأ من أزواج (key, value) لكائن mapping dict(iterable) -> قاموس جديد مهيأ كما لو عبر: d = {} for k, v in iterable: d[k] = v dict(**k",
  },
  "ref-func-dir": {
    title: "dir()",
    description: "تعرض خصائص كائن.",
  },
  "ref-func-divmod": {
    title: "divmod()",
    description: "تُرجع الصف (x//y, x%y).",
  },
  "ref-func-enumerate": {
    title: "enumerate()",
    description: "تُرجع كائن enumerate.",
  },
  "ref-func-eval": {
    title: "eval()",
    description: "تقيّم المصدر المعطى في سياق globals وlocals.",
  },
  "ref-func-exec": {
    title: "exec()",
    description: "تنفّذ المصدر المعطى في سياق globals وlocals.",
  },
  "ref-func-filter": {
    title: "filter()",
    description: "filter(function or None, iterable) --> filter object تُرجع مكرراً ينتج عناصر iterable التي تكون function(item) صحيحة لها.",
  },
  "ref-func-float": {
    title: "float()",
    description: "تحوّل سلسلة نصية أو عدداً إلى عدد عشري، إن أمكن.",
  },
  "ref-func-format": {
    title: "format()",
    description: "تُرجع type(value).__format__(value, format_spec) تنفّذ أنواع مدمجة كثيرة format_spec وفق لغة تنسيق المواصفات المصغرة.",
  },
  "ref-func-frozenset": {
    title: "frozenset()",
    description: "frozenset() -> كائن frozenset فارغ frozenset(iterable) -> كائن frozenset ابنِ مجموعة غير قابلة للتغيير وغير مرتبة من عناصر فريدة.",
  },
  "ref-func-getattr": {
    title: "getattr()",
    description: "تحصل على خاصية مسماة من كائن.",
  },
  "ref-func-globals": {
    title: "globals()",
    description: "تُرجع القاموس الذي يحتوي على متغيرات النطاق العام الحالية.",
  },
  "ref-func-hasattr": {
    title: "hasattr()",
    description: "تُرجع ما إذا كان الكائن يملك خاصية بالاسم المعطى.",
  },
  "ref-func-hex": {
    title: "hex()",
    description: "تُرجع التمثيل الست عشري لعدد صحيح.",
  },
  "ref-func-id": {
    title: "id()",
    description: "تُرجع هوية كائن.",
  },
  "ref-func-input": {
    title: "input()",
    description: "تقرأ سلسلة نصية من الإدخال القياسي.",
  },
  "ref-func-int": {
    title: "int()",
    description: "int([x]) -> integer int(x, base=10) -> integer تحوّل عدداً أو سلسلة نصية إلى عدد صحيح، أو تُرجع 0 إذا لم تُعطَ أي وسيطات.",
  },
  "ref-func-isinstance": {
    title: "isinstance()",
    description: "تُرجع ما إذا كان كائن نسخة من صنف أو من صنف فرعي منه.",
  },
  "ref-func-issubclass": {
    title: "issubclass()",
    description: "تُرجع ما إذا كانت 'cls' مشتقة من صنف آخر أو هي الصنف نفسه.",
  },
  "ref-func-iter": {
    title: "iter()",
    description: "تحصل على مكرر من كائن.",
  },
  "ref-func-len": {
    title: "len()",
    description: "تُرجع عدد العناصر في حاوية.",
  },
  "ref-func-list": {
    title: "list()",
    description: "تسلسل قابل للتغيير مدمج.",
  },
  "ref-func-locals": {
    title: "locals()",
    description: "تُرجع قاموساً يحتوي على متغيرات النطاق المحلي الحالية.",
  },
  "ref-func-map": {
    title: "map()",
    description: "map(func, *iterables) --> map object تُنشئ مكرراً يحسب الدالة باستخدام وسيطات من كل قابل للتكرار.",
  },
  "ref-func-max": {
    title: "max()",
    description: "max(iterable, *[, default=obj, key=func]) -> value max(arg1, arg2, *args, *[, key=func]) -> value مع وسيط قابل للتكرار واحد، تُرجع أكبر عنصر فيه.",
  },
  "ref-func-memoryview": {
    title: "memoryview()",
    description: "تُنشئ كائن memoryview جديداً يشير إلى الكائن المعطى.",
  },
  "ref-func-min": {
    title: "min()",
    description: "min(iterable, *[, default=obj, key=func]) -> value min(arg1, arg2, *args, *[, key=func]) -> value مع وسيط قابل للتكرار واحد، تُرجع أصغر عنصر فيه.",
  },
  "ref-func-next": {
    title: "next()",
    description: "تُرجع العنصر التالي من المكرر.",
  },
  "ref-func-object": {
    title: "object()",
    description: "الصنف الأساسي في التسلسل الهرمي للصفوف.",
  },
  "ref-func-oct": {
    title: "oct()",
    description: "تُرجع التمثيل الثماني لعدد صحيح.",
  },
  "ref-func-open": {
    title: "open()",
    description: "تفتح ملفاً وتُرجع دفقاً.",
  },
  "ref-func-ord": {
    title: "ord()",
    description: "تُرجع نقطة كود Unicode لسلسلة من حرف واحد.",
  },
  "ref-func-pow": {
    title: "pow()",
    description: "تكافئ base**exp مع وسيطين أو base**exp % mod مع 3 وسيطات بعض الأنواع، مثل ints، قادرة على استخدام خوارزمية أكثر كفاءة عند استدعائها بصيغة الوسيطات الثلاثة.",
  },
  "ref-func-print": {
    title: "print()",
    description: "تطبع القيم إلى دفق، أو إلى sys.stdout افتراضياً.",
  },
  "ref-func-range": {
    title: "range()",
    description: "range(stop) -> range object range(start, stop[, step]) -> range object تُرجع كائناً ينتج تسلسلاً من الأعداد الصحيحة من start (شاملاً) إلى stop (غير شامل) بخطوة step.",
  },
  "ref-func-reversed": {
    title: "reversed()",
    description: "تُرجع مكرراً عكسياً على قيم التسلسل المعطى.",
  },
  "ref-func-round": {
    title: "round()",
    description: "تقرّب عدداً إلى دقة معينة بالأرقام العشرية.",
  },
  "ref-func-set": {
    title: "set()",
    description: "set() -> كائن set فارغ جديد set(iterable) -> كائن set جديد ابنِ مجموعة غير مرتبة من عناصر فريدة.",
  },
  "ref-func-setattr": {
    title: "setattr()",
    description: "تعيّن الخاصية المسماة على الكائن المعطى إلى القيمة المحددة.",
  },
  "ref-func-slice": {
    title: "slice()",
    description: "slice(stop) slice(start, stop[, step]) تُنشئ كائن slice.",
  },
  "ref-func-sorted": {
    title: "sorted()",
    description: "تُرجع قائمة جديدة تحتوي على كل عناصر القابل للتكرار بترتيب تصاعدي.",
  },
  "ref-func-str": {
    title: "str()",
    description: "str(object='') -> str str(bytes_or_buffer[, encoding[, errors]]) -> str تُنشئ كائن سلسلة نصية جديداً من الكائن المعطى.",
  },
  "ref-func-sum": {
    title: "sum()",
    description: "تُرجع مجموع قيمة 'start' (الافتراضي: 0) زائد قابل للتكرار من الأعداد عندما يكون القابل للتكرار فارغاً، تُرجع قيمة البداية.",
  },
  "ref-func-super": {
    title: "super()",
    description: "super() -> نفس super(__class__, <first argument>) super(type) -> كائن super غير مرتبط super(type, obj) -> كائن super مرتبط؛ يتطلب isinstance(obj, type) super(type, type2) -> كائن super مرتبط؛ يتطلب issubcla",
  },
  "ref-func-tuple": {
    title: "tuple()",
    description: "تسلسل غير قابل للتغيير مدمج.",
  },
  "ref-func-type": {
    title: "type()",
    description: "type(object) -> نوع الكائن type(name, bases, dict, **kwds) -> نوع جديد",
  },
  "ref-func-vars": {
    title: "vars()",
    description: "تعرض vars.",
  },
  "ref-func-zip": {
    title: "zip()",
    description: "zip(*iterables, strict=False) --> تُنتج صفوفاً حتى يُستنفد أحد المدخلات.",
  },
  "python-ref-string": {
    title: "طرق السلاسل النصية في بايثون",
    description: "طرق السلاسل النصية — كل طريقة يمكنك استدعاؤها على str.",
  },
  "ref-string-capitalize": {
    title: "capitalize()",
    description: "تُرجع نسخة من السلسلة النصية بحرف أول كبير.",
  },
  "ref-string-casefold": {
    title: "casefold()",
    description: "تُرجع نسخة من السلسلة النصية مناسبة للمقارنات غير الحساسة لحالة الأحرف.",
  },
  "ref-string-center": {
    title: "center()",
    description: "تُرجع سلسلة نصية ممركزة بطول width.",
  },
  "ref-string-count": {
    title: "count()",
    description: "S.count(sub[, start[, end]]) -> int تُرجع عدد تكرارات السلسلة الفرعية sub غير المتداخلة في السلسلة S[start:end].",
  },
  "ref-string-encode": {
    title: "encode()",
    description: "تُشفّر السلسلة النصية باستخدام الترميز المسجل للتشفير.",
  },
  "ref-string-endswith": {
    title: "endswith()",
    description: "S.endswith(suffix[, start[, end]]) -> bool تُرجع True إذا كانت S تنتهي باللاحقة المحددة، وFalse في غير ذلك.",
  },
  "ref-string-expandtabs": {
    title: "expandtabs()",
    description: "تُرجع نسخة تُوسَّع فيها كل أحرف الجدولة باستخدام المسافات.",
  },
  "ref-string-find": {
    title: "find()",
    description: "S.find(sub[, start[, end]]) -> int تُرجع أدنى فهرس في S يوجد فيه السلسلة الفرعية sub، بحيث تكون sub ضمن S[start:end].",
  },
  "ref-string-format": {
    title: "format()",
    description: "S.format(*args, **kwargs) -> str تُرجع نسخة منسقة من S، باستخدام بدائل من args وkwargs.",
  },
  "ref-string-format-map": {
    title: "format_map()",
    description: "format_map() — انظر المثال أدناه.",
  },
  "ref-string-index": {
    title: "index()",
    description: "S.index(sub[, start[, end]]) -> int تُرجع أدنى فهرس في S يوجد فيه السلسلة الفرعية sub، بحيث تكون sub ضمن S[start:end].",
  },
  "ref-string-isalnum": {
    title: "isalnum()",
    description: "تُرجع True إذا كانت السلسلة النصية أبجدية رقمية، وFalse في غير ذلك.",
  },
  "ref-string-isalpha": {
    title: "isalpha()",
    description: "تُرجع True إذا كانت السلسلة النصية أبجدية، وFalse في غير ذلك.",
  },
  "ref-string-isascii": {
    title: "isascii()",
    description: "تُرجع True إذا كانت كل الأحرف في السلسلة النصية ASCII، وFalse في غير ذلك.",
  },
  "ref-string-isdecimal": {
    title: "isdecimal()",
    description: "تُرجع True إذا كانت السلسلة النصية عشرية، وFalse في غير ذلك.",
  },
  "ref-string-isdigit": {
    title: "isdigit()",
    description: "تُرجع True إذا كانت السلسلة النصية رقمية، وFalse في غير ذلك.",
  },
  "ref-string-isidentifier": {
    title: "isidentifier()",
    description: "تُرجع True إذا كانت السلسلة النصية معرّف بايثون صالحاً، وFalse في غير ذلك.",
  },
  "ref-string-islower": {
    title: "islower()",
    description: "تُرجع True إذا كانت السلسلة النصية بأحرف صغيرة، وFalse في غير ذلك.",
  },
  "ref-string-isnumeric": {
    title: "isnumeric()",
    description: "تُرجع True إذا كانت السلسلة النصية عددية، وFalse في غير ذلك.",
  },
  "ref-string-isprintable": {
    title: "isprintable()",
    description: "تُرجع True إذا كانت السلسلة النصية قابلة للطباعة، وFalse في غير ذلك.",
  },
  "ref-string-isspace": {
    title: "isspace()",
    description: "تُرجع True إذا كانت السلسلة النصية مسافات بيضاء، وFalse في غير ذلك.",
  },
  "ref-string-istitle": {
    title: "istitle()",
    description: "تُرجع True إذا كانت السلسلة النصية بأحرف عنوانية، وFalse في غير ذلك.",
  },
  "ref-string-isupper": {
    title: "isupper()",
    description: "تُرجع True إذا كانت السلسلة النصية بأحرف كبيرة، وFalse في غير ذلك.",
  },
  "ref-string-join": {
    title: "join()",
    description: "تربط أي عدد من السلاسل النصية.",
  },
  "ref-string-ljust": {
    title: "ljust()",
    description: "تُرجع سلسلة نصية مضبوطة لليسار بطول width.",
  },
  "ref-string-lower": {
    title: "lower()",
    description: "تُرجع نسخة من السلسلة النصية محولة إلى أحرف صغيرة.",
  },
  "ref-string-lstrip": {
    title: "lstrip()",
    description: "تُرجع نسخة من السلسلة النصية مع إزالة المسافات البيضاء البادئة.",
  },
  "ref-string-maketrans": {
    title: "maketrans()",
    description: "تُرجع جدول ترجمة قابلاً للاستخدام مع str.translate().",
  },
  "ref-string-partition": {
    title: "partition()",
    description: "تقسّم السلسلة النصية إلى ثلاثة أجزاء باستخدام الفاصل المعطى.",
  },
  "ref-string-replace": {
    title: "replace()",
    description: "تُرجع نسخة تُستبدل فيها كل تكرارات السلسلة الفرعية old بـ new.",
  },
  "ref-string-rfind": {
    title: "rfind()",
    description: "S.rfind(sub[, start[, end]]) -> int تُرجع أعلى فهرس في S يوجد فيه السلسلة الفرعية sub، بحيث تكون sub ضمن S[start:end].",
  },
  "ref-string-rindex": {
    title: "rindex()",
    description: "S.rindex(sub[, start[, end]]) -> int تُرجع أعلى فهرس في S يوجد فيه السلسلة الفرعية sub، بحيث تكون sub ضمن S[start:end].",
  },
  "ref-string-rjust": {
    title: "rjust()",
    description: "تُرجع سلسلة نصية مضبوطة لليمين بطول width.",
  },
  "ref-string-rpartition": {
    title: "rpartition()",
    description: "تقسّم السلسلة النصية إلى ثلاثة أجزاء باستخدام الفاصل المعطى.",
  },
  "ref-string-rsplit": {
    title: "rsplit()",
    description: "تُرجع قائمة بالسلاسل الفرعية في السلسلة النصية، باستخدام sep كسلسلة فاصلة.",
  },
  "ref-string-rstrip": {
    title: "rstrip()",
    description: "تُرجع نسخة من السلسلة النصية مع إزالة المسافات البيضاء اللاحقة.",
  },
  "ref-string-split": {
    title: "split()",
    description: "تُرجع قائمة بالسلاسل الفرعية في السلسلة النصية، باستخدام sep كسلسلة فاصلة.",
  },
  "ref-string-splitlines": {
    title: "splitlines()",
    description: "تُرجع قائمة بأسطر السلسلة النصية، مع الفصل عند حدود الأسطر.",
  },
  "ref-string-startswith": {
    title: "startswith()",
    description: "S.startswith(prefix[, start[, end]]) -> bool تُرجع True إذا كانت S تبدأ بالبادئة المحددة، وFalse في غير ذلك.",
  },
  "ref-string-strip": {
    title: "strip()",
    description: "تُرجع نسخة من السلسلة النصية مع إزالة المسافات البيضاء البادئة واللاحقة.",
  },
  "ref-string-swapcase": {
    title: "swapcase()",
    description: "تحوّل الأحرف الكبيرة إلى صغيرة والأحرف الصغيرة إلى كبيرة.",
  },
  "ref-string-title": {
    title: "title()",
    description: "تُرجع نسخة من السلسلة النصية تُكبَّر فيها كل كلمة بحرف عنواني.",
  },
  "ref-string-translate": {
    title: "translate()",
    description: "تستبدل كل حرف في السلسلة النصية باستخدام جدول الترجمة المعطى.",
  },
  "ref-string-upper": {
    title: "upper()",
    description: "تُرجع نسخة من السلسلة النصية محولة إلى أحرف كبيرة.",
  },
  "ref-string-zfill": {
    title: "zfill()",
    description: "تملأ سلسلة نصية رقمية بالأصفار على اليسار، لملء حقل بالعرض المعطى.",
  },
  "python-ref-list": {
    title: "طرق القوائم في بايثون",
    description: "طرق القوائم — كل طريقة يمكنك استدعاؤها على قائمة.",
  },
  "ref-list-append": {
    title: "append()",
    description: "تلحق كائناً بنهاية القائمة.",
  },
  "ref-list-clear": {
    title: "clear()",
    description: "تزيل كل العناصر من القائمة.",
  },
  "ref-list-copy": {
    title: "copy()",
    description: "تُرجع نسخة سطحية من القائمة.",
  },
  "ref-list-count": {
    title: "count()",
    description: "تُرجع عدد تكرارات القيمة.",
  },
  "ref-list-extend": {
    title: "extend()",
    description: "تمدّد القائمة بإلحاق عناصر من القابل للتكرار.",
  },
  "ref-list-index": {
    title: "index()",
    description: "تُرجع أول فهرس للقيمة.",
  },
  "ref-list-insert": {
    title: "insert()",
    description: "تدرج كائناً قبل الفهرس.",
  },
  "ref-list-pop": {
    title: "pop()",
    description: "تزيل العنصر عند الفهرس (الافتراضي الأخير) وتُرجعه.",
  },
  "ref-list-remove": {
    title: "remove()",
    description: "تزيل أول تكرار للقيمة.",
  },
  "ref-list-reverse": {
    title: "reverse()",
    description: "تعكس *في المكان*.",
  },
  "ref-list-sort": {
    title: "sort()",
    description: "ترتّب القائمة بترتيب تصاعدي وتُرجع None.",
  },
  "python-ref-dictionary": {
    title: "طرق القواميس في بايثون",
    description: "طرق القواميس — كل طريقة يمكنك استدعاؤها على dict.",
  },
  "ref-dictionary-clear": {
    title: "clear()",
    description: "D.clear() -> None.",
  },
  "ref-dictionary-copy": {
    title: "copy()",
    description: "D.copy() -> نسخة سطحية من D",
  },
  "ref-dictionary-fromkeys": {
    title: "fromkeys()",
    description: "تُنشئ قاموساً جديداً بمفاتيح من القابل للتكرار وقيم مضبوطة على value.",
  },
  "ref-dictionary-get": {
    title: "get()",
    description: "تُرجع القيمة للمفتاح إذا كان المفتاح في القاموس، وإلا default.",
  },
  "ref-dictionary-items": {
    title: "items()",
    description: "D.items() -> كائن شبيه بالمجموعة يوفّر عرضاً على عناصر D",
  },
  "ref-dictionary-keys": {
    title: "keys()",
    description: "D.keys() -> كائن شبيه بالمجموعة يوفّر عرضاً على مفاتيح D",
  },
  "ref-dictionary-pop": {
    title: "pop()",
    description: "D.pop(k[,d]) -> v، يزيل المفتاح المحدد ويُرجع القيمة المقابلة.",
  },
  "ref-dictionary-popitem": {
    title: "popitem()",
    description: "يزيل ويُرجع زوجاً (key, value) كصف من عنصرين.",
  },
  "ref-dictionary-setdefault": {
    title: "setdefault()",
    description: "يدرج المفتاح بقيمة default إذا لم يكن المفتاح في القاموس.",
  },
  "ref-dictionary-update": {
    title: "update()",
    description: "D.update([E, ]**F) -> None.",
  },
  "ref-dictionary-values": {
    title: "values()",
    description: "D.values() -> كائن يوفّر عرضاً على قيم D",
  },
  "python-ref-tuple": {
    title: "طرق الصفوف في بايثون",
    description: "طرق الصفوف — كل طريقة يمكنك استدعاؤها على صف.",
  },
  "ref-tuple-count": {
    title: "count()",
    description: "تُرجع عدد تكرارات القيمة.",
  },
  "ref-tuple-index": {
    title: "index()",
    description: "تُرجع أول فهرس للقيمة.",
  },
  "python-ref-set": {
    title: "طرق المجموعات في بايثون",
    description: "طرق المجموعات — كل طريقة يمكنك استدعاؤها على مجموعة.",
  },
  "ref-set-add": {
    title: "add()",
    description: "تضيف عنصراً إلى مجموعة.",
  },
  "ref-set-clear": {
    title: "clear()",
    description: "تزيل كل العناصر من هذه المجموعة.",
  },
  "ref-set-copy": {
    title: "copy()",
    description: "تُرجع نسخة سطحية من مجموعة.",
  },
  "ref-set-difference": {
    title: "difference()",
    description: "تُرجع فرق مجموعتين أو أكثر كمجموعة جديدة.",
  },
  "ref-set-difference-update": {
    title: "difference_update()",
    description: "difference_update() — انظر المثال أدناه.",
  },
  "ref-set-discard": {
    title: "discard()",
    description: "تزيل عنصراً من مجموعة إذا كان عضواً فيها.",
  },
  "ref-set-intersection": {
    title: "intersection()",
    description: "تُرجع تقاطع مجموعتين كمجموعة جديدة.",
  },
  "ref-set-intersection-update": {
    title: "intersection_update()",
    description: "intersection_update() — انظر المثال أدناه.",
  },
  "ref-set-isdisjoint": {
    title: "isdisjoint()",
    description: "تُرجع True إذا كان لمجموعتين تقاطع فارغ.",
  },
  "ref-set-issubset": {
    title: "issubset()",
    description: "تختبر ما إذا كان كل عنصر في المجموعة موجوداً في other.",
  },
  "ref-set-lessthan": {
    title: "<",
    description: "< يتحقق مما إذا كانت مجموعة مجموعة فرعية فعلية من مجموعة أخرى.",
  },
  "ref-set-issuperset": {
    title: "issuperset()",
    description: "تختبر ما إذا كان كل عنصر في other موجوداً في المجموعة.",
  },
  "ref-set-greaterthan": {
    title: ">",
    description: "> يتحقق مما إذا كانت مجموعة مجموعة شاملة فعلية لمجموعة أخرى.",
  },
  "ref-set-pop": {
    title: "pop()",
    description: "تزيل عنصراً عشوائياً من المجموعة وتُرجعه.",
  },
  "ref-set-remove": {
    title: "remove()",
    description: "تزيل عنصراً من مجموعة؛ ويجب أن يكون عضواً فيها.",
  },
  "ref-set-symmetric-difference": {
    title: "symmetric_difference()",
    description: "symmetric_difference() — انظر المثال أدناه.",
  },
  "ref-set-symmetric-difference-update": {
    title: "symmetric_difference_update()",
    description: "symmetric_difference_update() — انظر المثال أدناه.",
  },
  "ref-set-union": {
    title: "union()",
    description: "تُرجع اتحاد المجموعات كمجموعة جديدة.",
  },
  "ref-set-update": {
    title: "update()",
    description: "تحدّث مجموعة باتحادها مع مجموعات أخرى.",
  },
  "python-reference": {
    title: "نظرة عامة على بايثون",
    description: "مرجع بايثون — كل دالة مدمجة وطريقة وكلمة مفتاحية واستثناء في مكان واحد.",
  },
  "python-ref-file": {
    title: "طرق الملفات في بايثون",
    description: "طرق الملفات — كل طريقة يمكنك استدعاؤها على كائن ملف مفتوح.",
  },
  "ref-file-close": {
    title: "close()",
    description: "تغلق كائن IO.",
  },
  "ref-file-fileno": {
    title: "fileno()",
    description: "تُرجع واصف الملف الأساسي إذا وُجد.",
  },
  "ref-file-flush": {
    title: "flush()",
    description: "تفرغ مخازن الكتابة المؤقتة، إن أمكن.",
  },
  "ref-file-isatty": {
    title: "isatty()",
    description: "تُرجع ما إذا كان هذا دفقاً 'تفاعلياً'.",
  },
  "ref-file-read": {
    title: "read()",
    description: "تقرأ على الأكثر size أحرف، وتُرجعها كسلسلة نصية.",
  },
  "ref-file-readable": {
    title: "readable()",
    description: "تُرجع True إذا كان كائن IO قابلاً للقراءة.",
  },
  "ref-file-readline": {
    title: "readline()",
    description: "تقرأ حتى سطر جديد أو EOF.",
  },
  "ref-file-readlines": {
    title: "readlines()",
    description: "تُرجع قائمة بأسطر من الدفق.",
  },
  "ref-file-seek": {
    title: "seek()",
    description: "تغيّر موضع الدفق.",
  },
  "ref-file-seekable": {
    title: "seekable()",
    description: "تُرجع True إذا كان كائن IO قابلاً للبحث فيه.",
  },
  "ref-file-tell": {
    title: "tell()",
    description: "تخبر بالموضع الحالي في الملف.",
  },
  "ref-file-truncate": {
    title: "truncate()",
    description: "تقتطع الحجم إلى pos.",
  },
  "ref-file-writable": {
    title: "writable()",
    description: "تُرجع True إذا كان كائن IO قابلاً للكتابة.",
  },
  "ref-file-write": {
    title: "write()",
    description: "تكتب سلسلة نصية إلى الملف.",
  },
  "ref-file-writelines": {
    title: "writelines()",
    description: "تكتب قائمة بأسطر إلى الدفق.",
  },
  "python-ref-keywords": {
    title: "الكلمات المفتاحية في بايثون",
    description: "الكلمات المفتاحية في بايثون — الكلمات المحجوزة التي تكوّن اللغة.",
  },
  "ref-keyword-and": {
    title: "and",
    description: "and عامل منطقي — True فقط عندما يكون الطرفان True.",
  },
  "ref-keyword-as": {
    title: "as",
    description: "as تعطي وحدة مستوردة أو استثناءً ملتقطاً اسماً مختلفاً.",
  },
  "ref-keyword-assert": {
    title: "assert",
    description: "assert تتحقق من شرط — إذا كان False، ترفع بايثون AssertionError.",
  },
  "ref-keyword-async": {
    title: "async",
    description: "async تعلّم دالة بأنها غير متزامنة — تُرجع coroutine تشغّلها مع await.",
  },
  "ref-keyword-await": {
    title: "await",
    description: "await توقف دالة async مؤقتاً حتى ينتهي الشيء الذي تنتظره.",
  },
  "ref-keyword-break": {
    title: "break",
    description: "break تخرج من أقرب حلقة فوراً.",
  },
  "ref-keyword-case": {
    title: "case",
    description: "case فرع واحد من جملة match — يعمل عندما يناسب نمطه.",
  },
  "ref-keyword-class": {
    title: "class",
    description: "class تعرّف صنفاً جديداً — مخطط للكائنات.",
  },
  "ref-keyword-continue": {
    title: "continue",
    description: "continue تتخطى بقية جولة الحلقة الحالية وتبدأ الجولة التالية.",
  },
  "ref-keyword-def": {
    title: "def",
    description: "def تعرّف دالة.",
  },
  "ref-keyword-del": {
    title: "del",
    description: "del تحذف متغيراً أو عنصراً أو شريحة.",
  },
  "ref-keyword-elif": {
    title: "elif",
    description: "elif شرط ثانٍ، يُتحقق منه فقط عندما كان if أعلاه False.",
  },
  "ref-keyword-else": {
    title: "else",
    description: "else يعمل عندما كانت if (وelif) أعلاه كلها False.",
  },
  "ref-keyword-except": {
    title: "except",
    description: "except تلتقط خطأً أُثير داخل كتلة try المطابقة.",
  },
  "ref-keyword-false": {
    title: "False",
    description: "False هي القيمة المنطقية لـ 'لا'.",
  },
  "ref-keyword-finally": {
    title: "finally",
    description: "finally يعمل مهما حدث — خطأ أو لا — بعد كتلة try.",
  },
  "ref-keyword-for": {
    title: "for",
    description: "for تدور على كل عنصر من تسلسل، واحداً في كل مرة.",
  },
  "ref-keyword-from": {
    title: "from",
    description: "from تستورد أسماء محددة من وحدة.",
  },
  "ref-keyword-global": {
    title: "global",
    description: "global تقول إن اسماً داخل دالة يشير إلى متغير مستوى الوحدة.",
  },
  "ref-keyword-if": {
    title: "if",
    description: "if تنفّذ كتلتها فقط عندما يكون شرطها True.",
  },
  "ref-keyword-import": {
    title: "import",
    description: "import تجلب أسماء وحدة إلى برنامجك.",
  },
  "ref-keyword-in": {
    title: "in",
    description: "in تتحقق من العضوية — True عندما يكون الطرف الأيسر داخل الطرف الأيمن.",
  },
  "ref-keyword-is": {
    title: "is",
    description: "is تتحقق من الهوية — True عندما يشير الاسمان إلى الكائن نفسه.",
  },
  "ref-keyword-lambda": {
    title: "lambda",
    description: "lambda تصنع دالة صغيرة مجهولة في سطر واحد.",
  },
  "ref-keyword-match": {
    title: "match",
    description: "match تتحقق من قيمة مقابل أنماط وتشغّل أول نمط يناسب.",
  },
  "ref-keyword-none": {
    title: "None",
    description: "None تعني 'لا قيمة هنا' — غياب القيمة.",
  },
  "ref-keyword-nonlocal": {
    title: "nonlocal",
    description: "nonlocal تقول إن اسماً داخل دالة متداخلة يشير إلى متغير الدالة المحيطة.",
  },
  "ref-keyword-not": {
    title: "not",
    description: "not تقلب قيمة منطقية — True تصبح False والعكس.",
  },
  "ref-keyword-or": {
    title: "or",
    description: "or عامل منطقي — True عندما يكون طرف واحد على الأقل True.",
  },
  "ref-keyword-pass": {
    title: "pass",
    description: "pass لا تفعل شيئاً — عنصر نائب حيث تحتاج بايثون إلى جملة.",
  },
  "ref-keyword-raise": {
    title: "raise",
    description: "raise تثير استثناءً عن قصد.",
  },
  "ref-keyword-return": {
    title: "return",
    description: "return ترسل قيمة إلى خارج الدالة وتنهيها.",
  },
  "ref-keyword-true": {
    title: "True",
    description: "True هي القيمة المنطقية لـ 'نعم'.",
  },
  "ref-keyword-try": {
    title: "try",
    description: "try تغلّف كوداً قد يفشل، لكي يلتقطه except.",
  },
  "ref-keyword-while": {
    title: "while",
    description: "while تكرّر كتلتها ما دام شرطها True.",
  },
  "ref-keyword-with": {
    title: "with",
    description: "with تفتح مورداً (مثل ملف) وتغلقه لك عند انتهاء الكتلة.",
  },
  "ref-keyword-yield": {
    title: "yield",
    description: "yield توقف دالة مولّدة مؤقتاً وتسلّم قيمة واحدة إلى المتصل.",
  },
  "python-ref-exceptions": {
    title: "استثناءات بايثون",
    description: "استثناءات بايثون — الأخطاء التي ترفعها بايثون، وما يعنيه كل منها.",
  },
  "ref-exception-arithmeticerror": {
    title: "ArithmeticError",
    description: "ArithmeticError هو الأب لكل الأخطاء الحسابية (ZeroDivisionError وOverflowError وFloatingPointError).",
  },
  "ref-exception-assertionerror": {
    title: "AssertionError",
    description: "AssertionError يُثار عندما تفشل جملة assert.",
  },
  "ref-exception-attributeerror": {
    title: "AttributeError",
    description: "AttributeError يُثار عندما تصل إلى خاصية أو طريقة غير موجودة.",
  },
  "ref-exception-exception": {
    title: "Exception",
    description: "Exception هو الأب لمعظم الأخطاء التي ستلتقطها تقريباً.",
  },
  "ref-exception-eoferror": {
    title: "EOFError",
    description: "EOFError يُثار عندما يصل input() أو read إلى نهاية الملف دون أي شيء متبقٍ.",
  },
  "ref-exception-floatingpointerror": {
    title: "FloatingPointError",
    description: "FloatingPointError يُثار عندما تفشل عملية على عدد عشري.",
  },
  "ref-exception-generatorexit": {
    title: "GeneratorExit",
    description: "GeneratorExit يُثار داخل مولّد عندما يُغلق مبكراً.",
  },
  "ref-exception-importerror": {
    title: "ImportError",
    description: "ImportError يُثار عندما يتعذر على الاستيراد العثور على الوحدة.",
  },
  "ref-exception-indentationerror": {
    title: "IndentationError",
    description: "IndentationError يُثار عندما تكون مسافة بادئة كتلة خاطئة.",
  },
  "ref-exception-indexerror": {
    title: "IndexError",
    description: "IndexError يُثار عندما يكون فهرس قائمة أو صف خارج النطاق.",
  },
  "ref-exception-keyerror": {
    title: "KeyError",
    description: "KeyError يُثار عندما لا يوجد مفتاح قاموس.",
  },
  "ref-exception-keyboardinterrupt": {
    title: "KeyboardInterrupt",
    description: "KeyboardInterrupt يُثار عندما يضغط المستخدم على Ctrl+C.",
  },
  "ref-exception-lookuperror": {
    title: "LookupError",
    description: "LookupError هو الأب لـ IndexError وKeyError.",
  },
  "ref-exception-memoryerror": {
    title: "MemoryError",
    description: "MemoryError يُثار عندما تنفد ذاكرة بايثون.",
  },
  "ref-exception-nameerror": {
    title: "NameError",
    description: "NameError يُثار عندما تستخدم متغيراً لم يُعرَّف أبداً.",
  },
  "ref-exception-notimplementederror": {
    title: "NotImplementedError",
    description: "NotImplementedError يُثار ليقول 'هذا الجزء لم يُكتب بعد'.",
  },
  "ref-exception-oserror": {
    title: "OSError",
    description: "OSError يُثار عندما يرفض نظام التشغيل شيئاً (ملف مفقود، لا إذن).",
  },
  "ref-exception-overflowerror": {
    title: "OverflowError",
    description: "OverflowError يُثار عندما يكون عدد أكبر من أن يتسع لنوعه.",
  },
  "ref-exception-referenceerror": {
    title: "ReferenceError",
    description: "ReferenceError يُثار عندما يشير مرجع ضعيف إلى كائن ذهب بالفعل.",
  },
  "ref-exception-runtimeerror": {
    title: "RuntimeError",
    description: "RuntimeError خطأ عام لشيء يسير بشكل خاطئ أثناء التشغيل.",
  },
  "ref-exception-stopiteration": {
    title: "StopIteration",
    description: "StopIteration يُثار بواسطة next() عندما ينتهي مكرر.",
  },
  "ref-exception-syntaxerror": {
    title: "SyntaxError",
    description: "SyntaxError يُثار عندما يكون الكود نفسه بايثون غير صالح.",
  },
  "ref-exception-taberror": {
    title: "TabError",
    description: "TabError يُثار عندما تُخلط علامات الجدولة والمسافات في المسافة البادئة.",
  },
  "ref-exception-systemerror": {
    title: "SystemError",
    description: "SystemError يُثار عندما يصادف المفسّر نفسه مشكلة داخلية.",
  },
  "ref-exception-systemexit": {
    title: "SystemExit",
    description: "SystemExit يُثار بواسطة sys.exit() — ينهي البرنامج.",
  },
  "ref-exception-typeerror": {
    title: "TypeError",
    description: "TypeError يُثار عندما تُستخدم عملية على النوع الخاطئ.",
  },
  "ref-exception-unboundlocalerror": {
    title: "UnboundLocalError",
    description: "UnboundLocalError يُثار عندما تقرأ متغيراً محلياً قبل تعيينه.",
  },
  "ref-exception-unicodeerror": {
    title: "UnicodeError",
    description: "UnicodeError هو الأب لـ UnicodeEncodeError وUnicodeDecodeError وUnicodeTranslateError.",
  },
  "ref-exception-unicodeencodeerror": {
    title: "UnicodeEncodeError",
    description: "UnicodeEncodeError يُثار عندما يتعذر تشفير نص إلى بايتات.",
  },
  "ref-exception-unicodedecodeerror": {
    title: "UnicodeDecodeError",
    description: "UnicodeDecodeError يُثار عندما يتعذر فك تشفير بايتات إلى نص.",
  },
  "ref-exception-unicodetranslateerror": {
    title: "UnicodeTranslateError",
    description: "UnicodeTranslateError يُثار عندما يتعذر ترجمة حرف.",
  },
  "ref-exception-valueerror": {
    title: "ValueError",
    description: "ValueError يُثار عندما تكون للقيمة النوع الصحيح لكن المحتوى الخاطئ.",
  },
  "ref-exception-zerodivisionerror": {
    title: "ZeroDivisionError",
    description: "ZeroDivisionError يُثار عندما تقسم على صفر.",
  },
  "python-ref-glossary": {
    title: "مسرد بايثون",
    description: "مسرد بايثون — الكلمات التي يستخدمها مطورو بايثون، مشروحة في سطر واحد لكل منها.",
  },
};
