# config.py
class Configuration:
    def __init__(self):
        self.db_user = ""
        self.db_password = ""
        self.db_host = ""
        self.db_name = ""
        self.db_uri = f"mysql://{self.db_user}:{self.db_password}@{self.db_host}/{self.db_name}"

