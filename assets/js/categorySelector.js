import categoryStore from "./categoryStore.js";

// Would be nice if we could just extend the select element but apparently not all browsers support that
class CategorySelector extends HTMLElement {
    connectedCallback() {
        const select = document.createElement('select');
        // todo uncategorized option too
        categoryStore.getCategories().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
        this.appendChild(select);
    }

    get value() {
        return this.querySelector('select').value;
    }
}

export const defineCategorySelector = () => {
    customElements.define('category-selector', CategorySelector);
}