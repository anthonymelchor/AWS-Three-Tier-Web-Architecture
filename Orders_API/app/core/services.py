# app/core/services.py
from .entities import Order
from app.adapters.error_handler import DatabaseError

class OrderService:
    def __init__(self, order_port):
        self.order_port = order_port

    def create_order(self, productDescription, quantity, totalPrice, orderDate):
            order = Order(productDescription, quantity, totalPrice, orderDate)
            self.order_port.save(order)
            return {'message': 'Order created successfully'}
    
    def get_all_orders(self):
            orders = self.order_port.get_all_orders()  # Delegate to the port method
            return orders

