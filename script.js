const WHATSAPP_NUMBER = "60123456789"; 

let products = JSON.parse(localStorage.getItem('products')) || [];
let promoText = localStorage.getItem('promoText') || "Diskaun 20% untuk semua koleksi jalanan.";
let heroImage = localStorage.getItem('heroImage') || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80";

let cart = [];
let uploadedHeroBase64 = "";
let uploadedImageBase64 = "";
let uploadedEditImageBase64 = "";

// ==========================================
// TOAST NOTIFICATION
// ==========================================
function showToast(message) {
    const toastBox = document.getElementById('toast-box');
    if (!toastBox) return; 
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.innerHTML = message;
    toastBox.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3500);
}

// ==========================================
// FUNGSI KEDAI (RENDER)
// ==========================================
function renderHeroAndPromo() {
    const promoEl = document.getElementById('promo-text');
    if(promoEl) promoEl.innerText = promoText;
    const heroSection = document.getElementById('hero-section');
    if(heroSection) heroSection.style.backgroundImage = `url('${heroImage}')`;
}

function renderProducts() {
    const grid = document.getElementById('product-grid');
    if(!grid) return;
    
    grid.innerHTML = ""; 
    
    if (products.length === 0) {
        grid.innerHTML = "<p style='text-align:center; width:100%; color:#555; font-size:1.2rem; font-style:italic;'>Koleksi sedang dikemas kini...</p>";
        return;
    }

    products.forEach((product) => {
        const card = document.createElement('div');
        card.className = 'product-card reveal-up'; 
        card.innerHTML = `
            <div class="img-container">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <h3>${product.name}</h3>
            <p>RM ${product.price.toFixed(2)}</p>
            <select id="size-${product.id}">
                <option value="">-- PILIH SAIZ --</option>
                <option value="S">Saiz S</option>
                <option value="M">Saiz M</option>
                <option value="L">Saiz L</option>
                <option value="XL">Saiz XL</option>
            </select>
            <button class="btn-primary" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">TAMBAH KE TROLI</button>
        `;
        grid.appendChild(card);
    });
}

// ==========================================
// TROLI & CHECKOUT WHATSAPP
// ==========================================
function toggleCart() {
    const modal = document.getElementById('cart-modal');
    if(modal) modal.style.display = modal.style.display === "block" ? "none" : "block";
}

function addToCart(id, name, price) {
    const sizeSelect = document.getElementById(`size-${id}`);
    const selectedSize = sizeSelect.value;
    if (selectedSize === "") {
        showToast("⚠️ Sila pilih saiz terlebih dahulu!");
        return;
    }
    cart.push({ id, name, price, size: selectedSize });
    updateCartUI();
    showToast(`🛒 <strong>${name}</strong> ditambah ke troli!`);
    const modal = document.getElementById('cart-modal');
    if(modal && modal.style.display !== "block") toggleCart();
}

function updateCartUI() {
    const countEl = document.getElementById('cart-count');
    if(countEl) countEl.innerText = cart.length;
    const cartList = document.getElementById('cart-items');
    if(!cartList) return;
    
    cartList.innerHTML = "";
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        cartList.innerHTML += `
            <li style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <span style="display:block; font-weight:700;">${item.name}</span>
                    <span style="font-size:12px; color:#aaa; font-weight:400;">SAIZ: ${item.size}</span>
                </div>
                <div style="display:flex; align-items:center; gap:15px;">
                    <span style="font-weight:600;">RM ${item.price.toFixed(2)}</span>
                    <button style="color:#000; font-size:22px; border:none; background:none; cursor:pointer;" onclick="removeFromCart(${index})">×</button>
                </div>
            </li>`;
    });
    document.getElementById('cart-total').innerText = total.toFixed(2);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
    showToast("🗑️ Baju dibuang dari troli.");
}

function checkoutWhatsApp() {
    if (cart.length === 0) {
        showToast("⚠️ Troli anda masih kosong!");
        return;
    }
    let message = "Hi Wibu Style, saya ingin membuat pesanan:\n\n";
    let total = 0;
    cart.forEach((item, i) => {
        message += `${i+1}. ${item.name} (Saiz: ${item.size}) - RM ${item.price.toFixed(2)}\n`;
        total += item.price;
    });
    message += `\n*TOTAL: RM ${total.toFixed(2)}*\n\nBoleh saya tahu cara pembayaran?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
}

// ==========================================
// FUNGSI ADMIN
// ==========================================
function checkLogin() {
    const pass = document.getElementById('admin-password').value;
    if (pass === "admin123") { 
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'block';
        showToast("🔓 Log masuk berjaya!");
        renderAdminProducts();
    } else {
        showToast("❌ Kata laluan salah!");
    }
}

function updatePromo() {
    const newPromo = document.getElementById('admin-promo-input').value;
    if (newPromo.trim() !== "") {
        localStorage.setItem('promoText', newPromo);
        showToast("✅ Banner promosi berjaya dikemas kini!");
        document.getElementById('admin-promo-input').value = "";
    }
}

function updateHeroImage() {
    if (uploadedHeroBase64 !== "") {
        localStorage.setItem('heroImage', uploadedHeroBase64);
        showToast("✅ Gambar depan (Hero) berjaya ditukar!");
        document.getElementById('hero-image-file').value = "";
        document.getElementById('hero-preview').style.display = "none";
        uploadedHeroBase64 = "";
    } else {
        showToast("⚠️ Sila pilih gambar terlebih dahulu.");
    }
}

function addProduct() {
    const name = document.getElementById('new-name').value;
    const price = parseFloat(document.getElementById('new-price').value);

    if (name && price && uploadedImageBase64 !== "") {
        const newProduct = { id: Date.now(), name: name, price: price, image: uploadedImageBase64 };
        products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(products));
        
        showToast("🎉 Baju baharu berjaya ditambah!");
        document.getElementById('new-name').value = "";
        document.getElementById('new-price').value = "";
        document.getElementById('new-image-file').value = "";
        document.getElementById('image-preview').style.display = "none";
        uploadedImageBase64 = "";
        renderAdminProducts();
    } else {
        showToast("⚠️ Sila lengkapkan Nama, Harga dan Gambar!");
    }
}

function renderAdminProducts() {
    const list = document.getElementById('admin-product-list');
    if(!list) return;
    list.innerHTML = "";
    if(products.length === 0) {
        list.innerHTML = "<p style='color:gray; font-size: 14px;'>Tiada baju untuk diuruskan.</p>";
        return;
    }
    products.forEach((product, index) => {
        list.innerHTML += `
            <li class="reveal-up" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:15px;">
                <div style="display:flex; align-items:center; gap:15px;">
                    <img src="${product.image}" style="width:50px; height:50px; object-fit:cover;">
                    <span style="font-weight:600; font-size:14px;">${product.name} <br> <span>RM ${product.price.toFixed(2)}</span></span>
                </div>
                <div style="display:flex; gap:10px;">
                    <button style="background-color:#000; color:white; border:none; padding:8px 15px; font-weight:bold; cursor:pointer; font-size:12px;" onclick="editProduct(${index})">EDIT</button>
                    <button style="background-color:#d90429; color:white; border:none; padding:8px 15px; font-weight:bold; cursor:pointer; font-size:12px;" onclick="deleteProduct(${index})">PADAM</button>
                </div>
            </li>
        `;
    });
}

function editProduct(index) {
    const product = products[index];
    document.getElementById('edit-index').value = index;
    document.getElementById('edit-name').value = product.name;
    document.getElementById('edit-price').value = product.price;
    document.getElementById('edit-image-preview').src = product.image;
    document.getElementById('edit-id-label').innerText = product.name;
    
    uploadedEditImageBase64 = ""; 
    document.getElementById('edit-image-file').value = "";
    
    const editSection = document.getElementById('edit-section');
    editSection.style.display = 'block';
    window.scrollTo({ top: editSection.offsetTop - 50, behavior: 'smooth' });
}

function cancelEdit() {
    document.getElementById('edit-section').style.display = 'none';
}

function saveEdit() {
    const index = document.getElementById('edit-index').value;
    const newName = document.getElementById('edit-name').value;
    const newPrice = parseFloat(document.getElementById('edit-price').value);
    
    if (newName && newPrice) {
        products[index].name = newName;
        products[index].price = newPrice;
        if (uploadedEditImageBase64 !== "") products[index].image = uploadedEditImageBase64;
        
        localStorage.setItem('products', JSON.stringify(products));
        showToast("✅ Baju berjaya dikemas kini!");
        document.getElementById('edit-section').style.display = 'none';
        renderAdminProducts();
    } else {
        showToast("⚠️ Sila isikan Nama dan Harga dengan betul!");
    }
}

function deleteProduct(index) {
    if(confirm("Anda pasti mahu memadam baju ini secara kekal?")) {
        products.splice(index, 1);
        localStorage.setItem('products', JSON.stringify(products));
        renderAdminProducts();
        document.getElementById('edit-section').style.display = 'none';
        showToast("🗑️ Baju dipadam!");
    }
}

function resetData() {
    if(confirm("AWAS: Padam semua data dan kembali ke asal?")) {
        localStorage.clear();
        sessionStorage.clear();
        location.reload();
    }
}

// ==========================================
// AUTO-COMPRESS GAMBAR (HD WEBP)
// ==========================================
function compressImage(file, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const MAX_WIDTH = 1200; 
            if (width > MAX_WIDTH) { height = Math.round((height *= MAX_WIDTH / width)); width = MAX_WIDTH; }
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/webp', 0.85); 
            callback(compressedBase64);
        }
    };
}

// ==========================================
// ANIMASI SKROL ULTRA-SMOOTH (GAYA BIKE BEAR)
// ==========================================
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -5% 0px', // Mula animasi bila ia masuk 5% dari bawah skrin
        threshold: 0
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    // Tetapkan Stagger (Masa Delay) pada Kotak Baju
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
        card.style.transitionDelay = `${(index % 3) * 0.15}s`;
        observer.observe(card);
    });
    
    // Tetapkan Delay untuk Lookbook
    const lookbookItems = document.querySelectorAll('.lookbook-item');
    lookbookItems.forEach((item, index) => {
        item.style.transitionDelay = `${(index % 2) * 0.2}s`;
        observer.observe(item);
    });

    // Perhatikan elemen biasa (Footer, Tajuk, Admin Box)
    const otherElements = document.querySelectorAll('.reveal-up:not(.product-card):not(.lookbook-item)');
    otherElements.forEach(el => observer.observe(el));
}

// ==========================================
// INIT LOAD UTAMA
// ==========================================
window.onload = function() {
    if (document.getElementById('product-grid')) {
        renderHeroAndPromo();
        renderProducts();
    }

    if (document.getElementById('login-section')) {
        if(sessionStorage.getItem('isAdminLoggedIn') === 'true') {
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('dashboard-section').style.display = 'block';
            renderAdminProducts(); 
        }

        const attachImageUploader = (inputId, previewId, callback) => {
            const el = document.getElementById(inputId);
            if(el) {
                el.addEventListener('change', e => {
                    if (e.target.files[0]) {
                        compressImage(e.target.files[0], data => {
                            document.getElementById(previewId).src = data;
                            document.getElementById(previewId).style.display = "block";
                            callback(data);
                        });
                    }
                });
            }
        };

        attachImageUploader('hero-image-file', 'hero-preview', data => uploadedHeroBase64 = data);
        attachImageUploader('new-image-file', 'image-preview', data => uploadedImageBase64 = data);
        attachImageUploader('edit-image-file', 'edit-image-preview', data => uploadedEditImageBase64 = data);
    }

    // Panggil Animasi Scroll Selepas Semua Elemen Telah Sedia Di-Render
    setTimeout(() => {
        initScrollAnimations();
    }, 100);
};