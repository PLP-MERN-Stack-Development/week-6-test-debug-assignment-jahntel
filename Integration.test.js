
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import * as bugService from '../services/bugService'; // Import the service

// Mock the entire bugService module
jest.mock('../services/bugService');

describe('App Integration Tests', () => {
  const mockBugs = [
    { _id: '1', title: 'Bug A', description: 'Desc A', status: 'open', priority: 'low', createdAt: new Date().toISOString() },
    { _id: '2', title: 'Bug B', description: 'Desc B', status: 'in-progress', priority: 'medium', createdAt: new Date().toISOString() },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  // Test 1: App renders and fetches bugs on initial load
  test('renders BugList and fetches bugs on initial load', async () => {
    bugService.getBugs.mockResolvedValue(mockBugs);

    render(<App />);

    // Expect loading message initially
    expect(screen.getByText(/loading bugs/i)).toBeInTheDocument();

    // Wait for bugs to be loaded and displayed
    await waitFor(() => {
      expect(screen.getByText('Bug A')).toBeInTheDocument();
      expect(screen.getByText('Bug B')).toBeInTheDocument();
    });

    expect(bugService.getBugs).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/loading bugs/i)).not.toBeInTheDocument(); // Loading message should be gone
  });

  // Test 2: Create a new bug and verify UI update
  test('allows reporting a new bug and updates the list', async () => {
    bugService.getBugs
      .mockResolvedValueOnce([]) // Initial empty state
      .mockResolvedValueOnce([
        { _id: '3', title: 'New Bug', description: 'New Desc', status: 'open', priority: 'medium', createdAt: new Date().toISOString() }
      ]); // After creation

    bugService.createBug.mockResolvedValue({
      _id: '3', title: 'New Bug', description: 'New Desc', status: 'open', priority: 'medium', createdAt: new Date().toISOString()
    });

    render(<App />);

    await waitFor(() => {
        expect(screen.getByText(/no bugs reported yet/i)).toBeInTheDocument();
    });

    // Fill the form
    userEvent.type(screen.getByLabelText(/title/i), 'New Bug');
    userEvent.type(screen.getByLabelText(/description/i), 'New Desc');
    fireEvent.click(screen.getByRole('button', { name: /add bug/i }));

    // Wait for createBug to be called and then for getBugs to be called again
    await waitFor(() => {
      expect(bugService.createBug).toHaveBeenCalledTimes(1);
      expect(bugService.createBug).toHaveBeenCalledWith({
        title: 'New Bug',
        description: 'New Desc',
        status: 'open',
        priority: 'medium',
        assignedTo: '', // AssignedTo is empty if not filled
      });
    });

    await waitFor(() => {
      expect(bugService.getBugs).toHaveBeenCalledTimes(2); // Initial fetch + fetch after creation
      expect(screen.getByText('New Bug')).toBeInTheDocument();
    });
  });

  // Test 3: Update a bug and verify UI update
  test('allows updating an existing bug and refreshes the list', async () => {
    bugService.getBugs
      .mockResolvedValueOnce(mockBugs) // Initial state
      .mockResolvedValueOnce([
        { ...mockBugs[0], title: 'Updated Bug A', status: 'resolved' },
        mockBugs[1],
      ]); // After update

    bugService.updateBug.mockResolvedValue({
      ...mockBugs[0], title: 'Updated Bug A', status: 'resolved'
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Bug A')).toBeInTheDocument();
    });

    // Click edit button for "Bug A"
    fireEvent.click(screen.getAllByRole('button', { name: /edit/i })[0]);

    // Form should now be in edit mode with Bug A's data
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /edit bug/i })).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bug A')).toBeInTheDocument();
    });

    // Update title and status
    userEvent.clear(screen.getByLabelText(/title/i));
    userEvent.type(screen.getByLabelText(/title/i), 'Updated Bug A');
    userEvent.selectOptions(screen.getByLabelText(/status/i), 'resolved');

    fireEvent.click(screen.getByRole('button', { name: /update bug/i }));

    await waitFor(() => {
      expect(bugService.updateBug).toHaveBeenCalledTimes(1);
      expect(bugService.updateBug).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ title: 'Updated Bug A', status: 'resolved' })
      );
    });

    await waitFor(() => {
      expect(bugService.getBugs).toHaveBeenCalledTimes(2); // Initial fetch + fetch after update
      expect(screen.getByText('Updated Bug A')).toBeInTheDocument();
      expect(screen.getByText(/status: resolved/i)).toBeInTheDocument();
    });
  });

  // Test 4: Delete a bug and verify UI update
  test('allows deleting a bug and removes it from the list', async () => {
    bugService.getBugs
      .mockResolvedValueOnce(mockBugs) // Initial state
      .mockResolvedValueOnce([mockBugs[1]]); // After deletion (Bug A removed)

    bugService.deleteBug.mockResolvedValue({}); // Successful deletion response

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Bug A')).toBeInTheDocument();
    });

    // Click delete button for "Bug A" (the first one)
    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);

    await waitFor(() => {
      expect(bugService.deleteBug).toHaveBeenCalledTimes(1);
      expect(bugService.deleteBug).toHaveBeenCalledWith('1');
    });

    await waitFor(() => {
      expect(bugService.getBugs).toHaveBeenCalledTimes(2); // Initial fetch + fetch after deletion
      expect(screen.queryByText('Bug A')).not.toBeInTheDocument(); // Bug A should be gone
      expect(screen.getByText('Bug B')).toBeInTheDocument(); // Bug B should still be there
    });
  });

  // Test 5: Error handling on fetch
  test('displays an error message if fetching bugs fails', async () => {
    bugService.getBugs.mockRejectedValue(new Error('Network Error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load bugs\. please try again later\./i)).toBeInTheDocument();
    });
    expect(screen.queryByText('Bug A')).not.toBeInTheDocument(); // No bugs should be displayed
  });

  // Test 6: Error handling on create bug
  test('displays an error message if creating a bug fails', async () => {
    bugService.getBugs.mockResolvedValue([]); // Initial state
    bugService.createBug.mockRejectedValue({ response: { data: { message: 'Failed to add bug due to server error' } } });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/no bugs reported yet/i)).toBeInTheDocument();
    });

    userEvent.type(screen.getByLabelText(/title/i), 'Bug that will fail');
    userEvent.type(screen.getByLabelText(/description/i), 'This bug will trigger an error.');
    fireEvent.click(screen.getByRole('button', { name: /add bug/i }));

    await waitFor(() => {
      expect(bugService.createBug).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/failed to save bug: failed to add bug due to server error/i)).toBeInTheDocument();
    });
    expect(screen.queryByText('Bug that will fail')).not.toBeInTheDocument(); // Bug should not be added to UI
  });

  // Test 7: Error boundary catches a runtime error in a child component
  test('ErrorBoundary catches and displays error message for runtime errors', async () => {
    // Intentionally cause an error by passing a non-array to BugList
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console error output for this test

    bugService.getBugs.mockResolvedValue('not_an_array'); // Simulate bad data from API causing BugList to break

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/we're working to fix the issue/i)).toBeInTheDocument();
    });

    expect(console.error).toHaveBeenCalled(); // Verify error was logged
    jest.restoreAllMocks(); // Restore console.error
  });
});
