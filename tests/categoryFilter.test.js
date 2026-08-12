import categoryStore from '../assets/js/categoryStore.js';
import '../assets/js/index.js';
import { renderIndexWithStories, flushPromises, stories } from './testHelpers.js';

beforeEach(() => {
    renderIndexWithStories(stories);
    categoryStore.moveDomainToCategory('tech.example.com', 'Technology');
    categoryStore.moveDomainToCategory('biz.example.com', 'Business');
});

test('switching the top-level category filters the story list', async () => {
    await flushPromises();

    const toolbarSelect = document.querySelector('#category select');
    const storyList = document.querySelector('x-story-list');
    const titlesShown = () =>
        Array.from(storyList.querySelectorAll('x-story')).map(
            (el) => el.storyData.title
        );

    toolbarSelect.value = 'Technology';
    toolbarSelect.dispatchEvent(new Event('change', { bubbles: true }));
    expect(titlesShown()).toEqual(['A tech story']);

    toolbarSelect.value = 'Business';
    toolbarSelect.dispatchEvent(new Event('change', { bubbles: true }));
    expect(titlesShown()).toEqual(['A business story']);

    toolbarSelect.value = '';
    toolbarSelect.dispatchEvent(new Event('change', { bubbles: true }));
    expect(titlesShown()).toEqual(['An uncategorized story']);
});
