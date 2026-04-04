import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@quizora.com' },
    update: {},
    create: {
      fullName: 'Quizora Admin',
      email: 'admin@quizora.com',
      mobile: '9999999999',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('Admin created:', admin.email);

  // Create demo students
  const studentPassword = await bcrypt.hash('student@123', 12);
  const demoStudents = [
    { fullName: 'Rahul Sharma', email: 'rahul@test.com', mobile: '9876543210' },
    { fullName: 'Priya Patel', email: 'priya@test.com', mobile: '9876543211' },
    { fullName: 'Amit Kumar', email: 'amit@test.com', mobile: '9876543212' },
    { fullName: 'Sneha Deshmukh', email: 'sneha@test.com', mobile: '9876543213' },
    { fullName: 'Vikram Singh', email: 'vikram@test.com', mobile: '9876543214' },
  ];

  for (const student of demoStudents) {
    await prisma.user.upsert({
      where: { email: student.email },
      update: {},
      create: { ...student, password: studentPassword, role: 'STUDENT', status: 'ACTIVE' },
    });
  }
  console.log('Demo students created (password: student@123)');

  // Create default subjects
  const subjectData = [
    { name: 'Mathematics', description: 'Mathematics and quantitative aptitude' },
    { name: 'Physics', description: 'Physics concepts and problems' },
    { name: 'Chemistry', description: 'Chemistry concepts and reactions' },
    { name: 'Computer Science', description: 'Programming, data structures, algorithms' },
    { name: 'General Knowledge', description: 'General awareness and current affairs' },
  ];

  const subjects: Record<string, string> = {};
  for (const s of subjectData) {
    const subject = await prisma.subject.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
    subjects[s.name] = subject.id;
  }
  console.log('Subjects created');

  // ─── MATHEMATICS QUESTIONS ────────────────────────────────────────
  const mathQuestions = [
    {
      text: 'What is the value of 15 × 12?',
      type: 'MCQ' as const, difficulty: 'SIMPLE' as const, marks: 1,
      options: [
        { label: 'A', text: '170' },
        { label: 'B', text: '180' },
        { label: 'C', text: '190' },
        { label: 'D', text: '200' },
      ],
      correctAnswers: ['B'],
      explanation: '15 × 12 = 180',
    },
    {
      text: 'If x + 5 = 12, what is the value of x?',
      type: 'MCQ' as const, difficulty: 'SIMPLE' as const, marks: 1,
      options: [
        { label: 'A', text: '5' },
        { label: 'B', text: '6' },
        { label: 'C', text: '7' },
        { label: 'D', text: '8' },
      ],
      correctAnswers: ['C'],
      explanation: 'x = 12 - 5 = 7',
    },
    {
      text: 'What is the area of a circle with radius 7 cm? (Use π = 22/7)',
      type: 'MCQ' as const, difficulty: 'MODERATE' as const, marks: 2,
      options: [
        { label: 'A', text: '144 cm²' },
        { label: 'B', text: '154 cm²' },
        { label: 'C', text: '164 cm²' },
        { label: 'D', text: '174 cm²' },
      ],
      correctAnswers: ['B'],
      explanation: 'Area = πr² = (22/7) × 7² = 22 × 7 = 154 cm²',
    },
    {
      text: 'The derivative of x³ + 2x² - 5x + 3 is:',
      type: 'MCQ' as const, difficulty: 'MODERATE' as const, marks: 2,
      options: [
        { label: 'A', text: '3x² + 4x - 5' },
        { label: 'B', text: '3x² + 2x - 5' },
        { label: 'C', text: 'x² + 4x - 5' },
        { label: 'D', text: '3x² + 4x + 5' },
      ],
      correctAnswers: ['A'],
      explanation: 'd/dx(x³) = 3x², d/dx(2x²) = 4x, d/dx(-5x) = -5, d/dx(3) = 0',
    },
    {
      text: 'The sum of first 10 natural numbers is 55.',
      type: 'TRUE_FALSE' as const, difficulty: 'SIMPLE' as const, marks: 1,
      options: [
        { label: 'A', text: 'True' },
        { label: 'B', text: 'False' },
      ],
      correctAnswers: ['A'],
      explanation: 'Sum = n(n+1)/2 = 10 × 11/2 = 55',
    },
    {
      text: 'Which of the following are prime numbers?',
      type: 'MSQ' as const, difficulty: 'SIMPLE' as const, marks: 2,
      options: [
        { label: 'A', text: '2' },
        { label: 'B', text: '9' },
        { label: 'C', text: '13' },
        { label: 'D', text: '15' },
        { label: 'E', text: '17' },
      ],
      correctAnswers: ['A', 'C', 'E'],
      explanation: '2, 13, and 17 are prime. 9 = 3×3, 15 = 3×5.',
    },
    {
      text: 'What is the value of ∫(2x)dx?',
      type: 'MCQ' as const, difficulty: 'HARD' as const, marks: 3,
      options: [
        { label: 'A', text: 'x² + C' },
        { label: 'B', text: '2x² + C' },
        { label: 'C', text: 'x + C' },
        { label: 'D', text: '2 + C' },
      ],
      correctAnswers: ['A'],
      explanation: '∫(2x)dx = 2 × x²/2 + C = x² + C',
    },
    {
      text: 'If log₁₀(x) = 3, then x equals:',
      type: 'MCQ' as const, difficulty: 'HARD' as const, marks: 3,
      options: [
        { label: 'A', text: '30' },
        { label: 'B', text: '100' },
        { label: 'C', text: '1000' },
        { label: 'D', text: '10000' },
      ],
      correctAnswers: ['C'],
      explanation: 'log₁₀(x) = 3 means 10³ = x = 1000',
    },
  ];

  // ─── PHYSICS QUESTIONS ────────────────────────────────────────────
  const physicsQuestions = [
    {
      text: 'What is the SI unit of force?',
      type: 'MCQ' as const, difficulty: 'SIMPLE' as const, marks: 1,
      options: [
        { label: 'A', text: 'Joule' },
        { label: 'B', text: 'Newton' },
        { label: 'C', text: 'Pascal' },
        { label: 'D', text: 'Watt' },
      ],
      correctAnswers: ['B'],
      explanation: 'The SI unit of force is Newton (N), named after Sir Isaac Newton.',
    },
    {
      text: 'What is the acceleration due to gravity on Earth?',
      type: 'MCQ' as const, difficulty: 'SIMPLE' as const, marks: 1,
      options: [
        { label: 'A', text: '8.8 m/s²' },
        { label: 'B', text: '9.8 m/s²' },
        { label: 'C', text: '10.8 m/s²' },
        { label: 'D', text: '11.8 m/s²' },
      ],
      correctAnswers: ['B'],
      explanation: 'The standard acceleration due to gravity is approximately 9.8 m/s².',
    },
    {
      text: 'According to Newton\'s third law, every action has an equal and opposite reaction.',
      type: 'TRUE_FALSE' as const, difficulty: 'SIMPLE' as const, marks: 1,
      options: [
        { label: 'A', text: 'True' },
        { label: 'B', text: 'False' },
      ],
      correctAnswers: ['A'],
      explanation: 'This is the correct statement of Newton\'s Third Law of Motion.',
    },
    {
      text: 'A car travels 120 km in 2 hours. What is its average speed?',
      type: 'MCQ' as const, difficulty: 'SIMPLE' as const, marks: 1,
      options: [
        { label: 'A', text: '40 km/h' },
        { label: 'B', text: '50 km/h' },
        { label: 'C', text: '60 km/h' },
        { label: 'D', text: '70 km/h' },
      ],
      correctAnswers: ['C'],
      explanation: 'Speed = Distance/Time = 120/2 = 60 km/h',
    },
    {
      text: 'Which of the following are vector quantities?',
      type: 'MSQ' as const, difficulty: 'MODERATE' as const, marks: 2,
      options: [
        { label: 'A', text: 'Velocity' },
        { label: 'B', text: 'Speed' },
        { label: 'C', text: 'Force' },
        { label: 'D', text: 'Mass' },
        { label: 'E', text: 'Displacement' },
      ],
      correctAnswers: ['A', 'C', 'E'],
      explanation: 'Velocity, Force, and Displacement have both magnitude and direction (vectors). Speed and Mass are scalar quantities.',
    },
    {
      text: 'What is the kinetic energy of a 5 kg object moving at 10 m/s?',
      type: 'MCQ' as const, difficulty: 'MODERATE' as const, marks: 2,
      options: [
        { label: 'A', text: '200 J' },
        { label: 'B', text: '250 J' },
        { label: 'C', text: '300 J' },
        { label: 'D', text: '500 J' },
      ],
      correctAnswers: ['B'],
      explanation: 'KE = ½mv² = ½ × 5 × 10² = ½ × 5 × 100 = 250 J',
    },
    {
      text: 'The wavelength of visible light ranges from approximately:',
      type: 'MCQ' as const, difficulty: 'HARD' as const, marks: 3,
      options: [
        { label: 'A', text: '100-400 nm' },
        { label: 'B', text: '380-750 nm' },
        { label: 'C', text: '800-1200 nm' },
        { label: 'D', text: '1-100 nm' },
      ],
      correctAnswers: ['B'],
      explanation: 'Visible light has wavelengths approximately from 380 nm (violet) to 750 nm (red).',
    },
  ];

  // ─── COMPUTER SCIENCE QUESTIONS ───────────────────────────────────
  const csQuestions = [
    {
      text: 'What does HTML stand for?',
      type: 'MCQ' as const, difficulty: 'SIMPLE' as const, marks: 1,
      options: [
        { label: 'A', text: 'Hyper Text Markup Language' },
        { label: 'B', text: 'High Tech Modern Language' },
        { label: 'C', text: 'Hyper Transfer Markup Language' },
        { label: 'D', text: 'Home Tool Markup Language' },
      ],
      correctAnswers: ['A'],
      explanation: 'HTML stands for Hyper Text Markup Language.',
    },
    {
      text: 'Which data structure uses LIFO (Last In First Out) principle?',
      type: 'MCQ' as const, difficulty: 'SIMPLE' as const, marks: 1,
      options: [
        { label: 'A', text: 'Queue' },
        { label: 'B', text: 'Stack' },
        { label: 'C', text: 'Array' },
        { label: 'D', text: 'Linked List' },
      ],
      correctAnswers: ['B'],
      explanation: 'Stack follows Last In First Out (LIFO) principle.',
    },
    {
      text: 'What is the time complexity of binary search?',
      type: 'MCQ' as const, difficulty: 'MODERATE' as const, marks: 2,
      options: [
        { label: 'A', text: 'O(n)' },
        { label: 'B', text: 'O(n²)' },
        { label: 'C', text: 'O(log n)' },
        { label: 'D', text: 'O(1)' },
      ],
      correctAnswers: ['C'],
      explanation: 'Binary search divides the search space in half each time, giving O(log n) complexity.',
    },
    {
      text: 'Python is an interpreted language.',
      type: 'TRUE_FALSE' as const, difficulty: 'SIMPLE' as const, marks: 1,
      options: [
        { label: 'A', text: 'True' },
        { label: 'B', text: 'False' },
      ],
      correctAnswers: ['A'],
      explanation: 'Python is indeed an interpreted, high-level programming language.',
    },
    {
      text: 'Which of the following are JavaScript frameworks/libraries?',
      type: 'MSQ' as const, difficulty: 'MODERATE' as const, marks: 2,
      options: [
        { label: 'A', text: 'React' },
        { label: 'B', text: 'Django' },
        { label: 'C', text: 'Vue.js' },
        { label: 'D', text: 'Flask' },
        { label: 'E', text: 'Angular' },
      ],
      correctAnswers: ['A', 'C', 'E'],
      explanation: 'React, Vue.js, and Angular are JavaScript frameworks/libraries. Django and Flask are Python frameworks.',
    },
    {
      text: 'What will be the output of: console.log(typeof null) in JavaScript?',
      type: 'MCQ' as const, difficulty: 'HARD' as const, marks: 3,
      options: [
        { label: 'A', text: '"null"' },
        { label: 'B', text: '"undefined"' },
        { label: 'C', text: '"object"' },
        { label: 'D', text: '"boolean"' },
      ],
      correctAnswers: ['C'],
      explanation: 'typeof null returns "object" in JavaScript. This is a well-known bug that has existed since the first version of JavaScript.',
    },
    {
      text: 'In SQL, which command is used to retrieve data from a database?',
      type: 'MCQ' as const, difficulty: 'SIMPLE' as const, marks: 1,
      options: [
        { label: 'A', text: 'GET' },
        { label: 'B', text: 'SELECT' },
        { label: 'C', text: 'FETCH' },
        { label: 'D', text: 'RETRIEVE' },
      ],
      correctAnswers: ['B'],
      explanation: 'SELECT statement is used to retrieve data from a database in SQL.',
    },
    {
      text: 'What is the worst-case time complexity of QuickSort?',
      type: 'MCQ' as const, difficulty: 'HARD' as const, marks: 3,
      options: [
        { label: 'A', text: 'O(n log n)' },
        { label: 'B', text: 'O(n²)' },
        { label: 'C', text: 'O(n)' },
        { label: 'D', text: 'O(log n)' },
      ],
      correctAnswers: ['B'],
      explanation: 'QuickSort has a worst-case time complexity of O(n²), which occurs when the pivot selection is poor (e.g., already sorted array with first element as pivot).',
    },
  ];

  // ─── GK QUESTIONS ─────────────────────────────────────────────────
  const gkQuestions = [
    {
      text: 'What is the capital of India?',
      type: 'MCQ' as const, difficulty: 'SIMPLE' as const, marks: 1,
      options: [
        { label: 'A', text: 'Mumbai' },
        { label: 'B', text: 'New Delhi' },
        { label: 'C', text: 'Kolkata' },
        { label: 'D', text: 'Chennai' },
      ],
      correctAnswers: ['B'],
      explanation: 'New Delhi is the capital of India.',
    },
    {
      text: 'Who wrote the Indian national anthem "Jana Gana Mana"?',
      type: 'MCQ' as const, difficulty: 'SIMPLE' as const, marks: 1,
      options: [
        { label: 'A', text: 'Mahatma Gandhi' },
        { label: 'B', text: 'Bankim Chandra Chattopadhyay' },
        { label: 'C', text: 'Rabindranath Tagore' },
        { label: 'D', text: 'Sarojini Naidu' },
      ],
      correctAnswers: ['C'],
      explanation: 'Rabindranath Tagore wrote "Jana Gana Mana", which was adopted as the national anthem of India.',
    },
    {
      text: 'Mount Everest is the tallest mountain in the world.',
      type: 'TRUE_FALSE' as const, difficulty: 'SIMPLE' as const, marks: 1,
      options: [
        { label: 'A', text: 'True' },
        { label: 'B', text: 'False' },
      ],
      correctAnswers: ['A'],
      explanation: 'Mount Everest, at 8,848.86 metres above sea level, is the tallest mountain in the world.',
    },
    {
      text: 'Which planet is known as the Red Planet?',
      type: 'MCQ' as const, difficulty: 'SIMPLE' as const, marks: 1,
      options: [
        { label: 'A', text: 'Venus' },
        { label: 'B', text: 'Mars' },
        { label: 'C', text: 'Jupiter' },
        { label: 'D', text: 'Saturn' },
      ],
      correctAnswers: ['B'],
      explanation: 'Mars is called the Red Planet due to iron oxide (rust) on its surface.',
    },
  ];

  // Helper to create questions
  async function createQuestions(subjectName: string, questionsData: typeof mathQuestions) {
    const subjectId = subjects[subjectName];
    for (const q of questionsData) {
      const existing = await prisma.question.findFirst({ where: { text: q.text, subjectId } });
      if (existing) continue;

      await prisma.question.create({
        data: {
          subjectId,
          type: q.type,
          difficulty: q.difficulty,
          text: q.text,
          marks: q.marks,
          correctAnswers: q.correctAnswers,
          explanation: q.explanation,
          version: 1,
          options: {
            create: q.options,
          },
        },
      });
    }
    console.log(`${subjectName} questions created (${questionsData.length})`);
  }

  await createQuestions('Mathematics', mathQuestions);
  await createQuestions('Physics', physicsQuestions);
  await createQuestions('Computer Science', csQuestions);
  await createQuestions('General Knowledge', gkQuestions);

  // ─── CREATE SAMPLE TESTS ─────────────────────────────────────────

  // Get questions for test creation
  const mathQs = await prisma.question.findMany({ where: { subjectId: subjects['Mathematics'] }, take: 5 });
  const physicsQs = await prisma.question.findMany({ where: { subjectId: subjects['Physics'] }, take: 5 });
  const csQs = await prisma.question.findMany({ where: { subjectId: subjects['Computer Science'] }, take: 5 });

  // Math Official Test
  const mathTest = await prisma.test.upsert({
    where: { id: 'demo-math-test' },
    update: {},
    create: {
      id: 'demo-math-test',
      title: 'Mathematics — Unit Test 1',
      subjectId: subjects['Mathematics'],
      type: 'OFFICIAL',
      status: 'PUBLISHED',
      instructions: 'Answer all questions. Each correct answer carries the marks shown. Negative marking applies for wrong answers.',
      isTimeBased: true,
      duration: 30,
      autoSubmitOnTimeout: true,
      attemptLimit: 2,
      marksPerQuestion: 1,
      negativeMarking: true,
      negativeMarksValue: 0.25,
      questionsPerPage: 1,
      allowReview: true,
      tabSwitchPrevention: true,
      tabSwitchAction: 'WARN',
      maxTabSwitches: 3,
      showResultImmediately: true,
      enableCertificate: true,
      passingPercentage: 60,
      totalMarks: mathQs.reduce((sum, q) => sum + q.marks, 0),
      questions: {
        create: mathQs.map((q, i) => ({ questionId: q.id, orderIndex: i + 1 })),
      },
    },
  });
  console.log('Math test created:', mathTest.title);

  // Physics Official Test
  const physicsTest = await prisma.test.upsert({
    where: { id: 'demo-physics-test' },
    update: {},
    create: {
      id: 'demo-physics-test',
      title: 'Physics — Mechanics Basics',
      subjectId: subjects['Physics'],
      type: 'OFFICIAL',
      status: 'PUBLISHED',
      instructions: 'This test covers Newton\'s Laws, Kinematics, and Work-Energy concepts.',
      isTimeBased: true,
      duration: 25,
      autoSubmitOnTimeout: true,
      attemptLimit: 1,
      marksPerQuestion: 1,
      negativeMarking: false,
      negativeMarksValue: 0,
      questionsPerPage: 1,
      allowReview: true,
      showResultImmediately: true,
      totalMarks: physicsQs.reduce((sum, q) => sum + q.marks, 0),
      questions: {
        create: physicsQs.map((q, i) => ({ questionId: q.id, orderIndex: i + 1 })),
      },
    },
  });
  console.log('Physics test created:', physicsTest.title);

  // CS Practice Test
  const csTest = await prisma.test.upsert({
    where: { id: 'demo-cs-practice' },
    update: {},
    create: {
      id: 'demo-cs-practice',
      title: 'CS Fundamentals — Practice',
      subjectId: subjects['Computer Science'],
      type: 'PRACTICE',
      status: 'PUBLISHED',
      instructions: 'Practice test — unlimited attempts. Review your answers after submission.',
      isTimeBased: false,
      autoSubmitOnTimeout: false,
      marksPerQuestion: 1,
      negativeMarking: false,
      negativeMarksValue: 0,
      questionsPerPage: 1,
      allowReview: true,
      showResultImmediately: true,
      totalMarks: csQs.reduce((sum, q) => sum + q.marks, 0),
      questions: {
        create: csQs.map((q, i) => ({ questionId: q.id, orderIndex: i + 1 })),
      },
    },
  });
  console.log('CS practice test created:', csTest.title);

  console.log('\n=== Seed Complete ===');
  console.log('Admin: admin@quizora.com / admin@123');
  console.log('Students: rahul@test.com, priya@test.com, etc. / student@123');
  console.log('Questions: 27 across 4 subjects');
  console.log('Tests: 2 Official + 1 Practice');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
