"""YAML-based prompt template engine with slot interpolation."""

from pathlib import Path
from typing import Any

import yaml

from .blacklist import BlacklistChecker
from .config import MASTER_TEMPLATE

# Photography style descriptors (deterministic rotation)
PHOTO_STYLES = [
    "Professional lifestyle photograph",
    "High-end magazine cover photograph",
    "Bright editorial portrait photograph",
    "Clean commercial photography",
]


class TemplateEngine:
    """Load YAML templates, infer categories, and render prompts."""

    def __init__(self, template_path: str | Path | None = None):
        path = Path(template_path) if template_path else MASTER_TEMPLATE
        with open(path) as f:
            self.config: dict[str, Any] = yaml.safe_load(f)

        self.checker = BlacklistChecker()
        self._build_keyword_index()

    def _build_keyword_index(self) -> None:
        """Build a flat keyword → category index."""
        self._kw_index: dict[str, str] = {}
        categories = self.config.get("categories", {})
        for cat_name, cat_data in categories.items():
            for kw in cat_data.get("keywords", []):
                self._kw_index[kw.lower()] = cat_name

    def infer_category(self, text: str) -> str:
        """Keyword-based category inference from text."""
        lower = text.lower()
        for kw, cat in self._kw_index.items():
            if kw in lower:
                return cat
        return "general"

    def render(
        self,
        text: str,
        slide_type: str = "hook",
        overrides: dict[str, str] | None = None,
    ) -> str:
        """Render a complete prompt from text and slide type."""
        category = self.infer_category(text)
        slots = self._build_slots(text, slide_type, category)
        if overrides:
            slots.update(overrides)

        # Extract negative prompt before sanitization (it intentionally contains blacklisted words)
        negative = slots.get("negative_prompt", "")

        # Render template without negative prompt, then sanitize
        slots["negative_prompt"] = ""
        template_str = self.config.get("template", "")
        prompt = template_str.format(**slots)
        prompt = self.checker.sanitize(prompt)

        # Append negative prompt verbatim (not sanitized)
        if negative:
            prompt = prompt.strip() + "\n" + negative

        return prompt.strip()

    def _build_slots(
        self, text: str, slide_type: str, category: str
    ) -> dict[str, str]:
        """Merge defaults + slide_type + category into slot values."""
        defaults = self.config.get("defaults", {})
        cameras = self.config.get("cameras", [])
        categories = self.config.get("categories", {})
        slide_types = self.config.get("slide_types", {})

        cat_data = categories.get(category, categories.get("general", {}))
        type_data = slide_types.get(slide_type, slide_types.get("body", {}))

        # Deterministic camera & style selection
        camera = cameras[hash(text) % len(cameras)] if cameras else ""
        style = PHOTO_STYLES[hash(text) % len(PHOTO_STYLES)]

        # Context from actual text (truncate for prompt length)
        context = text[:80].strip()

        return {
            "style": style,
            "camera": camera,
            "scene": cat_data.get("scene", ""),
            "context": context,
            "lighting": cat_data.get("lighting", ""),
            "palette": cat_data.get("palette", ""),
            "composition": type_data.get("composition", ""),
            "anti_ai": defaults.get("anti_ai", ""),
            "constraints": defaults.get("constraints", ""),
            "negative_prompt": defaults.get("negative_prompt", ""),
        }

    def list_categories(self) -> list[str]:
        """Return available category names."""
        return list(self.config.get("categories", {}).keys())

    def list_slide_types(self) -> list[str]:
        """Return available slide type names."""
        return list(self.config.get("slide_types", {}).keys())
