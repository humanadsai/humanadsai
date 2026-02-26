"""Tests for the blacklist checker."""

import pytest
from imggen.blacklist import BlacklistChecker


@pytest.fixture
def checker():
    return BlacklistChecker()


class TestCheck:
    def test_detects_blacklisted_word(self, checker):
        violations = checker.check("A cinematic photo with neon lights")
        assert "cinematic" in violations or "neon" in violations

    def test_clean_prompt_passes(self, checker):
        violations = checker.check(
            "Editorial photograph of a person at a desk, natural light"
        )
        assert len(violations) == 0

    def test_case_insensitive(self, checker):
        violations = checker.check("CINEMATIC Lighting with NEON glow")
        assert len(violations) > 0

    def test_multi_word_phrases(self, checker):
        violations = checker.check("rendered in unreal engine with octane render")
        assert any("unreal engine" in v for v in violations) or any(
            "octane render" in v for v in violations
        )


class TestSanitize:
    def test_removes_blacklisted(self, checker):
        result = checker.sanitize("A cinematic photo with dramatic lighting")
        assert "cinematic" not in result.lower()

    def test_preserves_clean_text(self, checker):
        original = "Editorial photograph of a real person in natural light"
        result = checker.sanitize(original)
        assert "Editorial photograph" in result
        assert "natural light" in result

    def test_cleans_artifacts(self, checker):
        result = checker.sanitize("Style: cinematic, neon, bold colors")
        # Should not have double commas
        assert ",," not in result
        assert "  " not in result
