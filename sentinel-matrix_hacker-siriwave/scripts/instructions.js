// Instructions Modal Functionality
document.addEventListener('DOMContentLoaded', () => {
    const instructionsBtn = document.getElementById('instructions-btn');
    const instructionsModal = document.getElementById('instructions-modal');
    const closeBtn = document.querySelector('.close-btn');

    // Open modal
    instructionsBtn.addEventListener('click', () => {
        instructionsModal.classList.add('show');
        instructionsModal.classList.add('instructions-active');
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
        instructionsModal.classList.remove('show');
        instructionsModal.classList.remove('instructions-active');
    });

    // Close modal when clicking outside
    instructionsModal.addEventListener('click', (e) => {
        if (e.target === instructionsModal) {
            instructionsModal.classList.remove('show');
            instructionsModal.classList.remove('instructions-active');
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && instructionsModal.classList.contains('show')) {
            instructionsModal.classList.remove('show');
            instructionsModal.classList.remove('instructions-active');
        }
    });
});
