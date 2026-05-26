// --- CUSTOM SELECT AND MULTISELECT MANAGER ---

(function() {
    // Keep reference to the native value descriptor
    const originalValueProp = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');

    // Function to initialize a single custom dropdown
    function initSingleSelect(select) {
        if (select.multiple || select.dataset.customSelectProcessed) return;

        // Mark as processed
        select.dataset.customSelectProcessed = "true";

        // Create elements
        const container = document.createElement('div');
        container.className = 'custom-select-container';

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'custom-select-trigger';
        trigger.innerHTML = `
            <span class="custom-select-label"></span>
            <svg class="h-4.5 w-4.5 text-slate-400 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
        `;

        const menu = document.createElement('div');
        menu.className = 'custom-select-menu';

        // Insert container into the DOM and move the original select inside it
        select.parentNode.insertBefore(container, select);
        container.appendChild(select);
        container.appendChild(trigger);
        container.appendChild(menu);

        // Hide original select
        select.style.display = 'none';

        const label = trigger.querySelector('.custom-select-label');

        // Override value property on this specific select instance to intercept programmatic changes
        if (originalValueProp) {
            Object.defineProperty(select, 'value', {
                get() {
                    return originalValueProp.get.call(this);
                },
                set(val) {
                    originalValueProp.set.call(this, val);
                    this.dispatchEvent(new CustomEvent('custom-value-set'));
                },
                configurable: true,
                enumerable: true
            });
        }

        // Function to rebuild options list
        function rebuildOptions() {
            menu.innerHTML = '';
            Array.from(select.options).forEach((option) => {
                const optEl = document.createElement('div');
                optEl.className = 'custom-select-option';
                optEl.dataset.value = option.value;
                optEl.innerHTML = `
                    <span>${option.textContent}</span>
                    <span class="custom-select-option-checkmark"></span>
                `;

                optEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    select.value = option.value;
                    // Trigger native change event so all code listening to select change is executed
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                    closeAllDropdowns();
                });

                menu.appendChild(optEl);
            });
            updateTriggerLabel();
        }

        // Function to update the visible label and selected styling
        function updateTriggerLabel() {
            const selectedIdx = select.selectedIndex;
            const selectedOption = selectedIdx >= 0 ? select.options[selectedIdx] : null;
            label.textContent = selectedOption ? selectedOption.textContent : (select.placeholder || '-- Chọn --');

            // Toggle select option highlights
            const optionEls = menu.querySelectorAll('.custom-select-option');
            optionEls.forEach(opt => {
                if (opt.dataset.value === select.value) {
                    opt.classList.add('selected');
                } else {
                    opt.classList.remove('selected');
                }
            });
        }

        // Event listeners
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = menu.classList.contains('show');
            closeAllDropdowns();
            if (!isOpen) {
                // Check if there is enough space below trigger (approx 250px)
                const rect = trigger.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                if (spaceBelow < 250 && spaceAbove > spaceBelow) {
                    menu.classList.add('open-upward');
                } else {
                    menu.classList.remove('open-upward');
                }
                menu.classList.add('show');
                trigger.classList.add('active');
            }
        });

        // Sync visual display when value changes natively or programmatically
        select.addEventListener('change', updateTriggerLabel);
        select.addEventListener('custom-value-set', updateTriggerLabel);

        // Rebuild when the <select>'s options change dynamically
        const observer = new MutationObserver(rebuildOptions);
        observer.observe(select, { childList: true });

        // Initialize display
        rebuildOptions();
    }

    // Function to close all open select menus
    function closeAllDropdowns() {
        document.querySelectorAll('.custom-select-menu.show').forEach(menu => menu.classList.remove('show'));
        document.querySelectorAll('.custom-select-trigger.active').forEach(trigger => trigger.classList.remove('active'));
    }

    // Close on click outside
    document.addEventListener('click', closeAllDropdowns);

    // Initialize custom multiselect for product reporting
    function initMultiSelect(select) {
        if (!select.multiple || select.dataset.customSelectProcessed) return;

        select.dataset.customSelectProcessed = "true";

        // Create container (same structure as single select)
        const container = document.createElement('div');
        container.className = 'custom-select-container';

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'custom-select-trigger';
        trigger.innerHTML = `
            <span class="custom-select-label"></span>
            <svg class="h-4.5 w-4.5 text-slate-400 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
        `;

        const menu = document.createElement('div');
        menu.className = 'custom-select-menu';

        // Insert container into the DOM and move the original select inside it
        select.parentNode.insertBefore(container, select);
        container.appendChild(select);
        container.appendChild(trigger);
        container.appendChild(menu);

        // Hide original select
        select.style.display = 'none';

        const label = trigger.querySelector('.custom-select-label');

        // Override value property on this specific select instance to intercept programmatic changes
        if (originalValueProp) {
            Object.defineProperty(select, 'value', {
                get() {
                    return originalValueProp.get.call(this);
                },
                set(val) {
                    originalValueProp.set.call(this, val);
                    this.dispatchEvent(new CustomEvent('custom-value-set'));
                },
                configurable: true,
                enumerable: true
            });
        }

        // Keep track of selections persistently so dynamic innerHTML updates on select don't wipe them
        const selectedValues = new Set();

        // Function to rebuild options list with checkboxes
        function rebuildOptions() {
            menu.innerHTML = '';
            Array.from(select.options).forEach((option) => {
                if (option.value === "") return; // Skip "All" placeholder option in multiselect menu

                // Restore selection state
                if (selectedValues.has(option.value)) {
                    option.selected = true;
                } else if (option.selected) {
                    selectedValues.add(option.value);
                }

                const optEl = document.createElement('div');
                optEl.className = `custom-select-option ${option.selected ? 'selected' : ''}`;
                optEl.dataset.value = option.value;
                optEl.innerHTML = `
                    <div class="flex items-center gap-2">
                        <span class="custom-select-option-checkbox">
                            <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                        </span>
                        <span>${option.textContent}</span>
                    </div>
                `;

                optEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    option.selected = !option.selected;
                    
                    if (option.selected) {
                        selectedValues.add(option.value);
                    } else {
                        selectedValues.delete(option.value);
                    }
                    
                    optEl.classList.toggle('selected', option.selected);
                    
                    // Dispatch change event to trigger reports re-render
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                    updateTriggerLabel();
                });

                menu.appendChild(optEl);
            });
            updateTriggerLabel();
        }

        // Function to update the visible label and selected styling
        function updateTriggerLabel() {
            const selectedOptions = Array.from(select.options).filter(opt => opt.selected && opt.value !== '');
            if (selectedOptions.length === 0) {
                label.textContent = select.placeholder || '-- Tất cả sản phẩm --';
            } else if (selectedOptions.length <= 2) {
                label.textContent = selectedOptions.map(opt => opt.textContent).join(', ');
            } else {
                label.textContent = `Đã chọn ${selectedOptions.length} sản phẩm`;
            }

            // Sync visual checkbox states
            const optionEls = menu.querySelectorAll('.custom-select-option');
            optionEls.forEach(opt => {
                const correspondingOption = Array.from(select.options).find(o => o.value === opt.dataset.value);
                if (correspondingOption && correspondingOption.selected) {
                    opt.classList.add('selected');
                } else {
                    opt.classList.remove('selected');
                }
            });
        }

        // Event listeners
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = menu.classList.contains('show');
            closeAllDropdowns();
            if (!isOpen) {
                // Check if there is enough space below trigger (approx 250px)
                const rect = trigger.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                if (spaceBelow < 250 && spaceAbove > spaceBelow) {
                    menu.classList.add('open-upward');
                } else {
                    menu.classList.remove('open-upward');
                }
                menu.classList.add('show');
                trigger.classList.add('active');
            }
        });

        // Sync visual display when value changes natively or programmatically
        select.addEventListener('change', updateTriggerLabel);
        select.addEventListener('custom-value-set', updateTriggerLabel);

        // Rebuild when the <select>'s options change dynamically
        const observer = new MutationObserver(rebuildOptions);
        observer.observe(select, { childList: true });

        // Initialize display
        rebuildOptions();
    }

    // Initialize function
    window.initializeAllCustomControls = function() {
        // Normal selects
        document.querySelectorAll('select:not([multiple])').forEach(initSingleSelect);

        // Multiple select
        document.querySelectorAll('select[multiple]').forEach(initMultiSelect);
    };

    // Auto run on load
    document.addEventListener('DOMContentLoaded', () => {
        // Run immediately
        window.initializeAllCustomControls();

        // Also double check and init on any modal popup to handle dynamically inserted nodes or delayed states
        const modalToggleObserver = new MutationObserver(() => {
            window.initializeAllCustomControls();
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modalToggleObserver.observe(modal, { attributes: true, attributeFilter: ['class'] });
        });
    });
})();
