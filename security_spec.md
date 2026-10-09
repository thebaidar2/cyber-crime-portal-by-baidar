# Security Specification & Invariants: CYBER CRIME PORTAL BY BAIDAR

## 1. Data Invariants
- **I1 (Identity Isolation):** A normal user cannot read, list, update, or delete any request where `resource.data.userId != request.auth.uid`.
- **I2 (IDOR Prevention):** Request IDs, Document IDs, and query filters cannot be bypassed by querying other users' records.
- **I3 (Admin Separation):** Admin privileges cannot be self-assigned. Admin access requires verification against the `/admins/{uid}` document or bootstrapped admin verification (`thebaidar2@gmail.com`).
- **I4 (Public Content Immutability for Visitors):** Landing page content (`/website_content/landing`) and social links (`/social_links/{id}`) are publicly readable but strictly writable ONLY by verified administrators.
- **I5 (Audit Log Integrity):** Audit logs (`/audit_logs/{id}`) and blocked IPs (`/blocked_ips/{id}`) cannot be read, updated, or deleted by normal users or public visitors.
- **I6 (Immutability of Creator & Timestamp):** A request's `userId`, `requestId`, and `createdAt` cannot be altered once created.
- **I7 (Response Authorization):** A response item under `/requests/{requestId}/responses/{responseId}` can only be read by the request owner or verified admin, and can only be authored by either the request owner (role: user) or admin (role: admin).
- **I8 (Terminal State Integrity):** Once a request is set to 'Closed' or 'Resolved', status changes can only be performed by verified administrators.

## 2. The Dirty Dozen Payloads (Adversarial Test Vectors)

1. **DD-1 (Spoofed Admin Self-Promotion):**
   - Action: User writes `{ role: 'admin' }` to their user document `/users/{uid}`.
   - Expected Result: REJECTED (Permission Denied).

2. **DD-2 (Cross-User Request Read / IDOR):**
   - Action: User `attacker_uid` sends `get` request to `/requests/victim_req_999`.
   - Expected Result: REJECTED (Permission Denied).

3. **DD-3 (Unauthenticated Request Sniffing / List Scraping):**
   - Action: Anonymous user sends list query `collection('requests')`.
   - Expected Result: REJECTED (Permission Denied).

4. **DD-4 (Ghost Field Injection / Shadow Update):**
   - Action: User updates request with `{ isInternalFlagged: false, bypassInspection: true }`.
   - Expected Result: REJECTED (Strict `hasOnly` and schema validation).

5. **DD-5 (User-Faked Admin Response):**
   - Action: Normal user writes to `/requests/{id}/responses/{respId}` with `{ senderRole: 'admin', message: 'Case closed by Police' }`.
   - Expected Result: REJECTED (senderRole admin requires `isAdmin()`).

6. **DD-6 (Overwriting Public Site Content):**
   - Action: Non-admin sends `setDoc` to `/website_content/landing` defacing site title.
   - Expected Result: REJECTED (Admin only write).

7. **DD-7 (Audit Log Erasure / Tampering):**
   - Action: Malicious user calls `deleteDoc` on `/audit_logs/sec_log_1`.
   - Expected Result: REJECTED (No delete allowed on audit logs).

8. **DD-8 (Unblocking Own IP):**
   - Action: Attacker calls `deleteDoc` on `/blocked_ips/192.168.1.1`.
   - Expected Result: REJECTED (Admin only).

9. **DD-9 (Timestamp Forgery on Submission):**
   - Action: Attacker submits request with backdated `createdAt: '1999-01-01'`.
   - Expected Result: REJECTED (Must match request.time / server verification).

10. **DD-10 (Denial-of-Wallet Payload Injection):**
    - Action: Attacker sends 5MB string in `message` or document ID longer than 128 chars.
    - Expected Result: REJECTED (`isValidId` and `.size() <= 4000`).

11. **DD-11 (Email Spoofing without Verification):**
    - Action: Attacker registers token with `email: 'thebaidar2@gmail.com'` but `email_verified: false`.
    - Expected Result: REJECTED (Mandates `email_verified == true`).

12. **DD-12 (Orphaned Write / Status Bypass):**
    - Action: User tries to directly jump status from 'Submitted' to 'Closed' or write response to non-existent request.
    - Expected Result: REJECTED (Only admin can transition to Reviewed/Closed, and user must own parent request).
