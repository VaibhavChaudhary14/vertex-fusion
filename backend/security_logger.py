import logging
import os
from datetime import datetime

# Config
LOG_DIR = "logs"
LOG_FILE = os.path.join(LOG_DIR, "security_audit.log")

# Ensure dir
os.makedirs(LOG_DIR, exist_ok=True)

# Setup Logger
logger = logging.getLogger("VertexSecurity")
logger.setLevel(logging.INFO)

# File Handler
fh = logging.FileHandler(LOG_FILE)
fh.setLevel(logging.INFO)

# Formatter: JSON-like for parsing or standard for reading
formatter = logging.Formatter('%(asctime)s | %(levelname)s | %(component)s | %(event)s | %(details)s')
fh.setFormatter(formatter)

logger.addHandler(fh)

class SecurityLogger:
    @staticmethod
    def log(component: str, event: str, details: str, level="INFO"):
        """
        Logs a security-relevant event.
        :param component: 'AI', 'SCADA', 'CORE', 'USER'
        :param event: 'ATTACK_DETECTED', 'BREAKER_TRIP', 'LOGIN', etc.
        :param details: 'Confidence 99%', 'Line 5 Open', etc.
        """
        extra = {'component': component, 'event': event, 'details': details}
        if level == "INFO":
            logger.info("", extra=extra)
        elif level == "WARNING":
            logger.warning("", extra=extra)
        elif level == "CRITICAL":
            logger.critical("", extra=extra)
            
    @staticmethod
    def get_recent_logs(n=20):
        """Reads the last n lines from the log file."""
        if not os.path.exists(LOG_FILE):
            return []
            
        with open(LOG_FILE, 'r') as f:
            lines = f.readlines()
            return [line.strip() for line in lines[-n:]]
