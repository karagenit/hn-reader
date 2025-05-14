import categoryStore from "./categoryStore.js";

// Would be nice if we could just extend the select element but apparently not all browsers support that
class CategorySelector extends HTMLElement {
    static observedAttributes = ['value'];

    connectedCallback() {
        const select = document.createElement('select');
        this.options.forEach(({ label, value }) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            select.appendChild(option);
        });

        this.appendChild(select);
    }

    get value() {
        return this.querySelector('select').value;
    }

    set value(value) {
        this.querySelector('select').value = value;
    }

    get options() {
        // Turn the list of strings into a list of { 'category': 'category' } objs
        let categories = categoryStore.getCategories();
        categories = categories.map(
            (category) => ({ label: category, value: category })
        );
        categories.unshift({ label: 'Uncategorized', value: '' })
        return categories;
    }

    attributeChangedCallback(name, _, value) {
        if (name === 'value') {
            this.querySelector('select').value = value;
        }
    }
}

export const defineCategorySelector = () => {
    customElements.define('category-selector', CategorySelector);
}