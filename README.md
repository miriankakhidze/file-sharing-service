# File Sharing Service

This is a simple **File Sharing Service** built with Node.js and Express, designed to allow users to upload, manage, and share files. It supports version control, metadata management, and various file operations.

### Features
- User Management: Register, login, and delete user accounts.
- Folder Management: Create, list, and delete folders.
- File Management: Upload, delete, and manage file metadata.
- Version Control: Track multiple versions of files.
- File Sharing: Generate short, time-limited download links for files and folders.
- Data Cleanup: Ensure proper deletion of user data upon account removal.
- Compression: Compress files using zlib for download.

### Requirements
- Node.js (v16 or higher)
- Express
- Multer for file uploads
- fs (File System) for file-based storage
- zlib for file compression
- dotenv for environment variables
- JWT for authentication

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/mkakhidze/file-sharing-service.git
cd file-sharing-service
```

#### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables

Create a .env file in the root directory and add the following configuration:
```js
PORT=3000
FILE_STORAGE_PATH=./storage/files
META_STORAGE_PATH=./storage/files
META_STORAGE_PATH=./storage/users
LINK_EXPIRATION_MINUTES=5
JWT_SECRET=your_jwt_secret
```

- FILE_STORAGE_PATH: Path where files and user data will be stored.
- USER_STORAGE_PATH: Path where users will be stored.
- META_STORAGE_PATH: Path where files meta will be stored.
- JWT_SECRET: Secret key used to sign JWTs.
- DOWNLOAD_LINK_EXPIRY_MINUTES: Expiry time (in minutes) for download links.

### 4. Run the Application
```bash
npm start
```

The server will run on ```http://localhost:3000```.

### API Endpoints

#### User Management
- `POST` /api/v1/user/create: Register a new user.
	- Request body: { "username": "string", "password": "string" }
- `POST` /api/v1/user/validate: Validate a user’s credentials.
	- Request body: { "username": "string", "password": "string" }
- `POST` /api/v1/user/login: Log in a user and return a JWT.
	- Request body: { "username": "string", "password": "string" }
	- Response: { "token": "JWT" }
- `POST` /api/v1/user/unregister: Delete the user account and associated data.
	- Request header: { "Authorization": "Bearer {{TOKEN}}" }

#### Folder Management
- `GET` /api/v1/user/space: List all files and folders in the user’s account.
- `PUT` /api/v1/user/space/create: Create a new folder or file.
	- Request body: { "folderPath": "string", "fileName": "string" }
- `DELETE` /api/v1/user/space/file: Delete a file or folder.
	- Request body: { "filePath": "string" }

#### File Management
- `POST` /api/v1/user/space/upload: Upload a new file.
	- Form data: file
- `POST` /api/v1/user/space/meta: Attach metadata to a file.
	- Request body: { "filePath": "string", "meta": { "key": "value" } }
- `GET` /api/v1/user/space/meta: Retrieve metadata for a file.
	- Query params: filePath

#### Version Control
- `GET` /api/v1/user/space/file-versions: List all versions of a file.
	- Query params: folderPath, fileName
- `GET` /api/v1/user/space/file-version: Download a specific version of a file.
	- Query params: folderPath, fileName, version
- `DELETE` /api/v1/user/space/file-version: Delete a specific version of a file.
	- Request body: { "folderPath": "string", "fileName": "string", "version": "int" }

#### File Sharing
- `GET` /api/v1/user/share: Generate a short download link for a file/folder.
	- Query params: filePath or folderPath
- `GET` /api/v1/user/space/download: Download a file or compressed folder.
	- Query params: filePath or folderPath

### How to Use

#### Register and Login
1. Register a user account with the /api/v1/user/create endpoint.
2. Login with the /api/v1/user/login endpoint to receive a JWT.

#### Upload Files
1. Use the /api/v1/user/space/upload endpoint to upload files.
2. Files will be stored with version control. Each file uploaded will have a version number.

#### Create Folders
1. Use the /api/v1/user/space/create endpoint to create folders.

#### Share Files
1. Use /api/v1/user/share to generate a time-limited download link.
2. The link expires after the configured time (default: 5 minutes).

#### License

This project is licensed under the MIT License - see the LICENSE file for details.