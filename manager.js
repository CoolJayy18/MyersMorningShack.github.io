// --- DEVELOPER BACKDOOR ---
// Set to 'true' to bypass Firebase and see the UI immediately for styling.
// Set to 'false' for normal operation with a live database.
const DEV_MODE = false;
// ---

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selectors ---
    const loadingOverlay = document.getElementById('loading-overlay');
    const managerContent = document.getElementById('manager-content');
    const loginContainer = document.getElementById('manager-login-container');
    const loginForm = document.getElementById('manager-login-form');
    const passwordInput = document.getElementById('manager-password');
    const loginError = document.getElementById('manager-login-error');
    const savePasswordsBtn = document.getElementById('save-passwords-btn');
    const newEmployeePasswordInput = document.getElementById('new-employee-password');
    const newManagerPasswordInput = document.getElementById('new-manager-password');
    const passwordStatusMessage = document.getElementById('password-status-message');
    const employeeForm = document.getElementById('employee-form');
    const employeeFormTitle = document.getElementById('employee-form-title');
    const editEmployeeIdInput = document.getElementById('edit-employee-id');
    const employeeNameInput = document.getElementById('employee-name');
    const employeeIdNumberInput = document.getElementById('employee-id-number');
    const employeeAuthorizedCheckbox = document.getElementById('employee-authorized');
    const saveEmployeeBtn = document.getElementById('save-employee-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const employeeListDiv = document.getElementById('employee-list');
    const transactionLogDisplayDiv = document.getElementById('transaction-log-display');
    const exportTransactionsBtn = document.getElementById('export-transactions-btn');
    const timeLogDisplayDiv = document.getElementById('time-log-display');
    const exportTimeLogsBtn = document.getElementById('export-time-logs-btn');

    if (!managerContent) { hideLoadingScreen(); return; }

    // --- Global State Variables ---
    let db, firestore;
    let appLogicHasRun = false;
    let employees = [];

    // --- Core UI & Setup Functions ---
    function hideLoadingScreen() {
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }

    function setupErrorUI(message) {
        if (appLogicHasRun) return;
        appLogicHasRun = true;
        alert("Critical Error: " + message);
        if (loginForm) loginForm.querySelector('button').disabled = true;
        hideLoadingScreen();
    }

    function enableButtons() {
        savePasswordsBtn.disabled = false;
        saveEmployeeBtn.disabled = false;
        exportTransactionsBtn.disabled = false;
        exportTimeLogsBtn.disabled = false;
        console.log("Manager buttons enabled.");
    }

    function updateView(isManager) {
        if (loginContainer) loginContainer.style.display = isManager ? 'none' : 'block';
        if (managerContent) managerContent.style.display = isManager ? 'block' : 'none';
        if (isManager) {
            if (typeof addLogoutButton === 'function') addLogoutButton();
            if (!DEV_MODE) {
                enableButtons();
            }
        }
    }

    // --- Data Handling Functions ---
    function renderEmployeeList() {
        employeeListDiv.innerHTML = '';
        employees.sort((a, b) => a.name.localeCompare(b.name));
        if (employees.length === 0) {
            employeeListDiv.innerHTML = '<p><i>No employees found. Add one using the form above.</i></p>';
            return;
        }
        employees.forEach(emp => {
            const isAuthorizedText = emp.isAuthorized ? 'Yes' : 'No';
            const item = document.createElement('div');
            item.className = 'employee-item';
            item.innerHTML = `<div class="employee-details"><strong>${emp.name}</strong><br><small>Player ID: ${emp.idNumber} | Authorized: ${isAuthorizedText}</small></div><div class="employee-actions"><button class="action-button edit-btn" data-id="${emp.id}">Edit</button><button class="action-button clear-button remove-btn" data-id="${emp.id}">Remove</button></div>`;
            employeeListDiv.appendChild(item);
        });
    }

    async function loadAllEmployees() {
        try {
            const snapshot = await firestore.getDocs(firestore.collection(db, "employees"));
            employees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderEmployeeList();
        } catch (error) { console.error("Error loading employees:", error); }
    }

    function resetEmployeeForm() {
        editEmployeeIdInput.value = '';
        employeeForm.reset();
        employeeFormTitle.textContent = 'Add New Employee';
        saveEmployeeBtn.textContent = 'Add Employee';
        cancelEditBtn.style.display = 'none';
    }

    function prepareEditEmployee(id) {
        const employee = employees.find(e => e.id === id);
        if (employee) {
            editEmployeeIdInput.value = id;
            employeeNameInput.value = employee.name;
            employeeIdNumberInput.value = employee.idNumber;
            employeeAuthorizedCheckbox.checked = employee.isAuthorized || false;
            employeeFormTitle.textContent = 'Editing ' + employee.name;
            saveEmployeeBtn.textContent = 'Update Employee';
            cancelEditBtn.style.display = 'inline-block';
            employeeForm.scrollIntoView({ behavior: 'smooth' });
        }
    }

    async function saveEmployee() {
        if (!firestore) {
             alert("Error: Database connection not ready.");
             return;
        }
        if (!employeeNameInput.value || !employeeIdNumberInput.value) {
            alert('Please fill out the full name and player ID.');
            return;
        }
        const editingId = editEmployeeIdInput.value;
        const employeeData = {
            name: employeeNameInput.value.trim(),
            idNumber: employeeIdNumberInput.value.trim(),
            isAuthorized: employeeAuthorizedCheckbox.checked
        };

        saveEmployeeBtn.disabled = true;
        try {
            if (editingId) {
                const docRef = firestore.doc(db, "employees", editingId);
                await firestore.updateDoc(docRef, employeeData);
            } else {
                await firestore.addDoc(firestore.collection(db, "employees"), employeeData);
            }
            resetEmployeeForm();
            await loadAllEmployees();
        } catch (error) {
            console.error("Error saving employee:", error);
        } finally {
            saveEmployeeBtn.disabled = false;
        }
    }

    async function deleteEmployee(id) {
        const employee = employees.find(e => e.id === id);
        if (confirm(`Are you sure you want to remove ${employee.name}? This cannot be undone.`)) {
            try {
                await firestore.deleteDoc(firestore.doc(db, "employees", id));
                await loadAllEmployees();
            } catch (error) {
                console.error("Error deleting employee:", error);
            }
        }
    }

    async function savePasswords() {
        if (!firestore) {
             alert("Error: Database connection not ready.");
             return;
        }
        const newEmployeePass = newEmployeePasswordInput.value;
        const newManagerPass = newManagerPasswordInput.value;
        if (!newEmployeePass && !newManagerPass) return;

        const passwordsToUpdate = {};
        if (newEmployeePass) passwordsToUpdate.employee = newEmployeePass;
        if (newManagerPass) passwordsToUpdate.manager = newManagerPass;

        try {
            const docRef = firestore.doc(db, "siteSettings", "passwords");
            await firestore.setDoc(docRef, passwordsToUpdate, { merge: true });
            passwordStatusMessage.textContent = "Passwords updated successfully!";
            passwordStatusMessage.style.display = 'block';
            setTimeout(() => { passwordStatusMessage.style.display = 'none'; }, 2500);
        } catch (error) {
            console.error("Error updating passwords:", error);
        }
    }

    async function loadAllTransactions() {
        transactionLogDisplayDiv.innerHTML = `<p><i>Loading transactions...</i></p>`;
        try {
            const q = firestore.query(firestore.collection(db, "transactions"), firestore.orderBy("createdAt", "desc"));
            const snapshot = await firestore.getDocs(q);
            if (snapshot.empty) {
                transactionLogDisplayDiv.innerHTML = `<p><i>No transactions logged yet.</i></p>`;
                return;
            }
            let logHtml = '<table><thead><tr><th>Employee</th><th>Date</th><th>Total</th><th>Items</th></tr></thead><tbody>';
            snapshot.forEach(doc => {
                const entry = doc.data();
                const itemsStr = (entry.items || []).map(item => {
                    let baseString = `${item.itemName} (x${item.quantity})`;
                    if (item.flavorSelections && item.flavorSelections.length > 0) {
                        baseString += `: ${item.flavorSelections.join('; ')}`;
                    }
                    return baseString;
                }).join('<br>');

                const date = entry.createdAt ? entry.createdAt.toDate().toLocaleString() : 'N/A';
                logHtml += `<tr><td>${entry.employeeName}</td><td>${date}</td><td>$${entry.totalAmount.toLocaleString()}</td><td>${itemsStr}</td></tr>`;
            });
            logHtml += '</tbody></table>';
            transactionLogDisplayDiv.innerHTML = logHtml;
        } catch (error) {
            console.error("Error loading transaction logs:", error);
            transactionLogDisplayDiv.innerHTML = `<p class="error-message">Error loading transaction logs.</p>`;
        }
    }
    
    async function loadAllTimeEntries() {
        timeLogDisplayDiv.innerHTML = `<p><i>Loading time logs...</i></p>`;
        try {
            const q = firestore.query(firestore.collection(db, "timeEntries"), firestore.orderBy("clockInTime", "desc"));
            const snapshot = await firestore.getDocs(q);
            if (snapshot.empty) {
                timeLogDisplayDiv.innerHTML = `<p><i>No time logs found.</i></p>`;
                return;
            }
            let logHtml = '<table><thead><tr><th>Employee</th><th>Clock In</th><th>Clock Out</th><th>Duration (Minutes)</th></tr></thead><tbody>';
            snapshot.forEach(doc => {
                const entry = doc.data();
                const clockInStr = entry.clockInTime ? entry.clockInTime.toDate().toLocaleString() : 'N/A';
                const clockOutStr = entry.clockOutTime ? entry.clockOutTime.toDate().toLocaleString() : '<strong>Active</strong>';
                const durationStr = entry.durationMinutes !== null ? entry.durationMinutes : '<strong>-</strong>';
                logHtml += `<tr><td>${entry.employeeName}</td><td>${clockInStr}</td><td>${clockOutStr}</td><td>${durationStr}</td></tr>`;
            });
            logHtml += '</tbody></table>';
            timeLogDisplayDiv.innerHTML = logHtml;
        } catch (error) {
            console.error("Error loading time logs:", error);
            timeLogDisplayDiv.innerHTML = `<p class="error-message">Error loading time logs.</p>`;
        }
    }

    function formatCSVCell(cellData) {
        let cell = cellData === null || cellData === undefined ? '' : String(cellData);
        if (cell.search(/("|,|\n)/g) >= 0) {
            cell = `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
    }

    async function exportToCSV(type) {
        if (!firestore) {
            alert("Database connection is not ready.");
            return;
        }
        const button = type === 'transactions' ? exportTransactionsBtn : exportTimeLogsBtn;
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Exporting...';

        try {
            const collectionName = type;
            const orderByField = type === 'transactions' ? 'createdAt' : 'clockInTime';
            const headers = type === 'transactions'
                ? ['Employee', 'Date', 'Total', 'Items']
                : ['Employee', 'Clock In', 'Clock Out', 'Duration (Minutes)'];

            const q = firestore.query(firestore.collection(db, collectionName), firestore.orderBy(orderByField, "desc"));
            const snapshot = await firestore.getDocs(q);

            if (snapshot.empty) {
                alert(`No ${type} to export.`);
                return;
            }

            const rows = snapshot.docs.map(doc => {
                const data = doc.data();
                if (type === 'transactions') {
                    const itemsStr = (data.items || []).map(item => {
                        let base = `${item.itemName} (x${item.quantity})`;
                        if (item.flavorSelections) {
                            base += `: ${item.flavorSelections.join('; ')}`;
                        }
                        return base;
                    }).join(' | ');
                    return [data.employeeName, data.createdAt ? data.createdAt.toDate().toLocaleString() : '', data.totalAmount, itemsStr];
                } else { // timeEntries
                    return [data.employeeName, data.clockInTime ? data.clockInTime.toDate().toLocaleString() : '', data.clockOutTime ? data.clockOutTime.toDate().toLocaleString() : 'Active', data.durationMinutes ?? ''];
                }
            }).map(row => row.map(formatCSVCell).join(','));

            const csvContent = [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            const dateStr = new Date().toISOString().split('T')[0];
            link.setAttribute("download", `${type}-${dateStr}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error(`Error exporting ${type}:`, error);
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    // --- Main Application Logic ---
    async function executeManagerAppLogic(firebaseDetail) {
        if (appLogicHasRun) return;
        appLogicHasRun = true;
        db = firebaseDetail.db;
        firestore = firebaseDetail.functions;

        if (checkManagerSession()) {
            updateView(true);
            await Promise.all([loadAllEmployees(), loadAllTransactions(), loadAllTimeEntries()]);
        } else {
            updateView(false);
            let password = "default_manager_password";
            try {
                const docRef = firestore.doc(db, "siteSettings", "passwords");
                const docSnap = await firestore.getDoc(docRef);
                if (docSnap.exists() && docSnap.data().manager) {
                    password = docSnap.data().manager;
                }
            } catch (e) { console.error("Could not fetch manager password.", e); }

            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (passwordInput.value === password) {
                    grantManagerSession();
                    updateView(true);
                    Promise.all([loadAllEmployees(), loadAllTransactions(), loadAllTimeEntries()]);
                } else {
                    loginError.style.display = 'block';
                }
            });
        }
        hideLoadingScreen();
    }
    
    // --- Event Listeners & Initializer ---
    savePasswordsBtn.addEventListener('click', savePasswords);
    saveEmployeeBtn.addEventListener('click', saveEmployee);
    cancelEditBtn.addEventListener('click', resetEmployeeForm);
    exportTransactionsBtn.addEventListener('click', () => exportToCSV('transactions'));
    exportTimeLogsBtn.addEventListener('click', () => exportToCSV('timeEntries'));
    employeeListDiv.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn')) {
            prepareEditEmployee(e.target.dataset.id);
        } else if (e.target.classList.contains('remove-btn')) {
            deleteEmployee(e.target.dataset.id);
        }
    });

    if (DEV_MODE) {
        console.warn("DEV MODE IS ACTIVE: Bypassing Firebase and login. Database actions will not work.");
        updateView(true);
        hideLoadingScreen();
    } else {
        if (window.isFirebaseReady) {
            executeManagerAppLogic({ db: window.db, functions: window.firestoreFunctions });
        } else {
            document.addEventListener('firebaseReady', (e) => {
                if (!appLogicHasRun) executeManagerAppLogic(e.detail);
            });
            document.addEventListener('firebaseError', (e) => {
                if (!appLogicHasRun) setupErrorUI(e.detail?.error?.message || "Firebase failed to load.");
            });
        }
    }
});