let categoriesData = {
    "Technology": [],
    "Interesting": [],
    "Business": [],
    "Science": [],
    "Projects & Companies": [],
    "Garbage": []
}

let storedCategories = localStorage.getItem("categories");

if (storedCategories) {
    categoriesData = JSON.parse(storedCategories)
}

let lastCategory = localStorage.getItem('lastCategory') ?? '';
// TODO validate that lastCategory is one of the real keys in categories?

export default {
    get categories() {
        return Object.keys(categoriesData);
    },
    get lastCategory() {
        return lastCategory;
    },
    set lastCategory(value) {
        lastCategory = value;
        localStorage.setItem("lastCategory", value);
    }
}