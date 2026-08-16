import viewStore from "./viewStore.js";
import ViewSettingsComponent from "./viewSettingsComponent.js";

const viewSettings = document.getElementById('views');
viewSettings.addEventListener('viewsSave', (event) => {
    viewStore.setViews(event.detail.views);
    displayViews();
});

let categories = {};

const storedCategories = localStorage.getItem("categories");
if (storedCategories) {
    categories = JSON.parse(storedCategories);
}

export function downloadJson() {
    const dataStr = JSON.stringify({ categories, views: viewStore.allViews }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `hn-reader-data-${today}.json`;
    link.click();
    URL.revokeObjectURL(url);

    localStorage.setItem('lastExported', today);
    updateLastExportedDisplay();
}

export function updateLastExportedDisplay() {
    const lastExported = localStorage.getItem('lastExported');
    const text = lastExported ? `Last exported: ${lastExported}` : 'Last exported: never';
    document.getElementById('lastExported').textContent = text;
}

export function importJson() {
    const fileInput = document.getElementById('import');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file first');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            // Backups made before views existed are a bare category map
            const importedCategories = imported?.categories ?? imported;
            // Prevent accidentally blowing up your json with a misclick
            if (importedCategories && Object.keys(importedCategories).length > 0) {
                categories = importedCategories;
                localStorage.setItem('categories', JSON.stringify(categories));
                viewStore.setViews(imported?.views ?? Object.fromEntries(
                    Object.keys(categories).map(category => [category, [category]])
                ));
                displayCategories();
                displayViews();
            }
        } catch (error) {
            alert('Error parsing JSON file: ' + error.message);
        }
    };
    reader.readAsText(file);
}

export function saveCategories() {
    const newCategories = {};
    // Old name -> new name, so views keep pointing at renamed categories
    const renames = {};
    // Scoped to #content so the file picker in #importexport isn't treated as a category input
    Array.from(document.querySelectorAll('#content input')).forEach(input => {
        const newName = input.value;
        const oldName = input.id;
        // if there's no input value, we skip it because this means the user wants to delete it
        if (newName) {
            // if it doesn't already exist, we create it
            if (!newCategories[newName]) {
                newCategories[newName] = [];
            }
            // if it was an existing category, copy over the old domains
            if (oldName) {
                newCategories[newName].push(...categories[oldName]);
                renames[oldName] = newName;
            }
        }
    });

    categories = newCategories;
    localStorage.setItem('categories', JSON.stringify(categories));

    viewStore.applyCategoryRenames(renames);

    displayCategories();
    displayViews();
}

function addNewCategoryInput() {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Add a new category here...';
    // Typing in the trailing blank input appends a fresh one, so there's always an empty slot
    input.addEventListener('change', addNewCategoryInput, { once: true });
    document.getElementById("content").appendChild(input);
}

export function displayCategories() {
    const content = document.getElementById("content");
    content.innerHTML = '';
    Object.keys(categories).forEach(category => {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Previously "' + category + '" will be deleted';
        input.id = category;
        input.value = category;
        content.appendChild(input);
        content.appendChild(document.createElement('br'));
    });
    addNewCategoryInput();
    // Unsaved renames aren't in any store yet, so hand the names to the views
    // editor directly rather than letting it read them back out of storage.
    viewSettings.categories = Object.keys(categories);
}

export function displayViews() {
    viewSettings.views = viewStore.allViews;
}

document.getElementById('save').addEventListener('click', saveCategories);
document.getElementById('download').addEventListener('click', downloadJson);
document.getElementById('importButton').addEventListener('click', importJson);

displayCategories();
displayViews();
updateLastExportedDisplay();
