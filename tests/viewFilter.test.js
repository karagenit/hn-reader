import categoryStore from '../assets/js/categoryStore.js';
import viewStore from '../assets/js/viewStore.js';
import '../assets/js/index.js';
import { renderIndexWithStories, flushPromises, stories, titlesShown } from './testHelpers.js';

beforeEach(() => {
    renderIndexWithStories(stories);
    categoryStore.moveDomainToCategory('tech.example.com', 'Technology');
    categoryStore.moveDomainToCategory('biz.example.com', 'Business');
});

test('with no stored views, each category is migrated to a view of the same name', () => {
    expect(viewStore.views).toEqual(categoryStore.categories);
    expect(viewStore.getCategoriesForView('Technology')).toEqual(['Technology']);
});

test('switching the top-level view filters the story list', async () => {
    await flushPromises();

    const toolbarSelect = document.querySelector('#view select');

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

test('a view spanning several categories shows stories from any of them', async () => {
    renderIndexWithStories(stories, { 'Work': ['Technology', 'Business'] });
    categoryStore.moveDomainToCategory('tech.example.com', 'Technology');
    categoryStore.moveDomainToCategory('biz.example.com', 'Business');
    await flushPromises();

    const toolbarSelect = document.querySelector('#view select');
    expect(Array.from(toolbarSelect.options).map((o) => o.value)).toEqual(['', 'Work']);

    toolbarSelect.value = 'Work';
    toolbarSelect.dispatchEvent(new Event('change', { bubbles: true }));
    expect(titlesShown()).toEqual(['A tech story', 'A business story']);
});
