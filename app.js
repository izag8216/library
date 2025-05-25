class LibraryManager {
    constructor() {
        this.books = JSON.parse(localStorage.getItem('books')) || [];
        this.initializeUI();
        this.loadBooks();
    }

    initializeUI() {
        document.getElementById('addBook').addEventListener('click', () => this.addBook());
        this.booksList = document.getElementById('booksList');
    }

    addBook() {
        const title = document.getElementById('bookTitle').value;
        const author = document.getElementById('bookAuthor').value;
        const dueDate = document.getElementById('dueDate').value;

        if (!title || !author || !dueDate) {
            alert('すべての項目を入力してください');
            return;
        }

        const book = {
            id: Date.now(),
            title,
            author,
            dueDate,
            borrowedDate: new Date().toISOString()
        };

        this.books.push(book);
        this.saveBooks();
        this.loadBooks();
        this.clearForm();
    }

    createBookCard(book) {
        const card = document.createElement('div');
        card.className = 'book-card';
        
        const dueDate = new Date(book.dueDate);
        const isOverdue = dueDate < new Date();

        card.innerHTML = `
            <div class="book-info">
                <div class="book-title">${book.title}</div>
                <div class="book-author">${book.author}</div>
                <div class="due-date" style="color: ${isOverdue ? '#e74c3c' : ''}">
                    返却期限: ${book.dueDate}</div>
            </div>
            <button class="return-btn" onclick="libraryManager.returnBook(${book.id})">
                返却
            </button>
        `;

        return card;
    }

    returnBook(id) {
        this.books = this.books.filter(book => book.id !== id);
        this.saveBooks();
        this.loadBooks();
    }

    loadBooks() {
        this.booksList.innerHTML = '';
        this.books
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .forEach(book => {
                this.booksList.appendChild(this.createBookCard(book));
            });
    }

    saveBooks() {
        localStorage.setItem('books', JSON.stringify(this.books));
    }

    clearForm() {
        document.getElementById('bookTitle').value = '';
        document.getElementById('bookAuthor').value = '';
        document.getElementById('dueDate').value = '';
    }
}

const libraryManager = new LibraryManager();
