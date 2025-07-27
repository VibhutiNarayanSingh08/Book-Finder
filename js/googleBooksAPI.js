// Google Books API integration
class GoogleBooksAPI {
    constructor() {
        this.baseURL = 'https://www.googleapis.com/books/v1/volumes';
        this.cache = new Map();
        this.maxResults = 20;
    }

    // Search books using Google Books API
    async searchBooks(query, startIndex = 0) {
        try {
            if (!query.trim()) {
                return { items: [], totalItems: 0 };
            }

            // Check cache first
            const cacheKey = `${query}-${startIndex}`;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const params = new URLSearchParams({
                q: query,
                startIndex: startIndex,
                maxResults: this.maxResults,
                printType: 'books',
                orderBy: 'relevance'
            });

            const response = await fetch(`${this.baseURL}?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Process and normalize the data
            const processedData = {
                items: data.items ? data.items.map(item => this.normalizeBookData(item)) : [],
                totalItems: data.totalItems || 0
            };

            // Cache the result
            this.cache.set(cacheKey, processedData);
            
            return processedData;
        } catch (error) {
            throw new Error('Failed to search books. Please try again.');
        }
    }

    // Get book details by ID
    async getBookById(volumeId) {
        try {
            const cacheKey = `book-${volumeId}`;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const response = await fetch(`${this.baseURL}/${volumeId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const processedData = this.normalizeBookData(data);
            
            this.cache.set(cacheKey, processedData);
            return processedData;
        } catch (error) {
            throw new Error('Failed to get book details');
        }
    }

    // Normalize Google Books API data to our format
    normalizeBookData(item) {
        const volumeInfo = item.volumeInfo || {};
        const saleInfo = item.saleInfo || {};
        const accessInfo = item.accessInfo || {};

        // Extract genres/categories
        const genres = volumeInfo.categories || ['General'];
        
        // Get the best available image
        const imageLinks = volumeInfo.imageLinks || {};
        const cover = imageLinks.large || 
                     imageLinks.medium || 
                     imageLinks.small || 
                     imageLinks.thumbnail || 
                     imageLinks.smallThumbnail ||
                     'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop';

        // Calculate file size estimate (if not available)
        const pageCount = volumeInfo.pageCount || 200;
        const estimatedSize = Math.round((pageCount * 0.02) * 10) / 10; // Rough estimate

        // Determine availability and access
        const isPublicDomain = accessInfo.publicDomain;
        const webReaderLink = accessInfo.webReaderLink;
        const previewLink = volumeInfo.previewLink;
        const infoLink = volumeInfo.infoLink;

        return {
            id: item.id,
            googleId: item.id,
            title: volumeInfo.title || 'Unknown Title',
            subtitle: volumeInfo.subtitle || '',
            authors: volumeInfo.authors || ['Unknown Author'],
            author: (volumeInfo.authors || ['Unknown Author']).join(', '),
            description: volumeInfo.description || 'No description available.',
            cover: cover.replace('&edge=curl', ''), // Remove edge effect
            genre: genres,
            categories: volumeInfo.categories || [],
            publishedDate: volumeInfo.publishedDate || '',
            publisher: volumeInfo.publisher || '',
            pageCount: pageCount,
            language: volumeInfo.language || 'en',
            rating: volumeInfo.averageRating || Math.random() * 2 + 3, // 3-5 range if no rating
            ratingsCount: volumeInfo.ratingsCount || 0,
            fileSize: `${estimatedSize} MB`,
            format: this.determineFormat(accessInfo, saleInfo),
            
            // Access information
            isPublicDomain: isPublicDomain,
            webReaderLink: webReaderLink,
            previewLink: previewLink,
            infoLink: infoLink,
            
            // Download/View links
            downloadUrl: this.getDownloadUrl(accessInfo, saleInfo, isPublicDomain),
            viewUrl: webReaderLink || previewLink || infoLink,
            
            // Purchase information
            buyLink: saleInfo.buyLink,
            price: saleInfo.retailPrice ? `${saleInfo.retailPrice.amount} ${saleInfo.retailPrice.currencyCode}` : 'Free',
            isEbook: saleInfo.isEbook || false,
            
            // Additional metadata
            maturityRating: volumeInfo.maturityRating || 'NOT_MATURE',
            textSnippet: item.searchInfo?.textSnippet || '',
            industryIdentifiers: volumeInfo.industryIdentifiers || []
        };
    }

    // Determine the format of the book
    determineFormat(accessInfo, saleInfo) {
        if (accessInfo.epub?.isAvailable) return 'EPUB';
        if (accessInfo.pdf?.isAvailable) return 'PDF';
        if (saleInfo.isEbook) return 'EBOOK';
        return 'WEB';
    }

    // Get appropriate download/view URL
    getDownloadUrl(accessInfo, saleInfo, isPublicDomain) {
        // For public domain books, try to get direct download links
        if (isPublicDomain) {
            if (accessInfo.epub?.downloadLink) {
                return accessInfo.epub.downloadLink;
            }
            if (accessInfo.pdf?.downloadLink) {
                return accessInfo.pdf.downloadLink;
            }
        }

        // For non-public domain, return web reader or preview
        return accessInfo.webReaderLink || 
               accessInfo.previewLink || 
               saleInfo.buyLink || 
               '#';
    }

    // Search by author
    async searchByAuthor(author) {
        return this.searchBooks(`inauthor:"${author}"`);
    }

    // Search by subject/genre
    async searchBySubject(subject) {
        return this.searchBooks(`subject:${subject}`);
    }

    // Search for free books
    async searchFreeBooks(query = '') {
        const searchQuery = query ? `${query} ` : '';
        return this.searchBooks(`${searchQuery}filter=free-ebooks`);
    }

    // Get trending/popular books
    async getTrendingBooks() {
        const queries = [
            'bestseller 2024',
            'popular fiction',
            'trending books'
        ];
        
        const randomQuery = queries[Math.floor(Math.random() * queries.length)];
        return this.searchBooks(randomQuery);
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }

    // Get cache size
    getCacheSize() {
        return this.cache.size;
    }
}

// Create global instance
window.googleBooksAPI = new GoogleBooksAPI();