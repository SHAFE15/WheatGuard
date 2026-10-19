import json
from pathlib import Path
from django.conf import settings
from django.test import TestCase, Client
from PIL import Image
import io


class WheatGuardIntegrationTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_homepage_loads(self):
        """Verify the homepage renders with WheatGuard UI components."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "WheatGuard")
        self.assertContains(response, "Detect from Image")
        self.assertContains(response, "Detect from Drone Video")
        self.assertContains(response, "Disease Reference Gallery")
        self.assertContains(response, "Saad Bin Kamal")
        self.assertContains(response, "MD. Econozzaman Econ")

    def test_detect_sample_api(self):
        """Verify sample inference endpoint functions accurately."""
        response = self.client.post(
            "/api/detect-sample/",
            data=json.dumps({"sample_id": "leaf_blight"}),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get("success"))
        self.assertIn("top_prediction", data)
        self.assertIn("predictions", data)
        self.assertEqual(len(data["predictions"]), 5)

    def test_detect_drone_api(self):
        """Verify drone mission scanning endpoint."""
        response = self.client.post("/api/detect-drone/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get("success"))
        self.assertIn("frames_scanned", data)
        self.assertIn("telemetry", data)
        self.assertIn("dominant_disease", data)

    def test_detect_image_upload(self):
        """Verify real image upload classification endpoint."""
        # Create an in-memory image
        img = Image.new("RGB", (224, 224), color=(50, 120, 40))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        buf.seek(0)

        response = self.client.post("/api/detect/", {"image": buf})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get("success"))
        self.assertIn("top_prediction", data)
        self.assertIn("predictions", data)
