// The views editor on the settings page: one row per view (its name, plus a
// checkbox per category it includes) and its own save button.
//
// Purely a DOM component — it neither reads nor writes storage. The settings
// page hands it `categories` and `views` and listens for `viewsSave`, so
// persistence stays in viewStore.
export default class ViewSettingsComponent extends HTMLElement {
    // Category names to offer as checkboxes.
    #categories = [];
    // View name -> its categories.
    #views = {};

    set categories(categories) {
        this.#categories = categories;
        this.render();
    }

    set views(views) {
        this.#views = views;
        this.render();
    }

    save = () => {
        const newViews = {};
        Array.from(this.querySelectorAll('.view')).forEach(row => {
            const name = row.querySelector('input[type="text"]').value;
            // a blank name means the user wants to delete this view
            if (!name) {
                return;
            }
            const checked = Array.from(row.querySelectorAll('input[type="checkbox"]:checked'))
                .map(checkbox => checkbox.value);
            // same-named views merge, matching how categories behave
            newViews[name] = [...new Set([...(newViews[name] ?? []), ...checked])];
        });

        this.dispatchEvent(new CustomEvent('viewsSave', {
            detail: { views: newViews },
            bubbles: true
        }));
    }

    // One row per view: its name, plus a checkbox per category it includes.
    // A blank `view` is the trailing row for adding a new one.
    #viewRow(view) {
        const row = document.createElement('div');
        row.className = 'view';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = view ?? '';
        input.placeholder = view ? `Previously "${view}" will be deleted` : 'Add a new view here...';
        if (view) {
            input.id = 'view-' + view;
        } else {
            // Typing in the trailing blank row appends a fresh one, so there's always an empty slot
            input.addEventListener('change', () => {
                this.insertBefore(this.#viewRow(''), this.querySelector('#saveViews'));
            }, { once: true });
        }
        row.appendChild(input);

        this.#categories.forEach(category => {
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = category;
            checkbox.checked = (this.#views[view] ?? []).includes(category);
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(category));
            row.appendChild(label);
        });

        return row;
    }

    render() {
        this.innerHTML = '';
        Object.keys(this.#views).forEach(view => this.appendChild(this.#viewRow(view)));
        this.appendChild(this.#viewRow(''));

        const saveButton = document.createElement('button');
        saveButton.id = 'saveViews';
        saveButton.textContent = 'Save Views';
        saveButton.addEventListener('click', this.save);
        this.appendChild(saveButton);
    }
}

// Guarded because the settings tests re-import this module (via jest.resetModules)
// against a jsdom window whose element registry persists across tests.
if (!customElements.get('view-settings')) {
    customElements.define('view-settings', ViewSettingsComponent);
}
