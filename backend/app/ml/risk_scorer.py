import numpy as np
from datetime import datetime, timezone
from typing import Optional


class RiskScorer:
    """
    Rule-based + statistical risk scoring engine.
    Scores a login attempt from 0 (safe) to 100 (high risk).
    Each signal contributes weighted points to the final score.
    """

    # Risk signal weights
    WEIGHTS = {
        "new_device": 25,
        "unusual_hour": 15,
        "multiple_failures": 30,
        "no_mfa": 10,
        "suspicious_user_agent": 20,
    }

    def score(
        self,
        failed_attempts: int = 0,
        mfa_enabled: bool = False,
        mfa_verified: bool = False,
        user_agent: Optional[str] = None,
        is_new_device: bool = False,
        login_hour: Optional[int] = None,
    ) -> dict:
        """
        Calculate risk score for a login/session event.
        Returns score 0-100 and breakdown of signals triggered.
        """
        score = 0.0
        signals = []

        # Signal 1: New/unknown device
        if is_new_device:
            score += self.WEIGHTS["new_device"]
            signals.append("new_device")

        # Signal 2: Unusual login hour (outside 6am-11pm)
        hour = login_hour if login_hour is not None else datetime.now(timezone.utc).hour
        if hour < 6 or hour > 23:
            score += self.WEIGHTS["unusual_hour"]
            signals.append("unusual_hour")

        # Signal 3: Multiple failed attempts
        if failed_attempts >= 3:
            score += self.WEIGHTS["multiple_failures"]
            signals.append("multiple_failures")
        elif failed_attempts >= 1:
            score += self.WEIGHTS["multiple_failures"] * 0.5
            signals.append("recent_failures")

        # Signal 4: MFA not enabled
        if not mfa_enabled:
            score += self.WEIGHTS["no_mfa"]
            signals.append("no_mfa")

        # Signal 5: Suspicious user agent (bots, scripts, empty)
        if user_agent:
            suspicious_keywords = ["curl", "python", "wget", "bot", "spider", "scraper"]
            if any(kw in user_agent.lower() for kw in suspicious_keywords):
                score += self.WEIGHTS["suspicious_user_agent"]
                signals.append("suspicious_user_agent")
        else:
            score += self.WEIGHTS["suspicious_user_agent"] * 0.5
            signals.append("missing_user_agent")

        # Clamp to 0-100
        final_score = min(round(score, 2), 100.0)

        return {
            "risk_score": final_score,
            "risk_level": self._level(final_score),
            "signals": signals,
            "requires_mfa": final_score >= 30,
            "block_login": final_score >= 80,
        }

    def _level(self, score: float) -> str:
        if score < 20:
            return "low"
        elif score < 50:
            return "medium"
        elif score < 80:
            return "high"
        return "critical"

    def trust_score(self, risk_score: float) -> float:
        """Inverse of risk score — represents device/session trustworthiness."""
        return round(100.0 - risk_score, 2)


risk_scorer = RiskScorer()
