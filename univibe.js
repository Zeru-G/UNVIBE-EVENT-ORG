// ── DOM REFERENCES ────────────────────────────────────────────────
const hamburgerBtn = document.getElementById('hamburger');
const navMenu = document.getElementById('navLinks');
const ticketButtons = document.querySelectorAll('[data-ticket]');
const ticketSelect = document.getElementById('ticketType');
const quantityInput = document.getElementById('quantity');
const totalPriceDisplay = document.getElementById('totalPrice');
const bookingForm = document.getElementById('bookingForm');
const paymentSection = document.getElementById('paymentSection');
const confirmationSection = document.getElementById('confirmationSection');
const newBookingBtn = document.getElementById('newBookingBtn');
const phoneInput = document.getElementById('phone');
const emailInput = document.getElementById('email');
const fullNameInput = document.getElementById('fullName');

// ── UTILITY: UPDATE TOTAL PRICE ───────────────────────────────────
function updateTotalPrice() {
  const ticketType = ticketSelect.value;
  const quantity = parseInt(quantityInput.value) || 1;
  const price = ticketType === 'regular' ? 150 : ticketType === 'vip' ? 300 : 500;
  totalPriceDisplay.textContent = price * quantity;
}

// ── EVENT: MOBILE NAV ─────────────────────────────────────────────
hamburgerBtn?.addEventListener('click', () => {
  navMenu?.classList.toggle('active');
});

// ── EVENT: TICKET BUTTONS ─────────────────────────────────────────
ticketButtons.forEach(button => {
  button.addEventListener('click', () => {
    ticketSelect.value = button.getAttribute('data-ticket');
    updateTotalPrice();
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
    navMenu?.classList.remove('active');
  });
});

// ── EVENT: PRICE UPDATE ───────────────────────────────────────────
ticketSelect?.addEventListener('change', updateTotalPrice);
quantityInput?.addEventListener('input', updateTotalPrice);
updateTotalPrice();

// ── INPUT VALIDATION ──────────────────────────────────────────────
// Full Name: letters, spaces, hyphens, apostrophes
fullNameInput?.addEventListener('input', function(e) {
  e.target.value = e.target.value.replace(/[^a-zA-Z\s\-']/g, '');
});

fullNameInput?.addEventListener('paste', function(e) {
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData('text');
  const clean = text.replace(/[^a-zA-Z\s\-']/g, '');
  document.execCommand('insertHTML', false, clean);
});

// Phone: Ethiopian +251, digits only
phoneInput?.addEventListener('input', function(e) {
  let value = e.target.value.replace(/[^0-9+]/g, '');
  if (!value.startsWith('+251')) value = '+251';
  if (value.length > 13) value = value.slice(0, 13);
  e.target.value = value;
});

phoneInput?.addEventListener('keydown', function(e) {
  const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End','Enter'];
  if (allowed.includes(e.key)) return;
  if (e.key === '+' && this.selectionStart === 0 && !this.value.includes('+')) return;
  if (!/^\d$/.test(e.key)) e.preventDefault();
});

// Email: basic cleanup
emailInput?.addEventListener('paste', function(e) {
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData('text');
  const clean = text.replace(/[^\w@.\-+_]/g, '');
  document.execCommand('insertHTML', false, clean);
});

// ── FORM SUBMISSION ───────────────────────────────────────────────
bookingForm?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const fullName = fullNameInput.value.trim();
  const phone = phoneInput.value.trim();
  const email = emailInput.value.trim();
  const ticket = ticketSelect.value;
  const qty = parseInt(quantityInput.value);
  
  if (!fullName || !phone || !email || !ticket || qty < 1) {
    alert('⚠️ Please fill all required fields.');
    return;
  }

  const booking = { fullName, phone, email, ticket, quantity: qty };
  localStorage.setItem('currentBooking', JSON.stringify(booking));

  this.classList.add('hidden');
  paymentSection.classList.remove('hidden');
  paymentSection.scrollIntoView({ behavior: 'smooth' });
});

// ── COPY TO CLIPBOARD ─────────────────────────────────────────────
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('copy-btn')) {
    const id = e.target.getAttribute('data-target');
    const text = document.getElementById(id)?.innerText;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      const toast = document.getElementById('copyToast');
      if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 1500);
      }
    }).catch(() => alert('⚠️ Could not copy. Please try manually.'));
  }
});

// ── SCAN & PAY → 5s LOADING ───────────────────────────────────────
document.addEventListener('click', function(e) {
  if (!e.target.classList.contains('scan-btn')) return;

  const booking = JSON.parse(localStorage.getItem('currentBooking'));
  if (!booking) return alert('❌ No booking found.');

  const overlay = document.getElementById('loadingOverlay');
  const progress = document.getElementById('loadingProgress');
  
  overlay?.classList.add('active');
  if (progress) progress.style.width = '0%';

  // Simulate 5s payment check
  let p = 0;
  const interval = setInterval(() => {
    p += 1;
    if (p > 100) p = 100;
    if (progress) progress.style.width = `${p}%`;
  }, 50);

  setTimeout(() => {
    clearInterval(interval);
    overlay?.classList.remove('active');

    const ticketNames = { 
      regular: '🎓 Student Pass', 
      vip: '👔 Faculty & Staff', 
      vvip: '🌟 VIP Experience' 
    };
    const priceMap = { regular: 150, vip: 300, vvip: 500 };
    const total = booking.quantity * priceMap[booking.ticket];

    document.getElementById('confName').textContent = booking.fullName;
    document.getElementById('confPhone').textContent = booking.phone;
    document.getElementById('confEmail').textContent = booking.email;
    document.getElementById('confTicket').textContent = ticketNames[booking.ticket];
    document.getElementById('confQty').textContent = booking.quantity;
    document.getElementById('confTotal').textContent = total;

    paymentSection.classList.add('hidden');
    confirmationSection.classList.remove('hidden');
    confirmationSection.scrollIntoView({ behavior: 'smooth' });
  }, 5000);
});

// ── NEW BOOKING ───────────────────────────────────────────────────
newBookingBtn?.addEventListener('click', () => {
  bookingForm.reset();
  bookingForm.classList.remove('hidden');
  confirmationSection.classList.add('hidden');
  updateTotalPrice();
});

// ── SMOOTH SCROLL ─────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 80,
        behavior: 'smooth'
      });
      navMenu?.classList.remove('active');
    }
  });
});