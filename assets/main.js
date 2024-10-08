async function convertImageToWebP(file) {
    try {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 500,
            useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        return await imageCompression.getDataUrlFromFile(compressedFile);
    } catch (error) {
        console.error('Gagal mengonversi gambar:', error);
        return null;
    }
}

async function addBook(title, author, year, isComplete, coverFile) {
    const id = +new Date();
    let coverUrl = '';

    if (coverFile) {
        coverUrl = await convertImageToWebP(coverFile);
    }

    const book = {
        id,
        title,
        author,
        year,
        isComplete,
        coverUrl
    };

    saveBookToLocalStorage(book);

    renderBooks();
}

function renderBooks() {
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');

    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    const books = getBooksFromLocalStorage();

    books.forEach((book) => {
        const bookElement = createBookElement(book);
        if (book.isComplete) {
            completeBookList.append(bookElement);
        } else {
            incompleteBookList.append(bookElement);
        }
    });

    attachEventListeners();
}

function createBookElement(book) {
    console.log('Rendering book:', book);

    const cardContainer = document.createElement('div');
    cardContainer.classList.add('col-lg-6', 'col-md-8', 'col-sm-12', 'mb-3');

    const card = `
        <div class="card mb-3" style="max-width: 540px;">
            <div class="row g-0">
                <div class="col-md-4 col-12">
                    <img src="${book.coverUrl || ''}" class="img-fluid rounded responsive-img" alt="Cover buku"
                        style="object-fit: cover; width: 100%;" data-testid="bookItemCover">
                </div>
                <div class="col-md-8 col-12 d-flex align-items-center">
                    <div class="card-body p-3" data-bookid="${book.id}" data-testid="bookItem">
                        <h5 class="card-title" data-testid="bookItemTitle">${book.title}</h5>
                        <p class="card-text mb-1" data-testid="bookItemAuthor">Penulis: ${book.author}</p>
                        <p class="card-text mb-2" data-testid="bookItemYear">Tahun: ${book.year}</p>
                        <div class="d-flex flex-wrap gap-2">
                            <button class="btn btn-sm btn-complete" data-testid="bookItemIsCompleteButton">
                                ${book.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca'}
                            </button>
                            <button class="btn btn-sm btn-edit" data-testid="bookItemEditButton">Edit Buku</button>
                            <button class="btn btn-sm btn-delete" data-testid="bookItemDeleteButton">Hapus Buku</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    cardContainer.innerHTML = card;
    return cardContainer;
}

function saveBookToLocalStorage(book) {
    const books = getBooksFromLocalStorage();
    books.push(book);
    localStorage.setItem('books', JSON.stringify(books));
}

function searchBooks(keyword) {
    const books = getBooksFromLocalStorage();
    const lowerCaseKeyword = keyword.toLowerCase();
    const filteredBooks = books.filter((book) =>
        book.title.toLowerCase().includes(lowerCaseKeyword)
    );

    if (filteredBooks.length > 0) {
        renderFilteredBooks(filteredBooks);
        document.getElementById('searchResultMessage').textContent = '';
        scrollToBookRack(filteredBooks[0]);
    } else {
        document.getElementById('searchResultMessage').textContent = 'Judul Buku Tidak Ditemukan.';
    }
}

function renderFilteredBooks(filteredBooks) {
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');

    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    filteredBooks.forEach((book) => {
        const bookElement = createBookElement(book);
        if (book.isComplete) {
            completeBookList.append(bookElement);
        } else {
            incompleteBookList.append(bookElement);
        }
    });

    attachEventListeners();
}

function scrollToBookRack(book) {
    const targetSection = book.isComplete ?
        document.getElementById('completeBookList') :
        document.getElementById('incompleteBookList');

    targetSection.scrollIntoView({
        behavior: 'smooth'
    });
}

document.getElementById('searchBook').addEventListener('submit', (event) => {
    event.preventDefault();
    const searchKeyword = document.getElementById('searchBookTitle').value;
    searchBooks(searchKeyword);
});

function renderBooks() {
    const books = getBooksFromLocalStorage();
    renderFilteredBooks(books);
}

function getBooksFromLocalStorage() {
    return JSON.parse(localStorage.getItem('books')) || [];
}

function toggleBookCompletion(bookId) {
    const books = getBooksFromLocalStorage();
    const book = books.find((b) => b.id === parseInt(bookId, 10));
    if (book) {
        book.isComplete = !book.isComplete;
        localStorage.setItem('books', JSON.stringify(books));
        renderBooks();
    }
}

function deleteBook(bookId) {
    const books = getBooksFromLocalStorage().filter((b) => b.id !== bookId);
    localStorage.setItem('books', JSON.stringify(books));
    renderBooks();
}

function editBook(bookId) {
    const books = getBooksFromLocalStorage();
    const book = books.find((b) => b.id === bookId);
    if (book) {
        document.getElementById('editBookFormTitle').value = book.title;
        document.getElementById('editBookFormAuthor').value = book.author;
        document.getElementById('editBookFormYear').value = book.year;
        document.getElementById('editBookForm').dataset.bookId = bookId;

        const editBookModal = new bootstrap.Modal(document.getElementById('editBookModal'));
        editBookModal.show();
    }
}

function attachEventListeners() {
    const completeButtons = document.querySelectorAll('[data-testid="bookItemIsCompleteButton"]');
    const editButtons = document.querySelectorAll('[data-testid="bookItemEditButton"]');
    const deleteButtons = document.querySelectorAll('[data-testid="bookItemDeleteButton"]');

    completeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const bookId = parseInt(button.closest('[data-bookid]').getAttribute('data-bookid'), 10);
            toggleBookCompletion(bookId);
        });
    });

    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const bookId = parseInt(button.closest('[data-bookid]').getAttribute('data-bookid'), 10);
            deleteBook(bookId);
        });
    });

    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const bookId = parseInt(button.closest('[data-bookid]').getAttribute('data-bookid'), 10);
            editBook(bookId);
        });
    });
}

document.getElementById('bookForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = document.getElementById('bookFormTitle').value;
    const author = document.getElementById('bookFormAuthor').value;
    const year = document.getElementById('bookFormYear').value;
    const isComplete = document.getElementById('bookFormIsComplete').checked;
    const coverFile = document.getElementById('bookFormCover').files[0];

    await addBook(title, author, year, isComplete, coverFile);
    renderBooks();
    document.getElementById('bookForm').reset();
});

document.addEventListener('DOMContentLoaded', () => {
    renderBooks();
});

document.getElementById('editBookForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const bookId = parseInt(document.getElementById('editBookForm').dataset.bookId, 10); // Convert bookId to number
    const title = document.getElementById('editBookFormTitle').value;
    const author = document.getElementById('editBookFormAuthor').value;
    const year = document.getElementById('editBookFormYear').value;
    const coverFile = document.getElementById('editBookFormCover').files[0];

    let coverUrl = '';

    if (coverFile) {
        coverUrl = await convertImageToWebP(coverFile);
    }

    const books = getBooksFromLocalStorage();
    const bookIndex = books.findIndex((b) => b.id === bookId);
    if (bookIndex !== -1) {
        books[bookIndex] = {
            ...books[bookIndex],
            title,
            author,
            year,
            coverUrl: coverUrl || books[bookIndex].coverUrl
        };

        localStorage.setItem('books', JSON.stringify(books));
        renderBooks();

        const editBookModal = bootstrap.Modal.getInstance(document.getElementById('editBookModal'));
        editBookModal.hide();
    } else {
        console.error('Judul Buku tidak ditemukan.');
    }
});