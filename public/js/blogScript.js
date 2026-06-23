(function(__run){ if (document.readyState !== 'loading') __run(); else document.addEventListener('DOMContentLoaded', __run); })(() => {
    // State
    const state = {
        posts: typeof allPosts !== 'undefined' ? allPosts : [],
        filteredPosts: [],
        currentPage: 1,
        postsPerPage: 6,
        searchQuery: '',
        categoryQuery: ''
    };

    // DOM Elements
    const grid = document.querySelector('.posts-grid');
    const paginationContainer = document.querySelector('.pagination-container');
    const searchInput = document.querySelector('.search-input');
    const categoryLinks = document.querySelectorAll('.blog-categories a');
    const recentPostsTitle = document.querySelector('.recent-posts-title');

    // Debounce Function for Optimization
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Initialize
    function init() {
        // Parse URL params for initial state
        const urlParams = new URLSearchParams(window.location.search);
        state.searchQuery = urlParams.get('search') || '';
        state.categoryQuery = urlParams.get('category') || '';
        state.currentPage = parseInt(urlParams.get('page')) || 1;

        // Set initial input values
        if (searchInput) searchInput.value = state.searchQuery;

        // Mark active category
        updateActiveCategoryUI();

        // Initial Filter & Render
        filterPosts();

        // Event Listeners
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                state.searchQuery = e.target.value.trim();
                state.currentPage = 1; // Reset to page 1 on search
                updateURL();
                filterPosts();
            }, 300)); // 300ms delay

            // Prevent form submission if inside a form (we are doing it realtime)
            const form = searchInput.closest('form');
            if (form) {
                form.addEventListener('submit', (e) => e.preventDefault());
            }
        }

        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                // Extract category from href (assuming ?category=...)
                if (href === 'index' || href === 'index.php' || href.includes('View all')) {
                    state.categoryQuery = '';
                } else {
                    const params = new URLSearchParams(href.split('?')[1]);
                    state.categoryQuery = params.get('category');
                }
                state.currentPage = 1;
                updateActiveCategoryUI();
                updateURL();
                filterPosts();
            });
        });
    }

    function updateActiveCategoryUI() {
        categoryLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');

            // Check for "View all" / No Category
            if (!state.categoryQuery) {
                if (href === 'index' || href === 'index.php' || href.endsWith('index.php')) {
                    link.classList.add('active');
                }
                return;
            }

            // Check specific category
            try {
                // Handle relative URLs like "?category=..."
                const urlPart = href.includes('?') ? href.split('?')[1] : '';
                const params = new URLSearchParams(urlPart);
                const linkCategory = params.get('category');

                // Compare decoded values. state.categoryQuery is already decoded from URL.
                // linkCategory from URLSearchParams is also decoded.
                if (linkCategory === state.categoryQuery) {
                    link.classList.add('active');
                }
            } catch (e) {
                console.error("Error parsing link hue:", href, e);
            }
        });
    }

    function updateURL() {
        const params = new URLSearchParams();
        if (state.searchQuery) params.set('search', state.searchQuery);
        if (state.categoryQuery) params.set('category', state.categoryQuery);
        if (state.currentPage > 1) params.set('page', state.currentPage);

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', newUrl);
    }

    function filterPosts() {
        state.filteredPosts = state.posts.filter(post => {
            const matchesSearch = post.title.toLowerCase().includes(state.searchQuery.toLowerCase());
            const matchesCategory = !state.categoryQuery || post.category === state.categoryQuery;
            return matchesSearch && matchesCategory;
        });

        // Update Title with Search Query
        if (recentPostsTitle) {
            const baseTitle = "Recent posts";
            recentPostsTitle.innerText = state.searchQuery ? `${baseTitle} - Search: "${state.searchQuery}"` : baseTitle;
        }

        render();
    }

    function render() {
        // Pagination Logic
        const totalPosts = state.filteredPosts.length;
        const totalPages = Math.ceil(totalPosts / state.postsPerPage);

        // Ensure current page is valid
        if (state.currentPage > totalPages) state.currentPage = totalPages || 1;
        if (state.currentPage < 1) state.currentPage = 1;

        const startIndex = (state.currentPage - 1) * state.postsPerPage;
        const endIndex = startIndex + state.postsPerPage;
        const currentPosts = state.filteredPosts.slice(startIndex, endIndex);

        // Render Grid
        if (currentPosts.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">No posts found.</p>';
        } else {
            grid.innerHTML = currentPosts.map(post => `
                <a href="${post.link || '#'}" class="blog-card">
                    <div class="blog-image">
                        <img src="${post.image}" alt="${post.title}">
                    </div>
                    <div class="blog-info">
                        <h4 class="blog-title">${post.title}</h4>
                        <span class="blog-category-tag">${post.category}</span>
                        <span class="blog-date">${post.date}</span>
                    </div>
                </a>
            `).join('');
        }

        // Render Pagination
        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        paginationContainer.innerHTML = '';
        if (totalPages <= 1) return;

        // Helper to create button
        const createBtn = (text, page, isActive = false, isDisabled = false) => {
            const btn = document.createElement(isDisabled ? 'span' : 'button');
            btn.innerText = text;

            // Base Styles
            btn.style.cssText = `
                padding: 8px 14px; 
                border: 1px solid ${isActive ? '#F9B646' : '#ddd'}; 
                border-radius: 8px; 
                background-color: ${isActive ? '#F9B646' : 'transparent'}; 
                color: ${isActive ? '#fff' : '#000'}; 
                font-weight: 600; 
                cursor: ${isDisabled || isActive ? 'default' : 'pointer'};
                transition: all 0.2s;
            `;

            if (!isDisabled && !isActive) {
                btn.onclick = () => {
                    state.currentPage = page;
                    updateURL();
                    render();
                    // Scroll to top of grid
                    document.querySelector('.blog-content').scrollIntoView({ behavior: 'smooth' });
                };
            }

            if (isDisabled && text === '...') {
                btn.style.border = 'none';
                btn.style.color = '#666';
            }

            return btn;
        };

        // Prev
        if (state.currentPage > 1) {
            paginationContainer.appendChild(createBtn('<', state.currentPage - 1));
        }

        // Page 1
        paginationContainer.appendChild(createBtn('1', 1, state.currentPage === 1));

        // Start Ellipsis
        if (state.currentPage > 3) {
            paginationContainer.appendChild(createBtn('...', null, false, true));
        }

        // Middle Window
        let start = Math.max(2, state.currentPage - 1);
        let end = Math.min(totalPages - 1, state.currentPage + 1);

        for (let i = start; i <= end; i++) {
            if (i === 1 || i === totalPages) continue; // Already handled
            paginationContainer.appendChild(createBtn(i, i, state.currentPage === i));
        }

        // End Ellipsis
        if (state.currentPage < totalPages - 2) {
            paginationContainer.appendChild(createBtn('...', null, false, true));
        }

        // Last Page
        paginationContainer.appendChild(createBtn(totalPages, totalPages, state.currentPage === totalPages));

        // Next
        if (state.currentPage < totalPages) {
            paginationContainer.appendChild(createBtn('>', state.currentPage + 1));
        }
    }

    init();
});
