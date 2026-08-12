import hiddenStore from "./hiddenStore2.js";
import UndoComponentBase from "./undoComponentBase.js";

export default class UndoComponent extends UndoComponentBase {
    set lastAction(lastAction) {
        this.innerHTML = `<div class="story"><p>Story Hidden (click to undo)</p></div>`;
        this.querySelector('div').addEventListener('click', () => {
            hiddenStore.unhideStory(lastAction.storyId);
            this.emitReloadList();
        });
    }
}

customElements.define('undo-component', UndoComponent);
