# 🚀 Google Cloud Deployment Guide (ArthAstra)

This guide helps you deploy **ArthAstra (LoanSaathi)** to **Google Cloud Run** using a production-optimized Docker container.

---

## ✅ Prerequisites

1.  **Google Cloud Project**:
    *   Go to [Google Cloud Console](https://console.cloud.google.com/).
    *   Create a new project (e.g., `arth-astra-agent`).
    *   **Enable Billing** (Required for Cloud Run/Build).
2.  **Google Cloud SDK**:
    *   Install the `gcloud` CLI: [Install Guide](https://cloud.google.com/sdk/docs/install).

---

## 🛠️ Step 1: Enable Required APIs

Run these commands in your terminal (or Cloud Shell):

```bash
# 1. Login to Google Cloud
gcloud auth login

# 2. Set your project ID
gcloud config set project [YOUR_PROJECT_ID]
# Example: gcloud config set project arth-astra-prod-123

# 3. Enable Cloud Run and Registry APIs
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
```

---

## 📦 Step 2: Build & Push Docker Image

We use **Cloud Build** to build your Docker image remotely (so you don't need Docker installed locally).

```bash
# 1. Submit the build to Google Cloud
gcloud builds submit --tag gcr.io/[YOUR_PROJECT_ID]/arth-astra-v2
```
*Replace `[YOUR_PROJECT_ID]` with your actual project ID.*

---

## 🚀 Step 3: Deploy to Cloud Run

This command deploys the image to a live serverless URL.

```bash
gcloud run deploy arth-astra-live \
  --image gcr.io/[YOUR_PROJECT_ID]/arth-astra-v2 \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_GENERATIVE_AI_API_KEY="[YOUR_REAL_API_KEY]"
```

### 🔑 Environment Variables
Replace `[YOUR_REAL_API_KEY]` with your Gemini API key.
To add more variables (like Twilio), separates them with commas:
`--set-env-vars KEY1="value1",KEY2="value2"`

---

## 🌐 Step 4: Verification

1.  The command will output a **Service URL** (e.g., `https://arth-astra-live-uc.a.run.app`).
2.  Open that URL in your browser.
3.  Test the **Rejection Recovery Agent** to verify the API key is working.

---

## 🛑 Troubleshooting

*   **Build Fails?** Check `next.config.mjs` for `output: 'standalone'`.
*   **Permission Error?** Ensure you are logged in (`gcloud auth login`).
*   **500 Error on App?** Check logs: `gcloud run services logs read arth-astra-live`.

---

**Architecture Label:**
> "Containerized Next.js 16 Application running on Serverless Google Cloud Run with Vertex AI Integration."
