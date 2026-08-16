import ViewSelector from "./viewSelector.js";
import viewStore from "./viewStore.js";

export default class ToolbarViewSelector extends ViewSelector {
    connectedCallback() {
        super.connectedCallback();
        this.value = viewStore.lastView;
        this.selectElement.addEventListener('change', () => {
            viewStore.lastView = this.value;
            this.dispatchEvent(new CustomEvent('storyListReload', {
                bubbles: true
            }))
        });
    }
}

customElements.define('toolbar-view-selector', ToolbarViewSelector);
