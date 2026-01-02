"""Test configuration for Hypothesis and pytest behaviors in CI."""
from hypothesis import settings, HealthCheck

# Register and load a default profile for CI to avoid deadline and health check issues
settings.register_profile("ci", deadline=None, suppress_health_check=[HealthCheck.function_scoped_fixture])
settings.load_profile("ci")
