document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('submitButton').addEventListener('click', (event) => {
        event.preventDefault();
        loadDashboard();
    });
});