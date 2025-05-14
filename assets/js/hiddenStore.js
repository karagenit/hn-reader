let hiddenStories = {};
try {
    hiddenStories = JSON.parse(localStorage.getItem('hiddenStories'));
} catch (e) {}

const getTodayDayNumber = () => Math.floor(Date.now() / (1000 * 60 * 60 * 24));

export default {
    addHiddenStory(id) {
        let today = getTodayDayNumber()
        if (!hiddenStories[today]) {
            hiddenStories[today] = []
        }
        hiddenStories[today].push(parseInt(id));
    },
    saveHiddenStories() {
        // Only save the last 7 days worth of hidden stories so we don't blow up our local storage over time
        let today = getTodayDayNumber()
        Object.keys(hiddenStories).forEach(date => {
            if (date < today - 7) {
                delete hiddenStories[date];
            }
        });
        localStorage.setItem('hiddenStories', JSON.stringify(hiddenStories))
    },
    isStoryHidden(id) {
        return Object.keys(hiddenStories)
            .map(date => hiddenStories[date])
            .flat()
            .includes(id);
    }
};