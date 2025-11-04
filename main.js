// --- DEVELOPER BACKDOOR ---
// Set to 'true' to bypass Firebase and see the UI immediately for styling.
// Set to 'false' for normal operation with a live database.
const DEV_MODE = false; 
// ---

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selectors ---
    const loadingOverlay = document.getElementById('loading-overlay');
    const employeeContent = document.getElementById('employee-content');
    const loginContainer = document.getElementById('employee-login-container');
    const loginForm = document.getElementById('employee-login-form');
    const passwordInput = document.getElementById('employee-password');
    const loginError = document.getElementById('login-error');
    const employeeSelect = document.getElementById('employee-select');
    const timeClockInterface = document.getElementById('time-clock-interface');
    const statusBox = document.getElementById('time-clock-status');
    const clockInBtn = document.getElementById('clock-in-btn');
    const clockOutBtn = document.getElementById('clock-out-btn');
    const clockOutMessage = document.getElementById('clock-out-message');
    const posItemsContainer = document.getElementById('pos-items-container');
    const posTotalDisplay = document.getElementById('pos-total');
    const clearPosBtn = document.getElementById('clear-pos-btn');
    const checkoutPosBtn = document.getElementById('checkout-pos-btn');
    const posStatusMessage = document.getElementById('pos-status-message');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const flavorCounter = document.getElementById('flavor-counter');
    const flavorGrid = document.getElementById('flavor-grid');
    const addDozenToCartBtn = document.getElementById('add-dozen-to-cart-btn');
    const cancelDozenBtn = document.getElementById('cancel-dozen-btn');
    const currentCartSection = document.getElementById('current-cart-section');
    const currentCartDisplay = document.getElementById('current-cart-display');

    if (!employeeContent) { hideLoadingScreen(); return; }

    // --- Global State Variables ---
    let db, firestore;
    let appLogicHasRun = false;
    let currentClockInId = null;
    let selectedFlavorCounts = {};
    let currentModalConfig = {};

    // --- Data Structures ---
    const posItems = [
        { name: "Donut", price: 100, image: "https://i.ibb.co/0ptXYSR5/EC631-C44-6-C40-49-CF-B2-D1-1-E3-B865-F5848.png", isMultiSingle: true, maxSelection: 5 },
        { name: "Half Dozen", price: 550, image: "https://i.ibb.co/5g1P2hL4/7-E3-A7-FA5-46-B9-4-AC3-ADBA-2-F7165956-B39-removebg-preview.png", isDozen: true, dozenSize: 6 },
        { name: "Full Dozen", price: 1000, image: "https://i.ibb.co/sJwyM2Bk/C12-F0-C4-E-B98-D-4710-B67-D-FEE8-B71-B003-F-removebg-preview.png", isDozen: true, dozenSize: 12 },
        { name: "House Coffee", price: 80, image: "https://i.ibb.co/v4j4vq4C/DD60-EFCD-D90-D-47-AD-BFEB-F841-F435-AE46-removebg-preview.png" },
        { name: "Espresso", price: 125, image: "https://i.ibb.co/ccNBDcmG/2-A5-BB1-DC-62-F2-46-A3-B6-CC-941-B192369-CD-removebg-preview.png" },
        { name: "Milk", price: 50, image: "https://i.ibb.co/QvkfnXBz/0-F229-F38-BDD8-4344-8766-5-F885-EC5-AB29-removebg-preview.png" },
        { name: "Redwood Pack", price: 500, image: "https://i.ibb.co/JWqfP8SF/89811-C3-D-3-AD7-4612-80-EE-388-D9-BD4-AE59-removebg-preview.png" },
        { name: "Redwood Gold Pack", price: 775, image: "https://i.ibb.co/39yqPdqp/30023628-D212-488-B-A8-CF-10-E0-F182-C165-removebg-preview.png" },
    ];
    const donutFlavors = [
        { name: "Glazed", image: "https://i.ibb.co/4wdf4Gnk/EC631-C44-6-C40-49-CF-B2-D1-1-E3-B865-F5848.png" },
        { name: "Chocolate", image: "https://i.ibb.co/gMXJxbpt/4-EC92-ADB-F67-A-4-F40-8311-CFB12-E577-A03.png" },
        { name: "Chocolate Glazed", image: "https://i.ibb.co/G3sZp627/3092364-A-8-F0-D-483-C-B911-DBA222-A64-C8-F.png" },
        { name: "Strawberry Glazed", image: "https://i.ibb.co/B2Jq49ZW/1-BEBD5-DF-B495-4620-86-DA-8-C9-B1-E8-D14-F8.png" },
        { name: "Cookies N' Cream", image: "https://i.ibb.co/F4nHmFcL/958-EA1-A4-145-A-4-E28-9500-0-B527-EC5-EADD.png" },
        { name: "Blueberry", image: "https://i.ibb.co/3Y7qnrV9/EE91-DA50-8-A7-C-4971-81-E5-51-F89-B4582-A5.png" },
        { name: "Cinnamon", image: "https://i.ibb.co/8LVmCD6f/C833-E3-E7-75-C0-42-F9-8991-DCDEFE6625-D8.png" },
        { name: "Crueller", image: "https://i.ibb.co/F41ncs46/864520-FB-681-B-4308-9-ECD-1978-F29-CDBCE.png" },
        { name: "Long John", image: "https://i.ibb.co/G4ghXM2m/A658-B07-F-2-E30-4-A4-D-8780-F1-E88170667-E.png" },
        { name: "Boston Crème", image: "https://i.ibb.co/DHLnrkWv/A81-A4564-B67-B-42-E4-9599-2693-EF5-F92-C2.png" },
        { name: "Bavarian Crème", image: "https://i.ibb.co/DfsX35WB/17-B9-B230-7247-4-EE2-9023-4-B736568-F3-A8.png" },
        { name: "Jelly", image: "https://i.ibb.co/TD7hjJgf/IMG-1312.png" },
        { name: "Powdered Jelly", image: "https://i.ibb.co/ym36dM1k/A7-EC0716-0-D52-4471-B46-E-25-D37-CDEF3-A6.png" },
        { name: "Raspberry Jelly", image: "https://i.ibb.co/Fk2G4Yr5/9-C80-E48-E-E61-B-4-EE4-8-C6-D-7-E5408223-CC1.png" },
        { name: "Blackberry Jelly", image: "https://i.ibb.co/XkkjJw06/8-F2-E5-DBC-D685-4898-874-F-FDBBEB3190-D2.png" },
        { name: "PB&J", image: "https://i.ibb.co/whDC2Kzd/A6-C4336-B-3804-4741-B2-FF-78-CA05388-C20.png" },
        { name: "Coco-Nut", image: "https://i.ibb.co/kgG15J4k/89-CCB0-A2-182-F-4-ED3-928-E-D02-F174-E007-A.png" },
        { name: "Birthday Cake", image: "https://i.ibb.co/m58ZyZ9k/12075-D97-566-F-46-A4-A23-A-5-FDD44-C90737.png" },
        { name: "Maple Bacon", image: "https://i.ibb.co/q3f2c4bJ/1-A40-EF3-C-CBD3-4-A04-8-CFD-CF3-AD9-AC4-D78.png" },
        { name: "Caramel Banana", image: "https://i.ibb.co/dshSpNC6/6-B86-E681-1-DA6-499-C-8-D0-D-85-D1760-C4265.png" },
        { name: "Nutella Donut", image: "https://i.ibb.co/qF0HjSsB/3092364-A-8-F0-D-483-C-B911-DBA222-A64-C8-F.png" },
        { name: "Chocolate Raspberry", image: "https://i.ibb.co/5N8vxDn/8-C2105-E0-8-CC6-4-D6-F-BAFE-FDCF4-DFE14-E1.png" },
        { name: "Peanut Butter", image: "https://i.ibb.co/3Yz6bVz3/B6-BFE5-D0-0-CBF-4-E25-B19-F-81-E6-CB24977-A.png" },
        { name: "Caramel Custard", image: "https://i.ibb.co/FbXhdwjQ/F45-BC7-C2-2-D2-B-491-A-9-C9-E-875-F2-B6684-F9.png" },
        { name: "Donut of the Month!", image: "https://i.ibb.co/HDLXbH2C/E40900-A2-9-B71-458-E-A62-C-EBC1301-A2159.png" }
    ];

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

    function updateView(isLoggedIn) {
        if (loginContainer) loginContainer.style.display = isLoggedIn ? 'none' : 'block';
        if (employeeContent) employeeContent.style.display = isLoggedIn ? 'block' : 'none';
        if (isLoggedIn && typeof addLogoutButton === 'function') addLogoutButton();
    }

    // --- Firebase Data Functions ---
    async function loadEmployees() {
        try {
            const q = firestore.query(firestore.collection(db, "employees"), firestore.orderBy("name"));
            const snapshot = await firestore.getDocs(q);
            employeeSelect.innerHTML = '<option value="">-- Please Select --</option>';
            snapshot.forEach(doc => {
                const emp = doc.data();
                const option = new Option(emp.name, doc.id);
                option.dataset.name = emp.name;
                employeeSelect.appendChild(option);
            });
            const savedEmployeeId = getEmployeeSelection();
            if (savedEmployeeId && employeeSelect.querySelector(`option[value="${savedEmployeeId}"]`)) {
                employeeSelect.value = savedEmployeeId;
                employeeSelect.dispatchEvent(new Event('change'));
            }
        } catch (error) { console.error("Error loading employees:", error); }
    }
    
    async function checkClockInStatus(employeeId) {
        if (!employeeId) {
            timeClockInterface.style.display = 'none';
            return;
        }
        timeClockInterface.style.display = 'block';
        clockOutMessage.style.display = 'none';
        const q = firestore.query(firestore.collection(db, "timeEntries"), firestore.where("employeeId", "==", employeeId), firestore.where("status", "==", "Active"));
        const snapshot = await firestore.getDocs(q);
        if (!snapshot.empty) {
            const activeEntry = snapshot.docs[0];
            currentClockInId = activeEntry.id;
            const clockInTime = activeEntry.data().clockInTime.toDate();
            statusBox.innerHTML = `You are currently <strong>clocked in</strong> since ${clockInTime.toLocaleTimeString()}`;
            clockInBtn.style.display = 'none';
            clockOutBtn.style.display = 'inline-block';
        } else {
            currentClockInId = null;
            statusBox.innerHTML = `You are currently <strong>clocked out</strong>.`;
            clockInBtn.style.display = 'inline-block';
            clockOutBtn.style.display = 'none';
        }
        clockInBtn.disabled = false;
    }

    async function clockIn() {
        if (!employeeSelect.value) return;
        const employeeName = employeeSelect.options[employeeSelect.selectedIndex].dataset.name;
        try {
            await firestore.addDoc(firestore.collection(db, "timeEntries"), {
                employeeId: employeeSelect.value, employeeName,
                clockInTime: firestore.serverTimestamp(),
                clockOutTime: null, durationMinutes: null, status: "Active"
            });
            await checkClockInStatus(employeeSelect.value);
        } catch (error) { console.error("Error clocking in:", error); }
    }

    async function clockOut() {
        if (!currentClockInId) return;
        try {
            const entryRef = firestore.doc(db, "timeEntries", currentClockInId);
            const entrySnap = await firestore.getDoc(entryRef);
            if (entrySnap.exists()) {
                const clockInTime = entrySnap.data().clockInTime.toDate();
                const clockOutTime = new Date();
                const durationMinutes = Math.round((clockOutTime - clockInTime) / 60000);
                await firestore.updateDoc(entryRef, {
                    clockOutTime: firestore.Timestamp.fromDate(clockOutTime),
                    durationMinutes, status: "Completed"
                });
                clockOutMessage.textContent = `Successfully clocked out. Total time: ${durationMinutes} minutes.`;
                clockOutMessage.style.display = 'block';
                await checkClockInStatus(employeeSelect.value);
            }
        } catch (error) { console.error("Error clocking out: ", error); }
    }
    
    // --- POS & Modal Functions ---
    function renderPosItems() {
        posItemsContainer.innerHTML = '';
        posItems.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'pos-item';
            itemEl.innerHTML = `<img src="${item.image}" alt="${item.name}"><p>${item.name} - $${item.price.toLocaleString()}</p><input type="number" class="pos-quantity" min="0" value="0" readonly data-price="${item.price}" data-name="${item.name}">`;
            
            itemEl.addEventListener('click', (e) => {
                if (item.isDozen || item.isMultiSingle) {
                    const size = item.isDozen ? item.dozenSize : item.maxSelection;
                    openFlavorModal(item.name, item.price, size, item.isMultiSingle || false);
                } else {
                    const input = itemEl.querySelector('.pos-quantity');
                    input.value = (parseInt(input.value) || 0) + 1;
                    calculatePosTotal();
                }
            });
            posItemsContainer.appendChild(itemEl);
        });
    }

    function openFlavorModal(name, price, size, isMultiSingle) {
        currentModalConfig = { name, price, size, isMultiSingle };
        modalTitle.textContent = isMultiSingle ? `Select up to ${size} Donuts` : `Select ${size} Flavors for ${name}`;
        
        const oldInstruction = document.getElementById('modal-instruction');
        if (oldInstruction) oldInstruction.remove();
        const instructionText = document.createElement('p');
        instructionText.id = 'modal-instruction';
        instructionText.innerHTML = "<strong>Left-click</strong> to add, <strong>Click X</strong> to remove.";
        instructionText.style.marginTop = '-10px';
        modalTitle.insertAdjacentElement('afterend', instructionText);

        const targetInput = document.querySelector(`.pos-quantity[data-name="${name}"]`);
        selectedFlavorCounts = (isMultiSingle && targetInput.dataset.flavors) ? JSON.parse(targetInput.dataset.flavors) : {};
        
        updateFlavorCounter();
        flavorGrid.innerHTML = '';
        donutFlavors.forEach(flavor => {
            const flavorEl = document.createElement('div');
            flavorEl.className = 'flavor-item';
            flavorEl.innerHTML = `<div class="flavor-item-remove">&times;</div><div class="flavor-item-counter">0</div><img src="${flavor.image}" alt="${flavor.name}"><p>${flavor.name}</p>`;
            flavorEl.dataset.flavorName = flavor.name;
            flavorEl.addEventListener('click', handleFlavorAdd);
            flavorEl.querySelector('.flavor-item-remove').addEventListener('click', handleFlavorRemove);
            flavorGrid.appendChild(flavorEl);
            if (selectedFlavorCounts[flavor.name]) {
                updateFlavorItemUI(flavorEl, selectedFlavorCounts[flavor.name]);
            }
        });
        modalOverlay.style.display = 'flex';
    }

    function handleFlavorAdd(e) {
        const flavorElement = e.currentTarget;
        const clickedFlavor = flavorElement.dataset.flavorName;
        if (!selectedFlavorCounts[clickedFlavor]) {
            selectedFlavorCounts[clickedFlavor] = 0;
        }
        const totalSelected = Object.values(selectedFlavorCounts).reduce((sum, count) => sum + count, 0);
        if (totalSelected < currentModalConfig.size) {
            selectedFlavorCounts[clickedFlavor]++;
            updateFlavorItemUI(flavorElement, selectedFlavorCounts[clickedFlavor]);
            updateFlavorCounter();
        } else {
            alert(`You have already selected the maximum of ${currentModalConfig.size} items.`);
        }
    }

    function handleFlavorRemove(e) {
        e.stopPropagation();
        const flavorElement = e.currentTarget.parentElement;
        const clickedFlavor = flavorElement.dataset.flavorName;
        if (selectedFlavorCounts[clickedFlavor] && selectedFlavorCounts[clickedFlavor] > 0) {
            selectedFlavorCounts[clickedFlavor]--;
            if (selectedFlavorCounts[clickedFlavor] === 0) {
                delete selectedFlavorCounts[clickedFlavor];
            }
            updateFlavorItemUI(flavorElement, selectedFlavorCounts[clickedFlavor] || 0);
            updateFlavorCounter();
        }
    }

    function updateFlavorItemUI(flavorElement, count) {
        const counter = flavorElement.querySelector('.flavor-item-counter');
        counter.textContent = count;
        if (count > 0) {
            counter.classList.add('visible');
            flavorElement.classList.add('selected');
        } else {
            counter.classList.remove('visible');
            flavorElement.classList.remove('selected');
        }
    }

    function updateFlavorCounter() {
        const totalSelected = Object.values(selectedFlavorCounts).reduce((sum, count) => sum + count, 0);
        const buttonText = currentModalConfig.isMultiSingle ? 'Update Cart' : 'Add to Cart';
        addDozenToCartBtn.textContent = buttonText;
        flavorCounter.textContent = `${totalSelected} of ${currentModalConfig.size} selected`;
        
        const isButtonDisabled = currentModalConfig.isMultiSingle 
            ? false
            : totalSelected !== currentModalConfig.size;
        addDozenToCartBtn.disabled = isButtonDisabled;
    }

    function addSelectionToCart() {
        const targetInput = document.querySelector(`.pos-quantity[data-name="${currentModalConfig.name}"]`);
        
        if (currentModalConfig.isMultiSingle) {
            const totalSelected = Object.values(selectedFlavorCounts).reduce((sum, count) => sum + count, 0);
            targetInput.value = totalSelected;
            targetInput.dataset.flavors = totalSelected > 0 ? JSON.stringify(selectedFlavorCounts) : '';
        } else {
            if (Object.values(selectedFlavorCounts).reduce((s, c) => s + c, 0) !== currentModalConfig.size) return;
            targetInput.value = (parseInt(targetInput.value) || 0) + 1;
            const existingSelections = JSON.parse(targetInput.dataset.flavors || '[]');
            const newSelectionString = Object.entries(selectedFlavorCounts).map(([name, quantity]) => `${quantity}x ${name}`).join(', ');
            existingSelections.push(newSelectionString);
            targetInput.dataset.flavors = JSON.stringify(existingSelections);
        }
        calculatePosTotal();
        closeFlavorModal();
    }

    function closeFlavorModal() {
        modalOverlay.style.display = 'none';
    }

    function updateCartDisplay() {
        const cartItems = [];
        document.querySelectorAll('.pos-quantity').forEach(input => {
            const quantity = parseInt(input.value) || 0;
            if (quantity > 0) {
                cartItems.push({
                    name: input.dataset.name,
                    quantity: quantity,
                    flavors: input.dataset.flavors ? JSON.parse(input.dataset.flavors) : null
                });
            }
        });

        if (cartItems.length > 0) {
            let html = '';
            cartItems.forEach(item => {
                const itemConfig = posItems.find(p => p.name === item.name);
                html += `<div class="cart-summary-item">`;
                html += `<div class="cart-summary-main"><strong>${item.quantity}x</strong> ${item.name}</div>`;

                if (item.flavors) {
                    if (itemConfig.isMultiSingle) {
                        const flavorString = Object.entries(item.flavors)
                            .filter(([name, qty]) => qty > 0)
                            .map(([name, qty]) => `${qty}x ${name}`)
                            .join(', ');
                        if (flavorString) {
                           html += `<span class="cart-summary-flavors">&ndash; ${flavorString}</span>`;
                        }
                    } else if (itemConfig.isDozen) {
                        item.flavors.forEach(flavorString => {
                            const cleanedFlavorString = flavorString.split(', ')
                                .filter(part => !part.startsWith('0x'))
                                .join(', ');
                            if (cleanedFlavorString) {
                                html += `<span class="cart-summary-flavors">&ndash; ${cleanedFlavorString}</span>`;
                            }
                        });
                    }
                }
                html += `</div>`;
            });
            currentCartDisplay.innerHTML = html;
            currentCartSection.style.display = 'block';
        } else {
            currentCartDisplay.innerHTML = '';
            currentCartSection.style.display = 'none';
        }
    }

    function calculatePosTotal() {
        let total = 0;
        document.querySelectorAll('.pos-quantity').forEach(input => {
            const price = parseFloat(input.dataset.price);
            const quantity = parseInt(input.value) || 0;
            total += price * quantity;
        });
        posTotalDisplay.textContent = `$${total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        updateCartDisplay();
        return total;
    }

    function clearCart() {
        document.querySelectorAll('.pos-quantity').forEach(input => {
            input.value = '0';
            if (input.dataset.flavors) delete input.dataset.flavors;
        });
        calculatePosTotal();
        posStatusMessage.style.display = 'none';
    }

    async function logSale() {
        if (!employeeSelect.value) {
            alert("Please select your name before logging a sale.");
            return;
        }
        const totalAmount = calculatePosTotal();
        if (totalAmount <= 0) return;

        const employeeName = employeeSelect.options[employeeSelect.selectedIndex].dataset.name;
        const itemsSold = [];

        document.querySelectorAll('.pos-quantity').forEach(input => {
            const quantity = parseInt(input.value) || 0;
            if (quantity > 0) {
                const item = { itemName: input.dataset.name, quantity };
                const itemConfig = posItems.find(p => p.name === input.dataset.name);

                if (itemConfig.isMultiSingle && input.dataset.flavors) {
                    const flavorCounts = JSON.parse(input.dataset.flavors);
                    const flavorString = Object.entries(flavorCounts).map(([name, qty]) => `${qty}x ${name}`).join(', ');
                    if (flavorString) item.flavorSelections = [flavorString];
                } else if (itemConfig.isDozen && input.dataset.flavors) {
                    item.flavorSelections = JSON.parse(input.dataset.flavors);
                }
                itemsSold.push(item);
            }
        });

        if (itemsSold.length === 0) return;

        checkoutPosBtn.disabled = true;
        try {
            await firestore.addDoc(firestore.collection(db, "transactions"), {
                employeeId: employeeSelect.value, employeeName, totalAmount, items: itemsSold,
                createdAt: firestore.serverTimestamp()
            });
            posStatusMessage.textContent = "Sale logged successfully!";
            posStatusMessage.style.display = 'block';
            setTimeout(() => clearCart(), 1500);
        } catch (error) {
            console.error("Error logging sale:", error);
            posStatusMessage.textContent = "Error logging sale.";
        } finally {
            checkoutPosBtn.disabled = false;
        }
    }

    // --- Main Application Logic ---
    async function executeMainAppLogic(firebaseDetail) {
        if (appLogicHasRun) return;
        appLogicHasRun = true;
        db = firebaseDetail.db;
        firestore = firebaseDetail.functions;
        renderPosItems();
        if (checkEmployeeSession()) {
            updateView(true);
            await loadEmployees();
        } else {
            updateView(false);
            let password = "default_employee_password";
            try {
                const docRef = firestore.doc(db, "siteSettings", "passwords");
                const docSnap = await firestore.getDoc(docRef);
                if (docSnap.exists() && docSnap.data().employee) {
                    password = docSnap.data().employee;
                }
            } catch (e) { console.error("Could not fetch password.", e); }

            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (passwordInput.value === password) {
                    grantEmployeeSession();
                    updateView(true);
                    loadEmployees();
                } else {
                    loginError.style.display = 'block';
                }
            });
        }
        hideLoadingScreen();
    }
    
    // --- Event Listeners & Initializer ---
    clearPosBtn.addEventListener('click', clearCart);
    checkoutPosBtn.addEventListener('click', logSale);
    employeeSelect.addEventListener('change', (e) => {
        saveEmployeeSelection(e.target.value);
        checkClockInStatus(e.target.value);
    });
    clockInBtn.addEventListener('click', clockIn);
    clockOutBtn.addEventListener('click', clockOut);
    addDozenToCartBtn.addEventListener('click', addSelectionToCart);
    cancelDozenBtn.addEventListener('click', closeFlavorModal);

    if (DEV_MODE) {
        updateView(true);
        renderPosItems();
        hideLoadingScreen();
    } else {
        if (window.isFirebaseReady) {
            executeMainAppLogic({ db: window.db, functions: window.firestoreFunctions });
        } else {
            document.addEventListener('firebaseReady', (e) => {
                if (!appLogicHasRun) executeMainAppLogic(e.detail);
            });
            document.addEventListener('firebaseError', (e) => {
                if (!appLogicHasRun) setupErrorUI(e.detail?.error?.message || "Firebase failed to load.");
            });
        }
    }
});