# Innovest

Connecting Investors and Innovation together here in INNOVEST


## Team Members : 

| Name | Roll Number | E-mail | Role |
|-------------|--------------|--------------|--------------|
| Kazi Kamruddin Ahmed  | 20220104125 | kazikamruddinahmed@gmail.com| Lead |
| Sumit Majumder  | 20220104110 | sumitmajumder270@gmail.com | Frontend + Backend |
| Abdullah Istiaq  | 20220104118 | ishtiaqsakib@gmail.com | Frontend + Backend |
| Sadik Rahman  | 20220104104 | sadik.nai.008@gmail.com | Frontend + Backend |

## Project Overview
Innovest is a place where great businesses and great people meet. We bring together businesses looking for investment and investors with the capital, contacts and knowledge to  help them succeed.


## Title
### **Innovest**

## Short Description
Innovest connects entrepreneurs seeking funding with investors looking for opportunities. Entrepreneurs showcase their businesses, while investors explore and connect with ventures that align with their goals, fostering growth and collaboration.

## Key Feature
1. **Entrepreneur Profiles**  
   Showcase business ideas, goals, and funding needs with detailed and customizable profiles.

2. **Investor Dashboard**  
   Explore curated investment opportunities, filter by industry, funding stage, and more.

3. **Insights & Analytics**  
   Data-driven tools to support informed decision-making for both entrepreneurs and investors.

4. **Newsfeed**
   A newsfeed to share and analyse day to day deals.


## Target Audience

1. **Entrepreneurs**  
   - Startups and small businesses seeking funding to scale their operations.  
   - Founders looking for strategic partners who bring both capital and expertise.

2. **Investors**  
   - Angel investors, venture capitalists, and financial institutions seeking innovative business opportunities.  
   - Individuals or organizations aiming to diversify their investment portfolios.

3. **Business Consultants**  
   - Professionals seeking tools to connect their clients with potential funding sources.

## Tech Stack

### **1. Backend**
- **Framework**: Laravel  
  Laravel is used to handle API development, authentication, and database interactions. Its robust ecosystem makes it ideal for building scalable and secure backend services.

### **2. Frontend**
- **Framework**: React  
  React is used to create a dynamic and responsive user interface. Its component-based architecture ensures maintainability and flexibility.

### **3. Rendering Method**
- **Client-Side Rendering (CSR)**:  
  The application uses CSR to provide a highly interactive user experience. This ensures faster page transitions and dynamic content updates on the client side.  

### **4. Database**
- **MySQL**:  
  MySQL is used as the database management system to store and manage data for users, posts, matches, and transactions.


## User Interface 
<a href="https://www.figma.com/design/Z5T7rDYzKXwm1aMTGU681c/Innovest?node-id=55-49&t=kKbTOFyg0yDQrX0V-1">
  <img src="https://i.imgur.com/BccJ7tb.png" alt="User Interface" width="600" />
</a>


## Project Features

Innovest offers a comprehensive platform for connecting entrepreneurs and investors. Below are the key features and corresponding API endpoints that power the system:

### **1. User Authentication**
- Secure registration and login for both entrepreneurs and investors.
- Token-based authentication to ensure secure access to features.

**API Endpoints**:
- `POST /login`: Authenticate users and provide an access token.
- `POST /sign-up`: Register new users as entrepreneurs or investors.

---

### **2. Investment Opportunities**
- **Investors**:
  - Browse available investment opportunities.
  - Show interest in specific opportunities.
  - Ask questions about opportunities.

**API Endpoints**:
- `GET /invest`: Fetch a list of available investment opportunities.
- `GET /invest/:id`: Get details of a specific investment opportunity.
- `POST /invest/:id/ask-question`: Submit a question about an investment opportunity.
- `GET /invest/:id/interested`: Check if an investor is interested in a specific opportunity.
- `POST /invest/:id/interested`: Mark interest in a specific opportunity.

---

### **3. Investor-Entrepreneur Matching**
- Display personalized matches for both investors and entrepreneurs.
- Allow interactions between matched parties.

**API Endpoints**:
- `GET /invest/matches`: Fetch a list of matches for an investor.
- `GET /invest/matches/:id`: Get details of a specific match for an investor.
- `GET /invest/matches/:id/ask-question`: Ask questions about a matched opportunity.
- `GET /invest/innovator-list`: Fetch a list of innovators for potential matches.
- `GET /invest/innovator-list/:id`: Get details of a specific innovator.

---

### **4. Fundraising for Entrepreneurs**
- **Entrepreneurs**:
  - List and manage pitches.
  - Knock on investors' profiles for funding.
  - Track investor interest and interactions.

**API Endpoints**:
- `GET /fundraise`: Fetch all fundraising opportunities.
- `GET /fundraise/:id`: View details of a specific fundraising opportunity.
- `GET /fundraise/:id/knock`: Check if a knock was sent to an investor.
- `POST /fundraise/:id/knock`: Send a knock to an investor.
- `GET /fundraise/matches`: Fetch matches for an entrepreneur.
- `GET /fundraise/matches/:id`: Get details of a specific match.
- `GET /fundraise/matches/:id/knock`: Check if a knock exists in a match.
- `POST /fundraise/matches/:id/knock`: Send a knock in a matched context.
- `GET /fundraise/investor-list`: Fetch a list of investors for potential matches.
- `GET /fundraise/investor-list/:id`: View details of a specific investor.

---

### **5. Entrepreneur Pitch Management**
- Entrepreneurs can create, view, edit, and delete their pitches.
- Track pitches and investor interactions.

**API Endpoints**:
- `GET /fundraise/my-pitches`: Fetch a list of pitches created by the entrepreneur.
- `GET /fundraise/my-pitches/:id`: Get details of a specific pitch.
- `PATCH /fundraise/my-pitches/:id`: Update an existing pitch.
- `POST /fundraise/my-pitches/add-pitch`: Add a new pitch.

---

### **6. News Feed**
- Keep users informed with the latest updates and activities.

**API Endpoints**:
- `GET /invest/news-feed`: Fetch news feed for investors.
- `GET /fundraise/news-feed`: Fetch news feed for entrepreneurs.

---

### **7. Frequently Asked Questions (FAQ)**
- Provide quick answers to common questions.

**API Endpoints**:
- `GET /faq`: Fetch a list of frequently asked questions.



## Milestones
### Milestone 1: Frontend Development & Authentication
 
- Implement frontend for **Login**, **Sign-Up**, and **Home** pages.
- Set up authentication for both **Entrepreneurs** and **Investors**.
- No direct connectivity between **Entrepreneurs** and **Investors** yet, but each user type can create a post.

### Milestone 2: Role-based Connectivity & Money Matters

- **Connect** Entrepreneurs and Investors.
- Implement features to handle **investment requests** and **money matters** (such as investment tracking and status updates).

### Milestone 3: UI Enhancements & Final Features

- **Enhance the User Interface** with dynamic elements like **graphs**, **charts**, and **interactive features**.
- Add **advanced data visualizations** for business performance and investment trends.
- Also last touch of **deployment**

  


## How to Download and Run the Project

Follow the steps below to get the project up and running on your local machine.

### Prerequisites
Before you begin, ensure that you have the following installed on your system:

- **PHP 8.0+**: [Install PHP](https://www.php.net/downloads.php)
- **Composer**: [Install Composer](https://getcomposer.org/)
- **Node.js**: [Install Node.js](https://nodejs.org/)
- **MySQL**: [Install MySQL](https://dev.mysql.com/downloads/installer/)
- **Git**: [Install Git](https://git-scm.com/)
- **Laravel Installer**: If not already installed, you can use Composer to install it:  
  `composer global require laravel/installer`
  
### Step 1: Clone the Repository
Clone the project repository to your local machine using the following command:

```bash
git clone https://github.com/your-username/innovest.git

### Step 2: Set Up the Backend (Laravel)

1.  Navigate to the project directory:

    ```bash
    cd innovest
    ```

2.  Install backend dependencies using Composer:

    ```bash
    composer install
    ```

3.  Create a `.env` file by copying the `.env.example` file:

    ```bash
    cp .env.example .env
    ```
4.  Set up your **MySQL database** in the `.env` file:

    ```env
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=innovest_db
    DB_USERNAME=root
    DB_PASSWORD=
    ```
5.  Run the database migrations:

    ```bash
    php artisan migrate
    ```

### Step 3: Set Up the Frontend (React)

1.  Navigate to the **frontend** directory:

    ```bash
    cd innovest
    cd frontend
    ```

2.  Install frontend dependencies using npm:

    ```bash
    npm install
    ```

3.  Set up environment variables by copying the `.env.example` file:

    ```bash
    cp .env.example .env
    ```

4.  Make sure your frontend is configured to communicate with the backend. In the `.env` file, set the **API URL**:

    ```env
    REACT_APP_API_URL=http://localhost:8000/api
    ```

5.  Start the React development server:

    ```bash
    npm run dev
    ```

    This will start the frontend application at `http://localhost:3000`.

### Step 4: Running the Application

Once both the backend and frontend are set up and running:

1.  **Backend** should be running on `http://localhost:8000`.
2.  **Frontend** should be running on `http://localhost:3000`.

Visit the frontend URL in your browser to access the Innovest platform. You should be able to sign up, log in, and explore investment opportunities.

### Troubleshooting

- If you encounter issues with database migrations, ensure your database credentials in the `.env` file are correct.
- If the frontend fails to connect to the backend, double-check the `REACT_APP_API_URL` in the `.env` file.
- Make sure to have **Node.js** and **npm** installed for the frontend setup and **Composer** for the backend setup.

### Additional Notes

- If you're running both the frontend and backend on different servers or ports, ensure proper **CORS** settings are configured in the backend.
- You can use Postman to test API endpoints during development.

