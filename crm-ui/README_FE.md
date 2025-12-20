# CRM UI

This is a frontend-only CRM UI built with **Angular 17+** using standalone components. It is designed to consume the **Spring Boot CRM Backend API**.

## 🚀 Features

- **Angular 17+** with Standalone Components.
- **Path-based routing** (no hash routing).
- **JWT-based authentication** with route guards and interceptors.
- **Responsive SaaS-style UI**.
- **Global Error Handling**.
- **Feature Modules**:
  - Dashboard with summary cards.
  - Leads management (list, create, edit, convert).
  - Contacts list and details.
  - Deals management (list, create, edit).

## 🛠️ Tech Stack

- **Framework**: Angular 17+
- **Styling**: Vanilla CSS (Modern SaaS Aesthetics)
- **HTTP Client**: Angular HttpClient with Interceptors
- **Reactive Forms**: Comprehensive form validation

## 📦 Installation & Setup

1. **Navigate to the UI directory**:
   ```bash
   cd frontend/crm-ui
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Check `src/environments/environment.ts` to ensure `apiUrl` points to your backend (default: `http://localhost:8080/api/v1`).

4. **Run the application**:
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:4200`.

## 📚 Features Overview

### Authentication
Login and registration screens with JWT storage in `localStorage`. Roles supported: `ADMIN`, `SALES`, `VIEWER`.

### Dashboard
Provides quick stats on leads, open deals, won deals, and total revenue.

### Leads
Full CRUD for leads. Supports converting a lead into a contact once qualified.

### Contacts
View converted leads as contacts. Detailed view available for each contact.

### Deals
Track business opportunities. Manage deal stages: `OPEN`, `WON`, `LOST`.

## 🔒 Security
- **AuthInterceptor**: Injects `Authorization: Bearer <token>` into all outbound requests.
- **AuthGuard**: Protects internal routes from unauthorized access.
- **RoleGuard**: Controls access based on user roles.

## 🧪 Testing
Run unit tests with:
```bash
npm test
```
