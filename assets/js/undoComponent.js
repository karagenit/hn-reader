export default class UndoComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div>Undo</div>
        `;
        
        // hideButton.addEventListener('click', () => {
        //     this.dispatchEvent(new CustomEvent('storyHide', {
        //         detail: {},
        //         bubbles: true
        //     }));
        // });
    }
}

customElements.define('undo-component', UndoComponent);
