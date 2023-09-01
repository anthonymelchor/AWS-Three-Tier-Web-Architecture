# app/core/entities.py
class Order:
    def __init__(self, productDescription, quantity, totalPrice, orderDate):
        self.productDescription = productDescription
        self.quantity = quantity
        self.totalPrice = totalPrice
        self.orderDate = orderDate


