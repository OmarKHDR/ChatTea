# ChatTea: Real-Time Chat Application

ChatTea is a real-time chat application built using Node.js, Express.js, Socket.IO, and MongoDB. It allows users to join different chat rooms, send messages, and see who's online. This project is designed to demonstrate real-time communication with a focus on clarity and maintainability.

## Features

-   **Real-Time Chat:** Instant message delivery using WebSockets.
-   **Multiple Chat Rooms:** Users can join and switch between rooms.
-   **Usernames:** Users can set a username to be displayed with messages.
-   **Announcements:** System messages for users joining/leaving rooms.
-   **Persistent Messages:** Stores all messages using MongoDB database.
- **Admin Functionality**
    -   Users can be promoted to admins, and admins can remove other users
- **User Functionality**
    -   Shows a list of all admins and users
    -   Displays a username in header
    -   User can delete their own messages

## Technologies Used

-   **Node.js:** JavaScript runtime environment for server-side development.
-   **Express.js:** A minimal and flexible Node.js web application framework.
-   **Socket.IO:** Real-time, bidirectional, event-based communication library.
-   **MongoDB:** NoSQL document database for storing messages, rooms, and users.
-   **JavaScript:** For client-side logic and interactivity.

## Setup Instructions

To run ChatTea locally, follow these steps:

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/OmarKHDR/ChatTea.git
    cd ChatTea
    ```

2.  **Install Dependencies:**
    Navigate to both the `client` and `server` folders and install dependencies using npm.

    ```bash
      cd client
      npm install
    ```

    ```bash
        cd ../server
        npm install
    ```

3.  **Set Up MongoDB:**
    -   Make sure you have MongoDB installed and running.
    -   Create a `.env` file inside the `server` folder and add the following, filling with your database URI:

        ```
        MONGO_URI=your_mongodb_connection_string
        ```

4.  **Start the Server:**
    Navigate to the `server` folder and start the server:

    ```bash
       npm run dev
    ```

    This will start the server on port 3000 (default), and the client will be served on port 8080

5.  **Start the Client:**
    Navigate to the `client` folder and start the client:

    ```bash
       npm run dev
    ```

6.  **Open in Browser:**
    Open your web browser and go to `http://localhost:8080` to view the application.

## Project Structure
```
ChatTea/
├── client/ # Client-side code (React app)
│ ├── public/
│ ├── src/
│ ├── components/
│ ├── pages/
│ ├── App.jsx
│ ├── main.jsx
│ ├── index.css
│ └──...
│ ├── package.json
│ └── ...
├── server/ # Server-side code (Node.js)
│ ├── routes/ # Contains API routes and route handlers
│ ├── models/
│ ├── utils/
│ ├── index.js # Entry point of the server
│ ├── package.json
│ └── ...
├── README.md # This file
└── ...
```


## API Endpoints

### User
- `/api/user/username` - returns a username if one is present in session
### Room
- `/api/room/list-rooms` - returns a list of all rooms
- `/api/room/list-members` - returns a list of all members in a room
- `/api/room/list-admins` - returns a list of all admins in a room
- `/api/room/room-session?roomName={roomName}` - set the session's room name
- `/api/room/add-member` - adds current user to the room's list of members
- `/api/room/remove-member?roomName={roomName}` - removes the current user from the room's list of members
### Message
- `/api/message/all-messages` - returns all messages from the current room in the session
- `/api/message/add-message` - adds a message to the database
- `/api/message/delete-messages/` - removes all messages from the current room in the session

## Socket.IO Events

-   `username`: Used to set the username of the current socket
-   `joinRoom`: Sent when a user joins a room (or switches rooms).
-   `message`: Used to send message data between users.
-   `announcement`: Sent when a user joins or leaves a room.
-   `rejoin`: Sent to inform client that username was not present when a client requested to join a room
-   `message-failed`: Informs client that the message they sent failed to send to server

## Contributing

Contributions are always welcome! If you have suggestions, bug reports, or want to contribute code, please:

1.  Fork the repository.
2.  Create a new branch for your feature or fix.
3.  Commit your changes.
4.  Push your branch to your forked repository.
5.  Submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Author

[Omar KHDR](https://github.com/OmarKHDR)