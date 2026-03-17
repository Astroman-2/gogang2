# RC Interview — Interview Prep Platform

A fully self-contained, zero-dependency interview preparation web application. Built to prepare for technical roles using job descriptions as the source of truth.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📌 Multi-JD Support | Upload multiple JDs — each gets its own prep board and tab |
| 🗂️ Sidebar Navigation | Section-aware nav with completion indicators |
| 📋 Topic Cards | Every topic opens a full detail page with sub-sections |
| ✅ Checklists | Click any item → moves to the right-side completed panel |
| ↩ Undo | Restore items from the right panel back to active |
| 🃏 Flashcards | Flip cards for key concepts |
| ❓ MCQ Quiz | Scored practice questions with explanations |
| 🔗 Article Links | Curated external resources per topic |
| 📎 File Upload | Upload TXT/MD files → auto-extracts checklist items |
| 💾 Persistence | Progress saved to `localStorage` across sessions |
| ➕ Add JD | Upload PDF/TXT of any JD → auto-parsed into sections |

---

## 🚀 Quick Start

### Option 1: Just open it
```bash
open index.html
```

### Option 2: Serve locally (recommended)
```bash
# Python
python3 -m http.server 8080

# Node
npx serve .

# VS Code
# Use the Live Server extension
```

Then visit `http://localhost:8080`

---

## 📁 Structure

```
RC-Interview/
├── index.html      # Complete app — all HTML, CSS, JavaScript in one file
└── README.md       # This file
```

This is intentionally a **single-file architecture** for maximum portability — works offline, no npm, no build step, no frameworks.

---

## 🔧 How to Add a New Job Description

### Method 1: In-app Upload (Recommended)
1. Click **"＋ Add JD"** in the top navigation bar
2. Upload a `.pdf` or `.txt` file, or paste the JD text
3. Give it a name → click **"Create Prep Board"**
4. The app parses sections automatically and creates a new tab

### Method 2: Hard-code a JD (for persistent JDs)
In `index.html`, find the `RC_JD` object and duplicate it with new content:

```javascript
const MY_JD = {
  id: 'jd-company-role',
  name: 'Google – SRE',
  role: 'Site Reliability Engineer',
  company: 'Google',
  location: 'Remote · Full-Time · 5+ yrs',
  chips: [
    { label: 'Experience', value: '5+ yrs' },
    { label: 'Domain', value: 'Infrastructure' },
  ],
  sections: [
    { id: 'overview', icon: '🏠', label: 'Overview', type: 'overview' },
    {
      id: 'what-you-will-do',
      icon: '📋',
      label: 'What You Will Do',
      type: 'topics',
      topics: [
        {
          id: 'reliability',
          icon: '🔧',
          title: 'Reliability Engineering',
          sub: 'SLOs, error budgets, incident response',
          color: 'teal',
          sections: [
            {
              id: 'rel-prep',
              label: 'Preparation',
              checklist: [
                { id: 'rel-1', label: 'Define SLO vs SLA vs SLI', sub: 'Critical concept — be ready with examples' },
              ]
            }
          ],
          articles: [
            { icon: '📖', title: 'Google SRE Book', src: 'sre.google', url: 'https://sre.google/sre-book/table-of-contents/' }
          ]
        }
      ]
    }
  ]
};

// Then push it into DB on init:
DB.jds.push(MY_JD);
```

---

## 🎨 Design System

```css
--bg:       #07090f   /* Page background */
--surface:  #0f1420   /* Cards, sidebar */
--accent:   #00cfa8   /* Primary teal */
--accent2:  #ff5c35   /* Orange (errors, hard) */
--accent3:  #6d5fff   /* Purple (highlights) */
--gold:     #f0b429   /* Medium difficulty */
--text:     #dde4f0   /* Primary text */
--text2:    #8a9ab8   /* Secondary text */
--text3:    #4a5a78   /* Muted text */
```

---

## 📊 Data Architecture

All content lives in JD objects with the following section types:

| Type | Description |
|---|---|
| `overview` | Auto-generated progress overview page |
| `topics` | Grid of clickable topic cards → each opens a detail overlay |
| `requirements` | Checklist + flashcards + MCQ quiz combined |
| `preferred` | Grid of topic cards → interview Q&A focused detail pages |
| `dynamic` | Auto-generated from uploaded JD text |

---

## 💡 Extending the App

### Add more MCQ questions
Find `mcqs: [...]` inside the `looking-for` section and add:
```javascript
{
  q: 'Your question here?',
  opts: ['Option A', 'Option B', 'Option C', 'Option D'],
  ans: 1,  // 0-indexed correct answer
  exp: 'Explanation shown after answering.'
}
```

### Add more flashcards
Find `flashcards: [...]` and add:
```javascript
{ tag: 'Category', q: 'Question?', a: 'Answer.' }
```

### Add more interview Q&A
Find `interviewQs: [...]` inside any topic and add:
```javascript
{
  q: 'Interview question here?',
  diff: 'med',  // easy | med | hard
  a: 'Full HTML answer with <strong>emphasis</strong> and <ul><li>bullets</li></ul>'
}
```

---

## 🗃️ Git Setup

```bash
git init
git add .
git commit -m "feat: initial RC Interview prep app"
git remote add origin https://github.com/YOUR_USERNAME/RC-Interview.git
git push -u origin main
```

### Suggested `.gitignore`
```
.DS_Store
Thumbs.db
*.log
node_modules/
```

---

## 🌐 Deploy

**GitHub Pages** (free, instant):
1. Push to GitHub
2. Settings → Pages → Source: `main` branch, `/ (root)`
3. Visit `https://yourusername.github.io/RC-Interview`

**Netlify Drop** (drag & drop):
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the `RC-Interview` folder
3. Instant live URL

---

## 📝 License

Personal use. Modify freely.
