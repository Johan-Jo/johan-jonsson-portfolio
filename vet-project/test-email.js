const fetch = require('node-fetch');

// Test email function
async function testEmail() {
  try {
    console.log('Testing email sending...');
    
    const response = await fetch('http://localhost:3001/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User',
        phone: '0720123456',
        email: 'test@example.com',
        message: 'This is a test message'
      })
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response body:', result);
    
    if (response.ok) {
      console.log('✅ Email sent successfully!');
    } else {
      console.log('❌ Email failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEmail();


