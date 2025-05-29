# Library Card Manager 📚

A simple and modern library lending management system with SQLite database. This is an easy-to-use web application built with HTML, CSS, JavaScript, and Node.js.

## Features ✨

- 📱 Responsive design
- 🎨 Modern and minimal UI
- 🗄️ SQLite database for persistent data storage
- ⚡ REST API backend with Express.js
- 📅 Due date management
- 🚨 Visual alerts for overdue books
- 📊 Library statistics

## Setup and Installation 🚀

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Access the Application**
   - Open your web browser
   - Go to `http://localhost:3000`

## How to Use 📖

1. **Lend a Book**
   - Enter the "Book Title"
   - Enter the "Author Name"
   - Select the "Due Date"
   - Click the "Lend" button

2. **Return a Book**
   - Click the "Return" button for the corresponding book

3. **Check Lending Status**
   - All currently lent books are listed at the bottom of the screen
   - Overdue books are highlighted in red

## API Endpoints 🔗

- `GET /api/books` - Get all borrowed books
- `POST /api/books` - Add a new borrowed book
- `GET /api/books/:id` - Get a specific book
- `DELETE /api/books/:id` - Return a book (delete record)
- `GET /api/statistics` - Get library statistics

## File Structure 📁

- `index.html` - Main HTML of the application
- `style.css` - Stylesheet
- `app.js` - Frontend application logic
- `server.js` - Express.js server
- `database.js` - SQLite database operations
- `package.json` - Node.js dependencies
- `library.db` - SQLite database file (auto-created)

## Technical Specifications 🔧

- **Backend:** Node.js with Express.js
- **Database:** SQLite3
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **API:** RESTful JSON API

## Database Schema 🗄️

**books table:**
- `id` - INTEGER PRIMARY KEY AUTOINCREMENT
- `title` - TEXT NOT NULL
- `author` - TEXT NOT NULL  
- `due_date` - DATE NOT NULL
- `borrowed_date` - DATETIME DEFAULT CURRENT_TIMESTAMP
- `created_at` - DATETIME DEFAULT CURRENT_TIMESTAMP

## Supported Browsers 🌐

Tested on the following modern browsers:
- Google Chrome
- Mozilla Firefox
- Safari
- Microsoft Edge

## License 📄

MIT License

## Author 👤

Created with ❤️ for efficient library management

---

For inquiries or requests, please use the Issues feature.
