export default class UndoComponent extends HTMLElement {
    set lastAction(lastAction) {
        if (lastAction?.name === 'hide') {
            this.innerHTML = `<div>undo hide</div>`;
        } else if (lastAction?.name === 'categorize') {
            this.innerHTML = `<div>undo categorize</div>`;
        }
    }
}

customElements.define('undo-component', UndoComponent);
