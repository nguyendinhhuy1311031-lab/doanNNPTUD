/**
 * app.js - Main Application Logic
 */

let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
let editingProductId = null;
let editingCategoryId = null;

// ============ INITIALIZATION ============

document.addEventListener('DOMContentLoaded', async () => {
    if (authToken && !currentUser) {
        // Fetch user info if token exists but no currentUser
        try {
            const result = await getCurrentUser();
            currentUser = result.user;
            localStorage.setItem('user', JSON.stringify(currentUser));
        } catch (error) {
            console.error('Error fetching user:', error);
            authToken = null;
            localStorage.removeItem('token');
        }
    }
    updateNavbar();
    await loadCategories();
    await loadProducts();
    updateCartDisplay();
    setupEventListeners();
});

// ============ EVENT LISTENERS ============

function setupEventListeners() {
    document.getElementById('homeBtn').addEventListener('click', goToHome);
    document.getElementById('loginBtn').addEventListener('click', goToLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('adminBtn').addEventListener('click', goToAdminDashboard);
    document.getElementById('ordersBtn').addEventListener('click', goToOrders);
    document.getElementById('cartBtn').addEventListener('click', openCart);
}

// ============ NAVIGATION ============

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
}

function goToHome() {
    showPage('homePage');
    loadProducts();
}

function goToLogin() {
    showPage('loginPage');
}

function goToSignup() {
    showPage('signupPage');
}

function goToAdminDashboard() {
    showPage('adminDashboardPage');
    loadAdminData();
}

function goToAdminProducts() {
    showPage('adminProductsPage');
    loadAdminData();
}

function goToAdminCategories() {
    showPage('adminCategoriesPage');
    loadAdminData();
}

function goToAdminUsers() {
    showPage('adminUsersPage');
    loadAdminData();
}

function goToOrders() {
    showPage('ordersPage');
    loadUserOrders();
}

async function goToProductDetail(productId) {
    showPage('productDetailPage');
    await loadProductDetail(productId);
}

function goToCheckout() {
    closeCart();
    if (cartItems.length === 0) {
        showToast('Giỏ hàng trống!', 'error');
        return;
    }
    document.getElementById('checkoutModal').classList.add('active');
}

function openCart() {
    updateCartDisplay();
    document.getElementById('cartModal').classList.add('active');
}

function closeCart() {
    document.getElementById('cartModal').classList.remove('active');
}

function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('active');
}

// ============ NAVBAR & AUTH ============

function updateNavbar() {
    const isLoggedIn = !!authToken;
    const roles = currentUser && currentUser.role ? (Array.isArray(currentUser.role) ? currentUser.role : [currentUser.role]) : [];
    const isAdmin = roles.includes('admin');

    document.getElementById('loginBtn').style.display = isLoggedIn ? 'none' : 'block';
    document.getElementById('logoutBtn').style.display = isLoggedIn ? 'block' : 'none';
    document.getElementById('adminBtn').style.display = isAdmin ? 'block' : 'none';
    document.getElementById('ordersBtn').style.display = isLoggedIn ? 'block' : 'none';
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await loginUser(username, password);
        const result = await getCurrentUser();
        currentUser = result.user;
        localStorage.setItem('user', JSON.stringify(currentUser));
        updateNavbar();
        showToast('✅ Đăng nhập thành công!', 'success');
        goToHome();
    } catch (error) {
        showToast('❌ ' + error.message, 'error');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const role = document.getElementById('signupRole').value;

    try {
        await signupUser(name, username, email, password, role);
        showToast('✅ Đăng ký thành công! Đăng nhập ngay.', 'success');
        document.getElementById('loginUsername').value = username;
        document.getElementById('loginPassword').value = password;
        goToLogin();
    } catch (error) {
        showToast('❌ ' + error.message, 'error');
    }
}

async function handleLogout() {
    logoutUser();
    currentUser = null;
    authToken = null;
    cartItems = [];
    localStorage.removeItem('cart');
    updateNavbar();
    showToast('👋 Đã đăng xuất', 'info');
    goToHome();
}

async function handlePromoteAdmin(e) {
    const username = document.getElementById('promoteUsername').value;
    if (!username) {
        showToast('⚠️ Vui lòng nhập tên người dùng', 'error');
        return;
    }

    try {
        await promoteUserToAdmin(username);
        showToast(`✅ ${username} đã được nâng cấp thành admin!`, 'success');
        document.getElementById('promoteUsername').value = '';
    } catch (error) {
        showToast('❌ ' + error.message, 'error');
    }
}

// ============ CATEGORIES ============

let categories = [];

async function loadCategories() {
    try {
        const result = await getAllCategories();
        categories = result.data;
        updateCategoryFilter();
        updateAdminCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function updateCategoryFilter() {
    const select = document.getElementById('categoryFilter');
    select.innerHTML = '<option value="">Tất cả</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat._id;
        option.textContent = cat.name;
        select.appendChild(option);
    });
}

async function updateAdminCategories() {
    const adminSelect = document.getElementById('productCategory');
    adminSelect.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat._id;
        option.textContent = cat.name;
        adminSelect.appendChild(option);
    });

    const categoriesList = document.getElementById('categoriesList');
    categoriesList.innerHTML = '';
    categories.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'category-item';
        div.innerHTML = `
            ${cat.image ? `<img class="category-image" src="${cat.image}" alt="${cat.name}">` : ''}
            <h4>${cat.name}</h4>
            <p>${cat.description || ''}</p>
            <div class="admin-actions">
                <button onclick="startEditCategory('${cat._id}')" class="btn btn-secondary">Sửa</button>
                <button onclick="handleDeleteCategory('${cat._id}')" class="btn btn-danger">Xóa</button>
            </div>
        `;
        categoriesList.appendChild(div);
    });
}

async function handleAddCategory(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('categoryName').value;
    const description = document.getElementById('categoryDesc').value;
    const imageFile = document.getElementById('categoryImage').files[0];

    if (!name.trim()) {
        showToast('Tên danh mục không được trống!', 'error');
        return;
    }

    try {
        if (editingCategoryId) {
            await updateCategory(editingCategoryId, name, description, imageFile);
            showToast('Cập nhật danh mục thành công!', 'success');
            cancelCategoryEdit();
        } else {
            await createCategory(name, description, imageFile);
            showToast('Thêm danh mục thành công!', 'success');
        }

        document.getElementById('categoryName').value = '';
        document.getElementById('categoryDesc').value = '';
        document.getElementById('categoryImage').value = '';
        await loadCategories();
        await updateAdminCategories();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function handleDeleteCategory(id) {
    if (!confirm('Xác nhận xóa danh mục?')) return;
    try {
        await apiCall(`/api/categories/${id}`, 'DELETE');
        showToast('Xóa danh mục thành công!', 'success');
        cancelCategoryEdit();
        await loadCategories();
        await updateAdminCategories();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function startEditCategory(id) {
    const category = categories.find(cat => cat._id === id);
    if (!category) return;

    editingCategoryId = id;
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryDesc').value = category.description || '';
    document.getElementById('categoryFormButton').textContent = 'Lưu thay đổi';
    document.getElementById('cancelCategoryEditButton').style.display = 'inline-block';
    showToast(`Bắt đầu sửa danh mục: ${category.name}`, 'info');
}

function cancelCategoryEdit() {
    editingCategoryId = null;
    document.getElementById('categoryName').value = '';
    document.getElementById('categoryDesc').value = '';
    document.getElementById('categoryImage').value = '';
    document.getElementById('categoryFormButton').textContent = 'Thêm Danh Mục';
    document.getElementById('cancelCategoryEditButton').style.display = 'none';
}

// ============ PRODUCTS ============

let allProducts = [];

async function loadProducts() {
    try {
        const categoryId = document.getElementById('categoryFilter')?.value || '';
        const search = document.getElementById('searchInput')?.value || '';
        const result = await getAllProducts(categoryId, search);
        allProducts = result.data;
        renderProducts(allProducts);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Không có sản phẩm</p>';
        return;
    }

    products.forEach(product => {
        const discountedPrice = product.price * (1 - product.discount / 100);
        const imageUrl = product.images && product.images.length > 0 ? product.images[0] : null;
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => goToProductDetail(product._id);
        card.innerHTML = `
            <div class="product-image">
                ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}">` : '📦'}
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-category">${product.category.name}</div>
                <div class="product-price">
                    ${discountedPrice.toLocaleString()} VND
                    ${product.discount > 0 ? `<span style="text-decoration: line-through; color: #999;">
                        ${product.price.toLocaleString()} VND</span>` : ''}
                </div>
                <div class="product-rating">⭐ ${product.rating.toFixed(1)} (${product.totalReviews} reviews)</div>
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="addToCart('${product._id}', '${product.name}', ${discountedPrice}); event.stopPropagation();">Thêm vào giỏ</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterProducts() {
    loadProducts();
}

async function loadProductDetail(productId) {
    try {
        const result = await getProductById(productId);
        const product = result.data;
        const discountedPrice = product.price * (1 - product.discount / 100);

        const imageUrl = product.images && product.images.length > 0 ? product.images[0] : null;
        const container = document.getElementById('productDetail');
        container.innerHTML = `
            <div class="product-detail-image">
                ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}">` : '📦'}
            </div>
            <div class="product-detail-info">
                <h1>${product.name}</h1>
                <p class="category">Danh mục: ${product.category.name}</p>
                <p class="price">${discountedPrice.toLocaleString()} VND</p>
                ${product.discount > 0 ? `<p style="color: #e74c3c;">Giảm giá: ${product.discount}%</p>` : ''}
                <p class="stock">Kho hàng: ${product.stock} sản phẩm</p>
                <p class="description">${product.description || ''}</p>
                <div class="quantity-control">
                    <label>Số lượng:</label>
                    <input type="number" id="productQuantity" value="1" min="1" max="${product.stock}">
                </div>
                <button class="btn btn-primary" onclick="addProductToCart('${product._id}', '${product.name}', ${discountedPrice})">Thêm vào giỏ</button>
            </div>
        `;

        // Load comments
        await loadProductComments(productId);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function handleAddProduct(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('productName').value.trim();
    const description = document.getElementById('productDesc').value.trim();
    const price = document.getElementById('productPrice').value;
    const discount = document.getElementById('productDiscount').value || 0;
    const stock = document.getElementById('productStock').value;
    const category = document.getElementById('productCategory').value;
    const imageFiles = document.getElementById('productImages').files;

    if (!name || !price || !stock || !category) {
        showToast('Vui lòng điền đầy đủ tên, giá, kho và danh mục', 'error');
        return;
    }

    try {
        if (editingProductId) {
            await updateProduct(editingProductId, name, description, price, discount, stock, category, imageFiles);
            showToast('Cập nhật sản phẩm thành công!', 'success');
            cancelProductEdit();
        } else {
            await createProduct(name, description, price, discount, stock, category, imageFiles);
            showToast('Thêm sản phẩm thành công!', 'success');
        }

        document.getElementById('productName').value = '';
        document.getElementById('productDesc').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productDiscount').value = '0';
        document.getElementById('productStock').value = '';
        document.getElementById('productImages').value = '';
        await loadProducts();
        await updateAdminProducts();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function handleDeleteProduct(id) {
    if (!confirm('Xác nhận xóa sản phẩm?')) return;
    try {
        await deleteProduct(id);
        showToast('Xóa sản phẩm thành công!', 'success');
        cancelProductEdit();
        await loadProducts();
        await updateAdminProducts();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function startEditProduct(id) {
    const product = allProducts.find(p => p._id === id);
    if (!product) return;

    editingProductId = id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productDiscount').value = product.discount || 0;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productCategory').value = product.category?._id || product.category;
    document.getElementById('productDesc').value = product.description || '';
    document.getElementById('productFormButton').textContent = 'Lưu thay đổi';
    document.getElementById('cancelProductEditButton').style.display = 'inline-block';
    showToast(`Bắt đầu sửa sản phẩm: ${product.name}`, 'info');
}

function cancelProductEdit() {
    editingProductId = null;
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productDiscount').value = '0';
    document.getElementById('productStock').value = '';
    document.getElementById('productCategory').value = categories.length > 0 ? categories[0]._id : '';
    document.getElementById('productDesc').value = '';
    document.getElementById('productImages').value = '';
    document.getElementById('productFormButton').textContent = 'Thêm Sản Phẩm';
    document.getElementById('cancelProductEditButton').style.display = 'none';
}

// ============ COMMENTS ============

async function loadProductComments(productId) {
    try {
        const result = await getProductComments(productId);
        const comments = result.data;
        const commentsList = document.getElementById('commentsList');
        commentsList.innerHTML = '';

        comments.forEach(comment => {
            const authorName = comment.user?.name || 'Người dùng ẩn danh';
            if (!comment.user) {
                console.warn('Comment without user data:', comment);
            }
            const div = document.createElement('div');
            div.className = 'comment-item';
            div.innerHTML = `
                <div class="comment-author">${authorName}</div>
                <div class="comment-rating">${'⭐'.repeat(comment.rating)} (${comment.rating}/5)</div>
                <div class="comment-text">${comment.text}</div>
                <small>${new Date(comment.createdAt).toLocaleDateString('vi-VN')} | ${comment.likes} lượt thích</small>
                ${authToken ? `<button onclick="handleLikeComment('${comment._id}')" class="btn btn-secondary" style="margin-top: 0.5rem; font-size: 0.8rem;">👍 Thích</button>` : ''}
            `;
            commentsList.appendChild(div);
        });

        // Show comment form only if logged in
        if (authToken) {
            document.getElementById('commentForm').style.display = 'block';
            document.getElementById('commentForm').dataset.productId = productId;
        } else {
            document.getElementById('commentForm').style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

async function submitComment() {
    if (!authToken) {
        showToast('Bạn cần đăng nhập để bình luận', 'error');
        return;
    }

    const productId = document.getElementById('commentForm').dataset.productId;
    const rating = parseInt(document.getElementById('commentRating').value);
    const text = document.getElementById('commentText').value;

    if (!text.trim()) {
        showToast('Vui lòng nhập nội dung bình luận', 'error');
        return;
    }

    try {
        await createComment(productId, rating, text);
        document.getElementById('commentText').value = '';
        showToast('Bình luận thành công!', 'success');
        await loadProductComments(productId);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function handleLikeComment(commentId) {
    try {
        await likeComment(commentId);
        showToast('Đã thích bình luận', 'success');
        const productId = document.getElementById('commentForm').dataset.productId;
        await loadProductComments(productId);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// ============ CART ============

function addToCart(productId, productName, price) {
    const quantity = 1;
    addCartItem(productId, productName, price, quantity);
    showToast(`Đã thêm ${productName} vào giỏ!`, 'success');
}

function addProductToCart(productId, productName, price) {
    const quantity = parseInt(document.getElementById('productQuantity').value) || 1;
    addCartItem(productId, productName, price, quantity);
    showToast(`Đã thêm ${quantity} sản phẩm vào giỏ!`, 'success');
}

function addCartItem(productId, productName, price, quantity) {
    const existingItem = cartItems.find(item => item.productId === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cartItems.push({ productId, productName, price, quantity });
    }
    localStorage.setItem('cart', JSON.stringify(cartItems));
    updateCartDisplay();
}

function removeFromCart(productId) {
    cartItems = cartItems.filter(item => item.productId !== productId);
    localStorage.setItem('cart', JSON.stringify(cartItems));
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cartItems');
    cartItemsDiv.innerHTML = '';
    updateCartCount();

    if (cartItems.length === 0) {
        cartItemsDiv.innerHTML = '<p>Giỏ hàng trống</p>';
        document.getElementById('cartTotal').textContent = '0 VND';
        return;
    }

    let total = 0;
    cartItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.productName}</div>
                <div class="cart-item-price">${item.price.toLocaleString()} VND</div>
            </div>
            <div class="cart-item-qty">
                <input type="number" value="${item.quantity}" min="1" onchange="updateCartQuantity('${item.productId}', this.value)">
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${item.productId}')">Xóa</button>
        `;
        cartItemsDiv.appendChild(div);
    });

    document.getElementById('cartTotal').textContent = total.toLocaleString() + ' VND';
}

function updateCartQuantity(productId, quantity) {
    const item = cartItems.find(item => item.productId === productId);
    if (item) {
        item.quantity = parseInt(quantity) || 1;
        localStorage.setItem('cart', JSON.stringify(cartItems));
        updateCartDisplay();
    }
}

function updateCartCount() {
    const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = totalCount;
    }
}

// ============ ORDERS ============

async function handleCheckout(e) {
    e.preventDefault();

    if (!authToken) {
        showToast('Bạn cần đăng nhập để đặt hàng', 'error');
        return;
    }

    const shippingAddress = document.getElementById('shippingAddress').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const notes = document.getElementById('orderNotes').value;

    const items = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
    }));

    try {
        await createOrder(items, shippingAddress, phoneNumber, notes);
        cartItems = [];
        localStorage.removeItem('cart');
        updateCartDisplay();
        closeCheckout();
        showToast('Đặt hàng thành công!', 'success');
        goToOrders();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function loadUserOrders() {
    if (!authToken) {
        showToast('Bạn cần đăng nhập để xem đơn hàng', 'error');
        goToLogin();
        return;
    }

    try {
        const result = await getUserOrders();
        const orders = result.data;
        const ordersList = document.getElementById('ordersList');
        ordersList.innerHTML = '';

        if (orders.length === 0) {
            ordersList.innerHTML = '<p>Bạn chưa có đơn hàng nào</p>';
            return;
        }

        orders.forEach(order => {
            const div = document.createElement('div');
            div.className = 'order-item';
            const statusClass = `status-${order.status}`;
            div.innerHTML = `
                <div class="order-header">
                    <span class="order-number">${order.orderNumber}</span>
                    <span class="order-status ${statusClass}">${order.status}</span>
                </div>
                <div class="order-detail">
                    <span class="order-detail-label">Địa chỉ:</span> ${order.shippingAddress}
                </div>
                <div class="order-detail">
                    <span class="order-detail-label">Số điện thoại:</span> ${order.phoneNumber}
                </div>
                <div class="order-detail">
                    <span class="order-detail-label">Tổng tiền:</span> ${order.totalPrice.toLocaleString()} VND
                </div>
                <div class="order-detail">
                    <span class="order-detail-label">Ngày đặt:</span> ${new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </div>
                ${order.status !== 'delivered' && order.status !== 'cancelled' ? 
                    `<button class="btn btn-danger" onclick="handleCancelOrder('${order._id}')">Hủy đơn</button>` : ''}
            `;
            ordersList.appendChild(div);
        });
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function handleCancelOrder(orderId) {
    if (!confirm('Xác nhận hủy đơn hàng?')) return;
    try {
        await cancelOrder(orderId);
        showToast('Hủy đơn hàng thành công!', 'success');
        await loadUserOrders();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// ============ ADMIN ============

async function loadAdminData() {
    if (!authToken) {
        goToLogin();
        return;
    }

    await loadCategories();
    updateAdminCategories();
    await updateAdminProducts();
}

async function updateAdminProducts() {
    try {
        const result = await getAllProducts();
        const products = result.data;
        const productsList = document.getElementById('productsList');
        productsList.innerHTML = '';

        if (products.length === 0) {
            productsList.innerHTML = '<p>Không có sản phẩm</p>';
            return;
        }

        products.forEach(product => {
            const imageUrl = product.images && product.images.length > 0 ? product.images[0] : null;
            const card = document.createElement('div');
            card.className = 'admin-product-card';
            card.innerHTML = `
                ${imageUrl ? `<img class="admin-product-image" src="${imageUrl}" alt="${product.name}">` : ''}
                <div class="admin-product-header">
                    <h4>${product.name}</h4>
                    <div>
                        <button class="btn btn-secondary" onclick="startEditProduct('${product._id}')">Sửa</button>
                        <button class="btn btn-danger" onclick="handleDeleteProduct('${product._id}')">Xóa</button>
                    </div>
                </div>
                <p><strong>Giá:</strong> ${product.price.toLocaleString()} VND</p>
                <p><strong>Danh mục:</strong> ${product.category?.name || 'N/A'}</p>
                <p><strong>Kho:</strong> ${product.stock}</p>
                <p>${product.description || ''}</p>
            `;
            productsList.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading admin products:', error);
    }
}

function switchAdminTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    if (tab === 'products') {
        document.getElementById('adminProductsTab').classList.add('active');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else {
        document.getElementById('adminCategoriesTab').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    }
}

// ============ UTILITIES ============

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast active ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}
