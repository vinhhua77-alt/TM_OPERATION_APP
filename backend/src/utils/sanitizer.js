/**
 * INPUT SANITIZER UTILITY
 * Wrapper for validator.js to prevent XSS and Injection attacks
 */

import validator from 'validator';

export const Sanitizer = {
    /**
     * Sanitize plain text input (e.g., names, notes)
     * Removes HTML tags and escapes special characters
     */
    sanitizeText(text) {
        if (typeof text !== 'string') return text;
        return validator.escape(text.trim());
    },

    /**
     * Sanitize HTML content (e.g., announcements)
     * Allows basic formatting but removes dangerous tags (script, iframe, etc.)
     * Note: For rich text, backend should ideally store raw and frontend sanitizes before display.
     * But for extra safety, we enable basic escaping here or rely on specific whitelist if needed.
     * Currently, we'll escape everything for maximum safety unless trusted.
     */
    sanitizeHtml(html) {
        if (typeof html !== 'string') return html;
        // For now, we treat all input as untrusted and escape it.
        // If we strictly need rich text, we should use a library like 'sanitize-html' on backend
        // or just rely on DOMPurify on frontend.
        // Here we'll escape common dangerous characters.
        return validator.escape(html.trim());
    },

    /**
     * Sanitize Email
     */
    sanitizeEmail(email) {
        if (typeof email !== 'string') return '';
        return validator.normalizeEmail(email.trim());
    },

    /**
     * Sanitize Object (Recursive)
     */
    sanitizeObject(obj) {
        if (typeof obj !== 'object' || obj === null) return obj;

        const cleanObj = Array.isArray(obj) ? [] : {};

        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                if (typeof value === 'string') {
                    cleanObj[key] = this.sanitizeText(value);
                } else if (typeof value === 'object') {
                    cleanObj[key] = this.sanitizeObject(value);
                } else {
                    cleanObj[key] = value;
                }
            }
        }
        return cleanObj;
    }
};
