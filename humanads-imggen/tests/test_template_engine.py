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

    def test_money(self, engine):
        assert engine.infer_category("お金を貯金する方法") == "money"

    def test_lifestyle(self, engine):
        assert engine.infer_category("朝活で人生が変わる") == "lifestyle"

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

    def test_contains_photo_style(self, engine):
        result = engine.render("startup funding round", "hook")
        # Should contain one of the photo styles
        assert any(s in result for s in [
            "Professional lifestyle photograph",
            "High-end magazine cover photograph",
            "Bright editorial portrait photograph",
            "Clean commercial photography",
        ])

    def test_bright_not_dark(self, engine):
        """Prompts should be bright-oriented, not dark/gloomy."""
        result = engine.render("startup funding round", "hook")
        body = result.split("Do NOT include:")[0].lower()
        assert "bright" in body
        # Should NOT contain gloomy keywords
        assert "underexposed" not in body
        assert "muted color" not in body
        assert "dim room" not in body
        assert "quiet dread" not in body

    def test_contains_no_blacklisted_words_in_body(self, engine):
        result = engine.render("dramatic cinematic AI cyberpunk", "hook")
        parts = result.split("Do NOT include:")
        body = parts[0].lower() if parts else result.lower()
        assert "cyberpunk" not in body
        assert "cinematic" not in body

    def test_hook_composition(self, engine):
        result = engine.render("test theme", "hook")
        lower = result.lower()
        assert "negative space" in lower or "focal point" in lower

    def test_emphasis_composition(self, engine):
        result = engine.render("test theme", "emphasis")
        lower = result.lower()
        assert "close-up" in lower or "eye contact" in lower

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
        assert len(result) < 2000

    def test_danger_is_bright(self, engine):
        """Even danger category should be bright, not dark."""
        result = engine.render("詐欺に注意 scam warning", "hook")
        body = result.split("Do NOT include:")[0].lower()
        assert "bright" in body
        assert "dim" not in body


class TestListMethods:
    def test_list_categories(self, engine):
        cats = engine.list_categories()
        assert "business" in cats
        assert "technology" in cats
        assert "danger" in cats
        assert "money" in cats
        assert "lifestyle" in cats
        assert "general" in cats

    def test_list_slide_types(self, engine):
        types = engine.list_slide_types()
        assert "hook" in types
        assert "emphasis" in types
