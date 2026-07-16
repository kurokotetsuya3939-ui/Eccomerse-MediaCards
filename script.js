let cart = JSON.parse(localStorage.getItem('SHOPPING_CART')) || [];

document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();

    if (document.querySelector('.grid-container')) {
        initCatalogPage();
    }
    if (document.querySelector('.producttable')) {
        initCartPage();
    }

    initAuthModal();
});

//Cart and counter logic

function updateCartCounter() {
    const counterElements = document.querySelectorAll('.counter');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    counterElements.forEach(counter => {
        counter.textContent = totalItems;
    });
}

function saveCartToStorage() {
    localStorage.setItem('SHOPPING_CART', JSON.stringify(cart));
    updateCartCounter();
}

function initCatalogPage() {
    const buyButtons = document.querySelectorAll('.buy-btn');

    buyButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const card = event.target.closest('.productcard');

            const product = {
                id: card.querySelector('.productname').textContent.trim(),
                name: card.querySelector('.productname').textContent.trim(),
                price: parseFloat(card.querySelector('.price').textContent.replace('$', '')),
                image: card.querySelector('.productphoto').getAttribute('src'),
                quantity: 1
            };

            addToCart(product);

            const originalText = button.textContent;
            button.textContent = 'Added! ✓';
            button.style.backgroundColor = '#27ae60';
            setTimeout(() => {
                button.textContent = originalText;
                button.style.backgroundColor = '#0084FF';
            }, 1000);
        });
    });
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push(product);
    }

    saveCartToStorage();
}

function initCartPage() {
    renderCartTable();

    const tableBody = document.querySelector('.producttable tbody');
    if (tableBody) {
        tableBody.addEventListener('click', (event) => {
            if (event.target.classList.contains('delete-btn')) {
                const productId = event.target.getAttribute('data-id');
                removeFromCart(productId);
            }
        });
    }
}

function renderCartTable() {
    const tableBody = document.querySelector('.producttable tbody');
    const cartContainer = document.querySelector('.cart-container');

    if (!tableBody) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.04);">
                <p style="font-size: 20px; margin-bottom: 20px; color: #666;">Your cart is empty 👾</p>
                <a href="index.html" style="display: inline-block; padding: 12px 24px; background: #0084FF; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Main Menu</a>
            </div>
        `;
        return;
    }

    tableBody.innerHTML = '';

    let subtotal = 0;

    cart.forEach(item => {
        const itemSubtotal = item.price * item.quantity;
        subtotal += itemSubtotal;

        const row = document.createElement('tr');
        row.className = 'productinformation';
        row.innerHTML = `
            <td class="prodnamephoto">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <span class="cart-item-title">${item.name}</span>
            </td>
            <td class="price-col">$${item.price.toFixed(2)}</td>
            <td class="quantity-col">${item.quantity}</td>
            <td class="subtotal-col">$${itemSubtotal.toFixed(2)}</td>
            <td class="remove-col">
                <button class="delete-btn" data-id="${item.id}">✕</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    updateCartTotals(subtotal);
}

function updateCartTotals(subtotal) {
    const totalRows = document.querySelectorAll('.cart-total .total-row span:last-child');
    const finalPriceTag = document.querySelector('.cart-total .final-total .price-tag');

    if (totalRows.length >= 2) {
        totalRows[0].textContent = `$${subtotal.toFixed(2)}`;
    }

    if (finalPriceTag) {
        finalPriceTag.textContent = `$${subtotal.toFixed(2)}`;
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);

    saveCartToStorage();
    renderCartTable();
}

//Register \ Login

function initAuthModal() {
    const authOverlay = document.getElementById('authOverlay');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const loginLink = document.querySelector('.login-link');
    const registerLink = document.querySelector('.register-link');
    const loginForm = document.querySelector('.form-box.login');
    const registerForm = document.querySelector('.form-box.register');

    if (!authOverlay) return;

    if (registerLink && loginForm && registerForm) {
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
        });
    }

    if (loginLink && loginForm && registerForm) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.classList.remove('active');
            loginForm.classList.add('active');
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            authOverlay.classList.remove('open');
        });
    }

    authOverlay.addEventListener('click', (e) => {
        if (e.target === authOverlay) {
            authOverlay.classList.remove('open');
        }
    });
}

window.openAuthModal = function () {
    const authOverlay = document.getElementById('authOverlay');
    const loginForm = document.querySelector('.form-box.login');
    const registerForm = document.querySelector('.form-box.register');

    if (authOverlay && loginForm && registerForm) {
        authOverlay.classList.add('open');
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
    }
};