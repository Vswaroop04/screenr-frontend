// Mock data generators for features not yet backed by APIs

export interface CareerPrediction {
  role: string;
  confidence: number;
  matchingSkills: string[];
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  duration: string;
  skills: string[];
  rating: number;
  level: "Beginner" | "Intermediate" | "Advanced";
}

export interface Video {
  id: string;
  title: string;
  category: "interview" | "resume" | "career";
  duration: string;
  thumbnail: string;
  channel: string;
}

export interface ResumeTip {
  id: string;
  title: string;
  description: string;
  category: string;
}

export interface ExperienceData {
  level: string;
  count: number;
}

export interface RoleData {
  role: string;
  count: number;
}

export interface GeoData {
  name: string;
  count: number;
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export function getMockCareerPredictions(skills: string[]): CareerPrediction[] {
  const roleMap: Record<string, { role: string; keywords: string[] }[]> = {
    default: [
      { role: "Full Stack Developer", keywords: ["react", "node", "javascript", "typescript"] },
      { role: "Frontend Engineer", keywords: ["react", "vue", "angular", "css", "html"] },
      { role: "Backend Engineer", keywords: ["node", "python", "java", "go", "api"] },
      { role: "Data Scientist", keywords: ["python", "ml", "tensorflow", "pandas", "data"] },
      { role: "DevOps Engineer", keywords: ["docker", "kubernetes", "aws", "ci/cd", "terraform"] },
      { role: "Mobile Developer", keywords: ["react native", "flutter", "swift", "kotlin"] },
    ],
  };

  const lower = skills.map((s) => s.toLowerCase());
  return roleMap.default
    .map((r) => {
      const matched = r.keywords.filter((k) => lower.some((s) => s.includes(k)));
      return {
        role: r.role,
        confidence: Math.min(95, Math.max(20, (matched.length / r.keywords.length) * 100 + 15)),
        matchingSkills: matched,
      };
    })
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 4);
}

export function getMockCourseRecommendations(missingSkills: string[]): Course[] {
  const courseTemplates: Course[] = [
    { id: "c1", title: "Complete Web Development Bootcamp", provider: "Udemy", duration: "63 hours", skills: ["html", "css", "javascript", "react", "node"], rating: 4.7, level: "Beginner" },
    { id: "c2", title: "Advanced React Patterns", provider: "Frontend Masters", duration: "8 hours", skills: ["react", "typescript", "patterns"], rating: 4.9, level: "Advanced" },
    { id: "c3", title: "System Design Interview Prep", provider: "Educative", duration: "20 hours", skills: ["system design", "architecture", "scalability"], rating: 4.8, level: "Advanced" },
    { id: "c4", title: "Docker & Kubernetes Mastery", provider: "Udemy", duration: "22 hours", skills: ["docker", "kubernetes", "devops"], rating: 4.6, level: "Intermediate" },
    { id: "c5", title: "AWS Certified Developer", provider: "A Cloud Guru", duration: "30 hours", skills: ["aws", "cloud", "serverless"], rating: 4.8, level: "Intermediate" },
    { id: "c6", title: "Python for Data Science", provider: "Coursera", duration: "40 hours", skills: ["python", "pandas", "numpy", "data"], rating: 4.7, level: "Beginner" },
    { id: "c7", title: "TypeScript Deep Dive", provider: "Pluralsight", duration: "12 hours", skills: ["typescript", "javascript"], rating: 4.5, level: "Intermediate" },
    { id: "c8", title: "GraphQL Complete Guide", provider: "Udemy", duration: "15 hours", skills: ["graphql", "api", "node"], rating: 4.6, level: "Intermediate" },
    { id: "c9", title: "Machine Learning A-Z", provider: "Coursera", duration: "44 hours", skills: ["ml", "python", "tensorflow"], rating: 4.8, level: "Beginner" },
  ];

  if (missingSkills.length === 0) return courseTemplates.slice(0, 6);

  const lower = missingSkills.map((s) => s.toLowerCase());
  const scored = courseTemplates.map((c) => ({
    ...c,
    relevance: c.skills.filter((s) => lower.some((ms) => ms.includes(s) || s.includes(ms))).length,
  }));
  return scored.sort((a, b) => b.relevance - a.relevance).slice(0, 6);
}

export function getMockVideoRecommendations(): Video[] {
  return [
    { id: "v1", title: "How to Ace Your Technical Interview", category: "interview", duration: "15:42", thumbnail: "", channel: "TechLead" },
    { id: "v2", title: "Resume Tips That Got Me Into FAANG", category: "resume", duration: "12:30", thumbnail: "", channel: "Joma Tech" },
    { id: "v3", title: "System Design Interview: Step By Step", category: "interview", duration: "25:18", thumbnail: "", channel: "Gaurav Sen" },
    { id: "v4", title: "Write a Resume That Stands Out", category: "resume", duration: "10:15", thumbnail: "", channel: "Jeff Su" },
    { id: "v5", title: "Career Advice for Junior Developers", category: "career", duration: "18:45", thumbnail: "", channel: "Fireship" },
    { id: "v6", title: "Behavioral Interview Questions & Answers", category: "interview", duration: "22:10", thumbnail: "", channel: "Dan Croitor" },
    { id: "v7", title: "ATS-Friendly Resume Format Guide", category: "resume", duration: "8:50", thumbnail: "", channel: "Self Made Millennial" },
    { id: "v8", title: "How to Negotiate Your Salary", category: "career", duration: "14:20", thumbnail: "", channel: "Austin Belcak" },
    { id: "v9", title: "Coding Interview Prep in 2 Hours", category: "interview", duration: "1:58:30", thumbnail: "", channel: "NeetCode" },
  ];
}

export function getMockResumeTips(): ResumeTip[] {
  return [
    { id: "t1", title: "Quantify Your Achievements", description: "Replace vague descriptions with measurable results. Instead of 'Improved performance', write 'Reduced API response time by 40%, serving 2M+ daily requests'.", category: "Content" },
    { id: "t2", title: "Use ATS-Friendly Formatting", description: "Stick to standard section headings (Experience, Education, Skills). Avoid tables, graphics, and unusual fonts that ATS systems can't parse.", category: "Formatting" },
    { id: "t3", title: "Tailor Keywords to the Job", description: "Mirror the exact terminology from the job description. If they say 'React.js', use 'React.js' not just 'React'.", category: "Keywords" },
    { id: "t4", title: "Lead with Action Verbs", description: "Start bullet points with strong verbs: Built, Designed, Implemented, Optimized, Led, Reduced, Increased, Automated.", category: "Content" },
    { id: "t5", title: "Keep It to One Page (Usually)", description: "For under 10 years of experience, one page is ideal. Two pages only if you have significant relevant experience to fill it.", category: "Formatting" },
    { id: "t6", title: "Add a Technical Skills Section", description: "List languages, frameworks, tools, and platforms in a dedicated section. Group them by category for easy scanning.", category: "Structure" },
    { id: "t7", title: "Include Relevant Projects", description: "Side projects and open source contributions demonstrate initiative. Include links to live demos or GitHub repos.", category: "Content" },
    { id: "t8", title: "Proofread Thoroughly", description: "Typos and grammar errors signal carelessness. Read your resume aloud, use a spell checker, and have someone else review it.", category: "Quality" },
  ];
}

export function getMockExperienceLevels(count: number): ExperienceData[] {
  const total = count || 50;
  return [
    { level: "Junior (0-2 yrs)", count: Math.round(total * 0.3) },
    { level: "Mid (3-5 yrs)", count: Math.round(total * 0.35) },
    { level: "Senior (6-10 yrs)", count: Math.round(total * 0.25) },
    { level: "Lead (10+ yrs)", count: Math.round(total * 0.1) },
  ];
}

export function getMockPredictedRoles(count: number): RoleData[] {
  const total = count || 50;
  return [
    { role: "Frontend", count: Math.round(total * 0.28) },
    { role: "Backend", count: Math.round(total * 0.25) },
    { role: "Full Stack", count: Math.round(total * 0.22) },
    { role: "DevOps", count: Math.round(total * 0.12) },
    { role: "Data/ML", count: Math.round(total * 0.08) },
    { role: "Other", count: Math.round(total * 0.05) },
  ];
}

export function getMockGeographyData(count: number): { cities: GeoData[]; states: GeoData[]; countries: GeoData[] } {
  const total = count || 50;
  return {
    cities: [
      { name: "San Francisco", count: Math.round(total * 0.18) },
      { name: "New York", count: Math.round(total * 0.15) },
      { name: "Bangalore", count: Math.round(total * 0.14) },
      { name: "London", count: Math.round(total * 0.1) },
      { name: "Seattle", count: Math.round(total * 0.08) },
      { name: "Berlin", count: Math.round(total * 0.06) },
    ],
    states: [
      { name: "California", count: Math.round(total * 0.25) },
      { name: "New York", count: Math.round(total * 0.15) },
      { name: "Karnataka", count: Math.round(total * 0.14) },
      { name: "Washington", count: Math.round(total * 0.1) },
      { name: "Texas", count: Math.round(total * 0.08) },
    ],
    countries: [
      { name: "United States", count: Math.round(total * 0.45) },
      { name: "India", count: Math.round(total * 0.2) },
      { name: "United Kingdom", count: Math.round(total * 0.12) },
      { name: "Germany", count: Math.round(total * 0.08) },
      { name: "Canada", count: Math.round(total * 0.08) },
      { name: "Other", count: Math.round(total * 0.07) },
    ],
  };
}

export function getMockUserCountTimeSeries(days: number): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  let cumulative = 5;
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    cumulative += Math.floor(Math.random() * 4) + 1;
    points.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: cumulative,
    });
  }
  return points;
}
