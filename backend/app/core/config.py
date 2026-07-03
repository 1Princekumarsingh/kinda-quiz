from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables via .env file.
    
    All configuration values can be overridden by setting environment variables.
    For local development, use a .env file in the backend directory.
    For production, set environment variables directly on the deployment platform
    (e.g., Render, Docker, etc.).
    """
    
    # =========================================================================
    # Database Configuration
    # =========================================================================
    DATABASE_URL: str
    """PostgreSQL connection string. Required. Format: postgresql://user:pass@host/db"""
    
    # =========================================================================
    # JWT & Authentication Configuration
    # =========================================================================
    SECRET_KEY: str
    """Secret key for signing JWT tokens. Must be kept secret and changed in production."""
    
    ALGORITHM: str = "HS256"
    """JWT signing algorithm. Default: HS256"""
    
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    """JWT token expiration time in days. Default: 7"""
    
    # =========================================================================
    # CORS Configuration
    # =========================================================================
    BACKEND_CORS_ORIGINS: str = "http://localhost:5173,http://localhost"
    """
    Comma-separated list of allowed CORS origins.
    
    Local Development (default):
      - http://localhost:5173  (Vite dev server)
      - http://localhost        (nginx/docker)
    
    Production Example (Vercel + Render):
      - https://kinda-quiz.vercel.app      (frontend)
      - http://localhost:5173              (for testing)
      - http://localhost                   (for docker-compose)
    
    Set via environment variable: BACKEND_CORS_ORIGINS="origin1,origin2,origin3"
    """
    
    # =========================================================================
    # Cookie Security Configuration
    # =========================================================================
    COOKIE_SECURE: bool = False
    """
    Whether to set the Secure flag on cookies (HTTPS only).
    
    Local Development: False (uses HTTP)
    Production: True (requires HTTPS)
    
    Set via environment variable: COOKIE_SECURE=true (or false)
    """
    
    COOKIE_SAMESITE: str = "lax"
    """
    SameSite policy for cookies: 'strict', 'lax', or 'none'.
    
    Default: 'lax' - Recommended for most applications
    Options:
      - 'lax': Cookies sent with same-site requests and cross-site top-level navigations
      - 'strict': Cookies only sent with same-site requests
      - 'none': Cookies sent with all requests (requires COOKIE_SECURE=True)
    
    Set via environment variable: COOKIE_SAMESITE=lax (or strict/none)
    """
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def cors_origins(self) -> list[str]:
        """
        Parse comma-separated BACKEND_CORS_ORIGINS into a list of strings.
        Strips whitespace from each origin and filters out empty strings.
        
        Returns:
            List of origin URLs (e.g., ['http://localhost:5173', 'http://localhost'])
        """
        return [
            origin.strip()
            for origin in self.BACKEND_CORS_ORIGINS.split(",")
            if origin.strip()
        ]


@lru_cache()
def get_settings() -> Settings:
    """
    Get or create a cached instance of Settings.
    
    Uses @lru_cache for efficiency - creates Settings once and reuses it.
    This is important for performance since loading from environment/file
    is expensive and should only happen once at startup.
    
    Returns:
        Cached Settings instance with all configuration loaded from environment
    """
    return Settings()
