import {
    renderSettingsWithCategories,
    storedCategories,
    categoryInput,
    newCategoryInput,
    saveSettings
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
