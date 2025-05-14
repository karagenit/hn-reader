import CategorySelector from "./categorySelector.js";
import categoryStore from "./categoryStore.js";

export default class ToolbarCategorySelector extends CategorySelector {
    connectedCallback() {
        super.connectedCallback();
        this.value = categoryStore.lastCategory;
        this.selectElement.addEventListener('change', () => {
            categoryStore.lastCategory = this.value;
            this.dispatchEvent(new CustomEvent('storyListReload', {
                bubbles: true
            }))
        });
    }
}

customElements.define('toolbar-category-selector', ToolbarCategorySelector);
