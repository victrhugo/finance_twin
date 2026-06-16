# Finance Twin

Finance Twin is a premium personal finance SaaS platform reimagined with a high-fidelity visual experience. It transitions away from generic administrative templates to offer a sophisticated software space inspired by modern tools like **Copilot Money**, **Linear**, **Raycast**, **Arc Browser**, and **Vercel**.

---

## 🚀 Key Features

*   **Premium Metric Dashboard**: Net worth hero visualization, financial health indicator, and interactive custom SVG charts (including real-time mouse hover guidelines and details popovers) mapping actual transaction histories.
*   **Command Center (`⌘K` / `Ctrl+K` or `/`)**: Spotlight-style command search launcher that lets users navigate between screens, execute context actions (create transactions, categories, accounts), and switch workspaces via keyboard.
*   **Holographic Credit Cards**: Custom 3D gradient card displays matching checking, savings, and cash accounts.
*   **Directory Category Explorer**: VS Code-style visual file directory tree showing hierarchies, line guides, and parent-child dependencies.
*   **Workspace Switcher**: A Vercel-style interactive workspace card dropdown that updates account states on the fly.
*   **Slide-Over Drawers**: Elegant panel slide-overs for form inputs, avoiding screen interruptions.

---

## 🛠️ Tech Stack & Architecture

Finance Twin is structured as a **modular monolith** with separate concerns for clean maintainability.

### Backend (Spring Boot 3)
*   **Framework**: Java 17 + Spring Boot 3 + Spring Data JPA
*   **Security**: CORS-configured Spring Security for client authentication and API protection
*   **Database**: PostgreSQL with **Flyway** migrations schema management
*   **API Documentation**: Swagger / OpenAPI 3

### Frontend (React + TypeScript + Vite)
*   **Framework**: React 19 + TypeScript + Vite
*   **Styling**: Modern CSS design tokens, custom animation keyframes, Vercel grids, and glassmorphism.
*   **Icons**: Lucide React
*   **Charts**: Custom interactive SVG charts (avoiding heavy external dashboard bundles)

---

## 💻 Local Setup & Development

### Prerequisites
*   **JDK 17** or higher
*   **Node.js 18+** & npm
*   **Docker** & Docker Compose (for PostgreSQL)

### 1. Backend Setup
1.  **Clone the repository** and navigate to the project directory.
2.  **Environment Variables**: Copy `.env.example` to `.env` in the root:
    ```bash
    cp .env.example .env
    ```
    Configure your database credentials inside `.env`.
3.  **Start the Database**: Run PostgreSQL via Docker Compose:
    ```bash
    docker compose up -d
    ```
4.  **Run Migrations & Boot application**:
    ```bash
    mvn clean spring-boot:run
    ```
    The backend API will run at `http://localhost:8080` and Swagger docs will be available at `http://localhost:8080/swagger-ui.html`.

### 2. Frontend Setup
1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    The frontend will run at `http://localhost:5174` (or the configured Vite port).

---

## 🌐 Deployment to Netlify

To deploy the premium React frontend to **Netlify**, we have included a pre-configured `netlify.toml` file in the `frontend` folder to handle Single Page Application (SPA) routing, redirects, and production builds.

### Redirection Rules
Netlify needs a rewrite rule so that direct navigations to paths like `/transactions` or `/accounts` are correctly delegated to React Router rather than triggering a 404 error. The included configuration handles this automatically:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Steps to Deploy on Netlify
1.  **Log in to Netlify** and select **Add new site** > **Import an existing project**.
2.  Connect to your Git provider (GitHub, GitLab, etc.) and select this repository.
3.  **Configure Site Settings**:
    *   **Base directory**: `frontend`
    *   **Build command**: `npm run build`
    *   **Publish directory**: `frontend/dist` (Vite output folder)
4.  **Environment Variables**:
    *   Go to **Site configuration** > **Environment variables** > **Add variable**.
    *   Key: `VITE_API_BASE_URL`
    *   Value: Your production backend API URL (e.g., `https://your-backend-api.com/api/v1`). If not set, it will fallback to local development URL (`http://localhost:8080/api/v1`).
5.  Click **Deploy**.
