document.addEventListener('DOMContentLoaded', () => {

    // --- LOGIKA DARK MODE ---
    const themeToggle = document.getElementById('checkbox');
    // Fungsi untuk menerapkan tema
    const applyTheme = (theme) => {
        if (theme === 'dark-mode') {
            document.body.classList.add('dark-mode');
            if(themeToggle) themeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            if(themeToggle) themeToggle.checked = false;
        }
    };
    
    const currentTheme = localStorage.getItem('theme') || 'light-mode';
    applyTheme(currentTheme);

    // Event listener untuk tombol toggle
    if(themeToggle){
        themeToggle.addEventListener('change', function() {
            let theme = this.checked ? 'dark-mode' : 'light-mode';
            localStorage.setItem('theme', theme);
            applyTheme(theme);
        });
    }

    // --- LOGIKA ANIMASI SCROLL ---
    const scrollElements = document.querySelectorAll(".animate-on-scroll");
    if (scrollElements.length > 0) {
        const elementInView = (el, dividend = 1) => {
            const elementTop = el.getBoundingClientRect().top;
            return (
                elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend
            );
        };

        const displayScrollElement = (element) => {
            element.classList.add("is-visible");
        };

        const handleScrollAnimation = () => {
            scrollElements.forEach((el) => {
                if (elementInView(el, 1.25)) {
                    displayScrollElement(el);
                }
            });
        };

        handleScrollAnimation();
        window.addEventListener("scroll", handleScrollAnimation);
    }
});
              
