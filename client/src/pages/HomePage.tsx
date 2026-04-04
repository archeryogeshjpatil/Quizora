import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '🧠', title: 'AI-Powered Questions', desc: 'Upload syllabus or type topics — our AI generates exam-ready questions instantly using advanced LLM technology.' },
  { icon: '📝', title: '5 Question Types', desc: 'MCQ, Multiple Select, True/False, Matching, and Assertion & Reasoning — all with rich math and code support.' },
  { icon: '⏱️', title: 'Smart Exam Engine', desc: 'Countdown timer, auto-save every 30s, tab-switch detection, question bookmarking, and one-click submission.' },
  { icon: '📊', title: 'Real-Time Analytics', desc: 'Score trends, subject-wise performance, strength/weakness analysis, and interactive charts for students and admins.' },
  { icon: '🏆', title: 'Leaderboard & Rankings', desc: 'Test-level and series-level leaderboards with live rankings, highlighting your position among peers.' },
  { icon: '🎓', title: 'Auto Certificates', desc: 'PDF certificates auto-generated for passing students with unique verification IDs.' },
  { icon: '🔒', title: 'Proctoring & Security', desc: 'Webcam monitoring, plagiarism detection, tab-switch alerts, and answer pattern analysis.' },
  { icon: '🌐', title: 'Multi-Language', desc: 'Full UI support in English, Hindi, and Marathi — create and take exams in your preferred language.' },
  { icon: '📱', title: 'Responsive Design', desc: 'Works seamlessly on desktop, tablet, and mobile browsers with a clean, modern interface.' },
  { icon: '📤', title: 'Result Dispatch', desc: 'Send results via Email and Telegram automatically. Schedule dispatches for future delivery.' },
  { icon: '📚', title: 'Test Series', desc: 'Group multiple tests into series with cumulative scoring, progress tracking, and series certificates.' },
  { icon: '⚡', title: 'Bulk Import', desc: 'Download Excel template, fill in questions, upload — hundreds of questions imported in seconds.' },
];

const ARCHER_LINKS = [
  { label: 'About Archer Infotech', url: 'https://archerinfotech.com/about' },
  { label: 'Training Programs', url: 'https://archerinfotech.com/training' },
  { label: 'Placement Services', url: 'https://archerinfotech.com/placement' },
  { label: 'Contact Us', url: 'https://archerinfotech.com/contact' },
  { label: 'Courses', url: 'https://archerinfotech.com/courses' },
  { label: 'Blog', url: 'https://archerinfotech.com/blog' },
];

export function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ═══ Navigation ═══ */}
      <nav className="bg-slate-900 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-teal-500/25">Q</div>
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">Quizora</h1>
              <p className="text-[10px] text-slate-400 leading-tight">by Archer Infotech</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition rounded-lg hover:bg-white/10">Student Login</Link>
            <Link to="/admin/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition rounded-lg hover:bg-white/10">Admin Login</Link>
            <Link to="/register" className="px-5 py-2.5 text-sm font-medium bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition shadow-md shadow-teal-500/30 ml-2">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ═══ Hero Section ═══ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-teal-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-200 rounded-full opacity-20 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white border border-teal-200 rounded-full px-4 py-1.5 mb-6 shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-gray-600">Powered by Archer Infotech, Pune</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              The Smartest Way to
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent"> Conduct Exams</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
              Quizora is an AI-powered online examination platform built for educational institutions, training centers, and coaching classes. Create, manage, and analyze objective tests with unmatched ease.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="px-8 py-3.5 bg-teal-600 text-white rounded-xl text-base font-semibold hover:bg-teal-700 transition shadow-lg shadow-teal-600/25">
                Start Free
              </Link>
              <a href="#features" className="px-8 py-3.5 bg-white text-gray-700 rounded-xl text-base font-semibold hover:bg-gray-50 transition border border-gray-200 shadow-sm">
                Explore Features
              </a>
            </div>

            <div className="flex items-center gap-8 mt-12 text-sm text-gray-500">
              <div className="flex items-center gap-2"><span className="text-2xl font-bold text-gray-900">5+</span> Question Types</div>
              <div className="flex items-center gap-2"><span className="text-2xl font-bold text-gray-900">3</span> Languages</div>
              <div className="flex items-center gap-2"><span className="text-2xl font-bold text-gray-900">AI</span> Powered</div>
              <div className="flex items-center gap-2"><span className="text-2xl font-bold text-gray-900">PDF</span> Certificates</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Archer Infotech Banner ═══ */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-white mb-2">Built by Archer Infotech</h2>
              <p className="text-slate-300 max-w-xl">
                Archer Infotech is a leading technical training and placement company in Pune, managed by IT experts.
                Known for practical, industry-focused training that gives students real-time exposure to competitive technologies.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {ARCHER_LINKS.slice(0, 4).map((link) => (
                <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition border border-white/10">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Features Grid ═══ */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Everything You Need for Online Exams</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              From question creation to result dispatch — Quizora handles every aspect of the examination lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-teal-200 transition-all duration-300">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-teal-500 transition">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">How Quizora Works</h2>
            <p className="text-lg text-gray-500">Simple 4-step process for admins and students</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Admin Flow */}
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-slate-800 text-white rounded-lg flex items-center justify-center text-sm">A</span>
                For Admins
              </h3>
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Create Questions', desc: 'Add manually, import via Excel, or let AI generate from your syllabus.' },
                  { step: '2', title: 'Configure Test', desc: 'Set duration, marking scheme, scheduling window, and assign to batches.' },
                  { step: '3', title: 'Monitor & Proctor', desc: 'Track live attempts, webcam proctoring, and plagiarism detection.' },
                  { step: '4', title: 'Analyze & Dispatch', desc: 'View analytics, export results as PDF/Excel, send via Email/Telegram.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0">{item.step}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Flow */}
            <div>
              <h3 className="text-xl font-bold text-teal-700 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-teal-600 text-white rounded-lg flex items-center justify-center text-sm">S</span>
                For Students
              </h3>
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Register & Login', desc: 'Quick sign-up with email and mobile. Join your assigned batch.' },
                  { step: '2', title: 'Take Tests', desc: 'Timed exams with auto-save, question navigator, and bookmark support.' },
                  { step: '3', title: 'Review with AI', desc: 'Get AI-powered explanations for each question from 4 different AI assistants.' },
                  { step: '4', title: 'Track Progress', desc: 'Analytics dashboard, leaderboard rankings, and downloadable certificates.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0">{item.step}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Tech Stack ═══ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Built with Modern Technology</h2>
            <p className="text-gray-500">Enterprise-grade tech stack for reliability and performance</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Tailwind CSS', 'Prisma', 'Socket.IO', 'Groq AI', 'PDFKit', 'Recharts', 'Vite'].map((tech) => (
              <span key={tech} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700">{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ About Archer Infotech ═══ */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-teal-600/20 text-teal-400 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 border border-teal-500/20">
                About the Company
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Archer Infotech</h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-4">
                Archer Infotech is a premier technical training and placement company headquartered in Pune, Maharashtra.
                Managed by experienced IT professionals, we are known for our practical, hands-on approach to technology education.
              </p>
              <p className="text-slate-400 leading-relaxed mb-6">
                Our training programs cover full-stack development, data science, cloud computing, and more — designed to
                bridge the gap between academic learning and industry requirements. We have successfully trained and placed
                hundreds of students in top IT companies across India.
              </p>
              <p className="text-slate-400 leading-relaxed mb-8">
                Quizora is developed in-house by Archer Infotech to modernize the examination process for educational
                institutions, coaching classes, and corporate training programs.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-2xl font-bold text-white">500+</p>
                  <p className="text-xs text-slate-400">Students Trained</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-2xl font-bold text-white">50+</p>
                  <p className="text-xs text-slate-400">Placement Partners</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-2xl font-bold text-white">10+</p>
                  <p className="text-xs text-slate-400">Technology Courses</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-2xl font-bold text-white">Pune</p>
                  <p className="text-xs text-slate-400">Headquarters</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 gap-3">
                {ARCHER_LINKS.map((link) => (
                  <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white/5 rounded-xl px-5 py-4 hover:bg-white/10 transition border border-white/10 group">
                    <svg className="w-4 h-4 text-teal-400 group-hover:text-teal-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    <span className="text-sm text-white font-medium">{link.label}</span>
                  </a>
                ))}
              </div>

              <div className="bg-teal-600/10 rounded-xl p-6 border border-teal-500/20 mt-6">
                <h4 className="text-white font-semibold mb-2">Training Specializations</h4>
                <div className="flex flex-wrap gap-2">
                  {['Java Full Stack', 'Python Full Stack', 'MERN Stack', 'Data Science', 'AWS Cloud', 'DevOps', 'React.js', 'Node.js', 'SQL & Databases', 'Software Testing'].map((course) => (
                    <span key={course} className="px-3 py-1 bg-white/10 text-teal-300 rounded-lg text-xs border border-teal-500/20">{course}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 bg-gradient-to-r from-teal-500 to-emerald-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Ready to Transform Your Exams?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join Quizora today and experience the future of online examinations. Powered by AI, built with modern technology, backed by Archer Infotech.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="px-8 py-3.5 bg-white text-teal-700 rounded-xl text-base font-semibold hover:bg-blue-50 transition shadow-lg">
              Register as Student
            </Link>
            <Link to="/admin/login" className="px-8 py-3.5 bg-white/10 text-white rounded-xl text-base font-semibold hover:bg-white/20 transition border border-white/20">
              Admin Panel
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">Q</div>
                <div>
                  <h3 className="text-lg font-bold text-white">Quizora</h3>
                  <p className="text-xs text-gray-500">Online Examination Platform</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                AI-powered exam platform for conducting, managing, and analyzing objective tests.
                Built with modern technology for educational institutions and training organizations.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="text-gray-400 hover:text-white transition">Student Login</Link></li>
                <li><Link to="/admin/login" className="text-gray-400 hover:text-white transition">Admin Login</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white transition">Register</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Archer Infotech</h4>
              <ul className="space-y-2 text-sm">
                {ARCHER_LINKS.map((link) => (
                  <li key={link.label}><a href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">{link.label}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Quizora. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm">
              Developed & Maintained by <a href="https://archerinfotech.com" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 font-medium">Archer Infotech, Pune</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
