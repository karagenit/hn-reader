import viewStore from "./viewStore.js";

// The main page filter. Same shape as CategorySelector, but its options are
// views rather than raw categories.
export default class ViewSelector extends HTMLElement {
    connectedCallback() {
        const select = document.createElement('select');
        this.options.forEach(({ label, value }) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            select.appendChild(option);
        });
        select.value = this.getAttribute('value') ?? '';
        this.appendChild(select);
    }

    get selectElement() {
        return this.querySelector('select')
    }

    get value() {
        return this.selectElement?.value;
    }

    set value(value) {
        if (this.selectElement) {
            this.selectElement.value = value;
        }
    }

    get options() {
        const views = viewStore.views.map(
            (view) => ({ label: view, value: view })
        );
        views.unshift({ label: 'Uncategorized', value: '' })
        return views;
    }
}

customElements.define('view-selector', ViewSelector);
