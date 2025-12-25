# How to Integrate Real Bank APIs (India)

To get real loan offers and fetch actual bank statements, you cannot connect to banks (HDFC, SBI) directly. You must use an **Account Aggregator (AA)** or a **Lending Service Provider (LSP)**.

The best developer-friendly platform for this in India is **Setu** (owned by Pine Labs).

## Recommended Platform: **Setu Bridge**
*   **Website**: [https://bridge.setu.co/](https://bridge.setu.co/)
*   **Cost**: Free Sandbox (Test Mode), Pay-per-use for Production.
*   **Features**: Fetch Bank Statements, Verify Income, Penny Drop Verification.

---

## Sep-by-Step Implementation Guide

### Phase 1: Setup (Do this manually)
1.  **Sign Up**: Go to [Setu Bridge](https://bridge.setu.co/) and create an account.
2.  **Create Project**: Create a new project called "LoanSaathi".
3.  **Get Credentials**:
    *   Go to **Settings** -> **Credentials**.
    *   Copy your `CLIENT_ID` and `CLIENT_SECRET`.
    *   Add these to your `.env.local` file:
        ```bash
        SETU_CLIENT_ID=your_id_here
        SETU_CLIENT_SECRET=your_secret_here
        ```

### Phase 2: The Logic Flow
To get real data, the flow is strict:
1.  **Consent**: You ask the user "Can I see your HDFC Statement?"
2.  **Approval**: User gets an OTP from their bank to approve.
3.  **Fetch**: Setu gives you the data (JSON format).

### Phase 3: The Code (Copy-Paste Ready)

Create a new file `lib/bank-api.ts` and use this code structure:

```typescript
// lib/bank-api.ts

const SETU_URL = "https://fiu-uat.setu.co"; // Sandbox URL

// 1. Authenticate (Get Token)
async function getSetuToken() {
  const res = await fetch(`${SETU_URL}/sessions`, {
    method: "POST",
    headers: {
      "x-client-id": process.env.SETU_Client_ID!,
      "x-client-secret": process.env.SETU_CLIENT_SECRET!,
    },
  });
  return res.json();
}

// 2. Create a Consent Request (Ask User)
export async function createConsentRequest(mobileNumber: string) {
  const token = await getSetuToken();
  
  const res = await fetch(`${SETU_URL}/consents`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token.id}` },
    body: JSON.stringify({
      detail: {
        consentStart: new Date().toISOString(),
        consentExpiry: new Date(Date.now() + 86400000).toISOString(), // 1 day
        Customer: { id: mobileNumber },
        FIDataRange: {
          from: "2023-01-01T00:00:00Z",
          to: "2023-12-31T00:00:00Z"
        },
        consentMode: "STORE",
        consentTypes: ["TRANSACTIONS", "PROFILE", "SUMMARY"],
        fetchType: "PERIODIC"
      }
    })
  });
  
  return res.json(); // Returns a URL to redirect the user to
}
```

### Phase 4: Integration
1.  **Login Page**: user enters phone.
2.  **Dashboard**: You call `createConsentRequest(userPhone)`.
3.  **Redirect**: Send user to the Setu URL.
4.  **User Action**: They approve using OTP.
5.  **Callback**: Setu notifies your app "Data Ready!".
6.  **Analysis**: You read their `average_monthly_balance` and update the `Credit Readiness` score accurately.

## Is this "Plug and Play"?
Not exactly. Requires:
1.  **Business Verification (KYC)** before going live.
2.  **Backend Server** (Next.js API routes work fine).

**Recommendation**: Stick to the current "Simulation Mode" for your Demo/MVP. It mimics this exact behavior without the legal headaches.
