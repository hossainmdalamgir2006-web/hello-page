

## Plan: SendToCourierModal ও BulkSendToCourierModal-এ RedX ও Paperfly যোগ করা

### সমস্যা
`SendToCourierModal` এবং `BulkSendToCourierModal` — দুটোতেই শুধু Steadfast ও Pathao আছে। কিন্তু RedX ও Paperfly-র hook এবং edge function আগেই তৈরি আছে। Modal-এ এই দুটো option যোগ করতে হবে।

### পরিবর্তন

#### 1. `src/components/orders/SendToCourierModal.tsx`
- `CourierType` update: `"steadfast" | "pathao" | "redx" | "paperfly"`
- Import `useRedXCourier` ও `usePaperflyCourier` hooks
- Courier selection grid: `grid-cols-2` → `grid-cols-2 sm:grid-cols-4` — ৪টি courier card (Steadfast, Pathao, RedX, Paperfly) with logos
- `handleSubmit`-এ RedX ও Paperfly branch যোগ:
  - **RedX:** `createParcel()` call with `customer_name`, `customer_phone`, `delivery_area`, `customer_address`, `merchant_invoice_id`, `cash_collection_amount`
  - **Paperfly:** `createParcel()` call with similar fields
- Response থেকে `tracking_id` / `consignment_id` extract করে shipment save

#### 2. `src/components/orders/BulkSendToCourierModal.tsx`
- Same `CourierType` update
- Import RedX ও Paperfly hooks
- ৪টি courier radio option যোগ
- Bulk processing loop-এ RedX ও Paperfly handling যোগ

### Technical Details

```text
SendToCourierModal changes:
├── Import useRedXCourier, usePaperflyCourier
├── CourierType = "steadfast" | "pathao" | "redx" | "paperfly"
├── 4 radio cards (grid-cols-2 sm:grid-cols-4)
├── handleSubmit → add redx/paperfly branches
│   ├── redx: redxCourier.createParcel({...})
│   └── paperfly: paperflyCourier.createParcel({...})
└── Save to shipments with courier = "redx" | "paperfly"

BulkSendToCourierModal: same pattern
```

### কোনো Database বা Edge Function পরিবর্তন লাগবে না
RedX ও Paperfly-র hooks এবং edge functions আগেই তৈরি আছে। শুধু UI modal-এ option যোগ করতে হবে।

