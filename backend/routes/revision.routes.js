const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase.config');
const { verifyToken } = require('./auth.routes');
const spacedRepetitionService = require('../services/spaced-repetition.service');

// GET /api/revisions - Get all revisions for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('revisions')
      .where('userId', '==', req.user.uid)
      .get();

    const revisions = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const overdueDays = data.nextDueDate ? 
        spacedRepetitionService.calculateOverdueDays(data.nextDueDate) : 0;
      
      revisions.push({
        id: doc.id,
        ...data,
        nextDueDate: data.nextDueDate?.toDate ? data.nextDueDate.toDate() : data.nextDueDate,
        lastReviewedAt: data.lastReviewedAt?.toDate ? data.lastReviewedAt.toDate() : data.lastReviewedAt,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
        overdueDays,
        bucket: spacedRepetitionService.getBucketStatus(data),
        healthScore: spacedRepetitionService.calculateHealthScore(data)
      });
    });

    res.json({ revisions });
  } catch (error) {
    console.error('Error fetching revisions:', error);
    res.status(500).json({ error: 'Failed to fetch revisions' });
  }
});

// GET /api/revisions/due-today - Get problems due today
router.get('/due-today', verifyToken, async (req, res) => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const snapshot = await db.collection('revisions')
      .where('userId', '==', req.user.uid)
      .where('archived', '==', false)
      .get();

    const dueToday = [];
    const overdue = [];
    const upcoming = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      const nextDue = data.nextDueDate ? data.nextDueDate.toDate() : null;
      
      if (!nextDue) return;

      const overdueDays = spacedRepetitionService.calculateOverdueDays(data.nextDueDate);
      
      const revision = {
        id: doc.id,
        ...data,
        nextDueDate: nextDue, // Send as Date object (becomes ISO string)
        lastReviewedAt: data.lastReviewedAt?.toDate ? data.lastReviewedAt.toDate() : data.lastReviewedAt,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
        overdueDays,
        bucket: spacedRepetitionService.getBucketStatus(data),
        healthScore: spacedRepetitionService.calculateHealthScore(data)
      };

      if (overdueDays > 0) {
        overdue.push(revision);
      } else if (nextDue >= now && nextDue < tomorrow) {
        dueToday.push(revision);
      } else if (nextDue >= tomorrow) {
        upcoming.push(revision);
      }
    });

    // Sort overdue by days overdue (most urgent first)
    overdue.sort((a, b) => b.overdueDays - a.overdueDays);

    // Deduplicate upcoming by problemTitle (keep first occurrence)
    const seenTitles = new Set();
    const uniqueUpcoming = upcoming.filter(r => {
      const title = r.problemTitle || r.id;
      if (seenTitles.has(title)) {
        return false;
      }
      seenTitles.add(title);
      return true;
    });

    // Group dueToday by phase
    const recognizedPhases = ['day_2', 'day_7', 'day_14', 'day_30'];
    const groupedDueToday = {
      day_2: dueToday.filter(r => r.phase === 'day_2'),
      day_7: dueToday.filter(r => r.phase === 'day_7'),
      day_14: dueToday.filter(r => r.phase === 'day_14'),
      day_30: dueToday.filter(r => r.phase === 'day_30'),
      month_2: dueToday.filter(r => r.phase?.startsWith('month_2')),
      month_3: dueToday.filter(r => r.phase?.startsWith('month_3')),
      monthly: dueToday.filter(r => ['month_4_monthly', 'month_5_monthly', 'month_6_monthly'].includes(r.phase)),
      other: dueToday.filter(r => !r.phase || (!recognizedPhases.includes(r.phase) && !r.phase?.startsWith('month')))
    };

    res.json({
      dueToday: groupedDueToday,
      overdue,
      upcoming: uniqueUpcoming.slice(0, 20), // Limit to next 20
      counts: {
        dueToday: dueToday.length,
        overdue: overdue.length,
        upcoming: uniqueUpcoming.length
      }
    });
  } catch (error) {
    console.error('Error fetching due revisions:', error);
    res.status(500).json({ error: 'Failed to fetch due revisions' });
  }
});

// GET /api/revisions/:id - Get a single revision
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const doc = await db.collection('revisions').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Revision not found' });
    }

    const data = doc.data();

    if (data.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const revision = {
      id: doc.id,
      ...data,
      nextDueDate: data.nextDueDate?.toDate ? data.nextDueDate.toDate() : data.nextDueDate,
      lastReviewedAt: data.lastReviewedAt?.toDate ? data.lastReviewedAt.toDate() : data.lastReviewedAt,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
      bucket: spacedRepetitionService.getBucketStatus(data),
      healthScore: spacedRepetitionService.calculateHealthScore(data)
    };

    res.json(revision);
  } catch (error) {
    console.error('Error fetching revision:', error);
    res.status(500).json({ error: 'Failed to fetch revision' });
  }
});

// POST /api/revisions - Add problem to revision queue
router.post('/', verifyToken, async (req, res) => {
  try {
    const { problemId, coreIdea, pattern, difficulty } = req.body;

    // Check if problem already in revision queue
    const existing = await db.collection('revisions')
      .where('userId', '==', req.user.uid)
      .where('problemId', '==', problemId)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(400).json({ error: 'Problem already in revision queue' });
    }

    const now = new Date();
    const scheduledReviews = spacedRepetitionService.generateFullSchedule(now);

    const revisionData = {
      userId: req.user.uid,
      problemId,
      pattern: pattern || '',
      difficulty: difficulty || 'Medium',
      coreIdea: coreIdea || '',
      algorithmSteps: [],
      edgeCases: [],
      notes: '',
      phase: 'day_0',
      nextDueDate: spacedRepetitionService.addDays(now, 2), // First review in 2 days
      scheduledReviews,
      totalReviews: 0,
      lastReviewedAt: now,
      archived: false,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await db.collection('revisions').add(revisionData);

    res.json({
      id: docRef.id,
      ...revisionData,
      bucket: 'fresh',
      healthScore: 3
    });
  } catch (error) {
    console.error('Error adding to revision queue:', error);
    res.status(500).json({ error: 'Failed to add to revision queue' });
  }
});

// POST /api/revisions/:id/review - Complete a review
router.post('/:id/review', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { confidence, notes, coreIdea, algorithmSteps, edgeCases, timeTaken } = req.body;

    const docRef = db.collection('revisions').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Revision not found' });
    }

    const revision = doc.data();

    if (revision.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Calculate next review based on confidence
    const { nextDate, nextPhase, message } = spacedRepetitionService.calculateNextReview(
      revision,
      confidence
    );

    // Update scheduled reviews
    const updatedScheduledReviews = revision.scheduledReviews.map(sr => {
      if (sr.phase === revision.phase && !sr.completed) {
        return {
          ...sr,
          completed: true,
          confidence,
          completedAt: new Date(),
          overdue: spacedRepetitionService.calculateOverdueDays(sr.date) > 0,
          timeTaken: timeTaken || 0 // Save time taken
        };
      }
      return sr;
    });

    // Check if should archive
    const shouldArchive = nextPhase === 'archived' || 
      spacedRepetitionService.shouldArchive({ ...revision, phase: nextPhase });

    const updateData = {
      phase: nextPhase,
      nextDueDate: nextDate,
      scheduledReviews: updatedScheduledReviews,
      totalReviews: (revision.totalReviews || 0) + 1,
      lastReviewedAt: new Date(),
      lastConfidence: confidence,
      archived: shouldArchive,
      archivedDate: shouldArchive ? new Date() : null,
      updatedAt: new Date()
    };

    // Update optional fields if provided
    if (notes !== undefined) updateData.notes = notes;
    if (coreIdea !== undefined) updateData.coreIdea = coreIdea;
    if (algorithmSteps !== undefined) updateData.algorithmSteps = algorithmSteps;
    if (edgeCases !== undefined) updateData.edgeCases = edgeCases;

    await docRef.update(updateData);

    // Calculate XP award
    let xpEarned = 10; // Base XP
    if (confidence >= 4) xpEarned += 5; // Bonus for high confidence
    if (!updatedScheduledReviews.find(sr => sr.overdue)) xpEarned += 5; // On-time bonus
    if (shouldArchive) xpEarned += 50; // Mastery bonus

    // Update user stats (streak, XP)
    await updateUserStats(req.user.uid, xpEarned);

    const updatedRevision = {
      id,
      ...revision,
      ...updateData,
      bucket: spacedRepetitionService.getBucketStatus(updateData),
      healthScore: spacedRepetitionService.calculateHealthScore(updateData)
    };

    res.json({
      revision: updatedRevision,
      xpEarned,
      message
    });
  } catch (error) {
    console.error('Error completing review:', error);
    res.status(500).json({ error: 'Failed to complete review' });
  }
});

// PATCH /api/revisions/:id/log-time - Log time for a specific phase
router.patch('/:id/log-time', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { phase, timeTaken } = req.body;

    const docRef = db.collection('revisions').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Revision not found' });
    }

    const revision = doc.data();

    if (revision.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update timeTaken for the specific phase
    const updatedScheduledReviews = revision.scheduledReviews.map(sr => {
      if (sr.phase === phase) {
        return {
          ...sr,
          timeTaken: Number(timeTaken)
        };
      }
      return sr;
    });

    await docRef.update({
      scheduledReviews: updatedScheduledReviews,
      updatedAt: new Date()
    });

    res.json({
      id,
      ...revision,
      scheduledReviews: updatedScheduledReviews
    });
  } catch (error) {
    console.error('Error logging time:', error);
    res.status(500).json({ error: 'Failed to log time' });
  }
});

// DELETE /api/revisions/:id - Remove from revision queue
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('revisions').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Revision not found' });
    }

    const revision = doc.data();

    if (revision.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await docRef.delete();
    res.json({ message: 'Removed from revision queue' });
  } catch (error) {
    console.error('Error removing from revision queue:', error);
    res.status(500).json({ error: 'Failed to remove from revision queue' });
  }
});

// PATCH /api/revisions/:id - Update revision notes/data
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { coreIdea, algorithmSteps, edgeCases, notes } = req.body;

    const docRef = db.collection('revisions').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Revision not found' });
    }

    const revision = doc.data();

    if (revision.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updateData = { updatedAt: new Date() };
    if (coreIdea !== undefined) updateData.coreIdea = coreIdea;
    if (algorithmSteps !== undefined) updateData.algorithmSteps = algorithmSteps;
    if (edgeCases !== undefined) updateData.edgeCases = edgeCases;
    if (notes !== undefined) updateData.notes = notes;

    await docRef.update(updateData);

    res.json({
      id,
      ...revision,
      ...updateData
    });
  } catch (error) {
    console.error('Error updating revision:', error);
    res.status(500).json({ error: 'Failed to update revision' });
  }
});



// POST /api/revisions/practice-session - Get random solved problems
router.post('/practice-session', verifyToken, async (req, res) => {
  try {
    const { count = 1 } = req.body;
    
    // Get all solved revisions (totalReviews > 0)
    const snapshot = await db.collection('revisions')
      .where('userId', '==', req.user.uid)
      .where('totalReviews', '>', 0)
      .get();

    if (snapshot.empty) {
      return res.status(400).json({ error: 'No solved problems found to practice' });
    }

    const allSolved = [];
    snapshot.forEach(doc => {
      allSolved.push(doc.id);
    });

    // Shuffle and pick 'count' items
    const shuffled = allSolved.sort(() => 0.5 - Math.random());
    const selectedIds = shuffled.slice(0, parseInt(count));

    res.json({ sessionIds: selectedIds });
  } catch (error) {
    console.error('Error generating practice session:', error);
    res.status(500).json({ error: 'Failed to generate practice session', details: error.message });
  }
});

// Helper: Update user stats (streak, XP)
async function updateUserStats(userId, xpEarned) {
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) return;

    const userData = userDoc.data();
    const now = new Date();
    const lastActive = userData.lastActiveDate ? userData.lastActiveDate.toDate() : null;

    let currentStreak = userData.currentStreak || 0;
    
    // Check if streak should continue
    if (lastActive) {
      const hoursSinceActive = (now - lastActive) / (1000 * 60 * 60);
      if (hoursSinceActive <= 48) {
        const daysSinceActive = Math.floor(hoursSinceActive / 24);
        if (daysSinceActive >= 1) {
          currentStreak += 1;
        }
      } else {
        // Streak broken
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }

    await userRef.update({
      totalXP: (userData.totalXP || 0) + xpEarned,
      currentStreak,
      longestStreak: Math.max(userData.longestStreak || 0, currentStreak),
      lastActiveDate: now
    });
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
}

module.exports = router;
