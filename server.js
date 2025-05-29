const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/books', async (req, res) => {
    try {
        const books = await db.getAllBooks();
        res.json({ success: true, data: books });
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/books', async (req, res) => {
    try {
        const { title, author, dueDate } = req.body;
        
        if (!title || !author || !dueDate) {
            return res.status(400).json({ 
                success: false, 
                error: 'Title, author, and due date are required' 
            });
        }

        const dueDateObj = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dueDateObj < today) {
            return res.status(400).json({ 
                success: false, 
                error: 'Due date cannot be in the past' 
            });
        }

        const book = await db.addBook(title, author, dueDate);
        res.status(201).json({ success: true, data: book });
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/books/:id', async (req, res) => {
    try {
        const book = await db.getBookById(req.params.id);
        if (!book) {
            return res.status(404).json({ success: false, error: 'Book not found' });
        }
        res.json({ success: true, data: book });
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/books/:id', async (req, res) => {
    try {
        const result = await db.deleteBook(req.params.id);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Book not found' });
        }
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/statistics', async (req, res) => {
    try {
        const stats = await db.getStatistics();
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const gracefulShutdown = () => {
    console.log('Shutting down gracefully...');
    db.close().then(() => {
        process.exit(0);
    }).catch(() => {
        process.exit(1);
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Library Management System with SQLite database ready!');
});