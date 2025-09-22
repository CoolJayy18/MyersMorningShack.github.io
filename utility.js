// === Dropdown Menu Logic with Delay ===
document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.querySelector('.dropdown');
    if (!dropdown) return;

    let hideTimeout;
    const hideDelay = 300; // Delay in milliseconds

    const dropdownContent = dropdown.querySelector('.dropdown-content');

    dropdown.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeout);
        dropdownContent.classList.add('show');
    });

    dropdown.addEventListener('mouseleave', () => {
        hideTimeout = setTimeout(() => {
            dropdownContent.classList.remove('show');
        }, hideDelay);
    });
});


// === Session Management ===
const EMPLOYEE_SESSION_KEY = 'myers_shack_isEmployeeAccessGranted';
const MANAGER_SESSION_KEY = 'myers_shack_isManagerAccessGranted';
// --- NEW: Key for storing the selected employee's ID ---
const EMPLOYEE_ID_KEY = 'myers_shack_selectedEmployeeId';

function checkEmployeeSession() {
    return sessionStorage.getItem(EMPLOYEE_SESSION_KEY) === 'true';
}
function grantEmployeeSession() {
    sessionStorage.setItem(EMPLOYEE_SESSION_KEY, 'true');
}
function checkManagerSession() {
    return sessionStorage.getItem(MANAGER_SESSION_KEY) === 'true' && checkEmployeeSession();
}
function grantManagerSession() {
    sessionStorage.setItem(EMPLOYEE_SESSION_KEY, 'true');
    sessionStorage.setItem(MANAGER_SESSION_KEY, 'true');
}
function clearAllSessions() {
    sessionStorage.removeItem(EMPLOYEE_SESSION_KEY);
    sessionStorage.removeItem(MANAGER_SESSION_KEY);
    // --- NEW: Also clear the saved employee ID on logout ---
    sessionStorage.removeItem(EMPLOYEE_ID_KEY);
    window.location.href = 'index.html';
}

// --- NEW FUNCTIONS: To save and retrieve the selected employee ID ---
function saveEmployeeSelection(employeeId) {
    if (employeeId) {
        sessionStorage.setItem(EMPLOYEE_ID_KEY, employeeId);
    } else {
        sessionStorage.removeItem(EMPLOYEE_ID_KEY);
    }
}

function getEmployeeSelection() {
    return sessionStorage.getItem(EMPLOYEE_ID_KEY);
}
// -----------------------------------------------------------------

function addLogoutButton() {
    const dropdownContent = document.querySelector('.dropdown-content');
    if (dropdownContent && !document.getElementById('logout-link')) {
        const logoutLink = document.createElement('a');
        logoutLink.href = "#";
        logoutLink.id = 'logout-link';
        logoutLink.textContent = 'Logout';
        logoutLink.style.color = '#e74c3c';
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            clearAllSessions();
        });
        dropdownContent.appendChild(logoutLink);
    }
}