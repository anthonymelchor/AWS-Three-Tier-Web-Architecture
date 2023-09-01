# app/adapters/order_entity.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class OrderEntity(Base):
    __tablename__ = 'Orders'
    id = Column(Integer, primary_key=True)
    productDescription = Column(String)
    quantity = Column(String)
    totalPrice = Column(String)
    orderDate = Column(String)

