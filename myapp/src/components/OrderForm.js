import React, { useState } from 'react';
import '../customStyles.css';
import { submitOrder } from './api';
import { Link } from 'react-router-dom';

function OrderForm() {

    const [productDescription, setProductDescription] = useState('');
    const [quantity, setQuantity] = useState('');
    const [totalPrice, setTotalPrice] = useState('');
    const [orderDate, setOrderDate] = useState('');
    const [isOrderSuccessful, setIsOrderSuccessful] = useState(false);
    const [isOrderError, setIsOrderError] = useState(false);
  
    const handleFormSubmit = async () => {
      
      setIsOrderSuccessful(false); // Reset success status
      setIsOrderError(false);
      const orderData = {
        productDescription,
        quantity,
        totalPrice,
        orderDate
      };
  
      try {
        const response = await submitOrder(orderData); 
        console.log('API response:', response);
        
        if (response.status === 200) {
            setProductDescription('');
            setQuantity('');
            setTotalPrice('');
            setOrderDate('');
            setIsOrderSuccessful(true);
            setIsOrderError(false);
        }else {
            setIsOrderError(true); 
        }
      } catch (error) {
        console.error('API error:', error);
        setIsOrderError(true);
        // Handle the error
      }
    };

  return (
    <section class="pb-4">
    <div class="bg-white border rounded-5">
      
      <section class="p-4 d-flex justify-content-center w-100">
        <section class="order-form m-4">
          <div class="container pt-4">
              <div class="row">
                  <div class="col-12 px-4">
                      <h1>Place your order</h1>
                      <span>Welcome to our order form. Fill out the details below to get started with your order.</span>
                      <hr class="mt-1"></hr>
                  </div>
      
                  <div class="col-12">
                   
                      <div class="row mt-3 mx-4">
                          <div class="col-12">
                              <label class="order-form-label">Product Description</label>
                          </div>
                          <div class="col-12">
                              <div class="form-outline">
                                  <input type="text" id="productDescription" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} class="form-control order-form-input placeholder-active"/>
                              <div class="form-notch"><div class="form-notch-leading" ></div><div class="form-notch-middle" ></div><div class="form-notch-trailing"></div></div></div>
                          </div>
                      </div>
      
                      <div class="row mt-3 mx-4">
                          <div class="col-12">
                              <label class="order-form-label">Quantity</label>
                          </div>
                          <div class="col-12">
                              <div class="form-outline">
                                  <input type="text" id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} class="form-control order-form-input placeholder-active"/>
                              <div class="form-notch"><div class="form-notch-leading" ></div><div class="form-notch-middle" ></div><div class="form-notch-trailing"></div></div></div>
                          </div>
                      </div>

                      <div class="row mt-3 mx-4">
                          <div class="col-12">
                              <label class="order-form-label">Total Price</label>
                          </div>
                          <div class="col-12">
                              <div class="form-outline">
                                  <input type="text" id="totalPrice" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} class="form-control order-form-input placeholder-active"/>
                              <div class="form-notch"><div class="form-notch-leading" ></div><div class="form-notch-middle" ></div><div class="form-notch-trailing"></div></div></div>
                          </div>
                      </div>

                      <div class="row mt-3 mx-4">
                          <div class="col-12">
                              <label class="order-form-label">Order Date</label>
                          </div>
                          <div class="col-12">
                              <div class="form-outline">
                                  <input type="text" id="orderDate" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} class="form-control order-form-input placeholder-active"/>
                              <div class="form-notch"><div class="form-notch-leading" ></div><div class="form-notch-middle" ></div><div class="form-notch-trailing"></div></div></div>
                          </div>
                      </div>
                      <div class="row mx-4">
                          <div class="col-12">
                            <label class="order-form-label smaller-font">All fields are required</label>
                          </div>
                      </div>
                        {isOrderSuccessful && (
                        <div class="row mt-3 mx-4">
                            <div class="col-12">    
                                <div className="alert alert-success" role="alert">
                                    Order created successfully!
                                </div>
                            </div>
                        </div>
                        )}
                        {isOrderError && (
                        <div class="row mt-3 mx-4">
                            <div class="col-12">    
                                <div className="alert alert-danger" role="alert">
                                An error occurred while creating the order. Please try again.
                                </div>
                            </div>
                        </div>
                        )}  
                      <div class="row mt-3">
                          <div class="col-12">
                              <button type="button" id="btnSubmit" class="btn btn-primary d-block mx-auto btn-submit" onClick={handleFormSubmit} 
                              disabled={!productDescription || !quantity || !totalPrice || !orderDate} >Submit</button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
        </section>
      </section>

      <div class="p-4 text-center border-top mobile-hidden">
            <Link to="/" class="btn btn-info">Show Orders</Link>
      </div>

    </div>
  </section>
  );
}

export default OrderForm;