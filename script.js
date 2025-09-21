document.addEventListener("DOMContentLoaded", () => {

  // NAV MENU TOGGLE
  function toggleMenu() {
    document.getElementById("navMenu").classList.toggle("active");
    document.querySelector(".hamburger").classList.toggle("open");
  }
  window.toggleMenu = toggleMenu;

  document.querySelectorAll("#navMenu a").forEach(link => {
    link.addEventListener("click", () => {
      document.getElementById("navMenu").classList.remove("active");
      document.querySelector(".hamburger").classList.remove("open");
    });
  });

  // Intersection Observer for services
  const services = document.querySelectorAll('.service');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  services.forEach(service => observer.observe(service));

  // STAR RATING
  const ratings = document.querySelectorAll('.rating');
  ratings.forEach(rating => {
    const stars = rating.textContent.trim().split(' ');
    rating.innerHTML = '';
    stars.forEach((star, index) => {
      const span = document.createElement('span');
      span.textContent = '★';
      span.style.cursor = 'pointer';
      span.addEventListener('click', () => {
        rating.dataset.rating = index + 1;
        updateStars(rating);
      });
      rating.appendChild(span);
    });
    updateStars(rating);
  });

  function updateStars(rating) {
    const value = parseInt(rating.dataset.rating);
    rating.childNodes.forEach((star, index) => {
      star.style.color = index < value ? 'gold' : '#ccc';
    });
  }

  // PAGINATION
  const products = Array.from(document.querySelectorAll('.product-card'));
  const productsPerPage = 12;
  let currentPage = 1;

  function showPage(page) {
    const start = (page - 1) * productsPerPage;
    const end = start + productsPerPage;
    products.forEach((product, index) => {
      product.style.display = (index >= start && index < end) ? 'block' : 'none';
    });
    currentPage = page;
    updatePaginationButtons();
  }

  function updatePaginationButtons() {
    document.querySelectorAll('.page-btn').forEach(btn => {
      btn.classList.toggle('active', Number(btn.dataset.page) === currentPage);
    });
  }

  document.getElementById('prev').addEventListener('click', () => {
    if (currentPage > 1) showPage(currentPage - 1);
  });
  document.getElementById('next').addEventListener('click', () => {
    if (currentPage < Math.ceil(products.length / productsPerPage)) showPage(currentPage + 1);
  });
  document.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => showPage(Number(btn.dataset.page)));
  });

  showPage(1);

  // CART SETUP
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartItemsDiv = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const closeCartBtn = document.getElementById("close-cart");

  const sizes = ["S", "M", "L", "XL", "XXL"];
  const colors = ["Product color","White", "Black", "Yellow", "Red"];

  // CREATE SIZE, COLOR, AND QUANTITY INPUTS
  products.forEach(card => {
    const btn = card.querySelector('.add-to-cart');

    const variantWrapper = document.createElement('div');
    variantWrapper.className = 'variant-wrapper';

    const sizeLabel = document.createElement('label');
    sizeLabel.textContent = "Size:";
    const sizeSelect = document.createElement('select');
    sizeSelect.className = 'product-size';
    sizes.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      sizeSelect.appendChild(opt);
    });

    const colorLabel = document.createElement('label');
    colorLabel.textContent = "Color:";
    const colorSelect = document.createElement('select');
    colorSelect.className = 'product-color';
    colors.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      colorSelect.appendChild(opt);
    });

    const qtyLabel = document.createElement('label');
    qtyLabel.textContent = "Qty:";
    const qtyInput = document.createElement('input');
    qtyInput.type = "number";
    qtyInput.min = 1;
    qtyInput.value = 1;
    qtyInput.className = "product-quantity";

    variantWrapper.appendChild(sizeLabel);
    variantWrapper.appendChild(sizeSelect);
    variantWrapper.appendChild(colorLabel);
    variantWrapper.appendChild(colorSelect);
    variantWrapper.appendChild(qtyLabel);
    variantWrapper.appendChild(qtyInput);

    card.insertBefore(variantWrapper, btn);
  });

  // ADD TO CART
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
      const card = button.closest('.product-card');
      const size = card.querySelector('.product-size').value;
      const color = card.querySelector('.product-color').value;
      const qty = parseInt(card.querySelector('.product-quantity').value);

      const product = {
        id: card.dataset.id,
        name: card.dataset.name,
        price: parseFloat(card.dataset.price),
        quantity: qty,
        size: size,
        color: color,
        image: card.querySelector('img').src
      };

      const existing = cart.find(item => item.id === product.id && item.size === size && item.color === color);
      if (existing) {
        existing.quantity += qty;
      } else {
        cart.push(product);
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartUI();
      showToast(`${product.name} (${size}, ${color}) x${qty} added to cart!`);

      cartSidebar.classList.add("active");
      cartOverlay.classList.add("active");
    });
  });

  // CART UI
  function updateCartUI() {
    cartItemsDiv.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      total += item.price * item.quantity;

      const div = document.createElement("div");
      div.classList.add("cart-item");
      div.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${item.image}" alt="${item.name}" style="width:50px;height:50px;object-fit:cover;border-radius:5px;">
          <div style="flex:1">
            <p>${item.name}</p>
            <p>$${item.price} x ${item.quantity}</p>
            <p>Size: ${item.size}</p>
            <p>Color: ${item.color}</p>
          </div>
          <button class="remove-item" data-index="${index}">✖</button>
        </div>
      `;
      cartItemsDiv.appendChild(div);
    });

    cartTotal.textContent = `Total: $${total.toFixed(2)}`;

    document.querySelectorAll(".remove-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = btn.dataset.index;
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartUI();
      });
    });
  }

  // CART SIDEBAR
  closeCartBtn.addEventListener("click", () => {
    cartSidebar.classList.remove("active");
    cartOverlay.classList.remove("active");
  });
  cartOverlay.addEventListener("click", () => {
    cartSidebar.classList.remove("active");
    cartOverlay.classList.remove("active");
  });

  // CHECKOUT
  document.getElementById("checkout-btn").addEventListener("click", () => {
    if(cart.length === 0){
      showToast("Your cart is empty!");
      return;
    }
    window.location.href = "payment.html";
  });
  
  // TOAST
  function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = "toast show";
    setTimeout(() => { toast.className = "toast"; }, 3000);
  }

  // CONTACT FORM
  document.getElementById("contactForm")?.addEventListener("submit", function(e){
    e.preventDefault();
    alert("✅ Your message has been sent!");
    this.reset();
  });


  
  const popup = document.getElementById("image-popup");
  const popupImg = document.getElementById("popup-img");
  const closePopupBtn = document.querySelector(".close-popup");

  if (popup && popupImg && closePopupBtn) {
    document.querySelectorAll(".product-card img").forEach(img => {
      img.addEventListener("click", () => {
        popupImg.src = img.src;
        popup.classList.add("active");
        document.body.classList.add("modal-open");
      });
    });

    closePopupBtn.addEventListener("click", () => {
      popup.classList.remove("active");
      popupImg.src = "";
      document.body.classList.remove("modal-open");
    });

    popup.addEventListener("click", (e) => {
      if (e.target === popup) {
        popup.classList.remove("active");
        popupImg.src = "";
        document.body.classList.remove("modal-open");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        popup.classList.remove("active");
        popupImg.src = "";
        document.body.classList.remove("modal-open");
      }
    });
  }
  /* ===========================
     IMAGE POPUP CODE ENDS HERE
     =========================== */

}); 



const cardBtn = document.getElementById("pay-card-btn");
const internetBtn = document.getElementById("pay-internet-btn");

const cardForm = document.querySelector(".card-payment");
const internetForm = document.querySelector(".internet-banking");

cardBtn.addEventListener("click", () => {
  cardBtn.classList.add("active");
  internetBtn.classList.remove("active");

  cardForm.classList.add("form-active");
  cardForm.classList.remove("form-hidden");

  internetForm.classList.add("form-hidden");
  internetForm.classList.remove("form-active");
});

internetBtn.addEventListener("click", () => {
  internetBtn.classList.add("active");
  cardBtn.classList.remove("active");

  internetForm.classList.add("form-active");
  internetForm.classList.remove("form-hidden");

  cardForm.classList.add("form-hidden");
  cardForm.classList.remove("form-active");
});

// FUNCTION TO RENDER ORDER SUMMARY
function renderOrderSummary() {
  const orderDetails = document.getElementById("order-details");
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  let total = 0;

  if (cart.length === 0) {
    orderDetails.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  orderDetails.innerHTML = "";

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    const itemDiv = document.createElement("div");
    itemDiv.innerHTML = `
      <p><strong>${item.name}</strong> x ${item.quantity}</p>
      <p>Size: ${item.size}, Color: ${item.color}</p>
      <p>Price: $${(item.price * item.quantity).toFixed(2)}</p>
      <input type="number" min="1" value="${item.quantity}" class="update-qty" data-index="${index}" style="width:50px;margin-bottom:10px;">
      <hr>
    `;
    orderDetails.appendChild(itemDiv);
  });

  const totalDiv = document.createElement("div");
  totalDiv.innerHTML = `<p><strong>Total: $${total.toFixed(2)}</strong></p>`;
  orderDetails.appendChild(totalDiv);

  document.querySelectorAll(".update-qty").forEach(input => {
    input.addEventListener("change", e => {
      const idx = e.target.dataset.index;
      let newQty = parseInt(e.target.value);
      if (newQty < 1) newQty = 1;
      cart[idx].quantity = newQty;
      localStorage.setItem("cart", JSON.stringify(cart));
      renderOrderSummary();
    });
  });
}

renderOrderSummary();

function renderOrderSummary() {
  const orderDetails = document.getElementById("order-details");
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  let total = 0;

  if (cart.length === 0) {
    orderDetails.innerHTML = "<p>Your cart is empty.</p>";
    window.cartTotal = 0; // make sure it resets if cart is empty
    return;
  }

  orderDetails.innerHTML = "";

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    const itemDiv = document.createElement("div");
    itemDiv.innerHTML = `
      <p><strong>${item.name}</strong> x ${item.quantity}</p>
      <p>Size: ${item.size}, Color: ${item.color}</p>
      <p>Price: $${(item.price * item.quantity).toFixed(2)}</p>
      <input type="number" min="1" value="${item.quantity}" class="update-qty" data-index="${index}" style="width:50px;margin-bottom:10px;">
      <hr>
    `;
    orderDetails.appendChild(itemDiv);
  });

  const totalDiv = document.createElement("div");
  totalDiv.innerHTML = `<p><strong>Total: $${total.toFixed(2)}</strong></p>`;
  orderDetails.appendChild(totalDiv);

  // ⭐ Save total globally so payment buttons can use it
  window.cartTotal = total;

  document.querySelectorAll(".update-qty").forEach(input => {
    input.addEventListener("change", e => {
      const idx = e.target.dataset.index;
      let newQty = parseInt(e.target.value);
      if (newQty < 1) newQty = 1;
      cart[idx].quantity = newQty;
      localStorage.setItem("cart", JSON.stringify(cart));
      renderOrderSummary();
    });
  });
}

document.getElementById("pay-now-btn")?.addEventListener("click", () => {
  const cardInputs = document.querySelectorAll(".card-payment input");
  let allFilled = true;

  cardInputs.forEach(input => {
    if (!input.value.trim()) {
      allFilled = false;
    }
  });

  if (!allFilled) {
    alert("⚠️ Please fill in all card details before proceeding.");
    return;
  }

  alert(`✅ Card payment successful! Amount Paid: $${window.cartTotal.toFixed(2)}`);

  localStorage.removeItem("cart");
  window.cartTotal = 0;
  renderOrderSummary();
});
document.getElementById("internet-pay-btn")?.addEventListener("click", () => {
  const bankSelect = document.querySelector(".internet-banking .bank-select");
  const accountInput = document.querySelector(".internet-banking input[type='text']");

  if (!bankSelect || !accountInput) {
    alert("⚠️ Internet banking form not found in DOM.");
    return;
  }

  if (!bankSelect.value || !accountInput.value.trim()) {
    alert("⚠️ Please select a bank and enter your account/email.");
    return;
  }

  if (!window.cartTotal || window.cartTotal <= 0) {
    alert("⚠️ Your cart is empty.");
    return;
  }

  alert(`✅ Internet Banking payment successful! Amount Paid: $${window.cartTotal.toFixed(2)}`);

  
  localStorage.removeItem("cart");
  window.cartTotal = 0;
  renderOrderSummary();
});

