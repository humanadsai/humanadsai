"""Tests for the template engine."""

import pytest
from imggen.template_engine import TemplateEngine


@pytest.fixture
def engine():
    return TemplateEngine()


class TestInferCategory:
    def test_business(self, engine):
        assert engine.infer_category("How startups raise revenue") == "business"

    def test_technology(self, engine):
        assert engine.infer_category("AI algorithm breakthrough") == "technology"

    def test_danger(self, engine):
        assert engine.infer_category("Hacking scam warning") == "danger"

    def test_health(self, engine):
        assert engine.infer_category("New medicine treatment") == "health"

    def test_general_fallback(self, engine):
        assert engine.infer_category("Random topic about cats") == "general"

    def test_japanese_keywords(self, engine):
        assert engine.infer_category("企業の利益が増加") == "business"
        assert engine.infer_category("詐欺に注意") == "danger"


class TestRender:
    def test_returns_string(self, engine):
        result = engine.render("AI beats chess champion", "hook")
        assert isinstance(result, str)
        assert len(result) > 100

    def test_contains_editorial(self, engine):
        result = engine.render("startup funding round", "hook")
        assert "Editorial photograph" in result

    def test_contains_no_blacklisted_words_in_body(self, engine):
        result = engine.render("dramatic cinematic AI cyberpunk", "hook")
        # Split at the negative prompt boundary
        parts = result.split("Do NOT include:")
        body = parts[0].lower() if parts else result.lower()
        # Body (before negative prompt) should not have blacklisted words
        assert "cyberpunk" not in body
        assert "cinematic" not in body

    def test_hook_composition(self, engine):
        result = engine.render("test theme", "hook")
        assert "establishing" in result.lower() or "wide" in result.lower()

    def test_emphasis_composition(self, engine):
        result = engine.render("test theme", "emphasis")
        assert "tight" in result.lower() or "crop" in result.lower()

    def test_overrides(self, engine):
        result = engine.render(
            "test",
            "hook",
            overrides={"camera": "Shot on Leica Q3 with 28mm f/1.7"},
        )
        assert "Leica Q3" in result

    def test_prompt_length(self, engine):
        """Prompt should be under 4000 chars (API limit)."""
        result = engine.render("A very long theme " * 20, "hook")
        assert len(result) < 4000

    def test_context_truncated(self, engine):
        """Context from theme should be truncated."""
        long_theme = "word " * 100
        result = engine.render(long_theme, "hook")
        # Should not include the full 500-char theme verbatim
        assert len(result) < 2000


class TestListMethods:
    def test_list_categories(self, engine):
        cats = engine.list_categories()
        assert "business" in cats
        assert "technology" in cats
        assert "danger" in cats
        assert "general" in cats

    def test_list_slide_types(self, engine):
        types = engine.list_slide_types()
        assert "hook" in types
        assert "emphasis" in types
