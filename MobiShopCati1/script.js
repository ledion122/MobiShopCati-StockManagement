// Store inventory data
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
const ADMIN_PASSWORD = "admin123"; // Admin password

// Initialize the application
function init() {
    displayInventory();
    updateSaleProductOptions();
}

// Show notification
function showNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'success-message';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Check admin password
function checkAdminPassword() {
    const password = prompt("Ju lutem vendosni fjalëkalimin e administratorit:");
    return password === ADMIN_PASSWORD;
}

// Show/hide sections with animation
function showSection(sectionId) {
    if (sectionId === 'addProduct' || sectionId === 'sales') {
        if (!checkAdminPassword()) {
            alert("Fjalëkalim i gabuar! Aksesi u mohua.");
            showInventory();
            return;
        }
    }

    const sections = ['inventory', 'addProduct', 'sales'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (id === sectionId) {
            section.classList.remove('hidden');
            section.style.opacity = '0';
            setTimeout(() => section.style.opacity = '1', 10);
        } else {
            section.style.opacity = '0';
            setTimeout(() => section.classList.add('hidden'), 300);
        }
    });
}

function showInventory() {
    showSection('inventory');
}

function showAddProduct() {
    showSection('addProduct');
}

function showSales() {
    showSection('sales');
    updateSaleProductOptions();
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('sq-AL', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

// Display inventory
function displayInventory() {
    const inventoryList = document.getElementById('inventoryList');
    inventoryList.innerHTML = '';

    if (inventory.length === 0) {
        inventoryList.innerHTML = `
            <div class="inventory-item" style="grid-column: 1 / -1; text-align: center;">
                <p>Nuk ka produkte në inventar. Shtoni produkte për të filluar!</p>
            </div>
        `;
        return;
    }

    inventory.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        itemElement.innerHTML = `
            <div class="details">
                <h3>${item.name}</h3>
                <div class="price">${formatCurrency(item.price)}</div>
            </div>
            <div class="stock ${item.quantity < 5 ? 'low-stock' : ''}">
                ${item.quantity < 5 ? '⚠️ Stok i Ulët: ' : '📦 Në Stok: '}${item.quantity}
            </div>
        `;
        inventoryList.appendChild(itemElement);
    });
}

// Add new product
document.getElementById('addProductForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!checkAdminPassword()) {
        alert("Fjalëkalim i gabuar! Veprimi u anulua.");
        return;
    }
    
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('productQuantity').value);

    if (name === '') {
        alert('Ju lutem vendosni një emër të vlefshëm produkti');
        return;
    }

    if (price <= 0) {
        alert('Ju lutem vendosni një çmim të vlefshëm');
        return;
    }

    if (quantity < 0) {
        alert('Ju lutem vendosni një sasi të vlefshme');
        return;
    }

    const existingProductIndex = inventory.findIndex(item => 
        item.name.toLowerCase() === name.toLowerCase()
    );

    if (existingProductIndex !== -1) {
        if (confirm('Ky produkt ekziston tashmë. Dëshironi të përditësoni sasinë?')) {
            inventory[existingProductIndex].quantity += quantity;
            if (price !== inventory[existingProductIndex].price) {
                if (confirm('Dëshironi të përditësoni edhe çmimin?')) {
                    inventory[existingProductIndex].price = price;
                }
            }
        }
    } else {
        inventory.push({ name, price, quantity });
    }

    localStorage.setItem('inventory', JSON.stringify(inventory));
    
    displayInventory();
    updateSaleProductOptions();
    this.reset();
    showInventory();
    showNotification('Produkti u shtua me sukses në inventar!');
});

// Update sale product options
function updateSaleProductOptions() {
    const select = document.getElementById('saleProduct');
    select.innerHTML = '<option value="">Zgjidh një produkt</option>';
    
    inventory.forEach((item, index) => {
        if (item.quantity > 0) {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${item.name} (${formatCurrency(item.price)}) - ${item.quantity} në stok`;
            select.appendChild(option);
        }
    });
}

// Process sale
document.getElementById('saleForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!checkAdminPassword()) {
        alert("Fjalëkalim i gabuar! Veprimi u anulua.");
        return;
    }
    
    const productIndex = document.getElementById('saleProduct').value;
    const quantity = parseInt(document.getElementById('saleQuantity').value);
    
    if (productIndex === '') {
        alert('Ju lutem zgjidhni një produkt');
        return;
    }

    if (isNaN(quantity) || quantity <= 0) {
        alert('Ju lutem vendosni një sasi të vlefshme');
        return;
    }

    if (inventory[productIndex].quantity < quantity) {
        alert('Nuk ka stok të mjaftueshëm');
        return;
    }

    inventory[productIndex].quantity -= quantity;
    localStorage.setItem('inventory', JSON.stringify(inventory));
    
    const totalPrice = inventory[productIndex].price * quantity;
    showNotification(`Shitja u krye me sukses! Totali: ${formatCurrency(totalPrice)}`);
    
    displayInventory();
    updateSaleProductOptions();
    this.reset();
    showInventory();
});

// Initialize the app when the page loads
window.addEventListener('load', init);

// Add smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});