import '../customStyles.css';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function OrdersList() {

const [orderData, setOrderData] = useState([]);
const [isNoRecords, setIsNoRecords] = useState(false);
const [isFetchError, setIsFetchError] = useState(false);

useEffect(() => {
  fetch('/api/list_orders')
    .then(async response => {
      if (response.status === 200) {
        const responseData = await response.json();
        setOrderData(responseData);
        setIsNoRecords(responseData.length === 0); // Set isNoRecords based on data length
      } else {
        setIsFetchError(true); // No records if status is not 200
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      setIsFetchError(true);
    });
}, []);

return (
    
<section class="pb-4">
        <div class="bg-white border rounded-5">
        
        <section class="p-4 d-flex justify-content-center w-100">
            <section class="order-form m-4">
            <div class="container pt-4">
                <div class="row">
                    <div class="col-12 px-4">
                        <h2>Orders list</h2>
                        <hr class="mt-1"></hr>
                    </div>
        
                    <div class="col-12 px-4">
                      <table class="table align-middle mb-0 bg-white">
                          <thead class="bg-light">
                            <tr>
                              <th>Product Description</th>
                              <th>Quantity</th>
                              <th>Total Price</th>
                              <th>Order Date</th>
                            </tr>
                          </thead>
                          <tbody>
                              {orderData.map(order => (
                                <tr key={order.id}>
                                  <td>{order.productDescription}</td>
                                  <td>{order.quantity}</td>
                                  <td>{order.totalPrice}</td>
                                  <td>{order.orderDate}</td>
                                </tr>
                              ))}
                          </tbody>
                      </table>
                      {isNoRecords && (
                        <div class="row mt-3">
                            <div class="col-12">    
                                <div className="alert alert-info" role="alert">
                                  No registers were found
                                </div>
                            </div>
                        </div>
                        )}
                        {isFetchError && (
                        <div class="row mt-3">
                            <div class="col-12">    
                                <div className="alert alert-danger" role="alert">
                                An error occurred while creating the order. Please try again.
                                </div>
                            </div>
                        </div>
                        )}  
                    </div>
                  </div>
              </div>
            </section>
          </section>

        <div class="p-4 text-center border-top mobile-hidden">
            <Link to="/addOrder" class="btn btn-info">Add Order</Link>
        </div>

        </div>
    </section>
  );
}

export default OrdersList;