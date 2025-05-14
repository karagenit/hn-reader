import categoryStore from "./categoryStore.js";

// TODO two child classes of main- and story- selectors?
// Would be nice if we could just extend the select element but apparently not all browsers support that
export default class CategorySelector extends HTMLElement {
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

    static get observedAttributes() {
        return ['value'];
    }

    attributeChangedCallback(name, _, value) {
        if (name === 'value') {
            this.value = value;
        }
    }
    
    get options() {
        // Turn the list of strings into a list of { 'category': 'category' } objs
        let categories = categoryStore.categories;
        categories = categories.map(
            (category) => ({ label: category, value: category })
        );
        categories.unshift({ label: 'Uncategorized', value: '' })
        return categories;
    }
}

customElements.define('category-selector', CategorySelector);