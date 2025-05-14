import { defineCategorySelector } from "./categorySelector.js";
import categoryStore from "./categoryStore.js";
import hiddenStore from "./hiddenStore.js";

let stories = [];

const loadValues = async function() {
    let res = await fetch('/stories')
    stories = await res.json()
    displayStories()
}

const handleCategorizeStory = function(sel) {
    let id = sel.id
    let category = sel.value
    let story = stories.find(story => story.id == id) // == not === because story.id is an int but id is a string
    let domain = story['domain']

    categoryStore.moveDomainToCategory(domain, category);

    displayStories()
}

const handleHideStory = function(button) {
    let id = button.id
    hiddenStore.hideStory(id)
    displayStories()
}

const appendSelectOptions = function(element) {
    let uncategorized = document.createElement("option")
    uncategorized.value = ''
    uncategorized.text = 'Uncategorized'
    element.appendChild(uncategorized)

    categoryStore.categories.forEach(category => {
        let opt = document.createElement("option")
        opt.value = category
        opt.text = category
        element.appendChild(opt)
    });
}

const handleClickStory = function(id, comments_url) {
    history.replaceState(null, '', '/#id-' + id)
    // TODO not allowed, need to create my own /redirect?comments=url endpoint to handle this ugh
    //history.pushState(null, "", comments_url);
    return true;
}

const appendStory = function(story) {
    const storyHtml = `
        <div class="story" id="id-${story.id}">
            <span class="close-button" id="${story.id}">☒</span>
            <p>
                <a class="story-link" href="${story.link}">
                    <span class="story-score">${story.score}</span>
                    ${story.title}
                </a>
                <a class="story-comments" href="${story.comments}">
                    ${story.descendants} comments
                </a>
            </p>
            <hr>
            <p class="domain">
                <span>${story.domain}</span>
                <category-selector id="${story.id}"></category-selector>
            </p>
        </div>
    `;

    const container = document.getElementById("content");
    container.insertAdjacentHTML('beforeend', storyHtml);

    const storyElement = container.lastElementChild;
    const closeButton = storyElement.querySelector('.close-button');
    const linkElement = storyElement.querySelector(`a[href="${story.link}"]`);
    const commentsElement = storyElement.querySelector(`a[href="${story.comments}"]`);
    const selectElement = storyElement.querySelector('category-selector');

    closeButton.addEventListener('click', () => handleHideStory(closeButton), false);
    linkElement.addEventListener('click', () => handleClickStory(story.id, story.comments), false);
    commentsElement.addEventListener('click', () => handleClickStory(story.id, story.comments), false);

    // appendSelectOptions(selectElement);
    selectElement.addEventListener('change', () => handleCategorizeStory(selectElement), false);
    selectElement.value = categoryStore.getCategoryForDomain(story.domain);
}

const displayStories = function() {
    document.getElementById("content").innerHTML = ''
    let currentCategory = document.getElementById("category").value

    let filteredStories = stories.filter(story => {
        return currentCategory === categoryStore.getCategoryForDomain(story['domain'])
    }).filter(story => !hiddenStore.isStoryHidden(story['id']));

    if (window.location.hash.startsWith('#id-')) {
        const storyId = parseInt(window.location.hash.slice(4));
        const storyIndex = filteredStories.findIndex(story => story.id === storyId);
        if (storyIndex !== -1) {
            const [story] = filteredStories.splice(storyIndex, 1);
            filteredStories.unshift(story);
        }
        
    }
    
    filteredStories.slice(0, 10).forEach(story => appendStory(story));
}

document.addEventListener('DOMContentLoaded', function() {
    defineCategorySelector();
    const mainCategorySelector = document.getElementById("category");
    mainCategorySelector.addEventListener('change', displayStories, false);
    mainCategorySelector.addEventListener('change', (event) => {
        categoryStore.lastCategory = event.target.value;
    }, false);
    mainCategorySelector.value = categoryStore.lastCategory;
    
    loadValues()
});