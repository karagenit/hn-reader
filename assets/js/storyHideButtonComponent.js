export default class StoryHideButton extends HTMLElement {
    connectedCallback() {
        const hideButton = document.createElement('span');
        hideButton.className = 'close-button';
        hideButton.textContent = '☒';
        this.appendChild(hideButton);
        
        hideButton.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('storyHide', {
                detail: {},
                bubbles: true
            }));
        });
    }
}

customElements.define('story-hide-button', StoryHideButton);
