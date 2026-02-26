"""Color histogram analysis for AI-smell detection.

AI-generated images tend to have:
- Bimodal hue distribution (teal ~180 + orange ~30)
- Very high saturation peaks
- Narrow luminance range (everything similarly lit)
"""

from PIL import Image
import numpy as np


class ColorAnalyzer:
    """Detect AI-typical color patterns via histogram analysis."""

    def score(self, img: Image.Image) -> float:
        """Score 0.0 (very AI-like) to 1.0 (natural color distribution)."""
        hsv = img.convert("HSV")
        h, s, v = hsv.split()

        h_hist = h.histogram()  # 256 bins
        s_hist = s.histogram()
        v_hist = v.histogram()

        total_pixels = img.width * img.height

        # 1. Teal-orange bimodality check
        teal_orange_score = self._check_teal_orange(h_hist, total_pixels)

        # 2. Over-saturation check
        saturation_score = self._check_saturation(s_hist, total_pixels)

        # 3. Luminance uniformity check
        luminance_score = self._check_luminance_spread(v_hist, total_pixels)

        # Weighted composite
        return (
            teal_orange_score * 0.4
            + saturation_score * 0.35
            + luminance_score * 0.25
        )

    def _check_teal_orange(self, h_hist: list[int], total: int) -> float:
        """Detect the classic AI teal-and-orange color grading."""
        # Teal hues: ~160-200 in 256-bin (maps to ~225-280 deg)
        teal = sum(h_hist[160:200])
        # Orange hues: ~15-45 in 256-bin (maps to ~20-65 deg)
        orange = sum(h_hist[15:45])

        bimodal_ratio = (teal + orange) / max(total, 1)

        # If > 40% of pixels are teal+orange → very AI-like
        return max(0.0, min(1.0, 1.0 - bimodal_ratio * 2.5))

    def _check_saturation(self, s_hist: list[int], total: int) -> float:
        """AI images tend to have over-saturated colors."""
        # High saturation bins (200-255)
        high_sat = sum(s_hist[200:256])
        high_ratio = high_sat / max(total, 1)

        # If > 30% highly saturated → AI-like
        return max(0.0, min(1.0, 1.0 - high_ratio * 3.0))

    def _check_luminance_spread(self, v_hist: list[int], total: int) -> float:
        """AI images often have narrow luminance range (HDR-like)."""
        # Calculate standard deviation of value channel
        arr = np.array(v_hist, dtype=np.float64)
        bins = np.arange(256)
        mean = np.sum(bins * arr) / max(np.sum(arr), 1)
        var = np.sum(arr * (bins - mean) ** 2) / max(np.sum(arr), 1)
        std = np.sqrt(var)

        # Natural photos typically have std > 50
        # AI images with HDR look have std < 35
        return max(0.0, min(1.0, std / 60.0))

    def detail(self, img: Image.Image) -> dict:
        """Return detailed color analysis breakdown."""
        hsv = img.convert("HSV")
        h, s, v = hsv.split()
        total = img.width * img.height

        h_hist = h.histogram()
        s_hist = s.histogram()
        v_hist = v.histogram()

        return {
            "teal_orange_score": round(self._check_teal_orange(h_hist, total), 3),
            "saturation_score": round(self._check_saturation(s_hist, total), 3),
            "luminance_score": round(self._check_luminance_spread(v_hist, total), 3),
            "high_saturation_pct": round(sum(s_hist[200:256]) / max(total, 1) * 100, 1),
        }
