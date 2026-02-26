"""SQLite metadata store for generated images."""

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from ..generators.base import GenerationResult
from ..config import DB_PATH


class ImageDB:
    """SQLite database for tracking image generations and scores."""

    def __init__(self, db_path: str | Path | None = None):
        self.db_path = Path(db_path) if db_path else DB_PATH
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(str(self.db_path))
        self.conn.row_factory = sqlite3.Row
        self._create_tables()

    def _create_tables(self) -> None:
        self.conn.executescript("""
            CREATE TABLE IF NOT EXISTS generations (
                id TEXT PRIMARY KEY,
                prompt TEXT NOT NULL,
                model TEXT NOT NULL,
                size TEXT,
                quality TEXT,
                cost_usd REAL,
                image_path TEXT,
                theme TEXT,
                slide_type TEXT,
                category TEXT,
                ai_smell_score INTEGER,
                ai_smell_passed INTEGER,
                score_detail_json TEXT,
                status TEXT DEFAULT 'generated',
                template_name TEXT,
                template_version TEXT,
                metadata_json TEXT,
                created_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_gen_theme ON generations(theme);
            CREATE INDEX IF NOT EXISTS idx_gen_status ON generations(status);
            CREATE INDEX IF NOT EXISTS idx_gen_score ON generations(ai_smell_score);
        """)
        self.conn.commit()

    def save(
        self,
        result: GenerationResult,
        theme: str = "",
        slide_type: str = "hook",
        category: str = "general",
        template_name: str = "",
        template_version: str = "",
    ) -> str:
        """Save a generation result. Returns the generation ID."""
        gen_id = f"gen_{uuid4().hex[:16]}"
        now = datetime.now(timezone.utc).isoformat()

        self.conn.execute(
            """INSERT INTO generations
               (id, prompt, model, size, quality, cost_usd, image_path,
                theme, slide_type, category, template_name, template_version,
                metadata_json, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                gen_id,
                result.prompt,
                result.model,
                result.size,
                result.quality,
                result.cost_usd,
                result.image_path,
                theme,
                slide_type,
                category,
                template_name,
                template_version,
                json.dumps(result.metadata),
                now,
            ),
        )
        self.conn.commit()
        return gen_id

    def update_score(
        self,
        gen_id: str,
        score: int,
        passed: bool,
        detail: dict,
    ) -> None:
        """Update AI-smell score for a generation."""
        self.conn.execute(
            """UPDATE generations
               SET ai_smell_score = ?, ai_smell_passed = ?,
                   score_detail_json = ?,
                   status = CASE WHEN ? THEN 'approved' ELSE 'rejected' END
               WHERE id = ?""",
            (score, int(passed), json.dumps(detail), int(passed), gen_id),
        )
        self.conn.commit()

    def list_recent(self, limit: int = 20, theme: str | None = None) -> list[dict]:
        """List recent generations."""
        if theme:
            rows = self.conn.execute(
                """SELECT id, model, theme, slide_type, category,
                          ai_smell_score, ai_smell_passed, status,
                          cost_usd, image_path, created_at
                   FROM generations WHERE theme = ?
                   ORDER BY created_at DESC LIMIT ?""",
                (theme, limit),
            ).fetchall()
        else:
            rows = self.conn.execute(
                """SELECT id, model, theme, slide_type, category,
                          ai_smell_score, ai_smell_passed, status,
                          cost_usd, image_path, created_at
                   FROM generations
                   ORDER BY created_at DESC LIMIT ?""",
                (limit,),
            ).fetchall()
        return [dict(row) for row in rows]

    def get(self, gen_id: str) -> dict | None:
        """Get a single generation by ID."""
        row = self.conn.execute(
            "SELECT * FROM generations WHERE id = ?", (gen_id,)
        ).fetchone()
        return dict(row) if row else None

    def stats(self) -> dict:
        """Get summary statistics."""
        row = self.conn.execute("""
            SELECT
                COUNT(*) as total,
                SUM(cost_usd) as total_cost,
                AVG(ai_smell_score) as avg_score,
                SUM(CASE WHEN ai_smell_passed = 1 THEN 1 ELSE 0 END) as passed,
                SUM(CASE WHEN ai_smell_passed = 0 THEN 1 ELSE 0 END) as rejected
            FROM generations
        """).fetchone()
        return dict(row) if row else {}
