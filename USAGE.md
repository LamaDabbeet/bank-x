# Bank X Suite - User Guide

This guide explains how to use the Bank X Suite application as both a regular user and an administrator.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Using as a Regular User](#using-as-a-regular-user)
3. [Using as an Administrator](#using-as-an-administrator)
4. [Features Overview](#features-overview)

---

## Getting Started

### Prerequisites

- Node.js v20.x installed (use `nvm install 20 && nvm use 20`)
- PostgreSQL database running
- Backend and frontend dependencies installed

### Starting the Application

1. **Start the Backend API:**
   ```bash
   cd backend
   npm run dev
   ```
   The API will run on `http://localhost:4000`

2. **Start the Frontend (in a new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```
   The UI will run on `http://localhost:3000`

3. **Open your browser:**
   Navigate to `http://localhost:3000`

---

## Using as a Regular User

### 1. Registration

1. Click **"Sign in"** in the header, then click **"Sign up"** at the bottom of the login page
2. Fill in the registration form:
   - **Email:** Your email address (must be unique)
   - **Password:** At least 8 characters
   - **Full Name:** Your complete name
   - **Mobile Number:** Your phone number (must be unique)
3. Click **"Create Account"**
4. You'll see a success message: *"Registration submitted. Wait for admin approval."*
5. Your account status will be **PENDING** until an admin activates it

**Note:** New users are created with **PENDING** status by default and cannot log in until an admin activates their account.

### 2. Login

1. Once your account is **ACTIVE** (approved by an admin), go to the login page
2. Enter your **Email** and **Password**
3. Click **"Login"**
4. You'll be redirected to your **Dashboard**

### 3. Dashboard (My Accounts)

After logging in, you'll see your personal dashboard with:

#### Account Overview
- **Account Number:** Your unique account identifier
- **Balance:** Current account balance in AED
- **Status:** ACTIVE, INACTIVE, or PENDING

#### Profile Management
Update your personal information:
- **Full Name:** Edit your display name
- **Address:** Add or update your address
- **Profile Picture URL:** Add a URL to your profile picture

Click **"Save changes"** to update your profile.

#### Transaction History
View your recent transactions:
- **Credit transactions** (money added) are shown with a green arrow
- **Debit transactions** (money withdrawn) are shown with an amber/yellow arrow
- Each transaction shows:
  - Type (Credit/Debit)
  - Amount in AED
  - Date and time
  - Optional description

**Note:** Regular users can only view their own account and transactions. They cannot perform transactions themselves—only admins can credit or debit accounts.

### 4. Theme Toggle

Click the **sun/moon icon** in the header to switch between:
- **Light theme** (sun icon)
- **Dark theme** (moon icon)

Your preference is saved and will persist across sessions.

---

## Using as an Administrator

### 1. Admin Login

1. Use the admin credentials set in your `backend/.env` file:
   - `ADMIN_EMAIL` (default: admin@bank.com)
   - `ADMIN_PASSWORD` (set during seeding)
2. Log in at `http://localhost:3000/login`
3. You'll be redirected to the **Admin Accounts** page

### 2. Account Management (`/admin/accounts`)

#### Viewing All Accounts
- See a list of all user accounts in the system
- Each account shows:
  - Account Number
  - User's Full Name
  - Email
  - Mobile Number
  - Current Balance
  - Account Status (ACTIVE/INACTIVE)

#### Creating a New Account
1. Click **"Create Account"** button
2. Fill in the form:
   - **Full Name:** User's name
   - **Email:** Unique email address
   - **Mobile Number:** Unique phone number
   - **Address:** (Optional) User's address
   - **Profile Picture URL:** (Optional) URL to profile image
   - **Status:** ACTIVE or INACTIVE
3. Click **"Create"**
4. A **temporary password** will be generated and shown—share this with the user
5. The user can log in immediately if status is ACTIVE

#### Updating Account Status
1. Find the account in the list
2. Click the **status badge** (ACTIVE/INACTIVE)
3. Select the new status
4. The account status updates immediately

#### Deleting an Account
1. Find the account you want to delete
2. Click the **"Delete"** button
3. Confirm the deletion
4. The account and associated user will be removed

### 3. Transactions (`/admin/transactions`)

Admins can perform credit and debit transactions on any account.

#### Performing a Transaction
1. **Select an Account:**
   - Use the dropdown to choose an account
   - The account summary (name, number, balance) will appear

2. **Enter Transaction Details:**
   - **Amount (AED):** Enter the transaction amount (must be positive)
   - **Description:** (Optional) Add a note about the transaction

3. **Execute the Transaction:**
   - Click **"Credit"** (green button) to add money to the account
   - Click **"Debit"** (amber button) to withdraw money from the account

#### Transaction Rules
- **Credit:** Always succeeds (adds money to balance)
- **Debit:** Only succeeds if the account has sufficient funds
- If insufficient funds, you'll see a **red error toast**
- Successful credits show a **green toast**
- Successful debits show a **yellow/amber toast**

#### Transaction History
All transactions are logged and can be viewed in the account details or logs section.

### 4. System Logs (`/admin/logs`)

View all system activity logs:

#### Log Types
- **Type 1:** Web/UI logs (frontend actions)
- **Type 2:** Backend REST API logs (server actions)

#### Log Information
Each log entry shows:
- **Log Message:** Description of the action
- **Error Status:** Whether the action had an error
- **User:** The user who performed the action (if applicable)
- **Type:** Web (1) or Backend (2)
- **Timestamp:** When the action occurred

#### Filtering Logs
- Use the search/filter options to find specific logs
- Logs are automatically paginated for performance

---

## Features Overview

### Authentication & Security
- **JWT-based authentication** with refresh tokens
- **Role-based access control (RBAC):** Users and Admins have different permissions
- **Password hashing** using Argon2
- **Rate limiting:** API is limited to 250 requests per minute per server

### Toast Notifications
The app uses color-coded toast notifications:
- **Red:** Errors (failed operations, validation errors)
- **Yellow/Amber:** Debit transactions, warnings
- **Green:** Credit transactions, successful operations

### Theme Support
- **Light/Dark mode** toggle in the header
- Theme preference is saved in browser storage
- Smooth transitions between themes

### Responsive Design
- Works on desktop, tablet, and mobile devices
- Adaptive layouts for different screen sizes

### Data Persistence
- All actions are logged to the database
- Transaction history is maintained
- Profile changes are saved immediately

---

## Common Workflows

### Workflow 1: New User Onboarding
1. User registers → Status: PENDING
2. Admin logs in → Goes to Accounts page
3. Admin finds pending user → Activates account (status: ACTIVE)
4. User logs in → Accesses dashboard
5. Admin can credit initial balance if needed

### Workflow 2: Processing a Payment
1. Admin goes to Transactions page
2. Selects user's account
3. Enters amount and description
4. Clicks "Debit" (if withdrawal) or "Credit" (if deposit)
5. Transaction is recorded and balance updates
6. User sees updated balance and transaction in their dashboard

### Workflow 3: Account Maintenance
1. Admin views all accounts in Accounts page
2. Can update account status (activate/deactivate)
3. Can update user profile information
4. Can delete accounts if needed
5. All changes are logged in the system logs

---


