** Karma Points System - Backend Application **

    This repository contains the backend application for a Karma Points system.
    The application is built using Node.js, Express, MariaDB, and various middleware for enhanced functionality.

** Features **

    User Authentication: Secure user signup, signin, and logout functionality.
    Profile Management: View and reward users with karma points.
    Reward System: Reward users for different actions such as liking and posting.
    Session Management: Utilize sessions for user authentication.
    Database Interaction: Perform CRUD operations on the database.
** Setup **

    Clone the repository:
            git clone git@github.com:m4ntr4r4m4/MVP_TEST.git
            cd MVP_TEST
            make
** Database Schema **

    The application uses MariaDB as its database.
    The database schema is defined in the init.sql file.

    users: Store user information, including username, password, and email.
    UserInteractions: Track user interactions, such as liking or posting, with timestamps.
    KarmaPoints: Store users' total karma points.
    AdminActions: Track admin-related actions with timestamps.

** API Endpoints **

    Authentication:

        POST /api/signup: Sign up a new user.
        POST /api/signin: Sign in an existing user.
        GET /logout: Log out the user.

    Profile Management:
        GET /profile: Retrieve user profile information.

** Reward System **

    POST /api/reward/like:
                Reward a user with karma points for liking.
    POST /api/reward/post:
                Reward a user with karma points for posting.    

** Operations **

    Application Initialization:
        Retry database connection before starting the application to ensure database readiness.
    User Interaction:
        Reward users for specific actions.
        Fetch and display user profiles along with total karma points.
** Scalability and Performance ** 

    The application is designed to scale with potential growth in user interactions.
    It utilizes a MariaDB database, and the Docker setup allows for easy scaling of the application and database components.
    Additionally, the retry mechanism ensures a robust connection to the database.

** Security **

    User Authentication:
        Passwords are securely hashed using bcrypt during user signup.
        Sessions are managed securely using the express-session middleware.
** Logging **

    Sensitive information, such as passwords, is avoided in logs.    
