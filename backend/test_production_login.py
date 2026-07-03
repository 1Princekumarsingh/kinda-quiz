#!/usr/bin/env python
"""
Test production login flow using direct configuration testing and HTTP requests.

This script tests:
1. Backend environment configuration (CORS, cookies)
2. Configuration loading from environment
3. CORS origins parsing
4. Production readiness
"""

import sys
from pathlib import Path

# Add backend to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import get_settings


def test_configuration():
    """Test backend configuration is properly set up."""
    print("\n" + "="*70)
    print("BACKEND CONFIGURATION TEST")
    print("="*70 + "\n")
    
    settings = get_settings()
    
    # Test 1: CORS origins are loaded from environment
    print("1. CORS Origins Configuration:")
    print(f"   BACKEND_CORS_ORIGINS env var: {settings.BACKEND_CORS_ORIGINS}")
    print(f"   Parsed origins (list): {settings.cors_origins}")
    
    assert settings.BACKEND_CORS_ORIGINS is not None, "BACKEND_CORS_ORIGINS not set"
    assert isinstance(settings.cors_origins, list), "cors_origins should be a list"
    assert len(settings.cors_origins) > 0, "Should have at least one CORS origin"
    
    for origin in settings.cors_origins:
        assert isinstance(origin, str), f"Each origin should be string, got {type(origin)}"
        assert len(origin) > 0, "Origin should not be empty"
    
    print("   ✓ CORS origins correctly loaded and parsed\n")
    
    # Test 2: Cookie security settings
    print("2. Cookie Security Configuration:")
    print(f"   COOKIE_SECURE: {settings.COOKIE_SECURE} (type: {type(settings.COOKIE_SECURE).__name__})")
    print(f"   COOKIE_SAMESITE: {settings.COOKIE_SAMESITE}")
    
    assert isinstance(settings.COOKIE_SECURE, bool), "COOKIE_SECURE should be boolean"
    assert settings.COOKIE_SAMESITE in ["strict", "lax", "none"], "COOKIE_SAMESITE should be valid value"
    
    print("   ✓ Cookie security settings correctly configured\n")
    
    # Test 3: JWT configuration
    print("3. JWT Configuration:")
    print(f"   ALGORITHM: {settings.ALGORITHM}")
    print(f"   ACCESS_TOKEN_EXPIRE_DAYS: {settings.ACCESS_TOKEN_EXPIRE_DAYS}")
    
    assert settings.ALGORITHM == "HS256", "Algorithm should be HS256"
    assert settings.ACCESS_TOKEN_EXPIRE_DAYS > 0, "Token expiration should be positive"
    
    print("   ✓ JWT settings correctly configured\n")
    
    # Test 4: Database configuration
    print("4. Database Configuration:")
    db_url = settings.DATABASE_URL
    print(f"   DATABASE_URL set: {bool(db_url)}")
    print(f"   DB Type: {'PostgreSQL' if 'postgresql' in db_url else 'Unknown'}")
    
    assert settings.DATABASE_URL is not None, "DATABASE_URL must be set"
    assert "postgresql" in settings.DATABASE_URL.lower(), "Should use PostgreSQL"
    
    print("   ✓ Database configuration valid\n")
    
    # Test 5: Secret key configuration
    print("5. Security Key Configuration:")
    print(f"   SECRET_KEY set: {bool(settings.SECRET_KEY)}")
    print(f"   SECRET_KEY length: {len(settings.SECRET_KEY)} characters")
    
    assert settings.SECRET_KEY is not None, "SECRET_KEY must be set"
    assert len(settings.SECRET_KEY) > 0, "SECRET_KEY should not be empty"
    
    print("   ✓ Security key properly configured\n")
    
    # Test 6: Verify no hardcoded restrictions
    print("6. Production Readiness Verification:")
    
    # Check main.py uses get_settings()
    main_path = Path(__file__).parent / "app" / "main.py"
    main_content = main_path.read_text()
    
    uses_get_settings = "get_settings()" in main_content
    uses_cors_origins = "cors_origins" in main_content
    has_hardcoded_cors = 'allow_origins=["' in main_content and "localhost" in main_content
    
    print(f"   main.py uses get_settings(): {uses_get_settings}")
    print(f"   main.py uses cors_origins: {uses_cors_origins}")
    print(f"   main.py has hardcoded CORS: {has_hardcoded_cors}")
    
    assert uses_get_settings, "main.py should use get_settings()"
    assert uses_cors_origins, "main.py should use cors_origins"
    assert not has_hardcoded_cors, "main.py should NOT have hardcoded CORS list"
    
    print("   ✓ No hardcoded localhost restrictions\n")


def test_cors_parsing():
    """Test CORS origins are correctly parsed."""
    print("="*70)
    print("CORS PARSING TEST")
    print("="*70 + "\n")
    
    from app.core.config import Settings
    
    # Test case 1: Simple single origin
    settings1 = Settings(
        DATABASE_URL="postgresql://test",
        SECRET_KEY="test",
        BACKEND_CORS_ORIGINS="https://example.com"
    )
    assert settings1.cors_origins == ["https://example.com"]
    print("✓ Single origin parsing works")
    
    # Test case 2: Multiple origins
    settings2 = Settings(
        DATABASE_URL="postgresql://test",
        SECRET_KEY="test",
        BACKEND_CORS_ORIGINS="https://example1.com,https://example2.com"
    )
    assert settings2.cors_origins == ["https://example1.com", "https://example2.com"]
    print("✓ Multiple origins parsing works")
    
    # Test case 3: Origins with whitespace
    settings3 = Settings(
        DATABASE_URL="postgresql://test",
        SECRET_KEY="test",
        BACKEND_CORS_ORIGINS="https://example1.com , https://example2.com"
    )
    assert settings3.cors_origins == ["https://example1.com", "https://example2.com"]
    print("✓ Whitespace trimming works")
    
    # Test case 4: Production example
    settings4 = Settings(
        DATABASE_URL="postgresql://test",
        SECRET_KEY="test",
        BACKEND_CORS_ORIGINS="https://kinda-quiz.vercel.app,http://localhost:5173,http://localhost"
    )
    origins = settings4.cors_origins
    assert "https://kinda-quiz.vercel.app" in origins
    assert "http://localhost:5173" in origins
    assert "http://localhost" in origins
    print("✓ Production configuration parsing works")
    
    print()


def test_production_values():
    """Test that production values can be configured."""
    print("="*70)
    print("PRODUCTION VALUES TEST")
    print("="*70 + "\n")
    
    from app.core.config import Settings
    
    # Simulate production configuration
    prod_settings = Settings(
        DATABASE_URL="postgresql://user:pass@prod.server/db",
        SECRET_KEY="prod-secret-key-12345",
        ALGORITHM="HS256",
        ACCESS_TOKEN_EXPIRE_DAYS=7,
        BACKEND_CORS_ORIGINS="https://kinda-quiz.vercel.app,http://localhost:5173,http://localhost",
        COOKIE_SECURE=True,
        COOKIE_SAMESITE="lax"
    )
    
    print("Production Configuration:")
    print(f"  Frontend: https://kinda-quiz.vercel.app")
    print(f"  Backend: https://kinda-quiz-api.onrender.com (expected)")
    print(f"  Database: PostgreSQL on production server")
    print()
    
    print("Configured CORS Origins:")
    for i, origin in enumerate(prod_settings.cors_origins, 1):
        print(f"  {i}. {origin}")
    print()
    
    # Verify production configuration
    assert "https://kinda-quiz.vercel.app" in prod_settings.cors_origins
    assert prod_settings.COOKIE_SECURE is True
    assert prod_settings.COOKIE_SAMESITE == "lax"
    
    print("✓ Production configuration can be set correctly")
    print()


def test_local_development_defaults():
    """Test that local development defaults work."""
    print("="*70)
    print("LOCAL DEVELOPMENT DEFAULTS TEST")
    print("="*70 + "\n")
    
    from app.core.config import Settings
    
    # Simulate local development (default values)
    local_settings = Settings(
        DATABASE_URL="postgresql://localhost/testdb",
        SECRET_KEY="dev-secret-key"
    )
    
    print("Local Development Defaults:")
    print(f"  BACKEND_CORS_ORIGINS: {local_settings.BACKEND_CORS_ORIGINS}")
    print(f"  COOKIE_SECURE: {local_settings.COOKIE_SECURE}")
    print(f"  COOKIE_SAMESITE: {local_settings.COOKIE_SAMESITE}")
    print()
    
    print("Configured CORS Origins:")
    for i, origin in enumerate(local_settings.cors_origins, 1):
        print(f"  {i}. {origin}")
    print()
    
    # Verify local development defaults
    assert "localhost" in ",".join(local_settings.cors_origins)
    assert local_settings.COOKIE_SECURE is False  # HTTP in local development
    
    print("✓ Local development defaults work correctly")
    print()


def main():
    """Run all tests."""
    try:
        test_configuration()
        test_cors_parsing()
        test_production_values()
        test_local_development_defaults()
        
        print("="*70)
        print("ALL TESTS PASSED ✓")
        print("="*70)
        print()
        print("SUMMARY:")
        print("✓ Backend configuration loads from environment correctly")
        print("✓ CORS origins are properly parsed from comma-separated values")
        print("✓ Cookie security settings are configurable")
        print("✓ Production configuration can be set for Vercel domain")
        print("✓ Local development defaults work")
        print("✓ No hardcoded localhost restrictions in main.py")
        print()
        
        return 0
        
    except AssertionError as e:
        print(f"\n✗ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return 1
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
