import hiddenStore from '../assets/js/hiddenStore.js';
import '../assets/js/index.js';
import { renderIndexWithStories, flushPromises, stories, titlesShown } from './testHelpers.js';

beforeEach(() => {
    renderIndexWithStories(stories);
});

test('hiding a story removes it from the list, and undo brings it back', async () => {
    await flushPromises();

    expect(titlesShown()).toEqual(['A tech story', 'A business story', 'An uncategorized story']);

    const hideButton = document
        .querySelector('x-story story-hide-button')
        .querySelector('.close-button');
    hideButton.dispatchEvent(new Event('click', { bubbles: true }));

    expect(hiddenStore.isStoryHidden(1)).toBe(true);
    expect(titlesShown()).toEqual(['A business story', 'An uncategorized story']);

    const undoElement = document.querySelector('undo-component .undo-action');
    undoElement.dispatchEvent(new Event('click', { bubbles: true }));

    expect(hiddenStore.isStoryHidden(1)).toBe(false);
    expect(titlesShown()).toEqual(['A tech story', 'A business story', 'An uncategorized story']);
});
