// Do your work here...
// Pastikan library browser-image-compression diimpor pada HTML
// <script src="https://cdn.jsdelivr.net/npm/browser-image-compression/dist/browser-image-compression.js"></script>

// Fungsi untuk mengonversi gambar ke format WebP
async function convertImageToWebP(file) {
    const options = {
        maxSizeMB: 1, // Ukuran maksimal gambar dalam MB
        maxWidthOrHeight: 800, // Ukuran maksimal lebar atau tinggi gambar
        useWebWorker: true, // Menggunakan web worker untuk performa
        fileType: 'image/webp' // Format tujuan menjadi WebP
    };
    try {
        const compressedFile = await imageCompression(file, options);
        return compressedFile;
    } catch (error) {
        console.error('Gagal mengonversi gambar ke WebP:', error);
        return null;
    }
}

// Fungsi untuk menyimpan buku baru
async function addBook(title, author, year, isComplete, coverFile) {
    const id = new Date().getTime().toString();
    let coverWebP = '';

    if (coverFile) {
        const convertedFile = await convertImageToWebP(coverFile);
        if (convertedFile) {
            const reader = new FileReader();
            reader.readAsDataURL(convertedFile);
            reader.onload = () => {
                coverWebP = reader.result;
                saveBook({
                    id,
                    title,
                    author,
                    year,
                    isComplete,
                    cover: coverWebP
                });
            };
        } else {
            saveBook({
                id,
                title,
                author,
                year,
                isComplete,
                cover: ''
            });
        }
    } else {
        saveBook({
            id,
            title,
            author,
            year,
            isComplete,
            cover: ''
        });
    }
}

// Fungsi untuk menyimpan data buku ke localStorage
function saveBook(book) {
    const books = JSON.parse(localStorage.getItem('books')) || [];
    books.push(book);
    localStorage.setItem('books', JSON.stringify(books));
    renderBooks();
}

// Fungsi untuk menampilkan buku di rak
function renderBooks() {
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');

    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    books.forEach((book) => {
        const bookElement = document.createElement('div');
        bookElement.classList.add('col-lg-6', 'col-md-8', 'col-sm-12', 'mb-3');
        bookElement.innerHTML = `
            <div class="card mb-3" style="max-width: 540px;">
                <div class="row g-0">
                    <div class="col-md-4 col-12">
                        ${book.cover ? `<img src="${book.cover}" class="img-fluid rounded" alt="Cover Buku" style="object-fit: cover; width: 100%;">` : '<img src="./assets/img/default-cover.jpg" class="img-fluid rounded" alt="Default Cover" style="object-fit: cover; width: 100%;">'}
                    </div>
                    <div class="col-md-8 col-12 d-flex align-items-center">
                        <div class="card-body p-3" data-bookid="${book.id}">
                            <h5 class="card-title">${book.title}</h5>
                            <p class="card-text mb-1">Penulis: ${book.author}</p>
                            <p class="card-text mb-2">Tahun: ${book.year}</p>
                            <div class="d-flex flex-wrap gap-2">
                                <button class="btn btn-sm btn-complete" onclick="toggleBookComplete('${book.id}')">${book.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca'}</button>
                                <button class="btn btn-sm btn-edit" onclick="editBook('${book.id}')">Edit Buku</button>
                                <button class="btn btn-sm btn-delete" onclick="deleteBook('${book.id}')">Hapus Buku</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (book.isComplete) {
            completeBookList.appendChild(bookElement);
        } else {
            incompleteBookList.appendChild(bookElement);
        }
    });
}

// Fungsi untuk menghapus buku
function deleteBook(bookId) {
    let books = JSON.parse(localStorage.getItem('books')) || [];
    books = books.filter((book) => book.id !== bookId);
    localStorage.setItem('books', JSON.stringify(books));
    renderBooks();
}

// Fungsi untuk memindahkan buku antar rak
function toggleBookComplete(bookId) {
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const book = books.find((b) => b.id === bookId);
    if (book) {
        book.isComplete = !book.isComplete;
        localStorage.setItem('books', JSON.stringify(books));
        renderBooks();
    }
}

// Event listener untuk form tambah buku
document.getElementById('bookForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const title = document.getElementById('bookFormTitle').value;
    const author = document.getElementById('bookFormAuthor').value;
    const year = Number(document.getElementById('bookFormYear').value);
    const isComplete = document.getElementById('bookFormIsComplete').checked;
    const coverInput = document.getElementById('bookFormCover').files[0];
    await addBook(title, author, year, isComplete, coverInput);
    document.getElementById('bookForm').reset();
});

// Memuat buku saat halaman pertama kali diakses
window.addEventListener('load', renderBooks);