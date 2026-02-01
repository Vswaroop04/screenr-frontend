// Curated video recommendations for interview prep and resume tips

export interface VideoRecommendation {
  title: string;
  channel: string;
  url: string;
  category: "interview_prep" | "resume_tips" | "career_advice" | "skill_specific";
  tags: string[];
}

const videoDatabase: VideoRecommendation[] = [
  // Interview Prep
  {
    title: "How to Ace Your Technical Interview",
    channel: "TechLead",
    url: "https://www.youtube.com/watch?v=1t1_a1BZ04o",
    category: "interview_prep",
    tags: ["software engineer", "developer", "technical"],
  },
  {
    title: "System Design Interview - Step by Step Guide",
    channel: "Gaurav Sen",
    url: "https://www.youtube.com/watch?v=bUHFg8CZFws",
    category: "interview_prep",
    tags: ["system design", "senior", "backend", "architect"],
  },
  {
    title: "Behavioral Interview Tips - STAR Method",
    channel: "Jeff Su",
    url: "https://www.youtube.com/watch?v=CqKHVBE_gAI",
    category: "interview_prep",
    tags: ["behavioral", "leadership", "manager"],
  },
  {
    title: "Top Coding Interview Patterns",
    channel: "NeetCode",
    url: "https://www.youtube.com/watch?v=DjYZk8nrXVY",
    category: "interview_prep",
    tags: ["coding", "algorithms", "data structures", "developer"],
  },
  // Resume Tips
  {
    title: "How to Write a Resume That Gets Interviews",
    channel: "Jeff Su",
    url: "https://www.youtube.com/watch?v=BYUy1yvjHxE",
    category: "resume_tips",
    tags: ["resume", "general"],
  },
  {
    title: "Resume Tips for Software Engineers",
    channel: "Clément Mihailescu",
    url: "https://www.youtube.com/watch?v=aKjsy-b00QM",
    category: "resume_tips",
    tags: ["software engineer", "developer", "technical"],
  },
  {
    title: "How to Write Impactful Resume Bullet Points",
    channel: "CareerVidz",
    url: "https://www.youtube.com/watch?v=GyjzOKdaioU",
    category: "resume_tips",
    tags: ["resume", "content", "general"],
  },
  // Career Advice
  {
    title: "How to Stand Out as a Developer in 2025",
    channel: "Fireship",
    url: "https://www.youtube.com/watch?v=Uo3cL4nrGOk",
    category: "career_advice",
    tags: ["developer", "career", "growth"],
  },
  {
    title: "How to Negotiate Your Salary",
    channel: "Rahul Pandey",
    url: "https://www.youtube.com/watch?v=fyn0CKPNZqs",
    category: "career_advice",
    tags: ["salary", "negotiation", "career"],
  },
  // Skill-specific
  {
    title: "React in 100 Seconds",
    channel: "Fireship",
    url: "https://www.youtube.com/watch?v=Tn6-PIqc4UM",
    category: "skill_specific",
    tags: ["react", "javascript", "frontend"],
  },
  {
    title: "TypeScript Full Course for Beginners",
    channel: "Dave Gray",
    url: "https://www.youtube.com/watch?v=gieEQFIfgYc",
    category: "skill_specific",
    tags: ["typescript", "javascript"],
  },
  {
    title: "Docker in 100 Seconds",
    channel: "Fireship",
    url: "https://www.youtube.com/watch?v=Gjnup-PuquQ",
    category: "skill_specific",
    tags: ["docker", "devops", "containers"],
  },
  {
    title: "AWS Services Explained in 10 Minutes",
    channel: "Fireship",
    url: "https://www.youtube.com/watch?v=JIbIYCM48to",
    category: "skill_specific",
    tags: ["aws", "cloud", "devops"],
  },
  {
    title: "Python for Beginners - Full Course",
    channel: "Programming with Mosh",
    url: "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
    category: "skill_specific",
    tags: ["python", "backend", "data science"],
  },
  {
    title: "Node.js Full Course for Beginners",
    channel: "Dave Gray",
    url: "https://www.youtube.com/watch?v=f2EqECiTBL8",
    category: "skill_specific",
    tags: ["node.js", "nodejs", "backend", "javascript"],
  },
];

export function getRecommendedVideos(
  roles: string[],
  skillGaps: string[],
  limit = 6
): VideoRecommendation[] {
  const searchTerms = [
    ...roles.map((r) => r.toLowerCase()),
    ...skillGaps.map((s) => s.toLowerCase()),
  ];

  // Score each video by relevance
  const scored = videoDatabase.map((video) => {
    let score = 0;
    const lowerTags = video.tags.map((t) => t.toLowerCase());

    for (const term of searchTerms) {
      for (const tag of lowerTags) {
        if (tag.includes(term) || term.includes(tag)) {
          score += 2;
        }
      }
    }

    // Boost general resume/interview content
    if (video.category === "resume_tips") score += 1;
    if (video.category === "interview_prep") score += 1;

    return { video, score };
  });

  // Sort by score descending, take top N
  scored.sort((a, b) => b.score - a.score);

  // Ensure at least one from each useful category
  const result: VideoRecommendation[] = [];
  const categories = ["interview_prep", "resume_tips"] as const;

  for (const cat of categories) {
    const best = scored.find(
      (s) => s.video.category === cat && !result.includes(s.video)
    );
    if (best) result.push(best.video);
  }

  // Fill remaining slots
  for (const s of scored) {
    if (result.length >= limit) break;
    if (!result.includes(s.video)) {
      result.push(s.video);
    }
  }

  return result.slice(0, limit);
}
