/* Custom cursor effect */
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
});

function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    requestAnimationFrame(animateCursor);
}
animateCursor();

document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, .skill-box, .project-card, .stat-box')) {
        cursor.style.width = '30px';
        cursor.style.height = '30px';
        cursor.style.backgroundColor = 'rgba(0, 113, 227, 0.1)';
        cursor.style.borderColor = 'rgba(0, 113, 227, 0.8)';
        cursor.style.opacity = '1';
    } else {
        cursor.style.width = '10px';
        cursor.style.height = '10px';
        cursor.style.backgroundColor = 'transparent';
        cursor.style.borderColor = 'rgba(0, 113, 227, 0.6)';
        cursor.style.opacity = '0.8';
    }
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = entry.target.style.animation;
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.project-card, .skill-box, .stat-box').forEach(element => {
    observer.observe(element);
});

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            scrollToSection(href.slice(1));
        }
    });
});

window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});
