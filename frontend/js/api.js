/**
 * api.js - API Functions
 * Chứa tất cả các function gọi API tới backend
 */

const API_URL = 'http://localhost:3001';

let authToken = localStorage.getItem('token') || null;

/**
 * Helper function to make API calls
 */
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (authToken) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        
        if (response.status === 401) {
            authToken = null;
            localStorage.removeItem('token');
            location.reload();
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Lỗi API');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Helper function to upload files
 */
async function apiUpload(endpoint, formData, method = 'POST') {
    const options = {
        method
    };

    if (authToken) {
        options.headers = {
            'Authorization': `Bearer ${authToken}`
        };
    }

    options.body = formData;

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Lỗi upload');
        }

        return result;
    } catch (error) {
        console.error('Upload Error:', error);
        throw error;
    }
}

// ============ AUTH ENDPOINTS ============

async function loginUser(username, password) {
    const result = await apiCall('/api/auth/login', 'POST', { username, password });
    authToken = result.token;
    localStorage.setItem('token', authToken);
    return result;
}

async function signupUser(name, username, email, password, role = 'user') {
    const result = await apiCall('/api/auth/signup', 'POST', { name, username, email, password, role });
    return result;
}

async function promoteUserToAdmin(username) {
    const result = await apiCall('/api/auth/promote-admin', 'POST', { username });
    return result;
}

async function getCurrentUser() {
    return await apiCall('/api/auth/me');
}

async function logoutUser() {
    authToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

// ============ CATEGORY ENDPOINTS ============

async function getAllCategories() {
    return await apiCall('/api/categories');
}

async function getCategoryById(id) {
    return await apiCall(`/api/categories/${id}`);
}

async function createCategory(name, description, imageFile) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (imageFile) {
        formData.append('image', imageFile);
    }
    return await apiUpload('/api/categories', formData);
}

async function updateCategory(id, name, description, imageFile) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (imageFile) {
        formData.append('image', imageFile);
    }
    return await apiUpload(`/api/categories/${id}`, formData, 'PUT');
}

async function deleteCategory(id) {
    return await apiCall(`/api/categories/${id}`, 'DELETE');
}

// ============ PRODUCT ENDPOINTS ============

async function getAllProducts(categoryId = '', search = '') {
    let url = '/api/products';
    const params = new URLSearchParams();
    if (categoryId) params.append('category', categoryId);
    if (search) params.append('search', search);
    if (params.toString()) url += '?' + params.toString();
    return await apiCall(url);
}

async function getProductById(id) {
    return await apiCall(`/api/products/${id}`);
}

async function createProduct(name, description, price, discount, stock, category, imageFiles) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('discount', discount);
    formData.append('stock', stock);
    formData.append('category', category);
    
    if (imageFiles) {
        for (let file of imageFiles) {
            formData.append('images', file);
        }
    }
    
    return await apiUpload('/api/products', formData);
}

async function updateProduct(id, name, description, price, discount, stock, category, imageFiles) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('discount', discount);
    formData.append('stock', stock);
    formData.append('category', category);
    
    if (imageFiles && imageFiles.length > 0) {
        for (let file of imageFiles) {
            formData.append('images', file);
        }
    }
    
    return await apiUpload(`/api/products/${id}`, formData, 'PUT');
}

async function deleteProduct(id) {
    return await apiCall(`/api/products/${id}`, 'DELETE');
}

async function updateProductRating(id, rating) {
    return await apiCall(`/api/products/${id}/rating`, 'PUT', { rating });
}

// ============ ORDER ENDPOINTS ============

async function createOrder(items, shippingAddress, phoneNumber, notes = '') {
    return await apiCall('/api/orders', 'POST', {
        items,
        shippingAddress,
        phoneNumber,
        notes
    });
}

async function getAllOrders() {
    return await apiCall('/api/orders');
}

async function getUserOrders() {
    return await apiCall('/api/orders/user/my-orders');
}

async function getOrderById(id) {
    return await apiCall(`/api/orders/${id}`);
}

async function updateOrderStatus(id, status) {
    return await apiCall(`/api/orders/${id}/status`, 'PUT', { status });
}

async function cancelOrder(id) {
    return await apiCall(`/api/orders/${id}/cancel`, 'PUT');
}

// ============ COMMENT ENDPOINTS ============

async function createComment(productId, rating, text) {
    return await apiCall('/api/comments', 'POST', {
        productId,
        rating,
        text
    });
}

async function getProductComments(productId) {
    return await apiCall(`/api/comments/product/${productId}`);
}

async function getCommentById(id) {
    return await apiCall(`/api/comments/${id}`);
}

async function updateComment(id, rating, text) {
    return await apiCall(`/api/comments/${id}`, 'PUT', {
        rating,
        text
    });
}

async function deleteComment(id) {
    return await apiCall(`/api/comments/${id}`, 'DELETE');
}

async function likeComment(id) {
    return await apiCall(`/api/comments/${id}/like`, 'PUT');
}
