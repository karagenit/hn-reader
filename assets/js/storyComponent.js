import StoryCategorySelector from "./storyCategorySelectorComponent.js";
import categoryStore from "./categoryStore.js";

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
        // TODO don't really like that we have this event handled both in story and storyList
        // Maybe domain should be stored in storyCategorySelector and it can update the store?
        this.addEventListener('storyCategoryChange', (event) => {
            categoryStore.moveDomainToCategory(this.#storyData.domain, event.detail.category);
        }, false);
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
            // TODO set category selector value here?
        }
    }
}

customElements.define('x-story', StoryComponent);