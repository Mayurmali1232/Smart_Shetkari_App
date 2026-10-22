# Smart Shetkari 🌱 (स्मार्ट शेतकरी)
> **Your Complete Agricultural Management Mobile Application & Backend Platform**

Smart Shetkari is an all-in-one farm management mobile application and RESTful backend designed specifically for Indian farmers to streamline their daily agricultural operations, manage labourers and wages, schedule tractors and machinery without booking conflicts, track diesel and maintenance expenses, monitor net cash flows, and access reports in **8 Indian languages**.

---

## 📑 Table of Contents
1. [Core Features & Modules](#-core-features--modules)
2. [Technology Stack](#-technology-stack)
3. [Architecture & Project Structure](#-architecture--project-structure)
4. [Multilingual Support (8 Languages)](#-multilingual-support-8-languages)
5. [Prerequisites & Installation](#-prerequisites--installation)
6. [Running the Application](#-running-the-application)
7. [REST API Documentation](#-rest-api-documentation)
8. [Business Rules & Domain Integrity](#-business-rules--domain-integrity)
9. [Verification & Testing](#-verification--testing)

---

## 🌾 Core Features & Modules

### 1. Authentication & Security
- **Secure Registration & Login**: Farmer account creation with full name, 10-digit mobile number, village, district, state, and initial language selection.
- **State-of-the-Art Security**: Passwords hashed with BCrypt, stateless authentication using short-lived JWT Access Tokens and secure Refresh Tokens.
- **Forgot Password Flow**: Secure 6-digit OTP verification and password reset.

### 2. Farmer Dashboard
- **Real-Time Operational & Financial KPIs**:
  - Total active workers, workers present today, absent today.
  - Today's estimated wages, outstanding worker wage payables.
  - Total tractors owned/rented, today's tractor bookings.
  - Monthly income, monthly expenses, outstanding customer receivables.
- **Interactive Date Selector**: Inspect historical farm performance on any chosen date.
- **One-Tap Quick Actions**: Add Worker, Mark Attendance, Pay Wages, Add Tractor, Book Tractor, Record Expense, View Reports.

### 3. Employee & Labour Management
- Worker profiles with full name, contact number, address, joining date, and daily wage rate.
- Status toggle: Mark workers Active or Inactive.
- Comprehensive work & payment history for every worker.
- **Strict Wage Integrity**: Modifying a worker's current daily wage rate *never* alters past historical attendance or wage records.

### 4. Attendance Management
- Mark attendance individually or in bulk for all active workers.
- Statuses: **Present**, **Absent**, **Half-Day**, and **Leave**.
- Auto-calculated daily wage based on attendance status (e.g. 50% for Half-Day).
- Duplicate prevention: Automatically blocks duplicate attendance entries for the same worker on the same date.

### 5. Wage Management & Manual Adjustments
- **Suggested Wage Calculation**: Automatically calculates suggested wages from attendance records and the agreed daily rate over any date range.
- **Manual Wage Override**: Allows farmers to manually adjust the final agreed wage to accommodate negotiated bonuses or deductions.
- **Explicit Payment Confirmation**: Calculates wages without automatically marking them as paid; payments are recorded only upon explicit farmer confirmation.
- **Partial Payments**: Record partial or full wage payments via Cash, UPI, Bank Transfer, or Cheque with transaction reference IDs.
- Real-time worker balance sheet showing Total Earned, Total Paid, and Balance Due.

### 6. Tractor & Machinery Management
- Register tractors and agricultural implements with model name, registration number, and ownership type (Owned / Rented).
- Configurable default rates: Hourly rate (₹/hr), Per-acre rate (₹/acre), and Per-day rate (₹/day).
- Real-time availability status: `AVAILABLE`, `BUSY`, `UNDER_MAINTENANCE`, `INACTIVE`.
- Work history and dedicated maintenance expense tracking per tractor.

### 7. Tractor Booking & Work Records
- Schedule tractor bookings for customer farmers with date, start time, end time, work type (Plowing, Rotavator, Harvesting, Sowing, Transport, Spraying, Other), and location.
- **Conflict & Overlap Prevention**: The backend and frontend automatically detect and block overlapping confirmed/in-progress bookings for the same tractor.
- **Work Completion Logging**: When work finishes, records actual hours worked, actual area covered (acres), and final mutually agreed amount.
- Record partial or full customer payments against completed bookings.

### 8. Income & Expense Tracking (Cash Flow)
- Track diesel/fuel purchases, servicing & maintenance, repairs, driver wages, insurance, and other operational expenses.
- Real-time cash flow breakdown: Total Income Collected vs Total Expenses Spent = Realized Net Cash Flow.
- Category filters and tractor-specific expense attribution.

### 9. Reports & Financial Statements
- Date presets: "This Month", "Last Month", "This Year", and custom date ranges.
- **Crucial Financial Distinction**:
  - **Completed Work Value**: The gross agreed value of all work completed.
  - **Actual Cash Collected**: Cash physically received from customers.
  - **Customer Outstanding Due**: Unpaid customer balances.
  - **Worker Wages Paid & Due**: Labour cost breakdown.
  - **Realized Net Farm Cash Flow**: `Cash Collected - Worker Wages Paid - Tractor Expenses`.
- **One-Click CSV Export**: Downloads and shares complete CSV financial reports.

### 10. In-App Notifications
- Alerts for upcoming tractor bookings, overdue customer receivables, and unpaid worker wages.
- Mark as read, mark all read, and filter by unread notifications.

---

## 🛠 Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Backend Framework** | Java / Spring Boot | 21 / 3.3.4 | Robust RESTful APIs & business logic |
| **Security** | Spring Security + JWT | 6.x | Stateless JWT authentication, CORS & BCrypt |
| **Database** | PostgreSQL / H2 | 15+ / Embedded | Relational persistence with JPA/Hibernate |
| **Build Tool** | Apache Maven | 3.9+ (Wrapper included) | Build automation and dependency management |
| **Mobile Application** | React Native (Expo) | Expo SDK 52 | Android & iOS cross-platform mobile client |
| **Navigation** | Expo Router | 4.x | File-based typed mobile routing |
| **State & Storage** | React Context + AsyncStorage | Latest | Client-side session and language state |
| **HTTP Client** | Axios | 1.7+ | API communication with JWT interceptor |
| **Internationalization** | i18next + react-i18next | Latest | Instant 8-language localization |

---

## 🏛 Architecture & Project Structure

```
farmerapp/
├── pom.xml                               # Root multi-module Maven POM
├── mvnw.cmd / mvnw                       # Maven wrappers for Windows and Unix
├── backend/                              # Spring Boot Application
│   ├── pom.xml                           # Backend dependencies & plugins
│   └── src/
│       ├── main/
│       │   ├── java/com/smartshetkari/
│       │   │   ├── SmartShetkariApplication.java
│       │   │   ├── common/               # ApiResponse, Exceptions, GlobalHandler
│       │   │   ├── security/             # JWT Provider, AuthFilter, SecurityConfig
│       │   │   ├── user/                 # User & FarmerProfile entities, services
│       │   │   ├── auth/                 # AuthController, DTOs (login, register, OTP)
│       │   │   ├── employee/             # Employee entity, service, controller
│       │   │   ├── attendance/           # Daily attendance records & summaries
│       │   │   ├── wage/                 # Wage records, manual adjustments, payments
│       │   │   ├── tractor/              # Tractor entity, rates, availability
│       │   │   ├── booking/              # Bookings, overlap check, work logs
│       │   │   ├── expense/              # Tractor expenses (diesel, repairs, etc.)
│       │   │   ├── payment/              # Customer payments against bookings
│       │   │   ├── report/               # Dashboard stats, financial summary, CSV
│       │   │   └── notification/         # In-app alerts and notifications
│       │   └── resources/
│       │       └── application.yml       # Configuration (H2 in dev, Postgres in prod)
│       └── test/
│           └── java/com/smartshetkari/
│               └── SmartShetkariApplicationTests.java  # Full integration tests
└── mobile/                               # React Native (Expo) Application
    ├── package.json                      # Mobile dependencies & scripts
    ├── app.json                          # Expo configuration
    ├── constants/                        # Theme (green palette), API config
    ├── context/                          # AuthContext & LanguageContext
    ├── i18n/                             # i18next configuration
    │   └── locales/                      # 8 Indian translation JSON files
    │       ├── en.json (English)         ├── mr.json (मराठी)
    │       ├── hi.json (हिंदी)           ├── gu.json (ગુજરાતી)
    │       ├── pa.json (ਪੰਜਾਬੀ)          ├── kn.json (ಕನ್ನಡ)
    │       ├── te.json (తెలుగు)          └── ta.json (தமிழ்)
    ├── services/                         # Axios API service clients
    ├── components/                       # Reusable UI widgets (Header, Button, Card, etc.)
    └── app/                              # Expo Router Screens
        ├── _layout.js                    # Global Provider layout
        ├── index.js                      # Welcome & Splash Screen
        ├── login.js                      # Login Screen
        ├── register.js                   # Farmer Registration Screen
        ├── forgot-password.js            # OTP Password Reset Screen
        ├── dashboard.js                  # Main KPI Dashboard
        ├── settings.js                   # Profile, 8-Language Switcher, Logout
        ├── notifications.js              # Notification Center
        ├── employees/                    # Worker list, add, details & work history
        ├── attendance/                   # Daily attendance marker & summary
        ├── wages/                        # Suggested wage calculator, payment ledger
        ├── tractors/                     # Tractor list, add, details & expenses
        ├── bookings/                     # Bookings list, new booking, work completion
        ├── expenses/                     # Income & Expense cash flow ledger
        └── reports/                      # Financial summary & CSV export
```

---

## 🌐 Multilingual Support (8 Languages)

Smart Shetkari is built from the ground up for Indian farmers. The application supports 8 Indian languages:

1. **मराठी (Marathi - `mr`)** *(Default)*
2. **हिंदी (Hindi - `hi`)**
3. **English (`en`)**
4. **ગુજરાતી (Gujarati - `gu`)**
5. **ਪੰਜਾਬੀ (Punjabi - `pa`)**
6. **ಕನ್ನಡ (Kannada - `kn`)**
7. **తెలుగు (Telugu - `te`)**
8. **தமிழ் (Tamil - `ta`)**

### Language Features:
- Farmers can choose their preferred language **before registration**, **during registration**, or **any time in Settings or the Header**.
- Switching language updates the **entire interface instantly** across all screens, buttons, labels, and modals.
- User data (farmer names, tractor models, notes) remains unaltered.
- Preferred language is stored locally in device storage and synchronized with the backend profile (`/api/v1/profile/language`), ensuring language preferences persist across logins.

---

## ⚡ Prerequisites & Installation

### Requirements:
- **Java**: JDK 21 or higher installed (`java -version`).
- **Node.js**: Node 18.x or 20.x installed (`node -v`).
- **Maven**: Included via `./mvnw` / `.\mvnw.cmd`.

---

## 🚀 Running the Application

### 1. Start the Spring Boot Backend

From the project root:
```powershell
# Windows
.\mvnw.cmd spring-boot:run -pl backend

# Linux / macOS
./mvnw spring-boot:run -pl backend
```
The backend starts on `http://localhost:8080`.
By default, the backend runs with an in-memory H2 database with automatic schema creation.
To run with PostgreSQL, update `backend/src/main/resources/application.yml` with your PostgreSQL credentials.

### 2. Run Backend Integration Tests
```powershell
# Windows
.\mvnw.cmd test

# Linux / macOS
./mvnw test
```
All domain tests (Authentication, Language switching, Wage integrity, Attendance, Booking overlap prevention, and Financial reports) will execute and pass.

### 3. Start the React Native (Expo) Mobile App

Navigate to the `mobile` directory:
```bash
cd mobile

# Install dependencies if not already installed
npm.cmd install

# Start the Expo development server
npx.cmd expo start
```
- Press `a` to run on Android Emulator.
- Scan the QR code using the **Expo Go** app on your physical Android/iOS phone (ensure the phone is on the same Wi-Fi network or update `mobile/constants/config.js` with your computer's local IP address).

---

## 📡 REST API Documentation

### Base URL: `http://localhost:8080/api/v1`

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/register` | Register new farmer |
| **Auth** | `POST` | `/auth/login` | Authenticate and obtain JWT tokens |
| **Auth** | `POST` | `/auth/refresh` | Refresh expired access token |
| **Auth** | `POST` | `/auth/logout` | Revoke tokens |
| **Auth** | `POST` | `/auth/forgot-password` | Send OTP for password recovery |
| **Auth** | `POST` | `/auth/reset-password` | Verify OTP and set new password |
| **Profile**| `GET` | `/profile` | Get logged-in farmer profile |
| **Profile**| `PATCH`| `/profile/language` | Update farmer preferred language |
| **Workers**| `GET` | `/employees` | List active / inactive workers |
| **Workers**| `POST` | `/employees` | Create worker profile |
| **Workers**| `GET` | `/employees/{id}` | Worker details, attendance & wages |
| **Workers**| `PUT` | `/employees/{id}` | Update worker profile |
| **Workers**| `PATCH`| `/employees/{id}/status` | Mark worker active or inactive |
| **Attendance** | `POST` | `/attendance` | Mark single attendance record |
| **Attendance** | `POST` | `/attendance/bulk` | Mark bulk attendance for all workers |
| **Attendance** | `GET` | `/attendance` | List attendance by date or worker |
| **Attendance** | `GET` | `/attendance/summary` | Get attendance summary stats |
| **Wages** | `POST` | `/wages/calculate-suggested` | Calculate suggested wages from attendance |
| **Wages** | `POST` | `/wages/manual-override` | Record mutually agreed wage adjustment |
| **Wages** | `POST` | `/wages/payments` | Record partial or full wage payment |
| **Wages** | `GET` | `/wages/worker/{id}/balance` | Get real-time worker wage balance |
| **Tractors** | `GET` | `/tractors` | List all tractors |
| **Tractors** | `POST` | `/tractors` | Register new tractor with default rates |
| **Tractors** | `GET` | `/tractors/{id}` | Get tractor details and rates |
| **Tractors** | `PATCH`| `/tractors/{id}/status` | Update availability status |
| **Bookings**| `GET` | `/tractor-bookings` | List bookings (filter by status/tractor) |
| **Bookings**| `POST` | `/tractor-bookings` | Create booking (checks for overlaps) |
| **Bookings**| `GET` | `/tractor-bookings/{id}` | Get booking details & payment ledger |
| **Bookings**| `PATCH`| `/tractor-bookings/{id}/status` | Update status (Confirmed/In Progress) |
| **Bookings**| `POST` | `/tractor-bookings/{id}/complete`| Complete work (actual hours/acres) |
| **Payments**| `POST` | `/tractor-payments` | Record customer payment for booking |
| **Expenses**| `GET` | `/tractor-expenses` | List expenses by category or tractor |
| **Expenses**| `POST` | `/tractor-expenses` | Record diesel, repair or maintenance expense |
| **Reports** | `GET` | `/reports/dashboard` | Real-time KPI stats for given date |
| **Reports** | `GET` | `/reports/financial-summary`| Comprehensive financial balance statement |
| **Reports** | `GET` | `/reports/export/csv` | Download complete CSV export |
| **Notifs** | `GET` | `/notifications` | List notifications (unread filter) |
| **Notifs** | `PATCH`| `/notifications/{id}/read` | Mark notification as read |
| **Notifs** | `PATCH`| `/notifications/read-all` | Mark all notifications as read |

---

## ⚖️ Business Rules & Domain Integrity

1. **Wage Rate Historical Preservation**:
   - When a worker's daily wage rate is updated (e.g. from ₹400 to ₹500), previous attendance records preserve the wage rate applicable on the day of work. Past records are never retroactively altered.
2. **Manual Negotiation Priority**:
   - Suggested wage calculations provide mathematical guidance, but the farmer retains total control to adjust the final agreed wage.
   - Wage payments require explicit transaction recording and are never automatically marked as paid upon calculation.
3. **Tractor Booking Overlap Conflict Prevention**:
   - The booking engine strictly verifies that no overlapping confirmed or in-progress bookings exist for the same tractor on the same date and time slot.
4. **Cash Flow vs. Work Value Realization**:
   - Financial analytics distinctly differentiate between **Completed Work Value** (gross value of work executed) and **Actual Cash Collected** (funds physically in the farmer's possession), preventing premature counting of receivables as cash.

---

## ✅ Verification & Testing

- **Backend Integration Tests**: All unit and integration test suites pass with 0 failures:
  - `SmartShetkariApplicationTests`: Tests user registration, JWT generation, multilingual language update, worker wage rate preservation, attendance duplicate protection, manual wage adjustment, tractor booking overlap prevention, and financial reporting.
- **Mobile Syntax Validation**: All React Native components, screens, services, contexts, and JSON translation files have been parsed and validated with zero syntax errors.

---

*Made with dedication for the hardworking farmers of India. 🌾🚜*
#   S m a r t _ S h e t k a r i _ A p p  
 