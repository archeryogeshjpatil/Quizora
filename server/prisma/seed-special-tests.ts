import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient, Difficulty, QuestionType, TestType } from '@prisma/client';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

type QuestionSeed = {
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  options: { label: string; text: string }[];
  correctAnswers: string[];
  explanation: string;
};

function wrapPrompt(title: string, body: string) {
  return `<div><p><strong>${title}</strong></p>${body}</div>`;
}

function formula(text: string) {
  return `<div class="formula">${text}</div>`;
}

function codeBlock(language: string, code: string) {
  return `<pre><code class="language-${language}">${code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')}</code></pre>`;
}

async function ensureSubjectWithTopic(subjectName: string, subjectDescription: string, topicName: string, topicDescription: string) {
  const subject = await prisma.subject.upsert({
    where: { name: subjectName },
    update: { description: subjectDescription },
    create: { name: subjectName, description: subjectDescription },
  });

  const topic = await prisma.topic.upsert({
    where: { subjectId_name: { subjectId: subject.id, name: topicName } },
    update: { description: topicDescription },
    create: { name: topicName, subjectId: subject.id, description: topicDescription },
  });

  return { subject, topic };
}

async function resetTopicData(topicId: string, testTitles: string[]) {
  const tests = await prisma.test.findMany({
    where: { title: { in: testTitles } },
    select: { id: true },
  });

  if (tests.length > 0) {
    await prisma.test.deleteMany({
      where: { id: { in: tests.map((test) => test.id) } },
    });
  }

  await prisma.question.deleteMany({
    where: { topicId },
  });
}

async function createQuestions(subjectId: string, topicId: string, questions: QuestionSeed[]) {
  const created = [];

  for (const question of questions) {
    const item = await prisma.question.create({
      data: {
        subjectId,
        topicId,
        type: question.type,
        difficulty: question.difficulty,
        text: question.text,
        marks: question.marks,
        correctAnswers: question.correctAnswers,
        explanation: question.explanation,
        version: 1,
        options: {
          create: question.options,
        },
      },
      select: {
        id: true,
        marks: true,
      },
    });

    created.push(item);
  }

  return created;
}

async function createPublishedTest(input: {
  title: string;
  subjectId: string;
  topicId: string;
  type: TestType;
  duration: number;
  negativeMarking: boolean;
  negativeMarksValue: number;
  passingPercentage: number;
  enableCertificate?: boolean;
  instructions: string;
  questions: { id: string; marks: number }[];
}) {
  const totalMarks = input.questions.reduce((sum, question) => sum + question.marks, 0);

  return prisma.test.create({
    data: {
      title: input.title,
      subjectId: input.subjectId,
      topicId: input.topicId,
      type: input.type,
      status: 'PUBLISHED',
      instructions: input.instructions,
      isTimeBased: true,
      duration: input.duration,
      autoSubmitOnTimeout: true,
      attemptLimit: input.type === 'PRACTICE' ? null : 2,
      marksPerQuestion: 1,
      negativeMarking: input.negativeMarking,
      negativeMarksValue: input.negativeMarksValue,
      questionsPerPage: 1,
      allowReview: true,
      showResultImmediately: true,
      enableCertificate: input.enableCertificate ?? false,
      passingPercentage: input.passingPercentage,
      totalMarks,
      questions: {
        create: input.questions.map((question, index) => ({
          questionId: question.id,
          orderIndex: index + 1,
        })),
      },
    },
  });
}

async function main() {
  const aptitudeTestTitle = 'Aptitude Master Test - Formula & Symbol Challenge';
  const programmingTestTitle = 'Programming Master Test - Python Java C C++';

  const aptitudeSetup = await ensureSubjectWithTopic(
    'Aptitude',
    'Quantitative aptitude, arithmetic reasoning, algebra, geometry, and logical formula-based questions.',
    'Formula & Symbol Aptitude',
    'Questions focused on formulas, notation, percentages, ratios, logarithms, probability, and geometry symbols.'
  );

  const programmingSetup = await ensureSubjectWithTopic(
    'Programming',
    'Mixed-language programming assessment with Python, Java, C, and C++ code comprehension.',
    'Mixed Programming Snippets',
    'Code-reading and output-prediction questions across Python, Java, C, and C++.'
  );

  await resetTopicData(aptitudeSetup.topic.id, [aptitudeTestTitle]);
  await resetTopicData(programmingSetup.topic.id, [programmingTestTitle]);

  const aptitudeQuestions: QuestionSeed[] = [
    {
      text: wrapPrompt(
        'Profit percentage formula',
        `<p>If cost price = 800 and selling price = 920, profit percentage is calculated using ${formula(
          '\\\\text{Profit %} = \\\\frac{SP - CP}{CP} \\\\times 100'
        )}. What is the answer?</p>`
      ),
      type: 'MCQ',
      difficulty: 'SIMPLE',
      marks: 1,
      options: [
        { label: 'A', text: '12%' },
        { label: 'B', text: '15%' },
        { label: 'C', text: '18%' },
        { label: 'D', text: '20%' },
      ],
      correctAnswers: ['B'],
      explanation: 'Profit = 920 - 800 = 120, so profit % = 120/800 × 100 = 15%.',
    },
    {
      text: wrapPrompt(
        'Simple interest',
        `<p>Use ${formula('SI = \\\\frac{P \\\\times R \\\\times T}{100}')}. If P = 5000, R = 8%, and T = 2 years, what is SI?</p>`
      ),
      type: 'MCQ',
      difficulty: 'SIMPLE',
      marks: 1,
      options: [
        { label: 'A', text: '600' },
        { label: 'B', text: '700' },
        { label: 'C', text: '800' },
        { label: 'D', text: '900' },
      ],
      correctAnswers: ['C'],
      explanation: 'SI = 5000 × 8 × 2 / 100 = 800.',
    },
    {
      text: wrapPrompt(
        'Compound interest growth factor',
        `<p>For annual compounding, amount is ${formula('A = P\\\\left(1 + \\\\frac{R}{100}\\\\right)^n')}. If P = 10000, R = 10, n = 2, what is A?</p>`
      ),
      type: 'MCQ',
      difficulty: 'MODERATE',
      marks: 2,
      options: [
        { label: 'A', text: '11800' },
        { label: 'B', text: '12000' },
        { label: 'C', text: '12100' },
        { label: 'D', text: '12250' },
      ],
      correctAnswers: ['C'],
      explanation: 'A = 10000 × (1.1)^2 = 12100.',
    },
    {
      text: wrapPrompt(
        'Average speed symbol',
        `<p>For two equal distances traveled at 40 km/h and 60 km/h, average speed is ${formula('v_{avg} = \\\\frac{2ab}{a+b}')}. What is the result?</p>`
      ),
      type: 'MCQ',
      difficulty: 'MODERATE',
      marks: 2,
      options: [
        { label: 'A', text: '46 km/h' },
        { label: 'B', text: '48 km/h' },
        { label: 'C', text: '50 km/h' },
        { label: 'D', text: '52 km/h' },
      ],
      correctAnswers: ['B'],
      explanation: '2 × 40 × 60 / (40 + 60) = 4800/100 = 48 km/h.',
    },
    {
      text: wrapPrompt(
        'Quadratic roots notation',
        `<p>For equation x² - 5x + 6 = 0, the roots satisfy ${formula('x = \\\\frac{-b \\\\pm \\\\sqrt{b^2 - 4ac}}{2a}')}. Which pair is correct?</p>`
      ),
      type: 'MCQ',
      difficulty: 'MODERATE',
      marks: 2,
      options: [
        { label: 'A', text: '1 and 6' },
        { label: 'B', text: '2 and 3' },
        { label: 'C', text: '-2 and -3' },
        { label: 'D', text: '0 and 5' },
      ],
      correctAnswers: ['B'],
      explanation: 'x² - 5x + 6 = (x - 2)(x - 3), so roots are 2 and 3.',
    },
    {
      text: wrapPrompt(
        'Ratio and proportion symbol',
        '<p>If a : b = 3 : 5 and b : c = 10 : 7, then a : c equals?</p>'
      ),
      type: 'MCQ',
      difficulty: 'MODERATE',
      marks: 2,
      options: [
        { label: 'A', text: '3 : 7' },
        { label: 'B', text: '6 : 7' },
        { label: 'C', text: '7 : 6' },
        { label: 'D', text: '15 : 7' },
      ],
      correctAnswers: ['B'],
      explanation: 'From 3:5 and 10:7, scale first to 6:10, so a:c = 6:7.',
    },
    {
      text: wrapPrompt(
        'Permutation symbol nPr',
        `<p>Using ${formula('nP_r = \\\\frac{n!}{(n-r)!}')}, what is 5P2?</p>`
      ),
      type: 'MCQ',
      difficulty: 'MODERATE',
      marks: 2,
      options: [
        { label: 'A', text: '10' },
        { label: 'B', text: '15' },
        { label: 'C', text: '20' },
        { label: 'D', text: '25' },
      ],
      correctAnswers: ['C'],
      explanation: '5P2 = 5! / 3! = 5 × 4 = 20.',
    },
    {
      text: wrapPrompt(
        'Combination symbol nCr',
        `<p>Using ${formula('nC_r = \\\\frac{n!}{r!(n-r)!}')}, what is 6C2?</p>`
      ),
      type: 'MCQ',
      difficulty: 'MODERATE',
      marks: 2,
      options: [
        { label: 'A', text: '12' },
        { label: 'B', text: '15' },
        { label: 'C', text: '18' },
        { label: 'D', text: '20' },
      ],
      correctAnswers: ['B'],
      explanation: '6C2 = 6 × 5 / (2 × 1) = 15.',
    },
    {
      text: wrapPrompt(
        'Probability notation',
        `<p>If one fair die is rolled once, what is ${formula('P(\\\\text{prime})')}?</p>`
      ),
      type: 'MCQ',
      difficulty: 'SIMPLE',
      marks: 1,
      options: [
        { label: 'A', text: '1/6' },
        { label: 'B', text: '1/3' },
        { label: 'C', text: '1/2' },
        { label: 'D', text: '2/3' },
      ],
      correctAnswers: ['C'],
      explanation: 'Prime outcomes are 2, 3, 5 so probability = 3/6 = 1/2.',
    },
    {
      text: wrapPrompt(
        'Logarithm notation',
        `<p>If ${formula('\\\\log_{10}(x) = 4')}, what is x?</p>`
      ),
      type: 'MCQ',
      difficulty: 'SIMPLE',
      marks: 1,
      options: [
        { label: 'A', text: '40' },
        { label: 'B', text: '400' },
        { label: 'C', text: '4000' },
        { label: 'D', text: '10000' },
      ],
      correctAnswers: ['D'],
      explanation: 'log10(x) = 4 implies x = 10^4 = 10000.',
    },
    {
      text: wrapPrompt(
        'Geometry symbols',
        `<p>The area of a triangle is ${formula('A = \\\\frac{1}{2}bh')}. If b = 14 cm and h = 9 cm, area is?</p>`
      ),
      type: 'MCQ',
      difficulty: 'SIMPLE',
      marks: 1,
      options: [
        { label: 'A', text: '49 cm²' },
        { label: 'B', text: '56 cm²' },
        { label: 'C', text: '63 cm²' },
        { label: 'D', text: '72 cm²' },
      ],
      correctAnswers: ['C'],
      explanation: 'Area = 1/2 × 14 × 9 = 63 cm².',
    },
    {
      text: wrapPrompt(
        'Mensuration symbol π',
        `<p>The circumference of a circle is ${formula('C = 2\\\\pi r')}. For r = 7 cm and π = 22/7, what is C?</p>`
      ),
      type: 'MCQ',
      difficulty: 'SIMPLE',
      marks: 1,
      options: [
        { label: 'A', text: '22 cm' },
        { label: 'B', text: '33 cm' },
        { label: 'C', text: '44 cm' },
        { label: 'D', text: '49 cm' },
      ],
      correctAnswers: ['C'],
      explanation: 'C = 2 × 22/7 × 7 = 44 cm.',
    },
    {
      text: wrapPrompt(
        'Time and work',
        `<p>If A can complete a work in 12 days, then A's one-day work is ${formula('\\\\frac{1}{12}')}. In how many days will A complete 75% of the work?</p>`
      ),
      type: 'MCQ',
      difficulty: 'MODERATE',
      marks: 2,
      options: [
        { label: 'A', text: '7 days' },
        { label: 'B', text: '8 days' },
        { label: 'C', text: '9 days' },
        { label: 'D', text: '10 days' },
      ],
      correctAnswers: ['C'],
      explanation: '75% = 3/4 of work, so time = 3/4 × 12 = 9 days.',
    },
    {
      text: wrapPrompt(
        'True or false on formula',
        `<p>For consecutive natural numbers 1 to n, sum is ${formula('S = \\\\frac{n(n+1)}{2}')}. Therefore the sum of first 20 natural numbers is 210.</p>`
      ),
      type: 'TRUE_FALSE',
      difficulty: 'SIMPLE',
      marks: 1,
      options: [
        { label: 'A', text: 'True' },
        { label: 'B', text: 'False' },
      ],
      correctAnswers: ['A'],
      explanation: '20 × 21 / 2 = 210.',
    },
    {
      text: wrapPrompt(
        'Select all correct symbolic relationships',
        `<p>Which statements are correct?</p><ul><li>${formula('a^m \\\\times a^n = a^{m+n}')}</li><li>${formula('\\\\sqrt{49} = 7')}</li><li>${formula('\\\\frac{3}{4} > \\\\frac{2}{3}')}</li><li>${formula('15\\\\% = \\\\frac{15}{10}')}</li></ul>`
      ),
      type: 'MSQ',
      difficulty: 'HARD',
      marks: 3,
      options: [
        { label: 'A', text: 'a^m × a^n = a^(m+n)' },
        { label: 'B', text: '√49 = 7' },
        { label: 'C', text: '3/4 > 2/3' },
        { label: 'D', text: '15% = 15/10' },
      ],
      correctAnswers: ['A', 'B', 'C'],
      explanation: 'The first three are correct. 15% = 15/100, not 15/10.',
    },
  ];

  const programmingQuestions: QuestionSeed[] = [
    {
      text: wrapPrompt(
        'Python output prediction',
        `<p>What is the output of this Python program?</p>${codeBlock(
          'python',
          `nums = [2, 4, 6]\nprint(sum(n // 2 for n in nums))`
        )}`
      ),
      type: 'MCQ',
      difficulty: 'SIMPLE',
      marks: 1,
      options: [
        { label: 'A', text: '3' },
        { label: 'B', text: '6' },
        { label: 'C', text: '12' },
        { label: 'D', text: 'Error' },
      ],
      correctAnswers: ['B'],
      explanation: '2//2 + 4//2 + 6//2 = 1 + 2 + 3 = 6.',
    },
    {
      text: wrapPrompt(
        'Python list slicing',
        `<p>What does the following print?</p>${codeBlock(
          'python',
          `text = "Quizora"\nprint(text[1:5])`
        )}`
      ),
      type: 'MCQ',
      difficulty: 'SIMPLE',
      marks: 1,
      options: [
        { label: 'A', text: 'Quiz' },
        { label: 'B', text: 'uizo' },
        { label: 'C', text: 'uizor' },
        { label: 'D', text: 'izo' },
      ],
      correctAnswers: ['B'],
      explanation: 'Slice [1:5] includes indices 1,2,3,4, so result is "uizo".',
    },
    {
      text: wrapPrompt(
        'Java increment behavior',
        `<p>What is printed by this Java code?</p>${codeBlock(
          'java',
          `int a = 5;\nint b = ++a + a++;\nSystem.out.println(b);`
        )}`
      ),
      type: 'MCQ',
      difficulty: 'HARD',
      marks: 3,
      options: [
        { label: 'A', text: '10' },
        { label: 'B', text: '11' },
        { label: 'C', text: '12' },
        { label: 'D', text: '13' },
      ],
      correctAnswers: ['C'],
      explanation: '++a makes a = 6 and contributes 6. Then a++ contributes 6 and increments a to 7, so total is 12.',
    },
    {
      text: wrapPrompt(
        'Java corrected output question',
        `<p>Consider the following Java snippet:</p>${codeBlock(
          'java',
          `String s = "ab";\ns = s.toUpperCase();\nSystem.out.println(s + s.length());`
        )}`
      ),
      type: 'MCQ',
      difficulty: 'SIMPLE',
      marks: 1,
      options: [
        { label: 'A', text: 'ab2' },
        { label: 'B', text: 'AB2' },
        { label: 'C', text: 'ABAB' },
        { label: 'D', text: '2AB' },
      ],
      correctAnswers: ['B'],
      explanation: 'toUpperCase changes s to "AB", length is 2, so output is AB2.',
    },
    {
      text: wrapPrompt(
        'C loop result',
        `<p>What is the output of this C program?</p>${codeBlock(
          'c',
          `int i, sum = 0;\nfor (i = 1; i <= 4; i++) sum += i;\nprintf("%d", sum);`
        )}`
      ),
      type: 'MCQ',
      difficulty: 'SIMPLE',
      marks: 1,
      options: [
        { label: 'A', text: '8' },
        { label: 'B', text: '10' },
        { label: 'C', text: '12' },
        { label: 'D', text: '14' },
      ],
      correctAnswers: ['B'],
      explanation: '1 + 2 + 3 + 4 = 10.',
    },
    {
      text: wrapPrompt(
        'C pointer concept',
        `<p>Which statements about this C snippet are correct?</p>${codeBlock(
          'c',
          `int x = 10;\nint *p = &x;`
        )}`
      ),
      type: 'MSQ',
      difficulty: 'MODERATE',
      marks: 2,
      options: [
        { label: 'A', text: 'p stores the address of x' },
        { label: 'B', text: '*p gives the value 10' },
        { label: 'C', text: '&x gives the value stored in x' },
        { label: 'D', text: 'p is an integer variable, not a pointer' },
      ],
      correctAnswers: ['A', 'B'],
      explanation: 'p stores the address of x and *p dereferences that address to 10.',
    },
    {
      text: wrapPrompt(
        'C++ STL vector',
        `<p>What is the output of this C++ code?</p>${codeBlock(
          'cpp',
          `vector<int> v = {1, 2, 3};\nv.push_back(4);\ncout << v.size();`
        )}`
      ),
      type: 'MCQ',
      difficulty: 'SIMPLE',
      marks: 1,
      options: [
        { label: 'A', text: '3' },
        { label: 'B', text: '4' },
        { label: 'C', text: '5' },
        { label: 'D', text: 'Compilation error' },
      ],
      correctAnswers: ['B'],
      explanation: 'The vector has four elements after push_back.',
    },
    {
      text: wrapPrompt(
        'C++ reference semantics',
        `<p>What is printed by this C++ snippet?</p>${codeBlock(
          'cpp',
          `int x = 5;\nint &ref = x;\nref += 3;\ncout << x;`
        )}`
      ),
      type: 'MCQ',
      difficulty: 'MODERATE',
      marks: 2,
      options: [
        { label: 'A', text: '5' },
        { label: 'B', text: '6' },
        { label: 'C', text: '8' },
        { label: 'D', text: 'Error' },
      ],
      correctAnswers: ['C'],
      explanation: 'ref is an alias to x, so changing ref changes x to 8.',
    },
    {
      text: wrapPrompt(
        'Language identification',
        `<p>Match the code idea with the language feature. Which options are true?</p><ul><li>Python uses indentation for blocks.</li><li>Java starts execution from <code>main</code>.</li><li>C uses <code>cout</code> for standard output.</li><li>C++ supports classes and templates.</li></ul>`
      ),
      type: 'MSQ',
      difficulty: 'MODERATE',
      marks: 2,
      options: [
        { label: 'A', text: 'Python uses indentation for blocks' },
        { label: 'B', text: 'Java starts from main' },
        { label: 'C', text: 'C uses cout for output' },
        { label: 'D', text: 'C++ supports classes and templates' },
      ],
      correctAnswers: ['A', 'B', 'D'],
      explanation: 'A, B, and D are correct. C uses printf, not cout.',
    },
    {
      text: wrapPrompt(
        'Python dictionary access',
        `<p>What does this Python code print?</p>${codeBlock(
          'python',
          `data = {"a": 3, "b": 5}\nprint(data.get("c", 7))`
        )}`
      ),
      type: 'MCQ',
      difficulty: 'SIMPLE',
      marks: 1,
      options: [
        { label: 'A', text: 'None' },
        { label: 'B', text: '5' },
        { label: 'C', text: '7' },
        { label: 'D', text: 'KeyError' },
      ],
      correctAnswers: ['C'],
      explanation: 'get returns the default value 7 when key c is missing.',
    },
    {
      text: wrapPrompt(
        'Java array output',
        `<p>What is the output?</p>${codeBlock(
          'java',
          `int[] arr = {2, 4, 6};\nSystem.out.println(arr[0] + arr[2]);`
        )}`
      ),
      type: 'MCQ',
      difficulty: 'SIMPLE',
      marks: 1,
      options: [
        { label: 'A', text: '6' },
        { label: 'B', text: '8' },
        { label: 'C', text: '10' },
        { label: 'D', text: '12' },
      ],
      correctAnswers: ['B'],
      explanation: 'arr[0] + arr[2] = 2 + 6 = 8.',
    },
    {
      text: wrapPrompt(
        'C conditional operator',
        `<p>What is printed?</p>${codeBlock(
          'c',
          `int x = 3, y = 7;\nprintf("%d", x > y ? x : y);`
        )}`
      ),
      type: 'MCQ',
      difficulty: 'SIMPLE',
      marks: 1,
      options: [
        { label: 'A', text: '3' },
        { label: 'B', text: '7' },
        { label: 'C', text: '10' },
        { label: 'D', text: '0' },
      ],
      correctAnswers: ['B'],
      explanation: 'The conditional operator picks the larger value, 7.',
    },
    {
      text: wrapPrompt(
        'C++ OOP concept',
        `<p>True or false: In C++, a class can contain both data members and member functions.</p>`
      ),
      type: 'TRUE_FALSE',
      difficulty: 'SIMPLE',
      marks: 1,
      options: [
        { label: 'A', text: 'True' },
        { label: 'B', text: 'False' },
      ],
      correctAnswers: ['A'],
      explanation: 'C++ classes group data and functions together.',
    },
    {
      text: wrapPrompt(
        'Programming syntax mix',
        `<p>Which of the following snippets are valid language-feature matches?</p>`
      ),
      type: 'MSQ',
      difficulty: 'HARD',
      marks: 3,
      options: [
        { label: 'A', text: 'Python: def greet():' },
        { label: 'B', text: 'Java: public static void main(String[] args)' },
        { label: 'C', text: 'C: cout << "Hello";' },
        { label: 'D', text: 'C++: vector<int> nums;' },
      ],
      correctAnswers: ['A', 'B', 'D'],
      explanation: 'A, B, and D are valid. C does not use cout.',
    },
    {
      text: wrapPrompt(
        'Code tracing across languages',
        `<p>Which statement is correct?</p>`
      ),
      type: 'MCQ',
      difficulty: 'MODERATE',
      marks: 2,
      options: [
        { label: 'A', text: 'Python variables require explicit type declaration' },
        { label: 'B', text: 'Java supports method overloading' },
        { label: 'C', text: 'C++ does not support references' },
        { label: 'D', text: 'C has built-in classes' },
      ],
      correctAnswers: ['B'],
      explanation: 'Java supports method overloading. The other three statements are false.',
    },
  ];

  const aptitudeCreated = await createQuestions(
    aptitudeSetup.subject.id,
    aptitudeSetup.topic.id,
    aptitudeQuestions
  );

  const programmingCreated = await createQuestions(
    programmingSetup.subject.id,
    programmingSetup.topic.id,
    programmingQuestions
  );

  await createPublishedTest({
    title: aptitudeTestTitle,
    subjectId: aptitudeSetup.subject.id,
    topicId: aptitudeSetup.topic.id,
    type: 'OFFICIAL',
    duration: 40,
    negativeMarking: true,
    negativeMarksValue: 0.25,
    passingPercentage: 55,
    enableCertificate: true,
    instructions:
      'This aptitude assessment covers formulas, notation, ratios, percentage, mensuration, probability, and symbolic reasoning. Read each formula carefully before answering.',
    questions: aptitudeCreated,
  });

  await createPublishedTest({
    title: programmingTestTitle,
    subjectId: programmingSetup.subject.id,
    topicId: programmingSetup.topic.id,
    type: 'OFFICIAL',
    duration: 45,
    negativeMarking: true,
    negativeMarksValue: 0.25,
    passingPercentage: 60,
    enableCertificate: true,
    instructions:
      'This programming assessment mixes Python, Java, C, and C++ snippets. Focus on syntax, output tracing, language features, and code comprehension.',
    questions: programmingCreated,
  });

  console.log(`Created ${aptitudeCreated.length} aptitude questions and 1 published test.`);
  console.log(`Created ${programmingCreated.length} programming questions and 1 published test.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
