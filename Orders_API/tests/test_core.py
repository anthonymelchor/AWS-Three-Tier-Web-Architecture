import unittest
from unittest.mock import MagicMock
from app.core.services import OrderService
from app.ports.order_port import OrderPort
from app.adapters.sqlalchemy_adapter import SqlAlchemyOrderAdapter
from app.adapters.error_handler import DatabaseError

class TestMicroservice(unittest.TestCase):
    def setUp(self):
        self.mock_adapter = MagicMock(spec=SqlAlchemyOrderAdapter)
        self.order_service = OrderService(self.mock_adapter)
    
    def test_create_order_success(self):
            productDescription = 'spoon'
            quantity = '1'
            totalPrice = '4'
            orderDate = '24/08/2022'
            response = self.order_service.create_order(productDescription, quantity, totalPrice, orderDate)
            expected_response = {'message': 'Order created successfully'}
            self.assertEqual(response, expected_response)

    def test_create_order_failure(self):
        expected_error_message = "Database error"
        self.mock_adapter.save.side_effect = DatabaseError(expected_error_message)
        
        productDescription = 'spoon'
        quantity = '1'
        totalPrice = '4'
        orderDate = '24/08/2022'
        
        with self.assertRaises(DatabaseError) as context:
            self.order_service.create_order(productDescription, quantity, totalPrice, orderDate)
        
        # Get the actual exception that was raised
        raised_exception = context.exception
        self.assertEqual(str(raised_exception), expected_error_message)
        
        # Assert that the save method of the mock adapter was called with the mock order
        #self.mock_adapter.save.assert_called_once_with(mock_order)
        self.mock_adapter.save.assert_called_once()

if __name__ == "__main__":
    unittest.main()
