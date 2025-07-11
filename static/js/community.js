// Community Tweet Composer Functionality
class CommunityComposer {
    constructor() {
        this.selectedTags = new Set();
        this.commonTags = [
            '#rice', '#wheat', '#cotton', '#sugarcane', '#maize', '#tomato', '#potato',
            '#organic', '#irrigation', '#fertilizer', '#pestcontrol', '#harvest',
            '#monsoon', '#drought', '#seeds', '#soil', '#farming', '#agriculture',
            '#dairy', '#livestock', '#market', '#price', '#export', '#subsidy',
            '#technology', '#innovation', '#sustainable', '#climate', '#weather'
        ];
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateCharacterCount();
        this.updatePostButton();
    }

    bindEvents() {
        const postText = document.getElementById('postText');
        const tagInput = document.getElementById('tagInput');
        const postForm = document.getElementById('postForm');

        if (postText) {
            postText.addEventListener('input', () => {
                this.updateCharacterCount();
                this.updatePostButton();
            });
        }

        if (tagInput) {
            tagInput.addEventListener('input', (e) => this.handleTagInput(e));
            tagInput.addEventListener('keydown', (e) => this.handleTagKeydown(e));
            tagInput.addEventListener('blur', () => this.hideSuggestions());
        }

        if (postForm) {
            postForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.tags-input-container')) {
                this.hideSuggestions();
            }
        });
    }

    updateCharacterCount() {
        const postText = document.getElementById('postText');
        const charCount = document.getElementById('charCount');
        
        if (postText && charCount) {
            const remaining = 280 - postText.value.length;
            charCount.textContent = remaining;
            
            // Change color based on remaining characters
            if (remaining < 20) {
                charCount.style.color = '#e74c3c';
            } else if (remaining < 50) {
                charCount.style.color = '#f39c12';
            } else {
                charCount.style.color = 'var(--text-muted)';
            }
        }
    }

    updatePostButton() {
        const postText = document.getElementById('postText');
        const postBtn = document.querySelector('.post-btn');
        
        if (postText && postBtn) {
            const hasContent = postText.value.trim().length > 0;
            const isValidLength = postText.value.length <= 280;
            
            postBtn.disabled = !hasContent || !isValidLength;
        }
    }

    handleTagInput(e) {
        const input = e.target.value;
        const lastWord = input.split(/\s+/).pop();
        
        if (lastWord.startsWith('#') && lastWord.length > 1) {
            this.showTagSuggestions(lastWord);
        } else {
            this.hideSuggestions();
        }
    }

    handleTagKeydown(e) {
        const input = e.target;
        
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Tab') {
            e.preventDefault();
            const words = input.value.split(/\s+/);
            const lastWord = words.pop();
            
            if (lastWord.startsWith('#') && lastWord.length > 1) {
                this.addTag(lastWord);
                input.value = words.join(' ') + (words.length > 0 ? ' ' : '');
            }
        } else if (e.key === 'Backspace' && input.value === '') {
            this.removeLastTag();
        }
    }

    showTagSuggestions(query) {
        const suggestions = this.commonTags.filter(tag => 
            tag.toLowerCase().includes(query.toLowerCase()) && 
            !this.selectedTags.has(tag)
        ).slice(0, 5);

        const suggestionsContainer = document.getElementById('tagsSuggestions');
        
        if (suggestions.length > 0 && suggestionsContainer) {
            suggestionsContainer.innerHTML = suggestions.map(tag => 
                `<div class="tag-suggestion" data-tag="${tag}">${tag}</div>`
            ).join('');
            
            suggestionsContainer.style.display = 'block';
            
            // Add click handlers
            suggestionsContainer.querySelectorAll('.tag-suggestion').forEach(item => {
                item.addEventListener('click', () => {
                    this.addTag(item.dataset.tag);
                    this.clearTagInput();
                    this.hideSuggestions();
                });
            });
        } else {
            this.hideSuggestions();
        }
    }

    hideSuggestions() {
        const suggestionsContainer = document.getElementById('tagsSuggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    }

    addTag(tag) {
        if (!tag.startsWith('#')) {
            tag = '#' + tag;
        }
        
        tag = tag.toLowerCase().replace(/[^a-z0-9#]/g, '');
        
        if (tag.length > 1 && !this.selectedTags.has(tag)) {
            this.selectedTags.add(tag);
            this.renderTags();
        }
    }

    removeTag(tag) {
        this.selectedTags.delete(tag);
        this.renderTags();
    }

    removeLastTag() {
        const tags = Array.from(this.selectedTags);
        if (tags.length > 0) {
            this.removeTag(tags[tags.length - 1]);
        }
    }

    clearTagInput() {
        const tagInput = document.getElementById('tagInput');
        if (tagInput) {
            const words = tagInput.value.split(/\s+/);
            words.pop(); // Remove the last word (the tag we just added)
            tagInput.value = words.join(' ') + (words.length > 0 ? ' ' : '');
        }
    }

    renderTags() {
        const container = document.getElementById('selectedTags');
        if (!container) return;

        container.innerHTML = Array.from(this.selectedTags).map(tag => `
            <div class="tag-pill">
                <span>${tag}</span>
                <button type="button" class="tag-remove" onclick="communityComposer.removeTag('${tag}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const postText = document.getElementById('postText').value.trim();
        const category = document.querySelector('.category-select').value;
        const location = document.querySelector('.location-input').value.trim();
        const tags = Array.from(this.selectedTags);

        if (!postText) {
            this.showNotification('Please write something to share!', 'warning');
            return;
        }

        // Simulate posting (in real app, this would send to backend)
        this.simulatePost({
            text: postText,
            category: category,
            location: location,
            tags: tags
        });
    }

    simulatePost(postData) {
        // Show loading state
        const postBtn = document.querySelector('.post-btn');
        const originalText = postBtn.innerHTML;
        postBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sharing...';
        postBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // Reset form
            document.getElementById('postText').value = '';
            document.querySelector('.category-select').value = '';
            document.querySelector('.location-input').value = '';
            this.selectedTags.clear();
            this.renderTags();
            
            // Reset button
            postBtn.innerHTML = originalText;
            postBtn.disabled = false;
            
            // Update character count and button state
            this.updateCharacterCount();
            this.updatePostButton();
            
            // Show success message
            this.showNotification('Your post has been shared with the community!', 'success');
            
            // Add the post to the timeline (simulation)
            this.addPostToTimeline(postData);
        }, 1500);
    }

    addPostToTimeline(postData) {
        const postsContainer = document.querySelector('.posts-container');
        if (!postsContainer) return;

        const categoryEmojis = {
            'crop-management': '🌾',
            'pest-control': '🐛',
            'weather': '🌤️',
            'market': '💰',
            'success': '🏆',
            'equipment': '🚜',
            'organic': '🌱'
        };

        const categoryNames = {
            'crop-management': 'Crop Management',
            'pest-control': 'Pest Control',
            'weather': 'Weather Updates',
            'market': 'Market Prices',
            'success': 'Success Stories',
            'equipment': 'Equipment & Tools',
            'organic': 'Organic Farming'
        };

        const newPost = document.createElement('div');
        newPost.className = 'card mb-4';
        newPost.style.opacity = '0';
        newPost.style.transform = 'translateY(-20px)';
        
        const categoryDisplay = postData.category ? 
            `${categoryEmojis[postData.category] || ''} ${categoryNames[postData.category] || postData.category}` : 
            'General Discussion';
            
        const locationDisplay = postData.location ? ` • 📍 ${postData.location}` : '';
        const tagsDisplay = postData.tags.length > 0 ? 
            `<div class="mt-2">${postData.tags.map(tag => `<span class="badge bg-secondary me-1">${tag}</span>`).join('')}</div>` : 
            '';

        newPost.innerHTML = `
            <div class="card-body">
                <div class="d-flex align-items-center mb-3">
                    <div class="avatar bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 50px; height: 50px;">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <h6 class="mb-0 fw-bold">You</h6>
                        <small class="text-muted">Just now • ${categoryDisplay}${locationDisplay}</small>
                    </div>
                </div>
                <p class="card-text">${postData.text}</p>
                ${tagsDisplay}
                <div class="d-flex align-items-center gap-3">
                    <button class="btn btn-outline-primary btn-sm">
                        <i class="fas fa-thumbs-up me-1"></i>Like (0)
                    </button>
                    <button class="btn btn-outline-secondary btn-sm">
                        <i class="fas fa-comment me-1"></i>Comment (0)
                    </button>
                    <button class="btn btn-outline-success btn-sm">
                        <i class="fas fa-share me-1"></i>Share
                    </button>
                </div>
            </div>
        `;

        // Insert at the beginning of posts container
        postsContainer.insertBefore(newPost, postsContainer.firstChild);
        
        // Animate in
        setTimeout(() => {
            newPost.style.transition = 'all 0.5s ease';
            newPost.style.opacity = '1';
            newPost.style.transform = 'translateY(0)';
        }, 100);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.style.minWidth = '300px';
        
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('postForm')) {
        window.communityComposer = new CommunityComposer();
    }
});