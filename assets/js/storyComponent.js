
class StoryComponent extends HTMLElement {
    #storyData;

    constructor() {
        super();
        // this.attachShadow({ mode: 'open' });
    }

    get storyData() {
        return this.#storyData;
    }

    set storyData(storyData) {
        this.#storyData = storyData;
        this.render();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        // TODO move styles here
        if (this.storyData) {
            this.innerHTML = `
                <div class="story" id="id-${this.storyData.id}">
                    <span class="close-button" id="${this.storyData.id}">☒</span>
                    <p>
                        <a class="story-link" href="${this.storyData.link}">
                            <span class="story-score">${this.storyData.score}</span>
                            ${this.storyData.title}
                        </a>
                        <a class="story-comments" href="${this.storyData.comments}">
                            ${this.storyData.descendants} comments
                        </a>
                    </p>
                    <hr>
                    <p class="domain">
                        <span>${this.storyData.domain}</span>
                        <category-selector id="${this.storyData.id}"></category-selector>
                    </p>
                </div>
            `;
        }
    }
}

// Do we need to export this as a function? Or can we just rip it?
export const defineStoryComponent = () => {
    customElements.define('x-story', StoryComponent);
}