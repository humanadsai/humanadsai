"""Composite AI-smell scorer combining multiple heuristics.

Score interpretation:
  0-30:  Very natural (PASS)
  30-40: Borderline
  40+:   AI-looking (REJECT, recommend re-generation)
"""

from dataclasses import dataclass

from PIL import Image

from .color import ColorAnalyzer
from .symmetry import SymmetryAnalyzer


@dataclass
class AiSmellReport:
    """AI-smell scoring report."""

    # 0 = very natural, 100 = very AI-looking
    total_score: int
    color_score: int
    symmetry_score: int
    saturation_score: int
    passed: bool
    detail: dict

    def summary(self) -> str:
        """Human-readable summary."""
        status = "PASS ✅" if self.passed else "REJECT ❌"
        lines = [
            f"AI臭スコア: {self.total_score}/100 ({status})",
            f"  カラーバランス:  {self.color_score}/100 {'✅' if self.color_score < 40 else '❌'}",
            f"  対称性:         {self.symmetry_score}/100 {'✅' if self.symmetry_score < 40 else '❌'}",
            f"  彩度:           {self.saturation_score}/100 {'✅' if self.saturation_score < 40 else '❌'}",
        ]
        return "\n".join(lines)


class AiSmellScorer:
    """Composite AI-smell scorer."""

    REJECT_THRESHOLD = 40  # Score >= 40 → reject

    def __init__(self) -> None:
        self.color = ColorAnalyzer()
        self.symmetry = SymmetryAnalyzer()

    def score(self, image_path: str) -> AiSmellReport:
        """Score an image for AI-generated aesthetics."""
        img = Image.open(image_path).convert("RGB")

        # Get raw scores (0.0 = AI-like, 1.0 = natural)
        color_raw = self.color.score(img)
        symmetry_raw = self.symmetry.score(img)

        # Get detailed saturation from color analyzer
        color_detail = self.color.detail(img)
        symmetry_detail = self.symmetry.detail(img)

        # Invert to AI-smell scale: 0 = natural, 100 = AI-looking
        color_score = int((1.0 - color_raw) * 100)
        symmetry_score = int((1.0 - symmetry_raw) * 100)
        saturation_score = int(min(100, color_detail["high_saturation_pct"] * 3))

        # Weighted composite
        total = int(color_score * 0.4 + symmetry_score * 0.3 + saturation_score * 0.3)

        return AiSmellReport(
            total_score=total,
            color_score=color_score,
            symmetry_score=symmetry_score,
            saturation_score=saturation_score,
            passed=total < self.REJECT_THRESHOLD,
            detail={
                "color": color_detail,
                "symmetry": symmetry_detail,
            },
        )
