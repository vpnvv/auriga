# ATS Resume Tailoring and PDF Integrity Rules

## 1. Ethical & Factual Grounding (Zero Hallucination)
- **Source of Truth**: `./Vipin_V_V_FrontEnd_Developer_CV.pdf`.
- **Preserved Contact Information**:
  - Name: Vipin V V
  - Phone: +91 8089564801
  - Email: vipinvv555@gmail.com
  - LinkedIn: linkedin.com/in/vpnvv
  - GitHub: github.com/vpnvv
  - Location: Kochi, Kerala, India
- **Absolute Prohibitions**:
  1. Never invent or falsify experience, employment dates, degrees, certifications, metrics, or responsibilities.
  2. Never alter employer names (`Gewan Info Tech Solutions India Pvt Ltd`, `Caxita Tech Solutions Pvt Ltd`) or job titles (`Software Developer`, `React.js Developer`) to match the advertised role.
  3. Never copy-paste verbatim job descriptions or inject invisible/white text, hidden keywords, or manipulative metadata.
  4. Never claim proficiency in tools or frameworks not documented in the source CV (e.g., Vue.js, Angular, Django, Go).
  5. Never make unverified claims regarding visa sponsorship, work permits, or international relocation.
  6. Verified metrics must strictly be:
     - `20% faster API response handling`
     - `15% improved page load performance`
     - `Migration from Webpack to Vite`
     Do not invent new percentages, dollar amounts, or team headcounts.

---

## 2. Permitted ATS Tailoring Strategies
- **Professional Summary Prioritization**: Adjust the summary opening to highlight the specific technologies and architectural strengths most relevant to the target job (e.g., emphasizing Next.js and Mantine UI for enterprise roles, or React.js and performance tuning for travel portals).
- **Skill Keyword Ordering**: Group and prioritize verified technical skills based on the employer's listed requirements (e.g., placing TypeScript and Redux Toolkit first if emphasized in the JD).
- **Bullet Point Highlighting**: Reorder existing verified bullet points under Gewan Info Tech Solutions or Caxita Tech Solutions so that the most relevant achievements appear at the top.
- **Natural Keyword Alignment**: Use industry-standard terminology already evidenced by the candidate's work (e.g., "state management architecture", "responsive UI engineering", "accessible web development").

---

## 3. Strict ATS Layout & Formatting Specifications
- **Structure**: Strict single-column layout with consistent vertical flow.
- **Typography**: Standard Type 1 font (Helvetica / Helvetica-Bold) readable by all enterprise ATS engines (Workday, Greenhouse, Lever, Taleo, iCIMS).
- **Section Headings**: Standard, clear headings:
  - `Professional Summary`
  - `Technical Skills`
  - `Professional Experience`
  - `Projects`
  - `Certifications`
  - `Education`
- **Prohibited Layout Elements**:
  - NO multi-column tables, skill progress bars, graphical icons, photos, or complex floating elements.
  - NO text embedded inside raster images.
  - NO header/footer overlap or margin clipping.
- **File Naming Standard**:
  - Format: `Vipin_VV_<SanitizedCompanyName>_<SanitizedRole>_ATS_CV.pdf`
  - Example: `Vipin_VV_EtihadAirways_React_Developer_ATS_CV.pdf`

---

## 4. Mandatory Post-Generation Verification Pipeline
Every generated PDF must pass automated programmatic checks:
1. **File Existence & Size**: File size must be non-zero and > 1 KB.
2. **Text Extractability**: PDF stream text must be cleanly extractable via programmatic inspection.
3. **Contact Data Verification**: Confirm phone (`+91 8089564801`) and email (`vipinvv555@gmail.com`) are present verbatim.
4. **Dates & Companies Verification**: Verify `Gewan Info Tech Solutions`, `Caxita Tech Solutions`, `College of Applied Science`, and dates (`Aug 2025 – Present`, `Mar 2022 – Jun 2025`, `2016 – 2019`) are accurate.
5. **Manifest Generation**: Save `manifest.json` in the daily `cvs/` folder mapping each PDF to its exact job title, company, and source URL.
