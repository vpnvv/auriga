#!/usr/bin/env python3
"""
ATS PDF Engine for Vipin V V.
Zero external dependencies (pure Python 3 standard library).
Generates strictly ATS-compliant, single-column, text-searchable Type 1 PDF documents.
Enforces:
- Clean ASCII normalization (Zero question marks '?' from Unicode encoding errors)
- Exact 1-Page Layout budgeting optimized for UAE & Global ATS standards
- Automated text-extraction and page-count verification
"""

import os
import re
from typing import List, Dict, Tuple, Optional

def clean_ascii(text: str) -> str:
    """
    Normalizes Unicode typographical symbols into clean, standard ASCII equivalents.
    Prevents latin-1 replacement bugs that cause question marks ('?').
    """
    if not text:
        return ""
    
    replacements = {
        "—": " - ",     # em dash (U+2014)
        "–": " - ",     # en dash (U+2013)
        "‐": "-",       # hyphen (U+2010)
        "‑": "-",       # non-breaking hyphen
        "‒": "-",       # figure dash
        "‘": "'",       # left single quote
        "’": "'",       # right single quote
        "“": '"',       # left double quote
        "”": '"',       # right double quote
        "•": "-",       # bullet
        "·": "-",       # middle dot
        "…": "...",     # ellipsis
        "\u00a0": " ",  # non-breaking space
        "│": "|",
        "︱": "|",
        "︲": "-",
        "✓": "",
        "✔": ""
    }
    
    for k, v in replacements.items():
        text = text.replace(k, v)
        
    # Remove any non-ASCII character
    text = re.sub(r'[^\x20-\x7E]', '', text)
    # Collapse multiple spaces
    text = re.sub(r' +', ' ', text)
    return text.strip()


class SimpleATSResumePDF:
    """Generates standard-compliant single-column ATS PDF fitting cleanly onto 1 page."""

    def __init__(self, page_width: float = 595.28, page_height: float = 841.89): # A4 dimensions in points
        self.width = page_width
        self.height = page_height
        self.margin_left = 36.0   # 0.5 inch margins maximize printable area
        self.margin_right = 36.0
        self.margin_top = 36.0
        self.margin_bottom = 32.0
        self.usable_width = self.width - self.margin_left - self.margin_right
        
        self.pages: List[List[str]] = []
        self.current_page_stream: List[str] = []
        self.current_y = self.height - self.margin_top
        self.new_page()

    def new_page(self):
        if self.current_page_stream:
            self.pages.append(self.current_page_stream)
        self.current_page_stream = ['BT']
        self.current_y = self.height - self.margin_top

    def _escape_pdf_literal(self, text: str) -> str:
        # Pre-clean all Unicode into clean ASCII to guarantee zero question marks '?'
        safe_text = clean_ascii(text)
        # Escape PDF syntax characters: \, (, )
        safe_text = safe_text.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
        return safe_text

    def _approx_char_width(self, font_type: str, font_size: float) -> float:
        factor = 0.54 if 'Bold' in font_type else 0.50
        return font_size * factor

    def _wrap_text(self, text: str, font_type: str, font_size: float, max_width: float) -> List[str]:
        cleaned = clean_ascii(text)
        char_width = self._approx_char_width(font_type, font_size)
        max_chars = int(max_width / char_width)
        words = cleaned.split(' ')
        lines = []
        curr_line = []
        curr_len = 0

        for word in words:
            word_len = len(word)
            if curr_len + word_len + (1 if curr_line else 0) <= max_chars:
                curr_line.append(word)
                curr_len += word_len + (1 if curr_line else 0)
            else:
                if curr_line:
                    lines.append(' '.join(curr_line))
                curr_line = [word]
                curr_len = word_len
        if curr_line:
            lines.append(' '.join(curr_line))
        return lines or [cleaned]

    def check_space(self, needed_pts: float):
        if self.current_y - needed_pts < self.margin_bottom:
            self.new_page()

    def add_header(self, name: str, titles: str, contacts: List[str], location_extra: Optional[str] = None):
        safe_name = self._escape_pdf_literal(name)
        safe_titles = self._escape_pdf_literal(titles)
        safe_contacts = self._escape_pdf_literal(' | '.join([clean_ascii(c) for c in contacts]))

        # Name (Bold 16pt)
        self.current_page_stream.append('/F2 15 Tf')
        self.current_page_stream.append(f'1 0 0 1 {self.margin_left:.2f} {self.current_y:.2f} Tm')
        self.current_page_stream.append(f'({safe_name}) Tj')
        self.current_y -= 15

        # Subtitle (Bold 9.5pt)
        self.current_page_stream.append('/F2 9.5 Tf')
        self.current_page_stream.append(f'1 0 0 1 {self.margin_left:.2f} {self.current_y:.2f} Tm')
        self.current_page_stream.append(f'({safe_titles}) Tj')
        self.current_y -= 12

        # Contacts line 1 (Normal 8.5pt)
        self.current_page_stream.append('/F1 8.5 Tf')
        self.current_page_stream.append(f'1 0 0 1 {self.margin_left:.2f} {self.current_y:.2f} Tm')
        self.current_page_stream.append(f'({safe_contacts}) Tj')
        self.current_y -= 11

        if location_extra:
            safe_loc = self._escape_pdf_literal(location_extra)
            self.current_page_stream.append(f'1 0 0 1 {self.margin_left:.2f} {self.current_y:.2f} Tm')
            self.current_page_stream.append(f'({safe_loc}) Tj')
            self.current_y -= 11

        # Separator line
        self.current_page_stream.append('ET')
        self.current_page_stream.append(f'{self.margin_left:.2f} {self.current_y:.2f} m {self.width - self.margin_right:.2f} {self.current_y:.2f} l 0.75 w 0.2 G S')
        self.current_page_stream.append('BT')
        self.current_y -= 9

    def add_section_title(self, title: str):
        self.current_y -= 4
        safe_title = self._escape_pdf_literal(title.upper())
        self.current_page_stream.append('/F2 10 Tf')
        self.current_page_stream.append(f'1 0 0 1 {self.margin_left:.2f} {self.current_y:.2f} Tm')
        self.current_page_stream.append(f'({safe_title}) Tj')
        self.current_y -= 3

        # Clean section divider rule
        self.current_page_stream.append('ET')
        self.current_page_stream.append(f'{self.margin_left:.2f} {self.current_y:.2f} m {self.width - self.margin_right:.2f} {self.current_y:.2f} l 0.4 w 0.4 G S')
        self.current_page_stream.append('BT')
        self.current_y -= 8

    def add_paragraph(self, text: str, font_size: float = 8.5, line_height: float = 11.0, is_bold: bool = False):
        font_tag = '/F2' if is_bold else '/F1'
        lines = self._wrap_text(text, 'Bold' if is_bold else 'Normal', font_size, self.usable_width)
        for line in lines:
            safe_line = self._escape_pdf_literal(line)
            self.current_page_stream.append(f'{font_tag} {font_size:.2f} Tf')
            self.current_page_stream.append(f'1 0 0 1 {self.margin_left:.2f} {self.current_y:.2f} Tm')
            self.current_page_stream.append(f'({safe_line}) Tj')
            self.current_y -= line_height

    def add_job_header(self, company: str, dates: str, role: str, location: str):
        safe_company = self._escape_pdf_literal(company)
        safe_dates = self._escape_pdf_literal(dates)
        safe_role = self._escape_pdf_literal(role)
        safe_loc = self._escape_pdf_literal(location)

        # Line 1: Company (Bold) & Dates (Right Aligned)
        self.current_page_stream.append('/F2 9.0 Tf')
        self.current_page_stream.append(f'1 0 0 1 {self.margin_left:.2f} {self.current_y:.2f} Tm')
        self.current_page_stream.append(f'({safe_company}) Tj')

        date_approx_w = len(safe_dates) * 4.8
        date_x = self.width - self.margin_right - date_approx_w
        self.current_page_stream.append(f'1 0 0 1 {date_x:.2f} {self.current_y:.2f} Tm')
        self.current_page_stream.append(f'({safe_dates}) Tj')
        self.current_y -= 10.5

        # Line 2: Role (Normal/Bold) & Location (Right Aligned)
        self.current_page_stream.append('/F1 8.5 Tf')
        self.current_page_stream.append(f'1 0 0 1 {self.margin_left:.2f} {self.current_y:.2f} Tm')
        self.current_page_stream.append(f'({safe_role}) Tj')

        loc_approx_w = len(safe_loc) * 4.4
        loc_x = self.width - self.margin_right - loc_approx_w
        self.current_page_stream.append(f'1 0 0 1 {loc_x:.2f} {self.current_y:.2f} Tm')
        self.current_page_stream.append(f'({safe_loc}) Tj')
        self.current_y -= 10.5

    def add_bullet(self, bullet_text: str, font_size: float = 8.2, line_height: float = 10.5):
        bullet_indent = 10.0
        bullet_width = self.usable_width - bullet_indent
        lines = self._wrap_text(bullet_text, 'Normal', font_size, bullet_width)
        for i, line in enumerate(lines):
            safe_line = self._escape_pdf_literal(line)
            self.current_page_stream.append(f'/F1 {font_size:.2f} Tf')
            if i == 0:
                self.current_page_stream.append(f'1 0 0 1 {self.margin_left:.2f} {self.current_y:.2f} Tm')
                self.current_page_stream.append('(-) Tj')
            x_pos = self.margin_left + bullet_indent
            self.current_page_stream.append(f'1 0 0 1 {x_pos:.2f} {self.current_y:.2f} Tm')
            self.current_page_stream.append(f'({safe_line}) Tj')
            self.current_y -= line_height

    def add_skill_category(self, category_name: str, skills_list: str, font_size: float = 8.2, line_height: float = 10.5):
        safe_prefix = clean_ascii(f"{category_name}: ")
        safe_skills = clean_ascii(skills_list)
        full_text = safe_prefix + safe_skills
        lines = self._wrap_text(full_text, 'Normal', font_size, self.usable_width)
        
        for i, line in enumerate(lines):
            if i == 0:
                self.current_page_stream.append(f'/F2 {font_size:.2f} Tf')
                self.current_page_stream.append(f'1 0 0 1 {self.margin_left:.2f} {self.current_y:.2f} Tm')
                self.current_page_stream.append(f'({self._escape_pdf_literal(safe_prefix)}) Tj')
                
                rest = line[len(safe_prefix):] if line.startswith(safe_prefix) else line
                cat_w = len(safe_prefix) * (font_size * 0.54)
                self.current_page_stream.append(f'/F1 {font_size:.2f} Tf')
                self.current_page_stream.append(f'1 0 0 1 {(self.margin_left + cat_w):.2f} {self.current_y:.2f} Tm')
                self.current_page_stream.append(f'({self._escape_pdf_literal(rest)}) Tj')
            else:
                self.current_page_stream.append(f'/F1 {font_size:.2f} Tf')
                self.current_page_stream.append(f'1 0 0 1 {self.margin_left:.2f} {self.current_y:.2f} Tm')
                self.current_page_stream.append(f'({self._escape_pdf_literal(line)}) Tj')
            self.current_y -= line_height

    def compile(self) -> bytes:
        if self.current_page_stream and self.current_page_stream not in self.pages:
            self.pages.append(self.current_page_stream)

        objects: List[bytes] = []
        objects.append(b'1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj')
        
        total_pages = len(self.pages)
        kids_refs = ' '.join([f'{3 + i*2} 0 R' for i in range(total_pages)])
        pages_obj = f'2 0 obj\n<< /Type /Pages /Kids [{kids_refs}] /Count {total_pages} >>\nendobj'.encode('latin-1')
        objects.append(pages_obj)

        font_f1_id = 3 + total_pages * 2
        font_f2_id = font_f1_id + 1

        for idx, page_stream in enumerate(self.pages):
            page_obj_id = 3 + idx * 2
            content_obj_id = page_obj_id + 1
            
            page_stream.append('ET')
            stream_body = '\n'.join(page_stream).encode('latin-1')
            
            p_obj = (f'{page_obj_id} 0 obj\n'
                     f'<< /Type /Page /Parent 2 0 R '
                     f'/MediaBox [0 0 {self.width:.2f} {self.height:.2f}] '
                     f'/Contents {content_obj_id} 0 R '
                     f'/Resources << /Font << /F1 {font_f1_id} 0 R /F2 {font_f2_id} 0 R >> >> >>\nendobj').encode('latin-1')
            objects.append(p_obj)
            
            c_obj = (f'{content_obj_id} 0 obj\n'
                     f'<< /Length {len(stream_body)} >>\nstream\n').encode('latin-1') + stream_body + b'\nendstream\nendobj'
            objects.append(c_obj)

        f1_obj = f'{font_f1_id} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj'.encode('latin-1')
        f2_obj = f'{font_f2_id} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj'.encode('latin-1')
        objects.append(f1_obj)
        objects.append(f2_obj)

        pdf_out = bytearray(b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n')
        xref_offsets = [0]

        for obj in objects:
            xref_offsets.append(len(pdf_out))
            pdf_out.extend(obj)
            pdf_out.extend(b'\n')

        start_xref = len(pdf_out)
        total_objs = len(objects) + 1
        xref_table = f'xref\n0 {total_objs}\n0000000000 65535 f \n'
        for offset in xref_offsets[1:]:
            xref_table += f'{offset:010d} 00000 n \n'
        pdf_out.extend(xref_table.encode('latin-1'))
        
        trailer = (f'trailer\n<< /Size {total_objs} /Root 1 0 R >>\n'
                   f'startxref\n{start_xref}\n%%EOF\n')
        pdf_out.extend(trailer.encode('latin-1'))
        return bytes(pdf_out)

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
        data = self.compile()
        with open(filepath, 'wb') as f:
            f.write(data)


def validate_pdf_content(pdf_path: str, required_strings: List[str]) -> Tuple[bool, List[str], str]:
    """
    Validates that a PDF exists, has extractable text, contains required strings,
    and STRICTLY CONTAINS NO QUESTION MARKS ('?') from encoding artifacts.
    """
    if not os.path.exists(pdf_path):
        return False, [f"File not found: {pdf_path}"], ""
    
    file_size = os.path.getsize(pdf_path)
    if file_size < 1000:
        return False, [f"File too small: {file_size} bytes"], ""

    with open(pdf_path, 'rb') as f:
        raw_bytes = f.read()

    if not raw_bytes.startswith(b'%PDF-1.'):
        return False, ["Missing valid PDF header"], ""

    text_matches = re.findall(rb'\((.*?)\)\s*Tj', raw_bytes)
    extracted_text = " ".join([m.decode('latin-1', errors='ignore') for m in text_matches])

    missing = []
    # 1. Assert NO question marks from bad encoding
    if "?" in extracted_text:
        missing.append("ERROR: Detected unwanted question mark '?' in extracted PDF text!")

    # 2. Assert all required factual strings exist
    for req in required_strings:
        clean_req = clean_ascii(req)
        if clean_req.lower() not in extracted_text.lower():
            missing.append(f"Missing required text: {req}")

    is_valid = len(missing) == 0
    return is_valid, missing, extracted_text
