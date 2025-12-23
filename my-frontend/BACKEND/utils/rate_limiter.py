"""
Simple in-memory rate limiter for API endpoints
"""
from collections import defaultdict
from datetime import datetime, timedelta

class SimpleRateLimiter:
    """Simple rate limiter using in-memory storage"""
    
    def __init__(self):
        # Store: {key: [(timestamp, count), ...]}
        self.requests = defaultdict(list)
        self.cleanup_interval = timedelta(minutes=30)
        self.last_cleanup = datetime.utcnow()
    
    def _cleanup_old_entries(self):
        """Remove old entries to prevent memory leaks"""
        if datetime.utcnow() - self.last_cleanup < self.cleanup_interval:
            return
        
        current_time = datetime.utcnow()
        for key in list(self.requests.keys()):
            # Keep only entries from last hour
            self.requests[key] = [
                (ts, count) for ts, count in self.requests[key]
                if current_time - ts < timedelta(hours=1)
            ]
            if not self.requests[key]:
                del self.requests[key]
        
        self.last_cleanup = current_time
    
    def is_allowed(self, key, max_requests, window_seconds):
        """
        Check if request is allowed
        
        Args:
            key: Unique identifier (e.g., IP address + endpoint)
            max_requests: Maximum number of requests allowed
            window_seconds: Time window in seconds
            
        Returns:
            (allowed: bool, retry_after: int or None)
        """
        self._cleanup_old_entries()
        
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=window_seconds)
        
        # Get requests in current window
        recent_requests = [
            ts for ts, _ in self.requests[key]
            if ts > window_start
        ]
        
        if len(recent_requests) >= max_requests:
            # Calculate retry after
            oldest_in_window = min(recent_requests)
            retry_after = int((oldest_in_window + timedelta(seconds=window_seconds) - now).total_seconds()) + 1
            return False, retry_after
        
        # Record this request
        self.requests[key].append((now, 1))
        return True, None

# Global instance
_rate_limiter = SimpleRateLimiter()

def check_rate_limit(identifier, max_requests, window_seconds):
    """
    Check rate limit for an identifier
    
    Args:
        identifier: Unique identifier (e.g., IP address)
        max_requests: Maximum requests allowed
        window_seconds: Time window in seconds
        
    Returns:
        (allowed: bool, retry_after: int or None)
    """
    return _rate_limiter.is_allowed(identifier, max_requests, window_seconds)





