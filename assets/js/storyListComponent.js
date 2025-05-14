import categoryStore from "./categoryStore.js";
import hiddenStore from "./hiddenStore.js";
import StoryComponent from "./storyComponent.js";

export default class StoryListComponent extends HTMLElement {
    #storyListData;
    #apiPromise;

    constructor() {
        super();
        this.#apiPromise = fetch('/stories');
    }

    connectedCallback() {
        this.fetchData();
        document.getElementById('category').addEventListener('change', this.render.bind(this), false);
        this.addEventListener('storyCategoryChange', this.render.bind(this), false);
    }

    async fetchData() {
        const result = await this.#apiPromise;
        this.#storyListData = await result.json();
        this.render();
    }

    render() {
        this.innerHTML = ''

        let currentCategory = document.getElementById("category").value
    
        // TODO also filter by having a valid ID and title
        let filteredStories = this.#storyListData.filter(story => {
            return currentCategory === categoryStore.getCategoryForDomain(story['domain'])
        }).filter(story => !hiddenStore.isStoryHidden(story['id']));
    
        // if (window.location.hash.startsWith('#id-')) {
        //     const storyId = parseInt(window.location.hash.slice(4));
        //     const storyIndex = filteredStories.findIndex(story => story.id === storyId);
        //     if (storyIndex !== -1) {
        //         const [story] = filteredStories.splice(storyIndex, 1);
        //         filteredStories.unshift(story);
        //     }
            
        // }


        const storiesToDisplay = filteredStories.slice(0, 10);
        storiesToDisplay.forEach(story => {
            const storyElement = document.createElement('x-story');
            this.append(storyElement); // would rather use a fragment and append all at once, but attaching listeners doesn't work until they're on the DOM
            storyElement.storyData = story;
        
            storyElement.querySelector('.close-button').addEventListener('click', () => {
                hiddenStore.hideStory(story.id);
                this.render();
            }, false);

            storyElement.querySelector(`a[href="${story.link}"]`).addEventListener('click', () => {
                history.replaceState(null, '', '/#id-' + story.id);
                return true;
            }, false);

            storyElement.querySelector(`a[href="${story.comments}"]`).addEventListener('click', () => {
                history.replaceState(null, '', '/#id-' + story.id);
                return true;
            }, false);

            // const selectElement = storyElement.querySelector('story-category-selector');
            // selectElement.value = categoryStore.getCategoryForDomain(story.domain);
        });
    }
}

customElements.define('x-story-list', StoryListComponent);