import categoryStore from '../assets/js/categoryStore.js';
import '../assets/js/index.js';
import { renderIndexWithStories, flushPromises, stories } from './testHelpers.js';

beforeEach(() => {
    renderIndexWithStories(stories);
});

test('selecting a category for a story updates the category store', async () => {
    await flushPromises();

    expect(categoryStore.getCategoryForDomain('tech.example.com')).toBe('');

    const storySelect = document
        .querySelector('x-story story-category-selector')
        .querySelector('select');

    storySelect.value = 'Technology';
    storySelect.dispatchEvent(new Event('change', { bubbles: true }));

    expect(categoryStore.getCategoryForDomain('tech.example.com')).toBe('Technology');
});
