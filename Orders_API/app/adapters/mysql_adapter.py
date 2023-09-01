# app/adapters/mysql_adapter.py
import mysql.connector
from app.ports.order_port import OrderPort

class MySqlOrderAdapter(OrderPort):
    def __init__(self, config):
        self.connection = mysql.connector.connect(**config)
        self.cursor = self.connection.cursor()

    def save(self, order):
        try:
            query = "INSERT INTO Orders (CustomerID, ProductID) VALUES (%s, %s)"
            values = (order.customer_id, order.product_id)
            self.cursor.execute(query, values)
            self.connection.commit()
        except mysql.connector.Error as err:
            return err.msg

    def close(self):
        self.cursor.close()
        self.connection.close()

