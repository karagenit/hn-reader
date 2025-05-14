import StoryCategorySelector from "./storyCategorySelectorComponent.js";
import StoryHideButton from "./storyHideButtonComponent.js";
import categoryStore from "./categoryStore.js";
import hiddenStore from "./hiddenStore.js";

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
        // Or storyList can use the ID to lookup that story's domain?
        this.addEventListener('storyCategoryChange', (event) => {
            categoryStore.moveDomainToCategory(this.#storyData.domain, event.detail.category);
            this.emitReloadList();
        }, false);

        this.addEventListener('storyHide', () => {
            hiddenStore.hideStory(this.storyData.id);
            this.emitReloadList();
        }, false);
    }

    emitReloadList() {
        this.dispatchEvent(new CustomEvent('storyListReload', {
            bubbles: true
        }));
    }

    render() {
        // TODO move styles here
        if (this.storyData) {
            const categorySelectorValue = categoryStore.getCategoryForDomain(this.storyData.domain);
            this.innerHTML = `
                <div class="story" id="id-${this.storyData.id}">
                    <story-hide-button></story-hide-button>
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
                        <story-category-selector value="${categorySelectorValue}"></story-category-selector>
                    </p>
                </div>
            `;
        }
    }
}

customElements.define('x-story', StoryComponent);