import hiddenStore from "./hiddenStore2.js";
import categoryStore from "./categoryStore.js";

export default class UndoComponent extends HTMLElement {
    set lastAction(lastAction) {
        const newCategoryName = !!lastAction.newCategory ? lastAction.newCategory : 'Uncategorized';
        if (lastAction?.name === 'hide') {
            this.innerHTML = `<div class="story"><p>Story Hidden (click to undo)</p></div>`;
        } else if (lastAction?.name === 'categorize') {
            this.innerHTML = `<div class="story"><p>Story Categorized to ${newCategoryName} (click to undo)</p></div>`;
        }
        this.querySelector('div')?.addEventListener('click', () => {
            if (lastAction?.name === 'hide') {
                hiddenStore.unhideStory(lastAction.storyId);
            } else if (lastAction?.name === 'categorize') {
                categoryStore.moveDomainToCategory(lastAction.domain, lastAction.oldCategory);
            }
            this.dispatchEvent(new CustomEvent('storyListReload', {
                bubbles: true
            }));
        })
    }
}

customElements.define('undo-component', UndoComponent);
