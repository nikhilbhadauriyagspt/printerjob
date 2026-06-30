
# Job Portal API Documentation

This document provides details for all the APIs implemented in the Job Portal Backend.

## Base URL
`http://localhost:8000/api/v1`

---

## 1. Admin APIs (`/admin`)

### Authentication
| Method | Endpoint | Description | Auth Required | Request Body | Response (Success) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/register` | Register a new Super Admin | No | `fullName`, `email`, `password` | `{ message, success }` |
| POST | `/login` | Admin login | No | `email`, `password` | `{ message, admin, success }` + Cookie `adminToken` |
| GET | `/logout` | Admin logout | No | - | `{ message, success }` |
| GET | `/me` | Get current admin profile | Admin | - | `{ admin, success }` |

### Company Management
| Method | Endpoint | Description | Auth Required | Request Body | Response (Success) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/companies` | Get all companies with stats | Admin | - | `{ companies, success }` |
| PUT | `/companies/:id/status` | Toggle company approval status | Admin | `reason` (optional) | `{ message, success, company }` |
| GET | `/companies/:id/jobs` | Get jobs of a specific company | Admin | - | `{ success, jobs }` |
| GET | `/companies/:id/history` | Get activity logs of a company | Admin | - | `{ success, logs }` |

### Job Management
| Method | Endpoint | Description | Auth Required | Request Body | Response (Success) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/jobs` | Get all jobs for review | Admin | - | `{ success, jobs }` |

### System Config
| Method | Endpoint | Description | Auth Required | Request Body | Response (Success) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/config` | Get system configuration | No | - | `{ success, isSupportEnabled }` |
| PUT | `/config/support` | Toggle support system | Admin | `isEnabled` (boolean) | `{ message, success, isEnabled }` |

### Notifications & Suggestions
| Method | Endpoint | Description | Auth Required | Request Body | Response (Success) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/notifications` | Get admin notifications | Admin | - | `{ success, notifications }` |
| PUT | `/notifications/:id/read` | Mark notification as read | Admin | - | `{ success }` |
| POST | `/suggestions/bulk` | Bulk upload suggestions | Admin | `type`, `items` (array) | `{ message, success }` |
| POST | `/suggestions/add` | Add single suggestion | Admin | `type`, `name` | `{ message, success, item }` |
| GET | `/suggestions` | Fetch approved suggestions | No | Query: `type` | `{ success, suggestions }` |

---

## 2. Company/Recruiter APIs (`/company`)

### Authentication & Registration
| Method | Endpoint | Description | Auth Required | Request Body | Response (Success) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/register` | Initial company signup | No | `companyName`, `email`, `phoneNumber`, `password` | `{ message, success, companyId }` |
| POST | `/verify` | Verify email/phone OTP | No | `companyId`, `emailOTP`, `phoneOTP` | `{ message, success, company }` + Cookie `companyToken` |
| POST | `/login` | Company login | No | `email`, `password` | `{ message, success, company }` + Cookie `companyToken` |
| POST | `/google-login` | Google OAuth login | No | `idToken`, `userData` | `{ message, success, company }` |
| POST | `/resend-otp` | Resend verification OTP | No | `companyId` | `{ message, success }` |
| POST | `/logout` | Company logout | No | - | `{ message, success }` |

### Profile & Settings
| Method | Endpoint | Description | Auth Required | Request Body | Response (Success) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/me` | Get company profile | Company | - | `{ company, success }` |
| PUT | `/profile` | Update profile (FormData for logo) | Company | `FormData` (logo, description, etc.) | `{ message, success, company, profileCompletionScore }` |
| POST | `/fetch-info` | Fetch info from website URL | Company | `url` | `{ success, companyInfo }` |
| POST | `/send-password-otp` | Send OTP to set password | Company | - | `{ message, success }` |
| POST | `/set-password-google`| Set password for Google users | Company | `password`, `otp` | `{ message, success }` |

### Notifications
| Method | Endpoint | Description | Auth Required | Request Body | Response (Success) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| GET | `/notifications` | Get company notifications | Company | - | `{ success, notifications }` |
| PUT | `/notifications/:id/read`| Mark notification as read | Company | - | `{ success }` |

---

## 3. Job APIs (`/job`)

| Method | Endpoint | Description | Auth Required | Request Body | Response (Success) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/create` | Create job (Draft/Pending) | Company | `title`, `description`, `industry`, `skills`, `isDraft` | `{ message, success, job }` |
| PUT | `/update/:id` | Update job details | Company | Job fields | `{ message, success }` |
| DELETE| `/delete/:id` | Delete a job | Company | - | `{ message, success }` |
| GET | `/recruiter-jobs` | Get all jobs of logged-in company| Company | - | `{ success, jobs }` |
| POST | `/admin/review` | Approve/Reject job | Admin | `jobId`, `action`, `reason` | `{ message, success }` |
| GET | `/get/:id` | Get single job details | No | - | `{ success, job }` |

---

## 4. Message APIs (`/message`)

| Method | Endpoint | Description | Auth Required | Request Body | Response (Success) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| POST | `/send` | Send a message | Universal | `receiverId`, `content`, `role` | `{ success, message }` |
| GET | `/chat/:otherId` | Get messages with a user | Universal | Query: `role` | `{ success, messages }` |
| GET | `/admin/chats` | Get list of companies chatted with| Admin | - | `{ success, companies }` |

---

### Key Features Implemented:
1. **Dual Auth System**: Separate authentication for Admins and Companies with JWT and HTTP-only cookies.
2. **OTP Verification**: Email-based OTP for registration and password recovery.
3. **Google Integration**: Social login and ability to convert Google accounts to manual accounts.
4. **Approval Workflow**: Companies and Jobs require admin approval before becoming fully active.
5. **Real-time Messaging**: Support chat between admin and recruiters.
6. **Activity Logging**: Comprehensive logs for recruiter actions (Login, Profile Update, Job Post).
7. **Email Notifications**: Automated emails for OTP, account status changes, and job reviews.
8. **Automated Metadata**: Suggestions for industries, skills, and designations grow dynamically as users input them.
