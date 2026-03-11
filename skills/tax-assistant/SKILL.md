---
name: tax-assistant
description: Australian tax return preparation, deduction tracking, and ATO compliance for sole traders and individuals. Use when: (1) preparing a tax return, (2) identifying deductions, (3) calculating taxable income, (4) BAS lodgement prep, (5) understanding ATO rules, (6) FY summaries, (7) user mentions tax, deductions, ATO, BAS, GST, ABN, tax return, or taxable income.
---

# Tax Assistant

Australian tax preparation for sole traders and individuals. Uses finance-manager skill data when available.

## Key Dates (ATO)

- **Jul 1** — New financial year starts
- **Oct 31** — Individual tax return due (self-lodging)
- **BAS quarterly:** Jul 28, Oct 28, Feb 28, Apr 28
- **BAS monthly:** 21st of following month

## Tax Rates FY2025-26 (Residents)

| Taxable Income | Rate |
|---|---|
| $0 – $18,200 | Nil |
| $18,201 – $45,000 | 16c per $1 over $18,200 |
| $45,001 – $135,000 | $4,288 + 30c per $1 over $45,000 |
| $135,001 – $190,000 | $31,288 + 37c per $1 over $135,000 |
| $190,001+ | $51,638 + 45c per $1 over $190,000 |
| Medicare levy | 2% of taxable income |

## Sole Trader Deductions Checklist

Read `finance/ledger.json` if it exists. Cross-reference expenses against these common deductions:

### Definitely Claimable (if business-related)
- Software subscriptions (hosting, domains, SaaS tools)
- Computer equipment (instant write-off if under $20,000)
- Internet and phone (business % only — estimate if no log)
- Home office running costs (67c/hour fixed rate OR actual cost method)
- Professional development (courses, books, conferences)
- Accounting/legal fees
- Business insurance
- Marketing and advertising
- Travel for business (flights, accommodation, meals)
- Contractor payments

### Often Missed
- Bank fees on business account
- Domain name registrations
- Cloud services (AWS, Vercel, Supabase, etc.)
- Depreciation on assets from prior years
- Union/association fees
- Self-education (if related to current income)

### Cannot Claim
- Personal expenses
- Entertainment (not deductible for sole traders)
- Fines and penalties
- Clothing (unless occupation-specific uniform)
- Travel between home and regular workplace

## Tax Return Workflow

1. **Gather data**: Read `finance/ledger.json`, group by FY (Jul 1 – Jun 30)
2. **Calculate gross income**: Sum all `type: "income"` transactions
3. **Calculate deductions**: Sum all `type: "expense"` by category
4. **Check missing**: Flag months with no expenses (likely missing receipts)
5. **Generate summary**: Write to `finance/reports/tax-summary-FYXX.md`
6. **BAS reconciliation**: Cross-check BAS quarters against ledger totals
7. **Present to user**: Show income, deductions, estimated tax, effective rate

## BAS Preparation

For quarterly BAS:
1. Filter ledger.json for the quarter (Q1: Jul-Sep, Q2: Oct-Dec, Q3: Jan-Mar, Q4: Apr-Jun)
2. Calculate G1 (total sales), G10 (capital purchases), G11 (other purchases)
3. Calculate 1A (GST on sales = G1/11), 1B (GST on purchases = G11/11)
4. Net GST = 1A - 1B (positive = owe ATO, negative = refund)
5. Write to `finance/reports/bas-QXFYXX.md`

## Rules

- Always note: "This is not professional tax advice. Consult a registered tax agent for lodgement."
- Use current ATO rates — web search if unsure about thresholds
- Flag anything ambiguous for professional review
- Keep all workings transparent (show calculations)
- Never auto-lodge anything with the ATO
