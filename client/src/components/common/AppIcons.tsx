import {
  Award,
  BarChart3,
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  Gauge,
  Layers3,
  LayoutDashboard,
  Medal,
  NotebookPen,
  ScrollText,
  ShieldCheck,
  Users,
} from 'lucide-react';

export const adminNavIcons = {
  dashboard: LayoutDashboard,
  subjects: BookOpen,
  questions: NotebookPen,
  tests: FileText,
  series: Layers3,
  batches: Users,
  students: GraduationCap,
  results: ClipboardList,
  analytics: BarChart3,
  certificates: Award,
};

export const studentNavIcons = {
  dashboard: Gauge,
  results: ScrollText,
  leaderboard: Medal,
  analytics: BarChart3,
  series: Layers3,
  certificates: ShieldCheck,
};
