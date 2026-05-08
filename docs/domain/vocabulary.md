# Domain Vocabulary

## Metal and Weight
- **Purity (Tunch):** Gold purity percentage (e.g., 91.6 for 22K).
- **Gross Weight:** Total physical item weight including alloy.
- **Net Weight:** Effective sale/manufacturing weight used by business rules.
- **Fine Weight:** `gross_weight * purity / 100`, used in karigar and valuation flows.

## Workflow Actors
- **Karigar:** Artisan who manufactures or repairs jewellery.
- **Supplier:** Party from whom metal/items are purchased.
- **Customer:** Buyer or repair client.

## Commercial Terms
- **Making Charges:** Labor value, per gram or per piece.
- **Wastage:** Agreed process loss percentage in karigar jobs.
- **Approval:** Temporary outward item state for customer trial.

## Tax and Reporting
- **HSN Code:** GST product code (e.g., gold 7108, silver 7106).
- **CGST/SGST/IGST:** GST components for invoice and return exports.
- **Day Book:** Daily record of cash/bank movements.

## Canonical Item Status Values
- `IN_STOCK`
- `WITH_KARIGAR`
- `ON_APPROVAL`
- `IN_REPAIR`
- `SOLD`
- `RETURNED_TO_SUPPLIER`
