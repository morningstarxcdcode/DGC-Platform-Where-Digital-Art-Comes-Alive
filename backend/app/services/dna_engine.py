"""
Content DNA Engine for the DGC Platform.

This module provides the Content DNA System™ functionality - the world's first
genetic code system for digital content. Each NFT has unique DNA that determines
its characteristics and can be used for breeding/evolution.
"""

import hashlib
import json
import random
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple


class GeneType(Enum):
    """Types of genes in content DNA."""

    COLOR = "COLOR"
    STYLE = "STYLE"
    MOOD = "MOOD"
    COMPLEXITY = "COMPLEXITY"
    ENERGY = "ENERGY"
    HARMONY = "HARMONY"
    CONTRAST = "CONTRAST"
    TEXTURE = "TEXTURE"


@dataclass
class Gene:
    """A single gene in the DNA sequence."""

    gene_type: GeneType
    value: float  # 0.0 to 1.0
    dominant: bool = True
    mutation_rate: float = 0.05


@dataclass
class ContentDNA:
    """
    Complete DNA structure for AI-generated content.

    Attributes:
        dna_hash: Unique identifier for this DNA
        genes: Dictionary of gene types to gene values
        generation: Which generation this DNA is (0 for original)
        parent_hashes: DNA hashes of parents (if bred)
        mutation_history: List of mutations that occurred
        created_at: Timestamp of DNA creation
    """

    dna_hash: str
    genes: Dict[GeneType, Gene] = field(default_factory=dict)
    generation: int = 0
    parent_hashes: List[str] = field(default_factory=list)
    mutation_history: List[Dict[str, Any]] = field(default_factory=list)
    created_at: int = field(default_factory=lambda: int(datetime.now().timestamp()))

    def to_dict(self) -> Dict[str, Any]:
        """Convert DNA to dictionary for serialization."""
        return {
            "dna_hash": self.dna_hash,
            "genes": {
                gene_type.value: {
                    "value": gene.value,
                    "dominant": gene.dominant,
                    "mutation_rate": gene.mutation_rate,
                }
                for gene_type, gene in self.genes.items()
            },
            "generation": self.generation,
            "parent_hashes": self.parent_hashes,
            "mutation_history": self.mutation_history,
            "created_at": self.created_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ContentDNA":
        """Create DNA from dictionary."""
        genes = {}
        for gene_type_str, gene_data in data.get("genes", {}).items():
            gene_type = GeneType(gene_type_str)
            genes[gene_type] = Gene(
                gene_type=gene_type,
                value=gene_data["value"],
                dominant=gene_data.get("dominant", True),
                mutation_rate=gene_data.get("mutation_rate", 0.05),
            )

        return cls(
            dna_hash=data["dna_hash"],
            genes=genes,
            generation=data.get("generation", 0),
            parent_hashes=data.get("parent_hashes", []),
            mutation_history=data.get("mutation_history", []),
            created_at=data.get("created_at", int(datetime.now().timestamp())),
        )

    def get_trait_string(self) -> str:
        """Get a human-readable string of traits."""
        traits = []
        for gene_type, gene in self.genes.items():
            if gene.value > 0.7:
                traits.append(f"High {gene_type.value.lower()}")
            elif gene.value < 0.3:
                traits.append(f"Low {gene_type.value.lower()}")
        return ", ".join(traits) if traits else "Balanced traits"

    def calculate_rarity_score(self) -> float:
        """Calculate how rare this DNA is (0-100)."""
        extreme_values = 0
        for gene in self.genes.values():
            if gene.value > 0.9 or gene.value < 0.1:
                extreme_values += 2
            elif gene.value > 0.8 or gene.value < 0.2:
                extreme_values += 1

        base_rarity = (extreme_values / len(self.genes)) * 50 if self.genes else 0
        generation_bonus = min(self.generation * 5, 30)
        mutation_bonus = min(len(self.mutation_history) * 2, 20)

        return min(base_rarity + generation_bonus + mutation_bonus, 100)


class ContentDNAEngine:
    """
    Engine for generating and manipulating Content DNA.

    This implements the Content DNA System™ that makes each NFT unique
    and allows for breeding/evolution of content.
    """

    def __init__(self, seed: Optional[int] = None):
        """Initialize the DNA engine with optional seed."""
        self._random = random.Random(seed)
        self._dna_registry: Dict[str, ContentDNA] = {}

    def generate_dna_from_prompt(
        self, prompt: str, style: Optional[Dict[str, Any]] = None
    ) -> ContentDNA:
        """
        Generate DNA from a text prompt.

        The DNA is deterministically generated from the prompt to ensure
        reproducibility while maintaining uniqueness.

        Args:
            prompt: The generation prompt
            style: Optional style parameters

        Returns:
            ContentDNA with unique genetic code
        """
        # Create hash from prompt for deterministic generation
        prompt_hash = hashlib.sha256(prompt.encode()).hexdigest()
        seed = int(prompt_hash[:8], 16)
        random.seed(seed)

        genes = {}
        for gene_type in GeneType:
            # Generate gene value based on prompt characteristics
            base_value = random.random()

            # Adjust based on prompt keywords
            adjustments = self._analyze_prompt_for_gene(prompt, gene_type)
            adjusted_value = max(0.0, min(1.0, base_value + adjustments))

            genes[gene_type] = Gene(
                gene_type=gene_type,
                value=adjusted_value,
                dominant=random.random() > 0.3,  # 70% chance dominant
                mutation_rate=0.03 + random.random() * 0.04,  # 3-7% mutation
            )

        # Apply style overrides if provided
        if style:
            genes = self._apply_style_to_genes(genes, style)

        # Generate unique DNA hash
        dna_data = json.dumps(
            {gene_type.value: gene.value for gene_type, gene in genes.items()}, sort_keys=True
        )
        dna_hash = "DNA_" + hashlib.sha256(dna_data.encode()).hexdigest()[:32]

        dna = ContentDNA(
            dna_hash=dna_hash, genes=genes, generation=0, parent_hashes=[], mutation_history=[]
        )

        self._dna_registry[dna_hash] = dna
        return dna

    def _analyze_prompt_for_gene(self, prompt: str, gene_type: GeneType) -> float:
        """Analyze prompt for gene-specific adjustments."""
        prompt_lower = prompt.lower()
        adjustment = 0.0

        keywords = {
            GeneType.COLOR: {
                "bright": 0.2,
                "dark": -0.2,
                "colorful": 0.3,
                "monochrome": -0.3,
                "vibrant": 0.25,
                "muted": -0.15,
            },
            GeneType.STYLE: {
                "abstract": 0.3,
                "realistic": -0.2,
                "cartoon": 0.2,
                "photorealistic": -0.3,
                "artistic": 0.15,
            },
            GeneType.MOOD: {
                "happy": 0.3,
                "sad": -0.2,
                "peaceful": 0.1,
                "energetic": 0.2,
                "calm": -0.1,
                "dramatic": 0.15,
            },
            GeneType.COMPLEXITY: {
                "simple": -0.3,
                "complex": 0.3,
                "minimal": -0.25,
                "detailed": 0.25,
                "intricate": 0.35,
            },
            GeneType.ENERGY: {
                "dynamic": 0.3,
                "static": -0.2,
                "moving": 0.2,
                "still": -0.15,
                "action": 0.25,
            },
            GeneType.HARMONY: {
                "balanced": 0.2,
                "chaotic": -0.2,
                "symmetric": 0.15,
                "asymmetric": -0.1,
                "unified": 0.2,
            },
            GeneType.CONTRAST: {
                "high contrast": 0.3,
                "low contrast": -0.2,
                "bold": 0.2,
                "subtle": -0.15,
            },
            GeneType.TEXTURE: {
                "smooth": -0.2,
                "rough": 0.2,
                "textured": 0.25,
                "glossy": -0.1,
                "matte": 0.1,
            },
        }

        for keyword, value in keywords.get(gene_type, {}).items():
            if keyword in prompt_lower:
                adjustment += value

        return adjustment

    def _apply_style_to_genes(
        self, genes: Dict[GeneType, Gene], style: Dict[str, Any]
    ) -> Dict[GeneType, Gene]:
        """Apply style parameters to gene values."""
        for gene_type, gene in genes.items():
            style_key = gene_type.value.lower()
            if style_key in style:
                gene.value = max(0.0, min(1.0, style[style_key]))
        return genes

    def breed_dna(
        self, parent1_hash: str, parent2_hash: str, mutation_boost: float = 0.0
    ) -> ContentDNA:
        """
        Breed two DNA sequences to create offspring.

        Uses genetic inheritance rules:
        - Dominant genes are more likely to be inherited
        - Mutations can occur based on mutation rates
        - Generation is incremented

        Args:
            parent1_hash: DNA hash of first parent
            parent2_hash: DNA hash of second parent
            mutation_boost: Additional mutation probability (0-1)

        Returns:
            New ContentDNA offspring
        """
        if parent1_hash not in self._dna_registry:
            raise ValueError(f"Parent DNA not found: {parent1_hash}")
        if parent2_hash not in self._dna_registry:
            raise ValueError(f"Parent DNA not found: {parent2_hash}")

        parent1 = self._dna_registry[parent1_hash]
        parent2 = self._dna_registry[parent2_hash]

        child_genes = {}
        mutations = []

        for gene_type in GeneType:
            gene1 = parent1.genes.get(gene_type)
            gene2 = parent2.genes.get(gene_type)

            if gene1 is None or gene2 is None:
                continue

            # Inheritance based on dominance
            if gene1.dominant and not gene2.dominant:
                base_value = gene1.value
                source = "parent1"
            elif gene2.dominant and not gene1.dominant:
                base_value = gene2.value
                source = "parent2"
            else:
                # Both dominant or both recessive - blend
                base_value = (gene1.value + gene2.value) / 2
                source = "blend"

            # Check for mutation
            mutation_rate = max(gene1.mutation_rate, gene2.mutation_rate) + mutation_boost
            mutated = self._random.random() < mutation_rate

            if mutated:
                mutation_amount = (self._random.random() - 0.5) * 0.4
                final_value = max(0.0, min(1.0, base_value + mutation_amount))
                mutations.append(
                    {
                        "gene": gene_type.value,
                        "original": base_value,
                        "mutated": final_value,
                        "source": source,
                    }
                )
            else:
                final_value = base_value

            # Inherit mutation rate with slight variation
            new_mutation_rate = (gene1.mutation_rate + gene2.mutation_rate) / 2
            new_mutation_rate += (self._random.random() - 0.5) * 0.01
            new_mutation_rate = max(0.01, min(0.15, new_mutation_rate))

            child_genes[gene_type] = Gene(
                gene_type=gene_type,
                value=final_value,
                dominant=self._random.random() > 0.3,
                mutation_rate=new_mutation_rate,
            )

        # Generate offspring DNA hash
        dna_data = json.dumps(
            {gene_type.value: gene.value for gene_type, gene in child_genes.items()}, sort_keys=True
        )
        child_hash = "DNA_" + hashlib.sha256(dna_data.encode()).hexdigest()[:32]

        child_dna = ContentDNA(
            dna_hash=child_hash,
            genes=child_genes,
            generation=max(parent1.generation, parent2.generation) + 1,
            parent_hashes=[parent1_hash, parent2_hash],
            mutation_history=mutations,
        )

        self._dna_registry[child_hash] = child_dna
        return child_dna

    def evolve_dna(
        self, dna_hash: str, environmental_factors: Optional[Dict[str, float]] = None
    ) -> ContentDNA:
        """
        Evolve DNA based on environmental factors (time, interactions, etc.).

        Args:
            dna_hash: DNA hash to evolve
            environmental_factors: Dict of factor names to influence values

        Returns:
            Evolved ContentDNA
        """
        if dna_hash not in self._dna_registry:
            raise ValueError(f"DNA not found: {dna_hash}")

        original = self._dna_registry[dna_hash]
        evolved_genes = {}
        mutations = []

        for gene_type, gene in original.genes.items():
            # Apply environmental pressure
            pressure = 0.0
            if environmental_factors:
                factor_name = gene_type.value.lower()
                if factor_name in environmental_factors:
                    pressure = environmental_factors[factor_name]

            # Evolution with pressure
            evolution_amount = (self._random.random() - 0.5) * 0.1 + pressure * 0.05
            new_value = max(0.0, min(1.0, gene.value + evolution_amount))

            if abs(new_value - gene.value) > 0.02:
                mutations.append(
                    {
                        "gene": gene_type.value,
                        "original": gene.value,
                        "evolved": new_value,
                        "pressure": pressure,
                    }
                )

            evolved_genes[gene_type] = Gene(
                gene_type=gene_type,
                value=new_value,
                dominant=gene.dominant,
                mutation_rate=gene.mutation_rate,
            )

        # Generate evolved DNA hash
        dna_data = json.dumps(
            {gene_type.value: gene.value for gene_type, gene in evolved_genes.items()},
            sort_keys=True,
        )
        evolved_hash = "DNA_" + hashlib.sha256(dna_data.encode()).hexdigest()[:32]

        evolved_dna = ContentDNA(
            dna_hash=evolved_hash,
            genes=evolved_genes,
            generation=original.generation,
            parent_hashes=[dna_hash],  # Track evolution lineage
            mutation_history=original.mutation_history + mutations,
        )

        self._dna_registry[evolved_hash] = evolved_dna
        return evolved_dna

    def get_dna(self, dna_hash: str) -> Optional[ContentDNA]:
        """Get DNA by hash."""
        return self._dna_registry.get(dna_hash)

    def register_dna(self, dna: ContentDNA) -> None:
        """Register external DNA in the engine."""
        self._dna_registry[dna.dna_hash] = dna

    def calculate_compatibility(self, dna_hash1: str, dna_hash2: str) -> float:
        """
        Calculate breeding compatibility between two DNA sequences.

        Returns a score from 0-100 indicating how well the DNAs can breed.
        Higher diversity generally means more interesting offspring.

        Args:
            dna_hash1: First DNA hash
            dna_hash2: Second DNA hash

        Returns:
            Compatibility score (0-100)
        """
        dna1 = self._dna_registry.get(dna_hash1)
        dna2 = self._dna_registry.get(dna_hash2)

        if not dna1 or not dna2:
            return 0.0

        # Calculate genetic diversity
        diversity_sum = 0.0
        gene_count = 0

        for gene_type in GeneType:
            gene1 = dna1.genes.get(gene_type)
            gene2 = dna2.genes.get(gene_type)

            if gene1 and gene2:
                diversity = abs(gene1.value - gene2.value)
                diversity_sum += diversity
                gene_count += 1

        if gene_count == 0:
            return 0.0

        # Moderate diversity is best (not too similar, not too different)
        avg_diversity = diversity_sum / gene_count
        if avg_diversity < 0.2:
            compatibility = avg_diversity * 250  # Too similar
        elif avg_diversity > 0.8:
            compatibility = (1 - avg_diversity) * 250  # Too different
        else:
            compatibility = 50 + (0.5 - abs(0.5 - avg_diversity)) * 100

        # Bonus for complementary dominance
        complementary_count = 0
        for gene_type in GeneType:
            gene1 = dna1.genes.get(gene_type)
            gene2 = dna2.genes.get(gene_type)
            if gene1 and gene2 and gene1.dominant != gene2.dominant:
                complementary_count += 1

        complementary_bonus = (complementary_count / len(GeneType)) * 20

        return min(compatibility + complementary_bonus, 100)


# Singleton instance
_dna_engine: Optional[ContentDNAEngine] = None


def get_dna_engine() -> ContentDNAEngine:
    """Get the singleton DNA engine instance."""
    global _dna_engine
    if _dna_engine is None:
        _dna_engine = ContentDNAEngine()
    return _dna_engine
