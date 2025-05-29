const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = null;
        this.init();
    }

    init() {
        const dbPath = path.join(__dirname, 'library.db');
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            } else {
                console.log('Connected to SQLite database');
                this.createTables();
            }
        });
    }

    createTables() {
        const createBooksTable = `
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                due_date DATE NOT NULL,
                borrowed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        this.db.run(createBooksTable, (err) => {
            if (err) {
                console.error('Error creating books table:', err.message);
            } else {
                console.log('Books table created or already exists');
            }
        });
    }

    addBook(title, author, dueDate) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO books (title, author, due_date)
                VALUES (?, ?, ?)
            `;
            
            this.db.run(sql, [title, author, dueDate], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        title,
                        author,
                        dueDate,
                        borrowedDate: new Date().toISOString()
                    });
                }
            });
        });
    }

    getAllBooks() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id, title, author, due_date as dueDate, 
                       borrowed_date as borrowedDate, created_at as createdAt
                FROM books 
                ORDER BY due_date ASC
            `;
            
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    getBookById(id) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT id, title, author, due_date as dueDate, 
                       borrowed_date as borrowedDate, created_at as createdAt
                FROM books 
                WHERE id = ?
            `;
            
            this.db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    deleteBook(id) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM books WHERE id = ?`;
            
            this.db.run(sql, [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ deletedId: id, changes: this.changes });
                }
            });
        });
    }

    getStatistics() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN date(due_date) < date('now') THEN 1 ELSE 0 END) as overdue,
                    SUM(CASE WHEN date(due_date) >= date('now') THEN 1 ELSE 0 END) as onTime
                FROM books
            `;
            
            this.db.get(sql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Database connection closed');
                    resolve();
                }
            });
        });
    }
}

module.exports = Database;