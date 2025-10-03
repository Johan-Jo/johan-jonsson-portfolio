const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Replace with your actual Resend API key
const RESEND_API_KEY = 're_dzaHtLCw_AkJ3bCDWo5NbBpyQNLH4jaXr';

app.post('/send-email', async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: ['hej@johan.com.br'],
        subject: 'New Vet Appointment Request',
        html: `
          <h2>New Appointment Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong> ${message || 'No message provided'}</p>
          <p><em>Sent from Family Vet Clinic website</em></p>
        `
      })
    });

    const responseData = await response.json();
    
    if (response.ok) {
      console.log('Email sent successfully:', responseData);
      res.json({ success: true, message: 'Email sent successfully', data: responseData });
    } else {
      console.error('Email failed:', responseData);
      throw new Error(`Email failed: ${JSON.stringify(responseData)}`);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
