---
name: file-organiser
description: Organise files on the local machine — sort documents, rename consistently, archive old files, declutter downloads and desktop. Use when: (1) organising files or folders, (2) cleaning up desktop or downloads, (3) sorting documents by type or date, (4) renaming files consistently, (5) archiving old files, (6) user mentions messy files, cleanup, organise, or declutter.
---

# File Organiser

Sort, rename, and structure files on Ben's machine. Be conservative — move to organised folders, never delete without asking.

## Target Directories

Scan and organise these common clutter spots:
- `C:\Users\Ben\Desktop` — Desktop files
- `C:\Users\Ben\Downloads` — Downloads folder
- `C:\Users\Ben\Documents` — Documents

## Organisation Structure

When organising, create this structure as needed:

```
Documents/
├── Business/
│   ├── Refer/              # Platform-related docs
│   ├── Invoices/           # Invoices (sent and received)
│   ├── Receipts/           # Scanned receipts
│   ├── Contracts/          # Agreements, contracts
│   ├── Tax/                # Tax returns, BAS, ATO letters
│   └── Insurance/          # Policies, certificates
├── Personal/
│   ├── ID/                 # Passport, licence, Medicare
│   ├── Medical/            # Health records
│   ├── Housing/            # Lease, utilities, council
│   └── Banking/            # Statements, loan docs
└── Archive/
    └── YYYY/               # Old files by year
```

## File Naming Convention

Rename files to: `YYYY-MM-DD_description_vendor.ext`

Examples:
- `2026-03-05_invoice_anthropic.pdf`
- `2026-02-14_receipt_officeworks.jpg`
- `2025-12-01_lease-agreement_realestate.pdf`

## Workflow

1. **Scan**: List files in target directory
2. **Categorise**: Determine file type and appropriate folder
3. **Preview**: Show user what will move where BEFORE moving
4. **Confirm**: Wait for approval
5. **Execute**: Move and rename files
6. **Report**: Summary of what moved where

## Rules

- **NEVER delete files** — move to Archive/ if unsure
- **Always preview changes** before executing
- **Ask before touching** any directory not in the target list
- **Skip**: node_modules, .git, .next, system files, running project directories
- **Preserve**: Original filename in a `_original_names.json` log in each target folder
- Use `trash` command if available instead of `rm` for any cleanup
- Don't touch files modified in the last 24 hours (might be in active use)
