# MVP_TEST
    MVP: KARMA SYSTEM FOR A PlATFORM


## DOCKER FILE
Run:
    docker-compose build
    docker-compose up

## MAIN ARCHITECTURE 
    Separated Micro-Services using docker containers.
    Secure Authentification using Oauth.
    Use of relational Database (MariaDB) for handling structured data and providing 
    strong ACID ((atomicity, consistency, isolation, durability)) compliance.

## Database Architecture:

    User Interactions Table:
    
    Columns: interaction_id, user_id, action_type, timestamp.
    Records user actions like posting, liking, replying.
    Karma Points Table:
    
    Columns: user_id, total_points.
    Stores cumulative karma points for each user.
    Admin Actions Table:
    
    Columns: admin_action_id, admin_id, action_type, timestamp.
    Logs actions taken by admins.

## SECURITY
    all the password of users are going to be hached then stored into the database.
    using  Parameterized query to prevent the SQL statement injection.


