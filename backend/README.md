# VideoTube Backend
Welcome to the VideoTube Backend project! This backend service provides the necessary functionality for managing user accounts, videos, subscriptions, likes, comments, tweets, playlists, and dashboard details for your VideoTube application.

#### [Click here](https://documenter.getpostman.com/view/33102208/2sA2xb8GpS) for postman documentation.

## Table of Contents
- **Introduction**
- **Installation**
- **Usage**
- **Features**
- **Dependencies**
- **API documentation**
- **Acknowledgements**
- **Author**

### Introduction
The VideoTube Backend is built with Node.js and Express.js, utilizing various dependencies such as bcrypt, cloudinary, cors, dotenv, jsonwebtoken, mongoose, multer, and mongoose-aggregate-paginate-v2. It offers a comprehensive set of features to power your video-sharing platform.


### Installation
#### 1. Clone the repository to your local machine.

```
git clone https://github.com/subho-1011/VideoTube.git
```

#### 2. Goto backend directory
````
cd backend
````

#### 3. Install the dependencies.

```
npm i
```

#### 4. Set up your environment variables by creating a .env file based on the provided .env.example. 
```
PORT=8080
MONGODB_URI="Your mongodb uri"
CORS_ORIGIN=*

ACCESS_TOKEN_SECRET=""
ACCESS_TOKEN_EXPIRY=""

REFRESH_TOKEN_SECRET=""
REFRESH_TOKEN_EXPIRY=""

CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET_KEY=""
```

Start the development server.
```
npm run dev
```

### Usage
Ensure that the MongoDB server is running, and the connection string is correctly set in the .env file. The server will start on http://localhost:8080 by default.

### Features

#### User Authentication and Authorization
- **User Registration and Login:** Securely register and authenticate users using bcrypt for password hashing.
- **JWT Token Usage:** Utilize JSON Web Tokens (JWT) for user authentication and authorization.
- **Refresh Token:** Implement a refresh token mechanism for extended user sessions.
- **Change Password:** Allow users to securely update their passwords.
- **Update User Details:** Enable users to modify their profile information.
- **Watch History:** Track and retrieve a user's watch history.

#### Video Management
- **Get All Videos:** Fetch a list of all available videos.
- **Publish Video with Thumbnail:** Upload and publish videos with associated thumbnails.
- **Toggle Video Publishing:** Switch the publish status of a video
- **Get Video by ID:** Retrieve detailed information about a specific video.
- **Update and Delete Videos:** Allow for video updates and removal.

#### Subscriptions
- **Toggle Subscriptions:** Allow users to subscribe and unsubscribe from channels.
- **Subscribers List:** Retrieve a list of subscribers for a channel.
- **Channels Subscribed by User:** Get a list of channels a user is subscribed to.

#### Likes
- **Toggle Likes:** Allow users to like or unlike videos, comments, and tweets.
- **Get Liked Videos:** Retrieve a list of all videos liked by a user.

#### Comments
- **Get All Comments for a Video:** Retrieve comments associated with a video.
- **Add, Update, and Delete Comments:** Enable users to interact with video content through comments.

#### Tweets
- **Create, Get, Update, and Delete Tweets:** Implement a tweet system for engaging with users.

#### Playlist Management
- **Create, Get, Update, and Delete Playlists:** Allow users to create, manage, and delete playlists.
- **Add and Remove Videos in Playlist:** Include and exclude videos from playlists.

#### Dashboard
- **Get Channel Status:** Retrieve basic channel status information.
- **Get Full Channel Details:** Fetch comprehensive details about a channel.


### Dependencies
* **[bcrypt](https://www.npmjs.com/package/bcrypt)**: Password hashing library.
* **[cloudinary](https://cloudinary.com/)**: Cloud storage for uploaded videos.
* **[cookie-parser](https://www.npmjs.com/package/cookie-parser)**: Parse HTTP request cookies.
* **[cors](https://www.npmjs.com/package/cors)**: Enable cross-origin resource sharing.
* **[dotenv](https://www.npmjs.com/package/dotenv)**: Load environment variables from a file.
* **[express](https://expressjs.com/)**: Web framework for Node.js.
* **[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)**: Create and verify JWTs.
* **[mongoose](https://mongoosejs.com/)**: MongoDB object modeling for Node.js.
* **[mongoose-aggregate-paginate-v2](https://www.npmjs.com/package/mongoose-aggregate-paginate-v2)**: Paginate MongoDB aggregate queries.
* **[multer](https://www.npmjs.com/package/multer)**: Handle file uploads.

### API documentation
[postman docs](https://documenter.getpostman.com/view/33102208/2sA2xb8GpS)

### Acknowledgements

Special thanks to [@hiteshchoudhary](https://github.com/hiteshchoudhary)

### Author
[Subhajit Pramanik](https://github.com/subho-1011)

Feel free to explore and contribute to the VideoTube Backend project. Happy coding! 🚀
