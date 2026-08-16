import {
    renderSettingsWithCategories,
    storedCategories,
    categoryInput,
    newCategoryInput,
    saveSettings,
    storedViews,
    viewInput,
    newViewInput,
    viewCategoryCheckbox,
    saveViews
} from './testHelpers.js';

test('typing a name into the trailing blank input creates a new empty category', async () => {
    await renderSettingsWithCategories({ Technology: ['tech.example.com'] });

    expect(categoryInput('Technology').value).toBe('Technology');

    const blank = newCategoryInput();
    blank.value = 'Science';
    saveSettings();

    expect(storedCategories()).toEqual({
        Technology: ['tech.example.com'],
        Science: []
    });
    // The saved list re-renders, so the new category is now a real input
    expect(categoryInput('Science').value).toBe('Science');
});

test('blanking out a category name deletes it, leaving the others untouched', async () => {
    await renderSettingsWithCategories({
        Technology: ['tech.example.com'],
        Garbage: ['spam.example.com']
    });

    categoryInput('Garbage').value = '';
    saveSettings();

    expect(storedCategories()).toEqual({ Technology: ['tech.example.com'] });
    expect(categoryInput('Garbage')).toBeNull();
});

test('renaming a category to an existing name merges their domains', async () => {
    await renderSettingsWithCategories({
        Technology: ['tech.example.com'],
        Business: ['biz.example.com']
    });

    categoryInput('Business').value = 'Technology';
    saveSettings();

    expect(storedCategories()).toEqual({
        Technology: ['tech.example.com', 'biz.example.com']
    });
    expect(categoryInput('Business')).toBeNull();
    expect(document.querySelectorAll('#content input[id]')).toHaveLength(1);
});

test('with no stored views, categories are migrated 1:1 and persisted', async () => {
    await renderSettingsWithCategories({
        Technology: ['tech.example.com'],
        Business: ['biz.example.com']
    });

    expect(storedViews()).toEqual({
        Technology: ['Technology'],
        Business: ['Business']
    });
    expect(viewCategoryCheckbox('Technology', 'Technology').checked).toBe(true);
    expect(viewCategoryCheckbox('Technology', 'Business').checked).toBe(false);
});

test('a view can span multiple categories', async () => {
    await renderSettingsWithCategories({
        Technology: ['tech.example.com'],
        Business: ['biz.example.com']
    });

    viewCategoryCheckbox('Technology', 'Business').checked = true;
    saveViews();

    expect(storedViews()).toEqual({
        Technology: ['Technology', 'Business'],
        Business: ['Business']
    });
});

test('typing into the trailing blank row creates a new view', async () => {
    await renderSettingsWithCategories(
        { Technology: ['tech.example.com'], Business: ['biz.example.com'] },
        { Technology: ['Technology'] }
    );

    const blank = newViewInput();
    blank.value = 'Work';
    viewCategoryCheckbox('', 'Business').checked = true;
    saveViews();

    expect(storedViews()).toEqual({
        Technology: ['Technology'],
        Work: ['Business']
    });
});

test('blanking out a view name deletes it', async () => {
    await renderSettingsWithCategories(
        { Technology: ['tech.example.com'] },
        { Technology: ['Technology'], Junk: [] }
    );

    viewInput('Junk').value = '';
    saveViews();

    expect(storedViews()).toEqual({ Technology: ['Technology'] });
    expect(viewInput('Junk')).toBeNull();
});

test('renaming a category keeps the views pointing at it, deleting one drops it', async () => {
    await renderSettingsWithCategories(
        { Technology: ['tech.example.com'], Business: ['biz.example.com'] },
        { Work: ['Technology', 'Business'] }
    );

    categoryInput('Technology').value = 'Tech';
    categoryInput('Business').value = '';
    saveSettings();

    expect(storedViews()).toEqual({ Work: ['Tech'] });
});
