"""
Emotional AI Service for the DGC Platform.

This module provides the Emotional Intelligence functionality - NFTs that
respond to and adapt based on the viewer's emotional state.
"""

import hashlib
from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional
from enum import Enum
from datetime import datetime


class EmotionType(Enum):
    """Types of emotions that can be detected."""
    HAPPY = "HAPPY"
    SAD = "SAD"
    ANGRY = "ANGRY"
    FEARFUL = "FEARFUL"
    SURPRISED = "SURPRISED"
    DISGUSTED = "DISGUSTED"
    NEUTRAL = "NEUTRAL"
    EXCITED = "EXCITED"
    CALM = "CALM"
    ANXIOUS = "ANXIOUS"


class AdaptationType(Enum):
    """Types of visual adaptations."""
    COLOR_SHIFT = "COLOR_SHIFT"
    BRIGHTNESS = "BRIGHTNESS"
    SATURATION = "SATURATION"
    ANIMATION_SPEED = "ANIMATION_SPEED"
    COMPLEXITY = "COMPLEXITY"
    WARMTH = "WARMTH"
    CONTRAST = "CONTRAST"


@dataclass
class EmotionState:
    """Current emotional state of a user."""
    primary_emotion: EmotionType
    confidence: float  # 0-1
    secondary_emotion: Optional[EmotionType] = None
    secondary_confidence: float = 0.0
    valence: float = 0.0  # -1 (negative) to 1 (positive)
    arousal: float = 0.5  # 0 (calm) to 1 (excited)
    timestamp: int = field(
        default_factory=lambda: int(datetime.now().timestamp())
    )

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        sec_emo = self.secondary_emotion
        return {
            "primary_emotion": self.primary_emotion.value,
            "confidence": self.confidence,
            "secondary_emotion": sec_emo.value if sec_emo else None,
            "secondary_confidence": self.secondary_confidence,
            "valence": self.valence,
            "arousal": self.arousal,
            "timestamp": self.timestamp
        }


@dataclass
class ContentAdaptation:
    """Adaptation parameters for content based on emotion."""
    color_shift_hue: float = 0.0  # -180 to 180 degrees
    brightness_factor: float = 1.0  # 0.5 to 1.5
    saturation_factor: float = 1.0  # 0.5 to 1.5
    animation_speed: float = 1.0  # 0.25 to 2.0
    complexity_level: float = 0.5  # 0 to 1
    warmth_shift: float = 0.0  # -1 (cool) to 1 (warm)
    contrast_factor: float = 1.0  # 0.5 to 1.5
    glow_intensity: float = 0.0  # 0 to 1
    particle_density: float = 0.5  # 0 to 1

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "color_shift_hue": self.color_shift_hue,
            "brightness_factor": self.brightness_factor,
            "saturation_factor": self.saturation_factor,
            "animation_speed": self.animation_speed,
            "complexity_level": self.complexity_level,
            "warmth_shift": self.warmth_shift,
            "contrast_factor": self.contrast_factor,
            "glow_intensity": self.glow_intensity,
            "particle_density": self.particle_density
        }

    def to_css_filters(self) -> str:
        """Convert to CSS filter string."""
        filters = []
        tolerance = 0.001

        if abs(self.brightness_factor - 1.0) > tolerance:
            filters.append(f"brightness({self.brightness_factor})")

        if abs(self.saturation_factor - 1.0) > tolerance:
            filters.append(f"saturate({self.saturation_factor})")

        if abs(self.contrast_factor - 1.0) > tolerance:
            filters.append(f"contrast({self.contrast_factor})")

        if self.color_shift_hue != 0:
            filters.append(f"hue-rotate({self.color_shift_hue}deg)")

        if self.warmth_shift > 0:
            filters.append(f"sepia({abs(self.warmth_shift) * 0.3})")

        return " ".join(filters) if filters else "none"


@dataclass
class EmotionalProfile:
    """Emotional response profile for a piece of content."""
    content_id: str
    base_mood: EmotionType = EmotionType.NEUTRAL
    sensitivity: float = 0.5  # How much it reacts (0-1)
    response_style: str = "empathetic"  # empathetic, contrasting, amplifying
    color_palette: Dict[EmotionType, str] = field(default_factory=dict)
    animation_styles: Dict[EmotionType, str] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        colors = {k.value: v for k, v in self.color_palette.items()}
        anims = {k.value: v for k, v in self.animation_styles.items()}
        return {
            "content_id": self.content_id,
            "base_mood": self.base_mood.value,
            "sensitivity": self.sensitivity,
            "response_style": self.response_style,
            "color_palette": colors,
            "animation_styles": anims
        }


class EmotionAI:
    """
    AI service for detecting emotions and adapting content.

    This implements the Emotional Intelligence system that makes
    NFTs respond to viewer emotions in real-time.
    """

    # Emotion to color mapping (hue values)
    EMOTION_COLORS = {
        EmotionType.HAPPY: {"hue": 45, "saturation": 1.3, "brightness": 1.2},
        EmotionType.SAD: {"hue": 220, "saturation": 0.7, "brightness": 0.8},
        EmotionType.ANGRY: {"hue": 0, "saturation": 1.4, "brightness": 0.9},
        EmotionType.FEARFUL: {
            "hue": 280, "saturation": 0.8, "brightness": 0.7
        },
        EmotionType.SURPRISED: {
            "hue": 180, "saturation": 1.2, "brightness": 1.3
        },
        EmotionType.DISGUSTED: {
            "hue": 90, "saturation": 0.6, "brightness": 0.75
        },
        EmotionType.NEUTRAL: {"hue": 0, "saturation": 1.0, "brightness": 1.0},
        EmotionType.EXCITED: {"hue": 30, "saturation": 1.5, "brightness": 1.3},
        EmotionType.CALM: {"hue": 200, "saturation": 0.8, "brightness": 1.1},
        EmotionType.ANXIOUS: {
            "hue": 300, "saturation": 0.9, "brightness": 0.85
        }
    }

    # Emotion to animation mapping
    EMOTION_ANIMATIONS = {
        EmotionType.HAPPY: {"speed": 1.3, "complexity": 0.7, "particles": 0.8},
        EmotionType.SAD: {"speed": 0.5, "complexity": 0.3, "particles": 0.2},
        EmotionType.ANGRY: {"speed": 1.8, "complexity": 0.8, "particles": 0.9},
        EmotionType.FEARFUL: {
            "speed": 1.5, "complexity": 0.4, "particles": 0.6
        },
        EmotionType.SURPRISED: {
            "speed": 2.0, "complexity": 0.9, "particles": 1.0
        },
        EmotionType.DISGUSTED: {
            "speed": 0.6, "complexity": 0.2, "particles": 0.1
        },
        EmotionType.NEUTRAL: {
            "speed": 1.0, "complexity": 0.5, "particles": 0.5
        },
        EmotionType.EXCITED: {
            "speed": 1.7, "complexity": 0.85, "particles": 0.95
        },
        EmotionType.CALM: {"speed": 0.4, "complexity": 0.3, "particles": 0.3},
        EmotionType.ANXIOUS: {
            "speed": 1.4, "complexity": 0.6, "particles": 0.7
        }
    }

    def __init__(self):
        """Initialize the Emotion AI service."""
        self._profiles: Dict[str, EmotionalProfile] = {}
        self._emotion_history: Dict[str, List[EmotionState]] = {}

    def analyze_facial_expression(
        self,
        image_data: bytes
    ) -> EmotionState:
        """
        Analyze facial expression from image data.

        In production, use a trained model like FER2013 or AffectNet.
        For now, returns a simulated emotion state.

        Args:
            image_data: Raw image bytes (webcam capture)

        Returns:
            EmotionState with detected emotion
        """
        # Simulate emotion detection based on image hash
        # In production, use actual ML model
        img_hash = hashlib.md5(image_data).hexdigest()
        emotion_index = int(img_hash[:2], 16) % len(EmotionType)
        emotions = list(EmotionType)

        primary = emotions[emotion_index]
        hash_offset = int(img_hash[2:4], 16) % 3
        secondary_index = (emotion_index + hash_offset) % len(emotions)
        is_different = secondary_index != emotion_index
        secondary = emotions[secondary_index] if is_different else None

        confidence = 0.5 + (int(img_hash[4:6], 16) / 512)  # 0.5-1.0

        # Calculate valence and arousal
        valence = self._calculate_valence(primary)
        arousal = self._calculate_arousal(primary)

        return EmotionState(
            primary_emotion=primary,
            confidence=confidence,
            secondary_emotion=secondary,
            secondary_confidence=confidence * 0.5 if secondary else 0,
            valence=valence,
            arousal=arousal
        )

    def analyze_voice_emotion(
        self,
        audio_data: bytes
    ) -> EmotionState:
        """
        Analyze emotional state from voice data.

        Args:
            audio_data: Raw audio bytes

        Returns:
            EmotionState with detected emotion
        """
        # Simulate emotion detection from voice
        audio_hash = hashlib.md5(audio_data).hexdigest()
        emotion_index = int(audio_hash[:2], 16) % len(EmotionType)
        emotions = list(EmotionType)

        primary = emotions[emotion_index]
        confidence = 0.4 + (int(audio_hash[4:6], 16) / 426)  # 0.4-1.0

        return EmotionState(
            primary_emotion=primary,
            confidence=confidence,
            valence=self._calculate_valence(primary),
            arousal=self._calculate_arousal(primary)
        )

    def analyze_text_sentiment(
        self,
        text: str
    ) -> EmotionState:
        """
        Analyze emotional sentiment from text.

        Args:
            text: Text to analyze

        Returns:
            EmotionState with detected emotion
        """
        text_lower = text.lower()

        # Simple keyword-based sentiment analysis
        happy_words = [
            "happy", "joy", "love", "great", "wonderful",
            "amazing", "excited", "good", "best", "awesome"
        ]
        sad_words = [
            "sad", "unhappy", "depressed", "down", "blue",
            "cry", "tears", "grief", "sorrow", "lonely"
        ]
        angry_words = [
            "angry", "mad", "furious", "rage", "hate",
            "annoyed", "frustrated", "irritated"
        ]
        fear_words = [
            "scared", "afraid", "fear", "terrified",
            "anxious", "worried", "nervous"
        ]
        surprise_words = [
            "surprised", "shocked", "wow", "amazing",
            "unexpected", "astonished"
        ]
        excited_words = [
            "excited", "thrilled", "pumped", "eager", "enthusiastic"
        ]
        calm_words = [
            "calm", "peaceful", "serene", "relaxed", "tranquil", "zen"
        ]

        emotion_keywords = {
            EmotionType.HAPPY: happy_words,
            EmotionType.SAD: sad_words,
            EmotionType.ANGRY: angry_words,
            EmotionType.FEARFUL: fear_words,
            EmotionType.SURPRISED: surprise_words,
            EmotionType.EXCITED: excited_words,
            EmotionType.CALM: calm_words
        }

        scores = dict.fromkeys(EmotionType, 0)
        word_count = 0

        for emotion, keywords in emotion_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    scores[emotion] += 1
                    word_count += 1

        if word_count == 0:
            return EmotionState(
                primary_emotion=EmotionType.NEUTRAL,
                confidence=0.5,
                valence=0,
                arousal=0.5
            )

        # Find primary emotion by highest score
        primary_emotion = max(
            scores.keys(),
            key=lambda e: scores[e]
        )
        primary_score = scores[primary_emotion]
        confidence = min(primary_score / 3, 1.0)  # Cap at 1.0

        # Find secondary emotion
        scores[primary_emotion] = 0
        secondary_emotion = max(
            scores.keys(),
            key=lambda e: scores[e]
        )
        secondary_score = scores[secondary_emotion]

        has_secondary = secondary_score > 0
        sec_conf = secondary_score / 3 if has_secondary else 0

        return EmotionState(
            primary_emotion=primary_emotion,
            confidence=max(0.3, confidence),
            secondary_emotion=secondary_emotion if has_secondary else None,
            secondary_confidence=sec_conf,
            valence=self._calculate_valence(primary_emotion),
            arousal=self._calculate_arousal(primary_emotion)
        )

    def _calculate_valence(self, emotion: EmotionType) -> float:
        """Calculate valence (-1 to 1) for an emotion."""
        valence_map = {
            EmotionType.HAPPY: 0.8,
            EmotionType.SAD: -0.7,
            EmotionType.ANGRY: -0.6,
            EmotionType.FEARFUL: -0.5,
            EmotionType.SURPRISED: 0.3,
            EmotionType.DISGUSTED: -0.8,
            EmotionType.NEUTRAL: 0.0,
            EmotionType.EXCITED: 0.9,
            EmotionType.CALM: 0.4,
            EmotionType.ANXIOUS: -0.4
        }
        return valence_map.get(emotion, 0.0)

    def _calculate_arousal(self, emotion: EmotionType) -> float:
        """Calculate arousal (0 to 1) for an emotion."""
        arousal_map = {
            EmotionType.HAPPY: 0.7,
            EmotionType.SAD: 0.2,
            EmotionType.ANGRY: 0.9,
            EmotionType.FEARFUL: 0.8,
            EmotionType.SURPRISED: 0.95,
            EmotionType.DISGUSTED: 0.5,
            EmotionType.NEUTRAL: 0.3,
            EmotionType.EXCITED: 0.95,
            EmotionType.CALM: 0.1,
            EmotionType.ANXIOUS: 0.75
        }
        return arousal_map.get(emotion, 0.5)

    def generate_adaptation(
        self,
        emotion_state: EmotionState,
        profile: Optional[EmotionalProfile] = None,
        transition_duration: float = 0.5
    ) -> ContentAdaptation:
        """
        Generate content adaptation based on emotion state.

        Args:
            emotion_state: Current emotion state
            profile: Optional emotional profile for content
            transition_duration: Duration for animations (seconds)

        Returns:
            ContentAdaptation with visual parameters
        """
        _ = transition_duration  # Reserved for future animation support
        emotion = emotion_state.primary_emotion
        confidence = emotion_state.confidence

        # Get base parameters for emotion
        default_colors = self.EMOTION_COLORS[EmotionType.NEUTRAL]
        default_anims = self.EMOTION_ANIMATIONS[EmotionType.NEUTRAL]
        color_params = self.EMOTION_COLORS.get(emotion, default_colors)
        anim_params = self.EMOTION_ANIMATIONS.get(emotion, default_anims)

        # Apply confidence scaling
        sensitivity = profile.sensitivity if profile else 0.5
        effect_strength = confidence * sensitivity

        # Calculate color and animation factors
        brightness_delta = color_params["brightness"] - 1.0
        saturation_delta = color_params["saturation"] - 1.0
        speed_delta = anim_params["speed"] - 1.0
        arousal_factor = emotion_state.arousal * effect_strength * 0.3

        # Calculate adaptation parameters
        adaptation = ContentAdaptation(
            color_shift_hue=color_params["hue"] * effect_strength,
            brightness_factor=1.0 + brightness_delta * effect_strength,
            saturation_factor=1.0 + saturation_delta * effect_strength,
            animation_speed=1.0 + speed_delta * effect_strength,
            complexity_level=anim_params["complexity"] * effect_strength,
            warmth_shift=emotion_state.valence * effect_strength * 0.5,
            contrast_factor=1.0 + arousal_factor,
            glow_intensity=max(0, emotion_state.valence) * effect_strength,
            particle_density=anim_params["particles"] * effect_strength
        )

        # Apply profile-specific adjustments
        if profile and profile.response_style == "contrasting":
            new_hue = (adaptation.color_shift_hue + 180) % 360
            adaptation.color_shift_hue = new_hue
            adaptation.warmth_shift *= -1
        elif profile and profile.response_style == "amplifying":
            bright_delta = adaptation.brightness_factor - 1.0
            sat_delta = adaptation.saturation_factor - 1.0
            adaptation.brightness_factor = 1.0 + bright_delta * 1.5
            adaptation.saturation_factor = 1.0 + sat_delta * 1.5

        return adaptation

    def create_profile(
        self,
        content_id: str,
        base_mood: EmotionType = EmotionType.NEUTRAL,
        sensitivity: float = 0.5,
        response_style: str = "empathetic"
    ) -> EmotionalProfile:
        """
        Create an emotional profile for content.

        Args:
            content_id: Unique identifier for the content
            base_mood: Default emotional state of the content
            sensitivity: How strongly it reacts to emotions (0-1)
            response_style: How it responds (empathetic/contrasting/amplifying)

        Returns:
            EmotionalProfile for the content
        """
        profile = EmotionalProfile(
            content_id=content_id,
            base_mood=base_mood,
            sensitivity=sensitivity,
            response_style=response_style
        )

        # Generate color palette for each emotion
        for emotion in EmotionType:
            color_params = self.EMOTION_COLORS[emotion]
            hue = color_params["hue"]
            # Convert to hex color (simplified)
            profile.color_palette[emotion] = f"hsl({hue}, 70%, 50%)"

        # Generate animation styles
        for emotion in EmotionType:
            anim_params = self.EMOTION_ANIMATIONS[emotion]
            speed = anim_params["speed"]
            if speed > 1.5:
                profile.animation_styles[emotion] = "energetic"
            elif speed < 0.7:
                profile.animation_styles[emotion] = "gentle"
            else:
                profile.animation_styles[emotion] = "flowing"

        self._profiles[content_id] = profile
        return profile

    def get_profile(self, content_id: str) -> Optional[EmotionalProfile]:
        """Get emotional profile by content ID."""
        return self._profiles.get(content_id)

    def record_emotion(
        self,
        content_id: str,
        emotion_state: EmotionState
    ) -> None:
        """Record emotion state for content interaction history."""
        if content_id not in self._emotion_history:
            self._emotion_history[content_id] = []

        self._emotion_history[content_id].append(emotion_state)

        # Keep only last 1000 entries
        if len(self._emotion_history[content_id]) > 1000:
            history = self._emotion_history[content_id]
            self._emotion_history[content_id] = history[-1000:]

    def get_emotion_history(
        self,
        content_id: str,
        limit: int = 100
    ) -> List[EmotionState]:
        """Get emotion history for content."""
        history = self._emotion_history.get(content_id, [])
        return history[-limit:]

    def calculate_emotional_resonance(
        self,
        content_id: str
    ) -> Dict[str, Any]:
        """
        Calculate emotional resonance based on interaction history.

        Returns metrics about emotional engagement.
        """
        history = self._emotion_history.get(content_id, [])

        if not history:
            return {
                "resonance_score": 0,
                "dominant_emotion": None,
                "emotional_diversity": 0,
                "average_valence": 0,
                "average_arousal": 0.5,
                "interaction_count": 0
            }

        # Count emotions
        emotion_counts: Dict[str, int] = {}
        total_valence: float = 0.0
        total_arousal: float = 0.0

        for state in history:
            emotion = state.primary_emotion.value
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
            total_valence += state.valence
            total_arousal += state.arousal

        # Calculate metrics
        dominant_emotion = max(
            emotion_counts.keys(),
            key=lambda k: emotion_counts[k]
        )
        emotional_diversity = len(emotion_counts) / len(EmotionType)

        # Resonance = engagement * diversity * positive sentiment
        avg_valence = total_valence / len(history)
        avg_arousal = total_arousal / len(history)

        engagement = min(len(history) / 100, 1.0)  # Cap at 100
        valence_factor = 0.5 + avg_valence * 0.5
        resonance = engagement * emotional_diversity * valence_factor * 100

        return {
            "resonance_score": round(resonance, 2),
            "dominant_emotion": dominant_emotion,
            "emotional_diversity": round(emotional_diversity, 2),
            "average_valence": round(avg_valence, 2),
            "average_arousal": round(avg_arousal, 2),
            "interaction_count": len(history),
            "emotion_distribution": emotion_counts
        }


# Singleton instance
_emotion_ai: Optional[EmotionAI] = None


def get_emotion_ai() -> EmotionAI:
    """Get the singleton Emotion AI instance."""
    global _emotion_ai
    if _emotion_ai is None:
        _emotion_ai = EmotionAI()
    return _emotion_ai
