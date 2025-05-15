export default class StoryLinkComponent extends HTMLElement {
    connectedCallback() {
        const a = document.createElement('a');
        a.href = this.getAttribute('href');
        a.innerHTML = this.innerHTML;
        this.innerHTML = '';
        this.appendChild(a);
        // TODO this doesn't actually work. This returns true before storyLinkClicked manages to be handled.
        a.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('storyLinkClick', {
                bubbles: true
            }));
            return true; // make the link click actually happen
        })
    }
}

customElements.define('hn-story-link', StoryLinkComponent);