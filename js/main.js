// Main application logic
class BookFinderApp {
    constructor() {
        this.currentFilter = 'trending';
        this.currentBooks = [];
        this.animationController = null;
        this.searchTimeout = null;
        this.isLoading = false;
        this.useGoogleAPI = true;
        this.currentSearchQuery = '';
        this.autocompleteTimeout = null;
        this.selectedSuggestionIndex = -1;
        this.suggestions = [];
        
        this.init();
    }

    async init() {
        try {
            // Initialize animation controller
            this.animationController = new AnimationController();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize rotating text
            this.initRotatingText();
            
            // Initialize theme toggle
            this.initThemeToggle();
            
            // Check if Google Books API is available
            if (window.googleBooksAPI) {
                this.useGoogleAPI = true;
            } else {
                this.useGoogleAPI = false;
            }
            
            // Load initial books
            await this.loadBooks();
            
            // Setup intersection observer for book cards
            this.animationController.observeElements();
            
        } catch (error) {
            this.showError('Failed to initialize application');
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.querySelector('.search__input');
        const searchButton = document.querySelector('.search__button');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleAutoComplete(e.target.value);
                this.handleSearch(e.target.value);
            });
            
            searchInput.addEventListener('keydown', (e) => {
                this.handleSearchKeydown(e);
            });
            
            searchInput.addEventListener('focus', () => {
                if (searchInput.value.trim()) {
                    this.showAutoComplete();
                }
            });
            
            searchInput.addEventListener('blur', () => {
                // Delay hiding to allow clicking on suggestions
                setTimeout(() => this.hideAutoComplete(), 150);
            });
        }

        if (searchButton) {
            searchButton.addEventListener('click', () => {
                const query = searchInput?.value || '';
                this.handleSearch(query);
            });
        }

        // Filter buttons
        document.querySelectorAll('.filter__btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e.target.dataset.filter));
            
            // Add ripple effect
            btn.addEventListener('click', (e) => {
                this.animationController.createRipple(e);
            });
        });

        // Scroll to top button
        const scrollToTopBtn = document.getElementById('scroll-to-top');
        if (scrollToTopBtn) {
            scrollToTopBtn.addEventListener('click', () => {
                this.animationController.smoothScrollTo(document.body);
            });
        }

        // Window resize handler
        window.addEventListener('resize', () => {
            this.animationController.handleResize();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }

    initRotatingText() {
        const rotatingTexts = [
            "Discover Amazing Books",
            "Hunt Hidden Treasures", 
            "Explore Infinite Stories",
            "Find Your Next Adventure",
            "Unlock Knowledge Gates"
        ];
        
        const titleElement = document.getElementById('rotating-title');
        if (!titleElement) return;
        
        let currentIndex = 0;
        let currentText = '';
        let isDeleting = false;
        let typeSpeed = 100;
        
        const typeWriter = () => {
            const fullText = rotatingTexts[currentIndex];
            
            if (isDeleting) {
                // Backspace effect
                currentText = fullText.substring(0, currentText.length - 1);
                typeSpeed = 50; // Faster backspacing
            } else {
                // Typing effect
                currentText = fullText.substring(0, currentText.length + 1);
                typeSpeed = 100; // Normal typing speed
            }
            
            titleElement.textContent = currentText;
            
            // Add blinking cursor effect
            if (!isDeleting && currentText === fullText) {
                // Finished typing, pause then start deleting
                typeSpeed = 2000; // Pause for 2 seconds
                isDeleting = true;
            } else if (isDeleting && currentText === '') {
                // Finished deleting, move to next text
                isDeleting = false;
                currentIndex = (currentIndex + 1) % rotatingTexts.length;
                typeSpeed = 500; // Small pause before starting next word
            }
            
            setTimeout(typeWriter, typeSpeed);
        };
        
        // Start the typewriter effect
        typeWriter();
    }

    handleAutoComplete(query) {
        // Clear previous timeout
        if (this.autocompleteTimeout) {
            clearTimeout(this.autocompleteTimeout);
        }

        if (!query.trim()) {
            this.hideAutoComplete();
            return;
        }

        // Debounce auto-complete
        this.autocompleteTimeout = setTimeout(async () => {
            try {
                await this.generateSuggestions(query.trim());
                this.renderAutoComplete();
                this.showAutoComplete();
            } catch (error) {
                // Auto-complete error, fail silently
            }
        }, 200);
    }

    async generateSuggestions(query) {
        this.suggestions = [];
        
        // Popular book suggestions
        const popularBooks = [
            'Harry Potter', 'Lord of the Rings', 'Game of Thrones', 'The Hobbit',
            'To Kill a Mockingbird', '1984', 'Pride and Prejudice', 'The Great Gatsby',
            'Dune', 'The Catcher in the Rye', 'Brave New World', 'Jane Eyre'
        ];
        
        // Genre suggestions
        const genres = [
            'Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy',
            'Thriller', 'Horror', 'Biography', 'History', 'Self Help'
        ];
        
        // Author suggestions
        const authors = [
            'Stephen King', 'J.K. Rowling', 'George R.R. Martin', 'Agatha Christie',
            'Dan Brown', 'John Grisham', 'James Patterson', 'Nora Roberts'
        ];

        const lowerQuery = query.toLowerCase();
        
        // Book suggestions
        const bookMatches = popularBooks
            .filter(book => book.toLowerCase().includes(lowerQuery))
            .slice(0, 3)
            .map(book => ({
                type: 'book',
                text: book,
                query: book,
                icon: '📚'
            }));

        // Genre suggestions
        const genreMatches = genres
            .filter(genre => genre.toLowerCase().includes(lowerQuery))
            .slice(0, 2)
            .map(genre => ({
                type: 'genre',
                text: `${genre} books`,
                query: genre,
                icon: '🏷️'
            }));

        // Author suggestions
        const authorMatches = authors
            .filter(author => author.toLowerCase().includes(lowerQuery))
            .slice(0, 2)
            .map(author => ({
                type: 'author',
                text: `Books by ${author}`,
                query: author,
                icon: '👤'
            }));

        // Try to get real suggestions from Google Books API
        if (this.useGoogleAPI && window.googleBooksAPI) {
            try {
                const apiResult = await window.googleBooksAPI.searchBooks(query);
                if (apiResult.items && apiResult.items.length > 0) {
                    const apiSuggestions = apiResult.items
                        .slice(0, 3)
                        .map(book => ({
                            type: 'api',
                            text: book.volumeInfo.title,
                            query: book.volumeInfo.title,
                            icon: '🔍'
                        }));
                    
                    this.suggestions = [...apiSuggestions, ...bookMatches, ...genreMatches, ...authorMatches];
                } else {
                    this.suggestions = [...bookMatches, ...genreMatches, ...authorMatches];
                }
            } catch (error) {
                this.suggestions = [...bookMatches, ...genreMatches, ...authorMatches];
            }
        } else {
            this.suggestions = [...bookMatches, ...genreMatches, ...authorMatches];
        }

        // Limit total suggestions
        this.suggestions = this.suggestions.slice(0, 8);
    }

    renderAutoComplete() {
        const autocompleteEl = document.getElementById('search-autocomplete');
        if (!autocompleteEl || this.suggestions.length === 0) {
            this.hideAutoComplete();
            return;
        }

        const query = document.querySelector('.search__input').value.toLowerCase();
        
        let html = '';
        let currentType = '';
        
        this.suggestions.forEach((suggestion, index) => {
            // Add category headers
            if (suggestion.type !== currentType) {
                const categoryName = {
                    'api': 'Search Results',
                    'book': 'Popular Books',
                    'genre': 'Genres',
                    'author': 'Authors'
                }[suggestion.type] || 'Suggestions';
                
                html += `<div class="autocomplete__category">${categoryName}</div>`;
                currentType = suggestion.type;
            }
            
            // Highlight matching text
            const highlightedText = suggestion.text.replace(
                new RegExp(`(${query})`, 'gi'),
                '<span class="autocomplete__highlight">$1</span>'
            );
            
            html += `
                <div class="autocomplete__item" data-index="${index}" data-query="${suggestion.query}">
                    <span class="autocomplete__icon">${suggestion.icon}</span>
                    <span class="autocomplete__text">${highlightedText}</span>
                </div>
            `;
        });
        
        autocompleteEl.innerHTML = html;
        
        // Add click listeners
        autocompleteEl.querySelectorAll('.autocomplete__item').forEach(item => {
            item.addEventListener('click', () => {
                const query = item.dataset.query;
                this.selectSuggestion(query);
            });
        });
    }

    handleSearchKeydown(e) {
        const autocompleteEl = document.getElementById('search-autocomplete');
        const isVisible = autocompleteEl.classList.contains('show');
        
        if (!isVisible || this.suggestions.length === 0) {
            if (e.key === 'Enter') {
                this.handleSearch(e.target.value);
            }
            return;
        }
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedSuggestionIndex = Math.min(
                    this.selectedSuggestionIndex + 1,
                    this.suggestions.length - 1
                );
                this.updateSelectedSuggestion();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.selectedSuggestionIndex = Math.max(this.selectedSuggestionIndex - 1, -1);
                this.updateSelectedSuggestion();
                break;
                
            case 'Enter':
                e.preventDefault();
                if (this.selectedSuggestionIndex >= 0) {
                    const selectedSuggestion = this.suggestions[this.selectedSuggestionIndex];
                    this.selectSuggestion(selectedSuggestion.query);
                } else {
                    this.handleSearch(e.target.value);
                }
                break;
                
            case 'Escape':
                this.hideAutoComplete();
                e.target.blur();
                break;
        }
    }

    updateSelectedSuggestion() {
        const items = document.querySelectorAll('.autocomplete__item');
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedSuggestionIndex);
        });
    }

    selectSuggestion(query) {
        const searchInput = document.querySelector('.search__input');
        searchInput.value = query;
        this.hideAutoComplete();
        this.handleSearch(query);
        searchInput.blur();
    }

    showAutoComplete() {
        const autocompleteEl = document.getElementById('search-autocomplete');
        if (autocompleteEl && this.suggestions.length > 0) {
            autocompleteEl.classList.add('show');
        }
    }

    hideAutoComplete() {
        const autocompleteEl = document.getElementById('search-autocomplete');
        if (autocompleteEl) {
            autocompleteEl.classList.remove('show');
        }
        this.selectedSuggestionIndex = -1;
    }

    initThemeToggle() {
        // Load saved theme from localStorage
        const savedTheme = localStorage.getItem('bookHuntTheme') || 'dark';
        this.setTheme(savedTheme);
        
        // Setup theme toggle button
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    toggleTheme() {
        // Cycle through: dark -> light -> gradient -> dark
        let currentTheme = 'dark';
        if (document.documentElement.classList.contains('light-mode')) {
            currentTheme = 'light';
        } else if (document.documentElement.classList.contains('gradient-mode')) {
            currentTheme = 'gradient';
        }
        
        const themeOrder = ['dark', 'light', 'gradient'];
        const currentIndex = themeOrder.indexOf(currentTheme);
        const newTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
        
        this.setTheme(newTheme);
        
        // Save to localStorage
        localStorage.setItem('bookHuntTheme', newTheme);
        
        // Add animation effect
        this.animateThemeTransition();
    }

    setTheme(theme) {
        // Remove all theme classes first
        document.documentElement.classList.remove('light-mode', 'gradient-mode');
        
        // Add appropriate theme class
        if (theme === 'light') {
            document.documentElement.classList.add('light-mode');
        } else if (theme === 'gradient') {
            document.documentElement.classList.add('gradient-mode');
        }
        // 'dark' is the default, no class needed
        
        // Update theme-color meta tag for mobile browsers
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            const themeColors = {
                'light': '#ffffff',
                'dark': '#533483',
                'gradient': '#4facfe'
            };
            themeColorMeta.content = themeColors[theme] || '#533483';
        }
    }

    animateThemeTransition() {
        // Add a subtle animation when switching themes
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
        
        // Create a ripple effect from the theme toggle button
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.style.transform = 'scale(0.9)';
            setTimeout(() => {
                themeToggle.style.transform = '';
            }, 150);
        }
    }

    async loadBooks(books = null, isApiSearch = false) {
        try {
            this.showLoading();
            
            let booksToDisplay;
            
            if (books) {
                booksToDisplay = books;
            } else if (this.useGoogleAPI && !isApiSearch) {
                // Load trending books from Google Books API
                try {
                    const trendingQuery = this.getSearchQueryForFilter('trending');
                    const apiResult = await window.googleBooksAPI.searchBooks(trendingQuery);
                    booksToDisplay = apiResult.items || [];
                } catch (apiError) {
                    booksToDisplay = getAllBooks();
                }
            } else {
                // Fallback to local data
                booksToDisplay = getAllBooks();
            }
            
            this.currentBooks = booksToDisplay;
            this.renderBooks(booksToDisplay);
            this.hideLoading();
            
        } catch (error) {
            // Fallback to local data on any error
            if (!books) {
                this.currentBooks = getAllBooks();
                this.renderBooks(this.currentBooks);
            }
            this.hideLoading();
        }
    }

    renderBooks(books) {
        const booksGrid = document.getElementById('books-grid');
        if (!booksGrid) return;

        // Clear existing books
        booksGrid.innerHTML = '';

        if (books.length === 0) {
            this.showEmptyState();
            return;
        }

        // Create book cards
        books.forEach((book, index) => {
            const bookCard = this.createBookCard(book, index);
            booksGrid.appendChild(bookCard);
        });

        // Observe new book cards for animations
        setTimeout(() => {
            this.animationController.observeElements();
        }, 100);
    }

    createBookCard(book, index) {
        const card = document.createElement('div');
        card.className = `book-card stagger-${(index % 6) + 1}`;
        card.setAttribute('data-book-id', book.id);

        // Generate star rating
        const stars = this.generateStarRating(book.rating);
        
        // Generate genre tags
        const genreTags = book.genre.map(genre => 
            `<span class="genre-tag">${genre}</span>`
        ).join('');

        card.innerHTML = `
            <div class="book-cover">
                <img src="${book.cover}" alt="${book.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop'">
            </div>
            <div class="book-info">
                <h3>${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                <div class="book-genres">
                    ${genreTags}
                </div>
                <div class="book-meta">
                    <div class="book-rating">
                        ${stars}
                        <span>${typeof book.rating === 'number' ? book.rating.toFixed(1) : book.rating}</span>
                    </div>
                    <div class="book-size">
                        ${book.fileSize || 'Unknown size'} • ${book.format || 'Unknown format'}
                    </div>
                </div>
                <button class="download-btn" data-book-id="${book.id}" aria-label="Download ${book.title}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 0.5rem;">
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                    Download
                </button>
            </div>
        `;

        // Add event listeners to the card
        this.setupBookCardEvents(card, book);

        return card;
    }

    setupBookCardEvents(card, book) {
        const downloadBtn = card.querySelector('.download-btn');
        
        if (downloadBtn) {
            downloadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleDownload(book);
                this.animationController.createRipple(e);
            });
        }

        // Card hover effects
        card.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            }
        });

        card.addEventListener('mouseleave', () => {
            if (window.innerWidth > 768) {
                card.style.transform = '';
            }
        });

        // Card click for mobile
        card.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                this.showBookDetails(book);
            }
        });
    }

    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '<span class="star"></span>';
        }

        if (hasHalfStar) {
            stars += '<span class="star"></span>';
        }

        const remainingStars = 5 - Math.ceil(rating);
        for (let i = 0; i < remainingStars; i++) {
            stars += '<span class="star" style="color: #666;"></span>';
        }

        return stars;
    }

    async handleSearch(query) {
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Debounce search
        this.searchTimeout = setTimeout(async () => {
            try {
                this.currentSearchQuery = query.trim();
                
                if (!this.currentSearchQuery) {
                    await this.loadBooks();
                    // Show filters when search is cleared
                    this.toggleFiltersVisibility(true);
                    return;
                }

                let searchResults = [];
                
                if (this.useGoogleAPI) {
                    // Search using Google Books API
                    try {
                        const apiResult = await window.googleBooksAPI.searchBooks(this.currentSearchQuery);
                        searchResults = apiResult.items || [];
                        
                    } catch (apiError) {
                        // Fallback to local search
                        searchResults = searchBooks(this.currentSearchQuery);
                    }
                } else {
                    // Use local search
                    searchResults = searchBooks(this.currentSearchQuery);
                    
                    // Removed notifications as requested
                    if (searchResults.length === 0) {
                        // this.animationController.showToast(`No books found for "${this.currentSearchQuery}"`, 'info');
                    } else {
                        // this.animationController.showToast(`Found ${searchResults.length} book(s)`, 'success');
                    }
                }
                
                await this.loadBooks(searchResults, true);
                
                // Hide filters when searching
                this.toggleFiltersVisibility(false);
                
            } catch (error) {
                this.showError('Search failed');
            }
        }, 300);
    }

    async handleFilter(filter) {
        try {
            this.currentFilter = filter;
            
            // Update active filter button
            document.querySelectorAll('.filter__btn').forEach(btn => {
                btn.classList.remove('filter__btn--active');
            });
            
            const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
            if (activeBtn) {
                activeBtn.classList.add('filter__btn--active');
            }

            // Get books from Google Books API based on filter
            let filteredBooks = [];
            
            if (this.useGoogleAPI && window.googleBooksAPI) {
                try {
                    const searchQuery = this.getSearchQueryForFilter(filter);
                    
                    const apiResult = await window.googleBooksAPI.searchBooks(searchQuery);
                    filteredBooks = apiResult.items || [];
                    
                    // Remove the popup message
                    // this.animationController.showToast(`Found ${filteredBooks.length} ${this.getFilterDisplayName(filter)} books`, 'success');
                } catch (apiError) {
                    // Fallback to local books
                    filteredBooks = this.getLocalFilteredBooks(filter);
                    // Remove the popup message
                    // this.animationController.showToast(`Showing local ${filter} books`, 'info');
                }
            } else {
                // Fallback to local books
                filteredBooks = this.getLocalFilteredBooks(filter);
                // Remove the popup message
                // this.animationController.showToast(`Showing local ${filter} books`, 'info');
            }
            
            await this.loadBooks(filteredBooks, true);
            
            // Show filters when using filter buttons
            this.toggleFiltersVisibility(true);
            
        } catch (error) {
            this.showError('Failed to filter books');
        }
    }

    getSearchQueryForFilter(filter) {
        const currentYear = new Date().getFullYear();
        const queries = {
            'trending': 'bestseller 2024 popular books',
            'new-releases': `new releases ${currentYear} books`,
            'bestsellers': 'bestseller award winning books',
            'fiction': 'fiction novel popular',
            'mystery': 'mystery thriller crime fiction',
            'sci-fi': 'science fiction sci-fi space',
            'romance': 'romance love story contemporary',
            'self-help': 'self help personal development',
            'technology': 'technology programming computer science',
            'business': 'business entrepreneurship leadership'
        };
        
        return queries[filter] || 'popular books 2024';
    }

    getFilterDisplayName(filter) {
        const names = {
            'trending': 'trending',
            'new-releases': 'new release',
            'bestsellers': 'bestseller',
            'fiction': 'fiction',
            'mystery': 'mystery',
            'sci-fi': 'sci-fi',
            'romance': 'romance',
            'self-help': 'self-help',
            'technology': 'technology',
            'business': 'business'
        };
        
        return names[filter] || filter;
    }

    getLocalFilteredBooks(filter) {
        // Fallback to local books when API fails
        if (filter === 'trending' || filter === 'new-releases' || filter === 'bestsellers') {
            return getAllBooks(); // Return all local books for these categories
        }
        
        // Try to match with local book genres
        const localGenreMap = {
            'fiction': 'fiction',
            'mystery': 'mystery',
            'sci-fi': 'sci-fi',
            'romance': 'romance',
            'self-help': 'non-fiction',
            'technology': 'non-fiction',
            'business': 'non-fiction'
        };
        
        const localGenre = localGenreMap[filter];
        return localGenre ? getBooksByGenre(localGenre) : getAllBooks();
    }

    toggleFiltersVisibility(show) {
        const filtersSection = document.querySelector('.filters');
        if (filtersSection) {
            if (show) {
                filtersSection.style.display = 'block';
                filtersSection.style.opacity = '1';
                filtersSection.style.transform = 'translateY(0)';
            } else {
                filtersSection.style.opacity = '0';
                filtersSection.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    filtersSection.style.display = 'none';
                }, 300);
            }
        }
    }

    async handleDownload(book) {
        try {
            
            // Check if it's a local book with actual download link
            if (book.downloadUrl && book.downloadUrl !== '#' && !book.downloadUrl.startsWith('http')) {
                this.downloadFile(book.downloadUrl, `${book.title}.${book.format.toLowerCase()}`);
                this.animationController.showToast(`Downloading "${book.title}"...`, 'success');
                return;
            }
            
            // Check if it's a public domain book from Google Books with download link
            if (book.isPublicDomain && book.downloadUrl && book.downloadUrl.startsWith('http')) {
                this.downloadFile(book.downloadUrl, `${book.title}.${book.format.toLowerCase()}`);
                this.animationController.showToast(`Downloading "${book.title}"...`, 'success');
                return;
            }
            
            // NEW: Simple Google "I'm Feeling Lucky" PDF search
            this.performLuckyPDFSearch(book);
            return;
            
            // Fallback: For commercial books, redirect to appropriate page
            if (book.buyLink) {
                window.open(book.buyLink, '_blank');
                this.animationController.showToast('Redirecting to purchase page...', 'info');
            } else if (book.webReaderLink) {
                window.open(book.webReaderLink, '_blank');
            } else if (book.infoLink) {
                window.open(book.infoLink, '_blank');
                this.animationController.showToast('Opening on Google Books...', 'info');
            } else {
                this.animationController.showToast('Download not available for this book', 'error');
            }
            
        } catch (error) {
            this.showError('Download failed');
        }
    }

    performLuckyPDFSearch(book) {
        try {
            // Get title and author
            const title = book.title || book.volumeInfo?.title || 'Unknown Title';
            const authors = book.authors || book.volumeInfo?.authors || book.author || ['Unknown Author'];
            const authorString = Array.isArray(authors) ? authors.join(', ') : authors;
            
            
            // Create the search query exactly as you specified
            const searchQuery = `${title} ${authorString} doctype:pdf`;
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&btnI=1`;
            
            
            // Remove the popup message for download
            // this.animationController.showToast(`🍀 Opening first PDF result for "${title}"...`, 'success');
            
            // Open the "I'm Feeling Lucky" search
            window.open(searchUrl, '_blank');
            
        } catch (error) {
            this.animationController.showToast('Search failed', 'error');
        }
    }







    fallbackToCommercialOptions(book) {
        if (book.buyLink) {
            window.open(book.buyLink, '_blank');
            this.animationController.showToast('Opening purchase page...', 'info');
        } else if (book.webReaderLink) {
            window.open(book.webReaderLink, '_blank');
        } else if (book.infoLink) {
            window.open(book.infoLink, '_blank');
        }
    }

    downloadFile(url, filename) {
        try {
            // Create a temporary link element
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.target = '_blank';
            
            // Add to DOM, click, then remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (error) {
            // Fallback: open in new tab
            window.open(url, '_blank');
        }
    }

    showBookDetails(book) {
        // Create a modal or expanded view (for mobile)
        // Implementation would depend on design requirements
    }

    showEmptyState() {
        const booksGrid = document.getElementById('books-grid');
        if (!booksGrid) return;

        booksGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;">=�</div>
                <h3 style="margin-bottom: 1rem; color: var(--text-primary);">No books found</h3>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">Try adjusting your search or filter criteria</p>
                <button class="filter__btn" onclick="app.handleFilter('all')">Show All Books</button>
            </div>
        `;
    }

    showLoading() {
        this.isLoading = true;
        this.animationController.showLoading();
    }

    hideLoading() {
        this.isLoading = false;
        this.animationController.hideLoading();
    }

    showError(message) {
        this.animationController.showToast(message, 'error', 5000);
    }

    handleKeyboardNavigation(e) {
        // ESC key to clear search
        if (e.key === 'Escape') {
            const searchInput = document.querySelector('.search__input');
            if (searchInput && searchInput.value) {
                searchInput.value = '';
                this.handleSearch('');
            }
        }

        // Enter key on filter buttons
        if (e.key === 'Enter' && e.target.classList.contains('filter__btn')) {
            e.target.click();
        }

        // Arrow keys for filter navigation
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            const filterBtns = document.querySelectorAll('.filter__btn');
            const currentIndex = Array.from(filterBtns).findIndex(btn => btn === document.activeElement);
            
            if (currentIndex !== -1) {
                const nextIndex = e.key === 'ArrowLeft' 
                    ? Math.max(0, currentIndex - 1)
                    : Math.min(filterBtns.length - 1, currentIndex + 1);
                
                filterBtns[nextIndex].focus();
            }
        }
    }

    // Public methods for external access
    refresh() {
        this.loadBooks();
    }

    getStats() {
        return {
            totalBooks: getAllBooks().length,
            currentBooks: this.currentBooks.length,
            currentFilter: this.currentFilter,
            isLoading: this.isLoading
        };
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure all scripts are loaded
    setTimeout(() => {
        window.app = new BookFinderApp();
    }, 100);
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && window.app) {
        // Refresh data when user returns to tab
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.app && window.app.animationController) {
        window.app.animationController.cleanup();
    }
});