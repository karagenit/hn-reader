import hiddenStore from "./hiddenStore.js";
import UndoComponentBase from "./undoComponentBase.js";

export default class UndoComponent extends UndoComponentBase {
    set lastAction(lastAction) {
        this.innerHTML = `<div class="story"><p>Story Hidden <span class="undo-action">[undo]</span></p></div>`;
        this.querySelector('.undo-action').addEventListener('click', () => {
            hiddenStore.unhideStory(lastAction.storyId);
            this.emitReloadList();
        });
    }
}

customElements.define('undo-component', UndoComponent);
