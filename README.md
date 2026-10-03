# 🛒 LitePOS - Smart & Lightweight Web POS for SMEs

A high-performance, efficient, and practical Cloud-Based Point of Sale (POS) ecosystem designed specifically for Small and Medium Enterprises (UMKM). Built with a modern decoupled Monorepo architecture.

---

## 📂 Project Structure

```text
LitePOS/
├── frontend/     # Client-side Application (React / Vue / Vite / Next.js)
├── backend/      # API Gateway & Server-side Application
├── .gitignore    # Global gitignore configuration
└── README.md     # Project main documentation (This file)
```

---

## 🚀 Getting Started for Developers

Welcome to the team! Please follow these exact steps to set up your local development environment.

### 1. Clone the Repository
Open your terminal and run:
```bash
git clone <PASTE_YOUR_GITHUB_REPOSITORY_URL_HERE>
cd LitePOS
```

### 2. Installation Guide (IMPORTANT!)
Do **NOT** create a new folder. Initialize your framework directly inside the existing designated folders.

*   **For Frontend Developer:**
    ```bash
    cd frontend
    # If using Vite (React/Vue):
    npm create vite@latest .
    # If using Next.js:
    npx create-next-app@latest .
    ```

*   **For Backend Developer:**
    ```bash
    cd backend
    # If using Node.js / Express:
    npm init -y
    # If using NestJS:
    npx @nestjs/cli new .
    ```

---

## 🛠 Git Workflow & Collaboration Rules

To keep the `main` branch stable, please adhere to the following rules:

1.  **Always create a new branch** before writing any code. Do not commit directly to `main`.
    *   Frontend branch format: `feat/frontend-<feature-name>`
    *   Backend branch format: `feat/backend-<feature-name>`
2.  **Pull before push.** Always pull the latest changes from `main` to prevent conflicts:
    ```bash
    git pull origin main
    ```
3.  Submit a **Pull Request (PR)** on GitHub once your feature is complete for review.