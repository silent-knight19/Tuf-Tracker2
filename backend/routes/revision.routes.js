const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase.config');
const { verifyToken } = require('./auth.routes');
const { validate } = require('../middleware/validate');
const S = require('../middleware/schemas');
const { limitTier } = require('../middleware/rateLimit');
const { denyAuthz } = require('../middleware/errors');
const spacedRepetitionService = require('../services/spaced-repetition.service');

// GET /api/revisions - Get all revisions for user
router.get('/', verifyToken, limitTier('standard'), async (req, res) => {
  try {
    const snapshot = await db.collection('revisions')
      .where('userId', '==', req.user.uid)
      .get();

    const revisions = [];
    const problemIdsToFetch = [];
    const revisionDataList = [];

    // First pass: collect data and identify missing titles
    snapshot.forEach(doc => {
      const data = doc.data();
      revisionDataList.push({ id: doc.id, data });
      
      // If problemTitle is missing but problemId exists, we'll need to fetch it
      if (!data.problemTitle && data.problemId) {
        problemIdsToFetch.push(data.problemId);
      }
    });

    // Batch fetch missing titles from problems collection
    const problemTitles = {};
    if (problemIdsToFetch.length > 0) {
      const uniqueIds = [...new Set(problemIdsToFetch)];
      // Firestore 'in' query supports up to 30 items, so we may need multiple queries
      for (let i = 0; i < uniqueIds.length; i += 30) {
        const batch = uniqueIds.slice(i, i + 30);
        const problemsSnapshot = await db.collection('problems')
          .where('__name__', 'in', batch)
          .get();
        
        problemsSnapshot.forEach(doc => {
          problemTitles[doc.id] = doc.data().title || '';
        });
      }
    }

    // Second pass: build final revisions array with enriched data
    for (const { id, data } of revisionDataList) {
      const overdueDays = data.nextDueDate ? 
        spacedRepetitionService.calculateOverdueDays(data.nextDueDate) : 0;
      
      // Use existing problemTitle, or fetch from problems, or default
      let title = data.problemTitle;
      if (!title && data.problemId && problemTitles[data.problemId]) {
        title = problemTitles[data.problemId];
        // Update the revision record with the correct title (lazy migration)
        db.collection('revisions').doc(id).update({ problemTitle: title }).catch(() => {});
      }
      
      revisions.push({
        id,
        ...data,
        problemTitle: title || 'Untitled Problem',
        nextDueDate: data.nextDueDate?.toDate ? data.nextDueDate.toDate() : data.nextDueDate,
        lastReviewedAt: data.lastReviewedAt?.toDate ? data.lastReviewedAt.toDate() : data.lastReviewedAt,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
        overdueDays,
        bucket: spacedRepetitionService.getBucketStatus(data),
        healthScore: spacedRepetitionService.calculateHealthScore(data)
      });
    }

    res.json({ revisions });

  } catch (error) {
    console.error('Error fetching revisions:', error);
    res.status(500).json({ error: 'Failed to fetch revisions' });
  }
});

// GET /api/revisions/due-today - Get problems due today
router.get('/due-today', verifyToken, limitTier('standard'), async (req, res) => {
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
router.get('/:id', verifyToken, validate(S.revisions.byId), limitTier('standard'), async (req, res) => {
  try {
    const doc = await db.collection('revisions').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Revision not found' });
    }

    const data = doc.data();

    if (data.userId !== req.user.uid) {
      return denyAuthz(res, req, 'revisions:item');
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
router.post('/', verifyToken, validate(S.revisions.create), limitTier('create'), async (req, res) => {
  try {
    const { problemId, problemTitle, coreIdea, pattern, patterns, topics, difficulty } = req.body;

    // S3: problemId is the dedup key and the link to the problems collection.
    // Required: without it the lookup below becomes a `== undefined` query
    // with database-dependent matching semantics.
    if (!problemId) {
      return res.status(400).json({ error: 'Problem ID is required' });
    }

    // Check if problem already in revision queue (by ID)
    const existingById = await db.collection('revisions')
      .where('userId', '==', req.user.uid)
      .where('problemId', '==', problemId)
      .limit(1)
      .get();

    if (!existingById.empty) {
      return res.status(400).json({ error: 'Problem already in revision queue' });
    }

    // Check by Title (if provided) to prevent duplicates with different IDs
    if (problemTitle) {
      const existingByTitle = await db.collection('revisions')
        .where('userId', '==', req.user.uid)
        .where('problemTitle', '==', problemTitle)
        .limit(1)
        .get();

      if (!existingByTitle.empty) {
        return res.status(400).json({ error: 'Problem already in revision queue' });
      }
    }

    const now = new Date();
    const scheduledReviews = spacedRepetitionService.generateFullSchedule(now);

    const revisionData = {
      userId: req.user.uid,
      problemId,
      problemTitle: problemTitle || '',
      pattern: pattern || '',
      patterns: patterns || [],
      topics: topics || [],
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
router.post('/:id/review', verifyToken, validate(S.revisions.review), limitTier('review'), async (req, res) => {
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
      return denyAuthz(res, req, 'revisions:item');
    }

    // S12: anti-farm cooldown. One XP-bearing review per revision per minute:
    // scripted floods degrade to 429s instead of minting XP at request speed.
    // (Genuine back-to-back reviews take minutes; 60s never binds real UX.)
    if (revision.lastReviewedAt) {
      const last = revision.lastReviewedAt.toDate
        ? revision.lastReviewedAt.toDate()
        : new Date(revision.lastReviewedAt);
      if (!Number.isNaN(last.getTime()) && Date.now() - last.getTime() < 60000) {
        res.set('Retry-After', '60');
        try {
          require('../services/securityLog').secEvent('ratelimit.hit', req, { result: 'deny', tier: 'review-cooldown', retryAfterSec: 60 });
        } catch { /* logging never breaks limiting */ }
        return res.status(429).json({ error: 'Review submitted too recently', retryAfterSec: 60 });
      }
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
router.patch('/:id/log-time', verifyToken, validate(S.revisions.logTime), limitTier('standard'), async (req, res) => {
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
      return denyAuthz(res, req, 'revisions:item');
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
router.delete('/:id', verifyToken, validate(S.revisions.byId), limitTier('standard'), async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('revisions').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Revision not found' });
    }

    const revision = doc.data();

    if (revision.userId !== req.user.uid) {
      return denyAuthz(res, req, 'revisions:item');
    }

    await docRef.delete();
    res.json({ message: 'Removed from revision queue' });
  } catch (error) {
    console.error('Error removing from revision queue:', error);
    res.status(500).json({ error: 'Failed to remove from revision queue' });
  }
});

// PATCH /api/revisions/:id - Update revision notes/data
router.patch('/:id', verifyToken, validate(S.revisions.patch), limitTier('standard'), async (req, res) => {
  try {
    const { id } = req.params;
    const { coreIdea, algorithmSteps, edgeCases, notes, confidenceScore, aiAdvice } = req.body;

    const docRef = db.collection('revisions').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Revision not found' });
    }

    const revision = doc.data();

    if (revision.userId !== req.user.uid) {
      return denyAuthz(res, req, 'revisions:item');
    }

    const updateData = { updatedAt: new Date() };
    if (coreIdea !== undefined) updateData.coreIdea = coreIdea;
    if (algorithmSteps !== undefined) updateData.algorithmSteps = algorithmSteps;
    if (edgeCases !== undefined) updateData.edgeCases = edgeCases;
    if (notes !== undefined) updateData.notes = notes;
    if (confidenceScore !== undefined) updateData.confidenceScore = confidenceScore;
    if (aiAdvice !== undefined) updateData.aiAdvice = aiAdvice;

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
router.post('/practice-session', verifyToken, validate(S.revisions.practice), limitTier('standard'), async (req, res) => {
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
    res.status(500).json({ error: 'Failed to generate practice session', requestId: req.id || null });
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
    // S12: accept Timestamp, Date, or ISO string — our own writes store Dates.
    const rawActive = userData.lastActiveDate;
    const lastActive = rawActive
      ? (typeof rawActive.toDate === 'function' ? rawActive.toDate() : new Date(rawActive))
      : null;

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

    // S12: atomic XP credit — concurrent reviews must both count (no lost
    // updates from read-modify-write races).
    await userRef.update({
      totalXP: admin.firestore.FieldValue.increment(xpEarned),
      currentStreak,
      longestStreak: Math.max(userData.longestStreak || 0, currentStreak),
      lastActiveDate: now
    });
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
}

module.exports = router;
