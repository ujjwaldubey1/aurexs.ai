# Product Scope Contract (Phase 1)

## Positioning
Single-store jewellery ERP focused on daily operations. Scope discipline is a product feature.

## Must Have
- Inventory Management
- Karigar Management
- Sales and Billing
- Purchase Management
- Basic Ledger (party accounts, cash/bank, day book)
- Customer Records
- Live Gold Rates
- Stock Reports

## Should Have
- Repair Management
- GST report exports (GSTR-1, GSTR-3B)

## Explicit Exclusions
- Gold loans (girvi)
- Interest calculations and overdue handling
- Advance savings schemes
- Multi-branch workflows
- E-commerce sync
- WhatsApp AI chatbot
- AI document processing

## Scope Guardrails
- Any request that introduces loan logic or interest formulas is Phase 2 deferred.
- Any request requiring inter-branch stock transfer is out of scope.
- Ledger scope remains basic operational accounting only.
- All modules operate under one tenant/store in MVP, with tenant-safe schema design.
