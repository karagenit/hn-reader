const defaultCategories = {
    "Technology": [],
    "Interesting": [],
    "Business": [],
    "Science": [],
    "Projects & Companies": [],
    "Garbage": []
}

let categoriesData;
let lastCategory;

function loadFromStorage() {
    const storedCategories = localStorage.getItem("categories");
    categoriesData = storedCategories ? JSON.parse(storedCategories) : JSON.parse(JSON.stringify(defaultCategories));
    lastCategory = localStorage.getItem('lastCategory') ?? '';
    // TODO validate that lastCategory is one of the real keys in categories?
}

loadFromStorage();

export default {
    // Re-syncs in-memory state from localStorage. Needed in tests, where the module
    // is only imported once but localStorage is cleared between tests.
    _reloadFromStorage: loadFromStorage,
    get categories() {
        return Object.keys(categoriesData);
    },
    get lastCategory() {
        return lastCategory;
    },
    set lastCategory(value) {
        lastCategory = value;
        localStorage.setItem("lastCategory", value);
    },
    getCategoryForDomain(domain) {
        for (let category in categoriesData) {
            if (categoriesData[category].includes(domain)) {
                return category
            }
        }
        return ''
    },
    moveDomainToCategory(domain, category) {
        // First remove from old category, if present
        for (let cat in categoriesData) {
            const index = categoriesData[cat].indexOf(domain);
            if (index > -1) {
                // Remove one element at this index
                categoriesData[cat].splice(index, 1);
            }
        }
        // Second insert into new category
        if (categoriesData[category]) {
            categoriesData[category].push(domain);
        }
        // Finally update storage
        localStorage.setItem('categories', JSON.stringify(categoriesData));
    }
}