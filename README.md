<div align="center">

# Innovest

**Where ideas meet investment opportunities.**

A full-stack platform connecting entrepreneurs with potential investors through startup pitches, investment requests, and real-time conversations.

**[Live Website](https://innovest-site.vercel.app/)** · **[Features](#features)** · **[Getting Started](#getting-started)**

</div>

---

## Overview

Innovest is a web application built to make it easier for **entrepreneurs to present their businesses** and **investors to discover opportunities**. Instead of relying on disconnected introductions, users can explore structured startup pitches, express investment interests, respond to requests, and start conversations on a single platform.

Innovest focuses on **discovery, introductions, and communication**. Funding goals shown on the site are pitch information supplied by users; the application does **not** process investment payments or transfer funds.

## Features

| Area | What you can do |
| --- | --- |
| **Authentication** | Create an account, sign in, and access authenticated features using JWT-based sessions. |
| **Investment marketplace** | Browse startup pitches, search opportunities, and filter by industry, stage, and country. |
| **Fundraise dashboard** | Create, view, update, and delete your own business pitches; review funding goals. |
| **Pitch details** | Read a business overview, target market, progress, objectives, and investment requirements. |
| **Investor directory** | Discover investors, explore their public profiles, and review investment preferences. |
| **Investor requests** | Publish an investment request, edit it, close/reopen it, and review pitch responses. |
| **Respond with a pitch** | Entrepreneurs can submit relevant pitches in response to investor requests. |
| **Real-time messages** | Initiate a conversation through the **Knock** action and exchange messages using Socket.IO. |
| **User profiles** | Edit personal information and manage investor interests and investment ranges. |
| **Supporting pages** | About Us, Help/Contact, Privacy Policy, and Terms of Service. |

The interface is responsive and uses an off-white, sage-green visual system with the Outfit typeface.

## Technology Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React, Vite, React Router, Tailwind CSS, Bootstrap, custom CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL (`mysql2`), hosted on Aiven |
| **Authentication** | JSON Web Tokens (JWT), bcrypt |
| **Real-time communication** | Socket.IO |
| **Contact form** | EmailJS |
| **Frontend deployment** | Vercel |
| **Backend deployment** | Render (Docker) |

### Architecture

```text
                    Browser
              React + Vite frontend
                       |
                REST API + JWT
                       |
          Node.js / Express backend
                       |
             MySQL database (Aiven)

          Browser <---- Socket.IO ----> Backend
                     (messaging)
```

## Project Structure

```text
Innovest/
├── frontEnd/
│   ├── src/
│   │   ├── assets/          # Images and static assets
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # React hooks and auth helpers
│   │   ├── pages/           # Application pages
│   │   └── styles/          # Page and component styles
│   ├── package.json
│   └── vite.config.js
│
├── backEnd/
│   ├── config/              # MySQL connection configuration
│   ├── controllers/         # Request handlers
│   ├── database/            # Database upgrade SQL
│   ├── middleware/          # Authentication middleware
│   ├── routes/              # Express API routes
│   ├── .env.example         # Backend environment template
│   ├── Dockerfile
│   ├── README.md             # Docker / Render setup
│   ├── package.json
│   └── server.js
│
├── LICENSE
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** (a current LTS version, preferably 20+) and npm
- Access to a compatible **MySQL database** with the required Innovest tables
- MySQL connection credentials and a CA certificate if using an SSL-enabled hosted database such as Aiven

### 1. Clone the repository

```bash
git clone https://github.com/kazi-kamruddin/Innovest.git
cd Innovest
```

### 2. Configure the backend

Install dependencies from `backEnd/`:

```bash
cd backEnd
npm install
```

Create a `backEnd/.env` file by copying the provided `backEnd/.env.example`, then set your own values:

```dotenv
PORT=4000
FRONTEND_URL=http://localhost:5173
SECRET=replace-with-a-long-random-secret

DB_HOST=your-mysql-host
DB_PORT=your-mysql-port
DB_USER=your-mysql-user
DB_PASS=your-mysql-password
DB_NAME=your-database-name

# When your MySQL provider requires a CA certificate:
DB_SSL_CA_PATH=./certs/ca.pem
```

**Database setup:** The application expects its MySQL tables to exist. Review `backEnd/database/001_upgrade_2025_dump.sql` and the existing database setup before applying any SQL changes. Do not run upgrade scripts against a populated database without a backup.

For hosted MySQL, configure the certificate using `DB_SSL_CA_PATH` or `DB_SSL_CA` as supported by `backEnd/config/database.js`. Never commit your `.env`, private certificates, or credentials.

Start the backend:

```bash
npm run dev
```

The API runs on **http://localhost:4000** by default.

### 3. Configure and run the frontend

Open a **second terminal** at the repository root, then run:

```bash
cd frontEnd
npm install
```

Create `frontEnd/.env`:

```dotenv
VITE_API_URL=http://localhost:4000
```

Start the frontend:

```bash
npm run dev
```

Visit **http://localhost:5173**.

> **Note:** Vite variables prefixed with `VITE_` are exposed to the browser. Never put database passwords, JWT signing secrets, or other private credentials in `frontEnd/.env`.

### 4. Build for production

From `frontEnd/`:

```bash
npm run build
npm run preview
```

The production frontend build is generated in `frontEnd/dist/`.

## Deployment

The public site is hosted at **[innovest-site.vercel.app](https://innovest-site.vercel.app/)**.

- **Frontend (Vercel):** Build the `frontEnd` project and configure `VITE_API_URL` to point to the deployed backend origin.
- **Backend (Render):** Deploy `backEnd` as a Docker web service, with the required environment variables configured on the host.
- **Database (Aiven):** Provide the MySQL connection settings and CA certificate through the backend's secure runtime configuration.
- **CORS:** Set the backend's `FRONTEND_URL` to the exact deployed frontend origin.

For Docker build instructions, SSL configuration, and Render settings, see **[backEnd/README.md](backEnd/README.md)**.

## Development Team

| Team member | Role |
| --- | --- |
| **Kazi Kamruddin Ahmed** | Project Leader |
| **Sadik Rahman** | Frontend & Backend Development |
| **Sumit Majumder** | Frontend & Backend Development |
| **Abdullah Ishtiaq** | Frontend Development |

## License

This repository is licensed under the **[MIT License](LICENSE)**.

---

<div align="center">

**Innovest — connecting people, ideas, and opportunities.**

[Explore Innovest](https://innovest-site.vercel.app/) · [View Source](https://github.com/kazi-kamruddin/Innovest)

</div>
