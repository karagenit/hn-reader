import CategorySelector from "./categorySelector.js";

export default class StoryCategorySelector extends CategorySelector {
    connectedCallback() {
        super.connectedCallback();
        this.selectElement.addEventListener('change', () => {
            this.dispatchEvent(
                new CustomEvent('storyCategoryChange', {
                    detail: {
                        category: this.value
                    },
                    bubbles: true
                })
            )
        });
    }
}

customElements.define('story-category-selector', StoryCategorySelector);
