
const Bug = require('../models/Bug');
const { validateBugInput } = require('../utils/validation');

// @desc    Get all bugs
// @route   GET /api/bugs
// @access  Public
const getBugs = async (req, res, next) => {
  try {
    const bugs = await Bug.find();
    res.status(200).json(bugs);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new bug
// @route   POST /api/bugs
// @access  Public
const createBug = async (req, res, next) => {
  const { errors, isValid } = validateBugInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  try {
    const bug = await Bug.create(req.body);
    res.status(201).json(bug);
  } catch (error) {
    next(error);
  }
};

// @desc    Update bug
// @route   PUT /api/bugs/:id
// @access  Public
const updateBug = async (req, res, next) => {
  const { errors, isValid } = validateBugInput(req.body, true); // true for update validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  try {
    const bug = await Bug.findById(req.params.id);

    if (!bug) {
      res.status(404);
      throw new Error('Bug not found');
    }

    const updatedBug = await Bug.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(updatedBug);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete bug
// @route   DELETE /api/bugs/:id
// @access  Public
const deleteBug = async (req, res, next) => {
  try {
    const bug = await Bug.findById(req.params.id);

    if (!bug) {
      res.status(404);
      throw new Error('Bug not found');
    }

    await Bug.deleteOne({ _id: req.params.id });
    res.status(200).json({ id: req.params.id, message: 'Bug removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBugs,
  createBug,
  updateBug,
  deleteBug,
};
