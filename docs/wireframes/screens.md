# Wireframe Specification (8 Screens)

## 1) Login
- Phone number input
- OTP input and verify action
- Tenant/store display after successful session

## 2) Dashboard
- KPIs: stock value, day sales, pending karigar jobs, pending repairs
- Quick actions: Add Item, New Sale, New Karigar Job, Receive Repair
- Recent transactions panel

## 3) Add Item
- Fields: item code, category, metal, purity, gross/net weight, making charges, rate at purchase, HSN
- Validation: required + numeric constraints
- Save action sets initial status to `IN_STOCK`

## 4) Inventory List
- Filters: status, metal, category, item code, date
- Columns: item code, metal, purity, gross/net weight, status, location
- Row actions: open details, issue to karigar, send approval, mark returned/sold

## 5) New Sale
- Customer lookup/create
- Add sale lines from inventory
- Rate, making charges, GST breakup, total
- Payment mode and amount capture
- Invoice preview/download

## 6) Karigar Jobs
- Create job (karigar, issued metal, purity, agreed wastage)
- Attach item(s) under job
- Mark return with actual returned metal/purity
- Show balance and settlement status

## 7) Ledger
- Account list with type and balance
- Day book entries (cash/bank)
- Journal-style transaction drill-down
- Date and account filters

## 8) Customer List
- Search by name/phone
- View purchase history timeline
- Basic profile fields (anniversary, dob, notes)
- Quick action to start sale or repair intake
