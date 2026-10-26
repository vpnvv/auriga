#!/usr/bin/env python3
"""
ATS CV Generator for Vipin V V.
Produces deeply tailored, 1-PAGE, single-column, strictly truthful ATS resumes.
Enforces:
- Clean ASCII typography (Zero question marks '?' from Unicode encoding errors)
- Exact 1-Page Layout budgeting optimized for UAE & Global ATS standards
- Dynamic regional contact routing:
  * Dubai / Middle East / UAE positions: +971 556061492 | Dubai, UAE | Immediately Available
  * Kochi / India / Remote India positions: +91 8089564801 | Kochi, Kerala, India
- Dynamic Professional Summary, Skills, and Bullet prioritization per Job Description
- Verified quantifiable metrics (20% API, 15% page performance, Vite migration)
"""

import os
import re
import json
from typing import Dict, Any, List, Tuple, Optional
from scripts.pdf_engine import SimpleATSResumePDF, clean_ascii, validate_pdf_content

# Factual Source CV Baseline (100% Truthful)
CANDIDATE_DATA = {
    "name": "Vipin V V",
    "email": "vipinvv555@gmail.com",
    "phone_india": "+91 8089564801",
    "phone_uae": "+971 556061492",
    "linkedin": "linkedin.com/in/vpnvv",
    "github": "github.com/vpnvv",
    "location_india": "Kochi, Kerala, India",
    "location_uae": "Dubai, UAE",
    "skills": {
        "Frontend": ["React.js", "Next.js", "JavaScript (ES6+)", "TypeScript", "Redux Toolkit", "React Query", "HTML5", "CSS3"],
        "UI Libraries": ["Tailwind CSS", "Bootstrap", "Ant Design", "Mantine UI", "Responsive Design", "WCAG Accessibility"],
        "Performance": ["Code Splitting", "Lazy Loading", "Memoization", "Lighthouse Optimization", "Vite Tooling"],
        "Backend & APIs": ["REST APIs", "Axios", "JWT Authentication", "JSON Handling", "PHP Basics"],
        "Testing & Dev Tools": ["Jest", "React Testing Library", "Git", "GitHub", "SVN", "npm", "Docker Basics", "CI/CD"],
        "AI Tools": ["Gemini AI", "Cursor IDE", "Claude Code", "Prompt Engineering"]
    },
    "experience": [
        {
            "company": "Gewan Info Tech Solutions India Pvt Ltd",
            "dates": "Aug 2025 - Present",
            "role": "Software Developer",
            "location": "Thrissur, Kerala",
            "bullets": [
                "Developed scalable enterprise booking applications using Next.js, React.js, and Mantine UI.",
                "Implemented centralized state management using Redux Toolkit for authentication, approvals, and booking workflows.",
                "Integrated multiple REST APIs with optimized asynchronous data handling using Axios.",
                "Improved frontend performance using memoization, lazy loading, and rendering optimization techniques.",
                "Built reusable UI component architecture to improve scalability and maintainability.",
                "Applied accessibility standards including semantic HTML, keyboard navigation, and ARIA compliance."
            ]
        },
        {
            "company": "Caxita Tech Solutions Pvt Ltd",
            "dates": "Mar 2022 - Jun 2025",
            "role": "React.js Developer",
            "location": "Kochi, Kerala",
            "bullets": [
                "Optimized application performance achieving 20% faster API handling and 15% improved page load speed.",
                "Developed flight booking, hotel booking, and activity booking modules using React.js and Redux Toolkit.",
                "Migrated frontend build tooling from Webpack to Vite, improving development and build performance.",
                "Integrated Google Gemini AI features for intelligent recommendations and AI-powered travel experiences.",
                "Collaborated with UI/UX designers and backend teams within Agile development workflows.",
                "Built responsive and cross-browser compatible interfaces for desktop and mobile platforms."
            ]
        }
    ],
    "projects": [
        {
            "title": "AI Travel Assistant Platform",
            "tech": "React.js, Next.js, Gemini AI",
            "bullet": "Built AI-powered travel assistant with itinerary generation, recommendation features, and responsive dashboards."
        },
        {
            "title": "Corporate Travel Booking Engine",
            "tech": "Next.js, Redux Toolkit",
            "bullet": "Developed enterprise-grade B2B booking workflows, reporting dashboards, and optimized state management."
        }
    ],
    "education": {
        "institution": "College of Applied Science",
        "dates": "2016 - 2019",
        "degree": "Bachelor of Science in Computer Science",
        "location": "Palakkad, Kerala"
    },
    "certifications": "Intel & Digital India: AI For All - AI Appreciate (2025) & AI Aware (2025)"
}


def sanitize_filename(name: str) -> str:
    """Removes special characters to produce a clean filesystem filename."""
    return re.sub(r'[^a-zA-Z0-9_-]', '_', name).strip('_')


def is_uae_job(job: Dict[str, Any]) -> bool:
    """Detects if job is based in Dubai, UAE, or Middle East."""
    loc_str = (job.get("location", "") + " " + job.get("country", "")).lower()
    return any(k in loc_str for k in ["dubai", "uae", "united arab emirates", "ae", "middle east", "abu dhabi", "sharjah"])


def get_candidate_contact(job: Dict[str, Any]) -> Tuple[str, str, Optional[str]]:
    """
    Selects regional phone, location, and availability banner based on job geography.
    UAE Market Standard: Includes UAE phone (+971) and Immediate Availability status.
    """
    if is_uae_job(job):
        phone = CANDIDATE_DATA["phone_uae"]
        loc = CANDIDATE_DATA["location_uae"]
        uae_banner = "Dubai, UAE | Immediately Available | Open to UAE Employment"
        return phone, loc, uae_banner
    
    phone = CANDIDATE_DATA["phone_india"]
    loc = CANDIDATE_DATA["location_india"]
    return phone, loc, None


def score_text_relevance(text: str, jd_lower: str) -> int:
    """Scores a bullet point or skill against the job description based on keyword overlap."""
    score = 0
    words = re.findall(r'\b[a-zA-Z0-9\+\.\#\-]+\b', text.lower())
    for w in words:
        if len(w) > 2 and w in jd_lower:
            score += 2
    for high_imp in ["react", "next.js", "typescript", "redux", "api", "axios", "performance", "vite", "booking", "enterprise", "mantine", "tailwind"]:
        if high_imp in text.lower() and high_imp in jd_lower:
            score += 5
    return score


def tailor_professional_summary(job: Dict[str, Any]) -> str:
    """
    Synthesizes a punchy, ATS-optimized Professional Summary aligned directly
    with the target job description while strictly honoring factual truth.
    Targeted length: 3-4 lines (45-55 words).
    """
    jd_desc = (job.get("title", "") + " " + job.get("description", "")).lower()
    
    target_title = job.get("title", "Frontend Developer")
    if "next" in target_title.lower() or "next.js" in jd_desc:
        primary_focus = "React.js and Next.js"
    elif "react" in target_title.lower():
        primary_focus = "React.js and TypeScript"
    else:
        primary_focus = "modern React.js, Next.js, and frontend engineering"

    if "performance" in jd_desc or "optimization" in jd_desc or "memoization" in jd_desc:
        angle = (
            "Specialized in frontend performance optimization, reusable component architecture, and asynchronous data handling. "
            "Proven track record of achieving a 20% faster API response handling time and a 15% improvement in page load speed "
            "through code splitting, memoization, and modern build tooling with Vite."
        )
    elif "enterprise" in jd_desc or "b2b" in jd_desc or "booking" in jd_desc or "portal" in jd_desc:
        angle = (
            "Experienced in engineering high-throughput enterprise booking engines, B2B workflow portals, and scalable UI component libraries. "
            "Skilled in centralized state management using Redux Toolkit, REST API integration with Axios, and WCAG accessibility compliance."
        )
    elif "mantine" in jd_desc or "tailwind" in jd_desc or "ui" in jd_desc:
        angle = (
            "Demonstrated expertise in architecting modular, accessible UI systems using Mantine UI, Tailwind CSS, and Redux Toolkit. "
            "Adept at integrating complex backend REST APIs, optimizing client-side rendering, and collaborating in Agile engineering teams."
        )
    else:
        angle = (
            "Experienced in frontend architecture, reusable component systems, REST API integration, accessibility standards, "
            "and performance optimization. Strong background in Agile methodologies, state management, and modern development workflows."
        )

    summary = (
        f"Software Developer with 4+ years of professional experience building scalable, responsive, and enterprise-grade web applications "
        f"using {primary_focus}. {angle}"
    )
    return clean_ascii(summary)


def tailor_skills_section(jd_lower: str) -> List[Tuple[str, str]]:
    """
    Ranks skill categories and sorts individual skills so that JD-relevant
    technologies are highlighted at the top for ATS keyword parsers.
    """
    scored_categories = []
    
    for category, skill_list in CANDIDATE_DATA["skills"].items():
        sorted_skills = sorted(skill_list, key=lambda s: score_text_relevance(s, jd_lower), reverse=True)
        cat_score = sum([score_text_relevance(s, jd_lower) for s in sorted_skills])
        
        if category.lower() in jd_lower:
            cat_score += 10
            
        scored_categories.append((cat_score, category, ", ".join(sorted_skills)))

    scored_categories.sort(key=lambda x: x[0], reverse=True)
    return [(clean_ascii(item[1]), clean_ascii(item[2])) for item in scored_categories]


def tailor_experience_bullets(bullets: List[str], jd_lower: str, max_bullets: int = 4) -> List[str]:
    """Sorts verified experience bullets by JD relevance and selects the top curated bullets to maintain 1-page fit."""
    sorted_b = sorted(bullets, key=lambda b: score_text_relevance(b, jd_lower), reverse=True)
    return [clean_ascii(b) for b in sorted_b[:max_bullets]]


def build_tailored_cv(job: Dict[str, Any], output_dir: str) -> Dict[str, Any]:
    """Generates an ATS-compliant tailored PDF for the specific job and validates text."""
    os.makedirs(output_dir, exist_ok=True)
    
    company_clean = sanitize_filename(job.get("company", "Company"))
    title_clean = sanitize_filename(job.get("title", "Role")[:25])
    pdf_filename = f"Vipin_VV_{company_clean}_{title_clean}_ATS_CV.pdf"
    pdf_path = os.path.join(output_dir, pdf_filename)

    jd_lower = (job.get("title", "") + " " + job.get("description", "")).lower()

    pdf = SimpleATSResumePDF()

    # 1. Header with Geographic Routing & Role Subtitle
    phone_number, candidate_location, uae_banner = get_candidate_contact(job)
    
    contacts = [
        phone_number,
        CANDIDATE_DATA["email"],
        CANDIDATE_DATA["linkedin"],
        CANDIDATE_DATA["github"]
    ]
    if not uae_banner:
        contacts.append(candidate_location)

    # Subtitle aligned with target JD profile (clean ASCII)
    job_title = job.get("title", "")
    if "next" in job_title.lower():
        aligned_subtitle = "Frontend Developer | React.js & Next.js Developer | Software Developer"
    elif "react" in job_title.lower():
        aligned_subtitle = "Frontend Developer | React.js Developer | Software Developer"
    else:
        aligned_subtitle = "Frontend Developer | ReactJS Developer | Software Developer"

    pdf.add_header(CANDIDATE_DATA["name"], aligned_subtitle, contacts, location_extra=uae_banner)

    # 2. Professional Summary (Dynamically Tailored, 3-4 lines)
    pdf.add_section_title("Professional Summary")
    summary = tailor_professional_summary(job)
    pdf.add_paragraph(summary, font_size=8.5, line_height=11.0)

    # 3. Technical Skills (Dynamically Prioritized Categories & Keywords)
    pdf.add_section_title("Technical Skills")
    tailored_skills = tailor_skills_section(jd_lower)
    for category, skills_str in tailored_skills:
        pdf.add_skill_category(category, skills_str, font_size=8.2, line_height=10.5)

    # 4. Professional Experience (Top 4 Curated Bullets per Role)
    pdf.add_section_title("Professional Experience")
    for exp in CANDIDATE_DATA["experience"]:
        pdf.add_job_header(exp["company"], exp["dates"], exp["role"], exp["location"])
        curated_bullets = tailor_experience_bullets(exp["bullets"], jd_lower, max_bullets=4)
        for b in curated_bullets:
            pdf.add_bullet(b, font_size=8.2, line_height=10.5)

    # 5. Key Projects (1 Bullet per project)
    pdf.add_section_title("Key Projects")
    for proj in CANDIDATE_DATA["projects"]:
        pdf.add_job_header(proj["title"], proj["tech"], "Enterprise Web Application", "")
        pdf.add_bullet(proj["bullet"], font_size=8.2, line_height=10.5)

    # 6. Education & Certifications (Combined for clean 1-Page Layout)
    pdf.add_section_title("Education & Certifications")
    edu = CANDIDATE_DATA["education"]
    pdf.add_job_header(edu["institution"], edu["dates"], edu["degree"], edu["location"])
    pdf.add_bullet(CANDIDATE_DATA["certifications"], font_size=8.2, line_height=10.5)

    # Save PDF
    pdf.save(pdf_path)

    # 7. Strict ATS & Quality Verification
    total_pages = len(pdf.pages)
    required_strings = [
        "Vipin V V",
        "vipinvv555@gmail.com",
        phone_number,
        "Gewan Info Tech Solutions India Pvt Ltd",
        "Caxita Tech Solutions Pvt Ltd",
        "College of Applied Science",
        "20%",
        "15%"
    ]
    is_valid, missing, extracted_text = validate_pdf_content(pdf_path, required_strings)

    # Flag page count overflow as a quality error
    if total_pages > 1:
        missing.append(f"WARNING: PDF exceeded 1-page budget ({total_pages} pages). Expected exact 1-page fit.")
        is_valid = False

    return {
        "filename": pdf_filename,
        "filepath": pdf_path,
        "is_valid": is_valid,
        "total_pages": total_pages,
        "missing_strings": missing,
        "file_size_bytes": os.path.getsize(pdf_path),
        "job_title": job.get("title"),
        "company": job.get("company"),
        "location": job.get("location"),
        "contact_phone_used": phone_number,
        "contact_location_used": candidate_location,
        "job_url": job.get("url"),
        "tailored_summary_excerpt": summary[:120] + "..."
    }


def generate_cv_batch(ranked_jobs: List[Dict[str, Any]], output_dir: str) -> Dict[str, Any]:
    """Generates tailored CVs for all ranked jobs and produces manifest.json."""
    manifest = []
    all_valid = True

    for job in ranked_jobs:
        result = build_tailored_cv(job, output_dir)
        manifest.append(result)
        if not result["is_valid"]:
            all_valid = False

    manifest_path = os.path.join(output_dir, "manifest.json")
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)

    return {
        "manifest_path": manifest_path,
        "total_generated": len(manifest),
        "all_valid": all_valid,
        "items": manifest
    }
