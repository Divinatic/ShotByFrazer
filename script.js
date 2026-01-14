// Booking form
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(bookingForm).entries());
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(formData)
    });
    const result = await res.json();
    document.getElementById('status').textContent = result.success
      ? "Booking sent! I’ll contact you soon."
      : "Error sending booking.";
    bookingForm.reset();
  });
}

// Owner login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(loginForm).entries());
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      loginForm.style.display = 'none';
      document.getElementById('bookingsList').style.display = 'block';
      const token = result.token;
      const bookingsRes = await fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const bookings = await bookingsRes.json();
      const tbody = document.getElementById('bookingTable');
      tbody.innerHTML = bookings.map(b => 
        `<tr>
          <td>${b.name}</td>
          <td>${b.email}</td>
          <td>${b.date}</td>
          <td>${b.time}</td>
          <td>${b.message || ''}</td>
        </tr>`).join('');
    } else {
      alert(result.message);
    }
  });
}

