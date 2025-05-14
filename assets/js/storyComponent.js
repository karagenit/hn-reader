import StoryCategorySelector from "./storyCategorySelectorComponent.js";

export default class StoryComponent extends HTMLElement {
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
        this.addEventListener('storyCategoryChange', (e) => console.log(e), false);
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
                        <story-category-selector id="${this.storyData.id}"></category-selector>
                    </p>
                </div>
            `;
        }
    }
}

customElements.define('x-story', StoryComponent);