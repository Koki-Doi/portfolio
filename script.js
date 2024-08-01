document.addEventListener('DOMContentLoaded', () => {
    const textElements = document.querySelectorAll('#animated-text, .section h2, .section p, h1, h2, p');
    textElements.forEach(element => {
        const strText = element.textContent;
        const splitText = strText.split("");
        element.textContent = "";

        splitText.forEach(char => {
            element.innerHTML += `<span>${char}</span>`;
        });

        let char = 0;
        let timer = setInterval(() => {
            const span = element.querySelectorAll('span')[char];
            span.classList.add('fade');
            char++;
            if (char === splitText.length) {
                clearInterval(timer);
            }
        }, 50);
    });

    // Progress bar logic
    const progressBar = document.querySelector('.progress-bar');
    window.addEventListener('scroll', () => {
        const scrollTotal = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollCurrent = document.documentElement.scrollTop;
        const scrollPercent = (scrollCurrent / scrollTotal) * 100;
        progressBar.style.width = `${scrollPercent}%`;
    });
});
