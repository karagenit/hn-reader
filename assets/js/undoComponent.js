export default class UndoComponent extends HTMLElement {
    #lastAction = {}
    set lastAction(lastAction) {
        this.#lastAction = lastAction;
        const newCategoryName = !!lastAction.newCategory ? lastAction.newCategory : 'Uncategorized';
        if (lastAction?.name === 'hide') {
            this.innerHTML = `<div class="story"><p>Story Hidden (click to undo)</p></div>`;
        } else if (lastAction?.name === 'categorize') {
            this.innerHTML = `<div class="story"><p>Story Categorized to ${newCategoryName} (click to undo)</p></div>`;
        }
        this.querySelector('div')?.addEventListener('click', () => {
            console.log(this.#lastAction);
        })
    }
}

customElements.define('undo-component', UndoComponent);
