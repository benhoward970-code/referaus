---
name: finance-manager
description: Track invoices, receipts, expenses, and income for Australian sole traders and small businesses. Categorise transactions for BAS/GST, scan receipts from photos, generate financial summaries, and maintain a clean ledger. Use when: (1) processing receipts or invoices, (2) categorising expenses, (3) preparing BAS data, (4) tracking income/expenses, (5) generating financial reports, (6) reconciling accounts, (7) user mentions money, expenses, invoices, receipts, cash flow, or profit/loss.
---

# Finance Manager

Manage finances for an Australian sole trader / small business. All amounts AUD. Financial year = July 1 – June 30.

## Storage

All financial data lives in the workspace:

```
finance/
├── ledger.json          # All transactions (income + expenses)
├── receipts/            # Receipt images (renamed: YYYY-MM-DD_vendor_amount.ext)
├── invoices/            # Invoice PDFs/images
├── reports/             # Generated reports (BAS, P&L, summaries)
└── categories.json      # Custom category mappings
```

Create `finance/` directory if it doesn't exist. Create `ledger.json` as `[]` if missing.

## Transaction Schema

```json
{
  "id": "uuid",
  "date": "YYYY-MM-DD",
  "type": "income|expense",
  "amount": 0.00,
  "gst": 0.00,
  "description": "What it was",
  "category": "see categories below",
  "vendor": "Who from/to",
  "receipt": "filename or null",
  "invoice": "filename or null",
  "payment_method": "card|cash|bank_transfer|paypal",
  "bas_category": "G1|G10|G11|1A|1B",
  "notes": "",
  "created_at": "ISO timestamp"
}
```

## Expense Categories (ATO-aligned)

- `advertising` — Marketing, ads, social media
- `car` — Fuel, rego, insurance, maintenance (log km if claiming)
- `clothing` — Uniforms, PPE, occupation-specific
- `depreciation` — Assets >$300 (instant write-off under $20k threshold)
- `education` — Courses, books, conferences related to work
- `home_office` — Internet, electricity, rent proportion
- `insurance` — Business insurance, PI, PL
- `interest` — Loan interest for business purposes
- `office` — Stationery, printing, postage
- `phone` — Mobile, landline (business % only)
- `professional` — Accountant, lawyer, bookkeeper fees
- `rent` — Office/workspace rent
- `repairs` — Equipment repairs and maintenance
- `software` — Subscriptions, SaaS, hosting, domains
- `subcontractors` — Payments to contractors
- `super` — Superannuation contributions
- `tools` — Equipment, hardware under $300
- `travel` — Flights, accommodation, meals (business trips)
- `other` — Anything that doesn't fit above

## Receipt Processing

When given a receipt image:
1. Use the image tool to read the receipt
2. Extract: date, vendor, amount, GST (if shown), items
3. Rename file to `YYYY-MM-DD_vendor_amount.ext` and move to `finance/receipts/`
4. Auto-categorise based on vendor/items
5. Add transaction to `ledger.json`
6. Confirm with user: "Added $X from [vendor] as [category]. GST: $Y. Correct?"

## BAS Categories

Map transactions to BAS labels for quarterly reporting:
- **G1** — Total sales (all income)
- **G10** — Capital purchases
- **G11** — Non-capital purchases (most expenses)
- **1A** — GST on sales (G1 / 11)
- **1B** — GST on purchases (G11 / 11)

## Reports

Generate on request:
- **Monthly summary** — Income vs expenses, top categories, cash flow
- **Quarterly BAS prep** — G1, G10, G11, 1A, 1B totals ready for BAS lodgement
- **Annual P&L** — Full financial year profit and loss
- **Category breakdown** — Spending by category with trends
- **Tax deduction summary** — All claimable expenses grouped for tax return

## Rules

- Always ask before modifying existing transactions
- Flag duplicate-looking transactions (same amount + vendor within 3 days)
- Round GST to nearest cent
- Assume GST-inclusive unless stated otherwise (divide by 11 for GST component)
- Keep ledger.json sorted by date descending
- Back up ledger.json before bulk operations (copy to ledger.backup.json)
