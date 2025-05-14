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

export default {
    getCategories() {
        return Object.keys(categories)
    }
}