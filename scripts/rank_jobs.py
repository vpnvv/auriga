#!/usr/bin/env python3
"""
Transparent 100-Point Job Ranking & Evaluation Engine for Vipin V V.
Evaluates candidate CV alignment, detects skill gaps without hallucination,
and enforces strict 24-hour mandatory gate filters.
"""

import time
from typing import Dict, Any, List, Tuple

# Vipin's Verified Technical Baseline from Source CV
CANDIDATE_SKILLS = {
    "react.js": "React.js",
    "react": "React.js",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "javascript": "JavaScript (ES6+)",
    "typescript": "TypeScript",
    "redux toolkit": "Redux Toolkit",
    "redux": "Redux Toolkit",
    "react query": "React Query",
    "context api": "Context API",
    "react hooks": "React Hooks",
    "hooks": "React Hooks",
    "html5": "HTML5",
    "css3": "CSS3",
    "tailwind css": "Tailwind CSS",
    "tailwind": "Tailwind CSS",
    "bootstrap": "Bootstrap",
    "ant design": "Ant Design",
    "mantine ui": "Mantine UI",
    "mantine": "Mantine UI",
    "rest apis": "REST APIs",
    "rest api": "REST APIs",
    "axios": "Axios",
    "jwt": "JWT Authentication",
    "code splitting": "Code Splitting",
    "lazy loading": "Lazy Loading",
    "memoization": "Memoization",
    "lighthouse": "Lighthouse Optimization",
    "vite": "Vite",
    "git": "Git",
    "github": "GitHub",
    "jest": "Jest",
    "accessibility": "WCAG Accessibility",
    "wcag": "WCAG Accessibility",
    "gemini ai": "Gemini AI",
    "travel booking": "Travel Booking Engines",
    "booking": "Enterprise Booking Platforms"
}

def evaluate_job(job: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
    """
    Applies 5 mandatory filters, then calculates the 100-point transparent score.
    Returns (passed_mandatory, reason, scored_details).
    """
    # Filter 1: Relevant Target Role
    title_lower = job.get("title", "").lower()
    valid_roles = ["react", "frontend", "front-end", "software developer", "web developer", "ui engineer", "javascript developer"]
    if not any(r in title_lower for r in valid_roles):
        return False, f"Role title '{job.get('title')}' does not match target frontend/React developer profiles.", {}

    # Filter 2: Eligible Location & Work Arrangement
    loc_lower = job.get("location", "").lower()
    mode_lower = job.get("work_mode", "").lower()
    country = job.get("country", "").upper()
    
    is_kochi = "kochi" in loc_lower or "infopark" in loc_lower or "kalamassery" in loc_lower
    is_dubai = "dubai" in loc_lower or "uae" in loc_lower or "united arab emirates" in loc_lower
    is_remote_india = ("remote" in loc_lower or mode_lower == "remote") and (country == "IN" or "india" in loc_lower)
    
    if not (is_kochi or is_dubai or is_remote_india):
        return False, f"Location '{job.get('location')}' does not match Kochi, Remote India, or Dubai/UAE criteria.", {}

    # Filter 3: Verifiable Posting within 24 Hours
    age_hours = job.get("posted_age_hours", 999)
    is_date_verified = job.get("is_date_verified", False)
    if not is_date_verified or age_hours > 24:
        return False, f"Posting date cannot be verified within past 24 hours (Age: {age_hours} hrs, Verified: {is_date_verified}).", {}

    # Filter 4: Actionable Genuine Vacancy URL
    url = job.get("url", "")
    if not url or not url.startswith("http"):
        return False, "Missing genuine, usable source URL.", {}

    # Filter 5: Deduplication Check handled in batch caller

    # -------------------------------------------------------------
    # 100-POINT TRANSPARENT SCORING
    # -------------------------------------------------------------
    desc_lower = job.get("description", "").lower()
    
    # 1. Technical Stack Match (Max 30)
    tech_score = 0
    matched_tech = []
    missing_requirements = []
    
    if "react" in desc_lower or "react.js" in desc_lower:
        tech_score += 8
        matched_tech.append("React.js")
    if "next" in desc_lower or "next.js" in desc_lower:
        tech_score += 6
        matched_tech.append("Next.js")
    if "typescript" in desc_lower or "javascript" in desc_lower:
        tech_score += 5
        matched_tech.append("TypeScript / ES6+")
    if "redux" in desc_lower or "state management" in desc_lower or "context" in desc_lower:
        tech_score += 4
        matched_tech.append("Redux Toolkit / State Architecture")
    if any(k in desc_lower for k in ["tailwind", "mantine", "bootstrap", "ant design", "css"]):
        tech_score += 4
        matched_tech.append("Modern UI Styling (Tailwind/Mantine)")
    if "rest" in desc_lower or "axios" in desc_lower or "api" in desc_lower:
        tech_score += 3
        matched_tech.append("REST APIs & Asynchronous Axios")
    tech_score = min(tech_score, 30)

    # Detect technologies mentioned in JD that Vipin's CV does not demonstrate
    potential_techs = ["graphql", "aws", "docker", "python", "angular", "vue", "ci/cd pipeline authoring", "kubernetes"]
    for t in potential_techs:
        if t in desc_lower and t not in [m.lower() for m in matched_tech]:
            missing_requirements.append(f"{t.upper()} (Not demonstrated in the CV)")

    # 2. Domain & Experience Match (Max 25)
    domain_score = 10 # Base 4+ years frontend development experience
    relevant_achievements = [
        "4+ years enterprise frontend engineering experience",
        "Built production web applications with React.js, Next.js, and Redux Toolkit"
    ]
    if any(k in desc_lower for k in ["booking", "travel", "b2b", "enterprise", "portal", "workflow"]):
        domain_score += 15
        relevant_achievements.append("Direct domain experience in enterprise booking platforms, flight/hotel engines, and B2B workflows")
    else:
        domain_score += 8
    domain_score = min(domain_score, 25)

    # 3. Architecture & Performance Depth (Max 20)
    arch_score = 0
    if any(k in desc_lower for k in ["component", "reusable", "architecture", "design system"]):
        arch_score += 5
        relevant_achievements.append("Built scalable reusable UI component architecture improving maintainability")
    if any(k in desc_lower for k in ["performance", "optimization", "lazy loading", "code splitting", "memoization", "speed"]):
        arch_score += 6
        relevant_achievements.append("Achieved 20% faster API response handling and 15% improved page load speed")
    if any(k in desc_lower for k in ["vite", "webpack", "build", "tooling"]):
        arch_score += 5
        relevant_achievements.append("Proven migration expertise from Webpack to Vite for improved build performance")
    if any(k in desc_lower for k in ["accessibility", "wcag", "aria", "semantic"]):
        arch_score += 4
        relevant_achievements.append("Implemented WCAG accessibility standards, semantic HTML, and ARIA compliance")
    arch_score = min(arch_score, 20)

    # 4. Location & Work Arrangement (Max 15)
    loc_score = 0
    if is_kochi:
        loc_score = 15
    elif is_remote_india:
        loc_score = 15
    elif is_dubai:
        loc_score = 15
    else:
        loc_score = 12

    # 5. Seniority & Required Experience (Max 10)
    req_exp = job.get("experience_required_years", 4)
    sen_score = 0
    experience_gap_note = "Exact fit: Role requests ~4 years, perfectly aligned with Vipin's 4+ years frontend tenure."
    if req_exp <= 5 and req_exp >= 3:
        sen_score = 10
    elif req_exp < 3:
        sen_score = 8
        experience_gap_note = "Strong fit: Role is suited for 1-2 years; Vipin brings senior-level 4+ years architectural depth."
    elif req_exp <= 7:
        sen_score = 7
        experience_gap_note = f"Minor experience gap: Role requests {req_exp} years; Vipin brings 4+ years with proven measurable production results (20% API speedup, 15% load time improvement)."
    else:
        sen_score = 4
        experience_gap_note = f"Notable experience gap: Role requests {req_exp}+ years."

    total_score = tech_score + domain_score + arch_score + loc_score + sen_score

    score_explanation = (
        f"Total Match Score: {total_score}/100. "
        f"Breakdown: Tech Stack ({tech_score}/30), Domain Fit ({domain_score}/25), "
        f"Architecture & Performance ({arch_score}/20), Location Alignment ({loc_score}/15), "
        f"Seniority Fit ({sen_score}/10)."
    )

    scored_details = {
        **job,
        "total_score": total_score,
        "score_breakdown": {
            "tech_stack": tech_score,
            "domain_experience": domain_score,
            "architecture_performance": arch_score,
            "location_arrangement": loc_score,
            "seniority_fit": sen_score
        },
        "score_explanation": score_explanation,
        "matched_technologies": matched_tech,
        "relevant_achievements": relevant_achievements,
        "missing_requirements": missing_requirements or ["None identified from published JD"],
        "experience_gap_note": experience_gap_note,
        "work_authorization": "Eligible for India & remote; open to UAE sponsorship/employment"
    }

    return True, "Passed all mandatory filters", scored_details


def rank_jobs(job_list: List[Dict[str, Any]], max_final_jobs: int = 5) -> List[Dict[str, Any]]:
    """Filters and ranks verified jobs in descending score order."""
    evaluated = []
    seen_signatures = set()

    for j in job_list:
        sig = f"{j.get('company', '').lower()}:::{j.get('title', '').lower()}"
        if sig in seen_signatures:
            continue
        
        passed, reason, details = evaluate_job(j)
        if passed:
            seen_signatures.add(sig)
            evaluated.append(details)

    # Sort descending by total_score
    evaluated.sort(key=lambda x: x["total_score"], reverse=True)
    return evaluated[:max_final_jobs]
