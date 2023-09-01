# app/ports/order_port.py
from abc import ABC, abstractmethod

class OrderPort(ABC):
    @abstractmethod
    def save(self, order):
        pass

    @abstractmethod
    def get_all_orders(self):
        pass

    @abstractmethod
    def close(self):
        pass

