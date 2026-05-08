# Item State Machine and Invariants

## Allowed States
- `IN_STOCK`
- `WITH_KARIGAR`
- `ON_APPROVAL`
- `IN_REPAIR`
- `SOLD`
- `RETURNED_TO_SUPPLIER`

## Transition Rules
- Any item state transition must run inside one database transaction.
- The same transaction must write:
  - one `transactions` row,
  - one or more `transaction_items` rows,
  - balanced `ledger_entries`.
- Direct updates to `items.status` are prohibited in service-layer policy.

## Representative Transition Paths
- `IN_STOCK -> WITH_KARIGAR` (metal/job issue)
- `WITH_KARIGAR -> IN_STOCK` (job return complete)
- `IN_STOCK -> ON_APPROVAL` (customer trial issue)
- `ON_APPROVAL -> SOLD` or `ON_APPROVAL -> IN_STOCK`
- `IN_STOCK -> SOLD`
- `IN_STOCK -> RETURNED_TO_SUPPLIER`

## Ledger Invariant
Every posting remains double-entry (sum debit equals sum credit per business transaction).
