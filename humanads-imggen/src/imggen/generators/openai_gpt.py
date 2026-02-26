"""OpenAI gpt-image-1 image generator adapter."""

import base64
import time
from pathlib import Path
from uuid import uuid4

import openai

from .base import GenerationResult, ImageGenerator


class OpenAIGptImageGenerator(ImageGenerator):
    """Generate images using OpenAI gpt-image-1 model."""

    MODEL = "gpt-image-1"

    # Pricing per image (USD)
    COST_MAP: dict[str, dict[str, float]] = {
        "1024x1024": {"low": 0.011, "medium": 0.022, "high": 0.044},
        "1024x1536": {"low": 0.016, "medium": 0.032, "high": 0.064},
        "1536x1024": {"low": 0.016, "medium": 0.032, "high": 0.064},
    }

    def __init__(self, api_key: str, output_dir: str = "output"):
        self.client = openai.OpenAI(api_key=api_key)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def generate(
        self,
        prompt: str,
        size: str = "1024x1536",
        quality: str = "low",
    ) -> GenerationResult:
        """Generate a single image and save to output directory."""
        response = self.client.images.generate(
            model=self.MODEL,
            prompt=prompt,
            n=1,
            size=size,  # type: ignore[arg-type]
            quality=quality,  # type: ignore[arg-type]
        )

        # Extract image data
        image_data_b64 = response.data[0].b64_json
        if not image_data_b64:
            raise ValueError("No b64_json in OpenAI response")

        image_bytes = base64.b64decode(image_data_b64)

        # Save to file
        timestamp = int(time.time())
        uid = uuid4().hex[:8]
        filename = f"{self.MODEL}_{timestamp}_{uid}.jpg"
        path = self.output_dir / filename
        path.write_bytes(image_bytes)

        # Calculate cost
        cost = self.COST_MAP.get(size, {}).get(quality, 0.016)

        return GenerationResult(
            image_path=str(path),
            prompt=prompt,
            model=self.MODEL,
            size=size,
            quality=quality,
            cost_usd=cost,
            metadata={
                "response_id": getattr(response, "id", None),
                "created": getattr(response, "created", None),
            },
        )

    def name(self) -> str:
        return self.MODEL
