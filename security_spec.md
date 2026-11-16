# Security Specification: Al-Mowan Storefront & Owner Console

## 1. Data Invariants
1. All public catalog collections (`store_config`, `banners`, `categories`, `subpages`, `products`, `catalogs`) contain zero PII and are readable by storefront visitors, while mutations (`create`, `update`, `delete`) require verified `isAdmin()` (`request.auth.token.email_verified == true` and bootstrapped owner email or `/admins/{uid}`).
2. All PII-bearing collections (`orders`, `inquiries`) restrict `get`, `list`, `update`, `delete` strictly to `isAdmin()`. Unauthenticated/public customers can only `create` new records with `status == 'new'`, `createdAt == request.time`, `updatedAt == request.time`, bounded field sizes, and strict `keys().hasOnly(...)` allowlists.
3. Subpages and Products reference an existing `categoryId` via `exists(/databases/$(database)/documents/categories/$(incoming().categoryId))` on creation (when not seeding initial category in same batch via `existsAfter` / `exists`).
4. All document IDs in single-doc operations validate `isValidId(id)` (`^[a-zA-Z0-9_-]+$`, `<= 128` chars).
5. `createdAt` is immutable on update (`incoming().createdAt == existing().createdAt`), and `updatedAt == request.time` on all writes.

## 2. The "Dirty Dozen" Attack Payloads (All Must Fail with PERMISSION_DENIED)
1. **Shadow field on order create**: `{ ..., isAdmin: true }` -> rejected by `hasOnly`.
2. **Pre-approved order status on create**: `{ ..., status: 'delivered' }` -> rejected (`status == 'new'` enforced).
3. **Client-forged timestamp on order create**: `{ ..., createdAt: '2020-01-01' }` -> rejected (`createdAt == request.time`).
4. **Non-admin reading customer orders (PII leak)**: `get(/orders/ord1)` or `list(/orders)` without admin -> rejected.
5. **Non-admin reading customer inquiries (PII leak)**: `get(/inquiries/inq1)` or `list(/inquiries)` without admin -> rejected.
6. **Non-admin modifying product price**: `update(/products/p1, { price: 1 })` -> rejected.
7. **Unverified email claiming admin**: `auth.token.email == 'mnazih298@gmail.com'` with `email_verified: false` -> rejected.
8. **1MB string poisoning in ID**: `create(/products/'aaaa...200chars...')` -> rejected by `isValidId()`.
9. **Empty or oversized customer name**: `{ customerName: 'a' }` or 500 chars -> rejected by `size()` bounds.
10. **Non-admin deleting category**: `delete(/categories/glc)` -> rejected.
11. **Non-admin updating order status**: `update(/orders/o1, { status: 'cancelled' })` -> rejected.
12. **Self-promotion to /admins**: `create(/admins/{uid})` by non-admin -> rejected.
