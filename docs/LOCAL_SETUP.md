# 💻 Setting Up Vertex Fusion Locally

Follow these steps to move the project from Replit to your local laptop (VS Code, etc.).

## 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

---

## 2. Download the Code
You have two options to get the code:

### Option A: Clone from GitHub (Recommended)
Since you've already pushed your code to GitHub:
```bash
git clone https://github.com/VaibhavChaudhary14/Vertex-Fusion-.git
cd Vertex-Fusion-
```

### Option B: Download from Replit
1. Click the **Project Name** at the top left of Replit.
2. Select **Download as ZIP**.
3. Extract the ZIP file on your laptop.

---

## 3. Install Dependencies
Open your terminal in the project folder and run:
```bash
npm install
```

---

## 4. Set Up Environment Variables
Create a file named `.env` in the root of your project and paste your secrets from Replit:

```env
DATABASE_URL="postgresql://neondb_owner:npg_oT3z0yWhdCaj@ep-blue-paper-a5q03mpx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
SESSION_SECRET="your-session-secret-here"
MAILTRAP_USER="your-mailtrap-user"
MAILTRAP_PASS="your-mailtrap-pass"
# Optional:
GOOGLE_OAUTH_CLIENT_ID="your-id"
GOOGLE_OAUTH_CLIENT_SECRET="your-secret"
```

---

## 5. Running the Application

### Development Mode
Runs the frontend (Vite) and backend (Express) simultaneously:
```bash
npm run dev
```
The app will be available at `http://localhost:5000`.

### Production Build
To create a production-ready version:
```bash
npm run build
npm start
```

---

## 6. Project Structure Notes
- **Frontend**: Located in `/client`. Built with Vite + React.
- **Backend**: Located in `/server`. Built with Express + Node.
- **Database**: Uses Drizzle ORM connected to your Neon PostgreSQL.
- **Shared**: Common types and schemas in `/shared`.

---

## 7. Troubleshooting
- **Database Connection**: Ensure your internet is connected as it uses a remote Neon database.
- **Port 5000**: Make sure no other app is using port 5000.
- **TypeScript Errors**: Run `npm run check` to find any type issues.
