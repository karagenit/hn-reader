import StoryCategorySelector from "./storyCategorySelectorComponent.js";
import StoryHideButton from "./storyHideButtonComponent.js";
import categoryStore from "./categoryStore.js";
import hiddenStore from "./hiddenStore2.js";

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
        this.addEventListener('storyCategoryChange', (event) => {
            const oldCategory = categoryStore.getCategoryForDomain(this.storyData.domain);
            categoryStore.moveDomainToCategory(this.storyData.domain, event.detail.category);
            this.emitReloadList({
                triggeringAction: {
                    name: 'categorize',
                    storyId: this.storyData.id,
                    domain: this.storyData.domain,
                    oldCategory,
                    newCategory: event.detail.category
                }
            });
        }, false);

        this.addEventListener('storyHide', () => {
            hiddenStore.hideStory(this.storyData.id);
            this.emitReloadList({
                triggeringAction: {
                    name: 'hide',
                    storyId: this.storyData.id
                }
            });
        }, false);
    }

    emitReloadList(detail) {
        this.dispatchEvent(new CustomEvent('storyListReload', {
            detail,
            bubbles: true
        }));
    }

    render() {
        // TODO move styles here
        if (this.storyData) {
            const categorySelectorValue = categoryStore.getCategoryForDomain(this.storyData.domain);
            const isLastClicked = window.location.hash === `#id-${this.storyData.id}`;
            this.innerHTML = `
                <div class="story${isLastClicked ? ' story-last-clicked' : ''}" id="id-${this.storyData.id}">
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