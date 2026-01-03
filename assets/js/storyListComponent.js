import categoryStore from "./categoryStore.js";
import hiddenStore from "./hiddenStore.js";
import StoryComponent from "./storyComponent.js";
import UndoComponent from "./undoComponent.js";

export default class StoryListComponent extends HTMLElement {
    #storyListData;
    #apiPromise;
    #lastAction = {};

    constructor() {
        super();
        this.#apiPromise = fetch('/stories');
    }

    connectedCallback() {
        this.fetchData();
        window.addEventListener('storyListReload', (event) => {
            this.#lastAction = event?.detail?.triggeringAction; // ?? this.#lastAction;
            this.render();
        }, false);
    }

    async fetchData() {
        const result = await this.#apiPromise;
        this.#storyListData = await result.json();
        this.render();
    }

    render() {
        if (!this.#storyListData) {
            // TODO make this a lil nicer...
            this.innerHTML = '<p>&nbsp;&nbsp;&nbsp;Loading stories...</p>';
            return;
        }

        this.innerHTML = ''

        let currentCategory = document.getElementById("category").value

        // Only show stories in this category and not hidden, unless that one was just acted on so we can show it's undo
        let filteredStories = this.#storyListData.filter(story => {
            const hasId = !!story.id;
            const wasLastActedOn = this.#lastAction?.storyId == story.id;
            const isInCurrentCategory = currentCategory === categoryStore.getCategoryForDomain(story['domain']);
            const isNotHidden = !hiddenStore.isStoryHidden(story['id'])
            return hasId && (wasLastActedOn || (isInCurrentCategory && isNotHidden));
        })
    
        if (window.location.hash.startsWith('#id-')) {
            const storyId = parseInt(window.location.hash.slice(4));
            const storyIndex = filteredStories.findIndex(story => story.id === storyId);
            if (storyIndex !== -1) {
                const [story] = filteredStories.splice(storyIndex, 1);
                filteredStories.unshift(story);
            }
        }

        const storiesToDisplay = filteredStories.slice(0, 10);
        storiesToDisplay.forEach(story => {
            if (story.id == this.#lastAction?.storyId) {
                // In this case, we don't want to render the actual story, we want to show it's undo button
                const undoElement = document.createElement('undo-component');
                undoElement.lastAction = this.#lastAction;
                this.append(undoElement);
            } else {
                const storyElement = document.createElement('x-story');
                this.append(storyElement); // would rather use a fragment and append all at once, but attaching listeners doesn't work until they're on the DOM
                storyElement.storyData = story;

                // TODO migrate these to their own 'story-link' web components
                // storyElement.querySelector(`a[href="${story.link}"]`).addEventListener('click', () => {
                //     history.replaceState(null, '', '/#id-' + story.id);
                //     return true;
                // }, false);

                // storyElement.querySelector(`a[href="${story.comments}"]`).addEventListener('click', () => {
                //     history.replaceState(null, '', '/#id-' + story.id);
                //     return true;
                // }, false);
            }
        });
    }
}

customElements.define('x-story-list', StoryListComponent);