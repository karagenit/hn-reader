export default class UndoComponentBase extends HTMLElement {
    emitReloadList(triggeringAction) {
        this.dispatchEvent(new CustomEvent('storyListReload', {
            detail: { triggeringAction },
            bubbles: true
        }));
    }
}
