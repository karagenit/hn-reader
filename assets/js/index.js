import { defineCategorySelector } from "./categorySelector.js";

let stories = [];
let categories = {
    "Technology": [],
    "Interesting": [],
    "Business": [],
    "Science": [],
    "Projects & Companies": [],
    "Garbage": []
}

let storedCategories = localStorage.getItem("categories");

if (storedCategories) {
    categories = JSON.parse(storedCategories)
}

// Map of Date -> Array of story IDs
let hiddenStories = {};

let storedHiddenStories = localStorage.getItem("hiddenStories");

if (storedHiddenStories) {
    hiddenStories = JSON.parse(storedHiddenStories);
}

const getHiddenStories = function() {
    return Object.keys(hiddenStories).map(date => {
        return hiddenStories[date];
    }).flat();
}

const addHiddenStory = function(id) {
    let today = getTodayDayNumber()
    if (!hiddenStories[today]) {
        hiddenStories[today] = []
    }
    hiddenStories[today].push(parseInt(id));
}

const saveHiddenStories = function() {
    // Only save the last 7 days worth of hidden stories so we don't blow up our local storage over time
    let today = getTodayDayNumber()
    Object.keys(hiddenStories).forEach(date => {
        if (date < today - 7) {
            delete hiddenStories[date];
        }
    });
    localStorage.setItem('hiddenStories', JSON.stringify(hiddenStories))
}

const getTodayDayNumber = function() {
    return Math.floor(Date.now() / (1000 * 60 * 60 * 24));
}

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

    Object.keys(categories).forEach(category => {
        let i = categories[category].indexOf(domain)
        if (i > -1) {
            categories[category].splice(i, 1) // remove 1 element at this index
        }
    })

    // Add the domain to the newly selected category, unless it's the Uncategorized category (which doesn't exist in our map)
    if (categories[category]) {
        categories[category].push(domain)
    }

    displayStories()

    localStorage.setItem('categories', JSON.stringify(categories))
}

const handleHideStory = function(button) {
    let id = button.id
    addHiddenStory(id)
    displayStories()
    saveHiddenStories()
}

const appendSelectOptions = function(element) {
    let uncategorized = document.createElement("option")
    uncategorized.value = ''
    uncategorized.text = 'Uncategorized'
    element.appendChild(uncategorized)

    Object.keys(categories).forEach(category => {
        let opt = document.createElement("option")
        opt.value = category
        opt.text = category
        element.appendChild(opt)
    });
}

const getDomainCategory = function(domain) {
    return Object.keys(categories).find(category => categories[category].includes(domain)) ?? ''
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
                <select id="${story.id}"></select>
            </p>
        </div>
    `;

    const container = document.getElementById("content");
    container.insertAdjacentHTML('beforeend', storyHtml);

    const storyElement = container.lastElementChild;
    const closeButton = storyElement.querySelector('.close-button');
    const linkElement = storyElement.querySelector(`a[href="${story.link}"]`);
    const commentsElement = storyElement.querySelector(`a[href="${story.comments}"]`);
    const selectElement = storyElement.querySelector('select');

    closeButton.addEventListener('click', () => handleHideStory(closeButton), false);
    linkElement.addEventListener('click', () => handleClickStory(story.id, story.comments), false);
    commentsElement.addEventListener('click', () => handleClickStory(story.id, story.comments), false);

    appendSelectOptions(selectElement);
    selectElement.addEventListener('change', () => handleCategorizeStory(selectElement), false);
    selectElement.value = getDomainCategory(story.domain);
}

const displayStories = function() {
    let hiddenIds = getHiddenStories()
    document.getElementById("content").innerHTML = ''
    let currentCategory = document.getElementById("category").value

    let filteredStories = stories.filter(story => {
        return currentCategory === getDomainCategory(story['domain'])
    }).filter(story => {
        return !hiddenIds.includes(story['id'])
    });

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

const handleMainCategoryChange = function() {
    const categorySelect = document.getElementById("category");
    localStorage.setItem("lastCategory", categorySelect.value);
    displayStories();
}

document.addEventListener('DOMContentLoaded', function() {
    defineCategorySelector();

    // appendSelectOptions(document.getElementById("category"));
    document.getElementById("category").addEventListener('change', handleMainCategoryChange, false);

    // const lastCategory = localStorage.getItem('lastCategory');
    // const categorySelect = document.getElementById("category");
    // // TODO could just use Object.keys(categories) instead of categorySelect.options...
    // if (lastCategory && Array.from(categorySelect.options).some(option => option.value === lastCategory)) {
    //     categorySelect.value = lastCategory;
    // }
    
    loadValues()
});