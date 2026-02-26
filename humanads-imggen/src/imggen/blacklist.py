"""Blacklist/whitelist validation for image generation prompts."""

import re
from pathlib import Path


class BlacklistChecker:
    """Checks prompts against banned AI-smell words."""

    def __init__(
        self,
        blacklist_path: str | Path | None = None,
        whitelist_path: str | Path | None = None,
    ):
        from .config import BLACKLIST_FILE, WHITELIST_FILE

        bl = Path(blacklist_path) if blacklist_path else BLACKLIST_FILE
        wl = Path(whitelist_path) if whitelist_path else WHITELIST_FILE

        self.blacklist = self._load_words(bl)
        self.whitelist = self._load_words(wl) if wl.exists() else set()

    def check(self, prompt: str) -> list[str]:
        """Return list of blacklisted words/phrases found in the prompt."""
        found: list[str] = []
        lower = prompt.lower()
        for phrase in sorted(self.blacklist, key=len, reverse=True):
            if phrase.lower() in lower:
                # Skip if it's in the whitelist
                if any(phrase.lower() in w.lower() for w in self.whitelist):
                    continue
                found.append(phrase)
        return found

    def sanitize(self, prompt: str) -> str:
        """Remove blacklisted words from prompt, preserving whitelisted ones."""
        cleaned = prompt
        for phrase in sorted(self.blacklist, key=len, reverse=True):
            if any(phrase.lower() in w.lower() for w in self.whitelist):
                continue
            escaped = re.escape(phrase)
            cleaned = re.sub(escaped, "", cleaned, flags=re.IGNORECASE)

        # Clean up artifacts
        cleaned = re.sub(r",\s*,", ",", cleaned)
        cleaned = re.sub(r"\s{2,}", " ", cleaned)
        cleaned = re.sub(r",\s*\.", ".", cleaned)
        return cleaned.strip()

    @staticmethod
    def _load_words(path: Path) -> set[str]:
        """Load one-word/phrase-per-line file into a set."""
        if not path.exists():
            return set()
        words = set()
        for line in path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#"):
                words.add(line)
        return words
