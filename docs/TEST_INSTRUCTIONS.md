# How to Test: Project Creation and Display

## Quick Test Steps

### Step 1: Navigate to Add Project Page
```
URL: /admin/add-project
OR click AdminAddProject route in your navigation
```

### Step 2: Verify Initial State
**You should see:**
- TaskBar with two tabs: "Add New Project" | "View Projects"
- "Add New Project" tab is active (highlighted)
- A form on the left with fields:
  - Project Name (text input)
  - Description (text area)
  - Start Date (date picker)
  - End Date (date picker)
  - Department (dropdown)
  - Chair Person (text input)
- Calendar widget on the right side
- "Add Project" button at bottom of form

### Step 3: Fill the Project Form
**Enter these test values:**
```
Project Name: "Test Event 2025"
Description: "This is a test project for verification"
Start Date: 2025-05-01
End Date: 2025-05-30
Department: Engineering
Chair Person: John Doe
```

### Step 4: Click "Add Project" Button
**Expected behavior:**
1. Form should submit (no validation errors)
2. A green/blue toast notification should appear at top
3. Toast message: "Project created successfully!"
4. Toast should disappear after 2 seconds

### Step 5: Automatic Tab Switch
**Expected behavior:**
- The "View Projects" tab automatically becomes active
- Page switches from form view to table view
- Page shows list of projects in a table

### Step 6: Verify New Project in Table
**Check the table for your new project:**

| Column | Expected Value |
|--------|-----------------|
| Project Name | "Test Event 2025" |
| Department | "Engineering" |
| Chair Person | "John Doe" |
| Members | 0 |
| Start Date | 5/1/2025 |
| Status | "Upcoming" |
| Actions | View, Add Members (+), Edit, Delete buttons |

**Your new project should be the 4th row** (after Event 1, Event 2, Event 3)

---

## Detailed Verification Checklist

### Form Submission ✓
- [ ] All fields accept input without errors
- [ ] Form doesn't submit if required fields empty
- [ ] Form resets after successful submission
- [ ] No JavaScript errors in console

### Toast Notification ✓
- [ ] Appears at top center of page
- [ ] Shows correct message: "Project created successfully!"
- [ ] Has green/blue styling
- [ ] Disappears after 2 seconds
- [ ] Doesn't block user interaction

### Tab Switching ✓
- [ ] Automatically switches to "View Projects" tab
- [ ] Tab button becomes highlighted
- [ ] Form view hidden when in view tab
- [ ] Table view shown when in view tab

### Table Display ✓
- [ ] Shows all columns correctly
- [ ] New project appears in table
- [ ] All fields match what you entered
- [ ] Status shows "Upcoming" for new project
- [ ] Member count shows 0
- [ ] All action buttons visible (View, Add Members, Edit, Delete)

---

## Testing Each Feature

### Feature 1: View Project Details
**Click:** "View" button on your new project row

**Modal should open showing:**
```
PROJECT DETAILS
─────────────────────
Project Name: Test Event 2025
Description: This is a test project for verification
Start Date: 5/1/2025
End Date: 5/30/2025
Department: Engineering
Chair Person: John Doe
Member Count: 0
Status: Upcoming

[Close]  [Edit]
```

**Click "Close"** to close modal

### Feature 2: Edit Project Details
**From View modal:**
1. Click "Edit" button
2. Form inputs should become editable
3. Modify a field (e.g., Chair Person: "Jane Doe")
4. Click "Save Changes"
5. Modal closes
6. **Check table** - should show updated value "Jane Doe"

### Feature 3: Add Members to Project
**Click:** Add Members icon (person+ icon) on your project row

**Modal should open showing:**
```
ADD MEMBERS TO Test Event 2025
─────────────────────────────
Available Members:
┌─────────────────────────────┐
│ Aisha Khan                  │
│ aisha.khan@example.com      │
│ Engineering          [Add]  │
└─────────────────────────────┘
┌─────────────────────────────┐
│ Daniel Smith                │
│ daniel.smith@example.com    │
│ Science              [Add]  │
└─────────────────────────────┘
┌─────────────────────────────┐
│ Fatima Ali                  │
│ fatima.ali@example.com      │
│ Arts                 [Add]  │
└─────────────────────────────┘

Added Members:
(none yet)

[Close]
```

**Click "Add"** on one member (e.g., Aisha Khan)
- Member should appear in "Added Members" section
- **Check table** - Member count should change from 0 to 1

### Feature 4: Delete Project
**Click:** Delete icon (trash icon) on your project row

**Confirmation modal should appear:**
```
DELETE PROJECT
─────────────────────
Are you sure you want to delete "Test Event 2025"?
This action cannot be undone.

[Cancel]  [Delete]
```

**Click "Delete"** to confirm
- Modal closes
- **Check table** - Your project should be removed
- Table should only show 3 original projects

---

## What Each File Does

### AdminAddProject.jsx
```
Role: Parent component that manages ALL project state
Contains: 3 sample projects, state management, callbacks
Passes to: ProjectsTable (projects array + delete/update callbacks)
          ProjectAddForm (onProjectAdded callback)
Result: New projects added here, distributed to children
```

### ProjectAddForm.jsx
```
Role: Form input component
Contains: Form fields, validation, submission logic
Calls: onProjectAdded(formData) when user submits
Result: Parent receives form data and adds to state
```

### ProjectsTable.jsx
```
Role: Display and action component
Receives: projects array, callbacks from parent
Contains: Table display, modals for view/edit/delete
Calls: onProjectDeleted(), onProjectUpdated() to notify parent
Result: Table shows projects, parent state updates when actions taken
```

---

## Expected Results Summary

### Before Adding Project:
```
VIEW PROJECTS TAB:
- Event 1 (Engineering, Aisha Khan)
- Event 2 (Science, Daniel Smith)
- Event 3 (Arts, Fatima Ali)
Total: 3 projects
```

### After Adding Project:
```
VIEW PROJECTS TAB:
- Event 1 (Engineering, Aisha Khan)
- Event 2 (Science, Daniel Smith)
- Event 3 (Arts, Fatima Ali)
- Test Event 2025 (Engineering, John Doe) ← NEW!
Total: 4 projects
```

---

## Console Checks (Browser DevTools)

**Open browser DevTools (F12) → Console tab**

**You should see NO errors:**
- ❌ "Cannot read properties of undefined"
- ❌ "projects is not defined"
- ❌ Any red error messages

**If you see errors, check:**
1. AdminAddProject.jsx has all state initialized
2. ProjectsTable.jsx has all imports
3. No typos in component names
4. Props are passed correctly

---

## Success Criteria

✅ **Test is PASSED if:**
1. Form submits without errors
2. Toast notification appears with success message
3. Tab automatically switches to "View Projects"
4. New project appears in table with correct values
5. View modal shows all project details
6. Edit modal allows changes and saves them
7. Add members modal works and updates count
8. Delete confirmation appears and removes project
9. No errors in browser console
10. All actions update the table correctly

---

## Troubleshooting

### Issue: New project doesn't appear in table
**Possible causes:**
1. Toast notification appears but no tab switch
   - Check: Timer in handleProjectAdded (should be 500ms)
   
2. Tab switches but project not visible
   - Check: useEffect in ProjectsTable is syncing props
   - Check: filteredProjects includes new project
   
3. Form doesn't submit
   - Check: onProjectAdded callback is passed from parent
   - Check: No validation errors in form

**Solution:** Check browser console for specific error message

### Issue: Toast doesn't appear
**Possible causes:**
1. showToast state not set to true
   - Check: setShowToast(true) in handleProjectAdded
   
2. Toast component not imported
   - Check: import Toast from component path

**Solution:** Verify Toast import and visibility props

### Issue: Modal doesn't close
**Possible causes:**
1. handleCloseModal function not defined
2. Modal onClick handler not stopping propagation
3. State not being cleared

**Solution:** Check modal event handlers and close logic

---

## Code Inspection Points

To manually verify the integration works, check these code sections:

**AdminAddProject.jsx:**
```javascript
// Line 20-31: Initial state with 3 sample projects ✓
// Line 36-50: handleProjectAdded creates and adds project ✓
// Line 89-92: ProjectsTable receives projects prop ✓
// Line 42-43: setShowToast and setTimeout for tab switch ✓
```

**ProjectsTable.jsx:**
```javascript
// Line 7: Component accepts projects prop ✓
// Line 27-31: useEffect syncs props to state ✓
// Line 33-36: filteredProjects calculation ✓
// Line 72-82: handleConfirmDelete calls callback ✓
// Line 84-97: handleAddMemberToProject updates count ✓
```

---

## Timeline

**Expected duration:** 2-3 minutes for complete test
- Form fill: 30 seconds
- Add project: 10 seconds
- Verify in table: 20 seconds
- Test view: 20 seconds
- Test edit: 30 seconds
- Test add members: 30 seconds
- Test delete: 20 seconds

---

## Summary

This test verifies that the complete project management flow works:
1. **Add** new project via form ✓
2. **View** all projects in table ✓
3. **View details** in modal ✓
4. **Edit** project details ✓
5. **Add members** to project ✓
6. **Delete** project ✓

If all these work, the integration is complete and functioning correctly!

**Ready to test?** Follow the steps above and report any issues you find.
