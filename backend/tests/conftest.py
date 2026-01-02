"""Test configuration for Hypothesis and pytest behaviors in CI."""

import asyncio

from hypothesis import HealthCheck, settings

# Ensure an event loop is available for tests that call asyncio.get_event_loop()
try:
    asyncio.get_running_loop()
except RuntimeError:
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

# Register and load a default profile for CI to avoid deadline and health check issues
settings.register_profile(
    "ci", deadline=None, suppress_health_check=[HealthCheck.function_scoped_fixture]
)
settings.load_profile("ci")
