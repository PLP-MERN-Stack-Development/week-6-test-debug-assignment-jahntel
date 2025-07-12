
const Validator = require('validator');
const isEmpty = require('is-empty');

function validateBugInput(data, isUpdate = false) {
  let errors = {};

  // Convert empty fields to an empty string so we can use validator functions
  data.title = !isEmpty(data.title) ? data.title : '';
  data.description = !isEmpty(data.description) ? data.description : '';
  data.status = !isEmpty(data.status) ? data.status : '';
  data.priority = !isEmpty(data.priority) ? data.priority : '';

  // Title checks
  if (Validator.isEmpty(data.title)) {
    errors.title = 'Title field is required';
  }

  // Description checks
  if (Validator.isEmpty(data.description)) {
    errors.description = 'Description field is required';
  }

  // Status checks (only if provided for update, or always for create)
  if (!isUpdate || data.status) {
    if (!['open', 'in-progress', 'resolved'].includes(data.status)) {
      errors.status = 'Invalid status value. Must be open, in-progress, or resolved.';
    }
  }

  // Priority checks (only if provided for update, or always for create)
  if (!isUpdate || data.priority) {
    if (!['low', 'medium', 'high'].includes(data.priority)) {
      errors.priority = 'Invalid priority value. Must be low, medium, or high.';
    }
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
}

module.exports = { validateBugInput };

// You'll need to install 'validator' and 'is-empty'
// npm install validator is-empty
