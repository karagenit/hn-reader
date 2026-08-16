import fs from 'fs';
import path from 'path';
import categoryStore from '../assets/js/categoryStore.js';
import hiddenStore from '../assets/js/hiddenStore.js';
import viewStore from '../assets/js/viewStore.js';

// Real template, so tests catch drift (e.g. a renamed #view element)
// that would break the frontend wiring. Go template syntax is stripped since
// jsdom only needs the static markup.
const indexTemplate = fs
    .readFileSync(path.join(__dirname, '../templates/index.html'), 'utf8')
    .replace(/{{.*?}}/g, '');

const settingsTemplate = fs
    .readFileSync(path.join(__dirname, '../templates/settings.html'), 'utf8')
    .replace(/{{.*?}}/g, '');

export const stories = [
    {
        id: 1,
        title: 'A tech story',
        link: 'https://tech.example.com/story',
        comments: 'https://news.ycombinator.com/item?id=1',
        domain: 'tech.example.com',
        score: 42,
        descendants: 3
    },
    {
        id: 2,
        title: 'A business story',
        link: 'https://biz.example.com/story',
        comments: 'https://news.ycombinator.com/item?id=2',
        domain: 'biz.example.com',
        score: 10,
        descendants: 1
    },
    {
        id: 3,
        title: 'An uncategorized story',
        link: 'https://other.example.com/story',
        comments: 'https://news.ycombinator.com/item?id=3',
        domain: 'other.example.com',
        score: 5,
        descendants: 0
    }
];

// `views` is optional — omit it to get the default 1:1 category-to-view migration.
export function renderIndexWithStories(stories, views) {
    localStorage.clear();
    if (views) {
        localStorage.setItem('views', JSON.stringify(views));
    }
    categoryStore._reloadFromStorage();
    viewStore._reloadFromStorage();
    hiddenStore._reloadFromStorage();
    global.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve(stories)
    });
    const parsedTemplate = new DOMParser().parseFromString(indexTemplate, 'text/html');
    document.body.innerHTML = parsedTemplate.body.innerHTML;
}

// settings.js reads localStorage and wires up the DOM at import time, so both
// have to be in place first, and the module cache reset so each test re-runs it.
export async function renderSettingsWithCategories(categories, views) {
    localStorage.clear();
    localStorage.setItem('categories', JSON.stringify(categories));
    if (views) {
        localStorage.setItem('views', JSON.stringify(views));
    }
    const parsedTemplate = new DOMParser().parseFromString(settingsTemplate, 'text/html');
    document.body.innerHTML = parsedTemplate.body.innerHTML;
    jest.resetModules();
    await import('../assets/js/settings.js');
}

export function storedCategories() {
    return JSON.parse(localStorage.getItem('categories'));
}

export function storedViews() {
    return JSON.parse(localStorage.getItem('views'));
}

// The name input of a view row, and the checkbox for `category` within it.
export function viewInput(name) {
    return document.querySelector(`#views input[id="view-${name}"]`);
}

// The trailing blank row, i.e. the last one — not `:last-child`, since the
// save button is the last element inside <view-settings>.
function lastViewRow() {
    return Array.from(document.querySelectorAll('#views .view')).pop();
}

export function newViewInput() {
    return lastViewRow().querySelector('input[type="text"]');
}

export function viewCategoryCheckbox(view, category) {
    const row = view === '' ? lastViewRow() : viewInput(view).closest('.view');
    return row.querySelector(`input[type="checkbox"][value="${category}"]`);
}

export function saveViews() {
    document.getElementById('saveViews').dispatchEvent(new Event('click', { bubbles: true }));
}

// The category inputs, keyed by the name they currently hold. The trailing
// blank input for adding a new category has no id, hence the separate helper.
export function categoryInput(name) {
    return document.querySelector(`#content input[id="${name}"]`);
}

export function newCategoryInput() {
    return document.querySelector('#content input:not([id])');
}

export function saveSettings() {
    document.getElementById('save').dispatchEvent(new Event('click', { bubbles: true }));
}

export async function flushPromises() {
    await Promise.resolve();
    await Promise.resolve();
}

export function titlesShown() {
    return Array.from(document.querySelectorAll('x-story')).map(
        (el) => el.storyData.title
    );
}
