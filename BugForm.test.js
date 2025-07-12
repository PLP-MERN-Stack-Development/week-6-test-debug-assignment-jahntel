
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BugForm from '../components/BugForm';

describe('BugForm', () => {
  // Test 1: Renders correctly in "Add Bug" mode
  test('renders "Report New Bug" heading and "Add Bug" button for new bug', () => {
    render(<BugForm onSave={() => {}} />);
    expect(screen.getByRole('heading', { name: /report new bug/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add bug/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument(); // Cancel button shouldn't be there for new bug
  });

  // Test 2: Renders correctly in "Edit Bug" mode
  test('renders "Edit Bug" heading and "Update Bug" button when currentBug is provided', () => {
    const mockBug = {
      _id: '123',
      title: 'Existing Bug',
      description: 'This bug exists.',
      status: 'in-progress',
      priority: 'high',
      assignedTo: 'John Doe',
    };
    render(<BugForm onSave={() => {}} currentBug={mockBug} onCancel={() => {}} />);
    expect(screen.getByRole('heading', { name: /edit bug/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Bug')).toBeInTheDocument();
    expect(screen.getByDisplayValue('This bug exists.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('in-progress')).toBeInTheDocument();
    expect(screen.getByDisplayValue('high')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update bug/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  // Test 3: Handles input changes
  test('allows entering text into title and description fields', () => {
    render(<BugForm onSave={() => {}} />);
    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    userEvent.type(titleInput, 'My New Bug Title');
    userEvent.type(descriptionInput, 'Detailed description of the bug.');

    expect(titleInput).toHaveValue('My New Bug Title');
    expect(descriptionInput).toHaveValue('Detailed description of the bug.');
  });

  // Test 4: Form validation for missing title/description on submit
  test('shows validation errors when title or description are empty on submit', async () => {
    const mockSave = jest.fn();
    render(<BugForm onSave={mockSave} />);

    fireEvent.click(screen.getByRole('button', { name: /add bug/i }));

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    });
    expect(mockSave).not.toHaveBeenCalled();
  });

  // Test 5: Submits form with valid data (Add mode)
  test('calls onSave with correct data when adding a new bug', async () => {
    const mockSave = jest.fn();
    render(<BugForm onSave={mockSave} />);

    userEvent.type(screen.getByLabelText(/title/i), 'Valid New Bug');
    userEvent.type(screen.getByLabelText(/description/i), 'This is a valid description.');
    userEvent.selectOptions(screen.getByLabelText(/status/i), 'resolved');
    userEvent.selectOptions(screen.getByLabelText(/priority/i), 'high');
    userEvent.type(screen.getByLabelText(/assigned to/i), 'Jane Doe');

    fireEvent.click(screen.getByRole('button', { name: /add bug/i }));

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledTimes(1);
    });
    expect(mockSave).toHaveBeenCalledWith(
      {
        title: 'Valid New Bug',
        description: 'This is a valid description.',
        status: 'resolved',
        priority: 'high',
        assignedTo: 'Jane Doe',
      },
      null // new bug, so no ID
    );
    // Form fields should clear after successful submission for new bug
    expect(screen.getByLabelText(/title/i)).toHaveValue('');
    expect(screen.getByLabelText(/description/i)).toHaveValue('');
    expect(screen.getByLabelText(/status/i)).toHaveValue('open'); // Resets to default
  });

  // Test 6: Submits form with valid data (Edit mode)
  test('calls onSave with correct data and bug ID when updating an existing bug', async () => {
    const mockSave = jest.fn();
    const mockCancel = jest.fn();
    const mockBug = {
      _id: 'bug123',
      title: 'Bug to Edit',
      description: 'Original description',
      status: 'open',
      priority: 'low',
      assignedTo: 'Developer A',
    };
    render(<BugForm onSave={mockSave} currentBug={mockBug} onCancel={mockCancel} />);

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const statusSelect = screen.getByLabelText(/status/i);
    const assignedToInput = screen.getByLabelText(/assigned to/i);

    userEvent.clear(titleInput);
    userEvent.type(titleInput, 'Edited Bug Title');
    userEvent.clear(descriptionInput);
    userEvent.type(descriptionInput, 'Updated description for the bug.');
    userEvent.selectOptions(statusSelect, 'in-progress');
    userEvent.clear(assignedToInput);
    userEvent.type(assignedToInput, 'Developer B');

    fireEvent.click(screen.getByRole('button', { name: /update bug/i }));

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledTimes(1);
    });
    expect(mockSave).toHaveBeenCalledWith(
      {
        title: 'Edited Bug Title',
        description: 'Updated description for the bug.',
        status: 'in-progress',
        priority: 'low', // Priority remains unchanged if not explicitly interacted with
        assignedTo: 'Developer B',
      },
      'bug123'
    );
    // Form fields should retain values after successful submission for editing
    expect(screen.getByLabelText(/title/i)).toHaveValue('Edited Bug Title');
  });

  // Test 7: Cancel button functionality
  test('calls onCancel when the cancel button is clicked in edit mode', () => {
    const mockSave = jest.fn();
    const mockCancel = jest.fn();
    const mockBug = { _id: '123', title: 'Bug', description: 'Desc', status: 'open' };
    render(<BugForm onSave={mockSave} currentBug={mockBug} onCancel={mockCancel} />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });
});
