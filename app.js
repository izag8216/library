/**
 * Library Management System
 * Manages book lending and returns with localStorage persistence
 */
class LibraryManager {
    static STORAGE_KEY = 'books';
    static MESSAGES = {
        REQUIRED_FIELDS: 'すべての項目を入力してください',
        INVALID_DATE: '有効な返却期限を入力してください',
        RETURN_CONFIRM: '本当にこの本を返却しますか？'
    };

    /**
     * Initialize the LibraryManager instance
     */
    constructor() {
        this.books = this.loadBooksFromStorage();
        this.initializeUI();
        this.loadBooks();
    }

    /**
     * Load books from localStorage with error handling
     * @returns {Array} Array of book objects
     */
    loadBooksFromStorage() {
        try {
            const stored = localStorage.getItem(LibraryManager.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Failed to load books from storage:', error);
            return [];
        }
    }

    /**
     * Initialize UI event listeners and DOM references
     */
    initializeUI() {
        const addBookBtn = document.getElementById('addBook');
        if (addBookBtn) {
            addBookBtn.addEventListener('click', () => this.addBook());
        }
        
        this.booksList = document.getElementById('booksList');
        
        // Add Enter key support for form inputs
        ['bookTitle', 'bookAuthor', 'dueDate'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.addBook();
                    }
                });
            }
        });
    }

    /**
     * Validate and add a new book to the library
     */
    addBook() {
        const title = document.getElementById('bookTitle')?.value?.trim();
        const author = document.getElementById('bookAuthor')?.value?.trim();
        const dueDate = document.getElementById('dueDate')?.value;

        if (!this.validateBookInput(title, author, dueDate)) {
            return;
        }

        const book = {
            id: this.generateBookId(),
            title,
            author,
            dueDate,
            borrowedDate: new Date().toISOString()
        };

        this.books.push(book);
        this.saveBooks();
        this.loadBooks();
        this.clearForm();
        
        // Focus back to title input for easy continuous entry
        document.getElementById('bookTitle')?.focus();
    }

    /**
     * Validate book input fields
     * @param {string} title - Book title
     * @param {string} author - Book author
     * @param {string} dueDate - Due date
     * @returns {boolean} True if valid
     */
    validateBookInput(title, author, dueDate) {
        if (!title || !author || !dueDate) {
            alert(LibraryManager.MESSAGES.REQUIRED_FIELDS);
            return false;
        }

        const dueDateObj = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dueDateObj < today) {
            alert(LibraryManager.MESSAGES.INVALID_DATE);
            return false;
        }

        return true;
    }

    /**
     * Generate a unique book ID
     * @returns {number} Unique ID
     */
    generateBookId() {
        return Date.now() + Math.random();
    }

    /**
     * Create a book card DOM element
     * @param {Object} book - Book object
     * @returns {HTMLElement} Book card element
     */
    createBookCard(book) {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.setAttribute('data-book-id', book.id);
        
        const dueDate = new Date(book.dueDate);
        const isOverdue = dueDate < new Date();
        
        if (isOverdue) {
            card.classList.add('overdue');
        }

        card.innerHTML = `
            <div class="book-info">
                <div class="book-title" title="${this.escapeHtml(book.title)}">${this.escapeHtml(book.title)}</div>
                <div class="book-author" title="${this.escapeHtml(book.author)}">${this.escapeHtml(book.author)}</div>
                <div class="due-date ${isOverdue ? 'overdue-text' : ''}">
                    返却期限: ${this.formatDate(book.dueDate)}
                </div>
            </div>
            <button class="return-btn" 
                    onclick="libraryManager.returnBook(${book.id})"
                    aria-label="${this.escapeHtml(book.title)}を返却">
                返却
            </button>
        `;

        return card;
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Format date for display
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP');
    }

    /**
     * Return a book with confirmation
     * @param {number} id - Book ID
     */
    returnBook(id) {
        const book = this.books.find(b => b.id === id);
        if (!book) return;

        if (confirm(`${book.title} を返却しますか？`)) {
            this.books = this.books.filter(book => book.id !== id);
            this.saveBooks();
            this.loadBooks();
        }
    }

    /**
     * Load and display all books
     */
    loadBooks() {
        if (!this.booksList) return;

        this.booksList.innerHTML = '';
        
        if (this.books.length === 0) {
            this.booksList.innerHTML = '<p class="no-books">貸出中の本はありません</p>';
            return;
        }

        const sortedBooks = this.books.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        
        sortedBooks.forEach(book => {
            this.booksList.appendChild(this.createBookCard(book));
        });
    }

    /**
     * Save books to localStorage with error handling
     */
    saveBooks() {
        try {
            localStorage.setItem(LibraryManager.STORAGE_KEY, JSON.stringify(this.books));
        } catch (error) {
            console.error('Failed to save books to storage:', error);
            alert('データの保存に失敗しました');
        }
    }

    /**
     * Clear the book input form
     */
    clearForm() {
        ['bookTitle', 'bookAuthor', 'dueDate'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = '';
            }
        });
    }

    /**
     * Get statistics about the library
     * @returns {Object} Library statistics
     */
    getStatistics() {
        const totalBooks = this.books.length;
        const overdueBooks = this.books.filter(book => 
            new Date(book.dueDate) < new Date()
        ).length;
        
        return {
            total: totalBooks,
            overdue: overdueBooks,
            onTime: totalBooks - overdueBooks
        };
    }
}

// Initialize the library manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.libraryManager = new LibraryManager();
});
