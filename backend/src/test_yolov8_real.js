import fs from 'fs';

async function runTest() {
  console.log('--- EOC YOLOv8 AI Vision Integration 5-Point Verification ---');

  const tests = [
    {
      id: 1,
      name: '1. Empty Landscape',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 2,
      name: '2. Flooded Street without People',
      url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 3,
      name: '3. One Visible Person',
      url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 4,
      name: '4. Multiple People',
      url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 5,
      name: '5. Rescue Boat',
      url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=400&q=80'
    }
  ];

  for (const t of tests) {
    try {
      console.log(`\n[Executing Test #${t.id}] ${t.name}...`);
      const imgRes = await fetch(t.url);
      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Submit binary buffer to the FastAPI server on port 8000
      const formData = new FormData();
      const blob = new Blob([buffer], { type: 'image/jpeg' });
      formData.append('file', blob, 'image.jpg');

      const res = await fetch('http://127.0.0.1:8000/detect', {
        method: 'POST',
        body: formData
      });

      const result = await res.json();
      console.log(`Response Status: ${res.status}`);
      console.log(`Inference Model: ${result.model}`);
      console.log(`Detections found: ${result.victims?.length || 0}`);
      if (result.victims && result.victims.length > 0) {
        result.victims.forEach((vic, i) => {
          console.log(`  - Target ${i + 1}: ${vic.label} (Conf: ${vic.conf})`);
          console.log(`    Coords: [x: ${vic.x.toFixed(1)}, y: ${vic.y.toFixed(1)}, w: ${vic.w.toFixed(1)}, h: ${vic.h.toFixed(1)}]`);
        });
      } else {
        console.log(`  - Message: ${result.message}`);
      }
    } catch (err) {
      console.error(`  - Failed: ${err.message}`);
    }
  }
}

runTest();
