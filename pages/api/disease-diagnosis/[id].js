// pages/api/disease-diagnosis/[id].js
import {dbConnect} from '@/lib/dbConnect';
import DiseaseDiagnosis from '../../../models/DiseaseDiagnosis';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  if (req.method === 'GET') {
    return await getDiagnosis(req, res, id);
  } else if (req.method === 'PUT') {
    return await updateDiagnosis(req, res, id);
  } else if (req.method === 'DELETE') {
    return await deleteDiagnosis(req, res, id);
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

// GET - Get specific diagnosis
async function getDiagnosis(req, res, id) {
  try {
    // Get user from token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const diagnosis = await DiseaseDiagnosis.findOne({
      _id: id,
      user_id: user._id
    });

    if (!diagnosis) {
      return res.status(404).json({ message: 'Diagnosis not found' });
    }

    res.json(diagnosis);

  } catch (error) {
    console.error('Get diagnosis error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// PUT - Update diagnosis (answer questions, dashboard status, etc.)
async function updateDiagnosis(req, res, id) {
  try {
    // Get user from token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const diagnosis = await DiseaseDiagnosis.findOne({
      _id: id,
      user_id: user._id
    });

    if (!diagnosis) {
      return res.status(404).json({ message: 'Diagnosis not found' });
    }

    const { 
      answer, 
      added_to_dashboard, 
      plant_name, 
      plant_type 
    } = req.body;

    // Handle diagnostic question answer
    if (answer && ['yes', 'no'].includes(answer)) {
      diagnosis.question_answered = true;
      diagnosis.user_answer = answer;

      // Refine diagnosis based on answer
      if (diagnosis.diagnostic_question && diagnosis.diagnostic_question.options) {
        const selectedOption = diagnosis.diagnostic_question.options[answer];
        
        if (selectedOption && diagnosis.disease_suggestions[selectedOption.suggestion_index]) {
          // Update primary disease based on user's answer
          const refinedSuggestion = diagnosis.disease_suggestions[selectedOption.suggestion_index];
          diagnosis.primary_disease = {
            disease_detected: true,
            disease_id: refinedSuggestion.id,
            disease_name: refinedSuggestion.name,
            category: diagnosis.categorizeDiseaseByName(refinedSuggestion.name),
            probability: refinedSuggestion.probability,
            risk_level: diagnosis.calculateRiskLevel(refinedSuggestion.probability)
          };
        }
      }
    }

    // Handle dashboard toggle
    if (added_to_dashboard !== undefined) {
      diagnosis.added_to_dashboard = added_to_dashboard;
    }

    // Handle plant info updates
    if (plant_name !== undefined) {
      diagnosis.plant_name = plant_name;
    }
    if (plant_type !== undefined) {
      diagnosis.plant_type = plant_type;
    }

    await diagnosis.save();

    res.json({
      message: 'Diagnosis updated successfully',
      diagnosis: diagnosis
    });

  } catch (error) {
    console.error('Update diagnosis error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// DELETE - Delete diagnosis
async function deleteDiagnosis(req, res, id) {
  try {
    // Get user from token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const result = await DiseaseDiagnosis.findOneAndDelete({
      _id: id,
      user_id: user._id
    });

    if (!result) {
      return res.status(404).json({ message: 'Diagnosis not found' });
    }

    res.json({ message: 'Diagnosis deleted successfully' });

  } catch (error) {
    console.error('Delete diagnosis error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}