# main.py
from flask import Flask, request, jsonify
from app.core.services import OrderService
from app.adapters.sqlalchemy_adapter import SqlAlchemyOrderAdapter
from app.adapters.error_handler import DatabaseError
from config import Configuration

app = Flask(__name__)

configuration = Configuration()
mysql_adapter = SqlAlchemyOrderAdapter(configuration)

order_service = OrderService(mysql_adapter)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'message': 'health check'})

@app.route('/create_order', methods=['POST'])
def create_order():
    try:
        data = request.get_json()
        productDescription = data['productDescription']
        quantity = data['quantity']
        totalPrice = data['totalPrice']
        orderDate = data['orderDate']

        order_service.create_order(productDescription, quantity, totalPrice, orderDate)

        return jsonify({'message': 'Order created successfully'})
    except DatabaseError as e:
        return jsonify({'error': "Database error"}), 500
    
@app.route('/list_orders', methods=['GET'])  # New endpoint for listing orders
def list_orders():
    try:
        orders = order_service.get_all_orders()  # Use the service to get orders
        order_list = []
        for order in orders:
            order_data = {
                'id': order.id,
                'productDescription': order.productDescription,
                'quantity': order.quantity,
                'totalPrice': order.totalPrice,
                'orderDate': order.orderDate
            }
            order_list.append(order_data)
        return jsonify(order_list)
    except DatabaseError as e:
        return jsonify({'error': "Database error"}), 500
    
if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)

