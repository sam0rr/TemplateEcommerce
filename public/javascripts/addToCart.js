let cart = [];
let timeouts = {};

// fonction fléchée pour DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', event => {
        if (event.target.classList.contains('add-to-cart')) {
            const button = event.target;
            const productId = button.getAttribute('data-id');
            const productName = button.getAttribute('data-name');
            const productPrice = parseFloat(button.getAttribute('data-price'));
            const productImageUrl = button.getAttribute('data-image-url');
            addToCart(productId, productName, productPrice, productImageUrl);
        }
    });
});

// Fonction pour ajouter un produit au panier
const addToCart = (id, name, price, imageUrl) => {
    const existingProduct = cart.find(product => product.id === id);
    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({ id, name, price, quantity: 1, imageUrl });
    }
    updateCartUI();
};

// Fonction pour mettre à jour l'UI du panier
const updateCartUI = () => {
    updateCartForNavbar('cart-body-mobile', 'subtotal-price-mobile', 'tps-price-mobile', 'tvq-price-mobile', 'total-price-mobile', 'cart-count-mobile');
    updateCartForNavbar('cart-body-main', 'subtotal-price-main', 'tps-price-main', 'tvq-price-main', 'total-price-main', 'cart-count-main');
};

// Fonction pour mettre à jour les détails du panier dans une section spécifique
const updateCartForNavbar = (cartBodyId, subtotalPriceId, tpsPriceId, tvqPriceId, totalPriceId, cartCountId) => {
    const cartBody = document.getElementById(cartBodyId);
    cartBody.innerHTML = '';
    let subtotal = 0;

    cart.forEach(product => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <div class="checkout-product">
                <div class="product-cart">
                    <div class="align-image">
                        <img src="${product.imageUrl}" alt="${product.name}">
                    </div>
                    <div class="product-content">
                        <h6 class="title mb-2" style="text-align: center;">${product.name}</h6>
                        <div class="product-content-secondary d-flex align-items-center">
                        <div>
                            <button class="quantity-modify decrease mr-2" onclick="modifyQuantity('${product.id}', -1)">-</button>
                            <input class="quantity-input text-center" style="width: 60px;" value="${product.quantity}" min="0" max="1000" data-id="${product.id}" onchange="updateQuantityFromInput(this)">
                            <button class="quantity-modify increase ml-2" onclick="modifyQuantity('${product.id}', 1)">+</button>
                        </div>
                            <div class="custom-price-margin" style="width: 150px;">Price: $${(product.price * product.quantity).toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        cartBody.appendChild(row);
        subtotal += product.price * product.quantity;
    });

    calculateAndDisplayTotals(subtotal, subtotalPriceId, tpsPriceId, tvqPriceId, totalPriceId, cartCountId);
};

// Fonction pour calculer et afficher les totaux
const calculateAndDisplayTotals = (subtotal, subtotalPriceId, tpsPriceId, tvqPriceId, totalPriceId, cartCountId) => {
    const tpsRate = 0.05; // 5% GST
    const tvqRate = 0.09975; // 9.975% QST
    const tps = subtotal * tpsRate;
    const tvq = subtotal * tvqRate;
    const total = subtotal + tps + tvq;

    document.getElementById(subtotalPriceId).textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById(tpsPriceId).textContent = `$${tps.toFixed(2)}`;
    document.getElementById(tvqPriceId).textContent = `$${tvq.toFixed(2)}`;
    document.getElementById(totalPriceId).textContent = `$${total.toFixed(2)}`;
    document.getElementById(cartCountId).textContent = cart.reduce((acc, product) => acc + product.quantity, 0);
};

// Fonction pour modifier la quantité des produits dans le panier
const modifyQuantity = (productId, change) => {
    const product = cart.find(p => p.id === productId);
    if (product) {
        product.quantity += change;

        if (product.quantity > 0) {
            if (timeouts[productId]) {
                clearTimeout(timeouts[productId]);
                delete timeouts[productId];
            }
        } else {
            product.quantity = 0;
            if (!timeouts[productId]) {
                timeouts[productId] = setTimeout(() => {
                    if (product.quantity === 0) {
                        cart = cart.filter(p => p.id !== productId);
                        delete timeouts[productId];
                        updateCartUI();
                    }
                }, 3000);
            }
        }
        updateCartUI();
    }
};

// Fonction pour mettre à jour la quantité en fonction de l'entrée utilisateur
const updateQuantityFromInput = (input) => {
    const productId = input.getAttribute('data-id');
    const quantity = parseInt(input.value) || 0;
    const product = cart.find(p => p.id === productId);
    if (product) {
        product.quantity = Math.max(0, Math.min(1000, quantity));

        if (timeouts[productId]) {
            clearTimeout(timeouts[productId]);
            delete timeouts[productId];
        }

        if (product.quantity === 0) {
            timeouts[productId] = setTimeout(() => {
                if (product.quantity === 0) {
                    cart = cart.filter(p => p.id !== productId);
                    delete timeouts[productId];
                    updateCartUI();
                }
            }, 3000);
        }

        updateCartUI();
    }
};
