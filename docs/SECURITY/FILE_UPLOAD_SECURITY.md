# 📁 File Upload Security

The resume intake endpoint (`POST /api/v1/resume/upload`) enforces multi-layered defenses:

1. **Size Limitation**: Uploads are restricted to $\le 10\text{MB}$. Larger payloads are rejected before memory allocation.
2. **MIME Type & Extension Whitelist**: Only `.pdf`, `.docx`, and `.doc` extensions are processed.
3. **Magic Byte Verification**: File streams are inspected for valid PDF/DOCX magic numbers (`%PDF-` for PDFs, `PK\x03\x04` for ZIP/DOCX).
4. **Sandboxed Processing**: PyMuPDF parses files purely in memory; documents are never executed or written to arbitrary filesystem paths.
