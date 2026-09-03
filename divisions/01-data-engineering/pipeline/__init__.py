"""
Pipeline package for Division 1.

Contains the orchestrator that coordinates
all stages of the data engineering pipeline.
"""

from .runner import (
    PipelineResult,
    run_dataset,
    run_pipeline,
    summarize_results,
)


__all__ = [
    "PipelineResult",
    "run_dataset",
    "run_pipeline",
    "summarize_results",
]
