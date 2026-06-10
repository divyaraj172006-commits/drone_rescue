import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/detect', authenticateToken, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: 'Image base64 data is required.' });
    }

    // 1. Strip base64 metadata header and parse base64 string into binary Buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    // 2. Wrap buffer in a standard FormData and Blob payload for multipart uploading
    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    formData.append('file', blob, 'image.jpg');

    // 3. Transmit the multipart image payload to our python YOLOv8 service
    const pythonResponse = await fetch('http://127.0.0.1:8000/detect', {
      method: 'POST',
      body: formData
    });

    if (!pythonResponse.ok) {
      const errorMsg = await pythonResponse.text();
      throw new Error(`Vision microservice returned status ${pythonResponse.status}: ${errorMsg}`);
    }

    const data = await pythonResponse.json();
    res.json(data);

  } catch (err) {
    console.error('AI Vision Bridge Error:', err.message);
    res.status(502).json({
      success: false,
      message: `AI Vision Inference Engine unavailable: ${err.message}`,
      victims: []
    });
  }
});

export default router;
