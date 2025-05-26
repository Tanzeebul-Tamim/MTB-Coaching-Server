<h1 style="display: flex; align-items: center;">
    <img src="./public/logo.png" alt="Logo" width="100"/>
    <span>MTB-Coaching - Server Side</span>
</h1>

Welcome to the server-side repository of the **_Professional Mountain Biking Coaching Network_** website. It is responsible for handling API requests and managing the database functionalities.

<br>

## 📚 Table of Contents

-   [Features](#-features)
-   [Technologies Used](#-technologies-used)
-   [Prerequisites](#-prerequisites)
-   [Project Structure](#-project-structure)
-   [Installation, Configuration & Running Locally](#-installation-configuration-and-running-locally)
-   [API Endpoints](#-api-endpoints)
-   [Testing the API](#-testing-the-api)
-   [Email System](#-email-system)
-   [Checkout the Client End](#-checkout-the-client-end)
-   [Live Deployment](#-live-deployment)
-   [License](#-license)

<br>

## 🚀 Features

-   CRUD operations for users and items.
-   Database interactions using MongoDb.
-   Environment-based configuration.
-   Search and sort functionality for instructors and courses
-   Transactional emails using Nodemailer with Mailgun integration.
-   Date and time formatting with Moment.js.
-   Handlebars – for generating dynamic HTML email template rendering

<br>

## 🧰 Technologies Used

-   Node.js
-   Express.js
-   MongoDB
-   JSON Web Token (JWT)
-   Moment.js – for date and time formatting
-   Nodemailer – for sending transactional emails
-   Mailgun Transport – for email delivery via Mailgun API
-   Handlebars – for generating dynamic HTML email templates

<br>

## ✅ Prerequisites

-   Node.js and npm installed.
-   MongoDB installed and running.

<br>

## 📁 Project Structure

```
MTB-Coaching-Server/
├── public/                         # Static assets (images, logos, etc.)
├── src/
│   ├── routes/                     # API route handlers-related operations
│   │   ├── bookings.js             # Booking and payment-related API endpoints (class booking, payment intent, etc.)
│   │   ├── classes.js              # Class-related API endpoints (list, search, top classes, etc.)
│   │   ├── instructors.js          # Instructor-related API endpoints (list, search, top instructors, etc.)
│   │   └── users.js                # User-related API endpoints (create/update user, get user by email, etc.)
│   ├── app.js                      # Express app configuration and middleware setup
│   ├── email.service.js            # Email sending logic and configuration
│   └── server.js                   # Server startup and environment configuration
├── templates/
│   └── paymentConfirmation.html    # HTML template for payment confirmation emails
├── .env.example                    # Template Environment variables for local development
├── .gitignore                      # Specifies files and folders to be ignored by Git
├── LICENSE                         # Project license information (MIT)
├── package-lock.json               # Auto-generated lockfile for npm dependencies
├── package.json                    # Project metadata and dependencies
├── README.md                       # Project documentation (this file)
└── vercel.json                     # Vercel deployment configuration
```

<br>

## 🔧 Installation, Configuration and Running Locally

1. **_Clone the repository:_**

    ```bash
    git clone https://github.com/Tanzeebul-Tamim/MTB-Coaching-Server
    cd MTB-Coaching-Server
    ```

2. **_Install dependencies:_**

    ```bash
    npm install
    ```

3. **_Set up Environment Variables:_**

    - **Rename the [`.env.example`](./.env.example) file in the project root to `.env`:**

        This file contains the following fields

        ```env
        PORT=5000
        DB_USER=yourDatabaseUser
        DB_PASS=yourSecureDbPassword
        PAYMENT_SECRET_KEY=sk_test_YourPaymentSecretKeyHere
        EMAIL_PRIVATE_KEY=yourEmailPrivateKey
        EMAIL_DOMAIN=mg.yourdomain.com
        MAIL_SENDER=verified_sender@example.com
        ```

    - **Guide & Configuration Details**

        - **SERVER PORT:**

            The port your server will listen on (commonly 5000 or 8000)
            **`PORT=5000`**
            <br>

        - **DATABASE USERNAME:**

            Username credential for your database (used in connection string or DB config)
            **`DB_USER=yourDatabaseUser`**
            <br>

        - **DATABASE PASSWORD:**

            Corresponding password for the `DB_USER`
            **`DB_PASS=yourSecureDbPassword`**
            <br>

        - **PAYMENT GATEWAY SECRET KEY:**

            Your _Stripe_ payment processor’s private/secret key
            **`PAYMENT_SECRET_KEY=sk_test_YourPaymentSecretKeyHere`**
            <br>

        - **EMAIL PRIVATE KEY:**

            The private key from _Nodemailer_ email service provider
            **`EMAIL_PRIVATE_KEY=yourEmailPrivateKeyValue`**
            <br>

        - **EMAIL DOMAIN:**

            Domain or subdomain configured for sending emails
            **`EMAIL_DOMAIN=mg.yourdomain.com`**
            <br>

        - **SENDER EMAIL ADDRESS:**

            The verified sender address used by your mailer - _Nodemailer_ to send emails from the application.
            This email must be authorized in your email service configuration.

            **`MAIL_SENDER=your_verified_sender@example.com`**

            > 📌 In development, you can use a test email. In production, make sure this is a verified and authenticated sender (especially for services like Mailgun, SendGrid, etc.).

        > ⚠️ **Caution:** Never commit your `.env` file to version control (GitHub, Git, etc.) as it contains sensitive credentials. Always keep this file private and add `.env` to your `.gitignore`.

4. **_Running the application_**
    - Start the server:
        ```bash
        npm start
        ```

<br>

## 📡 API Endpoints

Below are the main API endpoints provided by this server.

> **NB:** Some endpoints require query parameters for correct operation. If you do not provide required parameters, you may receive empty results or errors.

-   **Users**

    -   **_PUT_** `/users/:email`:

        Save or update a user in the database. Expects user data in the request body.

        > **Example**:
        >   `PUT /users/john@example.com`
        >   **Body**: `{ "name": "John Doe", "role": "Student" }`

    -   **_GET_** `/users/:email`:

        Get a single user by email.

        > **Example**:
        >   `GET /users/john@example.com`

     <br>

-   **Instructors**

    -   **_GET_** `/instructors?count=<number>&search=<string>`:

        Get all instructors. Optional query parameters:

        -   **`count` (number):** Limits the number of instructors returned. If omitted, returns all.
        -   **`search` (string):** Case-insensitive search by instructor name. If omitted, returns all.

        <br>

        > **Example**:
        >   `GET /instructors?count=5&search=Alex`

    -   **_GET_** `/instructors/total`:

        Get the total number of instructor accounts registered.

        > **Example**:
        >   `GET /instructors/total`

    -   **_GET_** `/instructors/top`:

        Get the top 6 instructors (by total students) and a list of all instructors with their total students.

        > **Example**:
        >   `GET /instructors/top`

    -   **_GET_** `/instructor/:id`:

        Get a single instructor by MongoDB ObjectId.

        > **Example**:
        >   `GET /instructor/6653e1b2c1a2b3d4e5f6a7b8`

    -   **_PUT_** `/instructor/updateStudentCount`:

        Update an instructor's class student count. Expects `{ instructorId, classIndex }` in the request body.

        > **Example**:
        >   `PUT /instructor/updateStudentCount`
        >   **Body**: `{ "instructorId": "6653e1b2c1a2b3d4e5f6a7b8", "classIndex": 0 }`

        <br>

-   **Classes**

    -   **_GET_** `/classes/total`:
    
        Get the total number of classes.

        > **Example**:
        >   `GET /classes/total`

    -   **_GET_** `/classes/top`:
    
        Get the top 6 classes (by total students).

        > **Example**:
        >   `GET /classes/top`

    -   **_GET_** `/classes?count=<number>&search=<string>`:
        
        Get all classes. Query parameters:
        
        -   **`count` (number):** Limits the number of classes returned. If omitted, returns empty array.
        -   **`search` (string):** Case-insensitive search, filters by class name. If omitted, returns all.

        <br>

        > **⚠️ Caution:** _`count`_ is required & `search` is optional.
        > **Example**:
        >   `GET /classes?count=10`
        >   `GET /classes?count=5&search=Beginner`

    <br>

-   **Bookings**

    -   **_PUT_** `/book-class`:
    
        Post a booking. Expects booking details in the request body.

        > **Example**:
        >   `PUT /book-class`
        >   **Body**: `{ "studentId": "6653e1b2c1a2b3d4e5f6a7b8", "instructorId": "6653e1b2c1a2b3d4e5f6a7b9", "classIndex": 0, ... }`

    -   **_GET_** `/book-class/:studentId`:
    
        Get all bookings for a user by their studentId.

        > **Example**:
        >   `GET /book-class/6653e1b2c1a2b3d4e5f6a7b8`

    -   **_GET_** `/book-class/:studentId/:itemId`:
    
        Get a specific booking by studentId and booking itemId.

        > **Example**:
        >   `GET /book-class/6653e1b2c1a2b3d4e5f6a7b8/6653e1b2c1a2b3d4e5f6a7c0`

    -   **_DELETE_** `/book-class/:studentId/:itemId`:
    
        Delete a specific booking by studentId and itemId.

        > **Example**:
        >   `DELETE /book-class/6653e1b2c1a2b3d4e5f6a7b8/6653e1b2c1a2b3d4e5f6a7c0`

    -   **_DELETE_** `/booking/:studentId`:
        
        Delete all unpaid bookings for a user by studentId.

        > **Example**:
        >   `DELETE /booking/6653e1b2c1a2b3d4e5f6a7b8`

    <br>

-   **Payment**

    -   **_POST_** `/create-payment-intent`:

        Create a Stripe payment intent. Expects `{ price }` in the request body.

        > **Example**:
        >   `POST /create-payment-intent`
        >   **Body**: `{ "price": 99.99 }`

<br>

### 🧪 **Testing the API**

-   Use tools like **Postman**, **Insomnia**, or your browser (for GET requests) to test endpoints.
-   For endpoints requiring query parameters (like `/classes`), always include them in the URL.
-   For POST/PUT endpoints, provide the required JSON body.
-   The server will respond with JSON data for all endpoints.

> **📝 NB:** For more details on _request/response_ formats, see the source code in [**`src/routes/`**](./src/routes/).

<br>

## 📨 Email System

This server uses **Nodemailer** with **Mailgun** and **Handlebars** templating to send transactional emails, such as:

-   Enrollment confirmations
-   Payment receipts

> ⚠️ **Note on Email Testing**
> Due to the use of a **Mailgun sandbox domain** (part of the free-tier setup), emails can **only be sent to pre-authorized recipients**. This means only specified test addresses (e.g., mine) will successfully receive emails. Other users will not receive them unless added as authorized recipients.

To evaluate the email system:

-   Please refer to the screenshot below showing the rendered email content.
-   The email [**_logic_**](./src/email.service.js), [**_structure_**](./templates/paymentConfirmation.html), and [**_template integration_**](./src/routes/bookings.js#L55-L63) can be reviewed in the source code.

<br>

![Transaction Confirmation Email](./public/mail.png)

<br>

## 💻 Checkout the Client End

Visit the [**_front-end repository_**](https://github.com/Tanzeebul-Tamim/MTB-Coaching-Client) of the website.

<br>

## 🌐 Live Deployment

The API is deployed at vercel and can be accessed through [**_this following URL_**](https://summer-camp-school-server-ivory.vercel.app/)

<br>

## 📄 License

This project is licensed under the **MIT License** - see the [**_LICENSE_**](LICENSE) file for details.
