import fs from 'fs';
import path from 'path';
import categoryStore from '../assets/js/categoryStore.js';
import '../assets/js/index.js';

// Real template, so this test catches drift (e.g. a renamed #category element)
// that would break the frontend wiring. Go template syntax is stripped since
// jsdom only needs the static markup.
const indexTemplate = fs
    .readFileSync(path.join(__dirname, '../templates/index.html'), 'utf8')
    .replace(/{{.*?}}/g, '');

const stories = [
    {
        id: 1,
        title: 'A cool story',
        link: 'https://example.com/story',
        comments: 'https://news.ycombinator.com/item?id=1',
        domain: 'example.com',
        score: 42,
        descendants: 3
    }
];

beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve(stories)
    });
    const parsedTemplate = new DOMParser().parseFromString(indexTemplate, 'text/html');
    document.body.innerHTML = parsedTemplate.body.innerHTML;
});

async function flushPromises() {
    await Promise.resolve();
    await Promise.resolve();
}

test('selecting a category for a story updates the category store', async () => {
    await flushPromises();

    expect(categoryStore.getCategoryForDomain('example.com')).toBe('');

    const storySelect = document
        .querySelector('x-story story-category-selector')
        .querySelector('select');

    storySelect.value = 'Technology';
    storySelect.dispatchEvent(new Event('change', { bubbles: true }));

    expect(categoryStore.getCategoryForDomain('example.com')).toBe('Technology');
});
