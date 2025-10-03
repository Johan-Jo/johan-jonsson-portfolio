# Family Vet Clinic Landing Page

A professional, modern landing page for a veterinary clinic with appointment booking functionality and email integration.

## 🏥 Features

- **Professional Design**: Blue and white color scheme with modern, trustworthy layout
- **Appointment Booking**: Contact form with email integration via Resend
- **Services & Pricing**: Showcase veterinary services with clear pricing
- **Testimonials**: Customer reviews with photos
- **Contact & Map**: Embedded Google Maps with clinic location
- **Responsive Design**: Works on all devices
- **Sticky Navigation**: Easy access to all sections

## 🚀 Quick Start

### Prerequisites
- Node.js (for email server)
- Live Server extension (for frontend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Johan-Jo/family-vet-clinic.git
   cd family-vet-clinic
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up email (optional)**
   - Get a Resend API key from [resend.com](https://resend.com)
   - Replace `YOUR_RESEND_API_KEY_HERE` in `server.js` with your actual API key

4. **Start the servers**

   **Email Server:**
   ```bash
   npm start
   ```

   **Frontend (using Live Server):**
   - Open `index.html` in VS Code
   - Install Live Server extension
   - Click "Go Live"

## 📧 Email Configuration

The project uses Resend for email delivery:

- **From**: `onboarding@resend.dev`
- **To**: `hej@johan.com.br`
- **Subject**: "New Vet Appointment Request"

To change the recipient email, update the `to` field in `server.js`.

## 🗂️ Project Structure

```
family-vet-clinic/
├── index.html              # Main landing page
├── confirmation.html       # Appointment confirmation page
├── server.js              # Email server (Node.js/Express)
├── package.json           # Dependencies
├── test-email.js          # Email testing utility
├── vet-images/            # Veterinary service images
├── reviews/               # Customer testimonial photos
└── README.md             # This file
```

## 🌐 Live Demo

- **Frontend**: http://127.0.0.1:5500/index.html (with Live Server)
- **Email Server**: http://localhost:3001

## 🎨 Design Features

- **Color Palette**: Professional blue (#0a67b1) and white
- **Typography**: System fonts for optimal performance
- **Layout**: CSS Grid and Flexbox for responsive design
- **Images**: Optimized web images for fast loading

## 📱 Responsive Design

The site is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All major browsers

## 🔧 Customization

### Changing Clinic Information
Update these files:
- `index.html`: Clinic name, address, phone number
- `server.js`: Email recipient address

### Adding Services
Edit the services section in `index.html` and add corresponding images to `vet-images/`.

### Modifying Colors
Update CSS custom properties in the `<style>` section of `index.html`.

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues and pull requests to improve the project.

## 📞 Support

For questions or support, please contact the development team.

