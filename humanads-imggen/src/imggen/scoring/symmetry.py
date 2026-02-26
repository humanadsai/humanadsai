"""Bilateral symmetry detection for AI-smell scoring.

AI-generated images tend to be unnaturally symmetrical.
Real photos are naturally asymmetric.
"""

from PIL import Image, ImageChops
import numpy as np


class SymmetryAnalyzer:
    """Detect unnatural bilateral symmetry in images."""

    def score(self, img: Image.Image) -> float:
        """Score 0.0 (perfectly symmetric = AI-like) to 1.0 (asymmetric = natural)."""
        gray = img.convert("L")
        width, height = gray.size

        # Split image into left and right halves
        left = gray.crop((0, 0, width // 2, height))
        right = gray.crop((width // 2, 0, width, height))

        # Flip right half horizontally
        right_flipped = right.transpose(Image.FLIP_LEFT_RIGHT)

        # Resize to match (in case of odd width)
        right_flipped = right_flipped.resize(left.size)

        # Calculate pixel-wise difference
        diff = ImageChops.difference(left, right_flipped)
        diff_arr = np.array(diff, dtype=np.float64)

        mean_diff = diff_arr.mean()

        # Typical values:
        # AI-generated symmetric: mean_diff ~5-15
        # Natural photo: mean_diff ~25-60
        # Normalize: 0-40 mapped to 0.0-1.0
        return max(0.0, min(1.0, mean_diff / 40.0))

    def detail(self, img: Image.Image) -> dict:
        """Return detailed symmetry analysis."""
        gray = img.convert("L")
        width, height = gray.size

        left = gray.crop((0, 0, width // 2, height))
        right = gray.crop((width // 2, 0, width, height))
        right_flipped = right.transpose(Image.FLIP_LEFT_RIGHT).resize(left.size)

        diff = ImageChops.difference(left, right_flipped)
        diff_arr = np.array(diff, dtype=np.float64)

        return {
            "mean_diff": round(diff_arr.mean(), 2),
            "max_diff": int(diff_arr.max()),
            "symmetry_pct": round((1.0 - diff_arr.mean() / 128.0) * 100, 1),
        }
