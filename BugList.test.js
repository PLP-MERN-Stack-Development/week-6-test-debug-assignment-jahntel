
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BugList from '../components/BugList';

describe('BugList', () => {
  const mockBugs = [
    {
      _id: '1',
      title: 'Login Issue',
      description: 'Users cannot log in.',
      status: 'open',
      priority: 'high',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '2',
      title: 'UI Glitch',
      description: 'Button misaligned.',
      status: 'in-progress',
      priority: 'medium',
      assignedTo: 'Alice',
      createdAt: new Date().toISOString(),
    },
  ];

  // Test 1: Renders "No bugs reported yet." when bugs array is empty
  test('renders "No bugs reported yet." when no bugs are provided', () => {
    render(<BugList bugs={[]} onDelete={() => {}} onEdit={() => {}} />);
    expect(screen.getByText(/no bugs reported yet/i)).toBeInTheDocument();
  });

  // Test 2: Renders list of bugs correctly
  test('renders a list of bugs when provided', () => {
    render(<BugList bugs={mockBugs} onDelete={() => {}} onEdit={() => {}} />);

    expect(screen.getByText(/reported bugs/i)).toBeInTheDocument();
    expect(screen.getByText('Login Issue')).toBeInTheDocument();
    expect(screen.getByText('Users cannot log in.')).toBeInTheDocument();
    expect(screen.getByText('UI Glitch')).toBeInTheDocument();
    expect(screen.getByText('Button misaligned.')).toBeInTheDocument();

    const bugItems = screen.getAllByRole('heading', { level: 3 }); // Find all h3 elements for bug titles
    expect(bugItems.length).toBe(2);
  });

  // Test 3: Calls onDelete when delete button is clicked
  test('calls onDelete with the correct bug ID when delete button is clicked', () => {
    const mockDelete = jest.fn();
    render(<BugList bugs={mockBugs} onDelete={mockDelete} onEdit={() => {}} />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]); // Click delete button for the first bug

    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledWith('1');
  });

  // Test 4: Calls onEdit when edit button is clicked
  test('calls onEdit with the correct bug object when edit button is clicked', () => {
    const mockEdit = jest.fn();
    render(<BugList bugs={mockBugs} onDelete={() => {}} onEdit={mockEdit} />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[1]); // Click edit button for the second bug

    expect(mockEdit).toHaveBeenCalledTimes(1);
    expect(mockEdit).toHaveBeenCalledWith(mockBugs[1]);
  });

  // Test 5: Correct status and priority classes are applied (visual check, but can be asserted on text)
  test('displays correct status and priority text for bugs', () => {
    render(<BugList bugs={mockBugs} onDelete={() => {}} onEdit={() => {}} />);

    expect(screen.getByText(/status: open/i)).toBeInTheDocument();
    expect(screen.getByText(/status: in-progress/i)).toBeInTheDocument();
    expect(screen.getByText(/priority: high/i)).toBeInTheDocument();
    expect(screen.getByText(/priority: medium/i)).toBeInTheDocument();
  });
});
