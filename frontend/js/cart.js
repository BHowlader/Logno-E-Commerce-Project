// Cart lines look like { name, price, qty }
const STORAGE_KEY = 'glowcare-cart';

function addItem(cart, name, price) {
    const line = cart.find(item => item.name === name);
    if (line) {
        line.qty += 1;
    } else {
        cart.push({ name: name, price: price, qty: 1 });
    }
    return cart;
}

function removeItem(cart, name) {
    return cart.filter(item => item.name !== name);
}

function total(cart) {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

if (typeof document !== 'undefined') {
    // ponytail: localStorage instead of a backend, swap when the API exists
    let cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));

    const dialog = document.getElementById('cart-dialog');
    const countEl = document.getElementById('cart-count');
    const listEl = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');

    function render() {
        countEl.textContent = cart.reduce((n, item) => n + item.qty, 0);
        totalEl.textContent = '৳' + total(cart);
        listEl.innerHTML = '';

        if (cart.length === 0) {
            listEl.innerHTML = '<li>Your cart is empty.</li>';
            return;
        }

        for (const item of cart) {
            const row = document.createElement('li');
            row.textContent = `${item.name} × ${item.qty} — ৳${item.price * item.qty}`;

            const remove = document.createElement('button');
            remove.textContent = 'Remove';
            remove.addEventListener('click', () => {
                cart = removeItem(cart, item.name);
                save();
                render();
            });

            row.append(remove);
            listEl.append(row);
        }
    }

    document.querySelectorAll('.product-card button').forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.product-card');
            const name = card.querySelector('h3').textContent;
            const price = parseInt(card.querySelector('.price').textContent.replace(/\D/g, ''), 10);
            addItem(cart, name, price);
            save();
            render();
        });
    });

    document.getElementById('cart-open').addEventListener('click', () => dialog.showModal());
    document.getElementById('cart-close').addEventListener('click', () => dialog.close());
    render();
}

// Self-check: node frontend/js/cart.js
if (typeof window === 'undefined') {
    const assert = require('assert');
    let cart = addItem(addItem([], 'Neem', 230), 'Neem', 230);
    assert.strictEqual(cart.length, 1, 'same product should merge into one line');
    assert.strictEqual(cart[0].qty, 2);
    cart = addItem(cart, 'Rose', 240);
    assert.strictEqual(total(cart), 700);
    assert.strictEqual(total(removeItem(cart, 'Neem')), 240);
    console.log('cart self-check ok');
}
