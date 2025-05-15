let hiddenStories = {};
try {
    hiddenStories = JSON.parse(localStorage.getItem('hiddenStories'));
} catch (e) {}

export default {
    hideStory(id) {
        let today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));

        // Add story to hidden stories
        if (!hiddenStories[today]) {
            hiddenStories[today] = []
        }
        hiddenStories[today].push(parseInt(id));

        // Only save the last 7 days worth of hidden stories so we don't blow up our local storage over time
        Object.keys(hiddenStories).forEach(date => {
            if (date < today - 7) {
                delete hiddenStories[date];
            }
        });

        // Finally save to local storage
        localStorage.setItem('hiddenStories', JSON.stringify(hiddenStories))
    },
    isStoryHidden(id) {
        return Object.keys(hiddenStories)
            .map(date => hiddenStories[date])
            .flat()
            .includes(id);
    },
    unhideStory(id) {
        Object.keys(hiddenStories).forEach(date => {
            hiddenStories[date] = hiddenStories[date].filter(storyId => storyId !== parseInt(id));
        });
        localStorage.setItem('hiddenStories', JSON.stringify(hiddenStories));
    }
};