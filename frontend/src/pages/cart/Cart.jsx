import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import "./cart.css";

const Cart = () => {
  const [myCart, setMyCart] = useState([]);
  const [togle, setTogle] = useState(false);

  const token = useSelector((state) => state.auth.token);
  const uId = useSelector((state) => state.auth.userId);

  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/cart`, { headers })
      .then((response) => {
        setMyCart(response.data.result);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [myCart]);
  ///////////////////////////////////////////////////////////////
  const addToCart = (id, quantity) => {

    if (isLoggedIn === false) {
      Navigate("/users/login");
      return 0;
    }
    axios
      .post(` http://localhost:5000/cart/${id}`, { quantity }, { headers })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  ///////////////////////////////////////////////
  const removeFromCart=(id)=>{
    axios
    .delete(` http://localhost:5000/cart/${id}`,{headers})
    .then((response)=>{
      console.log(response.data);
      setMyCart(myCart.filter(elem => elem.id !== id));


    })
    .catch((error)=>{
      console.log(error);

    })

  }

  const totalAmount = myCart?.reduce(
    (acc, elem) => acc + elem.price * elem.quantity,
    0
  );

  return (
    <div className="myCart">
      <table className="cartTable">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {myCart?.map((elem, index) => (
            <tr key={index}>
             <td>{elem.title}</td>
              <td>{elem.price}</td>
              <td><button onClick={()=>{removeFromCart(elem.product_id);setTogle(!togle)}}>remove</button>
                {" "}
                <input
                  onChange={(e) => {
                    {
                      if (e.target.value < 1 || !true) {
                        e.target.value = 1;
                      }
                    }
                    addToCart(elem.id, e.target.value);
                  }}
                  type="number"
                  defaultValue={elem.quantity}
                  min={1}
                />
              </td>

              <td>{elem.price * elem.quantity}.00</td>
            </tr>
          ))}
        </tbody>
      </table>
=      <table  className="cartTable">
    <tr>
        <th colspan="2">your order</th>
    </tr>
    <tr>
        <td>total</td>
        <td>{totalAmount}.00</td>
    </tr>
    <tr>
        <td colspan="2"><button>checkout</button></td>
    </tr>
</table>

    </div>
  );
};

export default Cart;
