// Video Courses data — complete Python courses from three
// creators, each as topic-wise videos, plus their one-shot
// videos. Researched 2026-11-16 from the creators' real
// YouTube playlists (learn-courses.json); video IDs, titles
// and durations are the live YouTube values, never invented.
// One-shots that also sit inside a playlist are listed once,
// under the playlist. Channel PFPs + subscriber counts were read
// from each channel's own YouTube page on 2026-11-16.
// Videos play from MEGA/Drive, never YouTube — except as a temporary
// fallback: a video with no megaLessonId plays from its YouTube embed
// until Maalik supplies a MEGA/Drive link for it, then the link is
// replaced (megaLessonId set) and the MEGA player takes over. Mosh's playlist dump also contained one
// non-Python video ("The 3 MOST IMPORTANT JAZZ SCALES…") —
// excluded, it does not belong in a Python course list.

export interface CourseVideo {
  title: string;
  videoId: string;
  /** Duration in seconds, when known. */
  durationSeconds?: number;
  /**
   * Catalog lesson id (e.g. "python-day-001") when this video is
   * available from MEGA/Drive through /api/video/[lessonId].
   * Absent until Maalik supplies a MEGA/Drive link for the video.
   */
  megaLessonId?: string;
}

export interface CoursePlaylist {
  title: string;
  url: string;
  videos: CourseVideo[];
}

export interface CourseCreator {
  name: string;
  /** URL slug for /courses/[slug]. */
  slug: string;
  tagline: string;
  /** YouTube handle, display only — never rendered as a link. */
  handle: string;
  /** Channel avatar (YouTube PFP), served by Google. */
  avatarUrl: string;
  /** Subscriber count as shown on the channel, e.g. "10M subscribers". */
  subscribers: string;
  /** Teaching language: "Hindi" or "English". */
  language: string;
  playlists: CoursePlaylist[];
  oneShots: CourseVideo[];
}

export const COURSE_CREATORS: CourseCreator[] = [
  {
    name: "CodeWithHarry",
    slug: "codewithharry",
    handle: "@CodeWithHarry",
    avatarUrl: "https://yt3.googleusercontent.com/ytc/AIdro_kX3sdbuu3KFmRPsmlu0R5Rx_BhpxwupjtvJmkEdNfla7w=s176-c-k-c0x00ffffff-no-rj",
    subscribers: "10M subscribers",
    language: "Hindi",
    tagline: "Complete Python courses in Hindi — step by step, with notes.",
    playlists: [
      {
        title: "Python for Beginners (Full Course) | #100DaysOfCode Programming Tutorial in Hindi",
        url: "https://www.youtube.com/playlist?list=PLu0W_9lII9agwh1XjRt242xIpHhPT2llg",
        videos: [
          { title: "Introduction to Programming & Python | Python Tutorial - Day #1", videoId: "7wnove7K-ZQ" , durationSeconds: 710, megaLessonId: "python-day-001"},
          { title: "Some Amazing Python Programs - The Power of Python | Python Tutorial - Day #2", videoId: "Tto8TS-fJQU" , durationSeconds: 518, megaLessonId: "python-day-002"},
          { title: "Modules and Pip | Python Tutorial - Day #3", videoId: "xwKO_y2gHxQ" , durationSeconds: 761, megaLessonId: "python-day-003"},
          { title: "Our First Python Program | Python Tutorial - Day #4", videoId: "7IWOYhfAcVg" , durationSeconds: 444, megaLessonId: "python-day-004"},
          { title: "Comments, Escape Sequences & Print Statement | Python Tutorial - Day #5", videoId: "qxPMmW93eDs" , durationSeconds: 1122, megaLessonId: "python-day-005"},
          { title: "Variables and Data Types | Python Tutorial - Day #6", videoId: "ORCuz7s5cCY" , durationSeconds: 1005, megaLessonId: "python-day-006"},
          { title: "Exercise 1: Calculator using Python | Python Tutorial - Day #7", videoId: "FLVqcxnJP_E" , durationSeconds: 410, megaLessonId: "python-day-007"},
          { title: "Exercise 1: Calculator using Python (Solution) | Python Tutorial - Day #8", videoId: "dohaSBCKCr0" , durationSeconds: 622, megaLessonId: "python-day-008"},
          { title: "Typecasting in Python | Python Tutorial - Day #9", videoId: "Pu5bqySSSS0" , durationSeconds: 565, megaLessonId: "python-day-009"},
          { title: "Taking User Input in Python | Python Tutorial - Day #10", videoId: "WvG-R-xXouA" , durationSeconds: 616, megaLessonId: "python-day-010"},
          { title: "Strings in Python | Python Tutorial - Day #11", videoId: "kMNFQYArrLg" , durationSeconds: 695, megaLessonId: "python-day-011"},
          { title: "Strings Slicing and Operations on Strings in Python | Python Tutorial - Day #12", videoId: "8jW7lpT8HW8" , durationSeconds: 708, megaLessonId: "python-day-012"},
          { title: "String Methods in Python | Python Tutorial - Day #13", videoId: "0INvoK_T0cE" , durationSeconds: 1352, megaLessonId: "python-day-013"},
          { title: "If Else Conditional Statements in Python | Python Tutorial - Day #14", videoId: "ceiuLR2ysas" , durationSeconds: 1167, megaLessonId: "python-day-014"},
          { title: "Exercise 2: Good Morning Sir | Python Tutorial - Day #15", videoId: "d7ng_aV4qdI" , durationSeconds: 319, megaLessonId: "python-day-015"},
          { title: "Match Case Statements in Python | Python Tutorial - Day #16", videoId: "bthQCK1QAmQ" , durationSeconds: 491, megaLessonId: "python-day-016"},
          { title: "For Loops in Python | Python Tutorial - Day #17", videoId: "fIYVzKp0q5w" , durationSeconds: 781, megaLessonId: "python-day-017"},
          { title: "While Loops in Python | Python Tutorial - Day #18", videoId: "-tCFyIyKVx0" , durationSeconds: 850, megaLessonId: "python-day-018"},
          { title: "break and continue in Python | Python Tutorial - Day #19", videoId: "RkwJnjdrm70" , durationSeconds: 734, megaLessonId: "python-day-019"},
          { title: "Functions in Python | Python Tutorial - Day #20", videoId: "dyvxxJSGUsE" , durationSeconds: 978, megaLessonId: "python-day-020"},
          { title: "Function Arguments in Python | Python Tutorial - Day #21", videoId: "0d6b6fFuCkE" , durationSeconds: 830, megaLessonId: "python-day-021"},
          { title: "Introduction to Lists in Python | Python Tutorial - Day #22", videoId: "eF6nK5bSlmg" , durationSeconds: 1207, megaLessonId: "python-day-022"},
          { title: "List Methods in Python | Python Tutorial - Day #23", videoId: "scWc3F8LbOo" , durationSeconds: 572, megaLessonId: "python-day-023"},
          { title: "Tuples in Python | Python Tutorial - Day #24", videoId: "PipsOUDKrVk" , durationSeconds: 495, megaLessonId: "python-day-024"},
          { title: "Operations on Tuples in Python | Python Tutorial - Day #25", videoId: "XblLSduioJI" , durationSeconds: 419, megaLessonId: "python-day-025"},
          { title: "Exercise 2: Solution & Shoutouts | Python Tutorial - Day #26", videoId: "IZBKXWrbqBM" , durationSeconds: 462, megaLessonId: "python-day-026"},
          { title: "Exercise 3: Kaun Banega Crorepati (KBC) | Python Tutorial - Day #27", videoId: "Vs1Z7K70Mvw" , durationSeconds: 167, megaLessonId: "python-day-027"},
          { title: "f-strings in Python | Python Tutorial - Day #28", videoId: "ixmxgUf8yIg" , durationSeconds: 532, megaLessonId: "python-day-028"},
          { title: "Docstrings in Python | Python Tutorial - Day #29", videoId: "SJzsNd7SM0g" , durationSeconds: 512, megaLessonId: "python-day-029"},
          { title: "Recursion in Python | Python Tutorial - Day #30", videoId: "XYwJKFB8DUk" , durationSeconds: 601, megaLessonId: "python-day-030"},
          { title: "Sets in Python | Python Tutorial - Day #31", videoId: "l3kCO8cVA6o" , durationSeconds: 472, megaLessonId: "python-day-031"},
          { title: "Set Methods in Python | Python Tutorial - Day #32", videoId: "HOrutCnp2zo" , durationSeconds: 958, megaLessonId: "python-day-032"},
          { title: "Dictionaries in Python | Python Tutorial - Day #33", videoId: "j2G68uQtOwM" , durationSeconds: 620, megaLessonId: "python-day-033"},
          { title: "Dictionary Methods in Python | Python Tutorial - Day #34", videoId: "LmbFwaLjT9k" , durationSeconds: 507, megaLessonId: "python-day-034"},
          { title: "for Loop with else in Python | Python Tutorial - Day #35", videoId: "qUkcIgErZzc" , durationSeconds: 393, megaLessonId: "python-day-035"},
          { title: "Exception Handling in Python | Python Tutorial - Day #36", videoId: "4LKo6dlku7M" , durationSeconds: 653, megaLessonId: "python-day-036"},
          { title: "Finally keyword in Python | Python Tutorial - Day #37", videoId: "r_iuC-IDpPM" , durationSeconds: 485, megaLessonId: "python-day-037"},
          { title: "Raising custom errors in Python | Python Tutorial - Day #38", videoId: "Phr4CNppYoM" , durationSeconds: 642, megaLessonId: "python-day-038"},
          { title: "Kaun Banega Crorepati: Exercise 3 - Solution & Shoutouts | Python Tutorial - Day #39", videoId: "nyfeYAxP-EM" , durationSeconds: 1396, megaLessonId: "python-day-039"},
          { title: "Exercise 4: Secret Code Language | Python Tutorial - Day #40", videoId: "pOWJ6WgVRIU" , durationSeconds: 365, megaLessonId: "python-day-040"},
          { title: "Short hand if else statements | Python Tutorial - Day #41", videoId: "Qqx_zNmQVGI" , durationSeconds: 463, megaLessonId: "python-day-041"},
          { title: "Enumerate Function in Python | Python Tutorial - Day #42", videoId: "kGnYc_h1geM" , durationSeconds: 457, megaLessonId: "python-day-042"},
          { title: "Virtual Environment in Python | Python Tutorial - Day #43", videoId: "nt6LlFTWOkg" , durationSeconds: 1298, megaLessonId: "python-day-043"},
          { title: "How import works in Python | Python Tutorial - Day #44", videoId: "Pr7UOr35NcI" , durationSeconds: 762, megaLessonId: "python-day-044"},
          { title: "if __name__ == \"__main__\" in Python | Python Tutorial - Day #45", videoId: "y_CX2Rvitk8" , durationSeconds: 564, megaLessonId: "python-day-045"},
          { title: "os Module in Python | Python Tutorial - Day #46", videoId: "dkVYSsL90Oo" , durationSeconds: 924, megaLessonId: "python-day-046"},
          { title: "Exercise 4: Solutions and Shoutouts | Python Tutorial - Day #47", videoId: "4lSQfOJKn7U" , durationSeconds: 1171, megaLessonId: "python-day-047"},
          { title: "Local vs Global Variables in Python| Python Tutorial - Day #48", videoId: "RaG6GgcDt54" , durationSeconds: 637, megaLessonId: "python-day-048"},
          { title: "File IO in Python | Python Tutorial - Day #49", videoId: "eDBPlcWYses" , durationSeconds: 773, megaLessonId: "python-day-049"},
          { title: "read(), readlines() and other methods | Python Tutorial - Day #50", videoId: "l1FsnQxET9U" , durationSeconds: 647, megaLessonId: "python-day-050"},
          { title: "seek(), tell() and other functions | Python Tutorial - Day #51", videoId: "PByYX-2l5Us" , durationSeconds: 467, megaLessonId: "python-day-051"},
          { title: "Lambda functions in Python | Python Tutorial - Day #52", videoId: "UfFWf-PXUqE" , durationSeconds: 558, megaLessonId: "python-day-052"},
          { title: "Map, Filter and Reduce in Python | Python Tutorial - Day #53", videoId: "OErhjT4f5Cs" , durationSeconds: 781, megaLessonId: "python-day-053"},
          { title: "'is' vs '==' in Python | Python Tutorial - Day #54", videoId: "TOemdfX_0xc" , durationSeconds: 481, megaLessonId: "python-day-054"},
          { title: "Exercise 5 - Snake Water Gun | Python Tutorial - Day #55", videoId: "dDsh7FT6-0I" , durationSeconds: 355, megaLessonId: "python-day-055"},
          { title: "Introduction to OOPs in Python | Python Tutorial - Day #56", videoId: "HQnoYzxOHMw" , durationSeconds: 954, megaLessonId: "python-day-056"},
          { title: "Classes and Objects in Python | Python Tutorial - Day #57", videoId: "a7baAGCBA9U" , durationSeconds: 572, megaLessonId: "python-day-057"},
          { title: "Constructors in Python | Python Tutorial - Day #58", videoId: "12HRkYld22c" , durationSeconds: 677, megaLessonId: "python-day-058"},
          { title: "Decorators in Python | Python Tutorial - Day #59", videoId: "PTBZ674EsvI" , durationSeconds: 785, megaLessonId: "python-day-059"},
          { title: "Getters and Setters in Python | Python Tutorial - Day #60", videoId: "2gbCT8h9uyk" , durationSeconds: 637, megaLessonId: "python-day-060"},
          { title: "Inheritance in Python | Python Tutorial - Day #61", videoId: "-KsfUaQEY9Y" , durationSeconds: 454, megaLessonId: "python-day-061"},
          { title: "Access Modifiers in Python | Python Tutorial - Day #62", videoId: "43FK20rWvKQ" , durationSeconds: 703, megaLessonId: "python-day-062"},
          { title: "Snake Water Gun Game in Python - Exercise 5 - Solution | Python Tutorial - Day #63", videoId: "GkfBpm6MN9A" , durationSeconds: 928, megaLessonId: "python-day-063"},
          { title: "Exercise 6 - Library Management System in Python | Python Tutorial - Day #64", videoId: "mlDZTSH2FFc" , durationSeconds: 195, megaLessonId: "python-day-064"},
          { title: "Static Methods in Python | Python Tutorial - Day #65", videoId: "GcSVYNSsJxo" , durationSeconds: 457, megaLessonId: "python-day-065"},
          { title: "Instance variables vs Class variables in Python | Python Tutorial - Day #66", videoId: "tQdaeiF4j38" , durationSeconds: 877, megaLessonId: "python-day-066"},
          { title: "Exercise 6 Solution - Library Management Software in Python | Python Tutorial - Day #67", videoId: "uRIEjf2vCIg" , durationSeconds: 574, megaLessonId: "python-day-067"},
          { title: "Exercise 7 - Clear the Clutter | Python Tutorial - Day #68", videoId: "6KvnP13TnhY" , durationSeconds: 214, megaLessonId: "python-day-068"},
          { title: "Class Methods in Python | Python Tutorial - Day #69", videoId: "9ynmDLc5FYo" , durationSeconds: 385, megaLessonId: "python-day-069"},
          { title: "Class Methods as Alternative Constructors in Python | Python Tutorial - Day #70", videoId: "FGlKJdy--p8" , durationSeconds: 786, megaLessonId: "python-day-070"},
          { title: "dir, __dict__ and help method in Python | Python Tutorial - Day #71", videoId: "Wgo9TaBcuJ4" , durationSeconds: 443, megaLessonId: "python-day-071"},
          { title: "super keyword in Python | Python Tutorial - Day #72", videoId: "P648reefNh0" , durationSeconds: 548, megaLessonId: "python-day-072"},
          { title: "Magic/Dunder Methods in Python | Python Tutorial - Day #73", videoId: "DmgQVJXhuLQ" , durationSeconds: 732, megaLessonId: "python-day-073"},
          { title: "Method Overriding in Python | Python Tutorial - Day #74", videoId: "46_yfYC36JY" , durationSeconds: 387, megaLessonId: "python-day-074"},
          { title: "Exercise 7 Solution + Shoutouts | Python Tutorial - Day #75", videoId: "Wt9Shnzv_Yg" , durationSeconds: 732, megaLessonId: "python-day-075"},
          { title: "Exercise 8 - Merge the PDF | Python Tutorial - Day #76", videoId: "uUbvJ7ZEhPE" , durationSeconds: 194, megaLessonId: "python-day-076"},
          { title: "Operator Overloading in Python | Python Tutorial - Day #77", videoId: "D67-b2t-y4k" , durationSeconds: 444, megaLessonId: "python-day-077"},
          { title: "Single Inheritance in Python | Python Tutorial - Day #78", videoId: "U53_Gw55NI8" , durationSeconds: 279, megaLessonId: "python-day-078"},
          { title: "Multiple Inheritance in Python | Python Tutorial - Day #79", videoId: "4o7xSHgKlvI" , durationSeconds: 371, megaLessonId: "python-day-079"},
          { title: "Multilevel Inheritance in Python | Python Tutorial - Day #80", videoId: "Il7XMJJeXiA" , durationSeconds: 474, megaLessonId: "python-day-080"},
          { title: "Hybrid and Hierarchical Inheritance in Python | Python Tutorial - Day #81", videoId: "B4Q8zxRkm_I" , durationSeconds: 534, megaLessonId: "python-day-081"},
          { title: "Exercise 8 - Merge the Pdf Solution in Python | Python Tutorial - Day #82", videoId: "qKKGemhBRVM" , durationSeconds: 471, megaLessonId: "python-day-082"},
          { title: "Exercise 9 - Shoutouts to Everyone | Python Tutorial - Day #83", videoId: "1WjwnlRXfHc" , durationSeconds: 228, megaLessonId: "python-day-083"},
          { title: "Time Module in Python | Python Tutorial - Day #84", videoId: "oTtIvV-Q1FY" , durationSeconds: 697, megaLessonId: "python-day-084"},
          { title: "Creating command line utility in python | Python Tutorial - Day #85", videoId: "3IAu6-pgw7I" , durationSeconds: 1112, megaLessonId: "python-day-085"},
          { title: "Walrus Operator in Python | Python Tutorial - Day #86", videoId: "NCmMEEyzLT8" , durationSeconds: 576, megaLessonId: "python-day-086"},
          { title: "Shutil Module in Python | Python Tutorial - Day #87", videoId: "wII2JhNACJE" , durationSeconds: 762, megaLessonId: "python-day-087"},
          { title: "Exercise 9: Solution - Shoutouts to Everyone | Python Tutorial - Day #88", videoId: "C9VP-56RXNM" , durationSeconds: 734, megaLessonId: "python-day-088"},
          { title: "Requests Module in Python | Python Tutorial - Day #89", videoId: "Nsb3bLIlO4w" , durationSeconds: 526, megaLessonId: "python-day-089"},
          { title: "Exercise 10: News App in Python | Python Tutorial - Day #90", videoId: "BGzFp9mwFQ4" , durationSeconds: 274, megaLessonId: "python-day-090"},
          { title: "Generators in Python | Python Tutorial - Day #91", videoId: "ixd-u3pmsUc" , durationSeconds: 527, megaLessonId: "python-day-091"},
          { title: "Function Caching in Python | Python Tutorial - Day #92", videoId: "K8gjSwc3Rlo" , durationSeconds: 674, megaLessonId: "python-day-092"},
          { title: "Exercise 10 - News App Solution & Shoutout | Python Tutorial - Day #93", videoId: "bnAz7Kb2efE" , durationSeconds: 691, megaLessonId: "python-day-093"},
          { title: "Exercise 11 - Drink Water Reminder | Python Tutorial - Day #94", videoId: "1i4piFhpnm8" , durationSeconds: 260, megaLessonId: "python-day-094"},
          { title: "Regular Expressions in Python | Python Tutorial - Day #95", videoId: "TCWOwavqFrw" , durationSeconds: 783, megaLessonId: "python-day-095"},
          { title: "AsyncIO in Python | Python Tutorial - Day #96", videoId: "lgoB3_-ejnI" , durationSeconds: 629, megaLessonId: "python-day-096"},
          { title: "Multithreading in Python | Python Tutorial - Day #97", videoId: "ICbU6zAKtqQ" , durationSeconds: 1069, megaLessonId: "python-day-097"},
          { title: "MultiProcessing in Python | Python Tutorial - Day #98", videoId: "zGe-9LfnAaA" , durationSeconds: 1204, megaLessonId: "python-day-098"},
          { title: "Exercise 11: Solution + Shoutouts - Desktop Notification System | Python Tutorial - Day #99", videoId: "18vZnLqXMoM" , durationSeconds: 606, megaLessonId: "python-day-099"},
          { title: "Conclusion and Where to go from here | Python Tutorial - Day #100", videoId: "5Pz8WGiMJ_c" , durationSeconds: 999, megaLessonId: "python-day-100"},
        ],
      },
      {
        title: "Python Tutorials For Absolute Beginners In Hindi",
        url: "https://www.youtube.com/playlist?list=PLu0W_9lII9agICnT8t4iYVSZ3eykIAOME",
        videos: [
          { title: "Beginner Friendly Full Python Tutorials(Teaser) | Python Tutorials For Absolute Beginners In Hindi#0", videoId: "aqvDTCpNRek" , durationSeconds: 225},
          { title: "What is Programming & Why Learn Python? | Python Tutorials For Absolute Beginners In Hindi #1", videoId: "vrQlEhmVFDA" , durationSeconds: 666},
          { title: "Downloading Python and Pycharm Installation | Python Tutorials For Absolute Beginners In Hindi #2", videoId: "MoeQlmeJnPg" , durationSeconds: 891},
          { title: "Using Modules & Pip In Python | Python Tutorials For Absolute Beginners In Hindi #3", videoId: "0SZodbWUsQU" , durationSeconds: 495},
          { title: "Writing Our First Python Program | Python Tutorials For Absolute Beginners In Hindi #4", videoId: "bfSHM-vx5lA" , durationSeconds: 301},
          { title: "Using Python As A Calculator | Python Tutorials For Absolute Beginners In Hindi #5", videoId: "CDb9YzUq_VA" , durationSeconds: 264},
          { title: "Comments, Escape Sequences & Print Statement| Python Tutorials For Absolute Beginners In Hindi #6", videoId: "uhUgIT68CoU" , durationSeconds: 787},
          { title: "Variables, Datatypes and Typecasting | Python Tutorials For Absolute Beginners In Hindi #7", videoId: "z1-zfCvxybI" , durationSeconds: 1013},
          { title: "String Slicing And Other Functions In Python | Python Tutorials For Absolute Beginners In Hindi #8", videoId: "lPZn7zcGXQo" , durationSeconds: 1076},
          { title: "Python Lists And List Functions | Python Tutorials For Absolute Beginners In Hindi #9", videoId: "neTsPE9XFsQ" , durationSeconds: 1299},
          { title: "Dictionary & Its Functions Explained | Python Tutorials For Absolute Beginners In Hindi #10", videoId: "5y1sh0-oKTE" , durationSeconds: 789},
          { title: "Python Exercise 1 - Apni Dictionary | Python Tutorials For Absolute Beginners In Hindi #11", videoId: "y_aRifWZbnY" , durationSeconds: 133},
          { title: "Sets In Python | Python Tutorials For Absolute Beginners In Hindi #12", videoId: "iVJv3zdgkD4" , durationSeconds: 382},
          { title: "If Else & Elif Conditionals In Python | Python Tutorials For Absolute Beginners In Hindi #13", videoId: "3VejIihDfwU" , durationSeconds: 796},
          { title: "Exercise 1 - Solution And Your Answers | Python Tutorials For Absolute Beginners In Hindi #14", videoId: "6_hq_8FsKkE" , durationSeconds: 697},
          { title: "Python Exercise 2 - Faulty Calculator  | Python Tutorials For Absolute Beginners In Hindi #15", videoId: "VP8s9NiFToM" , durationSeconds: 237},
          { title: "For Loops In Python | Python Tutorials For Absolute Beginners In Hindi #16", videoId: "sSyCRQx5WM0" , durationSeconds: 680},
          { title: "While Loops In Python | Python Tutorials For Absolute Beginners In Hindi #17", videoId: "qvWuPZNOeGg" , durationSeconds: 234},
          { title: "Break & Continue Statements In Python | Python Tutorials For Absolute Beginners In Hindi #18", videoId: "aXGC1fx6QQo" , durationSeconds: 558},
          { title: "Python Exercise 2: Faulty Calculator Solution| Python Tutorials For Absolute Beginners In Hindi #19", videoId: "s0lxxTHWx6w" , durationSeconds: 1063},
          { title: "Python Exercise 3 - Guess The Number | Python Tutorials For Absolute Beginners In Hindi #20", videoId: "2loUi5KxZ3E" , durationSeconds: 211},
          { title: "Operators In Python | Python Tutorials For Absolute Beginners In Hindi #21", videoId: "OlumSBDDR3U" , durationSeconds: 784},
          { title: "Short Hand If Else Notation In Python | Python Tutorials For Absolute Beginners In Hindi #22", videoId: "FsqiWRJeRDQ" , durationSeconds: 293},
          { title: "Functions And Docstrings | Python Tutorials For Absolute Beginners In Hindi #23", videoId: "xTmBq-CQTVU" , durationSeconds: 781},
          { title: "Try Except Exception Handling In Python | Python Tutorials For Absolute Beginners In Hindi #24", videoId: "A0hmk3wWTXI" , durationSeconds: 426},
          { title: "Python File IO Basics | Python Tutorials For Absolute Beginners In Hindi #25", videoId: "MpHo6dC6Ky0" , durationSeconds: 402},
          { title: "Open(), Read() & Readline() For Reading File | Python Tutorials For Absolute Beginners In Hindi #26", videoId: "Q9K_wFj5DuQ" , durationSeconds: 783},
          { title: "Python Exercise 3: Solution | Python Tutorials For Absolute Beginners In Hindi #27", videoId: "nsJuAUCH-_o" , durationSeconds: 1385},
          { title: "Writing And Appending To A File | Python Tutorials For Absolute Beginners In Hindi #28", videoId: "ZNIe4Nf-6-c" , durationSeconds: 409},
          { title: "Python Exercise 4: Astrologer's Stars | Python Tutorials For Absolute Beginners In Hindi #29", videoId: "FyvmDqsc8tc" , durationSeconds: 200},
          { title: "Seek(), tell() & More On Python Files | Python Tutorials For Absolute Beginners In Hindi #30", videoId: "stcJipumWwY" , durationSeconds: 364},
          { title: "Using With Block To Open Python Files | Python Tutorials For Absolute Beginners In Hindi #31", videoId: "Mqmq5YwciMg" , durationSeconds: 353},
          { title: "Exercise 5: Health Management System | Python Tutorials For Absolute Beginners In Hindi #32", videoId: "OM5hCIwSv1g" , durationSeconds: 332},
          { title: "Scope, Global Variables and Global Keyword | Python Tutorials For Absolute Beginners In Hindi #33", videoId: "im7Z1jKMGao" , durationSeconds: 787},
          { title: "Recursions: Recursive Vs Iterative Approach | Python Tutorials For Absolute Beginners In Hindi #34", videoId: "UhCObChYSMc" , durationSeconds: 948},
          { title: "Exercise 4: Solution And First Solver | Python Tutorials For Absolute Beginners In Hindi #35", videoId: "ZXtpX_CRVGM" , durationSeconds: 1086},
          { title: "Anonymous/Lambda Functions In Python | Python Tutorials For Absolute Beginners In Hindi #36", videoId: "EFjf3cx1N7o" , durationSeconds: 400},
          { title: "Exercise 5: Solution And First Solver | Python Tutorials For Absolute Beginners In Hindi #37", videoId: "Ft5ksUloEH8" , durationSeconds: 945},
          { title: "Using Python External & Built In Modules | Python Tutorials For Absolute Beginners In Hindi #38", videoId: "jA5pP2HNRNI" , durationSeconds: 677},
          { title: "F-Strings & String Formatting In Python | Python Tutorials For Absolute Beginners In Hindi #39", videoId: "mcK9lEPomMI" , durationSeconds: 448},
          { title: "Exercise 6: Game Development: Snake Water Gun | Python Tutorials For Absolute Beginners In Hindi #40", videoId: "kHYaYbHQOg0" , durationSeconds: 317},
          { title: "*args and **kwargs In Python | Python Tutorials For Absolute Beginners In Hindi #41", videoId: "0lu2SY3menU" , durationSeconds: 892},
          { title: "Time Module In Python | Python Tutorials For Absolute Beginners In Hindi #42", videoId: "u9cHEJivgPA" , durationSeconds: 670},
          { title: "Virtual Environment & Requirements.txt | Python Tutorials For Absolute Beginners In Hindi #43", videoId: "Lah7WGW6exg" , durationSeconds: 1308},
          { title: "Enumerate Function | Python Tutorials For Absolute Beginners In Hindi #44", videoId: "NjaKU7eEGt8" , durationSeconds: 410},
          { title: "How Import Works In Python? | Python Tutorials For Absolute Beginners In Hindi #45", videoId: "6RfTUiMR-RM" , durationSeconds: 773},
          { title: "If __name__==__main__ usage & necessity | Python Tutorials For Absolute Beginners In Hindi #46", videoId: "Gy74MjEpnYw" , durationSeconds: 542},
          { title: "Join Function In Python | Python Tutorials For Absolute Beginners In Hindi #47", videoId: "6VXmyVwPDlE" , durationSeconds: 273},
          { title: "Map, Filter & Reduce | Python Tutorials For Absolute Beginners In Hindi #48", videoId: "zimHDlOpGXo" , durationSeconds: 1119},
          { title: "Exercise 6 Solution & First Solver | Python Tutorials For Absolute Beginners In Hindi #49", videoId: "uRIjZu3d22I" , durationSeconds: 2019},
          { title: "Exercise 7: Healthy Programmer | Python Tutorials For Absolute Beginners In Hindi #50", videoId: "khKJXOOETzc" , durationSeconds: 690},
          { title: "Decorators In Python | Python Tutorials For Absolute Beginners In Hindi #51", videoId: "_zTyBMFD4yY" , durationSeconds: 622},
          { title: "Classes & Objects (OOPS) | Python Tutorials For Absolute Beginners In Hindi #52", videoId: "o6zPAzl4ZtM" , durationSeconds: 585},
          { title: "Creating Our First Class In Python | Python Tutorials For Absolute Beginners In Hindi #53", videoId: "l2YmwyayVVk" , durationSeconds: 370},
          { title: "Instance & Class Variables | Python Tutorials For Absolute Beginners In Hindi #54", videoId: "Hg7dnmczBTA" , durationSeconds: 507},
          { title: "Self & __init__() (Constructors) | Python Tutorials For Absolute Beginners In Hindi #55", videoId: "ya4e4OcCRB4" , durationSeconds: 708},
          { title: "Class Methods In Python | Python Tutorials For Absolute Beginners In Hindi #56", videoId: "16K7DvU5Bvw" , durationSeconds: 357},
          { title: "Class Methods As Alternative Constructors | Python Tutorials For Absolute Beginners In Hindi #57", videoId: "nrCI9HcpVZ8" , durationSeconds: 505},
          { title: "Static Methods In Python | Python Tutorials For Absolute Beginners In Hindi #58", videoId: "cO5GBHKJGJw" , durationSeconds: 343},
          { title: "Abstraction & Encapsulation | Python Tutorials For Absolute Beginners In Hindi #59", videoId: "wySW_E4XsvE" , durationSeconds: 492},
          { title: "Single Inheritance | Python Tutorials For Absolute Beginners In Hindi #60", videoId: "Ynf1GcIEzeo" , durationSeconds: 750},
          { title: "Multiple Inheritance | Python Tutorials For Absolute Beginners In Hindi #61", videoId: "-f5yvt5XtEU" , durationSeconds: 726},
          { title: "Multilevel Inheritance | Python Tutorials For Absolute Beginners In Hindi #62", videoId: "VccLwnrT5hQ" , durationSeconds: 542},
          { title: "Public, Private & Protected Access Specifiers | Python Tutorials For Absolute Beginners In Hindi #63", videoId: "e2dmC0hksVE" , durationSeconds: 460},
          { title: "Polymorphism In Python | Python Tutorials For Absolute Beginners In Hindi #64", videoId: "xnb-9TI-BjQ" , durationSeconds: 252},
          { title: "Super() and Overriding In Classes | Python Tutorials For Absolute Beginners In Hindi #65", videoId: "HfmFcj0NmHI" , durationSeconds: 578},
          { title: "Diamond Shape Problem In Multiple Inheritance | Python Tutorials For Absolute Beginners In Hindi #66", videoId: "mEF_vVNTPUY" , durationSeconds: 367},
          { title: "Operator Overloading & Dunder Methods | Python Tutorials For Absolute Beginners In Hindi #67", videoId: "iYu6KPigfr4" , durationSeconds: 665},
          { title: "Abstract Base Class & @abstractmethod | Python Tutorials For Absolute Beginners In Hindi #68", videoId: "Iho_Kgj5kfI" , durationSeconds: 422},
          { title: "Setters & Property Decorators | Python Tutorials For Absolute Beginners In Hindi #69", videoId: "O3R_P5j41ns" , durationSeconds: 1065},
          { title: "Object Introspection | Python Tutorials For Absolute Beginners In Hindi #70", videoId: "h1CmrQBAifY" , durationSeconds: 386},
          { title: "Python Mini Project #1 | Python Tutorials For Absolute Beginners In Hindi #71", videoId: "LH6wWxXLKQ0" , durationSeconds: 393},
          { title: "Generators In Python | Python Tutorials For Absolute Beginners In Hindi #72", videoId: "S9d-fwalZ_Q" , durationSeconds: 792},
          { title: "Python Comprehensions | Python Tutorials For Absolute Beginners In Hindi #73", videoId: "D2h_qI6Tx4M" , durationSeconds: 956},
          { title: "Using Else With For Loops | Python Tutorials For Absolute Beginners In Hindi #74", videoId: "C0SnZ_DRfUI" , durationSeconds: 388},
          { title: "Function Caching In Python | Python Tutorials For Absolute Beginners In Hindi #75", videoId: "34p5CH48hLE" , durationSeconds: 755},
          { title: "Else & Finally In Try Except | Python Tutorials For Absolute Beginners In Hindi #76", videoId: "pxEhxWhvIik" , durationSeconds: 624},
          { title: "Coroutines In Python | Python Tutorials For Absolute Beginners In Hindi #77", videoId: "T3tmkWfOHa8" , durationSeconds: 730},
          { title: "Exercise 7: Solution & First Solver | Python Tutorials For Absolute Beginners In Hindi #78", videoId: "gDeCfW_Kt0s" , durationSeconds: 1684},
          { title: "Os Module | Python Tutorials For Absolute Beginners In Hindi #79", videoId: "HHviSDUTtUc" , durationSeconds: 878},
          { title: "Exercise 8: Oh Soldier Prettify My Folder| Python Tutorials For Absolute Beginners In Hindi #80", videoId: "MkgJfmN6dN8" , durationSeconds: 327},
          { title: "Requests Module For HTTP Requests | Python Tutorials For Absolute Beginners In Hindi #81", videoId: "u6_aYV-1LAE" , durationSeconds: 504},
          { title: "Json Module | Python Tutorials For Absolute Beginners In Hindi #82", videoId: "9U4dHBOzmaE" , durationSeconds: 693},
          { title: "Exercise 9: Akhbaar Padhke Sunaao | Python Tutorials For Absolute Beginners In Hindi #83", videoId: "9aW-knzZ7p8" , durationSeconds: 285},
          { title: "Pickle Module | Python Tutorials For Absolute Beginners In Hindi #84", videoId: "KaurZiP0mhU" , durationSeconds: 595},
          { title: "Exercise 10: Pickling Iris | Python Tutorials For Absolute Beginners In Hindi #85", videoId: "XEgRSum4Zps" , durationSeconds: 286},
          { title: "Regular Expressions | Python Tutorials For Absolute Beginners In Hindi #86", videoId: "g8u0wLvvPSs" , durationSeconds: 1059},
          { title: "Converting .py to .exe | Python Tutorials For Absolute Beginners In Hindi #87", videoId: "oNq9QKX3lMs" , durationSeconds: 723},
          { title: "Python Exercise 8: Solution + Tips | Python Tutorials For Absolute Beginners In Hindi #88", videoId: "uw4pvD0Mczw" , durationSeconds: 824},
          { title: "Raise In Python + Examples | Python Tutorials For Absolute Beginners In Hindi #89", videoId: "BGQhccSWYpk" , durationSeconds: 690},
          { title: "Python 'is' vs '==': What's The Difference? | Python Tutorials For Absolute Beginners In Hindi #90", videoId: "Xub80-7g4I8" , durationSeconds: 307},
          { title: "Python 2.x Vs Python 3.x | Python Tutorials For Absolute Beginners In Hindi #91", videoId: "n39cxF9bQIE" , durationSeconds: 649},
          { title: "Python Exercise 9 Solution + Shoutouts | Python Tutorials For Absolute Beginners In Hindi #92", videoId: "S2kvV91gswo" , durationSeconds: 1419},
          { title: "Creating a Command Line Utility In Python | Python Tutorials For Absolute Beginners In Hindi #93", videoId: "Qi-8zaBfRWI" , durationSeconds: 870},
          { title: "Exercise 10: Solution + Shoutouts | Python Tutorials For Absolute Beginners In Hindi #94", videoId: "tCrRWiEIMec" , durationSeconds: 854},
          { title: "Creating a Python Package Using Setuptools | Python Tutorials For Absolute Beginners In Hindi #95", videoId: "RiWqigGW9cA" , durationSeconds: 1182},
          { title: "Python Exercise 11: Regex Email Extractor | Python Tutorials For Absolute Beginners In Hindi #96", videoId: "IvCMglGI4PU" , durationSeconds: 202},
          { title: "Learning Path For Python Web Development | Python Tutorials For Absolute Beginners In Hindi #97", videoId: "QW7eJbkDvDc" , durationSeconds: 402},
          { title: "Python GUI Development - Learning Path | Python Tutorials For Absolute Beginners In Hindi #98", videoId: "eowHTYzUZhw" , durationSeconds: 889},
          { title: "Machine Learning & Data Science Learning Path | Python Tutorials For Absolute Beginners In Hindi #99", videoId: "nO546sT9PFQ" , durationSeconds: 1071},
          { title: "Regex Exercise 11 Solutions | Python Tutorials For Absolute Beginners In Hindi #100", videoId: "-1dH3h-BcVg" , durationSeconds: 740},
          { title: "Mini Project 1 (OOPs Library) Solution | Python Tutorials For Absolute Beginners In Hindi #101", videoId: "hyZA885xVmc" , durationSeconds: 1560},
          { title: "Conclusion & Way Forward | Python Tutorials For Absolute Beginners In Hindi #102", videoId: "XI6s3-TdU54" , durationSeconds: 995},
          { title: "Practice Problem 1 (Easy) |  Python Tutorials For Absolute Beginners In Hindi #103", videoId: "nDWMNCs8TBg" , durationSeconds: 557},
          { title: "Python Practice 1 Solution | Python Tutorials For Absolute Beginners In Hindi #104", videoId: "F6-RRrwWEsQ" , durationSeconds: 1069},
          { title: "Practice Problem 2 (Easy) |  Python Tutorials For Absolute Beginners In Hindi #105", videoId: "VeOPJM6yTIY" , durationSeconds: 470},
          { title: "Python Practice 2 Solution | Python Tutorials For Absolute Beginners In Hindi #106", videoId: "-aF859WfPoQ" , durationSeconds: 588},
          { title: "Python Practice 3 | Python Tutorials For Absolute Beginners In Hindi #107", videoId: "XiXUrvzoTIs" , durationSeconds: 500},
          { title: "Python Problem 3: Solution | Python Tutorials For Absolute Beginners In Hindi #108", videoId: "tx7VofKNnAA" , durationSeconds: 1226},
          { title: "Python Problem 4 | Python Tutorials For Absolute Beginners In Hindi #109", videoId: "-7IhCwaHb2c" , durationSeconds: 385},
          { title: "Python Problem 4: Solution | Python Tutorials For Absolute Beginners In Hindi #110", videoId: "o6h2kU2VTkc" , durationSeconds: 1016},
          { title: "Python Problem 5 | Python Tutorials For Absolute Beginners In Hindi #111", videoId: "H7kH_2YJQVY" , durationSeconds: 533},
          { title: "Python Problem 5: Solution | Python Tutorials For Absolute Beginners In Hindi #112", videoId: "-Q57UxpBfV0" , durationSeconds: 904},
          { title: "Python Problem 6 | Python Tutorials For Absolute Beginners In Hindi #113", videoId: "3ePMrLWsBps" , durationSeconds: 579},
          { title: "Python Problem 6: Solution | Python Tutorials For Absolute Beginners In Hindi #114", videoId: "NRndfnhknSc" , durationSeconds: 934},
          { title: "Python Problem 7: Creating A Search Engine | Python Tutorials For Absolute Beginners In Hindi #115", videoId: "sEZW2n2D-Hs" , durationSeconds: 691},
          { title: "Python Problem 7: Solution | Python Tutorials For Absolute Beginners In Hindi #116", videoId: "VkH1B0EAhfU" , durationSeconds: 1427},
          { title: "Python Problem 8: Fake Multiplication Tables | Python Tutorials For Absolute Beginners In Hindi #117", videoId: "S-OFpk9IQmU" , durationSeconds: 706},
          { title: "Python Problem 8: Solution | Python Tutorials For Absolute Beginners In Hindi #118", videoId: "Dhzp7hlXJFQ" , durationSeconds: 743},
          { title: "Python Problem 9: Jumbled Funny Names | Python Tutorials For Absolute Beginners In Hindi #119", videoId: "1glrtDGtjVI" , durationSeconds: 416},
          { title: "Project 1: Iron Man Jarvis AI Desktop Voice Assistant | Python Tutorials For Absolute Beginners #120", videoId: "Lp9Ftuq2sVI" , durationSeconds: 3527},
          { title: "VS Code Tutorial + Python Setup | Python Tutorials For Absolute Beginners In Hindi #121", videoId: "t90FMQr9WWc" , durationSeconds: 3177},
          { title: "Project 2: Coding Flappy Bird Game (With Source Code) | Python Tutorials For Absolute Beginners #122", videoId: "itB6VsP5UnA" , durationSeconds: 7672},
          { title: "Project 3: Third Umpire Decision Review System (DRS Gully Cricket) |Python Tutorials in Hindi #123", videoId: "Sq9oaVFYUaE" , durationSeconds: 3705},
          { title: "Project 4: Indian Railways Announcement Software | Python Tutorials For Absolute Beginners #124", videoId: "V-O96C_7xgc" , durationSeconds: 3120},
          { title: "CoronaVirus: Python Programming Solution to the Problem", videoId: "02eZFXALcl4" , durationSeconds: 5026},
          { title: "Covid -19: Creating a Realtime CoronaVirus Outbreak Notification System Using Python Programming", videoId: "h_0lPh7LE_E" , durationSeconds: 2404},
          { title: "Django Tutorial In Hindi", videoId: "JxzZxdht-XY" , durationSeconds: 10583},
          { title: "I Automated The Chrome Dinosaur Game Using Python 🔥", videoId: "PXz2nFNuNJU" , durationSeconds: 3599},
        ],
      },
    ],
    oneShots: [
      { title: "Python Tutorial For Beginners In Hindi (With Notes) 🔥", videoId: "gfDE2a7MKjA" , durationSeconds: 42744},
      { title: "Learn Python In Hindi In One Video - हिंदी में", videoId: "qHJjMvHLJdg" , durationSeconds: 3614},
      { title: "Python Tutorial In Hindi 🔥", videoId: "ihk_Xglr164" , durationSeconds: 6303},
      { title: "Python Programming Course in Hindi (Advanced) 🔥", videoId: "61a7UkDO50s" , durationSeconds: 12230},
      { title: "15 Minute Python Tutorial For Beginners In Hindi (Full & Complete Python Crash Course)", videoId: "fr1f84rg4Nw" , durationSeconds: 1057},
    ],
  },
  {
    name: "Code With Mosh",
    slug: "code-with-mosh",
    handle: "@programmingwithmosh",
    avatarUrl: "https://yt3.googleusercontent.com/HCv0fXFEEcD0HRyF0_qR1K7b7qO3KCzmIoyH1DEJYB94CIUFhIE5i2t2IDIPX97W1-DK4hegww=s176-c-k-c0x00ffffff-no-rj",
    subscribers: "5.19M subscribers",
    language: "English",
    tagline: "The classic Python course in English — full course plus topic videos.",
    playlists: [
      {
        title: "Python Tutorials",
        url: "https://www.youtube.com/playlist?list=PLTjRvDozrdlxj5wgH4qkvwSOdHLOCx10f",
        videos: [
          { title: "Python Full Course for Beginners", videoId: "_uQrJ0TkZlc" , durationSeconds: 22447},
          { title: "Learn Python Programming - Python Course", videoId: "f79MRyMsjrQ" , durationSeconds: 6485},
          { title: "Python Tutorials for Beginners - Learn Python Online", videoId: "yE9v9rt6ziw" , durationSeconds: 8753},
          { title: "What is Python? Why Python is So Popular?", videoId: "Y8Tko2YC5hA" , durationSeconds: 247},
          { title: "Python Exercises for Beginners - Exercise #1", videoId: "ODjFDZC_TyA" , durationSeconds: 138},
          { title: "How to Loop over Lists in Python", videoId: "9ueMumuFv6g" , durationSeconds: 201},
          { title: "Python For Loops - Python Tutorial for Absolute Beginners", videoId: "94UHCEmprCY" , durationSeconds: 881},
          { title: "Python Functions | Python Tutorial for Absolute Beginners #1", videoId: "u-OmVr_fT4s" , durationSeconds: 1833},
          { title: "Control Flow in Python - If Elif Else Statements", videoId: "Zp5MuPOtsSY" , durationSeconds: 968},
          { title: "How to Use Lists in Python", videoId: "9OeznAkyQz4" , durationSeconds: 1128},
          { title: "How to Use Strings in Python - Python Tutorial for Beginners", videoId: "Ctqi5Y4X-jA" , durationSeconds: 1005},
          { title: "Python Stacks - Python Tutorial for Absolute Beginners | Mosh", videoId: "NKmasqr_Xkw" , durationSeconds: 291},
          { title: "What are Sets in Python? Python Tutorial for Absolute Beginners | Mosh", videoId: "t9j8lCUGZXo" , durationSeconds: 270},
          { title: "Map and Filter Functions in Python - Python Tutorial for Absolute Beginners | Mosh", videoId: "2qKQGqpRsks" , durationSeconds: 359},
          { title: "How to Sort Lists in Python - Python Tutorial for Absolute Beginners | Mosh", videoId: "3Tcq_dBhIrQ" , durationSeconds: 413},
          { title: "Python Variables - Python Tutorial for Beginners with Examples | Mosh", videoId: "cQT33yu9pY8" , durationSeconds: 395},
          { title: "Python Practice - Interview Question - Fizz Buzz | Mosh", videoId: "z3-XFI_nXNM" , durationSeconds: 374},
          { title: "Python for Beginners - Learn Coding with Python in 1 Hour", videoId: "kqtD5dpn9C8" , durationSeconds: 3606},
          { title: "Python Machine Learning Tutorial (Data Science)", videoId: "7eh4d6sabA0" , durationSeconds: 2983},
          { title: "Django Tutorial for Beginners – Build Powerful Backends", videoId: "rHux0gMZ3Eg" , durationSeconds: 3756},
          { title: "Python Full Course for Beginners", videoId: "K5KVEU3aaeQ" , durationSeconds: 7340},
          { title: "Python Projects for Beginners – Master Problem-Solving! 🚀", videoId: "yVl_G-F7m8c" , durationSeconds: 3180},
        ],
      },
    ],
    oneShots: [
    ],
  },
  {
    name: "Apna College",
    slug: "apna-college",
    handle: "@ApnaCollegeOfficial",
    avatarUrl: "https://yt3.googleusercontent.com/FEcjRtez5od8UowDo6tTt9WlE-MrIFEmcwPMTORmK9Swk6KCklOmA3xfIG9WuLWfNYfNThQE=s176-c-k-c0x00ffffff-no-rj",
    subscribers: "7.99M subscribers",
    language: "Hindi",
    tagline: "Full Python courses in Hindi, with notes and practice questions.",
    playlists: [
    ],
    oneShots: [
      { title: "Python Tutorial for Beginners - Full Course (with Notes & Practice Questions)", videoId: "ERCMXc8x7mc" , durationSeconds: 37491},
      { title: "Python Full Course for Beginners", videoId: "q3AuP01daL4" , durationSeconds: 7352},
      { title: "Python Tutorial for Beginners | Learn Python in 1.5 Hours", videoId: "vLqTf2b6GZw" , durationSeconds: 4632},
    ],
  },
];

export function totalCourseVideos(): number {
  return COURSE_CREATORS.reduce(
    (n, c) =>
      n +
      c.playlists.reduce((m, p) => m + p.videos.length, 0) +
      c.oneShots.length,
    0
  );
}

/** The YouTube playlist id from a playlist URL (the `list=` param). */
export function playlistListId(url: string): string {
  const m = /[?&]list=([^&]+)/.exec(url);
  return m ? m[1] : "";
}
