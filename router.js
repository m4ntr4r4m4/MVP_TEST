const express = require('express');
const router = express.Router();

// Import your database functions (e.g., rewardUser, getUserTotalPoints, etc.)
async function rewardUser(userId, actionType, points) {
  // Create a new record for the rewarded action
  await conn.query('INSERT INTO KarmaPoints (user_id, action_type, points) VALUES (?, ?, ?)', [userId, actionType, points]);
}

// Example: Function to get a user's total points
async function getUserTotalPoints(userId) {
  const result = await conn.query('SELECT SUM(points) AS total_points FROM KarmaPoints WHERE user_id = ?', [userId]);
  return result[0].total_points || 0;
}

// Example: Function to update points for a specific action type
async function updatePointsForAction(userId, actionType, newPoints) {
  await conn.query('UPDATE KarmaPoints SET points = ? WHERE user_id = ? AND action_type = ?', [newPoints, userId, actionType]);
}

// Example: Function to undo a rewarded action
async function undoRewardedAction(userId, actionType) {
  await conn.query('DELETE FROM KarmaPoints WHERE user_id = ? AND action_type = ?', [userId, actionType]);
}

// Endpoint to reward a user for an action
router.post('/reward', async (req, res) => {
  const { userId, actionType, points } = req.body;
  try {
    await rewardUser(userId, actionType, points);
    res.status(200).json({ message: 'User rewarded successfully' });
  } catch (error) {
    console.error('Error rewarding user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get a user's total points
router.get('/totalPoints/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const totalPoints = await getUserTotalPoints(userId);
    res.status(200).json({ totalPoints });
  } catch (error) {
    console.error('Error getting user total points:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to update points for a specific action type
router.put('/updatePoints', async (req, res) => {
  const { userId, actionType, newPoints } = req.body;
  try {
    await updatePointsForAction(userId, actionType, newPoints);
    res.status(200).json({ message: 'Points updated successfully' });
  } catch (error) {
    console.error('Error updating points:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to undo a rewarded action
router.delete('/undoRewardedAction', async (req, res) => {
  const { userId, actionType } = req.body;
  try {
    await undoRewardedAction(userId, actionType);
    res.status(200).json({ message: 'Rewarded action undone successfully' });
  } catch (error) {
    console.error('Error undoing rewarded action:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Export the router
module.exports = router;

