/**
 * FRONTEND SANITIZER UTILITY
 * Wrapper for DOMPurify to prevent XSS in rendered content
 */

import DOMPurify from 'dompurify';

export const Sanitizer = {
    /**
     * Sanitize HTML for safe rendering
     * @param {string} dirty - The dirty HTML string
     * @returns {string} - The clean HTML string
     */
    sanitizeHtml(dirty) {
        if (!dirty) return '';
        return DOMPurify.sanitize(dirty, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span'],
            ALLOWED_ATTR: ['href', 'target', 'style', 'class']
        });
    },

    /**
     * Sanitize text content (strip tags)
     */
    stripTags(html) {
        if (!html) return '';
        return html.replace(/(<([^>]+)>)/gi, "");
    }
};
