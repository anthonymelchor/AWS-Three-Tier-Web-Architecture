from app.ports.order_port import OrderPort
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.adapters.error_handler import DatabaseError
from app.adapters.order_entity import OrderEntity
from config import Configuration

class SqlAlchemyOrderAdapter(OrderPort):
    def __init__(self, configuration):
        self.db_uri = configuration.db_uri
        self.engine = create_engine(self.db_uri)
        self.Session = sessionmaker(bind=self.engine)  # Use sessionmaker class

    def save(self, order):
        try:
            session = self.Session()  # Create a new session using sessionmaker
            order_entity = OrderEntity(productDescription=order.productDescription, quantity=order.quantity, totalPrice=order.totalPrice, orderDate=order.orderDate)
            session.add(order_entity)
            session.commit()
            session.close()  # Close the new session
        except Exception as e:
            session.rollback()
            raise DatabaseError(str(e))
    
    def get_all_orders(self):
        try:
            session = self.Session()  
            orders = session.query(OrderEntity).all()
            session.close()  
            return orders
        except Exception as e:
            raise DatabaseError(str(e))

    def close(self):
        self.Session().close_all()  # Close all sessions
        self.engine.dispose()