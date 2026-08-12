import '../assets/js/index.js';
import { renderIndexWithStories, flushPromises, stories, titlesShown } from './testHelpers.js';

function makeStory(id) {
    return {
        id,
        title: `Story ${id}`,
        link: `https://example.com/story-${id}`,
        comments: `https://news.ycombinator.com/item?id=${id}`,
        domain: `s${id}.example.com`,
        score: 1,
        descendants: 0
    };
}

beforeEach(() => {
    renderIndexWithStories(stories);
});

test('a last-clicked story still within the top 10 keeps its position after a reload', async () => {
    await flushPromises();

    expect(titlesShown()).toEqual(['A tech story', 'A business story', 'An uncategorized story']);

    const businessStoryLink = document.querySelector('a[href="https://biz.example.com/story"]');
    businessStoryLink.dispatchEvent(new Event('click', { bubbles: true }));

    expect(window.location.hash).toBe('#id-2');

    // Simulate a page reload: fresh DOM, fresh fetch, but the hash from the click persists.
    renderIndexWithStories(stories);
    await flushPromises();

    // Still within the top 10, so it stays at its natural position rather than jumping to the top.
    expect(titlesShown()).toEqual(['A tech story', 'A business story', 'An uncategorized story']);
});

test('a last-clicked story that has fallen off the top 10 is appended as the 11th item', async () => {
    const elevenStories = Array.from({ length: 11 }, (_, i) => makeStory(i + 1));
    renderIndexWithStories(elevenStories);
    await flushPromises();

    // Story 10 is the last one visible in the initial top 10.
    const story10Link = document.querySelector(`a[href="https://example.com/story-10"]`);
    story10Link.dispatchEvent(new Event('click', { bubbles: true }));

    expect(window.location.hash).toBe('#id-10');

    // Simulate a reload where newer stories have since pushed story 10 out of the top 10.
    const bumpedStories = [makeStory(12), ...elevenStories];
    renderIndexWithStories(bumpedStories);
    await flushPromises();

    expect(titlesShown()).toEqual([
        'Story 12',
        'Story 1',
        'Story 2',
        'Story 3',
        'Story 4',
        'Story 5',
        'Story 6',
        'Story 7',
        'Story 8',
        'Story 9',
        'Story 10'
    ]);
});
