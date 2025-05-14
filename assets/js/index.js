import { defineCategorySelector } from "./categorySelector.js";
import StoryListComponent from "./storyListComponent.js";
import categoryStore from "./categoryStore.js";

document.addEventListener('DOMContentLoaded', function() {
    defineCategorySelector();
    const mainCategorySelector = document.getElementById("category");
    mainCategorySelector.addEventListener('change', (event) => {
        categoryStore.lastCategory = event.target.value;
    }, false);
    mainCategorySelector.value = categoryStore.lastCategory;
});