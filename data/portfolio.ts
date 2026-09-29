// ✏️ Single source of truth for the whole site. Fill in the empty strings in `links` and `project`.
export type PFile = { name: string; icon: "cpp" | "h" | "json"; code: string; output: string[] };

export const profile = {
  name: "Divyansh Kumar Srivastava",
  role: "Software Developer",
  university: "VIT Bhopal University",
  degree: "B.Tech Computer Science Engineering",
  cgpa: "9.11/10",
  graduation: "2027",
};

// The resume is served from /public/resume.pdf, so it lives at /resume.pdf (works locally and on Vercel).
export const links = {
  github: "https://github.com/idivyanshsn",
  linkedin: "https://www.linkedin.com/in/divyansh-srivastavaa/",
  leetcode: "https://leetcode.com/u/idivyansh_sn/",
  resume: "/resume.pdf",
};

// Details taken from the resume.
export const project = {
  name: "CodePrep.AI",
  summary: "Full-stack AI interview platform that analyzes resumes and generates personalized mock interviews.",
  stack: "React.js, Node.js, Express.js, MongoDB, Firebase, OpenRouter, PDF.js, Redux Toolkit",
  repo: "https://github.com/idivyanshsn/CodePrep",
  live: "https://codeprep-frontend-hrqz.onrender.com/",
};

// Shared so the achievements shown in education.json and the terminal's `achievements`
// command never drift apart.
export const achievements = [
  "12+ S grades (maximum grade) across core subjects",
  "Consistent strong academic performance",
  "NPTEL Gold Medal in Marketing Analytics",
];

const v = (s: string) => s || "to be added";
const q = (s: string) => (s ? `"${s}"` : `"to be added"`);

export const files: PFile[] = [
  {
    name: "main.cpp", icon: "cpp",
    code: `// ───────────────────────────────────────────
// main.cpp
// ${profile.name}
// ${profile.role}
// ───────────────────────────────────────────

#include "skills.h"

int main() {

    Developer divyansh;

    divyansh.name = "${profile.name}";
    divyansh.role = "${profile.role}";
    divyansh.education = "${profile.degree}";
    divyansh.university = "${profile.university}";
    divyansh.graduation = ${profile.graduation};
    divyansh.cgpa = ${profile.cgpa.split("/")[0]};

    divyansh.achievements = {
        "12+ S Grades",
        "NPTEL Gold Medal - Marketing Analytics"
    };

    divyansh.interests = {
        "Data Structures & Algorithms",
        "Full Stack Development",
        "Backend Development",
        "Machine Learning"
    };

    divyansh.projects = {
        "${project.name}"
    };

    return 0;
}`,
    output: [
      `${profile.name} — ${profile.role}`,
      `${profile.degree}, ${profile.university}`,
      `Graduation: ${profile.graduation}  |  CGPA: ${profile.cgpa}`,
      "Achievements: 12+ S Grades, NPTEL Gold Medal - Marketing Analytics",
      "Interests   : Data Structures & Algorithms, Full Stack Development,",
      "              Backend Development, Machine Learning",
      `Projects    : ${project.name}`,
      "Tip: open projects.cpp, or type 'help' in the terminal.",
    ],
  },
  {
    name: "skills.h", icon: "h",
    code: `#pragma once
#include <string>
#include <vector>

// Shared by main.cpp
struct Developer {
  std::string name;
  std::string role;
  std::string education;
  std::string university;
  int graduation;
  double cgpa;
  std::vector<std::string> achievements;
  std::vector<std::string> interests;
  std::vector<std::string> projects;
};

const std::vector<std::string> languages = { "C++", "Java", "Python", "JavaScript" };

const std::vector<std::string> technologies = {
  "React.js", "Node.js", "Express.js", "MongoDB", "MySQL",
  "HTML", "CSS", "JavaScript", "AWS", "Git/GitHub"
};`,
    output: [
      "Languages   : C++, Java, Python, JavaScript",
      "Technologies: React.js, Node.js, Express.js, MongoDB, MySQL,",
      "              HTML, CSS, JavaScript, AWS, Git/GitHub",
    ],
  },
  {
    name: "projects.cpp", icon: "cpp",
    code: `// Main project
struct Project {
  std::string name, summary, stack, repo, live;
};

Project main_project = {
  .name    = "${project.name}",
  .summary = ${q(project.summary)},
  .stack   = ${q(project.stack)},
  .repo    = ${q(project.repo)},
  .live    = ${q(project.live)},
};`,
    output: [
      `Project: ${project.name}`,
      `Summary: ${v(project.summary)}`,
      `Stack  : ${v(project.stack)}`,
      `Repo   : ${v(project.repo)}`,
      `Live   : ${v(project.live)}`,
    ],
  },
  {
    name: "education.json", icon: "json",
    code: `{
  "degree": "${profile.degree}",
  "university": "${profile.university}",
  "cgpa": "${profile.cgpa}",
  "graduation": "${profile.graduation}",
  "achievements": [
${achievements.map((a) => `    "${a}"`).join(",\n")}
  ]
}`,
    output: [
      `${profile.degree}, ${profile.university}`,
      `CGPA: ${profile.cgpa}  |  Graduation: ${profile.graduation}`,
      ...achievements.map((a) => `- ${a}`),
    ],
  },
  {
    name: "contact.cpp", icon: "cpp",
    code: `// Let's connect. Type github, linkedin, leetcode or resume in the terminal.
void contact() {
  const char* github   = ${q(links.github)};
  const char* linkedin = ${q(links.linkedin)};
  const char* leetcode = ${q(links.leetcode)};
  const char* resume   = ${q(links.resume)};
}`,
    output: [
      `github  : ${v(links.github)}`,
      `linkedin: ${v(links.linkedin)}`,
      `leetcode: ${v(links.leetcode)}`,
      `resume  : ${v(links.resume)}`,
    ],
  },
];
