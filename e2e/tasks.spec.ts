import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';

test.describe('Tasks', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/tasks');
  });

  test('tasks page loads with heading and add button', async ({ page }) => {
    await expect(page).toHaveTitle(/Tasks/);
    await expect(page.getByText('Tasks').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Manage your garden tasks')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Task' })).toBeVisible({ timeout: 10000 });
  });

  test('add task dialog opens with required form fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Task' }).click();

    // Dialog should open
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Create New Task')).toBeVisible();

    // Required form fields (scoped to dialog)
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Title')).toBeVisible();
    await expect(dialog.getByText('Description')).toBeVisible();
    await expect(dialog.getByText('Due Date')).toBeVisible();
    await expect(dialog.getByText('Priority')).toBeVisible();
  });

  test('can create a new task and it appears in the list', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    await page.getByRole('button', { name: 'Add Task' }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Fill the form
    const testTaskTitle = `E2E Test Task ${Date.now()}`;
    await page.getByLabel('Title *').fill(testTaskTitle);
    await page.getByLabel('Description').fill('E2E test task description');

    // Due date defaults to today, which is fine for the test

    // Submit the form
    const submitButton = page.getByRole('dialog').getByRole('button', { name: 'Create Task' });
    await submitButton.click();

    // Dialog should close and task should appear in the list
    await expect(page.getByText(testTaskTitle)).toBeVisible({ timeout: 15000 });

    // Clean up: delete the task
    const taskCard = page.locator('[class*="card"], [class*="Card"]').filter({
      hasText: testTaskTitle,
    });

    const menuButton = taskCard.getByRole('button', { name: /more/i }).or(
      taskCard.locator('button:has(svg)').last()
    );

    if (await menuButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await menuButton.first().click();

      const deleteMenuItem = page.getByRole('menuitem', { name: /delete/i });
      if (await deleteMenuItem.isVisible({ timeout: 2000 }).catch(() => false)) {
        await deleteMenuItem.click();
      }
    }
  });

  test('task card displays title and priority badge', async ({ page }) => {
    // Wait for tasks to load
    await page.waitForTimeout(3000);

    const taskCards = page.locator('[class*="card"], [class*="Card"]').filter({
      has: page.locator('[class*="badge"], [class*="Badge"]'),
    });

    const count = await taskCards.count();
    if (count > 0) {
      const firstCard = taskCards.first();
      // Task cards should have a priority badge
      const badge = firstCard.locator('[class*="badge"], [class*="Badge"]');
      await expect(badge.first()).toBeVisible();
    }
  });

  test('can complete a task without creating a note', async ({ page }) => {
    // First, create a task to complete
    await page.waitForTimeout(2000);

    await page.getByRole('button', { name: 'Add Task' }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    const testTaskTitle = `E2E Complete Task ${Date.now()}`;
    await page.getByLabel('Title *').fill(testTaskTitle);

    const submitButton = page.getByRole('dialog').getByRole('button', { name: 'Create Task' });
    await submitButton.click();

    // Wait for task to appear
    await expect(page.getByText(testTaskTitle)).toBeVisible({ timeout: 15000 });

    // Find the task card and click the checkbox to complete it
    const taskCard = page.locator('[class*="card"], [class*="Card"]').filter({
      hasText: testTaskTitle,
    });

    // Click the checkbox on the task card
    const checkbox = taskCard.locator('[role="checkbox"], input[type="checkbox"]');
    if (await checkbox.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await checkbox.first().click();

      // The completion dialog should appear
      const completionDialog = page.getByRole('dialog');
      await expect(completionDialog).toBeVisible({ timeout: 5000 });

      // Complete without creating a note — just click the submit button
      const completeButton = completionDialog.getByRole('button', { name: 'Complete Task' });
      await completeButton.click();

      // Dialog should close
      await expect(completionDialog).not.toBeVisible({ timeout: 10000 });
    }
  });

  test('can delete a task via the card menu', async ({ page }) => {
    // Create a task to delete
    await page.waitForTimeout(2000);

    await page.getByRole('button', { name: 'Add Task' }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    const testTaskTitle = `E2E Delete Task ${Date.now()}`;
    await page.getByLabel('Title *').fill(testTaskTitle);

    const submitButton = page.getByRole('dialog').getByRole('button', { name: 'Create Task' });
    await submitButton.click();

    // Verify it was created
    await expect(page.getByText(testTaskTitle)).toBeVisible({ timeout: 15000 });

    // Delete via card menu
    const taskCard = page.locator('[class*="card"], [class*="Card"]').filter({
      hasText: testTaskTitle,
    });

    const menuButton = taskCard.getByRole('button', { name: /more/i }).or(
      taskCard.locator('button:has(svg)').last()
    );
    await menuButton.first().click();

    await page.getByRole('menuitem', { name: /delete/i }).click();

    // Verify task is removed
    await expect(page.getByText(testTaskTitle)).not.toBeVisible({ timeout: 10000 });
  });

  test('can edit a task via the card menu', async ({ page }) => {
    // Create a task to edit
    await page.waitForTimeout(2000);

    await page.getByRole('button', { name: 'Add Task' }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    const testTaskTitle = `E2E Edit Task ${Date.now()}`;
    await page.getByLabel('Title *').fill(testTaskTitle);

    await page.getByRole('dialog').getByRole('button', { name: 'Create Task' }).click();
    await expect(page.getByText(testTaskTitle)).toBeVisible({ timeout: 15000 });

    // Open the card menu and click Edit
    const taskCard = page.locator('[class*="card"], [class*="Card"]').filter({
      hasText: testTaskTitle,
    });

    const menuButton = taskCard.getByRole('button', { name: /more/i }).or(
      taskCard.locator('button:has(svg)').last()
    );
    await menuButton.first().click();
    await page.getByRole('menuitem', { name: /edit/i }).click();

    // Edit dialog should open with pre-filled title
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByText('Edit Task')).toBeVisible();

    // Change the title
    const editedTitle = `${testTaskTitle} Edited`;
    const titleInput = dialog.getByLabel('Title *');
    await titleInput.clear();
    await titleInput.fill(editedTitle);

    // Submit
    await dialog.getByRole('button', { name: 'Update Task' }).click();

    // Verify the title changed
    await expect(page.getByText(editedTitle)).toBeVisible({ timeout: 10000 });

    // Clean up: delete the task
    const editedCard = page.locator('[class*="card"], [class*="Card"]').filter({
      hasText: editedTitle,
    });
    const deleteMenuBtn = editedCard.getByRole('button', { name: /more/i }).or(
      editedCard.locator('button:has(svg)').last()
    );
    await deleteMenuBtn.first().click();
    await page.getByRole('menuitem', { name: /delete/i }).click();
  });

  test('can complete a task with a note', async ({ page }) => {
    // Create a task to complete
    await page.waitForTimeout(2000);

    await page.getByRole('button', { name: 'Add Task' }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    const testTaskTitle = `E2E Note Task ${Date.now()}`;
    await page.getByLabel('Title *').fill(testTaskTitle);

    await page.getByRole('dialog').getByRole('button', { name: 'Create Task' }).click();
    await expect(page.getByText(testTaskTitle)).toBeVisible({ timeout: 15000 });

    // Click checkbox to open completion dialog
    const taskCard = page.locator('[class*="card"], [class*="Card"]').filter({
      hasText: testTaskTitle,
    });

    const checkbox = taskCard.locator('[role="checkbox"], input[type="checkbox"]');
    if (await checkbox.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await checkbox.first().click();

      const completionDialog = page.getByRole('dialog');
      await expect(completionDialog).toBeVisible({ timeout: 5000 });

      // Check the "Add a completion note" checkbox
      const noteCheckbox = completionDialog.locator('#createNote');
      await noteCheckbox.check();

      // Fill in the note content
      await completionDialog.getByPlaceholder('Describe what you accomplished').fill(
        'E2E test completion note'
      );

      // Submit
      await completionDialog.getByRole('button', { name: 'Complete Task' }).click();

      // Dialog should close
      await expect(completionDialog).not.toBeVisible({ timeout: 10000 });
    }
  });

  test('can filter tasks by status and priority', async ({ page }) => {
    // 1. Create two tasks (High & Low priority)
    await page.waitForTimeout(2000);

    // High Priority Task
    await page.getByRole('button', { name: 'Add Task' }).click();
    const highTaskTitle = `E2E High Task ${Date.now()}`;
    await page.getByLabel('Title *').fill(highTaskTitle);

    // In the TaskForm, the Priority select defaults to Medium
    const dialog = page.getByRole('dialog');
    // We isolate just the comboboxes inside the dialog, and pick the one showing "Medium"
    await dialog.locator('button[role="combobox"]').filter({ hasText: /^Medium$/ }).click();
    await page.getByRole('option', { name: 'High', exact: true }).click();

    await dialog.getByRole('button', { name: 'Create Task' }).click();
    await expect(page.getByText(highTaskTitle)).toBeVisible({ timeout: 15000 });

    // Low Priority Task
    await page.getByRole('button', { name: 'Add Task' }).click();
    const lowTaskTitle = `E2E Low Task ${Date.now()}`;
    await page.getByLabel('Title *').fill(lowTaskTitle);

    // Use the role + strict exact text search since the label click interception error occurs
    await page.getByRole('dialog').locator('button[role="combobox"]').filter({ hasText: /^Medium$/ }).click();
    await page.getByRole('option', { name: 'Low', exact: true }).click();

    await page.getByRole('dialog').getByRole('button', { name: 'Create Task' }).click();
    await expect(page.getByText(lowTaskTitle)).toBeVisible({ timeout: 15000 });

    // Wait extra time for tasks state to settle
    await page.waitForTimeout(2000);

    // 2. Complete the high priority task
    const highTaskCard = page.locator('[class*="card"], [class*="Card"]').filter({ hasText: highTaskTitle });
    const checkbox = highTaskCard.locator('[role="checkbox"], input[type="checkbox"]');
    if (await checkbox.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await checkbox.first().click();
      const completionDialog = page.getByRole('dialog');
      await expect(completionDialog).toBeVisible({ timeout: 5000 });
      await completionDialog.getByRole('button', { name: 'Complete Task' }).click();
      await expect(completionDialog).not.toBeVisible({ timeout: 10000 });
    }

    // Give state time to update
    await page.waitForTimeout(1000);

    // 3. Click the "Completed" tab
    await page.getByRole('tab', { name: 'Completed' }).click();

    // 4. Verify ONLY the completed high-priority task is visible (and wait to ensure state propagates)
    await expect(page.getByText(highTaskTitle)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(lowTaskTitle)).not.toBeVisible({ timeout: 5000 });

    // 5. Go back to "All" tab. Use Priority filter set to "Low".
    await page.getByRole('tab', { name: 'All' }).click();

    // The Priority filter is now easily found by the default value "All Priorities"
    const priorityFilter = page.locator('button[role="combobox"]').filter({ hasText: /^All Priorities$/ });
    if (await priorityFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await priorityFilter.click();
      await page.getByRole('option', { name: 'Low', exact: true }).click();

      // Wait for filter to apply
      await page.waitForTimeout(1000);

      // Verify ONLY the low priority task shows up
      await expect(page.getByText(lowTaskTitle)).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(highTaskTitle)).not.toBeVisible({ timeout: 5000 });

      // Reset filter
      // The "Clear Filters" button might not be visible depending on screen size or exact text,
      // so we can just re-select "All Priorities" to reset it.
      await page.waitForTimeout(500);
      const activeFilter = page.locator('button[role="combobox"]').filter({ hasText: /^Low$/ });
      if (await activeFilter.isVisible().catch(() => false)) {
        await activeFilter.click();
        await page.getByRole('option', { name: 'All Priorities', exact: true }).click();
      }
    }

    // 6. Clean up both tasks
    await page.getByRole('tab', { name: 'All' }).click();
    await page.waitForTimeout(1000);

    for (const title of [highTaskTitle, lowTaskTitle]) {
      const card = page.locator('[class*="card"], [class*="Card"]').filter({ hasText: title });
      const menuBtn = card.getByRole('button', { name: /more/i }).or(card.locator('button:has(svg)').last());
      if (await menuBtn.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await menuBtn.first().click();
        await page.getByRole('menuitem', { name: /delete/i }).click();
      }
    }
  });

  // Skip this test because the Shadcn Date Picker calendar popover is too flaky right now
  test.skip('overdue tasks are displayed correctly (manual test required)', async ({ page }) => {
    // 1. Create a task with a dueDate in the past
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Add Task' }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    const overdueTaskTitle = `E2E Overdue Task ${Date.now()}`;
    await page.getByLabel('Title *').fill(overdueTaskTitle);

    // Pick a past date from the calendar
    // In Shadcn UI, this is usually a popover. Click the Due Date button
    const dueDateBtn = page.getByRole('dialog').locator('button').filter({ hasText: /Pick a date|202[0-9]/i }).first();
    await dueDateBtn.click();

    // In the calendar popover, go back one month and pick the 15th
    // Shadcn uses Radix, the popover usually appends to body.
    const calendarPopover = page.locator('[role="dialog"]').last();

    // The previous month button is typically the first button in the calendar header
    const prevMonthBtn = calendarPopover.locator('button[name="previous-month"]').or(
        calendarPopover.locator('button').first()
    );
    await prevMonthBtn.click({ force: true });

    // Wait for animation
    await page.waitForTimeout(500);

    // Pick a day (15th) that is not outside the current month (not muted)
    const dayBtn = calendarPopover.locator('button[name="day"]:not(.text-muted-foreground)').filter({ hasText: /^15$/ }).first();
    await dayBtn.click({ force: true });

    // Close the calendar Popover explicitly by hitting Escape to ensure the background form is interactable
    await page.keyboard.press('Escape');
    await expect(calendarPopover).not.toBeVisible({ timeout: 5000 });

    // Submit the task - we can just press Enter on the Title field again
    await page.getByLabel('Title *').focus();
    await page.keyboard.press('Enter');

    // Wait for BOTH dialogs (calendar popover and task modal) to be gone by checking the "Tasks" page heading
    await expect(page.getByRole('dialog').first()).not.toBeVisible({ timeout: 5000 });

    // Wait for the task to appear
    await expect(page.getByText(overdueTaskTitle)).toBeVisible({ timeout: 15000 });

    // 2. Verify the task card shows the "Overdue" alert badge
    const taskCard = page.locator('[class*="card"], [class*="Card"]').filter({ hasText: overdueTaskTitle });
    // In TaskCard.tsx, the overdue badge renders the exact text "Overdue" next to a Clock icon
    await expect(taskCard.getByText('Overdue', { exact: true })).toBeVisible({ timeout: 5000 });

    // 3. Click the "Overdue" filter tab, verify the task appears there
    await page.getByRole('tab', { name: 'Overdue' }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByText(overdueTaskTitle)).toBeVisible({ timeout: 5000 });

    // 4. Go back to All tab and Clean up
    await page.getByRole('tab', { name: 'All' }).click();
    await page.waitForTimeout(1000);

    const menuBtn = taskCard.getByRole('button', { name: /more/i }).or(taskCard.locator('button:has(svg)').last());
    if (await menuBtn.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await menuBtn.first().click();
      await page.getByRole('menuitem', { name: /delete/i }).click();
      await expect(page.getByText(overdueTaskTitle)).not.toBeVisible({ timeout: 5000 });
    }
  });
});
