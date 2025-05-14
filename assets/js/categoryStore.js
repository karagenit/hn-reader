let categories = {
    "Technology": [],
    "Interesting": [],
    "Business": [],
    "Science": [],
    "Projects & Companies": [],
    "Garbage": []
}

let storedCategories = localStorage.getItem("categories");

if (storedCategories) {
    categories = JSON.parse(storedCategories)
}

let lastCategory = localStorage.getItem('lastCategory') ?? '';
// TODO validate that lastCategory is one of the real keys in categories?

export default {
    getCategories() {
        return Object.keys(categories);
    },
    getLastCategory() {
        return lastCategory;
    }
}