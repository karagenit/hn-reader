import categoryStore from "./categoryStore.js";

// A "view" is what the main page filter actually shows: a named set of one or
// more categories. Stories match a view if their category is any of the view's
// categories (OR).
let viewsData;
let lastView;

// Existing users only have categories, so seed one view per category, 1:1.
function migrateFromCategories() {
    const views = {};
    categoryStore.categories.forEach(category => {
        views[category] = [category];
    });
    return views;
}

function loadFromStorage() {
    const storedViews = localStorage.getItem("views");
    if (storedViews) {
        viewsData = JSON.parse(storedViews);
    } else {
        viewsData = migrateFromCategories();
        localStorage.setItem("views", JSON.stringify(viewsData));
    }
    lastView = localStorage.getItem('lastView') ?? '';
}

loadFromStorage();

export default {
    // Re-syncs in-memory state from localStorage. Needed in tests, where the module
    // is only imported once but localStorage is cleared between tests.
    _reloadFromStorage: loadFromStorage,
    get views() {
        return Object.keys(viewsData);
    },
    // The whole map, for callers that need each view's categories (the settings
    // editor, JSON export). A copy, so callers can't mutate stored state.
    get allViews() {
        return JSON.parse(JSON.stringify(viewsData));
    },
    get lastView() {
        return lastView;
    },
    set lastView(value) {
        lastView = value;
        localStorage.setItem("lastView", value);
    },
    getCategoriesForView(view) {
        return viewsData[view] ?? [];
    },
    setViews(views) {
        viewsData = views;
        localStorage.setItem("views", JSON.stringify(viewsData));
    },
    // Keeps views pointing at renamed categories and drops ones that no longer
    // exist. `renames` maps old category name -> new name; anything missing from
    // it was deleted.
    applyCategoryRenames(renames) {
        Object.keys(viewsData).forEach(view => {
            viewsData[view] = [...new Set(
                viewsData[view]
                    // '' is the uncategorized bucket, not a real category, so it's
                    // never renamed or deleted
                    .map(category => category === '' ? '' : renames[category])
                    .filter(category => category !== undefined)
            )];
        });
        localStorage.setItem("views", JSON.stringify(viewsData));
    },
    // True if a story in `category` belongs in `view`. Note the two different
    // empty strings: the empty *view* is the built-in "Uncategorized" filter,
    // while an empty *category* in a view's list means that view includes
    // uncategorized stories alongside its real categories.
    viewIncludesCategory(view, category) {
        if (view === '') {
            return category === '';
        }
        return this.getCategoriesForView(view).includes(category);
    }
}
