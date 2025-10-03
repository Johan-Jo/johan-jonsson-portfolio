document.querySelectorAll('nav ul li a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Portfolio Filtering
document.querySelectorAll('.portfolio-categories .category-btn').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.portfolio-categories .category-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        const category = this.dataset.category;
        document.querySelectorAll('.portfolio-items .portfolio-item').forEach(item => {
            if (category === 'all' || item.classList.contains(category)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// Intersection Observer for scroll animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('section:not(#hero)').forEach(section => {
    observer.observe(section);
});

// Handle contact form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for your message! I will get back to you soon.');
        // In a real application, you would send this data to a server
        console.log('Form submitted!');
        this.reset();
    });
}
