import fs from 'fs';
import path from 'path';
import categoryStore from '../assets/js/categoryStore.js';
import hiddenStore from '../assets/js/hiddenStore2.js';

// Real template, so tests catch drift (e.g. a renamed #category element)
// that would break the frontend wiring. Go template syntax is stripped since
// jsdom only needs the static markup.
const indexTemplate = fs
    .readFileSync(path.join(__dirname, '../templates/index.html'), 'utf8')
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

export function renderIndexWithStories(stories) {
    localStorage.clear();
    categoryStore._reloadFromStorage();
    hiddenStore._reloadFromStorage();
    global.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve(stories)
    });
    const parsedTemplate = new DOMParser().parseFromString(indexTemplate, 'text/html');
    document.body.innerHTML = parsedTemplate.body.innerHTML;
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
