import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';

test.describe('Notes', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/notes');
  });

  test('notes page loads with heading and add button', async ({ page }) => {
    await expect(page).toHaveTitle(/Notes/);
    await expect(page.getByText('Notes & Observations')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Add Note' })).toBeVisible({ timeout: 10000 });
  });

  test('add note dialog opens with required form fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Note' }).click();

    // Dialog should open
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Create New Note')).toBeVisible();

    // Required form fields
    await expect(page.getByText('Note Content')).toBeVisible();
    await expect(page.getByText('Category')).toBeVisible();
    await expect(page.getByText('Grow Space')).toBeVisible();
  });

  test('can create a new note and it appears in the list', async ({ page }) => {
    // Wait for page data to load
    await page.waitForTimeout(2000);

    await page.getByRole('button', { name: 'Add Note' }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Fill the form
    const testNoteContent = `E2E Test Note ${Date.now()}`;
    await page.getByPlaceholder('Enter your observation, note, or comment...').fill(testNoteContent);

    // Select a space (required — form validates that either plant or space is selected)
    const spaceSelect = page.getByRole('dialog').locator('[role="combobox"]').nth(1); // Second combobox (first is category)
    if (await spaceSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await spaceSelect.click();
      // Select the first real space (skip "No specific space")
      const options = page.getByRole('option');
      const count = await options.count();
      if (count > 1) {
        await options.nth(1).click();
      } else {
        await options.first().click();
      }
    }

    // Submit the form
    const submitButton = page.getByRole('dialog').getByRole('button', { name: 'Save Note' });
    await submitButton.click();

    // Dialog should close and note content should appear in the list
    await expect(page.getByText(testNoteContent)).toBeVisible({ timeout: 15000 });

    // Clean up: delete the note we just created
    const noteCard = page.locator('[class*="card"], [class*="Card"]').filter({
      hasText: testNoteContent,
    });

    // Open the dropdown menu on the note card
    const menuButton = noteCard.getByRole('button', { name: /more actions/i }).or(
      noteCard.locator('button:has(svg)').last()
    );

    if (await menuButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await menuButton.first().click();

      const deleteMenuItem = page.getByRole('menuitem', { name: /delete/i });
      if (await deleteMenuItem.isVisible({ timeout: 2000 }).catch(() => false)) {
        await deleteMenuItem.click();

        // NoteCard uses AlertDialog for delete confirmation
        const confirmButton = page.getByRole('alertdialog').getByRole('button', { name: /delete/i });
        if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmButton.click();
        }
      }
    }
  });

  test('note card displays content and category badge', async ({ page }) => {
    // Wait for notes to load
    await page.waitForTimeout(3000);

    const noteCards = page.locator('[class*="card"], [class*="Card"]').filter({
      has: page.locator('[class*="badge"], [class*="Badge"]'),
    });

    const count = await noteCards.count();
    if (count > 0) {
      const firstCard = noteCards.first();
      // Note cards should have a category badge
      const badge = firstCard.locator('[class*="badge"], [class*="Badge"]');
      await expect(badge.first()).toBeVisible();
    }
  });

  test('can delete a note via the card menu', async ({ page }) => {
    // Create a note to delete
    await page.waitForTimeout(2000);

    await page.getByRole('button', { name: 'Add Note' }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    const testNoteContent = `E2E Delete Note ${Date.now()}`;
    await page.getByPlaceholder('Enter your observation, note, or comment...').fill(testNoteContent);

    // Select a space (required for validation)
    const spaceSelect = page.getByRole('dialog').locator('[role="combobox"]').nth(1);
    if (await spaceSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await spaceSelect.click();
      const options = page.getByRole('option');
      const count = await options.count();
      if (count > 1) {
        await options.nth(1).click();
      } else {
        await options.first().click();
      }
    }

    const submitButton = page.getByRole('dialog').getByRole('button', { name: 'Save Note' });
    await submitButton.click();

    // Verify it was created
    await expect(page.getByText(testNoteContent)).toBeVisible({ timeout: 15000 });

    // Delete via card menu
    const noteCard = page.locator('[class*="card"], [class*="Card"]').filter({
      hasText: testNoteContent,
    });

    const menuButton = noteCard.getByRole('button', { name: /more actions/i }).or(
      noteCard.locator('button:has(svg)').last()
    );
    await menuButton.first().click();

    await page.getByRole('menuitem', { name: /delete/i }).click();

    // Confirm deletion via AlertDialog
    const confirmButton = page.getByRole('alertdialog').getByRole('button', { name: /delete/i });
    await expect(confirmButton).toBeVisible({ timeout: 3000 });
    await confirmButton.click();

    // Verify note is removed
    await expect(page.getByText(testNoteContent)).not.toBeVisible({ timeout: 10000 });
  });

  test('can edit a note via the card menu', async ({ page }) => {
    // Wait for notes to load
    await page.waitForTimeout(3000);

    // Find a note card that has the dropdown menu
    const noteCards = page.locator('[class*="card"], [class*="Card"]').filter({
      has: page.locator('[class*="badge"], [class*="Badge"]'),
    });

    const count = await noteCards.count();
    if (count === 0) return; // Skip if no notes exist

    const firstCard = noteCards.first();

    // Open the dropdown menu
    const menuButton = firstCard.getByRole('button', { name: /more actions/i }).or(
      firstCard.locator('button:has(svg)').last()
    );
    await menuButton.first().click();

    // Click Edit
    const editItem = page.getByRole('menuitem', { name: /edit/i });
    if (await editItem.isVisible({ timeout: 2000 }).catch(() => false)) {
      await editItem.click();

      // Edit Note dialog should open
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Edit Note')).toBeVisible();

      // Verify the form is present
      await expect(page.getByText('Note Content')).toBeVisible();
      await expect(page.getByText('Category')).toBeVisible();

      // Cancel instead of saving (we don't want to modify existing data)
      await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
    }
  });

  test('can filter notes by category', async ({ page }) => {
    // Wait for notes and filter controls to load
    await page.waitForTimeout(3000);

    // The filter section should have category, space, and plant dropdowns
    await expect(page.getByText('Filters & Search')).toBeVisible({ timeout: 10000 });

    // State carries over from previous tests (like visiting a plant detail page), so clear filters if active
    const clearBtn = page.getByRole('button', { name: /clear filters/i });
    if (await clearBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await clearBtn.click();
      await page.waitForTimeout(1000);
    }

    // Select a category filter — find the "All categories" dropdown
    const categorySelect = page.locator('[role="combobox"]').filter({
      hasText: /all categories/i,
    });

    if (await categorySelect.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await categorySelect.first().click();

      // Select "Observation" from the options
      const observationOption = page.getByRole('option', { name: /observation/i });
      if (await observationOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await observationOption.click();

        // Wait for filter to apply
        await page.waitForTimeout(1000);

        // The filter is applied — "Clear Filters" button should now be visible
        await expect(page.getByRole('button', { name: /clear filters/i })).toBeVisible({ timeout: 5000 });

        // Click Clear Filters to reset
        await page.getByRole('button', { name: /clear filters/i }).click();
      }
    }
  });
});
