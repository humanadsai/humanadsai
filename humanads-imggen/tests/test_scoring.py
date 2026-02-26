"""Tests for the AI-smell scoring system."""

import pytest
from PIL import Image

from imggen.scoring.color import ColorAnalyzer
from imggen.scoring.symmetry import SymmetryAnalyzer
from imggen.scoring import AiSmellScorer


@pytest.fixture
def color_analyzer():
    return ColorAnalyzer()


@pytest.fixture
def symmetry_analyzer():
    return SymmetryAnalyzer()


@pytest.fixture
def scorer():
    return AiSmellScorer()


class TestColorAnalyzer:
    def test_neutral_image_scores_high(self, color_analyzer):
        """A gray image should score high (natural, no color bias)."""
        img = Image.new("RGB", (100, 100), (128, 128, 128))
        score = color_analyzer.score(img)
        assert score > 0.5

    def test_teal_orange_scores_low(self, color_analyzer):
        """A teal-and-orange image should score low (AI-like)."""
        img = Image.new("RGB", (200, 100))
        # Left half teal
        for x in range(100):
            for y in range(100):
                img.putpixel((x, y), (0, 180, 180))
        # Right half orange
        for x in range(100, 200):
            for y in range(100):
                img.putpixel((x, y), (255, 140, 0))
        score = color_analyzer.score(img)
        assert score < 0.5

    def test_returns_detail(self, color_analyzer):
        img = Image.new("RGB", (100, 100), (100, 100, 100))
        detail = color_analyzer.detail(img)
        assert "teal_orange_score" in detail
        assert "saturation_score" in detail
        assert "high_saturation_pct" in detail


class TestSymmetryAnalyzer:
    def test_symmetric_image_scores_low(self, symmetry_analyzer):
        """A perfectly symmetric image should score low (AI-like)."""
        img = Image.new("L", (200, 100))
        for x in range(100):
            for y in range(100):
                val = (x * 2 + y) % 256
                img.putpixel((x, y), val)
                img.putpixel((199 - x, y), val)
        score = symmetry_analyzer.score(img.convert("RGB"))
        assert score < 0.3

    def test_asymmetric_image_scores_high(self, symmetry_analyzer):
        """A random/asymmetric image should score high (natural)."""
        import random
        random.seed(42)
        img = Image.new("RGB", (200, 100))
        for x in range(200):
            for y in range(100):
                img.putpixel((x, y), (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)))
        score = symmetry_analyzer.score(img)
        assert score > 0.5


class TestAiSmellScorer:
    def test_returns_report(self, scorer):
        img = Image.new("RGB", (100, 100), (128, 128, 128))
        img.save("/tmp/test_score.jpg")
        report = scorer.score("/tmp/test_score.jpg")
        assert 0 <= report.total_score <= 100
        assert isinstance(report.passed, bool)

    def test_summary(self, scorer):
        img = Image.new("RGB", (100, 100), (128, 128, 128))
        img.save("/tmp/test_score2.jpg")
        report = scorer.score("/tmp/test_score2.jpg")
        summary = report.summary()
        assert "AI臭スコア" in summary
