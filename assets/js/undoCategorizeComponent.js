import categoryStore from "./categoryStore.js";
import UndoComponentBase from "./undoComponentBase.js";
import "./categorySelector.js";

export default class UndoCategorizeComponent extends UndoComponentBase {
    set lastAction(lastAction) {
        this.innerHTML = `
            <div class="story">
                <p>
                    Categorized to <category-selector value="${lastAction.newCategory ?? ''}"></category-selector>
                    (<span class="undo-action">undo</span>)
                </p>
            </div>
        `;
        this.querySelector('category-selector').addEventListener('change', (event) => {
            categoryStore.moveDomainToCategory(lastAction.domain, event.target.value);
            if (event.target.value === lastAction.oldCategory) {
                // Back to where it started - no longer a pending change to undo.
                this.emitReloadList();
            } else {
                // Keep showing the undo tile (with the newly picked category), rather
                // than letting it fall back to normal filtering and disappear from view.
                this.emitReloadList({ ...lastAction, newCategory: event.target.value });
            }
        });
        this.querySelector('.undo-action').addEventListener('click', () => {
            categoryStore.moveDomainToCategory(lastAction.domain, lastAction.oldCategory);
            this.emitReloadList();
        });
    }
}

customElements.define('undo-categorize-component', UndoCategorizeComponent);
