import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Quizora with programming language data...\n');

  // ═══════════════════════════════════════════════════════════════════
  // ADMIN
  // ═══════════════════════════════════════════════════════════════════
  const adminPw = await bcrypt.hash('admin@123', 12);
  const admin = await prisma.user.create({
    data: { fullName: 'Quizora Admin', email: 'admin@quizora.com', mobile: '9999999999', password: adminPw, role: 'ADMIN', status: 'ACTIVE' },
  });
  console.log('✓ Admin: admin@quizora.com / admin@123');

  // ═══════════════════════════════════════════════════════════════════
  // STUDENTS (15)
  // ═══════════════════════════════════════════════════════════════════
  const studentPw = await bcrypt.hash('student@123', 12);
  const studentData = [
    { fullName: 'Rahul Sharma', email: 'rahul@test.com', mobile: '9876543210' },
    { fullName: 'Priya Patel', email: 'priya@test.com', mobile: '9876543211' },
    { fullName: 'Amit Kumar', email: 'amit@test.com', mobile: '9876543212' },
    { fullName: 'Sneha Deshmukh', email: 'sneha@test.com', mobile: '9876543213' },
    { fullName: 'Vikram Singh', email: 'vikram@test.com', mobile: '9876543214' },
    { fullName: 'Neha Joshi', email: 'neha@test.com', mobile: '9876543215' },
    { fullName: 'Rohan Gupta', email: 'rohan@test.com', mobile: '9876543216' },
    { fullName: 'Ananya Iyer', email: 'ananya@test.com', mobile: '9876543217' },
    { fullName: 'Karthik Nair', email: 'karthik@test.com', mobile: '9876543218' },
    { fullName: 'Pooja Reddy', email: 'pooja@test.com', mobile: '9876543219' },
    { fullName: 'Arjun Mehta', email: 'arjun@test.com', mobile: '9876543220' },
    { fullName: 'Divya Kulkarni', email: 'divya@test.com', mobile: '9876543221' },
    { fullName: 'Saurabh Patil', email: 'saurabh@test.com', mobile: '9876543222' },
    { fullName: 'Meera Rao', email: 'meera@test.com', mobile: '9876543223' },
    { fullName: 'Aditya Verma', email: 'aditya@test.com', mobile: '9876543224' },
  ];
  const students: any[] = [];
  for (const s of studentData) {
    const student = await prisma.user.create({ data: { ...s, password: studentPw, role: 'STUDENT', status: 'ACTIVE' } });
    students.push(student);
  }
  console.log(`✓ ${students.length} students created (password: student@123)`);

  // ═══════════════════════════════════════════════════════════════════
  // SUBJECTS & TOPICS
  // ═══════════════════════════════════════════════════════════════════
  const subjectsConfig = [
    { name: 'Python', description: 'Python programming language', topics: ['Basics & Syntax', 'Data Types', 'Control Flow', 'Functions', 'OOP', 'File Handling', 'Modules & Packages', 'Error Handling'] },
    { name: 'Java', description: 'Java programming language', topics: ['Basics & Syntax', 'Data Types', 'Control Flow', 'OOP', 'Collections', 'Exception Handling', 'Multithreading', 'JDBC'] },
    { name: 'JavaScript', description: 'JavaScript programming language', topics: ['Basics & Syntax', 'DOM Manipulation', 'Functions & Closures', 'ES6+ Features', 'Async Programming', 'Error Handling', 'Objects & Arrays'] },
    { name: 'C Programming', description: 'C programming language', topics: ['Basics & Syntax', 'Data Types', 'Pointers', 'Arrays & Strings', 'Structures', 'File I/O', 'Memory Management'] },
    { name: 'SQL', description: 'Structured Query Language', topics: ['Basic Queries', 'Joins', 'Aggregations', 'Subqueries', 'DDL & DML', 'Indexes & Views', 'Normalization'] },
    { name: 'HTML & CSS', description: 'Web markup and styling', topics: ['HTML Basics', 'Forms & Tables', 'CSS Selectors', 'Box Model & Layout', 'Flexbox & Grid', 'Responsive Design'] },
  ];

  const subjects: Record<string, string> = {};
  const topics: Record<string, Record<string, string>> = {};

  for (const sc of subjectsConfig) {
    const subject = await prisma.subject.create({ data: { name: sc.name, description: sc.description } });
    subjects[sc.name] = subject.id;
    topics[sc.name] = {};
    for (const topicName of sc.topics) {
      const topic = await prisma.topic.create({ data: { name: topicName, subjectId: subject.id } });
      topics[sc.name][topicName] = topic.id;
    }
  }
  console.log(`✓ ${Object.keys(subjects).length} subjects with ${Object.values(topics).reduce((sum, t) => sum + Object.keys(t).length, 0)} topics`);

  // ═══════════════════════════════════════════════════════════════════
  // QUESTIONS (120+)
  // ═══════════════════════════════════════════════════════════════════

  async function createQ(subjectName: string, topicName: string, q: { text: string; type: string; difficulty: string; marks: number; options: { label: string; text: string }[]; correctAnswers: string[]; explanation: string }) {
    return prisma.question.create({
      data: {
        subjectId: subjects[subjectName],
        topicId: topics[subjectName]?.[topicName] || null,
        type: q.type as any,
        difficulty: q.difficulty as any,
        text: q.text,
        marks: q.marks,
        correctAnswers: q.correctAnswers,
        explanation: q.explanation,
        version: 1,
        options: { create: q.options },
      },
    });
  }

  // ── PYTHON (25 questions) ──────────────────────────────────────
  const pythonQs = [
    { topic: 'Basics & Syntax', text: 'What is the correct file extension for Python files?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: '.pt' }, { label: 'B', text: '.py' }, { label: 'C', text: '.python' }, { label: 'D', text: '.pyt' }], correctAnswers: ['B'], explanation: 'Python files use the .py extension.' },
    { topic: 'Basics & Syntax', text: 'Which keyword is used to define a function in Python?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'function' }, { label: 'B', text: 'func' }, { label: 'C', text: 'def' }, { label: 'D', text: 'define' }], correctAnswers: ['C'], explanation: 'The def keyword is used to define functions in Python.' },
    { topic: 'Basics & Syntax', text: 'Python is an interpreted language.', type: 'TRUE_FALSE', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['A'], explanation: 'Python is indeed an interpreted language.' },
    { topic: 'Data Types', text: 'Which of the following is a mutable data type in Python?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'tuple' }, { label: 'B', text: 'string' }, { label: 'C', text: 'list' }, { label: 'D', text: 'int' }], correctAnswers: ['C'], explanation: 'Lists are mutable in Python; tuples and strings are immutable.' },
    { topic: 'Data Types', text: 'What is the output of type(3.14)?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: "<class 'int'>" }, { label: 'B', text: "<class 'float'>" }, { label: 'C', text: "<class 'double'>" }, { label: 'D', text: "<class 'decimal'>" }], correctAnswers: ['B'], explanation: '3.14 is a floating-point number.' },
    { topic: 'Data Types', text: 'Which of the following are immutable in Python?', type: 'MSQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'tuple' }, { label: 'B', text: 'list' }, { label: 'C', text: 'string' }, { label: 'D', text: 'frozenset' }, { label: 'E', text: 'dict' }], correctAnswers: ['A', 'C', 'D'], explanation: 'Tuples, strings, and frozensets are immutable.' },
    { topic: 'Control Flow', text: 'What is the output of: print(10 % 3)?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: '3' }, { label: 'B', text: '1' }, { label: 'C', text: '0' }, { label: 'D', text: '10' }], correctAnswers: ['B'], explanation: '10 % 3 = 1 (modulo gives remainder).' },
    { topic: 'Control Flow', text: 'Which loop is guaranteed to execute at least once?', type: 'MCQ', difficulty: 'MODERATE', marks: 1, options: [{ label: 'A', text: 'for loop' }, { label: 'B', text: 'while loop' }, { label: 'C', text: 'do-while loop' }, { label: 'D', text: 'None of these' }], correctAnswers: ['D'], explanation: 'Python does not have a do-while loop. Neither for nor while is guaranteed to execute.' },
    { topic: 'Control Flow', text: 'What does the "break" statement do in a loop?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'Skips current iteration' }, { label: 'B', text: 'Exits the loop' }, { label: 'C', text: 'Restarts the loop' }, { label: 'D', text: 'Pauses the loop' }], correctAnswers: ['B'], explanation: 'break exits the loop immediately.' },
    { topic: 'Functions', text: 'What is a lambda function in Python?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'A named function' }, { label: 'B', text: 'An anonymous function' }, { label: 'C', text: 'A recursive function' }, { label: 'D', text: 'A built-in function' }], correctAnswers: ['B'], explanation: 'Lambda creates anonymous (unnamed) functions.' },
    { topic: 'Functions', text: 'What is the output of: def f(a, b=5): return a + b; print(f(3))?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: '3' }, { label: 'B', text: '5' }, { label: 'C', text: '8' }, { label: 'D', text: 'Error' }], correctAnswers: ['C'], explanation: 'b defaults to 5, so f(3) = 3 + 5 = 8.' },
    { topic: 'Functions', text: 'Python supports function overloading.', type: 'TRUE_FALSE', difficulty: 'MODERATE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['B'], explanation: 'Python does not support traditional function overloading. The last definition overrides.' },
    { topic: 'OOP', text: 'Which method is called when an object is created in Python?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: '__init__' }, { label: 'B', text: '__new__' }, { label: 'C', text: '__create__' }, { label: 'D', text: '__start__' }], correctAnswers: ['A'], explanation: '__init__ is the constructor method called when an object is created.' },
    { topic: 'OOP', text: 'Which OOP concepts does Python support?', type: 'MSQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'Inheritance' }, { label: 'B', text: 'Polymorphism' }, { label: 'C', text: 'Encapsulation' }, { label: 'D', text: 'Abstraction' }], correctAnswers: ['A', 'B', 'C', 'D'], explanation: 'Python supports all four OOP pillars.' },
    { topic: 'OOP', text: 'What is the purpose of "self" in Python class methods?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'Refers to the class' }, { label: 'B', text: 'Refers to the instance' }, { label: 'C', text: 'A reserved keyword' }, { label: 'D', text: 'Creates a new object' }], correctAnswers: ['B'], explanation: 'self refers to the current instance of the class.' },
    { topic: 'File Handling', text: 'Which mode opens a file for reading only?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'w' }, { label: 'B', text: 'r' }, { label: 'C', text: 'a' }, { label: 'D', text: 'x' }], correctAnswers: ['B'], explanation: '"r" mode opens a file for reading only.' },
    { topic: 'File Handling', text: 'What does the "with" statement do when working with files?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'Opens file faster' }, { label: 'B', text: 'Auto-closes the file' }, { label: 'C', text: 'Creates a backup' }, { label: 'D', text: 'Encrypts the file' }], correctAnswers: ['B'], explanation: 'with statement ensures the file is properly closed after operations.' },
    { topic: 'Modules & Packages', text: 'Which keyword is used to import a module in Python?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'include' }, { label: 'B', text: 'require' }, { label: 'C', text: 'import' }, { label: 'D', text: 'using' }], correctAnswers: ['C'], explanation: 'The import keyword is used to import modules.' },
    { topic: 'Modules & Packages', text: 'What is pip in Python?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'A compiler' }, { label: 'B', text: 'A package manager' }, { label: 'C', text: 'A debugger' }, { label: 'D', text: 'An IDE' }], correctAnswers: ['B'], explanation: 'pip is the package installer for Python.' },
    { topic: 'Error Handling', text: 'Which block is used to handle exceptions in Python?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'catch' }, { label: 'B', text: 'except' }, { label: 'C', text: 'handle' }, { label: 'D', text: 'error' }], correctAnswers: ['B'], explanation: 'The except block handles exceptions in Python.' },
    { topic: 'Error Handling', text: 'What is the output of: print(10 / 0)?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: '0' }, { label: 'B', text: 'Infinity' }, { label: 'C', text: 'ZeroDivisionError' }, { label: 'D', text: 'None' }], correctAnswers: ['C'], explanation: 'Dividing by zero raises a ZeroDivisionError.' },
    { topic: 'Error Handling', text: 'The "finally" block always executes regardless of exceptions.', type: 'TRUE_FALSE', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['A'], explanation: 'The finally block always executes.' },
    { topic: 'Basics & Syntax', text: 'What is the output of: print("Hello" * 3)?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'HelloHelloHello' }, { label: 'B', text: 'Hello3' }, { label: 'C', text: 'Hello Hello Hello' }, { label: 'D', text: 'Error' }], correctAnswers: ['A'], explanation: 'String multiplication repeats the string.' },
    { topic: 'Data Types', text: 'What does dict.get("key", "default") return if "key" is missing?', type: 'MCQ', difficulty: 'HARD', marks: 3, options: [{ label: 'A', text: 'None' }, { label: 'B', text: 'KeyError' }, { label: 'C', text: '"default"' }, { label: 'D', text: '0' }], correctAnswers: ['C'], explanation: 'dict.get() returns the default value if key is not found.' },
    { topic: 'OOP', text: 'What is multiple inheritance?', type: 'MCQ', difficulty: 'HARD', marks: 3, options: [{ label: 'A', text: 'A class inheriting from one class' }, { label: 'B', text: 'A class inheriting from multiple classes' }, { label: 'C', text: 'Multiple objects of one class' }, { label: 'D', text: 'Multiple methods in one class' }], correctAnswers: ['B'], explanation: 'Multiple inheritance means a class inherits from more than one parent class.' },
  ];

  for (const q of pythonQs) { await createQ('Python', q.topic, q); }
  console.log(`✓ Python: ${pythonQs.length} questions`);

  // ── JAVA (22 questions) ────────────────────────────────────────
  const javaQs = [
    { topic: 'Basics & Syntax', text: 'Java is a platform-independent language.', type: 'TRUE_FALSE', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['A'], explanation: 'Java compiles to bytecode that runs on JVM, making it platform-independent.' },
    { topic: 'Basics & Syntax', text: 'What is the entry point of a Java program?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'start()' }, { label: 'B', text: 'main()' }, { label: 'C', text: 'run()' }, { label: 'D', text: 'init()' }], correctAnswers: ['B'], explanation: 'public static void main(String[] args) is the entry point.' },
    { topic: 'Basics & Syntax', text: 'Which company originally developed Java?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'Microsoft' }, { label: 'B', text: 'Apple' }, { label: 'C', text: 'Sun Microsystems' }, { label: 'D', text: 'Google' }], correctAnswers: ['C'], explanation: 'Java was developed by Sun Microsystems (now Oracle).' },
    { topic: 'Data Types', text: 'What is the size of int in Java?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: '2 bytes' }, { label: 'B', text: '4 bytes' }, { label: 'C', text: '8 bytes' }, { label: 'D', text: 'Depends on system' }], correctAnswers: ['B'], explanation: 'int in Java is always 4 bytes (32 bits).' },
    { topic: 'Data Types', text: 'Which are primitive data types in Java?', type: 'MSQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'int' }, { label: 'B', text: 'String' }, { label: 'C', text: 'boolean' }, { label: 'D', text: 'double' }, { label: 'E', text: 'Array' }], correctAnswers: ['A', 'C', 'D'], explanation: 'int, boolean, double are primitive. String and Array are reference types.' },
    { topic: 'Control Flow', text: 'Which statement is used for multi-way branching in Java?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'if-else' }, { label: 'B', text: 'switch' }, { label: 'C', text: 'for' }, { label: 'D', text: 'while' }], correctAnswers: ['B'], explanation: 'switch statement is used for multi-way branching.' },
    { topic: 'Control Flow', text: 'What is the output of: for(int i=0; i<5; i++) if(i==3) break; System.out.println(i);', type: 'MCQ', difficulty: 'HARD', marks: 3, options: [{ label: 'A', text: '3' }, { label: 'B', text: '5' }, { label: 'C', text: '4' }, { label: 'D', text: 'Compilation Error' }], correctAnswers: ['D'], explanation: 'Variable i is not accessible outside the for loop scope.' },
    { topic: 'OOP', text: 'Java supports multiple inheritance through classes.', type: 'TRUE_FALSE', difficulty: 'MODERATE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['B'], explanation: 'Java supports multiple inheritance only through interfaces, not classes.' },
    { topic: 'OOP', text: 'What is the purpose of the "final" keyword?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'Ends a program' }, { label: 'B', text: 'Prevents modification' }, { label: 'C', text: 'Declares a variable' }, { label: 'D', text: 'Imports a class' }], correctAnswers: ['B'], explanation: 'final prevents variable reassignment, method overriding, and class inheritance.' },
    { topic: 'OOP', text: 'Which keyword creates an object in Java?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'create' }, { label: 'B', text: 'new' }, { label: 'C', text: 'object' }, { label: 'D', text: 'make' }], correctAnswers: ['B'], explanation: 'The new keyword creates objects in Java.' },
    { topic: 'OOP', text: 'What is polymorphism?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'Data hiding' }, { label: 'B', text: 'One interface, many forms' }, { label: 'C', text: 'Code reuse' }, { label: 'D', text: 'Memory management' }], correctAnswers: ['B'], explanation: 'Polymorphism means one interface can have multiple implementations.' },
    { topic: 'Collections', text: 'Which collection does not allow duplicate elements?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'ArrayList' }, { label: 'B', text: 'LinkedList' }, { label: 'C', text: 'HashSet' }, { label: 'D', text: 'Vector' }], correctAnswers: ['C'], explanation: 'HashSet does not allow duplicate elements.' },
    { topic: 'Collections', text: 'What is the difference between ArrayList and LinkedList?', type: 'MCQ', difficulty: 'HARD', marks: 3, options: [{ label: 'A', text: 'ArrayList uses dynamic array, LinkedList uses doubly linked list' }, { label: 'B', text: 'They are the same' }, { label: 'C', text: 'ArrayList is thread-safe' }, { label: 'D', text: 'LinkedList is faster for random access' }], correctAnswers: ['A'], explanation: 'ArrayList uses dynamic arrays; LinkedList uses doubly linked lists.' },
    { topic: 'Exception Handling', text: 'Which keyword is used to throw an exception manually?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'throws' }, { label: 'B', text: 'throw' }, { label: 'C', text: 'catch' }, { label: 'D', text: 'raise' }], correctAnswers: ['B'], explanation: 'throw is used to throw an exception manually.' },
    { topic: 'Exception Handling', text: 'What is the difference between checked and unchecked exceptions?', type: 'MCQ', difficulty: 'HARD', marks: 3, options: [{ label: 'A', text: 'Checked are compile-time, unchecked are runtime' }, { label: 'B', text: 'They are the same' }, { label: 'C', text: 'Unchecked are compile-time' }, { label: 'D', text: 'Checked cannot be caught' }], correctAnswers: ['A'], explanation: 'Checked exceptions are verified at compile time; unchecked at runtime.' },
    { topic: 'Multithreading', text: 'Which interface is used to create a thread in Java?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'Serializable' }, { label: 'B', text: 'Runnable' }, { label: 'C', text: 'Comparable' }, { label: 'D', text: 'Cloneable' }], correctAnswers: ['B'], explanation: 'The Runnable interface is used to create threads.' },
    { topic: 'Multithreading', text: 'What does synchronized keyword do?', type: 'MCQ', difficulty: 'HARD', marks: 3, options: [{ label: 'A', text: 'Makes code faster' }, { label: 'B', text: 'Prevents thread interference' }, { label: 'C', text: 'Creates new threads' }, { label: 'D', text: 'Stops all threads' }], correctAnswers: ['B'], explanation: 'synchronized prevents multiple threads from accessing shared resources simultaneously.' },
    { topic: 'JDBC', text: 'What does JDBC stand for?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'Java Database Connectivity' }, { label: 'B', text: 'Java Data Base Connection' }, { label: 'C', text: 'Java Dynamic Base Connector' }, { label: 'D', text: 'Java Database Controller' }], correctAnswers: ['A'], explanation: 'JDBC = Java Database Connectivity.' },
    { topic: 'OOP', text: 'An abstract class can have constructors.', type: 'TRUE_FALSE', difficulty: 'HARD', marks: 2, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['A'], explanation: 'Abstract classes can have constructors, called when subclass objects are created.' },
    { topic: 'Basics & Syntax', text: 'What is JVM?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'Java Variable Machine' }, { label: 'B', text: 'Java Virtual Machine' }, { label: 'C', text: 'Java Visual Machine' }, { label: 'D', text: 'Java Verified Machine' }], correctAnswers: ['B'], explanation: 'JVM = Java Virtual Machine, which executes Java bytecode.' },
    { topic: 'Collections', text: 'HashMap allows null keys.', type: 'TRUE_FALSE', difficulty: 'MODERATE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['A'], explanation: 'HashMap allows one null key and multiple null values.' },
    { topic: 'Data Types', text: 'What is autoboxing in Java?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'Converting primitive to wrapper class automatically' }, { label: 'B', text: 'Boxing a variable' }, { label: 'C', text: 'Creating arrays automatically' }, { label: 'D', text: 'Memory allocation' }], correctAnswers: ['A'], explanation: 'Autoboxing converts primitives to their wrapper classes automatically (int → Integer).' },
  ];
  for (const q of javaQs) { await createQ('Java', q.topic, q); }
  console.log(`✓ Java: ${javaQs.length} questions`);

  // ── JAVASCRIPT (22 questions) ──────────────────────────────────
  const jsQs = [
    { topic: 'Basics & Syntax', text: 'Which keyword declares a block-scoped variable?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'var' }, { label: 'B', text: 'let' }, { label: 'C', text: 'const' }, { label: 'D', text: 'Both B and C' }], correctAnswers: ['D'], explanation: 'Both let and const are block-scoped.' },
    { topic: 'Basics & Syntax', text: 'What is the output of typeof undefined?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: '"null"' }, { label: 'B', text: '"undefined"' }, { label: 'C', text: '"object"' }, { label: 'D', text: '"void"' }], correctAnswers: ['B'], explanation: 'typeof undefined returns "undefined".' },
    { topic: 'Basics & Syntax', text: 'JavaScript is a statically typed language.', type: 'TRUE_FALSE', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['B'], explanation: 'JavaScript is dynamically typed.' },
    { topic: 'Basics & Syntax', text: 'What is the output of: console.log(typeof null)?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: '"null"' }, { label: 'B', text: '"undefined"' }, { label: 'C', text: '"object"' }, { label: 'D', text: '"boolean"' }], correctAnswers: ['C'], explanation: 'typeof null returns "object" — a well-known JavaScript quirk.' },
    { topic: 'DOM Manipulation', text: 'Which method selects an element by ID?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'querySelector()' }, { label: 'B', text: 'getElementById()' }, { label: 'C', text: 'getElement()' }, { label: 'D', text: 'selectById()' }], correctAnswers: ['B'], explanation: 'document.getElementById() selects an element by its ID.' },
    { topic: 'DOM Manipulation', text: 'What does innerHTML do?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'Gets/sets HTML content' }, { label: 'B', text: 'Gets/sets CSS' }, { label: 'C', text: 'Deletes an element' }, { label: 'D', text: 'Creates an element' }], correctAnswers: ['A'], explanation: 'innerHTML gets or sets the HTML content of an element.' },
    { topic: 'Functions & Closures', text: 'What is a closure in JavaScript?', type: 'MCQ', difficulty: 'HARD', marks: 3, options: [{ label: 'A', text: 'A function without parameters' }, { label: 'B', text: 'A function that remembers its lexical scope' }, { label: 'C', text: 'A loop inside a function' }, { label: 'D', text: 'An error handler' }], correctAnswers: ['B'], explanation: 'A closure is a function that retains access to its outer scope variables.' },
    { topic: 'Functions & Closures', text: 'Arrow functions have their own "this" binding.', type: 'TRUE_FALSE', difficulty: 'MODERATE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['B'], explanation: 'Arrow functions do NOT have their own this; they inherit from the parent scope.' },
    { topic: 'ES6+ Features', text: 'Which ES6 feature allows destructuring?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'const {a, b} = obj' }, { label: 'B', text: 'var a = obj.a' }, { label: 'C', text: 'let a = new obj()' }, { label: 'D', text: 'import a from obj' }], correctAnswers: ['A'], explanation: 'Destructuring assignment extracts values from objects/arrays.' },
    { topic: 'ES6+ Features', text: 'What is the spread operator?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: '...' }, { label: 'B', text: '::' }, { label: 'C', text: '=>' }, { label: 'D', text: '**' }], correctAnswers: ['A'], explanation: 'The spread operator (...) expands arrays/objects.' },
    { topic: 'ES6+ Features', text: 'Which are valid ES6+ features?', type: 'MSQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'Template literals' }, { label: 'B', text: 'Promises' }, { label: 'C', text: 'Classes' }, { label: 'D', text: 'goto statement' }], correctAnswers: ['A', 'B', 'C'], explanation: 'Template literals, Promises, and Classes are ES6+ features. goto does not exist in JS.' },
    { topic: 'Async Programming', text: 'What does async/await do?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'Makes code synchronous' }, { label: 'B', text: 'Handles promises with cleaner syntax' }, { label: 'C', text: 'Creates new threads' }, { label: 'D', text: 'Speeds up execution' }], correctAnswers: ['B'], explanation: 'async/await provides cleaner syntax for handling promises.' },
    { topic: 'Async Programming', text: 'What is a Promise in JavaScript?', type: 'MCQ', difficulty: 'HARD', marks: 3, options: [{ label: 'A', text: 'A synchronous operation' }, { label: 'B', text: 'An object representing eventual completion/failure of an async operation' }, { label: 'C', text: 'A type of loop' }, { label: 'D', text: 'A variable declaration' }], correctAnswers: ['B'], explanation: 'A Promise represents an asynchronous operation that will eventually complete or fail.' },
    { topic: 'Error Handling', text: 'Which statement is used for error handling in JavaScript?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'try-catch' }, { label: 'B', text: 'if-else' }, { label: 'C', text: 'switch-case' }, { label: 'D', text: 'for-in' }], correctAnswers: ['A'], explanation: 'try-catch is used for error handling in JavaScript.' },
    { topic: 'Objects & Arrays', text: 'What is the output of: [1,2,3].map(x => x * 2)?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: '[2,4,6]' }, { label: 'B', text: '[1,2,3]' }, { label: 'C', text: '6' }, { label: 'D', text: '[1,4,9]' }], correctAnswers: ['A'], explanation: 'map() creates a new array by applying the function to each element.' },
    { topic: 'Objects & Arrays', text: 'Which method adds an element to the end of an array?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'push()' }, { label: 'B', text: 'pop()' }, { label: 'C', text: 'shift()' }, { label: 'D', text: 'unshift()' }], correctAnswers: ['A'], explanation: 'push() adds to the end; pop() removes from the end.' },
    { topic: 'Basics & Syntax', text: 'What is the output of: console.log(0.1 + 0.2 === 0.3)?', type: 'MCQ', difficulty: 'HARD', marks: 3, options: [{ label: 'A', text: 'true' }, { label: 'B', text: 'false' }, { label: 'C', text: 'undefined' }, { label: 'D', text: 'Error' }], correctAnswers: ['B'], explanation: 'Due to floating-point precision, 0.1 + 0.2 = 0.30000000000000004, not exactly 0.3.' },
    { topic: 'Objects & Arrays', text: 'JSON.parse() converts a JSON string to a JavaScript object.', type: 'TRUE_FALSE', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['A'], explanation: 'JSON.parse() parses a JSON string into a JavaScript object.' },
    { topic: 'ES6+ Features', text: 'What is a Symbol in JavaScript?', type: 'MCQ', difficulty: 'HARD', marks: 3, options: [{ label: 'A', text: 'A primitive type for unique identifiers' }, { label: 'B', text: 'A special character' }, { label: 'C', text: 'A type of array' }, { label: 'D', text: 'A CSS selector' }], correctAnswers: ['A'], explanation: 'Symbol is a primitive type that creates unique, immutable identifiers.' },
    { topic: 'Functions & Closures', text: 'What is hoisting in JavaScript?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'Moving declarations to the top of scope' }, { label: 'B', text: 'Removing unused variables' }, { label: 'C', text: 'Compressing code' }, { label: 'D', text: 'Error checking' }], correctAnswers: ['A'], explanation: 'Hoisting moves variable and function declarations to the top of their scope.' },
    { topic: 'Async Programming', text: 'What is the event loop?', type: 'MCQ', difficulty: 'HARD', marks: 3, options: [{ label: 'A', text: 'A type of for loop' }, { label: 'B', text: 'Mechanism that handles async callbacks in JS runtime' }, { label: 'C', text: 'A DOM event' }, { label: 'D', text: 'A debugging tool' }], correctAnswers: ['B'], explanation: 'The event loop handles async callbacks by checking the callback queue and executing them.' },
    { topic: 'DOM Manipulation', text: 'addEventListener() can attach multiple handlers to one event.', type: 'TRUE_FALSE', difficulty: 'MODERATE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['A'], explanation: 'addEventListener allows multiple handlers for the same event on the same element.' },
  ];
  for (const q of jsQs) { await createQ('JavaScript', q.topic, q); }
  console.log(`✓ JavaScript: ${jsQs.length} questions`);

  // ── C PROGRAMMING (20 questions) ───────────────────────────────
  const cQs = [
    { topic: 'Basics & Syntax', text: 'C is a compiled language.', type: 'TRUE_FALSE', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['A'], explanation: 'C code is compiled to machine code before execution.' },
    { topic: 'Basics & Syntax', text: 'Which header file is required for printf()?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'stdlib.h' }, { label: 'B', text: 'stdio.h' }, { label: 'C', text: 'string.h' }, { label: 'D', text: 'math.h' }], correctAnswers: ['B'], explanation: 'stdio.h provides standard I/O functions like printf and scanf.' },
    { topic: 'Data Types', text: 'What is the size of char in C?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: '1 byte' }, { label: 'B', text: '2 bytes' }, { label: 'C', text: '4 bytes' }, { label: 'D', text: '8 bytes' }], correctAnswers: ['A'], explanation: 'char is always 1 byte in C.' },
    { topic: 'Data Types', text: 'Which format specifier is used for float?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: '%d' }, { label: 'B', text: '%f' }, { label: 'C', text: '%c' }, { label: 'D', text: '%s' }], correctAnswers: ['B'], explanation: '%f is the format specifier for float.' },
    { topic: 'Pointers', text: 'What does * operator do in pointer context?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'Multiplication' }, { label: 'B', text: 'Dereferences a pointer' }, { label: 'C', text: 'Address of' }, { label: 'D', text: 'Comment' }], correctAnswers: ['B'], explanation: '* dereferences a pointer to access the value at the address.' },
    { topic: 'Pointers', text: 'What does & operator return?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'Value of variable' }, { label: 'B', text: 'Address of variable' }, { label: 'C', text: 'Size of variable' }, { label: 'D', text: 'Type of variable' }], correctAnswers: ['B'], explanation: '& returns the memory address of a variable.' },
    { topic: 'Pointers', text: 'A pointer can point to NULL.', type: 'TRUE_FALSE', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['A'], explanation: 'NULL is a valid pointer value indicating it points to nothing.' },
    { topic: 'Arrays & Strings', text: 'Array indexing in C starts from?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: '0' }, { label: 'B', text: '1' }, { label: 'C', text: '-1' }, { label: 'D', text: 'Any value' }], correctAnswers: ['A'], explanation: 'Arrays in C are zero-indexed.' },
    { topic: 'Arrays & Strings', text: 'Which function compares two strings in C?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'strcpy()' }, { label: 'B', text: 'strcmp()' }, { label: 'C', text: 'strlen()' }, { label: 'D', text: 'strcat()' }], correctAnswers: ['B'], explanation: 'strcmp() compares two strings and returns 0 if equal.' },
    { topic: 'Structures', text: 'What keyword is used to define a structure?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'class' }, { label: 'B', text: 'struct' }, { label: 'C', text: 'type' }, { label: 'D', text: 'record' }], correctAnswers: ['B'], explanation: 'struct keyword defines a structure in C.' },
    { topic: 'Structures', text: 'Structures can contain functions in C.', type: 'TRUE_FALSE', difficulty: 'MODERATE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['B'], explanation: 'C structures can only contain data members, not functions.' },
    { topic: 'File I/O', text: 'Which function opens a file in C?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'fopen()' }, { label: 'B', text: 'open()' }, { label: 'C', text: 'file()' }, { label: 'D', text: 'read()' }], correctAnswers: ['A'], explanation: 'fopen() is used to open files in C.' },
    { topic: 'File I/O', text: 'Which function closes a file?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'fclose()' }, { label: 'B', text: 'close()' }, { label: 'C', text: 'end()' }, { label: 'D', text: 'stop()' }], correctAnswers: ['A'], explanation: 'fclose() closes an open file.' },
    { topic: 'Memory Management', text: 'Which function allocates memory dynamically?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'alloc()' }, { label: 'B', text: 'malloc()' }, { label: 'C', text: 'new' }, { label: 'D', text: 'create()' }], correctAnswers: ['B'], explanation: 'malloc() allocates dynamic memory from the heap.' },
    { topic: 'Memory Management', text: 'Which function frees dynamically allocated memory?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'delete()' }, { label: 'B', text: 'free()' }, { label: 'C', text: 'remove()' }, { label: 'D', text: 'dealloc()' }], correctAnswers: ['B'], explanation: 'free() releases memory allocated by malloc/calloc.' },
    { topic: 'Memory Management', text: 'Memory leak occurs when allocated memory is not freed.', type: 'TRUE_FALSE', difficulty: 'MODERATE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['A'], explanation: 'A memory leak happens when dynamically allocated memory is not freed.' },
    { topic: 'Pointers', text: 'What is a dangling pointer?', type: 'MCQ', difficulty: 'HARD', marks: 3, options: [{ label: 'A', text: 'Pointer to NULL' }, { label: 'B', text: 'Pointer to freed memory' }, { label: 'C', text: 'Pointer to array' }, { label: 'D', text: 'Uninitialized pointer' }], correctAnswers: ['B'], explanation: 'A dangling pointer points to memory that has been freed/deallocated.' },
    { topic: 'Basics & Syntax', text: 'Which operator is used for comments in C?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: '#' }, { label: 'B', text: '//' }, { label: 'C', text: '--' }, { label: 'D', text: '**' }], correctAnswers: ['B'], explanation: '// for single-line comments, /* */ for multi-line.' },
    { topic: 'Data Types', text: 'What is the range of unsigned int (32-bit)?', type: 'MCQ', difficulty: 'HARD', marks: 3, options: [{ label: 'A', text: '0 to 65535' }, { label: 'B', text: '0 to 4294967295' }, { label: 'C', text: '-2^31 to 2^31-1' }, { label: 'D', text: '0 to 2^16' }], correctAnswers: ['B'], explanation: 'Unsigned 32-bit int ranges from 0 to 2^32 - 1 = 4294967295.' },
    { topic: 'Arrays & Strings', text: 'Strings in C are terminated by?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: '\\n' }, { label: 'B', text: '\\0' }, { label: 'C', text: '\\t' }, { label: 'D', text: 'EOF' }], correctAnswers: ['B'], explanation: 'C strings are null-terminated with \\0.' },
  ];
  for (const q of cQs) { await createQ('C Programming', q.topic, q); }
  console.log(`✓ C Programming: ${cQs.length} questions`);

  // ── SQL (18 questions) ─────────────────────────────────────────
  const sqlQs = [
    { topic: 'Basic Queries', text: 'Which command retrieves data from a table?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'GET' }, { label: 'B', text: 'SELECT' }, { label: 'C', text: 'FETCH' }, { label: 'D', text: 'READ' }], correctAnswers: ['B'], explanation: 'SELECT retrieves data from tables.' },
    { topic: 'Basic Queries', text: 'Which clause filters rows?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'ORDER BY' }, { label: 'B', text: 'GROUP BY' }, { label: 'C', text: 'WHERE' }, { label: 'D', text: 'HAVING' }], correctAnswers: ['C'], explanation: 'WHERE filters rows based on conditions.' },
    { topic: 'Basic Queries', text: 'SELECT * FROM table returns all columns.', type: 'TRUE_FALSE', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['A'], explanation: '* is a wildcard that selects all columns.' },
    { topic: 'Joins', text: 'Which JOIN returns only matching rows from both tables?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'LEFT JOIN' }, { label: 'B', text: 'RIGHT JOIN' }, { label: 'C', text: 'INNER JOIN' }, { label: 'D', text: 'FULL JOIN' }], correctAnswers: ['C'], explanation: 'INNER JOIN returns only rows with matches in both tables.' },
    { topic: 'Joins', text: 'LEFT JOIN includes all rows from the left table.', type: 'TRUE_FALSE', difficulty: 'MODERATE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['A'], explanation: 'LEFT JOIN returns all rows from the left table plus matches from the right.' },
    { topic: 'Aggregations', text: 'Which function counts the number of rows?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'SUM()' }, { label: 'B', text: 'COUNT()' }, { label: 'C', text: 'TOTAL()' }, { label: 'D', text: 'NUM()' }], correctAnswers: ['B'], explanation: 'COUNT() returns the number of rows.' },
    { topic: 'Aggregations', text: 'Which are valid aggregate functions?', type: 'MSQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'SUM' }, { label: 'B', text: 'AVG' }, { label: 'C', text: 'MAX' }, { label: 'D', text: 'CONCAT' }], correctAnswers: ['A', 'B', 'C'], explanation: 'SUM, AVG, MAX are aggregate functions. CONCAT is a string function.' },
    { topic: 'Subqueries', text: 'A subquery is a query inside another query.', type: 'TRUE_FALSE', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['A'], explanation: 'A subquery (nested query) is embedded within another SQL query.' },
    { topic: 'DDL & DML', text: 'Which command creates a new table?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'INSERT' }, { label: 'B', text: 'CREATE' }, { label: 'C', text: 'MAKE' }, { label: 'D', text: 'NEW' }], correctAnswers: ['B'], explanation: 'CREATE TABLE creates a new table.' },
    { topic: 'DDL & DML', text: 'Which command modifies existing data?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'INSERT' }, { label: 'B', text: 'SELECT' }, { label: 'C', text: 'UPDATE' }, { label: 'D', text: 'CREATE' }], correctAnswers: ['C'], explanation: 'UPDATE modifies existing records.' },
    { topic: 'DDL & DML', text: 'DROP TABLE removes the table structure and data.', type: 'TRUE_FALSE', difficulty: 'MODERATE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['A'], explanation: 'DROP TABLE removes both the structure and all data permanently.' },
    { topic: 'Indexes & Views', text: 'What is the purpose of an index?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'Stores backup data' }, { label: 'B', text: 'Speeds up query execution' }, { label: 'C', text: 'Encrypts data' }, { label: 'D', text: 'Compresses tables' }], correctAnswers: ['B'], explanation: 'Indexes speed up data retrieval by creating efficient lookup structures.' },
    { topic: 'Indexes & Views', text: 'A view is a virtual table based on a query.', type: 'TRUE_FALSE', difficulty: 'MODERATE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['A'], explanation: 'A view is a virtual table created from a SELECT query.' },
    { topic: 'Normalization', text: 'What is the purpose of normalization?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'Increase data redundancy' }, { label: 'B', text: 'Reduce data redundancy' }, { label: 'C', text: 'Delete data' }, { label: 'D', text: 'Encrypt data' }], correctAnswers: ['B'], explanation: 'Normalization reduces data redundancy and improves data integrity.' },
    { topic: 'Normalization', text: 'How many normal forms are commonly used?', type: 'MCQ', difficulty: 'HARD', marks: 3, options: [{ label: 'A', text: '2' }, { label: 'B', text: '3' }, { label: 'C', text: '5' }, { label: 'D', text: '7' }], correctAnswers: ['C'], explanation: 'There are 5 commonly discussed normal forms (1NF through 5NF), though 1NF-3NF are most used.' },
    { topic: 'Joins', text: 'CROSS JOIN produces the Cartesian product of two tables.', type: 'TRUE_FALSE', difficulty: 'HARD', marks: 2, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['A'], explanation: 'CROSS JOIN combines every row from table A with every row from table B.' },
    { topic: 'Basic Queries', text: 'DISTINCT removes duplicate rows from results.', type: 'TRUE_FALSE', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['A'], explanation: 'SELECT DISTINCT removes duplicate rows.' },
    { topic: 'Aggregations', text: 'GROUP BY must be used with aggregate functions.', type: 'TRUE_FALSE', difficulty: 'MODERATE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['A'], explanation: 'GROUP BY groups rows for aggregate functions like SUM, COUNT, AVG.' },
  ];
  for (const q of sqlQs) { await createQ('SQL', q.topic, q); }
  console.log(`✓ SQL: ${sqlQs.length} questions`);

  // ── HTML & CSS (15 questions) ──────────────────────────────────
  const htmlQs = [
    { topic: 'HTML Basics', text: 'What does HTML stand for?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'Hyper Text Markup Language' }, { label: 'B', text: 'High Tech Modern Language' }, { label: 'C', text: 'Home Tool Markup Language' }, { label: 'D', text: 'Hyper Transfer ML' }], correctAnswers: ['A'], explanation: 'HTML = Hyper Text Markup Language.' },
    { topic: 'HTML Basics', text: 'Which tag creates a paragraph?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: '<div>' }, { label: 'B', text: '<p>' }, { label: 'C', text: '<span>' }, { label: 'D', text: '<br>' }], correctAnswers: ['B'], explanation: '<p> creates a paragraph element.' },
    { topic: 'HTML Basics', text: '<img> is a self-closing tag.', type: 'TRUE_FALSE', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['A'], explanation: '<img> does not need a closing tag.' },
    { topic: 'Forms & Tables', text: 'Which attribute makes a form field required?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'mandatory' }, { label: 'B', text: 'required' }, { label: 'C', text: 'needed' }, { label: 'D', text: 'must' }], correctAnswers: ['B'], explanation: 'The required attribute makes a form field mandatory.' },
    { topic: 'Forms & Tables', text: 'Which tag creates a table row?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: '<td>' }, { label: 'B', text: '<tr>' }, { label: 'C', text: '<th>' }, { label: 'D', text: '<table>' }], correctAnswers: ['B'], explanation: '<tr> defines a table row.' },
    { topic: 'CSS Selectors', text: 'Which symbol selects a class in CSS?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: '#' }, { label: 'B', text: '.' }, { label: 'C', text: '@' }, { label: 'D', text: '&' }], correctAnswers: ['B'], explanation: '. (dot) selects elements by class name.' },
    { topic: 'CSS Selectors', text: '#id selects by ID in CSS.', type: 'TRUE_FALSE', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['A'], explanation: '# selects elements by their ID attribute.' },
    { topic: 'Box Model & Layout', text: 'What are the components of the CSS box model?', type: 'MSQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'Content' }, { label: 'B', text: 'Padding' }, { label: 'C', text: 'Border' }, { label: 'D', text: 'Margin' }, { label: 'E', text: 'Shadow' }], correctAnswers: ['A', 'B', 'C', 'D'], explanation: 'Box model: content, padding, border, margin. Shadow is not part of it.' },
    { topic: 'Box Model & Layout', text: 'What does display: none do?', type: 'MCQ', difficulty: 'SIMPLE', marks: 1, options: [{ label: 'A', text: 'Hides but keeps space' }, { label: 'B', text: 'Removes from layout completely' }, { label: 'C', text: 'Makes transparent' }, { label: 'D', text: 'Moves off-screen' }], correctAnswers: ['B'], explanation: 'display: none removes the element from the layout entirely.' },
    { topic: 'Flexbox & Grid', text: 'Which property makes a container a flex container?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'display: block' }, { label: 'B', text: 'display: flex' }, { label: 'C', text: 'display: inline' }, { label: 'D', text: 'display: table' }], correctAnswers: ['B'], explanation: 'display: flex makes an element a flex container.' },
    { topic: 'Flexbox & Grid', text: 'justify-content aligns items along the main axis.', type: 'TRUE_FALSE', difficulty: 'MODERATE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['A'], explanation: 'justify-content controls alignment along the main axis in flexbox.' },
    { topic: 'Responsive Design', text: 'What are media queries used for?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'Database queries' }, { label: 'B', text: 'Applying styles based on screen size' }, { label: 'C', text: 'JavaScript functions' }, { label: 'D', text: 'Server requests' }], correctAnswers: ['B'], explanation: 'Media queries apply CSS rules based on device characteristics like screen width.' },
    { topic: 'Responsive Design', text: 'Which meta tag enables responsive design?', type: 'MCQ', difficulty: 'MODERATE', marks: 2, options: [{ label: 'A', text: 'meta charset' }, { label: 'B', text: 'meta viewport' }, { label: 'C', text: 'meta description' }, { label: 'D', text: 'meta keywords' }], correctAnswers: ['B'], explanation: 'meta viewport controls the layout viewport on mobile browsers.' },
    { topic: 'CSS Selectors', text: 'CSS specificity order (highest to lowest) is: inline > ID > class > element.', type: 'TRUE_FALSE', difficulty: 'HARD', marks: 2, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['A'], explanation: 'Inline styles have highest specificity, followed by ID, class, then element selectors.' },
    { topic: 'Flexbox & Grid', text: 'CSS Grid is two-dimensional while Flexbox is one-dimensional.', type: 'TRUE_FALSE', difficulty: 'MODERATE', marks: 1, options: [{ label: 'A', text: 'True' }, { label: 'B', text: 'False' }], correctAnswers: ['A'], explanation: 'Grid handles both rows and columns; Flexbox handles one direction at a time.' },
  ];
  for (const q of htmlQs) { await createQ('HTML & CSS', q.topic, q); }
  console.log(`✓ HTML & CSS: ${htmlQs.length} questions`);

  const totalQuestions = pythonQs.length + javaQs.length + jsQs.length + cQs.length + sqlQs.length + htmlQs.length;
  console.log(`\n✓ Total questions: ${totalQuestions}`);

  // ═══════════════════════════════════════════════════════════════════
  // TESTS (8 tests)
  // ═══════════════════════════════════════════════════════════════════

  async function createTest(config: { title: string; subjectName: string; type: 'OFFICIAL' | 'PRACTICE'; duration: number; negativeMarking: boolean; negativeMarksValue: number; enableCertificate: boolean; passingPercentage: number; questionCount: number }) {
    const questions = await prisma.question.findMany({
      where: { subjectId: subjects[config.subjectName] },
      take: config.questionCount,
      select: { id: true, marks: true },
    });
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    return prisma.test.create({
      data: {
        title: config.title,
        subjectId: subjects[config.subjectName],
        type: config.type,
        status: 'PUBLISHED',
        instructions: `This is a ${config.type.toLowerCase()} test for ${config.subjectName}. Answer all questions carefully.${config.negativeMarking ? ' Negative marking applies.' : ''}`,
        isTimeBased: true,
        duration: config.duration,
        autoSubmitOnTimeout: true,
        attemptLimit: config.type === 'PRACTICE' ? null : 2,
        marksPerQuestion: 1,
        negativeMarking: config.negativeMarking,
        negativeMarksValue: config.negativeMarksValue,
        questionsPerPage: 1,
        allowReview: true,
        showResultImmediately: true,
        enableCertificate: config.enableCertificate,
        passingPercentage: config.passingPercentage,
        totalMarks,
        questions: { create: questions.map((q, i) => ({ questionId: q.id, orderIndex: i + 1 })) },
      },
    });
  }

  const tests: any[] = [];
  tests.push(await createTest({ title: 'Python Fundamentals Test', subjectName: 'Python', type: 'OFFICIAL', duration: 30, negativeMarking: true, negativeMarksValue: 0.25, enableCertificate: true, passingPercentage: 60, questionCount: 15 }));
  tests.push(await createTest({ title: 'Java Core Concepts', subjectName: 'Java', type: 'OFFICIAL', duration: 35, negativeMarking: true, negativeMarksValue: 0.25, enableCertificate: true, passingPercentage: 60, questionCount: 15 }));
  tests.push(await createTest({ title: 'JavaScript Essentials', subjectName: 'JavaScript', type: 'OFFICIAL', duration: 30, negativeMarking: false, negativeMarksValue: 0, enableCertificate: true, passingPercentage: 50, questionCount: 15 }));
  tests.push(await createTest({ title: 'C Programming Basics', subjectName: 'C Programming', type: 'OFFICIAL', duration: 25, negativeMarking: true, negativeMarksValue: 0.5, enableCertificate: true, passingPercentage: 60, questionCount: 12 }));
  tests.push(await createTest({ title: 'SQL Mastery Test', subjectName: 'SQL', type: 'OFFICIAL', duration: 25, negativeMarking: false, negativeMarksValue: 0, enableCertificate: true, passingPercentage: 50, questionCount: 12 }));
  tests.push(await createTest({ title: 'HTML & CSS Quiz', subjectName: 'HTML & CSS', type: 'OFFICIAL', duration: 20, negativeMarking: false, negativeMarksValue: 0, enableCertificate: false, passingPercentage: 50, questionCount: 10 }));
  tests.push(await createTest({ title: 'Python Practice Set', subjectName: 'Python', type: 'PRACTICE', duration: 45, negativeMarking: false, negativeMarksValue: 0, enableCertificate: false, passingPercentage: 0, questionCount: 20 }));
  tests.push(await createTest({ title: 'Java Practice Set', subjectName: 'Java', type: 'PRACTICE', duration: 45, negativeMarking: false, negativeMarksValue: 0, enableCertificate: false, passingPercentage: 0, questionCount: 18 }));
  console.log(`✓ ${tests.length} tests created`);

  // ═══════════════════════════════════════════════════════════════════
  // TEST SERIES (2)
  // ═══════════════════════════════════════════════════════════════════

  await prisma.testSeries.create({
    data: {
      name: 'Full Stack Developer Assessment',
      description: 'Complete series covering Python, JavaScript, SQL, and HTML/CSS',
      scoringMethod: 'SUM',
      passingPercentage: 55,
      enableCertificate: true,
      tests: {
        create: [
          { testId: tests[0].id, orderIndex: 1 },
          { testId: tests[2].id, orderIndex: 2 },
          { testId: tests[4].id, orderIndex: 3 },
          { testId: tests[5].id, orderIndex: 4 },
        ],
      },
    },
  });

  await prisma.testSeries.create({
    data: {
      name: 'Backend Developer Track',
      description: 'Java, Python, and SQL assessment series',
      scoringMethod: 'AVERAGE',
      passingPercentage: 60,
      enableCertificate: true,
      tests: {
        create: [
          { testId: tests[0].id, orderIndex: 1 },
          { testId: tests[1].id, orderIndex: 2 },
          { testId: tests[4].id, orderIndex: 3 },
        ],
      },
    },
  });
  console.log('✓ 2 test series created');

  // ═══════════════════════════════════════════════════════════════════
  // BATCHES (3) + Assign students + tests
  // ═══════════════════════════════════════════════════════════════════

  const batch1 = await prisma.batch.create({ data: { name: 'FY BCA 2025', description: 'First Year BCA students' } });
  const batch2 = await prisma.batch.create({ data: { name: 'SY BCA 2025', description: 'Second Year BCA students' } });
  const batch3 = await prisma.batch.create({ data: { name: 'Web Dev Bootcamp', description: 'Full Stack Web Development batch' } });

  // Assign students to batches
  for (let i = 0; i < 5; i++) {
    await prisma.batchStudent.create({ data: { batchId: batch1.id, studentId: students[i].id } });
  }
  for (let i = 3; i < 10; i++) {
    await prisma.batchStudent.create({ data: { batchId: batch2.id, studentId: students[i].id } });
  }
  for (let i = 8; i < 15; i++) {
    await prisma.batchStudent.create({ data: { batchId: batch3.id, studentId: students[i].id } });
  }

  // Assign tests to batches
  for (const test of tests) {
    await prisma.batchTest.create({ data: { batchId: batch1.id, testId: test.id } });
    await prisma.batchTest.create({ data: { batchId: batch2.id, testId: test.id } });
    await prisma.batchTest.create({ data: { batchId: batch3.id, testId: test.id } });
  }
  console.log('✓ 3 batches created with students and tests assigned');

  // ═══════════════════════════════════════════════════════════════════
  // SIMULATE TEST ATTEMPTS (for results, analytics, leaderboard, certificates)
  // ═══════════════════════════════════════════════════════════════════
  console.log('\nSimulating test attempts...');

  for (const test of tests.slice(0, 6)) { // Official tests only
    const testQuestions = await prisma.testQuestion.findMany({
      where: { testId: test.id },
      include: { question: { select: { id: true, correctAnswers: true, marks: true } } },
    });

    // Each student takes the test with varied scores
    for (let si = 0; si < Math.min(students.length, 12); si++) {
      const student = students[si];
      const responses: Record<string, string> = {};
      let score = 0;
      let totalMarks = 0;
      let correct = 0;

      for (const tq of testQuestions) {
        totalMarks += tq.question.marks;
        const correctAns = tq.question.correctAnswers as string[];
        // Simulate: students get 40-90% correct based on their index
        const accuracy = 0.4 + (si % 6) * 0.1 + Math.random() * 0.15;
        if (Math.random() < accuracy) {
          responses[tq.question.id] = correctAns[0];
          score += tq.question.marks;
          correct++;
        } else {
          responses[tq.question.id] = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
          if (test.negativeMarking) score -= test.negativeMarksValue;
        }
      }

      score = Math.max(0, Math.round(score * 100) / 100);
      const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100 * 100) / 100 : 0;
      const timeTaken = Math.floor(test.duration * 60 * (0.4 + Math.random() * 0.5));

      await prisma.testAttempt.create({
        data: {
          testId: test.id,
          studentId: student.id,
          status: 'COMPLETED',
          responses: JSON.stringify(responses),
          score,
          totalMarks,
          percentage,
          timeTaken,
          startedAt: new Date(Date.now() - timeTaken * 1000 - si * 86400000),
          submittedAt: new Date(Date.now() - si * 86400000),
        },
      });
    }
  }
  console.log('✓ Test attempts simulated for all students');

  // ═══════════════════════════════════════════════════════════════════
  // CERTIFICATES (for passing students)
  // ═══════════════════════════════════════════════════════════════════

  const { certificateGenerator } = await import('../src/services/certificates/generator');

  for (const test of tests.slice(0, 5)) {
    if (!test.enableCertificate) continue;
    const passingAttempts = await prisma.testAttempt.findMany({
      where: { testId: test.id, status: 'COMPLETED', percentage: { gte: test.passingPercentage || 0 } },
      include: { student: { select: { id: true, fullName: true } }, test: { include: { subject: true } } },
    });

    for (const attempt of passingAttempts) {
      try {
        const result = await certificateGenerator.generate({
          studentName: attempt.student.fullName,
          testName: test.title,
          subject: attempt.test.subject?.name || '',
          score: attempt.score || 0,
          percentage: attempt.percentage || 0,
          completionDate: attempt.submittedAt || new Date(),
        });

        await prisma.certificate.create({
          data: {
            studentId: attempt.student.id,
            testId: test.id,
            certificateId: result.certificateId,
            filePath: result.filePath,
            score: attempt.score || 0,
            percentage: attempt.percentage || 0,
          },
        });
      } catch {}
    }
  }
  console.log('✓ Certificates generated for passing students');

  // ═══════════════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════

  await prisma.notification.createMany({
    data: [
      { type: 'NEW_REGISTRATION', title: 'New Students Registered', message: '15 students registered for the programming courses.', targetRole: 'ADMIN' },
      { type: 'TEST_AVAILABLE', title: 'New Tests Available', message: 'Python, Java, JavaScript, C, SQL, and HTML/CSS tests are now live.', targetRole: 'STUDENT' },
      { type: 'RESULT_PUBLISHED', title: 'Results Published', message: 'Results for all programming tests have been published.', targetRole: 'STUDENT' },
    ],
  });
  console.log('✓ Notifications created');

  // ═══════════════════════════════════════════════════════════════════
  console.log('\n══════════════════════════════════════════');
  console.log('  SEED COMPLETE');
  console.log('══════════════════════════════════════════');
  console.log(`  Admin: admin@quizora.com / admin@123`);
  console.log(`  Students: rahul@test.com, priya@test.com, etc. / student@123`);
  console.log(`  Subjects: ${Object.keys(subjects).join(', ')}`);
  console.log(`  Questions: ${totalQuestions}`);
  console.log(`  Tests: ${tests.length} (6 official + 2 practice)`);
  console.log(`  Series: 2`);
  console.log(`  Batches: 3`);
  console.log(`  Students: 15`);
  console.log('══════════════════════════════════════════\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
