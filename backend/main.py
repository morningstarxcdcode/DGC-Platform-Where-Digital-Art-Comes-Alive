"""
Main entry point for the DGC backend service.
"""

import uvicorn

from app.config import get_settings


def main():
    """Run the FastAPI application."""
    settings = get_settings()

    uvicorn.run(
        "app.api:app",
        host=settings.api_host,
        port=settings.api_port,
        workers=settings.api_workers,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )


if __name__ == "__main__":
    main()
