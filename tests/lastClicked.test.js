import '../assets/js/index.js';
import { renderIndexWithStories, flushPromises, stories, titlesShown } from './testHelpers.js';

beforeEach(() => {
    renderIndexWithStories(stories);
});

test('the last-clicked story appears at the top of the list after a reload', async () => {
    await flushPromises();

    expect(titlesShown()).toEqual(['A tech story', 'A business story', 'An uncategorized story']);

    const businessStoryLink = document.querySelector('a[href="https://biz.example.com/story"]');
    businessStoryLink.dispatchEvent(new Event('click', { bubbles: true }));

    expect(window.location.hash).toBe('#id-2');

    // Simulate a page reload: fresh DOM, fresh fetch, but the hash from the click persists.
    renderIndexWithStories(stories);
    await flushPromises();

    expect(titlesShown()).toEqual(['A business story', 'A tech story', 'An uncategorized story']);
});
