// Инициализируем корзину: берем данные из памяти браузера или создаем пустой массив
let cart = JSON.parse(localStorage.getItem('SHOPPING_CART')) || [];

// Запускаем скрипт сразу после загрузки HTML
document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter(); // Обновляем цифру на значке корзины в шапке

    // Определяем, на какой странице мы находимся, по элементам в HTML
    if (document.querySelector('.grid-container')) {
        initCatalogPage();
    } 
    if (document.querySelector('.producttable')) {
        initCartPage();
    }
});

// =========================================================================
// ОБЩИЕ ФУНКЦИИ (Работают на всех страницах)
// =========================================================================

// Функция обновления счетчика товаров в шапке
function updateCartCounter() {
    const counterElements = document.querySelectorAll('.counter');
    // Считаем общее количество всех товаров в корзине
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    counterElements.forEach(counter => {
        counter.textContent = totalItems;
    });
}

// Функция сохранения корзины в память браузера
function saveCartToStorage() {
    localStorage.setItem('SHOPPING_CART', JSON.stringify(cart));
    updateCartCounter();
}

// =========================================================================
// ЛОГИКА ДЛЯ СТРАНИЦЫ КАТАЛОГА (catalog.html)
// =========================================================================

function initCatalogPage() {
    // Находим все кнопки "Buy Card" в каталоге
    const buyButtons = document.querySelectorAll('.buy-btn');

    buyButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Находим саму карточку, на которую нажали
            const card = event.target.closest('.productcard');
            
            // Собираем данные о персонаже прямо из HTML-разметки карточки
            const product = {
                id: card.querySelector('.productname').textContent.trim(), // Используем имя как уникальный ID
                name: card.querySelector('.productname').textContent.trim(),
                price: parseFloat(card.querySelector('.price').textContent.replace('$', '')),
                image: card.querySelector('.productphoto').getAttribute('src'),
                quantity: 1
            };

            addToCart(product);
            
            // Легкая анимация кнопки для обратной связи
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

// Функция добавления товара в массив корзины
function addToCart(product) {
    // Проверяем, есть ли уже такой персонаж в корзине
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1; // Если есть, просто увеличиваем количество
    } else {
        cart.push(product); // Если нет, добавляем как новый товар
    }

    saveCartToStorage();
}

// =========================================================================
// ЛОГИКА ДЛЯ СТРАНИЦЫ КОРЗИНЫ (cart.html)
// =========================================================================

function initCartPage() {
    renderCartTable();

    // Слушаем клики внутри таблицы (для удаления товаров)
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

// Функция отрисовки таблицы товаров и блока Итого
function renderCartTable() {
    const tableBody = document.querySelector('.producttable tbody');
    const cartContainer = document.querySelector('.cart-container');
    
    if (!tableBody) return;

    // Если корзина абсолютно пустая
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.04);">
                <p style="font-size: 20px; margin-bottom: 20px; color: #666;">Your cart is empty 👾</p>
                <a href="index.html" style="display: inline-block; padding: 12px 24px; background: #0084FF; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Main Menu</a>
            </div>
        `;
        return;
    }

    // Очищаем таблицу перед новой отрисовкой
    tableBody.innerHTML = '';

    let subtotal = 0;

    // Генерируем строки таблицы для каждого товара
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

    // Обновляем блок расчета стоимости (Итого) справа
    updateCartTotals(subtotal);
}

// Функция пересчета финальной стоимости
function updateCartTotals(subtotal) {
    const totalRows = document.querySelectorAll('.cart-total .total-row span:last-child');
    const finalPriceTag = document.querySelector('.cart-total .final-total .price-tag');

    if (totalRows.length >= 2) {
        totalRows[0].textContent = `$${subtotal.toFixed(2)}`; // Subtotal
        // Наша доставка бесплатная, так что второй ряд (Shipping) остается Free
    }
    
    if (finalPriceTag) {
        finalPriceTag.textContent = `$${subtotal.toFixed(2)}`; // Total
    }
}

// Функция удаления товара из корзины
function removeFromCart(productId) {
    // Фильтруем массив, исключая удаленный товар
    cart = cart.filter(item => item.id !== productId);
    
    saveCartToStorage(); // Сохраняем изменения в локальной памяти
    renderCartTable();  // Перерисовываем таблицу на экране
}