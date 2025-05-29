/**
 * Library Management System
 * Manages book lending and returns with SQLite database
 */
class LibraryManager {
    static API_BASE_URL = '/api';
    static MESSAGES = {
        REQUIRED_FIELDS: 'すべての項目を入力してください',
        INVALID_DATE: '有効な返却期限を入力してください',
        RETURN_CONFIRM: '本当にこの本を返却しますか？',
        NETWORK_ERROR: 'ネットワークエラーが発生しました',
        SERVER_ERROR: 'サーバーエラーが発生しました'
    };

    /**
     * Initialize the LibraryManager instance
     */
    constructor() {
        this.books = [];
        this.initializeUI();
        this.loadBooks();
    }

    /**
     * Make API request with error handling
     * @param {string} url - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise} API response
     */
    async apiRequest(url, options = {}) {
        try {
            const response = await fetch(`${LibraryManager.API_BASE_URL}${url}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
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
    async addBook() {
        const title = document.getElementById('bookTitle')?.value?.trim();
        const author = document.getElementById('bookAuthor')?.value?.trim();
        const dueDate = document.getElementById('dueDate')?.value;

        if (!this.validateBookInput(title, author, dueDate)) {
            return;
        }

        try {
            const addButton = document.getElementById('addBook');
            addButton.disabled = true;
            addButton.textContent = '登録中...';

            const response = await this.apiRequest('/books', {
                method: 'POST',
                body: JSON.stringify({ title, author, dueDate })
            });

            if (response.success) {
                await this.loadBooks();
                this.clearForm();
                document.getElementById('bookTitle')?.focus();
            }
        } catch (error) {
            alert(`本の登録に失敗しました: ${error.message}`);
        } finally {
            const addButton = document.getElementById('addBook');
            addButton.disabled = false;
            addButton.textContent = '📖 貸出登録';
        }
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
    async returnBook(id) {
        const book = this.books.find(b => b.id === id);
        if (!book) return;

        if (confirm(`${book.title} を返却しますか？`)) {
            try {
                const response = await this.apiRequest(`/books/${id}`, {
                    method: 'DELETE'
                });

                if (response.success) {
                    await this.loadBooks();
                }
            } catch (error) {
                alert(`本の返却に失敗しました: ${error.message}`);
            }
        }
    }

    /**
     * Load and display all books
     */
    async loadBooks() {
        if (!this.booksList) return;

        try {
            this.booksList.innerHTML = '<p class="no-books">読み込み中...</p>';
            
            const response = await this.apiRequest('/books');
            
            if (response.success) {
                this.books = response.data;
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
        } catch (error) {
            this.booksList.innerHTML = '<p class="no-books">データの読み込みに失敗しました</p>';
            console.error('Failed to load books:', error);
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
     * @returns {Promise<Object>} Library statistics
     */
    async getStatistics() {
        try {
            const response = await this.apiRequest('/statistics');
            return response.success ? response.data : null;
        } catch (error) {
            console.error('Failed to load statistics:', error);
            return null;
        }
    }
}

// Initialize the library manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.libraryManager = new LibraryManager();
});
