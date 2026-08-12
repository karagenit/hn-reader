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

test('categorizing a story shows an undo tile with a selector for the new category', async () => {
    await flushPromises();

    const storySelect = document
        .querySelector('x-story story-category-selector')
        .querySelector('select');

    storySelect.value = 'Technology';
    storySelect.dispatchEvent(new Event('change', { bubbles: true }));

    const undoTile = document.querySelector('undo-categorize-component');
    expect(undoTile.textContent).toContain('Categorized to');
    expect(undoTile.textContent).toContain('undo');

    const undoTileSelect = undoTile.querySelector('category-selector select');
    expect(undoTileSelect.value).toBe('Technology');
});

test('changing the category on the undo tile re-categorizes the story', async () => {
    await flushPromises();

    const storySelect = document
        .querySelector('x-story story-category-selector')
        .querySelector('select');

    storySelect.value = 'Technology';
    storySelect.dispatchEvent(new Event('change', { bubbles: true }));

    const undoTileSelect = document
        .querySelector('undo-categorize-component category-selector')
        .querySelector('select');

    undoTileSelect.value = 'Business';
    undoTileSelect.dispatchEvent(new Event('change', { bubbles: true }));

    expect(categoryStore.getCategoryForDomain('tech.example.com')).toBe('Business');
});

test('the undo tile stays visible and reflects a second category change', async () => {
    await flushPromises();

    const storySelect = document
        .querySelector('x-story story-category-selector')
        .querySelector('select');

    storySelect.value = 'Technology';
    storySelect.dispatchEvent(new Event('change', { bubbles: true }));

    const undoTileSelect = document
        .querySelector('undo-categorize-component category-selector')
        .querySelector('select');

    undoTileSelect.value = 'Business';
    undoTileSelect.dispatchEvent(new Event('change', { bubbles: true }));

    const undoTile = document.querySelector('undo-categorize-component');
    expect(undoTile).not.toBeNull();

    const updatedSelect = undoTile.querySelector('category-selector select');
    expect(updatedSelect.value).toBe('Business');
    expect(categoryStore.getCategoryForDomain('tech.example.com')).toBe('Business');
});

test('picking the original category on the undo tile dismisses it, restoring the normal story tile', async () => {
    await flushPromises();

    expect(categoryStore.getCategoryForDomain('tech.example.com')).toBe('');

    const storySelect = document
        .querySelector('x-story story-category-selector')
        .querySelector('select');

    storySelect.value = 'Technology';
    storySelect.dispatchEvent(new Event('change', { bubbles: true }));

    const undoTileSelect = document
        .querySelector('undo-categorize-component category-selector')
        .querySelector('select');

    // Pick the original category (Uncategorized, i.e. '') again from the tile's dropdown.
    undoTileSelect.value = '';
    undoTileSelect.dispatchEvent(new Event('change', { bubbles: true }));

    expect(document.querySelector('undo-categorize-component')).toBeNull();
    expect(categoryStore.getCategoryForDomain('tech.example.com')).toBe('');

    const restoredStorySelect = document
        .querySelector('x-story story-category-selector')
        .querySelector('select');
    expect(restoredStorySelect.value).toBe('');
});
