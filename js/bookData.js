// Sample book data for the animated book website
const booksData = [
    {
        id: 1,
        title: "The Midnight Library",
        author: "Matt Haig",
        cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
        genre: ["Fiction", "Philosophy"],
        rating: 4.5,
        fileSize: "2.3 MB",
        format: "PDF",
        downloadUrl: "downloads/sample-book.pdf",
        isPublicDomain: true,
        description: "A magical story about life's infinite possibilities."
    },
    {
        id: 2,
        title: "Atomic Habits",
        author: "James Clear",
        cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop",
        genre: ["Non-Fiction", "Self-Help"],
        rating: 4.8,
        fileSize: "3.1 MB",
        format: "TXT",
        downloadUrl: "downloads/sample-book.txt",
        isPublicDomain: true,
        description: "Tiny changes, remarkable results."
    },
    {
        id: 3,
        title: "The Silent Patient",
        author: "Alex Michaelides",
        cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
        genre: ["Mystery", "Thriller"],
        rating: 4.3,
        fileSize: "1.9 MB",
        format: "PDF",
        downloadUrl: "#",
        description: "A psychological thriller about a woman's silence."
    },
    {
        id: 4,
        title: "Dune",
        author: "Frank Herbert",
        cover: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=400&fit=crop",
        genre: ["Sci-Fi", "Adventure"],
        rating: 4.7,
        fileSize: "4.2 MB",
        format: "PDF",
        downloadUrl: "#",
        description: "Epic science fiction saga on the desert planet Arrakis."
    },
    {
        id: 5,
        title: "Pride and Prejudice",
        author: "Jane Austen",
        cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop",
        genre: ["Romance", "Classic"],
        rating: 4.6,
        fileSize: "1.7 MB",
        format: "EPUB",
        downloadUrl: "#",
        description: "Timeless tale of love and social commentary."
    },
    {
        id: 6,
        title: "Sapiens",
        author: "Yuval Noah Harari",
        cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=400&fit=crop",
        genre: ["Non-Fiction", "History"],
        rating: 4.4,
        fileSize: "2.8 MB",
        format: "PDF",
        downloadUrl: "#",
        description: "A brief history of humankind."
    },
    {
        id: 7,
        title: "The Girl with the Dragon Tattoo",
        author: "Stieg Larsson",
        cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop",
        genre: ["Mystery", "Crime"],
        rating: 4.2,
        fileSize: "3.4 MB",
        format: "PDF",
        downloadUrl: "#",
        description: "Dark Swedish crime thriller."
    },
    {
        id: 8,
        title: "Neuromancer",
        author: "William Gibson",
        cover: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=400&fit=crop",
        genre: ["Sci-Fi", "Cyberpunk"],
        rating: 4.1,
        fileSize: "2.1 MB",
        format: "EPUB",
        downloadUrl: "#",
        description: "Groundbreaking cyberpunk novel."
    },
    {
        id: 9,
        title: "The Seven Husbands of Evelyn Hugo",
        author: "Taylor Jenkins Reid",
        cover: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=300&h=400&fit=crop",
        genre: ["Romance", "Drama"],
        rating: 4.5,
        fileSize: "2.6 MB",
        format: "PDF",
        downloadUrl: "#",
        description: "Hollywood glamour and secrets revealed."
    },
    {
        id: 10,
        title: "Educated",
        author: "Tara Westover",
        cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop",
        genre: ["Non-Fiction", "Memoir"],
        rating: 4.7,
        fileSize: "2.4 MB",
        format: "EPUB",
        downloadUrl: "#",
        description: "A memoir about education and transformation."
    },
    {
        id: 11,
        title: "Gone Girl",
        author: "Gillian Flynn",
        cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop",
        genre: ["Mystery", "Psychological"],
        rating: 4.0,
        fileSize: "2.9 MB",
        format: "PDF",
        downloadUrl: "#",
        description: "Twisted tale of a marriage gone wrong."
    },
    {
        id: 12,
        title: "The Martian",
        author: "Andy Weir",
        cover: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=300&h=400&fit=crop",
        genre: ["Sci-Fi", "Adventure"],
        rating: 4.6,
        fileSize: "2.2 MB",
        format: "EPUB",
        downloadUrl: "#",
        description: "Survival story on Mars with humor and science."
    },
    {
        id: 13,
        title: "Becoming",
        author: "Michelle Obama",
        cover: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&h=400&fit=crop",
        genre: ["Non-Fiction", "Biography"],
        rating: 4.8,
        fileSize: "3.5 MB",
        format: "PDF",
        downloadUrl: "#",
        description: "Inspiring memoir of the former First Lady."
    },
    {
        id: 14,
        title: "The Handmaid's Tale",
        author: "Margaret Atwood",
        cover: "https://images.unsplash.com/photo-1481235708048-d0f5c678ef66?w=300&h=400&fit=crop",
        genre: ["Fiction", "Dystopian"],
        rating: 4.3,
        fileSize: "2.0 MB",
        format: "EPUB",
        downloadUrl: "#",
        description: "Dystopian tale of women's rights and freedom."
    },
    {
        id: 15,
        title: "Where the Crawdads Sing",
        author: "Delia Owens",
        cover: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=400&fit=crop",
        genre: ["Fiction", "Mystery"],
        rating: 4.4,
        fileSize: "2.7 MB",
        format: "PDF",
        downloadUrl: "#",
        description: "Coming-of-age story in the marshlands."
    }
];

// Function to get all books
function getAllBooks() {
    return [...booksData];
}

// Function to get books by genre
function getBooksByGenre(genre) {
    if (genre === 'all') {
        return getAllBooks();
    }
    return booksData.filter(book => 
        book.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    );
}

// Function to search books
function searchBooks(query) {
    const searchTerm = query.toLowerCase();
    return booksData.filter(book => 
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.genre.some(g => g.toLowerCase().includes(searchTerm))
    );
}

// Function to get book by ID
function getBookById(id) {
    return booksData.find(book => book.id === id);
}

// Function to get random featured books
function getFeaturedBooks(count = 4) {
    const shuffled = [...booksData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Function to get books with high ratings
function getHighRatedBooks(minRating = 4.5) {
    return booksData.filter(book => book.rating >= minRating);
}

// Function to get books by format
function getBooksByFormat(format) {
    return booksData.filter(book => 
        book.format.toLowerCase() === format.toLowerCase()
    );
}

// Function to get random books
function getRandomBooks(count = 6) {
    const shuffled = [...booksData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        booksData,
        getAllBooks,
        getBooksByGenre,
        searchBooks,
        getBookById,
        getFeaturedBooks,
        getHighRatedBooks,
        getBooksByFormat,
        getRandomBooks
    };
}