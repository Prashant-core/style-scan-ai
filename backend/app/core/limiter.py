from slowapi import Limiter
from slowapi.util import get_remote_address

# Every route allows 120 requests per minute per visitor by default.
# Sensitive routes (login, register) set stricter limits of their own.
limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])